import { useState } from 'react'
import { useKV } from '@github/spark/hooks'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Dialog, DialogContent } from '@/components/ui/dialog'
import { toast } from 'sonner'
import {
  FileText,
  Download,
  Printer,
  CalendarBlank,
  CurrencyDollar,
  Users,
  Bed,
  Broom,
  ForkKnife,
  Package,
  ChartBar,
  Receipt,
  TrendUp,
  ClipboardText,
  FilePdf,
  FileXls,
  Eye,
  Plus,
  Pencil,
  Trash,
  Clock,
  Sparkle
} from '@phosphor-icons/react'
import type {
  Room,
  Reservation,
  Guest,
  Order,
  Employee,
  HousekeepingTask,
  InventoryItem,
  GuestInvoice,
  Payment,
  Expense
} from '@/lib/types'
import type { CustomReport } from '@/lib/reportBuilderTypes'
import type { ReportSchedule, ScheduleExecutionLog } from '@/lib/reportScheduleTypes'
import type { ReportTemplate } from '@/lib/reportTemplateTypes'
import { formatCurrency, formatDate } from '@/lib/helpers'
import { CustomReportBuilder } from './CustomReportBuilder'
import { ReportScheduleDialog } from './ReportScheduleDialog'
import { ScheduleManagement } from './ScheduleManagement'
import { ReportTemplatePreview } from './ReportTemplatePreview'
import { defaultReportTemplates } from '@/lib/defaultReportTemplates'

interface ReportsProps {
  rooms: Room[]
  reservations: Reservation[]
  guests: Guest[]
  orders: Order[]
  employees: Employee[]
  housekeepingTasks: HousekeepingTask[]
  inventory: InventoryItem[]
  guestInvoices: GuestInvoice[]
  payments: Payment[]
  expenses: Expense[]
  currentUser: { id: string; email: string; firstName: string; lastName: string }
}

type ReportCategory = 'financial' | 'operational' | 'guest' | 'inventory' | 'hr'
type ReportPeriod = 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'yearly' | 'all'
type ReportDepartment = 'front-office' | 'housekeeping' | 'fnb' | 'kitchen' | 'maintenance' | 'revenue' | 'procurement' | 'all'

export function Reports({
  rooms,
  reservations,
  guests,
  orders,
  employees,
  housekeepingTasks,
  inventory,
  guestInvoices,
  payments,
  expenses,
  currentUser
}: ReportsProps) {
  const [selectedCategory, setSelectedCategory] = useState<ReportCategory | 'all'>('all')
  const [selectedPeriod, setSelectedPeriod] = useState<ReportPeriod>('all')
  const [selectedDepartment, setSelectedDepartment] = useState<ReportDepartment>('all')
  const [customReports, setCustomReports] = useKV<CustomReport[]>('w3-hotel-custom-reports', [])
  const [reportSchedules, setReportSchedules] = useKV<ReportSchedule[]>('w3-hotel-report-schedules', [])
  const [executionLogs, setExecutionLogs] = useKV<ScheduleExecutionLog[]>('w3-hotel-schedule-logs', [])
  const [savedTemplates, setSavedTemplates] = useKV<ReportTemplate[]>('w3-hotel-report-templates', [])
  const [reportBuilderOpen, setReportBuilderOpen] = useState(false)
  const [editingReport, setEditingReport] = useState<CustomReport | undefined>(undefined)
  const [scheduleDialogOpen, setScheduleDialogOpen] = useState(false)
  const [schedulingReport, setSchedulingReport] = useState<{
    id: string
    name: string
    type: 'template' | 'custom'
    formats: ('pdf' | 'excel' | 'csv')[]
  } | null>(null)
  const [editingSchedule, setEditingSchedule] = useState<ReportSchedule | undefined>(undefined)
  const [previewTemplate, setPreviewTemplate] = useState<ReportTemplate | null>(null)

  const allTemplates = [...defaultReportTemplates, ...(savedTemplates || [])]

  const reportTemplates: ReportTemplate[] = allTemplates

  const getReportPeriod = (report: ReportTemplate): ReportPeriod => {
    if (report.id.includes('daily') || report.defaultDateRange === 'today') return 'daily'
    if (report.id.includes('weekly') || report.defaultDateRange === 'this-week') return 'weekly'
    if (report.id.includes('monthly') || report.defaultDateRange === 'this-month') return 'monthly'
    if (report.id.includes('quarterly') || report.defaultDateRange === 'this-quarter') return 'quarterly'
    if (report.id.includes('yearly') || report.id.includes('annual') || report.defaultDateRange === 'this-year') return 'yearly'
    return 'monthly'
  }

  const getReportDepartment = (report: ReportTemplate): ReportDepartment => {
    const name = report.name.toLowerCase()
    const id = report.id.toLowerCase()
    
    if (name.includes('front') || id.includes('front-desk')) return 'front-office'
    if (name.includes('housekeeping') || id.includes('housekeeping')) return 'housekeeping'
    if (name.includes('f&b') || name.includes('fnb') || id.includes('fnb')) return 'fnb'
    if (name.includes('kitchen') || id.includes('kitchen')) return 'kitchen'
    if (name.includes('maintenance') || id.includes('maintenance')) return 'maintenance'
    if (name.includes('revenue') || id.includes('revenue')) return 'revenue'
    if (name.includes('procurement') || id.includes('procurement')) return 'procurement'
    return 'all'
  }

  const filteredReports = reportTemplates.filter(report => {
    if (selectedCategory !== 'all' && report.category !== selectedCategory) return false
    if (selectedPeriod !== 'all' && getReportPeriod(report) !== selectedPeriod) return false
    if (selectedDepartment !== 'all' && getReportDepartment(report) !== selectedDepartment) return false
    return true
  })

  const categories = [
    { id: 'all' as const, name: 'All Reports', count: reportTemplates.length, color: 'bg-primary' },
    { id: 'financial' as const, name: 'Financial', count: reportTemplates.filter(r => r.category === 'financial').length, color: 'bg-green-500' },
    { id: 'operational' as const, name: 'Operational', count: reportTemplates.filter(r => r.category === 'operational').length, color: 'bg-blue-500' },
    { id: 'guest' as const, name: 'Guest', count: reportTemplates.filter(r => r.category === 'guest').length, color: 'bg-purple-500' },
    { id: 'inventory' as const, name: 'Inventory', count: reportTemplates.filter(r => r.category === 'inventory').length, color: 'bg-orange-500' },
    { id: 'hr' as const, name: 'HR', count: reportTemplates.filter(r => r.category === 'hr').length, color: 'bg-pink-500' }
  ]

  const periods = [
    { id: 'all' as const, name: 'All Periods', count: reportTemplates.length },
    { id: 'daily' as const, name: 'Daily', count: reportTemplates.filter(r => getReportPeriod(r) === 'daily').length },
    { id: 'weekly' as const, name: 'Weekly', count: reportTemplates.filter(r => getReportPeriod(r) === 'weekly').length },
    { id: 'monthly' as const, name: 'Monthly', count: reportTemplates.filter(r => getReportPeriod(r) === 'monthly').length },
    { id: 'quarterly' as const, name: 'Quarterly', count: reportTemplates.filter(r => getReportPeriod(r) === 'quarterly').length },
    { id: 'yearly' as const, name: 'Yearly', count: reportTemplates.filter(r => getReportPeriod(r) === 'yearly').length }
  ]

  const departments = [
    { id: 'all' as const, name: 'All Departments', count: reportTemplates.length },
    { id: 'front-office' as const, name: 'Front Office', count: reportTemplates.filter(r => getReportDepartment(r) === 'front-office').length },
    { id: 'housekeeping' as const, name: 'Housekeeping', count: reportTemplates.filter(r => getReportDepartment(r) === 'housekeeping').length },
    { id: 'fnb' as const, name: 'F&B', count: reportTemplates.filter(r => getReportDepartment(r) === 'fnb').length },
    { id: 'kitchen' as const, name: 'Kitchen', count: reportTemplates.filter(r => getReportDepartment(r) === 'kitchen').length },
    { id: 'maintenance' as const, name: 'Maintenance', count: reportTemplates.filter(r => getReportDepartment(r) === 'maintenance').length },
    { id: 'revenue' as const, name: 'Revenue', count: reportTemplates.filter(r => getReportDepartment(r) === 'revenue').length },
    { id: 'procurement' as const, name: 'Procurement', count: reportTemplates.filter(r => getReportDepartment(r) === 'procurement').length }
  ]

  const handleGenerateReport = (reportId: string, format: 'pdf' | 'excel' | 'csv') => {
    toast.success(`Generating ${reportId} in ${format} format`)
  }

  const handlePreviewReport = (reportId: string) => {
    const template = reportTemplates.find(r => r.id === reportId)
    if (template) {
      setPreviewTemplate(template)
    } else {
      toast.error('Report template not found')
    }
  }

  const handleSaveTemplate = (template: ReportTemplate) => {
    setSavedTemplates((prev) => {
      const existing = (prev || []).find(t => t.id === template.id)
      if (existing) {
        return (prev || []).map(t => t.id === template.id ? template : t)
      }
      return [...(prev || []), template]
    })
    setPreviewTemplate(null)
    toast.success('Template saved successfully')
  }

  const getReportIcon = (category: string) => {
    switch (category) {
      case 'financial':
        return <CurrencyDollar size={24} />
      case 'operational':
        return <Bed size={24} />
      case 'guest':
        return <Users size={24} />
      case 'inventory':
        return <Package size={24} />
      case 'hr':
        return <Users size={24} />
      default:
        return <FileText size={24} />
    }
  }

  const handleOpenReportBuilder = (report?: CustomReport) => {
    setEditingReport(report)
    setReportBuilderOpen(true)
  }

  const handleSaveCustomReport = (report: CustomReport) => {
    setCustomReports((prev) => {
      const existing = (prev || []).find(r => r.id === report.id)
      if (existing) {
        return (prev || []).map(r => r.id === report.id ? report : r)
      }
      return [...(prev || []), report]
    })
    setReportBuilderOpen(false)
    setEditingReport(undefined)
    toast.success('Custom report saved')
  }

  const handleDeleteCustomReport = (reportId: string) => {
    setCustomReports((prev) => (prev || []).filter(r => r.id !== reportId))
    toast.success('Custom report deleted')
  }

  const handleRunCustomReport = (reportId: string) => {
    const report = (customReports || []).find(r => r.id === reportId)
    if (report) {
      toast.info(`Running report: ${report.name}`)
    }
  }

  const handleOpenScheduleDialog = (reportId: string, reportName: string, reportType: 'template' | 'custom', formats: ('pdf' | 'excel' | 'csv')[]) => {
    setSchedulingReport({ id: reportId, name: reportName, type: reportType, formats })
    setEditingSchedule(undefined)
    setScheduleDialogOpen(true)
  }

  const handleEditSchedule = (schedule: ReportSchedule) => {
    const report = schedule.reportType === 'template' 
      ? reportTemplates.find(r => r.id === schedule.reportId)
      : (customReports || []).find(r => r.id === schedule.reportId)
    
    if (report) {
      setSchedulingReport({
        id: schedule.reportId,
        name: schedule.reportType === 'template' ? report.name : (report as CustomReport).name,
        type: schedule.reportType,
        formats: ['pdf', 'excel', 'csv']
      })
      setEditingSchedule(schedule)
      setScheduleDialogOpen(true)
    }
  }

  const handleSaveSchedule = (schedule: ReportSchedule) => {
    setReportSchedules((prev) => {
      const existing = (prev || []).find(s => s.id === schedule.id)
      if (existing) {
        return (prev || []).map(s => s.id === schedule.id ? schedule : s)
      }
      return [...(prev || []), schedule]
    })
    toast.success('Report schedule saved')
  }

  const handleDeleteSchedule = (scheduleId: string) => {
    setReportSchedules((prev) => (prev || []).filter(s => s.id !== scheduleId))
  }

  const handleToggleScheduleStatus = (scheduleId: string) => {
    setReportSchedules((prev) => 
      (prev || []).map(s => 
        s.id === scheduleId 
          ? { ...s, status: s.status === 'active' ? 'paused' as const : 'active' as const }
          : s
      )
    )
  }

  const handleRunScheduleNow = (scheduleId: string) => {
    const schedule = (reportSchedules || []).find(s => s.id === scheduleId)
    if (!schedule) return

    const startTime = Date.now()
    
    setTimeout(() => {
      const duration = Date.now() - startTime
      const log: ScheduleExecutionLog = {
        id: `log-${Date.now()}`,
        scheduleId,
        executedAt: Date.now(),
        status: 'success',
        duration,
        reportSize: Math.floor(Math.random() * 500000) + 100000,
        emailsSent: schedule.emailRecipients.length,
        generatedFileUrl: `/reports/generated-${Date.now()}.${schedule.format}`
      }

      setExecutionLogs((prev) => [...(prev || []), log])
      setReportSchedules((prev) =>
        (prev || []).map(s =>
          s.id === scheduleId
            ? { ...s, lastRun: Date.now(), runCount: s.runCount + 1 }
            : s
        )
      )
      
      toast.success(`Report generated and sent to ${schedule.emailRecipients.length} recipient(s)`)
    }, 2000)
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl md:text-4xl font-semibold">Reports</h1>
          <p className="text-muted-foreground mt-1">Generate comprehensive reports for all aspects of your hotel operations</p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline">
            <CalendarBlank size={20} className="mr-2" />
            Schedule Reports
          </Button>
          <Button onClick={() => handleOpenReportBuilder()}>
            <Plus size={20} className="mr-2" />
            Create Custom Report
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-6 bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20">
          <div className="flex items-center gap-3 mb-2">
            <FileText size={24} className="text-primary" />
            <h3 className="font-semibold">Total Templates</h3>
          </div>
          <p className="text-3xl font-bold">{reportTemplates.length}</p>
          <p className="text-sm text-muted-foreground mt-1">Built-in report templates</p>
        </Card>
        
        <Card className="p-6 bg-gradient-to-br from-blue-500/10 to-blue-500/5 border-blue-500/20">
          <div className="flex items-center gap-3 mb-2">
            <Bed size={24} className="text-blue-500" />
            <h3 className="font-semibold">Department Reports</h3>
          </div>
          <p className="text-3xl font-bold">
            {departments.filter(d => d.id !== 'all' && d.count > 0).length}
          </p>
          <p className="text-sm text-muted-foreground mt-1">Specialized by department</p>
        </Card>
        
        <Card className="p-6 bg-gradient-to-br from-green-500/10 to-green-500/5 border-green-500/20">
          <div className="flex items-center gap-3 mb-2">
            <CalendarBlank size={24} className="text-green-500" />
            <h3 className="font-semibold">Time Periods</h3>
          </div>
          <p className="text-3xl font-bold">
            {periods.filter(p => p.id !== 'all' && p.count > 0).length}
          </p>
          <p className="text-sm text-muted-foreground mt-1">Daily to yearly reports</p>
        </Card>
        
        <Card className="p-6 bg-gradient-to-br from-purple-500/10 to-purple-500/5 border-purple-500/20">
          <div className="flex items-center gap-3 mb-2">
            <ChartBar size={24} className="text-purple-500" />
            <h3 className="font-semibold">Custom Reports</h3>
          </div>
          <p className="text-3xl font-bold">{(customReports || []).length}</p>
          <p className="text-sm text-muted-foreground mt-1">User-created reports</p>
        </Card>
      </div>

      <Card className="p-6 bg-gradient-to-br from-accent/5 to-secondary/5 border-accent/20">
        <div className="flex items-start gap-4">
          <div className="p-3 bg-accent/10 rounded-lg">
            <Sparkle size={24} className="text-accent" />
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-semibold mb-2">New Department & Time-Period Templates Available!</h3>
            <p className="text-sm text-muted-foreground mb-4">
              We've added specialized report templates for specific departments and time periods to help you analyze your operations more effectively.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h4 className="font-semibold text-sm mb-2 flex items-center gap-2">
                  <Bed size={16} />
                  Department-Specific Reports
                </h4>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• Front Desk Daily Report</li>
                  <li>• Kitchen Operations Report</li>
                  <li>• Maintenance & Engineering Report</li>
                  <li>• Procurement Summary Report</li>
                  <li>• Departmental Labor Report</li>
                  <li>• Night Audit Report</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold text-sm mb-2 flex items-center gap-2">
                  <CalendarBlank size={16} />
                  Time-Period Reports
                </h4>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• Weekly Revenue Summary</li>
                  <li>• Monthly Performance Dashboard</li>
                  <li>• Quarterly Business Analysis</li>
                  <li>• Annual Summary Report</li>
                  <li>• Revenue Manager Daily Brief</li>
                </ul>
              </div>
            </div>
            <div className="mt-4">
              <h4 className="font-semibold text-sm mb-2 flex items-center gap-2">
                <TrendUp size={16} />
                Additional Specialized Reports
              </h4>
              <ul className="text-sm text-muted-foreground space-y-1 grid grid-cols-1 md:grid-cols-2 gap-1">
                <li>• Cash Flow Analysis</li>
                <li>• Guest Demographics Report</li>
                <li>• Marketing Campaign Performance</li>
              </ul>
            </div>
          </div>
        </div>
      </Card>

      <Card className="p-6 bg-gradient-to-br from-primary/5 to-accent/5">
        <div className="space-y-6">
          <div>
            <h3 className="font-semibold text-sm mb-3 flex items-center gap-2">
              <FileText size={18} />
              Report Categories
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
              {categories.map(category => (
                <Card
                  key={category.id}
                  className={`p-4 cursor-pointer transition-all hover:shadow-md ${
                    selectedCategory === category.id ? 'ring-2 ring-primary bg-primary/10' : ''
                  }`}
                  onClick={() => setSelectedCategory(category.id)}
                >
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-semibold text-sm">{category.name}</h3>
                    <div className={`w-2 h-2 rounded-full ${category.color}`} />
                  </div>
                  <p className="text-2xl font-bold">{category.count}</p>
                </Card>
              ))}
            </div>
          </div>

          <Separator />

          <div>
            <h3 className="font-semibold text-sm mb-3 flex items-center gap-2">
              <CalendarBlank size={18} />
              Time Period
            </h3>
            <div className="flex flex-wrap gap-2">
              {periods.map(period => (
                <Button
                  key={period.id}
                  variant={selectedPeriod === period.id ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setSelectedPeriod(period.id)}
                  className="flex items-center gap-2"
                >
                  {period.name}
                  <Badge variant="secondary" className="ml-1 text-xs">
                    {period.count}
                  </Badge>
                </Button>
              ))}
            </div>
          </div>

          <Separator />

          <div>
            <h3 className="font-semibold text-sm mb-3 flex items-center gap-2">
              <Bed size={18} />
              Department
            </h3>
            <div className="flex flex-wrap gap-2">
              {departments.filter(d => d.count > 0).map(dept => (
                <Button
                  key={dept.id}
                  variant={selectedDepartment === dept.id ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setSelectedDepartment(dept.id)}
                  className="flex items-center gap-2"
                >
                  {dept.name}
                  <Badge variant="secondary" className="ml-1 text-xs">
                    {dept.count}
                  </Badge>
                </Button>
              ))}
            </div>
          </div>

          {(selectedCategory !== 'all' || selectedPeriod !== 'all' || selectedDepartment !== 'all') && (
            <div className="flex items-center justify-between pt-2">
              <p className="text-sm text-muted-foreground">
                Showing {filteredReports.length} of {reportTemplates.length} reports
              </p>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setSelectedCategory('all')
                  setSelectedPeriod('all')
                  setSelectedDepartment('all')
                }}
              >
                Clear Filters
              </Button>
            </div>
          )}
        </div>
      </Card>

      <Card className="p-6">
        <Tabs defaultValue="templates" className="space-y-6">
          <TabsList>
            <TabsTrigger value="templates">
              <FileText size={18} className="mr-2" />
              Report Templates
            </TabsTrigger>
            <TabsTrigger value="custom">
              <ChartBar size={18} className="mr-2" />
              Custom Reports ({(customReports || []).length})
            </TabsTrigger>
            <TabsTrigger value="scheduled">
              <CalendarBlank size={18} className="mr-2" />
              Scheduled Reports
            </TabsTrigger>
            <TabsTrigger value="history">
              <ClipboardText size={18} className="mr-2" />
              Report History
            </TabsTrigger>
          </TabsList>

          <TabsContent value="templates" className="space-y-4">
            {filteredReports.length === 0 ? (
              <Card className="p-8 text-center">
                <FileText size={48} className="mx-auto text-muted-foreground mb-4" />
                <h3 className="text-xl font-semibold mb-2">No Reports Found</h3>
                <p className="text-muted-foreground mb-6">
                  No reports match your selected filters. Try adjusting your filters or clear them to see all available reports.
                </p>
                <Button
                  variant="outline"
                  onClick={() => {
                    setSelectedCategory('all')
                    setSelectedPeriod('all')
                    setSelectedDepartment('all')
                  }}
                >
                  Clear All Filters
                </Button>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredReports.map(report => (
                <Card key={report.id} className="p-5 hover:shadow-lg transition-shadow">
                  <div className="flex items-start gap-4">
                    <div className="p-3 bg-primary/10 rounded-lg text-primary">
                      {getReportIcon(report.category)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-base mb-1">{report.name}</h3>
                      <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                        {report.description}
                      </p>
                      <div className="flex items-center flex-wrap gap-2 mb-3">
                        <Badge variant="outline" className="text-xs">
                          {report.layout}
                        </Badge>
                        <Badge variant="secondary" className="text-xs capitalize">
                          {report.category}
                        </Badge>
                        <Badge variant="outline" className="text-xs capitalize bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300">
                          {getReportPeriod(report)}
                        </Badge>
                        {getReportDepartment(report) !== 'all' && (
                          <Badge variant="outline" className="text-xs capitalize bg-purple-50 text-purple-700 dark:bg-purple-950 dark:text-purple-300">
                            {getReportDepartment(report).replace('-', ' ')}
                          </Badge>
                        )}
                        {report.isCustomizable && (
                          <Badge variant="outline" className="text-xs">
                            Customizable
                          </Badge>
                        )}
                      </div>
                      <Separator className="mb-3" />
                      <div className="flex items-center gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handlePreviewReport(report.id)}
                          className="flex-1"
                        >
                          <Eye size={16} className="mr-1" />
                          Preview
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleOpenScheduleDialog(report.id, report.name, 'template', ['pdf', 'excel', 'csv'])}
                        >
                          <Clock size={16} />
                        </Button>
                        <div className="flex gap-1">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleGenerateReport(report.id, 'pdf')}
                            title="Download PDF"
                          >
                            <FilePdf size={18} className="text-red-500" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleGenerateReport(report.id, 'excel')}
                            title="Download Excel"
                          >
                            <FileXls size={18} className="text-green-500" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
            )}
          </TabsContent>

          <TabsContent value="custom" className="space-y-4">
            {(customReports || []).length === 0 ? (
              <Card className="p-8 text-center">
                <ChartBar size={48} className="mx-auto text-muted-foreground mb-4" />
                <h3 className="text-xl font-semibold mb-2">No Custom Reports</h3>
                <p className="text-muted-foreground mb-6">
                  Create custom reports with specific metrics and visualizations tailored to your needs
                </p>
                <Button onClick={() => handleOpenReportBuilder()}>
                  <Plus size={20} className="mr-2" />
                  Create Your First Custom Report
                </Button>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {(customReports || []).map(report => (
                  <Card key={report.id} className="p-5 hover:shadow-lg transition-shadow">
                    <div className="space-y-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h3 className="font-semibold text-base mb-1">{report.name}</h3>
                          <p className="text-sm text-muted-foreground line-clamp-2">
                            {report.description || 'Custom report'}
                          </p>
                        </div>
                        <div className="flex gap-1">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleOpenReportBuilder(report)}
                          >
                            <Pencil size={16} />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleDeleteCustomReport(report.id)}
                          >
                            <Trash size={16} className="text-destructive" />
                          </Button>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-3">
                        <div className="p-3 bg-primary/5 rounded-lg">
                          <p className="text-xs text-muted-foreground mb-1">Metrics</p>
                          <p className="text-lg font-semibold">{report.metrics.length}</p>
                        </div>
                        <div className="p-3 bg-secondary/5 rounded-lg">
                          <p className="text-xs text-muted-foreground mb-1">Charts</p>
                          <p className="text-lg font-semibold">{report.visualizations.length}</p>
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-2">
                        {report.metrics.slice(0, 3).map(metric => (
                          <Badge key={metric.id} variant="outline" className="text-xs">
                            {metric.name}
                          </Badge>
                        ))}
                        {report.metrics.length > 3 && (
                          <Badge variant="secondary" className="text-xs">
                            +{report.metrics.length - 3} more
                          </Badge>
                        )}
                      </div>

                      <Separator />
                      
                      <div className="flex items-center gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleRunCustomReport(report.id)}
                          className="flex-1"
                        >
                          <Eye size={16} className="mr-1" />
                          Run Report
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleOpenScheduleDialog(report.id, report.name, 'custom', ['pdf', 'excel', 'csv'])}
                        >
                          <Clock size={16} />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          title="Download PDF"
                        >
                          <FilePdf size={18} className="text-red-500" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          title="Download Excel"
                        >
                          <FileXls size={18} className="text-green-500" />
                        </Button>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="scheduled" className="space-y-4">
            <ScheduleManagement
              schedules={reportSchedules || []}
              onEdit={handleEditSchedule}
              onDelete={handleDeleteSchedule}
              onToggleStatus={handleToggleScheduleStatus}
              onRunNow={handleRunScheduleNow}
            />
          </TabsContent>

          <TabsContent value="history" className="space-y-4">
            <Card className="p-8 text-center">
              <ClipboardText size={48} className="mx-auto text-muted-foreground mb-4" />
              <h3 className="text-xl font-semibold mb-2">No Report History</h3>
              <p className="text-muted-foreground mb-6">
                Generated reports will appear here for easy access and download
              </p>
            </Card>
          </TabsContent>
        </Tabs>
      </Card>

      <Dialog open={reportBuilderOpen} onOpenChange={setReportBuilderOpen}>
        <DialogContent className="max-w-[95vw] max-h-[95vh] p-0 overflow-hidden">
          <div className="p-6 overflow-y-auto max-h-[95vh]">
            <CustomReportBuilder
              existingReport={editingReport}
              onSave={handleSaveCustomReport}
              onClose={() => {
                setReportBuilderOpen(false)
                setEditingReport(undefined)
              }}
            />
          </div>
        </DialogContent>
      </Dialog>

      {schedulingReport && (
        <ReportScheduleDialog
          open={scheduleDialogOpen}
          onClose={() => {
            setScheduleDialogOpen(false)
            setSchedulingReport(null)
            setEditingSchedule(undefined)
          }}
          schedule={editingSchedule}
          reportId={schedulingReport.id}
          reportName={schedulingReport.name}
          reportType={schedulingReport.type}
          availableFormats={schedulingReport.formats}
          onSave={handleSaveSchedule}
          currentUser={currentUser}
        />
      )}

      {previewTemplate && (
        <ReportTemplatePreview
          template={previewTemplate}
          onClose={() => setPreviewTemplate(null)}
          onSave={handleSaveTemplate}
          isEditable={previewTemplate.isCustomizable}
        />
      )}
    </div>
  )
}
