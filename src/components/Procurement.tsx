import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
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
  Gauge
} from '@phosphor-icons/react'
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
  type SystemUser
} from '@/lib/types'
import { formatCurrency, formatDate, formatDateTime } from '@/lib/helpers'
import { RequisitionDialog } from '@/components/RequisitionDialog'
import { PurchaseOrderDialog } from '@/components/PurchaseOrderDialog'
import { GRNDialog } from '@/components/GRNDialog'
import { POPreviewDialog } from '@/components/POPreviewDialog'

interface ProcurementProps {
  requisitions: Requisition[]
  setRequisitions: (requisitions: Requisition[]) => void
  purchaseOrders: PurchaseOrder[]
  setPurchaseOrders: (pos: PurchaseOrder[]) => void
  grns: GoodsReceivedNote[]
  setGRNs: (grns: GoodsReceivedNote[]) => void
  suppliers: Supplier[]
  inventory: InventoryItem[]
  foodItems: FoodItem[]
  amenities: Amenity[]
  constructionMaterials: ConstructionMaterial[]
  generalProducts: GeneralProduct[]
  currentUser: SystemUser
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
  currentUser
}: ProcurementProps) {
  const [activeTab, setActiveTab] = useState('overview')
  const [requisitionDialogOpen, setRequisitionDialogOpen] = useState(false)
  const [poDialogOpen, setPODialogOpen] = useState(false)
  const [grnDialogOpen, setGRNDialogOpen] = useState(false)
  const [poPreviewDialogOpen, setPOPreviewDialogOpen] = useState(false)
  const [selectedRequisition, setSelectedRequisition] = useState<Requisition | undefined>()
  const [selectedPO, setSelectedPO] = useState<PurchaseOrder | undefined>()
  const [selectedGRN, setSelectedGRN] = useState<GoodsReceivedNote | undefined>()

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
                    {req.items.map((item) => (
                      <div key={item.id} className="flex items-center justify-between text-sm">
                        <span>{item.name}</span>
                        <span className="text-muted-foreground">
                          {item.quantity} {item.unit}
                        </span>
                      </div>
                    ))}
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

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-4xl font-semibold">Procurement</h1>
        <p className="text-muted-foreground mt-1">Manage requisitions, purchase orders, and goods receipt</p>
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
    </div>
  )
}
