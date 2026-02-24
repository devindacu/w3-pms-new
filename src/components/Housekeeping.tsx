import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { toast } from 'sonner'
import { 
  Plus, 
  MagnifyingGlass,
  Broom,
  CheckCircle,
  ClockCounterClockwise,
  Warning,
  Wrench,
  FilePlus,
  DeviceMobile,
  Printer,
  Package,
  Eye,
  ListDashes,
  ClipboardText,
  Stack,
  Bell,
  Sparkle,
  Trash
} from '@phosphor-icons/react'
import { type Room, type HousekeepingTask, type Employee, type MaintenanceRequest, type LostFoundItem } from '@/lib/types'
import { getRoomStatusColor } from '@/lib/helpers'
import { HousekeepingTaskDialog } from './HousekeepingTaskDialog'
import { RoomStatusDialog } from './RoomStatusDialog'
import { DutyListDialog } from './DutyListDialog'
import { MaintenanceIntegrationDialog } from './MaintenanceIntegrationDialog'
import { LostFoundDialog } from './LostFoundDialog'
import { MobileSimulatorDialog } from './MobileSimulatorDialog'
import { HousekeepingBatchOperations } from './HousekeepingBatchOperations'
import { LinenTrackingSystem } from './LinenTrackingSystem'
import { PrintButton } from '@/components/PrintButton'
import { A4PrintWrapper } from '@/components/A4PrintWrapper'
import { useKV } from '@github/spark/hooks'

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
  const [dutyListDialogOpen, setDutyListDialogOpen] = useState(false)
  const [maintenanceDialogOpen, setMaintenanceDialogOpen] = useState(false)
  const [lostFoundDialogOpen, setLostFoundDialogOpen] = useState(false)
  const [mobileSimulatorOpen, setMobileSimulatorOpen] = useState(false)
  const [batchOperationsOpen, setBatchOperationsOpen] = useState(false)
  const [selectedTask, setSelectedTask] = useState<HousekeepingTask | undefined>()
  const [selectedRoom, setSelectedRoom] = useState<Room | undefined>()
  const [selectedLostFoundItem, setSelectedLostFoundItem] = useState<LostFoundItem | undefined>()
  
  const [maintenanceRequests, setMaintenanceRequests] = useKV<MaintenanceRequest[]>('w3-hotel-maintenance', [])
  const [lostFoundItems, setLostFoundItems] = useKV<LostFoundItem[]>('w3-hotel-lost-found', [])

  const safeTasks = tasks || []
  const safeRooms = rooms || []
  const safeEmployees = employees || []
  const safeMaintenanceRequests = maintenanceRequests || []
  const safeLostFoundItems = lostFoundItems || []

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
  const inspectedRooms = safeTasks.filter(t => t.status === 'inspected' && t.completedAt && 
    new Date(t.completedAt).setHours(0, 0, 0, 0) === new Date().setHours(0, 0, 0, 0)
  ).length

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

  const linkedMaintenanceRequests = safeMaintenanceRequests.filter(mr => 
    safeTasks.some(t => t.maintenanceRequestId === mr.id)
  )

  const unclaimedLostItems = safeLostFoundItems.filter(item => 
    item.status === 'reported' || item.status === 'in-storage'
  )

  useEffect(() => {
    const checkRoomStatusChanges = () => {
      safeTasks.forEach(task => {
        if (task.status === 'completed' && !task.inspectedAt) {
          const room = safeRooms.find(r => r.id === task.roomId)
          if (room) {
            const notification = new CustomEvent('room-ready-notification', {
              detail: {
                roomNumber: room.roomNumber,
                taskId: task.id,
                completedAt: task.completedAt
              }
            })
            window.dispatchEvent(notification)
          }
        }
      })
    }

    const interval = setInterval(checkRoomStatusChanges, 30000)
    return () => clearInterval(interval)
  }, [safeTasks, safeRooms])

  useEffect(() => {
    const handleRoomReady = (event: CustomEvent) => {
      const { roomNumber } = event.detail
      toast.success(`Room ${roomNumber} is ready for guests`, {
        duration: 5000,
        action: {
          label: 'View',
          onClick: () => {
            const room = safeRooms.find(r => r.roomNumber === roomNumber)
            if (room) handleChangeRoomStatus(room)
          }
        }
      })
    }

    window.addEventListener('room-ready-notification', handleRoomReady as EventListener)
    return () => {
      window.removeEventListener('room-ready-notification', handleRoomReady as EventListener)
    }
  }, [safeRooms])

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

  const handleDeleteTask = (taskId: string) => {
    if (!window.confirm('Delete this housekeeping task? This cannot be undone.')) return
    setTasks((prev) => (prev || []).filter(t => t.id !== taskId))
    toast.success('Task deleted')
  }

  const handleChangeRoomStatus = (room: Room) => {
    setSelectedRoom(room)
    setRoomStatusDialogOpen(true)
  }

  const handleNewLostFound = () => {
    setSelectedLostFoundItem(undefined)
    setLostFoundDialogOpen(true)
  }

  const handleEditLostFound = (item: LostFoundItem) => {
    setSelectedLostFoundItem(item)
    setLostFoundDialogOpen(true)
  }

  return (
    <div className="mobile-spacing-compact">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4 mb-4 sm:mb-6">
        <div>
          <h1 className="mobile-heading-responsive font-semibold">Housekeeping Management</h1>
          <p className="text-muted-foreground mt-1 mobile-text-responsive">Room status tracking, task management, and more</p>
        </div>
        <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
          <PrintButton
            elementId="housekeeping-printable"
            options={{
              title: 'Housekeeping Report',
              filename: `housekeeping-report-${new Date().toISOString().split('T')[0]}.pdf`
            }}
            variant="outline"
            size="default"
            className="flex-1 sm:flex-none mobile-optimized-button"
          />
          <Button onClick={handleNewTask} className="flex-1 sm:flex-none mobile-optimized-button">
            <Plus size={20} className="mr-2" />
            New Task
          </Button>
          <Button variant="outline" onClick={() => setBatchOperationsOpen(true)} className="flex-1 sm:flex-none mobile-optimized-button">
            <Stack size={20} className="mr-2" />
            Batch Ops
          </Button>
          <Button variant="outline" onClick={() => setDutyListDialogOpen(true)} className="flex-1 sm:flex-none mobile-optimized-button">
            <ListDashes size={20} className="mr-2" />
            Duty List
          </Button>
          <Button variant="outline" onClick={() => setMobileSimulatorOpen(true)} className="flex-1 sm:flex-none mobile-optimized-button">
            <DeviceMobile size={20} className="mr-2" />
            Mobile
          </Button>
        </div>
      </div>

      <div className="responsive-stat-grid mb-4 sm:mb-6">
        <Card className="mobile-card-compact border-l-4 border-l-primary">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-xs sm:text-sm font-medium text-muted-foreground">Pending</h3>
            <ClockCounterClockwise size={18} className="text-primary sm:w-5 sm:h-5" />
          </div>
          <p className="text-2xl sm:text-3xl font-semibold">{pendingTasks.length}</p>
        </Card>

        <Card className="mobile-card-compact border-l-4 border-l-accent">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-xs sm:text-sm font-medium text-muted-foreground">In Progress</h3>
            <Broom size={18} className="text-accent sm:w-5 sm:h-5" />
          </div>
          <p className="text-2xl sm:text-3xl font-semibold">{inProgressTasks.length}</p>
        </Card>

        <Card className="mobile-card-compact border-l-4 border-l-success">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-xs sm:text-sm font-medium text-muted-foreground">Completed</h3>
            <CheckCircle size={18} className="text-success sm:w-5 sm:h-5" />
          </div>
          <p className="text-2xl sm:text-3xl font-semibold">{completedToday.length}</p>
        </Card>

        <Card className="mobile-card-compact border-l-4 border-l-secondary">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-xs sm:text-sm font-medium text-muted-foreground">Inspected</h3>
            <Eye size={18} className="text-secondary sm:w-5 sm:h-5" />
          </div>
          <p className="text-2xl sm:text-3xl font-semibold">{inspectedRooms}</p>
        </Card>

        <Card className="mobile-card-compact border-l-4 border-l-destructive">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-xs sm:text-sm font-medium text-muted-foreground">Dirty Rooms</h3>
            <Warning size={18} className="text-destructive sm:w-5 sm:h-5" />
          </div>
          <p className="text-2xl sm:text-3xl font-semibold">{dirtyRooms.length}</p>
        </Card>

        <Card className="mobile-card-compact border-l-4 border-l-orange-500">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-xs sm:text-sm font-medium text-muted-foreground">Maintenance</h3>
            <Wrench size={18} className="text-orange-500 sm:w-5 sm:h-5" />
          </div>
          <p className="text-2xl sm:text-3xl font-semibold">{linkedMaintenanceRequests.length}</p>
        </Card>
      </div>

      <Card className="mobile-card-compact">
        <Tabs defaultValue="rooms">
          <TabsList className="mb-3 sm:mb-4 flex-wrap h-auto gap-1">
            <TabsTrigger value="rooms" className="mobile-text-responsive">All Rooms</TabsTrigger>
            <TabsTrigger value="tasks" className="mobile-text-responsive">Tasks</TabsTrigger>
            <TabsTrigger value="dirty" className="mobile-text-responsive">Dirty</TabsTrigger>
            <TabsTrigger value="clean" className="mobile-text-responsive">Clean</TabsTrigger>
            <TabsTrigger value="maintenance" className="mobile-text-responsive">Maintenance</TabsTrigger>
            <TabsTrigger value="lost-found" className="mobile-text-responsive">Lost & Found</TabsTrigger>
            <TabsTrigger value="linen" className="mobile-text-responsive">Linen Tracking</TabsTrigger>
          </TabsList>

          <div className="mb-3 sm:mb-4">
            <div className="relative">
              <MagnifyingGlass className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={20} />
              <Input
                placeholder="Search rooms, tasks, or items..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 mobile-optimized-input"
              />
            </div>
          </div>

          <TabsContent value="rooms" className="mt-0">
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-2 sm:gap-3 md:gap-4">
              {filteredRooms.map(room => (
                <Card
                  key={room.id}
                  className={`p-3 sm:p-4 cursor-pointer hover:shadow-lg transition-all ${getRoomStatusColor(room.status)} mobile-optimized-button min-h-0`}
                  onClick={() => handleChangeRoomStatus(room)}
                >
                  <div className="text-center">
                    <div className="text-xl sm:text-2xl font-bold mb-1">{room.roomNumber}</div>
                    <div className="text-xs text-muted-foreground capitalize mb-1">{room.roomType}</div>
                    <Badge variant="outline" className="text-xs">
                      {room.status.replace('-', ' ')}
                    </Badge>
                    {room.assignedHousekeeper && (
                      <div className="mt-2 text-xs text-muted-foreground truncate">
                        {(() => {
                          const emp = employees.find(e => e.id === room.assignedHousekeeper)
                          return emp ? `${emp.firstName} ${emp.lastName.charAt(0)}.` : 'Assigned'
                        })()}
                      </div>
                    )}
                  </div>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="tasks" className="dialog-section mt-0">
            {filteredTasks.length === 0 ? (
              <div className="text-center py-8 sm:py-12 text-muted-foreground">
                <Broom size={48} className="mx-auto mb-3 sm:mb-4 opacity-50" />
                <p className="mobile-text-responsive">No tasks found</p>
              </div>
            ) : (
              <div className="space-y-3 sm:space-y-4">
                {filteredTasks.map(task => {
                  const room = rooms.find(r => r.id === task.roomId)
                  const employee = employees.find(e => e.id === task.assignedTo)
                  return (
                    <Card key={task.id} className="mobile-card-compact">
                      <div className="flex flex-col sm:flex-row items-start justify-between gap-3">
                        <div className="flex-1 w-full">
                          <div className="flex flex-wrap items-center gap-2 sm:gap-3 mb-2 sm:mb-3">
                            <h3 className="text-base sm:text-lg font-semibold">
                              Room {room?.roomNumber || 'Unknown'}
                            </h3>
                            {getStatusBadge(task.status)}
                            {getPriorityBadge(task.priority)}
                          </div>
                          <div className="dialog-grid-2 sm:dialog-grid-4 gap-3 sm:gap-4 mobile-text-responsive">
                            <div>
                              <p className="text-muted-foreground">Task Type</p>
                              <p className="font-medium capitalize">{task.taskType.replace('-', ' ')}</p>
                            </div>
                            <div>
                              <p className="text-muted-foreground">Assigned To</p>
                              <p className="font-medium truncate">{employee ? `${employee.firstName} ${employee.lastName}` : 'Unassigned'}</p>
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
                            <div className="mt-2 sm:mt-3 mobile-text-responsive">
                              <p className="text-muted-foreground">Notes</p>
                              <p className="line-clamp-2">{task.notes}</p>
                            </div>
                          )}
                        </div>
                        <div className="flex gap-2 w-full sm:w-auto">
                          <Button size="sm" variant="outline" onClick={() => handleEditTask(task)} className="flex-1 sm:flex-none">
                            Update
                          </Button>
                          <Button size="sm" variant="ghost" className="text-destructive hover:text-destructive px-2" onClick={() => handleDeleteTask(task.id)}>
                            <Trash size={16} />
                          </Button>
                        </div>
                      </div>
                    </Card>
                  )
                })}
              </div>
            )}
          </TabsContent>

          <TabsContent value="dirty" className="mt-0">
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-2 sm:gap-3 md:gap-4">
              {dirtyRooms.map(room => (
                <Card
                  key={room.id}
                  className={`p-3 sm:p-4 cursor-pointer hover:shadow-lg transition-all ${getRoomStatusColor(room.status)} mobile-optimized-button min-h-0`}
                  onClick={() => handleChangeRoomStatus(room)}
                >
                  <div className="text-center">
                    <div className="text-xl sm:text-2xl font-bold mb-1">{room.roomNumber}</div>
                    <div className="text-xs text-muted-foreground capitalize mb-1">{room.roomType}</div>
                    <Badge variant="destructive" className="text-xs">
                      {room.status.replace('-', ' ')}
                    </Badge>
                  </div>
                </Card>
              ))}
            </div>
            {dirtyRooms.length === 0 && (
              <div className="text-center py-8 sm:py-12 text-muted-foreground">
                <CheckCircle size={48} className="mx-auto mb-3 sm:mb-4 text-success" />
                <p className="mobile-text-responsive">No dirty rooms</p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="clean" className="mt-0">
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-2 sm:gap-3 md:gap-4">
              {cleanRooms.map(room => (
                <Card
                  key={room.id}
                  className={`p-3 sm:p-4 cursor-pointer hover:shadow-lg transition-all ${getRoomStatusColor(room.status)} mobile-optimized-button min-h-0`}
                  onClick={() => handleChangeRoomStatus(room)}
                >
                  <div className="text-center">
                    <div className="text-xl sm:text-2xl font-bold mb-1">{room.roomNumber}</div>
                    <div className="text-xs text-muted-foreground capitalize mb-1">{room.roomType}</div>
                    <Badge variant="secondary" className="text-xs">
                      {room.status.replace('-', ' ')}
                    </Badge>
                  </div>
                </Card>
              ))}
            </div>
            {cleanRooms.length === 0 && (
              <div className="text-center py-8 sm:py-12 text-muted-foreground">
                <Warning size={48} className="mx-auto mb-3 sm:mb-4 opacity-50" />
                <p className="mobile-text-responsive">No clean rooms</p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="maintenance" className="mt-0">
            <div className="space-y-3 sm:space-y-4 mb-4">
              <div className="flex items-center justify-between">
                <h3 className="text-base sm:text-lg font-semibold mobile-text-responsive">Linked Maintenance Requests</h3>
                <Button size="sm" variant="outline" onClick={() => setMaintenanceDialogOpen(true)}>
                  <Wrench size={18} className="mr-2" />
                  Manage
                </Button>
              </div>
              {linkedMaintenanceRequests.length === 0 ? (
                <div className="text-center py-8 sm:py-12 text-muted-foreground">
                  <Wrench size={48} className="mx-auto mb-3 sm:mb-4 opacity-50" />
                  <p className="mobile-text-responsive">No maintenance requests linked to housekeeping tasks</p>
                </div>
              ) : (
                linkedMaintenanceRequests.map(mr => {
                  const linkedTask = safeTasks.find(t => t.maintenanceRequestId === mr.id)
                  const room = mr.roomId ? safeRooms.find(r => r.id === mr.roomId) : null
                  return (
                    <Card key={mr.id} className="mobile-card-compact">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1">
                          <div className="flex flex-wrap items-center gap-2 mb-2">
                            <h4 className="font-semibold mobile-text-responsive">{mr.requestNumber}</h4>
                            <Badge>{mr.status}</Badge>
                            <Badge variant={mr.priority === 'urgent' ? 'destructive' : 'default'}>{mr.priority}</Badge>
                          </div>
                          <div className="space-y-1 mobile-text-responsive">
                            <p><span className="text-muted-foreground">Location:</span> {room ? `Room ${room.roomNumber}` : mr.location}</p>
                            <p><span className="text-muted-foreground">Issue:</span> {mr.issueType}</p>
                            <p className="line-clamp-2"><span className="text-muted-foreground">Description:</span> {mr.description}</p>
                            {linkedTask && (
                              <p><span className="text-muted-foreground">Linked Task:</span> Room {safeRooms.find(r => r.id === linkedTask.roomId)?.roomNumber}</p>
                            )}
                          </div>
                        </div>
                      </div>
                    </Card>
                  )
                })
              )}
            </div>

            <div className="border-t pt-4">
              <h3 className="text-base sm:text-lg font-semibold mb-3 mobile-text-responsive">Rooms Under Maintenance</h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2 sm:gap-3">
                {maintenanceRooms.map(room => (
                  <Card
                    key={room.id}
                    className={`p-3 sm:p-4 cursor-pointer hover:shadow-lg transition-all ${getRoomStatusColor(room.status)} mobile-optimized-button min-h-0`}
                    onClick={() => handleChangeRoomStatus(room)}
                  >
                    <div className="text-center">
                      <div className="text-xl sm:text-2xl font-bold mb-1">{room.roomNumber}</div>
                      <div className="text-xs text-muted-foreground capitalize mb-1">{room.roomType}</div>
                      <Badge variant="outline" className="text-xs">
                        {room.status.replace('-', ' ')}
                      </Badge>
                    </div>
                  </Card>
                ))}
              </div>
              {maintenanceRooms.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  <p className="mobile-text-responsive">No rooms under maintenance</p>
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="lost-found" className="mt-0">
            <div className="flex items-center justify-between mb-3 sm:mb-4">
              <h3 className="text-base sm:text-lg font-semibold mobile-text-responsive">Lost & Found Database</h3>
              <Button size="sm" onClick={handleNewLostFound}>
                <FilePlus size={18} className="mr-2" />
                New Item
              </Button>
            </div>
            
            {safeLostFoundItems.length === 0 ? (
              <div className="text-center py-8 sm:py-12 text-muted-foreground">
                <Package size={48} className="mx-auto mb-3 sm:mb-4 opacity-50" />
                <p className="mb-3 sm:mb-4 mobile-text-responsive">No lost & found items recorded</p>
                <Button onClick={handleNewLostFound}>
                  <FilePlus size={18} className="mr-2" />
                  Report Found Item
                </Button>
              </div>
            ) : (
              <div className="space-y-3 sm:space-y-4">
                <div className="flex flex-wrap gap-2">
                  <Badge variant="outline" className="text-xs sm:text-sm">
                    Total: {safeLostFoundItems.length}
                  </Badge>
                  <Badge variant="destructive" className="text-xs sm:text-sm">
                    Unclaimed: {unclaimedLostItems.length}
                  </Badge>
                  <Badge variant="secondary" className="text-xs sm:text-sm">
                    Claimed: {safeLostFoundItems.filter(i => i.status === 'claimed').length}
                  </Badge>
                </div>
                
                {safeLostFoundItems.map(item => {
                  const room = item.roomId ? safeRooms.find(r => r.id === item.roomId) : null
                  const foundByEmployee = safeEmployees.find(e => e.id === item.foundBy)
                  
                  return (
                    <Card key={item.id} className="mobile-card-compact">
                      <div className="flex flex-col sm:flex-row items-start justify-between gap-3">
                        <div className="flex-1 w-full">
                          <div className="flex flex-wrap items-center gap-2 mb-2">
                            <h4 className="font-semibold mobile-text-responsive">{item.itemNumber}</h4>
                            <Badge variant={
                              item.status === 'claimed' ? 'secondary' :
                              item.status === 'reported' || item.status === 'in-storage' ? 'destructive' :
                              'outline'
                            }>
                              {item.status}
                            </Badge>
                            <Badge variant="outline" className="capitalize text-xs">
                              {item.category.replace('-', ' ')}
                            </Badge>
                          </div>
                          <div className="space-y-1 mobile-text-responsive">
                            <p><span className="text-muted-foreground">Description:</span> {item.description}</p>
                            <p><span className="text-muted-foreground">Found at:</span> {room ? `Room ${room.roomNumber}` : item.foundLocation}</p>
                            <p><span className="text-muted-foreground">Found by:</span> {foundByEmployee ? `${foundByEmployee.firstName} ${foundByEmployee.lastName}` : 'Unknown'}</p>
                            <p><span className="text-muted-foreground">Date:</span> {new Date(item.foundDate).toLocaleDateString()}</p>
                            {item.storageLocation && (
                              <p><span className="text-muted-foreground">Storage:</span> {item.storageLocation}</p>
                            )}
                            {item.guestName && (
                              <p><span className="text-muted-foreground">Guest:</span> {item.guestName}</p>
                            )}
                          </div>
                        </div>
                        <Button size="sm" variant="outline" onClick={() => handleEditLostFound(item)} className="w-full sm:w-auto">
                          Update
                        </Button>
                      </div>
                    </Card>
                  )
                })}
              </div>
            )}
          </TabsContent>

          <TabsContent value="linen" className="mt-0">
            <LinenTrackingSystem />
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

      <DutyListDialog
        open={dutyListDialogOpen}
        onOpenChange={setDutyListDialogOpen}
        tasks={tasks}
        rooms={rooms}
        employees={employees}
      />

      <MaintenanceIntegrationDialog
        open={maintenanceDialogOpen}
        onOpenChange={setMaintenanceDialogOpen}
        tasks={tasks}
        setTasks={setTasks}
        maintenanceRequests={maintenanceRequests || []}
        setMaintenanceRequests={setMaintenanceRequests}
        rooms={rooms}
        employees={employees}
      />

      <LostFoundDialog
        open={lostFoundDialogOpen}
        onOpenChange={setLostFoundDialogOpen}
        item={selectedLostFoundItem}
        items={lostFoundItems || []}
        setItems={setLostFoundItems}
        rooms={rooms}
        employees={employees}
      />

      <MobileSimulatorDialog
        open={mobileSimulatorOpen}
        onOpenChange={setMobileSimulatorOpen}
        tasks={tasks}
        setTasks={setTasks}
        rooms={rooms}
        setRooms={setRooms}
        employees={employees}
      />

      <HousekeepingBatchOperations
        open={batchOperationsOpen}
        onOpenChange={setBatchOperationsOpen}
        tasks={tasks}
        setTasks={setTasks}
        rooms={rooms}
        setRooms={setRooms}
        employees={employees}
      />

      {/* Hidden printable content */}
      <div className="hidden">
        <A4PrintWrapper
          id="housekeeping-printable"
          title="Housekeeping Report"
          headerContent={
            <div className="text-sm">
              <p><strong>Generated:</strong> {new Date().toLocaleDateString()}</p>
              <p><strong>Total Tasks:</strong> {safeTasks.length}</p>
              <p><strong>Clean Rooms:</strong> {cleanRooms.length} / {safeRooms.length}</p>
            </div>
          }
        >
          <div className="space-y-6">
            <section>
              <h2 className="text-lg font-semibold mb-4">Task Summary</h2>
              <table className="w-full border-collapse mb-6">
                <tbody>
                  <tr className="border-b">
                    <td className="p-2 font-semibold">Pending Tasks</td>
                    <td className="p-2 text-right">{pendingTasks.length}</td>
                    <td className="p-2 font-semibold">In Progress</td>
                    <td className="p-2 text-right">{inProgressTasks.length}</td>
                  </tr>
                  <tr className="border-b">
                    <td className="p-2 font-semibold">Completed Today</td>
                    <td className="p-2 text-right">{completedToday.length}</td>
                    <td className="p-2 font-semibold">Inspected Rooms</td>
                    <td className="p-2 text-right">{inspectedRooms}</td>
                  </tr>
                  <tr className="border-b">
                    <td className="p-2 font-semibold">Clean Rooms</td>
                    <td className="p-2 text-right">{cleanRooms.length}</td>
                    <td className="p-2 font-semibold">Maintenance Rooms</td>
                    <td className="p-2 text-right">{maintenanceRooms.length}</td>
                  </tr>
                </tbody>
              </table>
            </section>

            <section>
              <h2 className="text-lg font-semibold mb-4">Active Tasks</h2>
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="border p-2 text-left">Room</th>
                    <th className="border p-2 text-left">Task Type</th>
                    <th className="border p-2 text-left">Assigned To</th>
                    <th className="border p-2 text-left">Priority</th>
                    <th className="border p-2 text-left">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredTasks.filter(t => t.status !== 'completed' && t.status !== 'inspected').map((task) => {
                    const room = safeRooms.find(r => r.id === task.roomId)
                    const employee = safeEmployees.find(e => e.id === task.assignedTo)
                    return (
                      <tr key={task.id}>
                        <td className="border p-2">{room?.roomNumber || 'N/A'}</td>
                        <td className="border p-2 capitalize">{task.taskType.replace('-', ' ')}</td>
                        <td className="border p-2">{employee ? `${employee.firstName} ${employee.lastName}` : 'Unassigned'}</td>
                        <td className="border p-2 capitalize">{task.priority}</td>
                        <td className="border p-2 capitalize">{task.status}</td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </section>

            <section>
              <h2 className="text-lg font-semibold mb-4">Room Status</h2>
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="border p-2 text-left">Room Number</th>
                    <th className="border p-2 text-left">Type</th>
                    <th className="border p-2 text-left">Floor</th>
                    <th className="border p-2 text-left">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {safeRooms.map((room) => (
                    <tr key={room.id}>
                      <td className="border p-2 font-semibold">{room.roomNumber}</td>
                      <td className="border p-2 capitalize">{room.roomType}</td>
                      <td className="border p-2">{room.floor}</td>
                      <td className="border p-2 capitalize">{room.status.replace('-', ' ')}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </section>
          </div>
        </A4PrintWrapper>
      </div>
    </div>
  )
}
