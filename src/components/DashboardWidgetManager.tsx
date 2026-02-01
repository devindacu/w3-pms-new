import { useState } from 'react'
import { useKV } from '@github/spark/hooks'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import {
  Sliders,
  Plus,
  DotsSixVertical,
  Eye,
  EyeSlash,
  Trash,
  GridFour,
  FloppyDisk,
  ArrowCounterClockwise,
  Sparkle
} from '@phosphor-icons/react'
import { toast } from 'sonner'
import type {
  DashboardWidget,
  DashboardLayout,
  DashboardWidgetType,
  WidgetSize,
  SystemRole,
  UserRole,
  RoleWidgetPreset
} from '@/lib/types'
import { getRoleWidgetPresets, getDefaultWidgetsForRole, getAvailableWidgets } from '@/lib/widgetConfig'

interface DashboardWidgetManagerProps {
  userId: string
  userRole: SystemRole | UserRole
  currentLayout?: DashboardLayout
  onLayoutChange: (layout: DashboardLayout) => void
}

export function DashboardWidgetManager({
  userId,
  userRole,
  currentLayout,
  onLayoutChange
}: DashboardWidgetManagerProps) {
  const [dialogOpen, setDialogOpen] = useState(false)
  const [activeTab, setActiveTab] = useState('widgets')
  const [tempLayout, setTempLayout] = useState<DashboardLayout | null>(null)

  const availableWidgets = getAvailableWidgets()
  const rolePresets = getRoleWidgetPresets(userRole)

  const openManager = () => {
    setTempLayout(currentLayout || createDefaultLayout())
    setDialogOpen(true)
  }

  const createDefaultLayout = (): DashboardLayout => {
    const defaultWidgets = getDefaultWidgetsForRole(userRole)
    const widgets: DashboardWidget[] = defaultWidgets.map((type, index) => ({
      id: `widget-${Date.now()}-${index}`,
      type,
      title: getWidgetTitle(type),
      size: getDefaultWidgetSize(type),
      position: index,
      isVisible: true,
      refreshInterval: getDefaultRefreshInterval(type),
    }))

    return {
      id: `layout-${Date.now()}`,
      userId,
      userRole,
      name: `${userRole} Dashboard`,
      isDefault: true,
      isShared: false,
      widgets,
      columns: 2,
      createdAt: Date.now(),
      updatedAt: Date.now(),
      createdBy: userId
    }
  }

  const getWidgetTitle = (type: DashboardWidgetType): string => {
    const titles: Record<DashboardWidgetType, string> = {
      'occupancy': 'Occupancy',
      'revenue-today': 'Revenue Today',
      'housekeeping': 'Housekeeping',
      'amenities-stock': 'Amenities Stock',
      'food-inventory': 'Food Inventory',
      'maintenance-construction': 'Maintenance & Construction',
      'fnb-performance': 'F&B Performance',
      'maintenance-status': 'Maintenance Status',
      'room-status': 'Room Status Overview',
      'low-stock': 'Low Stock Items',
      'arrivals-departures': 'Arrivals & Departures',
      'guest-feedback': 'Recent Guest Feedback',
      'revenue-chart': 'Revenue Chart',
      'occupancy-chart': 'Occupancy Chart',
      'department-performance': 'Department Performance',
      'pending-approvals': 'Pending Approvals',
      'financial-summary': 'Financial Summary',
      'kitchen-operations': 'Kitchen Operations',
      'crm-summary': 'CRM Summary',
      'channel-performance': 'Channel Performance',
      'period-comparison': 'Period Comparison'
    }
    return titles[type]
  }

  const getDefaultWidgetSize = (type: DashboardWidgetType): WidgetSize => {
    const largeSizeWidgets: DashboardWidgetType[] = [
      'room-status',
      'low-stock',
      'revenue-chart',
      'occupancy-chart'
    ]
    const smallSizeWidgets: DashboardWidgetType[] = [
      'occupancy',
      'revenue-today',
      'housekeeping',
      'amenities-stock'
    ]
    
    if (largeSizeWidgets.includes(type)) return 'large'
    if (smallSizeWidgets.includes(type)) return 'small'
    return 'medium'
  }

  const getDefaultRefreshInterval = (type: DashboardWidgetType): number => {
    return 60000
  }

  const handleAddWidget = (type: DashboardWidgetType) => {
    if (!tempLayout) return

    const exists = tempLayout.widgets.some(w => w.type === type)
    if (exists) {
      toast.error('This widget is already added to your dashboard')
      return
    }

    const newWidget: DashboardWidget = {
      id: `widget-${Date.now()}`,
      type,
      title: getWidgetTitle(type),
      size: getDefaultWidgetSize(type),
      position: tempLayout.widgets.length,
      isVisible: true,
      refreshInterval: getDefaultRefreshInterval(type),
    }

    setTempLayout({
      ...tempLayout,
      widgets: [...tempLayout.widgets, newWidget],
      updatedAt: Date.now()
    })

    toast.success(`Added ${getWidgetTitle(type)} to your dashboard`)
  }

  const handleToggleWidget = (widgetId: string) => {
    if (!tempLayout) return

    setTempLayout({
      ...tempLayout,
      widgets: tempLayout.widgets.map(w =>
        w.id === widgetId ? { ...w, isVisible: !w.isVisible } : w
      ),
      updatedAt: Date.now()
    })
  }

  const handleRemoveWidget = (widgetId: string) => {
    if (!tempLayout) return

    setTempLayout({
      ...tempLayout,
      widgets: tempLayout.widgets.filter(w => w.id !== widgetId),
      updatedAt: Date.now()
    })

    toast.success('Widget removed from dashboard')
  }

  const handleChangeWidgetSize = (widgetId: string, size: WidgetSize) => {
    if (!tempLayout) return

    setTempLayout({
      ...tempLayout,
      widgets: tempLayout.widgets.map(w =>
        w.id === widgetId ? { ...w, size } : w
      ),
      updatedAt: Date.now()
    })
  }

  const handleMoveWidget = (widgetId: string, direction: 'up' | 'down') => {
    if (!tempLayout) return

    const widgets = [...tempLayout.widgets]
    const index = widgets.findIndex(w => w.id === widgetId)
    if (index === -1) return

    const newIndex = direction === 'up' ? index - 1 : index + 1
    if (newIndex < 0 || newIndex >= widgets.length) return

    const temp = widgets[index]
    widgets[index] = widgets[newIndex]
    widgets[newIndex] = temp

    widgets.forEach((w, i) => {
      w.position = i
    })

    setTempLayout({
      ...tempLayout,
      widgets,
      updatedAt: Date.now()
    })
  }

  const handleSaveLayout = () => {
    if (!tempLayout) return

    onLayoutChange(tempLayout)
    setDialogOpen(false)
    toast.success('Dashboard layout saved successfully')
  }

  const handleResetToDefault = () => {
    const defaultLayout = createDefaultLayout()
    setTempLayout(defaultLayout)
    toast.info('Dashboard reset to default layout')
  }

  const handleChangeColumns = (columns: 1 | 2 | 3 | 4) => {
    if (!tempLayout) return

    setTempLayout({
      ...tempLayout,
      columns,
      updatedAt: Date.now()
    })
  }

  const getWidgetsByType = () => {
    const categories: Record<string, DashboardWidgetType[]> = {
      'Operations': [
        'occupancy',
        'housekeeping',
        'maintenance-status',
        'room-status',
        'arrivals-departures'
      ],
      'Revenue & Finance': [
        'revenue-today',
        'revenue-chart',
        'financial-summary',
        'channel-performance'
      ],
      'Inventory': [
        'amenities-stock',
        'food-inventory',
        'low-stock',
        'maintenance-construction'
      ],
      'F&B': [
        'fnb-performance',
        'kitchen-operations'
      ],
      'CRM & Guests': [
        'guest-feedback',
        'crm-summary'
      ],
      'Performance': [
        'occupancy-chart',
        'department-performance',
        'pending-approvals'
      ]
    }

    return categories
  }

  const QuickColumnSelector = () => {
    const layout = tempLayout || currentLayout
    
    return (
      <div className="flex items-center gap-2">
        <div className="hidden md:flex items-center gap-1 border rounded-lg p-0.5 bg-muted/30">
          {[1, 2, 3, 4].map(num => (
            <Button
              key={num}
              variant={layout?.columns === num ? 'default' : 'ghost'}
              size="sm"
              onClick={() => {
                const activeLayout = layout || createDefaultLayout()
                const updatedLayout = { ...activeLayout, columns: num as 1 | 2 | 3 | 4, updatedAt: Date.now() }
                onLayoutChange(updatedLayout)
                toast.success(`Dashboard layout changed to ${num} column${num > 1 ? 's' : ''}`)
              }}
              className="h-7 w-7 p-0"
              title={`${num} Column${num > 1 ? 's' : ''}`}
            >
              {num}
            </Button>
          ))}
        </div>
        <Button variant="outline" onClick={openManager} size="sm">
          <Sliders size={18} className="mr-2" />
          <span className="hidden lg:inline">Customize Dashboard</span>
          <span className="lg:hidden">Customize</span>
        </Button>
      </div>
    )
  }

  return (
    <>
      <QuickColumnSelector />

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[85vh] flex flex-col">
          <DialogHeader>
            <DialogTitle>Customize Dashboard</DialogTitle>
            <DialogDescription>
              Add, remove, and arrange widgets to personalize your dashboard
            </DialogDescription>
          </DialogHeader>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 min-h-0 flex flex-col">
            <TabsList className="grid grid-cols-2 w-full max-w-md">
              <TabsTrigger value="widgets">
                <GridFour size={18} className="mr-2" />
                Widgets
              </TabsTrigger>
              <TabsTrigger value="layout">
                <Sliders size={18} className="mr-2" />
                Layout
              </TabsTrigger>
            </TabsList>

            <TabsContent value="widgets" className="flex-1 overflow-y-auto space-y-4 mt-4">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-semibold">Your Widgets</h3>
                    <p className="text-xs text-muted-foreground">
                      {tempLayout?.widgets.filter(w => w.isVisible).length || 0} of {tempLayout?.widgets.length || 0} visible
                    </p>
                  </div>
                  <Button variant="outline" size="sm" onClick={handleResetToDefault}>
                    <ArrowCounterClockwise size={16} className="mr-2" />
                    Reset to Default
                  </Button>
                </div>

                <div className="space-y-2">
                  {tempLayout?.widgets.map((widget, index) => (
                    <Card key={widget.id} className="p-3">
                      <div className="flex items-center gap-3">
                        <div className="flex flex-col gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleMoveWidget(widget.id, 'up')}
                            disabled={index === 0}
                            className="h-5 w-5 p-0"
                          >
                            <DotsSixVertical size={14} />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleMoveWidget(widget.id, 'down')}
                            disabled={index === (tempLayout?.widgets.length || 0) - 1}
                            className="h-5 w-5 p-0"
                          >
                            <DotsSixVertical size={14} />
                          </Button>
                        </div>

                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-medium text-sm">{widget.title}</span>
                            <Badge variant={widget.isVisible ? 'default' : 'secondary'} className="text-xs">
                              {widget.size}
                            </Badge>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <Select
                            value={widget.size}
                            onValueChange={(value: WidgetSize) => handleChangeWidgetSize(widget.id, value)}
                          >
                            <SelectTrigger className="w-28 h-8 text-xs">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="small">Small</SelectItem>
                              <SelectItem value="medium">Medium</SelectItem>
                              <SelectItem value="large">Large</SelectItem>
                              <SelectItem value="full">Full Width</SelectItem>
                            </SelectContent>
                          </Select>

                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleToggleWidget(widget.id)}
                            className="h-8 w-8 p-0"
                          >
                            {widget.isVisible ? <Eye size={16} /> : <EyeSlash size={16} />}
                          </Button>

                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleRemoveWidget(widget.id)}
                            className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                          >
                            <Trash size={16} />
                          </Button>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>

                <div className="pt-4 border-t">
                  <h3 className="text-sm font-semibold mb-3">Available Widgets</h3>
                  <div className="space-y-3">
                    {Object.entries(getWidgetsByType()).map(([category, widgets]) => (
                      <div key={category}>
                        <h4 className="text-xs font-semibold text-muted-foreground mb-2">{category}</h4>
                        <div className="grid grid-cols-2 gap-2">
                          {widgets.map(type => {
                            const isAdded = tempLayout?.widgets.some(w => w.type === type)
                            return (
                              <Button
                                key={type}
                                variant={isAdded ? 'secondary' : 'outline'}
                                size="sm"
                                onClick={() => !isAdded && handleAddWidget(type)}
                                disabled={isAdded}
                                className="justify-start text-xs h-9"
                              >
                                <Plus size={14} className="mr-2" />
                                {getWidgetTitle(type)}
                              </Button>
                            )
                          })}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="layout" className="flex-1 overflow-y-auto space-y-4 mt-4">
              <div className="space-y-6">
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <Label className="text-sm font-semibold block">Dashboard Layout</Label>
                      <p className="text-xs text-muted-foreground mt-1">
                        Adjust column count to optimize for your screen size
                      </p>
                    </div>
                    <Badge variant="outline" className="text-xs">
                      Current: {tempLayout?.columns} Column{(tempLayout?.columns || 2) > 1 ? 's' : ''}
                    </Badge>
                  </div>
                  
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                    {[
                      { num: 1, label: 'Single', desc: 'Full width widgets', icon: '▐' },
                      { num: 2, label: 'Two Columns', desc: 'Balanced layout', icon: '▐▐' },
                      { num: 3, label: 'Three Columns', desc: 'Compact view', icon: '▐▐▐' },
                      { num: 4, label: 'Four Columns', desc: 'Dense grid', icon: '▐▐▐▐' }
                    ].map(({ num, label, desc, icon }) => (
                      <Card
                        key={num}
                        className={`p-4 cursor-pointer transition-all hover:shadow-md ${
                          tempLayout?.columns === num 
                            ? 'border-primary bg-primary/5 shadow-sm' 
                            : 'hover:border-primary/50'
                        }`}
                        onClick={() => handleChangeColumns(num as 1 | 2 | 3 | 4)}
                      >
                        <div className="flex flex-col items-center text-center gap-2">
                          <div className={`text-2xl font-mono ${
                            tempLayout?.columns === num ? 'text-primary' : 'text-muted-foreground'
                          }`}>
                            {icon}
                          </div>
                          <div>
                            <div className={`text-sm font-semibold ${
                              tempLayout?.columns === num ? 'text-primary' : ''
                            }`}>
                              {label}
                            </div>
                            <div className="text-xs text-muted-foreground mt-1">
                              {desc}
                            </div>
                          </div>
                          {tempLayout?.columns === num && (
                            <Badge variant="default" className="text-xs mt-1">
                              Active
                            </Badge>
                          )}
                        </div>
                      </Card>
                    ))}
                  </div>

                  <div className="mt-4 p-3 bg-muted/50 rounded-lg border">
                    <div className="flex items-start gap-2">
                      <Sparkle size={16} className="text-primary mt-0.5 shrink-0" />
                      <div className="text-xs text-muted-foreground">
                        <strong className="text-foreground">Tip:</strong> Use 1-2 columns for mobile/tablet, 
                        2-3 columns for laptops, and 3-4 columns for large displays. 
                        Widget sizes adapt automatically based on your selection.
                      </div>
                    </div>
                  </div>
                </div>

                {rolePresets && (
                  <div className="pt-4 border-t">
                    <div className="flex items-start gap-3 p-3 bg-accent/50 rounded-lg border border-accent">
                      <Sparkle size={20} className="text-primary mt-0.5" />
                      <div>
                        <h4 className="text-sm font-semibold mb-1">{rolePresets.name}</h4>
                        <p className="text-xs text-muted-foreground mb-2">
                          {rolePresets.description}
                        </p>
                        <div className="flex flex-wrap gap-1">
                          {rolePresets.recommendedWidgets.map(type => (
                            <Badge key={type} variant="outline" className="text-xs">
                              {getWidgetTitle(type)}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </TabsContent>
          </Tabs>

          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveLayout}>
              <FloppyDisk size={18} className="mr-2" />
              Save Layout
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
