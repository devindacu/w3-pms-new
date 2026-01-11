export type ScheduleFrequency = 'daily' | 'weekly' | 'monthly'
export type ScheduleStatus = 'active' | 'paused' | 'completed' | 'failed'
export type DayOfWeek = 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday' | 'sunday'
export type ReportFormat = 'pdf' | 'excel' | 'csv'

export interface ScheduleConfig {
  frequency: ScheduleFrequency
  timeOfDay: string
  dayOfWeek?: DayOfWeek
  dayOfMonth?: number
  timezone: string
}

export interface EmailRecipient {
  name: string
  email: string
  type: 'to' | 'cc' | 'bcc'
}

export interface ReportSchedule {
  id: string
  name: string
  description?: string
  reportId: string
  reportType: 'template' | 'custom'
  scheduleConfig: ScheduleConfig
  format: ReportFormat
  emailRecipients: EmailRecipient[]
  includeCharts: boolean
  includeSummary: boolean
  status: ScheduleStatus
  lastRun?: number
  nextRun?: number
  runCount: number
  failureCount: number
  createdAt: number
  updatedAt: number
  createdBy: string
}

export interface ScheduleExecutionLog {
  id: string
  scheduleId: string
  executedAt: number
  status: 'success' | 'failed' | 'partial'
  duration: number
  reportSize?: number
  emailsSent: number
  errorMessage?: string
  generatedFileUrl?: string
}
