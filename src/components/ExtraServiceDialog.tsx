import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { toast } from 'sonner'
import type { ExtraService, ExtraServiceCategory, Department, ExtraServiceStatus } from '@/lib/types'
import { ulid } from 'ulid'

interface ExtraServiceDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  service: ExtraService | null
  onSave: (service: ExtraService) => void
  categories: ExtraServiceCategory[]
  currentUser: { id: string; firstName: string; lastName: string }
}

const departments: Department[] = [
  'front-office',
  'housekeeping',
  'fnb',
  'kitchen',
  'engineering',
  'finance',
  'hr',
  'admin'
]

export function ExtraServiceDialog({
  open,
  onOpenChange,
  service,
  onSave,
  categories,
  currentUser
}: ExtraServiceDialogProps) {
  const [formData, setFormData] = useState<Partial<ExtraService>>({})

  useEffect(() => {
    if (service) {
      setFormData(service)
    } else {
      setFormData({
        status: 'active',
        taxRate: 0,
        requiresApproval: false,
        department: 'front-office',
        unit: 'item'
      })
    }
  }, [service, open])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.name?.trim()) {
      toast.error('Service name is required')
      return
    }

    if (!formData.categoryId) {
      toast.error('Please select a category')
      return
    }

    if (formData.basePrice === undefined || formData.basePrice < 0) {
      toast.error('Please enter a valid price')
      return
    }

    const serviceData: ExtraService = {
      id: service?.id || ulid(),
      categoryId: formData.categoryId,
      name: formData.name.trim(),
      description: formData.description?.trim(),
      basePrice: formData.basePrice,
      taxRate: formData.taxRate || 0,
      unit: formData.unit || 'item',
      status: formData.status || 'active',
      department: formData.department || 'front-office',
      requiresApproval: formData.requiresApproval || false,
      maxQuantity: formData.maxQuantity,
      comments: formData.comments?.trim(),
      createdAt: service?.createdAt || Date.now(),
      updatedAt: Date.now(),
      createdBy: service?.createdBy || currentUser.id
    }

    onSave(serviceData)
    toast.success(service ? 'Service updated' : 'Service created')
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{service ? 'Edit' : 'Create'} Extra Service</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="service-name">Service Name</Label>
              <Input
                id="service-name"
                value={formData.name || ''}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g., Airport Transfer, Laundry Service"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="service-category">Category</Label>
              <Select
                value={formData.categoryId}
                onValueChange={(value) => setFormData({ ...formData, categoryId: value })}
              >
                <SelectTrigger id="service-category">
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.filter(c => c.isActive).map((category) => (
                    <SelectItem key={category.id} value={category.id}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="service-description">Description</Label>
            <Textarea
              id="service-description"
              value={formData.description || ''}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Detailed description of the service"
              rows={3}
            />
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="service-price">Base Price</Label>
              <Input
                id="service-price"
                type="number"
                min="0"
                step="0.01"
                value={formData.basePrice || ''}
                onChange={(e) => setFormData({ ...formData, basePrice: parseFloat(e.target.value) || 0 })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="service-tax">Tax Rate (%)</Label>
              <Input
                id="service-tax"
                type="number"
                min="0"
                max="100"
                step="0.01"
                value={formData.taxRate || ''}
                onChange={(e) => setFormData({ ...formData, taxRate: parseFloat(e.target.value) || 0 })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="service-unit">Unit</Label>
              <Input
                id="service-unit"
                value={formData.unit || ''}
                onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                placeholder="e.g., item, hour, kg"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="service-department">Department</Label>
              <Select
                value={formData.department}
                onValueChange={(value) => setFormData({ ...formData, department: value as Department })}
              >
                <SelectTrigger id="service-department">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {departments.map((dept) => (
                    <SelectItem key={dept} value={dept}>
                      {dept.replace('-', ' ').replace(/\b\w/g, c => c.toUpperCase())}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="service-status">Status</Label>
              <Select
                value={formData.status}
                onValueChange={(value) => setFormData({ ...formData, status: value as ExtraServiceStatus })}
              >
                <SelectTrigger id="service-status">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                  <SelectItem value="archived">Archived</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="service-max-quantity">Max Quantity (Optional)</Label>
            <Input
              id="service-max-quantity"
              type="number"
              min="1"
              value={formData.maxQuantity || ''}
              onChange={(e) => setFormData({ ...formData, maxQuantity: parseInt(e.target.value) || undefined })}
              placeholder="Leave empty for no limit"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="service-comments">Internal Comments</Label>
            <Textarea
              id="service-comments"
              value={formData.comments || ''}
              onChange={(e) => setFormData({ ...formData, comments: e.target.value })}
              placeholder="Internal notes about this service"
              rows={2}
            />
          </div>

          <div className="flex items-center justify-between">
            <Label htmlFor="service-approval">Requires Approval</Label>
            <Switch
              id="service-approval"
              checked={formData.requiresApproval || false}
              onCheckedChange={(checked) => setFormData({ ...formData, requiresApproval: checked })}
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit">
              {service ? 'Update' : 'Create'} Service
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
