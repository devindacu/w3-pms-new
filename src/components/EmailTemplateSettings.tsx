import { useState } from 'react'
import { useKV } from '@github/spark/hooks'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import {
  EnvelopeSimple,
  Plus,
  PencilSimple,
  TrashSimple,
  Copy,
  FloppyDisk,
  Eye,
  Sparkle
} from '@phosphor-icons/react'
import { toast } from 'sonner'
import type { EmailTemplate, SystemUser } from '@/lib/types'

interface EmailTemplateSettingsProps {
  currentUser: SystemUser
}

export function EmailTemplateSettings({ currentUser }: EmailTemplateSettingsProps) {
  const [templates, setTemplates] = useKV<EmailTemplate[]>('w3-hotel-email-templates', [])
  const [editingTemplate, setEditingTemplate] = useState<EmailTemplate | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [previewOpen, setPreviewOpen] = useState(false)
  const [previewTemplate, setPreviewTemplate] = useState<EmailTemplate | null>(null)

  const defaultTemplates: Omit<EmailTemplate, 'id' | 'createdAt' | 'updatedAt' | 'createdBy'>[] = [
    {
      name: 'Guest Invoice - Standard',
      code: 'guest-invoice-standard',
      category: 'invoice',
      subject: 'Your Invoice from {{hotelName}}',
      body: `Dear {{guestName}},

Thank you for staying with us at {{hotelName}}.

Please find attached your invoice {{invoiceNumber}} dated {{invoiceDate}}.

Invoice Summary:
- Invoice Number: {{invoiceNumber}}
- Total Amount: {{grandTotal}}
- Amount Due: {{amountDue}}

If you have any questions regarding this invoice, please don't hesitate to contact us.

Best regards,
{{hotelName}} Team

---
{{hotelAddress}}
{{hotelPhone}} | {{hotelEmail}}`,
      isDefault: true,
      isActive: true,
      variables: [
        'hotelName',
        'hotelAddress',
        'hotelPhone',
        'hotelEmail',
        'guestName',
        'invoiceNumber',
        'invoiceDate',
        'grandTotal',
        'amountDue',
        'roomNumber',
        'checkInDate',
        'checkOutDate'
      ]
    },
    {
      name: 'Guest Invoice - Friendly',
      code: 'guest-invoice-friendly',
      category: 'invoice',
      subject: 'Thank you for staying with {{hotelName}}! 🌟',
      body: `Hello {{guestName}},

We hope you had a wonderful stay with us at {{hotelName}}! ✨

Your invoice details are attached. Here's a quick summary:

📋 Invoice #{{invoiceNumber}}
📅 Date: {{invoiceDate}}
💰 Total: {{grandTotal}}
💳 Amount Due: {{amountDue}}

We'd love to welcome you back soon! If you have any questions about your invoice, our team is here to help.

Warm regards,
The {{hotelName}} Family

P.S. Don't forget to follow us on social media for exclusive offers!

---
{{hotelAddress}}
📞 {{hotelPhone}} | 📧 {{hotelEmail}}`,
      isDefault: false,
      isActive: true,
      variables: [
        'hotelName',
        'hotelAddress',
        'hotelPhone',
        'hotelEmail',
        'guestName',
        'invoiceNumber',
        'invoiceDate',
        'grandTotal',
        'amountDue'
      ]
    },
    {
      name: 'Guest Invoice - Corporate',
      code: 'guest-invoice-corporate',
      category: 'invoice',
      subject: 'Invoice {{invoiceNumber}} - {{hotelName}}',
      body: `Dear {{guestName}},

Please find attached invoice {{invoiceNumber}} for your recent stay at {{hotelName}}.

INVOICE DETAILS
Invoice Number: {{invoiceNumber}}
Invoice Date: {{invoiceDate}}
Room Number: {{roomNumber}}
Check-in: {{checkInDate}}
Check-out: {{checkOutDate}}

FINANCIAL SUMMARY
Subtotal: {{subtotal}}
Service Charge: {{serviceCharge}}
Tax: {{tax}}
Grand Total: {{grandTotal}}
Amount Paid: {{amountPaid}}
Balance Due: {{amountDue}}

Payment is due within the terms specified on the invoice. For any billing inquiries, please contact our accounts department.

Sincerely,
{{hotelName}}
Accounts Department

{{hotelAddress}}
Tel: {{hotelPhone}}
Email: {{hotelEmail}}`,
      isDefault: false,
      isActive: true,
      variables: [
        'hotelName',
        'hotelAddress',
        'hotelPhone',
        'hotelEmail',
        'guestName',
        'invoiceNumber',
        'invoiceDate',
        'roomNumber',
        'checkInDate',
        'checkOutDate',
        'subtotal',
        'serviceCharge',
        'tax',
        'grandTotal',
        'amountPaid',
        'amountDue'
      ]
    },
    {
      name: 'Batch Invoice - Multiple Guests',
      code: 'batch-invoice-multi',
      category: 'batch',
      subject: 'Your Invoice from {{hotelName}}',
      body: `Dear Valued Guest,

Thank you for choosing {{hotelName}} for your recent stay.

Attached you will find your invoice. If you have any questions or require clarification on any charges, please contact us at your earliest convenience.

We appreciate your business and look forward to serving you again in the future.

Best regards,
{{hotelName}}

{{hotelAddress}}
Phone: {{hotelPhone}}
Email: {{hotelEmail}}`,
      isDefault: false,
      isActive: true,
      variables: [
        'hotelName',
        'hotelAddress',
        'hotelPhone',
        'hotelEmail'
      ]
    }
  ]

  const initializeDefaultTemplates = () => {
    const existingCodes = new Set((templates || []).map(t => t.code))
    const templatesToAdd = defaultTemplates.filter(t => !existingCodes.has(t.code))
    
    if (templatesToAdd.length === 0) {
      toast.info('Default templates already loaded')
      return
    }

    const newTemplates: EmailTemplate[] = templatesToAdd.map(t => ({
      ...t,
      id: `template-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      createdAt: Date.now(),
      updatedAt: Date.now(),
      createdBy: currentUser.id
    }))

    setTemplates(current => [...(current || []), ...newTemplates])
    toast.success(`${newTemplates.length} default template(s) loaded`)
  }

  const handleSave = () => {
    if (!editingTemplate) return

    if (!editingTemplate.name.trim() || !editingTemplate.subject.trim() || !editingTemplate.body.trim()) {
      toast.error('Please fill in all required fields')
      return
    }

    if (editingTemplate.id.startsWith('new-')) {
      const newTemplate: EmailTemplate = {
        ...editingTemplate,
        id: `template-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        createdAt: Date.now(),
        updatedAt: Date.now(),
        createdBy: currentUser.id
      }
      setTemplates(current => [...(current || []), newTemplate])
      toast.success('Email template created')
    } else {
      setTemplates(current =>
        (current || []).map(t =>
          t.id === editingTemplate.id
            ? { ...editingTemplate, updatedAt: Date.now() }
            : t
        )
      )
      toast.success('Email template updated')
    }

    setIsDialogOpen(false)
    setEditingTemplate(null)
  }

  const handleDelete = (id: string) => {
    const template = (templates || []).find(t => t.id === id)
    if (template?.isDefault) {
      toast.error('Cannot delete default templates')
      return
    }

    setTemplates(current => (current || []).filter(t => t.id !== id))
    toast.success('Email template deleted')
  }

  const handleDuplicate = (template: EmailTemplate) => {
    const newTemplate: EmailTemplate = {
      ...template,
      id: `template-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      name: `${template.name} (Copy)`,
      code: `${template.code}-copy-${Date.now()}`,
      isDefault: false,
      createdAt: Date.now(),
      updatedAt: Date.now(),
      createdBy: currentUser.id
    }
    setTemplates(current => [...(current || []), newTemplate])
    toast.success('Template duplicated')
  }

  const handleToggleActive = (id: string) => {
    setTemplates(current =>
      (current || []).map(t =>
        t.id === id ? { ...t, isActive: !t.isActive, updatedAt: Date.now() } : t
      )
    )
    toast.success('Template status updated')
  }

  const handlePreview = (template: EmailTemplate) => {
    setPreviewTemplate(template)
    setPreviewOpen(true)
  }

  const getVariableExample = (variable: string): string => {
    const examples: Record<string, string> = {
      hotelName: 'W3 Hotel & Resorts',
      hotelAddress: '123 Ocean Drive, Colombo 03, Sri Lanka',
      hotelPhone: '+94 11 234 5678',
      hotelEmail: 'info@w3hotel.com',
      guestName: 'John Doe',
      invoiceNumber: 'INV-2024-001',
      invoiceDate: '2024-01-15',
      grandTotal: 'LKR 45,000.00',
      amountDue: 'LKR 10,000.00',
      roomNumber: '301',
      checkInDate: '2024-01-10',
      checkOutDate: '2024-01-15',
      subtotal: 'LKR 40,000.00',
      serviceCharge: 'LKR 4,000.00',
      tax: 'LKR 1,000.00',
      amountPaid: 'LKR 35,000.00'
    }
    return examples[variable] || `{{${variable}}}`
  }

  const renderPreview = (template: EmailTemplate): string => {
    let preview = template.body
    template.variables.forEach(variable => {
      const regex = new RegExp(`{{${variable}}}`, 'g')
      preview = preview.replace(regex, getVariableExample(variable))
    })
    return preview
  }

  return (
    <div className="space-y-6">
      <Card className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-semibold flex items-center gap-2">
              <EnvelopeSimple size={24} className="text-primary" />
              Email Templates
            </h2>
            <p className="text-sm text-muted-foreground mt-1">
              Customize email templates for batch invoice operations
            </p>
          </div>
          <div className="flex gap-2">
            {(templates || []).length === 0 && (
              <Button variant="outline" onClick={initializeDefaultTemplates}>
                <Sparkle size={18} className="mr-2" />
                Load Defaults
              </Button>
            )}
            <Button
              onClick={() => {
                setEditingTemplate({
                  id: `new-${Date.now()}`,
                  name: '',
                  code: '',
                  category: 'invoice',
                  subject: '',
                  body: '',
                  isDefault: false,
                  isActive: true,
                  variables: [],
                  createdAt: Date.now(),
                  updatedAt: Date.now(),
                  createdBy: currentUser.id
                })
                setIsDialogOpen(true)
              }}
            >
              <Plus size={18} className="mr-2" />
              New Template
            </Button>
          </div>
        </div>

        {(templates || []).length === 0 ? (
          <div className="text-center py-12 border-2 border-dashed rounded-lg">
            <EnvelopeSimple size={48} className="mx-auto text-muted-foreground mb-4" />
            <h3 className="font-semibold mb-2">No Email Templates</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Create custom email templates for batch invoice operations
            </p>
            <Button onClick={initializeDefaultTemplates}>
              <Sparkle size={18} className="mr-2" />
              Load Default Templates
            </Button>
          </div>
        ) : (
          <div className="space-y-3">
            {(templates || []).map(template => (
              <Card key={template.id} className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="font-semibold">{template.name}</h3>
                      {template.isDefault && (
                        <Badge variant="secondary">Default</Badge>
                      )}
                      <Badge variant={template.isActive ? 'default' : 'outline'}>
                        {template.isActive ? 'Active' : 'Inactive'}
                      </Badge>
                      <Badge variant="outline" className="capitalize">
                        {template.category}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mb-2">
                      <strong>Subject:</strong> {template.subject}
                    </p>
                    <p className="text-xs text-muted-foreground line-clamp-2">
                      {template.body.substring(0, 150)}...
                    </p>
                    <div className="flex flex-wrap gap-1 mt-2">
                      {template.variables.slice(0, 5).map(variable => (
                        <Badge key={variable} variant="outline" className="text-xs">
                          {`{{${variable}}}`}
                        </Badge>
                      ))}
                      {template.variables.length > 5 && (
                        <Badge variant="outline" className="text-xs">
                          +{template.variables.length - 5} more
                        </Badge>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-2 ml-4">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handlePreview(template)}
                    >
                      <Eye size={18} />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDuplicate(template)}
                    >
                      <Copy size={18} />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => {
                        setEditingTemplate(template)
                        setIsDialogOpen(true)
                      }}
                    >
                      <PencilSimple size={18} />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleToggleActive(template.id)}
                    >
                      {template.isActive ? '✓' : '○'}
                    </Button>
                    {!template.isDefault && (
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDelete(template.id)}
                      >
                        <TrashSimple size={18} />
                      </Button>
                    )}
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </Card>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingTemplate?.id.startsWith('new-') ? 'Create Email Template' : 'Edit Email Template'}
            </DialogTitle>
            <DialogDescription>
              Customize the email template for batch invoice operations
            </DialogDescription>
          </DialogHeader>

          {editingTemplate && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="template-name">Template Name *</Label>
                  <Input
                    id="template-name"
                    value={editingTemplate.name}
                    onChange={e =>
                      setEditingTemplate({ ...editingTemplate, name: e.target.value })
                    }
                    placeholder="e.g., Guest Invoice - Standard"
                  />
                </div>
                <div>
                  <Label htmlFor="template-code">Template Code *</Label>
                  <Input
                    id="template-code"
                    value={editingTemplate.code}
                    onChange={e =>
                      setEditingTemplate({ ...editingTemplate, code: e.target.value })
                    }
                    placeholder="e.g., guest-invoice-standard"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="template-category">Category</Label>
                <Select
                  value={editingTemplate.category}
                  onValueChange={value =>
                    setEditingTemplate({ ...editingTemplate, category: value as 'invoice' | 'batch' | 'reminder' | 'confirmation' })
                  }
                >
                  <SelectTrigger id="template-category">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="invoice">Invoice</SelectItem>
                    <SelectItem value="batch">Batch</SelectItem>
                    <SelectItem value="reminder">Reminder</SelectItem>
                    <SelectItem value="confirmation">Confirmation</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="template-subject">Email Subject *</Label>
                <Input
                  id="template-subject"
                  value={editingTemplate.subject}
                  onChange={e =>
                    setEditingTemplate({ ...editingTemplate, subject: e.target.value })
                  }
                  placeholder="e.g., Your Invoice from {{hotelName}}"
                />
              </div>

              <div>
                <Label htmlFor="template-body">Email Body *</Label>
                <Textarea
                  id="template-body"
                  value={editingTemplate.body}
                  onChange={e =>
                    setEditingTemplate({ ...editingTemplate, body: e.target.value })
                  }
                  rows={12}
                  placeholder="Enter your email body here. Use {{variableName}} for dynamic content."
                  className="font-mono text-sm"
                />
              </div>

              <div>
                <Label>Available Variables</Label>
                <div className="flex flex-wrap gap-2 mt-2 p-3 bg-muted/50 rounded-lg">
                  {[
                    'hotelName',
                    'hotelAddress',
                    'hotelPhone',
                    'hotelEmail',
                    'guestName',
                    'invoiceNumber',
                    'invoiceDate',
                    'grandTotal',
                    'amountDue',
                    'roomNumber',
                    'checkInDate',
                    'checkOutDate',
                    'subtotal',
                    'serviceCharge',
                    'tax',
                    'amountPaid'
                  ].map(variable => (
                    <Button
                      key={variable}
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        const cursorPos = document.getElementById('template-body') as HTMLTextAreaElement
                        const newBody =
                          editingTemplate.body.substring(0, cursorPos.selectionStart) +
                          `{{${variable}}}` +
                          editingTemplate.body.substring(cursorPos.selectionEnd)
                        setEditingTemplate({ ...editingTemplate, body: newBody })

                        if (!editingTemplate.variables.includes(variable)) {
                          setEditingTemplate({
                            ...editingTemplate,
                            variables: [...editingTemplate.variables, variable]
                          })
                        }
                      }}
                    >
                      {`{{${variable}}}`}
                    </Button>
                  ))}
                </div>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSave}>
              <FloppyDisk size={18} className="mr-2" />
              Save Template
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={previewOpen} onOpenChange={setPreviewOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Template Preview</DialogTitle>
            <DialogDescription>
              Preview of how the email will look with sample data
            </DialogDescription>
          </DialogHeader>

          {previewTemplate && (
            <div className="space-y-4">
              <div>
                <Label className="text-xs text-muted-foreground">Subject</Label>
                <div className="p-3 bg-muted/50 rounded-lg font-medium">
                  {renderPreview({ ...previewTemplate, body: previewTemplate.subject })}
                </div>
              </div>

              <Separator />

              <div>
                <Label className="text-xs text-muted-foreground">Body</Label>
                <div className="p-4 bg-muted/50 rounded-lg whitespace-pre-wrap font-sans text-sm">
                  {renderPreview(previewTemplate)}
                </div>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button onClick={() => setPreviewOpen(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
