import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { DeviceMobile, CheckCircle, Broom, Eye, User } from '@phosphor-icons/react'
import { toast } from 'sonner'
import { type HousekeepingTask, type Room, type Employee, type RoomStatus, type HousekeepingTaskStatus } from '@/lib/types'

interface MobileSimulatorDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  tasks: HousekeepingTask[]
  setTasks: (tasks: HousekeepingTask[] | ((prev: HousekeepingTask[]) => HousekeepingTask[])) => void
  rooms: Room[]
  setRooms: (rooms: Room[] | ((prev: Room[]) => Room[])) => void
  employees: Employee[]
}

export function MobileSimulatorDialog({
  open,
  onOpenChange,
  tasks,
  setTasks,
  rooms,
  setRooms,
  employees
}: MobileSimulatorDialogProps) {
  const [selectedEmployee, setSelectedEmployee] = useState<string>('')

  const housekeepers = employees.filter(emp => 
    emp.department === 'housekeeping' && emp.status === 'active'
  )

  const employeeTasks = selectedEmployee
    ? (tasks || []).filter(t => t.assignedTo === selectedEmployee && t.status !== 'completed')
    : []

  const handleStartTask = (taskId: string) => {
    setTasks((currentTasks) =>
      (currentTasks || []).map(t =>
        t.id === taskId
          ? { ...t, status: 'in-progress' as HousekeepingTaskStatus, startedAt: Date.now() }
          : t
      )
    )
    toast.success('Task started', { description: 'Status updated to In Progress' })
  }

  const handleCompleteTask = (taskId: string) => {
    const task = (tasks || []).find(t => t.id === taskId)
    if (!task) return

    setTasks((currentTasks) =>
      (currentTasks || []).map(t =>
        t.id === taskId
          ? { ...t, status: 'completed' as HousekeepingTaskStatus, completedAt: Date.now() }
          : t
      )
    )

    const room = rooms.find(r => r.id === task.roomId)
    if (room) {
      const newStatus: RoomStatus = room.status.includes('occupied')
        ? 'occupied-clean'
        : 'vacant-clean'
      
      setRooms((currentRooms) =>
        (currentRooms || []).map(r =>
          r.id === task.roomId
            ? { ...r, status: newStatus, lastCleaned: Date.now() }
            : r
        )
      )

      const notification = new CustomEvent('room-ready-notification', {
        detail: {
          roomNumber: room.roomNumber,
          taskId: task.id,
          completedAt: Date.now()
        }
      })
      window.dispatchEvent(notification)
    }

    toast.success('Task completed!', { description: 'Front desk has been notified' })
  }

  const handleInspectTask = (taskId: string) => {
    setTasks((currentTasks) =>
      (currentTasks || []).map(t =>
        t.id === taskId
          ? { ...t, status: 'inspected' as HousekeepingTaskStatus, inspectedAt: Date.now() }
          : t
      )
    )
    toast.success('Room inspected and approved')
  }

  const handleUpdateRoomStatus = (roomId: string, status: RoomStatus) => {
    setRooms((currentRooms) =>
      (currentRooms || []).map(r =>
        r.id === roomId ? { ...r, status } : r
      )
    )
    
    const room = rooms.find(r => r.id === roomId)
    toast.success(`Room ${room?.roomNumber} status updated to ${status.replace('-', ' ')}`)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="dialog-content-wrapper max-w-md h-[90vh]">
        <DialogHeader className="dialog-header-fixed">
          <DialogTitle className="flex items-center gap-2 mobile-heading-responsive">
            <DeviceMobile className="text-primary" size={24} />
            Mobile Access Simulator
          </DialogTitle>
        </DialogHeader>

        <div className="dialog-body-scrollable bg-muted/20 rounded-lg">
          <div className="bg-background rounded-lg shadow-lg mx-auto max-w-sm">
            <div className="p-3 sm:p-4 space-y-3 sm:space-y-4">
              <div className="flex items-center gap-3 pb-3 border-b">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <User size={20} className="text-primary" />
                </div>
                <div className="flex-1">
                  <Select value={selectedEmployee} onValueChange={setSelectedEmployee}>
                    <SelectTrigger className="h-9">
                      <SelectValue placeholder="Select housekeeper..." />
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
              </div>

              {!selectedEmployee ? (
                <Card className="p-6 sm:p-8 text-center">
                  <User size={48} className="mx-auto mb-3 text-muted-foreground opacity-50" />
                  <p className="text-sm text-muted-foreground">Select a housekeeper to view their tasks</p>
                </Card>
              ) : employeeTasks.length === 0 ? (
                <Card className="p-6 sm:p-8 text-center">
                  <CheckCircle size={48} className="mx-auto mb-3 text-success" />
                  <p className="text-sm font-medium mb-1">All done!</p>
                  <p className="text-xs text-muted-foreground">No pending tasks</p>
                </Card>
              ) : (
                <Tabs defaultValue="my-tasks" className="w-full">
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="my-tasks">My Tasks</TabsTrigger>
                    <TabsTrigger value="quick-update">Quick Update</TabsTrigger>
                  </TabsList>

                  <TabsContent value="my-tasks" className="space-y-2 mt-3">
                    {employeeTasks.map(task => {
                      const room = rooms.find(r => r.id === task.roomId)
                      if (!room) return null

                      return (
                        <Card key={task.id} className="p-3">
                          <div className="flex items-start justify-between mb-2">
                            <div>
                              <h4 className="font-semibold text-base">Room {room.roomNumber}</h4>
                              <p className="text-xs text-muted-foreground capitalize">
                                {task.taskType.replace('-', ' ')} • Floor {room.floor}
                              </p>
                            </div>
                            <Badge variant={
                              task.priority === 'urgent' ? 'destructive' :
                              task.priority === 'high' ? 'default' :
                              'secondary'
                            } className="text-xs">
                              {task.priority}
                            </Badge>
                          </div>

                          <div className="flex items-center gap-2 text-xs text-muted-foreground mb-3">
                            <Badge variant="outline" className="text-xs">
                              {task.status}
                            </Badge>
                            <span>•</span>
                            <span className="capitalize">{room.roomType}</span>
                          </div>

                          <div className="flex gap-2">
                            {task.status === 'pending' && (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleStartTask(task.id)}
                                className="flex-1 h-8 text-xs"
                              >
                                <Broom size={14} className="mr-1" />
                                Start
                              </Button>
                            )}
                            {task.status === 'in-progress' && (
                              <Button
                                size="sm"
                                onClick={() => handleCompleteTask(task.id)}
                                className="flex-1 h-8 text-xs"
                              >
                                <CheckCircle size={14} className="mr-1" />
                                Complete
                              </Button>
                            )}
                            {task.status === 'completed' && (
                              <Button
                                size="sm"
                                variant="secondary"
                                onClick={() => handleInspectTask(task.id)}
                                className="flex-1 h-8 text-xs"
                              >
                                <Eye size={14} className="mr-1" />
                                Inspect
                              </Button>
                            )}
                          </div>
                        </Card>
                      )
                    })}
                  </TabsContent>

                  <TabsContent value="quick-update" className="space-y-2 mt-3">
                    <p className="text-xs text-muted-foreground mb-3 px-1">
                      Quickly update room status without a task
                    </p>
                    {rooms.slice(0, 10).map(room => (
                      <Card key={room.id} className="p-3">
                        <div className="flex items-center justify-between mb-2">
                          <div>
                            <h4 className="font-medium text-sm">Room {room.roomNumber}</h4>
                            <p className="text-xs text-muted-foreground capitalize">
                              {room.roomType} • Floor {room.floor}
                            </p>
                          </div>
                          <Badge variant="outline" className="text-xs">
                            {room.status.replace('-', ' ')}
                          </Badge>
                        </div>

                        <div className="grid grid-cols-2 gap-1.5">
                          <Button
                            size="sm"
                            variant={room.status.includes('clean') ? 'secondary' : 'outline'}
                            onClick={() => handleUpdateRoomStatus(
                              room.id,
                              room.status.includes('occupied') ? 'occupied-clean' : 'vacant-clean'
                            )}
                            className="h-7 text-xs"
                          >
                            Clean
                          </Button>
                          <Button
                            size="sm"
                            variant={room.status.includes('dirty') ? 'destructive' : 'outline'}
                            onClick={() => handleUpdateRoomStatus(
                              room.id,
                              room.status.includes('occupied') ? 'occupied-dirty' : 'vacant-dirty'
                            )}
                            className="h-7 text-xs"
                          >
                            Dirty
                          </Button>
                        </div>
                      </Card>
                    ))}
                  </TabsContent>
                </Tabs>
              )}

              <div className="pt-3 border-t">
                <p className="text-xs text-center text-muted-foreground">
                  Mobile access simulation • Real-time sync enabled
                </p>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
