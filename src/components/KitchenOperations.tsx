import { useState } from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ChefHat, ChartBar, BookOpen } from '@phosphor-icons/react'
import { RecipeManagement } from '@/components/RecipeManagement'
import { KitchenConsumption } from '@/components/KitchenConsumption'
import { KitchenManagement } from '@/components/KitchenManagement'
import {
  type Recipe,
  type Menu,
  type KitchenConsumptionLog,
  type FoodItem,
  type Supplier,
  type Order,
  type KitchenStation,
  type KitchenStaff,
  type ProductionSchedule,
  type KitchenInventoryIssue,
  type WasteTracking,
  type Employee
} from '@/lib/types'

interface KitchenOperationsProps {
  recipes: Recipe[]
  setRecipes: (recipes: Recipe[] | ((prev: Recipe[]) => Recipe[])) => void
  menus: Menu[]
  setMenus: (menus: Menu[] | ((prev: Menu[]) => Menu[])) => void
  consumptionLogs: KitchenConsumptionLog[]
  setConsumptionLogs: (logs: KitchenConsumptionLog[] | ((prev: KitchenConsumptionLog[]) => KitchenConsumptionLog[])) => void
  stations: KitchenStation[]
  setStations: (stations: KitchenStation[] | ((prev: KitchenStation[]) => KitchenStation[])) => void
  kitchenStaff: KitchenStaff[]
  setKitchenStaff: (staff: KitchenStaff[] | ((prev: KitchenStaff[]) => KitchenStaff[])) => void
  productionSchedules: ProductionSchedule[]
  setProductionSchedules: (schedules: ProductionSchedule[] | ((prev: ProductionSchedule[]) => ProductionSchedule[])) => void
  inventoryIssues: KitchenInventoryIssue[]
  setInventoryIssues: (issues: KitchenInventoryIssue[] | ((prev: KitchenInventoryIssue[]) => KitchenInventoryIssue[])) => void
  wasteTracking: WasteTracking[]
  setWasteTracking: (waste: WasteTracking[] | ((prev: WasteTracking[]) => WasteTracking[])) => void
  foodItems: FoodItem[]
  suppliers: Supplier[]
  orders: Order[]
  employees: Employee[]
}

export function KitchenOperations({
  recipes,
  setRecipes,
  menus,
  setMenus,
  consumptionLogs,
  setConsumptionLogs,
  stations,
  setStations,
  kitchenStaff,
  setKitchenStaff,
  productionSchedules,
  setProductionSchedules,
  inventoryIssues,
  setInventoryIssues,
  wasteTracking,
  setWasteTracking,
  foodItems,
  suppliers,
  orders,
  employees
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
          <KitchenManagement
            stations={stations}
            setStations={setStations}
            staff={kitchenStaff}
            setStaff={setKitchenStaff}
            schedules={productionSchedules}
            setSchedules={setProductionSchedules}
            inventoryIssues={inventoryIssues}
            setInventoryIssues={setInventoryIssues}
            wasteTracking={wasteTracking}
            setWasteTracking={setWasteTracking}
            employees={employees}
            foodItems={foodItems}
          />
        </TabsContent>
      </Tabs>
    </div>
  )
}
