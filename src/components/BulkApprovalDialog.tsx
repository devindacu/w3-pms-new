import { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Check,
  X,
  Warning,
  FileText,
  CurrencyDollar,
  Calendar,
  CheckCircle
} from '@phosphor-icons/react'
import { type Invoice, type SystemUser } from '@/lib/types'
import { formatCurrency, formatDate } from '@/lib/helpers'
import { toast } from 'sonner'

interface BulkApprovalDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  invoices: Invoice[]
  onApprove: (invoiceIds: string[], notes?: string) => void
  currentUser: SystemUser
}

export function BulkApprovalDialog({
  open,
  onOpenChange,
  invoices,
  onApprove,
  currentUser
}: BulkApprovalDialogProps) {
  const [selectedInvoiceIds, setSelectedInvoiceIds] = useState<string[]>([])
  const [approvalNotes, setApprovalNotes] = useState('')
  const [isProcessing, setIsProcessing] = useState(false)

  const pendingInvoices = invoices.filter(
    inv => inv.status === 'pending-validation' || 
           inv.status === 'validated' || 
           inv.status === 'matched'
  )

  const allSelected = selectedInvoiceIds.length === pendingInvoices.length && pendingInvoices.length > 0
  const someSelected = selectedInvoiceIds.length > 0 && selectedInvoiceIds.length < pendingInvoices.length

  const toggleAll = () => {
    if (allSelected) {
      setSelectedInvoiceIds([])
    } else {
      setSelectedInvoiceIds(pendingInvoices.map(inv => inv.id))
    }
  }

  const toggleInvoice = (invoiceId: string) => {
    setSelectedInvoiceIds(prev =>
      prev.includes(invoiceId)
        ? prev.filter(id => id !== invoiceId)
        : [...prev, invoiceId]
    )
  }

  const handleApprove = async () => {
    if (selectedInvoiceIds.length === 0) {
      toast.error('Please select at least one invoice to approve')
      return
    }

    setIsProcessing(true)

    try {
      await onApprove(selectedInvoiceIds, approvalNotes || undefined)
      
      toast.success(
        `Successfully approved ${selectedInvoiceIds.length} invoice${selectedInvoiceIds.length > 1 ? 's' : ''}`,
        {
          description: approvalNotes ? `Note: ${approvalNotes}` : undefined
        }
      )
      
      setSelectedInvoiceIds([])
      setApprovalNotes('')
      onOpenChange(false)
    } catch (error) {
      toast.error('Failed to approve invoices')
    } finally {
      setIsProcessing(false)
    }
  }

  const selectedInvoices = pendingInvoices.filter(inv => selectedInvoiceIds.includes(inv.id))
  const totalAmount = selectedInvoices.reduce((sum, inv) => sum + inv.total, 0)
  const totalBalance = selectedInvoices.reduce((sum, inv) => sum + inv.balance, 0)

  const getStatusBadge = (status: Invoice['status']) => {
    const colors = {
      'pending-validation': 'bg-muted-foreground/10 text-muted-foreground',
      'validated': 'bg-primary/10 text-primary',
      'matched': 'bg-success/10 text-success',
      'mismatch': 'bg-destructive/10 text-destructive'
    } as const

    type StatusKey = keyof typeof colors
    const color = colors[status as StatusKey] || 'bg-muted-foreground/10 text-muted-foreground'

    return (
      <Badge variant="outline" className={color}>
        {status.replace('-', ' ')}
      </Badge>
    )
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-2xl">
            <CheckCircle size={28} className="text-primary" />
            Bulk Invoice Approval
          </DialogTitle>
          <p className="text-sm text-muted-foreground">
            Review and approve multiple pending invoices at once
          </p>
        </DialogHeader>

        {pendingInvoices.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <Check size={64} className="text-success mb-4" />
            <h3 className="text-lg font-semibold mb-2">All Caught Up!</h3>
            <p className="text-muted-foreground">
              There are no pending invoices requiring approval at this time.
            </p>
          </div>
        ) : (
          <>
            <div className="space-y-4 flex-1 overflow-hidden flex flex-col">
              <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <Checkbox
                      id="select-all"
                      checked={allSelected}
                      onCheckedChange={toggleAll}
                      className={someSelected ? 'data-[state=checked]:bg-primary/50' : ''}
                    />
                    <Label htmlFor="select-all" className="font-semibold cursor-pointer">
                      {allSelected ? 'Deselect All' : 'Select All'} ({pendingInvoices.length} pending)
                    </Label>
                  </div>
                  {selectedInvoiceIds.length > 0 && (
                    <Badge variant="default" className="bg-primary">
                      {selectedInvoiceIds.length} selected
                    </Badge>
                  )}
                </div>
                {selectedInvoiceIds.length > 0 && (
                  <div className="text-right">
                    <p className="text-sm text-muted-foreground">Total Amount</p>
                    <p className="text-lg font-semibold">{formatCurrency(totalAmount)}</p>
                  </div>
                )}
              </div>

              <ScrollArea className="flex-1 pr-4">
                <div className="space-y-3">
                  {pendingInvoices.map((invoice) => {
                    const isSelected = selectedInvoiceIds.includes(invoice.id)
                    const hasVariance = invoice.matchingResult && 
                      invoice.matchingResult.overallVariance > 0

                    return (
                      <div
                        key={invoice.id}
                        className={`p-4 rounded-lg border-2 transition-all cursor-pointer ${
                          isSelected
                            ? 'border-primary bg-primary/5'
                            : 'border-border bg-background hover:border-primary/50'
                        }`}
                        onClick={() => toggleInvoice(invoice.id)}
                      >
                        <div className="flex items-start gap-4">
                          <Checkbox
                            checked={isSelected}
                            onCheckedChange={() => toggleInvoice(invoice.id)}
                            onClick={(e) => e.stopPropagation()}
                          />
                          
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-3 mb-3">
                              <FileText size={20} className="text-primary shrink-0" />
                              <h4 className="font-semibold truncate">{invoice.invoiceNumber}</h4>
                              {getStatusBadge(invoice.status)}
                              {hasVariance && (
                                <Badge variant="outline" className="bg-accent/10 text-accent">
                                  <Warning size={14} className="mr-1" />
                                  Variance
                                </Badge>
                              )}
                            </div>

                            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                              <div>
                                <p className="text-muted-foreground text-xs mb-1">Supplier</p>
                                <p className="font-medium truncate">{invoice.supplierName || 'N/A'}</p>
                              </div>
                              <div>
                                <p className="text-muted-foreground text-xs mb-1">Invoice Date</p>
                                <p className="font-medium flex items-center gap-1">
                                  <Calendar size={14} className="shrink-0" />
                                  {formatDate(invoice.invoiceDate)}
                                </p>
                              </div>
                              <div>
                                <p className="text-muted-foreground text-xs mb-1">Due Date</p>
                                <p className="font-medium flex items-center gap-1">
                                  <Calendar size={14} className="shrink-0" />
                                  {formatDate(invoice.dueDate)}
                                </p>
                              </div>
                              <div>
                                <p className="text-muted-foreground text-xs mb-1">Amount</p>
                                <p className="font-semibold flex items-center gap-1">
                                  <CurrencyDollar size={14} className="shrink-0" />
                                  {formatCurrency(invoice.total)}
                                </p>
                              </div>
                            </div>

                            {hasVariance && (
                              <div className="mt-3 p-2 bg-accent/5 rounded border border-accent/20">
                                <p className="text-xs text-accent">
                                  <Warning size={12} className="inline mr-1" />
                                  Variance: {formatCurrency(invoice.matchingResult?.overallVariance || 0)}
                                  {invoice.matchingResult && 
                                    ` (${invoice.matchingResult.variancePercentage.toFixed(2)}%)`
                                  }
                                </p>
                              </div>
                            )}

                            {invoice.notes && (
                              <div className="mt-3 p-2 bg-muted/30 rounded">
                                <p className="text-xs text-muted-foreground">{invoice.notes}</p>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </ScrollArea>

              {selectedInvoiceIds.length > 0 && (
                <>
                  <Separator />
                  <div className="space-y-3">
                    <div className="grid grid-cols-2 gap-4 p-4 bg-muted/50 rounded-lg">
                      <div>
                        <p className="text-sm text-muted-foreground mb-1">Selected Invoices</p>
                        <p className="text-2xl font-semibold">{selectedInvoiceIds.length}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground mb-1">Total Balance to Approve</p>
                        <p className="text-2xl font-semibold text-primary">{formatCurrency(totalBalance)}</p>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="approval-notes" className="text-sm font-medium">
                        Approval Notes (Optional)
                      </Label>
                      <Textarea
                        id="approval-notes"
                        placeholder="Add any notes or comments for this bulk approval..."
                        value={approvalNotes}
                        onChange={(e) => setApprovalNotes(e.target.value)}
                        rows={3}
                        className="resize-none"
                      />
                    </div>
                  </div>
                </>
              )}
            </div>

            <DialogFooter className="gap-2">
              <Button
                variant="outline"
                onClick={() => {
                  setSelectedInvoiceIds([])
                  setApprovalNotes('')
                  onOpenChange(false)
                }}
                disabled={isProcessing}
              >
                <X size={18} className="mr-2" />
                Cancel
              </Button>
              <Button
                onClick={handleApprove}
                disabled={selectedInvoiceIds.length === 0 || isProcessing}
                className="min-w-[140px]"
              >
                {isProcessing ? (
                  <>Processing...</>
                ) : (
                  <>
                    <Check size={18} className="mr-2" />
                    Approve {selectedInvoiceIds.length > 0 ? `(${selectedInvoiceIds.length})` : ''}
                  </>
                )}
              </Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  )
}
