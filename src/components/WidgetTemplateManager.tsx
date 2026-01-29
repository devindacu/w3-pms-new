import React, { useState } from 'react'
import { Button } from '@/components/ui/but
import { Input } from '@/components/ui/input'
import { Separator } from '@/components/ui/separator'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Separator } from '@/components/ui/separator'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
  Download,
import {
} from 
  Upload,
  descrip
  isPub
  targetRol
  colu
  tags:
  usage: number
  updatedAt: 

  DashboardLayout,
  DashboardWidget
} from '@/lib/types'
import { getAvailableWidgets, getRoleWidgetPresets } from '@/lib/widgetConfig'

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
  'fnb-performa
  onOpenChange: (open: boolean) => void
  currentRole: SystemRole
  currentLayout?: DashboardLayout | null
  onApplyTemplate: (layout: DashboardLayout) => void
  onSaveAsTemplate?: (template: WidgetTemplate) => void
 

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
  'department-performance': 'Department Performance',
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
  departmental: 'Departmental',
  analytical: 'Analytical',
  custom: 'Custom'
}

const CATEGORY_DESCRIPTIONS: Record<WidgetTemplate['category'], string> = {
  executive: 'High-level overview templates for senior management',
  operational: 'Day-to-day operations and task management',
  departmental: 'Department-specific dashboards',
  analytical: 'Data-driven templates with charts and insights',
  custom: 'User-created custom templates'
}

      isPublic: true,
  open,
        { id: '
  currentRole,
        { id: 'w
  onApplyTemplate,
      category: 'd
}: WidgetTemplateManagerProps) {
  const [selectedTemplate, setSelectedTemplate] = useState<WidgetTemplate | null>(null)
    }
  const [templateName, setTemplateName] = useState('')
  const [templateDescription, setTemplateDescription] = useState('')
  const [templateCategory, setTemplateCategory] = useState<WidgetTemplate['category']>('custom')
  const [templateTags, setTemplateTags] = useState('')
  const [templateIsPublic, setTemplateIsPublic] = useState(false)

        id: `widget-${Date.now()}-${index}`,

      createdAt: Date.now(),
     

    toast.success(`Template "${tem
      description: 'Comprehensive overview for senior management with key performance indicators, revenue trends, and strategic metrics',
      author: 'System',
      isPublic: true,
      isDefault: false,
      targetRoles: ['admin', 'manager'],
      widgets: [
        { id: 'w1', type: 'revenue-today', title: "Today's Revenue", size: 'small', position: 0, isVisible: true, refreshInterval: 60000 },
        { id: 'w2', type: 'occupancy', title: 'Occupancy Rate', size: 'small', position: 1, isVisible: true, refreshInterval: 60000 },
        { id: 'w3', type: 'financial-summary', title: 'Financial Summary', size: 'large', position: 2, isVisible: true, refreshInterval: 60000 },
        { id: 'w4', type: 'revenue-chart', title: 'Revenue Trends', size: 'large', position: 3, isVisible: true, refreshInterval: 60000 },
        { id: 'w5', type: 'department-performance', title: 'Department Performance', size: 'large', position: 4, isVisible: true, refreshInterval: 60000 },
        { id: 'w6', type: 'channel-performance', title: 'Channel Performance', size: 'large', position: 5, isVisible: true, refreshInterval: 60000 }
      ta
      rating: 0,
      category: 'executive',
      tags: ['executive', 'revenue', 'kpi', 'management'],
    toast.success
    setTemplateDes
    setTemplateCategory('custom')
  }
  cons
  )
  const allTemplates =
  return (
      <Dialog open={open} onOpenChange={onOpenChange}>
          <DialogHeader
              <Layout
      isDefault: false,
              Choose from pre-built templates
          </Dial
        { id: 'w1', type: 'arrivals-departures', title: 'Arrivals & Departures', size: 'large', position: 0, isVisible: true, refreshInterval: 60000 },
        { id: 'w2', type: 'room-status', title: 'Room Status', size: 'large', position: 1, isVisible: true, refreshInterval: 60000 },
        { id: 'w3', type: 'housekeeping', title: 'Housekeeping', size: 'small', position: 2, isVisible: true, refreshInterval: 60000 },
        { id: 'w4', type: 'occupancy', title: 'Occupancy', size: 'small', position: 3, isVisible: true, refreshInterval: 60000 },
        { id: 'w5', type: 'guest-feedback', title: 'Guest Feedback', size: 'medium', position: 4, isVisible: true, refreshInterval: 60000 },
        { id: 'w6', type: 'pending-approvals', title: 'Pending Tasks', size: 'medium', position: 5, isVisible: true, refreshInterval: 60000 }
        
                <

                <div className="space-y-3">
                 
                  
                  {roleRelevantTemplates.length === 0 ?
                      <p className="text-muted-foregro
      
     
                      
                             
                                  <h4 className="font-semibold">{template.name}</h4>
                       
                     
                       

                
        { id: 'w1', type: 'kitchen-operations', title: 'Kitchen Operations', size: 'large', position: 0, isVisible: true, refreshInterval: 60000 },
        { id: 'w2', type: 'fnb-performance', title: 'F&B Performance', size: 'medium', position: 1, isVisible: true, refreshInterval: 60000 },
        { id: 'w3', type: 'food-inventory', title: 'Food Inventory', size: 'small', position: 2, isVisible: true, refreshInterval: 60000 },
        { id: 'w4', type: 'low-stock', title: 'Low Stock Alert', size: 'large', position: 3, isVisible: true, refreshInterval: 60000 },
        { id: 'w5', type: 'guest-feedback', title: 'Guest Feedback', size: 'medium', position: 4, isVisible: true, refreshInterval: 60000 }
        

                              <
                                  <Star size={14} 
                
                  
                                <Button
                                  variant="outline"
      
     
                          
                                  onCli
                                  <Download size={16} className="mr-1" />
                       
                     
                       
                    </div>
                
        { id: 'w1', type: 'revenue-today', title: "Today's Revenue", size: 'small', position: 0, isVisible: true, refreshInterval: 60000 },
        { id: 'w2', type: 'financial-summary', title: 'Financial Summary', size: 'large', position: 1, isVisible: true, refreshInterval: 60000 },
        { id: 'w3', type: 'pending-approvals', title: 'Pending Approvals', size: 'medium', position: 2, isVisible: true, refreshInterval: 60000 },
        { id: 'w4', type: 'revenue-chart', title: 'Revenue Trends', size: 'large', position: 3, isVisible: true, refreshInterval: 60000 },
        { id: 'w5', type: 'channel-performance', title: 'Channel Revenue', size: 'large', position: 4, isVisible: true, refreshInterval: 60000 },
        { id: 'w6', type: 'department-performance', title: 'Department P&L', size: 'large', position: 5, isVisible: true, refreshInterval: 60000 }
        
                 
                    <div classN
                        <Card key={template.id} className="p-
                
                  
                            <div className="flex items-
                              <Separator orientation=
     
   

                                size="sm"
                                classNam
                              >
      userId: currentLayout?.userId || 'current-user',
                            
                          
                              >
                       
                      
                        </Card>
             
                ))}

          
                    <div>
                      <p cla
                    <Separat
                      <div>
     

                          onCh
                      </div>
                       
   

                          rows={3}
                      </div>
                        <div>
            
     

    if (!onSaveAsTemplate) {
      toast.error('Save template function not available')
      return
    }

                            value={templa
                          />
                      </div>
                        <Checkbox
      author: currentLayout.createdBy || 'current-user',
                        />
                       
                      </div>
                      {currentLayout 
                          <h4 classNa
                            <div>
                          </div>
               
                
                        disa
                      >
     

                </Card>
            </Tabs>
        </DialogContent

        <Dialog open={!
            <DialogHeader>
            </DialogHeader>
   

              <div>
                <div className="text-sm
   

                <h4 className="font-me

          
      
                      <Badge variant="outline" classNa
                  ))}
              </div>
            <DialogFooter>
                Close
              <Button onClick=
                setPreview
                <Download size=
              </Button>
          </DialogContent>
      )}



              <TabsList className="grid w-full grid-cols-3">





















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



                            <div className="flex items-center gap-2 text-sm text-muted-foreground flex-wrap">
                              <Badge variant="outline">{CATEGORY_LABELS[template.category]}</Badge>
                              <Separator orientation="vertical" className="h-4" />
                              <span>{template.widgets.length} widgets</span>
                              <Separator orientation="vertical" className="h-4" />
                              <span>{template.columns} columns</span>
                            </div>

                            <div className="flex flex-wrap gap-1">
                              {template.tags.slice(0, 4).map((tag) => (
                                <Badge key={tag} variant="secondary" className="text-xs">
                                  {tag}
                                </Badge>
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

                        </Card>
                      ))}
                    </div>
                  )}
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









                                className="flex-1"







                                className="flex-1"







                        </Card>
                      ))}
                    </div>

                ))}


              <TabsContent value="create" className="mt-4">
                <Card className="p-6">
                  <div className="space-y-4">

                      <h3 className="text-lg font-semibold">Save Current Layout as Template</h3>
                      <p className="text-sm text-muted-foreground">Create a reusable template from your current dashboard configuration</p>



                      <div>
                        <Label htmlFor="template-name">Template Name *</Label>
                        <Input
                          id="template-name"
                          placeholder="e.g., My Custom Dashboard"

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

                        </div>

                      <div className="flex items-center space-x-2">
                        <Checkbox

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



                        onClick={handleSaveCurrentAsTemplate}
                        disabled={!currentLayout || !templateName.trim()}
                        className="w-full"
                      >
                        <Upload size={16} className="mr-2" />
                        Save as Template
                      </Button>
                    </div>

                </Card>

            </Tabs>

        </DialogContent>



        <Dialog open={!!previewTemplate} onOpenChange={() => setPreviewTemplate(null)}>

            <DialogHeader>



              <div>
                <span className="font-medium">Description:</span>
                <p className="text-sm text-muted-foreground mt-1">{previewTemplate.description}</p>
              </div>
              <div>
                <span className="font-medium">Configuration:</span>
                <div className="text-sm text-muted-foreground mt-1">
                  {previewTemplate.widgets.length} widgets, {previewTemplate.columns} columns

              </div>


                <h4 className="font-medium mb-2">Widgets Included:</h4>

                  {previewTemplate.widgets.map((widget, index) => (
                    <div key={widget.id} className="flex items-center justify-between p-2 bg-muted rounded">
                      <div className="flex items-center gap-2">

                        <span className="text-sm">{widget.title}</span>

                      <Badge variant="outline" className="text-xs">{widget.size}</Badge>

                  ))}

              </div>


              <Button variant="outline" onClick={() => setPreviewTemplate(null)}>


              <Button onClick={() => {
                handleApplyTemplate(previewTemplate)
                setPreviewTemplate(null)
              }}>
                <Download size={16} className="mr-2" />
                Apply Template
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

    </>
  )
}
