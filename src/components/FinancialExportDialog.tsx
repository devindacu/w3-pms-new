import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { Calendar } from '@/components/ui/calendar'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Switch } from '@/components/ui/switch'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'
import { 
  Download, 
  FileCsv, 
  FileText,
  CalendarBlank,
  Check
} from '@phosphor-icons/react'
import { formatDate } from '@/lib/helpers'
import { 
  exportFinancialReport,
  type ExportFormat,
  type ReportType,
  type FinancialReportData,
  type ExportOptions
} from '@/lib/financialExportHelpers'

interface FinancialExportDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  data: FinancialReportData
  defaultReportType?: ReportType
}

export function FinancialExportDialog({
  open,
  onOpenChange,
  data,
  defaultReportType = 'income-statement'
}: FinancialExportDialogProps) {
  const [reportType, setReportType] = useState<ReportType>(defaultReportType)
  const [format, setFormat] = useState<ExportFormat>('csv')
  const [dateRange, setDateRange] = useState<{ from: Date; to: Date }>({
    from: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
    to: new Date()
  })
  const [includeSummary, setIncludeSummary] = useState(true)
  const [includeCharts, setIncludeCharts] = useState(false)
  const [groupBy, setGroupBy] = useState<'month' | 'quarter' | 'year' | 'category'>('month')
  const [currency, setCurrency] = useState('LKR')
  const [isExporting, setIsExporting] = useState(false)

  const reportTypes: { value: ReportType; label: string; description: string }[] = [
    {
      value: 'income-statement',
      label: 'Income Statement',
      description: 'Revenue, expenses, and net income'
    },
    {
      value: 'balance-sheet',
      label: 'Balance Sheet',
      description: 'Assets, liabilities, and equity'
    },
    {
      value: 'cash-flow',
      label: 'Cash Flow Statement',
      description: 'Cash inflows and outflows'
    },
    {
      value: 'accounts-receivable',
      label: 'Accounts Receivable',
      description: 'Outstanding customer invoices'
    },
    {
      value: 'accounts-payable',
      label: 'Accounts Payable',
      description: 'Outstanding supplier invoices'
    },
    {
      value: 'expense-report',
      label: 'Expense Report',
      description: 'Detailed expense breakdown'
    },
    {
      value: 'revenue-report',
      label: 'Revenue Report',
      description: 'Revenue analysis and trends'
    },
    {
      value: 'tax-summary',
      label: 'Tax Summary',
      description: 'Tax collection summary'
    },
    {
      value: 'cost-center-report',
      label: 'Cost Center Report',
      description: 'Cost center performance'
    },
    {
      value: 'profit-center-report',
      label: 'Profit Center Report',
      description: 'Profit center analysis'
    }
  ]

  const formatOptions: { value: ExportFormat; label: string; icon: any; description: string }[] = [
    {
      value: 'csv',
      label: 'CSV',
      icon: FileCsv,
      description: 'Excel-compatible spreadsheet'
    },
    {
      value: 'excel',
      label: 'Excel',
      icon: FileText,
      description: 'Microsoft Excel format'
    },
    {
      value: 'pdf',
      label: 'PDF',
      icon: FileText,
      description: 'Portable document format'
    }
  ]

  const handleExport = async () => {
    setIsExporting(true)
    
    try {
      const options: ExportOptions = {
        format,
        reportType,
        dateRange,
        includeSummary,
        includeCharts,
        currency,
        groupBy
      }
      
      exportFinancialReport(reportType, data, options)
      
      toast.success('Report exported successfully', {
        description: `${reportTypes.find(r => r.value === reportType)?.label} exported as ${format.toUpperCase()}`
      })
      
      onOpenChange(false)
    } catch (error) {
      console.error('Export error:', error)
      toast.error('Failed to export report', {
        description: error instanceof Error ? error.message : 'An unknown error occurred'
      })
    } finally {
      setIsExporting(false)
    }
  }

  const selectedReport = reportTypes.find(r => r.value === reportType)
  const selectedFormat = formatOptions.find(f => f.value === format)

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Download size={24} className="text-primary" />
            Export Financial Report
          </DialogTitle>
          <DialogDescription>
            Configure and export financial reports in your preferred format
          </DialogDescription>
        </DialogHeader>

        <div className="dialog-body-scrollable">
          <div className="dialog-comfortable-layout">
            <div>
              <Label className="text-base font-semibold mb-3 block">Report Type</Label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {reportTypes.map((report) => (
                  <Card
                    key={report.value}
                    className={`p-4 cursor-pointer transition-all hover:border-primary ${
                      reportType === report.value 
                        ? 'border-primary bg-primary/5' 
                        : 'border-border'
                    }`}
                    onClick={() => setReportType(report.value)}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h4 className="font-semibold mb-1">{report.label}</h4>
                        <p className="text-sm text-muted-foreground">{report.description}</p>
                      </div>
                      {reportType === report.value && (
                        <Check size={20} className="text-primary shrink-0 ml-2" />
                      )}
                    </div>
                  </Card>
                ))}
              </div>
            </div>

            <Separator />

            <div>
              <Label className="text-base font-semibold mb-3 block">Export Format</Label>
              <div className="grid grid-cols-3 gap-3">
                {formatOptions.map((fmt) => {
                  const Icon = fmt.icon
                  return (
                    <Card
                      key={fmt.value}
                      className={`p-4 cursor-pointer transition-all hover:border-primary ${
                        format === fmt.value 
                          ? 'border-primary bg-primary/5' 
                          : 'border-border'
                      }`}
                      onClick={() => setFormat(fmt.value)}
                    >
                      <div className="flex flex-col items-center text-center gap-2">
                        <Icon size={32} className={format === fmt.value ? 'text-primary' : 'text-muted-foreground'} />
                        <div>
                          <h4 className="font-semibold">{fmt.label}</h4>
                          <p className="text-xs text-muted-foreground mt-1">{fmt.description}</p>
                        </div>
                        {format === fmt.value && (
                          <Check size={16} className="text-primary" />
                        )}
                      </div>
                    </Card>
                  )
                })}
              </div>
            </div>

            <Separator />

            <div className="dialog-grid-2">
              <div className="dialog-form-field">
                <Label>Date Range - From</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="w-full justify-start">
                      <CalendarBlank size={16} className="mr-2" />
                      {formatDate(dateRange.from.getTime())}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={dateRange.from}
                      onSelect={(date) => date && setDateRange({ ...dateRange, from: date })}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>

              <div className="dialog-form-field">
                <Label>Date Range - To</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="w-full justify-start">
                      <CalendarBlank size={16} className="mr-2" />
                      {formatDate(dateRange.to.getTime())}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={dateRange.to}
                      onSelect={(date) => date && setDateRange({ ...dateRange, to: date })}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>

            {(reportType === 'expense-report' || reportType === 'revenue-report') && (
              <div className="dialog-form-field">
                <Label>Group By</Label>
                <Select value={groupBy} onValueChange={(value: any) => setGroupBy(value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="month">Month</SelectItem>
                    <SelectItem value="quarter">Quarter</SelectItem>
                    <SelectItem value="year">Year</SelectItem>
                    <SelectItem value="category">Category</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}

            <div className="dialog-form-field">
              <Label>Currency</Label>
              <Select value={currency} onValueChange={setCurrency}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="LKR">LKR - Sri Lankan Rupee</SelectItem>
                  <SelectItem value="USD">USD - US Dollar</SelectItem>
                  <SelectItem value="EUR">EUR - Euro</SelectItem>
                  <SelectItem value="GBP">GBP - British Pound</SelectItem>
                  <SelectItem value="AUD">AUD - Australian Dollar</SelectItem>
                  <SelectItem value="CAD">CAD - Canadian Dollar</SelectItem>
                  <SelectItem value="JPY">JPY - Japanese Yen</SelectItem>
                  <SelectItem value="CNY">CNY - Chinese Yuan</SelectItem>
                  <SelectItem value="INR">INR - Indian Rupee</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Separator />

            <div>
              <Label className="text-base font-semibold mb-3 block">Options</Label>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Include Summary</Label>
                    <p className="text-sm text-muted-foreground">Add summary statistics to the report</p>
                  </div>
                  <Switch checked={includeSummary} onCheckedChange={setIncludeSummary} />
                </div>

                {format === 'pdf' && (
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Include Charts</Label>
                      <p className="text-sm text-muted-foreground">Add visual charts to PDF export</p>
                    </div>
                    <Switch checked={includeCharts} onCheckedChange={setIncludeCharts} />
                  </div>
                )}
              </div>
            </div>

            <Card className="p-4 bg-muted/50">
              <div className="flex items-start gap-3">
                <div className="flex-1">
                  <h4 className="font-semibold mb-1">Export Preview</h4>
                  <div className="space-y-1 text-sm text-muted-foreground">
                    <p><strong>Report:</strong> {selectedReport?.label}</p>
                    <p><strong>Format:</strong> {selectedFormat?.label}</p>
                    <p><strong>Period:</strong> {formatDate(dateRange.from.getTime())} to {formatDate(dateRange.to.getTime())}</p>
                    <p><strong>Currency:</strong> {currency}</p>
                  </div>
                </div>
                <Badge variant="secondary" className="shrink-0">
                  Ready to Export
                </Badge>
              </div>
            </Card>
          </div>
        </div>

        <div className="dialog-footer-fixed flex items-center justify-between gap-3">
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isExporting}>
            Cancel
          </Button>
          <Button onClick={handleExport} disabled={isExporting} className="min-w-[120px]">
            <Download size={18} className="mr-2" />
            {isExporting ? 'Exporting...' : 'Export Report'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
