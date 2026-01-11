import { useState, useRef } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { toast } from 'sonner'
import {
  Plus,
  Trash,
  FloppyDisk,
  Eye,
  Download,
  ChartBar,
  ChartLine,
  ChartPie,
  ChartScatter,
  Table,
  ArrowsClockwise,
  X,
  DotsSixVertical,
  CalendarBlank,
  FunnelSimple,
  SortAscending,
  SquaresFour,
  CurrencyDollar,
  Users,
  Bed,
  Package,
  Receipt,
  TrendUp,
  Percent,
  Hash,
  ListNumbers,
  ArrowUp,
  ArrowDown,
  Equals,
  FileText,
  Copy
} from '@phosphor-icons/react'
import type { 
  CustomReport,
  ReportMetric,
  ReportDimension,
  ReportFilter,
  ReportVisualization,
  ChartType
} from '@/lib/reportBuilderTypes'
import { 
  availableMetrics, 
  availableDimensions,
  getChartTypesForMetric,
  validateReportConfiguration,
  generateReportPreview,
  exportReport
} from '@/lib/reportBuilderHelpers'

interface CustomReportBuilderProps {
  onClose?: () => void
  existingReport?: CustomReport
  onSave?: (report: CustomReport) => void
}

export function CustomReportBuilder({ onClose, existingReport, onSave }: CustomReportBuilderProps) {
  const [reportName, setReportName] = useState(existingReport?.name || '')
  const [reportDescription, setReportDescription] = useState(existingReport?.description || '')
  const [selectedMetrics, setSelectedMetrics] = useState<ReportMetric[]>(existingReport?.metrics || [])
  const [selectedDimensions, setSelectedDimensions] = useState<ReportDimension[]>(existingReport?.dimensions || [])
  const [filters, setFilters] = useState<ReportFilter[]>(existingReport?.filters || [])
  const [visualizations, setVisualizations] = useState<ReportVisualization[]>(existingReport?.visualizations || [])
  const [previewMode, setPreviewMode] = useState(false)
  const [draggedItem, setDraggedItem] = useState<{ type: 'metric' | 'dimension', item: ReportMetric | ReportDimension } | null>(null)
  const [saveDialogOpen, setSaveDialogOpen] = useState(false)

  const dropZoneRef = useRef<HTMLDivElement>(null)

  const handleDragStart = (type: 'metric' | 'dimension', item: ReportMetric | ReportDimension) => {
    setDraggedItem({ type, item })
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    e.currentTarget.classList.add('bg-primary/10', 'border-primary')
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.currentTarget.classList.remove('bg-primary/10', 'border-primary')
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.currentTarget.classList.remove('bg-primary/10', 'border-primary')
    
    if (!draggedItem) return

    if (draggedItem.type === 'metric') {
      const metric = draggedItem.item as ReportMetric
      if (!selectedMetrics.find(m => m.id === metric.id)) {
        setSelectedMetrics((prev) => [...prev, metric])
        toast.success(`Added metric: ${metric.name}`)
      }
    } else {
      const dimension = draggedItem.item as ReportDimension
      if (!selectedDimensions.find(d => d.id === dimension.id)) {
        setSelectedDimensions((prev) => [...prev, dimension])
        toast.success(`Added dimension: ${dimension.name}`)
      }
    }
    setDraggedItem(null)
  }

  const handleRemoveMetric = (metricId: string) => {
    setSelectedMetrics((prev) => prev.filter(m => m.id !== metricId))
    setVisualizations((prev) => prev.filter(v => v.metricId !== metricId))
  }

  const handleRemoveDimension = (dimensionId: string) => {
    setSelectedDimensions((prev) => prev.filter(d => d.id !== dimensionId))
  }

  const handleAddFilter = () => {
    if (selectedDimensions.length === 0) {
      toast.error('Please add at least one dimension before adding filters')
      return
    }
    
    const newFilter: ReportFilter = {
      id: `filter-${Date.now()}`,
      field: selectedDimensions[0].id,
      operator: 'equals',
      value: '',
      dimensionId: selectedDimensions[0].id
    }
    setFilters((prev) => [...prev, newFilter])
  }

  const handleUpdateFilter = (filterId: string, updates: Partial<ReportFilter>) => {
    setFilters((prev) => prev.map(f => f.id === filterId ? { ...f, ...updates } : f))
  }

  const handleRemoveFilter = (filterId: string) => {
    setFilters((prev) => prev.filter(f => f.id !== filterId))
  }

  const handleAddVisualization = (metricId: string, chartType: ChartType) => {
    const metric = selectedMetrics.find(m => m.id === metricId)
    if (!metric) return

    const newViz: ReportVisualization = {
      id: `viz-${Date.now()}`,
      metricId,
      chartType,
      title: `${metric.name} - ${chartType}`,
      dimensionId: selectedDimensions[0]?.id,
      settings: {
        showLegend: true,
        showGrid: true,
        showLabels: true,
        colorScheme: 'default'
      }
    }
    setVisualizations((prev) => [...prev, newViz])
    toast.success('Visualization added')
  }

  const handleRemoveVisualization = (vizId: string) => {
    setVisualizations((prev) => prev.filter(v => v.id !== vizId))
  }

  const handleSaveReport = () => {
    const validation = validateReportConfiguration({
      name: reportName,
      metrics: selectedMetrics,
      dimensions: selectedDimensions
    })

    if (!validation.isValid) {
      toast.error(validation.error || 'Invalid report configuration')
      return
    }

    const report: CustomReport = {
      id: existingReport?.id || `report-${Date.now()}`,
      name: reportName,
      description: reportDescription,
      metrics: selectedMetrics,
      dimensions: selectedDimensions,
      filters,
      visualizations,
      createdAt: existingReport?.createdAt || Date.now(),
      updatedAt: Date.now(),
      createdBy: 'current-user',
      isScheduled: false
    }

    onSave?.(report)
    toast.success('Report saved successfully')
    setSaveDialogOpen(false)
  }

  const handlePreview = () => {
    const validation = validateReportConfiguration({
      name: reportName,
      metrics: selectedMetrics,
      dimensions: selectedDimensions
    })

    if (!validation.isValid) {
      toast.error(validation.error || 'Cannot preview - invalid configuration')
      return
    }

    setPreviewMode(true)
  }

  const handleExport = (format: 'pdf' | 'excel' | 'csv') => {
    const report: CustomReport = {
      id: `export-${Date.now()}`,
      name: reportName,
      description: reportDescription,
      metrics: selectedMetrics,
      dimensions: selectedDimensions,
      filters,
      visualizations,
      createdAt: Date.now(),
      updatedAt: Date.now(),
      createdBy: 'current-user',
      isScheduled: false
    }

    exportReport(report, format)
    toast.success(`Report exported as ${format.toUpperCase()}`)
  }

  const handleDuplicateReport = () => {
    const duplicatedReport: CustomReport = {
      id: `report-${Date.now()}`,
      name: `${reportName} (Copy)`,
      description: reportDescription,
      metrics: [...selectedMetrics],
      dimensions: [...selectedDimensions],
      filters: [...filters],
      visualizations: [...visualizations],
      createdAt: Date.now(),
      updatedAt: Date.now(),
      createdBy: 'current-user',
      isScheduled: false
    }

    onSave?.(duplicatedReport)
    toast.success('Report duplicated')
  }

  const getMetricIcon = (category: string) => {
    switch (category) {
      case 'revenue': return <CurrencyDollar size={16} />
      case 'occupancy': return <Bed size={16} />
      case 'guest': return <Users size={16} />
      case 'inventory': return <Package size={16} />
      case 'financial': return <Receipt size={16} />
      default: return <Hash size={16} />
    }
  }

  const getChartIcon = (chartType: ChartType) => {
    switch (chartType) {
      case 'line': return <ChartLine size={16} />
      case 'bar': return <ChartBar size={16} />
      case 'pie': return <ChartPie size={16} />
      case 'scatter': return <ChartScatter size={16} />
      case 'table': return <Table size={16} />
      default: return <ChartBar size={16} />
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <Input
              placeholder="Report Name"
              value={reportName}
              onChange={(e) => setReportName(e.target.value)}
              className="text-2xl font-semibold h-auto border-0 px-0 focus-visible:ring-0"
            />
          </div>
          <Input
            placeholder="Report description (optional)"
            value={reportDescription}
            onChange={(e) => setReportDescription(e.target.value)}
            className="text-muted-foreground border-0 px-0 focus-visible:ring-0"
          />
        </div>
        <div className="flex items-center gap-2">
          {existingReport && (
            <Button variant="outline" onClick={handleDuplicateReport}>
              <Copy size={20} className="mr-2" />
              Duplicate
            </Button>
          )}
          <Button variant="outline" onClick={handlePreview}>
            <Eye size={20} className="mr-2" />
            Preview
          </Button>
          <Dialog open={saveDialogOpen} onOpenChange={setSaveDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <FloppyDisk size={20} className="mr-2" />
                Save Report
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Save Custom Report</DialogTitle>
                <DialogDescription>
                  Save this report configuration to run it anytime or schedule it for automatic generation.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label>Report Name</Label>
                  <Input
                    value={reportName}
                    onChange={(e) => setReportName(e.target.value)}
                    placeholder="Enter report name"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Description</Label>
                  <Input
                    value={reportDescription}
                    onChange={(e) => setReportDescription(e.target.value)}
                    placeholder="Enter description"
                  />
                </div>
                <div className="p-4 bg-muted rounded-lg space-y-2">
                  <p className="text-sm font-medium">Report Summary:</p>
                  <div className="text-sm text-muted-foreground space-y-1">
                    <p>• {selectedMetrics.length} metrics selected</p>
                    <p>• {selectedDimensions.length} dimensions selected</p>
                    <p>• {filters.length} filters applied</p>
                    <p>• {visualizations.length} visualizations configured</p>
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setSaveDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleSaveReport}>
                  <FloppyDisk size={20} className="mr-2" />
                  Save Report
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
          {onClose && (
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X size={20} />
            </Button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 space-y-6">
          <Card className="p-4">
            <Tabs defaultValue="metrics" className="space-y-4">
              <TabsList className="w-full">
                <TabsTrigger value="metrics" className="flex-1">
                  <Hash size={16} className="mr-2" />
                  Metrics
                </TabsTrigger>
                <TabsTrigger value="dimensions" className="flex-1">
                  <SquaresFour size={16} className="mr-2" />
                  Dimensions
                </TabsTrigger>
              </TabsList>

              <TabsContent value="metrics" className="space-y-3">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm font-medium">Available Metrics</p>
                  <Badge variant="secondary">{availableMetrics.length}</Badge>
                </div>
                <ScrollArea className="h-[500px] pr-4">
                  <div className="space-y-2">
                    {availableMetrics.map((metric) => (
                      <div
                        key={metric.id}
                        draggable
                        onDragStart={() => handleDragStart('metric', metric)}
                        className="p-3 border rounded-lg cursor-move hover:bg-accent transition-colors"
                      >
                        <div className="flex items-start gap-2">
                          <div className="p-1.5 bg-primary/10 rounded text-primary mt-0.5">
                            {getMetricIcon(metric.category)}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <p className="text-sm font-medium">{metric.name}</p>
                              <DotsSixVertical size={14} className="text-muted-foreground" />
                            </div>
                            <p className="text-xs text-muted-foreground line-clamp-2">
                              {metric.description}
                            </p>
                            <div className="flex items-center gap-2 mt-2">
                              <Badge variant="outline" className="text-xs">
                                {metric.aggregation}
                              </Badge>
                              <Badge variant="secondary" className="text-xs">
                                {metric.category}
                              </Badge>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </TabsContent>

              <TabsContent value="dimensions" className="space-y-3">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm font-medium">Available Dimensions</p>
                  <Badge variant="secondary">{availableDimensions.length}</Badge>
                </div>
                <ScrollArea className="h-[500px] pr-4">
                  <div className="space-y-2">
                    {availableDimensions.map((dimension) => (
                      <div
                        key={dimension.id}
                        draggable
                        onDragStart={() => handleDragStart('dimension', dimension)}
                        className="p-3 border rounded-lg cursor-move hover:bg-accent transition-colors"
                      >
                        <div className="flex items-start gap-2">
                          <div className="p-1.5 bg-secondary/10 rounded text-secondary mt-0.5">
                            <SquaresFour size={16} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <p className="text-sm font-medium">{dimension.name}</p>
                              <DotsSixVertical size={14} className="text-muted-foreground" />
                            </div>
                            <p className="text-xs text-muted-foreground line-clamp-2">
                              {dimension.description}
                            </p>
                            <div className="flex items-center gap-2 mt-2">
                              <Badge variant="outline" className="text-xs">
                                {dimension.dataType}
                              </Badge>
                              <Badge variant="secondary" className="text-xs">
                                {dimension.category}
                              </Badge>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </TabsContent>
            </Tabs>
          </Card>
        </div>

        <div className="lg:col-span-2 space-y-6">
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Report Configuration</h3>
            
            <div className="space-y-6">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <Label className="text-base">Selected Metrics</Label>
                  <Badge>{selectedMetrics.length}</Badge>
                </div>
                <div
                  ref={dropZoneRef}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  className="min-h-[120px] p-4 border-2 border-dashed rounded-lg transition-colors"
                >
                  {selectedMetrics.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      <Hash size={32} className="mx-auto mb-2 opacity-50" />
                      <p className="text-sm">Drag and drop metrics here</p>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {selectedMetrics.map((metric) => (
                        <div key={metric.id} className="flex items-center gap-3 p-3 bg-primary/5 border border-primary/20 rounded-lg">
                          <div className="p-2 bg-primary/10 rounded text-primary">
                            {getMetricIcon(metric.category)}
                          </div>
                          <div className="flex-1">
                            <p className="font-medium text-sm">{metric.name}</p>
                            <p className="text-xs text-muted-foreground">{metric.aggregation}</p>
                          </div>
                          <div className="flex items-center gap-1">
                            <Select 
                              onValueChange={(chartType) => handleAddVisualization(metric.id, chartType as ChartType)}
                            >
                              <SelectTrigger className="w-[140px] h-8">
                                <SelectValue placeholder="Add chart" />
                              </SelectTrigger>
                              <SelectContent>
                                {getChartTypesForMetric(metric.aggregation).map((type) => (
                                  <SelectItem key={type} value={type}>
                                    <div className="flex items-center gap-2">
                                      {getChartIcon(type)}
                                      <span className="capitalize">{type}</span>
                                    </div>
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleRemoveMetric(metric.id)}
                            >
                              <Trash size={16} className="text-destructive" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <Separator />

              <div>
                <div className="flex items-center justify-between mb-3">
                  <Label className="text-base">Selected Dimensions</Label>
                  <Badge>{selectedDimensions.length}</Badge>
                </div>
                <div
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  className="min-h-[100px] p-4 border-2 border-dashed rounded-lg transition-colors"
                >
                  {selectedDimensions.length === 0 ? (
                    <div className="text-center py-6 text-muted-foreground">
                      <SquaresFour size={32} className="mx-auto mb-2 opacity-50" />
                      <p className="text-sm">Drag and drop dimensions here</p>
                    </div>
                  ) : (
                    <div className="flex flex-wrap gap-2">
                      {selectedDimensions.map((dimension) => (
                        <div
                          key={dimension.id}
                          className="flex items-center gap-2 px-3 py-2 bg-secondary/10 border border-secondary/20 rounded-lg"
                        >
                          <SquaresFour size={16} className="text-secondary" />
                          <span className="text-sm font-medium">{dimension.name}</span>
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-auto p-0 hover:bg-transparent"
                            onClick={() => handleRemoveDimension(dimension.id)}
                          >
                            <X size={14} className="text-muted-foreground hover:text-destructive" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <Separator />

              <div>
                <div className="flex items-center justify-between mb-3">
                  <Label className="text-base">Filters</Label>
                  <Button size="sm" variant="outline" onClick={handleAddFilter}>
                    <Plus size={16} className="mr-2" />
                    Add Filter
                  </Button>
                </div>
                {filters.length === 0 ? (
                  <div className="text-center py-6 border-2 border-dashed rounded-lg text-muted-foreground">
                    <FunnelSimple size={32} className="mx-auto mb-2 opacity-50" />
                    <p className="text-sm">No filters applied</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {filters.map((filter) => (
                      <div key={filter.id} className="flex items-center gap-2 p-3 border rounded-lg">
                        <Select
                          value={filter.dimensionId}
                          onValueChange={(value) => handleUpdateFilter(filter.id, { dimensionId: value })}
                        >
                          <SelectTrigger className="flex-1">
                            <SelectValue placeholder="Select dimension" />
                          </SelectTrigger>
                          <SelectContent>
                            {selectedDimensions.map((dim) => (
                              <SelectItem key={dim.id} value={dim.id}>
                                {dim.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <Select
                          value={filter.operator}
                          onValueChange={(value) => handleUpdateFilter(filter.id, { operator: value as any })}
                        >
                          <SelectTrigger className="w-[120px]">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="equals">Equals</SelectItem>
                            <SelectItem value="not_equals">Not Equals</SelectItem>
                            <SelectItem value="greater_than">Greater Than</SelectItem>
                            <SelectItem value="less_than">Less Than</SelectItem>
                            <SelectItem value="contains">Contains</SelectItem>
                          </SelectContent>
                        </Select>
                        <Input
                          value={String(filter.value)}
                          onChange={(e) => handleUpdateFilter(filter.id, { value: e.target.value })}
                          placeholder="Value"
                          className="flex-1"
                        />
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleRemoveFilter(filter.id)}
                        >
                          <Trash size={16} className="text-destructive" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <Separator />

              <div>
                <div className="flex items-center justify-between mb-3">
                  <Label className="text-base">Visualizations</Label>
                  <Badge>{visualizations.length}</Badge>
                </div>
                {visualizations.length === 0 ? (
                  <div className="text-center py-6 border-2 border-dashed rounded-lg text-muted-foreground">
                    <ChartBar size={32} className="mx-auto mb-2 opacity-50" />
                    <p className="text-sm">Add charts from the metrics above</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {visualizations.map((viz) => {
                      const metric = selectedMetrics.find(m => m.id === viz.metricId)
                      return (
                        <div key={viz.id} className="p-4 border rounded-lg bg-accent/5">
                          <div className="flex items-start justify-between mb-2">
                            <div className="flex items-center gap-2">
                              {getChartIcon(viz.chartType)}
                              <p className="font-medium text-sm capitalize">{viz.chartType}</p>
                            </div>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleRemoveVisualization(viz.id)}
                            >
                              <Trash size={14} className="text-destructive" />
                            </Button>
                          </div>
                          <p className="text-xs text-muted-foreground">{metric?.name}</p>
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>
            </div>
          </Card>

          <Card className="p-6 bg-muted/50">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold mb-1">Export Options</h3>
                <p className="text-sm text-muted-foreground">
                  Download your custom report in various formats
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  onClick={() => handleExport('pdf')}
                  disabled={selectedMetrics.length === 0}
                >
                  <Download size={20} className="mr-2" />
                  PDF
                </Button>
                <Button
                  variant="outline"
                  onClick={() => handleExport('excel')}
                  disabled={selectedMetrics.length === 0}
                >
                  <Download size={20} className="mr-2" />
                  Excel
                </Button>
                <Button
                  variant="outline"
                  onClick={() => handleExport('csv')}
                  disabled={selectedMetrics.length === 0}
                >
                  <Download size={20} className="mr-2" />
                  CSV
                </Button>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}
