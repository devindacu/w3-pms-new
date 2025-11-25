import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { toast } from 'sonner'
import { type LeaveRequest, type Employee } from '@/lib/types'

interface LeaveRequestDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  leaveRequest: LeaveRequest | null
  employees: Employee[]
  leaveRequests: LeaveRequest[]
  setLeaveRequests: (requests: LeaveRequest[]) => void
}

export function LeaveRequestDialog({ open, onOpenChange, leaveRequest, employees, leaveRequests, setLeaveRequests }: LeaveRequestDialogProps) {
  const [formData, setFormData] = useState({
    employeeId: '',
    leaveType: 'casual' as 'casual' | 'sick' | 'annual' | 'unpaid',
    startDate: new Date().toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0],
    reason: '',
    status: 'pending' as 'pending' | 'approved' | 'rejected',
    approvedBy: ''
  })

  useEffect(() => {
    if (leaveRequest) {
      setFormData({
        employeeId: leaveRequest.employeeId,
        leaveType: leaveRequest.leaveType,
        startDate: new Date(leaveRequest.startDate).toISOString().split('T')[0],
        endDate: new Date(leaveRequest.endDate).toISOString().split('T')[0],
        reason: leaveRequest.reason,
        status: leaveRequest.status,
        approvedBy: leaveRequest.approvedBy || ''
      })
    } else {
      setFormData({
        employeeId: '',
        leaveType: 'casual',
        startDate: new Date().toISOString().split('T')[0],
        endDate: new Date().toISOString().split('T')[0],
        reason: '',
        status: 'pending',
        approvedBy: ''
      })
    }
  }, [leaveRequest, open])

  const calculateDays = (start: string, end: string) => {
    const startDate = new Date(start)
    const endDate = new Date(end)
    const diffTime = Math.abs(endDate.getTime() - startDate.getTime())
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1
    return diffDays
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.employeeId || !formData.reason) {
      toast.error('Please fill in all required fields')
      return
    }

    const days = calculateDays(formData.startDate, formData.endDate)

    if (leaveRequest) {
      setLeaveRequests(leaveRequests.map(req =>
        req.id === leaveRequest.id
          ? {
              ...req,
              employeeId: formData.employeeId,
              leaveType: formData.leaveType,
              startDate: new Date(formData.startDate).getTime(),
              endDate: new Date(formData.endDate).getTime(),
              days,
              reason: formData.reason,
              status: formData.status,
              approvedBy: formData.status === 'approved' ? formData.approvedBy || undefined : undefined,
              approvedAt: formData.status === 'approved' ? Date.now() : undefined
            }
          : req
      ))
      toast.success('Leave request updated successfully')
    } else {
      const newRequest: LeaveRequest = {
        id: `leave-${Date.now()}`,
        employeeId: formData.employeeId,
        leaveType: formData.leaveType,
        startDate: new Date(formData.startDate).getTime(),
        endDate: new Date(formData.endDate).getTime(),
        days,
        reason: formData.reason,
        status: formData.status,
        approvedBy: formData.status === 'approved' ? formData.approvedBy || undefined : undefined,
        approvedAt: formData.status === 'approved' ? Date.now() : undefined,
        createdAt: Date.now()
      }
      setLeaveRequests([...leaveRequests, newRequest])
      toast.success('Leave request submitted successfully')
    }

    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{leaveRequest ? 'Edit Leave Request' : 'New Leave Request'}</DialogTitle>
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
            <Label htmlFor="leaveType">Leave Type</Label>
            <Select value={formData.leaveType} onValueChange={(value: any) => setFormData({ ...formData, leaveType: value })}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="casual">Casual Leave</SelectItem>
                <SelectItem value="sick">Sick Leave</SelectItem>
                <SelectItem value="annual">Annual Leave</SelectItem>
                <SelectItem value="unpaid">Unpaid Leave</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="startDate">Start Date *</Label>
              <input
                id="startDate"
                type="date"
                className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-base shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 md:text-sm"
                value={formData.startDate}
                onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="endDate">End Date *</Label>
              <input
                id="endDate"
                type="date"
                className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-base shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 md:text-sm"
                value={formData.endDate}
                onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                required
              />
            </div>
          </div>

          <div className="p-3 bg-muted rounded-md text-sm">
            <span className="font-medium">Duration: {calculateDays(formData.startDate, formData.endDate)} day(s)</span>
          </div>

          <div className="space-y-2">
            <Label htmlFor="reason">Reason *</Label>
            <Textarea
              id="reason"
              value={formData.reason}
              onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
              rows={3}
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
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="approved">Approved</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {formData.status === 'approved' && (
            <div className="space-y-2">
              <Label htmlFor="approvedBy">Approved By</Label>
              <Input
                id="approvedBy"
                value={formData.approvedBy}
                onChange={(e) => setFormData({ ...formData, approvedBy: e.target.value })}
                placeholder="Approver ID or name"
              />
            </div>
          )}

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit">
              {leaveRequest ? 'Update' : 'Submit'} Request
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
