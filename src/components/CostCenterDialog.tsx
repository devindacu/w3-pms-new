import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { toast } from 'sonner'
import { type CostCenter, type Department } from '@/lib/types'

interface CostCenterDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  costCenter?: CostCenter | null
  costCenters: CostCenter[]
  onSave: (costCenter: CostCenter) => void
}

const departments: Department[] = ['front-office', 'housekeeping', 'fnb', 'kitchen', 'engineering', 'finance', 'hr', 'admin']

const costCenterTypes = [
  { value: 'revenue', label: 'Revenue Center' },
  { value: 'service', label: 'Service Center' },
  { value: 'support', label: 'Support Center' },
  { value: 'administrative', label: 'Administrative Center' }
]

const allocationBases = [
  { value: 'headcount', label: 'Headcount' },
  { value: 'square-footage', label: 'Square Footage' },
  { value: 'revenue', label: 'Revenue' },
  { value: 'transactions', label: 'Transactions' },
  { value: 'custom', label: 'Custom' }
]

export function CostCenterDialog({
  open,
  onOpenChange,
  costCenter,
  costCenters,
  onSave
}: CostCenterDialogProps) {
  const [formData, setFormData] = useState<Partial<CostCenter>>(costCenter || {
    code: '',
    name: '',
    type: 'service',
    isActive: true,
    allocatedExpenses: []
  })

  const handleSubmit = () => {
    if (!formData.code || !formData.name || !formData.type) {
      toast.error('Please fill in all required fields')
      return
    }

    const newCostCenter: CostCenter = {
      id: costCenter?.id || `cc-${Date.now()}`,
      code: formData.code,
      name: formData.name,
      description: formData.description,
      type: formData.type as any,
      department: formData.department,
      parentCostCenterId: formData.parentCostCenterId,
      managerId: formData.managerId,
      managerName: formData.managerName,
      isActive: formData.isActive ?? true,
      budget: formData.budget,
      actualCost: formData.actualCost || 0,
      allocatedExpenses: formData.allocatedExpenses || [],
      costDriverMetric: formData.costDriverMetric,
      allocationBasis: formData.allocationBasis,
      allocationPercentage: formData.allocationPercentage,
      notes: formData.notes,
      createdAt: costCenter?.createdAt || Date.now(),
      updatedAt: Date.now(),
      createdBy: costCenter?.createdBy || 'current-user'
    }

    onSave(newCostCenter)
    toast.success(costCenter ? 'Cost center updated' : 'Cost center created')
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle>{costCenter ? 'Edit Cost Center' : 'New Cost Center'}</DialogTitle>
        </DialogHeader>

        <div className="dialog-content-wrapper">
          <div className="dialog-body-scrollable">
            <div className="dialog-grid-2">
              <div className="dialog-form-field">
                <Label htmlFor="code">Code *</Label>
                <Input
                  id="code"
                  value={formData.code}
                  onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                  placeholder="CC-001"
                />
              </div>

              <div className="dialog-form-field">
                <Label htmlFor="name">Name *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Front Office Operations"
                />
              </div>

              <div className="dialog-form-field">
                <Label htmlFor="type">Type *</Label>
                <Select value={formData.type} onValueChange={(value) => setFormData({ ...formData, type: value as any })}>
                  <SelectTrigger id="type">
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    {costCenterTypes.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="dialog-form-field">
                <Label htmlFor="department">Department</Label>
                <Select value={formData.department} onValueChange={(value) => setFormData({ ...formData, department: value as Department })}>
                  <SelectTrigger id="department">
                    <SelectValue placeholder="Select department" />
                  </SelectTrigger>
                  <SelectContent>
                    {departments.map((dept) => (
                      <SelectItem key={dept} value={dept}>
                        {dept.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="dialog-form-field">
                <Label htmlFor="parentCostCenter">Parent Cost Center</Label>
                <Select value={formData.parentCostCenterId} onValueChange={(value) => setFormData({ ...formData, parentCostCenterId: value })}>
                  <SelectTrigger id="parentCostCenter">
                    <SelectValue placeholder="None (Top Level)" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">None</SelectItem>
                    {costCenters
                      .filter(cc => cc.id !== costCenter?.id)
                      .map((cc) => (
                        <SelectItem key={cc.id} value={cc.id}>
                          {cc.code} - {cc.name}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="dialog-form-field">
                <Label htmlFor="managerName">Manager Name</Label>
                <Input
                  id="managerName"
                  value={formData.managerName || ''}
                  onChange={(e) => setFormData({ ...formData, managerName: e.target.value })}
                  placeholder="John Doe"
                />
              </div>

              <div className="dialog-form-field">
                <Label htmlFor="budget">Budget Amount</Label>
                <Input
                  id="budget"
                  type="number"
                  value={formData.budget || ''}
                  onChange={(e) => setFormData({ ...formData, budget: parseFloat(e.target.value) })}
                  placeholder="0.00"
                />
              </div>

              <div className="dialog-form-field">
                <Label htmlFor="allocationBasis">Allocation Basis</Label>
                <Select value={formData.allocationBasis} onValueChange={(value) => setFormData({ ...formData, allocationBasis: value as any })}>
                  <SelectTrigger id="allocationBasis">
                    <SelectValue placeholder="Select basis" />
                  </SelectTrigger>
                  <SelectContent>
                    {allocationBases.map((basis) => (
                      <SelectItem key={basis.value} value={basis.value}>
                        {basis.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="dialog-form-field">
                <Label htmlFor="allocationPercentage">Allocation %</Label>
                <Input
                  id="allocationPercentage"
                  type="number"
                  min="0"
                  max="100"
                  value={formData.allocationPercentage || ''}
                  onChange={(e) => setFormData({ ...formData, allocationPercentage: parseFloat(e.target.value) })}
                  placeholder="0.00"
                />
              </div>

              <div className="dialog-form-field">
                <Label htmlFor="costDriverMetric">Cost Driver Metric</Label>
                <Input
                  id="costDriverMetric"
                  value={formData.costDriverMetric || ''}
                  onChange={(e) => setFormData({ ...formData, costDriverMetric: e.target.value })}
                  placeholder="e.g., Number of transactions"
                />
              </div>
            </div>

            <div className="dialog-form-field mt-4">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description || ''}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Enter cost center description"
                rows={3}
              />
            </div>

            <div className="dialog-form-field mt-4">
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                value={formData.notes || ''}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                placeholder="Additional notes"
                rows={2}
              />
            </div>

            <div className="flex items-center justify-between mt-4 p-3 bg-muted rounded-lg">
              <div>
                <Label htmlFor="isActive">Active Status</Label>
                <p className="text-sm text-muted-foreground">Enable or disable this cost center</p>
              </div>
              <Switch
                id="isActive"
                checked={formData.isActive ?? true}
                onCheckedChange={(checked) => setFormData({ ...formData, isActive: checked })}
              />
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={handleSubmit}>
            {costCenter ? 'Update' : 'Create'} Cost Center
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
