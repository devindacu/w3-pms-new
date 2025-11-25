import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { toast } from 'sonner'
import { type HousekeepingTask, type Room, type Employee } from '@/lib/types'
import { generateId } from '@/lib/helpers'

interface HousekeepingTaskDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  task?: HousekeepingTask
  tasks: HousekeepingTask[]
  setTasks: (tasks: HousekeepingTask[] | ((prev: HousekeepingTask[]) => HousekeepingTask[])) => void
  rooms: Room[]
  employees: Employee[]
}

export function HousekeepingTaskDialog({ 
  open, 
  onOpenChange, 
  task,
  tasks,
  setTasks,
  rooms,
  employees
}: HousekeepingTaskDialogProps) {
  const [formData, setFormData] = useState({
    roomId: '',
    assignedTo: '',
    taskType: 'clean' as 'clean' | 'deep-clean' | 'turndown' | 'inspection',
    status: 'pending' as 'pending' | 'in-progress' | 'completed' | 'inspected',
    priority: 'normal' as 'normal' | 'high' | 'urgent',
    notes: ''
  })

  const housekeepers = employees.filter(e => e.department === 'housekeeping')

  useEffect(() => {
    if (task) {
      setFormData({
        roomId: task.roomId,
        assignedTo: task.assignedTo || '',
        taskType: task.taskType,
        status: task.status,
        priority: task.priority,
        notes: task.notes || ''
      })
    } else {
      setFormData({
        roomId: '',
        assignedTo: '',
        taskType: 'clean',
        status: 'pending',
        priority: 'normal',
        notes: ''
      })
    }
  }, [task, open])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.roomId) {
      toast.error('Please select a room')
      return
    }

    if (task) {
      setTasks((prev) => prev.map(t => 
        t.id === task.id 
          ? {
              ...t,
              roomId: formData.roomId,
              assignedTo: formData.assignedTo || undefined,
              taskType: formData.taskType,
              status: formData.status,
              priority: formData.priority,
              notes: formData.notes || undefined,
              startedAt: formData.status === 'in-progress' && !t.startedAt ? Date.now() : t.startedAt,
              completedAt: formData.status === 'completed' && !t.completedAt ? Date.now() : t.completedAt
            }
          : t
      ))
      toast.success('Task updated successfully')
    } else {
      const newTask: HousekeepingTask = {
        id: generateId(),
        roomId: formData.roomId,
        assignedTo: formData.assignedTo || undefined,
        taskType: formData.taskType,
        status: formData.status,
        priority: formData.priority,
        notes: formData.notes || undefined,
        createdAt: Date.now()
      }
      setTasks((prev) => [...prev, newTask])
      toast.success('Task created successfully')
    }

    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{task ? 'Update Task' : 'New Housekeeping Task'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <Label htmlFor="roomId">Room *</Label>
              <Select value={formData.roomId} onValueChange={(value) => setFormData({ ...formData, roomId: value })}>
                <SelectTrigger id="roomId">
                  <SelectValue placeholder="Select room" />
                </SelectTrigger>
                <SelectContent>
                  {rooms.map(room => (
                    <SelectItem key={room.id} value={room.id}>
                      Room {room.roomNumber} - {room.roomType} ({room.status})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="taskType">Task Type</Label>
              <Select value={formData.taskType} onValueChange={(value: any) => setFormData({ ...formData, taskType: value })}>
                <SelectTrigger id="taskType">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="clean">Clean</SelectItem>
                  <SelectItem value="deep-clean">Deep Clean</SelectItem>
                  <SelectItem value="turndown">Turndown Service</SelectItem>
                  <SelectItem value="inspection">Inspection</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="assignedTo">Assign To</Label>
              <Select value={formData.assignedTo} onValueChange={(value) => setFormData({ ...formData, assignedTo: value })}>
                <SelectTrigger id="assignedTo">
                  <SelectValue placeholder="Select housekeeper (optional)" />
                </SelectTrigger>
                <SelectContent>
                  {housekeepers.map(emp => (
                    <SelectItem key={emp.id} value={emp.id}>
                      {emp.firstName} {emp.lastName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="status">Status</Label>
                <Select value={formData.status} onValueChange={(value: any) => setFormData({ ...formData, status: value })}>
                  <SelectTrigger id="status">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="in-progress">In Progress</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="inspected">Inspected</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="priority">Priority</Label>
                <Select value={formData.priority} onValueChange={(value: any) => setFormData({ ...formData, priority: value })}>
                  <SelectTrigger id="priority">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="normal">Normal</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="urgent">Urgent</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                rows={3}
                placeholder="Any special instructions or notes..."
              />
            </div>
          </div>

          <DialogFooter className="mt-6">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit">
              {task ? 'Update Task' : 'Create Task'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
