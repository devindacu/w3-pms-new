import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { toast } from 'sonner'
import { type Room, type RoomStatus, type HousekeepingTask, type Employee } from '@/lib/types'
import { generateId } from '@/lib/helpers'

interface RoomStatusDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  room?: Room
  rooms: Room[]
  setRooms: (rooms: Room[] | ((prev: Room[]) => Room[])) => void
  tasks: HousekeepingTask[]
  setTasks: (tasks: HousekeepingTask[] | ((prev: HousekeepingTask[]) => HousekeepingTask[])) => void
  employees: Employee[]
}

export function RoomStatusDialog({ 
  open, 
  onOpenChange, 
  room,
  rooms,
  setRooms,
  tasks,
  setTasks,
  employees
}: RoomStatusDialogProps) {
  const [status, setStatus] = useState<RoomStatus>('vacant-clean')
  const [assignedHousekeeper, setAssignedHousekeeper] = useState('')
  const [notes, setNotes] = useState('')
  const [createTask, setCreateTask] = useState(false)

  const housekeepers = employees.filter(e => e.department === 'housekeeping')

  useEffect(() => {
    if (room) {
      setStatus(room.status)
      setAssignedHousekeeper(room.assignedHousekeeper || '')
      setNotes(room.notes || '')
      setCreateTask(false)
    }
  }, [room, open])

  if (!room) return null

  const handleSubmit = () => {
    setRooms((prev) => prev.map(r => 
      r.id === room.id 
        ? {
            ...r,
            status,
            assignedHousekeeper: assignedHousekeeper || undefined,
            notes: notes || undefined,
            lastCleaned: status === 'vacant-clean' || status === 'occupied-clean' ? Date.now() : r.lastCleaned
          }
        : r
    ))

    if (createTask && (status === 'vacant-dirty' || status === 'occupied-dirty')) {
      const newTask: HousekeepingTask = {
        id: generateId(),
        roomId: room.id,
        assignedTo: assignedHousekeeper || undefined,
        taskType: 'clean',
        status: 'pending',
        priority: 'normal',
        notes: notes || undefined,
        createdAt: Date.now()
      }
      setTasks((prev) => [...prev, newTask])
    }

    toast.success('Room status updated successfully')
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Update Room {room.roomNumber}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label>Room Type</Label>
            <p className="text-lg font-semibold capitalize">{room.roomType}</p>
          </div>

          <div>
            <Label htmlFor="status">Room Status</Label>
            <Select value={status} onValueChange={(value: RoomStatus) => setStatus(value)}>
              <SelectTrigger id="status">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="vacant-clean">Vacant - Clean</SelectItem>
                <SelectItem value="vacant-dirty">Vacant - Dirty</SelectItem>
                <SelectItem value="occupied-clean">Occupied - Clean</SelectItem>
                <SelectItem value="occupied-dirty">Occupied - Dirty</SelectItem>
                <SelectItem value="maintenance">Maintenance</SelectItem>
                <SelectItem value="out-of-order">Out of Order</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="assignedHousekeeper">Assigned Housekeeper</Label>
            <Select value={assignedHousekeeper} onValueChange={setAssignedHousekeeper}>
              <SelectTrigger id="assignedHousekeeper">
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

          {(status === 'vacant-dirty' || status === 'occupied-dirty') && (
            <div className="flex items-center gap-2 p-3 bg-muted rounded-lg">
              <input
                type="checkbox"
                id="createTask"
                checked={createTask}
                onChange={(e) => setCreateTask(e.target.checked)}
                className="h-4 w-4"
              />
              <Label htmlFor="createTask" className="cursor-pointer">
                Create cleaning task for this room
              </Label>
            </div>
          )}

          <div>
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
              placeholder="Any notes about this room..."
            />
          </div>

          {room.lastCleaned && (
            <div className="text-sm text-muted-foreground">
              Last cleaned: {new Date(room.lastCleaned).toLocaleString()}
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSubmit}>
            Update Status
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
