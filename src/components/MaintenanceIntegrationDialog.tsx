import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Wrench, Link, Plus } from '@phosphor-icons/react'
import { toast } from 'sonner'
import { ulid } from 'ulid'
import { type HousekeepingTask, type MaintenanceRequest, type Room, type Employee } from '@/lib/types'

interface MaintenanceIntegrationDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  tasks: HousekeepingTask[]
  setTasks: (tasks: HousekeepingTask[] | ((prev: HousekeepingTask[]) => HousekeepingTask[])) => void
  maintenanceRequests: MaintenanceRequest[]
  setMaintenanceRequests: (requests: MaintenanceRequest[] | ((prev: MaintenanceRequest[]) => MaintenanceRequest[])) => void
  rooms: Room[]
  employees: Employee[]
}

export function MaintenanceIntegrationDialog({
  open,
  onOpenChange,
  tasks,
  setTasks,
  maintenanceRequests,
  setMaintenanceRequests,
  rooms,
  employees
}: MaintenanceIntegrationDialogProps) {
  const [selectedTask, setSelectedTask] = useState<string>('')
  const [selectedRequest, setSelectedRequest] = useState<string>('')

  const unlinkedTasks = (tasks || []).filter(t => !t.maintenanceRequestId && t.status !== 'completed')
  const unlinkedRequests = (maintenanceRequests || []).filter(mr => 
    !(tasks || []).some(t => t.maintenanceRequestId === mr.id)
  )

  const handleLinkTaskToRequest = () => {
    if (!selectedTask || !selectedRequest) {
      toast.error('Please select both a task and a maintenance request')
      return
    }

    setTasks((currentTasks) =>
      (currentTasks || []).map(t =>
        t.id === selectedTask ? { ...t, maintenanceRequestId: selectedRequest } : t
      )
    )

    toast.success('Task linked to maintenance request successfully')
    setSelectedTask('')
    setSelectedRequest('')
  }

  const handleUnlink = (taskId: string) => {
    setTasks((currentTasks) =>
      (currentTasks || []).map(t =>
        t.id === taskId ? { ...t, maintenanceRequestId: undefined } : t
      )
    )
    toast.success('Task unlinked from maintenance request')
  }

  const handleCreateMaintenanceRequest = (taskId: string) => {
    const task = (tasks || []).find(t => t.id === taskId)
    if (!task) return

    const room = rooms.find(r => r.id === task.roomId)
    if (!room) return

    const requestNumber = `MR-${Date.now().toString().slice(-6)}`

    const newRequest: MaintenanceRequest = {
      id: ulid(),
      requestNumber,
      roomId: room.id,
      location: `Room ${room.roomNumber}`,
      issueType: 'Room Issue',
      description: `Created from housekeeping task: ${task.taskType}`,
      priority: task.priority === 'urgent' ? 'urgent' : task.priority === 'high' ? 'high' : 'medium',
      status: 'scheduled',
      reportedBy: task.assignedTo || 'System',
      createdAt: Date.now(),
      notes: task.notes
    }

    setMaintenanceRequests((current) => [...(current || []), newRequest])
    
    setTasks((currentTasks) =>
      (currentTasks || []).map(t =>
        t.id === taskId ? { ...t, maintenanceRequestId: newRequest.id } : t
      )
    )

    toast.success(`Maintenance request ${requestNumber} created and linked`)
  }

  const linkedTasks = (tasks || []).filter(t => t.maintenanceRequestId)

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="dialog-content-wrapper max-w-5xl">
        <DialogHeader className="dialog-header-fixed">
          <DialogTitle className="flex items-center gap-2 mobile-heading-responsive">
            <Wrench className="text-primary" size={24} />
            Maintenance Integration
          </DialogTitle>
        </DialogHeader>

        <div className="dialog-body-scrollable">
          <div className="dialog-section">
            <Card className="dialog-card">
              <h3 className="dialog-section-title mb-3 sm:mb-4">Link Task to Maintenance Request</h3>
              <div className="dialog-grid-3 items-end">
                <div className="dialog-form-field">
                  <label className="dialog-form-label">Select Task</label>
                  <Select value={selectedTask} onValueChange={setSelectedTask}>
                    <SelectTrigger className="dialog-form-input">
                      <SelectValue placeholder="Choose task..." />
                    </SelectTrigger>
                    <SelectContent>
                      {unlinkedTasks.map(task => {
                        const room = rooms.find(r => r.id === task.roomId)
                        return (
                          <SelectItem key={task.id} value={task.id}>
                            Room {room?.roomNumber || 'N/A'} - {task.taskType}
                          </SelectItem>
                        )
                      })}
                    </SelectContent>
                  </Select>
                </div>

                <div className="dialog-form-field">
                  <label className="dialog-form-label">Select Maintenance Request</label>
                  <Select value={selectedRequest} onValueChange={setSelectedRequest}>
                    <SelectTrigger className="dialog-form-input">
                      <SelectValue placeholder="Choose request..." />
                    </SelectTrigger>
                    <SelectContent>
                      {unlinkedRequests.map(mr => (
                        <SelectItem key={mr.id} value={mr.id}>
                          {mr.requestNumber} - {mr.location}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <Button onClick={handleLinkTaskToRequest} className="dialog-button">
                  <Link size={18} className="mr-2" />
                  Link
                </Button>
              </div>
            </Card>

            <Card className="dialog-card">
              <h3 className="dialog-section-title mb-3 sm:mb-4">
                Linked Tasks ({linkedTasks.length})
              </h3>
              {linkedTasks.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Wrench size={48} className="mx-auto mb-4 opacity-50" />
                  <p>No tasks linked to maintenance requests</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {linkedTasks.map(task => {
                    const room = rooms.find(r => r.id === task.roomId)
                    const request = (maintenanceRequests || []).find(mr => mr.id === task.maintenanceRequestId)
                    const employee = task.assignedTo ? employees.find(e => e.id === task.assignedTo) : null
                    
                    return (
                      <div key={task.id} className="flex items-start justify-between gap-3 p-3 sm:p-4 border rounded-lg">
                        <div className="flex-1">
                          <div className="flex flex-wrap items-center gap-2 mb-2">
                            <h4 className="font-semibold">Room {room?.roomNumber || 'N/A'}</h4>
                            <Badge>{task.status}</Badge>
                            <Badge variant="outline" className="capitalize">{task.taskType}</Badge>
                          </div>
                          {employee && (
                            <p className="text-sm text-muted-foreground mb-1">
                              Assigned to: {employee.firstName} {employee.lastName}
                            </p>
                          )}
                          {request && (
                            <div className="text-sm">
                              <p className="text-muted-foreground">
                                Linked to: <span className="font-medium">{request.requestNumber}</span> - {request.issueType}
                              </p>
                              <p className="text-muted-foreground">
                                Status: <Badge variant="outline" className="ml-1">{request.status}</Badge>
                                Priority: <Badge variant={request.priority === 'urgent' ? 'destructive' : 'default'} className="ml-1">
                                  {request.priority}
                                </Badge>
                              </p>
                            </div>
                          )}
                        </div>
                        <Button size="sm" variant="outline" onClick={() => handleUnlink(task.id)}>
                          Unlink
                        </Button>
                      </div>
                    )
                  })}
                </div>
              )}
            </Card>

            <Card className="dialog-card">
              <h3 className="dialog-section-title mb-3 sm:mb-4">
                Create Maintenance Request from Task
              </h3>
              <p className="text-sm text-muted-foreground mb-4">
                Select a task below to create a linked maintenance request
              </p>
              {unlinkedTasks.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <p>No unlinked tasks available</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {unlinkedTasks.map(task => {
                    const room = rooms.find(r => r.id === task.roomId)
                    return (
                      <div key={task.id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex-1">
                          <h4 className="font-medium">Room {room?.roomNumber || 'N/A'}</h4>
                          <p className="text-sm text-muted-foreground capitalize">
                            {task.taskType} - {task.priority} priority
                          </p>
                        </div>
                        <Button size="sm" onClick={() => handleCreateMaintenanceRequest(task.id)}>
                          <Plus size={16} className="mr-1" />
                          Create Request
                        </Button>
                      </div>
                    )
                  })}
                </div>
              )}
            </Card>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
