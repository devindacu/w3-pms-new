import { useState } from 'react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  ShoppingCart,
  ClipboardText,
  Package,
  FileText,
  Plus,
  Eye,
  CheckCircle,
  XCircle,
  Clock,
  TrendUp,
  Calendar,
  CurrencyDollar,
  WarningCircle,
  Gauge,
  Receipt,
  ArrowsClockwise,
  DownloadSimple,
  FileCsv,
  CaretDown
} from '@phosphor-icons/react'
import { PrintButton } from '@/components/PrintButton'
import { A4PrintWrapper } from '@/components/A4PrintWrapper'
import {
  type Requisition,
  type PurchaseOrder,
  type GoodsReceivedNote,
  type Supplier,
  type InventoryItem,
  type FoodItem,
  type Amenity,
  type ConstructionMaterial,
  type GeneralProduct,
  type SystemUser,
  type Invoice
} from '@/lib/types'
import { formatCurrency, formatDate, formatDateTime } from '@/lib/helpers'
import { RequisitionDialog } from '@/components/RequisitionDialog'
import { PurchaseOrderDialog } from '@/components/PurchaseOrderDialog'
import { GRNDialog } from '@/components/GRNDialog'
import { POPreviewDialog } from '@/components/POPreviewDialog'
import { SupplierInvoiceDialog } from '@/components/SupplierInvoiceDialog'
import { ThreeWayMatchingDialog } from '@/components/ThreeWayMatchingDialog'
import { BulkApprovalDialog } from '@/components/BulkApprovalDialog'
import type { InvoiceMatchingResult, SupplierDispute } from '@/lib/types'

interface ProcurementProps {
  requisitions: Requisition[]
  setRequisitions: (requisitions: Requisition[] | ((current: Requisition[]) => Requisition[])) => void
  purchaseOrders: PurchaseOrder[]
  setPurchaseOrders: (pos: PurchaseOrder[] | ((current: PurchaseOrder[]) => PurchaseOrder[])) => void
  grns: GoodsReceivedNote[]
  setGRNs: (grns: GoodsReceivedNote[] | ((current: GoodsReceivedNote[]) => GoodsReceivedNote[])) => void
  suppliers: Supplier[]
  inventory: InventoryItem[]
  foodItems: FoodItem[]
  amenities: Amenity[]
  constructionMaterials: ConstructionMaterial[]
  generalProducts: GeneralProduct[]
  currentUser: SystemUser
  invoices: Invoice[]
  setInvoices: (invoices: Invoice[] | ((current: Invoice[]) => Invoice[])) => void
}

export function Procurement({
  requisitions,
  setRequisitions,
  purchaseOrders,
  setPurchaseOrders,
  grns,
  setGRNs,
  suppliers,
  inventory,
  foodItems,
  amenities,
  constructionMaterials,
  generalProducts,
  currentUser,
  invoices,
  setInvoices
}: ProcurementProps) {
  const [activeTab, setActiveTab] = useState('overview')
  const [requisitionDialogOpen, setRequisitionDialogOpen] = useState(false)
  const [poDialogOpen, setPODialogOpen] = useState(false)
  const [grnDialogOpen, setGRNDialogOpen] = useState(false)
  const [poPreviewDialogOpen, setPOPreviewDialogOpen] = useState(false)
  const [invoiceDialogOpen, setInvoiceDialogOpen] = useState(false)
  const [threeWayMatchingDialogOpen, setThreeWayMatchingDialogOpen] = useState(false)
  const [selectedRequisition, setSelectedRequisition] = useState<Requisition | undefined>()
  const [selectedPO, setSelectedPO] = useState<PurchaseOrder | undefined>()
  const [selectedGRN, setSelectedGRN] = useState<GoodsReceivedNote | undefined>()
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | undefined>()
  const [isScanning, setIsScanning] = useState(false)
  const [uploadedFile, setUploadedFile] = useState<File | null>(null)
  const [showOnlyNeedsMatching, setShowOnlyNeedsMatching] = useState(false)
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [bulkApprovalDialogOpen, setBulkApprovalDialogOpen] = useState(false)

  const getRequisitionStatusBadge = (status: string) => {
    const variants = {
      'draft': 'secondary',
      'pending-approval': 'default',
      'approved': 'default',
      'rejected': 'destructive',
      'fulfilled': 'default'
    } as const
    
    const colors = {
      'draft': 'bg-muted text-muted-foreground',
      'pending-approval': 'bg-accent text-accent-foreground',
      'approved': 'bg-success text-success-foreground',
      'rejected': 'bg-destructive text-destructive-foreground',
      'fulfilled': 'bg-primary text-primary-foreground'
    }

    return (
      <Badge variant={variants[status as keyof typeof variants] || 'secondary'} className={colors[status as keyof typeof colors]}>
        {status.replace('-', ' ')}
      </Badge>
    )
  }

  const getPOStatusBadge = (status: string) => {
    const colors = {
      'draft': 'bg-muted text-muted-foreground',
      'approved': 'bg-success/20 text-success-foreground',
      'ordered': 'bg-primary/20 text-primary-foreground',
      'received': 'bg-accent/20 text-accent-foreground',
      'closed': 'bg-secondary text-secondary-foreground'
    }

    return (
      <Badge className={colors[status as keyof typeof colors]}>
        {status}
      </Badge>
    )
  }

  const handlePOStatusChange = (newStatus: 'approved' | 'ordered', updatedPO: PurchaseOrder) => {
    setPurchaseOrders(purchaseOrders.map(po => po.id === updatedPO.id ? updatedPO : po))
  }

  const stats = {
    pendingRequisitions: requisitions.filter(r => r.status === 'pending-approval').length,
    approvedRequisitions: requisitions.filter(r => r.status === 'approved').length,
    activePOs: purchaseOrders.filter(po => ['approved', 'ordered'].includes(po.status)).length,
    pendingDeliveries: purchaseOrders.filter(po => po.status === 'ordered').length,
    totalPOValue: purchaseOrders.filter(po => po.status !== 'draft').reduce((sum, po) => sum + po.total, 0),
    monthlySpend: purchaseOrders.filter(po => {
      const poDate = new Date(po.createdAt)
      const now = new Date()
      return poDate.getMonth() === now.getMonth() && poDate.getFullYear() === now.getFullYear()
    }).reduce((sum, po) => sum + po.total, 0)
  }

  const renderOverview = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <Card className="p-6 border-l-4 border-l-accent">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-muted-foreground">Pending Requisitions</h3>
            <ClipboardText size={20} className="text-accent" />
          </div>
          <p className="text-3xl font-semibold">{stats.pendingRequisitions}</p>
          <p className="text-sm text-muted-foreground mt-1">Need approval</p>
        </Card>

        <Card className="p-6 border-l-4 border-l-primary">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-muted-foreground">Active POs</h3>
            <ShoppingCart size={20} className="text-primary" />
          </div>
          <p className="text-3xl font-semibold">{stats.activePOs}</p>
          <p className="text-sm text-muted-foreground mt-1">In process</p>
        </Card>

        <Card className="p-6 border-l-4 border-l-success">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-muted-foreground">Pending Deliveries</h3>
            <Package size={20} className="text-success" />
          </div>
          <p className="text-3xl font-semibold">{stats.pendingDeliveries}</p>
          <p className="text-sm text-muted-foreground mt-1">Expected soon</p>
        </Card>

        <Card className="p-6 border-l-4 border-l-primary">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-muted-foreground">Total PO Value</h3>
            <CurrencyDollar size={20} className="text-primary" />
          </div>
          <p className="text-3xl font-semibold">{formatCurrency(stats.totalPOValue)}</p>
          <p className="text-sm text-muted-foreground mt-1">All active orders</p>
        </Card>

        <Card className="p-6 border-l-4 border-l-accent">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-muted-foreground">Monthly Spend</h3>
            <TrendUp size={20} className="text-accent" />
          </div>
          <p className="text-3xl font-semibold">{formatCurrency(stats.monthlySpend)}</p>
          <p className="text-sm text-muted-foreground mt-1">Current month</p>
        </Card>

        <Card className="p-6 border-l-4 border-l-destructive">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-muted-foreground">Approved Requisitions</h3>
            <CheckCircle size={20} className="text-destructive" />
          </div>
          <p className="text-3xl font-semibold">{stats.approvedRequisitions}</p>
          <p className="text-sm text-muted-foreground mt-1">Ready for PO</p>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">Recent Requisitions</h3>
            <Button size="sm" variant="outline" onClick={() => setActiveTab('requisitions')}>
              View All
            </Button>
          </div>
          <div className="space-y-3">
            {requisitions.slice(0, 5).map((req) => (
              <div key={req.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <p className="font-medium">{req.requisitionNumber}</p>
                    {getRequisitionStatusBadge(req.status)}
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">
                    {req.department} • {req.items.length} items
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium">{formatDate(req.createdAt)}</p>
                  <p className="text-xs text-muted-foreground">{req.requestedBy}</p>
                </div>
              </div>
            ))}
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">Recent Purchase Orders</h3>
            <Button size="sm" variant="outline" onClick={() => setActiveTab('purchase-orders')}>
              View All
            </Button>
          </div>
          <div className="space-y-3">
            {purchaseOrders.slice(0, 5).map((po) => {
              const supplier = suppliers.find(s => s.id === po.supplierId)
              return (
                <div key={po.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <p className="font-medium">{po.poNumber}</p>
                      {getPOStatusBadge(po.status)}
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">
                      {supplier?.name || 'Unknown Supplier'}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold">{formatCurrency(po.total)}</p>
                    <p className="text-xs text-muted-foreground">{formatDate(po.createdAt)}</p>
                  </div>
                </div>
              )
            })}
          </div>
        </Card>
      </div>
    </div>
  )

  const renderRequisitions = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold">Requisitions</h2>
          <p className="text-muted-foreground mt-1">Manage material and inventory requisitions</p>
        </div>
        <Button onClick={() => {
          setSelectedRequisition(undefined)
          setRequisitionDialogOpen(true)
        }}>
          <Plus size={18} className="mr-2" />
          New Requisition
        </Button>
      </div>

      <div className="space-y-3">
        {requisitions.length === 0 ? (
          <Card className="p-12 text-center">
            <ClipboardText size={48} className="mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">No requisitions yet. Create one to get started.</p>
          </Card>
        ) : (
          requisitions.map((req) => (
            <Card key={req.id} className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3">
                    <h3 className="text-lg font-semibold">{req.requisitionNumber}</h3>
                    {getRequisitionStatusBadge(req.status)}
                    {req.priority !== 'normal' && (
                      <Badge variant="destructive" className="capitalize">
                        {req.priority}
                      </Badge>
                    )}
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
                    <div>
                      <p className="text-xs text-muted-foreground">Department</p>
                      <p className="text-sm font-medium capitalize">{req.department}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Requested By</p>
                      <p className="text-sm font-medium">{req.requestedBy}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Items</p>
                      <p className="text-sm font-medium">{req.items.length}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Created</p>
                      <p className="text-sm font-medium">{formatDate(req.createdAt)}</p>
                    </div>
                  </div>
                  {req.notes && (
                    <p className="text-sm text-muted-foreground mt-3">
                      <span className="font-medium">Notes:</span> {req.notes}
                    </p>
                  )}
                  <Separator className="my-4" />
                  <div className="space-y-2">
                    <div className="grid grid-cols-12 gap-3 px-2 text-xs font-medium text-muted-foreground">
                      <div className="col-span-4">Item</div>
                      <div className="col-span-2 text-right">Quantity</div>
                      <div className="col-span-2 text-right">Unit Price</div>
                      <div className="col-span-2 text-right">Total</div>
                      <div className="col-span-2">Supplier</div>
                    </div>
                    {req.items.map((item) => {
                      const supplier = item.supplierId ? suppliers.find(s => s.id === item.supplierId) : null
                      return (
                        <div key={item.id} className="flex items-center justify-between text-sm px-2">
                          <div className="grid grid-cols-12 gap-3 w-full">
                            <span className="col-span-4">{item.name}</span>
                            <span className="col-span-2 text-right text-muted-foreground">
                              {item.quantity}
                            </span>
                            <span className="col-span-2 text-right text-muted-foreground">
                              {formatCurrency(item.unitPrice)}
                            </span>
                            <span className="col-span-2 text-right font-medium">
                              {formatCurrency(item.estimatedCost)}
                            </span>
                            <span className="col-span-2 text-muted-foreground text-xs">
                              {supplier ? supplier.name : 'Any supplier'}
                            </span>
                          </div>
                        </div>
                      )
                    })}
                    <div className="flex justify-end pt-2 border-t mt-2">
                      <div className="text-right px-2">
                        <p className="text-xs text-muted-foreground">Total Estimated Cost</p>
                        <p className="text-sm font-semibold">
                          {formatCurrency(req.items.reduce((sum, item) => sum + item.estimatedCost, 0))}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="flex gap-2 ml-4">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      setSelectedRequisition(req)
                      setRequisitionDialogOpen(true)
                    }}
                  >
                    <Eye size={16} />
                  </Button>
                </div>
              </div>
            </Card>
          ))
        )}
      </div>
    </div>
  )

  const renderPurchaseOrders = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold">Purchase Orders</h2>
          <p className="text-muted-foreground mt-1">Create and track purchase orders</p>
        </div>
        <Button onClick={() => {
          setSelectedPO(undefined)
          setPODialogOpen(true)
        }}>
          <Plus size={18} className="mr-2" />
          New Purchase Order
        </Button>
      </div>

      <div className="space-y-3">
        {purchaseOrders.length === 0 ? (
          <Card className="p-12 text-center">
            <ShoppingCart size={48} className="mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">No purchase orders yet. Create one to get started.</p>
          </Card>
        ) : (
          purchaseOrders.map((po) => {
            const supplier = suppliers.find(s => s.id === po.supplierId)
            return (
              <Card key={po.id} className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      <h3 className="text-lg font-semibold">{po.poNumber}</h3>
                      {getPOStatusBadge(po.status)}
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mt-4">
                      <div>
                        <p className="text-xs text-muted-foreground">Supplier</p>
                        <p className="text-sm font-medium">{supplier?.name || 'N/A'}</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Total Amount</p>
                        <p className="text-sm font-medium">{formatCurrency(po.total)}</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Items</p>
                        <p className="text-sm font-medium">{po.items.length}</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Created</p>
                        <p className="text-sm font-medium">{formatDate(po.createdAt)}</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Expected Delivery</p>
                        <p className="text-sm font-medium">
                          {po.expectedDelivery ? formatDate(po.expectedDelivery) : 'TBD'}
                        </p>
                      </div>
                    </div>
                    {po.notes && (
                      <p className="text-sm text-muted-foreground mt-3">
                        <span className="font-medium">Notes:</span> {po.notes}
                      </p>
                    )}
                    <Separator className="my-4" />
                    <div className="space-y-2">
                      {po.items.map((item) => (
                        <div key={item.id} className="flex items-center justify-between text-sm">
                          <span className="flex-1">{item.name}</span>
                          <span className="text-muted-foreground w-32 text-right">
                            {item.quantity} {item.unit}
                          </span>
                          <span className="text-muted-foreground w-24 text-right">
                            {formatCurrency(item.unitPrice)}
                          </span>
                          <span className="font-medium w-24 text-right">
                            {formatCurrency(item.total)}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="flex gap-2 ml-4">
                    <Button
                      size="sm"
                      variant="default"
                      onClick={() => {
                        setSelectedPO(po)
                        setPOPreviewDialogOpen(true)
                      }}
                    >
                      <Eye size={16} className="mr-2" />
                      Preview
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        setSelectedPO(po)
                        setPODialogOpen(true)
                      }}
                    >
                      Edit
                    </Button>
                  </div>
                </div>
              </Card>
            )
          })
        )}
      </div>
    </div>
  )

  const renderGRNs = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold">Goods Received Notes</h2>
          <p className="text-muted-foreground mt-1">Track and manage incoming deliveries</p>
        </div>
        <Button onClick={() => {
          setSelectedGRN(undefined)
          setGRNDialogOpen(true)
        }}>
          <Plus size={18} className="mr-2" />
          New GRN
        </Button>
      </div>

      <div className="space-y-3">
        {grns.length === 0 ? (
          <Card className="p-12 text-center">
            <Package size={48} className="mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">No goods received yet. Create a GRN when deliveries arrive.</p>
          </Card>
        ) : (
          grns.map((grn) => {
            const po = purchaseOrders.find(p => p.id === grn.purchaseOrderId)
            const supplier = suppliers.find(s => s.id === grn.supplierId)
            return (
              <Card key={grn.id} className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      <h3 className="text-lg font-semibold">{grn.grnNumber}</h3>
                      <Badge className="bg-success text-success-foreground">Received</Badge>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
                      <div>
                        <p className="text-xs text-muted-foreground">PO Number</p>
                        <p className="text-sm font-medium">{po?.poNumber || 'N/A'}</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Supplier</p>
                        <p className="text-sm font-medium">{supplier?.name || 'N/A'}</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Received By</p>
                        <p className="text-sm font-medium">{grn.receivedBy}</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Received At</p>
                        <p className="text-sm font-medium">{formatDateTime(grn.receivedAt)}</p>
                      </div>
                    </div>
                    {grn.invoiceNumber && (
                      <div className="mt-3 text-sm">
                        <span className="text-muted-foreground">Invoice:</span>
                        <span className="ml-2 font-medium">{grn.invoiceNumber}</span>
                        {grn.invoiceAmount && (
                          <span className="ml-2 text-muted-foreground">
                            ({formatCurrency(grn.invoiceAmount)})
                          </span>
                        )}
                      </div>
                    )}
                    <Separator className="my-4" />
                    <div className="space-y-2">
                      {grn.items.map((item) => (
                        <div key={item.id} className="flex items-center justify-between text-sm">
                          <span className="flex-1">Item #{item.inventoryItemId.slice(-6)}</span>
                          <span className="text-muted-foreground w-32 text-right">
                            Ordered: {item.orderedQuantity}
                          </span>
                          <span className="w-32 text-right">
                            Received: <span className="font-medium">{item.receivedQuantity}</span>
                          </span>
                          {item.damagedQuantity > 0 && (
                            <span className="text-destructive w-32 text-right">
                              Damaged: {item.damagedQuantity}
                            </span>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="flex gap-2 ml-4">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        setSelectedGRN(grn)
                        setGRNDialogOpen(true)
                      }}
                    >
                      <Eye size={16} />
                    </Button>
                  </div>
                </div>
              </Card>
            )
          })
        )}
      </div>
    </div>
  )

  const handleSaveInvoice = (invoice: Invoice) => {
    setInvoices((current: Invoice[]) => {
      const existing = current.find(i => i.id === invoice.id)
      if (existing) {
        return current.map(i => i.id === invoice.id ? invoice : i)
      }
      return [...current, invoice]
    })
  }

  const handleDeleteInvoice = (id: string) => {
    setInvoices((current: Invoice[]) => current.filter(i => i.id !== id))
  }

  const handleMatchComplete = (matchingResult: InvoiceMatchingResult) => {
    setInvoices((current: Invoice[]) => 
      current.map(inv => 
        inv.id === matchingResult.invoiceId 
          ? { 
              ...inv, 
              status: matchingResult.matchStatus === 'fully-matched' ? 'matched' : 'mismatch',
              matchingResult 
            } 
          : inv
      )
    )
    toast.success('Three-way matching completed')
    setThreeWayMatchingDialogOpen(false)
  }

  const handleOpenThreeWayMatching = (invoice: Invoice) => {
    setSelectedInvoice(invoice)
    setThreeWayMatchingDialogOpen(true)
  }

  const handleBulkApprove = async (invoiceIds: string[], notes?: string) => {
    setInvoices((currentInvoices) =>
      currentInvoices.map((inv) =>
        invoiceIds.includes(inv.id)
          ? {
              ...inv,
              status: 'approved',
              approvedBy: currentUser.id,
              approvedAt: Date.now(),
              notes: notes ? `${inv.notes || ''}\n\nApproval Note: ${notes}` : inv.notes
            }
          : inv
      )
    )
  }

  const exportApprovedInvoices = () => {
    const approvedInvoices = invoices.filter(inv => inv.status === 'approved' || inv.status === 'posted')

    if (approvedInvoices.length === 0) {
      toast.error('No approved invoices to export')
      return
    }

    const headers = [
      'Invoice Number',
      'Supplier',
      'PO Number',
      'GRN Number',
      'Invoice Date',
      'Due Date',
      'Subtotal',
      'Tax',
      'Total',
      'Amount Paid',
      'Balance',
      'Status',
      'Approved By',
      'Approved Date',
      'Payment Terms',
      'Notes'
    ]

    const rows = approvedInvoices.map(inv => {
      const supplier = suppliers.find(s => s.id === inv.supplierId)
      const po = purchaseOrders.find(p => p.id === inv.purchaseOrderId)
      const grn = grns.find(g => g.id === inv.grnId)
      const approver = inv.approvedBy
      
      return [
        inv.invoiceNumber,
        supplier?.name || 'Unknown',
        po?.poNumber || '-',
        grn?.grnNumber || '-',
        formatDate(inv.invoiceDate),
        formatDate(inv.dueDate),
        formatCurrency(inv.subtotal),
        formatCurrency(inv.tax),
        formatCurrency(inv.total),
        formatCurrency(inv.amountPaid),
        formatCurrency(inv.balance),
        inv.status,
        approver || '-',
        inv.approvedAt ? formatDate(inv.approvedAt) : '-',
        inv.paymentTerms,
        inv.notes || '-'
      ]
    })

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    const url = URL.createObjectURL(blob)
    
    link.setAttribute('href', url)
    link.setAttribute('download', `approved-invoices-${new Date().toISOString().split('T')[0]}.csv`)
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)

    toast.success(`Exported ${approvedInvoices.length} approved invoice${approvedInvoices.length > 1 ? 's' : ''}`)
  }

  const exportApprovedInvoicesDetailed = () => {
    const approvedInvoices = invoices.filter(inv => inv.status === 'approved' || inv.status === 'posted')

    if (approvedInvoices.length === 0) {
      toast.error('No approved invoices to export')
      return
    }

    const headers = [
      'Invoice Number',
      'Supplier',
      'PO Number',
      'GRN Number',
      'Invoice Date',
      'Due Date',
      'Item Name',
      'Description',
      'Quantity',
      'Unit',
      'Unit Price',
      'Item Total',
      'Subtotal',
      'Tax',
      'Total',
      'Amount Paid',
      'Balance',
      'Status',
      'Approved By',
      'Approved Date',
      'Validated By',
      'Validated Date',
      'Payment Terms',
      'Notes'
    ]

    const rows: string[][] = []

    approvedInvoices.forEach(inv => {
      const supplier = suppliers.find(s => s.id === inv.supplierId)
      const po = purchaseOrders.find(p => p.id === inv.purchaseOrderId)
      const grn = grns.find(g => g.id === inv.grnId)

      if (inv.items && inv.items.length > 0) {
        inv.items.forEach((item, idx) => {
          rows.push([
            idx === 0 ? inv.invoiceNumber : '',
            idx === 0 ? (supplier?.name || 'Unknown') : '',
            idx === 0 ? (po?.poNumber || '-') : '',
            idx === 0 ? (grn?.grnNumber || '-') : '',
            idx === 0 ? formatDate(inv.invoiceDate) : '',
            idx === 0 ? formatDate(inv.dueDate) : '',
            item.itemName || item.name,
            item.description || '-',
            item.quantity.toString(),
            item.unit,
            formatCurrency(item.unitPrice),
            formatCurrency(item.total),
            idx === 0 ? formatCurrency(inv.subtotal) : '',
            idx === 0 ? formatCurrency(inv.tax) : '',
            idx === 0 ? formatCurrency(inv.total) : '',
            idx === 0 ? formatCurrency(inv.amountPaid) : '',
            idx === 0 ? formatCurrency(inv.balance) : '',
            idx === 0 ? inv.status : '',
            idx === 0 ? (inv.approvedBy || '-') : '',
            idx === 0 ? (inv.approvedAt ? formatDate(inv.approvedAt) : '-') : '',
            idx === 0 ? (inv.validatedBy || '-') : '',
            idx === 0 ? (inv.validatedAt ? formatDate(inv.validatedAt) : '-') : '',
            idx === 0 ? inv.paymentTerms : '',
            idx === 0 ? (inv.notes || '-') : ''
          ])
        })
      } else {
        rows.push([
          inv.invoiceNumber,
          supplier?.name || 'Unknown',
          po?.poNumber || '-',
          grn?.grnNumber || '-',
          formatDate(inv.invoiceDate),
          formatDate(inv.dueDate),
          '-',
          '-',
          '-',
          '-',
          '-',
          '-',
          formatCurrency(inv.subtotal),
          formatCurrency(inv.tax),
          formatCurrency(inv.total),
          formatCurrency(inv.amountPaid),
          formatCurrency(inv.balance),
          inv.status,
          inv.approvedBy || '-',
          inv.approvedAt ? formatDate(inv.approvedAt) : '-',
          inv.validatedBy || '-',
          inv.validatedAt ? formatDate(inv.validatedAt) : '-',
          inv.paymentTerms,
          inv.notes || '-'
        ])
      }
    })

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    const url = URL.createObjectURL(blob)
    
    link.setAttribute('href', url)
    link.setAttribute('download', `approved-invoices-detailed-${new Date().toISOString().split('T')[0]}.csv`)
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)

    toast.success(`Exported ${approvedInvoices.length} approved invoice${approvedInvoices.length > 1 ? 's' : ''} with line items`)
  }

  const renderInvoices = () => {
    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0]
      if (!file) return

      if (!file.type.startsWith('image/')) {
        return
      }

      setUploadedFile(file)
      setIsScanning(true)

      setTimeout(() => {
        setIsScanning(false)
        setUploadedFile(null)
      }, 2000)
    }

    const getStatusBadge = (status: string) => {
      const variants: Record<string, any> = {
        'pending-validation': 'default',
        'validated': 'secondary',
        'matched': 'default',
        'mismatch': 'destructive',
        'approved': 'default',
        'posted': 'default',
        'rejected': 'destructive',
      }

      return (
        <Badge variant={variants[status] || 'default'}>
          {status.replace('-', ' ')}
        </Badge>
      )
    }

    const handleCreateInvoice = () => {
      setSelectedInvoice(undefined)
      setInvoiceDialogOpen(true)
    }

    const handleEditInvoice = (invoice: Invoice) => {
      setSelectedInvoice(invoice)
      setInvoiceDialogOpen(true)
    }

    const needsThreeWayMatching = (invoice: Invoice) => {
      return invoice.purchaseOrderId && 
             (invoice.status === 'pending-validation' || 
              invoice.status === 'validated' || 
              invoice.status === 'mismatch') &&
             !invoice.matchingResult
    }

    let filteredInvoices = invoices

    if (showOnlyNeedsMatching) {
      filteredInvoices = filteredInvoices.filter(needsThreeWayMatching)
    }

    if (statusFilter !== 'all') {
      filteredInvoices = filteredInvoices.filter(inv => inv.status === statusFilter)
    }

    const needsMatchingCount = invoices.filter(needsThreeWayMatching).length

    return (
      <div className="space-y-6">
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-semibold">Supplier Invoice Management</h2>
              <p className="text-muted-foreground mt-1">Create, edit, and manage supplier invoices</p>
            </div>
            <div className="flex gap-2">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button 
                    variant="outline"
                    disabled={invoices.filter(inv => inv.status === 'approved' || inv.status === 'posted').length === 0}
                  >
                    <DownloadSimple size={20} className="mr-2" />
                    Export Approved
                    <CaretDown size={16} className="ml-2" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={exportApprovedInvoices}>
                    <FileCsv size={16} className="mr-2" />
                    Summary Report
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={exportApprovedInvoicesDetailed}>
                    <FileCsv size={16} className="mr-2" />
                    Detailed Report (with line items)
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
              <Button 
                onClick={() => setBulkApprovalDialogOpen(true)}
                variant="outline"
                disabled={invoices.filter(i => i.status === 'pending-validation' || i.status === 'validated' || i.status === 'matched').length === 0}
              >
                <CheckCircle size={20} className="mr-2" />
                Bulk Approve
              </Button>
              <Button onClick={handleCreateInvoice}>
                <Plus size={20} className="mr-2" />
                Create Invoice
              </Button>
              <Button asChild variant="outline">
                <label className="cursor-pointer flex items-center gap-2">
                  <Receipt size={20} />
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
          
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Button
                variant={showOnlyNeedsMatching ? 'default' : 'outline'}
                size="sm"
                onClick={() => setShowOnlyNeedsMatching(!showOnlyNeedsMatching)}
              >
                <ArrowsClockwise size={16} className="mr-2" />
                Needs 3-Way Matching
                {needsMatchingCount > 0 && (
                  <Badge variant="secondary" className="ml-2">
                    {needsMatchingCount}
                  </Badge>
                )}
              </Button>
              {showOnlyNeedsMatching && (
                <p className="text-sm text-muted-foreground">
                  Showing {filteredInvoices.length} invoice{filteredInvoices.length !== 1 ? 's' : ''} that need matching
                </p>
              )}
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <span className="text-sm font-medium text-muted-foreground">Filter by Status:</span>
              <Button
                variant={statusFilter === 'all' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setStatusFilter('all')}
              >
                All
                <Badge variant="secondary" className="ml-2">
                  {invoices.length}
                </Badge>
              </Button>
              <Button
                variant={statusFilter === 'pending-validation' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setStatusFilter('pending-validation')}
              >
                <Clock size={16} className="mr-2" />
                Pending Validation
                <Badge variant="secondary" className="ml-2">
                  {invoices.filter(i => i.status === 'pending-validation').length}
                </Badge>
              </Button>
              <Button
                variant={statusFilter === 'validated' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setStatusFilter('validated')}
              >
                <CheckCircle size={16} className="mr-2" />
                Validated
                <Badge variant="secondary" className="ml-2">
                  {invoices.filter(i => i.status === 'validated').length}
                </Badge>
              </Button>
              <Button
                variant={statusFilter === 'matched' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setStatusFilter('matched')}
              >
                Matched
                <Badge variant="secondary" className="ml-2">
                  {invoices.filter(i => i.status === 'matched').length}
                </Badge>
              </Button>
              <Button
                variant={statusFilter === 'mismatch' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setStatusFilter('mismatch')}
              >
                <WarningCircle size={16} className="mr-2" />
                Mismatch
                <Badge variant="secondary" className="ml-2">
                  {invoices.filter(i => i.status === 'mismatch').length}
                </Badge>
              </Button>
              <Button
                variant={statusFilter === 'approved' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setStatusFilter('approved')}
              >
                <CheckCircle size={16} className="mr-2" />
                Approved
                <Badge variant="secondary" className="ml-2">
                  {invoices.filter(i => i.status === 'approved').length}
                </Badge>
              </Button>
              <Button
                variant={statusFilter === 'posted' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setStatusFilter('posted')}
              >
                Posted
                <Badge variant="secondary" className="ml-2">
                  {invoices.filter(i => i.status === 'posted').length}
                </Badge>
              </Button>
              <Button
                variant={statusFilter === 'rejected' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setStatusFilter('rejected')}
              >
                <XCircle size={16} className="mr-2" />
                Rejected
                <Badge variant="secondary" className="ml-2">
                  {invoices.filter(i => i.status === 'rejected').length}
                </Badge>
              </Button>
            </div>

            {(statusFilter !== 'all' || showOnlyNeedsMatching) && (
              <div className="flex items-center gap-2 text-sm">
                <span className="text-muted-foreground">
                  Showing <span className="font-semibold text-foreground">{filteredInvoices.length}</span> of <span className="font-semibold text-foreground">{invoices.length}</span> invoices
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setShowOnlyNeedsMatching(false)
                    setStatusFilter('all')
                  }}
                  className="h-6 px-2"
                >
                  <XCircle size={14} className="mr-1" />
                  Clear Filters
                </Button>
              </div>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="p-6 border-l-4 border-l-primary">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-medium text-muted-foreground">Total Invoices</h3>
              <Receipt size={20} className="text-primary" />
            </div>
            <p className="text-3xl font-semibold">{invoices.length}</p>
            <p className="text-sm text-muted-foreground mt-1">All invoices</p>
          </Card>

          <Card className="p-6 border-l-4 border-l-accent">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-medium text-muted-foreground">Needs Matching</h3>
              <ArrowsClockwise size={20} className="text-accent" />
            </div>
            <p className="text-3xl font-semibold">{needsMatchingCount}</p>
            <p className="text-sm text-muted-foreground mt-1">Ready for 3-way matching</p>
          </Card>

          <Card className="p-6 border-l-4 border-l-destructive">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-medium text-muted-foreground">Mismatches</h3>
              <WarningCircle size={20} className="text-destructive" />
            </div>
            <p className="text-3xl font-semibold">
              {invoices.filter(i => i.status === 'mismatch').length}
            </p>
            <p className="text-sm text-muted-foreground mt-1">Requires attention</p>
          </Card>

          <Card className="p-6 border-l-4 border-l-success">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-medium text-muted-foreground">Approved</h3>
              <CheckCircle size={20} className="text-success" />
            </div>
            <p className="text-3xl font-semibold">
              {invoices.filter(i => i.status === 'approved' || i.status === 'posted').length}
            </p>
            <p className="text-sm text-muted-foreground mt-1">Ready to post</p>
          </Card>
        </div>

        <div className="space-y-3">
          {invoices.length === 0 ? (
            <Card className="p-12 text-center">
              <Receipt size={48} className="mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">No invoices scanned yet. Upload an invoice to get started.</p>
            </Card>
          ) : filteredInvoices.length === 0 ? (
            <Card className="p-12 text-center">
              {showOnlyNeedsMatching ? (
                <>
                  <ArrowsClockwise size={48} className="mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">No invoices need three-way matching at the moment.</p>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="mt-4"
                    onClick={() => setShowOnlyNeedsMatching(false)}
                  >
                    Show All Invoices
                  </Button>
                </>
              ) : statusFilter !== 'all' ? (
                <>
                  <Receipt size={48} className="mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">
                    No invoices found with status: <span className="font-semibold capitalize">{statusFilter.replace('-', ' ')}</span>
                  </p>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="mt-4"
                    onClick={() => setStatusFilter('all')}
                  >
                    Clear Filter
                  </Button>
                </>
              ) : (
                <>
                  <Receipt size={48} className="mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">No invoices match the current filters.</p>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="mt-4"
                    onClick={() => {
                      setShowOnlyNeedsMatching(false)
                      setStatusFilter('all')
                    }}
                  >
                    Clear All Filters
                  </Button>
                </>
              )}
            </Card>
          ) : (
            filteredInvoices.map((invoice) => {
              const supplier = suppliers.find(s => s.id === invoice.supplierId)
              const po = purchaseOrders.find(p => p.id === invoice.purchaseOrderId)
              const needsMatching = needsThreeWayMatching(invoice)
              
              return (
                <Card key={invoice.id} className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3">
                        <h3 className="text-lg font-semibold">{invoice.invoiceNumber}</h3>
                        {getStatusBadge(invoice.status)}
                        {needsMatching && (
                          <Badge variant="outline" className="border-accent text-accent">
                            <ArrowsClockwise size={14} className="mr-1" />
                            Needs Matching
                          </Badge>
                        )}
                        {(invoice as any).confidence && (
                          <Badge variant="secondary">
                            Confidence: {((invoice as any).confidence * 100).toFixed(0)}%
                          </Badge>
                        )}
                      </div>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
                        <div>
                          <p className="text-xs text-muted-foreground">Supplier</p>
                          <p className="text-sm font-medium">{supplier?.name || 'Unknown'}</p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">Invoice Date</p>
                          <p className="text-sm font-medium">{formatDate(invoice.invoiceDate)}</p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">Total Amount</p>
                          <p className="text-sm font-medium">{formatCurrency(invoice.total)}</p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">PO Reference</p>
                          <p className="text-sm font-medium">{po?.poNumber || 'N/A'}</p>
                        </div>
                      </div>
                      {invoice.mismatches && invoice.mismatches.length > 0 && (
                        <div className="mt-4 p-3 bg-destructive/10 rounded-lg">
                          <p className="text-sm font-medium text-destructive mb-2">
                            {invoice.mismatches.length} Mismatch(es) Detected
                          </p>
                          <div className="space-y-1">
                            {invoice.mismatches.slice(0, 3).map((mismatch) => (
                              <p key={mismatch.id} className="text-xs text-muted-foreground">
                                • {mismatch.description}
                              </p>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                    <div className="flex flex-col gap-2 ml-4">
                      <Button 
                        size="sm" 
                        variant="default"
                        onClick={() => handleOpenThreeWayMatching(invoice)}
                        disabled={!invoice.purchaseOrderId}
                      >
                        <ArrowsClockwise size={16} className="mr-2" />
                        3-Way Match
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => handleEditInvoice(invoice)}>
                        <Eye size={16} className="mr-2" />
                        View
                      </Button>
                    </div>
                  </div>
                </Card>
              )
            })
          )}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-semibold">Procurement & Invoices</h1>
          <p className="text-muted-foreground mt-1">Manage requisitions, purchase orders, goods receipt, and invoice scanning</p>
        </div>
        <PrintButton
          elementId="procurement-printable"
          options={{
            title: 'Procurement Report',
            filename: `procurement-report-${new Date().toISOString().split('T')[0]}.pdf`
          }}
          variant="outline"
          size="default"
        />
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="overview">
            <Gauge size={18} className="mr-2" />
            Overview
          </TabsTrigger>
          <TabsTrigger value="requisitions">
            <ClipboardText size={18} className="mr-2" />
            Requisitions
          </TabsTrigger>
          <TabsTrigger value="purchase-orders">
            <ShoppingCart size={18} className="mr-2" />
            Purchase Orders
          </TabsTrigger>
          <TabsTrigger value="grn">
            <Package size={18} className="mr-2" />
            Goods Received
          </TabsTrigger>
          <TabsTrigger value="invoices">
            <Receipt size={18} className="mr-2" />
            Invoice Scanning
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="mt-6">
          {renderOverview()}
        </TabsContent>

        <TabsContent value="requisitions" className="mt-6">
          {renderRequisitions()}
        </TabsContent>

        <TabsContent value="purchase-orders" className="mt-6">
          {renderPurchaseOrders()}
        </TabsContent>

        <TabsContent value="grn" className="mt-6">
          {renderGRNs()}
        </TabsContent>

        <TabsContent value="invoices" className="mt-6">
          {renderInvoices()}
        </TabsContent>
      </Tabs>

      <RequisitionDialog
        open={requisitionDialogOpen}
        onOpenChange={setRequisitionDialogOpen}
        requisition={selectedRequisition}
        requisitions={requisitions}
        setRequisitions={setRequisitions}
        currentUser={currentUser}
        inventory={inventory}
        foodItems={foodItems}
        amenities={amenities}
        constructionMaterials={constructionMaterials}
        generalProducts={generalProducts}
        suppliers={suppliers}
      />

      <PurchaseOrderDialog
        open={poDialogOpen}
        onOpenChange={setPODialogOpen}
        purchaseOrder={selectedPO}
        purchaseOrders={purchaseOrders}
        setPurchaseOrders={setPurchaseOrders}
        suppliers={suppliers}
        requisitions={requisitions}
        currentUser={currentUser}
        inventory={inventory}
        foodItems={foodItems}
        amenities={amenities}
        constructionMaterials={constructionMaterials}
        generalProducts={generalProducts}
      />

      <GRNDialog
        open={grnDialogOpen}
        onOpenChange={setGRNDialogOpen}
        grn={selectedGRN}
        grns={grns}
        setGRNs={setGRNs}
        purchaseOrders={purchaseOrders}
        setPurchaseOrders={setPurchaseOrders}
        suppliers={suppliers}
        currentUser={currentUser}
        inventory={inventory}
        foodItems={foodItems}
        amenities={amenities}
        constructionMaterials={constructionMaterials}
        generalProducts={generalProducts}
      />

      {selectedPO && (
        <POPreviewDialog
          open={poPreviewDialogOpen}
          onOpenChange={setPOPreviewDialogOpen}
          purchaseOrder={selectedPO}
          supplier={suppliers.find(s => s.id === selectedPO.supplierId)!}
          onStatusChange={handlePOStatusChange}
          currentUser={currentUser}
        />
      )}

      <SupplierInvoiceDialog
        open={invoiceDialogOpen}
        onOpenChange={setInvoiceDialogOpen}
        invoice={selectedInvoice}
        suppliers={suppliers}
        purchaseOrders={purchaseOrders}
        grns={grns}
        onSave={handleSaveInvoice}
        onDelete={handleDeleteInvoice}
        currentUser={currentUser}
      />

      {selectedInvoice && (
        <ThreeWayMatchingDialog
          open={threeWayMatchingDialogOpen}
          onOpenChange={setThreeWayMatchingDialogOpen}
          invoice={selectedInvoice}
          purchaseOrders={purchaseOrders}
          grns={grns}
          suppliers={suppliers}
          currentUser={currentUser}
          onMatchComplete={handleMatchComplete}
        />
      )}

      <BulkApprovalDialog
        open={bulkApprovalDialogOpen}
        onOpenChange={setBulkApprovalDialogOpen}
        invoices={invoices}
        onApprove={handleBulkApprove}
        currentUser={currentUser}
      />

      {/* Hidden printable content */}
      <div className="hidden">
        <A4PrintWrapper
          id="procurement-printable"
          title="Procurement Report"
          headerContent={
            <div className="text-sm">
              <p><strong>Generated:</strong> {formatDate(Date.now())}</p>
              <p><strong>Total Active POs:</strong> {stats.activePOs}</p>
              <p><strong>Total PO Value:</strong> {formatCurrency(stats.totalPOValue)}</p>
            </div>
          }
        >
          <div className="space-y-6">
            <section>
              <h2 className="text-lg font-semibold mb-4">Procurement Summary</h2>
              <table className="w-full border-collapse mb-6">
                <tbody>
                  <tr className="border-b">
                    <td className="p-2 font-semibold">Pending Requisitions</td>
                    <td className="p-2 text-right">{stats.pendingRequisitions}</td>
                    <td className="p-2 font-semibold">Approved Requisitions</td>
                    <td className="p-2 text-right">{stats.approvedRequisitions}</td>
                  </tr>
                  <tr className="border-b">
                    <td className="p-2 font-semibold">Active POs</td>
                    <td className="p-2 text-right">{stats.activePOs}</td>
                    <td className="p-2 font-semibold">Pending Deliveries</td>
                    <td className="p-2 text-right">{stats.pendingDeliveries}</td>
                  </tr>
                  <tr className="border-b">
                    <td className="p-2 font-semibold">Total PO Value</td>
                    <td className="p-2 text-right">{formatCurrency(stats.totalPOValue)}</td>
                    <td className="p-2 font-semibold">Monthly Spend</td>
                    <td className="p-2 text-right">{formatCurrency(stats.monthlySpend)}</td>
                  </tr>
                </tbody>
              </table>
            </section>

            <section>
              <h2 className="text-lg font-semibold mb-4">Recent Requisitions</h2>
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="border p-2 text-left">Number</th>
                    <th className="border p-2 text-left">Department</th>
                    <th className="border p-2 text-left">Requested By</th>
                    <th className="border p-2 text-right">Items</th>
                    <th className="border p-2 text-left">Status</th>
                    <th className="border p-2 text-left">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {requisitions.slice(0, 10).map((req) => (
                    <tr key={req.id}>
                      <td className="border p-2 font-mono text-xs">{req.requisitionNumber}</td>
                      <td className="border p-2 capitalize">{req.department}</td>
                      <td className="border p-2">{req.requestedBy}</td>
                      <td className="border p-2 text-right">{req.items.length}</td>
                      <td className="border p-2 capitalize">{req.status.replace('-', ' ')}</td>
                      <td className="border p-2">{formatDate(req.createdAt)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </section>

            <section>
              <h2 className="text-lg font-semibold mb-4">Active Purchase Orders</h2>
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="border p-2 text-left">PO Number</th>
                    <th className="border p-2 text-left">Supplier</th>
                    <th className="border p-2 text-right">Items</th>
                    <th className="border p-2 text-right">Total</th>
                    <th className="border p-2 text-left">Status</th>
                    <th className="border p-2 text-left">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {purchaseOrders.filter(po => ['approved', 'ordered'].includes(po.status)).slice(0, 10).map((po) => {
                    const supplier = suppliers.find(s => s.id === po.supplierId)
                    return (
                      <tr key={po.id}>
                        <td className="border p-2 font-mono text-xs">{po.poNumber}</td>
                        <td className="border p-2">{supplier?.name || 'N/A'}</td>
                        <td className="border p-2 text-right">{po.items.length}</td>
                        <td className="border p-2 text-right font-semibold">{formatCurrency(po.total)}</td>
                        <td className="border p-2 capitalize">{po.status}</td>
                        <td className="border p-2">{formatDate(po.createdAt)}</td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </section>
          </div>
        </A4PrintWrapper>
      </div>
    </div>
  )
}
