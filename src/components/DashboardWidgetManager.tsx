import { useState, useRef } from 'react'
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
import { ScrollArea } from '@/components/ui/scroll-area'
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
  Sparkle,
  Copy,
  Download,
  Upload
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
import { cn } from '@/lib/utils'

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
  const [draggedWidget, setDraggedWidget] = useState<string | null>(null)
  const [dragOverWidget, setDragOverWidget] = useState<string | null>(null)

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
      'revenue-analytics': 'Revenue Analytics',
      'occupancy-chart': 'Occupancy Chart',
      'department-performance': 'Department Performance',
      'pending-approvals': 'Pending Approvals',
      'financial-summary': 'Financial Summary',
      'kitchen-operations': 'Kitchen Operations',
      'crm-summary': 'CRM Summary',
      'channel-performance': 'Channel Performance'
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

  const handleDragStart = (e: React.DragEvent, widgetId: string) => {
    setDraggedWidget(widgetId)
    e.dataTransfer.effectAllowed = 'move'
    e.dataTransfer.setData('text/html', widgetId)
    
    const target = e.target as HTMLElement
    target.style.opacity = '0.4'
  }

  const handleDragEnd = (e: React.DragEvent) => {
    const target = e.target as HTMLElement
    target.style.opacity = '1'
    setDraggedWidget(null)
    setDragOverWidget(null)
  }

  const handleDragOver = (e: React.DragEvent, widgetId: string) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
    
    if (draggedWidget && draggedWidget !== widgetId) {
      setDragOverWidget(widgetId)
    }
  }

  const handleDragLeave = () => {
    setDragOverWidget(null)
  }

  const handleDrop = (e: React.DragEvent, targetWidgetId: string) => {
    e.preventDefault()
    e.stopPropagation()

    if (!tempLayout || !draggedWidget || draggedWidget === targetWidgetId) {
      setDragOverWidget(null)
      return
    }

    const widgets = [...tempLayout.widgets]
    const draggedIndex = widgets.findIndex(w => w.id === draggedWidget)
    const targetIndex = widgets.findIndex(w => w.id === targetWidgetId)

    if (draggedIndex === -1 || targetIndex === -1) {
      setDragOverWidget(null)
      return
    }

    const [removed] = widgets.splice(draggedIndex, 1)
    widgets.splice(targetIndex, 0, removed)

    widgets.forEach((w, i) => {
      w.position = i
    })

    setTempLayout({
      ...tempLayout,
      widgets,
      updatedAt: Date.now()
    })

    setDragOverWidget(null)
    toast.success('Widget reordered')
  }

  const handleExportLayout = () => {
    if (!tempLayout) return

    const dataStr = JSON.stringify(tempLayout, null, 2)
    const dataBlob = new Blob([dataStr], { type: 'application/json' })
    const url = URL.createObjectURL(dataBlob)
    const link = document.createElement('a')
    link.href = url
    link.download = `dashboard-layout-${tempLayout.name.replace(/\s+/g, '-').toLowerCase()}-${Date.now()}.json`
    link.click()
    URL.revokeObjectURL(url)
    toast.success('Dashboard layout exported')
  }

  const handleImportLayout = () => {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = 'application/json'
    input.onchange = (e: Event) => {
      const file = (e.target as HTMLInputElement).files?.[0]
      if (!file) return

      const reader = new FileReader()
      reader.onload = (event) => {
        try {
          const importedLayout = JSON.parse(event.target?.result as string) as DashboardLayout
          
          importedLayout.id = `layout-${Date.now()}`
          importedLayout.userId = userId
          importedLayout.updatedAt = Date.now()
          importedLayout.createdBy = userId
          
          setTempLayout(importedLayout)
          toast.success('Dashboard layout imported successfully')
        } catch (error) {
          toast.error('Failed to import layout. Invalid file format.')
        }
      }
      reader.readAsText(file)
    }
    input.click()
  }

  const handleDuplicateLayout = () => {
    if (!tempLayout) return

    const duplicated: DashboardLayout = {
      ...tempLayout,
      id: `layout-${Date.now()}`,
      name: `${tempLayout.name} (Copy)`,
      isDefault: false,
      createdAt: Date.now(),
      updatedAt: Date.now(),
      widgets: tempLayout.widgets.map(w => ({
        ...w,
        id: `widget-${Date.now()}-${Math.random()}`
      }))
    }

    setTempLayout(duplicated)
    toast.success('Layout duplicated')
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

  return (
    <>
      <Button 
        variant="outline" 
        onClick={openManager} 
        size="sm"
        className="gap-2 hover:bg-primary hover:text-primary-foreground transition-all"
      >
        <Sliders size={18} />
        <span className="hidden sm:inline">Customize Dashboard</span>
        <span className="sm:hidden">Customize</span>
      </Button>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-5xl max-h-[90vh] h-[90vh] flex flex-col gap-0 p-0">
          <DialogHeader className="px-6 pt-6 pb-4 border-b shrink-0">
            <DialogTitle className="text-2xl">Customize Dashboard Layout</DialogTitle>
            <DialogDescription>
              Drag widgets to reorder, adjust sizes, and create your perfect dashboard experience
            </DialogDescription>
          </DialogHeader>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 min-h-0 flex flex-col px-6">
            <TabsList className="grid grid-cols-2 w-full max-w-md my-4">
              <TabsTrigger value="widgets" className="gap-2">
                <GridFour size={18} />
                Widgets
              </TabsTrigger>
              <TabsTrigger value="layout" className="gap-2">
                <Sliders size={18} />
                Layout Settings
              </TabsTrigger>
            </TabsList>

            <TabsContent value="widgets" className="flex-1 overflow-y-auto space-y-4 mt-4">
              <div className="space-y-4">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <div>
                    <h3 className="text-sm font-semibold">Your Widgets</h3>
                    <p className="text-xs text-muted-foreground">
                      {tempLayout?.widgets.filter(w => w.isVisible).length || 0} of {tempLayout?.widgets.length || 0} visible • Drag to reorder
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" onClick={handleExportLayout}>
                      <Download size={16} className="mr-2" />
                      Export
                    </Button>
                    <Button variant="outline" size="sm" onClick={handleImportLayout}>
                      <Upload size={16} className="mr-2" />
                      Import
                    </Button>
                    <Button variant="outline" size="sm" onClick={handleDuplicateLayout}>
                      <Copy size={16} className="mr-2" />
                      Duplicate
                    </Button>
                    <Button variant="outline" size="sm" onClick={handleResetToDefault}>
                      <ArrowCounterClockwise size={16} className="mr-2" />
                      Reset
                    </Button>
                  </div>
                </div>

                <ScrollArea className="h-[400px] pr-4">
                  <div className="space-y-2">
                    {tempLayout?.widgets.map((widget, index) => (
                      <Card
                        key={widget.id}
                        draggable
                        onDragStart={(e) => handleDragStart(e, widget.id)}
                        onDragEnd={handleDragEnd}
                        onDragOver={(e) => handleDragOver(e, widget.id)}
                        onDragLeave={handleDragLeave}
                        onDrop={(e) => handleDrop(e, widget.id)}
                        className={cn(
                          "p-3 cursor-move transition-all duration-200",
                          dragOverWidget === widget.id && "border-primary border-2 bg-primary/5",
                          draggedWidget === widget.id && "opacity-40"
                        )}
                      >
                        <div className="flex items-center gap-3">
                          <div className="cursor-grab active:cursor-grabbing text-muted-foreground hover:text-foreground transition-colors">
                            <DotsSixVertical size={20} />
                          </div>

                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1 flex-wrap">
                              <span className="font-medium text-sm">{widget.title}</span>
                              <Badge variant={widget.isVisible ? 'default' : 'secondary'} className="text-xs">
                                {widget.size}
                              </Badge>
                              {!widget.isVisible && (
                                <Badge variant="outline" className="text-xs">
                                  Hidden
                                </Badge>
                              )}
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
                              title={widget.isVisible ? 'Hide widget' : 'Show widget'}
                            >
                              {widget.isVisible ? <Eye size={16} /> : <EyeSlash size={16} />}
                            </Button>

                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleRemoveWidget(widget.id)}
                              className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                              title="Remove widget"
                            >
                              <Trash size={16} />
                            </Button>
                          </div>
                        </div>
                      </Card>
                    ))}
                  </div>
                </ScrollArea>

                <div className="pt-4 border-t">
                  <h3 className="text-sm font-semibold mb-3">Add New Widgets</h3>
                  <ScrollArea className="h-[300px]">
                    <div className="space-y-3 pr-4">
                      {Object.entries(getWidgetsByType()).map(([category, widgets]) => (
                        <div key={category}>
                          <h4 className="text-xs font-semibold text-muted-foreground mb-2 flex items-center gap-2">
                            <span className="flex-1 border-b border-border"></span>
                            {category}
                            <span className="flex-1 border-b border-border"></span>
                          </h4>
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
                                  className={cn(
                                    "justify-start text-xs h-9 transition-all",
                                    !isAdded && "hover:border-primary hover:bg-primary/5"
                                  )}
                                >
                                  {isAdded ? (
                                    <Eye size={14} className="mr-2" />
                                  ) : (
                                    <Plus size={14} className="mr-2" />
                                  )}
                                  {getWidgetTitle(type)}
                                </Button>
                              )
                            })}
                          </div>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="layout" className="flex-1 overflow-y-auto space-y-4 mt-4">
              <ScrollArea className="h-[600px]">
                <div className="space-y-6 pr-4">
                  <div>
                    <Label className="text-sm font-semibold mb-2 block">Dashboard Columns</Label>
                    <p className="text-xs text-muted-foreground mb-3">
                      Choose how many columns to display widgets in
                    </p>
                    <div className="grid grid-cols-4 gap-3">
                      {[1, 2, 3, 4].map(num => (
                        <Button
                          key={num}
                          variant={tempLayout?.columns === num ? 'default' : 'outline'}
                          onClick={() => handleChangeColumns(num as 1 | 2 | 3 | 4)}
                          className="h-24 flex flex-col items-center justify-center gap-2 transition-all hover:scale-105"
                        >
                          <GridFour size={28} />
                          <span className="text-xs font-medium">{num} Column{num > 1 ? 's' : ''}</span>
                        </Button>
                      ))}
                    </div>
                  </div>

                  <div className="pt-4 border-t">
                    <Label className="text-sm font-semibold mb-2 block">Layout Preview</Label>
                    <p className="text-xs text-muted-foreground mb-3">
                      Preview your dashboard layout
                    </p>
                    <div className={cn(
                      "grid gap-3 p-4 bg-muted/30 rounded-lg border",
                      tempLayout?.columns === 1 && "grid-cols-1",
                      tempLayout?.columns === 2 && "grid-cols-2",
                      tempLayout?.columns === 3 && "grid-cols-3",
                      tempLayout?.columns === 4 && "grid-cols-4"
                    )}>
                      {tempLayout?.widgets.filter(w => w.isVisible).map((widget) => (
                        <div
                          key={widget.id}
                          className={cn(
                            "bg-card border rounded-md p-3 flex items-center justify-center text-xs font-medium text-center min-h-[60px]",
                            widget.size === 'small' && "col-span-1",
                            widget.size === 'medium' && tempLayout.columns > 1 ? "col-span-1" : "col-span-1",
                            widget.size === 'large' && tempLayout.columns > 2 ? "col-span-2" : "col-span-1",
                            widget.size === 'full' && `col-span-${tempLayout.columns}`
                          )}
                        >
                          {widget.title}
                        </div>
                      ))}
                    </div>
                  </div>

                  {rolePresets && (
                    <div className="pt-4 border-t">
                      <Label className="text-sm font-semibold mb-2 block">Role-Based Recommendations</Label>
                      <div className="flex items-start gap-3 p-4 bg-gradient-to-br from-primary/10 via-accent/10 to-secondary/10 rounded-lg border border-primary/20">
                        <Sparkle size={24} className="text-primary mt-0.5 shrink-0" />
                        <div className="flex-1 min-w-0">
                          <h4 className="text-sm font-semibold mb-1">{rolePresets.name}</h4>
                          <p className="text-xs text-muted-foreground mb-3">
                            {rolePresets.description}
                          </p>
                          <div className="space-y-2">
                            <div>
                              <p className="text-xs font-medium mb-1">Recommended Widgets:</p>
                              <div className="flex flex-wrap gap-1">
                                {rolePresets.recommendedWidgets.map(type => {
                                  const isAdded = tempLayout?.widgets.some(w => w.type === type)
                                  return (
                                    <Badge
                                      key={type}
                                      variant={isAdded ? 'default' : 'outline'}
                                      className="text-xs cursor-pointer hover:bg-primary hover:text-primary-foreground transition-colors"
                                      onClick={() => !isAdded && handleAddWidget(type)}
                                    >
                                      {isAdded ? '✓ ' : '+ '}
                                      {getWidgetTitle(type)}
                                    </Badge>
                                  )
                                })}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="pt-4 border-t">
                    <Label className="text-sm font-semibold mb-2 block">Layout Statistics</Label>
                    <div className="grid grid-cols-3 gap-3">
                      <Card className="p-3 text-center">
                        <p className="text-2xl font-bold text-primary">{tempLayout?.widgets.length || 0}</p>
                        <p className="text-xs text-muted-foreground">Total Widgets</p>
                      </Card>
                      <Card className="p-3 text-center">
                        <p className="text-2xl font-bold text-success">{tempLayout?.widgets.filter(w => w.isVisible).length || 0}</p>
                        <p className="text-xs text-muted-foreground">Visible</p>
                      </Card>
                      <Card className="p-3 text-center">
                        <p className="text-2xl font-bold text-muted-foreground">{tempLayout?.widgets.filter(w => !w.isVisible).length || 0}</p>
                        <p className="text-xs text-muted-foreground">Hidden</p>
                      </Card>
                    </div>
                  </div>
                </div>
              </ScrollArea>
            </TabsContent>
          </Tabs>

          <DialogFooter className="flex flex-col sm:flex-row items-center justify-between gap-3 px-6 py-4 border-t shrink-0">
            <div className="flex items-center gap-2 flex-wrap">
              <Badge variant="outline" className="text-xs">
                {tempLayout?.widgets.filter(w => w.isVisible).length || 0} active widgets
              </Badge>
              <Badge variant="outline" className="text-xs">
                {tempLayout?.columns || 2} columns
              </Badge>
              <Badge variant="outline" className="text-xs">
                Last updated: {tempLayout ? new Date(tempLayout.updatedAt).toLocaleDateString() : 'N/A'}
              </Badge>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" onClick={() => setDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleSaveLayout} className="shine-effect gap-2">
                <FloppyDisk size={18} />
                Save Layout
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
