import { useState, useEffect } from 'react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { type MaintenanceRequest, type Room, type Employee, type MaintenanceStatus, type MaintenancePriority } from '@/lib/types'
import { generateNumber } from '@/lib/helpers'

interface MaintenanceRequestDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  request: MaintenanceRequest | null
  onSave: (request: MaintenanceRequest) => void
  rooms: Room[]
  employees: Employee[]
}

export function MaintenanceRequestDialog({
  open,
  onOpenChange,
  request,
  onSave,
  rooms,
  employees
}: MaintenanceRequestDialogProps) {
  const [formData, setFormData] = useState<Partial<MaintenanceRequest>>({
    location: '',
    issueType: '',
    description: '',
    roomId: '',
    priority: 'medium',
    status: 'scheduled',
    assignedTo: '',
    reportedBy: '',
    notes: ''
  })

  useEffect(() => {
    if (request) {
      setFormData(request)
    } else {
      setFormData({
        location: '',
        issueType: '',
        description: '',
        roomId: '',
        priority: 'medium',
        status: 'scheduled',
        assignedTo: '',
        reportedBy: '',
        notes: ''
      })
    }
  }, [request, open])

  const handleSubmit = () => {
    if (!formData.location || !formData.issueType || !formData.description || !formData.reportedBy) {
      toast.error('Please fill in all required fields')
      return
    }

    const maintenanceRequest: MaintenanceRequest = {
      id: request?.id || `maint-${Date.now()}`,
      requestNumber: request?.requestNumber || generateNumber('MR'),
      location: formData.location!,
      issueType: formData.issueType!,
      description: formData.description!,
      roomId: formData.roomId,
      priority: formData.priority as MaintenancePriority,
      status: formData.status as MaintenanceStatus,
      assignedTo: formData.assignedTo,
      reportedBy: formData.reportedBy!,
      notes: formData.notes,
      scheduledAt: formData.scheduledAt,
      startedAt: formData.startedAt,
      completedAt: formData.completedAt,
      spareParts: formData.spareParts || [],
      createdAt: request?.createdAt || Date.now()
    }

    onSave(maintenanceRequest)
    toast.success(request ? 'Maintenance request updated' : 'Maintenance request created')
    onOpenChange(false)
  }

  const engineeringStaff = employees.filter(e => 
    e.department === 'engineering' && e.status === 'active'
  )

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {request ? 'Edit Maintenance Request' : 'New Maintenance Request'}
          </DialogTitle>
        </DialogHeader>

        <div className="dialog-grid-2">
          <div className="dialog-form-field">
            <Label>Location *</Label>
            <Input
              value={formData.location}
              onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              placeholder="e.g., Room 101, Lobby, Pool Area"
            />
          </div>

          <div className="dialog-form-field">
            <Label>Issue Type *</Label>
            <Select
              value={formData.issueType}
              onValueChange={(value) => setFormData({ ...formData, issueType: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select issue type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="plumbing">Plumbing</SelectItem>
                <SelectItem value="electrical">Electrical</SelectItem>
                <SelectItem value="hvac">HVAC</SelectItem>
                <SelectItem value="carpentry">Carpentry</SelectItem>
                <SelectItem value="painting">Painting</SelectItem>
                <SelectItem value="cleaning">Cleaning</SelectItem>
                <SelectItem value="furniture">Furniture</SelectItem>
                <SelectItem value="appliance">Appliance</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="dialog-form-field">
            <Label>Priority *</Label>
            <Select
              value={formData.priority}
              onValueChange={(value) => setFormData({ ...formData, priority: value as MaintenancePriority })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="low">Low</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="high">High</SelectItem>
                <SelectItem value="urgent">Urgent</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="dialog-form-field">
            <Label>Room (Optional)</Label>
            <Select
              value={formData.roomId || "none"}
              onValueChange={(value) => setFormData({ ...formData, roomId: value === "none" ? "" : value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select room" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">No specific room</SelectItem>
                {rooms.map(room => (
                  <SelectItem key={room.id} value={room.id}>
                    Room {room.roomNumber} - {room.roomType}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="dialog-form-field">
            <Label>Reported By *</Label>
            <Select
              value={formData.reportedBy}
              onValueChange={(value) => setFormData({ ...formData, reportedBy: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select staff member" />
              </SelectTrigger>
              <SelectContent>
                {employees.filter(e => e.status === 'active').map(emp => (
                  <SelectItem key={emp.id} value={emp.id}>
                    {emp.firstName} {emp.lastName} - {emp.department}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="dialog-form-field">
            <Label>Assign To</Label>
            <Select
              value={formData.assignedTo || "unassigned"}
              onValueChange={(value) => setFormData({ ...formData, assignedTo: value === "unassigned" ? "" : value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select engineer" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="unassigned">Unassigned</SelectItem>
                {engineeringStaff.map(emp => (
                  <SelectItem key={emp.id} value={emp.id}>
                    {emp.firstName} {emp.lastName}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="dialog-form-field">
            <Label>Status *</Label>
            <Select
              value={formData.status}
              onValueChange={(value) => setFormData({ ...formData, status: value as MaintenanceStatus })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="scheduled">Scheduled</SelectItem>
                <SelectItem value="in-progress">In Progress</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="dialog-form-field">
            <Label>Scheduled Date</Label>
            <Input
              type="datetime-local"
              value={formData.scheduledAt ? new Date(formData.scheduledAt).toISOString().slice(0, 16) : ''}
              onChange={(e) => setFormData({ ...formData, scheduledAt: e.target.value ? new Date(e.target.value).getTime() : undefined })}
            />
          </div>
        </div>

        <div className="dialog-form-field">
          <Label>Description *</Label>
          <Textarea
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            placeholder="Detailed description of the issue..."
            rows={4}
          />
        </div>

        <div className="dialog-form-field">
          <Label>Notes</Label>
          <Textarea
            value={formData.notes}
            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
            placeholder="Additional notes or updates..."
            rows={3}
          />
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSubmit}>
            {request ? 'Update' : 'Create'} Request
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
