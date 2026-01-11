import { useState, useMemo } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { toast } from 'sonner'
import {
  X,
  Download,
  Printer,
  FloppyDisk,
  ArrowsClockwise,
  SquaresFour,
  Trash,
  Plus,
  DotsSixVertical,
  Eye,
  FilePdf,
  FileXls,
  FileCsv
} from '@phosphor-icons/react'
import type { 
  ReportTemplate, 
  ReportTemplateLayout,
  ReportTemplateSection,
  ReportPreviewData 
} from '@/lib/reportTemplateTypes'
import { reportTemplateMetrics, getMetricById, getMetricCategoryColor } from '@/lib/reportTemplateMetrics'
import { formatCurrency, formatPercent, formatDate } from '@/lib/helpers'
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'

interface ReportTemplatePreviewProps {
  template: ReportTemplate
  onClose: () => void
  onSave?: (template: ReportTemplate) => void
  previewData?: ReportPreviewData
  isEditable?: boolean
}

const COLORS = ['#8b5cf6', '#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#ec4899', '#06b6d4', '#84cc16']

export function ReportTemplatePreview({
  template: initialTemplate,
  onClose,
  onSave,
  previewData,
  isEditable = false
}: ReportTemplatePreviewProps) {
  const [template, setTemplate] = useState<ReportTemplate>(initialTemplate)
  const [layout, setLayout] = useState<ReportTemplateLayout>(template.layout)
  const [sections, setSections] = useState<ReportTemplateSection[]>(template.sections)
  const [selectedSection, setSelectedSection] = useState<string | null>(null)
  const [draggedMetric, setDraggedMetric] = useState<string | null>(null)

  const handleLayoutChange = (newLayout: ReportTemplateLayout) => {
    setLayout(newLayout)
    setTemplate({ ...template, layout: newLayout })
  }

  const handleDragStart = (metricId: string) => {
    setDraggedMetric(metricId)
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    e.currentTarget.classList.add('ring-2', 'ring-primary')
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.currentTarget.classList.remove('ring-2', 'ring-primary')
  }

  const handleDrop = (e: React.DragEvent, sectionId: string) => {
    e.preventDefault()
    e.currentTarget.classList.remove('ring-2', 'ring-primary')

    if (!draggedMetric || !isEditable) return

    setSections((prevSections) =>
      prevSections.map((section) => {
        if (section.id === sectionId) {
          if (!section.metrics.includes(draggedMetric)) {
            return { ...section, metrics: [...section.metrics, draggedMetric] }
          }
        }
        return section
      })
    )

    setDraggedMetric(null)
    toast.success('Metric added to section')
  }

  const handleRemoveMetric = (sectionId: string, metricId: string) => {
    setSections((prevSections) =>
      prevSections.map((section) => {
        if (section.id === sectionId) {
          return { ...section, metrics: section.metrics.filter(m => m !== metricId) }
        }
        return section
      })
    )
    toast.info('Metric removed')
  }

  const handleAddSection = () => {
    const newSection: ReportTemplateSection = {
      id: `section-${Date.now()}`,
      title: `New Section ${sections.length + 1}`,
      metrics: [],
      position: sections.length,
      columnSpan: 1,
      chartType: 'none'
    }
    setSections([...sections, newSection])
  }

  const handleRemoveSection = (sectionId: string) => {
    setSections(sections.filter(s => s.id !== sectionId))
  }

  const handleUpdateSection = (sectionId: string, updates: Partial<ReportTemplateSection>) => {
    setSections((prevSections) =>
      prevSections.map((section) =>
        section.id === sectionId ? { ...section, ...updates } : section
      )
    )
  }

  const handleSaveTemplate = () => {
    const updatedTemplate = {
      ...template,
      layout,
      sections,
      updatedAt: Date.now()
    }
    onSave?.(updatedTemplate)
    toast.success('Report template saved')
  }

  const handleExport = (format: 'pdf' | 'excel' | 'csv') => {
    toast.success(`Exporting report as ${format.toUpperCase()}`)
  }

  const getMetricValue = (metricId: string): number | string => {
    if (previewData?.metricValues[metricId] !== undefined) {
      return previewData.metricValues[metricId]
    }
    
    const metric = getMetricById(metricId)
    if (!metric) return 0
    
    switch (metric.format) {
      case 'currency':
        return Math.floor(Math.random() * 100000)
      case 'percentage':
        return Math.floor(Math.random() * 100)
      case 'number':
        return Math.floor(Math.random() * 1000)
      case 'decimal':
        return (Math.random() * 10).toFixed(2)
      default:
        return 0
    }
  }

  const formatMetricValue = (metricId: string, value: number | string): string => {
    const metric = getMetricById(metricId)
    if (!metric) return String(value)

    if (typeof value === 'string') return value

    switch (metric.format) {
      case 'currency':
        return formatCurrency(value)
      case 'percentage':
        return formatPercent(value / 100)
      case 'decimal':
        return value.toFixed(2)
      default:
        return String(value)
    }
  }

  const generateChartData = (sectionId: string): any[] => {
    const mockData: any[] = []
    const categories = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
    
    for (let i = 0; i < 7; i++) {
      const dataPoint: any = { name: categories[i] }
      const section = sections.find(s => s.id === sectionId)
      section?.metrics.forEach((metricId) => {
        const metric = getMetricById(metricId)
        if (metric) {
          dataPoint[metric.name] = Math.floor(Math.random() * 10000)
        }
      })
      mockData.push(dataPoint)
    }
    
    return mockData
  }

  const renderChart = (section: ReportTemplateSection) => {
    if (!section.chartType || section.chartType === 'none') return null

    const chartData = generateChartData(section.id)
    const metrics = section.metrics.map(m => getMetricById(m)).filter(Boolean)

    switch (section.chartType) {
      case 'line':
        return (
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              {metrics.map((metric, idx) => {
                if (!metric?.name) return null
                return (
                  <Line
                    key={metric.id}
                    type="monotone"
                    dataKey={metric.name}
                    stroke={COLORS[idx % COLORS.length]}
                    strokeWidth={2}
                  />
                )
              })}
            </LineChart>
          </ResponsiveContainer>
        )

      case 'bar':
        return (
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              {metrics.map((metric, idx) => {
                if (!metric?.name) return null
                return (
                  <Bar
                    key={metric.id}
                    dataKey={metric.name}
                    fill={COLORS[idx % COLORS.length]}
                  />
                )
              })}
            </BarChart>
          </ResponsiveContainer>
        )

      case 'area':
        return (
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              {metrics.map((metric, idx) => {
                if (!metric?.name) return null
                return (
                  <Area
                    key={metric.id}
                    type="monotone"
                    dataKey={metric.name}
                    stroke={COLORS[idx % COLORS.length]}
                    fill={COLORS[idx % COLORS.length]}
                    fillOpacity={0.6}
                  />
                )
              })}
            </AreaChart>
          </ResponsiveContainer>
        )

      case 'pie':
        const pieData = metrics.map((metric, idx) => ({
          name: metric?.name || '',
          value: Math.floor(Math.random() * 10000)
        }))
        
        return (
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={pieData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={(entry) => `${entry.name}: ${formatCurrency(entry.value)}`}
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
              >
                {pieData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        )

      default:
        return null
    }
  }

  const getColumnClass = () => {
    switch (layout) {
      case '1-column':
        return 'grid-cols-1'
      case '2-column':
        return 'grid-cols-1 md:grid-cols-2'
      case '3-column':
        return 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3'
      default:
        return 'grid-cols-1'
    }
  }

  const availableMetrics = template.availableMetrics
    .map(id => getMetricById(id))
    .filter(Boolean)

  const usedMetricIds = new Set(sections.flatMap(s => s.metrics))

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-[98vw] max-h-[98vh] p-0 overflow-hidden">
        <div className="flex flex-col h-[98vh]">
          <DialogHeader className="p-6 border-b">
            <div className="flex items-center justify-between">
              <div>
                <DialogTitle className="text-2xl font-semibold">{template.name}</DialogTitle>
                <p className="text-sm text-muted-foreground mt-1">{template.description}</p>
              </div>
              <div className="flex items-center gap-2">
                {isEditable && (
                  <>
                    <Button variant="outline" size="sm" onClick={handleAddSection}>
                      <Plus size={18} className="mr-2" />
                      Add Section
                    </Button>
                    <Button variant="outline" size="sm" onClick={handleSaveTemplate}>
                      <FloppyDisk size={18} className="mr-2" />
                      Save
                    </Button>
                  </>
                )}
                <Button variant="outline" size="sm" onClick={() => handleExport('pdf')}>
                  <FilePdf size={18} className="mr-2 text-red-500" />
                  PDF
                </Button>
                <Button variant="outline" size="sm" onClick={() => handleExport('excel')}>
                  <FileXls size={18} className="mr-2 text-green-500" />
                  Excel
                </Button>
                <Button variant="outline" size="sm" onClick={() => handleExport('csv')}>
                  <FileCsv size={18} className="mr-2 text-blue-500" />
                  CSV
                </Button>
                <Button variant="ghost" size="icon" onClick={onClose}>
                  <X size={20} />
                </Button>
              </div>
            </div>
          </DialogHeader>

          <div className="flex-1 flex overflow-hidden">
            {isEditable && (
              <div className="w-80 border-r overflow-y-auto">
                <div className="p-4 space-y-6">
                  <div>
                    <Label className="text-sm font-semibold mb-3 block">Layout</Label>
                    <Select value={layout} onValueChange={(v) => handleLayoutChange(v as ReportTemplateLayout)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1-column">1 Column</SelectItem>
                        <SelectItem value="2-column">2 Columns</SelectItem>
                        <SelectItem value="3-column">3 Columns</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <Separator />

                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <Label className="text-sm font-semibold">Available Metrics</Label>
                      <Badge variant="secondary">{availableMetrics.length}</Badge>
                    </div>
                    <ScrollArea className="h-[calc(100vh-300px)]">
                      <div className="space-y-2 pr-4">
                        {availableMetrics.map((metric) => {
                          if (!metric) return null
                          const isUsed = usedMetricIds.has(metric.id)
                          
                          return (
                            <div
                              key={metric.id}
                              draggable={!isUsed}
                              onDragStart={() => handleDragStart(metric.id)}
                              className={`p-3 border rounded-lg transition-all ${
                                isUsed 
                                  ? 'opacity-50 cursor-not-allowed' 
                                  : 'cursor-move hover:bg-accent hover:border-primary'
                              }`}
                            >
                              <div className="flex items-start gap-2">
                                <DotsSixVertical size={16} className="mt-1 text-muted-foreground" />
                                <div className="flex-1 min-w-0">
                                  <p className="text-sm font-medium truncate">{metric.name}</p>
                                  <p className="text-xs text-muted-foreground line-clamp-2">
                                    {metric.description}
                                  </p>
                                  <div className="flex items-center gap-2 mt-2">
                                    <div className={`w-2 h-2 rounded-full ${getMetricCategoryColor(metric.category)}`} />
                                    <Badge variant="outline" className="text-xs">
                                      {metric.aggregation}
                                    </Badge>
                                  </div>
                                </div>
                              </div>
                            </div>
                          )
                        })}
                      </div>
                    </ScrollArea>
                  </div>
                </div>
              </div>
            )}

            <div className="flex-1 overflow-y-auto bg-muted/10 p-6">
              <Card className="max-w-7xl mx-auto bg-background">
                <div className="p-8">
                  <div className="flex items-start justify-between mb-6">
                    <div>
                      <h1 className="text-3xl font-bold mb-2">{template.name}</h1>
                      <p className="text-muted-foreground">
                        Generated on {formatDate(previewData?.generatedAt || Date.now())}
                      </p>
                      {previewData?.dateRange && (
                        <p className="text-sm text-muted-foreground mt-1">
                          Period: {formatDate(previewData.dateRange.from)} - {formatDate(previewData.dateRange.to)}
                        </p>
                      )}
                    </div>
                    <Badge className="uppercase">{template.category}</Badge>
                  </div>

                  <Separator className="mb-6" />

                  <div className={`grid ${getColumnClass()} gap-6`}>
                    {sections
                      .sort((a, b) => a.position - b.position)
                      .map((section) => (
                        <div
                          key={section.id}
                          className={`${section.columnSpan > 1 ? `md:col-span-${section.columnSpan}` : ''}`}
                          onDragOver={handleDragOver}
                          onDragLeave={handleDragLeave}
                          onDrop={(e) => handleDrop(e, section.id)}
                        >
                          <Card className="p-5">
                            <div className="flex items-center justify-between mb-4">
                              <h3 className="text-lg font-semibold">{section.title}</h3>
                              {isEditable && (
                                <div className="flex items-center gap-2">
                                  <Select
                                    value={section.chartType || 'none'}
                                    onValueChange={(v) => handleUpdateSection(section.id, { chartType: v as any })}
                                  >
                                    <SelectTrigger className="w-[120px] h-8">
                                      <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                      <SelectItem value="none">No Chart</SelectItem>
                                      <SelectItem value="line">Line</SelectItem>
                                      <SelectItem value="bar">Bar</SelectItem>
                                      <SelectItem value="area">Area</SelectItem>
                                      <SelectItem value="pie">Pie</SelectItem>
                                      <SelectItem value="table">Table</SelectItem>
                                    </SelectContent>
                                  </Select>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => handleRemoveSection(section.id)}
                                  >
                                    <Trash size={16} className="text-destructive" />
                                  </Button>
                                </div>
                              )}
                            </div>

                            {section.chartType && section.chartType !== 'none' && section.chartType !== 'table' && (
                              <div className="mb-6">
                                {renderChart(section)}
                              </div>
                            )}

                            <div className={`grid grid-cols-1 ${section.metrics.length > 2 ? 'md:grid-cols-2' : ''} gap-4`}>
                              {section.metrics.length === 0 ? (
                                <div className="col-span-full text-center py-8 text-muted-foreground border-2 border-dashed rounded-lg">
                                  <SquaresFour size={32} className="mx-auto mb-2 opacity-50" />
                                  <p className="text-sm">
                                    {isEditable ? 'Drag metrics here' : 'No metrics configured'}
                                  </p>
                                </div>
                              ) : (
                                section.metrics.map((metricId) => {
                                  const metric = getMetricById(metricId)
                                  if (!metric) return null

                                  const value = getMetricValue(metricId)
                                  const formattedValue = formatMetricValue(metricId, value)

                                  return (
                                    <div
                                      key={metricId}
                                      className="p-4 bg-muted/50 rounded-lg hover:bg-muted transition-colors"
                                    >
                                      <div className="flex items-start justify-between mb-2">
                                        <div className="flex items-center gap-2">
                                          <div className={`w-2 h-2 rounded-full ${getMetricCategoryColor(metric.category)}`} />
                                          <p className="text-sm font-medium text-muted-foreground">
                                            {metric.name}
                                          </p>
                                        </div>
                                        {isEditable && (
                                          <Button
                                            variant="ghost"
                                            size="icon"
                                            className="h-6 w-6"
                                            onClick={() => handleRemoveMetric(section.id, metricId)}
                                          >
                                            <X size={12} />
                                          </Button>
                                        )}
                                      </div>
                                      <p className="text-2xl font-bold">{formattedValue}</p>
                                    </div>
                                  )
                                })
                              )}
                            </div>

                            {section.chartType === 'table' && section.metrics.length > 0 && (
                              <div className="mt-4 overflow-x-auto">
                                <table className="w-full text-sm">
                                  <thead>
                                    <tr className="border-b">
                                      <th className="text-left p-2 font-semibold">Metric</th>
                                      <th className="text-right p-2 font-semibold">Value</th>
                                      <th className="text-right p-2 font-semibold">Category</th>
                                    </tr>
                                  </thead>
                                  <tbody>
                                    {section.metrics.map((metricId) => {
                                      const metric = getMetricById(metricId)
                                      if (!metric) return null

                                      const value = getMetricValue(metricId)
                                      const formattedValue = formatMetricValue(metricId, value)

                                      return (
                                        <tr key={metricId} className="border-b">
                                          <td className="p-2">{metric.name}</td>
                                          <td className="p-2 text-right font-semibold">{formattedValue}</td>
                                          <td className="p-2 text-right">
                                            <Badge variant="outline" className="text-xs">
                                              {metric.category}
                                            </Badge>
                                          </td>
                                        </tr>
                                      )
                                    })}
                                  </tbody>
                                </table>
                              </div>
                            )}
                          </Card>
                        </div>
                      ))}
                  </div>
                </div>
              </Card>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
