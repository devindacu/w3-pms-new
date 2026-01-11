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
  Clock
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

  const filteredReports = selectedCategory === 'all' 
    ? reportTemplates 
    : reportTemplates.filter(r => r.category === selectedCategory)

  const categories = [
    { id: 'all' as const, name: 'All Reports', count: reportTemplates.length, color: 'bg-primary' },
    { id: 'financial' as const, name: 'Financial', count: reportTemplates.filter(r => r.category === 'financial').length, color: 'bg-green-500' },
    { id: 'operational' as const, name: 'Operational', count: reportTemplates.filter(r => r.category === 'operational').length, color: 'bg-blue-500' },
    { id: 'guest' as const, name: 'Guest', count: reportTemplates.filter(r => r.category === 'guest').length, color: 'bg-purple-500' },
    { id: 'inventory' as const, name: 'Inventory', count: reportTemplates.filter(r => r.category === 'inventory').length, color: 'bg-orange-500' },
    { id: 'hr' as const, name: 'HR', count: reportTemplates.filter(r => r.category === 'hr').length, color: 'bg-pink-500' }
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

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        {categories.map(category => (
          <Card
            key={category.id}
            className={`p-4 cursor-pointer transition-all hover:shadow-md ${
              selectedCategory === category.id ? 'ring-2 ring-primary' : ''
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
                      <div className="flex items-center gap-2 mb-3">
                        <Badge variant="outline" className="text-xs">
                          {report.layout}
                        </Badge>
                        <Badge variant="secondary" className="text-xs capitalize">
                          {report.category}
                        </Badge>
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
