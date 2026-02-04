import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { DialogAdapter } from '@/components/adapters/DialogAdapter'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { toast } from 'sonner'
import { type Shift, type Department, type ShiftType } from '@/lib/types'

interface ShiftDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  shift: Shift | null
  shifts: Shift[]
  setShifts: (shifts: Shift[]) => void
}

export function ShiftDialog({ open, onOpenChange, shift, shifts, setShifts }: ShiftDialogProps) {
  const [formData, setFormData] = useState({
    shiftType: 'morning' as ShiftType,
    startTime: '09:00',
    endTime: '17:00',
    department: 'front-office' as Department,
    requiredStaff: 1,
    breakDuration: 30,
    description: ''
  })

  useEffect(() => {
    if (shift) {
      setFormData({
        shiftType: shift.shiftType,
        startTime: shift.startTime,
        endTime: shift.endTime,
        department: shift.department,
        requiredStaff: shift.requiredStaff,
        breakDuration: shift.breakDuration,
        description: shift.description || ''
      })
    } else {
      setFormData({
        shiftType: 'morning',
        startTime: '09:00',
        endTime: '17:00',
        department: 'front-office',
        requiredStaff: 1,
        breakDuration: 30,
        description: ''
      })
    }
  }, [shift, open])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (formData.requiredStaff < 1) {
      toast.error('Required staff must be at least 1')
      return
    }

    if (shift) {
      setShifts(shifts.map(s =>
        s.id === shift.id
          ? {
              ...s,
              ...formData,
              description: formData.description || undefined
            }
          : s
      ))
      toast.success('Shift updated successfully')
    } else {
      const newShift: Shift = {
        id: `shift-${Date.now()}`,
        ...formData,
        description: formData.description || undefined
      }
      setShifts([...shifts, newShift])
      toast.success('Shift created successfully')
    }

    onOpenChange(false)
  }

  return (
    <DialogAdapter open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{shift ? 'Edit Shift' : 'Create New Shift'}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="shiftType">Shift Type</Label>
              <Select value={formData.shiftType} onValueChange={(value: ShiftType) => setFormData({ ...formData, shiftType: value })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="morning">Morning</SelectItem>
                  <SelectItem value="afternoon">Afternoon</SelectItem>
                  <SelectItem value="evening">Evening</SelectItem>
                  <SelectItem value="night">Night</SelectItem>
                  <SelectItem value="full-day">Full Day</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="department">Department</Label>
              <Select value={formData.department} onValueChange={(value: Department) => setFormData({ ...formData, department: value })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="front-office">Front Office</SelectItem>
                  <SelectItem value="housekeeping">Housekeeping</SelectItem>
                  <SelectItem value="fnb">F&B</SelectItem>
                  <SelectItem value="kitchen">Kitchen</SelectItem>
                  <SelectItem value="engineering">Engineering</SelectItem>
                  <SelectItem value="finance">Finance</SelectItem>
                  <SelectItem value="hr">HR</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="startTime">Start Time *</Label>
              <input
                id="startTime"
                type="time"
                className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-base shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 md:text-sm"
                value={formData.startTime}
                onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="endTime">End Time *</Label>
              <input
                id="endTime"
                type="time"
                className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-base shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 md:text-sm"
                value={formData.endTime}
                onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="requiredStaff">Required Staff *</Label>
              <Input
                id="requiredStaff"
                type="number"
                min="1"
                value={formData.requiredStaff}
                onChange={(e) => setFormData({ ...formData, requiredStaff: parseInt(e.target.value) || 1 })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="breakDuration">Break Duration (min)</Label>
              <Input
                id="breakDuration"
                type="number"
                min="0"
                value={formData.breakDuration}
                onChange={(e) => setFormData({ ...formData, breakDuration: parseInt(e.target.value) || 0 })}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={3}
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit">
              {shift ? 'Update' : 'Create'} Shift
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </DialogAdapter>
  )
}
