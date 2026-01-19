import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { Badge } from '@/components/ui/badge'
import { Card } from '@/components/ui/card'
import { Textarea } from '@/components/ui/textarea'
import { toast } from 'sonner'
import { Trash, CheckCircle, UserSwitch, Broom, Eye } from '@phosphor-icons/react'
import { type HousekeepingTask, type Room, type Employee, type RoomStatus } from '@/lib/types'

interface HousekeepingBatchOperationsProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  tasks: HousekeepingTask[]
  setTasks: (tasks: HousekeepingTask[] | ((prev: HousekeepingTask[]) => HousekeepingTask[])) => void
  rooms: Room[]
  setRooms: (rooms: Room[] | ((prev: Room[]) => Room[])) => void
  employees: Employee[]
}

type OperationType = 'assign-staff' | 'change-status' | 'change-priority' | 'delete-tasks' | 'bulk-room-status' | 'bulk-inspect'

export function HousekeepingBatchOperations({ 
  open, 
  onOpenChange,
  tasks,
  setTasks,
  rooms,
  setRooms,
  employees
}: HousekeepingBatchOperationsProps) {
  const [selectedTasks, setSelectedTasks] = useState<string[]>([])
  const [selectedRooms, setSelectedRooms] = useState<string[]>([])
  const [operationType, setOperationType] = useState<OperationType>('assign-staff')
  const [newAssignee, setNewAssignee] = useState('')
  const [newTaskStatus, setNewTaskStatus] = useState<'pending' | 'in-progress' | 'completed' | 'inspected'>('in-progress')
  const [newPriority, setNewPriority] = useState<'normal' | 'high' | 'urgent'>('normal')
  const [newRoomStatus, setNewRoomStatus] = useState<RoomStatus>('vacant-clean')
  const [notes, setNotes] = useState('')

  const housekeepers = employees.filter(e => e.department === 'housekeeping')
  const pendingTasks = tasks.filter(t => t.status === 'pending' || t.status === 'in-progress')
  const dirtyRooms = rooms.filter(r => r.status === 'vacant-dirty' || r.status === 'occupied-dirty')

  const handleToggleTask = (taskId: string) => {
    setSelectedTasks(prev => 
      prev.includes(taskId) 
        ? prev.filter(id => id !== taskId)
        : [...prev, taskId]
    )
  }

  const handleToggleRoom = (roomId: string) => {
    setSelectedRooms(prev => 
      prev.includes(roomId) 
        ? prev.filter(id => id !== roomId)
        : [...prev, roomId]
    )
  }

  const handleSelectAllTasks = () => {
    if (selectedTasks.length === pendingTasks.length) {
      setSelectedTasks([])
    } else {
      setSelectedTasks(pendingTasks.map(t => t.id))
    }
  }

  const handleSelectAllRooms = () => {
    if (selectedRooms.length === dirtyRooms.length) {
      setSelectedRooms([])
    } else {
      setSelectedRooms(dirtyRooms.map(r => r.id))
    }
  }

  const handleExecute = () => {
    let successMessage = ''

    switch (operationType) {
      case 'assign-staff':
        if (!newAssignee) {
          toast.error('Please select a staff member')
          return
        }
        if (selectedTasks.length === 0) {
          toast.error('Please select tasks to assign')
          return
        }
        setTasks((prev) => prev.map(task =>
          selectedTasks.includes(task.id)
            ? { ...task, assignedTo: newAssignee }
            : task
        ))
        successMessage = `Assigned ${selectedTasks.length} task(s) to ${employees.find(e => e.id === newAssignee)?.firstName}`
        break

      case 'change-status':
        if (selectedTasks.length === 0) {
          toast.error('Please select tasks to update')
          return
        }
        setTasks((prev) => prev.map(task =>
          selectedTasks.includes(task.id)
            ? {
                ...task,
                status: newTaskStatus,
                completedAt: newTaskStatus === 'completed' || newTaskStatus === 'inspected' ? Date.now() : task.completedAt,
                inspectedAt: newTaskStatus === 'inspected' ? Date.now() : task.inspectedAt
              }
            : task
        ))
        successMessage = `Updated ${selectedTasks.length} task(s) to ${newTaskStatus}`
        break

      case 'change-priority':
        if (selectedTasks.length === 0) {
          toast.error('Please select tasks to update')
          return
        }
        setTasks((prev) => prev.map(task =>
          selectedTasks.includes(task.id)
            ? { ...task, priority: newPriority }
            : task
        ))
        successMessage = `Changed priority for ${selectedTasks.length} task(s) to ${newPriority}`
        break

      case 'delete-tasks':
        if (selectedTasks.length === 0) {
          toast.error('Please select tasks to delete')
          return
        }
        setTasks((prev) => prev.filter(task => !selectedTasks.includes(task.id)))
        successMessage = `Deleted ${selectedTasks.length} task(s)`
        break

      case 'bulk-room-status':
        if (selectedRooms.length === 0) {
          toast.error('Please select rooms to update')
          return
        }
        setRooms((prev) => prev.map(room =>
          selectedRooms.includes(room.id)
            ? {
                ...room,
                status: newRoomStatus,
                lastCleaned: newRoomStatus === 'vacant-clean' || newRoomStatus === 'occupied-clean' ? Date.now() : room.lastCleaned,
                notes: notes || room.notes
              }
            : room
        ))
        successMessage = `Updated ${selectedRooms.length} room(s) to ${newRoomStatus}`
        break

      case 'bulk-inspect':
        if (selectedTasks.length === 0) {
          toast.error('Please select tasks to inspect')
          return
        }
        setTasks((prev) => prev.map(task =>
          selectedTasks.includes(task.id)
            ? {
                ...task,
                status: 'inspected',
                inspectedAt: Date.now(),
                inspectedBy: employees.find(e => e.department === 'housekeeping' && e.id === newAssignee)?.id
              }
            : task
        ))
        successMessage = `Inspected ${selectedTasks.length} task(s)`
        break

      default:
        break
    }

    toast.success(successMessage)
    setSelectedTasks([])
    setSelectedRooms([])
    onOpenChange(false)
  }

  const getOperationIcon = () => {
    switch (operationType) {
      case 'assign-staff': return <UserSwitch size={20} />
      case 'change-status': return <CheckCircle size={20} />
      case 'change-priority': return <Broom size={20} />
      case 'delete-tasks': return <Trash size={20} />
      case 'bulk-room-status': return <Broom size={20} />
      case 'bulk-inspect': return <Eye size={20} />
      default: return null
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl">
        <DialogHeader className="dialog-header-fixed">
          <DialogTitle className="flex items-center gap-2">
            {getOperationIcon()}
            Batch Operations
          </DialogTitle>
        </DialogHeader>

        <div className="dialog-body-scrollable">
          <div className="dialog-section">
            <div className="dialog-form-field">
              <Label>Operation Type</Label>
              <Select value={operationType} onValueChange={(value) => setOperationType(value as OperationType)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="assign-staff">Assign Staff to Tasks</SelectItem>
                  <SelectItem value="change-status">Change Task Status</SelectItem>
                  <SelectItem value="change-priority">Change Task Priority</SelectItem>
                  <SelectItem value="bulk-inspect">Bulk Inspect Tasks</SelectItem>
                  <SelectItem value="bulk-room-status">Bulk Update Room Status</SelectItem>
                  <SelectItem value="delete-tasks">Delete Tasks</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {operationType === 'assign-staff' && (
              <div className="dialog-form-field">
                <Label>Assign To</Label>
                <Select value={newAssignee} onValueChange={setNewAssignee}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select staff member" />
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
            )}

            {operationType === 'change-status' && (
              <div className="dialog-form-field">
                <Label>New Status</Label>
                <Select value={newTaskStatus} onValueChange={(value) => setNewTaskStatus(value as any)}>
                  <SelectTrigger>
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
            )}

            {operationType === 'change-priority' && (
              <div className="dialog-form-field">
                <Label>New Priority</Label>
                <Select value={newPriority} onValueChange={(value) => setNewPriority(value as any)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="normal">Normal</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="urgent">Urgent</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}

            {operationType === 'bulk-room-status' && (
              <>
                <div className="dialog-form-field">
                  <Label>New Room Status</Label>
                  <Select value={newRoomStatus} onValueChange={(value) => setNewRoomStatus(value as RoomStatus)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="vacant-clean">Vacant Clean</SelectItem>
                      <SelectItem value="vacant-dirty">Vacant Dirty</SelectItem>
                      <SelectItem value="occupied-clean">Occupied Clean</SelectItem>
                      <SelectItem value="occupied-dirty">Occupied Dirty</SelectItem>
                      <SelectItem value="maintenance">Maintenance</SelectItem>
                      <SelectItem value="out-of-order">Out of Order</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="dialog-form-field">
                  <Label>Notes (Optional)</Label>
                  <Textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Add notes for this batch update..."
                    rows={3}
                  />
                </div>
              </>
            )}

            {operationType === 'bulk-inspect' && (
              <div className="dialog-form-field">
                <Label>Inspector</Label>
                <Select value={newAssignee} onValueChange={setNewAssignee}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select inspector" />
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
            )}

            {(operationType === 'assign-staff' || operationType === 'change-status' || 
              operationType === 'change-priority' || operationType === 'delete-tasks' || 
              operationType === 'bulk-inspect') && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label>Select Tasks ({selectedTasks.length} selected)</Label>
                  <Button variant="outline" size="sm" onClick={handleSelectAllTasks}>
                    {selectedTasks.length === pendingTasks.length ? 'Deselect All' : 'Select All'}
                  </Button>
                </div>
                <div className="max-h-96 overflow-y-auto space-y-2 border rounded-lg p-3">
                  {pendingTasks.length === 0 ? (
                    <p className="text-muted-foreground text-center py-4">No tasks available</p>
                  ) : (
                    pendingTasks.map(task => {
                      const room = rooms.find(r => r.id === task.roomId)
                      const assignee = employees.find(e => e.id === task.assignedTo)
                      return (
                        <Card key={task.id} className="p-3">
                          <div className="flex items-start gap-3">
                            <Checkbox
                              checked={selectedTasks.includes(task.id)}
                              onCheckedChange={() => handleToggleTask(task.id)}
                            />
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <span className="font-semibold">Room {room?.roomNumber}</span>
                                <Badge variant="outline">{task.taskType}</Badge>
                                <Badge>{task.status}</Badge>
                                <Badge variant={task.priority === 'urgent' ? 'destructive' : 'default'}>
                                  {task.priority}
                                </Badge>
                              </div>
                              <p className="text-sm text-muted-foreground">
                                {assignee ? `Assigned to: ${assignee.firstName} ${assignee.lastName}` : 'Unassigned'}
                              </p>
                            </div>
                          </div>
                        </Card>
                      )
                    })
                  )}
                </div>
              </div>
            )}

            {operationType === 'bulk-room-status' && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label>Select Rooms ({selectedRooms.length} selected)</Label>
                  <Button variant="outline" size="sm" onClick={handleSelectAllRooms}>
                    {selectedRooms.length === dirtyRooms.length ? 'Deselect All' : 'Select All'}
                  </Button>
                </div>
                <div className="max-h-96 overflow-y-auto space-y-2 border rounded-lg p-3">
                  {dirtyRooms.length === 0 ? (
                    <p className="text-muted-foreground text-center py-4">No rooms available</p>
                  ) : (
                    dirtyRooms.map(room => (
                      <Card key={room.id} className="p-3">
                        <div className="flex items-start gap-3">
                          <Checkbox
                            checked={selectedRooms.includes(room.id)}
                            onCheckedChange={() => handleToggleRoom(room.id)}
                          />
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="font-semibold">Room {room.roomNumber}</span>
                              <Badge variant="outline" className="capitalize">{room.roomType}</Badge>
                              <Badge>{room.status.replace('-', ' ')}</Badge>
                            </div>
                            <p className="text-sm text-muted-foreground">Floor {room.floor}</p>
                          </div>
                        </div>
                      </Card>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        <DialogFooter className="dialog-footer-fixed">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleExecute}>
            Execute Batch Operation
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
