import { useState, useMemo } from 'react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { format, startOfMonth, endOfMonth, startOfYear, endOfYear } from 'date-fns'
import {
  MagnifyingGlass,
  Download,
  CurrencyDollar,
  Wallet,
  CreditCard,
  Bank,
  DeviceMobile,
  CheckCircle,
  Clock,
  CalendarBlank,
  FunnelSimple,
  Receipt,
  ArrowLeft,
  DotsThree,
  Eye,
  Info
} from '@phosphor-icons/react'
import type { Payment, PaymentMethod, PaymentStatus, GuestInvoice, PaymentRefund, SystemUser } from '@/lib/types'
import { formatCurrency } from '@/lib/helpers'
import { toast } from 'sonner'
import { ResponsiveDataView, type Column } from '@/components/ResponsiveDataView'
import { useIsMobile } from '@/hooks/use-mobile'
import { PaymentRefundDialog } from '@/components/PaymentRefundDialog'

interface PaymentTrackingProps {
  payments: Payment[]
  invoices: GuestInvoice[]
  onUpdatePayment: (payment: Payment) => void
  onUpdateInvoice: (invoice: GuestInvoice) => void
  currentUser: SystemUser
}

export function PaymentTracking({ payments, invoices, onUpdatePayment, onUpdateInvoice, currentUser }: PaymentTrackingProps) {
  const isMobile = useIsMobile()
  const [searchTerm, setSearchTerm] = useState('')
  const [methodFilter, setMethodFilter] = useState<PaymentMethod | 'all'>('all')
  const [statusFilter, setStatusFilter] = useState<PaymentStatus | 'all'>('all')
  const [dateRangeFilter, setDateRangeFilter] = useState<'all' | 'today' | 'this-month' | 'this-year'>('all')
  const [reconciledFilter, setReconciledFilter] = useState<'all' | 'reconciled' | 'pending'>('all')
  const [refundDialogOpen, setRefundDialogOpen] = useState(false)
  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null)

  const handleRefundClick = (payment: Payment) => {
    if (payment.isRefunded) {
      toast.error('This payment has already been fully refunded')
      return
    }
    if (payment.isRefund) {
      toast.error('Cannot refund a refund payment')
      return
    }
    setSelectedPayment(payment)
    setRefundDialogOpen(true)
  }

  const handleRefundProcessed = (refund: PaymentRefund, updatedPayment: Payment, updatedInvoice?: GuestInvoice) => {
    onUpdatePayment(updatedPayment)
    if (updatedInvoice) {
      onUpdateInvoice(updatedInvoice)
    }
  }

  const getInvoiceDetails = (invoiceId?: string) => {
    if (!invoiceId) return null
    return invoices.find(inv => inv.id === invoiceId)
  }

  const filteredPayments = useMemo(() => {
    let filtered = [...payments]

    if (searchTerm) {
      filtered = filtered.filter(payment => {
        const invoice = getInvoiceDetails(payment.invoiceId)
        return (
          payment.paymentNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
          payment.reference?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          invoice?.invoiceNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
          invoice?.guestName.toLowerCase().includes(searchTerm.toLowerCase())
        )
      })
    }

    if (methodFilter !== 'all') {
      filtered = filtered.filter(p => p.method === methodFilter)
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter(p => p.status === statusFilter)
    }

    if (reconciledFilter !== 'all') {
      filtered = filtered.filter(p => 
        reconciledFilter === 'reconciled' ? p.reconciled : !p.reconciled
      )
    }

    if (dateRangeFilter !== 'all') {
      const now = Date.now()
      const startOfToday = new Date().setHours(0, 0, 0, 0)
      
      filtered = filtered.filter(p => {
        switch (dateRangeFilter) {
          case 'today':
            return p.processedAt >= startOfToday
          case 'this-month':
            return p.processedAt >= startOfMonth(now).getTime() && 
                   p.processedAt <= endOfMonth(now).getTime()
          case 'this-year':
            return p.processedAt >= startOfYear(now).getTime() && 
                   p.processedAt <= endOfYear(now).getTime()
          default:
            return true
        }
      })
    }

    return filtered.sort((a, b) => b.processedAt - a.processedAt)
  }, [payments, searchTerm, methodFilter, statusFilter, dateRangeFilter, reconciledFilter, invoices])

  const stats = useMemo(() => {
    return {
      total: filteredPayments.reduce((sum, p) => sum + p.amount, 0),
      reconciled: filteredPayments.filter(p => p.reconciled).reduce((sum, p) => sum + p.amount, 0),
      pending: filteredPayments.filter(p => !p.reconciled).reduce((sum, p) => sum + p.amount, 0),
      count: filteredPayments.length,
      reconciledCount: filteredPayments.filter(p => p.reconciled).length,
      pendingCount: filteredPayments.filter(p => !p.reconciled).length
    }
  }, [filteredPayments])

  const methodBreakdown = useMemo(() => {
    const methods: Record<PaymentMethod, number> = {
      'cash': 0,
      'card': 0,
      'bank-transfer': 0,
      'mobile-payment': 0,
      'credit': 0
    }

    filteredPayments.forEach(p => {
      methods[p.method] += p.amount
    })

    return methods
  }, [filteredPayments])

  const getPaymentMethodIcon = (method: PaymentMethod) => {
    switch (method) {
      case 'cash':
        return <Wallet size={18} className="text-success" />
      case 'card':
        return <CreditCard size={18} className="text-primary" />
      case 'bank-transfer':
        return <Bank size={18} className="text-accent" />
      case 'mobile-payment':
        return <DeviceMobile size={18} className="text-secondary" />
      default:
        return <CurrencyDollar size={18} className="text-muted-foreground" />
    }
  }

  const getPaymentMethodBadge = (method: PaymentMethod) => {
    const colors = {
      'cash': 'bg-success/10 text-success border-success/20',
      'card': 'bg-primary/10 text-primary border-primary/20',
      'bank-transfer': 'bg-accent/10 text-accent border-accent/20',
      'mobile-payment': 'bg-secondary/10 text-secondary border-secondary/20',
      'credit': 'bg-muted text-muted-foreground border-muted'
    }
    
    return colors[method] || 'bg-muted text-muted-foreground'
  }

  const handleExport = () => {
    const csvContent = [
      ['Payment #', 'Date', 'Method', 'Amount', 'Invoice #', 'Guest', 'Reference', 'Status', 'Reconciled'].join(','),
      ...filteredPayments.map(payment => {
        const invoice = getInvoiceDetails(payment.invoiceId)
        return [
          payment.paymentNumber,
          format(payment.processedAt, 'yyyy-MM-dd HH:mm'),
          payment.method,
          payment.amount.toFixed(2),
          invoice?.invoiceNumber || '',
          invoice?.guestName || '',
          payment.reference || '',
          payment.status,
          payment.reconciled ? 'Yes' : 'No'
        ].join(',')
      })
    ].join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `payment-tracking-${format(Date.now(), 'yyyy-MM-dd')}.csv`
    link.click()
    URL.revokeObjectURL(url)
    toast.success('Payment data exported successfully')
  }

  const tableColumns: Column<Payment>[] = [
    { 
      key: 'paymentNumber', 
      label: 'Payment #', 
      sortable: true,
      render: (payment) => <span className="font-mono font-medium">{payment.paymentNumber}</span>
    },
    { 
      key: 'processedAt', 
      label: 'Date & Time', 
      sortable: true,
      render: (payment) => (
        <div className="space-y-1">
          <div className="font-medium">{format(payment.processedAt, 'MMM dd, yyyy')}</div>
          <div className="text-xs text-muted-foreground">{format(payment.processedAt, 'HH:mm:ss')}</div>
        </div>
      )
    },
    { 
      key: 'method', 
      label: 'Method', 
      sortable: true,
      render: (payment) => (
        <Badge variant="outline" className={getPaymentMethodBadge(payment.method)}>
          <div className="flex items-center gap-1.5">
            {getPaymentMethodIcon(payment.method)}
            <span className="capitalize">{payment.method.split('-').join(' ')}</span>
          </div>
        </Badge>
      )
    },
    { 
      key: 'amount', 
      label: 'Amount', 
      sortable: true,
      render: (payment) => (
        <div className="space-y-1">
          <div className="font-bold text-success">{formatCurrency(payment.amount)}</div>
          {payment.isRefunded && payment.refundedAmount && (
            <Badge variant="outline" className="bg-destructive/10 text-destructive border-destructive/20 text-xs">
              Refunded: {formatCurrency(payment.refundedAmount)}
            </Badge>
          )}
          {payment.isRefund && (
            <Badge variant="outline" className="bg-destructive/10 text-destructive border-destructive/20 text-xs">
              Refund Payment
            </Badge>
          )}
        </div>
      )
    },
    { 
      key: 'invoiceId', 
      label: 'Invoice #', 
      sortable: false,
      render: (payment) => {
        const invoice = getInvoiceDetails(payment.invoiceId)
        return invoice?.invoiceNumber || <span className="text-muted-foreground italic">—</span>
      }
    },
    { 
      key: 'guestId', 
      label: 'Guest', 
      sortable: false,
      hideOnMobile: true,
      render: (payment) => {
        const invoice = getInvoiceDetails(payment.invoiceId)
        return invoice?.guestName || <span className="text-muted-foreground italic">—</span>
      }
    },
    { 
      key: 'reference', 
      label: 'Reference', 
      sortable: false,
      hideOnMobile: true,
      render: (payment) => (
        <span className="font-mono text-sm">
          {payment.reference || <span className="text-muted-foreground italic">—</span>}
        </span>
      )
    },
    { 
      key: 'status', 
      label: 'Status', 
      sortable: true,
      render: (payment) => (
        <Badge variant="outline" className={
          payment.status === 'paid' ? 'bg-success/10 text-success border-success/20' :
          payment.status === 'pending' ? 'bg-warning/10 text-warning border-warning/20' :
          payment.status === 'refunded' ? 'bg-destructive/10 text-destructive border-destructive/20' :
          'bg-muted text-muted-foreground'
        }>
          {payment.status === 'paid' && <CheckCircle size={14} className="mr-1" />}
          <span className="capitalize">{payment.status}</span>
        </Badge>
      )
    },
    { 
      key: 'reconciled', 
      label: 'Reconciled', 
      sortable: true,
      render: (payment) => (
        payment.reconciled ? (
          <div className="flex items-center gap-2 text-success">
            <CheckCircle size={16} />
            <span className="text-sm">Yes</span>
          </div>
        ) : (
          <div className="flex items-center gap-2 text-muted-foreground">
            <Clock size={16} />
            <span className="text-sm">Pending</span>
          </div>
        )
      )
    },
    {
      key: 'actions',
      label: 'Actions',
      sortable: false,
      render: (payment) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm">
              <DotsThree size={20} />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem>
              <Eye size={16} className="mr-2" />
              View Details
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            {!payment.isRefunded && !payment.isRefund && (
              <DropdownMenuItem 
                onClick={() => handleRefundClick(payment)}
                className="text-destructive focus:text-destructive"
              >
                <ArrowLeft size={16} className="mr-2" />
                Process Refund
              </DropdownMenuItem>
            )}
            {payment.isRefunded && (
              <DropdownMenuItem disabled>
                <Info size={16} className="mr-2" />
                Fully Refunded
              </DropdownMenuItem>
            )}
            {payment.isRefund && (
              <DropdownMenuItem disabled>
                <Info size={16} className="mr-2" />
                Refund Payment
              </DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      )
    }
  ]

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-semibold flex items-center gap-2">
            <Receipt size={28} />
            Payment Tracking
          </h2>
          <p className="text-muted-foreground mt-1">Monitor and track all payment transactions</p>
        </div>
        <Button onClick={handleExport} disabled={filteredPayments.length === 0}>
          <Download size={20} className="mr-2" />
          Export CSV
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-6 border-l-4 border-l-primary">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-muted-foreground">Total Payments</h3>
            <CurrencyDollar size={20} className="text-primary" />
          </div>
          <p className="text-3xl font-semibold">{formatCurrency(stats.total)}</p>
          <p className="text-xs text-muted-foreground mt-1">{stats.count} transactions</p>
        </Card>

        <Card className="p-6 border-l-4 border-l-success">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-muted-foreground">Reconciled</h3>
            <CheckCircle size={20} className="text-success" />
          </div>
          <p className="text-3xl font-semibold">{formatCurrency(stats.reconciled)}</p>
          <p className="text-xs text-muted-foreground mt-1">{stats.reconciledCount} payments</p>
        </Card>

        <Card className="p-6 border-l-4 border-l-warning">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-muted-foreground">Pending</h3>
            <Clock size={20} className="text-warning" />
          </div>
          <p className="text-3xl font-semibold">{formatCurrency(stats.pending)}</p>
          <p className="text-xs text-muted-foreground mt-1">{stats.pendingCount} payments</p>
        </Card>

        <Card className="p-6 border-l-4 border-l-accent">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-muted-foreground">Top Method</h3>
            <Wallet size={20} className="text-accent" />
          </div>
          <p className="text-3xl font-semibold">
            {formatCurrency(Math.max(...Object.values(methodBreakdown)))}
          </p>
          <p className="text-xs text-muted-foreground mt-1 capitalize">
            {Object.entries(methodBreakdown).reduce((a, b) => a[1] > b[1] ? a : b)[0].split('-').join(' ')}
          </p>
        </Card>
      </div>

      <Card className="p-6">
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <FunnelSimple size={20} />
            <h3 className="font-semibold">Filters</h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            <div className="relative">
              <MagnifyingGlass className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
              <Input
                placeholder="Search payments..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            <Select value={methodFilter} onValueChange={(v) => setMethodFilter(v as PaymentMethod | 'all')}>
              <SelectTrigger>
                <SelectValue placeholder="Payment Method" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Methods</SelectItem>
                <SelectItem value="cash">Cash</SelectItem>
                <SelectItem value="card">Card</SelectItem>
                <SelectItem value="bank-transfer">Bank Transfer</SelectItem>
                <SelectItem value="mobile-payment">Mobile Payment</SelectItem>
                <SelectItem value="credit">Credit</SelectItem>
              </SelectContent>
            </Select>

            <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as PaymentStatus | 'all')}>
              <SelectTrigger>
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="paid">Paid</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="partially-paid">Partially Paid</SelectItem>
                <SelectItem value="refunded">Refunded</SelectItem>
              </SelectContent>
            </Select>

            <Select value={reconciledFilter} onValueChange={(v) => setReconciledFilter(v as 'all' | 'reconciled' | 'pending')}>
              <SelectTrigger>
                <SelectValue placeholder="Reconciliation" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="reconciled">Reconciled</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
              </SelectContent>
            </Select>

            <Select value={dateRangeFilter} onValueChange={(v) => setDateRangeFilter(v as any)}>
              <SelectTrigger>
                <SelectValue placeholder="Date Range" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Time</SelectItem>
                <SelectItem value="today">Today</SelectItem>
                <SelectItem value="this-month">This Month</SelectItem>
                <SelectItem value="this-year">This Year</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </Card>

      <ResponsiveDataView
        data={filteredPayments}
        columns={tableColumns}
        emptyMessage="No payments found"
        enableFiltering={false}
        enableSorting={true}
      />

      {selectedPayment && (
        <PaymentRefundDialog
          open={refundDialogOpen}
          onOpenChange={setRefundDialogOpen}
          payment={selectedPayment}
          invoice={getInvoiceDetails(selectedPayment.invoiceId) || undefined}
          currentUser={currentUser}
          onRefund={handleRefundProcessed}
        />
      )}
    </div>
  )
}
