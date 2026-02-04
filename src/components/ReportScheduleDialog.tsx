import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Card } from '@/components/ui/card'
import { toast } from 'sonner'
import { 
  Clock, 
  CalendarBlank, 
  EnvelopeSimple, 
  Plus, 
  Trash,
  FileText,
  ChartBar
} from '@phosphor-icons/react'
import type { 
  ReportSchedule, 
  ScheduleFrequency, 
  DayOfWeek, 
  ReportFormat,
  EmailRecipient 
} from '@/lib/reportScheduleTypes'

interface ReportScheduleDialogProps {
  open: boolean
  onClose: () => void
  schedule?: ReportSchedule
  reportId: string
  reportName: string
  reportType: 'template' | 'custom'
  availableFormats: ReportFormat[]
  onSave: (schedule: ReportSchedule) => void
  currentUser: { id: string; email: string; firstName: string; lastName: string }
}

const DAYS_OF_WEEK: { value: DayOfWeek; label: string }[] = [
  { value: 'monday', label: 'Monday' },
  { value: 'tuesday', label: 'Tuesday' },
  { value: 'wednesday', label: 'Wednesday' },
  { value: 'thursday', label: 'Thursday' },
  { value: 'friday', label: 'Friday' },
  { value: 'saturday', label: 'Saturday' },
  { value: 'sunday', label: 'Sunday' }
]

const DAYS_OF_MONTH = Array.from({ length: 28 }, (_, i) => i + 1)

const TIMEZONES = [
  { value: 'UTC', label: 'UTC' },
  { value: 'America/New_York', label: 'Eastern Time (ET)' },
  { value: 'America/Chicago', label: 'Central Time (CT)' },
  { value: 'America/Denver', label: 'Mountain Time (MT)' },
  { value: 'America/Los_Angeles', label: 'Pacific Time (PT)' },
  { value: 'Europe/London', label: 'London (GMT/BST)' },
  { value: 'Europe/Paris', label: 'Paris (CET/CEST)' },
  { value: 'Asia/Dubai', label: 'Dubai (GST)' },
  { value: 'Asia/Kolkata', label: 'India (IST)' },
  { value: 'Asia/Singapore', label: 'Singapore (SGT)' },
  { value: 'Asia/Tokyo', label: 'Tokyo (JST)' },
  { value: 'Australia/Sydney', label: 'Sydney (AEDT/AEST)' }
]

export function ReportScheduleDialog({
  open,
  onClose,
  schedule,
  reportId,
  reportName,
  reportType,
  availableFormats,
  onSave,
  currentUser
}: ReportScheduleDialogProps) {
  const [name, setName] = useState(schedule?.name || `${reportName} - Auto Schedule`)
  const [description, setDescription] = useState(schedule?.description || '')
  const [frequency, setFrequency] = useState<ScheduleFrequency>(schedule?.scheduleConfig.frequency || 'daily')
  const [timeOfDay, setTimeOfDay] = useState(schedule?.scheduleConfig.timeOfDay || '08:00')
  const [dayOfWeek, setDayOfWeek] = useState<DayOfWeek>(schedule?.scheduleConfig.dayOfWeek || 'monday')
  const [dayOfMonth, setDayOfMonth] = useState(schedule?.scheduleConfig.dayOfMonth || 1)
  const [timezone, setTimezone] = useState(schedule?.scheduleConfig.timezone || 'UTC')
  const [format, setFormat] = useState<ReportFormat>(schedule?.format || availableFormats[0])
  const [includeCharts, setIncludeCharts] = useState(schedule?.includeCharts ?? true)
  const [includeSummary, setIncludeSummary] = useState(schedule?.includeSummary ?? true)
  const [recipients, setRecipients] = useState<EmailRecipient[]>(
    schedule?.emailRecipients || [
      { 
        name: `${currentUser.firstName} ${currentUser.lastName}`, 
        email: currentUser.email, 
        type: 'to' 
      }
    ]
  )
  const [newRecipientName, setNewRecipientName] = useState('')
  const [newRecipientEmail, setNewRecipientEmail] = useState('')
  const [newRecipientType, setNewRecipientType] = useState<'to' | 'cc' | 'bcc'>('to')

  const calculateNextRun = (): number => {
    const now = new Date()
    const [hours, minutes] = timeOfDay.split(':').map(Number)
    const nextRun = new Date()
    nextRun.setHours(hours, minutes, 0, 0)

    if (frequency === 'daily') {
      if (nextRun <= now) {
        nextRun.setDate(nextRun.getDate() + 1)
      }
    } else if (frequency === 'weekly') {
      const targetDay = DAYS_OF_WEEK.findIndex(d => d.value === dayOfWeek)
      const currentDay = nextRun.getDay() === 0 ? 6 : nextRun.getDay() - 1
      let daysUntilTarget = targetDay - currentDay
      
      if (daysUntilTarget < 0 || (daysUntilTarget === 0 && nextRun <= now)) {
        daysUntilTarget += 7
      }
      
      nextRun.setDate(nextRun.getDate() + daysUntilTarget)
    } else if (frequency === 'monthly') {
      nextRun.setDate(dayOfMonth)
      
      if (nextRun <= now || nextRun.getDate() !== dayOfMonth) {
        nextRun.setMonth(nextRun.getMonth() + 1)
        nextRun.setDate(dayOfMonth)
      }
    }

    return nextRun.getTime()
  }

  const handleAddRecipient = () => {
    if (!newRecipientEmail) {
      toast.error('Email is required')
      return
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(newRecipientEmail)) {
      toast.error('Invalid email address')
      return
    }

    if (recipients.some(r => r.email === newRecipientEmail)) {
      toast.error('This email is already added')
      return
    }

    setRecipients([...recipients, {
      name: newRecipientName || newRecipientEmail,
      email: newRecipientEmail,
      type: newRecipientType
    }])

    setNewRecipientName('')
    setNewRecipientEmail('')
    setNewRecipientType('to')
  }

  const handleRemoveRecipient = (email: string) => {
    setRecipients(recipients.filter(r => r.email !== email))
  }

  const handleSave = () => {
    if (!name.trim()) {
      toast.error('Schedule name is required')
      return
    }

    if (recipients.length === 0) {
      toast.error('At least one email recipient is required')
      return
    }

    const scheduleData: ReportSchedule = {
      id: schedule?.id || `schedule-${Date.now()}`,
      name,
      description,
      reportId,
      reportType,
      scheduleConfig: {
        frequency,
        timeOfDay,
        dayOfWeek: frequency === 'weekly' ? dayOfWeek : undefined,
        dayOfMonth: frequency === 'monthly' ? dayOfMonth : undefined,
        timezone
      },
      format,
      emailRecipients: recipients,
      includeCharts,
      includeSummary,
      status: schedule?.status || 'active',
      lastRun: schedule?.lastRun,
      nextRun: calculateNextRun(),
      runCount: schedule?.runCount || 0,
      failureCount: schedule?.failureCount || 0,
      createdAt: schedule?.createdAt || Date.now(),
      updatedAt: Date.now(),
      createdBy: schedule?.createdBy || currentUser.id
    }

    onSave(scheduleData)
    onClose()
  }

  const formatNextRun = () => {
    const nextRun = calculateNextRun()
    return new Date(nextRun).toLocaleString('en-US', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      timeZone: timezone
    })
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Clock size={24} className="text-primary" />
            {schedule ? 'Edit Report Schedule' : 'Schedule Report'}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          <Card className="p-4 bg-muted/50">
            <div className="flex items-center gap-3">
              <FileText size={20} className="text-primary" />
              <div>
                <p className="font-medium">{reportName}</p>
                <p className="text-sm text-muted-foreground">
                  {reportType === 'template' ? 'Standard Report' : 'Custom Report'}
                </p>
              </div>
            </div>
          </Card>

          <div className="space-y-4">
            <div>
              <Label htmlFor="schedule-name">Schedule Name</Label>
              <Input
                id="schedule-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter schedule name"
              />
            </div>

            <div>
              <Label htmlFor="schedule-description">Description (Optional)</Label>
              <Textarea
                id="schedule-description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Enter schedule description"
                rows={2}
              />
            </div>
          </div>

          <Separator />

          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <CalendarBlank size={20} className="text-primary" />
              <h3 className="font-semibold">Schedule Configuration</h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="frequency">Frequency</Label>
                <Select value={frequency} onValueChange={(v) => setFrequency(v as ScheduleFrequency)}>
                  <SelectTrigger id="frequency">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="daily">Daily</SelectItem>
                    <SelectItem value="weekly">Weekly</SelectItem>
                    <SelectItem value="monthly">Monthly</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="time">Time of Day</Label>
                <Input
                  id="time"
                  type="time"
                  value={timeOfDay}
                  onChange={(e) => setTimeOfDay(e.target.value)}
                />
              </div>

              {frequency === 'weekly' && (
                <div>
                  <Label htmlFor="day-of-week">Day of Week</Label>
                  <Select value={dayOfWeek} onValueChange={(v) => setDayOfWeek(v as DayOfWeek)}>
                    <SelectTrigger id="day-of-week">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {DAYS_OF_WEEK.map(day => (
                        <SelectItem key={day.value} value={day.value}>
                          {day.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              {frequency === 'monthly' && (
                <div>
                  <Label htmlFor="day-of-month">Day of Month</Label>
                  <Select value={dayOfMonth.toString()} onValueChange={(v) => setDayOfMonth(parseInt(v))}>
                    <SelectTrigger id="day-of-month">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {DAYS_OF_MONTH.map(day => (
                        <SelectItem key={day} value={day.toString()}>
                          {day}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              <div>
                <Label htmlFor="timezone">Timezone</Label>
                <Select value={timezone} onValueChange={setTimezone}>
                  <SelectTrigger id="timezone">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {TIMEZONES.map(tz => (
                      <SelectItem key={tz.value} value={tz.value}>
                        {tz.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <Card className="p-4 bg-blue-50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-800">
              <div className="flex items-start gap-3">
                <CalendarBlank size={20} className="text-blue-600 dark:text-blue-400 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-blue-900 dark:text-blue-100">Next Scheduled Run</p>
                  <p className="text-sm text-blue-700 dark:text-blue-300 mt-1">{formatNextRun()}</p>
                </div>
              </div>
            </Card>
          </div>

          <Separator />

          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <FileText size={20} className="text-primary" />
              <h3 className="font-semibold">Report Options</h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="format">Export Format</Label>
                <Select value={format} onValueChange={(v) => setFormat(v as ReportFormat)}>
                  <SelectTrigger id="format">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {availableFormats.map(fmt => (
                      <SelectItem key={fmt} value={fmt}>
                        {fmt.toUpperCase()}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <ChartBar size={18} />
                  <Label htmlFor="include-charts" className="cursor-pointer">Include Charts & Visualizations</Label>
                </div>
                <Switch
                  id="include-charts"
                  checked={includeCharts}
                  onCheckedChange={setIncludeCharts}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <FileText size={18} />
                  <Label htmlFor="include-summary" className="cursor-pointer">Include Executive Summary</Label>
                </div>
                <Switch
                  id="include-summary"
                  checked={includeSummary}
                  onCheckedChange={setIncludeSummary}
                />
              </div>
            </div>
          </div>

          <Separator />

          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <EnvelopeSimple size={20} className="text-primary" />
              <h3 className="font-semibold">Email Recipients</h3>
            </div>

            <div className="space-y-3">
              {recipients.map((recipient, index) => (
                <div key={index} className="flex items-center gap-3 p-3 bg-muted rounded-lg">
                  <div className="flex-1">
                    <p className="font-medium text-sm">{recipient.name}</p>
                    <p className="text-xs text-muted-foreground">{recipient.email}</p>
                  </div>
                  <Badge variant="outline" className="uppercase text-xs">
                    {recipient.type}
                  </Badge>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleRemoveRecipient(recipient.email)}
                  >
                    <Trash size={16} />
                  </Button>
                </div>
              ))}
            </div>

            <Card className="p-4">
              <div className="space-y-3">
                <Label>Add Recipient</Label>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <Input
                    placeholder="Name (optional)"
                    value={newRecipientName}
                    onChange={(e) => setNewRecipientName(e.target.value)}
                  />
                  <Input
                    placeholder="Email address"
                    type="email"
                    value={newRecipientEmail}
                    onChange={(e) => setNewRecipientEmail(e.target.value)}
                  />
                  <Select value={newRecipientType} onValueChange={(v) => setNewRecipientType(v as 'to' | 'cc' | 'bcc')}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="to">To</SelectItem>
                      <SelectItem value="cc">CC</SelectItem>
                      <SelectItem value="bcc">BCC</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={handleAddRecipient}
                  className="w-full"
                >
                  <Plus size={16} className="mr-2" />
                  Add Recipient
                </Button>
              </div>
            </Card>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSave}>
            {schedule ? 'Update Schedule' : 'Create Schedule'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
