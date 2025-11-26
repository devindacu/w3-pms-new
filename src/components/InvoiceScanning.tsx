import { useState } from 'react'
import { useKV } from '@github/spark/hooks'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Separator } from '@/components/ui/separator'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Alert, AlertDescription } from '@/components/ui/alert'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Upload,
  CheckCircle,
  XCircle,
  Warning,
  Eye,
  ThumbsUp,
  ThumbsDown,
  Receipt,
  ArrowRight,
  Package,
  FileText,
  WarningCircle,
  Prohibit,
  Sparkle,
  MagnifyingGlass,
  CurrencyDollar
} from '@phosphor-icons/react'
import type { 
  Invoice, 
  InvoiceMismatch,
  PurchaseOrder, 
  GoodsReceivedNote,
  Supplier,
  SystemUser,
  InvoiceStatus
} from '@/lib/types'
import { formatCurrency } from '@/lib/helpers'

interface InvoiceScanningProps {
  invoices: Invoice[]
  setInvoices: (fn: (current: Invoice[]) => Invoice[]) => void
  purchaseOrders: PurchaseOrder[]
  grns: GoodsReceivedNote[]
  suppliers: Supplier[]
  currentUser: SystemUser
}

export function InvoiceScanning({
  invoices,
  setInvoices,
  purchaseOrders,
  grns,
  suppliers,
  currentUser
}: InvoiceScanningProps) {
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null)
  const [isScanning, setIsScanning] = useState(false)
  const [activeTab, setActiveTab] = useState<'all' | 'pending' | 'mismatch' | 'approved'>('all')
  const [uploadedFile, setUploadedFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)

  const simulateOCR = async (file: File): Promise<Invoice> => {
    await new Promise(resolve => setTimeout(resolve, 2000))
    
    const randomSupplier = suppliers[Math.floor(Math.random() * suppliers.length)]
    const linkedPO = purchaseOrders.find(po => po.supplierId === randomSupplier.id && po.status === 'received')
    const linkedGRN = linkedPO ? grns.find(grn => grn.purchaseOrderId === linkedPO.id) : undefined

    const supplierName = randomSupplier?.name || 'ABC Supplies Ltd'
    const promptText = `You are an invoice OCR system. Generate realistic invoice data for a hotel supplier.
    
    Supplier: ${supplierName}
    
    Generate:
    - Invoice number (format: INV-YYYY-####)
    - Invoice date (recent date)
    - Due date (30 days from invoice date)
    - 3-5 line items with realistic hotel supply items (food, amenities, or construction materials)
    - Each item should have: name, quantity, unit, unit price
    - Calculate subtotal, 10% tax, and total
    
    Return as JSON object with properties: invoiceNumber, invoiceDate (ISO string), dueDate (ISO string), supplierName, items (array with itemName, quantity, unit, unitPrice, total), subtotal, tax, total, confidence (0.85-0.98)`

    const ocrResult = await window.spark.llm(promptText, 'gpt-4o-mini', true)
    const ocrData = JSON.parse(ocrResult)

    const items = ocrData.items.map((item: any, idx: number) => ({
      id: `item-${Date.now()}-${idx}`,
      itemName: item.itemName,
      description: item.description || '',
      quantity: item.quantity,
      unit: item.unit,
      unitPrice: item.unitPrice,
      total: item.total,
      poItemId: linkedPO?.items[idx]?.id,
      grnItemId: linkedGRN?.items[idx]?.id,
    }))

    const mismatches = detectMismatches(items, linkedPO, linkedGRN)

    const invoice: Invoice = {
      id: `inv-${Date.now()}`,
      invoiceNumber: ocrData.invoiceNumber,
      supplierId: randomSupplier?.id || 'unknown',
      supplierName: ocrData.supplierName,
      purchaseOrderId: linkedPO?.id,
      grnId: linkedGRN?.id,
      invoiceDate: new Date(ocrData.invoiceDate).getTime(),
      dueDate: new Date(ocrData.dueDate).getTime(),
      subtotal: ocrData.subtotal,
      tax: ocrData.tax,
      total: ocrData.total,
      status: mismatches.length > 0 ? 'mismatch' : 'pending-validation',
      items,
      scannedImageUrl: previewUrl || undefined,
      ocrData: {
        rawText: `Invoice data extracted from ${file.name}`,
        confidence: ocrData.confidence,
        extractedFields: {
          invoiceNumber: ocrData.invoiceNumber,
          invoiceDate: ocrData.invoiceDate,
          supplierName: ocrData.supplierName,
          subtotal: ocrData.subtotal,
          tax: ocrData.tax,
          total: ocrData.total,
          dueDate: ocrData.dueDate,
        },
        extractedItems: ocrData.items,
        processingTime: 1842,
        processedAt: Date.now(),
      },
      mismatches: mismatches.length > 0 ? mismatches : undefined,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    }

    return invoice
  }

  const detectMismatches = (
    invoiceItems: any[],
    po?: PurchaseOrder,
    grn?: GoodsReceivedNote
  ): InvoiceMismatch[] => {
    const mismatches: InvoiceMismatch[] = []

    if (!po) {
      mismatches.push({
        id: `mm-${Date.now()}-1`,
        type: 'no-po-match',
        severity: 'high',
        description: 'No matching Purchase Order found',
        requiresApproval: true,
      })
      return mismatches
    }

    if (!grn) {
      mismatches.push({
        id: `mm-${Date.now()}-2`,
        type: 'no-grn-match',
        severity: 'high',
        description: 'No matching Goods Received Note found',
        requiresApproval: true,
      })
    }

    invoiceItems.forEach((invItem, idx) => {
      const poItem = po.items[idx]
      const grnItem = grn?.items[idx]

      if (poItem && Math.abs(invItem.unitPrice - poItem.unitPrice) > 0.01) {
        const variance = ((invItem.unitPrice - poItem.unitPrice) / poItem.unitPrice) * 100
        mismatches.push({
          id: `mm-${Date.now()}-${idx}-price`,
          type: 'price-variance',
          severity: Math.abs(variance) > 10 ? 'high' : 'medium',
          itemId: invItem.id,
          itemName: invItem.itemName,
          description: `Price variance: PO price ${formatCurrency(poItem.unitPrice)}, Invoice price ${formatCurrency(invItem.unitPrice)}`,
          expectedValue: poItem.unitPrice,
          actualValue: invItem.unitPrice,
          variance,
          requiresApproval: Math.abs(variance) > 5,
        })
      }

      if (grnItem && invItem.quantity !== grnItem.receivedQuantity) {
        mismatches.push({
          id: `mm-${Date.now()}-${idx}-qty`,
          type: 'quantity-variance',
          severity: 'medium',
          itemId: invItem.id,
          itemName: invItem.itemName,
          description: `Quantity variance: GRN received ${grnItem.receivedQuantity}, Invoice shows ${invItem.quantity}`,
          expectedValue: grnItem.receivedQuantity,
          actualValue: invItem.quantity,
          requiresApproval: true,
        })
      }
    })

    return mismatches
  }

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (!file.type.startsWith('image/')) {
      toast.error('Please upload an image file')
      return
    }

    setUploadedFile(file)
    const reader = new FileReader()
    reader.onloadend = () => {
      setPreviewUrl(reader.result as string)
    }
    reader.readAsDataURL(file)

    setIsScanning(true)
    toast.info('Scanning invoice...')

    try {
      const invoice = await simulateOCR(file)
      setInvoices((current) => [invoice, ...current])
      setSelectedInvoice(invoice)
      toast.success(`Invoice ${invoice.invoiceNumber} scanned successfully`)
      
      if (invoice.mismatches && invoice.mismatches.length > 0) {
        toast.warning(`${invoice.mismatches.length} mismatch(es) detected`)
      }
    } catch (error) {
      toast.error('Failed to scan invoice')
    } finally {
      setIsScanning(false)
      setUploadedFile(null)
      setPreviewUrl(null)
    }
  }

  const handleValidate = (invoice: Invoice) => {
    setInvoices((current) =>
      current.map((inv) =>
        inv.id === invoice.id
          ? {
              ...inv,
              status: 'validated',
              validatedBy: currentUser.userId,
              validatedAt: Date.now(),
              updatedAt: Date.now(),
            }
          : inv
      )
    )
    toast.success('Invoice validated')
  }

  const handleApprove = (invoice: Invoice) => {
    setInvoices((current) =>
      current.map((inv) =>
        inv.id === invoice.id
          ? {
              ...inv,
              status: 'approved',
              approvedBy: currentUser.userId,
              approvedAt: Date.now(),
              updatedAt: Date.now(),
            }
          : inv
      )
    )
    toast.success('Invoice approved')
  }

  const handlePostToAccounts = (invoice: Invoice) => {
    setInvoices((current) =>
      current.map((inv) =>
        inv.id === invoice.id
          ? {
              ...inv,
              status: 'posted',
              postedAt: Date.now(),
              postedToAccountsBy: currentUser.userId,
              updatedAt: Date.now(),
            }
          : inv
      )
    )
    toast.success('Invoice posted to Accounts')
  }

  const handleReject = (invoice: Invoice, reason: string) => {
    setInvoices((current) =>
      current.map((inv) =>
        inv.id === invoice.id
          ? {
              ...inv,
              status: 'rejected',
              rejectionReason: reason,
              updatedAt: Date.now(),
            }
          : inv
      )
    )
    toast.error('Invoice rejected')
  }

  const getStatusBadge = (status: InvoiceStatus) => {
    const variants: Record<InvoiceStatus, { variant: any; icon: any; label: string }> = {
      'pending-validation': { variant: 'default', icon: <Eye size={14} />, label: 'Pending Validation' },
      'validated': { variant: 'secondary', icon: <CheckCircle size={14} />, label: 'Validated' },
      'matched': { variant: 'default', icon: <CheckCircle size={14} />, label: 'Matched' },
      'mismatch': { variant: 'destructive', icon: <WarningCircle size={14} />, label: 'Mismatch' },
      'approved': { variant: 'default', icon: <ThumbsUp size={14} />, label: 'Approved' },
      'posted': { variant: 'default', icon: <CurrencyDollar size={14} />, label: 'Posted' },
      'rejected': { variant: 'destructive', icon: <Prohibit size={14} />, label: 'Rejected' },
    }

    const config = variants[status]
    return (
      <Badge variant={config.variant} className="gap-1">
        {config.icon}
        {config.label}
      </Badge>
    )
  }

  const getMismatchSeverityBadge = (severity: 'low' | 'medium' | 'high' | 'critical') => {
    const variants = {
      low: 'secondary',
      medium: 'default',
      high: 'destructive',
      critical: 'destructive',
    }
    return <Badge variant={variants[severity] as any}>{severity.toUpperCase()}</Badge>
  }

  const filteredInvoices = invoices.filter((inv) => {
    if (activeTab === 'all') return true
    if (activeTab === 'pending') return inv.status === 'pending-validation' || inv.status === 'validated'
    if (activeTab === 'mismatch') return inv.status === 'mismatch'
    if (activeTab === 'approved') return inv.status === 'approved' || inv.status === 'posted'
    return true
  })

  const stats = {
    total: invoices.length,
    pending: invoices.filter((i) => i.status === 'pending-validation').length,
    mismatches: invoices.filter((i) => i.status === 'mismatch').length,
    approved: invoices.filter((i) => i.status === 'approved').length,
    posted: invoices.filter((i) => i.status === 'posted').length,
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-semibold">Invoice Scanning & Validation</h1>
          <p className="text-muted-foreground mt-1">Automated accounts payable with OCR</p>
        </div>
        <div className="flex gap-2">
          <Button asChild variant="outline">
            <label className="cursor-pointer">
              <Upload size={20} className="mr-2" />
              Upload Invoice
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleFileUpload}
                disabled={isScanning}
              />
            </label>
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <Card className="p-4 border-l-4 border-l-primary">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-muted-foreground">Total Invoices</h3>
            <Receipt size={18} className="text-primary" />
          </div>
          <p className="text-2xl font-semibold">{stats.total}</p>
        </Card>

        <Card className="p-4 border-l-4 border-l-accent">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-muted-foreground">Pending Validation</h3>
            <Eye size={18} className="text-accent" />
          </div>
          <p className="text-2xl font-semibold">{stats.pending}</p>
        </Card>

        <Card className="p-4 border-l-4 border-l-destructive">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-muted-foreground">Mismatches</h3>
            <WarningCircle size={18} className="text-destructive" />
          </div>
          <p className="text-2xl font-semibold">{stats.mismatches}</p>
        </Card>

        <Card className="p-4 border-l-4 border-l-success">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-muted-foreground">Approved</h3>
            <ThumbsUp size={18} className="text-success" />
          </div>
          <p className="text-2xl font-semibold">{stats.approved}</p>
        </Card>

        <Card className="p-4 border-l-4 border-l-primary">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-muted-foreground">Posted</h3>
            <CurrencyDollar size={18} className="text-primary" />
          </div>
          <p className="text-2xl font-semibold">{stats.posted}</p>
        </Card>
      </div>

      {isScanning && (
        <Alert>
          <Sparkle size={18} className="animate-spin" />
          <AlertDescription>
            Processing invoice with OCR... This may take a few seconds.
          </AlertDescription>
        </Alert>
      )}

      <Card>
        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)}>
          <div className="border-b p-4">
            <TabsList>
              <TabsTrigger value="all">All ({stats.total})</TabsTrigger>
              <TabsTrigger value="pending">Pending ({stats.pending})</TabsTrigger>
              <TabsTrigger value="mismatch">Mismatches ({stats.mismatches})</TabsTrigger>
              <TabsTrigger value="approved">Approved ({stats.approved + stats.posted})</TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value={activeTab} className="p-6">
            <div className="space-y-4">
              {filteredInvoices.length === 0 ? (
                <div className="text-center py-12">
                  <MagnifyingGlass size={64} className="mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No invoices found</h3>
                  <p className="text-muted-foreground mb-6">Upload an invoice to get started</p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Invoice #</TableHead>
                      <TableHead>Supplier</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>PO / GRN</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Mismatches</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredInvoices.map((invoice) => {
                      const supplier = suppliers.find((s) => s.id === invoice.supplierId)
                      const po = purchaseOrders.find((p) => p.id === invoice.purchaseOrderId)
                      const grn = grns.find((g) => g.id === invoice.grnId)

                      return (
                        <TableRow key={invoice.id} className="cursor-pointer" onClick={() => setSelectedInvoice(invoice)}>
                          <TableCell className="font-medium">{invoice.invoiceNumber}</TableCell>
                          <TableCell>{supplier?.name || invoice.supplierName || 'Unknown'}</TableCell>
                          <TableCell>{new Date(invoice.invoiceDate).toLocaleDateString()}</TableCell>
                          <TableCell className="font-semibold">{formatCurrency(invoice.total)}</TableCell>
                          <TableCell>
                            {po && <Badge variant="secondary" className="mr-1">{po.poNumber}</Badge>}
                            {grn && <Badge variant="secondary">{grn.grnNumber}</Badge>}
                            {!po && !grn && <span className="text-muted-foreground text-sm">No match</span>}
                          </TableCell>
                          <TableCell>{getStatusBadge(invoice.status)}</TableCell>
                          <TableCell>
                            {invoice.mismatches && invoice.mismatches.length > 0 ? (
                              <Badge variant="destructive">{invoice.mismatches.length} issue(s)</Badge>
                            ) : (
                              <span className="text-muted-foreground text-sm">None</span>
                            )}
                          </TableCell>
                          <TableCell>
                            <div className="flex gap-2">
                              {invoice.status === 'pending-validation' && (
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    handleValidate(invoice)
                                  }}
                                >
                                  Validate
                                </Button>
                              )}
                              {(invoice.status === 'validated' || invoice.status === 'mismatch') && (
                                <Button
                                  size="sm"
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    handleApprove(invoice)
                                  }}
                                >
                                  Approve
                                </Button>
                              )}
                              {invoice.status === 'approved' && (
                                <Button
                                  size="sm"
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    handlePostToAccounts(invoice)
                                  }}
                                >
                                  Post to Accounts
                                </Button>
                              )}
                            </div>
                          </TableCell>
                        </TableRow>
                      )
                    })}
                  </TableBody>
                </Table>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </Card>

      {selectedInvoice && (
        <Card className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-semibold">Invoice Details: {selectedInvoice.invoiceNumber}</h2>
              <p className="text-muted-foreground mt-1">
                {suppliers.find((s) => s.id === selectedInvoice.supplierId)?.name || selectedInvoice.supplierName}
              </p>
            </div>
            {getStatusBadge(selectedInvoice.status)}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <div>
              <Label className="text-muted-foreground">Invoice Date</Label>
              <p className="text-lg font-medium">{new Date(selectedInvoice.invoiceDate).toLocaleDateString()}</p>
            </div>
            <div>
              <Label className="text-muted-foreground">Due Date</Label>
              <p className="text-lg font-medium">
                {selectedInvoice.dueDate ? new Date(selectedInvoice.dueDate).toLocaleDateString() : 'N/A'}
              </p>
            </div>
            <div>
              <Label className="text-muted-foreground">Total Amount</Label>
              <p className="text-2xl font-semibold text-primary">{formatCurrency(selectedInvoice.total)}</p>
            </div>
          </div>

          {selectedInvoice.purchaseOrderId && (
            <Alert className="mb-6">
              <Package size={18} />
              <AlertDescription>
                Linked to PO: <strong>{purchaseOrders.find((p) => p.id === selectedInvoice.purchaseOrderId)?.poNumber}</strong>
                {selectedInvoice.grnId && (
                  <span className="ml-4">
                    GRN: <strong>{grns.find((g) => g.id === selectedInvoice.grnId)?.grnNumber}</strong>
                  </span>
                )}
              </AlertDescription>
            </Alert>
          )}

          {selectedInvoice.mismatches && selectedInvoice.mismatches.length > 0 && (
            <div className="mb-6">
              <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                <WarningCircle size={20} className="text-destructive" />
                Mismatches Detected
              </h3>
              <div className="space-y-3">
                {selectedInvoice.mismatches.map((mismatch) => (
                  <Alert key={mismatch.id} variant="destructive">
                    <AlertDescription>
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            {getMismatchSeverityBadge(mismatch.severity)}
                            <span className="font-medium">{mismatch.type.replace('-', ' ').toUpperCase()}</span>
                          </div>
                          <p className="text-sm mb-2">{mismatch.description}</p>
                          {mismatch.expectedValue !== undefined && mismatch.actualValue !== undefined && (
                            <div className="text-xs space-y-1">
                              <p>Expected: {typeof mismatch.expectedValue === 'number' ? formatCurrency(mismatch.expectedValue) : mismatch.expectedValue}</p>
                              <p>Actual: {typeof mismatch.actualValue === 'number' ? formatCurrency(mismatch.actualValue) : mismatch.actualValue}</p>
                              {mismatch.variance !== undefined && <p>Variance: {mismatch.variance.toFixed(2)}%</p>}
                            </div>
                          )}
                        </div>
                        {mismatch.requiresApproval && (
                          <Badge variant="destructive">Requires Approval</Badge>
                        )}
                      </div>
                    </AlertDescription>
                  </Alert>
                ))}
              </div>
            </div>
          )}

          <div className="mb-6">
            <h3 className="text-lg font-semibold mb-3">Line Items</h3>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Item</TableHead>
                  <TableHead>Quantity</TableHead>
                  <TableHead>Unit Price</TableHead>
                  <TableHead>Total</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {selectedInvoice.items.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell>
                      <div>
                        <p className="font-medium">{item.itemName}</p>
                        {item.description && <p className="text-sm text-muted-foreground">{item.description}</p>}
                      </div>
                    </TableCell>
                    <TableCell>{item.quantity} {item.unit}</TableCell>
                    <TableCell>{formatCurrency(item.unitPrice)}</TableCell>
                    <TableCell className="font-medium">{formatCurrency(item.total)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          <div className="flex justify-end mb-6">
            <div className="w-64 space-y-2">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Subtotal:</span>
                <span className="font-medium">{formatCurrency(selectedInvoice.subtotal)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Tax:</span>
                <span className="font-medium">{formatCurrency(selectedInvoice.tax)}</span>
              </div>
              <Separator />
              <div className="flex justify-between text-lg">
                <span className="font-semibold">Total:</span>
                <span className="font-semibold text-primary">{formatCurrency(selectedInvoice.total)}</span>
              </div>
            </div>
          </div>

          {selectedInvoice.ocrData && (
            <div className="mb-6">
              <h3 className="text-lg font-semibold mb-3">OCR Details</h3>
              <div className="bg-muted/50 p-4 rounded-lg space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Confidence:</span>
                  <span className="font-medium">{(selectedInvoice.ocrData.confidence * 100).toFixed(1)}%</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Processing Time:</span>
                  <span className="font-medium">{selectedInvoice.ocrData.processingTime}ms</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Processed At:</span>
                  <span className="font-medium">{new Date(selectedInvoice.ocrData.processedAt).toLocaleString()}</span>
                </div>
              </div>
            </div>
          )}

          <div className="flex justify-between items-center pt-4 border-t">
            <Button variant="outline" onClick={() => setSelectedInvoice(null)}>
              Close
            </Button>
            <div className="flex gap-2">
              {selectedInvoice.status === 'pending-validation' && (
                <>
                  <Button
                    variant="destructive"
                    onClick={() => {
                      const reason = prompt('Rejection reason:')
                      if (reason) handleReject(selectedInvoice, reason)
                    }}
                  >
                    <Prohibit size={18} className="mr-2" />
                    Reject
                  </Button>
                  <Button onClick={() => handleValidate(selectedInvoice)}>
                    <CheckCircle size={18} className="mr-2" />
                    Validate
                  </Button>
                </>
              )}
              {(selectedInvoice.status === 'validated' || selectedInvoice.status === 'mismatch') && (
                <>
                  <Button
                    variant="destructive"
                    onClick={() => {
                      const reason = prompt('Rejection reason:')
                      if (reason) handleReject(selectedInvoice, reason)
                    }}
                  >
                    <Prohibit size={18} className="mr-2" />
                    Reject
                  </Button>
                  <Button onClick={() => handleApprove(selectedInvoice)}>
                    <ThumbsUp size={18} className="mr-2" />
                    Approve
                  </Button>
                </>
              )}
              {selectedInvoice.status === 'approved' && (
                <Button onClick={() => handlePostToAccounts(selectedInvoice)}>
                  <CurrencyDollar size={18} className="mr-2" />
                  Post to Accounts
                </Button>
              )}
            </div>
          </div>
        </Card>
      )}
    </div>
  )
}
