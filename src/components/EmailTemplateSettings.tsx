import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Plus, Pencil, Trash, Copy, Eye, Sparkle, EnvelopeSimple } from '@phosphor-icons/react'
import { toast } from 'sonner'
import { EmailTemplate, AVAILABLE_VARIABLES, TemplateVariable, DEFAULT_TEMPLATES } from '@/lib/invoiceEmailTemplates'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Switch } from '@/components/ui/switch'

interface EmailTemplateManagementProps {
  templates: EmailTemplate[]
  setTemplates: React.Dispatch<React.SetStateAction<EmailTemplate[]>>
  currentUser: { id: string; firstName: string; lastName: string }
}

export function EmailTemplateManagement({ templates, setTemplates, currentUser }: EmailTemplateManagementProps) {
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingTemplate, setEditingTemplate] = useState<EmailTemplate | null>(null)
  const [previewDialogOpen, setPreviewDialogOpen] = useState(false)
  const [previewTemplate, setPreviewTemplate] = useState<EmailTemplate | null>(null)
  const [selectedCategory, setSelectedCategory] = useState<'all' | 'guest' | 'invoice' | 'hotel' | 'payment' | 'dates'>('all')

  const handleAddTemplate = () => {
    setEditingTemplate(null)
    setDialogOpen(true)
  }

  const handleEditTemplate = (template: EmailTemplate) => {
    setEditingTemplate(template)
    setDialogOpen(true)
  }

  const handleDeleteTemplate = (id: string) => {
    setTemplates((current) => current.filter(t => t.id !== id))
    toast.success('Email template deleted')
  }

  const handleDuplicateTemplate = (template: EmailTemplate) => {
    const newTemplate: EmailTemplate = {
      ...template,
      id: `tpl-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      name: `${template.name} (Copy)`,
      isDefault: false,
      createdAt: Date.now(),
      updatedAt: Date.now(),
      createdBy: currentUser.id,
    }
    setTemplates((current) => [...current, newTemplate])
    toast.success('Template duplicated')
  }

  const handlePreview = (template: EmailTemplate) => {
    setPreviewTemplate(template)
    setPreviewDialogOpen(true)
  }

  const handleLoadDefaults = () => {
    const defaultTemplates: EmailTemplate[] = DEFAULT_TEMPLATES.map(tpl => ({
      ...tpl,
      id: `tpl-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      createdAt: Date.now(),
      updatedAt: Date.now(),
      createdBy: currentUser.id,
    }))
    
    setTemplates((current) => {
      const existing = current.filter(t => !t.isDefault)
      return [...existing, ...defaultTemplates]
    })
    toast.success('Default templates loaded')
  }

  const filteredVariables = selectedCategory === 'all' 
    ? AVAILABLE_VARIABLES 
    : AVAILABLE_VARIABLES.filter(v => v.category === selectedCategory)

  const invoiceTypes = [
    { value: 'all', label: 'All Invoice Types' },
    { value: 'guest-folio', label: 'Guest Folio Invoice' },
    { value: 'room-only', label: 'Room Only' },
    { value: 'fnb', label: 'F&B Invoice' },
    { value: 'extras', label: 'Extras Invoice' },
    { value: 'group-master', label: 'Group Master' },
    { value: 'proforma', label: 'Proforma' },
    { value: 'credit-note', label: 'Credit Note' },
    { value: 'debit-note', label: 'Debit Note' },
  ]

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold">Email Templates</h2>
          <p className="text-muted-foreground mt-1">
            Manage invoice email templates with dynamic variables
          </p>
        </div>
        <div className="flex gap-2">
          {templates.length === 0 && (
            <Button onClick={handleLoadDefaults} variant="outline">
              <Sparkle size={18} className="mr-2" />
              Load Defaults
            </Button>
          )}
          <Button onClick={handleAddTemplate}>
            <Plus size={18} className="mr-2" />
            New Template
          </Button>
        </div>
      </div>

      {templates.length === 0 ? (
        <Card className="p-12 text-center">
          <EnvelopeSimple size={64} className="mx-auto text-muted-foreground mb-4" />
          <h3 className="text-xl font-semibold mb-2">No Email Templates</h3>
          <p className="text-muted-foreground mb-6">
            Create custom email templates with dynamic variables for your invoices
          </p>
          <div className="flex gap-3 justify-center">
            <Button onClick={handleLoadDefaults} variant="outline">
              <Sparkle size={18} className="mr-2" />
              Load Default Templates
            </Button>
            <Button onClick={handleAddTemplate}>
              <Plus size={18} className="mr-2" />
              Create New Template
            </Button>
          </div>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {templates.map((template) => (
            <Card key={template.id} className="p-4">
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <h3 className="font-semibold text-lg">{template.name}</h3>
                  <p className="text-sm text-muted-foreground capitalize mt-1">
                    {template.invoiceType.replace('-', ' ')}
                  </p>
                </div>
                <div className="flex gap-1">
                  {template.isDefault && (
                    <Badge variant="secondary" className="text-xs">Default</Badge>
                  )}
                  {template.isActive && (
                    <Badge variant="outline" className="text-xs bg-success/10 text-success border-success/20">Active</Badge>
                  )}
                </div>
              </div>

              <Separator className="my-3" />

              <div className="space-y-2 mb-4">
                <div>
                  <p className="text-xs text-muted-foreground">Subject</p>
                  <p className="text-sm line-clamp-1">{template.subject}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Variables</p>
                  <p className="text-sm">{template.variables.length} available</p>
                </div>
              </div>

              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  className="flex-1"
                  onClick={() => handlePreview(template)}
                >
                  <Eye size={16} className="mr-1" />
                  Preview
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleEditTemplate(template)}
                >
                  <Pencil size={16} />
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleDuplicateTemplate(template)}
                >
                  <Copy size={16} />
                </Button>
                {!template.isDefault && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleDeleteTemplate(template.id)}
                  >
                    <Trash size={16} />
                  </Button>
                )}
              </div>
            </Card>
          ))}
        </div>
      )}

      <TemplateEditorDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        template={editingTemplate}
        onSave={(template) => {
          if (editingTemplate) {
            setTemplates((current) =>
              current.map(t => t.id === editingTemplate.id ? template : t)
            )
            toast.success('Template updated')
          } else {
            setTemplates((current) => [...current, template])
            toast.success('Template created')
          }
          setDialogOpen(false)
        }}
        currentUser={currentUser}
      />

      <Dialog open={previewDialogOpen} onOpenChange={setPreviewDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh]">
          <DialogHeader>
            <DialogTitle>Template Preview: {previewTemplate?.name}</DialogTitle>
            <DialogDescription>
              This is how the email will look with sample data
            </DialogDescription>
          </DialogHeader>
          
          {previewTemplate && (
            <Tabs defaultValue="html" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="html">HTML Preview</TabsTrigger>
                <TabsTrigger value="text">Plain Text</TabsTrigger>
              </TabsList>
              
              <TabsContent value="html" className="border rounded-lg p-4 bg-white">
                <div className="mb-4 p-3 bg-muted rounded">
                  <p className="text-sm font-semibold">Subject:</p>
                  <p className="text-sm">{previewTemplate.subject}</p>
                </div>
                <ScrollArea className="h-[500px]">
                  <div dangerouslySetInnerHTML={{ __html: previewTemplate.bodyHtml }} />
                </ScrollArea>
              </TabsContent>
              
              <TabsContent value="text">
                <div className="mb-4 p-3 bg-muted rounded">
                  <p className="text-sm font-semibold">Subject:</p>
                  <p className="text-sm">{previewTemplate.subject}</p>
                </div>
                <ScrollArea className="h-[500px]">
                  <pre className="text-sm whitespace-pre-wrap font-mono p-4 bg-muted rounded">
                    {previewTemplate.bodyPlainText}
                  </pre>
                </ScrollArea>
              </TabsContent>
            </Tabs>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}

interface TemplateEditorDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  template: EmailTemplate | null
  onSave: (template: EmailTemplate) => void
  currentUser: { id: string; firstName: string; lastName: string }
}

function TemplateEditorDialog({ open, onOpenChange, template, onSave, currentUser }: TemplateEditorDialogProps) {
  const [formData, setFormData] = useState<Partial<EmailTemplate>>(
    template || {
      name: '',
      invoiceType: 'all',
      subject: '',
      bodyPlainText: '',
      bodyHtml: '',
      isActive: true,
      isDefault: false,
      variables: AVAILABLE_VARIABLES,
    }
  )
  const [selectedCategory, setSelectedCategory] = useState<'all' | 'guest' | 'invoice' | 'hotel' | 'payment' | 'dates'>('all')

  const handleSave = () => {
    if (!formData.name || !formData.subject || !formData.bodyPlainText) {
      toast.error('Please fill in all required fields')
      return
    }

    const now = Date.now()
    const savedTemplate: EmailTemplate = {
      id: template?.id || `tpl-${now}-${Math.random().toString(36).substr(2, 9)}`,
      name: formData.name!,
      invoiceType: formData.invoiceType!,
      subject: formData.subject!,
      bodyPlainText: formData.bodyPlainText!,
      bodyHtml: formData.bodyHtml || formData.bodyPlainText!,
      isActive: formData.isActive!,
      isDefault: formData.isDefault!,
      variables: AVAILABLE_VARIABLES,
      createdAt: template?.createdAt || now,
      updatedAt: now,
      createdBy: template?.createdBy || currentUser.id,
    }

    onSave(savedTemplate)
  }

  const insertVariable = (variable: string, field: 'subject' | 'bodyPlainText' | 'bodyHtml') => {
    setFormData(current => ({
      ...current,
      [field]: (current[field] || '') + variable
    }))
    toast.success(`Variable ${variable} inserted`)
  }

  const filteredVariables = selectedCategory === 'all' 
    ? AVAILABLE_VARIABLES 
    : AVAILABLE_VARIABLES.filter(v => v.category === selectedCategory)

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-6xl max-h-[95vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{template ? 'Edit Template' : 'New Email Template'}</DialogTitle>
          <DialogDescription>
            Create custom email templates with dynamic variables
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-3 gap-6">
          <div className="col-span-2 space-y-4">
            <div>
              <Label htmlFor="name">Template Name *</Label>
              <Input
                id="name"
                value={formData.name || ''}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g., Standard Guest Invoice"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="invoiceType">Invoice Type</Label>
                <Select
                  value={formData.invoiceType || 'all'}
                  onValueChange={(value) => setFormData({ ...formData, invoiceType: value as any })}
                >
                  <SelectTrigger id="invoiceType">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="guest-folio">Guest Folio</SelectItem>
                    <SelectItem value="room-only">Room Only</SelectItem>
                    <SelectItem value="fnb">F&B</SelectItem>
                    <SelectItem value="extras">Extras</SelectItem>
                    <SelectItem value="group-master">Group Master</SelectItem>
                    <SelectItem value="proforma">Proforma</SelectItem>
                    <SelectItem value="credit-note">Credit Note</SelectItem>
                    <SelectItem value="debit-note">Debit Note</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center gap-4 pt-8">
                <div className="flex items-center gap-2">
                  <Switch
                    id="isActive"
                    checked={formData.isActive}
                    onCheckedChange={(checked) => setFormData({ ...formData, isActive: checked })}
                  />
                  <Label htmlFor="isActive">Active</Label>
                </div>
                <div className="flex items-center gap-2">
                  <Switch
                    id="isDefault"
                    checked={formData.isDefault}
                    onCheckedChange={(checked) => setFormData({ ...formData, isDefault: checked })}
                  />
                  <Label htmlFor="isDefault">Default</Label>
                </div>
              </div>
            </div>

            <div>
              <Label htmlFor="subject">Email Subject *</Label>
              <Input
                id="subject"
                value={formData.subject || ''}
                onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                placeholder="Your Invoice from {{hotel_name}} - {{invoice_number}}"
              />
            </div>

            <div>
              <Label htmlFor="bodyPlainText">Plain Text Body *</Label>
              <Textarea
                id="bodyPlainText"
                value={formData.bodyPlainText || ''}
                onChange={(e) => setFormData({ ...formData, bodyPlainText: e.target.value })}
                rows={10}
                placeholder="Dear {{guest_name}},&#10;&#10;Thank you for staying with us..."
                className="font-mono text-sm"
              />
            </div>

            <div>
              <Label htmlFor="bodyHtml">HTML Body (optional)</Label>
              <Textarea
                id="bodyHtml"
                value={formData.bodyHtml || ''}
                onChange={(e) => setFormData({ ...formData, bodyHtml: e.target.value })}
                rows={10}
                placeholder="<html>...</html>"
                className="font-mono text-sm"
              />
            </div>
          </div>

          <div className="col-span-1 border-l pl-6">
            <h3 className="font-semibold mb-3">Available Variables</h3>
            
            <Select value={selectedCategory} onValueChange={(value: any) => setSelectedCategory(value)}>
              <SelectTrigger className="mb-3">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Variables</SelectItem>
                <SelectItem value="guest">Guest Info</SelectItem>
                <SelectItem value="invoice">Invoice Details</SelectItem>
                <SelectItem value="hotel">Hotel Info</SelectItem>
                <SelectItem value="payment">Payment Info</SelectItem>
                <SelectItem value="dates">Dates & Times</SelectItem>
              </SelectContent>
            </Select>

            <ScrollArea className="h-[600px]">
              <div className="space-y-3">
                {filteredVariables.map((variable) => (
                  <Card key={variable.key} className="p-3">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <p className="font-mono text-xs text-primary font-semibold">{variable.key}</p>
                        <p className="text-sm font-medium mt-1">{variable.name}</p>
                      </div>
                      <Badge variant="outline" className="text-xs capitalize">
                        {variable.category}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground mb-2">{variable.description}</p>
                    <p className="text-xs italic text-muted-foreground mb-2">Example: {variable.example}</p>
                    <div className="flex gap-1">
                      <Button
                        size="sm"
                        variant="outline"
                        className="text-xs"
                        onClick={() => insertVariable(variable.key, 'subject')}
                      >
                        → Subject
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="text-xs"
                        onClick={() => insertVariable(variable.key, 'bodyPlainText')}
                      >
                        → Body
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="text-xs"
                        onClick={() => insertVariable(variable.key, 'bodyHtml')}
                      >
                        → HTML
                      </Button>
                    </div>
                  </Card>
                ))}
              </div>
            </ScrollArea>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave}>
            {template ? 'Update Template' : 'Create Template'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
