import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Printer, FileArrowDown, Calendar, User } from '@phosphor-icons/react'
import { toast } from 'sonner'
import { type HousekeepingTask, type Room, type Employee } from '@/lib/types'

interface DutyListDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  tasks: HousekeepingTask[]
  rooms: Room[]
  employees: Employee[]
}

export function DutyListDialog({
  open,
  onOpenChange,
  tasks,
  rooms,
  employees
}: DutyListDialogProps) {
  const [selectedEmployee, setSelectedEmployee] = useState<string>('all')
  const [selectedDate, setSelectedDate] = useState<string>('today')

  const housekeepers = employees.filter(emp => 
    emp.department === 'housekeeping' && emp.status === 'active'
  )

  const getFilteredTasks = () => {
    let filtered = tasks || []

    if (selectedEmployee !== 'all') {
      filtered = filtered.filter(t => t.assignedTo === selectedEmployee)
    }

    if (selectedDate === 'today') {
      const today = new Date().setHours(0, 0, 0, 0)
      filtered = filtered.filter(t => {
        const taskDate = new Date(t.createdAt).setHours(0, 0, 0, 0)
        return taskDate === today
      })
    }

    return filtered.filter(t => t.status !== 'completed' && t.status !== 'inspected')
  }

  const filteredTasks = getFilteredTasks()

  const tasksByEmployee = housekeepers.map(emp => {
    const employeeTasks = filteredTasks.filter(t => t.assignedTo === emp.id)
    return {
      employee: emp,
      tasks: employeeTasks,
      rooms: employeeTasks.map(t => rooms.find(r => r.id === t.roomId)).filter(Boolean) as Room[]
    }
  }).filter(item => item.tasks.length > 0)

  const unassignedTasks = filteredTasks.filter(t => !t.assignedTo)

  const handlePrint = () => {
    const printWindow = window.open('', '_blank')
    if (!printWindow) return

    const html = generatePrintHTML()
    printWindow.document.write(html)
    printWindow.document.close()
    printWindow.print()
    toast.success('Duty list sent to printer')
  }

  const handleExport = () => {
    const csvContent = generateCSV()
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    const url = URL.createObjectURL(blob)
    
    link.setAttribute('href', url)
    link.setAttribute('download', `duty-list-${new Date().toISOString().split('T')[0]}.csv`)
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    
    toast.success('Duty list exported successfully')
  }

  const generatePrintHTML = () => {
    const date = new Date().toLocaleDateString('en-US', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    })

    return `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Housekeeping Duty List - ${date}</title>
        <style>
          @media print {
            @page { margin: 1cm; }
            body { font-family: Arial, sans-serif; }
          }
          body { font-family: Arial, sans-serif; padding: 20px; }
          h1 { color: #333; border-bottom: 3px solid #4F46E5; padding-bottom: 10px; }
          h2 { color: #666; margin-top: 30px; border-bottom: 2px solid #ddd; padding-bottom: 5px; }
          h3 { color: #888; margin-top: 20px; }
          table { width: 100%; border-collapse: collapse; margin: 15px 0; }
          th, td { padding: 12px; text-align: left; border-bottom: 1px solid #ddd; }
          th { background-color: #f5f5f5; font-weight: bold; }
          .priority-urgent { color: #DC2626; font-weight: bold; }
          .priority-high { color: #F59E0B; }
          .priority-normal { color: #10B981; }
          .task-type { text-transform: capitalize; }
          .summary { background: #F3F4F6; padding: 15px; border-radius: 8px; margin: 20px 0; }
          .summary-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 15px; }
          .summary-item { text-align: center; }
          .summary-value { font-size: 24px; font-weight: bold; color: #4F46E5; }
          .summary-label { font-size: 12px; color: #666; text-transform: uppercase; }
          .signature { margin-top: 50px; border-top: 2px solid #000; width: 300px; text-align: center; padding-top: 10px; }
          .footer { margin-top: 50px; text-align: center; font-size: 12px; color: #999; }
        </style>
      </head>
      <body>
        <h1>Housekeeping Duty List</h1>
        <p><strong>Date:</strong> ${date}</p>
        <p><strong>Total Tasks:</strong> ${filteredTasks.length}</p>
        
        <div class="summary">
          <div class="summary-grid">
            <div class="summary-item">
              <div class="summary-value">${filteredTasks.filter(t => t.status === 'pending').length}</div>
              <div class="summary-label">Pending</div>
            </div>
            <div class="summary-item">
              <div class="summary-value">${filteredTasks.filter(t => t.status === 'in-progress').length}</div>
              <div class="summary-label">In Progress</div>
            </div>
            <div class="summary-item">
              <div class="summary-value">${filteredTasks.filter(t => t.priority === 'urgent').length}</div>
              <div class="summary-label">Urgent</div>
            </div>
          </div>
        </div>

        ${tasksByEmployee.map(item => `
          <h2>${item.employee.firstName} ${item.employee.lastName} - ${item.tasks.length} ${item.tasks.length === 1 ? 'Task' : 'Tasks'}</h2>
          <table>
            <thead>
              <tr>
                <th>Room</th>
                <th>Floor</th>
                <th>Type</th>
                <th>Task</th>
                <th>Priority</th>
                <th>Status</th>
                <th>Notes</th>
              </tr>
            </thead>
            <tbody>
              ${item.tasks.map((task, idx) => {
                const room = item.rooms[idx]
                return `
                  <tr>
                    <td><strong>${room?.roomNumber || 'N/A'}</strong></td>
                    <td>${room?.floor || 'N/A'}</td>
                    <td class="task-type">${room?.roomType || 'N/A'}</td>
                    <td class="task-type">${task.taskType.replace('-', ' ')}</td>
                    <td class="priority-${task.priority}">${task.priority}</td>
                    <td>${task.status}</td>
                    <td>${task.notes || '-'}</td>
                  </tr>
                `
              }).join('')}
            </tbody>
          </table>
          <div class="signature">
            Signature: ___________________________
          </div>
        `).join('')}

        ${unassignedTasks.length > 0 ? `
          <h2>Unassigned Tasks - ${unassignedTasks.length}</h2>
          <table>
            <thead>
              <tr>
                <th>Room</th>
                <th>Floor</th>
                <th>Type</th>
                <th>Task</th>
                <th>Priority</th>
                <th>Status</th>
                <th>Notes</th>
              </tr>
            </thead>
            <tbody>
              ${unassignedTasks.map(task => {
                const room = rooms.find(r => r.id === task.roomId)
                return `
                  <tr>
                    <td><strong>${room?.roomNumber || 'N/A'}</strong></td>
                    <td>${room?.floor || 'N/A'}</td>
                    <td class="task-type">${room?.roomType || 'N/A'}</td>
                    <td class="task-type">${task.taskType.replace('-', ' ')}</td>
                    <td class="priority-${task.priority}">${task.priority}</td>
                    <td>${task.status}</td>
                    <td>${task.notes || '-'}</td>
                  </tr>
                `
              }).join('')}
            </tbody>
          </table>
        ` : ''}

        <div class="footer">
          <p>Generated on ${new Date().toLocaleString()}</p>
          <p>W3 Hotel PMS - Housekeeping Management System</p>
        </div>
      </body>
      </html>
    `
  }

  const generateCSV = () => {
    const headers = ['Employee', 'Room', 'Floor', 'Room Type', 'Task Type', 'Priority', 'Status', 'Notes']
    const rows = filteredTasks.map(task => {
      const room = rooms.find(r => r.id === task.roomId)
      const employee = task.assignedTo ? employees.find(e => e.id === task.assignedTo) : null
      
      return [
        employee ? `${employee.firstName} ${employee.lastName}` : 'Unassigned',
        room?.roomNumber || 'N/A',
        room?.floor?.toString() || 'N/A',
        room?.roomType || 'N/A',
        task.taskType.replace('-', ' '),
        task.priority,
        task.status,
        task.notes || ''
      ]
    })

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n')

    return csvContent
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="dialog-content-wrapper max-w-6xl">
        <DialogHeader className="dialog-header-fixed">
          <DialogTitle className="flex items-center gap-2 mobile-heading-responsive">
            <Calendar className="text-primary" size={24} />
            Housekeeping Duty List
          </DialogTitle>
        </DialogHeader>

        <div className="dialog-body-scrollable">
          <div className="dialog-section">
            <div className="dialog-grid-2 lg:dialog-grid-4">
              <div className="dialog-form-field">
                <label className="dialog-form-label">Filter by Employee</label>
                <Select value={selectedEmployee} onValueChange={setSelectedEmployee}>
                  <SelectTrigger className="dialog-form-input">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Housekeepers</SelectItem>
                    {housekeepers.map(emp => (
                      <SelectItem key={emp.id} value={emp.id}>
                        {emp.firstName} {emp.lastName}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="dialog-form-field">
                <label className="dialog-form-label">Filter by Date</label>
                <Select value={selectedDate} onValueChange={setSelectedDate}>
                  <SelectTrigger className="dialog-form-input">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="today">Today Only</SelectItem>
                    <SelectItem value="all">All Pending</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-end">
                <Button onClick={handlePrint} className="w-full dialog-button">
                  <Printer size={18} className="mr-2" />
                  Print
                </Button>
              </div>

              <div className="flex items-end">
                <Button onClick={handleExport} variant="outline" className="w-full dialog-button">
                  <FileArrowDown size={18} className="mr-2" />
                  Export CSV
                </Button>
              </div>
            </div>

            <div className="mt-4 sm:mt-6">
              <Tabs defaultValue="by-employee">
                <TabsList>
                  <TabsTrigger value="by-employee">By Employee</TabsTrigger>
                  <TabsTrigger value="all-tasks">All Tasks</TabsTrigger>
                </TabsList>

                <TabsContent value="by-employee" className="dialog-tabs-content">
                  {tasksByEmployee.length === 0 ? (
                    <Card className="p-8 sm:p-12 text-center">
                      <User size={48} className="mx-auto mb-4 text-muted-foreground opacity-50" />
                      <p className="text-muted-foreground">No assigned tasks found</p>
                    </Card>
                  ) : (
                    tasksByEmployee.map(item => (
                      <Card key={item.employee.id} className="dialog-card mb-4 sm:mb-6">
                        <div className="flex items-center justify-between mb-3 sm:mb-4">
                          <div>
                            <h3 className="dialog-section-title">
                              {item.employee.firstName} {item.employee.lastName}
                            </h3>
                            <p className="text-xs sm:text-sm text-muted-foreground">
                              {item.employee.role} • {item.tasks.length} {item.tasks.length === 1 ? 'task' : 'tasks'}
                            </p>
                          </div>
                          <div className="flex gap-2">
                            <Badge variant="outline">
                              Pending: {item.tasks.filter(t => t.status === 'pending').length}
                            </Badge>
                            <Badge>
                              In Progress: {item.tasks.filter(t => t.status === 'in-progress').length}
                            </Badge>
                          </div>
                        </div>

                        <div className="responsive-table-wrapper">
                          <table className="responsive-table">
                            <thead>
                              <tr>
                                <th>Room</th>
                                <th>Floor</th>
                                <th>Type</th>
                                <th>Task</th>
                                <th>Priority</th>
                                <th>Status</th>
                                <th>Notes</th>
                              </tr>
                            </thead>
                            <tbody>
                              {item.tasks.map((task, idx) => {
                                const room = item.rooms[idx]
                                return (
                                  <tr key={task.id}>
                                    <td className="font-semibold">{room?.roomNumber || 'N/A'}</td>
                                    <td>{room?.floor || 'N/A'}</td>
                                    <td className="capitalize">{room?.roomType || 'N/A'}</td>
                                    <td className="capitalize">{task.taskType.replace('-', ' ')}</td>
                                    <td>
                                      <Badge variant={
                                        task.priority === 'urgent' ? 'destructive' :
                                        task.priority === 'high' ? 'default' :
                                        'secondary'
                                      }>
                                        {task.priority}
                                      </Badge>
                                    </td>
                                    <td>
                                      <Badge variant="outline">{task.status}</Badge>
                                    </td>
                                    <td className="text-xs sm:text-sm">{task.notes || '-'}</td>
                                  </tr>
                                )
                              })}
                            </tbody>
                          </table>
                        </div>
                      </Card>
                    ))
                  )}

                  {unassignedTasks.length > 0 && (
                    <Card className="dialog-card">
                      <h3 className="dialog-section-title mb-3 sm:mb-4">
                        Unassigned Tasks ({unassignedTasks.length})
                      </h3>
                      <div className="responsive-table-wrapper">
                        <table className="responsive-table">
                          <thead>
                            <tr>
                              <th>Room</th>
                              <th>Floor</th>
                              <th>Type</th>
                              <th>Task</th>
                              <th>Priority</th>
                              <th>Status</th>
                              <th>Notes</th>
                            </tr>
                          </thead>
                          <tbody>
                            {unassignedTasks.map(task => {
                              const room = rooms.find(r => r.id === task.roomId)
                              return (
                                <tr key={task.id}>
                                  <td className="font-semibold">{room?.roomNumber || 'N/A'}</td>
                                  <td>{room?.floor || 'N/A'}</td>
                                  <td className="capitalize">{room?.roomType || 'N/A'}</td>
                                  <td className="capitalize">{task.taskType.replace('-', ' ')}</td>
                                  <td>
                                    <Badge variant={
                                      task.priority === 'urgent' ? 'destructive' :
                                      task.priority === 'high' ? 'default' :
                                      'secondary'
                                    }>
                                      {task.priority}
                                    </Badge>
                                  </td>
                                  <td>
                                    <Badge variant="outline">{task.status}</Badge>
                                  </td>
                                  <td className="text-xs sm:text-sm">{task.notes || '-'}</td>
                                </tr>
                              )
                            })}
                          </tbody>
                        </table>
                      </div>
                    </Card>
                  )}
                </TabsContent>

                <TabsContent value="all-tasks" className="dialog-tabs-content">
                  {filteredTasks.length === 0 ? (
                    <Card className="p-8 sm:p-12 text-center">
                      <Calendar size={48} className="mx-auto mb-4 text-muted-foreground opacity-50" />
                      <p className="text-muted-foreground">No tasks found</p>
                    </Card>
                  ) : (
                    <Card className="dialog-card">
                      <div className="responsive-table-wrapper">
                        <table className="responsive-table">
                          <thead>
                            <tr>
                              <th>Employee</th>
                              <th>Room</th>
                              <th>Floor</th>
                              <th>Type</th>
                              <th>Task</th>
                              <th>Priority</th>
                              <th>Status</th>
                              <th>Notes</th>
                            </tr>
                          </thead>
                          <tbody>
                            {filteredTasks.map(task => {
                              const room = rooms.find(r => r.id === task.roomId)
                              const employee = task.assignedTo ? employees.find(e => e.id === task.assignedTo) : null
                              return (
                                <tr key={task.id}>
                                  <td>{employee ? `${employee.firstName} ${employee.lastName}` : 'Unassigned'}</td>
                                  <td className="font-semibold">{room?.roomNumber || 'N/A'}</td>
                                  <td>{room?.floor || 'N/A'}</td>
                                  <td className="capitalize">{room?.roomType || 'N/A'}</td>
                                  <td className="capitalize">{task.taskType.replace('-', ' ')}</td>
                                  <td>
                                    <Badge variant={
                                      task.priority === 'urgent' ? 'destructive' :
                                      task.priority === 'high' ? 'default' :
                                      'secondary'
                                    }>
                                      {task.priority}
                                    </Badge>
                                  </td>
                                  <td>
                                    <Badge variant="outline">{task.status}</Badge>
                                  </td>
                                  <td className="text-xs sm:text-sm">{task.notes || '-'}</td>
                                </tr>
                              )
                            })}
                          </tbody>
                        </table>
                      </div>
                    </Card>
                  )}
                </TabsContent>
              </Tabs>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
