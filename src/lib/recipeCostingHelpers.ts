import type { Recipe, FoodItem, MenuItem, RecipeIngredient } from './types'

export interface RecipeCost {
  recipeId: string
  recipeName: string
  totalCost: number
  costPerServing: number
  servings: number
  ingredientCosts: Array<{
    ingredientId: string
    ingredientName: string
    quantity: number
    unit: string
    unitCost: number
    totalCost: number
  }>
  lastCalculated: number
}

export interface MenuItemProfitability {
  menuItemId: string
  menuItemName: string
  sellingPrice: number
  recipeCost: number
  grossProfit: number
  profitMargin: number // Percentage
  costPercentage: number // Food cost percentage
  category: string
  recommendedPrice?: number
  profitabilityStatus: 'excellent' | 'good' | 'fair' | 'poor'
}

export interface MenuEngineering {
  itemName: string
  popularity: 'high' | 'low'
  profitability: 'high' | 'low'
  classification: 'star' | 'plow-horse' | 'puzzle' | 'dog'
  recommendedAction: string
  menuMix: number // Percentage of total items sold
  contributionMargin: number
}

/**
 * Calculate the total cost of a recipe based on ingredient quantities and current prices
 * 
 * @param recipe - The recipe to cost
 * @param foodItems - All food items with current costs
 * @returns Detailed recipe cost breakdown
 */
export function calculateRecipeCost(
  recipe: Recipe,
  foodItems: FoodItem[]
): RecipeCost {
  const ingredientCosts = recipe.ingredients.map(ingredient => {
    const foodItem = foodItems.find(f => f.id === ingredient.foodItemId)
    
    if (!foodItem) {
      return {
        ingredientId: ingredient.foodItemId || ingredient.id,
        ingredientName: 'Unknown Item',
        quantity: ingredient.quantity,
        unit: ingredient.unit,
        unitCost: 0,
        totalCost: 0
      }
    }

    // TODO: Implement unit conversion between recipe units and food item units
    // For now, this assumes units match. In production, you would need:
    // - A unit conversion table (e.g., kg to g, L to mL)
    // - Logic to convert recipe.unit to foodItem.unit before calculation
    // Example: if recipe uses "kg" and foodItem is in "g", multiply by 1000
    const totalCost = ingredient.quantity * foodItem.unitCost

    return {
      ingredientId: ingredient.foodItemId || ingredient.id,
      ingredientName: foodItem.name,
      quantity: ingredient.quantity,
      unit: ingredient.unit,
      unitCost: foodItem.unitCost,
      totalCost
    }
  })

  const totalCost = ingredientCosts.reduce((sum, ic) => sum + ic.totalCost, 0)
  const servings = recipe.yieldPortions || 1
  const costPerServing = servings > 0 ? totalCost / servings : totalCost

  return {
    recipeId: recipe.id,
    recipeName: recipe.name,
    totalCost,
    costPerServing,
    servings,
    ingredientCosts,
    lastCalculated: Date.now()
  }
}

/**
 * Calculate profitability for a menu item
 * 
 * @param menuItem - The menu item with selling price
 * @param recipe - The recipe used for this menu item
 * @param foodItems - All food items for costing
 * @param targetFoodCostPercentage - Desired food cost % (default 30%)
 * @returns Profitability analysis
 */
export function calculateMenuItemProfitability(
  menuItem: MenuItem,
  recipe: Recipe,
  foodItems: FoodItem[],
  targetFoodCostPercentage = 30
): MenuItemProfitability {
  const recipeCost = calculateRecipeCost(recipe, foodItems)
  const sellingPrice = menuItem.price
  const costPerServing = recipeCost.costPerServing
  
  const grossProfit = sellingPrice - costPerServing
  const profitMargin = sellingPrice > 0 ? (grossProfit / sellingPrice) * 100 : 0
  const costPercentage = sellingPrice > 0 ? (costPerServing / sellingPrice) * 100 : 0
  
  // Calculate recommended price based on target food cost percentage
  const recommendedPrice = costPerServing / (targetFoodCostPercentage / 100)
  
  // Determine profitability status
  let profitabilityStatus: 'excellent' | 'good' | 'fair' | 'poor'
  if (costPercentage <= 25) {
    profitabilityStatus = 'excellent'
  } else if (costPercentage <= 30) {
    profitabilityStatus = 'good'
  } else if (costPercentage <= 35) {
    profitabilityStatus = 'fair'
  } else {
    profitabilityStatus = 'poor'
  }

  return {
    menuItemId: menuItem.id,
    menuItemName: menuItem.name,
    sellingPrice,
    recipeCost: costPerServing,
    grossProfit,
    profitMargin,
    costPercentage,
    category: menuItem.category,
    recommendedPrice,
    profitabilityStatus
  }
}

/**
 * Perform menu engineering analysis
 * Classifies menu items into 4 categories based on profitability and popularity
 * 
 * @param menuItems - All menu items
 * @param recipes - All recipes
 * @param foodItems - All food items
 * @param salesData - Sales count for each menu item
 * @returns Menu engineering classification for each item
 */
export function performMenuEngineering(
  menuItems: MenuItem[],
  recipes: Recipe[],
  foodItems: FoodItem[],
  salesData: Record<string, number> // menuItemId -> quantity sold
): MenuEngineering[] {
  const totalSales = Object.values(salesData).reduce((sum, qty) => sum + qty, 0)
  const averageSales = totalSales / menuItems.length
  
  const itemsWithData = menuItems.map(menuItem => {
    const recipe = recipes.find(r => r.id === menuItem.recipeId)
    if (!recipe) {
      return null
    }

    const profitability = calculateMenuItemProfitability(menuItem, recipe, foodItems)
    const soldQuantity = salesData[menuItem.id] || 0
    const menuMix = totalSales > 0 ? (soldQuantity / totalSales) * 100 : 0
    
    return {
      menuItem,
      profitability,
      soldQuantity,
      menuMix
    }
  }).filter(Boolean) as Array<{
    menuItem: MenuItem
    profitability: MenuItemProfitability
    soldQuantity: number
    menuMix: number
  }>

  const averageProfit = itemsWithData.reduce((sum, item) => 
    sum + item.profitability.grossProfit, 0
  ) / itemsWithData.length

  return itemsWithData.map(({ menuItem, profitability, soldQuantity, menuMix }) => {
    const isPopular = soldQuantity >= averageSales
    const isProfitable = profitability.grossProfit >= averageProfit
    
    let classification: MenuEngineering['classification']
    let recommendedAction: string

    if (isPopular && isProfitable) {
      classification = 'star'
      recommendedAction = 'Maintain quality and promote heavily. These are your best items.'
    } else if (isPopular && !isProfitable) {
      classification = 'plow-horse'
      recommendedAction = 'Increase price gradually or reduce costs. Popular but not profitable enough.'
    } else if (!isPopular && isProfitable) {
      classification = 'puzzle'
      recommendedAction = 'Market more aggressively or reposition. Good margin but low sales.'
    } else {
      classification = 'dog'
      recommendedAction = 'Consider removal or major revamp. Low sales and low profit.'
    }

    return {
      itemName: menuItem.name,
      popularity: isPopular ? 'high' : 'low',
      profitability: isProfitable ? 'high' : 'low',
      classification,
      recommendedAction,
      menuMix,
      contributionMargin: profitability.grossProfit * soldQuantity
    }
  })
}

/**
 * Calculate ideal portion cost for a target food cost percentage
 * 
 * @param sellingPrice - Menu item selling price
 * @param targetFoodCostPercentage - Target food cost % (default 30%)
 * @returns Maximum allowable portion cost
 */
export function calculateIdealPortionCost(
  sellingPrice: number,
  targetFoodCostPercentage = 30
): number {
  return sellingPrice * (targetFoodCostPercentage / 100)
}

/**
 * Calculate selling price needed for a target profit margin
 * 
 * @param portionCost - Cost of the recipe per serving
 * @param targetProfitMargin - Desired profit margin percentage
 * @returns Recommended selling price
 */
export function calculatePriceForMargin(
  portionCost: number,
  targetProfitMargin = 70
): number {
  return portionCost / (1 - (targetProfitMargin / 100))
}

/**
 * Analyze recipe cost variance over time
 * 
 * @param recipe - Recipe to analyze
 * @param foodItems - Current food items with prices
 * @param historicalCosts - Array of historical recipe costs
 * @returns Variance analysis
 */
export function analyzeRecipeCostVariance(
  recipe: Recipe,
  foodItems: FoodItem[],
  historicalCosts: RecipeCost[]
): {
  currentCost: number
  averageHistoricalCost: number
  variance: number
  variancePercentage: number
  trend: 'increasing' | 'decreasing' | 'stable'
  volatileIngredients: string[]
} {
  const currentRecipeCost = calculateRecipeCost(recipe, foodItems)
  const currentCost = currentRecipeCost.costPerServing
  
  if (historicalCosts.length === 0) {
    return {
      currentCost,
      averageHistoricalCost: currentCost,
      variance: 0,
      variancePercentage: 0,
      trend: 'stable',
      volatileIngredients: []
    }
  }

  const averageHistoricalCost = historicalCosts.reduce((sum, hc) => 
    sum + hc.costPerServing, 0
  ) / historicalCosts.length
  
  const variance = currentCost - averageHistoricalCost
  const variancePercentage = averageHistoricalCost > 0 
    ? (variance / averageHistoricalCost) * 100 
    : 0

  // Determine trend based on last 3 costs
  let trend: 'increasing' | 'decreasing' | 'stable' = 'stable'
  if (historicalCosts.length >= 2) {
    const recentCosts = [...historicalCosts.slice(-2), currentRecipeCost]
      .map(rc => rc.costPerServing)
    
    const isIncreasing = recentCosts.every((cost, idx) => 
      idx === 0 || cost >= recentCosts[idx - 1]
    )
    const isDecreasing = recentCosts.every((cost, idx) => 
      idx === 0 || cost <= recentCosts[idx - 1]
    )
    
    if (isIncreasing && Math.abs(variancePercentage) > 5) {
      trend = 'increasing'
    } else if (isDecreasing && Math.abs(variancePercentage) > 5) {
      trend = 'decreasing'
    }
  }

  // Find ingredients with high price volatility
  const volatileIngredients: string[] = []
  // This would require historical ingredient price tracking
  // For now, return empty array as placeholder

  return {
    currentCost,
    averageHistoricalCost,
    variance,
    variancePercentage,
    trend,
    volatileIngredients
  }
}

/**
 * Get recipes that are over target food cost percentage
 * 
 * @param menuItems - All menu items
 * @param recipes - All recipes
 * @param foodItems - All food items
 * @param targetFoodCostPercentage - Maximum acceptable food cost %
 * @returns Array of items exceeding target
 */
export function getHighCostItems(
  menuItems: MenuItem[],
  recipes: Recipe[],
  foodItems: FoodItem[],
  targetFoodCostPercentage = 30
): MenuItemProfitability[] {
  return menuItems
    .map(menuItem => {
      const recipe = recipes.find(r => r.id === menuItem.recipeId)
      if (!recipe) return null
      
      return calculateMenuItemProfitability(menuItem, recipe, foodItems, targetFoodCostPercentage)
    })
    .filter((item): item is MenuItemProfitability => 
      item !== null && item.costPercentage > targetFoodCostPercentage
    )
    .sort((a, b) => b.costPercentage - a.costPercentage)
}

/**
 * Calculate theoretical vs actual recipe cost
 * Useful for detecting waste, theft, or portion control issues
 * 
 * @param recipe - The recipe
 * @param theoreticalCost - Cost based on recipe
 * @param actualCost - Actual cost from usage logs
 * @returns Variance analysis
 */
export function calculateYieldVariance(
  recipe: Recipe,
  theoreticalCost: number,
  actualCost: number
): {
  theoreticalCost: number
  actualCost: number
  variance: number
  variancePercentage: number
  issue: 'waste' | 'theft' | 'portion-control' | 'acceptable' | null
} {
  const variance = actualCost - theoreticalCost
  const variancePercentage = theoreticalCost > 0 
    ? (variance / theoreticalCost) * 100 
    : 0

  let issue: 'waste' | 'theft' | 'portion-control' | 'acceptable' | null = null
  
  if (Math.abs(variancePercentage) <= 5) {
    issue = 'acceptable'
  } else if (variancePercentage > 5 && variancePercentage <= 10) {
    issue = 'portion-control'
  } else if (variancePercentage > 10 && variancePercentage <= 20) {
    issue = 'waste'
  } else if (variancePercentage > 20) {
    issue = 'theft'
  }

  return {
    theoreticalCost,
    actualCost,
    variance,
    variancePercentage,
    issue
  }
}
