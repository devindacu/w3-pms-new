import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Card } from '@/components/ui/card'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Plus, Trash, Warning } from '@phosphor-icons/react'
import { toast } from 'sonner'
import { type JournalEntry, type JournalEntryLine, type ChartOfAccount, type Department, type JournalType, type GLPostingSource } from '@/lib/types'
import { formatCurrency, formatDate, generateNumber } from '@/lib/helpers'

interface JournalEntryDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  journalEntry?: JournalEntry
  chartOfAccounts: ChartOfAccount[]
  onSave: (entry: JournalEntry) => void
  currentUser: { id: string; firstName: string; lastName: string }
}

export function JournalEntryDialog({
  open,
  onOpenChange,
  journalEntry,
  chartOfAccounts,
  onSave,
  currentUser
}: JournalEntryDialogProps) {
  const [formData, setFormData] = useState<Partial<JournalEntry>>({})
  const [lines, setLines] = useState<Partial<JournalEntryLine>[]>([])
  const [errors, setErrors] = useState<Record<string, string>>({})

  useEffect(() => {
    if (open) {
      if (journalEntry) {
        setFormData(journalEntry)
        setLines(journalEntry.lines || [])
      } else {
        const now = Date.now()
        setFormData({
          journalType: 'general',
          transactionDate: now,
          status: 'draft',
          source: 'manual',
          fiscalPeriod: getFiscalPeriod(now),
          fiscalYear: getFiscalYear(now),
        })
        setLines([createEmptyLine(1)])
      }
      setErrors({})
    }
  }, [open, journalEntry])

  const createEmptyLine = (lineNumber: number): Partial<JournalEntryLine> => ({
    lineNumber,
    debit: 0,
    credit: 0,
    reconciliationStatus: 'unreconciled'
  })

  const getFiscalPeriod = (date: number) => {
    const d = new Date(date)
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
  }

  const getFiscalYear = (date: number) => {
    return new Date(date).getFullYear().toString()
  }

  const calculateTotals = () => {
    const totalDebit = lines.reduce((sum, line) => sum + (line.debit || 0), 0)
    const totalCredit = lines.reduce((sum, line) => sum + (line.credit || 0), 0)
    const isBalanced = Math.abs(totalDebit - totalCredit) < 0.01
    return { totalDebit, totalCredit, isBalanced }
  }

  const handleAddLine = () => {
    setLines([...lines, createEmptyLine(lines.length + 1)])
  }

  const handleRemoveLine = (index: number) => {
    if (lines.length > 1) {
      const newLines = lines.filter((_, i) => i !== index)
      setLines(newLines.map((line, i) => ({ ...line, lineNumber: i + 1 })))
    }
  }

  const handleLineChange = (index: number, field: keyof JournalEntryLine, value: any) => {
    const newLines = [...lines]
    newLines[index] = { ...newLines[index], [field]: value }
    
    if (field === 'accountId') {
      const account = chartOfAccounts.find(a => a.id === value)
      if (account) {
        newLines[index].accountCode = account.accountCode
        newLines[index].accountName = account.accountName
      }
    }
    
    if (field === 'debit' && value > 0) {
      newLines[index].credit = 0
    }
    if (field === 'credit' && value > 0) {
      newLines[index].debit = 0
    }
    
    setLines(newLines)
  }

  const validate = () => {
    const newErrors: Record<string, string> = {}
    
    if (!formData.description?.trim()) {
      newErrors.description = 'Description is required'
    }
    
    if (!formData.transactionDate) {
      newErrors.transactionDate = 'Transaction date is required'
    }
    
    if (lines.length < 2) {
      newErrors.lines = 'At least 2 lines are required for a balanced entry'
    }
    
    lines.forEach((line, index) => {
      if (!line.accountId) {
        newErrors[`line-${index}-account`] = 'Account is required'
      }
      if ((line.debit || 0) === 0 && (line.credit || 0) === 0) {
        newErrors[`line-${index}-amount`] = 'Either debit or credit must be non-zero'
      }
    })
    
    const { isBalanced } = calculateTotals()
    if (!isBalanced) {
      newErrors.balance = 'Debits must equal credits'
    }
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSave = () => {
    if (!validate()) {
      toast.error('Please fix validation errors')
      return
    }
    
    const { totalDebit, totalCredit, isBalanced } = calculateTotals()
    const now = Date.now()
    
    const entry: JournalEntry = {
      id: journalEntry?.id || `je-${Date.now()}`,
      journalNumber: journalEntry?.journalNumber || generateNumber('JE'),
      journalType: formData.journalType as JournalType || 'general',
      status: formData.status || 'draft',
      transactionDate: formData.transactionDate || now,
      postingDate: formData.status === 'posted' ? now : undefined,
      fiscalPeriod: formData.fiscalPeriod || getFiscalPeriod(formData.transactionDate || now),
      fiscalYear: formData.fiscalYear || getFiscalYear(formData.transactionDate || now),
      source: formData.source as GLPostingSource || 'manual',
      sourceDocumentType: formData.sourceDocumentType,
      sourceDocumentId: formData.sourceDocumentId,
      sourceDocumentNumber: formData.sourceDocumentNumber,
      description: formData.description || '',
      reference: formData.reference,
      lines: lines as JournalEntryLine[],
      totalDebit,
      totalCredit,
      isBalanced,
      isRecurring: formData.isRecurring || false,
      recurringTemplateId: formData.recurringTemplateId,
      isReversal: formData.isReversal || false,
      reversalOfEntryId: formData.reversalOfEntryId,
      reversedByEntryId: formData.reversedByEntryId,
      reversalReason: formData.reversalReason,
      attachments: formData.attachments || [],
      tags: formData.tags || [],
      approvalWorkflow: formData.approvalWorkflow,
      createdBy: journalEntry?.createdBy || currentUser.id,
      createdAt: journalEntry?.createdAt || now,
      submittedBy: formData.status === 'pending-approval' ? currentUser.id : formData.submittedBy,
      submittedAt: formData.status === 'pending-approval' ? now : formData.submittedAt,
      approvedBy: formData.status === 'approved' ? currentUser.id : formData.approvedBy,
      approvedAt: formData.status === 'approved' ? now : formData.approvedAt,
      postedBy: formData.status === 'posted' ? currentUser.id : formData.postedBy,
      postedAt: formData.status === 'posted' ? now : formData.postedAt,
      rejectedBy: formData.status === 'rejected' ? currentUser.id : formData.rejectedBy,
      rejectedAt: formData.status === 'rejected' ? now : formData.rejectedAt,
      rejectionReason: formData.rejectionReason,
      auditTrail: journalEntry?.auditTrail || []
    }
    
    onSave(entry)
    onOpenChange(false)
    toast.success(journalEntry ? 'Journal entry updated' : 'Journal entry created')
  }

  const { totalDebit, totalCredit, isBalanced } = calculateTotals()
  const activeAccounts = chartOfAccounts.filter(a => a.isActive)

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-6xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle>
            {journalEntry ? 'Edit Journal Entry' : 'New Journal Entry'}
            {formData.journalNumber && (
              <span className="ml-2 text-sm font-normal text-muted-foreground">
                #{formData.journalNumber}
              </span>
            )}
          </DialogTitle>
        </DialogHeader>

        <ScrollArea className="max-h-[calc(90vh-200px)] pr-4">
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="journalType">Journal Type</Label>
                <Select
                  value={formData.journalType}
                  onValueChange={(value) => setFormData({ ...formData, journalType: value as JournalType })}
                  disabled={!!journalEntry}
                >
                  <SelectTrigger id="journalType">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="general">General Journal</SelectItem>
                    <SelectItem value="sales">Sales Journal</SelectItem>
                    <SelectItem value="purchase">Purchase Journal</SelectItem>
                    <SelectItem value="cash-receipts">Cash Receipts</SelectItem>
                    <SelectItem value="cash-payments">Cash Payments</SelectItem>
                    <SelectItem value="payroll">Payroll</SelectItem>
                    <SelectItem value="depreciation">Depreciation</SelectItem>
                    <SelectItem value="accrual">Accrual</SelectItem>
                    <SelectItem value="adjustment">Adjustment</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="transactionDate">Transaction Date</Label>
                <Input
                  id="transactionDate"
                  type="date"
                  value={formData.transactionDate ? new Date(formData.transactionDate).toISOString().split('T')[0] : ''}
                  onChange={(e) => {
                    const date = new Date(e.target.value).getTime()
                    setFormData({
                      ...formData,
                      transactionDate: date,
                      fiscalPeriod: getFiscalPeriod(date),
                      fiscalYear: getFiscalYear(date)
                    })
                  }}
                  className={errors.transactionDate ? 'border-destructive' : ''}
                />
                {errors.transactionDate && (
                  <p className="text-xs text-destructive">{errors.transactionDate}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="reference">Reference</Label>
                <Input
                  id="reference"
                  value={formData.reference || ''}
                  onChange={(e) => setFormData({ ...formData, reference: e.target.value })}
                  placeholder="Optional reference number"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description *</Label>
              <Textarea
                id="description"
                value={formData.description || ''}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Enter journal entry description"
                rows={2}
                className={errors.description ? 'border-destructive' : ''}
              />
              {errors.description && (
                <p className="text-xs text-destructive">{errors.description}</p>
              )}
            </div>

            <Separator />

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">Journal Lines</h3>
                <Button type="button" size="sm" onClick={handleAddLine}>
                  <Plus size={16} className="mr-2" />
                  Add Line
                </Button>
              </div>

              {errors.lines && (
                <div className="flex items-center gap-2 p-3 bg-destructive/10 rounded-md text-sm text-destructive">
                  <Warning size={16} />
                  {errors.lines}
                </div>
              )}

              <div className="space-y-2">
                {lines.map((line, index) => (
                  <Card key={index} className="p-4">
                    <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-start">
                      <div className="md:col-span-1 flex items-center justify-center font-semibold text-muted-foreground">
                        {line.lineNumber}
                      </div>

                      <div className="md:col-span-4 space-y-1">
                        <Select
                          value={line.accountId}
                          onValueChange={(value) => handleLineChange(index, 'accountId', value)}
                        >
                          <SelectTrigger className={errors[`line-${index}-account`] ? 'border-destructive' : ''}>
                            <SelectValue placeholder="Select account" />
                          </SelectTrigger>
                          <SelectContent>
                            {activeAccounts.map((account) => (
                              <SelectItem key={account.id} value={account.id}>
                                {account.accountCode} - {account.accountName}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        {errors[`line-${index}-account`] && (
                          <p className="text-xs text-destructive">{errors[`line-${index}-account`]}</p>
                        )}
                      </div>

                      <div className="md:col-span-2">
                        <Input
                          type="number"
                          step="0.01"
                          placeholder="Debit"
                          value={line.debit || ''}
                          onChange={(e) => handleLineChange(index, 'debit', parseFloat(e.target.value) || 0)}
                          className={errors[`line-${index}-amount`] ? 'border-destructive' : ''}
                        />
                      </div>

                      <div className="md:col-span-2">
                        <Input
                          type="number"
                          step="0.01"
                          placeholder="Credit"
                          value={line.credit || ''}
                          onChange={(e) => handleLineChange(index, 'credit', parseFloat(e.target.value) || 0)}
                          className={errors[`line-${index}-amount`] ? 'border-destructive' : ''}
                        />
                      </div>

                      <div className="md:col-span-2">
                        <Input
                          placeholder="Description"
                          value={line.description || ''}
                          onChange={(e) => handleLineChange(index, 'description', e.target.value)}
                        />
                      </div>

                      <div className="md:col-span-1 flex justify-end">
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => handleRemoveLine(index)}
                          disabled={lines.length === 1}
                        >
                          <Trash size={16} className="text-destructive" />
                        </Button>
                      </div>
                    </div>
                    {errors[`line-${index}-amount`] && (
                      <p className="text-xs text-destructive mt-2">{errors[`line-${index}-amount`]}</p>
                    )}
                  </Card>
                ))}
              </div>

              <Card className="p-4 bg-muted/50">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <div className="flex items-center gap-4">
                      <span className="text-sm font-medium">Total Debit:</span>
                      <span className="text-lg font-semibold">{formatCurrency(totalDebit)}</span>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="text-sm font-medium">Total Credit:</span>
                      <span className="text-lg font-semibold">{formatCurrency(totalCredit)}</span>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="text-sm font-medium">Difference:</span>
                      <span className={`text-lg font-semibold ${Math.abs(totalDebit - totalCredit) < 0.01 ? 'text-success' : 'text-destructive'}`}>
                        {formatCurrency(Math.abs(totalDebit - totalCredit))}
                      </span>
                    </div>
                  </div>
                  <Badge variant={isBalanced ? 'default' : 'destructive'} className="text-base px-4 py-2">
                    {isBalanced ? '✓ Balanced' : '⚠ Not Balanced'}
                  </Badge>
                </div>
                {errors.balance && (
                  <div className="flex items-center gap-2 mt-3 text-sm text-destructive">
                    <Warning size={16} />
                    {errors.balance}
                  </div>
                )}
              </Card>
            </div>
          </div>
        </ScrollArea>

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={!isBalanced}>
            {journalEntry ? 'Update Entry' : 'Create Entry'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
