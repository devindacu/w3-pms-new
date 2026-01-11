import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { toast } from 'sonner'
import {
  Plus,
  Minus,
  MagnifyingGlass,
  Check,
  X,
  ListChecks
} from '@phosphor-icons/react'
import { reportTemplateMetrics, getMetricsByCategory, getMetricCategoryColor } from '@/lib/reportTemplateMetrics'
import type { ReportMetricCategory } from '@/lib/reportTemplateTypes'

interface BulkMetricSelectorProps {
  selectedMetrics: string[]
  onSave: (metrics: string[]) => void
  onCancel: () => void
  title?: string
  description?: string
}

export function BulkMetricSelector({
  selectedMetrics: initialSelectedMetrics,
  onSave,
  onCancel,
  title = 'Select Metrics',
  description = 'Choose which metrics to include in your report'
}: BulkMetricSelectorProps) {
  const [selectedMetrics, setSelectedMetrics] = useState<Set<string>>(new Set(initialSelectedMetrics))
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<ReportMetricCategory | 'all'>('all')

  const categories: Array<{ id: ReportMetricCategory | 'all'; name: string; color: string }> = [
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

  const handleToggleMetric = (metricId: string) => {
    setSelectedMetrics(prev => {
      const newSet = new Set(prev)
      if (newSet.has(metricId)) {
        newSet.delete(metricId)
      } else {
        newSet.add(metricId)
      }
      return newSet
    })
  }

  const handleSelectAll = () => {
    const newSet = new Set(selectedMetrics)
    filteredMetrics.forEach(metric => {
      newSet.add(metric.id)
    })
    setSelectedMetrics(newSet)
    toast.success(`Added ${filteredMetrics.length} metrics`)
  }

  const handleDeselectAll = () => {
    const filteredIds = new Set(filteredMetrics.map(m => m.id))
    setSelectedMetrics(prev => {
      const newSet = new Set(prev)
      filteredIds.forEach(id => newSet.delete(id))
      return newSet
    })
    toast.success(`Removed ${filteredMetrics.length} metrics`)
  }

  const handleSelectCategory = (category: ReportMetricCategory) => {
    const categoryMetrics = getMetricsByCategory(category)
    const newSet = new Set(selectedMetrics)
    categoryMetrics.forEach(metric => {
      newSet.add(metric.id)
    })
    setSelectedMetrics(newSet)
    toast.success(`Added all ${category} metrics`)
  }

  const handleDeselectCategory = (category: ReportMetricCategory) => {
    const categoryMetrics = getMetricsByCategory(category)
    const categoryIds = new Set(categoryMetrics.map(m => m.id))
    setSelectedMetrics(prev => {
      const newSet = new Set(prev)
      categoryIds.forEach(id => newSet.delete(id))
      return newSet
    })
    toast.success(`Removed all ${category} metrics`)
  }

  const handleSave = () => {
    onSave(Array.from(selectedMetrics))
  }

  const getCategoryStats = (category: ReportMetricCategory) => {
    const categoryMetrics = getMetricsByCategory(category)
    const selectedCount = categoryMetrics.filter(m => selectedMetrics.has(m.id)).length
    return { total: categoryMetrics.length, selected: selectedCount }
  }

  return (
    <Dialog open={true} onOpenChange={() => onCancel()}>
      <DialogContent className="max-w-5xl max-h-[90vh] p-0">
        <DialogHeader className="px-6 pt-6 pb-4 border-b">
          <DialogTitle className="text-2xl">{title}</DialogTitle>
          <p className="text-sm text-muted-foreground mt-1">{description}</p>
        </DialogHeader>

        <div className="flex flex-col flex-1 overflow-hidden">
          <div className="px-6 pt-4 pb-3 border-b space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Badge variant="outline" className="text-sm">
                  {selectedMetrics.size} metrics selected
                </Badge>
                <Badge variant="secondary" className="text-sm">
                  {reportTemplateMetrics.length} total available
                </Badge>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleSelectAll}
                >
                  <Plus size={16} className="mr-1" />
                  Select All ({filteredMetrics.length})
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleDeselectAll}
                >
                  <Minus size={16} className="mr-1" />
                  Deselect All
                </Button>
              </div>
            </div>

            <div className="relative">
              <MagnifyingGlass className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
              <Input
                placeholder="Search metrics by name or description..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          <Tabs value={selectedCategory} onValueChange={(v) => setSelectedCategory(v as ReportMetricCategory | 'all')} className="flex-1 flex flex-col overflow-hidden">
            <div className="px-6 pt-3">
              <TabsList className="grid w-full grid-cols-5 gap-1">
                <TabsTrigger value="all">All</TabsTrigger>
                <TabsTrigger value="revenue">Revenue</TabsTrigger>
                <TabsTrigger value="occupancy">Occupancy</TabsTrigger>
                <TabsTrigger value="guest">Guest</TabsTrigger>
                <TabsTrigger value="fnb">F&B</TabsTrigger>
              </TabsList>
            </div>

            <TabsContent value="all" className="flex-1 overflow-hidden mt-0">
              <ScrollArea className="h-[50vh] px-6 pb-4">
                <div className="space-y-4 mt-4">
                  {categories.slice(1).map(category => {
                    const stats = getCategoryStats(category.id as ReportMetricCategory)
                    return (
                      <div key={category.id} className="border rounded-lg p-4">
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-2">
                            <div className={`w-3 h-3 rounded-full ${category.color}`} />
                            <h4 className="font-semibold">{category.name}</h4>
                            <Badge variant="secondary" className="text-xs">
                              {stats.selected}/{stats.total}
                            </Badge>
                          </div>
                          <div className="flex gap-1">
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleSelectCategory(category.id as ReportMetricCategory)}
                            >
                              <Plus size={14} />
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleDeselectCategory(category.id as ReportMetricCategory)}
                            >
                              <Minus size={14} />
                            </Button>
                          </div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                          {getMetricsByCategory(category.id as ReportMetricCategory).map(metric => (
                            <div
                              key={metric.id}
                              className="flex items-start gap-3 p-2 border rounded hover:bg-accent/50 cursor-pointer"
                              onClick={() => handleToggleMetric(metric.id)}
                            >
                              <Checkbox
                                checked={selectedMetrics.has(metric.id)}
                                onCheckedChange={() => handleToggleMetric(metric.id)}
                              />
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium">{metric.name}</p>
                                <p className="text-xs text-muted-foreground truncate">{metric.description}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )
                  })}
                </div>
              </ScrollArea>
            </TabsContent>

            {categories.slice(1).map(category => (
              <TabsContent key={category.id} value={category.id} className="flex-1 overflow-hidden mt-0">
                <ScrollArea className="h-[50vh] px-6 pb-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-4">
                    {getMetricsByCategory(category.id as ReportMetricCategory).map(metric => (
                      <div
                        key={metric.id}
                        className="flex items-start gap-3 p-3 border rounded hover:bg-accent/50 cursor-pointer transition-colors"
                        onClick={() => handleToggleMetric(metric.id)}
                      >
                        <Checkbox
                          checked={selectedMetrics.has(metric.id)}
                          onCheckedChange={() => handleToggleMetric(metric.id)}
                        />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium">{metric.name}</p>
                          <p className="text-xs text-muted-foreground">{metric.description}</p>
                          <div className="flex items-center gap-2 mt-2">
                            <Badge variant="outline" className="text-xs">
                              {metric.format}
                            </Badge>
                            <Badge variant="outline" className="text-xs">
                              {metric.aggregation}
                            </Badge>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </TabsContent>
            ))}
          </Tabs>
        </div>

        <DialogFooter className="px-6 py-4 border-t">
          <div className="flex items-center justify-between w-full">
            <Badge variant="default" className="text-sm">
              {selectedMetrics.size} metrics selected
            </Badge>
            <div className="flex gap-2">
              <Button variant="outline" onClick={onCancel}>
                <X size={16} className="mr-2" />
                Cancel
              </Button>
              <Button onClick={handleSave}>
                <Check size={16} className="mr-2" />
                Save Selection
              </Button>
            </div>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
