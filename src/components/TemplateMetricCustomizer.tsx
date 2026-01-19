import { useState } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { Checkbox } from '@/components/ui/checkbox'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { toast } from 'sonner'
import {
  Plus,
  Minus,
  DotsSixVertical,
  MagnifyingGlass,
  Funnel,
  Check,
  X,
  FloppyDisk,
  ArrowsClockwise,
  ListChecks
} from '@phosphor-icons/react'
import { BulkMetricSelector } from './BulkMetricSelector'
import type { ReportTemplate, ReportTemplateSection } from '@/lib/reportTemplateTypes'
import { reportTemplateMetrics, getMetricById, getMetricsByCategory, getMetricCategoryColor } from '@/lib/reportTemplateMetrics'

interface TemplateMetricCustomizerProps {
  template: ReportTemplate
  onSave: (template: ReportTemplate) => void
  onCancel: () => void
}

export function TemplateMetricCustomizer({
  template: initialTemplate,
  onSave,
  onCancel
}: TemplateMetricCustomizerProps) {
  const [template, setTemplate] = useState<ReportTemplate>(initialTemplate)
  const [sections, setSections] = useState<ReportTemplateSection[]>(initialTemplate.sections)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [selectedSection, setSelectedSection] = useState<string | null>(sections[0]?.id || null)
  const [draggedMetricId, setDraggedMetricId] = useState<string | null>(null)
  const [dragOverSectionId, setDragOverSectionId] = useState<string | null>(null)
  const [bulkSelectorOpen, setBulkSelectorOpen] = useState(false)

  const categories = [
    { id: 'all', name: 'All Categories', color: 'bg-muted' },
    { id: 'revenue', name: 'Revenue', color: 'bg-green-500' },
    { id: 'occupancy', name: 'Occupancy', color: 'bg-blue-500' },
    { id: 'guest', name: 'Guest', color: 'bg-purple-500' },
    { id: 'fnb', name: 'F&B', color: 'bg-orange-500' },
    { id: 'housekeeping', name: 'Housekeeping', color: 'bg-pink-500' },
    { id: 'inventory', name: 'Inventory', color: 'bg-amber-500' },
    { id: 'finance', name: 'Finance', color: 'bg-emerald-500' },
    { id: 'hr', name: 'HR', color: 'bg-indigo-500' },
    { id: 'operational', name: 'Operational', color: 'bg-cyan-500' }
  ]

  const filteredMetrics = reportTemplateMetrics.filter(metric => {
    const matchesSearch = searchQuery === '' || 
      metric.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      metric.description.toLowerCase().includes(searchQuery.toLowerCase())
    
    const matchesCategory = selectedCategory === 'all' || metric.category === selectedCategory

    return matchesSearch && matchesCategory
  })

  const getUsedMetrics = () => {
    return sections.flatMap(section => section.metrics)
  }

  const getAvailableMetrics = () => {
    const used = new Set(getUsedMetrics())
    return reportTemplateMetrics.filter(metric => !used.has(metric.id))
  }

  const handleAddMetric = (metricId: string, sectionId: string) => {
    setSections(prev => prev.map(section => {
      if (section.id === sectionId && !section.metrics.includes(metricId)) {
        return { ...section, metrics: [...section.metrics, metricId] }
      }
      return section
    }))
    toast.success('Metric added')
  }

  const handleRemoveMetric = (metricId: string, sectionId: string) => {
    setSections(prev => prev.map(section => {
      if (section.id === sectionId) {
        return { ...section, metrics: section.metrics.filter(id => id !== metricId) }
      }
      return section
    }))
    toast.success('Metric removed')
  }

  const handleMoveMetric = (metricId: string, fromSectionId: string, toSectionId: string) => {
    if (fromSectionId === toSectionId) return

    setSections(prev => prev.map(section => {
      if (section.id === fromSectionId) {
        return { ...section, metrics: section.metrics.filter(id => id !== metricId) }
      }
      if (section.id === toSectionId && !section.metrics.includes(metricId)) {
        return { ...section, metrics: [...section.metrics, metricId] }
      }
      return section
    }))
    toast.success('Metric moved')
  }

  const handleDragStart = (metricId: string) => {
    setDraggedMetricId(metricId)
  }

  const handleDragEnd = () => {
    setDraggedMetricId(null)
    setDragOverSectionId(null)
  }

  const handleDragOver = (e: React.DragEvent, sectionId: string) => {
    e.preventDefault()
    setDragOverSectionId(sectionId)
  }

  const handleDrop = (e: React.DragEvent, targetSectionId: string) => {
    e.preventDefault()
    
    if (!draggedMetricId) return

    const sourceSectionId = sections.find(s => s.metrics.includes(draggedMetricId))?.id
    
    if (sourceSectionId) {
      handleMoveMetric(draggedMetricId, sourceSectionId, targetSectionId)
    } else {
      handleAddMetric(draggedMetricId, targetSectionId)
    }

    setDraggedMetricId(null)
    setDragOverSectionId(null)
  }

  const handleReorderMetric = (sectionId: string, metricId: string, direction: 'up' | 'down') => {
    setSections(prev => {
      return prev.map(section => {
        if (section.id === sectionId) {
          const currentIndex = section.metrics.indexOf(metricId)
          if (currentIndex === -1) return section

          const newMetrics = [...section.metrics]
          const targetIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1

          if (targetIndex < 0 || targetIndex >= newMetrics.length) return section

          const temp = newMetrics[currentIndex]
          newMetrics[currentIndex] = newMetrics[targetIndex]
          newMetrics[targetIndex] = temp
          
          return { ...section, metrics: newMetrics }
        }
        return section
      })
    })
  }

  const handleSave = () => {
    const updatedTemplate: ReportTemplate = {
      ...template,
      sections,
      updatedAt: Date.now()
    }
    onSave(updatedTemplate)
  }

  const handleReset = () => {
    setSections(initialTemplate.sections)
    toast.info('Reset to original configuration')
  }

  const handleBulkAdd = () => {
    if (!selectedSection) {
      toast.error('Please select a section first')
      return
    }
    setBulkSelectorOpen(true)
  }

  const handleBulkSave = (metricIds: string[]) => {
    if (!selectedSection) return
    
    setSections(prev => prev.map(section => {
      if (section.id === selectedSection) {
        const uniqueMetrics = Array.from(new Set([...section.metrics, ...metricIds]))
        return { ...section, metrics: uniqueMetrics }
      }
      return section
    }))
    
    setBulkSelectorOpen(false)
    const currentSection = sections.find(s => s.id === selectedSection)
    const addedCount = metricIds.filter(id => !currentSection?.metrics.includes(id)).length
    toast.success(`Added ${addedCount} metrics to ${currentSection?.title}`)
  }

  const currentSection = sections.find(s => s.id === selectedSection)

  return (
    <Dialog open={true} onOpenChange={() => onCancel()}>
      <DialogContent className="max-w-6xl max-h-[90vh] p-0">
        <DialogHeader className="px-6 pt-6 pb-4 border-b">
          <DialogTitle className="text-2xl">Customize Report Metrics</DialogTitle>
          <p className="text-sm text-muted-foreground mt-1">
            {template.name} - Add, remove, or reorder metrics for each section
          </p>
        </DialogHeader>

        <div className="flex flex-1 overflow-hidden">
          <div className="w-80 border-r flex flex-col">
            <div className="p-4 border-b space-y-3">
              <div className="relative">
                <MagnifyingGlass className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
                <Input
                  placeholder="Search metrics..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              
              <div className="flex items-center gap-2">
                <Funnel size={18} className="text-muted-foreground" />
                <Label className="text-sm font-medium">Filter by Category</Label>
              </div>

              {selectedSection && (
                <Button
                  size="sm"
                  variant="default"
                  className="w-full"
                  onClick={handleBulkAdd}
                >
                  <ListChecks size={16} className="mr-2" />
                  Bulk Add Metrics
                </Button>
              )}
            </div>

            <Tabs value={selectedCategory} onValueChange={setSelectedCategory} className="flex-1 flex flex-col">
              <TabsList className="w-full grid grid-cols-2 gap-1 p-1 mx-4 mt-2">
                <TabsTrigger value="all" className="text-xs">All</TabsTrigger>
                <TabsTrigger value="revenue" className="text-xs">Revenue</TabsTrigger>
              </TabsList>

              <ScrollArea className="flex-1 px-4 pb-4">
                <div className="space-y-2 mt-3">
                  {categories.slice(2).map(category => (
                    <Button
                      key={category.id}
                      variant={selectedCategory === category.id ? 'default' : 'ghost'}
                      className="w-full justify-start text-sm"
                      size="sm"
                      onClick={() => setSelectedCategory(category.id)}
                    >
                      <div className={`w-3 h-3 rounded-full ${category.color} mr-2`} />
                      {category.name}
                      <Badge variant="secondary" className="ml-auto">
                        {reportTemplateMetrics.filter(m => m.category === category.id).length}
                      </Badge>
                    </Button>
                  ))}
                </div>

                <Separator className="my-4" />

                <div className="space-y-1">
                  <h4 className="text-sm font-semibold mb-2 flex items-center gap-2">
                    <Plus size={16} />
                    Available Metrics
                  </h4>
                  {filteredMetrics.filter(m => !getUsedMetrics().includes(m.id)).map(metric => (
                    <div
                      key={metric.id}
                      draggable
                      onDragStart={() => handleDragStart(metric.id)}
                      onDragEnd={handleDragEnd}
                      className="group p-3 border rounded-lg hover:bg-accent cursor-move transition-colors"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <DotsSixVertical size={16} className="text-muted-foreground shrink-0" />
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium truncate">{metric.name}</p>
                              <p className="text-xs text-muted-foreground truncate">{metric.description}</p>
                            </div>
                          </div>
                        </div>
                        {selectedSection && (
                          <Button
                            size="sm"
                            variant="ghost"
                            className="shrink-0 h-6 w-6 p-0 opacity-0 group-hover:opacity-100"
                            onClick={() => handleAddMetric(metric.id, selectedSection)}
                          >
                            <Plus size={14} />
                          </Button>
                        )}
                      </div>
                      <div className="flex items-center gap-2 mt-2">
                        <Badge variant="outline" className="text-xs">
                          {metric.format}
                        </Badge>
                        <Badge variant="outline" className="text-xs">
                          {metric.aggregation}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </Tabs>
          </div>

          <div className="flex-1 flex flex-col">
            <div className="p-4 border-b">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">Report Sections</h3>
                <div className="flex items-center gap-2">
                  <Badge variant="secondary">
                    {getUsedMetrics().length} metrics in use
                  </Badge>
                  <Badge variant="outline">
                    {getAvailableMetrics().length} available
                  </Badge>
                </div>
              </div>
            </div>

            <ScrollArea className="flex-1 p-6">
              <div className="space-y-6">
                {sections.map((section, index) => {
                  const isSelected = selectedSection === section.id
                  const isDragOver = dragOverSectionId === section.id

                  return (
                    <Card
                      key={section.id}
                      className={`p-4 transition-all ${isSelected ? 'ring-2 ring-primary' : ''} ${isDragOver ? 'ring-2 ring-accent' : ''}`}
                      onDragOver={(e) => handleDragOver(e, section.id)}
                      onDrop={(e) => handleDrop(e, section.id)}
                    >
                      <div className="flex items-start justify-between mb-4">
                        <div
                          className="flex-1 cursor-pointer"
                          onClick={() => setSelectedSection(section.id)}
                        >
                          <h4 className="text-base font-semibold">{section.title}</h4>
                          <p className="text-sm text-muted-foreground">
                            {section.metrics.length} metrics • Column span: {section.columnSpan}
                          </p>
                        </div>
                        <Badge variant={isSelected ? 'default' : 'secondary'}>
                          Section {index + 1}
                        </Badge>
                      </div>

                      {section.metrics.length === 0 ? (
                        <div className="border-2 border-dashed rounded-lg p-8 text-center text-muted-foreground">
                          <p className="text-sm">Drop metrics here or click + to add</p>
                        </div>
                      ) : (
                        <div className="space-y-2">
                          {section.metrics.map((metricId, metricIndex) => {
                            const metric = getMetricById(metricId)
                            if (!metric) return null

                            const categoryColor = getMetricCategoryColor(metric.category)

                            return (
                              <div
                                key={metricId}
                                draggable
                                onDragStart={() => handleDragStart(metricId)}
                                onDragEnd={handleDragEnd}
                                className="group flex items-center gap-3 p-3 border rounded-lg hover:bg-accent/50 cursor-move"
                              >
                                <DotsSixVertical size={18} className="text-muted-foreground shrink-0" />
                                
                                <div className={`w-1 h-12 rounded-full ${categoryColor} shrink-0`} />
                                
                                <div className="flex-1 min-w-0">
                                  <p className="text-sm font-medium">{metric.name}</p>
                                  <p className="text-xs text-muted-foreground truncate">{metric.description}</p>
                                  <div className="flex items-center gap-2 mt-1">
                                    <Badge variant="outline" className="text-xs">
                                      {metric.category}
                                    </Badge>
                                    <Badge variant="outline" className="text-xs">
                                      {metric.format}
                                    </Badge>
                                  </div>
                                </div>

                                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 shrink-0">
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    className="h-8 w-8 p-0"
                                    onClick={() => handleReorderMetric(section.id, metricId, 'up')}
                                    disabled={metricIndex === 0}
                                  >
                                    ↑
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    className="h-8 w-8 p-0"
                                    onClick={() => handleReorderMetric(section.id, metricId, 'down')}
                                    disabled={metricIndex === section.metrics.length - 1}
                                  >
                                    ↓
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    className="h-8 w-8 p-0 text-destructive"
                                    onClick={() => handleRemoveMetric(metricId, section.id)}
                                  >
                                    <Minus size={16} />
                                  </Button>
                                </div>
                              </div>
                            )
                          })}
                        </div>
                      )}
                    </Card>
                  )
                })}
              </div>
            </ScrollArea>
          </div>
        </div>

        <DialogFooter className="px-6 py-4 border-t flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              onClick={handleReset}
              size="sm"
            >
              <ArrowsClockwise size={16} className="mr-2" />
              Reset
            </Button>
          </div>
          
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={onCancel}>
              <X size={16} className="mr-2" />
              Cancel
            </Button>
            <Button onClick={handleSave}>
              <FloppyDisk size={16} className="mr-2" />
              Save Changes
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>

      {bulkSelectorOpen && selectedSection && (
        <BulkMetricSelector
          selectedMetrics={currentSection?.metrics || []}
          onSave={handleBulkSave}
          onCancel={() => setBulkSelectorOpen(false)}
          title={`Add Metrics to ${currentSection?.title}`}
          description="Select multiple metrics to add to this section"
        />
      )}
    </Dialog>
  )
}
