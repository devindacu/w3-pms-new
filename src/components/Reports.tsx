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
  Trash
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
import { formatCurrency, formatDate } from '@/lib/helpers'
import { CustomReportBuilder } from './CustomReportBuilder'

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
}

type ReportCategory = 'financial' | 'operational' | 'guest' | 'inventory' | 'hr'

interface ReportTemplate {
  id: string
  name: string
  description: string
  category: ReportCategory
  icon: React.ReactNode
  frequency: 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'yearly' | 'custom'
  formats: ('pdf' | 'excel' | 'csv')[]
}

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
  expenses
}: ReportsProps) {
  const [selectedCategory, setSelectedCategory] = useState<ReportCategory | 'all'>('all')
  const [customReports, setCustomReports] = useKV<CustomReport[]>('w3-hotel-custom-reports', [])
  const [reportBuilderOpen, setReportBuilderOpen] = useState(false)
  const [editingReport, setEditingReport] = useState<CustomReport | undefined>(undefined)

  const reportTemplates: ReportTemplate[] = [
    {
      id: 'daily-sales',
      name: 'Daily Sales Report',
      description: 'Comprehensive daily sales summary including room revenue, F&B, and extra services',
      category: 'financial',
      icon: <CurrencyDollar size={24} />,
      frequency: 'daily',
      formats: ['pdf', 'excel']
    },
    {
      id: 'revenue-analysis',
      name: 'Revenue Analysis Report',
      description: 'Detailed breakdown of all revenue streams with trends and comparisons',
      category: 'financial',
      icon: <TrendUp size={24} />,
      frequency: 'monthly',
      formats: ['pdf', 'excel']
    },
    {
      id: 'profit-loss',
      name: 'Profit & Loss Statement',
      description: 'Complete P&L statement with income, expenses, and net profit',
      category: 'financial',
      icon: <Receipt size={24} />,
      frequency: 'monthly',
      formats: ['pdf', 'excel']
    },
    {
      id: 'ar-aging',
      name: 'Accounts Receivable Aging',
      description: 'Outstanding payments categorized by age',
      category: 'financial',
      icon: <FileText size={24} />,
      frequency: 'monthly',
      formats: ['pdf', 'excel', 'csv']
    },
    {
      id: 'ap-aging',
      name: 'Accounts Payable Aging',
      description: 'Outstanding supplier payments categorized by age',
      category: 'financial',
      icon: <FileText size={24} />,
      frequency: 'monthly',
      formats: ['pdf', 'excel', 'csv']
    },
    {
      id: 'occupancy-report',
      name: 'Occupancy Report',
      description: 'Room occupancy statistics with trends and forecasts',
      category: 'operational',
      icon: <Bed size={24} />,
      frequency: 'daily',
      formats: ['pdf', 'excel']
    },
    {
      id: 'housekeeping-performance',
      name: 'Housekeeping Performance',
      description: 'Task completion rates, room cleaning times, and efficiency metrics',
      category: 'operational',
      icon: <Broom size={24} />,
      frequency: 'weekly',
      formats: ['pdf', 'excel']
    },
    {
      id: 'fnb-performance',
      name: 'F&B Performance Report',
      description: 'Restaurant and bar sales, popular items, and waste analysis',
      category: 'operational',
      icon: <ForkKnife size={24} />,
      frequency: 'monthly',
      formats: ['pdf', 'excel']
    },
    {
      id: 'guest-satisfaction',
      name: 'Guest Satisfaction Report',
      description: 'Feedback analysis, ratings, and complaint resolution metrics',
      category: 'guest',
      icon: <Users size={24} />,
      frequency: 'monthly',
      formats: ['pdf', 'excel']
    },
    {
      id: 'guest-demographics',
      name: 'Guest Demographics Report',
      description: 'Guest profile analysis including nationality, age groups, and booking patterns',
      category: 'guest',
      icon: <ChartBar size={24} />,
      frequency: 'quarterly',
      formats: ['pdf', 'excel']
    },
    {
      id: 'loyalty-program',
      name: 'Loyalty Program Report',
      description: 'Member activity, points redemption, and program ROI',
      category: 'guest',
      icon: <Users size={24} />,
      frequency: 'monthly',
      formats: ['pdf', 'excel']
    },
    {
      id: 'inventory-status',
      name: 'Inventory Status Report',
      description: 'Current stock levels, reorder requirements, and valuation',
      category: 'inventory',
      icon: <Package size={24} />,
      frequency: 'weekly',
      formats: ['pdf', 'excel', 'csv']
    },
    {
      id: 'inventory-movement',
      name: 'Inventory Movement Report',
      description: 'Stock in/out, consumption patterns, and turnover analysis',
      category: 'inventory',
      icon: <Package size={24} />,
      frequency: 'monthly',
      formats: ['pdf', 'excel']
    },
    {
      id: 'waste-analysis',
      name: 'Waste Analysis Report',
      description: 'Food and material waste tracking with cost implications',
      category: 'inventory',
      icon: <ClipboardText size={24} />,
      frequency: 'monthly',
      formats: ['pdf', 'excel']
    },
    {
      id: 'attendance-summary',
      name: 'Attendance Summary',
      description: 'Employee attendance, absences, and overtime hours',
      category: 'hr',
      icon: <Users size={24} />,
      frequency: 'monthly',
      formats: ['pdf', 'excel', 'csv']
    },
    {
      id: 'payroll-report',
      name: 'Payroll Report',
      description: 'Salary breakdown, deductions, and total labor costs',
      category: 'hr',
      icon: <CurrencyDollar size={24} />,
      frequency: 'monthly',
      formats: ['pdf', 'excel']
    },
    {
      id: 'performance-review',
      name: 'Performance Review Report',
      description: 'Employee performance ratings and review summaries',
      category: 'hr',
      icon: <ClipboardText size={24} />,
      frequency: 'quarterly',
      formats: ['pdf', 'excel']
    }
  ]

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
    console.log(`Generating ${reportId} in ${format} format`)
  }

  const handlePreviewReport = (reportId: string) => {
    console.log(`Previewing ${reportId}`)
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
                      {report.icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-base mb-1">{report.name}</h3>
                      <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                        {report.description}
                      </p>
                      <div className="flex items-center gap-2 mb-3">
                        <Badge variant="outline" className="text-xs">
                          {report.frequency}
                        </Badge>
                        <Badge variant="secondary" className="text-xs capitalize">
                          {report.category}
                        </Badge>
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
                        <div className="flex gap-1">
                          {report.formats.includes('pdf') && (
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleGenerateReport(report.id, 'pdf')}
                              title="Download PDF"
                            >
                              <FilePdf size={18} className="text-red-500" />
                            </Button>
                          )}
                          {report.formats.includes('excel') && (
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleGenerateReport(report.id, 'excel')}
                              title="Download Excel"
                            >
                              <FileXls size={18} className="text-green-500" />
                            </Button>
                          )}
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
            <Card className="p-8 text-center">
              <CalendarBlank size={48} className="mx-auto text-muted-foreground mb-4" />
              <h3 className="text-xl font-semibold mb-2">No Scheduled Reports</h3>
              <p className="text-muted-foreground mb-6">
                Schedule reports to be automatically generated and sent to your email
              </p>
              <Button>
                <CalendarBlank size={20} className="mr-2" />
                Schedule Your First Report
              </Button>
            </Card>
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
    </div>
  )
}
