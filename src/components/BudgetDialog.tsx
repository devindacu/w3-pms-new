import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Plus, Trash } from '@phosphor-icons/react'
import { toast } from 'sonner'
import { type Budget, type BudgetCategory, type BudgetPeriod, type Department, type ExpenseCategory } from '@/lib/types'

interface BudgetDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  budget?: Budget
  onSave: (budget: Budget) => void
}

export function BudgetDialog({ open, onOpenChange, budget, onSave }: BudgetDialogProps) {
  const [formData, setFormData] = useState<Partial<Budget>>({
    budgetName: '',
    department: 'admin',
    period: 'quarterly',
    startDate: Date.now(),
    endDate: Date.now() + 90 * 24 * 60 * 60 * 1000,
    categories: [],
    totalBudget: 0,
    totalActual: 0,
    variance: 0,
    status: 'draft',
    createdAt: Date.now(),
    createdBy: 'admin'
  })

  const [categories, setCategories] = useState<Partial<BudgetCategory>[]>([])

  useEffect(() => {
    if (budget) {
      setFormData(budget)
      setCategories(budget.categories)
    } else {
      setFormData({
        budgetName: '',
        department: 'admin',
        period: 'quarterly',
        startDate: Date.now(),
        endDate: Date.now() + 90 * 24 * 60 * 60 * 1000,
        categories: [],
        totalBudget: 0,
        totalActual: 0,
        variance: 0,
        status: 'draft',
        createdAt: Date.now(),
        createdBy: 'admin'
      })
      setCategories([])
    }
  }, [budget, open])

  useEffect(() => {
    const totalBudget = categories.reduce((sum, cat) => sum + (cat.budgetedAmount || 0), 0)
    const totalActual = categories.reduce((sum, cat) => sum + (cat.actualAmount || 0), 0)
    const variance = totalActual - totalBudget

    setFormData(prev => ({
      ...prev,
      totalBudget,
      totalActual,
      variance
    }))
  }, [categories])

  const handleAddCategory = () => {
    setCategories([...categories, { 
      id: `budcat-${Date.now()}`, 
      category: 'supplies',
      budgetedAmount: 0, 
      actualAmount: 0, 
      variance: 0 
    }])
  }

  const handleRemoveCategory = (index: number) => {
    setCategories(categories.filter((_, i) => i !== index))
  }

  const handleCategoryChange = (index: number, field: keyof BudgetCategory, value: any) => {
    const newCategories = [...categories]
    newCategories[index] = { ...newCategories[index], [field]: value }
    
    if (field === 'budgetedAmount' || field === 'actualAmount') {
      const budgeted = field === 'budgetedAmount' ? value : (newCategories[index].budgetedAmount || 0)
      const actual = field === 'actualAmount' ? value : (newCategories[index].actualAmount || 0)
      newCategories[index].variance = actual - budgeted
    }
    
    setCategories(newCategories)
  }

  const handleSubmit = () => {
    if (!formData.budgetName) {
      toast.error('Budget name is required')
      return
    }

    if (categories.length === 0) {
      toast.error('At least one budget category is required')
      return
    }

    const completeCategories: BudgetCategory[] = categories.map(cat => ({
      id: cat.id || `budcat-${Date.now()}`,
      category: cat.category as ExpenseCategory,
      budgetedAmount: cat.budgetedAmount || 0,
      actualAmount: cat.actualAmount || 0,
      variance: cat.variance || 0,
      notes: cat.notes
    }))

    const newBudget: Budget = {
      id: budget?.id || `bud-${Date.now()}`,
      budgetName: formData.budgetName!,
      department: formData.department as Department,
      period: formData.period as BudgetPeriod,
      startDate: formData.startDate!,
      endDate: formData.endDate!,
      categories: completeCategories,
      totalBudget: formData.totalBudget!,
      totalActual: formData.totalActual!,
      variance: formData.variance!,
      status: formData.status!,
      createdAt: formData.createdAt!,
      createdBy: formData.createdBy!,
      approvedBy: formData.approvedBy,
      approvedAt: formData.approvedAt
    }

    onSave(newBudget)
    toast.success(budget ? 'Budget updated successfully' : 'Budget created successfully')
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{budget ? 'Edit Budget' : 'Create New Budget'}</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <Label>Budget Name</Label>
              <Input
                value={formData.budgetName}
                onChange={(e) => setFormData({ ...formData, budgetName: e.target.value })}
                placeholder="Q1 2024 Budget - Finance Department"
              />
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
              <Label>Period</Label>
              <Select value={formData.period} onValueChange={(value) => setFormData({ ...formData, period: value as BudgetPeriod })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="monthly">Monthly</SelectItem>
                  <SelectItem value="quarterly">Quarterly</SelectItem>
                  <SelectItem value="annual">Annual</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Start Date</Label>
              <Input
                type="date"
                value={new Date(formData.startDate!).toISOString().split('T')[0]}
                onChange={(e) => setFormData({ ...formData, startDate: new Date(e.target.value).getTime() })}
              />
            </div>

            <div>
              <Label>End Date</Label>
              <Input
                type="date"
                value={new Date(formData.endDate!).toISOString().split('T')[0]}
                onChange={(e) => setFormData({ ...formData, endDate: new Date(e.target.value).getTime() })}
              />
            </div>

            <div>
              <Label>Status</Label>
              <Select value={formData.status} onValueChange={(value) => setFormData({ ...formData, status: value as Budget['status'] })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="draft">Draft</SelectItem>
                  <SelectItem value="approved">Approved</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="closed">Closed</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-4">
              <Label>Budget Categories</Label>
              <Button type="button" size="sm" onClick={handleAddCategory}>
                <Plus size={16} className="mr-2" />
                Add Category
              </Button>
            </div>

            <div className="space-y-3">
              {categories.map((category, index) => (
                <div key={index} className="p-4 border rounded-lg space-y-3">
                  <div className="grid grid-cols-12 gap-3">
                    <div className="col-span-4">
                      <Label className="text-xs">Category</Label>
                      <Select 
                        value={category.category} 
                        onValueChange={(value) => handleCategoryChange(index, 'category', value as ExpenseCategory)}
                      >
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
                    <div className="col-span-2">
                      <Label className="text-xs">Budgeted</Label>
                      <Input
                        type="number"
                        value={category.budgetedAmount}
                        onChange={(e) => handleCategoryChange(index, 'budgetedAmount', parseFloat(e.target.value) || 0)}
                        min="0"
                        step="0.01"
                      />
                    </div>
                    <div className="col-span-2">
                      <Label className="text-xs">Actual</Label>
                      <Input
                        type="number"
                        value={category.actualAmount}
                        onChange={(e) => handleCategoryChange(index, 'actualAmount', parseFloat(e.target.value) || 0)}
                        min="0"
                        step="0.01"
                      />
                    </div>
                    <div className="col-span-2">
                      <Label className="text-xs">Variance</Label>
                      <Input 
                        value={category.variance?.toFixed(2)} 
                        readOnly 
                        className={`bg-muted ${(category.variance || 0) > 0 ? 'text-destructive' : 'text-success'}`} 
                      />
                    </div>
                    <div className="col-span-1 flex items-end">
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRemoveCategory(index)}
                        className="text-destructive"
                      >
                        <Trash size={16} />
                      </Button>
                    </div>
                  </div>
                  <div>
                    <Input
                      value={category.notes || ''}
                      onChange={(e) => handleCategoryChange(index, 'notes', e.target.value)}
                      placeholder="Notes for this category..."
                      className="text-sm"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-2 border-t pt-4">
            <div className="flex justify-between text-lg font-semibold">
              <span>Total Budgeted:</span>
              <span>${formData.totalBudget?.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-lg font-semibold">
              <span>Total Actual:</span>
              <span className={(formData.totalActual || 0) > (formData.totalBudget || 0) ? 'text-destructive' : 'text-success'}>
                ${formData.totalActual?.toFixed(2)}
              </span>
            </div>
            <div className="flex justify-between text-lg font-semibold border-t pt-2">
              <span>Variance:</span>
              <span className={(formData.variance || 0) > 0 ? 'text-destructive' : 'text-success'}>
                ${formData.variance?.toFixed(2)} {(formData.variance || 0) > 0 ? '(Over)' : '(Under)'}
              </span>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSubmit}>
            {budget ? 'Update Budget' : 'Create Budget'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
