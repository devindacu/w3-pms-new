import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { DialogAdapter } from '@/components/adapters/DialogAdapter'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { PrintButton } from '@/components/PrintButton'
import { A4PrintWrapper } from '@/components/A4PrintWrapper'
import { Download, Receipt, Calendar } from '@phosphor-icons/react'
import { formatCurrency, formatDate } from '@/lib/helpers'
import { toast } from 'sonner'
import type { GuestInvoice } from '@/lib/types'

interface ARAgingDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  invoices: GuestInvoice[]
}

interface AgingBucket {
  label: string
  days: string
  amount: number
  count: number
  invoices: GuestInvoice[]
}

export function ARAgingDialog({ open, onOpenChange, invoices }: ARAgingDialogProps) {
  const calculateAging = (): AgingBucket[] => {
    const now = Date.now()
    const buckets: AgingBucket[] = [
      { label: 'Current', days: '0-30 days', amount: 0, count: 0, invoices: [] },
      { label: '31-60 Days', days: '31-60 days', amount: 0, count: 0, invoices: [] },
      { label: '61-90 Days', days: '61-90 days', amount: 0, count: 0, invoices: [] },
      { label: '90+ Days', days: '90+ days', amount: 0, count: 0, invoices: [] }
    ]

    invoices.forEach((invoice) => {
      if (invoice.status === 'posted' || invoice.status === 'cancelled' || invoice.status === 'refunded') return

      const daysOverdue = Math.floor((now - invoice.invoiceDate) / (1000 * 60 * 60 * 24))
      const outstandingAmount = invoice.amountDue

      if (daysOverdue <= 30) {
        buckets[0].amount += outstandingAmount
        buckets[0].count++
        buckets[0].invoices.push(invoice)
      } else if (daysOverdue <= 60) {
        buckets[1].amount += outstandingAmount
        buckets[1].count++
        buckets[1].invoices.push(invoice)
      } else if (daysOverdue <= 90) {
        buckets[2].amount += outstandingAmount
        buckets[2].count++
        buckets[2].invoices.push(invoice)
      } else {
        buckets[3].amount += outstandingAmount
        buckets[3].count++
        buckets[3].invoices.push(invoice)
      }
    })

    return buckets
  }

  const agingBuckets = calculateAging()
  const totalAR = agingBuckets.reduce((sum, bucket) => sum + bucket.amount, 0)

  const exportReport = () => {
    const reportLines: string[] = []
    
    reportLines.push('='.repeat(100))
    reportLines.push('ACCOUNTS RECEIVABLE AGING REPORT')
    reportLines.push('='.repeat(100))
    reportLines.push('')
    reportLines.push(`Report Date: ${formatDate(Date.now())}`)
    reportLines.push(`Total Outstanding: ${formatCurrency(totalAR)}`)
    reportLines.push('')
    
    agingBuckets.forEach((bucket) => {
      reportLines.push('-'.repeat(100))
      reportLines.push(`${bucket.label} (${bucket.days})`)
      reportLines.push(`Total: ${formatCurrency(bucket.amount)} | Count: ${bucket.count} invoices`)
      reportLines.push('-'.repeat(100))
      
      if (bucket.invoices.length > 0) {
        reportLines.push('')
        reportLines.push('Invoice Number | Guest Name | Issue Date | Amount | Balance Due')
        reportLines.push('-'.repeat(100))
        
        bucket.invoices.forEach((invoice) => {
          const invNum = invoice.invoiceNumber.padEnd(20)
          const guest = (invoice.guestName || 'N/A').substring(0, 25).padEnd(25)
          const date = formatDate(invoice.invoiceDate).padEnd(12)
          const amount = formatCurrency(invoice.grandTotal).padStart(15)
          const balance = formatCurrency(invoice.amountDue).padStart(15)
          
          reportLines.push(`${invNum} | ${guest} | ${date} | ${amount} | ${balance}`)
        })
        reportLines.push('')
      } else {
        reportLines.push('No invoices in this aging bucket')
        reportLines.push('')
      }
    })
    
    reportLines.push('='.repeat(100))
    reportLines.push('AGING SUMMARY')
    reportLines.push('='.repeat(100))
    agingBuckets.forEach((bucket) => {
      const label = bucket.label.padEnd(30)
      const amount = formatCurrency(bucket.amount).padStart(20)
      const percent = totalAR > 0 ? ((bucket.amount / totalAR) * 100).toFixed(2) + '%' : '0.00%'
      reportLines.push(`${label} ${amount}  (${percent.padStart(10)})`)
    })
    reportLines.push('-'.repeat(100))
    reportLines.push(`${'TOTAL ACCOUNTS RECEIVABLE'.padEnd(30)} ${formatCurrency(totalAR).padStart(20)}  (${'100.00%'.padStart(10)})`)
    reportLines.push('='.repeat(100))
    
    const reportContent = reportLines.join('\n')
    const blob = new Blob([reportContent], { type: 'text/plain;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `AR_Aging_Report_${formatDate(Date.now()).replace(/\//g, '-')}.txt`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
    
    toast.success('AR Aging Report exported successfully')
  }

  return (
    <DialogAdapter open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Receipt size={24} />
              Accounts Receivable Aging Report
            </div>
            <PrintButton
              elementId="ar-aging-print"
              options={{
                title: 'AR Aging Report',
                filename: `ar-aging-${formatDate(Date.now()).replace(/\//g, '-')}.pdf`
              }}
              variant="outline"
              size="sm"
            />
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground flex items-center gap-2">
                <Calendar size={16} />
                As of {formatDate(Date.now())}
              </p>
              <p className="text-2xl font-bold mt-2">Total AR: {formatCurrency(totalAR)}</p>
            </div>
            <Button onClick={exportReport} variant="outline">
              <Download size={18} className="mr-2" />
              Export Report
            </Button>
          </div>

          <Separator />

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {agingBuckets.map((bucket, index) => {
              const percentage = totalAR > 0 ? (bucket.amount / totalAR) * 100 : 0
              const colorClass = index === 0 ? 'border-success' : index === 1 ? 'border-accent' : index === 2 ? 'border-destructive' : 'border-destructive'
              
              return (
                <Card key={bucket.label} className={`p-4 border-l-4 ${colorClass}`}>
                  <h3 className="font-semibold mb-1">{bucket.label}</h3>
                  <p className="text-xs text-muted-foreground mb-3">{bucket.days}</p>
                  <p className="text-2xl font-bold mb-2">{formatCurrency(bucket.amount)}</p>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">{bucket.count} invoices</span>
                    <Badge variant="secondary">{percentage.toFixed(1)}%</Badge>
                  </div>
                </Card>
              )
            })}
          </div>

          <div className="space-y-4">
            {agingBuckets.map((bucket) => (
              <div key={bucket.label}>
                {bucket.invoices.length > 0 && (
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="font-semibold">{bucket.label} - {bucket.invoices.length} invoices</h4>
                      <span className="font-semibold">{formatCurrency(bucket.amount)}</span>
                    </div>
                    <div className="space-y-2">
                      {bucket.invoices.slice(0, 5).map((invoice) => (
                        <div key={invoice.id} className="p-3 bg-muted/50 rounded-lg flex items-center justify-between">
                          <div className="flex-1">
                            <p className="font-medium">{invoice.invoiceNumber}</p>
                            <p className="text-sm text-muted-foreground">{invoice.guestName}</p>
                          </div>
                          <div className="text-right">
                            <p className="font-semibold">{formatCurrency(invoice.amountDue)}</p>
                            <p className="text-xs text-muted-foreground">{formatDate(invoice.invoiceDate)}</p>
                          </div>
                        </div>
                      ))}
                      {bucket.invoices.length > 5 && (
                        <p className="text-sm text-muted-foreground text-center py-2">
                          +{bucket.invoices.length - 5} more invoices
                        </p>
                      )}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="hidden">
          <A4PrintWrapper id="ar-aging-print" title={`AR Aging Report - ${formatDate(Date.now())}`}>
            <div className="space-y-6">
              <div className="border-b pb-4">
                <div className="flex justify-between items-center">
                  <div>
                    <h2 className="text-xl font-semibold">Summary</h2>
                    <p className="text-sm text-gray-600">As of {formatDate(Date.now())}</p>
                  </div>
                  <div className="text-right">
                    <div className="text-sm text-gray-600">Total AR</div>
                    <div className="text-2xl font-bold">{formatCurrency(totalAR)}</div>
                  </div>
                </div>
              </div>

              {agingBuckets.map((bucket) => {
                const percentage = totalAR > 0 ? (bucket.amount / totalAR) * 100 : 0
                return (
                  <div key={bucket.label} className="border-b pb-4">
                    <div className="flex justify-between items-center mb-3">
                      <div>
                        <h3 className="font-semibold text-lg">{bucket.label}</h3>
                        <p className="text-sm text-gray-600">{bucket.days}</p>
                      </div>
                      <div className="text-right">
                        <div className="text-xl font-bold">{formatCurrency(bucket.amount)}</div>
                        <div className="text-sm text-gray-600">{bucket.count} invoices ({percentage.toFixed(1)}%)</div>
                      </div>
                    </div>

                    {bucket.invoices.length > 0 && (
                      <table className="w-full border-collapse mt-3">
                        <thead>
                          <tr className="border-b">
                            <th className="p-2 text-left">Invoice #</th>
                            <th className="p-2 text-left">Guest</th>
                            <th className="p-2 text-left">Date</th>
                            <th className="p-2 text-right">Amount</th>
                            <th className="p-2 text-right">Balance</th>
                          </tr>
                        </thead>
                        <tbody>
                          {bucket.invoices.slice(0, 10).map((invoice) => (
                            <tr key={invoice.id} className="border-b text-sm">
                              <td className="p-2">{invoice.invoiceNumber}</td>
                              <td className="p-2">{invoice.guestName}</td>
                              <td className="p-2">{formatDate(invoice.invoiceDate)}</td>
                              <td className="p-2 text-right">{formatCurrency(invoice.grandTotal)}</td>
                              <td className="p-2 text-right">{formatCurrency(invoice.amountDue)}</td>
                            </tr>
                          ))}
                          {bucket.invoices.length > 10 && (
                            <tr>
                              <td colSpan={5} className="p-2 text-center text-sm text-gray-600">
                                +{bucket.invoices.length - 10} more invoices
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    )}
                  </div>
                )
              })}
            </div>
          </A4PrintWrapper>
        </div>
      </DialogContent>
    </DialogAdapter>
  )
}
