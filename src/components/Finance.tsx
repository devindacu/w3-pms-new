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
  Check
} from '@phosphor-icons/react'
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
  type BankReconciliation
} from '@/lib/types'
import { formatCurrency, formatDate } from '@/lib/helpers'
import { InvoiceDialog } from './InvoiceDialog'
import { PaymentDialog } from './PaymentDialog'
import { ExpenseDialog } from './ExpenseDialog'
import { BudgetDialog } from './BudgetDialog'
import { JournalEntryDialog } from './JournalEntryDialog'
import { BankReconciliationDialog } from './BankReconciliationDialog'
import { ARAgingDialog } from './ARAgingDialog'
import { CashFlowStatementDialog } from './CashFlowStatementDialog'
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
  currentUser
}: FinanceProps) {
  const [selectedTab, setSelectedTab] = useState('overview')
  const [invoiceDialogOpen, setInvoiceDialogOpen] = useState(false)
  const [paymentDialogOpen, setPaymentDialogOpen] = useState(false)
  const [expenseDialogOpen, setExpenseDialogOpen] = useState(false)
  const [budgetDialogOpen, setBudgetDialogOpen] = useState(false)
  const [journalDialogOpen, setJournalDialogOpen] = useState(false)
  const [reconciliationDialogOpen, setReconciliationDialogOpen] = useState(false)
  const [arAgingDialogOpen, setArAgingDialogOpen] = useState(false)
  const [cashFlowDialogOpen, setCashFlowDialogOpen] = useState(false)
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | undefined>()
  const [selectedPayment, setSelectedPayment] = useState<Payment | undefined>()
  const [selectedExpense, setSelectedExpense] = useState<Expense | undefined>()
  const [selectedBudget, setSelectedBudget] = useState<Budget | undefined>()
  const [selectedJournal, setSelectedJournal] = useState<JournalEntry | undefined>()
  const [selectedReconciliation, setSelectedReconciliation] = useState<BankReconciliation | undefined>()

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

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-semibold">Finance & Accounting</h1>
          <p className="text-muted-foreground mt-1">Manage invoices, payments, expenses, and budgets</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <Download size={18} className="mr-2" />
            Export Reports
          </Button>
          <Button variant="outline" size="sm">
            <ChartBar size={18} className="mr-2" />
            Analytics
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="p-6 border-l-4 border-l-success">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-muted-foreground">Total Revenue</h3>
            <TrendUp size={20} className="text-success" />
          </div>
          <div className="space-y-2">
            <p className="text-3xl font-semibold">{formatCurrency(totalRevenue)}</p>
            <p className="text-sm text-success flex items-center gap-1">
              <ArrowUp size={16} />
              From {invoices.length} invoices
            </p>
          </div>
        </Card>

        <Card className="p-6 border-l-4 border-l-accent">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-muted-foreground">Accounts Receivable</h3>
            <Receipt size={20} className="text-accent" />
          </div>
          <div className="space-y-2">
            <p className="text-3xl font-semibold">{formatCurrency(totalReceivables)}</p>
            <p className="text-sm text-muted-foreground">
              {overdueInvoices} overdue invoices
            </p>
          </div>
        </Card>

        <Card className="p-6 border-l-4 border-l-destructive">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-muted-foreground">Total Expenses</h3>
            <Wallet size={20} className="text-destructive" />
          </div>
          <div className="space-y-2">
            <p className="text-3xl font-semibold">{formatCurrency(totalExpenses)}</p>
            <p className="text-sm text-destructive flex items-center gap-1">
              <ArrowDown size={16} />
              {expenses.length} expense records
            </p>
          </div>
        </Card>

        <Card className="p-6 border-l-4 border-l-primary">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-muted-foreground">Net Income</h3>
            <ChartLine size={20} className="text-primary" />
          </div>
          <div className="space-y-2">
            <p className={`text-3xl font-semibold ${netIncome >= 0 ? 'text-success' : 'text-destructive'}`}>
              {formatCurrency(netIncome)}
            </p>
            <p className="text-sm text-muted-foreground">
              Revenue - Expenses
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
                  <span className="text-lg font-semibold text-success">
                    {formatCurrency(payments.reduce((sum, p) => sum + p.amount, 0))}
                  </span>
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

        <TabsContent value="invoices" className="space-y-6">
          <Card className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold">All Invoices</h3>
              <Button onClick={handleNewInvoice}>
                <Plus size={18} className="mr-2" />
                New Invoice
              </Button>
            </div>

            <div className="space-y-3">
              {invoices.length === 0 ? (
                <div className="text-center py-12">
                  <FileText size={48} className="mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">No invoices yet</p>
                  <Button onClick={handleNewInvoice} className="mt-4">
                    <Plus size={18} className="mr-2" />
                    Create First Invoice
                  </Button>
                </div>
              ) : (
                invoices.map((invoice) => (
                  <div
                    key={invoice.id}
                    className="p-4 bg-muted/50 rounded-lg cursor-pointer hover:bg-muted transition-colors"
                    onClick={() => handleEditInvoice(invoice)}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <p className="font-semibold">{invoice.invoiceNumber}</p>
                          {getInvoiceStatusBadge(invoice.status)}
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
                        <p className="text-2xl font-semibold">{formatCurrency(invoice.total)}</p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {invoice.status === 'posted' ? 'Posted' : 'Pending'}
                        </p>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="payments" className="space-y-6">
          <Card className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold">All Payments</h3>
              <Button onClick={handleNewPayment}>
                <Plus size={18} className="mr-2" />
                Record Payment
              </Button>
            </div>

            <div className="space-y-3">
              {payments.length === 0 ? (
                <div className="text-center py-12">
                  <CreditCard size={48} className="mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">No payments recorded yet</p>
                  <Button onClick={handleNewPayment} className="mt-4">
                    <Plus size={18} className="mr-2" />
                    Record First Payment
                  </Button>
                </div>
              ) : (
                payments.map((payment) => (
                  <div
                    key={payment.id}
                    className="p-4 bg-muted/50 rounded-lg cursor-pointer hover:bg-muted transition-colors"
                    onClick={() => handleEditPayment(payment)}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <p className="font-semibold">{payment.paymentNumber}</p>
                          {getPaymentStatusBadge(payment.status)}
                          {payment.reconciled && (
                            <Badge variant="default" className="text-success">Reconciled</Badge>
                          )}
                        </div>
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <span className="text-muted-foreground">Method:</span>
                            <span className="ml-2 capitalize">{payment.method.replace('-', ' ')}</span>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Processed:</span>
                            <span className="ml-2">{formatDate(payment.processedAt)}</span>
                          </div>
                          {payment.reference && (
                            <div>
                              <span className="text-muted-foreground">Reference:</span>
                              <span className="ml-2 font-mono text-xs">{payment.reference}</span>
                            </div>
                          )}
                          <div>
                            <span className="text-muted-foreground">Processed By:</span>
                            <span className="ml-2">{payment.processedBy}</span>
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-semibold text-success">{formatCurrency(payment.amount)}</p>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="expenses" className="space-y-6">
          <Card className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold">All Expenses</h3>
              <Button onClick={handleNewExpense}>
                <Plus size={18} className="mr-2" />
                New Expense
              </Button>
            </div>

            <div className="space-y-3">
              {expenses.length === 0 ? (
                <div className="text-center py-12">
                  <Wallet size={48} className="mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">No expenses recorded yet</p>
                  <Button onClick={handleNewExpense} className="mt-4">
                    <Plus size={18} className="mr-2" />
                    Add First Expense
                  </Button>
                </div>
              ) : (
                expenses.map((expense) => (
                  <div
                    key={expense.id}
                    className="p-4 bg-muted/50 rounded-lg cursor-pointer hover:bg-muted transition-colors"
                    onClick={() => handleEditExpense(expense)}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <p className="font-semibold">{expense.expenseNumber}</p>
                          {expense.approvedBy ? (
                            <Badge variant="default" className="text-success">Approved</Badge>
                          ) : (
                            <Badge variant="secondary">Pending</Badge>
                          )}
                        </div>
                        <p className="text-sm mb-2">{expense.description}</p>
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <span className="text-muted-foreground">Category:</span>
                            <span className="ml-2 capitalize">{expense.category.replace('-', ' ')}</span>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Department:</span>
                            <span className="ml-2 capitalize">{expense.department}</span>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Date:</span>
                            <span className="ml-2">{formatDate(expense.date)}</span>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Method:</span>
                            <span className="ml-2 capitalize">{expense.paymentMethod ? expense.paymentMethod.replace('-', ' ') : 'N/A'}</span>
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-semibold text-destructive">{formatCurrency(expense.amount)}</p>
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
              <Button onClick={handleNewBudget}>
                <Plus size={18} className="mr-2" />
                New Budget
              </Button>
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

        <TabsContent value="journals" className="space-y-6">
          <Card className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold">Journal Entries</h3>
              <Button onClick={handleNewJournal}>
                <Plus size={18} className="mr-2" />
                New Journal Entry
              </Button>
            </div>

            <div className="space-y-3">
              {!journalEntries || journalEntries.length === 0 ? (
                <div className="text-center py-12">
                  <Notebook size={48} className="mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">No journal entries yet</p>
                  <Button onClick={handleNewJournal} className="mt-4">
                    <Plus size={18} className="mr-2" />
                    Create First Journal Entry
                  </Button>
                </div>
              ) : (
                journalEntries.map((entry) => (
                  <div
                    key={entry.id}
                    className="p-4 bg-muted/50 rounded-lg"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <p className="font-semibold">{entry.journalNumber}</p>
                          <Badge variant={entry.status === 'posted' ? 'default' : entry.status === 'approved' ? 'default' : 'secondary'} className={entry.status === 'posted' ? 'text-success' : entry.status === 'approved' ? 'text-accent' : ''}>
                            {entry.status.replace('-', ' ')}
                          </Badge>
                          {entry.isReversal && (
                            <Badge variant="destructive">Reversal</Badge>
                          )}
                          {!entry.isBalanced && (
                            <Badge variant="destructive">Unbalanced</Badge>
                          )}
                        </div>
                        <p className="text-sm mb-3">{entry.description}</p>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                          <div>
                            <span className="text-muted-foreground">Type:</span>
                            <span className="ml-2 capitalize">{entry.journalType.replace('-', ' ')}</span>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Date:</span>
                            <span className="ml-2">{formatDate(entry.transactionDate)}</span>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Period:</span>
                            <span className="ml-2">{entry.fiscalPeriod}</span>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Lines:</span>
                            <span className="ml-2">{entry.lines.length}</span>
                          </div>
                        </div>
                      </div>
                      <div className="text-right space-y-2">
                        <div>
                          <p className="text-xs text-muted-foreground">Total Debit</p>
                          <p className="text-lg font-semibold text-success">{formatCurrency(entry.totalDebit)}</p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">Total Credit</p>
                          <p className="text-lg font-semibold text-destructive">{formatCurrency(entry.totalCredit)}</p>
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-2 mt-4">
                      <Button size="sm" variant="outline" onClick={() => handleEditJournal(entry)}>
                        Edit
                      </Button>
                      {entry.status !== 'posted' && entry.isBalanced && (
                        <Button size="sm" variant="default" onClick={() => handlePostJournal(entry)}>
                          <FilePlus size={16} className="mr-2" />
                          Post
                        </Button>
                      )}
                      {entry.status === 'posted' && !entry.reversedByEntryId && (
                        <Button size="sm" variant="destructive" onClick={() => handleReverseJournal(entry)}>
                          Reverse
                        </Button>
                      )}
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
            <Button variant="outline" size="sm">
              <FileText size={16} className="mr-2" />
              AP Aging
            </Button>
            <Button variant="outline" size="sm" onClick={() => setCashFlowDialogOpen(true)}>
              <FileText size={16} className="mr-2" />
              Cash Flow
            </Button>
            <Button variant="outline" size="sm">
              <FileText size={16} className="mr-2" />
              Tax Summary
            </Button>
            <Button variant="outline" size="sm">
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

        <TabsContent value="reconciliation" className="space-y-6">
          <Card className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold">Bank Reconciliations</h3>
              <Button onClick={handleNewReconciliation}>
                <Plus size={18} className="mr-2" />
                New Reconciliation
              </Button>
            </div>

            <div className="space-y-3">
              {bankReconciliations.length === 0 ? (
                <div className="text-center py-12">
                  <Bank size={48} className="mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">No bank reconciliations yet</p>
                  <Button onClick={handleNewReconciliation} className="mt-4">
                    <Plus size={18} className="mr-2" />
                    Start First Reconciliation
                  </Button>
                </div>
              ) : (
                bankReconciliations.map((reconciliation) => (
                  <div
                    key={reconciliation.id}
                    className="p-4 bg-muted/50 rounded-lg hover:bg-muted transition-colors"
                  >
                    <div className="flex items-start justify-between">
                      <div 
                        className="flex-1 cursor-pointer"
                        onClick={() => handleEditReconciliation(reconciliation)}
                      >
                        <div className="flex items-center gap-3 mb-2">
                          <p className="font-semibold">{reconciliation.reconciliationNumber}</p>
                          <Badge variant={
                            reconciliation.status === 'completed' ? 'default' :
                            reconciliation.status === 'in-progress' ? 'secondary' : 'destructive'
                          }>
                            {reconciliation.status.replace('-', ' ')}
                          </Badge>
                          {Math.abs(reconciliation.difference) < 0.01 && (
                            <Badge variant="default" className="text-success">
                              <Check size={14} className="mr-1" />
                              Balanced
                            </Badge>
                          )}
                        </div>
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <span className="text-muted-foreground">Bank Account:</span>
                            <span className="ml-2">{reconciliation.bankAccountName}</span>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Statement Date:</span>
                            <span className="ml-2">{formatDate(reconciliation.statementDate)}</span>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Book Balance:</span>
                            <span className="ml-2">{formatCurrency(reconciliation.bookBalance)}</span>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Statement Balance:</span>
                            <span className="ml-2">{formatCurrency(reconciliation.statementBalance)}</span>
                          </div>
                        </div>
                      </div>
                      <div className="text-right flex flex-col items-end gap-2">
                        <div>
                          <p className="text-sm text-muted-foreground mb-1">Difference</p>
                          <p className={`text-2xl font-semibold ${Math.abs(reconciliation.difference) < 0.01 ? 'text-success' : 'text-destructive'}`}>
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
                        >
                          <Download size={16} className="mr-2" />
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
        invoice={selectedInvoice}
        onSave={(invoice) => {
          if (selectedInvoice) {
            setInvoices((prev) => prev.map((i) => (i.id === invoice.id ? invoice : i)))
          } else {
            setInvoices((prev) => [...prev, invoice])
          }
        }}
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
    </div>
  )
}
