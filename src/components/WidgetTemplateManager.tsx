import React, { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, D
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/se
import { Card } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger }
import { Checkbox } from '@/components/ui/checkbox'
import type { DashboardLayout, DashboardWidge
import { Card } from '@/components/ui/card'
import { toast } from 'sonner'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { Download, Upload, Eye, Star, Layout } from '@phosphor-icons/react'
import type { DashboardLayout, DashboardWidget, SystemRole } from '@/lib/types'
import { getAvailableWidgets, getRoleWidgetPresets } from '@/lib/widgetConfig'

interface WidgetTemplate {
  category: 
  name: string
  usage: number
  author: string
}
  isDefault: boolean
  open: boolean
  widgets: DashboardWidget[]
  currentLayout?:
  category: 'executive' | 'operational' | 'departmental' | 'analytical' | 'custom'
}
  rating: number
  'revenue-toda
  createdAt: number
  updatedAt: number
 

interface WidgetTemplateManagerProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  currentRole: SystemRole
  currentLayout?: DashboardLayout | null
  onApplyTemplate: (layout: DashboardLayout) => void
  onSaveAsTemplate?: (template: WidgetTemplate) => void
}

const WIDGET_TYPE_LABELS: Record<string, string> = {
  'revenue-today': "Today's Revenue",
  'occupancy': 'Occupancy Rate',
  'arrivals-departures': 'Arrivals & Departures',
  'room-status': 'Room Status',
  'housekeeping': 'Housekeeping Tasks',
  'low-stock': 'Low Stock Items',
  'pending-approvals': 'Pending Approvals',
  'financial-summary': 'Financial Summary',
  'revenue-chart': 'Revenue Trends',
}
  'guest-feedback': 'Guest Feedback',
  'maintenance-status': 'Maintenance Requests',
  'food-inventory': 'Food Inventory',
  'amenities-stock': 'Amenities Stock',
  'kitchen-operations': 'Kitchen Operations',
  'fnb-performance': 'F&B Performance',
  'maintenance-construction': 'Construction Projects',
  'channel-performance': 'Channel Performance',
  'crm-summary': 'CRM Summary',
  'booking-source': 'Booking Source'
}

const CATEGORY_LABELS: Record<WidgetTemplate['category'], string> = {
  executive: 'Executive',
  operational: 'Operational',
    createdAt: Date.now() - 864
  analytical: 'Analytical',
  custom: 'Custom'
}

const CATEGORY_DESCRIPTIONS: Record<WidgetTemplate['category'], string> = {
  executive: 'High-level overview templates for senior management',
  operational: 'Day-to-day operations and task management',
  departmental: 'Department-specific dashboards',
  analytical: 'Data-driven templates with charts and insights',
      { id: 'w4', type: 'occupancy', titl
}

const DEFAULT_TEMPLATES: WidgetTemplate[] = [
  {
    id: 'template-executive-1',
    name: 'Executive Dashboard',
    description: 'Comprehensive overview for senior management with key performance indicators, revenue trends, and strategic metrics',
  {
    isPublic: true,
    description: 'Fo
    targetRoles: ['admin', 'manager'],
    isDefault:
      { id: 'w1', type: 'revenue-today', title: "Today's Revenue", size: 'small', position: 0, isVisible: true, refreshInterval: 60000 },
      { id: 'w2', type: 'occupancy', title: 'Occupancy Rate', size: 'small', position: 1, isVisible: true, refreshInterval: 60000 },
      { id: 'w3', type: 'financial-summary', title: 'Financial Summary', size: 'large', position: 2, isVisible: true, refreshInterval: 60000 },
      { id: 'w4', type: 'revenue-chart', title: 'Revenue Trends', size: 'large', position: 3, isVisible: true, refreshInterval: 60000 },
      { id: 'w5', type: 'department-performance', title: 'Department Performance', size: 'large', position: 4, isVisible: true, refreshInterval: 60000 },
      { id: 'w6', type: 'channel-performance', title: 'Channel Performance', size: 'large', position: 5, isVisible: true, refreshInterval: 60000 }
    ],
    rating: 4.5
    category: 'executive',
    tags: ['executive', 'revenue', 'kpi', 'management'],
    rating: 4.8,
    id: 'templa
    createdAt: Date.now() - 86400000 * 30,
    updatedAt: Date.now() - 86400000 * 5
  },
   
    id: 'template-frontoffice-1',
      { id: 'w2', type: 'financial-s
    description: 'Daily operations dashboard for front desk staff with arrivals, departures, room status, and guest management',
      { id: 'w5', typ
    isPublic: true,
    columns: 2,
    targetRoles: ['front-desk', 'manager'],
    rating: 4.
      { id: 'w1', type: 'arrivals-departures', title: 'Arrivals & Departures', size: 'large', position: 0, isVisible: true, refreshInterval: 60000 },
      { id: 'w2', type: 'room-status', title: 'Room Status', size: 'large', position: 1, isVisible: true, refreshInterval: 60000 },
      { id: 'w3', type: 'housekeeping', title: 'Housekeeping', size: 'small', position: 2, isVisible: true, refreshInterval: 60000 },
      { id: 'w4', type: 'occupancy', title: 'Occupancy', size: 'small', position: 3, isVisible: true, refreshInterval: 60000 },
      { id: 'w5', type: 'guest-feedback', title: 'Guest Feedback', size: 'medium', position: 4, isVisible: true, refreshInterval: 60000 },
      { id: 'w6', type: 'pending-approvals', title: 'Pending Tasks', size: 'medium', position: 5, isVisible: true, refreshInterval: 60000 }
    ],
  onApplyTempla
    category: 'operational',
    tags: ['front-office', 'operations', 'daily', 'guest-service'],
    rating: 4.6,
  const [templ
    createdAt: Date.now() - 86400000 * 25,
    updatedAt: Date.now() - 86400000 * 3
  },
  {
    id: 'template-fnb-1',
      userRole: currentRole
    description: 'Food & Beverage management dashboard with kitchen operations, inventory, and performance metrics',
      isShared: templ
    isPublic: true,
        id: `widget-$
    targetRoles: ['fnb-manager', 'kitchen-manager'],
      columns:
      { id: 'w1', type: 'kitchen-operations', title: 'Kitchen Operations', size: 'large', position: 0, isVisible: true, refreshInterval: 60000 },
      { id: 'w2', type: 'fnb-performance', title: 'F&B Performance', size: 'medium', position: 1, isVisible: true, refreshInterval: 60000 },
      { id: 'w3', type: 'food-inventory', title: 'Food Inventory', size: 'small', position: 2, isVisible: true, refreshInterval: 60000 },
      { id: 'w4', type: 'low-stock', title: 'Low Stock Alert', size: 'large', position: 3, isVisible: true, refreshInterval: 60000 },
      { id: 'w5', type: 'guest-feedback', title: 'Guest Feedback', size: 'medium', position: 4, isVisible: true, refreshInterval: 60000 }
    ],
    columns: 2,
    category: 'departmental',
    tags: ['fnb', 'kitchen', 'inventory', 'operations'],
    }
    usage: 62,
      toast.error('Save template function 
    updatedAt: Date.now() - 86400000 * 2

  {
      return
    name: 'Financial Overview',
    description: 'Comprehensive financial dashboard for tracking revenue, expenses, and profitability',
    author: 'System',
      description: 
    isDefault: false,
    targetRoles: ['accountant', 'finance-manager', 'admin'],
    widgets: [
      { id: 'w1', type: 'revenue-today', title: "Today's Revenue", size: 'small', position: 0, isVisible: true, refreshInterval: 60000 },
      { id: 'w2', type: 'financial-summary', title: 'Financial Summary', size: 'large', position: 1, isVisible: true, refreshInterval: 60000 },
      { id: 'w3', type: 'pending-approvals', title: 'Pending Approvals', size: 'medium', position: 2, isVisible: true, refreshInterval: 60000 },
      { id: 'w4', type: 'revenue-chart', title: 'Revenue Trends', size: 'large', position: 3, isVisible: true, refreshInterval: 60000 },
      { id: 'w5', type: 'channel-performance', title: 'Channel Revenue', size: 'large', position: 4, isVisible: true, refreshInterval: 60000 },
      { id: 'w6', type: 'department-performance', title: 'Department P&L', size: 'large', position: 5, isVisible: true, refreshInterval: 60000 }
    on
    columns: 2,
    setTemplateName('')
    tags: ['finance', 'revenue', 'analytics', 'reporting'],
    setTemplateT
    usage: 78,
    createdAt: Date.now() - 86400000 * 15,
    updatedAt: Date.now() - 86400000 * 1

]

export function WidgetTemplateManager({
       
  onOpenChange,
            </
  currentLayout,
            </p>
  onSaveAsTemplate
          <Tabs defaultValue="re
  const [selectedTemplate, setSelectedTemplate] = useState<WidgetTemplate | null>(null)
              <TabsTrigger value="all">All Templates</TabsTrigger>
  const [templateName, setTemplateName] = useState('')

  const [templateCategory, setTemplateCategory] = useState<WidgetTemplate['category']>('custom')
                <div>
  const [templateIsPublic, setTemplateIsPublic] = useState(false)

  const handleApplyTemplate = (template: WidgetTemplate) => {
    const newLayout: DashboardLayout = {
      id: `layout-${Date.now()}`,
      userId: currentLayout?.userId || 'current-user',
      userRole: currentRole,
                      {rol
      isDefault: false,
                            <div c
      widgets: template.widgets.map((widget, index) => ({
        ...widget,
        id: `widget-${Date.now()}-${index}`,
        position: index
      })),
                              </
      createdAt: Date.now(),
                            
      createdBy: currentLayout?.createdBy || 'current-user'
    }

    onApplyTemplate(newLayout)
    toast.success(`Template "${template.name}" applied successfully`)
                       
  }

  const handleSaveCurrentAsTemplate = () => {

      toast.error('No current layout to save')
            
     

    if (!onSaveAsTemplate) {
      toast.error('Save template function not available')
            
    }

    if (!templateName.trim()) {
      toast.error('Please enter a template name')
      return
    }

    const newTemplate: WidgetTemplate = {
                                </Button>
      name: templateName.trim(),
                          </div>
      author: currentLayout.createdBy || 'current-user',
                    </div>
      isDefault: false,
              </div>
      widgets: currentLayout.widgets,
      columns: currentLayout.columns,
      category: templateCategory,
      tags: templateTags.split(',').map(tag => tag.trim()).filter(Boolean),
      rating: 0,
               
      createdAt: Date.now(),
              ).map(([categ
    }

    onSaveAsTemplate(newTemplate)
    toast.success(`Template "${newTemplate.name}" saved successfully`)
    
                       
    setTemplateDescription('')
                            <p cl
    setTemplateTags('')
    setTemplateIsPublic(false)
  }

  const allTemplates = DEFAULT_TEMPLATES
  const roleRelevantTemplates = allTemplates.filter(t => t.targetRoles.includes(currentRole))

          
    <>
                            <div className="flex gap-2
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

                        </div>
            <TabsList className="grid w-full grid-cols-3">
                  </div>
              <TabsTrigger value="all">All Templates</TabsTrigger>
            </TabsContent>
            </TabsList>

            <TabsContent value="recommended" className="mt-4">
                    <h3 className="text-l
                <div>
                  <h3 className="text-sm font-semibold mb-1">Templates for {currentRole}</h3>
                  <p className="text-xs text-muted-foreground">Curated dashboard layouts designed for your role</p>
                </div>

                <div className="space-y-3">
                  {roleRelevantTemplates.length === 0 ? (
                  </div>
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
                    <div>

                            <div className="flex items-center gap-2 text-sm text-muted-foreground flex-wrap">
                              <Badge variant="outline">{CATEGORY_LABELS[template.category]}</Badge>
                              <Separator orientation="vertical" className="h-4" />
                              <span>{template.widgets.length} widgets</span>
                              <Separator orientation="vertical" className="h-4" />
                              <span>{template.columns} columns</span>
                    <Checkbox

                            <div className="flex flex-wrap gap-1">
                              {template.tags.slice(0, 4).map((tag) => (
                      Make this template public (share with other users)
                                  {tag}

                              ))}
                      <h4 classNam

                        <div>Columns: {currentLayout.columns}</div>
                              <div className="flex items-center gap-3 text-xs text-muted-foreground">
                  )}
                                  <Star size={14} weight="fill" className="text-yellow-500" />
                    onClick={handleSaveCurrentAsTemplate}
                                </span>
                                <span>{template.usage} uses</span>
                              </div>
                              <div className="flex gap-2">
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => setPreviewTemplate(template)}
            <DialogHeader>
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
                  {previe
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
                <Download si
                }, {} as Record<string, WidgetTemplate[]>)
            </DialogFooter>
                <div key={category} className="space-y-3">
      )}
                    <h3 className="text-lg font-semibold">{CATEGORY_LABELS[category as WidgetTemplate['category']]}</h3>
                    <p className="text-sm text-muted-foreground">{CATEGORY_DESCRIPTIONS[category as WidgetTemplate['category']]}</p>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {templates.map((template) => (

                        <div className="space-y-3">

                            <h4 className="font-semibold">{template.name}</h4>
                            <p className="text-sm text-muted-foreground mt-1">{template.description}</p>

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

                                <Eye size={16} className="mr-1" />
                                Preview
                              </Button>

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
              ))}
            </TabsContent>

            <TabsContent value="create" className="mt-4">
              <Card className="p-6">
                <div className="space-y-4">

                    <h3 className="text-lg font-semibold">Save Current Layout as Template</h3>
                    <p className="text-sm text-muted-foreground">Create a reusable template from your current dashboard configuration</p>
                  </div>

                  <div>
                    <Label htmlFor="template-name">Template Name *</Label>
                    <Input

                      placeholder="e.g., My Custom Dashboard"
                      value={templateName}
                      onChange={(e) => setTemplateName(e.target.value)}

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

                        <SelectContent>
                          {Object.entries(CATEGORY_LABELS).map(([key, label]) => (
                            <SelectItem key={key} value={key}>{label}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                      <Label htmlFor="template-tags">Tags (comma-separated)</Label>

                        id="template-tags"
                        placeholder="e.g., operations, daily, reports"
                        value={templateTags}

                      />

                  </div>

                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="template-public"
                      checked={templateIsPublic}
                      onCheckedChange={(checked) => setTemplateIsPublic(checked as boolean)}

                    <Label htmlFor="template-public" className="text-sm font-normal">
                      Make this template public (share with other users)
                    </Label>



                    <div className="bg-muted p-4 rounded-lg">
                      <h4 className="text-sm font-semibold mb-2">Current Layout Preview</h4>
                      <div className="space-y-1 text-sm text-muted-foreground">
                        <div>Widgets: {currentLayout.widgets.length}</div>
                        <div>Columns: {currentLayout.columns}</div>

                    </div>


                  <Button
                    onClick={handleSaveCurrentAsTemplate}
                    disabled={!currentLayout || !templateName.trim()}
                    className="w-full"

                    <Upload size={16} className="mr-2" />

                  </Button>
                </div>
              </Card>
            </TabsContent>
          </Tabs>

      </Dialog>

      {previewTemplate && (
        <Dialog open={!!previewTemplate} onOpenChange={() => setPreviewTemplate(null)}>
          <DialogContent className="max-w-2xl">

              <DialogTitle>{previewTemplate.name}</DialogTitle>
            </DialogHeader>

            <div className="space-y-4">
              <div>
                <span className="font-medium">Description:</span>
                <p className="text-sm text-muted-foreground mt-1">{previewTemplate.description}</p>


                <span className="font-medium">Configuration:</span>
                <div className="text-sm text-muted-foreground mt-1">
                  {previewTemplate.widgets.length} widgets, {previewTemplate.columns} columns
                </div>
              </div>

              <div>
                <h4 className="font-medium mb-2">Widgets Included:</h4>

                  {previewTemplate.widgets.map((widget, index) => (
                    <div key={widget.id} className="flex items-center justify-between p-2 bg-muted rounded">
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-muted-foreground">{index + 1}.</span>
                        <span className="text-sm">{widget.title}</span>

                      <Badge variant="outline" className="text-xs">{widget.size}</Badge>

                  ))}

              </div>



              <Button variant="outline" onClick={() => setPreviewTemplate(null)}>
                Close
              </Button>
              <Button onClick={() => {
                handleApplyTemplate(previewTemplate)
                setPreviewTemplate(null)
              }}>

                Apply Template

            </DialogFooter>

        </Dialog>

    </>

}
