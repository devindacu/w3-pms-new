import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { 
  Plus, 
  MagnifyingGlass,
  Broom,
  CheckCircle,
  ClockCounterClockwise,
  Warning
} from '@phosphor-icons/react'
import { type Room, type HousekeepingTask, type Employee } from '@/lib/types'
import { getRoomStatusColor } from '@/lib/helpers'
import { HousekeepingTaskDialog } from './HousekeepingTaskDialog'
import { RoomStatusDialog } from './RoomStatusDialog'

interface HousekeepingProps {
  rooms: Room[]
  setRooms: (rooms: Room[] | ((prev: Room[]) => Room[])) => void
  tasks: HousekeepingTask[]
  setTasks: (tasks: HousekeepingTask[] | ((prev: HousekeepingTask[]) => HousekeepingTask[])) => void
  employees: Employee[]
}

export function Housekeeping({ rooms, setRooms, tasks, setTasks, employees }: HousekeepingProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [taskDialogOpen, setTaskDialogOpen] = useState(false)
  const [roomStatusDialogOpen, setRoomStatusDialogOpen] = useState(false)
  const [selectedTask, setSelectedTask] = useState<HousekeepingTask | undefined>()
  const [selectedRoom, setSelectedRoom] = useState<Room | undefined>()

  const safeTasks = tasks || []
  const safeRooms = rooms || []
  const safeEmployees = employees || []

  const pendingTasks = safeTasks.filter(t => t.status === 'pending')
  const inProgressTasks = safeTasks.filter(t => t.status === 'in-progress')
  const completedToday = safeTasks.filter(t => {
    if (!t.completedAt) return false
    const today = new Date().setHours(0, 0, 0, 0)
    const completedDate = new Date(t.completedAt).setHours(0, 0, 0, 0)
    return completedDate === today
  })

  const cleanRooms = safeRooms.filter(r => r.status === 'vacant-clean' || r.status === 'occupied-clean')
  const dirtyRooms = safeRooms.filter(r => r.status === 'vacant-dirty' || r.status === 'occupied-dirty')
  const maintenanceRooms = safeRooms.filter(r => r.status === 'maintenance' || r.status === 'out-of-order')

  const filteredRooms = safeRooms.filter(r => 
    r.roomNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
    r.roomType.toLowerCase().includes(searchQuery.toLowerCase()) ||
    r.status.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const filteredTasks = safeTasks.filter(t => {
    const room = safeRooms.find(r => r.id === t.roomId)
    const employee = safeEmployees.find(e => e.id === t.assignedTo)
    const employeeName = employee ? `${employee.firstName} ${employee.lastName}` : ''
    return room && (
      room.roomNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      employeeName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.taskType.toLowerCase().includes(searchQuery.toLowerCase())
    )
  })

  const getStatusBadge = (status: string) => {
    const variants: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
      'pending': 'outline',
      'in-progress': 'default',
      'completed': 'secondary',
      'inspected': 'secondary'
    }
    return <Badge variant={variants[status] || 'default'}>{status}</Badge>
  }

  const getPriorityBadge = (priority: string) => {
    const variants: Record<string, 'default' | 'secondary' | 'destructive'> = {
      'normal': 'secondary',
      'high': 'default',
      'urgent': 'destructive'
    }
    return <Badge variant={variants[priority] || 'default'}>{priority}</Badge>
  }

  const handleNewTask = () => {
    setSelectedTask(undefined)
    setTaskDialogOpen(true)
  }

  const handleEditTask = (task: HousekeepingTask) => {
    setSelectedTask(task)
    setTaskDialogOpen(true)
  }

  const handleChangeRoomStatus = (room: Room) => {
    setSelectedRoom(room)
    setRoomStatusDialogOpen(true)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-semibold">Housekeeping</h1>
          <p className="text-muted-foreground mt-1">Room status and cleaning management</p>
        </div>
        <Button onClick={handleNewTask}>
          <Plus size={20} className="mr-2" />
          New Task
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-6 border-l-4 border-l-primary">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-muted-foreground">Pending Tasks</h3>
            <ClockCounterClockwise size={20} className="text-primary" />
          </div>
          <p className="text-3xl font-semibold">{pendingTasks.length}</p>
        </Card>

        <Card className="p-6 border-l-4 border-l-accent">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-muted-foreground">In Progress</h3>
            <Broom size={20} className="text-accent" />
          </div>
          <p className="text-3xl font-semibold">{inProgressTasks.length}</p>
        </Card>

        <Card className="p-6 border-l-4 border-l-success">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-muted-foreground">Completed Today</h3>
            <CheckCircle size={20} className="text-success" />
          </div>
          <p className="text-3xl font-semibold">{completedToday.length}</p>
        </Card>

        <Card className="p-6 border-l-4 border-l-destructive">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-muted-foreground">Dirty Rooms</h3>
            <Warning size={20} className="text-destructive" />
          </div>
          <p className="text-3xl font-semibold">{dirtyRooms.length}</p>
        </Card>
      </div>

      <Card className="p-6">
        <Tabs defaultValue="rooms">
          <TabsList className="mb-4">
            <TabsTrigger value="rooms">All Rooms</TabsTrigger>
            <TabsTrigger value="tasks">Tasks</TabsTrigger>
            <TabsTrigger value="dirty">Dirty Rooms</TabsTrigger>
            <TabsTrigger value="clean">Clean Rooms</TabsTrigger>
          </TabsList>

          <div className="mb-4">
            <div className="relative">
              <MagnifyingGlass className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={20} />
              <Input
                placeholder="Search rooms or tasks..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          <TabsContent value="rooms">
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              {filteredRooms.map(room => (
                <Card
                  key={room.id}
                  className={`p-4 cursor-pointer hover:shadow-lg transition-shadow ${getRoomStatusColor(room.status)}`}
                  onClick={() => handleChangeRoomStatus(room)}
                >
                  <div className="text-center">
                    <div className="text-2xl font-bold mb-1">{room.roomNumber}</div>
                    <div className="text-xs text-muted-foreground capitalize mb-1">{room.roomType}</div>
                    <Badge variant="outline" className="text-xs">
                      {room.status.replace('-', ' ')}
                    </Badge>
                    {room.assignedHousekeeper && (
                      <div className="mt-2 text-xs text-muted-foreground">
                        {(() => {
                          const emp = employees.find(e => e.id === room.assignedHousekeeper)
                          return emp ? `${emp.firstName} ${emp.lastName}` : 'Assigned'
                        })()}
                      </div>
                    )}
                  </div>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="tasks" className="space-y-4">
            {filteredTasks.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                No tasks found
              </div>
            ) : (
              filteredTasks.map(task => {
                const room = rooms.find(r => r.id === task.roomId)
                const employee = employees.find(e => e.id === task.assignedTo)
                return (
                  <Card key={task.id} className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-lg font-semibold">
                            Room {room?.roomNumber || 'Unknown'}
                          </h3>
                          {getStatusBadge(task.status)}
                          {getPriorityBadge(task.priority)}
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                          <div>
                            <p className="text-muted-foreground">Task Type</p>
                            <p className="font-medium capitalize">{task.taskType.replace('-', ' ')}</p>
                          </div>
                          <div>
                            <p className="text-muted-foreground">Assigned To</p>
                            <p className="font-medium">{employee ? `${employee.firstName} ${employee.lastName}` : 'Unassigned'}</p>
                          </div>
                          <div>
                            <p className="text-muted-foreground">Room Type</p>
                            <p className="font-medium capitalize">{room?.roomType || 'N/A'}</p>
                          </div>
                          <div>
                            <p className="text-muted-foreground">Floor</p>
                            <p className="font-medium">{room?.floor || 'N/A'}</p>
                          </div>
                        </div>
                        {task.notes && (
                          <div className="mt-2 text-sm">
                            <p className="text-muted-foreground">Notes</p>
                            <p>{task.notes}</p>
                          </div>
                        )}
                      </div>
                      <Button size="sm" variant="outline" onClick={() => handleEditTask(task)}>
                        Update
                      </Button>
                    </div>
                  </Card>
                )
              })
            )}
          </TabsContent>

          <TabsContent value="dirty">
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              {dirtyRooms.map(room => (
                <Card
                  key={room.id}
                  className={`p-4 cursor-pointer hover:shadow-lg transition-shadow ${getRoomStatusColor(room.status)}`}
                  onClick={() => handleChangeRoomStatus(room)}
                >
                  <div className="text-center">
                    <div className="text-2xl font-bold mb-1">{room.roomNumber}</div>
                    <div className="text-xs text-muted-foreground capitalize mb-1">{room.roomType}</div>
                    <Badge variant="destructive" className="text-xs">
                      {room.status.replace('-', ' ')}
                    </Badge>
                  </div>
                </Card>
              ))}
            </div>
            {dirtyRooms.length === 0 && (
              <div className="text-center py-12 text-muted-foreground">
                No dirty rooms
              </div>
            )}
          </TabsContent>

          <TabsContent value="clean">
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              {cleanRooms.map(room => (
                <Card
                  key={room.id}
                  className={`p-4 cursor-pointer hover:shadow-lg transition-shadow ${getRoomStatusColor(room.status)}`}
                  onClick={() => handleChangeRoomStatus(room)}
                >
                  <div className="text-center">
                    <div className="text-2xl font-bold mb-1">{room.roomNumber}</div>
                    <div className="text-xs text-muted-foreground capitalize mb-1">{room.roomType}</div>
                    <Badge variant="secondary" className="text-xs">
                      {room.status.replace('-', ' ')}
                    </Badge>
                  </div>
                </Card>
              ))}
            </div>
            {cleanRooms.length === 0 && (
              <div className="text-center py-12 text-muted-foreground">
                No clean rooms
              </div>
            )}
          </TabsContent>
        </Tabs>
      </Card>

      <HousekeepingTaskDialog
        open={taskDialogOpen}
        onOpenChange={setTaskDialogOpen}
        task={selectedTask}
        tasks={tasks}
        setTasks={setTasks}
        rooms={rooms}
        employees={employees}
      />

      <RoomStatusDialog
        open={roomStatusDialogOpen}
        onOpenChange={setRoomStatusDialogOpen}
        room={selectedRoom}
        rooms={rooms}
        setRooms={setRooms}
        tasks={tasks}
        setTasks={setTasks}
        employees={employees}
      />
    </div>
  )
}
