import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Plus, Trash, X, FloppyDisk } from '@phosphor-icons/react'
import { toast } from 'sonner'
import { 
  type Recipe, 
  type RecipeIngredient, 
  type RecipeStep, 
  type SubRecipe, 
  type NutritionInfo,
  type AllergenType,
  type DietaryRestriction,
  type FoodItem 
} from '@/lib/types'
import { formatCurrency } from '@/lib/helpers'

interface RecipeDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  recipe?: Recipe
  recipes: Recipe[]
  setRecipes: (recipes: Recipe[]) => void
  foodItems: FoodItem[]
}

const allergenOptions: AllergenType[] = ['milk', 'eggs', 'fish', 'shellfish', 'tree-nuts', 'peanuts', 'wheat', 'soybeans', 'sesame']
const dietaryOptions: DietaryRestriction[] = ['vegetarian', 'vegan', 'gluten-free', 'dairy-free', 'nut-free', 'halal', 'kosher']

export function RecipeDialog({ open, onOpenChange, recipe, recipes, setRecipes, foodItems }: RecipeDialogProps) {
  const [formData, setFormData] = useState<Partial<Recipe>>({
    name: '',
    recipeCode: '',
    description: '',
    category: '',
    ingredients: [],
    subRecipes: [],
    instructions: [],
    preparationTime: 0,
    cookingTime: 0,
    totalTime: 0,
    yieldPortions: 1,
    portionSize: '',
    portionUnit: '',
    costPerPortion: 0,
    sellingPrice: 0,
    profitMargin: 0,
    allergens: [],
    dietaryInfo: [],
    skillLevel: 'medium',
    equipment: [],
    notes: '',
    version: 1,
    isActive: true
  })

  useEffect(() => {
    if (recipe) {
      setFormData(recipe)
    } else {
      const recipeNumber = (recipes.length + 1).toString().padStart(4, '0')
      setFormData(prev => ({
        ...prev,
        recipeCode: `RCP-${recipeNumber}`
      }))
    }
  }, [recipe, recipes.length])

  const calculateCosts = () => {
    const ingredientsCost = formData.ingredients?.reduce((sum, ing) => sum + ing.totalCost, 0) || 0
    const subRecipesCost = formData.subRecipes?.reduce((sum, sub) => sum + sub.costContribution, 0) || 0
    const totalCost = ingredientsCost + subRecipesCost
    const portions = formData.yieldPortions || 1
    const costPerPortion = totalCost / portions
    const sellingPrice = formData.sellingPrice || 0
    const profitMargin = sellingPrice > 0 ? ((sellingPrice - costPerPortion) / sellingPrice) * 100 : 0

    setFormData(prev => ({
      ...prev,
      costPerPortion,
      profitMargin
    }))
  }

  useEffect(() => {
    calculateCosts()
  }, [formData.ingredients, formData.subRecipes, formData.yieldPortions, formData.sellingPrice])

  useEffect(() => {
    const total = (formData.preparationTime || 0) + (formData.cookingTime || 0)
    setFormData(prev => ({ ...prev, totalTime: total }))
  }, [formData.preparationTime, formData.cookingTime])

  const addIngredient = () => {
    const newIngredient: RecipeIngredient = {
      id: crypto.randomUUID(),
      name: '',
      quantity: 0,
      unit: '',
      unitCost: 0,
      totalCost: 0,
      isOptional: false
    }
    setFormData(prev => ({
      ...prev,
      ingredients: [...(prev.ingredients || []), newIngredient]
    }))
  }

  const updateIngredient = (id: string, field: keyof RecipeIngredient, value: any) => {
    setFormData(prev => ({
      ...prev,
      ingredients: prev.ingredients?.map(ing => {
        if (ing.id === id) {
          const updated = { ...ing, [field]: value }
          if (field === 'foodItemId' && value) {
            const foodItem = foodItems.find(f => f.id === value)
            if (foodItem) {
              updated.name = foodItem.name
              updated.unit = foodItem.unit
              updated.unitCost = foodItem.unitCost
            }
          }
          if (field === 'quantity' || field === 'unitCost') {
            updated.totalCost = (updated.quantity || 0) * (updated.unitCost || 0)
          }
          return updated
        }
        return ing
      })
    }))
  }

  const removeIngredient = (id: string) => {
    setFormData(prev => ({
      ...prev,
      ingredients: prev.ingredients?.filter(ing => ing.id !== id)
    }))
  }

  const addStep = () => {
    const stepNumber = (formData.instructions?.length || 0) + 1
    const newStep: RecipeStep = {
      stepNumber,
      instruction: '',
      time: 0
    }
    setFormData(prev => ({
      ...prev,
      instructions: [...(prev.instructions || []), newStep]
    }))
  }

  const updateStep = (stepNumber: number, field: keyof RecipeStep, value: any) => {
    setFormData(prev => ({
      ...prev,
      instructions: prev.instructions?.map(step =>
        step.stepNumber === stepNumber ? { ...step, [field]: value } : step
      )
    }))
  }

  const removeStep = (stepNumber: number) => {
    setFormData(prev => ({
      ...prev,
      instructions: prev.instructions
        ?.filter(step => step.stepNumber !== stepNumber)
        .map((step, index) => ({ ...step, stepNumber: index + 1 }))
    }))
  }

  const toggleAllergen = (allergen: AllergenType) => {
    setFormData(prev => ({
      ...prev,
      allergens: prev.allergens?.includes(allergen)
        ? prev.allergens.filter(a => a !== allergen)
        : [...(prev.allergens || []), allergen]
    }))
  }

  const toggleDietary = (dietary: DietaryRestriction) => {
    setFormData(prev => ({
      ...prev,
      dietaryInfo: prev.dietaryInfo?.includes(dietary)
        ? prev.dietaryInfo.filter(d => d !== dietary)
        : [...(prev.dietaryInfo || []), dietary]
    }))
  }

  const handleSave = () => {
    if (!formData.name || !formData.recipeCode) {
      toast.error('Please fill in required fields')
      return
    }

    const now = Date.now()
    const recipeData: Recipe = {
      id: recipe?.id || crypto.randomUUID(),
      recipeCode: formData.recipeCode!,
      name: formData.name!,
      description: formData.description || '',
      category: formData.category || 'Main Course',
      ingredients: formData.ingredients || [],
      subRecipes: formData.subRecipes || [],
      instructions: formData.instructions || [],
      preparationTime: formData.preparationTime || 0,
      cookingTime: formData.cookingTime || 0,
      totalTime: formData.totalTime || 0,
      yieldPortions: formData.yieldPortions || 1,
      portionSize: formData.portionSize || '',
      portionUnit: formData.portionUnit || 'serving',
      costPerPortion: formData.costPerPortion || 0,
      sellingPrice: formData.sellingPrice,
      profitMargin: formData.profitMargin,
      allergens: formData.allergens || [],
      dietaryInfo: formData.dietaryInfo || [],
      nutritionInfo: formData.nutritionInfo,
      photos: formData.photos || [],
      skillLevel: formData.skillLevel || 'medium',
      equipment: formData.equipment || [],
      notes: formData.notes || '',
      version: recipe ? recipe.version + 1 : 1,
      versionHistory: formData.versionHistory || [],
      isActive: formData.isActive ?? true,
      createdBy: 'Current User',
      createdAt: recipe?.createdAt || now,
      updatedAt: now,
      lastUsed: recipe?.lastUsed
    }

    if (recipe) {
      setRecipes(recipes.map(r => r.id === recipe.id ? recipeData : r))
      toast.success('Recipe updated successfully')
    } else {
      setRecipes([...recipes, recipeData])
      toast.success('Recipe created successfully')
    }

    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle>{recipe ? 'Edit Recipe' : 'Create Recipe'}</DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="basic" className="flex-1">
          <TabsList className="grid grid-cols-5 w-full">
            <TabsTrigger value="basic">Basic Info</TabsTrigger>
            <TabsTrigger value="ingredients">Ingredients</TabsTrigger>
            <TabsTrigger value="instructions">Instructions</TabsTrigger>
            <TabsTrigger value="nutrition">Nutrition & Diet</TabsTrigger>
            <TabsTrigger value="costing">Costing</TabsTrigger>
          </TabsList>

          <ScrollArea className="h-[calc(90vh-200px)] pr-4">
            <TabsContent value="basic" className="space-y-4 mt-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="recipeCode">Recipe Code*</Label>
                  <Input
                    id="recipeCode"
                    value={formData.recipeCode}
                    onChange={(e) => setFormData({ ...formData, recipeCode: e.target.value })}
                    placeholder="RCP-0001"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="name">Recipe Name*</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Grilled Chicken Breast"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Describe the recipe..."
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="category">Category</Label>
                  <Select
                    value={formData.category}
                    onValueChange={(value) => setFormData({ ...formData, category: value })}
                  >
                    <SelectTrigger id="category">
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Appetizer">Appetizer</SelectItem>
                      <SelectItem value="Main Course">Main Course</SelectItem>
                      <SelectItem value="Dessert">Dessert</SelectItem>
                      <SelectItem value="Soup">Soup</SelectItem>
                      <SelectItem value="Salad">Salad</SelectItem>
                      <SelectItem value="Beverage">Beverage</SelectItem>
                      <SelectItem value="Sauce">Sauce</SelectItem>
                      <SelectItem value="Breakfast">Breakfast</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="skillLevel">Skill Level</Label>
                  <Select
                    value={formData.skillLevel}
                    onValueChange={(value: any) => setFormData({ ...formData, skillLevel: value })}
                  >
                    <SelectTrigger id="skillLevel">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="easy">Easy</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="hard">Hard</SelectItem>
                      <SelectItem value="expert">Expert</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="prepTime">Prep Time (min)</Label>
                  <Input
                    id="prepTime"
                    type="number"
                    value={formData.preparationTime}
                    onChange={(e) => setFormData({ ...formData, preparationTime: parseInt(e.target.value) || 0 })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="cookTime">Cook Time (min)</Label>
                  <Input
                    id="cookTime"
                    type="number"
                    value={formData.cookingTime}
                    onChange={(e) => setFormData({ ...formData, cookingTime: parseInt(e.target.value) || 0 })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="totalTime">Total Time (min)</Label>
                  <Input
                    id="totalTime"
                    type="number"
                    value={formData.totalTime}
                    disabled
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="yield">Yield (Portions)</Label>
                  <Input
                    id="yield"
                    type="number"
                    value={formData.yieldPortions}
                    onChange={(e) => setFormData({ ...formData, yieldPortions: parseInt(e.target.value) || 1 })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="portionSize">Portion Size</Label>
                  <Input
                    id="portionSize"
                    value={formData.portionSize}
                    onChange={(e) => setFormData({ ...formData, portionSize: e.target.value })}
                    placeholder="e.g., 200"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="portionUnit">Portion Unit</Label>
                  <Input
                    id="portionUnit"
                    value={formData.portionUnit}
                    onChange={(e) => setFormData({ ...formData, portionUnit: e.target.value })}
                    placeholder="e.g., grams, ml, piece"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
                <Label htmlFor="isActive">Recipe Active</Label>
                <Switch
                  id="isActive"
                  checked={formData.isActive}
                  onCheckedChange={(checked) => setFormData({ ...formData, isActive: checked })}
                />
              </div>
            </TabsContent>

            <TabsContent value="ingredients" className="space-y-4 mt-4">
              <div className="flex items-center justify-between">
                <h3 className="font-medium">Recipe Ingredients</h3>
                <Button onClick={addIngredient} size="sm">
                  <Plus size={16} className="mr-2" />
                  Add Ingredient
                </Button>
              </div>

              {formData.ingredients && formData.ingredients.length > 0 ? (
                <div className="space-y-3">
                  {formData.ingredients.map((ingredient) => (
                    <Card key={ingredient.id} className="p-4">
                      <div className="space-y-3">
                        <div className="grid grid-cols-12 gap-3">
                          <div className="col-span-4">
                            <Label className="text-xs">Food Item</Label>
                            <Select
                              value={ingredient.foodItemId}
                              onValueChange={(value) => updateIngredient(ingredient.id, 'foodItemId', value)}
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Select food item" />
                              </SelectTrigger>
                              <SelectContent>
                                {foodItems.map((food) => (
                                  <SelectItem key={food.id} value={food.id}>
                                    {food.name}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="col-span-2">
                            <Label className="text-xs">Quantity</Label>
                            <Input
                              type="number"
                              step="0.01"
                              value={ingredient.quantity}
                              onChange={(e) => updateIngredient(ingredient.id, 'quantity', parseFloat(e.target.value) || 0)}
                            />
                          </div>
                          <div className="col-span-2">
                            <Label className="text-xs">Unit</Label>
                            <Input
                              value={ingredient.unit}
                              onChange={(e) => updateIngredient(ingredient.id, 'unit', e.target.value)}
                              placeholder="kg, g, l"
                            />
                          </div>
                          <div className="col-span-2">
                            <Label className="text-xs">Unit Cost</Label>
                            <Input
                              type="number"
                              step="0.01"
                              value={ingredient.unitCost}
                              onChange={(e) => updateIngredient(ingredient.id, 'unitCost', parseFloat(e.target.value) || 0)}
                            />
                          </div>
                          <div className="col-span-1">
                            <Label className="text-xs">Total</Label>
                            <div className="text-sm font-medium pt-2">{formatCurrency(ingredient.totalCost)}</div>
                          </div>
                          <div className="col-span-1 flex items-end">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => removeIngredient(ingredient.id)}
                            >
                              <Trash size={16} className="text-destructive" />
                            </Button>
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          <div className="flex items-center gap-2">
                            <Switch
                              checked={ingredient.isOptional}
                              onCheckedChange={(checked) => updateIngredient(ingredient.id, 'isOptional', checked)}
                            />
                            <Label className="text-xs">Optional</Label>
                          </div>
                          <Input
                            placeholder="Preparation notes..."
                            value={ingredient.preparationNotes || ''}
                            onChange={(e) => updateIngredient(ingredient.id, 'preparationNotes', e.target.value)}
                            className="flex-1"
                          />
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              ) : (
                <Card className="p-8 text-center">
                  <p className="text-muted-foreground">No ingredients added yet</p>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="instructions" className="space-y-4 mt-4">
              <div className="flex items-center justify-between">
                <h3 className="font-medium">Cooking Steps</h3>
                <Button onClick={addStep} size="sm">
                  <Plus size={16} className="mr-2" />
                  Add Step
                </Button>
              </div>

              {formData.instructions && formData.instructions.length > 0 ? (
                <div className="space-y-3">
                  {formData.instructions.map((step) => (
                    <Card key={step.stepNumber} className="p-4">
                      <div className="flex items-start gap-3">
                        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-semibold">
                          {step.stepNumber}
                        </div>
                        <div className="flex-1 space-y-3">
                          <Textarea
                            value={step.instruction}
                            onChange={(e) => updateStep(step.stepNumber, 'instruction', e.target.value)}
                            placeholder="Describe the step..."
                            rows={3}
                          />
                          <div className="grid grid-cols-2 gap-3">
                            <div>
                              <Label className="text-xs">Time (minutes)</Label>
                              <Input
                                type="number"
                                value={step.time || ''}
                                onChange={(e) => updateStep(step.stepNumber, 'time', parseInt(e.target.value) || undefined)}
                                placeholder="Optional"
                              />
                            </div>
                            <div>
                              <Label className="text-xs">Temperature</Label>
                              <Input
                                value={step.temperature || ''}
                                onChange={(e) => updateStep(step.stepNumber, 'temperature', e.target.value)}
                                placeholder="e.g., 180°C"
                              />
                            </div>
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => removeStep(step.stepNumber)}
                        >
                          <Trash size={16} className="text-destructive" />
                        </Button>
                      </div>
                    </Card>
                  ))}
                </div>
              ) : (
                <Card className="p-8 text-center">
                  <p className="text-muted-foreground">No cooking steps added yet</p>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="nutrition" className="space-y-4 mt-4">
              <div className="space-y-4">
                <div>
                  <Label className="mb-3 block">Allergens</Label>
                  <div className="flex flex-wrap gap-2">
                    {allergenOptions.map((allergen) => (
                      <Badge
                        key={allergen}
                        variant={formData.allergens?.includes(allergen) ? 'default' : 'outline'}
                        className="cursor-pointer"
                        onClick={() => toggleAllergen(allergen)}
                      >
                        {allergen}
                      </Badge>
                    ))}
                  </div>
                </div>

                <Separator />

                <div>
                  <Label className="mb-3 block">Dietary Information</Label>
                  <div className="flex flex-wrap gap-2">
                    {dietaryOptions.map((dietary) => (
                      <Badge
                        key={dietary}
                        variant={formData.dietaryInfo?.includes(dietary) ? 'default' : 'outline'}
                        className="cursor-pointer"
                        onClick={() => toggleDietary(dietary)}
                      >
                        {dietary}
                      </Badge>
                    ))}
                  </div>
                </div>

                <Separator />

                <div>
                  <Label className="mb-3 block">Nutrition Information (Per Portion)</Label>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="calories">Calories</Label>
                      <Input
                        id="calories"
                        type="number"
                        value={formData.nutritionInfo?.calories || ''}
                        onChange={(e) => setFormData({
                          ...formData,
                          nutritionInfo: {
                            ...formData.nutritionInfo!,
                            servingSize: formData.nutritionInfo?.servingSize || '',
                            calories: parseInt(e.target.value) || 0,
                            protein: formData.nutritionInfo?.protein || 0,
                            carbohydrates: formData.nutritionInfo?.carbohydrates || 0,
                            fat: formData.nutritionInfo?.fat || 0
                          }
                        })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="protein">Protein (g)</Label>
                      <Input
                        id="protein"
                        type="number"
                        value={formData.nutritionInfo?.protein || ''}
                        onChange={(e) => setFormData({
                          ...formData,
                          nutritionInfo: {
                            ...formData.nutritionInfo!,
                            servingSize: formData.nutritionInfo?.servingSize || '',
                            calories: formData.nutritionInfo?.calories || 0,
                            protein: parseInt(e.target.value) || 0,
                            carbohydrates: formData.nutritionInfo?.carbohydrates || 0,
                            fat: formData.nutritionInfo?.fat || 0
                          }
                        })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="carbs">Carbohydrates (g)</Label>
                      <Input
                        id="carbs"
                        type="number"
                        value={formData.nutritionInfo?.carbohydrates || ''}
                        onChange={(e) => setFormData({
                          ...formData,
                          nutritionInfo: {
                            ...formData.nutritionInfo!,
                            servingSize: formData.nutritionInfo?.servingSize || '',
                            calories: formData.nutritionInfo?.calories || 0,
                            protein: formData.nutritionInfo?.protein || 0,
                            carbohydrates: parseInt(e.target.value) || 0,
                            fat: formData.nutritionInfo?.fat || 0
                          }
                        })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="fat">Fat (g)</Label>
                      <Input
                        id="fat"
                        type="number"
                        value={formData.nutritionInfo?.fat || ''}
                        onChange={(e) => setFormData({
                          ...formData,
                          nutritionInfo: {
                            ...formData.nutritionInfo!,
                            servingSize: formData.nutritionInfo?.servingSize || '',
                            calories: formData.nutritionInfo?.calories || 0,
                            protein: formData.nutritionInfo?.protein || 0,
                            carbohydrates: formData.nutritionInfo?.carbohydrates || 0,
                            fat: parseInt(e.target.value) || 0
                          }
                        })}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="costing" className="space-y-4 mt-4">
              <Card className="p-6 bg-muted/50">
                <div className="space-y-4">
                  <div className="flex items-center justify-between text-lg">
                    <span className="font-medium">Total Recipe Cost</span>
                    <span className="font-semibold">
                      {formatCurrency(
                        (formData.ingredients?.reduce((sum, ing) => sum + ing.totalCost, 0) || 0) +
                        (formData.subRecipes?.reduce((sum, sub) => sum + sub.costContribution, 0) || 0)
                      )}
                    </span>
                  </div>

                  <Separator />

                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Yield Portions</span>
                    <span className="font-medium">{formData.yieldPortions}</span>
                  </div>

                  <div className="flex items-center justify-between text-lg">
                    <span className="font-medium">Cost Per Portion</span>
                    <span className="font-semibold text-primary">
                      {formatCurrency(formData.costPerPortion || 0)}
                    </span>
                  </div>

                  <Separator />

                  <div className="space-y-2">
                    <Label htmlFor="sellingPrice">Selling Price (Per Portion)</Label>
                    <Input
                      id="sellingPrice"
                      type="number"
                      step="0.01"
                      value={formData.sellingPrice || ''}
                      onChange={(e) => setFormData({ ...formData, sellingPrice: parseFloat(e.target.value) || 0 })}
                      placeholder="0.00"
                    />
                  </div>

                  {formData.sellingPrice && formData.sellingPrice > 0 && (
                    <>
                      <div className="flex items-center justify-between">
                        <span className="text-muted-foreground">Gross Profit</span>
                        <span className="font-medium text-success">
                          {formatCurrency((formData.sellingPrice || 0) - (formData.costPerPortion || 0))}
                        </span>
                      </div>

                      <div className="flex items-center justify-between text-lg">
                        <span className="font-medium">Profit Margin</span>
                        <span className={`font-semibold ${
                          (formData.profitMargin || 0) >= 60 ? 'text-success' :
                          (formData.profitMargin || 0) >= 40 ? 'text-primary' :
                          (formData.profitMargin || 0) >= 20 ? 'text-accent' :
                          'text-destructive'
                        }`}>
                          {formData.profitMargin?.toFixed(1)}%
                        </span>
                      </div>
                    </>
                  )}
                </div>
              </Card>

              <div className="space-y-3">
                <h4 className="font-medium">Ingredient Cost Breakdown</h4>
                {formData.ingredients && formData.ingredients.length > 0 ? (
                  formData.ingredients.map((ingredient) => (
                    <div key={ingredient.id} className="flex items-center justify-between text-sm p-2 bg-muted rounded">
                      <span>{ingredient.name || 'Unnamed'}</span>
                      <span className="font-medium">{formatCurrency(ingredient.totalCost)}</span>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-muted-foreground text-center py-4">No ingredients added</p>
                )}
              </div>
            </TabsContent>
          </ScrollArea>
        </Tabs>

        <div className="flex justify-end gap-3 pt-4 border-t">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave}>
            <FloppyDisk size={20} className="mr-2" />
            Save Recipe
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
