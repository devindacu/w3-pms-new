import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  MagnifyingGlass, 
  Plus,
  ChartLine,
  FileText,
  Warning,
  Trash,
  ChefHat,
  Notebook
} from '@phosphor-icons/react'
import { type KitchenConsumptionLog, type Recipe, type FoodItem, type Order, type DailyConsumptionReport } from '@/lib/types'
import { formatCurrency } from '@/lib/helpers'
import { ConsumptionLogDialog } from './ConsumptionLogDialog'
import { DailyReportDialog } from './DailyReportDialog'

interface KitchenConsumptionProps {
  consumptionLogs: KitchenConsumptionLog[]
  setConsumptionLogs: (logs: KitchenConsumptionLog[] | ((prev: KitchenConsumptionLog[]) => KitchenConsumptionLog[])) => void
  recipes: Recipe[]
  foodItems: FoodItem[]
  orders: Order[]
}

export function KitchenConsumption({
  consumptionLogs,
  setConsumptionLogs,
  recipes,
  foodItems,
  orders
}: KitchenConsumptionProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedLog, setSelectedLog] = useState<KitchenConsumptionLog | undefined>()
  const [isLogDialogOpen, setIsLogDialogOpen] = useState(false)
  const [isReportDialogOpen, setIsReportDialogOpen] = useState(false)

  const today = new Date().setHours(0, 0, 0, 0)
  const todayLogs = consumptionLogs.filter(log => {
    const logDate = new Date(log.producedAt).setHours(0, 0, 0, 0)
    return logDate === today
  })

  const filteredLogs = consumptionLogs.filter(log =>
    log.recipeName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    log.logNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
    log.type.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const handleCreateLog = () => {
    setSelectedLog(undefined)
    setIsLogDialogOpen(true)
  }

  const handleEditLog = (log: KitchenConsumptionLog) => {
    setSelectedLog(log)
    setIsLogDialogOpen(true)
  }

  const todayStats = {
    totalPortions: todayLogs.reduce((sum, log) => sum + log.portionsProduced, 0),
    totalCost: todayLogs.reduce((sum, log) => sum + log.totalCost, 0),
    totalVariance: todayLogs.reduce((sum, log) => 
      sum + (log.variance?.reduce((v, item) => v + item.varianceCost, 0) || 0), 0
    ),
    wasteCount: todayLogs.filter(log => log.type === 'waste').length,
    spoilageCount: todayLogs.filter(log => log.type === 'spoilage').length
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'recipe-consumption':
        return 'bg-primary text-primary-foreground'
      case 'waste':
        return 'bg-destructive text-destructive-foreground'
      case 'spoilage':
        return 'bg-accent text-accent-foreground'
      case 'variance':
        return 'bg-secondary text-secondary-foreground'
      default:
        return 'bg-muted text-muted-foreground'
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-semibold">Kitchen Consumption Engine</h1>
          <p className="text-muted-foreground mt-1">Track ingredient usage, waste, and profitability</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
        <Card className="p-6 border-l-4 border-l-primary">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-muted-foreground">Portions Today</h3>
            <ChefHat size={20} className="text-primary" />
          </div>
          <div className="space-y-2">
            <p className="text-3xl font-semibold">{todayStats.totalPortions}</p>
            <p className="text-sm text-muted-foreground">
              {todayLogs.length} recipes
            </p>
          </div>
        </Card>

        <Card className="p-6 border-l-4 border-l-success">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-muted-foreground">Cost Today</h3>
            <ChartLine size={20} className="text-success" />
          </div>
          <div className="space-y-2">
            <p className="text-3xl font-semibold">{formatCurrency(todayStats.totalCost)}</p>
            <p className="text-sm text-muted-foreground">
              {formatCurrency(todayStats.totalPortions > 0 ? todayStats.totalCost / todayStats.totalPortions : 0)} avg
            </p>
          </div>
        </Card>

        <Card className="p-6 border-l-4 border-l-accent">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-muted-foreground">Total Variance</h3>
            <Warning size={20} className="text-accent" />
          </div>
          <div className="space-y-2">
            <p className="text-3xl font-semibold">{formatCurrency(Math.abs(todayStats.totalVariance))}</p>
            <p className="text-sm text-muted-foreground">
              {todayStats.totalCost > 0 
                ? `${((Math.abs(todayStats.totalVariance) / todayStats.totalCost) * 100).toFixed(1)}%`
                : '0%'}
            </p>
          </div>
        </Card>

        <Card className="p-6 border-l-4 border-l-destructive">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-muted-foreground">Waste Items</h3>
            <Trash size={20} className="text-destructive" />
          </div>
          <div className="space-y-2">
            <p className="text-3xl font-semibold">{todayStats.wasteCount}</p>
            <p className="text-sm text-muted-foreground">Today</p>
          </div>
        </Card>

        <Card className="p-6 border-l-4 border-l-accent">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-muted-foreground">Spoilage</h3>
            <Warning size={20} className="text-accent" />
          </div>
          <div className="space-y-2">
            <p className="text-3xl font-semibold">{todayStats.spoilageCount}</p>
            <p className="text-sm text-muted-foreground">Today</p>
          </div>
        </Card>
      </div>

      <Tabs defaultValue="logs" className="space-y-6">
        <TabsList>
          <TabsTrigger value="logs">Consumption Logs</TabsTrigger>
          <TabsTrigger value="reports">Daily Reports</TabsTrigger>
        </TabsList>

        <TabsContent value="logs" className="space-y-4">
          <div className="flex items-center gap-4">
            <div className="relative flex-1">
              <MagnifyingGlass className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={20} />
              <Input
                placeholder="Search consumption logs..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button onClick={handleCreateLog}>
              <Plus size={20} className="mr-2" />
              Log Consumption
            </Button>
            <Button variant="outline" onClick={() => setIsReportDialogOpen(true)}>
              <FileText size={20} className="mr-2" />
              Generate Report
            </Button>
          </div>

          {filteredLogs.length === 0 ? (
            <Card className="p-16 text-center">
              <Notebook size={64} className="mx-auto text-muted-foreground mb-4" />
              <h3 className="text-xl font-semibold mb-2">No Consumption Logs</h3>
              <p className="text-muted-foreground mb-6">
                {searchTerm
                  ? 'No logs match your search. Try different keywords.'
                  : 'Start logging your kitchen consumption to track ingredient usage.'}
              </p>
              {!searchTerm && (
                <Button onClick={handleCreateLog}>
                  <Plus size={20} className="mr-2" />
                  Log Consumption
                </Button>
              )}
            </Card>
          ) : (
            <div className="space-y-3">
              {filteredLogs.sort((a, b) => b.producedAt - a.producedAt).map((log) => (
                <Card
                  key={log.id}
                  className="p-6 cursor-pointer hover:shadow-lg transition-shadow"
                  onClick={() => handleEditLog(log)}
                >
                  <div className="space-y-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="font-semibold text-lg">{log.recipeName}</h3>
                          <Badge className={getTypeColor(log.type)}>
                            {log.type.replace('-', ' ')}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <span>{log.logNumber}</span>
                          {log.orderNumber && (
                            <>
                              <span>•</span>
                              <span>Order: {log.orderNumber}</span>
                            </>
                          )}
                          <span>•</span>
                          <span>{new Date(log.producedAt).toLocaleString()}</span>
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-4 gap-4">
                      <div>
                        <p className="text-xs text-muted-foreground mb-1">Portions</p>
                        <p className="text-lg font-semibold">{log.portionsProduced}</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground mb-1">Total Cost</p>
                        <p className="text-lg font-semibold">{formatCurrency(log.totalCost)}</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground mb-1">Cost/Portion</p>
                        <p className="text-lg font-semibold">{formatCurrency(log.costPerPortion)}</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground mb-1">Variance</p>
                        <p className={`text-lg font-semibold ${
                          (log.variance?.reduce((sum, v) => sum + v.varianceCost, 0) || 0) > 0
                            ? 'text-destructive'
                            : 'text-success'
                        }`}>
                          {formatCurrency(Math.abs(log.variance?.reduce((sum, v) => sum + v.varianceCost, 0) || 0))}
                        </p>
                      </div>
                    </div>

                    {log.variance && log.variance.length > 0 && (
                      <div className="pt-3 border-t">
                        <p className="text-xs text-muted-foreground mb-2">Variance Details:</p>
                        <div className="flex flex-wrap gap-2">
                          {log.variance.slice(0, 3).map((v, idx) => (
                            <Badge key={idx} variant="outline" className="text-xs">
                              {v.itemName}: {v.variance > 0 ? '+' : ''}{v.variance} {v.variancePercent.toFixed(1)}%
                            </Badge>
                          ))}
                          {log.variance.length > 3 && (
                            <Badge variant="outline" className="text-xs">
                              +{log.variance.length - 3} more
                            </Badge>
                          )}
                        </div>
                      </div>
                    )}

                    {(log.wasteReason || log.spoilageReason) && (
                      <div className="pt-3 border-t">
                        <p className="text-xs text-muted-foreground mb-1">
                          {log.type === 'waste' ? 'Waste Reason' : 'Spoilage Reason'}:
                        </p>
                        <p className="text-sm">{log.wasteReason || log.spoilageReason}</p>
                      </div>
                    )}

                    <div className="flex items-center justify-between pt-2 text-xs text-muted-foreground">
                      <span>Produced by: {log.producedBy}</span>
                      {log.shiftType && (
                        <Badge variant="outline" className="text-xs capitalize">
                          {log.shiftType} shift
                        </Badge>
                      )}
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="reports" className="space-y-4">
          <Card className="p-16 text-center">
            <FileText size={64} className="mx-auto text-muted-foreground mb-4" />
            <h3 className="text-xl font-semibold mb-2">Daily Consumption Reports</h3>
            <p className="text-muted-foreground mb-6">
              Generate comprehensive reports on ingredient usage, costs, and profitability
            </p>
            <Button onClick={() => setIsReportDialogOpen(true)}>
              <FileText size={20} className="mr-2" />
              Generate Report
            </Button>
          </Card>
        </TabsContent>
      </Tabs>

      <ConsumptionLogDialog
        open={isLogDialogOpen}
        onOpenChange={setIsLogDialogOpen}
        log={selectedLog}
        consumptionLogs={consumptionLogs}
        setConsumptionLogs={setConsumptionLogs}
        recipes={recipes}
        foodItems={foodItems}
        orders={orders}
      />

      <DailyReportDialog
        open={isReportDialogOpen}
        onOpenChange={setIsReportDialogOpen}
        consumptionLogs={consumptionLogs}
        recipes={recipes}
        orders={orders}
      />
    </div>
  )
}
