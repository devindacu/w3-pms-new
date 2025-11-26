import { useState } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
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
  ChartBar
} from '@phosphor-icons/react'
import { type Invoice, type Payment, type Expense, type Account, type Budget } from '@/lib/types'
import { formatCurrency, formatDate } from '@/lib/helpers'
import { InvoiceDialog } from './InvoiceDialog'
import { PaymentDialog } from './PaymentDialog'
import { ExpenseDialog } from './ExpenseDialog'
import { BudgetDialog } from './BudgetDialog'

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
  setBudgets
}: FinanceProps) {
  const [selectedTab, setSelectedTab] = useState('overview')
  const [invoiceDialogOpen, setInvoiceDialogOpen] = useState(false)
  const [paymentDialogOpen, setPaymentDialogOpen] = useState(false)
  const [expenseDialogOpen, setExpenseDialogOpen] = useState(false)
  const [budgetDialogOpen, setBudgetDialogOpen] = useState(false)
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | undefined>()
  const [selectedPayment, setSelectedPayment] = useState<Payment | undefined>()
  const [selectedExpense, setSelectedExpense] = useState<Expense | undefined>()
  const [selectedBudget, setSelectedBudget] = useState<Budget | undefined>()

  const totalRevenue = invoices.reduce((sum, inv) => sum + inv.total, 0)
  const totalReceivables = invoices.reduce((sum, inv) => sum + inv.balance, 0)
  const totalPayables = expenses.filter(e => !e.approvedBy).reduce((sum, e) => sum + e.amount, 0)
  const totalExpenses = expenses.reduce((sum, exp) => sum + exp.amount, 0)
  const netIncome = totalRevenue - totalExpenses

  const overdueInvoices = invoices.filter(inv => 
    inv.status !== 'paid' && inv.dueDate < Date.now()
  ).length

  const paidInvoices = invoices.filter(inv => inv.status === 'paid').length
  const pendingInvoices = invoices.filter(inv => inv.status === 'sent' || inv.status === 'draft').length

  const getInvoiceStatusBadge = (status: Invoice['status']) => {
    const variants = {
      'draft': 'secondary',
      'sent': 'default',
      'paid': 'default',
      'partially-paid': 'default',
      'overdue': 'destructive',
      'cancelled': 'secondary'
    } as const
    
    const colors = {
      'draft': 'text-muted-foreground',
      'sent': 'text-primary',
      'paid': 'text-success',
      'partially-paid': 'text-accent',
      'overdue': 'text-destructive',
      'cancelled': 'text-muted-foreground'
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
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="invoices">Invoices</TabsTrigger>
          <TabsTrigger value="payments">Payments</TabsTrigger>
          <TabsTrigger value="expenses">Expenses</TabsTrigger>
          <TabsTrigger value="budgets">Budgets</TabsTrigger>
          <TabsTrigger value="accounts">Accounts</TabsTrigger>
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
                            <span className="text-muted-foreground">Type:</span>
                            <span className="ml-2 capitalize">{invoice.type.replace('-', ' ')}</span>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Issue Date:</span>
                            <span className="ml-2">{formatDate(invoice.issueDate)}</span>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Due Date:</span>
                            <span className="ml-2">{formatDate(invoice.dueDate)}</span>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Items:</span>
                            <span className="ml-2">{invoice.items.length}</span>
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-semibold">{formatCurrency(invoice.total)}</p>
                        {invoice.balance > 0 && (
                          <p className="text-sm text-destructive">Balance: {formatCurrency(invoice.balance)}</p>
                        )}
                        <p className="text-xs text-muted-foreground mt-1">
                          Paid: {formatCurrency(invoice.amountPaid)}
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
                            <span className="ml-2 capitalize">{expense.paymentMethod.replace('-', ' ')}</span>
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
    </div>
  )
}
