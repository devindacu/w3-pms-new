import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { toast } from 'sonner'
import { type DutyRoster, type Employee, type Shift } from '@/lib/types'

interface DutyRosterDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  roster: DutyRoster | null
  employees: Employee[]
  shifts: Shift[]
  rosters: DutyRoster[]
  setRosters: (rosters: DutyRoster[]) => void
}

export function DutyRosterDialog({ open, onOpenChange, roster, employees, shifts, rosters, setRosters }: DutyRosterDialogProps) {
  const [formData, setFormData] = useState({
    employeeId: '',
    date: new Date().toISOString().split('T')[0],
    shiftId: '',
    status: 'scheduled' as 'scheduled' | 'completed' | 'missed' | 'swapped',
    swappedWith: '',
    notes: ''
  })

  useEffect(() => {
    if (roster) {
      setFormData({
        employeeId: roster.employeeId,
        date: new Date(roster.date).toISOString().split('T')[0],
        shiftId: roster.shiftId,
        status: roster.status,
        swappedWith: roster.swappedWith || '',
        notes: roster.notes || ''
      })
    } else {
      setFormData({
        employeeId: '',
        date: new Date().toISOString().split('T')[0],
        shiftId: '',
        status: 'scheduled',
        swappedWith: '',
        notes: ''
      })
    }
  }, [roster, open])

  const getShift = (shiftId: string) => shifts.find(s => s.id === shiftId)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.employeeId || !formData.shiftId) {
      toast.error('Please select employee and shift')
      return
    }

    const employee = employees.find(e => e.id === formData.employeeId)
    const shift = getShift(formData.shiftId)

    if (!employee || !shift) {
      toast.error('Invalid employee or shift selection')
      return
    }

    if (roster) {
      setRosters(rosters.map(r =>
        r.id === roster.id
          ? {
              ...r,
              employeeId: formData.employeeId,
              date: new Date(formData.date).getTime(),
              shiftId: formData.shiftId,
              department: shift.department,
              status: formData.status,
              swappedWith: formData.swappedWith || undefined,
              notes: formData.notes || undefined
            }
          : r
      ))
      toast.success('Duty roster updated successfully')
    } else {
      const newRoster: DutyRoster = {
        id: `roster-${Date.now()}`,
        employeeId: formData.employeeId,
        date: new Date(formData.date).getTime(),
        shiftId: formData.shiftId,
        department: shift.department,
        status: formData.status,
        swappedWith: formData.swappedWith || undefined,
        notes: formData.notes || undefined,
        createdAt: Date.now(),
        createdBy: 'current-user'
      }
      setRosters([...rosters, newRoster])
      toast.success('Duty roster assigned successfully')
    }

    onOpenChange(false)
  }

  const selectedShift = formData.shiftId ? getShift(formData.shiftId) : null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{roster ? 'Edit Duty Roster' : 'Assign Duty'}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="employee">Employee *</Label>
            <Select value={formData.employeeId} onValueChange={(value) => setFormData({ ...formData, employeeId: value })}>
              <SelectTrigger>
                <SelectValue placeholder="Select employee" />
              </SelectTrigger>
              <SelectContent>
                {employees.filter(e => e.status === 'active').map((emp) => (
                  <SelectItem key={emp.id} value={emp.id}>
                    {emp.firstName} {emp.lastName} - {emp.department}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="date">Date *</Label>
            <input
              id="date"
              type="date"
              className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-base shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 md:text-sm"
              value={formData.date}
              onChange={(e) => setFormData({ ...formData, date: e.target.value })}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="shift">Shift *</Label>
            <Select value={formData.shiftId} onValueChange={(value) => setFormData({ ...formData, shiftId: value })}>
              <SelectTrigger>
                <SelectValue placeholder="Select shift" />
              </SelectTrigger>
              <SelectContent>
                {shifts.map((shift) => (
                  <SelectItem key={shift.id} value={shift.id}>
                    {shift.shiftType} ({shift.startTime} - {shift.endTime}) - {shift.department}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {selectedShift && (
            <div className="p-3 bg-muted rounded-md text-sm space-y-1">
              <p><span className="font-medium">Department:</span> {selectedShift.department}</p>
              <p><span className="font-medium">Time:</span> {selectedShift.startTime} - {selectedShift.endTime}</p>
              <p><span className="font-medium">Break:</span> {selectedShift.breakDuration} minutes</p>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="status">Status</Label>
            <Select value={formData.status} onValueChange={(value: any) => setFormData({ ...formData, status: value })}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="scheduled">Scheduled</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="missed">Missed</SelectItem>
                <SelectItem value="swapped">Swapped</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {formData.status === 'swapped' && (
            <div className="space-y-2">
              <Label htmlFor="swappedWith">Swapped With</Label>
              <Select value={formData.swappedWith} onValueChange={(value) => setFormData({ ...formData, swappedWith: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Select employee" />
                </SelectTrigger>
                <SelectContent>
                  {employees.filter(e => e.status === 'active' && e.id !== formData.employeeId).map((emp) => (
                    <SelectItem key={emp.id} value={emp.id}>
                      {emp.firstName} {emp.lastName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              rows={2}
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit">
              {roster ? 'Update' : 'Assign'} Duty
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
