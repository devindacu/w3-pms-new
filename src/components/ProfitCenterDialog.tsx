import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { X } from '@phosphor-icons/react'
import { toast } from 'sonner'
import { type ProfitCenter, type Department, type CostCenter } from '@/lib/types'

interface ProfitCenterDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  profitCenter?: ProfitCenter | null
  costCenters: CostCenter[]
  onSave: (profitCenter: ProfitCenter) => void
}

const departments: Department[] = ['front-office', 'housekeeping', 'fnb', 'kitchen', 'engineering', 'finance', 'hr', 'admin']

export function ProfitCenterDialog({
  open,
  onOpenChange,
  profitCenter,
  costCenters,
  onSave
}: ProfitCenterDialogProps) {
  const [formData, setFormData] = useState<Partial<ProfitCenter>>(profitCenter || {
    code: '',
    name: '',
    costCenterIds: [],
    status: 'active',
    revenueStreams: []
  })

  const handleSubmit = () => {
    if (!formData.code || !formData.name) {
      toast.error('Please fill in all required fields')
      return
    }

    const newProfitCenter: ProfitCenter = {
      id: profitCenter?.id || `pc-${Date.now()}`,
      code: formData.code,
      name: formData.name,
      description: formData.description,
      department: formData.department,
      managerId: formData.managerId,
      managerName: formData.managerName,
      costCenterIds: formData.costCenterIds || [],
      status: formData.status as any || 'active',
      targetRevenue: formData.targetRevenue,
      targetProfit: formData.targetProfit,
      targetMargin: formData.targetMargin,
      actualRevenue: formData.actualRevenue || 0,
      actualCost: formData.actualCost || 0,
      actualProfit: formData.actualProfit || 0,
      actualMargin: formData.actualMargin || 0,
      revenueStreams: formData.revenueStreams || [],
      performanceMetrics: formData.performanceMetrics,
      notes: formData.notes,
      createdAt: profitCenter?.createdAt || Date.now(),
      updatedAt: Date.now(),
      createdBy: profitCenter?.createdBy || 'current-user'
    }

    onSave(newProfitCenter)
    toast.success(profitCenter ? 'Profit center updated' : 'Profit center created')
    onOpenChange(false)
  }

  const addCostCenter = (costCenterId: string) => {
    if (!formData.costCenterIds?.includes(costCenterId)) {
      setFormData({
        ...formData,
        costCenterIds: [...(formData.costCenterIds || []), costCenterId]
      })
    }
  }

  const removeCostCenter = (costCenterId: string) => {
    setFormData({
      ...formData,
      costCenterIds: formData.costCenterIds?.filter(id => id !== costCenterId) || []
    })
  }

  const selectedCostCenters = costCenters.filter(cc => formData.costCenterIds?.includes(cc.id))
  const availableCostCenters = costCenters.filter(cc => !formData.costCenterIds?.includes(cc.id))

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle>{profitCenter ? 'Edit Profit Center' : 'New Profit Center'}</DialogTitle>
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
                  placeholder="PC-001"
                />
              </div>

              <div className="dialog-form-field">
                <Label htmlFor="name">Name *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Rooms Division"
                />
              </div>

              <div className="dialog-form-field">
                <Label htmlFor="status">Status</Label>
                <Select value={formData.status} onValueChange={(value) => setFormData({ ...formData, status: value as any })}>
                  <SelectTrigger id="status">
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                    <SelectItem value="suspended">Suspended</SelectItem>
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
                <Label htmlFor="managerName">Manager Name</Label>
                <Input
                  id="managerName"
                  value={formData.managerName || ''}
                  onChange={(e) => setFormData({ ...formData, managerName: e.target.value })}
                  placeholder="Jane Smith"
                />
              </div>
            </div>

            <div className="dialog-form-field mt-4">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description || ''}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Enter profit center description"
                rows={2}
              />
            </div>

            <div className="mt-6 space-y-4">
              <h3 className="text-sm font-semibold">Financial Targets</h3>
              <div className="dialog-grid-3">
                <div className="dialog-form-field">
                  <Label htmlFor="targetRevenue">Target Revenue</Label>
                  <Input
                    id="targetRevenue"
                    type="number"
                    value={formData.targetRevenue || ''}
                    onChange={(e) => setFormData({ ...formData, targetRevenue: parseFloat(e.target.value) })}
                    placeholder="0.00"
                  />
                </div>

                <div className="dialog-form-field">
                  <Label htmlFor="targetProfit">Target Profit</Label>
                  <Input
                    id="targetProfit"
                    type="number"
                    value={formData.targetProfit || ''}
                    onChange={(e) => setFormData({ ...formData, targetProfit: parseFloat(e.target.value) })}
                    placeholder="0.00"
                  />
                </div>

                <div className="dialog-form-field">
                  <Label htmlFor="targetMargin">Target Margin %</Label>
                  <Input
                    id="targetMargin"
                    type="number"
                    min="0"
                    max="100"
                    value={formData.targetMargin || ''}
                    onChange={(e) => setFormData({ ...formData, targetMargin: parseFloat(e.target.value) })}
                    placeholder="0.00"
                  />
                </div>
              </div>
            </div>

            <div className="mt-6 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold">Associated Cost Centers</h3>
                <Select value="" onValueChange={addCostCenter}>
                  <SelectTrigger className="w-[200px]">
                    <SelectValue placeholder="Add cost center" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableCostCenters.map((cc) => (
                      <SelectItem key={cc.id} value={cc.id}>
                        {cc.code} - {cc.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {selectedCostCenters.length > 0 ? (
                <div className="space-y-2">
                  {selectedCostCenters.map((cc) => (
                    <div key={cc.id} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                      <div>
                        <p className="font-medium text-sm">{cc.code} - {cc.name}</p>
                        <p className="text-xs text-muted-foreground">{cc.type}</p>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => removeCostCenter(cc.id)}
                      >
                        <X size={16} />
                      </Button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-6 bg-muted/50 rounded-lg">
                  <p className="text-sm text-muted-foreground">No cost centers assigned yet</p>
                </div>
              )}
            </div>

            <div className="dialog-form-field mt-6">
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                value={formData.notes || ''}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                placeholder="Additional notes"
                rows={2}
              />
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={handleSubmit}>
            {profitCenter ? 'Update' : 'Create'} Profit Center
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
