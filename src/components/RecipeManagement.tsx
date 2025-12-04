import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  MagnifyingGlass, 
  Plus, 
  ChefHat, 
  Timer, 
  CurrencyDollar, 
  Receipt,
  Barcode,
  ChartLine,
  Warning,
  ForkKnife,
  BookOpen
} from '@phosphor-icons/react'
import { type Recipe, type Menu, type FoodItem, type Supplier } from '@/lib/types'
import { formatCurrency } from '@/lib/helpers'
import { RecipeDialog } from './RecipeDialog'
import { MenuDialog } from './MenuDialog'

interface RecipeManagementProps {
  recipes: Recipe[]
  setRecipes: (recipes: Recipe[] | ((prev: Recipe[]) => Recipe[])) => void
  menus: Menu[]
  setMenus: (menus: Menu[] | ((prev: Menu[]) => Menu[])) => void
  foodItems: FoodItem[]
  suppliers: Supplier[]
}

export function RecipeManagement({
  recipes,
  setRecipes,
  menus,
  setMenus,
  foodItems,
  suppliers
}: RecipeManagementProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | undefined>()
  const [selectedMenu, setSelectedMenu] = useState<Menu | undefined>()
  const [isRecipeDialogOpen, setIsRecipeDialogOpen] = useState(false)
  const [isMenuDialogOpen, setIsMenuDialogOpen] = useState(false)

  const filteredRecipes = recipes.filter(recipe =>
    recipe.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    recipe.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
    recipe.recipeCode.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const filteredMenus = menus.filter(menu =>
    menu.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    menu.type.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const handleCreateRecipe = () => {
    setSelectedRecipe(undefined)
    setIsRecipeDialogOpen(true)
  }

  const handleEditRecipe = (recipe: Recipe) => {
    setSelectedRecipe(recipe)
    setIsRecipeDialogOpen(true)
  }

  const handleCreateMenu = () => {
    setSelectedMenu(undefined)
    setIsMenuDialogOpen(true)
  }

  const handleEditMenu = (menu: Menu) => {
    setSelectedMenu(menu)
    setIsMenuDialogOpen(true)
  }

  const getRecipeProfitColor = (margin: number = 0) => {
    if (margin >= 60) return 'text-success'
    if (margin >= 40) return 'text-primary'
    if (margin >= 20) return 'text-accent'
    return 'text-destructive'
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-semibold">Recipe & Menu Management</h1>
          <p className="text-muted-foreground mt-1">Create and manage recipes, menus, and track costs</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="p-6 border-l-4 border-l-primary">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-muted-foreground">Total Recipes</h3>
            <ChefHat size={20} className="text-primary" />
          </div>
          <div className="space-y-2">
            <p className="text-3xl font-semibold">{recipes.length}</p>
            <p className="text-sm text-muted-foreground">
              {recipes.filter(r => r.isActive).length} active
            </p>
          </div>
        </Card>

        <Card className="p-6 border-l-4 border-l-accent">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-muted-foreground">Active Menus</h3>
            <BookOpen size={20} className="text-accent" />
          </div>
          <div className="space-y-2">
            <p className="text-3xl font-semibold">{menus.filter(m => m.isActive).length}</p>
            <p className="text-sm text-muted-foreground">
              {menus.length} total menus
            </p>
          </div>
        </Card>

        <Card className="p-6 border-l-4 border-l-success">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-muted-foreground">Avg Cost/Portion</h3>
            <CurrencyDollar size={20} className="text-success" />
          </div>
          <div className="space-y-2">
            <p className="text-3xl font-semibold">
              {formatCurrency(
                recipes.length > 0
                  ? recipes.reduce((sum, r) => sum + r.costPerPortion, 0) / recipes.length
                  : 0
              )}
            </p>
            <p className="text-sm text-muted-foreground">Per portion</p>
          </div>
        </Card>

        <Card className="p-6 border-l-4 border-l-accent">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-muted-foreground">Avg Profit Margin</h3>
            <ChartLine size={20} className="text-accent" />
          </div>
          <div className="space-y-2">
            <p className="text-3xl font-semibold">
              {recipes.length > 0 && recipes.filter(r => r.profitMargin).length > 0
                ? Math.round(
                    recipes
                      .filter(r => r.profitMargin)
                      .reduce((sum, r) => sum + (r.profitMargin || 0), 0) /
                      recipes.filter(r => r.profitMargin).length
                  )
                : 0}
              %
            </p>
            <p className="text-sm text-muted-foreground">Across all recipes</p>
          </div>
        </Card>
      </div>

      <Tabs defaultValue="recipes" className="space-y-6">
        <TabsList>
          <TabsTrigger value="recipes">Recipes</TabsTrigger>
          <TabsTrigger value="menus">Menus</TabsTrigger>
        </TabsList>

        <TabsContent value="recipes" className="space-y-4">
          <div className="flex items-center gap-4">
            <div className="relative flex-1">
              <MagnifyingGlass className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={20} />
              <Input
                placeholder="Search recipes by name, code, or category..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button onClick={handleCreateRecipe}>
              <Plus size={20} className="mr-2" />
              Create Recipe
            </Button>
          </div>

          {filteredRecipes.length === 0 ? (
            <Card className="p-16 text-center">
              <ChefHat size={64} className="mx-auto text-muted-foreground mb-4" />
              <h3 className="text-xl font-semibold mb-2">No Recipes Found</h3>
              <p className="text-muted-foreground mb-6">
                {searchTerm
                  ? 'No recipes match your search. Try different keywords.'
                  : 'Create your first recipe to start managing your kitchen inventory.'}
              </p>
              {!searchTerm && (
                <Button onClick={handleCreateRecipe}>
                  <Plus size={20} className="mr-2" />
                  Create Recipe
                </Button>
              )}
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredRecipes.map((recipe) => (
                <Card
                  key={recipe.id}
                  className="p-6 cursor-pointer hover:shadow-lg transition-shadow"
                  onClick={() => handleEditRecipe(recipe)}
                >
                  <div className="space-y-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="font-semibold text-lg mb-1">{recipe.name}</h3>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Barcode size={16} />
                          {recipe.recipeCode}
                        </div>
                      </div>
                      {!recipe.isActive && (
                        <Badge variant="secondary">Inactive</Badge>
                      )}
                    </div>

                    {recipe.description && (
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {recipe.description}
                      </p>
                    )}

                    <div className="flex items-center gap-4 text-sm">
                      <div className="flex items-center gap-1">
                        <Timer size={16} className="text-muted-foreground" />
                        <span>{recipe.totalTime} min</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <ForkKnife size={16} className="text-muted-foreground" />
                        <span>{recipe.yieldPortions} portions</span>
                      </div>
                    </div>

                    <div className="pt-3 border-t space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Cost/Portion</span>
                        <span className="font-medium">{formatCurrency(recipe.costPerPortion)}</span>
                      </div>
                      {recipe.sellingPrice && (
                        <>
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-muted-foreground">Selling Price</span>
                            <span className="font-medium">{formatCurrency(recipe.sellingPrice)}</span>
                          </div>
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-muted-foreground">Profit Margin</span>
                            <span className={`font-medium ${getRecipeProfitColor(recipe.profitMargin)}`}>
                              {recipe.profitMargin?.toFixed(1)}%
                            </span>
                          </div>
                        </>
                      )}
                    </div>

                    {recipe.allergens.length > 0 && (
                      <div className="flex items-start gap-2">
                        <Warning size={16} className="text-destructive mt-0.5" />
                        <div className="flex-1">
                          <p className="text-xs text-muted-foreground mb-1">Allergens:</p>
                          <div className="flex flex-wrap gap-1">
                            {recipe.allergens.slice(0, 3).map((allergen) => (
                              <Badge key={allergen} variant="destructive" className="text-xs">
                                {allergen}
                              </Badge>
                            ))}
                            {recipe.allergens.length > 3 && (
                              <Badge variant="destructive" className="text-xs">
                                +{recipe.allergens.length - 3}
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>
                    )}

                    {recipe.dietaryInfo.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {recipe.dietaryInfo.map((diet) => (
                          <Badge key={diet} variant="secondary" className="text-xs">
                            {diet}
                          </Badge>
                        ))}
                      </div>
                    )}

                    <div className="flex items-center justify-between pt-2 text-xs text-muted-foreground">
                      <span>Version {recipe.version}</span>
                      <Badge variant="outline" className="text-xs capitalize">
                        {recipe.category}
                      </Badge>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="menus" className="space-y-4">
          <div className="flex items-center gap-4">
            <div className="relative flex-1">
              <MagnifyingGlass className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={20} />
              <Input
                placeholder="Search menus by name or type..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button onClick={handleCreateMenu}>
              <Plus size={20} className="mr-2" />
              Create Menu
            </Button>
          </div>

          {filteredMenus.length === 0 ? (
            <Card className="p-16 text-center">
              <BookOpen size={64} className="mx-auto text-muted-foreground mb-4" />
              <h3 className="text-xl font-semibold mb-2">No Menus Found</h3>
              <p className="text-muted-foreground mb-6">
                {searchTerm
                  ? 'No menus match your search. Try different keywords.'
                  : 'Create your first menu to organize your recipes.'}
              </p>
              {!searchTerm && (
                <Button onClick={handleCreateMenu}>
                  <Plus size={20} className="mr-2" />
                  Create Menu
                </Button>
              )}
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredMenus.map((menu) => (
                <Card
                  key={menu.id}
                  className="p-6 cursor-pointer hover:shadow-lg transition-shadow"
                  onClick={() => handleEditMenu(menu)}
                >
                  <div className="space-y-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="font-semibold text-lg mb-1">{menu.name}</h3>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Receipt size={16} />
                          {menu.menuCode}
                        </div>
                      </div>
                      <div className="flex flex-col items-end gap-2">
                        <Badge variant={menu.isActive ? 'default' : 'secondary'}>
                          {menu.isActive ? 'Active' : 'Inactive'}
                        </Badge>
                        <Badge variant="outline" className="capitalize">
                          {menu.type.replace('-', ' ')}
                        </Badge>
                      </div>
                    </div>

                    {menu.description && (
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {menu.description}
                      </p>
                    )}

                    <div className="pt-3 border-t">
                      <div className="flex items-center justify-between text-sm mb-2">
                        <span className="text-muted-foreground">Total Items</span>
                        <span className="font-medium">{menu.items.length}</span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Available Items</span>
                        <span className="font-medium text-success">
                          {menu.items.filter(i => i.isAvailable).length}
                        </span>
                      </div>
                    </div>

                    {menu.pricing && (
                      <div className="pt-3 border-t space-y-2">
                        {menu.pricing.adultPrice && (
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-muted-foreground">Adult Price</span>
                            <span className="font-medium">{formatCurrency(menu.pricing.adultPrice)}</span>
                          </div>
                        )}
                        {menu.pricing.childPrice && (
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-muted-foreground">Child Price</span>
                            <span className="font-medium">{formatCurrency(menu.pricing.childPrice)}</span>
                          </div>
                        )}
                      </div>
                    )}

                    {(menu.startDate || menu.endDate) && (
                      <div className="pt-3 border-t text-xs text-muted-foreground">
                        {menu.startDate && menu.endDate ? (
                          <span>
                            {new Date(menu.startDate).toLocaleDateString()} - {new Date(menu.endDate).toLocaleDateString()}
                          </span>
                        ) : menu.startDate ? (
                          <span>From {new Date(menu.startDate).toLocaleDateString()}</span>
                        ) : (
                          <span>Until {new Date(menu.endDate!).toLocaleDateString()}</span>
                        )}
                      </div>
                    )}
                  </div>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      <RecipeDialog
        open={isRecipeDialogOpen}
        onOpenChange={setIsRecipeDialogOpen}
        recipe={selectedRecipe}
        recipes={recipes}
        setRecipes={setRecipes}
        foodItems={foodItems}
      />

      <MenuDialog
        open={isMenuDialogOpen}
        onOpenChange={setIsMenuDialogOpen}
        menu={selectedMenu}
        menus={menus}
        setMenus={setMenus}
        recipes={recipes}
      />
    </div>
  )
}
