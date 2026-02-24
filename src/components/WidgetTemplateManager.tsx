import React, { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { Download, Upload, Eye, Star, Layout } from '@phosphor-icons/react'
import type { DashboardLayout, DashboardWidget, SystemRole } from '@/lib/types'
import { toast } from 'sonner'

interface WidgetTemplate {
  id: string
  name: string
  description: string
  author: string
  isPublic: boolean
  isDefault: boolean
  targetRoles: SystemRole[]
  widgets: DashboardWidget[]
  columns: number
  category: 'executive' | 'operational' | 'departmental' | 'analytical' | 'custom'
  tags: string[]
  rating: number
  usage: number
  createdAt: number
  updatedAt: number
}

interface WidgetTemplateManagerProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  currentRole: SystemRole
  currentLayout?: DashboardLayout | null
  onApplyTemplate: (layout: DashboardLayout) => void
  onSaveAsTemplate?: (template: WidgetTemplate) => void
}

const CATEGORY_LABELS: Record<WidgetTemplate['category'], string> = {
  executive: 'Executive',
  operational: 'Operational',
  departmental: 'Departmental',
  analytical: 'Analytical',
  custom: 'Custom'
}

const CATEGORY_DESCRIPTIONS: Record<WidgetTemplate['category'], string> = {
  executive: 'High-level overview templates for senior management',
  operational: 'Day-to-day operations and task management',
  departmental: 'Department-specific dashboards',
  analytical: 'Data-driven templates with charts and insights',
  custom: 'Custom templates created by users'
}

const DEFAULT_TEMPLATES: WidgetTemplate[] = [
  {
    id: 'template-executive-1',
    name: 'Executive Dashboard',
    description: 'Comprehensive overview for senior management with key performance indicators, revenue trends, and strategic metrics',
    author: 'System',
    isPublic: true,
    isDefault: true,
    targetRoles: ['admin', 'procurement-manager'],
    widgets: [
      { id: 'w1', type: 'revenue-today', title: "Today's Revenue", size: 'small', position: 0, isVisible: true, refreshInterval: 60000 },
      { id: 'w2', type: 'occupancy', title: 'Occupancy Rate', size: 'small', position: 1, isVisible: true, refreshInterval: 60000 },
      { id: 'w3', type: 'financial-summary', title: 'Financial Summary', size: 'large', position: 2, isVisible: true, refreshInterval: 60000 },
      { id: 'w4', type: 'revenue-chart', title: 'Revenue Trends', size: 'large', position: 3, isVisible: true, refreshInterval: 60000 }
    ],
    columns: 2,
    category: 'executive',
    tags: ['executive', 'revenue', 'kpi', 'management'],
    rating: 4.8,
    usage: 145,
    createdAt: Date.now() - 86400000 * 30,
    updatedAt: Date.now() - 86400000 * 5
  },
  {
    id: 'template-frontoffice-1',
    name: 'Front Office Operations',
    description: 'Daily operations dashboard for front desk staff with arrivals, departures, room status, and guest management',
    author: 'System',
    isPublic: true,
    isDefault: false,
    targetRoles: ['admin', 'department-head'],
    widgets: [
      { id: 'w1', type: 'arrivals-departures', title: 'Arrivals & Departures', size: 'large', position: 0, isVisible: true, refreshInterval: 60000 },
      { id: 'w2', type: 'room-status', title: 'Room Status', size: 'large', position: 1, isVisible: true, refreshInterval: 60000 },
      { id: 'w3', type: 'housekeeping', title: 'Housekeeping', size: 'small', position: 2, isVisible: true, refreshInterval: 60000 },
      { id: 'w4', type: 'occupancy', title: 'Occupancy', size: 'small', position: 3, isVisible: true, refreshInterval: 60000 }
    ],
    columns: 2,
    category: 'operational',
    tags: ['front-office', 'operations', 'daily', 'guest-service'],
    rating: 4.6,
    usage: 98,
    createdAt: Date.now() - 86400000 * 25,
    updatedAt: Date.now() - 86400000 * 3
  }
]

export function WidgetTemplateManager({
  open,
  onOpenChange,
  currentRole,
  currentLayout,
  onApplyTemplate,
  onSaveAsTemplate
}: WidgetTemplateManagerProps) {
  const [selectedTemplate, setSelectedTemplate] = useState<WidgetTemplate | null>(null)
  const [previewTemplate, setPreviewTemplate] = useState<WidgetTemplate | null>(null)
  const [templateName, setTemplateName] = useState('')
  const [templateDescription, setTemplateDescription] = useState('')
  const [templateCategory, setTemplateCategory] = useState<WidgetTemplate['category']>('custom')
  const [templateTags, setTemplateTags] = useState('')
  const [templateIsPublic, setTemplateIsPublic] = useState(false)

  const handleApplyTemplate = (template: WidgetTemplate) => {
    const newLayout: DashboardLayout = {
      id: `layout-${Date.now()}`,
      userId: currentLayout?.userId || 'current-user',
      userRole: currentRole,
      name: template.name,
      isDefault: false,
      isShared: false,
      widgets: template.widgets.map((widget, index) => ({
        ...widget,
        id: `widget-${Date.now()}-${index}`,
        position: index
      })),
      columns: (Math.min(Math.max(template.columns, 1), 4) as 1 | 2 | 3 | 4),
      createdAt: Date.now(),
      updatedAt: Date.now(),
      createdBy: currentLayout?.createdBy || 'current-user'
    }

    onApplyTemplate(newLayout)
    toast.success(`Template "${template.name}" applied successfully`)
    onOpenChange(false)
  }

  const handleSaveCurrentAsTemplate = () => {
    if (!currentLayout) {
      toast.error('No current layout to save')
      return
    }

    if (!onSaveAsTemplate) {
      toast.error('Save template function not available')
      return
    }

    if (!templateName.trim()) {
      toast.error('Please enter a template name')
      return
    }

    const newTemplate: WidgetTemplate = {
      id: `template-custom-${Date.now()}`,
      name: templateName.trim(),
      description: templateDescription.trim() || 'Custom dashboard template',
      author: currentLayout.createdBy || 'current-user',
      isPublic: templateIsPublic,
      isDefault: false,
      targetRoles: [currentRole],
      widgets: currentLayout.widgets,
      columns: currentLayout.columns,
      category: templateCategory,
      tags: templateTags.split(',').map(tag => tag.trim()).filter(Boolean),
      rating: 0,
      usage: 0,
      createdAt: Date.now(),
      updatedAt: Date.now()
    }

    onSaveAsTemplate(newTemplate)
    toast.success(`Template "${newTemplate.name}" saved successfully`)
    setTemplateName('')
    setTemplateDescription('')
    setTemplateTags('')
    setTemplateIsPublic(false)
  }

  const allTemplates = DEFAULT_TEMPLATES
  const roleRelevantTemplates = allTemplates.filter(t => t.targetRoles.includes(currentRole))

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-4xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Layout size={24} />
              Dashboard Templates
            </DialogTitle>
            <p className="text-sm text-muted-foreground">
              Choose from pre-built templates or create your own
            </p>
          </DialogHeader>

          <Tabs defaultValue="recommended">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="recommended">Recommended</TabsTrigger>
              <TabsTrigger value="all">All Templates</TabsTrigger>
              <TabsTrigger value="create">Create New</TabsTrigger>
            </TabsList>

            <TabsContent value="recommended" className="mt-4">
              <div>
                <div>
                  <h3 className="text-sm font-semibold mb-1">Templates for {currentRole}</h3>
                  <p className="text-xs text-muted-foreground">Curated dashboard layouts designed for your role</p>
                </div>

                <div className="space-y-3 mt-4">
                  {roleRelevantTemplates.length === 0 ? (
                    <Card className="p-8 text-center">
                      <p className="text-muted-foreground">No recommended templates for your role. Check the "All Templates" tab.</p>
                    </Card>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {roleRelevantTemplates.map((template) => (
                        <Card key={template.id} className="p-4 hover:shadow-lg transition-shadow cursor-pointer border-2 hover:border-primary">
                          <div className="space-y-3">
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <div className="flex items-center gap-2">
                                  <h4 className="font-semibold">{template.name}</h4>
                                  {template.isDefault && (
                                    <Badge variant="default" className="text-xs">Default</Badge>
                                  )}
                                </div>
                                <p className="text-sm text-muted-foreground mt-1">{template.description}</p>
                              </div>
                            </div>

                            <div className="flex items-center gap-2 text-sm text-muted-foreground flex-wrap">
                              <Badge variant="outline">{CATEGORY_LABELS[template.category]}</Badge>
                              <Separator orientation="vertical" className="h-4" />
                              <span>{template.widgets.length} widgets</span>
                              <Separator orientation="vertical" className="h-4" />
                              <span>{template.columns} columns</span>
                            </div>

                            <div className="flex flex-wrap gap-1">
                              {template.tags.slice(0, 4).map((tag) => (
                                <Badge key={tag} variant="secondary" className="text-xs">{tag}</Badge>
                              ))}
                            </div>

                            <div className="flex items-center justify-between pt-2 border-t">
                              <div className="flex items-center gap-3 text-xs text-muted-foreground">
                                <span className="flex items-center gap-1">
                                  <Star size={14} weight="fill" className="text-yellow-500" />
                                  {template.rating.toFixed(1)}
                                </span>
                                <span>{template.usage} uses</span>
                              </div>
                              <div className="flex gap-2">
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => setPreviewTemplate(template)}
                                >
                                  <Eye size={16} className="mr-1" />
                                  Preview
                                </Button>
                                <Button
                                  size="sm"
                                  onClick={() => handleApplyTemplate(template)}
                                >
                                  <Download size={16} className="mr-1" />
                                  Apply
                                </Button>
                              </div>
                            </div>
                          </div>
                        </Card>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </TabsContent>

            <TabsContent value="all" className="space-y-4 mt-4">
              {Object.entries(
                allTemplates.reduce((acc, template) => {
                  if (!acc[template.category]) {
                    acc[template.category] = []
                  }
                  acc[template.category].push(template)
                  return acc
                }, {} as Record<string, WidgetTemplate[]>)
              ).map(([category, templates]) => (
                <div key={category} className="space-y-3">
                  <div>
                    <h3 className="text-lg font-semibold">{CATEGORY_LABELS[category as WidgetTemplate['category']]}</h3>
                    <p className="text-sm text-muted-foreground">{CATEGORY_DESCRIPTIONS[category as WidgetTemplate['category']]}</p>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {templates.map((template) => (
                      <Card key={template.id} className="p-4 hover:shadow-lg transition-shadow">
                        <div className="space-y-3">
                          <div>
                            <h4 className="font-semibold">{template.name}</h4>
                            <p className="text-sm text-muted-foreground mt-1">{template.description}</p>
                          </div>
                          <div className="flex items-center gap-2 text-sm">
                            <span>{template.widgets.length} widgets</span>
                            <Separator orientation="vertical" className="h-4" />
                            <span>{template.columns} columns</span>
                          </div>
                          <div className="flex items-center justify-between pt-2 border-t">
                            <div className="flex items-center gap-3 text-xs text-muted-foreground">
                              <span className="flex items-center gap-1">
                                <Star size={14} weight="fill" className="text-yellow-500" />
                                {template.rating.toFixed(1)}
                              </span>
                              <span>{template.usage} uses</span>
                            </div>
                            <div className="flex gap-2">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => setPreviewTemplate(template)}
                              >
                                <Eye size={16} className="mr-1" />
                                Preview
                              </Button>
                              <Button
                                size="sm"
                                onClick={() => handleApplyTemplate(template)}
                              >
                                <Download size={16} className="mr-1" />
                                Apply
                              </Button>
                            </div>
                          </div>
                        </div>
                      </Card>
                    ))}
                  </div>
                </div>
              ))}
            </TabsContent>

            <TabsContent value="create" className="mt-4">
              <Card className="p-6">
                <div className="space-y-4">
                  <div>
                    <h3 className="text-lg font-semibold">Save Current Layout as Template</h3>
                    <p className="text-sm text-muted-foreground">Create a reusable template from your current dashboard configuration</p>
                  </div>

                  <div>
                    <Label htmlFor="template-name">Template Name *</Label>
                    <Input
                      id="template-name"
                      placeholder="e.g., My Custom Dashboard"
                      value={templateName}
                      onChange={(e) => setTemplateName(e.target.value)}
                    />
                  </div>

                  <div>
                    <Label htmlFor="template-description">Description</Label>
                    <Textarea
                      id="template-description"
                      placeholder="Describe what this template is for..."
                      value={templateDescription}
                      onChange={(e) => setTemplateDescription(e.target.value)}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="template-category">Category</Label>
                      <Select value={templateCategory} onValueChange={(value) => setTemplateCategory(value as WidgetTemplate['category'])}>
                        <SelectTrigger id="template-category">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {Object.entries(CATEGORY_LABELS).map(([key, label]) => (
                            <SelectItem key={key} value={key}>{label}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label htmlFor="template-tags">Tags (comma-separated)</Label>
                      <Input
                        id="template-tags"
                        placeholder="e.g., operations, daily, reports"
                        value={templateTags}
                        onChange={(e) => setTemplateTags(e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="template-public"
                      checked={templateIsPublic}
                      onCheckedChange={(checked) => setTemplateIsPublic(checked as boolean)}
                    />
                    <Label htmlFor="template-public" className="text-sm font-normal">
                      Make this template public (share with other users)
                    </Label>
                  </div>

                  {currentLayout && (
                    <div className="bg-muted p-4 rounded-lg">
                      <h4 className="text-sm font-semibold mb-2">Current Layout Preview</h4>
                      <div className="space-y-1 text-sm text-muted-foreground">
                        <div>Widgets: {currentLayout.widgets.length}</div>
                        <div>Columns: {currentLayout.columns}</div>
                      </div>
                    </div>
                  )}

                  <Button
                    onClick={handleSaveCurrentAsTemplate}
                    disabled={!currentLayout || !templateName.trim()}
                    className="w-full"
                  >
                    <Upload size={16} className="mr-2" />
                    Save as Template
                  </Button>
                </div>
              </Card>
            </TabsContent>
          </Tabs>
        </DialogContent>
      </Dialog>

      {previewTemplate && (
        <Dialog open={!!previewTemplate} onOpenChange={() => setPreviewTemplate(null)}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>{previewTemplate.name}</DialogTitle>
            </DialogHeader>

            <div className="space-y-4">
              <div>
                <span className="font-medium">Description:</span>
                <p className="text-sm text-muted-foreground mt-1">{previewTemplate.description}</p>
              </div>

              <div>
                <span className="font-medium">Configuration:</span>
                <div className="text-sm text-muted-foreground mt-1">
                  {previewTemplate.widgets.length} widgets, {previewTemplate.columns} columns
                </div>
              </div>

              <div>
                <h4 className="font-medium mb-2">Widgets Included:</h4>
                <div className="space-y-2">
                  {previewTemplate.widgets.map((widget, index) => (
                    <div key={widget.id} className="flex items-center justify-between p-2 bg-muted rounded">
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-muted-foreground">{index + 1}.</span>
                        <span className="text-sm">{widget.title}</span>
                      </div>
                      <Badge variant="outline" className="text-xs">{widget.size}</Badge>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex gap-2 pt-4">
                <Button variant="outline" onClick={() => setPreviewTemplate(null)} className="flex-1">
                  Close
                </Button>
                <Button onClick={() => {
                  handleApplyTemplate(previewTemplate)
                  setPreviewTemplate(null)
                }} className="flex-1">
                  <Download size={16} className="mr-2" />
                  Apply Template
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </>
  )
}
