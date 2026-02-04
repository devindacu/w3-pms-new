import { useState, useMemo } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { DialogAdapter } from '@/components/adapters/DialogAdapter'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { PrintButton } from '@/components/PrintButton'
import { A4PrintWrapper } from '@/components/A4PrintWrapper'
import {
  ChartBar,
  TrendUp,
  WarningCircle,
  FileText,
  Download,
  Calendar,
  Buildings
} from '@phosphor-icons/react'
import type {
  Invoice,
  PurchaseOrder,
  GoodsReceivedNote,
  Supplier,
  VarianceReport
} from '@/lib/types'
import { formatCurrency, formatPercent, formatDate } from '@/lib/helpers'

interface VarianceReportDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  invoices: Invoice[]
  purchaseOrders: PurchaseOrder[]
  grns: GoodsReceivedNote[]
  suppliers: Supplier[]
}

export function VarianceReportDialog({
  open,
  onOpenChange,
  invoices,
  purchaseOrders,
  grns,
  suppliers
}: VarianceReportDialogProps) {
  const [reportType, setReportType] = useState<VarianceReport['reportType']>('three-way')
  const [periodDays, setPeriodDays] = useState(30)

  const report = useMemo(() => {
    const now = Date.now()
    const periodStart = now - (periodDays * 24 * 60 * 60 * 1000)

    const relevantInvoices = invoices.filter(inv => 
      inv.createdAt >= periodStart && 
      inv.matchingResult
    )

    let totalVariances = 0
    let totalVarianceAmount = 0
    const variancesByCategory: Record<string, { count: number; totalAmount: number }> = {}
    const variancesBySupplier: Record<string, { supplierId: string; supplierName: string; count: number; totalAmount: number }> = {}
    const topVariances: VarianceReport['topVariances'] = []
    const varianceTrends: Record<string, { count: number; amount: number }> = {}

    relevantInvoices.forEach(inv => {
      const result = inv.matchingResult
      if (!result) return

      if (result.variancePercentage > 0) {
        totalVariances++
        totalVarianceAmount += result.overallVariance

        // Track by supplier
        const supplier = suppliers.find(s => s.id === inv.supplierId)
        const supplierName = supplier?.name || inv.supplierName || 'Unknown'
        
        if (!variancesBySupplier[inv.supplierId]) {
          variancesBySupplier[inv.supplierId] = {
            supplierId: inv.supplierId,
            supplierName,
            count: 0,
            totalAmount: 0
          }
        }
        variancesBySupplier[inv.supplierId].count++
        variancesBySupplier[inv.supplierId].totalAmount += result.overallVariance

        // Top variances
        topVariances.push({
          invoiceNumber: inv.invoiceNumber,
          supplierId: inv.supplierId,
          supplierName,
          varianceAmount: result.overallVariance,
          variancePercentage: result.variancePercentage,
          status: result.matchStatus
        })

        // Variance trends (by day)
        const dayKey = new Date(inv.createdAt).toISOString().split('T')[0]
        if (!varianceTrends[dayKey]) {
          varianceTrends[dayKey] = { count: 0, amount: 0 }
        }
        varianceTrends[dayKey].count++
        varianceTrends[dayKey].amount += result.overallVariance

        // Track by category (using first item's category as proxy)
        inv.items.forEach(item => {
          const category = 'General' // You could map this from inventory
          if (!variancesByCategory[category]) {
            variancesByCategory[category] = { count: 0, totalAmount: 0 }
          }
          variancesByCategory[category].count++
          if (item.variance) {
            variancesByCategory[category].totalAmount += Math.abs(item.variance.totalVariance)
          }
        })
      }
    })

    const totalInvoiceAmount = relevantInvoices.reduce((sum, inv) => sum + inv.total, 0)
    const totalVariancePercentage = totalInvoiceAmount > 0 ? (totalVarianceAmount / totalInvoiceAmount) * 100 : 0

    const variancesByCategoryArray = Object.entries(variancesByCategory).map(([category, data]) => ({
      category,
      count: data.count,
      totalAmount: data.totalAmount,
      percentage: totalVarianceAmount > 0 ? (data.totalAmount / totalVarianceAmount) * 100 : 0
    }))

    const variancesBySupplierArray = Object.values(variancesBySupplier).map(s => ({
      ...s,
      percentage: totalVarianceAmount > 0 ? (s.totalAmount / totalVarianceAmount) * 100 : 0
    }))

    const sortedTopVariances = topVariances
      .sort((a, b) => b.varianceAmount - a.varianceAmount)
      .slice(0, 10)

    const varianceTrendsArray = Object.entries(varianceTrends)
      .map(([date, data]) => ({
        date: new Date(date).getTime(),
        count: data.count,
        amount: data.amount
      }))
      .sort((a, b) => a.date - b.date)

    const generatedReport: VarianceReport = {
      id: `report-${Date.now()}`,
      reportNumber: `VR-${Date.now()}`,
      reportType,
      period: {
        from: periodStart,
        to: now
      },
      totalVariances,
      totalVarianceAmount,
      totalVariancePercentage,
      variancesByCategory: variancesByCategoryArray,
      variancesBySupplier: variancesBySupplierArray,
      topVariances: sortedTopVariances,
      varianceTrends: varianceTrendsArray,
      generatedBy: 'current-user',
      generatedAt: now
    }

    return generatedReport
  }, [invoices, purchaseOrders, grns, suppliers, reportType, periodDays])

  const exportReport = () => {
    const csvContent = [
      ['Variance Report', report.reportNumber],
      ['Period', `${formatDate(report.period.from)} to ${formatDate(report.period.to)}`],
      ['Total Variances', report.totalVariances.toString()],
      ['Total Variance Amount', formatCurrency(report.totalVarianceAmount)],
      ['Variance Percentage', formatPercent(report.totalVariancePercentage / 100)],
      [],
      ['Top Variances'],
      ['Invoice Number', 'Supplier', 'Variance Amount', 'Variance %', 'Status'],
      ...report.topVariances.map(v => [
        v.invoiceNumber,
        v.supplierName,
        formatCurrency(v.varianceAmount),
        formatPercent(v.variancePercentage / 100),
        v.status
      ]),
      [],
      ['Variances by Supplier'],
      ['Supplier', 'Count', 'Total Amount', 'Percentage'],
      ...report.variancesBySupplier.map(v => [
        v.supplierName,
        v.count.toString(),
        formatCurrency(v.totalAmount),
        formatPercent(v.percentage / 100)
      ])
    ].map(row => row.join(',')).join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `variance-report-${report.reportNumber}.csv`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  return (
    <DialogAdapter open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-6xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <ChartBar size={24} />
              Variance Report - {report.reportNumber}
            </div>
            <PrintButton
              elementId="variance-report-print"
              options={{
                title: `Variance Report - ${report.reportNumber}`,
                filename: `variance-report-${report.reportNumber}.pdf`
              }}
              variant="outline"
              size="sm"
            />
          </DialogTitle>
        </DialogHeader>

        <div className="flex gap-4 mb-4">
          <div className="flex-1">
            <Label>Report Type</Label>
            <Select value={reportType} onValueChange={(val) => setReportType(val as VarianceReport['reportType'])}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="po-grn">PO vs GRN</SelectItem>
                <SelectItem value="grn-invoice">GRN vs Invoice</SelectItem>
                <SelectItem value="po-invoice">PO vs Invoice</SelectItem>
                <SelectItem value="three-way">Three-Way Match</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex-1">
            <Label>Period</Label>
            <Select value={periodDays.toString()} onValueChange={(val) => setPeriodDays(parseInt(val))}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7">Last 7 Days</SelectItem>
                <SelectItem value="30">Last 30 Days</SelectItem>
                <SelectItem value="60">Last 60 Days</SelectItem>
                <SelectItem value="90">Last 90 Days</SelectItem>
                <SelectItem value="180">Last 6 Months</SelectItem>
                <SelectItem value="365">Last Year</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-end">
            <Button onClick={exportReport} variant="outline">
              <Download size={16} className="mr-2" />
              Export CSV
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
          <Card className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <WarningCircle size={20} className="text-destructive" />
              <p className="text-sm text-muted-foreground">Total Variances</p>
            </div>
            <p className="text-3xl font-semibold">{report.totalVariances}</p>
          </Card>

          <Card className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <TrendUp size={20} className="text-destructive" />
              <p className="text-sm text-muted-foreground">Total Amount</p>
            </div>
            <p className="text-2xl font-semibold text-destructive">
              {formatCurrency(report.totalVarianceAmount)}
            </p>
          </Card>

          <Card className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <ChartBar size={20} className="text-accent" />
              <p className="text-sm text-muted-foreground">Variance %</p>
            </div>
            <p className="text-2xl font-semibold">
              {formatPercent(report.totalVariancePercentage / 100)}
            </p>
          </Card>

          <Card className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <Calendar size={20} className="text-primary" />
              <p className="text-sm text-muted-foreground">Period</p>
            </div>
            <p className="text-sm font-medium">{periodDays} Days</p>
            <p className="text-xs text-muted-foreground">
              {formatDate(report.period.from)} - {formatDate(report.period.to)}
            </p>
          </Card>
        </div>

        <Tabs defaultValue="top-variances">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="top-variances">Top Variances</TabsTrigger>
            <TabsTrigger value="by-supplier">By Supplier</TabsTrigger>
            <TabsTrigger value="by-category">By Category</TabsTrigger>
            <TabsTrigger value="trends">Trends</TabsTrigger>
          </TabsList>

          <ScrollArea className="h-[400px] mt-4">
            <TabsContent value="top-variances" className="space-y-3">
              {report.topVariances.map((variance, idx) => (
                <Card key={idx} className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <p className="font-semibold">{variance.invoiceNumber}</p>
                        <Badge variant="outline">{variance.status}</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        <Buildings size={14} className="inline mr-1" />
                        {variance.supplierName}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-semibold text-destructive">
                        {formatCurrency(variance.varianceAmount)}
                      </p>
                      <Badge variant="destructive">
                        {formatPercent(variance.variancePercentage / 100)}
                      </Badge>
                    </div>
                  </div>
                </Card>
              ))}
              {report.topVariances.length === 0 && (
                <Card className="p-8 text-center">
                  <p className="text-muted-foreground">No variances found in this period</p>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="by-supplier" className="space-y-3">
              {report.variancesBySupplier
                .sort((a, b) => b.totalAmount - a.totalAmount)
                .map((variance, idx) => (
                  <Card key={idx} className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <p className="font-semibold">{variance.supplierName}</p>
                        <p className="text-sm text-muted-foreground">
                          {variance.count} variance(s)
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-semibold text-destructive">
                          {formatCurrency(variance.totalAmount)}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {formatPercent(variance.percentage / 100)} of total
                        </p>
                      </div>
                    </div>
                  </Card>
                ))}
              {report.variancesBySupplier.length === 0 && (
                <Card className="p-8 text-center">
                  <p className="text-muted-foreground">No supplier variances found</p>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="by-category" className="space-y-3">
              {report.variancesByCategory
                .sort((a, b) => b.totalAmount - a.totalAmount)
                .map((variance, idx) => (
                  <Card key={idx} className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <p className="font-semibold">{variance.category}</p>
                        <p className="text-sm text-muted-foreground">
                          {variance.count} item(s)
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-semibold text-destructive">
                          {formatCurrency(variance.totalAmount)}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {formatPercent(variance.percentage / 100)} of total
                        </p>
                      </div>
                    </div>
                  </Card>
                ))}
              {report.variancesByCategory.length === 0 && (
                <Card className="p-8 text-center">
                  <p className="text-muted-foreground">No category variances found</p>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="trends" className="space-y-3">
              {report.varianceTrends.map((trend, idx) => (
                <Card key={idx} className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <p className="font-semibold">{formatDate(trend.date)}</p>
                      <p className="text-sm text-muted-foreground">
                        {trend.count} variance(s)
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-semibold text-destructive">
                        {formatCurrency(trend.amount)}
                      </p>
                    </div>
                  </div>
                </Card>
              ))}
              {report.varianceTrends.length === 0 && (
                <Card className="p-8 text-center">
                  <p className="text-muted-foreground">No trend data available</p>
                </Card>
              )}
            </TabsContent>
          </ScrollArea>
        </Tabs>

        <div className="hidden">
          <A4PrintWrapper id="variance-report-print" title={`Variance Report - ${report.reportNumber}`}>
            <div className="space-y-6">
              <div className="border-b pb-4">
                <h2 className="text-xl font-semibold">Summary</h2>
                <div className="grid grid-cols-2 gap-4 mt-4">
                  <div>
                    <div className="text-sm text-gray-600">Report Number</div>
                    <div className="font-semibold">{report.reportNumber}</div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-600">Period</div>
                    <div className="font-semibold">{formatDate(report.period.from)} - {formatDate(report.period.to)}</div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-600">Total Variances</div>
                    <div className="text-lg font-semibold">{report.totalVariances}</div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-600">Total Amount</div>
                    <div className="text-lg font-semibold">{formatCurrency(report.totalVarianceAmount)}</div>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-3">Top Variances</h3>
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="border-b">
                      <th className="p-2 text-left">Invoice #</th>
                      <th className="p-2 text-left">Supplier</th>
                      <th className="p-2 text-right">Variance Amount</th>
                      <th className="p-2 text-right">Variance %</th>
                      <th className="p-2 text-center">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {report.topVariances.map((variance) => (
                      <tr key={variance.invoiceNumber} className="border-b">
                        <td className="p-2">{variance.invoiceNumber}</td>
                        <td className="p-2">{variance.supplierName}</td>
                        <td className="p-2 text-right">{formatCurrency(variance.varianceAmount)}</td>
                        <td className="p-2 text-right">{formatPercent(variance.variancePercentage / 100)}</td>
                        <td className="p-2 text-center">{variance.status}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-3">Variances by Supplier</h3>
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="border-b">
                      <th className="p-2 text-left">Supplier</th>
                      <th className="p-2 text-right">Count</th>
                      <th className="p-2 text-right">Total Amount</th>
                      <th className="p-2 text-right">% of Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {report.variancesBySupplier.map((variance) => (
                      <tr key={variance.supplierName} className="border-b">
                        <td className="p-2">{variance.supplierName}</td>
                        <td className="p-2 text-right">{variance.count}</td>
                        <td className="p-2 text-right">{formatCurrency(variance.totalAmount)}</td>
                        <td className="p-2 text-right">{formatPercent(variance.percentage / 100)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </A4PrintWrapper>
        </div>

        <div className="flex justify-end gap-2 mt-4">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Close
          </Button>
        </div>
      </DialogContent>
    </DialogAdapter>
  )
}
