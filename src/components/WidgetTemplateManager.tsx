import React, { useState } from 'react'
import { Card } from '@/components/ui/card'
import { Textarea } from '@/components/ui/t
import { Separator } from '@/components/ui/se
import { ScrollArea } from '@/components/ui/scroll-
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } f
import {
  Star,
  Upload,
  Layout,
} from '@phosphor-icons/react'
  SystemRole,
  DashboardLayout,
} from '

  id: s
  descripti
  isPubli
  targ
  columns
  tags:
  rating: number
  update

  open: boo
  currentRole: Sys
  onApplyTemplate
 
  'channel-sync-status': 'Channel Sync Status',
  'booking-source': 'Booking Sou
}
const CATEGORY_LABELS = {
  executive: 'Executive',
  analytical: 'Analytical',
}
const CATEGORY_DESCRIPTIONS = {
  executive: 'High-level overview templates f
  analytical: 'Data-driven temp
  widgets: DashboardWidget[]
export function WidgetTemplateManager({
  onOpenChange,
  currentLayout,
  onSaveAsTemplate
  const [selectedTemplate, setSelectedTemplate] = use
  const [templateName, setTemplateName] = u
  const [templateCategory, setTemplateCateg
  const [templateIsPublic, setTemplateIsPubli

  const availableWidgets = getAvailableWidgets(
  const sampleTemplates: WidgetTemplate[] =
      id: 'tpl-exec-1',
      description: 'Comprehensive o
      isPublic: true,
      targetRoles: ['admin', 'manager'],
  'crm-summary': 'CRM Summary',
        { id: 'w3', type: 'financial-
        { id: 'w5', type: 'department-
 

      usage: 156,
      createdAt: Date.now() -
    },
      id: 'tpl-ops-1',
      description: 'Real-ti
      isPublic: tr
 

        { id: 'w3', type: 'hous
        { id: 'w5', type: 'guest-feedback', title: 'Guest Feedback', size: 'medi
      ],
      category: 'operational',
      usage: 243,
      createdAt: Date.now() - 60 * 24 * 60 * 60 * 100
 

      description: 'Comprehensive Food 
      i
      targetRol
        { id: 
        { id: 'w
        { id: 'w5'
      columns: 2,
      tags: ['fnb', 'kitchen', '
      rating: 4.7,
      updatedAt: Date.now() - 10 * 24 * 60 * 60 * 1000
    {
      name: 'Business Intelligence',
      author: 'System',
      usage: 156,
      createdAt: Date.now() -
  const [previewTemplate, setPreviewTemplate] = useState<WidgetTemplate | null>(null)
  const rolePreset = getRoleWidgetPresets(currentRole)
      description: 'Real-ti
      isPublic: tr
  WidgetTemplate[] = [

        { id: 'w3', type: 'hous
        { id: 'w5', type: 'guest-feedback', title: 'Guest Feedback', size: 'medi
      ],rehensive overview for senior management with key performance indicators, revenue trends, and strategic metrics',
      category: 'operational',
      usage: 243,
      createdAt: Date.now() - 60 * 24 * 60 * 60 * 100
 

      description: 'Comprehensive Food 
      iw2', type: 'occupancy', title: 'Occupancy Rate', size: 'small', position: 1, isVisible: true },
      targetRolcial-summary', title: 'Financial Summary', size: 'large', position: 2, isVisible: true },
        { id: itle: 'Revenue Trends', size: 'large', position: 3, isVisible: true },
        { id: 'w size: 'large', position: 4, isVisible: true },
        { id: 'w5'performance', title: 'Channel Performance', size: 'large', position: 5, isVisible: true }
      columns: 2,
      tags: ['fnb', 'kitchen', '
      rating: 4.7,
      updatedAt: Date.now() - 10 * 24 * 60 * 60 * 1000
      usage: 156,
      rating: 4.8,
      createdAt: Date.now() - 90 * 24 * 60 * 60 * 1000,
      isDefault: false,
    },
    {
      id: 'tpl-ops-1',
      name: 'Operations Command Center',
      description: 'Real-time operations dashboard for front desk and management with focus on daily tasks and guest services',

  const sampleTemplates: WidgetTemplate[] = [
    {
      id: 'tpl-exec-1',
      name: 'Executive Dashboard',
        { id: 'w1', type: 'arrivals-departures', title: 'Arrivals & Departures', size: 'large', position: 0, isVisible: true },
        { id: 'w2', type: 'room-status', title: 'Room Status', size: 'large', position: 1, isVisible: true },
        { id: 'w3', type: 'housekeeping', title: 'Housekeeping', size: 'small', position: 2, isVisible: true },
        { id: 'w4', type: 'occupancy', title: 'Occupancy', size: 'small', position: 3, isVisible: true },
        { id: 'w5', type: 'guest-feedback', title: 'Guest Feedback', size: 'medium', position: 4, isVisible: true },
        { id: 'w6', type: 'pending-approvals', title: 'Pending Tasks', size: 'medium', position: 5, isVisible: true }
      ],
      columns: 2,
      category: 'operational',
      tags: ['operations', 'front-desk', 'daily', 'guest-services'],
      usage: 243,
      rating: 4.9,
      ],
      updatedAt: Date.now() - 15 * 24 * 60 * 60 * 1000
    },
    {
      usage: 156,
      rating: 4.8,
      createdAt: Date.now() - 90 * 24 * 60 * 60 * 1000,
      updatedAt: Date.now() - 30 * 24 * 60 * 60 * 1000
    },
    {
      id: 'tpl-ops-1',
      name: 'Operations Command Center',
      description: 'Real-time operations dashboard for front desk and management with focus on daily tasks and guest services',
      author: 'System',
      isPublic: true,
      isDefault: false,
      targetRoles: ['front-desk', 'manager'],
      widgets: [
        { id: 'w1', type: 'arrivals-departures', title: 'Arrivals & Departures', size: 'large', position: 0, isVisible: true },
        { id: 'w2', type: 'room-status', title: 'Room Status', size: 'large', position: 1, isVisible: true },
        { id: 'w3', type: 'housekeeping', title: 'Housekeeping', size: 'small', position: 2, isVisible: true },
        { id: 'w4', type: 'occupancy', title: 'Occupancy', size: 'small', position: 3, isVisible: true },
        { id: 'w5', type: 'guest-feedback', title: 'Guest Feedback', size: 'medium', position: 4, isVisible: true },
        { id: 'w6', type: 'pending-approvals', title: 'Pending Tasks', size: 'medium', position: 5, isVisible: true }
      ],
      columns: 2,
      category: 'operational',
      tags: ['operations', 'front-desk', 'daily', 'guest-services'],
      usage: 243,
      rating: 4.9,
      createdAt: Date.now() - 60 * 24 * 60 * 60 * 1000,
      updatedAt: Date.now() - 15 * 24 * 60 * 60 * 1000
    },
    {
      id: 'tpl-fnb-1',
      name: 'F&B Excellence',
      description: 'Comprehensive Food & Beverage dashboard for kitchen operations, inventory management, and service quality',
      author: 'System',
      isPublic: true,
      isDefault: false,
      targetRoles: ['chef', 'waiter'],
      widgets: [
        { id: 'w1', type: 'kitchen-operations', title: 'Kitchen Operations', size: 'large', position: 0, isVisible: true },
        { id: 'w2', type: 'fnb-performance', title: 'F&B Performance', size: 'medium', position: 1, isVisible: true },
        { id: 'w3', type: 'food-inventory', title: 'Food Inventory', size: 'small', position: 2, isVisible: true },
        { id: 'w4', type: 'low-stock', title: 'Low Stock Alert', size: 'large', position: 3, isVisible: true },
        { id: 'w5', type: 'guest-feedback', title: 'Guest Feedback', size: 'medium', position: 4, isVisible: true }
      ],
      columns: 2,
      category: 'departmental',
      tags: ['fnb', 'kitchen', 'food', 'service'],
      usage: 89,
      rating: 4.7,
      createdAt: Date.now() - 45 * 24 * 60 * 60 * 1000,
      updatedAt: Date.now() - 10 * 24 * 60 * 60 * 1000
    },
    {
      id: 'tpl-analytics-1',
      name: 'Business Intelligence',
      description: 'Advanced analytics dashboard with charts, trends, and comparative metrics for data-driven decision making',
      author: 'System',
      isPublic: true,
      isDefault: false,
        { id: 'w5', type: 'arrivals-departures', title: 'Arrivals & Departures', size: 'medium', position: 4, isVisible: true },
        { id: 'w6', type: 'low-stock', title: 'Low Stock Items', size: 'large', position: 5, isVisible: true }
      ],
      columns: 2,
      category: 'departmental',
      tags: ['housekeeping', 'rooms', 'cleaning', 'amenities'],
      usage: 67,
      rating: 4.5,
      createdAt: Date.now() - 40 * 24 * 60 * 60 * 1000,
      updatedAt: Date.now() - 8 * 24 * 60 * 60 * 1000
    },
    {
      id: 'tpl-finance-1',
      name: 'Financial Control Center',
      description: 'Complete financial overview with revenue tracking, expense monitoring, and approval workflows',
      author: 'System',
      isPublic: true,
      isDefault: false,
      targetRoles: ['accountant', 'accounts', 'admin'],
      widgets: [
        { id: 'w1', type: 'revenue-today', title: 'Today\'s Revenue', size: 'small', position: 0, isVisible: true },
        { id: 'w2', type: 'financial-summary', title: 'Financial Summary', size: 'large', position: 1, isVisible: true },
        { id: 'w3', type: 'pending-approvals', title: 'Pending Approvals', size: 'medium', position: 2, isVisible: true },
        { id: 'w4', type: 'revenue-chart', title: 'Revenue Trends', size: 'large', position: 3, isVisible: true },
        { id: 'w5', type: 'channel-performance', title: 'Channel Revenue', size: 'large', position: 4, isVisible: true },
        { id: 'w6', type: 'department-performance', title: 'Department P&L', size: 'large', position: 5, isVisible: true }
      ],
      columns: 2,
      category: 'departmental',
      tags: ['finance', 'accounting', 'revenue', 'expenses'],
      usage: 98,
      rating: 4.7,
      createdAt: Date.now() - 35 * 24 * 60 * 60 * 1000,
      updatedAt: Date.now() - 7 * 24 * 60 * 60 * 1000
    },
    {
      id: 'tpl-maintenance-1',
      name: 'Maintenance & Engineering',
      description: 'Engineering dashboard focused on maintenance requests, construction projects, and asset management',
      author: 'System',
      isPublic: true,
      isDefault: false,
      targetRoles: ['engineer'],
      widgets: [
        { id: 'w1', type: 'maintenance-status', title: 'Maintenance Requests', size: 'large', position: 0, isVisible: true },
        { id: 'w2', type: 'maintenance-construction', title: 'Projects', size: 'medium', position: 1, isVisible: true },
        { id: 'w3', type: 'room-status', title: 'Room Status', size: 'large', position: 2, isVisible: true },
        { id: 'w4', type: 'low-stock', title: 'Materials Stock', size: 'medium', position: 3, isVisible: true },
        { id: 'w5', type: 'pending-approvals', title: 'Pending Approvals', size: 'medium', position: 4, isVisible: true },
        { id: 'w6', type: 'occupancy', title: 'Occupancy', size: 'small', position: 5, isVisible: true }
      ],
      columns: 2,
      category: 'departmental',
      tags: ['maintenance', 'engineering', 'construction', 'assets'],
      usage: 45,
      rating: 4.4,
      createdAt: Date.now() - 50 * 24 * 60 * 60 * 1000,
      updatedAt: Date.now() - 12 * 24 * 60 * 60 * 1000
    },
    {
      id: 'tpl-inventory-1',
      name: 'Inventory Master',
      description: 'Comprehensive inventory management dashboard for procurement and stock control across all categories',
      author: 'System',
      isPublic: true,
      isDefault: false,
      targetRoles: ['procurement-manager', 'storekeeper'],
      widgets: [
        { id: 'w1', type: 'low-stock', title: 'Low Stock Alert', size: 'large', position: 0, isVisible: true },
        { id: 'w2', type: 'food-inventory', title: 'Food Inventory', size: 'small', position: 1, isVisible: true },
        { id: 'w3', type: 'amenities-stock', title: 'Amenities Stock', size: 'small', position: 2, isVisible: true },
        { id: 'w4', type: 'maintenance-construction', title: 'Materials', size: 'small', position: 3, isVisible: true },
        { id: 'w5', type: 'pending-approvals', title: 'Purchase Orders', size: 'medium', position: 4, isVisible: true },
        { id: 'w6', type: 'occupancy', title: 'Occupancy', size: 'small', position: 5, isVisible: true }
      ],
      columns: 2,
      category: 'departmental',
      tags: ['inventory', 'procurement', 'stock', 'purchasing'],
      usage: 76,
      rating: 4.6,
      createdAt: Date.now() - 55 * 24 * 60 * 60 * 1000,
      updatedAt: Date.now() - 9 * 24 * 60 * 60 * 1000
    }
  ]

  const handleApplyTemplate = (template: WidgetTemplate) => {
    const newLayout: DashboardLayout = {
      id: `layout-${Date.now()}`,
      userId: currentLayout?.userId,
      userRole: currentRole,
      name: template.name,
      description: template.description,
      isDefault: false,
      isShared: false,
      widgets: template.widgets.map((w, index) => ({
        ...w,
        id: `widget-${Date.now()}-${index}`,
        position: index
      })),
      columns: template.columns,
      createdAt: Date.now(),
      updatedAt: Date.now(),
      createdBy: currentLayout?.createdBy || 'current-user'
    }

    onApplyTemplate(newLayout)
    toast.success(`Template "${template.name}" applied successfully`)
    onOpenChange(false)
  }

  const handleSaveCurrentAsTemplate = () => {
    if (!currentLayout || !templateName.trim()) {
      toast.error('Please provide a template name')
      return
    }

    const newTemplate: WidgetTemplate = {
      id: `tpl-custom-${Date.now()}`,
      name: templateName.trim(),
      description: templateDescription.trim() || 'Custom dashboard template',
      author: currentLayout.createdBy,
      isPublic: templateIsPublic,
      isDefault: false,
      targetRoles: [currentRole],
      widgets: currentLayout.widgets,
      columns: currentLayout.columns,
      category: templateCategory,
      tags: templateTags.split(',').map(t => t.trim()).filter(Boolean),
      usage: 0,
      rating: 0,
      createdAt: Date.now(),
      updatedAt: Date.now()
    }

    onSaveAsTemplate(newTemplate)
    toast.success(`Template "${newTemplate.name}" saved successfully`)
    setShowCreateDialog(false)
    setTemplateName('')
    setTemplateDescription('')
    setTemplateTags('')
    setTemplateCategory('custom')
    setTemplateIsPublic(false)
  }

  const roleRelevantTemplates = sampleTemplates.filter(t =>
    t.targetRoles.includes(currentRole)
  )

  const allTemplates = sampleTemplates

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-7xl max-h-[90vh] p-0">
          <DialogHeader className="dialog-header-fixed">
            <DialogTitle className="flex items-center gap-2">
              <Layout size={24} className="text-primary" />
              Widget Templates
            </DialogTitle>
            <DialogDescription>
              Choose from pre-built templates or create your own custom dashboard layout
            </DialogDescription>
          </DialogHeader>

          <div className="dialog-body-scrollable">
            <Tabs defaultValue="recommended" className="w-full">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="recommended">
                  <Star size={16} className="mr-2" />
                  Recommended
                </TabsTrigger>
                <TabsTrigger value="all">
                  <Layout size={16} className="mr-2" />
                  All Templates
                </TabsTrigger>
                <TabsTrigger value="role">
                  <Users size={16} className="mr-2" />
                  My Role
                </TabsTrigger>
                <TabsTrigger value="create">
                  <Plus size={16} className="mr-2" />
                  Create New
                </TabsTrigger>
              </TabsList>

              <TabsContent value="recommended" className="space-y-4 mt-4">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold">Recommended for {currentRole}</h3>
                    <Badge variant="secondary">{roleRelevantTemplates.length} templates</Badge>
                  </div>

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

                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
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
                        </div>
                      </Card>
                    ))}
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
                          <div>
                            <div className="space-y-1">
                          

                                    {rolePreset.layout.widgetSizes[widget]}
                                </div>
                            </div>

                            <h5 className="font-medium mb-2 text-sm">Recommend
                              {rolePreset.recommendedW
                                  <Plus size={16} />
                                  <Badge variant="secondary" className="text-xs ml-a
                                  </Badge>
                              ))}
                          </div>


                          <div class
                          </div>

                              name: rolePreset.name,
                              author: 'System',
                              isDefault: true,
                              widgets: rolePreset.defaultWidgets.map(
                                type,
                                size: rolePreset.layout.widgetSizes[type
                                isVisible: true
                              columns: rolePreset.layout.col
                              tags: [
                              rati

                            handleApplyTemplate(template)
                            <Download size={16} className="mr-2" />
                          </Button>
                      </div>
                  )}
              </TabsContent>
              <TabsContent value="

                      <h3 className="text-lg font-semibold">Save Curre
                        Create a reus
                    </div>
                    <Separator />
                    <div className="space-y-4">
                        <Label htmlFor="template-name">Template Name *</Labe
                          id="t
                          value={templateName}
                        />

                        <Label htmlFo
                          id="template-de
                          value={templateDescripti
                          rows={3}
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 g
                          <Label html
                            <SelectTrig
                            </Sele
                              {O
                               
                         
                          

                   
                            

                          />
                      </div>
                      <
                          id="template-public"
                          onCheckedChange={(checked) => setTempla
                        <Label htmlFor="template-public" className
                        


                          <div cla
                            <div>Columns: 
                          </div>
                      )}


                      <Button 

                        <Upload size=

                  </div>
              </TabsContent>
          </div>
      </Dialog>
      {previewTemplate && (
          <DialogContent className="max-w-4xl">
              <DialogTitle>{previewTemplate.name} - Preview</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
                <div>
                </div>
                  <span className="fon
                <div>
                </div>
                  <span classNam

              <Separator />
              <div>
                <div className="space-y-2">
                    <div key={widget.id} className="flex items-center justify-
                        <span className="text-xs font-medium text-muted-foreground">#{index + 1}</span>
                      </div>
                    </div>
                </div>
            </div>
            <DialogFooter>
                Close
              <Button onClick={()
                setPreviewTemplate
                <Download size={
              </Button>

      )}














































































































































































































