import { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { PrintButton } from '@/components/PrintButton'
import { A4PrintWrapper } from '@/components/A4PrintWrapper'
import { Plus, Wallet, ArrowDown, ArrowUp, Download } from '@phosphor-icons/react'
import { formatCurrency, formatDate } from '@/lib/helpers'
import { toast } from 'sonner'

interface PettyCashTransaction {
  id: string
  transactionNumber: string
  date: number
  type: 'disbursement' | 'replenishment'
  amount: number
  category: string
  description: string
  receivedBy?: string
  approvedBy?: string
  receiptNumber?: string
  notes?: string
  createdBy: string
  createdAt: number
}

interface PettyCashDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  transactions: PettyCashTransaction[]
  onSave: (transaction: PettyCashTransaction) => void
  currentUser: { id: string; username: string }
  floatAmount: number
  onReplenish: (amount: number, notes: string) => void
}

const EXPENSE_CATEGORIES = [
  'Office Supplies',
  'Refreshments',
  'Transportation',
  'Postage',
  'Minor Repairs',
  'Employee Reimbursement',
  'Cleaning Supplies',
  'Miscellaneous',
]

export function PettyCashDialog({
  open,
  onOpenChange,
  transactions,
  onSave,
  currentUser,
  floatAmount,
  onReplenish,
}: PettyCashDialogProps) {
  const [showNewTransaction, setShowNewTransaction] = useState(false)
  const [showReplenishment, setShowReplenishment] = useState(false)
  const [formData, setFormData] = useState({
    type: 'disbursement' as 'disbursement' | 'replenishment',
    amount: '',
    category: '',
    description: '',
    receivedBy: '',
    receiptNumber: '',
    notes: '',
  })

  const [replenishmentAmount, setReplenishmentAmount] = useState('')
  const [replenishmentNotes, setReplenishmentNotes] = useState('')

  const currentBalance = transactions.reduce((sum, txn) => {
    return txn.type === 'replenishment' ? sum + txn.amount : sum - txn.amount
  }, floatAmount)

  const totalDisbursed = transactions
    .filter(t => t.type === 'disbursement')
    .reduce((sum, t) => sum + t.amount, 0)

  const totalReplenished = transactions
    .filter(t => t.type === 'replenishment')
    .reduce((sum, t) => sum + t.amount, 0)

  const handleSubmit = () => {
    if (!formData.amount || parseFloat(formData.amount) <= 0) {
      toast.error('Please enter a valid amount')
      return
    }

    if (!formData.category) {
      toast.error('Please select a category')
      return
    }

    if (!formData.description.trim()) {
      toast.error('Please enter a description')
      return
    }

    const amount = parseFloat(formData.amount)

    if (formData.type === 'disbursement' && amount > currentBalance) {
      toast.error('Insufficient petty cash balance')
      return
    }

    const transaction: PettyCashTransaction = {
      id: `pc-${Date.now()}`,
      transactionNumber: `PC-${String(transactions.length + 1).padStart(4, '0')}`,
      date: Date.now(),
      type: formData.type,
      amount,
      category: formData.category,
      description: formData.description,
      receivedBy: formData.receivedBy || undefined,
      receiptNumber: formData.receiptNumber || undefined,
      notes: formData.notes || undefined,
      createdBy: currentUser.id,
      createdAt: Date.now(),
    }

    onSave(transaction)
    
    setFormData({
      type: 'disbursement',
      amount: '',
      category: '',
      description: '',
      receivedBy: '',
      receiptNumber: '',
      notes: '',
    })
    
    setShowNewTransaction(false)
    toast.success('Transaction recorded successfully')
  }

  const handleReplenish = () => {
    const amount = parseFloat(replenishmentAmount)
    
    if (!amount || amount <= 0) {
      toast.error('Please enter a valid replenishment amount')
      return
    }

    onReplenish(amount, replenishmentNotes)
    setReplenishmentAmount('')
    setReplenishmentNotes('')
    setShowReplenishment(false)
  }

  const exportTransactions = () => {
    const csvRows: string[] = []
    
    csvRows.push('Petty Cash Report')
    csvRows.push(`Generated: ${formatDate(Date.now())}`)
    csvRows.push('')
    csvRows.push(`Float Amount,${floatAmount}`)
    csvRows.push(`Current Balance,${currentBalance}`)
    csvRows.push(`Total Disbursed,${totalDisbursed}`)
    csvRows.push(`Total Replenished,${totalReplenished}`)
    csvRows.push('')
    csvRows.push('Transaction Number,Date,Type,Category,Description,Amount,Received By,Receipt No,Notes')
    
    transactions.forEach((txn) => {
      csvRows.push(
        `${txn.transactionNumber},${formatDate(txn.date)},${txn.type},${txn.category},${txn.description},${txn.amount},${txn.receivedBy || ''},${txn.receiptNumber || ''},${txn.notes || ''}`
      )
    })

    const csvContent = csvRows.join('\n')
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `Petty_Cash_Report_${formatDate(Date.now()).replace(/\//g, '-')}.csv`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
    
    toast.success('Petty cash report exported')
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Wallet size={24} />
              Petty Cash Management
            </div>
            <PrintButton
              elementId="petty-cash-print"
              options={{
                title: 'Petty Cash Report',
                filename: `petty-cash-${formatDate(Date.now()).replace(/\//g, '-')}.pdf`
              }}
            />
          </DialogTitle>
        </DialogHeader>

        <div className="dialog-content-wrapper">
          <ScrollArea className="dialog-body-scrollable">
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card className="p-4 border-l-4 border-l-primary">
                  <p className="text-sm text-muted-foreground mb-1">Current Balance</p>
                  <p className="text-2xl font-bold text-primary">{formatCurrency(currentBalance)}</p>
                </Card>
                <Card className="p-4 border-l-4 border-l-secondary">
                  <p className="text-sm text-muted-foreground mb-1">Float Amount</p>
                  <p className="text-2xl font-bold text-secondary">{formatCurrency(floatAmount)}</p>
                </Card>
                <Card className="p-4 border-l-4 border-l-destructive">
                  <p className="text-sm text-muted-foreground mb-1">Total Disbursed</p>
                  <p className="text-2xl font-bold text-destructive">{formatCurrency(totalDisbursed)}</p>
                </Card>
                <Card className="p-4 border-l-4 border-l-success">
                  <p className="text-sm text-muted-foreground mb-1">Total Replenished</p>
                  <p className="text-2xl font-bold text-success">{formatCurrency(totalReplenished)}</p>
                </Card>
              </div>

              <div className="flex gap-2 flex-wrap">
                <Button onClick={() => setShowNewTransaction(!showNewTransaction)} size="sm">
                  <Plus size={16} className="mr-2" />
                  New Transaction
                </Button>
                <Button onClick={() => setShowReplenishment(!showReplenishment)} variant="outline" size="sm">
                  <ArrowUp size={16} className="mr-2" />
                  Replenish Fund
                </Button>
                <Button onClick={exportTransactions} variant="outline" size="sm">
                  <Download size={16} className="mr-2" />
                  Export Report
                </Button>
              </div>

              {showNewTransaction && (
                <Card className="p-4 bg-muted/50">
                  <h3 className="text-lg font-semibold mb-4">New Transaction</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label>Type</Label>
                      <Select 
                        value={formData.type} 
                        onValueChange={(value: any) => setFormData({ ...formData, type: value })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="disbursement">Disbursement</SelectItem>
                          <SelectItem value="replenishment">Replenishment</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label>Amount *</Label>
                      <Input
                        type="number"
                        step="0.01"
                        value={formData.amount}
                        onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                        placeholder="0.00"
                      />
                    </div>

                    <div>
                      <Label>Category *</Label>
                      <Select 
                        value={formData.category} 
                        onValueChange={(value) => setFormData({ ...formData, category: value })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select category" />
                        </SelectTrigger>
                        <SelectContent>
                          {EXPENSE_CATEGORIES.map((cat) => (
                            <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label>Received By</Label>
                      <Input
                        value={formData.receivedBy}
                        onChange={(e) => setFormData({ ...formData, receivedBy: e.target.value })}
                        placeholder="Person who received the cash"
                      />
                    </div>

                    <div className="md:col-span-2">
                      <Label>Description *</Label>
                      <Textarea
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        placeholder="Describe the purpose of this transaction"
                        rows={2}
                      />
                    </div>

                    <div>
                      <Label>Receipt Number</Label>
                      <Input
                        value={formData.receiptNumber}
                        onChange={(e) => setFormData({ ...formData, receiptNumber: e.target.value })}
                        placeholder="Receipt reference"
                      />
                    </div>

                    <div>
                      <Label>Notes</Label>
                      <Input
                        value={formData.notes}
                        onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                        placeholder="Additional notes"
                      />
                    </div>
                  </div>
                  <div className="flex gap-2 mt-4">
                    <Button onClick={handleSubmit}>Save Transaction</Button>
                    <Button variant="outline" onClick={() => setShowNewTransaction(false)}>Cancel</Button>
                  </div>
                </Card>
              )}

              {showReplenishment && (
                <Card className="p-4 bg-success/10 border-2 border-success">
                  <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                    <ArrowUp size={20} className="text-success" />
                    Replenish Petty Cash Fund
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label>Replenishment Amount *</Label>
                      <Input
                        type="number"
                        step="0.01"
                        value={replenishmentAmount}
                        onChange={(e) => setReplenishmentAmount(e.target.value)}
                        placeholder="0.00"
                      />
                      <p className="text-xs text-muted-foreground mt-1">
                        Suggested: {formatCurrency(floatAmount - currentBalance)}
                      </p>
                    </div>

                    <div>
                      <Label>Notes</Label>
                      <Textarea
                        value={replenishmentNotes}
                        onChange={(e) => setReplenishmentNotes(e.target.value)}
                        placeholder="Replenishment notes"
                        rows={2}
                      />
                    </div>
                  </div>
                  <div className="flex gap-2 mt-4">
                    <Button onClick={handleReplenish} className="bg-success hover:bg-success/90">
                      Replenish Fund
                    </Button>
                    <Button variant="outline" onClick={() => setShowReplenishment(false)}>Cancel</Button>
                  </div>
                </Card>
              )}

              <div>
                <h3 className="text-lg font-semibold mb-4">Transaction History</h3>
                <div className="space-y-3">
                  {transactions.length === 0 ? (
                    <Card className="p-8 text-center">
                      <Wallet size={48} className="mx-auto text-muted-foreground mb-3" />
                      <p className="text-muted-foreground">No transactions yet</p>
                    </Card>
                  ) : (
                    transactions.map((txn) => (
                      <Card key={txn.id} className="p-4 bg-muted/50">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              {txn.type === 'disbursement' ? (
                                <ArrowDown size={16} className="text-destructive" />
                              ) : (
                                <ArrowUp size={16} className="text-success" />
                              )}
                              <p className="font-semibold">{txn.transactionNumber}</p>
                              <Badge variant={txn.type === 'disbursement' ? 'destructive' : 'default'}>
                                {txn.type}
                              </Badge>
                            </div>
                            <p className="text-sm mb-2">{txn.description}</p>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs">
                              <div>
                                <span className="text-muted-foreground">Date:</span>
                                <span className="ml-2">{formatDate(txn.date)}</span>
                              </div>
                              <div>
                                <span className="text-muted-foreground">Category:</span>
                                <span className="ml-2">{txn.category}</span>
                              </div>
                              {txn.receivedBy && (
                                <div>
                                  <span className="text-muted-foreground">Received By:</span>
                                  <span className="ml-2">{txn.receivedBy}</span>
                                </div>
                              )}
                              {txn.receiptNumber && (
                                <div>
                                  <span className="text-muted-foreground">Receipt:</span>
                                  <span className="ml-2">{txn.receiptNumber}</span>
                                </div>
                              )}
                            </div>
                            {txn.notes && (
                              <p className="text-xs text-muted-foreground mt-2">Note: {txn.notes}</p>
                            )}
                          </div>
                          <div className="text-right ml-4">
                            <p className={`text-xl font-bold ${txn.type === 'disbursement' ? 'text-destructive' : 'text-success'}`}>
                              {txn.type === 'disbursement' ? '-' : '+'}{formatCurrency(txn.amount)}
                            </p>
                          </div>
                        </div>
                      </Card>
                    ))
                  )}
                </div>
              </div>
            </div>
          </ScrollArea>
        </div>

        <div className="hidden">
          <A4PrintWrapper id="petty-cash-print" title={`Petty Cash Report - ${formatDate(Date.now())}`}>
            <div className="space-y-6">
              <div className="border-b pb-4">
                <div className="flex justify-between items-center">
                  <div>
                    <h2 className="text-xl font-semibold">Petty Cash Summary</h2>
                    <p className="text-sm text-gray-600">Report Date: {formatDate(Date.now())}</p>
                  </div>
                  <div className="text-right">
                    <div className="text-sm text-gray-600">Current Balance</div>
                    <div className="text-2xl font-bold">{formatCurrency(currentBalance)}</div>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-3">Account Summary</h3>
                <table className="w-full border-collapse mb-4">
                  <tbody>
                    <tr className="border-b">
                      <td className="py-2 px-3">Float Amount</td>
                      <td className="py-2 px-3 text-right font-semibold">{formatCurrency(floatAmount)}</td>
                    </tr>
                    <tr className="border-b">
                      <td className="py-2 px-3">Current Balance</td>
                      <td className="py-2 px-3 text-right font-semibold text-blue-600">{formatCurrency(currentBalance)}</td>
                    </tr>
                    <tr className="border-b">
                      <td className="py-2 px-3">Total Disbursed</td>
                      <td className="py-2 px-3 text-right font-semibold text-red-600">{formatCurrency(totalDisbursed)}</td>
                    </tr>
                    <tr className="border-b">
                      <td className="py-2 px-3">Total Replenished</td>
                      <td className="py-2 px-3 text-right font-semibold text-green-600">{formatCurrency(totalReplenished)}</td>
                    </tr>
                    <tr className="border-b">
                      <td className="py-2 px-3">Total Transactions</td>
                      <td className="py-2 px-3 text-right font-semibold">{transactions.length}</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-3">Transaction History</h3>
                <table className="w-full border-collapse text-sm">
                  <thead>
                    <tr className="border-b bg-gray-50">
                      <th className="text-left py-2 px-2">Transaction #</th>
                      <th className="text-left py-2 px-2">Date</th>
                      <th className="text-left py-2 px-2">Type</th>
                      <th className="text-left py-2 px-2">Category</th>
                      <th className="text-left py-2 px-2">Description</th>
                      <th className="text-right py-2 px-2">Amount</th>
                      <th className="text-left py-2 px-2">Received By</th>
                      <th className="text-left py-2 px-2">Receipt No</th>
                    </tr>
                  </thead>
                  <tbody>
                    {transactions.length === 0 ? (
                      <tr>
                        <td colSpan={8} className="py-4 text-center text-gray-500">No transactions recorded</td>
                      </tr>
                    ) : (
                      transactions.map((txn) => (
                        <tr key={txn.id} className="border-b">
                          <td className="py-2 px-2">{txn.transactionNumber}</td>
                          <td className="py-2 px-2">{formatDate(txn.date)}</td>
                          <td className="py-2 px-2 capitalize">{txn.type}</td>
                          <td className="py-2 px-2">{txn.category}</td>
                          <td className="py-2 px-2">{txn.description}</td>
                          <td className="py-2 px-2 text-right font-semibold">
                            {txn.type === 'disbursement' ? '-' : '+'}
                            {formatCurrency(txn.amount)}
                          </td>
                          <td className="py-2 px-2">{txn.receivedBy || '-'}</td>
                          <td className="py-2 px-2">{txn.receiptNumber || '-'}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              {transactions.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold mb-3">Category Breakdown</h3>
                  <table className="w-full border-collapse">
                    <thead>
                      <tr className="border-b bg-gray-50">
                        <th className="text-left py-2 px-3">Category</th>
                        <th className="text-right py-2 px-3">Total Amount</th>
                        <th className="text-right py-2 px-3">Count</th>
                      </tr>
                    </thead>
                    <tbody>
                      {Object.entries(
                        transactions
                          .filter(t => t.type === 'disbursement')
                          .reduce((acc, txn) => {
                            if (!acc[txn.category]) {
                              acc[txn.category] = { total: 0, count: 0 }
                            }
                            acc[txn.category].total += txn.amount
                            acc[txn.category].count += 1
                            return acc
                          }, {} as Record<string, { total: number; count: number }>)
                      ).map(([category, data]) => (
                        <tr key={category} className="border-b">
                          <td className="py-2 px-3">{category}</td>
                          <td className="py-2 px-3 text-right font-semibold">{formatCurrency(data.total)}</td>
                          <td className="py-2 px-3 text-right">{data.count}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </A4PrintWrapper>
        </div>
      </DialogContent>
    </Dialog>
  )
}
