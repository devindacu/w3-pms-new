import { useState } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
  CurrencyDollar,
  Receipt,
  Wallet,
  ChartLine,
  ArrowUp,
  ArrowDown,
  Plus,
  Download,
  FileText,
  TrendUp,
  Invoice as InvoiceIcon,
  CreditCard,
  ChartBar,
  Notebook,
  Bank,
  ListChecks,
  Calendar,
  FilePlus,
  Check,
  Package,
  Buildings
} from '@phosphor-icons/react'
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'
import { 
  type Invoice, 
  type Payment, 
  type Expense, 
  type Account, 
  type Budget, 
  type JournalEntry, 
  type ChartOfAccount, 
  type SystemUser,
  type GLEntry,
  type BankReconciliation,
  type CostCenter,
  type ProfitCenter
} from '@/lib/types'
import { formatCurrency, formatDate, formatDateTime } from '@/lib/helpers'
import { PercentageChangeIndicator } from './PercentageChangeIndicator'
import { InvoiceDialog } from './InvoiceDialog'
import { PaymentDialog } from './PaymentDialog'
import { InvoicePaymentDialog } from './InvoicePaymentDialog'
import { ExpenseDialog } from './ExpenseDialog'
import { BudgetDialog } from './BudgetDialog'
import { JournalEntryDialog } from './JournalEntryDialog'
import { BankReconciliationDialog } from './BankReconciliationDialog'
import { ARAgingDialog } from './ARAgingDialog'
import { CashFlowStatementDialog } from './CashFlowStatementDialog'
import { DepartmentalPLDialog } from './DepartmentalPLDialog'
import { BudgetVarianceDialog } from './BudgetVarianceDialog'
import { BulkApprovalDialog } from './BulkApprovalDialog'
import { FinanceReportsDialog } from './FinanceReportsDialog'
import { APAgingDialog } from './APAgingDialog'
import { TaxSummaryDialog } from './TaxSummaryDialog'
import { PettyCashDialog } from './PettyCashDialog'
import { CostCenterDialog } from './CostCenterDialog'
import { ProfitCenterDialog } from './ProfitCenterDialog'
import { CostCenterReportDialog } from './CostCenterReportDialog'
import { ProfitCenterReportDialog } from './ProfitCenterReportDialog'
import { toast } from 'sonner'

interface FinanceProps {
  invoices: Invoice[]
  setInvoices: (invoices: Invoice[] | ((prev: Invoice[]) => Invoice[])) => void
  payments: Payment[]
  setPayments: (payments: Payment[] | ((prev: Payment[]) => Payment[])) => void
  expenses: Expense[]
  setExpenses: (expenses: Expense[] | ((prev: Expense[]) => Expense[])) => void
  accounts: Account[]
  budgets: Budget[]
  setBudgets: (budgets: Budget[] | ((prev: Budget[]) => Budget[])) => void
  journalEntries?: JournalEntry[]
  setJournalEntries?: (entries: JournalEntry[] | ((prev: JournalEntry[]) => JournalEntry[])) => void
  chartOfAccounts?: ChartOfAccount[]
  setChartOfAccounts?: (accounts: ChartOfAccount[] | ((prev: ChartOfAccount[]) => ChartOfAccount[])) => void
  glEntries?: GLEntry[]
  setGLEntries?: (entries: GLEntry[] | ((prev: GLEntry[]) => GLEntry[])) => void
  bankReconciliations?: BankReconciliation[]
  setBankReconciliations?: (reconciliations: BankReconciliation[] | ((prev: BankReconciliation[]) => BankReconciliation[])) => void
  guestInvoices?: import('@/lib/types').GuestInvoice[]
  costCenters?: CostCenter[]
  setCostCenters?: (centers: CostCenter[] | ((prev: CostCenter[]) => CostCenter[])) => void
  profitCenters?: ProfitCenter[]
  setProfitCenters?: (centers: ProfitCenter[] | ((prev: ProfitCenter[]) => ProfitCenter[])) => void
  costCenterReports?: import('@/lib/types').CostCenterReport[]
  profitCenterReports?: import('@/lib/types').ProfitCenterReport[]
  currentUser: SystemUser
}

export function Finance({
  invoices,
  setInvoices,
  payments,
  setPayments,
  expenses,
  setExpenses,
  accounts,
  budgets,
  setBudgets,
  journalEntries = [],
  setJournalEntries,
  chartOfAccounts = [],
  setChartOfAccounts,
  glEntries = [],
  setGLEntries,
  bankReconciliations = [],
  setBankReconciliations,
  guestInvoices = [],
  costCenters = [],
  setCostCenters,
  profitCenters = [],
  setProfitCenters,
  costCenterReports = [],
  profitCenterReports = [],
  currentUser
}: FinanceProps) {
  const [selectedTab, setSelectedTab] = useState('overview')
  const [invoiceDialogOpen, setInvoiceDialogOpen] = useState(false)
  const [paymentDialogOpen, setPaymentDialogOpen] = useState(false)
  const [invoicePaymentDialogOpen, setInvoicePaymentDialogOpen] = useState(false)
  const [selectedInvoiceForPayment, setSelectedInvoiceForPayment] = useState<Invoice | null>(null)
  const [expenseDialogOpen, setExpenseDialogOpen] = useState(false)
  const [budgetDialogOpen, setBudgetDialogOpen] = useState(false)
  const [journalDialogOpen, setJournalDialogOpen] = useState(false)
  const [reconciliationDialogOpen, setReconciliationDialogOpen] = useState(false)
  const [arAgingDialogOpen, setArAgingDialogOpen] = useState(false)
  const [cashFlowDialogOpen, setCashFlowDialogOpen] = useState(false)
  const [departmentalPLDialogOpen, setDepartmentalPLDialogOpen] = useState(false)
  const [budgetVarianceDialogOpen, setBudgetVarianceDialogOpen] = useState(false)
  const [bulkApprovalDialogOpen, setBulkApprovalDialogOpen] = useState(false)
  const [reportsDialogOpen, setReportsDialogOpen] = useState(false)
  const [apAgingDialogOpen, setApAgingDialogOpen] = useState(false)
  const [taxSummaryDialogOpen, setTaxSummaryDialogOpen] = useState(false)
  const [pettyCashDialogOpen, setPettyCashDialogOpen] = useState(false)
  const [costCenterDialogOpen, setCostCenterDialogOpen] = useState(false)
  const [profitCenterDialogOpen, setProfitCenterDialogOpen] = useState(false)
  const [costCenterReportDialogOpen, setCostCenterReportDialogOpen] = useState(false)
  const [profitCenterReportDialogOpen, setProfitCenterReportDialogOpen] = useState(false)
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | undefined>()
  const [selectedPayment, setSelectedPayment] = useState<Payment | undefined>()
  const [selectedExpense, setSelectedExpense] = useState<Expense | undefined>()
  const [selectedBudget, setSelectedBudget] = useState<Budget | undefined>()
  const [selectedJournal, setSelectedJournal] = useState<JournalEntry | undefined>()
  const [selectedReconciliation, setSelectedReconciliation] = useState<BankReconciliation | undefined>()
  const [selectedCostCenter, setSelectedCostCenter] = useState<CostCenter | undefined>()
  const [selectedProfitCenter, setSelectedProfitCenter] = useState<ProfitCenter | undefined>()

  const calculateMonthMetrics = () => {
    const now = new Date()
    const currentMonth = now.getMonth()
    const currentYear = now.getFullYear()
    
    const lastMonth = currentMonth === 0 ? 11 : currentMonth - 1
    const lastMonthYear = currentMonth === 0 ? currentYear - 1 : currentYear
    
    const isCurrentMonth = (date: number) => {
      const d = new Date(date)
      return d.getMonth() === currentMonth && d.getFullYear() === currentYear
    }
    
    const isLastMonth = (date: number) => {
      const d = new Date(date)
      return d.getMonth() === lastMonth && d.getFullYear() === lastMonthYear
    }
    
    const currentMonthRevenue = invoices.filter(inv => isCurrentMonth(inv.invoiceDate)).reduce((sum, inv) => sum + inv.total, 0)
    const lastMonthRevenue = invoices.filter(inv => isLastMonth(inv.invoiceDate)).reduce((sum, inv) => sum + inv.total, 0)
    
    const currentMonthExpenses = expenses.filter(exp => isCurrentMonth(exp.expenseDate)).reduce((sum, exp) => sum + exp.amount, 0)
    const lastMonthExpenses = expenses.filter(exp => isLastMonth(exp.expenseDate)).reduce((sum, exp) => sum + exp.amount, 0)
    
    const currentMonthPayments = payments.filter(p => isCurrentMonth(p.processedAt)).reduce((sum, p) => sum + p.amount, 0)
    const lastMonthPayments = payments.filter(p => isLastMonth(p.processedAt)).reduce((sum, p) => sum + p.amount, 0)
    
    const currentMonthNetIncome = currentMonthRevenue - currentMonthExpenses
    const lastMonthNetIncome = lastMonthRevenue - lastMonthExpenses
    
    return {
      currentMonthRevenue,
      lastMonthRevenue,
      currentMonthExpenses,
      lastMonthExpenses,
      currentMonthPayments,
      lastMonthPayments,
      currentMonthNetIncome,
      lastMonthNetIncome
    }
  }
  
  const monthMetrics = calculateMonthMetrics()

  const totalRevenue = invoices.reduce((sum, inv) => sum + inv.total, 0)
  const totalReceivables = invoices.reduce((sum, inv) => {
    const amountPaid = inv.items?.reduce((s, item) => s + (item.total || 0), 0) || 0
    return sum + Math.max(0, inv.total - amountPaid)
  }, 0)
  const totalPayables = expenses.filter(e => !e.approvedBy).reduce((sum, e) => sum + e.amount, 0)
  const totalExpenses = expenses.reduce((sum, exp) => sum + exp.amount, 0)
  const netIncome = totalRevenue - totalExpenses

  const overdueInvoices = invoices.filter(inv => 
    inv.status !== 'posted' && inv.status !== 'approved' && inv.dueDate && inv.dueDate < Date.now()
  ).length

  const paidInvoices = invoices.filter(inv => inv.status === 'posted' || inv.status === 'approved').length
  const pendingInvoices = invoices.filter(inv => inv.status === 'pending-validation' || inv.status === 'validated').length

  const getInvoiceStatusBadge = (status: Invoice['status']) => {
    const variants = {
      'pending-validation': 'secondary',
      'validated': 'default',
      'matched': 'default',
      'mismatch': 'destructive',
      'approved': 'default',
      'posted': 'default',
      'rejected': 'destructive'
    } as const
    
    const colors = {
      'pending-validation': 'text-muted-foreground',
      'validated': 'text-primary',
      'matched': 'text-success',
      'mismatch': 'text-destructive',
      'approved': 'text-success',
      'posted': 'text-success',
      'rejected': 'text-destructive'
    }
    
    return (
      <Badge variant={variants[status]} className={colors[status]}>
        {status.replace('-', ' ')}
      </Badge>
    )
  }

  const getPaymentStatusBadge = (status: Payment['status']) => {
    const variants = {
      'pending': 'secondary',
      'paid': 'default',
      'partially-paid': 'default',
      'refunded': 'secondary'
    } as const
    
    const colors = {
      'pending': 'text-muted-foreground',
      'paid': 'text-success',
      'partially-paid': 'text-accent',
      'refunded': 'text-muted-foreground'
    }
    
    return (
      <Badge variant={variants[status]} className={colors[status]}>
        {status.replace('-', ' ')}
      </Badge>
    )
  }

  const handleEditInvoice = (invoice: Invoice) => {
    setSelectedInvoice(invoice)
    setInvoiceDialogOpen(true)
  }

  const handleEditPayment = (payment: Payment) => {
    setSelectedPayment(payment)
    setPaymentDialogOpen(true)
  }

  const handleEditExpense = (expense: Expense) => {
    setSelectedExpense(expense)
    setExpenseDialogOpen(true)
  }

  const handleEditBudget = (budget: Budget) => {
    setSelectedBudget(budget)
    setBudgetDialogOpen(true)
  }

  const handleNewInvoice = () => {
    setSelectedInvoice(undefined)
    setInvoiceDialogOpen(true)
  }

  const handleNewPayment = () => {
    setSelectedPayment(undefined)
    setPaymentDialogOpen(true)
  }

  const handleNewExpense = () => {
    setSelectedExpense(undefined)
    setExpenseDialogOpen(true)
  }

  const handleNewBudget = () => {
    setSelectedBudget(undefined)
    setBudgetDialogOpen(true)
  }

  const handleNewJournal = () => {
    setSelectedJournal(undefined)
    setJournalDialogOpen(true)
  }

  const handleEditJournal = (entry: JournalEntry) => {
    setSelectedJournal(entry)
    setJournalDialogOpen(true)
  }

  const handleNewReconciliation = () => {
    setSelectedReconciliation(undefined)
    setReconciliationDialogOpen(true)
  }

  const handleEditReconciliation = (reconciliation: BankReconciliation) => {
    setSelectedReconciliation(reconciliation)
    setReconciliationDialogOpen(true)
  }

  const handleRecordInvoicePayment = (invoice: Invoice, event?: React.MouseEvent) => {
    if (event) {
      event.stopPropagation()
    }
    setSelectedInvoiceForPayment(invoice)
    setInvoicePaymentDialogOpen(true)
  }

  const handlePaymentRecorded = (payment: Payment, updatedInvoice: Invoice) => {
    setPayments((currentPayments) => [...currentPayments, payment])
    setInvoices((currentInvoices) =>
      currentInvoices.map((inv) =>
        inv.id === updatedInvoice.id ? updatedInvoice : inv
      )
    )
  }

  const handleBulkApprove = (invoiceIds: string[], notes?: string) => {
    const now = Date.now()
    
    setInvoices((currentInvoices) => 
      currentInvoices.map((invoice) => {
        if (invoiceIds.includes(invoice.id)) {
          return {
            ...invoice,
            status: 'approved' as const,
            approvedBy: currentUser.id,
            approvedAt: now,
            internalNotes: notes 
              ? `${invoice.internalNotes || ''}\n\nBulk Approval (${formatDate(now)}): ${notes}`.trim()
              : invoice.internalNotes,
            updatedAt: now
          }
        }
        return invoice
      })
    )
  }

  const exportReconciliationReport = (reconciliation: BankReconciliation) => {
    const reportLines: string[] = []
    
    reportLines.push('='.repeat(120))
    reportLines.push('BANK RECONCILIATION REPORT')
    reportLines.push('='.repeat(120))
    reportLines.push('')
    reportLines.push(`Reconciliation Number: ${reconciliation.reconciliationNumber}`)
    reportLines.push(`Bank Account: ${reconciliation.bankAccountName}`)
    reportLines.push(`Statement Date: ${formatDate(reconciliation.statementDate)}`)
    reportLines.push(`Generated: ${formatDate(Date.now())}`)
    reportLines.push('')
    reportLines.push('-'.repeat(120))
    reportLines.push('RECONCILIATION SUMMARY')
    reportLines.push('-'.repeat(120))
    reportLines.push('')
    reportLines.push(`Book Balance (GL):                ${formatCurrency(reconciliation.bookBalance).padStart(20)}`)
    reportLines.push(`Statement Balance (Bank):         ${formatCurrency(reconciliation.statementBalance).padStart(20)}`)
    reportLines.push(`Difference:                       ${formatCurrency(reconciliation.difference).padStart(20)} ${Math.abs(reconciliation.difference) < 0.01 ? '✓ RECONCILED' : '✗ DISCREPANCY'}`)
    reportLines.push('')
    reportLines.push(`Total Matched Transactions:       ${reconciliation.matchedTransactions.length.toString().padStart(20)}`)
    reportLines.push(`Unmatched Bank Transactions:      ${reconciliation.unmatchedBankTransactions.length.toString().padStart(20)}`)
    reportLines.push(`Unmatched Book Transactions:      ${reconciliation.unmatchedBookTransactions.length.toString().padStart(20)}`)
    reportLines.push('')
    
    reportLines.push('='.repeat(120))
    reportLines.push('MATCHED TRANSACTIONS')
    reportLines.push('='.repeat(120))
    reportLines.push('')
    
    if (reconciliation.matchedTransactions.length > 0) {
      reportLines.push('Bank Date   | Bank Description                           | GL Date     | GL Description                             | Amount         | Match Type')
      reportLines.push('-'.repeat(120))
      
      reconciliation.matchedTransactions.forEach(match => {
        const bankTxn = reconciliation.unmatchedBankTransactions.find(t => t.id === match.bankTransactionId) ||
                       { transactionDate: 0, description: 'N/A', credit: 0, debit: 0, reference: undefined }
        const glEntry = reconciliation.unmatchedBookTransactions.find(e => e.id === match.glEntryId) ||
                       { transactionDate: 0, description: 'N/A', credit: 0, debit: 0, sourceDocumentNumber: undefined }
        
        const amount = bankTxn.credit > 0 ? bankTxn.credit : bankTxn.debit
        const bankDate = formatDate(bankTxn.transactionDate).substring(0, 10)
        const glDate = formatDate(glEntry.transactionDate).substring(0, 10)
        const bankDesc = bankTxn.description.substring(0, 42).padEnd(42)
        const glDesc = glEntry.description.substring(0, 42).padEnd(42)
        const amtStr = formatCurrency(amount).padStart(14)
        const matchType = match.matchType.padEnd(10)
        
        reportLines.push(`${bankDate} | ${bankDesc} | ${glDate} | ${glDesc} | ${amtStr} | ${matchType}`)
      })
      
      reportLines.push('-'.repeat(120))
    } else {
      reportLines.push('No matched transactions')
    }
    
    reportLines.push('')
    reportLines.push('='.repeat(120))
    reportLines.push('UNMATCHED BANK TRANSACTIONS')
    reportLines.push('='.repeat(120))
    reportLines.push('')
    
    if (reconciliation.unmatchedBankTransactions.length > 0) {
      reportLines.push('Date       | Description                                                      | Reference           | Debit          | Credit')
      reportLines.push('-'.repeat(120))
      
      reconciliation.unmatchedBankTransactions.forEach(txn => {
        const date = formatDate(txn.transactionDate).substring(0, 10)
        const desc = txn.description.substring(0, 68).padEnd(68)
        const ref = (txn.reference || '').substring(0, 19).padEnd(19)
        const debit = txn.debit > 0 ? formatCurrency(txn.debit).padStart(14) : '-'.padStart(14)
        const credit = txn.credit > 0 ? formatCurrency(txn.credit).padStart(14) : '-'.padStart(14)
        
        reportLines.push(`${date} | ${desc} | ${ref} | ${debit} | ${credit}`)
      })
    } else {
      reportLines.push('No unmatched bank transactions')
    }
    
    reportLines.push('')
    reportLines.push('='.repeat(120))
    reportLines.push('UNMATCHED BOOK TRANSACTIONS')
    reportLines.push('='.repeat(120))
    reportLines.push('')
    
    if (reconciliation.unmatchedBookTransactions.length > 0) {
      reportLines.push('Date       | Description                                                      | Document No.        | Debit          | Credit')
      reportLines.push('-'.repeat(120))
      
      reconciliation.unmatchedBookTransactions.forEach(entry => {
        const date = formatDate(entry.transactionDate).substring(0, 10)
        const desc = entry.description.substring(0, 68).padEnd(68)
        const docNo = (entry.sourceDocumentNumber || '').substring(0, 19).padEnd(19)
        const debit = entry.debit > 0 ? formatCurrency(entry.debit).padStart(14) : '-'.padStart(14)
        const credit = entry.credit > 0 ? formatCurrency(entry.credit).padStart(14) : '-'.padStart(14)
        
        reportLines.push(`${date} | ${desc} | ${docNo} | ${debit} | ${credit}`)
      })
    } else {
      reportLines.push('No unmatched book transactions')
    }
    
    reportLines.push('')
    reportLines.push('='.repeat(120))
    reportLines.push(`Status: ${reconciliation.status.toUpperCase()}`)
    reportLines.push('='.repeat(120))
    
    const reportContent = reportLines.join('\n')
    const blob = new Blob([reportContent], { type: 'text/plain;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `Bank_Reconciliation_${reconciliation.reconciliationNumber}_${formatDate(reconciliation.statementDate).replace(/\//g, '-')}.txt`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
    
    toast.success('Reconciliation report exported successfully')
  }

  const handlePostJournal = (entry: JournalEntry) => {
    if (!setJournalEntries) return
    
    if (entry.status === 'posted') {
      toast.warning('Entry is already posted')
      return
    }

    if (!entry.isBalanced) {
      toast.error('Cannot post unbalanced entry')
      return
    }

    const updatedEntry: JournalEntry = {
      ...entry,
      status: 'posted',
      postingDate: Date.now(),
      postedBy: currentUser.id,
      postedAt: Date.now()
    }

    setJournalEntries((prev) => prev.map((e) => (e.id === entry.id ? updatedEntry : e)))
    toast.success(`Journal ${entry.journalNumber} posted successfully`)
  }

  const handleReverseJournal = (entry: JournalEntry) => {
    if (!setJournalEntries) return
    
    if (entry.status !== 'posted') {
      toast.error('Only posted entries can be reversed')
      return
    }

    const reversedLines = entry.lines.map((line) => ({
      ...line,
      debit: line.credit,
      credit: line.debit
    }))

    const reversal: JournalEntry = {
      ...entry,
      id: `je-rev-${Date.now()}`,
      journalNumber: `REV-${entry.journalNumber}`,
      status: 'posted',
      transactionDate: Date.now(),
      postingDate: Date.now(),
      description: `Reversal of ${entry.journalNumber}: ${entry.description}`,
      lines: reversedLines,
      isReversal: true,
      reversalOfEntryId: entry.id,
      reversalReason: 'Manual reversal',
      createdBy: currentUser.id,
      createdAt: Date.now(),
      postedBy: currentUser.id,
      postedAt: Date.now(),
      auditTrail: []
    }

    setJournalEntries((prev) => [
      ...prev.map((e) => (e.id === entry.id ? { ...e, reversedByEntryId: reversal.id } : e)),
      reversal
    ])
    
    toast.success(`Reversal entry ${reversal.journalNumber} created`)
  }

  const calculateReports = () => {
    const assetAccounts = chartOfAccounts.filter(a => a.accountType === 'asset')
    const liabilityAccounts = chartOfAccounts.filter(a => a.accountType === 'liability')
    const equityAccounts = chartOfAccounts.filter(a => a.accountType === 'equity')
    const revenueAccounts = chartOfAccounts.filter(a => a.accountType === 'revenue')
    const expenseAccounts = chartOfAccounts.filter(a => a.accountType === 'expense')

    const totalAssets = assetAccounts.reduce((sum, acc) => sum + acc.currentBalance, 0)
    const totalLiabilities = liabilityAccounts.reduce((sum, acc) => sum + acc.currentBalance, 0)
    const totalEquity = equityAccounts.reduce((sum, acc) => sum + acc.currentBalance, 0)
    const totalRevenue = revenueAccounts.reduce((sum, acc) => sum + acc.currentBalance, 0)
    const totalExpenses = expenseAccounts.reduce((sum, acc) => sum + acc.currentBalance, 0)

    return {
      totalAssets,
      totalLiabilities,
      totalEquity,
      totalRevenue,
      totalExpenses,
      netIncome: totalRevenue - totalExpenses
    }
  }

  const reports = calculateReports()

  const calculateInvoiceAnalytics = () => {
    const approvedInvoices = invoices.filter(inv => inv.status === 'approved' || inv.status === 'posted')
    
    const monthlyData: Record<string, { month: string; total: number; count: number }> = {}
    const supplierData: Record<string, { supplier: string; total: number; count: number }> = {}
    
    approvedInvoices.forEach(invoice => {
      const date = new Date(invoice.invoiceDate)
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
      const monthLabel = date.toLocaleDateString('en-US', { year: 'numeric', month: 'short' })
      
      if (!monthlyData[monthKey]) {
        monthlyData[monthKey] = { month: monthLabel, total: 0, count: 0 }
      }
      monthlyData[monthKey].total += invoice.total
      monthlyData[monthKey].count += 1
      
      const supplierName = invoice.supplierName || 'Unknown'
      if (!supplierData[supplierName]) {
        supplierData[supplierName] = { supplier: supplierName, total: 0, count: 0 }
      }
      supplierData[supplierName].total += invoice.total
      supplierData[supplierName].count += 1
    })
    
    const sortedMonthlyEntries = Object.entries(monthlyData)
      .sort(([a], [b]) => a.localeCompare(b))
      .slice(-12)
    
    const trendData = sortedMonthlyEntries.map(([_, data], index) => {
      const previousTotal = index > 0 ? sortedMonthlyEntries[index - 1][1].total : 0
      const change = previousTotal > 0 
        ? ((data.total - previousTotal) / previousTotal) * 100 
        : data.total > 0 ? 100 : 0
      
      return {
        ...data,
        change: change,
        changeLabel: change >= 0 ? `+${change.toFixed(1)}%` : `${change.toFixed(1)}%`
      }
    })
    
    const topSuppliers = Object.values(supplierData)
      .sort((a, b) => b.total - a.total)
      .slice(0, 10)
    
    return { trendData, topSuppliers, approvedInvoices }
  }

  const { trendData, topSuppliers, approvedInvoices } = calculateInvoiceAnalytics()

  const CHART_COLORS = [
    'oklch(0.35 0.18 140)',
    'oklch(0.45 0.15 120)',
    'oklch(0.30 0.20 150)',
    'oklch(0.55 0.12 130)',
    'oklch(0.40 0.16 125)',
    'oklch(0.50 0.14 135)',
    'oklch(0.60 0.10 110)',
    'oklch(0.25 0.22 145)',
    'oklch(0.65 0.08 115)',
    'oklch(0.35 0.19 155)'
  ]

  return (
    <div className="space-y-4 md:space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl md:text-3xl lg:text-4xl font-semibold">Finance & Accounting</h1>
          <p className="text-muted-foreground mt-1 text-sm md:text-base">Manage invoices, payments, expenses, and budgets</p>
        </div>
        <div className="flex gap-2 flex-wrap">
          <Button variant="outline" size="sm" onClick={() => setReportsDialogOpen(true)} className="flex-1 sm:flex-none">
            <Download size={18} className="mr-2" />
            <span className="hidden sm:inline">Export Reports</span>
            <span className="sm:hidden">Export</span>
          </Button>
          <Button variant="outline" size="sm" onClick={() => setSelectedTab('reports')} className="flex-1 sm:flex-none">
            <ChartBar size={18} className="mr-2" />
            Analytics
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-6">
        <Card className="p-4 md:p-6 border-l-4 border-l-success">
          <div className="flex items-center justify-between mb-2 md:mb-4">
            <h3 className="text-xs md:text-sm font-medium text-muted-foreground">Total Revenue</h3>
            <TrendUp size={16} className="text-success md:w-5 md:h-5" />
          </div>
          <div className="space-y-1 md:space-y-2">
            <div className="flex items-baseline gap-2 md:gap-3 flex-wrap">
              <p className="text-xl md:text-2xl lg:text-3xl font-semibold">{formatCurrency(totalRevenue)}</p>
              <PercentageChangeIndicator 
                current={monthMetrics.currentMonthRevenue}
                previous={monthMetrics.lastMonthRevenue}
                size="sm"
              />
            </div>
            <p className="text-xs md:text-sm text-muted-foreground">
              From {invoices.length} invoices
            </p>
            <p className="text-xs text-muted-foreground">
              This month: {formatCurrency(monthMetrics.currentMonthRevenue)}
            </p>
          </div>
        </Card>

        <Card className="p-4 md:p-6 border-l-4 border-l-accent">
          <div className="flex items-center justify-between mb-2 md:mb-4">
            <h3 className="text-xs md:text-sm font-medium text-muted-foreground">Accounts Receivable</h3>
            <Receipt size={16} className="text-accent md:w-5 md:h-5" />
          </div>
          <div className="space-y-1 md:space-y-2">
            <p className="text-xl md:text-2xl lg:text-3xl font-semibold">{formatCurrency(totalReceivables)}</p>
            <p className="text-xs md:text-sm text-muted-foreground">
              {overdueInvoices} overdue invoices
            </p>
          </div>
        </Card>

        <Card className="p-4 md:p-6 border-l-4 border-l-destructive">
          <div className="flex items-center justify-between mb-2 md:mb-4">
            <h3 className="text-xs md:text-sm font-medium text-muted-foreground">Total Expenses</h3>
            <Wallet size={16} className="text-destructive md:w-5 md:h-5" />
          </div>
          <div className="space-y-1 md:space-y-2">
            <div className="flex items-baseline gap-2 md:gap-3 flex-wrap">
              <p className="text-xl md:text-2xl lg:text-3xl font-semibold">{formatCurrency(totalExpenses)}</p>
              <PercentageChangeIndicator 
                current={monthMetrics.currentMonthExpenses}
                previous={monthMetrics.lastMonthExpenses}
                size="sm"
                invertColors={true}
              />
            </div>
            <p className="text-xs md:text-sm text-muted-foreground">
              {expenses.length} expense records
            </p>
            <p className="text-xs text-muted-foreground">
              This month: {formatCurrency(monthMetrics.currentMonthExpenses)}
            </p>
          </div>
        </Card>

        <Card className="p-4 md:p-6 border-l-4 border-l-primary">
          <div className="flex items-center justify-between mb-2 md:mb-4">
            <h3 className="text-xs md:text-sm font-medium text-muted-foreground">Net Income</h3>
            <ChartLine size={16} className="text-primary md:w-5 md:h-5" />
          </div>
          <div className="space-y-1 md:space-y-2">
            <div className="flex items-baseline gap-2 md:gap-3 flex-wrap">
              <p className={`text-xl md:text-2xl lg:text-3xl font-semibold ${netIncome >= 0 ? 'text-success' : 'text-destructive'}`}>
                {formatCurrency(netIncome)}
              </p>
              <PercentageChangeIndicator 
                current={monthMetrics.currentMonthNetIncome}
                previous={monthMetrics.lastMonthNetIncome}
                size="sm"
              />
            </div>
            <p className="text-xs md:text-sm text-muted-foreground">
              Revenue - Expenses
            </p>
            <p className="text-xs text-muted-foreground">
              This month: {formatCurrency(monthMetrics.currentMonthNetIncome)}
            </p>
          </div>
        </Card>
      </div>

      <Tabs value={selectedTab} onValueChange={setSelectedTab}>
        <TabsList className="flex-wrap h-auto">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="invoices">Invoices</TabsTrigger>
          <TabsTrigger value="payments">Payments</TabsTrigger>
          <TabsTrigger value="expenses">Expenses</TabsTrigger>
          <TabsTrigger value="budgets">Budgets</TabsTrigger>
          <TabsTrigger value="cost-centers">Cost Centers</TabsTrigger>
          <TabsTrigger value="profit-centers">Profit Centers</TabsTrigger>
          <TabsTrigger value="petty-cash">Petty Cash</TabsTrigger>
          <TabsTrigger value="accounts">Chart of Accounts</TabsTrigger>
          <TabsTrigger value="journals">Journal Entries</TabsTrigger>
          <TabsTrigger value="reconciliation">Bank Reconciliation</TabsTrigger>
          <TabsTrigger value="reports">Financial Reports</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">Invoice Summary</h3>
                <InvoiceIcon size={20} className="text-muted-foreground" />
              </div>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Paid Invoices</span>
                  <span className="text-lg font-semibold text-success">{paidInvoices}</span>
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Pending Invoices</span>
                  <span className="text-lg font-semibold text-accent">{pendingInvoices}</span>
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Overdue Invoices</span>
                  <span className="text-lg font-semibold text-destructive">{overdueInvoices}</span>
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">This Month Revenue</span>
                  <div className="flex items-center gap-2">
                    <span className="text-lg font-semibold text-primary">
                      {formatCurrency(monthMetrics.currentMonthRevenue)}
                    </span>
                    <PercentageChangeIndicator 
                      current={monthMetrics.currentMonthRevenue}
                      previous={monthMetrics.lastMonthRevenue}
                      size="sm"
                    />
                  </div>
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">Payment Summary</h3>
                <CreditCard size={20} className="text-muted-foreground" />
              </div>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Total Collected</span>
                  <div className="flex items-center gap-2">
                    <span className="text-lg font-semibold text-success">
                      {formatCurrency(payments.reduce((sum, p) => sum + p.amount, 0))}
                    </span>
                    <PercentageChangeIndicator 
                      current={monthMetrics.currentMonthPayments}
                      previous={monthMetrics.lastMonthPayments}
                      size="sm"
                    />
                  </div>
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Reconciled</span>
                  <span className="text-lg font-semibold">
                    {payments.filter(p => p.reconciled).length} / {payments.length}
                  </span>
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Pending Reconciliation</span>
                  <span className="text-lg font-semibold text-accent">
                    {payments.filter(p => !p.reconciled).length}
                  </span>
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">This Month Collected</span>
                  <span className="text-lg font-semibold text-primary">
                    {formatCurrency(monthMetrics.currentMonthPayments)}
                  </span>
                </div>
              </div>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="p-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-lg font-semibold">Approved Invoice Trends</h3>
                  <p className="text-sm text-muted-foreground mt-1">Monthly approved invoice amounts (Last 12 months)</p>
                </div>
                <TrendUp size={20} className="text-primary" />
              </div>
              {trendData.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={trendData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.85 0.05 140)" />
                    <XAxis 
                      dataKey="month" 
                      stroke="oklch(0.45 0.08 140)"
                      fontSize={12}
                    />
                    <YAxis 
                      stroke="oklch(0.45 0.08 140)"
                      fontSize={12}
                      tickFormatter={(value) => `${(value / 1000).toFixed(0)}k`}
                    />
                    <Tooltip 
                      formatter={(value: number, name: string) => {
                        if (name === 'total') return [formatCurrency(value), 'Amount']
                        return [value, name]
                      }}
                      labelFormatter={(label, payload) => {
                        if (payload && payload.length > 0) {
                          const data = payload[0].payload
                          return `${label} (${data.changeLabel} MoM)`
                        }
                        return label
                      }}
                      contentStyle={{
                        backgroundColor: 'oklch(0.99 0.003 140)',
                        border: '1px solid oklch(0.85 0.05 140)',
                        borderRadius: '8px'
                      }}
                    />
                    <Legend />
                    <Line 
                      type="monotone" 
                      dataKey="total" 
                      stroke="oklch(0.35 0.18 140)" 
                      strokeWidth={3}
                      name="Approved Amount"
                      dot={{ fill: 'oklch(0.35 0.18 140)', r: 4 }}
                      activeDot={{ r: 6 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                  <div className="text-center">
                    <ChartLine size={48} className="mx-auto mb-2 opacity-50" />
                    <p>No approved invoices yet</p>
                  </div>
                </div>
              )}
            </Card>

            <Card className="p-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-lg font-semibold">Top Suppliers by Approved Amount</h3>
                  <p className="text-sm text-muted-foreground mt-1">Top 10 suppliers by total approved invoices</p>
                </div>
                <Package size={20} className="text-primary" />
              </div>
              {topSuppliers.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={topSuppliers} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.85 0.05 140)" />
                    <XAxis 
                      type="number"
                      stroke="oklch(0.45 0.08 140)"
                      fontSize={12}
                      tickFormatter={(value) => `${(value / 1000).toFixed(0)}k`}
                    />
                    <YAxis 
                      type="category"
                      dataKey="supplier" 
                      stroke="oklch(0.45 0.08 140)"
                      fontSize={11}
                      width={120}
                    />
                    <Tooltip 
                      formatter={(value: number, name: string) => {
                        if (name === 'total') return [formatCurrency(value), 'Total Amount']
                        return [value, 'Invoice Count']
                      }}
                      contentStyle={{
                        backgroundColor: 'oklch(0.99 0.003 140)',
                        border: '1px solid oklch(0.85 0.05 140)',
                        borderRadius: '8px'
                      }}
                    />
                    <Legend />
                    <Bar 
                      dataKey="total" 
                      fill="oklch(0.35 0.18 140)" 
                      name="Approved Amount"
                      radius={[0, 4, 4, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                  <div className="text-center">
                    <Package size={48} className="mx-auto mb-2 opacity-50" />
                    <p>No supplier data available</p>
                  </div>
                </div>
              )}
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="p-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-lg font-semibold">Top 5 Suppliers - Details</h3>
                  <p className="text-sm text-muted-foreground mt-1">Breakdown of approved invoices</p>
                </div>
                <ChartBar size={20} className="text-primary" />
              </div>
              {topSuppliers.length > 0 ? (
                <div className="space-y-4">
                  {topSuppliers.slice(0, 5).map((supplier, index) => {
                    const percentage = (supplier.total / topSuppliers.reduce((sum, s) => sum + s.total, 0)) * 100
                    return (
                      <div key={supplier.supplier} className="space-y-2">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <div 
                              className="w-3 h-3 rounded-full" 
                              style={{ backgroundColor: CHART_COLORS[index % CHART_COLORS.length] }}
                            />
                            <span className="font-medium text-sm">{supplier.supplier}</span>
                          </div>
                          <div className="text-right">
                            <p className="font-semibold">{formatCurrency(supplier.total)}</p>
                            <p className="text-xs text-muted-foreground">{supplier.count} invoices</p>
                          </div>
                        </div>
                        <div className="w-full bg-muted rounded-full h-2">
                          <div 
                            className="h-2 rounded-full transition-all"
                            style={{ 
                              width: `${percentage}%`,
                              backgroundColor: CHART_COLORS[index % CHART_COLORS.length]
                            }}
                          />
                        </div>
                        <p className="text-xs text-muted-foreground text-right">{percentage.toFixed(1)}% of total</p>
                      </div>
                    )
                  })}
                </div>
              ) : (
                <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                  <div className="text-center">
                    <ChartBar size={48} className="mx-auto mb-2 opacity-50" />
                    <p>No supplier data available</p>
                  </div>
                </div>
              )}
            </Card>

            <Card className="p-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-lg font-semibold">Approved Invoice Statistics</h3>
                  <p className="text-sm text-muted-foreground mt-1">Summary of approved invoices</p>
                </div>
                <Receipt size={20} className="text-primary" />
              </div>
              <div className="space-y-6">
                <div className="p-4 bg-primary/5 rounded-lg border border-primary/20">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-muted-foreground">Total Approved Invoices</span>
                    <Check size={20} className="text-success" />
                  </div>
                  <p className="text-3xl font-semibold text-primary">{approvedInvoices.length}</p>
                </div>
                
                <div className="p-4 bg-success/5 rounded-lg border border-success/20">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-muted-foreground">Total Approved Amount</span>
                    <CurrencyDollar size={20} className="text-success" />
                  </div>
                  <p className="text-3xl font-semibold text-success">
                    {formatCurrency(approvedInvoices.reduce((sum, inv) => sum + inv.total, 0))}
                  </p>
                </div>
                
                <div className="p-4 bg-accent/5 rounded-lg border border-accent/20">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-muted-foreground">Average Invoice Amount</span>
                    <TrendUp size={20} className="text-accent" />
                  </div>
                  <p className="text-3xl font-semibold text-accent">
                    {formatCurrency(approvedInvoices.length > 0 
                      ? approvedInvoices.reduce((sum, inv) => sum + inv.total, 0) / approvedInvoices.length 
                      : 0
                    )}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="p-3 bg-muted/50 rounded-lg">
                    <p className="text-xs text-muted-foreground mb-1">Unique Suppliers</p>
                    <p className="text-xl font-semibold">{topSuppliers.length}</p>
                  </div>
                  <div className="p-3 bg-muted/50 rounded-lg">
                    <p className="text-xs text-muted-foreground mb-1">This Month</p>
                    <p className="text-xl font-semibold">
                      {approvedInvoices.filter(inv => {
                        const invDate = new Date(inv.invoiceDate)
                        const now = new Date()
                        return invDate.getMonth() === now.getMonth() && invDate.getFullYear() === now.getFullYear()
                      }).length}
                    </p>
                  </div>
                </div>
              </div>
            </Card>
          </div>

          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Recent Transactions</h3>
              <Button size="sm" variant="outline">View All</Button>
            </div>
            <div className="space-y-3">
              {payments.slice(0, 5).map((payment) => (
                <div key={payment.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                  <div className="flex-1">
                    <p className="font-medium">{payment.paymentNumber}</p>
                    <p className="text-sm text-muted-foreground">{formatDate(payment.processedAt)}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-success">{formatCurrency(payment.amount)}</p>
                    <p className="text-xs text-muted-foreground capitalize">{payment.method}</p>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="invoices" className="space-y-4 md:space-y-6">
          <Card className="p-4 md:p-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 md:gap-0 mb-4 md:mb-6">
              <h3 className="text-base md:text-lg font-semibold">All Invoices</h3>
              <div className="flex gap-2 flex-wrap">
                {pendingInvoices > 0 && (
                  <Button 
                    variant="default" 
                    onClick={() => setBulkApprovalDialogOpen(true)}
                    className="bg-primary flex-1 sm:flex-none"
                    size="sm"
                  >
                    <ListChecks size={16} className="mr-2 md:w-[18px] md:h-[18px]" />
                    <span className="hidden sm:inline">Bulk Approve ({pendingInvoices})</span>
                    <span className="sm:hidden">Approve ({pendingInvoices})</span>
                  </Button>
                )}
                <Button onClick={handleNewInvoice} size="sm" className="flex-1 sm:flex-none">
                  <Plus size={16} className="mr-2 md:w-[18px] md:h-[18px]" />
                  New Invoice
                </Button>
              </div>
            </div>

            <div className="space-y-3">
              {invoices.length === 0 ? (
                <div className="text-center py-8 md:py-12">
                  <FileText size={40} className="mx-auto text-muted-foreground mb-3 md:mb-4 md:w-12 md:h-12" />
                  <p className="text-muted-foreground text-sm md:text-base">No invoices yet</p>
                  <Button onClick={handleNewInvoice} className="mt-3 md:mt-4" size="sm">
                    <Plus size={16} className="mr-2 md:w-[18px] md:h-[18px]" />
                    Create First Invoice
                  </Button>
                </div>
              ) : (
                invoices.map((invoice) => (
                  <div
                    key={invoice.id}
                    className="p-3 md:p-4 bg-muted/50 rounded-lg hover:bg-muted transition-colors"
                  >
                    <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-3">
                      <div className="flex-1 cursor-pointer" onClick={() => handleEditInvoice(invoice)}>
                        <div className="flex items-center gap-2 md:gap-3 mb-2 flex-wrap">
                          <p className="font-semibold text-sm md:text-base">{invoice.invoiceNumber}</p>
                          {getInvoiceStatusBadge(invoice.status)}
                          {invoice.balance > 0 && invoice.balance < invoice.total && (
                            <Badge variant="outline" className="text-accent text-xs">
                              Partially Paid
                            </Badge>
                          )}
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 md:gap-4 text-xs md:text-sm">
                          <div className="mobile-card-field">
                            <span className="text-muted-foreground font-medium">Supplier:</span>
                            <span className="mobile-card-value text-right">{invoice.supplierName || 'N/A'}</span>
                          </div>
                          <div className="mobile-card-field">
                            <span className="text-muted-foreground font-medium">Invoice Date:</span>
                            <span className="mobile-card-value text-right">{formatDate(invoice.invoiceDate)}</span>
                          </div>
                          <div className="mobile-card-field">
                            <span className="text-muted-foreground font-medium">Due Date:</span>
                            <span className="mobile-card-value text-right">{invoice.dueDate ? formatDate(invoice.dueDate) : 'N/A'}</span>
                          </div>
                          <div className="mobile-card-field">
                            <span className="text-muted-foreground font-medium">Items:</span>
                            <span className="mobile-card-value text-right">{invoice.items.length}</span>
                          </div>
                          {invoice.amountPaid > 0 && (
                            <>
                              <div className="mobile-card-field">
                                <span className="text-muted-foreground font-medium">Amount Paid:</span>
                                <span className="mobile-card-value text-right text-success">{formatCurrency(invoice.amountPaid)}</span>
                              </div>
                              <div className="mobile-card-field">
                                <span className="text-muted-foreground font-medium">Balance:</span>
                                <span className="mobile-card-value text-right text-destructive font-semibold">{formatCurrency(invoice.balance)}</span>
                              </div>
                            </>
                          )}
                        </div>
                      </div>
                      <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-start gap-2 sm:gap-2 sm:text-right border-t sm:border-t-0 pt-3 sm:pt-0">
                        <div>
                          <p className="text-lg md:text-xl lg:text-2xl font-semibold">{formatCurrency(invoice.total)}</p>
                          <p className="text-xs text-muted-foreground mt-0 sm:mt-1">
                            {invoice.status === 'paid' ? 'Paid' : invoice.status === 'posted' ? 'Posted' : 'Pending'}
                          </p>
                        </div>
                        {invoice.balance > 0 && invoice.status !== 'cancelled' && invoice.status !== 'rejected' && (
                          <Button
                            size="sm"
                            variant="default"
                            onClick={(e) => handleRecordInvoicePayment(invoice, e)}
                            className="whitespace-nowrap w-full sm:w-auto"
                          >
                            <Wallet size={14} className="mr-2 md:w-4 md:h-4" />
                            <span className="hidden sm:inline">Record Payment</span>
                            <span className="sm:hidden">Pay</span>
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="payments" className="space-y-4 md:space-y-6">
          <Card className="p-4 md:p-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4 md:mb-6">
              <h3 className="text-base md:text-lg font-semibold">All Payments</h3>
              <Button onClick={handleNewPayment} size="sm">
                <Plus size={16} className="mr-2 md:w-[18px] md:h-[18px]" />
                Record Payment
              </Button>
            </div>

            <div className="space-y-3">
              {payments.length === 0 ? (
                <div className="text-center py-8 md:py-12">
                  <CreditCard size={40} className="mx-auto text-muted-foreground mb-3 md:mb-4 md:w-12 md:h-12" />
                  <p className="text-muted-foreground text-sm md:text-base">No payments recorded yet</p>
                  <Button onClick={handleNewPayment} className="mt-3 md:mt-4" size="sm">
                    <Plus size={16} className="mr-2 md:w-[18px] md:h-[18px]" />
                    Record First Payment
                  </Button>
                </div>
              ) : (
                payments.map((payment) => (
                  <div
                    key={payment.id}
                    className="p-3 md:p-4 bg-muted/50 rounded-lg cursor-pointer hover:bg-muted transition-colors"
                    onClick={() => handleEditPayment(payment)}
                  >
                    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 md:gap-3 mb-2 flex-wrap">
                          <p className="font-semibold text-sm md:text-base">{payment.paymentNumber}</p>
                          {getPaymentStatusBadge(payment.status)}
                          {payment.reconciled && (
                            <Badge variant="default" className="text-success text-xs">Reconciled</Badge>
                          )}
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 md:gap-4 text-xs md:text-sm">
                          <div className="mobile-card-field">
                            <span className="text-muted-foreground font-medium">Method:</span>
                            <span className="mobile-card-value capitalize text-right">{payment.method.replace('-', ' ')}</span>
                          </div>
                          <div className="mobile-card-field">
                            <span className="text-muted-foreground font-medium">Processed:</span>
                            <span className="mobile-card-value text-right">{formatDate(payment.processedAt)}</span>
                          </div>
                          {payment.reference && (
                            <div className="mobile-card-field">
                              <span className="text-muted-foreground font-medium">Reference:</span>
                              <span className="mobile-card-value font-mono text-xs text-right truncate">{payment.reference}</span>
                            </div>
                          )}
                          <div className="mobile-card-field">
                            <span className="text-muted-foreground font-medium">Processed By:</span>
                            <span className="mobile-card-value text-right">{payment.processedBy}</span>
                          </div>
                        </div>
                      </div>
                      <div className="text-left sm:text-right border-t sm:border-t-0 pt-3 sm:pt-0">
                        <p className="text-lg md:text-xl lg:text-2xl font-semibold text-success">{formatCurrency(payment.amount)}</p>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="expenses" className="space-y-4 md:space-y-6">
          <Card className="p-4 md:p-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4 md:mb-6">
              <h3 className="text-base md:text-lg font-semibold">All Expenses</h3>
              <Button onClick={handleNewExpense} size="sm">
                <Plus size={16} className="mr-2 md:w-[18px] md:h-[18px]" />
                New Expense
              </Button>
            </div>

            <div className="space-y-3">
              {expenses.length === 0 ? (
                <div className="text-center py-8 md:py-12">
                  <Wallet size={40} className="mx-auto text-muted-foreground mb-3 md:mb-4 md:w-12 md:h-12" />
                  <p className="text-muted-foreground text-sm md:text-base">No expenses recorded yet</p>
                  <Button onClick={handleNewExpense} className="mt-3 md:mt-4" size="sm">
                    <Plus size={16} className="mr-2 md:w-[18px] md:h-[18px]" />
                    Add First Expense
                  </Button>
                </div>
              ) : (
                expenses.map((expense) => (
                  <div
                    key={expense.id}
                    className="p-3 md:p-4 bg-muted/50 rounded-lg cursor-pointer hover:bg-muted transition-colors"
                    onClick={() => handleEditExpense(expense)}
                  >
                    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 md:gap-3 mb-2 flex-wrap">
                          <p className="font-semibold text-sm md:text-base">{expense.expenseNumber}</p>
                          {expense.approvedBy ? (
                            <Badge variant="default" className="text-success text-xs">Approved</Badge>
                          ) : (
                            <Badge variant="secondary" className="text-xs">Pending</Badge>
                          )}
                        </div>
                        <p className="text-xs md:text-sm mb-2">{expense.description}</p>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 md:gap-4 text-xs md:text-sm">
                          <div className="mobile-card-field">
                            <span className="text-muted-foreground font-medium">Category:</span>
                            <span className="mobile-card-value capitalize text-right">{expense.category.replace('-', ' ')}</span>
                          </div>
                          <div className="mobile-card-field">
                            <span className="text-muted-foreground font-medium">Department:</span>
                            <span className="mobile-card-value capitalize text-right">{expense.department}</span>
                          </div>
                          <div className="mobile-card-field">
                            <span className="text-muted-foreground font-medium">Date:</span>
                            <span className="mobile-card-value text-right">{formatDate(expense.date)}</span>
                          </div>
                          <div className="mobile-card-field">
                            <span className="text-muted-foreground font-medium">Method:</span>
                            <span className="mobile-card-value capitalize text-right">{expense.paymentMethod ? expense.paymentMethod.replace('-', ' ') : 'N/A'}</span>
                          </div>
                        </div>
                      </div>
                      <div className="text-left sm:text-right border-t sm:border-t-0 pt-3 sm:pt-0">
                        <p className="text-lg md:text-xl lg:text-2xl font-semibold text-destructive">{formatCurrency(expense.amount)}</p>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="budgets" className="space-y-6">
          <Card className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold">Department Budgets</h3>
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => setBudgetVarianceDialogOpen(true)}>
                  <TrendUp size={18} className="mr-2" />
                  Variance Analysis
                </Button>
                <Button onClick={handleNewBudget}>
                  <Plus size={18} className="mr-2" />
                  New Budget
                </Button>
              </div>
            </div>

            <div className="space-y-3">
              {budgets.length === 0 ? (
                <div className="text-center py-12">
                  <ChartBar size={48} className="mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">No budgets created yet</p>
                  <Button onClick={handleNewBudget} className="mt-4">
                    <Plus size={18} className="mr-2" />
                    Create First Budget
                  </Button>
                </div>
              ) : (
                budgets.map((budget) => {
                  const percentUsed = (budget.totalActual / budget.totalBudget) * 100
                  const isOverBudget = budget.totalActual > budget.totalBudget
                  
                  return (
                    <div
                      key={budget.id}
                      className="p-4 bg-muted/50 rounded-lg cursor-pointer hover:bg-muted transition-colors"
                      onClick={() => handleEditBudget(budget)}
                    >
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <p className="font-semibold">{budget.budgetName}</p>
                            <Badge variant={budget.status === 'active' ? 'default' : 'secondary'} className={budget.status === 'active' ? 'text-success' : ''}>
                              {budget.status}
                            </Badge>
                          </div>
                          <div className="grid grid-cols-2 gap-4 text-sm">
                            <div>
                              <span className="text-muted-foreground">Department:</span>
                              <span className="ml-2 capitalize">{budget.department}</span>
                            </div>
                            <div>
                              <span className="text-muted-foreground">Period:</span>
                              <span className="ml-2 capitalize">{budget.period}</span>
                            </div>
                            <div>
                              <span className="text-muted-foreground">Start:</span>
                              <span className="ml-2">{formatDate(budget.startDate)}</span>
                            </div>
                            <div>
                              <span className="text-muted-foreground">End:</span>
                              <span className="ml-2">{formatDate(budget.endDate)}</span>
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-sm text-muted-foreground mb-1">Budgeted</p>
                          <p className="text-lg font-semibold">{formatCurrency(budget.totalBudget)}</p>
                          <p className="text-sm text-muted-foreground mt-2">Actual</p>
                          <p className={`text-lg font-semibold ${isOverBudget ? 'text-destructive' : 'text-success'}`}>
                            {formatCurrency(budget.totalActual)}
                          </p>
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-muted-foreground">Budget Usage</span>
                          <span className={isOverBudget ? 'text-destructive font-medium' : 'text-muted-foreground'}>
                            {percentUsed.toFixed(1)}%
                          </span>
                        </div>
                        <div className="w-full bg-secondary rounded-full h-2">
                          <div
                            className={`h-2 rounded-full transition-all ${
                              isOverBudget ? 'bg-destructive' : 'bg-success'
                            }`}
                            style={{ width: `${Math.min(percentUsed, 100)}%` }}
                          />
                        </div>
                        {budget.variance !== 0 && (
                          <p className={`text-sm ${budget.variance > 0 ? 'text-destructive' : 'text-success'}`}>
                            {budget.variance > 0 ? 'Over' : 'Under'} budget by {formatCurrency(Math.abs(budget.variance))}
                          </p>
                        )}
                      </div>
                    </div>
                  )
                })
              )}
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="cost-centers" className="space-y-6">
          <Card className="p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-lg font-semibold">Cost Center Management</h3>
                <p className="text-sm text-muted-foreground mt-1">Track and analyze costs by department and business unit</p>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => setCostCenterReportDialogOpen(true)}>
                  <ChartBar size={18} className="mr-2" />
                  View Reports
                </Button>
                <Button onClick={() => {
                  setSelectedCostCenter(undefined)
                  setCostCenterDialogOpen(true)
                }}>
                  <Plus size={18} className="mr-2" />
                  New Cost Center
                </Button>
              </div>
            </div>

            <div className="space-y-3">
              {costCenters.length === 0 ? (
                <div className="text-center py-12">
                  <Buildings size={48} className="mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">No cost centers created yet</p>
                  <p className="text-sm text-muted-foreground mt-2">Cost centers help you track expenses and analyze performance by department</p>
                  <Button onClick={() => {
                    setSelectedCostCenter(undefined)
                    setCostCenterDialogOpen(true)
                  }} className="mt-4">
                    <Plus size={18} className="mr-2" />
                    Create First Cost Center
                  </Button>
                </div>
              ) : (
                costCenters.map((cc) => {
                  const variance = (cc.budget || 0) - (cc.actualCost || 0)
                  const variancePercentage = cc.budget ? (variance / cc.budget) * 100 : 0
                  
                  return (
                    <div
                      key={cc.id}
                      className="p-4 bg-muted/50 rounded-lg cursor-pointer hover:bg-muted transition-colors"
                      onClick={() => {
                        setSelectedCostCenter(cc)
                        setCostCenterDialogOpen(true)
                      }}
                    >
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <p className="font-semibold">{cc.code} - {cc.name}</p>
                            <Badge variant={cc.isActive ? 'default' : 'secondary'}>
                              {cc.isActive ? 'Active' : 'Inactive'}
                            </Badge>
                            <Badge variant="outline" className="capitalize">{cc.type.replace('-', ' ')}</Badge>
                          </div>
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                            <div>
                              <span className="text-muted-foreground">Department:</span>
                              <span className="ml-2 capitalize">{cc.department?.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ') || 'N/A'}</span>
                            </div>
                            <div>
                              <span className="text-muted-foreground">Manager:</span>
                              <span className="ml-2">{cc.managerName || 'Not Assigned'}</span>
                            </div>
                            {cc.allocationBasis && (
                              <div>
                                <span className="text-muted-foreground">Allocation:</span>
                                <span className="ml-2 capitalize">{cc.allocationBasis.replace('-', ' ')}</span>
                              </div>
                            )}
                            {cc.allocationPercentage && (
                              <div>
                                <span className="text-muted-foreground">Allocation %:</span>
                                <span className="ml-2">{cc.allocationPercentage}%</span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                      
                      {cc.budget && (
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4 pt-4 border-t">
                          <div>
                            <p className="text-xs text-muted-foreground mb-1">Budgeted</p>
                            <p className="text-lg font-semibold">{formatCurrency(cc.budget)}</p>
                          </div>
                          <div>
                            <p className="text-xs text-muted-foreground mb-1">Actual</p>
                            <p className="text-lg font-semibold text-destructive">{formatCurrency(cc.actualCost || 0)}</p>
                          </div>
                          <div>
                            <p className="text-xs text-muted-foreground mb-1">Variance</p>
                            <div className="flex items-center gap-2">
                              <p className={`text-lg font-semibold ${variance >= 0 ? 'text-success' : 'text-destructive'}`}>
                                {formatCurrency(Math.abs(variance))}
                              </p>
                              <Badge className={variance >= 0 ? 'bg-success text-success-foreground' : 'bg-destructive text-destructive-foreground'}>
                                {variance >= 0 ? 'Under' : 'Over'} {Math.abs(variancePercentage).toFixed(1)}%
                              </Badge>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  )
                })
              )}
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="profit-centers" className="space-y-6">
          <Card className="p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-lg font-semibold">Profit Center Management</h3>
                <p className="text-sm text-muted-foreground mt-1">Monitor revenue, costs, and profitability by business unit</p>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => setProfitCenterReportDialogOpen(true)}>
                  <ChartBar size={18} className="mr-2" />
                  View Reports
                </Button>
                <Button onClick={() => {
                  setSelectedProfitCenter(undefined)
                  setProfitCenterDialogOpen(true)
                }}>
                  <Plus size={18} className="mr-2" />
                  New Profit Center
                </Button>
              </div>
            </div>

            <div className="space-y-3">
              {profitCenters.length === 0 ? (
                <div className="text-center py-12">
                  <TrendUp size={48} className="mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">No profit centers created yet</p>
                  <p className="text-sm text-muted-foreground mt-2">Profit centers help you analyze revenue and profitability across your business units</p>
                  <Button onClick={() => {
                    setSelectedProfitCenter(undefined)
                    setProfitCenterDialogOpen(true)
                  }} className="mt-4">
                    <Plus size={18} className="mr-2" />
                    Create First Profit Center
                  </Button>
                </div>
              ) : (
                profitCenters.map((pc) => {
                  const revenue = pc.actualRevenue || pc.targetRevenue || 0
                  const costs = pc.actualCost || 0
                  const profit = revenue - costs
                  const margin = revenue > 0 ? (profit / revenue) * 100 : 0
                  
                  return (
                    <div
                      key={pc.id}
                      className="p-4 bg-muted/50 rounded-lg cursor-pointer hover:bg-muted transition-colors"
                      onClick={() => {
                        setSelectedProfitCenter(pc)
                        setProfitCenterDialogOpen(true)
                      }}
                    >
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <p className="font-semibold">{pc.code} - {pc.name}</p>
                            <Badge variant={pc.status === 'active' ? 'default' : pc.status === 'inactive' ? 'secondary' : 'destructive'}>
                              {pc.status}
                            </Badge>
                          </div>
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                            <div>
                              <span className="text-muted-foreground">Department:</span>
                              <span className="ml-2 capitalize">{pc.department?.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ') || 'N/A'}</span>
                            </div>
                            <div>
                              <span className="text-muted-foreground">Manager:</span>
                              <span className="ml-2">{pc.managerName || 'Not Assigned'}</span>
                            </div>
                            <div>
                              <span className="text-muted-foreground">Cost Centers:</span>
                              <span className="ml-2">{pc.costCenterIds.length}</span>
                            </div>
                            {pc.targetMargin && (
                              <div>
                                <span className="text-muted-foreground">Target Margin:</span>
                                <span className="ml-2">{pc.targetMargin}%</span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-4 pt-4 border-t">
                        <div>
                          <p className="text-xs text-muted-foreground mb-1">Revenue</p>
                          <p className="text-lg font-semibold text-success">{formatCurrency(revenue)}</p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground mb-1">Costs</p>
                          <p className="text-lg font-semibold text-destructive">{formatCurrency(costs)}</p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground mb-1">Profit</p>
                          <p className={`text-lg font-semibold ${profit >= 0 ? 'text-success' : 'text-destructive'}`}>
                            {formatCurrency(profit)}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground mb-1">Margin</p>
                          <div className="flex items-center gap-2">
                            <p className={`text-lg font-semibold ${margin >= (pc.targetMargin || 0) ? 'text-success' : 'text-destructive'}`}>
                              {margin.toFixed(1)}%
                            </p>
                            {pc.targetMargin && (
                              <>
                                {margin >= pc.targetMargin ? (
                                  <ArrowUp size={16} className="text-success" />
                                ) : (
                                  <ArrowDown size={16} className="text-destructive" />
                                )}
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  )
                })
              )}
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="petty-cash" className="space-y-6">
          <Card className="p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-lg font-semibold">Petty Cash Management</h3>
                <p className="text-sm text-muted-foreground mt-1">Manage small cash transactions and fund replenishments</p>
              </div>
              <Button onClick={() => setPettyCashDialogOpen(true)}>
                <Wallet size={18} className="mr-2" />
                Manage Petty Cash
              </Button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card className="p-4 bg-primary/5">
                <p className="text-sm text-muted-foreground mb-1">Available Balance</p>
                <p className="text-3xl font-bold text-primary">{formatCurrency(5000)}</p>
              </Card>
              <Card className="p-4 bg-destructive/5">
                <p className="text-sm text-muted-foreground mb-1">Total Disbursed</p>
                <p className="text-3xl font-bold text-destructive">{formatCurrency(0)}</p>
              </Card>
              <Card className="p-4 bg-success/5">
                <p className="text-sm text-muted-foreground mb-1">Total Replenished</p>
                <p className="text-3xl font-bold text-success">{formatCurrency(0)}</p>
              </Card>
            </div>
            <div className="mt-6 p-4 bg-muted/50 rounded-lg">
              <p className="text-sm text-muted-foreground mb-2">Recent Transactions</p>
              <p className="text-center text-muted-foreground py-8">No petty cash transactions yet. Click "Manage Petty Cash" to get started.</p>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="accounts" className="space-y-6">
          <Card className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold">Chart of Accounts</h3>
            </div>

            <div className="space-y-4">
              {['asset', 'liability', 'equity', 'revenue', 'expense'].map((type) => {
                const typeAccounts = accounts.filter(acc => acc.accountType === type)
                const totalBalance = typeAccounts.reduce((sum, acc) => sum + acc.balance, 0)
                
                return (
                  <div key={type} className="space-y-2">
                    <div className="flex items-center justify-between p-3 bg-primary/10 rounded-lg">
                      <h4 className="font-semibold capitalize">{type} Accounts</h4>
                      <span className="font-semibold">{formatCurrency(totalBalance)}</span>
                    </div>
                    {typeAccounts.map((account) => (
                      <div key={account.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg ml-4">
                        <div>
                          <p className="font-medium">{account.accountName}</p>
                          <p className="text-sm text-muted-foreground">#{account.accountNumber}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold">{formatCurrency(account.balance)}</p>
                          {!account.isActive && (
                            <Badge variant="secondary" className="text-xs">Inactive</Badge>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )
              })}
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="journals" className="space-y-4 md:space-y-6">
          <Card className="p-4 md:p-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4 md:mb-6">
              <h3 className="text-base md:text-lg font-semibold">Journal Entries</h3>
              <Button onClick={handleNewJournal} size="sm">
                <Plus size={16} className="mr-2 md:w-[18px] md:h-[18px]" />
                New Journal Entry
              </Button>
            </div>

            <div className="space-y-3">
              {!journalEntries || journalEntries.length === 0 ? (
                <div className="text-center py-8 md:py-12">
                  <Notebook size={40} className="mx-auto text-muted-foreground mb-3 md:mb-4 md:w-12 md:h-12" />
                  <p className="text-muted-foreground text-sm md:text-base">No journal entries yet</p>
                  <Button onClick={handleNewJournal} className="mt-3 md:mt-4" size="sm">
                    <Plus size={16} className="mr-2 md:w-[18px] md:h-[18px]" />
                    Create First Journal Entry
                  </Button>
                </div>
              ) : (
                journalEntries.map((entry) => (
                  <div
                    key={entry.id}
                    className="p-3 md:p-4 bg-muted/50 rounded-lg"
                  >
                    <div className="flex flex-col gap-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 md:gap-3 mb-2 flex-wrap">
                          <p className="font-semibold text-sm md:text-base">{entry.journalNumber}</p>
                          <Badge variant={entry.status === 'posted' ? 'default' : entry.status === 'approved' ? 'default' : 'secondary'} className={`text-xs ${entry.status === 'posted' ? 'text-success' : entry.status === 'approved' ? 'text-accent' : ''}`}>
                            {entry.status.replace('-', ' ')}
                          </Badge>
                          {entry.isReversal && (
                            <Badge variant="destructive" className="text-xs">Reversal</Badge>
                          )}
                          {!entry.isBalanced && (
                            <Badge variant="destructive" className="text-xs">Unbalanced</Badge>
                          )}
                        </div>
                        <p className="text-xs md:text-sm mb-3">{entry.description}</p>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 md:gap-4 text-xs md:text-sm">
                          <div className="mobile-card-field">
                            <span className="text-muted-foreground font-medium">Type:</span>
                            <span className="mobile-card-value capitalize text-right">{entry.journalType.replace('-', ' ')}</span>
                          </div>
                          <div className="mobile-card-field">
                            <span className="text-muted-foreground font-medium">Date:</span>
                            <span className="mobile-card-value text-right">{formatDate(entry.transactionDate)}</span>
                          </div>
                          <div className="mobile-card-field">
                            <span className="text-muted-foreground font-medium">Period:</span>
                            <span className="mobile-card-value text-right">{entry.fiscalPeriod}</span>
                          </div>
                          <div className="mobile-card-field">
                            <span className="text-muted-foreground font-medium">Lines:</span>
                            <span className="mobile-card-value text-right">{entry.lines.length}</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex flex-wrap gap-2 md:gap-4 items-start justify-between border-t pt-3">
                        <div className="grid grid-cols-2 gap-4 flex-1">
                          <div>
                            <p className="text-xs text-muted-foreground">Total Debit</p>
                            <p className="text-base md:text-lg font-semibold text-success">{formatCurrency(entry.totalDebit)}</p>
                          </div>
                          <div>
                            <p className="text-xs text-muted-foreground">Total Credit</p>
                            <p className="text-base md:text-lg font-semibold text-destructive">{formatCurrency(entry.totalCredit)}</p>
                          </div>
                        </div>
                        <div className="flex gap-2 w-full sm:w-auto">
                          <Button size="sm" variant="outline" onClick={() => handleEditJournal(entry)} className="flex-1 sm:flex-none">
                            Edit
                          </Button>
                          {entry.status !== 'posted' && entry.isBalanced && (
                            <Button size="sm" variant="default" onClick={() => handlePostJournal(entry)} className="flex-1 sm:flex-none">
                              <FilePlus size={14} className="mr-2 md:w-4 md:h-4" />
                              Post
                            </Button>
                          )}
                          {entry.status === 'posted' && !entry.reversedByEntryId && (
                            <Button size="sm" variant="destructive" onClick={() => handleReverseJournal(entry)} className="flex-1 sm:flex-none">
                              Reverse
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="reports" className="space-y-6">
          <div className="mb-6 flex flex-wrap gap-2">
            <Button variant="outline" size="sm" onClick={() => setArAgingDialogOpen(true)}>
              <FileText size={16} className="mr-2" />
              AR Aging
            </Button>
            <Button variant="outline" size="sm" onClick={() => setApAgingDialogOpen(true)}>
              <FileText size={16} className="mr-2" />
              AP Aging
            </Button>
            <Button variant="outline" size="sm" onClick={() => setCashFlowDialogOpen(true)}>
              <FileText size={16} className="mr-2" />
              Cash Flow
            </Button>
            <Button variant="outline" size="sm" onClick={() => setTaxSummaryDialogOpen(true)}>
              <FileText size={16} className="mr-2" />
              Tax Summary
            </Button>
            <Button variant="outline" size="sm" onClick={() => setDepartmentalPLDialogOpen(true)}>
              <FileText size={16} className="mr-2" />
              Departmental P&L
            </Button>
            <Button variant="outline" size="sm">
              <Download size={16} className="mr-2" />
              Export All Reports
            </Button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <ChartBar size={20} />
                Balance Sheet
              </h3>
              <div className="space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center justify-between p-3 bg-primary/10 rounded-lg">
                    <h4 className="font-semibold">ASSETS</h4>
                    <span className="font-semibold">{formatCurrency(reports.totalAssets)}</span>
                  </div>
                  {chartOfAccounts.filter(a => a.accountType === 'asset').map((account) => (
                    <div key={account.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg ml-4">
                      <div>
                        <p className="font-medium">{account.accountName}</p>
                        <p className="text-sm text-muted-foreground">#{account.accountCode}</p>
                      </div>
                      <p className="font-semibold">{formatCurrency(account.currentBalance)}</p>
                    </div>
                  ))}
                </div>

                <Separator />

                <div className="space-y-2">
                  <div className="flex items-center justify-between p-3 bg-primary/10 rounded-lg">
                    <h4 className="font-semibold">LIABILITIES</h4>
                    <span className="font-semibold">{formatCurrency(reports.totalLiabilities)}</span>
                  </div>
                  {chartOfAccounts.filter(a => a.accountType === 'liability').map((account) => (
                    <div key={account.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg ml-4">
                      <div>
                        <p className="font-medium">{account.accountName}</p>
                        <p className="text-sm text-muted-foreground">#{account.accountCode}</p>
                      </div>
                      <p className="font-semibold">{formatCurrency(account.currentBalance)}</p>
                    </div>
                  ))}
                </div>

                <Separator />

                <div className="space-y-2">
                  <div className="flex items-center justify-between p-3 bg-primary/10 rounded-lg">
                    <h4 className="font-semibold">EQUITY</h4>
                    <span className="font-semibold">{formatCurrency(reports.totalEquity)}</span>
                  </div>
                  {chartOfAccounts.filter(a => a.accountType === 'equity').map((account) => (
                    <div key={account.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg ml-4">
                      <div>
                        <p className="font-medium">{account.accountName}</p>
                        <p className="text-sm text-muted-foreground">#{account.accountCode}</p>
                      </div>
                      <p className="font-semibold">{formatCurrency(account.currentBalance)}</p>
                    </div>
                  ))}
                </div>

                <Separator className="my-4" />

                <div className="flex items-center justify-between p-4 bg-accent/20 rounded-lg">
                  <span className="font-bold">Total Liabilities + Equity</span>
                  <span className="font-bold text-lg">{formatCurrency(reports.totalLiabilities + reports.totalEquity)}</span>
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <TrendUp size={20} />
                Profit & Loss Statement
              </h3>
              <div className="space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center justify-between p-3 bg-success/10 rounded-lg">
                    <h4 className="font-semibold">REVENUE</h4>
                    <span className="font-semibold text-success">{formatCurrency(reports.totalRevenue)}</span>
                  </div>
                  {chartOfAccounts.filter(a => a.accountType === 'revenue').map((account) => (
                    <div key={account.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg ml-4">
                      <div>
                        <p className="font-medium">{account.accountName}</p>
                        <p className="text-sm text-muted-foreground">#{account.accountCode}</p>
                      </div>
                      <p className="font-semibold text-success">{formatCurrency(account.currentBalance)}</p>
                    </div>
                  ))}
                </div>

                <Separator />

                <div className="space-y-2">
                  <div className="flex items-center justify-between p-3 bg-destructive/10 rounded-lg">
                    <h4 className="font-semibold">EXPENSES</h4>
                    <span className="font-semibold text-destructive">{formatCurrency(reports.totalExpenses)}</span>
                  </div>
                  {chartOfAccounts.filter(a => a.accountType === 'expense').map((account) => (
                    <div key={account.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg ml-4">
                      <div>
                        <p className="font-medium">{account.accountName}</p>
                        <p className="text-sm text-muted-foreground">#{account.accountCode}</p>
                      </div>
                      <p className="font-semibold text-destructive">{formatCurrency(account.currentBalance)}</p>
                    </div>
                  ))}
                </div>

                <Separator className="my-4" />

                <div className={`flex items-center justify-between p-4 rounded-lg ${reports.netIncome >= 0 ? 'bg-success/20' : 'bg-destructive/20'}`}>
                  <span className="font-bold">Net Income (Loss)</span>
                  <span className={`font-bold text-lg ${reports.netIncome >= 0 ? 'text-success' : 'text-destructive'}`}>
                    {formatCurrency(reports.netIncome)}
                  </span>
                </div>

                <div className="mt-6 p-4 bg-muted rounded-lg">
                  <h4 className="font-semibold mb-3">Key Metrics</h4>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-muted-foreground">Revenue</p>
                      <p className="text-lg font-semibold text-success">{formatCurrency(reports.totalRevenue)}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Expenses</p>
                      <p className="text-lg font-semibold text-destructive">{formatCurrency(reports.totalExpenses)}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Profit Margin</p>
                      <p className="text-lg font-semibold">
                        {reports.totalRevenue > 0 ? ((reports.netIncome / reports.totalRevenue) * 100).toFixed(2) : '0.00'}%
                      </p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Expense Ratio</p>
                      <p className="text-lg font-semibold">
                        {reports.totalRevenue > 0 ? ((reports.totalExpenses / reports.totalRevenue) * 100).toFixed(2) : '0.00'}%
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          </div>

          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <ListChecks size={20} />
              Trial Balance
            </h3>
            <div className="space-y-2">
              <div className="grid grid-cols-4 gap-4 p-3 bg-primary/10 rounded-lg font-semibold text-sm">
                <div>Account Code</div>
                <div>Account Name</div>
                <div className="text-right">Debit</div>
                <div className="text-right">Credit</div>
              </div>
              {chartOfAccounts.map((account) => {
                const debitBalance = account.normalBalance === 'debit' ? account.currentBalance : 0
                const creditBalance = account.normalBalance === 'credit' ? account.currentBalance : 0
                
                return (
                  <div key={account.id} className="grid grid-cols-4 gap-4 p-3 bg-muted/50 rounded-lg text-sm">
                    <div className="font-mono">{account.accountCode}</div>
                    <div>{account.accountName}</div>
                    <div className="text-right font-semibold">
                      {debitBalance > 0 ? formatCurrency(debitBalance) : '-'}
                    </div>
                    <div className="text-right font-semibold">
                      {creditBalance > 0 ? formatCurrency(creditBalance) : '-'}
                    </div>
                  </div>
                )
              })}
              <Separator className="my-2" />
              <div className="grid grid-cols-4 gap-4 p-4 bg-accent/20 rounded-lg font-bold">
                <div className="col-span-2">TOTAL</div>
                <div className="text-right">{formatCurrency(chartOfAccounts.filter(a => a.normalBalance === 'debit').reduce((sum, a) => sum + a.currentBalance, 0))}</div>
                <div className="text-right">{formatCurrency(chartOfAccounts.filter(a => a.normalBalance === 'credit').reduce((sum, a) => sum + a.currentBalance, 0))}</div>
              </div>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="reconciliation" className="space-y-4 md:space-y-6">
          <Card className="p-4 md:p-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4 md:mb-6">
              <h3 className="text-base md:text-lg font-semibold">Bank Reconciliations</h3>
              <Button onClick={handleNewReconciliation} size="sm">
                <Plus size={16} className="mr-2 md:w-[18px] md:h-[18px]" />
                <span className="hidden sm:inline">New Reconciliation</span>
                <span className="sm:hidden">New</span>
              </Button>
            </div>

            <div className="space-y-3">
              {bankReconciliations.length === 0 ? (
                <div className="text-center py-8 md:py-12">
                  <Bank size={40} className="mx-auto text-muted-foreground mb-3 md:mb-4 md:w-12 md:h-12" />
                  <p className="text-muted-foreground text-sm md:text-base">No bank reconciliations yet</p>
                  <Button onClick={handleNewReconciliation} className="mt-3 md:mt-4" size="sm">
                    <Plus size={16} className="mr-2 md:w-[18px] md:h-[18px]" />
                    Start First Reconciliation
                  </Button>
                </div>
              ) : (
                bankReconciliations.map((reconciliation) => (
                  <div
                    key={reconciliation.id}
                    className="p-3 md:p-4 bg-muted/50 rounded-lg hover:bg-muted transition-colors"
                  >
                    <div className="flex flex-col gap-3">
                      <div 
                        className="flex-1 cursor-pointer"
                        onClick={() => handleEditReconciliation(reconciliation)}
                      >
                        <div className="flex items-center gap-2 md:gap-3 mb-2 flex-wrap">
                          <p className="font-semibold text-sm md:text-base">{reconciliation.reconciliationNumber}</p>
                          <Badge variant={
                            reconciliation.status === 'completed' ? 'default' :
                            reconciliation.status === 'in-progress' ? 'secondary' : 'destructive'
                          } className="text-xs">
                            {reconciliation.status.replace('-', ' ')}
                          </Badge>
                          {Math.abs(reconciliation.difference) < 0.01 && (
                            <Badge variant="default" className="text-success text-xs">
                              <Check size={12} className="mr-1" />
                              Balanced
                            </Badge>
                          )}
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 md:gap-4 text-xs md:text-sm">
                          <div className="mobile-card-field">
                            <span className="text-muted-foreground font-medium">Bank Account:</span>
                            <span className="mobile-card-value text-right">{reconciliation.bankAccountName}</span>
                          </div>
                          <div className="mobile-card-field">
                            <span className="text-muted-foreground font-medium">Statement Date:</span>
                            <span className="mobile-card-value text-right">{formatDate(reconciliation.statementDate)}</span>
                          </div>
                          <div className="mobile-card-field">
                            <span className="text-muted-foreground font-medium">Book Balance:</span>
                            <span className="mobile-card-value text-right">{formatCurrency(reconciliation.bookBalance)}</span>
                          </div>
                          <div className="mobile-card-field">
                            <span className="text-muted-foreground font-medium">Statement Balance:</span>
                            <span className="mobile-card-value text-right">{formatCurrency(reconciliation.statementBalance)}</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex flex-col sm:flex-row items-stretch sm:items-end justify-between gap-3 border-t pt-3">
                        <div className="flex-1">
                          <p className="text-xs text-muted-foreground mb-1">Difference</p>
                          <p className={`text-lg md:text-xl lg:text-2xl font-semibold ${Math.abs(reconciliation.difference) < 0.01 ? 'text-success' : 'text-destructive'}`}>
                            {formatCurrency(reconciliation.difference)}
                          </p>
                          <p className="text-xs text-muted-foreground mt-1">
                            {reconciliation.matchedTransactions.length} matched • {reconciliation.unmatchedBankTransactions.length} unmatched
                          </p>
                        </div>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={(e) => {
                            e.stopPropagation()
                            exportReconciliationReport(reconciliation)
                          }}
                          className="w-full sm:w-auto"
                        >
                          <Download size={14} className="mr-2 md:w-4 md:h-4" />
                          Export Report
                        </Button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </Card>
        </TabsContent>
      </Tabs>

      <InvoiceDialog
        open={invoiceDialogOpen}
        onOpenChange={setInvoiceDialogOpen}
      />

      <PaymentDialog
        open={paymentDialogOpen}
        onOpenChange={setPaymentDialogOpen}
        payment={selectedPayment}
        invoices={invoices}
        onSave={(payment) => {
          if (selectedPayment) {
            setPayments((prev) => prev.map((p) => (p.id === payment.id ? payment : p)))
          } else {
            setPayments((prev) => [...prev, payment])
          }
        }}
      />

      <ExpenseDialog
        open={expenseDialogOpen}
        onOpenChange={setExpenseDialogOpen}
        expense={selectedExpense}
        onSave={(expense) => {
          if (selectedExpense) {
            setExpenses((prev) => prev.map((e) => (e.id === expense.id ? expense : e)))
          } else {
            setExpenses((prev) => [...prev, expense])
          }
        }}
      />

      <BudgetDialog
        open={budgetDialogOpen}
        onOpenChange={setBudgetDialogOpen}
        budget={selectedBudget}
        onSave={(budget) => {
          if (selectedBudget) {
            setBudgets((prev) => prev.map((b) => (b.id === budget.id ? budget : b)))
          } else {
            setBudgets((prev) => [...prev, budget])
          }
        }}
      />

      {setJournalEntries && (
        <JournalEntryDialog
          open={journalDialogOpen}
          onOpenChange={setJournalDialogOpen}
          journalEntry={selectedJournal}
          chartOfAccounts={chartOfAccounts}
          currentUser={currentUser}
          onSave={(entry) => {
            if (selectedJournal) {
              setJournalEntries((prev) => prev.map((e) => (e.id === entry.id ? entry : e)))
              toast.success('Journal entry updated')
            } else {
              setJournalEntries((prev) => [...prev, entry])
              toast.success('Journal entry created')
            }
            setJournalDialogOpen(false)
          }}
        />
      )}

      {setBankReconciliations && (
        <BankReconciliationDialog
          open={reconciliationDialogOpen}
          onOpenChange={setReconciliationDialogOpen}
          reconciliation={selectedReconciliation}
          bankAccounts={chartOfAccounts}
          journalEntries={journalEntries}
          glEntries={glEntries}
          currentUser={currentUser}
          onSave={(reconciliation) => {
            if (selectedReconciliation) {
              setBankReconciliations((prev) => prev.map((r) => (r.id === reconciliation.id ? reconciliation : r)))
            } else {
              setBankReconciliations((prev) => [...prev, reconciliation])
            }
            setReconciliationDialogOpen(false)
          }}
        />
      )}

      <ARAgingDialog
        open={arAgingDialogOpen}
        onOpenChange={setArAgingDialogOpen}
        invoices={guestInvoices}
      />

      <CashFlowStatementDialog
        open={cashFlowDialogOpen}
        onOpenChange={setCashFlowDialogOpen}
        journalEntries={journalEntries}
        payments={payments}
        expenses={expenses}
        glEntries={glEntries}
        chartOfAccounts={chartOfAccounts}
      />

      <DepartmentalPLDialog
        open={departmentalPLDialogOpen}
        onOpenChange={setDepartmentalPLDialogOpen}
        guestInvoices={guestInvoices}
        expenses={expenses}
        journalEntries={journalEntries}
        glEntries={glEntries}
      />

      <BudgetVarianceDialog
        open={budgetVarianceDialogOpen}
        onOpenChange={setBudgetVarianceDialogOpen}
        budgets={budgets}
        expenses={expenses}
        invoices={invoices}
      />

      <BulkApprovalDialog
        open={bulkApprovalDialogOpen}
        onOpenChange={setBulkApprovalDialogOpen}
        invoices={invoices}
        onApprove={handleBulkApprove}
        currentUser={currentUser}
      />

      <FinanceReportsDialog
        open={reportsDialogOpen}
        onOpenChange={setReportsDialogOpen}
        invoices={invoices}
        payments={payments}
        expenses={expenses}
        journalEntries={journalEntries}
        budgets={budgets}
      />

      {selectedInvoiceForPayment && (
        <InvoicePaymentDialog
          open={invoicePaymentDialogOpen}
          onOpenChange={setInvoicePaymentDialogOpen}
          invoice={selectedInvoiceForPayment}
          onPaymentRecorded={handlePaymentRecorded}
          currentUser={currentUser.username}
        />
      )}

      <APAgingDialog
        open={apAgingDialogOpen}
        onOpenChange={setApAgingDialogOpen}
        invoices={invoices}
      />

      <TaxSummaryDialog
        open={taxSummaryDialogOpen}
        onOpenChange={setTaxSummaryDialogOpen}
        invoices={invoices}
        expenses={expenses}
        payments={payments}
        guestInvoices={guestInvoices}
      />

      <PettyCashDialog
        open={pettyCashDialogOpen}
        onOpenChange={setPettyCashDialogOpen}
        transactions={[]}
        onSave={(txn) => {
          toast.success('Petty cash transaction recorded')
        }}
        currentUser={currentUser}
        floatAmount={5000}
        onReplenish={(amount, notes) => {
          toast.success(`Petty cash fund replenished with ${formatCurrency(amount)}`)
        }}
      />

      <CostCenterDialog
        open={costCenterDialogOpen}
        onOpenChange={setCostCenterDialogOpen}
        costCenter={selectedCostCenter}
        costCenters={costCenters}
        onSave={(costCenter) => {
          if (setCostCenters) {
            if (selectedCostCenter) {
              setCostCenters((prev) => prev.map((cc) => (cc.id === costCenter.id ? costCenter : cc)))
            } else {
              setCostCenters((prev) => [...prev, costCenter])
            }
          }
          setCostCenterDialogOpen(false)
        }}
      />

      <ProfitCenterDialog
        open={profitCenterDialogOpen}
        onOpenChange={setProfitCenterDialogOpen}
        profitCenter={selectedProfitCenter}
        costCenters={costCenters}
        onSave={(profitCenter) => {
          if (setProfitCenters) {
            if (selectedProfitCenter) {
              setProfitCenters((prev) => prev.map((pc) => (pc.id === profitCenter.id ? profitCenter : pc)))
            } else {
              setProfitCenters((prev) => [...prev, profitCenter])
            }
          }
          setProfitCenterDialogOpen(false)
        }}
      />

      <CostCenterReportDialog
        open={costCenterReportDialogOpen}
        onOpenChange={setCostCenterReportDialogOpen}
        costCenters={costCenters}
        expenses={expenses}
        budgets={budgets}
        costCenterReports={costCenterReports}
      />

      <ProfitCenterReportDialog
        open={profitCenterReportDialogOpen}
        onOpenChange={setProfitCenterReportDialogOpen}
        profitCenters={profitCenters}
        costCenters={costCenters}
        expenses={expenses}
        profitCenterReports={profitCenterReports}
      />
    </div>
  )
}
