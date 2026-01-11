import { useState } from 'react'
import { useKV } from '@github/spark/hooks'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { toast } from 'sonner'
import { 
  Clock, 
  DotsThree, 
  Play, 
  Pause, 
  Trash,
  Pencil,
  Eye,
  EnvelopeSimple,
  CalendarBlank,
  CheckCircle,
  Warning,
  XCircle
} from '@phosphor-icons/react'
import type { ReportSchedule, ScheduleExecutionLog } from '@/lib/reportScheduleTypes'
import { formatDate } from '@/lib/helpers'

interface ScheduleManagementProps {
  schedules: ReportSchedule[]
  onEdit: (schedule: ReportSchedule) => void
  onDelete: (scheduleId: string) => void
  onToggleStatus: (scheduleId: string) => void
  onRunNow: (scheduleId: string) => void
}

export function ScheduleManagement({
  schedules,
  onEdit,
  onDelete,
  onToggleStatus,
  onRunNow
}: ScheduleManagementProps) {
  const [executionLogs, setExecutionLogs] = useKV<ScheduleExecutionLog[]>('w3-hotel-schedule-logs', [])
  const [selectedSchedule, setSelectedSchedule] = useState<string | null>(null)

  const getStatusColor = (status: ReportSchedule['status']) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800 border-green-200'
      case 'paused':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'failed':
        return 'bg-red-100 text-red-800 border-red-200'
      case 'completed':
        return 'bg-blue-100 text-blue-800 border-blue-200'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const getFrequencyLabel = (schedule: ReportSchedule) => {
    const { frequency, timeOfDay, dayOfWeek, dayOfMonth } = schedule.scheduleConfig
    
    switch (frequency) {
      case 'daily':
        return `Daily at ${timeOfDay}`
      case 'weekly':
        return `Weekly on ${dayOfWeek} at ${timeOfDay}`
      case 'monthly':
        return `Monthly on day ${dayOfMonth} at ${timeOfDay}`
      default:
        return frequency
    }
  }

  const formatNextRun = (timestamp?: number) => {
    if (!timestamp) return 'Not scheduled'
    const date = new Date(timestamp)
    const now = new Date()
    const diff = timestamp - now.getTime()
    
    if (diff < 0) return 'Overdue'
    
    const hours = Math.floor(diff / (1000 * 60 * 60))
    const days = Math.floor(hours / 24)
    
    if (days > 0) {
      return `In ${days} day${days !== 1 ? 's' : ''}`
    } else if (hours > 0) {
      return `In ${hours} hour${hours !== 1 ? 's' : ''}`
    } else {
      const minutes = Math.floor(diff / (1000 * 60))
      return `In ${minutes} minute${minutes !== 1 ? 's' : ''}`
    }
  }

  const getScheduleLogs = (scheduleId: string) => {
    return (executionLogs || [])
      .filter(log => log.scheduleId === scheduleId)
      .sort((a, b) => b.executedAt - a.executedAt)
      .slice(0, 5)
  }

  const handleDelete = (scheduleId: string) => {
    if (confirm('Are you sure you want to delete this schedule?')) {
      onDelete(scheduleId)
      toast.success('Schedule deleted successfully')
    }
  }

  const handleToggle = (schedule: ReportSchedule) => {
    onToggleStatus(schedule.id)
    const newStatus = schedule.status === 'active' ? 'paused' : 'active'
    toast.success(`Schedule ${newStatus === 'active' ? 'activated' : 'paused'}`)
  }

  const handleRunNow = (schedule: ReportSchedule) => {
    onRunNow(schedule.id)
    toast.info(`Running report: ${schedule.name}`)
  }

  if (schedules.length === 0) {
    return (
      <Card className="p-12 text-center">
        <Clock size={48} className="mx-auto text-muted-foreground mb-4" />
        <h3 className="text-xl font-semibold mb-2">No Scheduled Reports</h3>
        <p className="text-muted-foreground mb-6">
          Create a schedule to automatically generate and email reports
        </p>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-4 border-l-4 border-l-green-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Active</p>
              <p className="text-2xl font-semibold">
                {schedules.filter(s => s.status === 'active').length}
              </p>
            </div>
            <CheckCircle size={32} className="text-green-500" />
          </div>
        </Card>

        <Card className="p-4 border-l-4 border-l-yellow-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Paused</p>
              <p className="text-2xl font-semibold">
                {schedules.filter(s => s.status === 'paused').length}
              </p>
            </div>
            <Pause size={32} className="text-yellow-500" />
          </div>
        </Card>

        <Card className="p-4 border-l-4 border-l-blue-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Total Runs</p>
              <p className="text-2xl font-semibold">
                {schedules.reduce((sum, s) => sum + s.runCount, 0)}
              </p>
            </div>
            <CalendarBlank size={32} className="text-blue-500" />
          </div>
        </Card>

        <Card className="p-4 border-l-4 border-l-red-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Failures</p>
              <p className="text-2xl font-semibold">
                {schedules.reduce((sum, s) => sum + s.failureCount, 0)}
              </p>
            </div>
            <XCircle size={32} className="text-red-500" />
          </div>
        </Card>
      </div>

      <Card>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Schedule Name</TableHead>
                <TableHead>Frequency</TableHead>
                <TableHead>Format</TableHead>
                <TableHead>Recipients</TableHead>
                <TableHead>Next Run</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Runs</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {schedules.map((schedule) => (
                <TableRow key={schedule.id}>
                  <TableCell>
                    <div>
                      <p className="font-medium">{schedule.name}</p>
                      {schedule.description && (
                        <p className="text-xs text-muted-foreground mt-1">
                          {schedule.description}
                        </p>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Clock size={16} className="text-muted-foreground" />
                      <span className="text-sm">{getFrequencyLabel(schedule)}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className="uppercase">
                      {schedule.format}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <EnvelopeSimple size={16} className="text-muted-foreground" />
                      <span className="text-sm">
                        {schedule.emailRecipients.length} recipient{schedule.emailRecipients.length !== 1 ? 's' : ''}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className="text-sm">{formatNextRun(schedule.nextRun)}</span>
                  </TableCell>
                  <TableCell>
                    <Badge className={getStatusColor(schedule.status)}>
                      {schedule.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">
                      <span className="font-medium">{schedule.runCount}</span>
                      {schedule.failureCount > 0 && (
                        <span className="text-red-600 ml-2">
                          ({schedule.failureCount} failed)
                        </span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <DotsThree size={20} />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleRunNow(schedule)}>
                          <Play size={16} className="mr-2" />
                          Run Now
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleToggle(schedule)}>
                          {schedule.status === 'active' ? (
                            <>
                              <Pause size={16} className="mr-2" />
                              Pause
                            </>
                          ) : (
                            <>
                              <Play size={16} className="mr-2" />
                              Activate
                            </>
                          )}
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => onEdit(schedule)}>
                          <Pencil size={16} className="mr-2" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => setSelectedSchedule(schedule.id)}>
                          <Eye size={16} className="mr-2" />
                          View Logs
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          onClick={() => handleDelete(schedule.id)}
                          className="text-red-600"
                        >
                          <Trash size={16} className="mr-2" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </Card>

      {selectedSchedule && (
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">Execution History</h3>
            <Button variant="ghost" size="sm" onClick={() => setSelectedSchedule(null)}>
              Close
            </Button>
          </div>
          <div className="space-y-3">
            {getScheduleLogs(selectedSchedule).map((log) => (
              <div 
                key={log.id} 
                className={`p-4 rounded-lg border ${
                  log.status === 'success' 
                    ? 'bg-green-50 border-green-200' 
                    : log.status === 'failed'
                    ? 'bg-red-50 border-red-200'
                    : 'bg-yellow-50 border-yellow-200'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      {log.status === 'success' ? (
                        <CheckCircle size={20} className="text-green-600" />
                      ) : log.status === 'failed' ? (
                        <XCircle size={20} className="text-red-600" />
                      ) : (
                        <Warning size={20} className="text-yellow-600" />
                      )}
                      <span className="font-medium capitalize">{log.status}</span>
                      <span className="text-sm text-muted-foreground">
                        {formatDate(log.executedAt)}
                      </span>
                    </div>
                    <div className="text-sm space-y-1">
                      <p>Duration: {(log.duration / 1000).toFixed(2)}s</p>
                      {log.emailsSent > 0 && (
                        <p>Emails sent: {log.emailsSent}</p>
                      )}
                      {log.reportSize && (
                        <p>Report size: {(log.reportSize / 1024).toFixed(2)} KB</p>
                      )}
                      {log.errorMessage && (
                        <p className="text-red-600">Error: {log.errorMessage}</p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
            {getScheduleLogs(selectedSchedule).length === 0 && (
              <p className="text-center text-muted-foreground py-8">
                No execution history available
              </p>
            )}
          </div>
        </Card>
      )}
    </div>
  )
}
