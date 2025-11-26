import { useState } from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ChefHat, ChartBar, BookOpen, Receipt } from '@phosphor-icons/react'
import { RecipeManagement } from '@/components/RecipeManagement'
import { KitchenConsumption } from '@/components/KitchenConsumption'
import { Card } from '@/components/ui/card'
import {
  type Recipe,
  type Menu,
  type KitchenConsumptionLog,
  type FoodItem,
  type Supplier,
  type Order
} from '@/lib/types'

interface KitchenOperationsProps {
  recipes: Recipe[]
  setRecipes: (recipes: Recipe[] | ((prev: Recipe[]) => Recipe[])) => void
  menus: Menu[]
  setMenus: (menus: Menu[] | ((prev: Menu[]) => Menu[])) => void
  consumptionLogs: KitchenConsumptionLog[]
  setConsumptionLogs: (logs: KitchenConsumptionLog[] | ((prev: KitchenConsumptionLog[]) => KitchenConsumptionLog[])) => void
  foodItems: FoodItem[]
  suppliers: Supplier[]
  orders: Order[]
}

export function KitchenOperations({
  recipes,
  setRecipes,
  menus,
  setMenus,
  consumptionLogs,
  setConsumptionLogs,
  foodItems,
  suppliers,
  orders
}: KitchenOperationsProps) {
  const [activeTab, setActiveTab] = useState('recipes')

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-4xl font-semibold">Kitchen Operations</h1>
        <p className="text-muted-foreground mt-1">Manage recipes, menus, consumption tracking, and kitchen management</p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="recipes" className="gap-2">
            <BookOpen size={18} />
            Recipes & Menus
          </TabsTrigger>
          <TabsTrigger value="consumption" className="gap-2">
            <ChartBar size={18} />
            Consumption Tracking
          </TabsTrigger>
          <TabsTrigger value="management" className="gap-2">
            <ChefHat size={18} />
            Kitchen Management
          </TabsTrigger>
        </TabsList>

        <TabsContent value="recipes" className="mt-6">
          <RecipeManagement
            recipes={recipes}
            setRecipes={setRecipes}
            menus={menus}
            setMenus={setMenus}
            foodItems={foodItems}
            suppliers={suppliers}
          />
        </TabsContent>

        <TabsContent value="consumption" className="mt-6">
          <KitchenConsumption
            consumptionLogs={consumptionLogs}
            setConsumptionLogs={setConsumptionLogs}
            recipes={recipes}
            foodItems={foodItems}
            orders={orders}
          />
        </TabsContent>

        <TabsContent value="management" className="mt-6">
          <Card className="p-16 text-center">
            <div className="max-w-md mx-auto">
              <ChefHat size={64} className="mx-auto text-muted-foreground mb-4" />
              <h3 className="text-2xl font-semibold mb-2">Kitchen Management</h3>
              <p className="text-muted-foreground mb-6">
                Advanced kitchen workflow management, staff assignments, and production scheduling coming soon.
              </p>
            </div>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
