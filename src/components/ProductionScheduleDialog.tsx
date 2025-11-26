import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { FloppyDisk, Plus, Trash } from '@phosphor-icons/react'
import { toast } from 'sonner'
import { formatCurrency } from '@/lib/helpers'
import {
  type ProductionSchedule,
  type ProductionTask,
  type StaffAssignment,
  type ShiftType,
  type KitchenStaff,
  type KitchenStation
} from '@/lib/types'

interface ProductionScheduleDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  schedule?: ProductionSchedule
  schedules: ProductionSchedule[]
  setSchedules: (schedules: ProductionSchedule[] | ((prev: ProductionSchedule[]) => ProductionSchedule[])) => void
  staff: KitchenStaff[]
  stations: KitchenStation[]
}

const shiftTypes: ShiftType[] = ['morning', 'afternoon', 'evening', 'night', 'full-day']

export function ProductionScheduleDialog({
  open,
  onOpenChange,
  schedule,
  schedules,
  setSchedules,
  staff,
  stations
}: ProductionScheduleDialogProps) {
  const [formData, setFormData] = useState<Partial<ProductionSchedule>>({
    scheduleId: '',
    date: Date.now(),
    shiftType: 'morning',
    menuId: '',
    menuName: '',
    tasks: [],
    totalRecipes: 0,
    totalPortions: 0,
    estimatedCost: 0,
    estimatedRevenue: 0,
    assignedStaff: [],
    status: 'draft',
    notes: '',
    createdBy: 'current-user'
  })

  useEffect(() => {
    if (schedule) {
      setFormData(schedule)
    } else {
      const newId = `PROD-${Date.now().toString().slice(-6)}`
      setFormData(prev => ({ ...prev, scheduleId: newId, createdBy: 'current-user' }))
    }
  }, [schedule, open])

  const handleSave = () => {
    if (!formData.scheduleId || !formData.date) {
      toast.error('Please fill in all required fields')
      return
    }

    const newSchedule: ProductionSchedule = {
      id: schedule?.id || `schedule-${Date.now()}`,
      scheduleId: formData.scheduleId || '',
      date: formData.date || Date.now(),
      shiftType: (formData.shiftType || 'morning') as ShiftType,
      menuId: formData.menuId,
      menuName: formData.menuName,
      tasks: formData.tasks || [],
      totalRecipes: formData.totalRecipes || 0,
      totalPortions: formData.totalPortions || 0,
      estimatedCost: formData.estimatedCost || 0,
      estimatedRevenue: formData.estimatedRevenue || 0,
      assignedStaff: formData.assignedStaff || [],
      status: (formData.status || 'draft') as 'draft' | 'scheduled' | 'in-progress' | 'completed' | 'cancelled',
      startedAt: formData.startedAt,
      completedAt: formData.completedAt,
      actualCost: formData.actualCost,
      actualRevenue: formData.actualRevenue,
      efficiency: formData.efficiency,
      notes: formData.notes,
      createdBy: formData.createdBy || 'current-user',
      createdAt: schedule?.createdAt || Date.now(),
      updatedAt: Date.now()
    }

    if (schedule) {
      setSchedules((prev) => prev.map(s => s.id === schedule.id ? newSchedule : s))
      toast.success('Production schedule updated successfully')
    } else {
      setSchedules((prev) => [...prev, newSchedule])
      toast.success('Production schedule created successfully')
    }

    onOpenChange(false)
  }

  const addStaffAssignment = (staffId: string) => {
    const staffMember = staff.find(s => s.id === staffId)
    if (!staffMember) return

    const assignment: StaffAssignment = {
      id: `assign-${Date.now()}`,
      staffId: staffMember.id,
      staffName: `${staffMember.firstName} ${staffMember.lastName}`,
      role: staffMember.role,
      assignedStation: staffMember.primaryStation || '',
      tasks: [],
      startTime: formData.date || Date.now(),
      endTime: (formData.date || Date.now()) + (8 * 60 * 60 * 1000),
      isPresent: false
    }

    setFormData(prev => ({
      ...prev,
      assignedStaff: [...(prev.assignedStaff || []), assignment]
    }))
  }

  const removeStaffAssignment = (id: string) => {
    setFormData(prev => ({
      ...prev,
      assignedStaff: (prev.assignedStaff || []).filter(a => a.id !== id)
    }))
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{schedule ? 'Edit Production Schedule' : 'Create Production Schedule'}</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="scheduleId">Schedule ID *</Label>
              <Input
                id="scheduleId"
                value={formData.scheduleId}
                onChange={(e) => setFormData({ ...formData, scheduleId: e.target.value })}
                disabled={!!schedule}
              />
            </div>
            <div>
              <Label htmlFor="date">Date *</Label>
              <Input
                id="date"
                type="date"
                value={new Date(formData.date || Date.now()).toISOString().split('T')[0]}
                onChange={(e) => setFormData({ ...formData, date: new Date(e.target.value).getTime() })}
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <Label htmlFor="shiftType">Shift Type *</Label>
              <Select
                value={formData.shiftType}
                onValueChange={(value) => setFormData({ ...formData, shiftType: value as ShiftType })}
              >
                <SelectTrigger id="shiftType">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {shiftTypes.map(shift => (
                    <SelectItem key={shift} value={shift}>
                      {shift.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="status">Status</Label>
              <Select
                value={formData.status}
                onValueChange={(value) => setFormData({ ...formData, status: value as any })}
              >
                <SelectTrigger id="status">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="draft">Draft</SelectItem>
                  <SelectItem value="scheduled">Scheduled</SelectItem>
                  <SelectItem value="in-progress">In Progress</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="menuName">Menu Name</Label>
              <Input
                id="menuName"
                value={formData.menuName}
                onChange={(e) => setFormData({ ...formData, menuName: e.target.value })}
                placeholder="Optional menu name"
              />
            </div>
          </div>

          <div className="grid grid-cols-4 gap-4">
            <div>
              <Label htmlFor="totalRecipes">Total Recipes</Label>
              <Input
                id="totalRecipes"
                type="number"
                value={formData.totalRecipes}
                onChange={(e) => setFormData({ ...formData, totalRecipes: parseInt(e.target.value) || 0 })}
              />
            </div>
            <div>
              <Label htmlFor="totalPortions">Total Portions</Label>
              <Input
                id="totalPortions"
                type="number"
                value={formData.totalPortions}
                onChange={(e) => setFormData({ ...formData, totalPortions: parseInt(e.target.value) || 0 })}
              />
            </div>
            <div>
              <Label htmlFor="estimatedCost">Estimated Cost</Label>
              <Input
                id="estimatedCost"
                type="number"
                step="0.01"
                value={formData.estimatedCost}
                onChange={(e) => setFormData({ ...formData, estimatedCost: parseFloat(e.target.value) || 0 })}
              />
            </div>
            <div>
              <Label htmlFor="estimatedRevenue">Estimated Revenue</Label>
              <Input
                id="estimatedRevenue"
                type="number"
                step="0.01"
                value={formData.estimatedRevenue}
                onChange={(e) => setFormData({ ...formData, estimatedRevenue: parseFloat(e.target.value) || 0 })}
              />
            </div>
          </div>

          {formData.status === 'completed' && (
            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label htmlFor="actualCost">Actual Cost</Label>
                <Input
                  id="actualCost"
                  type="number"
                  step="0.01"
                  value={formData.actualCost}
                  onChange={(e) => setFormData({ ...formData, actualCost: parseFloat(e.target.value) || 0 })}
                />
              </div>
              <div>
                <Label htmlFor="actualRevenue">Actual Revenue</Label>
                <Input
                  id="actualRevenue"
                  type="number"
                  step="0.01"
                  value={formData.actualRevenue}
                  onChange={(e) => setFormData({ ...formData, actualRevenue: parseFloat(e.target.value) || 0 })}
                />
              </div>
              <div>
                <Label htmlFor="efficiency">Efficiency %</Label>
                <Input
                  id="efficiency"
                  type="number"
                  min="0"
                  max="100"
                  value={formData.efficiency}
                  onChange={(e) => setFormData({ ...formData, efficiency: parseInt(e.target.value) || 0 })}
                />
              </div>
            </div>
          )}

          <div>
            <div className="flex items-center justify-between mb-3">
              <Label>Assigned Staff ({(formData.assignedStaff || []).length})</Label>
              <Select onValueChange={addStaffAssignment}>
                <SelectTrigger className="w-64">
                  <SelectValue placeholder="Add staff member..." />
                </SelectTrigger>
                <SelectContent>
                  {staff
                    .filter(s => !formData.assignedStaff?.some(a => a.staffId === s.id))
                    .map(s => (
                      <SelectItem key={s.id} value={s.id}>
                        {s.firstName} {s.lastName} - {s.role}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              {(formData.assignedStaff || []).map((assignment) => (
                <div key={assignment.id} className="flex items-center justify-between p-3 bg-muted rounded">
                  <div>
                    <p className="font-medium">{assignment.staffName}</p>
                    <p className="text-sm text-muted-foreground capitalize">
                      {assignment.role.replace('-', ' ')} • {assignment.assignedStation || 'No station'}
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeStaffAssignment(assignment.id)}
                  >
                    <Trash size={16} />
                  </Button>
                </div>
              ))}
            </div>
          </div>

          <div>
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="Additional notes about this production schedule..."
              rows={3}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave}>
            <FloppyDisk size={18} className="mr-2" />
            Save Schedule
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
