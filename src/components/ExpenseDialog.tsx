import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { toast } from 'sonner'
import { type Expense, type ExpenseCategory, type PaymentMethod, type Department } from '@/lib/types'
import { generateNumber } from '@/lib/helpers'

interface ExpenseDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  expense?: Expense
  onSave: (expense: Expense) => void
}

export function ExpenseDialog({ open, onOpenChange, expense, onSave }: ExpenseDialogProps) {
  const [formData, setFormData] = useState<Partial<Expense>>({
    expenseNumber: '',
    category: 'supplies',
    department: 'admin',
    description: '',
    amount: 0,
    paymentMethod: 'cash',
    date: Date.now(),
    createdAt: Date.now(),
    createdBy: 'admin'
  })

  useEffect(() => {
    if (expense) {
      setFormData(expense)
    } else {
      const newExpenseNumber = generateNumber('EXP')
      setFormData({
        expenseNumber: newExpenseNumber,
        category: 'supplies',
        department: 'admin',
        description: '',
        amount: 0,
        paymentMethod: 'cash',
        date: Date.now(),
        createdAt: Date.now(),
        createdBy: 'admin'
      })
    }
  }, [expense, open])

  const handleSubmit = () => {
    if (!formData.expenseNumber) {
      toast.error('Expense number is required')
      return
    }

    if (!formData.description) {
      toast.error('Description is required')
      return
    }

    if (!formData.amount || formData.amount <= 0) {
      toast.error('Amount must be greater than 0')
      return
    }

    const newExpense: Expense = {
      id: expense?.id || `exp-${Date.now()}`,
      expenseNumber: formData.expenseNumber!,
      category: formData.category as ExpenseCategory,
      department: formData.department as Department,
      description: formData.description!,
      amount: formData.amount!,
      expenseDate: formData.date!,
      paymentMethod: formData.paymentMethod as PaymentMethod,
      supplierId: formData.supplierId,
      invoiceNumber: formData.invoiceNumber,
      receiptUrl: formData.receiptUrl,
      date: formData.date!,
      status: formData.status || 'pending',
      approvedBy: formData.approvedBy,
      approvedAt: formData.approvedAt,
      createdAt: formData.createdAt!,
      createdBy: formData.createdBy!
    }

    onSave(newExpense)
    toast.success(expense ? 'Expense updated successfully' : 'Expense recorded successfully')
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>{expense ? 'Edit Expense' : 'Record New Expense'}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Expense Number</Label>
              <Input
                value={formData.expenseNumber}
                onChange={(e) => setFormData({ ...formData, expenseNumber: e.target.value })}
                placeholder="EXP-001"
              />
            </div>

            <div>
              <Label>Amount</Label>
              <Input
                type="number"
                value={formData.amount}
                onChange={(e) => setFormData({ ...formData, amount: parseFloat(e.target.value) || 0 })}
                min="0"
                step="0.01"
              />
            </div>

            <div>
              <Label>Category</Label>
              <Select value={formData.category} onValueChange={(value) => setFormData({ ...formData, category: value as ExpenseCategory })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="salaries">Salaries</SelectItem>
                  <SelectItem value="utilities">Utilities</SelectItem>
                  <SelectItem value="supplies">Supplies</SelectItem>
                  <SelectItem value="maintenance">Maintenance</SelectItem>
                  <SelectItem value="marketing">Marketing</SelectItem>
                  <SelectItem value="insurance">Insurance</SelectItem>
                  <SelectItem value="taxes">Taxes</SelectItem>
                  <SelectItem value="rent">Rent</SelectItem>
                  <SelectItem value="equipment">Equipment</SelectItem>
                  <SelectItem value="food-beverage">Food & Beverage</SelectItem>
                  <SelectItem value="housekeeping">Housekeeping</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Department</Label>
              <Select value={formData.department} onValueChange={(value) => setFormData({ ...formData, department: value as Department })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="front-office">Front Office</SelectItem>
                  <SelectItem value="housekeeping">Housekeeping</SelectItem>
                  <SelectItem value="fnb">F&B</SelectItem>
                  <SelectItem value="kitchen">Kitchen</SelectItem>
                  <SelectItem value="engineering">Engineering</SelectItem>
                  <SelectItem value="finance">Finance</SelectItem>
                  <SelectItem value="hr">HR</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Payment Method</Label>
              <Select value={formData.paymentMethod} onValueChange={(value) => setFormData({ ...formData, paymentMethod: value as PaymentMethod })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="cash">Cash</SelectItem>
                  <SelectItem value="card">Card</SelectItem>
                  <SelectItem value="bank-transfer">Bank Transfer</SelectItem>
                  <SelectItem value="mobile-payment">Mobile Payment</SelectItem>
                  <SelectItem value="credit">Credit</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Expense Date</Label>
              <Input
                type="date"
                value={new Date(formData.date!).toISOString().split('T')[0]}
                onChange={(e) => setFormData({ ...formData, date: new Date(e.target.value).getTime() })}
              />
            </div>

            <div className="col-span-2">
              <Label>Description</Label>
              <Input
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Describe the expense"
              />
            </div>

            <div>
              <Label>Supplier Invoice Number (Optional)</Label>
              <Input
                value={formData.invoiceNumber || ''}
                onChange={(e) => setFormData({ ...formData, invoiceNumber: e.target.value })}
                placeholder="SUP-INV-001"
              />
            </div>

            <div>
              <Label>Approval Status</Label>
              <Select 
                value={formData.approvedBy ? 'approved' : 'pending'} 
                onValueChange={(value) => setFormData({ 
                  ...formData, 
                  approvedBy: value === 'approved' ? 'admin' : undefined,
                  approvedAt: value === 'approved' ? Date.now() : undefined
                })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pending">Pending Approval</SelectItem>
                  <SelectItem value="approved">Approved</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <Label>Receipt/Notes</Label>
            <Textarea
              value={formData.receiptUrl || ''}
              onChange={(e) => setFormData({ ...formData, receiptUrl: e.target.value })}
              placeholder="Add receipt URL or additional notes..."
              rows={3}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSubmit}>
            {expense ? 'Update Expense' : 'Record Expense'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
