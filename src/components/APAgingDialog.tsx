import { useState, useMemo } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Download, FileText, Calendar } from '@phosphor-icons/react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'
import { formatCurrency, formatDate } from '@/lib/helpers'
import type { Invoice } from '@/lib/types'
import { toast } from 'sonner'

interface APAgingDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  invoices: Invoice[]
}

interface AgingBucket {
  label: string
  min: number
  max: number
  color: string
}

const AGING_BUCKETS: AgingBucket[] = [
  { label: 'Current', min: 0, max: 0, color: 'oklch(0.60 0.18 155)' },
  { label: '1-30 Days', min: 1, max: 30, color: 'oklch(0.65 0.22 265)' },
  { label: '31-60 Days', min: 31, max: 60, color: 'oklch(0.68 0.24 35)' },
  { label: '61-90 Days', min: 61, max: 90, color: 'oklch(0.62 0.24 25)' },
  { label: '90+ Days', min: 91, max: Infinity, color: 'oklch(0.62 0.24 25)' },
]

export function APAgingDialog({ open, onOpenChange, invoices }: APAgingDialogProps) {
  const [selectedBucket, setSelectedBucket] = useState<string | null>(null)

  const agingAnalysis = useMemo(() => {
    const now = Date.now()
    const unpaidInvoices = invoices.filter(inv => 
      (inv.status !== 'posted' && inv.status !== 'cancelled' && inv.status !== 'rejected') &&
      inv.balance > 0
    )

    const buckets = AGING_BUCKETS.map((bucket) => {
      const bucketInvoices = unpaidInvoices.filter((inv) => {
        if (!inv.dueDate) return false
        const daysOverdue = Math.floor((now - inv.dueDate) / (1000 * 60 * 60 * 24))
        
        if (bucket.max === 0) {
          return daysOverdue <= 0
        } else if (bucket.max === Infinity) {
          return daysOverdue >= bucket.min
        } else {
          return daysOverdue >= bucket.min && daysOverdue <= bucket.max
        }
      })

      const totalAmount = bucketInvoices.reduce((sum, inv) => sum + inv.balance, 0)
      const count = bucketInvoices.length

      return {
        ...bucket,
        amount: totalAmount,
        count,
        invoices: bucketInvoices,
      }
    })

    const supplierAgingMap = new Map<string, {
      supplierName: string
      totalDue: number
      invoices: Invoice[]
      buckets: Record<string, number>
    }>()

    unpaidInvoices.forEach((inv) => {
      const supplierName = inv.supplierName || 'Unknown Supplier'
      
      if (!supplierAgingMap.has(supplierName)) {
        supplierAgingMap.set(supplierName, {
          supplierName,
          totalDue: 0,
          invoices: [],
          buckets: {},
        })
      }

      const supplier = supplierAgingMap.get(supplierName)!
      supplier.totalDue += inv.balance
      supplier.invoices.push(inv)

      if (!inv.dueDate) return
      const daysOverdue = Math.floor((now - inv.dueDate) / (1000 * 60 * 60 * 24))
      
      AGING_BUCKETS.forEach((bucket) => {
        let isInBucket = false
        if (bucket.max === 0) {
          isInBucket = daysOverdue <= 0
        } else if (bucket.max === Infinity) {
          isInBucket = daysOverdue >= bucket.min
        } else {
          isInBucket = daysOverdue >= bucket.min && daysOverdue <= bucket.max
        }

        if (isInBucket) {
          supplier.buckets[bucket.label] = (supplier.buckets[bucket.label] || 0) + inv.balance
        }
      })
    })

    const supplierAging = Array.from(supplierAgingMap.values())
      .sort((a, b) => b.totalDue - a.totalDue)

    const totalPayables = unpaidInvoices.reduce((sum, inv) => sum + inv.balance, 0)

    return {
      buckets,
      supplierAging,
      totalPayables,
      totalInvoices: unpaidInvoices.length,
    }
  }, [invoices])

  const exportToCSV = () => {
    const csvRows: string[] = []
    
    csvRows.push('AP Aging Report')
    csvRows.push(`Generated: ${formatDate(Date.now())}`)
    csvRows.push('')
    csvRows.push('Summary by Aging Period')
    csvRows.push('Period,Count,Amount')
    
    agingAnalysis.buckets.forEach((bucket) => {
      csvRows.push(`${bucket.label},${bucket.count},${bucket.amount}`)
    })
    
    csvRows.push('')
    csvRows.push(`Total,${agingAnalysis.totalInvoices},${agingAnalysis.totalPayables}`)
    csvRows.push('')
    csvRows.push('Supplier Aging Summary')
    csvRows.push(`Supplier,Total Due,${AGING_BUCKETS.map(b => b.label).join(',')}`)
    
    agingAnalysis.supplierAging.forEach((supplier) => {
      const bucketAmounts = AGING_BUCKETS.map(b => supplier.buckets[b.label] || 0).join(',')
      csvRows.push(`${supplier.supplierName},${supplier.totalDue},${bucketAmounts}`)
    })

    const csvContent = csvRows.join('\n')
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `AP_Aging_Report_${formatDate(Date.now()).replace(/\//g, '-')}.csv`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
    
    toast.success('AP Aging report exported to CSV')
  }

  const chartData = agingAnalysis.buckets.map((bucket) => ({
    name: bucket.label,
    amount: bucket.amount,
    count: bucket.count,
  }))

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-6xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Calendar size={24} />
            Accounts Payable Aging Report
          </DialogTitle>
        </DialogHeader>

        <div className="dialog-content-wrapper">
          <ScrollArea className="dialog-body-scrollable">
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Report Date</p>
                  <p className="text-lg font-semibold">{formatDate(Date.now())}</p>
                </div>
                <Button onClick={exportToCSV} variant="outline" size="sm">
                  <Download size={16} className="mr-2" />
                  Export CSV
                </Button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card className="p-4 border-l-4 border-l-primary">
                  <p className="text-sm text-muted-foreground mb-1">Total Payables</p>
                  <p className="text-2xl font-bold text-primary">{formatCurrency(agingAnalysis.totalPayables)}</p>
                </Card>
                <Card className="p-4 border-l-4 border-l-accent">
                  <p className="text-sm text-muted-foreground mb-1">Outstanding Invoices</p>
                  <p className="text-2xl font-bold text-accent">{agingAnalysis.totalInvoices}</p>
                </Card>
                <Card className="p-4 border-l-4 border-l-destructive">
                  <p className="text-sm text-muted-foreground mb-1">Overdue Amount</p>
                  <p className="text-2xl font-bold text-destructive">
                    {formatCurrency(agingAnalysis.buckets.slice(2).reduce((sum, b) => sum + b.amount, 0))}
                  </p>
                </Card>
              </div>

              <Tabs defaultValue="summary">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="summary">Summary</TabsTrigger>
                  <TabsTrigger value="suppliers">By Supplier</TabsTrigger>
                  <TabsTrigger value="invoices">Invoice Details</TabsTrigger>
                </TabsList>

                <TabsContent value="summary" className="space-y-6">
                  <Card className="p-6">
                    <h3 className="text-lg font-semibold mb-4">Aging Breakdown</h3>
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart data={chartData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.85 0.05 140)" />
                        <XAxis dataKey="name" stroke="oklch(0.45 0.08 140)" fontSize={12} />
                        <YAxis stroke="oklch(0.45 0.08 140)" fontSize={12} tickFormatter={(value) => `${(value / 1000).toFixed(0)}k`} />
                        <Tooltip formatter={(value: number) => formatCurrency(value)} />
                        <Legend />
                        <Bar dataKey="amount" name="Amount" radius={[4, 4, 0, 0]}>
                          {chartData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={AGING_BUCKETS[index].color} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </Card>

                  <div className="space-y-3">
                    {agingAnalysis.buckets.map((bucket) => {
                      const percentage = agingAnalysis.totalPayables > 0
                        ? (bucket.amount / agingAnalysis.totalPayables) * 100
                        : 0

                      return (
                        <Card 
                          key={bucket.label} 
                          className="p-4 cursor-pointer hover:bg-muted/50 transition-colors"
                          onClick={() => setSelectedBucket(bucket.label)}
                        >
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-3">
                              <div 
                                className="w-4 h-4 rounded" 
                                style={{ backgroundColor: bucket.color }}
                              />
                              <h4 className="font-semibold">{bucket.label}</h4>
                            </div>
                            <Badge variant="secondary">{bucket.count} invoices</Badge>
                          </div>
                          <div className="flex items-end justify-between">
                            <div>
                              <p className="text-2xl font-bold">{formatCurrency(bucket.amount)}</p>
                              <p className="text-sm text-muted-foreground">{percentage.toFixed(1)}% of total</p>
                            </div>
                          </div>
                        </Card>
                      )
                    })}
                  </div>
                </TabsContent>

                <TabsContent value="suppliers" className="space-y-4">
                  {agingAnalysis.supplierAging.map((supplier) => (
                    <Card key={supplier.supplierName} className="p-4">
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <h4 className="font-semibold text-lg">{supplier.supplierName}</h4>
                          <p className="text-sm text-muted-foreground">{supplier.invoices.length} outstanding invoices</p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm text-muted-foreground">Total Due</p>
                          <p className="text-2xl font-bold text-destructive">{formatCurrency(supplier.totalDue)}</p>
                        </div>
                      </div>
                      <div className="grid grid-cols-5 gap-3">
                        {AGING_BUCKETS.map((bucket) => (
                          <div key={bucket.label} className="text-center p-3 bg-muted rounded-lg">
                            <p className="text-xs text-muted-foreground mb-1">{bucket.label}</p>
                            <p className="font-semibold text-sm">{formatCurrency(supplier.buckets[bucket.label] || 0)}</p>
                          </div>
                        ))}
                      </div>
                    </Card>
                  ))}
                </TabsContent>

                <TabsContent value="invoices" className="space-y-3">
                  {selectedBucket ? (
                    <>
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-semibold">{selectedBucket} Invoices</h3>
                        <Button variant="outline" size="sm" onClick={() => setSelectedBucket(null)}>
                          Show All
                        </Button>
                      </div>
                      {agingAnalysis.buckets
                        .find(b => b.label === selectedBucket)
                        ?.invoices.map((invoice) => (
                          <InvoiceCard key={invoice.id} invoice={invoice} />
                        ))}
                    </>
                  ) : (
                    agingAnalysis.buckets.map((bucket) => (
                      bucket.invoices.length > 0 && (
                        <div key={bucket.label} className="space-y-3">
                          <h3 className="text-lg font-semibold flex items-center gap-2">
                            <div 
                              className="w-3 h-3 rounded" 
                              style={{ backgroundColor: bucket.color }}
                            />
                            {bucket.label} ({bucket.count})
                          </h3>
                          {bucket.invoices.map((invoice) => (
                            <InvoiceCard key={invoice.id} invoice={invoice} />
                          ))}
                          <Separator />
                        </div>
                      )
                    ))
                  )}
                </TabsContent>
              </Tabs>
            </div>
          </ScrollArea>
        </div>
      </DialogContent>
    </Dialog>
  )
}

function InvoiceCard({ invoice }: { invoice: Invoice }) {
  const now = Date.now()
  const daysOverdue = invoice.dueDate 
    ? Math.floor((now - invoice.dueDate) / (1000 * 60 * 60 * 24))
    : 0

  return (
    <Card className="p-4 bg-muted/50">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <p className="font-semibold">{invoice.invoiceNumber}</p>
            {daysOverdue > 0 && (
              <Badge variant="destructive" className="text-xs">
                {daysOverdue} days overdue
              </Badge>
            )}
          </div>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-muted-foreground">Supplier:</span>
              <span className="ml-2">{invoice.supplierName || 'N/A'}</span>
            </div>
            <div>
              <span className="text-muted-foreground">Invoice Date:</span>
              <span className="ml-2">{formatDate(invoice.invoiceDate)}</span>
            </div>
            <div>
              <span className="text-muted-foreground">Due Date:</span>
              <span className="ml-2">{invoice.dueDate ? formatDate(invoice.dueDate) : 'N/A'}</span>
            </div>
            <div>
              <span className="text-muted-foreground">Items:</span>
              <span className="ml-2">{invoice.items.length}</span>
            </div>
          </div>
        </div>
        <div className="text-right">
          <p className="text-sm text-muted-foreground">Balance Due</p>
          <p className="text-xl font-bold text-destructive">{formatCurrency(invoice.balance)}</p>
        </div>
      </div>
    </Card>
  )
}
