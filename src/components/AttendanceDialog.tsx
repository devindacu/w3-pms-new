import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { toast } from 'sonner'
import { type Attendance, type Employee } from '@/lib/types'

interface AttendanceDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  attendance: Attendance | null
  employees: Employee[]
  attendanceRecords: Attendance[]
  setAttendance: (attendance: Attendance[]) => void
}

export function AttendanceDialog({ open, onOpenChange, attendance, employees, attendanceRecords, setAttendance }: AttendanceDialogProps) {
  const [formData, setFormData] = useState({
    employeeId: '',
    date: new Date().toISOString().split('T')[0],
    checkIn: '',
    checkOut: '',
    status: 'present' as 'present' | 'absent' | 'half-day' | 'leave',
    notes: ''
  })

  useEffect(() => {
    if (attendance) {
      let checkInTime = ''
      let checkOutTime = ''
      
      if (attendance.checkIn && !isNaN(attendance.checkIn)) {
        const checkInDate = new Date(attendance.checkIn)
        if (!isNaN(checkInDate.getTime())) {
          checkInTime = checkInDate.toTimeString().slice(0, 5)
        }
      }
      
      if (attendance.checkOut && !isNaN(attendance.checkOut)) {
        const checkOutDate = new Date(attendance.checkOut)
        if (!isNaN(checkOutDate.getTime())) {
          checkOutTime = checkOutDate.toTimeString().slice(0, 5)
        }
      }
      
      setFormData({
        employeeId: attendance.employeeId,
        date: new Date(attendance.date).toISOString().split('T')[0],
        checkIn: checkInTime,
        checkOut: checkOutTime,
        status: attendance.status,
        notes: attendance.notes || ''
      })
    } else {
      setFormData({
        employeeId: '',
        date: new Date().toISOString().split('T')[0],
        checkIn: '',
        checkOut: '',
        status: 'present',
        notes: ''
      })
    }
  }, [attendance, open])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.employeeId) {
      toast.error('Please select an employee')
      return
    }

    const dateObj = new Date(formData.date)
    const checkInDateTime = formData.checkIn 
      ? new Date(`${formData.date}T${formData.checkIn}`).getTime()
      : undefined
    const checkOutDateTime = formData.checkOut
      ? new Date(`${formData.date}T${formData.checkOut}`).getTime()
      : undefined

    if (attendance) {
      setAttendance(attendanceRecords.map(att =>
        att.id === attendance.id
          ? {
              ...att,
              employeeId: formData.employeeId,
              date: dateObj.getTime(),
              checkIn: checkInDateTime,
              checkOut: checkOutDateTime,
              status: formData.status,
              notes: formData.notes || undefined
            }
          : att
      ))
      toast.success('Attendance updated successfully')
    } else {
      const newAttendance: Attendance = {
        id: `att-${Date.now()}`,
        employeeId: formData.employeeId,
        date: dateObj.getTime(),
        checkIn: checkInDateTime,
        checkOut: checkOutDateTime,
        status: formData.status,
        notes: formData.notes || undefined
      }
      setAttendance([...attendanceRecords, newAttendance])
      toast.success('Attendance marked successfully')
    }

    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{attendance ? 'Edit Attendance' : 'Mark Attendance'}</DialogTitle>
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
                    {emp.firstName} {emp.lastName} - {emp.employeeId}
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
            <Label htmlFor="status">Status</Label>
            <Select value={formData.status} onValueChange={(value: any) => setFormData({ ...formData, status: value })}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="present">Present</SelectItem>
                <SelectItem value="absent">Absent</SelectItem>
                <SelectItem value="half-day">Half Day</SelectItem>
                <SelectItem value="leave">On Leave</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {formData.status === 'present' && (
            <>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="checkIn">Check In</Label>
                  <input
                    id="checkIn"
                    type="time"
                    className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-base shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 md:text-sm"
                    value={formData.checkIn}
                    onChange={(e) => setFormData({ ...formData, checkIn: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="checkOut">Check Out</Label>
                  <input
                    id="checkOut"
                    type="time"
                    className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-base shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 md:text-sm"
                    value={formData.checkOut}
                    onChange={(e) => setFormData({ ...formData, checkOut: e.target.value })}
                  />
                </div>
              </div>
            </>
          )}

          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <textarea
              id="notes"
              className="flex min-h-[60px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-base shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 md:text-sm"
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              rows={3}
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit">
              {attendance ? 'Update' : 'Mark'} Attendance
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
