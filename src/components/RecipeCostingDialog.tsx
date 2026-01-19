import { useState, useMemo } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ScrollArea } from '@/components/ui/scroll-area'
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table'
import { 
  ChartBar, 
  TrendUp, 
  TrendDown, 
  CurrencyDollar, 
  CheckCircle,
  Warning,
  XCircle,
  Star,
  Horse,
  Question,
  Dog
} from '@phosphor-icons/react'
import type { Recipe, FoodItem, MenuItem } from '@/lib/types'
import { formatCurrency } from '@/lib/helpers'
import { 
  calculateRecipeCost, 
  calculateMenuItemProfitability,
  performMenuEngineering,
  getHighCostItems,
  type RecipeCost,
  type MenuItemProfitability
} from '@/lib/recipeCostingHelpers'

interface RecipeCostingDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  recipes: Recipe[]
  foodItems: FoodItem[]
  menuItems: MenuItem[]
  salesData?: Record<string, number> // Optional: menuItemId -> quantity sold
}

export function RecipeCostingDialog({
  open,
  onOpenChange,
  recipes,
  foodItems,
  menuItems,
  salesData = {}
}: RecipeCostingDialogProps) {
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null)

  // Create a memoized recipe lookup map for performance
  const recipeMap = useMemo(() => 
    new Map(recipes.map(r => [r.id, r])),
    [recipes]
  )

  // Calculate costs for all recipes
  const recipeCosts = useMemo(() => 
    recipes.map(recipe => calculateRecipeCost(recipe, foodItems)),
    [recipes, foodItems]
  )

  // Calculate profitability for all menu items
  const profitabilityData = useMemo(() => 
    menuItems
      .map(menuItem => {
        const recipe = recipeMap.get(menuItem.recipeId)
        if (!recipe) return null
        return calculateMenuItemProfitability(menuItem, recipe, foodItems)
      })
      .filter((item): item is MenuItemProfitability => item !== null),
    [menuItems, recipeMap, foodItems]
  )

  // Menu engineering analysis
  const menuEngineering = useMemo(() => 
    performMenuEngineering(menuItems, recipes, foodItems, salesData),
    [menuItems, recipes, foodItems, salesData]
  )

  // High cost items
  const highCostItems = useMemo(() => 
    getHighCostItems(menuItems, recipes, foodItems, 35),
    [menuItems, recipes, foodItems]
  )

  const selectedRecipeCost = selectedRecipe 
    ? recipeCosts.find(rc => rc.recipeId === selectedRecipe.id)
    : null

  const getProfitabilityBadge = (status: string) => {
    switch (status) {
      case 'excellent':
        return <Badge className="bg-green-500"><CheckCircle className="mr-1 h-3 w-3" />Excellent</Badge>
      case 'good':
        return <Badge className="bg-blue-500"><CheckCircle className="mr-1 h-3 w-3" />Good</Badge>
      case 'fair':
        return <Badge className="bg-yellow-500"><Warning className="mr-1 h-3 w-3" />Fair</Badge>
      case 'poor':
        return <Badge className="bg-red-500"><XCircle className="mr-1 h-3 w-3" />Poor</Badge>
      default:
        return <Badge variant="outline">Unknown</Badge>
    }
  }

  const getClassificationIcon = (classification: string) => {
    switch (classification) {
      case 'star':
        return <Star className="h-5 w-5 text-yellow-500" weight="fill" />
      case 'plow-horse':
        return <Horse className="h-5 w-5 text-blue-500" />
      case 'puzzle':
        return <Question className="h-5 w-5 text-purple-500" weight="fill" />
      case 'dog':
        return <Dog className="h-5 w-5 text-gray-500" />
      default:
        return null
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-6xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ChartBar className="h-6 w-6" />
            Recipe Costing & Menu Profitability Analysis
          </DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="profitability" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="profitability">Profitability</TabsTrigger>
            <TabsTrigger value="recipes">Recipe Costs</TabsTrigger>
            <TabsTrigger value="engineering">Menu Engineering</TabsTrigger>
            <TabsTrigger value="alerts">High Cost Alerts</TabsTrigger>
          </TabsList>

          {/* Profitability Tab */}
          <TabsContent value="profitability" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Average Food Cost %</p>
                    <p className="text-2xl font-bold">
                      {profitabilityData.length > 0
                        ? (profitabilityData.reduce((sum, p) => sum + p.costPercentage, 0) / profitabilityData.length).toFixed(1)
                        : '0'}%
                    </p>
                  </div>
                  <CurrencyDollar className="h-10 w-10 text-primary" />
                </div>
              </Card>

              <Card className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Average Profit Margin</p>
                    <p className="text-2xl font-bold">
                      {profitabilityData.length > 0
                        ? (profitabilityData.reduce((sum, p) => sum + p.profitMargin, 0) / profitabilityData.length).toFixed(1)
                        : '0'}%
                    </p>
                  </div>
                  <TrendUp className="h-10 w-10 text-success" />
                </div>
              </Card>

              <Card className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Items Analyzed</p>
                    <p className="text-2xl font-bold">{profitabilityData.length}</p>
                  </div>
                  <ChartBar className="h-10 w-10 text-accent" />
                </div>
              </Card>
            </div>

            <ScrollArea className="h-[500px]">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Menu Item</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead className="text-right">Selling Price</TableHead>
                    <TableHead className="text-right">Cost</TableHead>
                    <TableHead className="text-right">Gross Profit</TableHead>
                    <TableHead className="text-right">Food Cost %</TableHead>
                    <TableHead className="text-right">Margin %</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {profitabilityData.map((item) => (
                    <TableRow key={item.menuItemId}>
                      <TableCell className="font-medium">{item.menuItemName}</TableCell>
                      <TableCell><Badge variant="outline">{item.category}</Badge></TableCell>
                      <TableCell className="text-right">{formatCurrency(item.sellingPrice)}</TableCell>
                      <TableCell className="text-right">{formatCurrency(item.recipeCost)}</TableCell>
                      <TableCell className="text-right font-semibold text-success">
                        {formatCurrency(item.grossProfit)}
                      </TableCell>
                      <TableCell className="text-right">
                        <span className={item.costPercentage > 35 ? 'text-destructive font-bold' : ''}>
                          {item.costPercentage.toFixed(1)}%
                        </span>
                      </TableCell>
                      <TableCell className="text-right">{item.profitMargin.toFixed(1)}%</TableCell>
                      <TableCell>{getProfitabilityBadge(item.profitabilityStatus)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </ScrollArea>
          </TabsContent>

          {/* Recipe Costs Tab */}
          <TabsContent value="recipes" className="space-y-4">
            <ScrollArea className="h-[600px]">
              <div className="space-y-2">
                {recipeCosts.map((recipeCost) => {
                  const recipe = recipes.find(r => r.id === recipeCost.recipeId)
                  if (!recipe) return null

                  return (
                    <Card 
                      key={recipeCost.recipeId} 
                      className="p-4 cursor-pointer hover:shadow-md transition-shadow"
                      onClick={() => setSelectedRecipe(recipe)}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <h4 className="font-semibold">{recipeCost.recipeName}</h4>
                          <p className="text-sm text-muted-foreground">
                            {recipeCost.servings} servings • {recipeCost.ingredientCosts.length} ingredients
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm text-muted-foreground">Total Cost</p>
                          <p className="text-xl font-bold">{formatCurrency(recipeCost.totalCost)}</p>
                          <p className="text-xs text-muted-foreground">
                            {formatCurrency(recipeCost.costPerServing)}/serving
                          </p>
                        </div>
                      </div>

                      {selectedRecipe?.id === recipeCost.recipeId && (
                        <div className="mt-4 pt-4 border-t space-y-2">
                          <p className="font-semibold text-sm">Ingredient Breakdown:</p>
                          {recipeCost.ingredientCosts.map((ingredient) => (
                            <div 
                              key={ingredient.ingredientId}
                              className="flex items-center justify-between text-sm bg-muted/50 rounded p-2"
                            >
                              <span>{ingredient.ingredientName}</span>
                              <div className="text-right">
                                <p className="font-medium">{formatCurrency(ingredient.totalCost)}</p>
                                <p className="text-xs text-muted-foreground">
                                  {ingredient.quantity} {ingredient.unit} × {formatCurrency(ingredient.unitCost)}
                                </p>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </Card>
                  )
                })}
              </div>
            </ScrollArea>
          </TabsContent>

          {/* Menu Engineering Tab */}
          <TabsContent value="engineering" className="space-y-4">
            <div className="bg-muted/30 rounded-lg p-4">
              <h3 className="font-semibold mb-2">Menu Engineering Matrix</h3>
              <p className="text-sm text-muted-foreground">
                Items are classified based on popularity and profitability
              </p>
            </div>

            <ScrollArea className="h-[500px]">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Item</TableHead>
                    <TableHead>Classification</TableHead>
                    <TableHead className="text-right">Menu Mix %</TableHead>
                    <TableHead className="text-right">Contribution</TableHead>
                    <TableHead>Recommended Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {menuEngineering.map((item, idx) => (
                    <TableRow key={idx}>
                      <TableCell className="font-medium">{item.itemName}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {getClassificationIcon(item.classification)}
                          <Badge 
                            variant={
                              item.classification === 'star' ? 'default' :
                              item.classification === 'plow-horse' ? 'secondary' :
                              item.classification === 'puzzle' ? 'outline' :
                              'destructive'
                            }
                          >
                            {item.classification.charAt(0).toUpperCase() + item.classification.slice(1)}
                          </Badge>
                        </div>
                      </TableCell>
                      <TableCell className="text-right">{item.menuMix.toFixed(1)}%</TableCell>
                      <TableCell className="text-right font-semibold">
                        {formatCurrency(item.contributionMargin)}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground max-w-md">
                        {item.recommendedAction}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </ScrollArea>
          </TabsContent>

          {/* High Cost Alerts Tab */}
          <TabsContent value="alerts" className="space-y-4">
            {highCostItems.length === 0 ? (
              <Card className="p-8 text-center">
                <CheckCircle className="h-16 w-16 mx-auto text-success mb-4" />
                <h3 className="text-lg font-semibold mb-2">All Items Within Target</h3>
                <p className="text-muted-foreground">
                  No menu items have food cost percentages above 35%
                </p>
              </Card>
            ) : (
              <>
                <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4">
                  <div className="flex items-center gap-2">
                    <Warning className="h-5 w-5 text-destructive" />
                    <h3 className="font-semibold text-destructive">
                      {highCostItems.length} {highCostItems.length === 1 ? 'Item' : 'Items'} Need Attention
                    </h3>
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">
                    These items have food cost percentages above 35%
                  </p>
                </div>

                <ScrollArea className="h-[500px]">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Item</TableHead>
                        <TableHead className="text-right">Current Price</TableHead>
                        <TableHead className="text-right">Cost</TableHead>
                        <TableHead className="text-right">Food Cost %</TableHead>
                        <TableHead className="text-right">Recommended Price</TableHead>
                        <TableHead className="text-right">Price Increase</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {highCostItems.map((item) => {
                        const priceIncrease = item.recommendedPrice && item.sellingPrice 
                          ? item.recommendedPrice - item.sellingPrice 
                          : 0
                        const increasePercent = item.sellingPrice > 0
                          ? (priceIncrease / item.sellingPrice) * 100
                          : 0

                        return (
                          <TableRow key={item.menuItemId}>
                            <TableCell className="font-medium">{item.menuItemName}</TableCell>
                            <TableCell className="text-right">{formatCurrency(item.sellingPrice)}</TableCell>
                            <TableCell className="text-right">{formatCurrency(item.recipeCost)}</TableCell>
                            <TableCell className="text-right">
                              <span className="font-bold text-destructive">
                                {item.costPercentage.toFixed(1)}%
                              </span>
                            </TableCell>
                            <TableCell className="text-right font-semibold text-success">
                              {item.recommendedPrice ? formatCurrency(item.recommendedPrice) : 'N/A'}
                            </TableCell>
                            <TableCell className="text-right">
                              {priceIncrease > 0 && (
                                <div className="flex items-center justify-end gap-1">
                                  <TrendUp className="h-4 w-4 text-accent" />
                                  <span className="text-accent font-medium">
                                    +{formatCurrency(priceIncrease)} ({increasePercent.toFixed(0)}%)
                                  </span>
                                </div>
                              )}
                            </TableCell>
                          </TableRow>
                        )
                      })}
                    </TableBody>
                  </Table>
                </ScrollArea>
              </>
            )}
          </TabsContent>
        </Tabs>

        <div className="flex justify-end">
          <Button onClick={() => onOpenChange(false)}>Close</Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
