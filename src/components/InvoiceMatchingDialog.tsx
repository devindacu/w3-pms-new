import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Separator } from '@/components/ui/separator'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { PrintButton } from '@/components/PrintButton'
import { A4PrintWrapper } from '@/components/A4PrintWrapper'
import {
  Receipt,
  FileText,
  Package,
  Warning,
  CheckCircle,
  XCircle,
  ArrowsLeftRight,
  Lightbulb
} from '@phosphor-icons/react'
import { toast } from 'sonner'
import {
  type Invoice,
  type PurchaseOrder,
  type GoodsReceivedNote,
  type InvoiceMatchingResult,
  type MatchingVariance,
  type MatchingRecommendation,
  type SupplierDispute
} from '@/lib/types'
import { formatCurrency, formatDate, generateId, generateNumber } from '@/lib/helpers'

interface InvoiceMatchingDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  invoice: Invoice
  purchaseOrders: PurchaseOrder[]
  grns: GoodsReceivedNote[]
  onCreateDispute?: (dispute: Partial<SupplierDispute>) => void
  onApproveMatch?: (matchingResult: InvoiceMatchingResult) => void
}

export function InvoiceMatchingDialog({
  open,
  onOpenChange,
  invoice,
  purchaseOrders,
  grns,
  onCreateDispute,
  onApproveMatch
}: InvoiceMatchingDialogProps) {
  const [matchingResult, setMatchingResult] = useState<InvoiceMatchingResult | null>(null)
  const [notes, setNotes] = useState('')
  const [selectedPO, setSelectedPO] = useState<PurchaseOrder | null>(null)
  const [selectedGRN, setSelectedGRN] = useState<GoodsReceivedNote | null>(null)

  useEffect(() => {
    if (open && invoice) {
      performMatching()
    }
  }, [open, invoice])

  const performMatching = () => {
    const po = invoice.purchaseOrderId 
      ? purchaseOrders.find(p => p.id === invoice.purchaseOrderId)
      : null
    
    const grn = invoice.grnId
      ? grns.find(g => g.id === invoice.grnId)
      : null

    setSelectedPO(po || null)
    setSelectedGRN(grn || null)

    if (!po) {
      setMatchingResult({
        id: generateId(),
        invoiceId: invoice.id,
        matchStatus: 'not-matched',
        overallVariance: invoice.total,
        variancePercentage: 100,
        toleranceThreshold: 5,
        itemsMatched: 0,
        itemsMismatched: invoice.items.length,
        itemsMissing: 0,
        itemsAdditional: 0,
        quantityVariances: [],
        priceVariances: [],
        totalVariances: [],
        recommendations: [{
          type: 'create-dispute',
          priority: 'action-required',
          message: 'No Purchase Order found for this invoice. Manual review required.',
          actionLabel: 'Create Dispute'
        }],
        requiresApproval: true,
        approvalLevel: 'senior-manager',
        matchedAt: Date.now(),
        auditTrail: []
      })
      return
    }

    const quantityVariances: MatchingVariance[] = []
    const priceVariances: MatchingVariance[] = []
    const totalVariances: MatchingVariance[] = []
    
    let itemsMatched = 0
    let itemsMismatched = 0
    let overallVariance = 0

    invoice.items.forEach(invItem => {
      const poItem = po.items.find(p => p.inventoryItemId === invItem.inventoryItemId)
      const grnItem = grn?.items.find(g => g.inventoryItemId === invItem.inventoryItemId)

      if (!poItem) {
        itemsMismatched++
        totalVariances.push({
          itemId: invItem.id,
          itemName: invItem.itemName,
          field: 'total',
          invoiceValue: invItem.total,
          variance: invItem.total,
          variancePercentage: 100,
          isWithinTolerance: false,
          requiresAction: true,
          suggestedAction: 'Item not found in PO - verify or create dispute'
        })
        overallVariance += invItem.total
        return
      }

      const qtyToCompare = grnItem ? grnItem.receivedQuantity : poItem.quantity
      const qtyVariance = invItem.quantity - qtyToCompare
      const qtyVariancePercent = (qtyVariance / qtyToCompare) * 100

      if (Math.abs(qtyVariancePercent) > 0.1) {
        quantityVariances.push({
          itemId: invItem.id,
          itemName: invItem.itemName,
          field: 'quantity',
          poValue: poItem.quantity,
          grnValue: grnItem?.receivedQuantity,
          invoiceValue: invItem.quantity,
          variance: qtyVariance,
          variancePercentage: qtyVariancePercent,
          isWithinTolerance: Math.abs(qtyVariancePercent) <= 5,
          requiresAction: Math.abs(qtyVariancePercent) > 5,
          suggestedAction: Math.abs(qtyVariancePercent) > 5 
            ? 'Quantity mismatch exceeds tolerance'
            : 'Within tolerance'
        })
      }

      const priceVariance = invItem.unitPrice - poItem.unitPrice
      const priceVariancePercent = (priceVariance / poItem.unitPrice) * 100

      if (Math.abs(priceVariancePercent) > 0.1) {
        priceVariances.push({
          itemId: invItem.id,
          itemName: invItem.itemName,
          field: 'price',
          poValue: poItem.unitPrice,
          invoiceValue: invItem.unitPrice,
          variance: priceVariance,
          variancePercentage: priceVariancePercent,
          isWithinTolerance: Math.abs(priceVariancePercent) <= 5,
          requiresAction: Math.abs(priceVariancePercent) > 5,
          suggestedAction: Math.abs(priceVariancePercent) > 5 
            ? 'Price variance exceeds tolerance - verify with supplier'
            : 'Within tolerance'
        })
      }

      const totalVariance = invItem.total - (poItem.unitPrice * qtyToCompare)
      const totalVariancePercent = (totalVariance / (poItem.unitPrice * qtyToCompare)) * 100

      if (Math.abs(totalVariancePercent) > 0.1) {
        totalVariances.push({
          itemId: invItem.id,
          itemName: invItem.itemName,
          field: 'total',
          poValue: poItem.total,
          grnValue: grnItem ? grnItem.receivedQuantity * (grnItem.unitPrice || poItem.unitPrice) : undefined,
          invoiceValue: invItem.total,
          variance: totalVariance,
          variancePercentage: totalVariancePercent,
          isWithinTolerance: Math.abs(totalVariancePercent) <= 5,
          requiresAction: Math.abs(totalVariancePercent) > 5
        })
        overallVariance += totalVariance
      }

      if (Math.abs(qtyVariancePercent) <= 5 && Math.abs(priceVariancePercent) <= 5) {
        itemsMatched++
      } else {
        itemsMismatched++
      }
    })

    const poTotalVariance = invoice.total - po.total
    const poTotalVariancePercent = (poTotalVariance / po.total) * 100

    const recommendations: MatchingRecommendation[] = []
    
    if (itemsMatched === invoice.items.length && Math.abs(poTotalVariancePercent) <= 5) {
      recommendations.push({
        type: 'approve' as const,
        priority: 'info' as const,
        message: 'Invoice matches PO and GRN within acceptable tolerance',
        actionLabel: 'Auto-Approve'
      })
    } else if (Math.abs(poTotalVariancePercent) > 5) {
      recommendations.push({
        type: 'create-dispute' as const,
        priority: 'action-required' as const,
        message: 'Significant variance detected - consider creating a dispute',
        actionLabel: 'Create Dispute'
      })
    } else {
      recommendations.push({
        type: 'request-clarification' as const,
        priority: 'warning' as const,
        message: 'Minor variances detected - manager approval recommended',
        actionLabel: 'Request Approval'
      })
    }

    const matchStatus = 
      itemsMatched === invoice.items.length && Math.abs(poTotalVariancePercent) <= 5
        ? 'fully-matched' as const
        : itemsMatched > 0 && Math.abs(poTotalVariancePercent) <= 5
        ? 'variance-within-tolerance' as const
        : itemsMatched > 0
        ? 'partially-matched' as const
        : 'not-matched' as const

    setMatchingResult({
      id: generateId(),
      invoiceId: invoice.id,
      purchaseOrderId: po.id,
      grnId: grn?.id,
      matchStatus,
      overallVariance,
      variancePercentage: poTotalVariancePercent,
      toleranceThreshold: 5,
      itemsMatched,
      itemsMismatched,
      itemsMissing: 0,
      itemsAdditional: 0,
      quantityVariances,
      priceVariances,
      totalVariances,
      recommendations,
      requiresApproval: Math.abs(poTotalVariancePercent) > 5 || itemsMismatched > 0,
      approvalLevel: Math.abs(poTotalVariancePercent) > 10 ? 'senior-manager' : 'manager',
      matchedAt: Date.now(),
      notes,
      auditTrail: []
    })
  }

  const handleApprove = () => {
    if (matchingResult && onApproveMatch) {
      onApproveMatch(matchingResult)
      toast.success('Invoice matching approved')
      onOpenChange(false)
    }
  }

  const handleCreateDispute = () => {
    if (onCreateDispute && selectedPO) {
      const disputeItems = matchingResult?.totalVariances
        .filter(v => v.requiresAction)
        .map(v => ({
          id: generateId(),
          itemName: v.itemName,
          inventoryItemId: v.itemId,
          issueDescription: `Variance: ${v.field} - Expected: ${formatCurrency(v.poValue || 0)}, Actual: ${formatCurrency(v.invoiceValue || 0)}`,
          orderedQuantity: matchingResult.quantityVariances.find(q => q.itemId === v.itemId)?.poValue,
          orderedPrice: matchingResult.priceVariances.find(p => p.itemId === v.itemId)?.poValue,
          invoicedPrice: matchingResult.priceVariances.find(p => p.itemId === v.itemId)?.invoiceValue,
          disputedAmount: v.variance
        })) || []

      onCreateDispute({
        supplierId: invoice.supplierId,
        supplierName: invoice.supplierName,
        purchaseOrderId: selectedPO.id,
        invoiceId: invoice.id,
        grnId: selectedGRN?.id,
        disputeType: 'invoice-mismatch',
        priority: matchingResult && Math.abs(matchingResult.variancePercentage) > 10 ? 'high' : 'medium',
        title: `Invoice Mismatch - ${invoice.invoiceNumber}`,
        description: `Invoice total variance of ${formatCurrency(matchingResult?.overallVariance || 0)} detected`,
        disputedAmount: invoice.total,
        claimAmount: matchingResult?.overallVariance || 0,
        items: disputeItems
      })
      
      toast.success('Dispute created')
      onOpenChange(false)
    }
  }

  const getStatusBadge = (status: string) => {
    const variants = {
      'fully-matched': { variant: 'default' as const, icon: CheckCircle },
      'variance-within-tolerance': { variant: 'secondary' as const, icon: CheckCircle },
      'partially-matched': { variant: 'outline' as const, icon: Warning },
      'not-matched': { variant: 'destructive' as const, icon: XCircle }
    }
    const config = variants[status as keyof typeof variants] || variants['not-matched']
    const Icon = config.icon
    
    return (
      <Badge variant={config.variant} className="gap-1">
        <Icon size={16} />
        {status.replace(/-/g, ' ').toUpperCase()}
      </Badge>
    )
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-6xl max-h-[95vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="flex items-center gap-3">
              <ArrowsLeftRight size={24} />
              Invoice Matching - {invoice.invoiceNumber}
            </DialogTitle>
            <div className="flex items-center gap-2">
              {matchingResult && getStatusBadge(matchingResult.matchStatus)}
              <PrintButton
                elementId="invoice-matching-print"
                options={{
                  title: 'Invoice Matching Report',
                  filename: `invoice-matching-${invoice.invoiceNumber}-${formatDate(Date.now()).replace(/\//g, '-')}.pdf`
                }}
              />
            </div>
          </div>
        </DialogHeader>

        {!matchingResult ? (
          <div className="py-12 text-center">
            <p className="text-muted-foreground">Analyzing invoice...</p>
          </div>
        ) : (
          <Tabs defaultValue="summary" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="summary">Summary</TabsTrigger>
              <TabsTrigger value="variances">Variances</TabsTrigger>
              <TabsTrigger value="documents">Documents</TabsTrigger>
              <TabsTrigger value="recommendations">Recommendations</TabsTrigger>
            </TabsList>

            <TabsContent value="summary" className="space-y-4">
              <div className="grid grid-cols-3 gap-4">
                <Card className="p-4">
                  <div className="flex items-center gap-3 mb-2">
                    <Receipt size={20} className="text-primary" />
                    <h3 className="font-semibold">Invoice</h3>
                  </div>
                  <p className="text-sm text-muted-foreground mb-1">{invoice.invoiceNumber}</p>
                  <p className="text-2xl font-bold">{formatCurrency(invoice.total)}</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Date: {formatDate(invoice.invoiceDate)}
                  </p>
                </Card>

                <Card className="p-4">
                  <div className="flex items-center gap-3 mb-2">
                    <FileText size={20} className="text-blue-500" />
                    <h3 className="font-semibold">Purchase Order</h3>
                  </div>
                  {selectedPO ? (
                    <>
                      <p className="text-sm text-muted-foreground mb-1">{selectedPO.poNumber}</p>
                      <p className="text-2xl font-bold">{formatCurrency(selectedPO.total)}</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {selectedPO.items.length} items
                      </p>
                    </>
                  ) : (
                    <p className="text-sm text-destructive">No PO linked</p>
                  )}
                </Card>

                <Card className="p-4">
                  <div className="flex items-center gap-3 mb-2">
                    <Package size={20} className="text-green-500" />
                    <h3 className="font-semibold">GRN</h3>
                  </div>
                  {selectedGRN ? (
                    <>
                      <p className="text-sm text-muted-foreground mb-1">{selectedGRN.grnNumber}</p>
                      <p className="text-sm">Received: {formatDate(selectedGRN.receivedAt)}</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {selectedGRN.items.length} items
                      </p>
                    </>
                  ) : (
                    <p className="text-sm text-muted-foreground">No GRN linked</p>
                  )}
                </Card>
              </div>

              <Separator />

              <div className="grid grid-cols-4 gap-4">
                <Card className="p-4">
                  <p className="text-sm text-muted-foreground mb-1">Items Matched</p>
                  <p className="text-3xl font-bold text-green-600">{matchingResult.itemsMatched}</p>
                </Card>
                <Card className="p-4">
                  <p className="text-sm text-muted-foreground mb-1">Mismatched</p>
                  <p className="text-3xl font-bold text-destructive">{matchingResult.itemsMismatched}</p>
                </Card>
                <Card className="p-4">
                  <p className="text-sm text-muted-foreground mb-1">Overall Variance</p>
                  <p className={`text-2xl font-bold ${matchingResult.overallVariance > 0 ? 'text-destructive' : 'text-green-600'}`}>
                    {formatCurrency(Math.abs(matchingResult.overallVariance))}
                  </p>
                </Card>
                <Card className="p-4">
                  <p className="text-sm text-muted-foreground mb-1">Variance %</p>
                  <p className={`text-2xl font-bold ${Math.abs(matchingResult.variancePercentage) > 5 ? 'text-destructive' : 'text-green-600'}`}>
                    {matchingResult.variancePercentage.toFixed(2)}%
                  </p>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="variances" className="space-y-4">
              {matchingResult.quantityVariances.length > 0 && (
                <div>
                  <h3 className="font-semibold mb-3">Quantity Variances</h3>
                  <div className="space-y-2">
                    {matchingResult.quantityVariances.map(v => (
                      <Card key={v.itemId} className={`p-3 ${v.requiresAction ? 'border-destructive' : ''}`}>
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium">{v.itemName}</p>
                            <div className="flex gap-4 text-sm text-muted-foreground mt-1">
                              <span>PO: {v.poValue}</span>
                              {v.grnValue && <span>GRN: {v.grnValue}</span>}
                              <span>Invoice: {v.invoiceValue}</span>
                            </div>
                            {v.suggestedAction && (
                              <p className="text-xs text-muted-foreground mt-1">{v.suggestedAction}</p>
                            )}
                          </div>
                          <div className="text-right">
                            <p className={`font-semibold ${v.variance > 0 ? 'text-destructive' : 'text-green-600'}`}>
                              {v.variance > 0 ? '+' : ''}{v.variance}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {v.variancePercentage.toFixed(2)}%
                            </p>
                            {v.isWithinTolerance && (
                              <Badge variant="secondary" className="mt-1 text-xs">Within Tolerance</Badge>
                            )}
                          </div>
                        </div>
                      </Card>
                    ))}
                  </div>
                </div>
              )}

              {matchingResult.priceVariances.length > 0 && (
                <div>
                  <h3 className="font-semibold mb-3">Price Variances</h3>
                  <div className="space-y-2">
                    {matchingResult.priceVariances.map(v => (
                      <Card key={v.itemId} className={`p-3 ${v.requiresAction ? 'border-destructive' : ''}`}>
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium">{v.itemName}</p>
                            <div className="flex gap-4 text-sm text-muted-foreground mt-1">
                              <span>PO: {formatCurrency(v.poValue || 0)}</span>
                              <span>Invoice: {formatCurrency(v.invoiceValue || 0)}</span>
                            </div>
                            {v.suggestedAction && (
                              <p className="text-xs text-muted-foreground mt-1">{v.suggestedAction}</p>
                            )}
                          </div>
                          <div className="text-right">
                            <p className={`font-semibold ${v.variance > 0 ? 'text-destructive' : 'text-green-600'}`}>
                              {formatCurrency(Math.abs(v.variance))}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {v.variancePercentage.toFixed(2)}%
                            </p>
                            {v.isWithinTolerance && (
                              <Badge variant="secondary" className="mt-1 text-xs">Within Tolerance</Badge>
                            )}
                          </div>
                        </div>
                      </Card>
                    ))}
                  </div>
                </div>
              )}

              {matchingResult.quantityVariances.length === 0 && matchingResult.priceVariances.length === 0 && (
                <Card className="p-8 text-center">
                  <CheckCircle size={48} className="mx-auto text-green-600 mb-3" />
                  <p className="text-lg font-semibold">No Variances Detected</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    All items match within acceptable tolerance
                  </p>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="documents" className="space-y-4">
              <div className="grid grid-cols-3 gap-4">
                <Card className="p-4">
                  <h3 className="font-semibold mb-3">Invoice Details</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Number:</span>
                      <span className="font-medium">{invoice.invoiceNumber}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Date:</span>
                      <span>{formatDate(invoice.invoiceDate)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Subtotal:</span>
                      <span>{formatCurrency(invoice.subtotal)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Tax:</span>
                      <span>{formatCurrency(invoice.tax)}</span>
                    </div>
                    <div className="flex justify-between font-semibold">
                      <span>Total:</span>
                      <span>{formatCurrency(invoice.total)}</span>
                    </div>
                  </div>
                </Card>

                {selectedPO && (
                  <Card className="p-4">
                    <h3 className="font-semibold mb-3">PO Details</h3>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Number:</span>
                        <span className="font-medium">{selectedPO.poNumber}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Date:</span>
                        <span>{formatDate(selectedPO.createdAt)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Subtotal:</span>
                        <span>{formatCurrency(selectedPO.subtotal)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Tax:</span>
                        <span>{formatCurrency(selectedPO.tax)}</span>
                      </div>
                      <div className="flex justify-between font-semibold">
                        <span>Total:</span>
                        <span>{formatCurrency(selectedPO.total)}</span>
                      </div>
                    </div>
                  </Card>
                )}

                {selectedGRN && (
                  <Card className="p-4">
                    <h3 className="font-semibold mb-3">GRN Details</h3>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Number:</span>
                        <span className="font-medium">{selectedGRN.grnNumber}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Received:</span>
                        <span>{formatDate(selectedGRN.receivedAt)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Received By:</span>
                        <span>{selectedGRN.receivedBy}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Has Variance:</span>
                        <span>{selectedGRN.hasVariance ? 'Yes' : 'No'}</span>
                      </div>
                    </div>
                  </Card>
                )}
              </div>
            </TabsContent>

            <TabsContent value="recommendations" className="space-y-4">
              <div className="space-y-3">
                {matchingResult.recommendations.map((rec, idx) => (
                  <Alert 
                    key={idx}
                    variant={rec.priority === 'action-required' ? 'destructive' : 'default'}
                  >
                    <Lightbulb size={20} />
                    <AlertDescription>
                      <p className="font-semibold mb-1">{rec.message}</p>
                      {rec.actionLabel && (
                        <Button 
                          size="sm" 
                          variant={rec.priority === 'action-required' ? 'destructive' : 'outline'}
                          className="mt-2"
                          onClick={() => {
                            if (rec.type === 'create-dispute') {
                              handleCreateDispute()
                            } else if (rec.type === 'approve') {
                              handleApprove()
                            }
                          }}
                        >
                          {rec.actionLabel}
                        </Button>
                      )}
                    </AlertDescription>
                  </Alert>
                ))}
              </div>

              <div>
                <Label>Approval Notes</Label>
                <Textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Add notes for approval or dispute..."
                  rows={3}
                />
              </div>
            </TabsContent>
          </Tabs>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Close
          </Button>
          {matchingResult && matchingResult.matchStatus !== 'not-matched' && (
            <Button onClick={handleApprove}>
              <CheckCircle size={18} className="mr-2" />
              Approve Match
            </Button>
          )}
          {matchingResult && matchingResult.itemsMismatched > 0 && (
            <Button variant="destructive" onClick={handleCreateDispute}>
              <Warning size={18} className="mr-2" />
              Create Dispute
            </Button>
          )}
        </DialogFooter>

        <div className="hidden">
          <A4PrintWrapper id="invoice-matching-print" title={`Invoice Matching Report - ${invoice.invoiceNumber}`}>
            <div className="space-y-6">
              <div className="border-b pb-4">
                <div className="flex justify-between items-center">
                  <div>
                    <h2 className="text-xl font-semibold">Invoice Matching Analysis</h2>
                    <p className="text-sm text-gray-600">Generated: {formatDate(Date.now())}</p>
                  </div>
                  {matchingResult && (
                    <div className="text-right">
                      <div className="text-sm text-gray-600">Match Status</div>
                      <div className="text-lg font-bold">{matchingResult.matchStatus.replace(/-/g, ' ').toUpperCase()}</div>
                    </div>
                  )}
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-3">Document Summary</h3>
                <table className="w-full border-collapse mb-4">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-2 px-3">Document Type</th>
                      <th className="text-left py-2 px-3">Number</th>
                      <th className="text-left py-2 px-3">Date</th>
                      <th className="text-right py-2 px-3">Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b">
                      <td className="py-2 px-3">Invoice</td>
                      <td className="py-2 px-3">{invoice.invoiceNumber}</td>
                      <td className="py-2 px-3">{formatDate(invoice.invoiceDate)}</td>
                      <td className="py-2 px-3 text-right font-semibold">{formatCurrency(invoice.total)}</td>
                    </tr>
                    {selectedPO && (
                      <tr className="border-b">
                        <td className="py-2 px-3">Purchase Order</td>
                        <td className="py-2 px-3">{selectedPO.poNumber}</td>
                        <td className="py-2 px-3">{formatDate(selectedPO.createdAt)}</td>
                        <td className="py-2 px-3 text-right font-semibold">{formatCurrency(selectedPO.total)}</td>
                      </tr>
                    )}
                    {selectedGRN && (
                      <tr className="border-b">
                        <td className="py-2 px-3">GRN</td>
                        <td className="py-2 px-3">{selectedGRN.grnNumber}</td>
                        <td className="py-2 px-3">{formatDate(selectedGRN.receivedAt)}</td>
                        <td className="py-2 px-3 text-right">{selectedGRN.items.length} items</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {matchingResult && (
                <>
                  <div>
                    <h3 className="text-lg font-semibold mb-3">Matching Statistics</h3>
                    <table className="w-full border-collapse mb-4">
                      <tbody>
                        <tr className="border-b">
                          <td className="py-2 px-3">Items Matched</td>
                          <td className="py-2 px-3 text-right font-semibold text-green-600">{matchingResult.itemsMatched}</td>
                        </tr>
                        <tr className="border-b">
                          <td className="py-2 px-3">Items Mismatched</td>
                          <td className="py-2 px-3 text-right font-semibold text-red-600">{matchingResult.itemsMismatched}</td>
                        </tr>
                        <tr className="border-b">
                          <td className="py-2 px-3">Overall Variance</td>
                          <td className="py-2 px-3 text-right font-semibold">{formatCurrency(Math.abs(matchingResult.overallVariance))}</td>
                        </tr>
                        <tr className="border-b">
                          <td className="py-2 px-3">Variance Percentage</td>
                          <td className="py-2 px-3 text-right font-semibold">{matchingResult.variancePercentage.toFixed(2)}%</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>

                  {matchingResult.quantityVariances.length > 0 && (
                    <div>
                      <h3 className="text-lg font-semibold mb-3">Quantity Variances</h3>
                      <table className="w-full border-collapse mb-4">
                        <thead>
                          <tr className="border-b bg-gray-50">
                            <th className="text-left py-2 px-3">Item</th>
                            <th className="text-right py-2 px-3">PO Qty</th>
                            <th className="text-right py-2 px-3">GRN Qty</th>
                            <th className="text-right py-2 px-3">Invoice Qty</th>
                            <th className="text-right py-2 px-3">Variance</th>
                            <th className="text-right py-2 px-3">%</th>
                          </tr>
                        </thead>
                        <tbody>
                          {matchingResult.quantityVariances.map((v, idx) => (
                            <tr key={idx} className="border-b">
                              <td className="py-2 px-3">{v.itemName}</td>
                              <td className="py-2 px-3 text-right">{v.poValue}</td>
                              <td className="py-2 px-3 text-right">{v.grnValue || '-'}</td>
                              <td className="py-2 px-3 text-right">{v.invoiceValue}</td>
                              <td className="py-2 px-3 text-right font-semibold">{v.variance > 0 ? '+' : ''}{v.variance}</td>
                              <td className="py-2 px-3 text-right">{v.variancePercentage.toFixed(2)}%</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}

                  {matchingResult.priceVariances.length > 0 && (
                    <div>
                      <h3 className="text-lg font-semibold mb-3">Price Variances</h3>
                      <table className="w-full border-collapse mb-4">
                        <thead>
                          <tr className="border-b bg-gray-50">
                            <th className="text-left py-2 px-3">Item</th>
                            <th className="text-right py-2 px-3">PO Price</th>
                            <th className="text-right py-2 px-3">Invoice Price</th>
                            <th className="text-right py-2 px-3">Variance</th>
                            <th className="text-right py-2 px-3">%</th>
                          </tr>
                        </thead>
                        <tbody>
                          {matchingResult.priceVariances.map((v, idx) => (
                            <tr key={idx} className="border-b">
                              <td className="py-2 px-3">{v.itemName}</td>
                              <td className="py-2 px-3 text-right">{formatCurrency(v.poValue || 0)}</td>
                              <td className="py-2 px-3 text-right">{formatCurrency(v.invoiceValue || 0)}</td>
                              <td className="py-2 px-3 text-right font-semibold">{formatCurrency(Math.abs(v.variance))}</td>
                              <td className="py-2 px-3 text-right">{v.variancePercentage.toFixed(2)}%</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}

                  {matchingResult.recommendations.length > 0 && (
                    <div>
                      <h3 className="text-lg font-semibold mb-3">Recommendations</h3>
                      <div className="space-y-2">
                        {matchingResult.recommendations.map((rec, idx) => (
                          <div key={idx} className="border-l-4 border-gray-300 pl-3 py-2">
                            <p className="font-medium">{rec.message}</p>
                            <p className="text-sm text-gray-600">Priority: {rec.priority}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          </A4PrintWrapper>
        </div>
      </DialogContent>
    </Dialog>
  )
}
