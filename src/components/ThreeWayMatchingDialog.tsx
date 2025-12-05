import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Separator } from '@/components/ui/separator'
import { ScrollArea } from '@/components/ui/scroll-area'
import { toast } from 'sonner'
import {
  CheckCircle,
  XCircle,
  WarningCircle,
  FileText,
  TrendUp,
  TrendDown,
  Minus,
  ArrowsClockwise,
  Receipt,
  Package,
  ShoppingCart
} from '@phosphor-icons/react'
import type {
  Invoice,
  PurchaseOrder,
  GoodsReceivedNote,
  InvoiceMatchingResult,
  MatchingVariance,
  MatchingRecommendation,
  MatchingAuditEntry,
  Supplier,
  SystemUser,
  SupplierDispute
} from '@/lib/types'
import { formatCurrency, formatDate, formatPercent } from '@/lib/helpers'

interface ThreeWayMatchingDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  invoice: Invoice | null
  purchaseOrders: PurchaseOrder[]
  grns: GoodsReceivedNote[]
  suppliers: Supplier[]
  currentUser: SystemUser
  onMatchComplete: (matchingResult: InvoiceMatchingResult) => void
  onCreateDispute?: (dispute: Partial<SupplierDispute>) => void
}

export function ThreeWayMatchingDialog({
  open,
  onOpenChange,
  invoice,
  purchaseOrders,
  grns,
  suppliers,
  currentUser,
  onMatchComplete,
  onCreateDispute
}: ThreeWayMatchingDialogProps) {
  const [matchingResult, setMatchingResult] = useState<InvoiceMatchingResult | null>(null)
  const [toleranceConfig, setToleranceConfig] = useState({
    quantityTolerancePercentage: 5,
    priceTolerancePercentage: 2,
    totalTolerancePercentage: 5
  })
  const [isMatching, setIsMatching] = useState(false)
  const [selectedTab, setSelectedTab] = useState('overview')

  useEffect(() => {
    if (invoice && open) {
      performThreeWayMatch()
    }
  }, [invoice, open])

  const performThreeWayMatch = () => {
    if (!invoice) return

    setIsMatching(true)

    const po = purchaseOrders.find(p => p.id === invoice.purchaseOrderId)
    const grn = grns.find(g => g.id === invoice.grnId)

    if (!po && !grn) {
      const result: InvoiceMatchingResult = {
        id: `match-${Date.now()}`,
        invoiceId: invoice.id,
        matchStatus: 'not-matched',
        overallVariance: invoice.total,
        variancePercentage: 100,
        toleranceThreshold: toleranceConfig.totalTolerancePercentage,
        itemsMatched: 0,
        itemsMismatched: invoice.items.length,
        itemsMissing: 0,
        itemsAdditional: invoice.items.length,
        quantityVariances: [],
        priceVariances: [],
        totalVariances: [],
        recommendations: [
          {
            type: 'reject',
            priority: 'critical',
            message: 'No matching PO or GRN found for this invoice',
            actionLabel: 'Create Dispute'
          }
        ],
        requiresApproval: true,
        approvalLevel: 'director',
        matchedBy: currentUser.id,
        matchedAt: Date.now(),
        auditTrail: [{
          id: `audit-${Date.now()}`,
          timestamp: Date.now(),
          action: 'created',
          performedBy: currentUser.id,
          performedByName: `${currentUser.firstName} ${currentUser.lastName}`,
          details: 'No PO or GRN found'
        }]
      }
      setMatchingResult(result)
      setIsMatching(false)
      return
    }

    const quantityVariances: MatchingVariance[] = []
    const priceVariances: MatchingVariance[] = []
    const totalVariances: MatchingVariance[] = []
    
    let itemsMatched = 0
    let itemsMismatched = 0
    let itemsMissing = 0
    let itemsAdditional = 0
    let overallVariance = 0

    invoice.items.forEach(invItem => {
      const poItem = po?.items.find(p => p.inventoryItemId === invItem.inventoryItemId)
      const grnItem = grn?.items.find(g => g.inventoryItemId === invItem.inventoryItemId)

      if (!poItem && !grnItem) {
        itemsAdditional++
        totalVariances.push({
          itemId: invItem.id,
          itemName: invItem.name,
          field: 'total',
          invoiceValue: invItem.total,
          variance: invItem.total,
          variancePercentage: 100,
          isWithinTolerance: false,
          requiresAction: true,
          suggestedAction: 'This item was not in the PO or GRN'
        })
        return
      }

      const poQuantity = poItem?.quantity || 0
      const grnQuantity = grnItem?.receivedQuantity || 0
      const invQuantity = invItem.quantity

      const poPrice = poItem?.unitPrice || 0
      const invPrice = invItem.unitPrice

      const quantityVariance = invQuantity - grnQuantity
      const quantityVariancePercent = grnQuantity > 0 ? Math.abs((quantityVariance / grnQuantity) * 100) : 100

      const priceVariance = invPrice - poPrice
      const priceVariancePercent = poPrice > 0 ? Math.abs((priceVariance / poPrice) * 100) : 100

      const totalVariance = invItem.total - (grnQuantity * poPrice)
      const totalVariancePercent = (grnQuantity * poPrice) > 0 ? Math.abs((totalVariance / (grnQuantity * poPrice)) * 100) : 100

      const quantityWithinTolerance = quantityVariancePercent <= toleranceConfig.quantityTolerancePercentage
      const priceWithinTolerance = priceVariancePercent <= toleranceConfig.priceTolerancePercentage
      const totalWithinTolerance = totalVariancePercent <= toleranceConfig.totalTolerancePercentage

      if (quantityWithinTolerance && priceWithinTolerance && totalWithinTolerance) {
        itemsMatched++
      } else {
        itemsMismatched++
      }

      overallVariance += Math.abs(totalVariance)

      if (!quantityWithinTolerance) {
        quantityVariances.push({
          itemId: invItem.id,
          itemName: invItem.name,
          field: 'quantity',
          poValue: poQuantity,
          grnValue: grnQuantity,
          invoiceValue: invQuantity,
          variance: quantityVariance,
          variancePercentage: quantityVariancePercent,
          isWithinTolerance: false,
          requiresAction: quantityVariancePercent > 10,
          suggestedAction: quantityVariance > 0 
            ? 'Invoice quantity exceeds GRN received quantity' 
            : 'Invoice quantity is less than GRN received quantity'
        })
      }

      if (!priceWithinTolerance) {
        priceVariances.push({
          itemId: invItem.id,
          itemName: invItem.name,
          field: 'price',
          poValue: poPrice,
          grnValue: poPrice,
          invoiceValue: invPrice,
          variance: priceVariance,
          variancePercentage: priceVariancePercent,
          isWithinTolerance: false,
          requiresAction: priceVariancePercent > 5,
          suggestedAction: priceVariance > 0 
            ? 'Invoice price is higher than PO price' 
            : 'Invoice price is lower than PO price'
        })
      }

      if (!totalWithinTolerance) {
        totalVariances.push({
          itemId: invItem.id,
          itemName: invItem.name,
          field: 'total',
          poValue: poQuantity * poPrice,
          grnValue: grnQuantity * poPrice,
          invoiceValue: invItem.total,
          variance: totalVariance,
          variancePercentage: totalVariancePercent,
          isWithinTolerance: false,
          requiresAction: totalVariancePercent > 5,
          suggestedAction: 'Total amount variance detected'
        })
      }
    })

    // Check for missing items (in PO/GRN but not in Invoice)
    po?.items.forEach(poItem => {
      const invItem = invoice.items.find(i => i.inventoryItemId === poItem.inventoryItemId)
      if (!invItem) {
        itemsMissing++
        totalVariances.push({
          itemId: poItem.id,
          itemName: poItem.name,
          field: 'total',
          poValue: poItem.total,
          grnValue: 0,
          invoiceValue: 0,
          variance: -poItem.total,
          variancePercentage: 100,
          isWithinTolerance: false,
          requiresAction: true,
          suggestedAction: 'Item in PO but missing from invoice'
        })
      }
    })

    const totalInvoiceAmount = invoice.total
    const overallVariancePercent = totalInvoiceAmount > 0 ? (overallVariance / totalInvoiceAmount) * 100 : 0

    const recommendations: MatchingRecommendation[] = []

    if (overallVariancePercent <= toleranceConfig.totalTolerancePercentage) {
      recommendations.push({
        type: 'approve',
        priority: 'info',
        message: `All variances are within acceptable tolerance (${toleranceConfig.totalTolerancePercentage}%)`,
        actionLabel: 'Auto-Approve'
      })
    } else if (overallVariancePercent <= 10) {
      recommendations.push({
        type: 'request-clarification',
        priority: 'warning',
        message: `Variances detected (${overallVariancePercent.toFixed(2)}%). Review before approving.`,
        actionLabel: 'Request Clarification'
      })
    } else {
      recommendations.push({
        type: 'create-dispute',
        priority: 'action-required',
        message: `Significant variances detected (${overallVariancePercent.toFixed(2)}%). Consider creating a dispute.`,
        actionLabel: 'Create Dispute'
      })
    }

    if (itemsAdditional > 0) {
      recommendations.push({
        type: 'contact-supplier',
        priority: 'warning',
        message: `${itemsAdditional} item(s) on invoice not found in PO/GRN`,
        actionLabel: 'Contact Supplier'
      })
    }

    if (itemsMissing > 0) {
      recommendations.push({
        type: 'create-debit-note',
        priority: 'action-required',
        message: `${itemsMissing} item(s) from PO missing in invoice`,
        actionLabel: 'Create Debit Note'
      })
    }

    let matchStatus: InvoiceMatchingResult['matchStatus'] = 'fully-matched'
    if (itemsMismatched > 0 || itemsAdditional > 0 || itemsMissing > 0) {
      if (overallVariancePercent <= toleranceConfig.totalTolerancePercentage) {
        matchStatus = 'variance-within-tolerance'
      } else if (overallVariancePercent > 20) {
        matchStatus = 'needs-review'
      } else {
        matchStatus = 'partially-matched'
      }
    }

    const approvalLevel: InvoiceMatchingResult['approvalLevel'] = 
      overallVariancePercent <= toleranceConfig.totalTolerancePercentage ? 'auto-approve' :
      overallVariancePercent <= 5 ? 'manager' :
      overallVariancePercent <= 15 ? 'senior-manager' :
      overallVariancePercent <= 25 ? 'director' : 'cfo'

    const result: InvoiceMatchingResult = {
      id: `match-${Date.now()}`,
      invoiceId: invoice.id,
      purchaseOrderId: po?.id,
      grnId: grn?.id,
      matchStatus,
      overallVariance,
      variancePercentage: overallVariancePercent,
      toleranceThreshold: toleranceConfig.totalTolerancePercentage,
      itemsMatched,
      itemsMismatched,
      itemsMissing,
      itemsAdditional,
      quantityVariances,
      priceVariances,
      totalVariances,
      recommendations,
      requiresApproval: approvalLevel !== 'auto-approve',
      approvalLevel,
      matchedBy: currentUser.id,
      matchedAt: Date.now(),
      auditTrail: [{
        id: `audit-${Date.now()}`,
        timestamp: Date.now(),
        action: 'created',
        performedBy: currentUser.id,
        performedByName: `${currentUser.firstName} ${currentUser.lastName}`,
        details: `Three-way matching performed with ${matchStatus} status`
      }]
    }

    setMatchingResult(result)
    setIsMatching(false)
  }

  const handleApprove = () => {
    if (!matchingResult) return

    const updatedResult: InvoiceMatchingResult = {
      ...matchingResult,
      matchStatus: 'approved-with-variance',
      approvedBy: currentUser.id,
      approvedAt: Date.now(),
      auditTrail: [
        ...matchingResult.auditTrail,
        {
          id: `audit-${Date.now()}`,
          timestamp: Date.now(),
          action: 'approved',
          performedBy: currentUser.id,
          performedByName: `${currentUser.firstName} ${currentUser.lastName}`,
          details: 'Approved with variance'
        }
      ]
    }

    onMatchComplete(updatedResult)
    toast.success('Invoice matching approved')
    onOpenChange(false)
  }

  const handleReject = () => {
    if (!matchingResult) return

    const updatedResult: InvoiceMatchingResult = {
      ...matchingResult,
      matchStatus: 'rejected',
      rejectedBy: currentUser.id,
      rejectedAt: Date.now(),
      rejectionReason: 'Variance exceeds acceptable threshold',
      auditTrail: [
        ...matchingResult.auditTrail,
        {
          id: `audit-${Date.now()}`,
          timestamp: Date.now(),
          action: 'rejected',
          performedBy: currentUser.id,
          performedByName: `${currentUser.firstName} ${currentUser.lastName}`,
          details: 'Rejected due to variance'
        }
      ]
    }

    onMatchComplete(updatedResult)
    toast.error('Invoice matching rejected')
    onOpenChange(false)
  }

  const handleCreateDispute = () => {
    if (!invoice || !matchingResult || !onCreateDispute) return

    const supplier = suppliers.find(s => s.id === invoice.supplierId)

    const dispute: Partial<SupplierDispute> = {
      supplierId: invoice.supplierId,
      supplierName: supplier?.name || invoice.supplierName || 'Unknown',
      purchaseOrderId: invoice.purchaseOrderId,
      grnId: invoice.grnId,
      invoiceId: invoice.id,
      disputeType: 'invoice-mismatch',
      status: 'open',
      priority: matchingResult.variancePercentage > 20 ? 'high' : 'medium',
      title: `Invoice Mismatch - ${invoice.invoiceNumber}`,
      description: `Three-way matching detected ${formatPercent(matchingResult.variancePercentage / 100)} variance`,
      disputedAmount: matchingResult.overallVariance,
      claimAmount: matchingResult.overallVariance,
      raisedBy: currentUser.id,
      raisedAt: Date.now()
    }

    onCreateDispute(dispute)
    toast.success('Dispute created successfully')
    onOpenChange(false)
  }

  const getStatusBadge = (status: InvoiceMatchingResult['matchStatus']) => {
    const config = {
      'fully-matched': { variant: 'default' as const, icon: <CheckCircle />, label: 'Fully Matched' },
      'partially-matched': { variant: 'secondary' as const, icon: <WarningCircle />, label: 'Partially Matched' },
      'not-matched': { variant: 'destructive' as const, icon: <XCircle />, label: 'Not Matched' },
      'variance-within-tolerance': { variant: 'default' as const, icon: <CheckCircle />, label: 'Within Tolerance' },
      'needs-review': { variant: 'destructive' as const, icon: <WarningCircle />, label: 'Needs Review' },
      'approved-with-variance': { variant: 'default' as const, icon: <CheckCircle />, label: 'Approved' },
      'rejected': { variant: 'destructive' as const, icon: <XCircle />, label: 'Rejected' }
    }

    const { variant, icon, label } = config[status]

    return (
      <Badge variant={variant} className="gap-1">
        {icon}
        {label}
      </Badge>
    )
  }

  const getVarianceIcon = (variance: number) => {
    if (variance > 0) return <TrendUp className="text-destructive" />
    if (variance < 0) return <TrendDown className="text-success" />
    return <Minus className="text-muted-foreground" />
  }

  if (!invoice) return null

  const po = purchaseOrders.find(p => p.id === invoice.purchaseOrderId)
  const grn = grns.find(g => g.id === invoice.grnId)

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-6xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            <ArrowsClockwise size={24} />
            Three-Way Matching - {invoice.invoiceNumber}
          </DialogTitle>
        </DialogHeader>

        <Tabs value={selectedTab} onValueChange={setSelectedTab}>
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="comparison">Comparison</TabsTrigger>
            <TabsTrigger value="variances">Variances</TabsTrigger>
            <TabsTrigger value="recommendations">Recommendations</TabsTrigger>
            <TabsTrigger value="audit">Audit Trail</TabsTrigger>
          </TabsList>

          <ScrollArea className="max-h-[60vh] mt-4">
            <TabsContent value="overview" className="space-y-4">
              {isMatching ? (
                <Card className="p-8 text-center">
                  <ArrowsClockwise size={48} className="mx-auto mb-4 animate-spin text-primary" />
                  <p className="text-muted-foreground">Performing three-way matching...</p>
                </Card>
              ) : matchingResult ? (
                <>
                  <Card className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-semibold">Matching Summary</h3>
                      {getStatusBadge(matchingResult.matchStatus)}
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="space-y-1">
                        <p className="text-sm text-muted-foreground">Overall Variance</p>
                        <p className="text-2xl font-semibold text-destructive">
                          {formatCurrency(matchingResult.overallVariance)}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {formatPercent(matchingResult.variancePercentage / 100)}
                        </p>
                      </div>

                      <div className="space-y-1">
                        <p className="text-sm text-muted-foreground">Items Matched</p>
                        <p className="text-2xl font-semibold text-success">{matchingResult.itemsMatched}</p>
                        <p className="text-xs text-muted-foreground">Within tolerance</p>
                      </div>

                      <div className="space-y-1">
                        <p className="text-sm text-muted-foreground">Items Mismatched</p>
                        <p className="text-2xl font-semibold text-destructive">{matchingResult.itemsMismatched}</p>
                        <p className="text-xs text-muted-foreground">Outside tolerance</p>
                      </div>

                      <div className="space-y-1">
                        <p className="text-sm text-muted-foreground">Approval Level</p>
                        <p className="text-lg font-semibold capitalize">{matchingResult.approvalLevel}</p>
                        <p className="text-xs text-muted-foreground">
                          {matchingResult.requiresApproval ? 'Required' : 'Not required'}
                        </p>
                      </div>
                    </div>
                  </Card>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Card className="p-4">
                      <div className="flex items-center gap-2 mb-3">
                        <ShoppingCart size={20} className="text-primary" />
                        <h4 className="font-semibold">Purchase Order</h4>
                      </div>
                      {po ? (
                        <div className="space-y-2 text-sm">
                          <p><span className="text-muted-foreground">PO Number:</span> {po.poNumber}</p>
                          <p><span className="text-muted-foreground">Total:</span> {formatCurrency(po.total)}</p>
                          <p><span className="text-muted-foreground">Items:</span> {po.items.length}</p>
                          <p><span className="text-muted-foreground">Date:</span> {formatDate(po.createdAt)}</p>
                        </div>
                      ) : (
                        <p className="text-sm text-muted-foreground">No PO linked</p>
                      )}
                    </Card>

                    <Card className="p-4">
                      <div className="flex items-center gap-2 mb-3">
                        <Package size={20} className="text-accent" />
                        <h4 className="font-semibold">Goods Received Note</h4>
                      </div>
                      {grn ? (
                        <div className="space-y-2 text-sm">
                          <p><span className="text-muted-foreground">GRN Number:</span> {grn.grnNumber}</p>
                          <p><span className="text-muted-foreground">Items:</span> {grn.items.length}</p>
                          <p><span className="text-muted-foreground">Date:</span> {formatDate(grn.receivedAt)}</p>
                          <p><span className="text-muted-foreground">Receiver:</span> {grn.receivedBy}</p>
                        </div>
                      ) : (
                        <p className="text-sm text-muted-foreground">No GRN linked</p>
                      )}
                    </Card>

                    <Card className="p-4">
                      <div className="flex items-center gap-2 mb-3">
                        <Receipt size={20} className="text-destructive" />
                        <h4 className="font-semibold">Invoice</h4>
                      </div>
                      <div className="space-y-2 text-sm">
                        <p><span className="text-muted-foreground">Invoice Number:</span> {invoice.invoiceNumber}</p>
                        <p><span className="text-muted-foreground">Total:</span> {formatCurrency(invoice.total)}</p>
                        <p><span className="text-muted-foreground">Items:</span> {invoice.items.length}</p>
                        <p><span className="text-muted-foreground">Date:</span> {formatDate(invoice.invoiceDate)}</p>
                      </div>
                    </Card>
                  </div>
                </>
              ) : null}
            </TabsContent>

            <TabsContent value="comparison" className="space-y-4">
              <Card className="p-6">
                <h3 className="font-semibold mb-4">Line Item Comparison</h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left p-2">Item</th>
                        <th className="text-right p-2">PO Qty</th>
                        <th className="text-right p-2">GRN Qty</th>
                        <th className="text-right p-2">Inv Qty</th>
                        <th className="text-right p-2">PO Price</th>
                        <th className="text-right p-2">Inv Price</th>
                        <th className="text-right p-2">Total Variance</th>
                      </tr>
                    </thead>
                    <tbody>
                      {invoice.items.map(invItem => {
                        const poItem = po?.items.find(p => p.inventoryItemId === invItem.inventoryItemId)
                        const grnItem = grn?.items.find(g => g.inventoryItemId === invItem.inventoryItemId)

                        const totalVariance = invItem.total - ((grnItem?.receivedQuantity || 0) * (poItem?.unitPrice || 0))

                        return (
                          <tr key={invItem.id} className="border-b hover:bg-muted/50">
                            <td className="p-2">{invItem.name}</td>
                            <td className="text-right p-2">{poItem?.quantity || '-'}</td>
                            <td className="text-right p-2">{grnItem?.receivedQuantity || '-'}</td>
                            <td className="text-right p-2">{invItem.quantity}</td>
                            <td className="text-right p-2">{poItem ? formatCurrency(poItem.unitPrice) : '-'}</td>
                            <td className="text-right p-2">{formatCurrency(invItem.unitPrice)}</td>
                            <td className="text-right p-2 flex items-center justify-end gap-2">
                              {getVarianceIcon(totalVariance)}
                              <span className={totalVariance !== 0 ? 'text-destructive font-semibold' : ''}>
                                {formatCurrency(Math.abs(totalVariance))}
                              </span>
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
              </Card>
            </TabsContent>

            <TabsContent value="variances" className="space-y-4">
              {matchingResult && (
                <>
                  {matchingResult.quantityVariances.length > 0 && (
                    <Card className="p-6">
                      <h3 className="font-semibold mb-4">Quantity Variances</h3>
                      <div className="space-y-3">
                        {matchingResult.quantityVariances.map((variance, idx) => (
                          <div key={idx} className="p-3 bg-muted/50 rounded-lg">
                            <div className="flex items-start justify-between mb-2">
                              <div>
                                <p className="font-medium">{variance.itemName}</p>
                                <p className="text-sm text-muted-foreground">{variance.suggestedAction}</p>
                              </div>
                              <Badge variant={variance.requiresAction ? 'destructive' : 'secondary'}>
                                {formatPercent(variance.variancePercentage / 100)}
                              </Badge>
                            </div>
                            <div className="grid grid-cols-3 gap-4 text-sm">
                              <div>
                                <p className="text-muted-foreground">PO Quantity</p>
                                <p className="font-semibold">{variance.poValue}</p>
                              </div>
                              <div>
                                <p className="text-muted-foreground">GRN Quantity</p>
                                <p className="font-semibold">{variance.grnValue}</p>
                              </div>
                              <div>
                                <p className="text-muted-foreground">Invoice Quantity</p>
                                <p className="font-semibold">{variance.invoiceValue}</p>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </Card>
                  )}

                  {matchingResult.priceVariances.length > 0 && (
                    <Card className="p-6">
                      <h3 className="font-semibold mb-4">Price Variances</h3>
                      <div className="space-y-3">
                        {matchingResult.priceVariances.map((variance, idx) => (
                          <div key={idx} className="p-3 bg-muted/50 rounded-lg">
                            <div className="flex items-start justify-between mb-2">
                              <div>
                                <p className="font-medium">{variance.itemName}</p>
                                <p className="text-sm text-muted-foreground">{variance.suggestedAction}</p>
                              </div>
                              <Badge variant={variance.requiresAction ? 'destructive' : 'secondary'}>
                                {formatPercent(variance.variancePercentage / 100)}
                              </Badge>
                            </div>
                            <div className="grid grid-cols-2 gap-4 text-sm">
                              <div>
                                <p className="text-muted-foreground">PO Price</p>
                                <p className="font-semibold">{formatCurrency(variance.poValue || 0)}</p>
                              </div>
                              <div>
                                <p className="text-muted-foreground">Invoice Price</p>
                                <p className="font-semibold">{formatCurrency(variance.invoiceValue || 0)}</p>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </Card>
                  )}

                  {matchingResult.totalVariances.length > 0 && (
                    <Card className="p-6">
                      <h3 className="font-semibold mb-4">Total Amount Variances</h3>
                      <div className="space-y-3">
                        {matchingResult.totalVariances.map((variance, idx) => (
                          <div key={idx} className="p-3 bg-muted/50 rounded-lg">
                            <div className="flex items-start justify-between mb-2">
                              <div>
                                <p className="font-medium">{variance.itemName}</p>
                                <p className="text-sm text-muted-foreground">{variance.suggestedAction}</p>
                              </div>
                              <div className="text-right">
                                <Badge variant={variance.requiresAction ? 'destructive' : 'secondary'}>
                                  {formatPercent(variance.variancePercentage / 100)}
                                </Badge>
                                <p className="text-sm font-semibold mt-1">{formatCurrency(Math.abs(variance.variance))}</p>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </Card>
                  )}
                </>
              )}
            </TabsContent>

            <TabsContent value="recommendations" className="space-y-4">
              {matchingResult?.recommendations.map((rec, idx) => (
                <Card key={idx} className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        {rec.priority === 'critical' && <XCircle className="text-destructive" />}
                        {rec.priority === 'action-required' && <WarningCircle className="text-destructive" />}
                        {rec.priority === 'warning' && <WarningCircle className="text-accent" />}
                        {rec.priority === 'info' && <CheckCircle className="text-success" />}
                        <Badge variant={
                          rec.priority === 'critical' ? 'destructive' :
                          rec.priority === 'action-required' ? 'destructive' :
                          rec.priority === 'warning' ? 'secondary' : 'default'
                        }>
                          {rec.priority}
                        </Badge>
                      </div>
                      <p className="text-sm mb-2">{rec.message}</p>
                    </div>
                    {rec.actionLabel && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          if (rec.type === 'create-dispute') handleCreateDispute()
                          if (rec.type === 'approve') handleApprove()
                        }}
                      >
                        {rec.actionLabel}
                      </Button>
                    )}
                  </div>
                </Card>
              ))}
            </TabsContent>

            <TabsContent value="audit" className="space-y-4">
              {matchingResult?.auditTrail.map((entry, idx) => (
                <Card key={idx} className="p-4">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <Badge variant="outline" className="mb-1">{entry.action}</Badge>
                      <p className="text-sm font-medium">{entry.performedByName}</p>
                    </div>
                    <p className="text-xs text-muted-foreground">{formatDate(entry.timestamp)}</p>
                  </div>
                  {entry.details && (
                    <p className="text-sm text-muted-foreground">{entry.details}</p>
                  )}
                </Card>
              ))}
            </TabsContent>
          </ScrollArea>
        </Tabs>

        <Separator />

        <div className="flex justify-between">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Close
          </Button>
          <div className="flex gap-2">
            {matchingResult && matchingResult.requiresApproval && (
              <>
                <Button variant="destructive" onClick={handleReject}>
                  <XCircle size={16} className="mr-2" />
                  Reject
                </Button>
                <Button onClick={handleApprove}>
                  <CheckCircle size={16} className="mr-2" />
                  Approve
                </Button>
              </>
            )}
            {matchingResult && matchingResult.recommendations.some(r => r.type === 'create-dispute') && (
              <Button variant="outline" onClick={handleCreateDispute}>
                <FileText size={16} className="mr-2" />
                Create Dispute
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
