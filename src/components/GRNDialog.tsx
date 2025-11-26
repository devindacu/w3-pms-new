import { useState, useEffect, useRef } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Separator } from '@/components/ui/separator'
import { Badge } from '@/components/ui/badge'
import { Card } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Package, Barcode, Camera, Warning, Check, X, Upload, Image as ImageIcon } from '@phosphor-icons/react'
import { toast } from 'sonner'
import { 
  type GoodsReceivedNote,
  type GRNItem,
  type PurchaseOrder,
  type Supplier,
  type SystemUser,
  type InventoryItem,
  type FoodItem,
  type Amenity,
  type ConstructionMaterial,
  type GeneralProduct
} from '@/lib/types'
import { generateId, generateNumber, formatCurrency, formatDate } from '@/lib/helpers'

interface GRNDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  grn?: GoodsReceivedNote
  grns: GoodsReceivedNote[]
  setGRNs: (grns: GoodsReceivedNote[]) => void
  purchaseOrders: PurchaseOrder[]
  setPurchaseOrders: (pos: PurchaseOrder[]) => void
  suppliers: Supplier[]
  currentUser: SystemUser
  inventory: InventoryItem[]
  foodItems: FoodItem[]
  amenities: Amenity[]
  constructionMaterials: ConstructionMaterial[]
  generalProducts: GeneralProduct[]
}

export function GRNDialog({
  open,
  onOpenChange,
  grn,
  grns,
  setGRNs,
  purchaseOrders,
  setPurchaseOrders,
  suppliers,
  currentUser,
  inventory,
  foodItems,
  amenities,
  constructionMaterials,
  generalProducts
}: GRNDialogProps) {
  const [purchaseOrderId, setPurchaseOrderId] = useState('')
  const [invoiceNumber, setInvoiceNumber] = useState('')
  const [invoiceAmount, setInvoiceAmount] = useState('')
  const [deliveryNoteNumber, setDeliveryNoteNumber] = useState('')
  const [vehicleNumber, setVehicleNumber] = useState('')
  const [driverName, setDriverName] = useState('')
  const [notes, setNotes] = useState('')
  const [varianceNotes, setVarianceNotes] = useState('')
  const [items, setItems] = useState<GRNItem[]>([])
  const [invoicePhotos, setInvoicePhotos] = useState<string[]>([])
  const [deliveryNotePhotos, setDeliveryNotePhotos] = useState<string[]>([])
  const [barcodeInput, setBarcodeInput] = useState('')
  const [scanningForItemId, setScanningForItemId] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [uploadType, setUploadType] = useState<'invoice' | 'delivery'>('invoice')

  const isViewMode = !!grn

  const orderedPOs = purchaseOrders.filter(po => po.status === 'ordered')

  useEffect(() => {
    if (grn) {
      setPurchaseOrderId(grn.purchaseOrderId)
      setInvoiceNumber(grn.invoiceNumber || '')
      setInvoiceAmount(grn.invoiceAmount?.toString() || '')
      setDeliveryNoteNumber(grn.deliveryNoteNumber || '')
      setVehicleNumber(grn.vehicleNumber || '')
      setDriverName(grn.driverName || '')
      setNotes(grn.notes || '')
      setVarianceNotes(grn.varianceNotes || '')
      setItems(grn.items)
      setInvoicePhotos(grn.invoicePhotos || [])
      setDeliveryNotePhotos(grn.deliveryNotePhotos || [])
    } else {
      setPurchaseOrderId('')
      setInvoiceNumber('')
      setInvoiceAmount('')
      setDeliveryNoteNumber('')
      setVehicleNumber('')
      setDriverName('')
      setNotes('')
      setVarianceNotes('')
      setItems([])
      setInvoicePhotos([])
      setDeliveryNotePhotos([])
    }
  }, [grn, open])

  const handlePOChange = (poId: string) => {
    setPurchaseOrderId(poId)
    
    if (poId) {
      const po = purchaseOrders.find(p => p.id === poId)
      if (po) {
        const grnItems: GRNItem[] = po.items.map(item => ({
          id: generateId(),
          inventoryItemId: item.inventoryItemId,
          orderedQuantity: item.quantity,
          receivedQuantity: item.quantity,
          damagedQuantity: 0,
          unitPrice: item.unitPrice,
          qualityStatus: 'good'
        }))
        setItems(grnItems)
        setInvoiceAmount(po.total.toString())
      }
    }
  }

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files) return

    Array.from(files).forEach(file => {
      const reader = new FileReader()
      reader.onloadend = () => {
        const base64 = reader.result as string
        if (uploadType === 'invoice') {
          setInvoicePhotos(prev => [...prev, base64])
        } else {
          setDeliveryNotePhotos(prev => [...prev, base64])
        }
      }
      reader.readAsDataURL(file)
    })
    
    toast.success(`${files.length} photo(s) uploaded`)
  }

  const removePhoto = (type: 'invoice' | 'delivery', index: number) => {
    if (type === 'invoice') {
      setInvoicePhotos(prev => prev.filter((_, i) => i !== index))
    } else {
      setDeliveryNotePhotos(prev => prev.filter((_, i) => i !== index))
    }
  }

  const handleBarcodeSubmit = (itemId: string) => {
    if (!barcodeInput.trim()) return
    
    setItems(items.map(item =>
      item.id === itemId
        ? { ...item, barcode: barcodeInput.trim() }
        : item
    ))
    setBarcodeInput('')
    setScanningForItemId(null)
    toast.success('Barcode added')
  }

  const handleUpdateReceived = (itemId: string, received: string) => {
    const quantity = parseFloat(received)
    if (isNaN(quantity)) return

    setItems(items.map(item => {
      if (item.id === itemId) {
        const newItem = { ...item, receivedQuantity: quantity }
        if (quantity !== item.orderedQuantity) {
          const variance = (quantity - item.orderedQuantity) * (item.unitPrice || 0)
          newItem.varianceAmount = variance
        } else {
          newItem.varianceAmount = 0
        }
        return newItem
      }
      return item
    }))
  }

  const handleUpdateDamaged = (itemId: string, damaged: string) => {
    const quantity = parseFloat(damaged)
    if (isNaN(quantity)) return

    setItems(items.map(item =>
      item.id === itemId
        ? { ...item, damagedQuantity: quantity }
        : item
    ))
  }

  const handleUpdateBatch = (itemId: string, batch: string) => {
    setItems(items.map(item =>
      item.id === itemId
        ? { ...item, batchNumber: batch }
        : item
    ))
  }

  const handleUpdateExpiry = (itemId: string, expiry: string) => {
    setItems(items.map(item =>
      item.id === itemId
        ? { ...item, expiryDate: expiry ? new Date(expiry).getTime() : undefined }
        : item
    ))
  }

  const handleUpdateManufactureDate = (itemId: string, mfgDate: string) => {
    setItems(items.map(item =>
      item.id === itemId
        ? { ...item, manufactureDate: mfgDate ? new Date(mfgDate).getTime() : undefined }
        : item
    ))
  }

  const handleUpdateQuality = (itemId: string, quality: string) => {
    setItems(items.map(item =>
      item.id === itemId
        ? { ...item, qualityStatus: quality as any }
        : item
    ))
  }

  const handleUpdateVarianceReason = (itemId: string, reason: string) => {
    setItems(items.map(item =>
      item.id === itemId
        ? { ...item, varianceReason: reason }
        : item
    ))
  }

  const handleSave = () => {
    if (!purchaseOrderId) {
      toast.error('Please select a purchase order')
      return
    }

    if (items.length === 0) {
      toast.error('No items to receive')
      return
    }

    const now = Date.now()
    const po = purchaseOrders.find(p => p.id === purchaseOrderId)
    
    if (!po) {
      toast.error('Purchase order not found')
      return
    }

    const hasVariance = items.some(item => 
      item.receivedQuantity !== item.orderedQuantity || item.damagedQuantity > 0
    )

    const qualityCheckStatus = items.every(item => item.qualityStatus === 'excellent' || item.qualityStatus === 'good')
      ? 'passed'
      : items.some(item => item.qualityStatus === 'poor' || item.qualityStatus === 'rejected')
      ? 'partial'
      : 'passed'

    if (grn) {
      const updated = grns.map(g =>
        g.id === grn.id
          ? {
              ...g,
              invoiceNumber: invoiceNumber || undefined,
              invoiceAmount: invoiceAmount ? parseFloat(invoiceAmount) : undefined,
              deliveryNoteNumber: deliveryNoteNumber || undefined,
              vehicleNumber: vehicleNumber || undefined,
              driverName: driverName || undefined,
              notes,
              varianceNotes: varianceNotes || undefined,
              items,
              invoicePhotos,
              deliveryNotePhotos,
              hasVariance,
              qualityCheckStatus: qualityCheckStatus as any
            }
          : g
      )
      setGRNs(updated)
      toast.success('GRN updated')
    } else {
      const newGRN: GoodsReceivedNote = {
        id: generateId(),
        grnNumber: generateNumber('GRN'),
        purchaseOrderId,
        supplierId: po.supplierId,
        items,
        receivedAt: now,
        receivedBy: currentUser.username,
        notes,
        invoiceNumber: invoiceNumber || undefined,
        invoiceAmount: invoiceAmount ? parseFloat(invoiceAmount) : undefined,
        deliveryNoteNumber: deliveryNoteNumber || undefined,
        vehicleNumber: vehicleNumber || undefined,
        driverName: driverName || undefined,
        invoicePhotos,
        deliveryNotePhotos,
        hasVariance,
        varianceNotes: varianceNotes || undefined,
        qualityCheckStatus: qualityCheckStatus as any
      }
      setGRNs([newGRN, ...grns])

      const updatedPOs = purchaseOrders.map(p =>
        p.id === purchaseOrderId
          ? { ...p, status: 'received' as const }
          : p
      )
      setPurchaseOrders(updatedPOs)

      toast.success('GRN created - stock will be updated automatically')
    }

    onOpenChange(false)
  }

  const selectedPO = purchaseOrders.find(po => po.id === purchaseOrderId)
  const supplier = selectedPO ? suppliers.find(s => s.id === selectedPO.supplierId) : null

  const totalVariance = items.reduce((sum, item) => sum + (item.varianceAmount || 0), 0)
  const hasAnyVariance = items.some(item => item.receivedQuantity !== item.orderedQuantity || item.damagedQuantity > 0)

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-7xl max-h-[95vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle>
              {grn 
                ? `Goods Received Note ${grn.grnNumber}` 
                : 'New Goods Received Note'}
            </DialogTitle>
            {hasAnyVariance && (
              <Badge variant="destructive" className="gap-1">
                <Warning size={16} />
                Variance Detected
              </Badge>
            )}
          </div>
        </DialogHeader>

        <Tabs defaultValue="details" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="details">GRN Details</TabsTrigger>
            <TabsTrigger value="items">Items & Receiving</TabsTrigger>
            <TabsTrigger value="attachments">Attachments</TabsTrigger>
            <TabsTrigger value="variance">Variance Check</TabsTrigger>
          </TabsList>

          <TabsContent value="details" className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Purchase Order *</Label>
                <Select 
                  value={purchaseOrderId} 
                  onValueChange={handlePOChange}
                  disabled={isViewMode}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select purchase order" />
                  </SelectTrigger>
                  <SelectContent>
                    {orderedPOs.map(po => {
                      const sup = suppliers.find(s => s.id === po.supplierId)
                      return (
                        <SelectItem key={po.id} value={po.id}>
                          {po.poNumber} - {sup?.name} - {formatCurrency(po.total)}
                        </SelectItem>
                      )
                    })}
                  </SelectContent>
                </Select>
              </div>

              {supplier && (
                <div>
                  <Label>Supplier</Label>
                  <Input value={supplier.name} disabled />
                </div>
              )}

              <div>
                <Label>Invoice Number</Label>
                <Input
                  value={invoiceNumber}
                  onChange={(e) => setInvoiceNumber(e.target.value)}
                  placeholder="INV-12345"
                  disabled={isViewMode}
                />
              </div>

              <div>
                <Label>Invoice Amount</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={invoiceAmount}
                  onChange={(e) => setInvoiceAmount(e.target.value)}
                  placeholder="0.00"
                  disabled={isViewMode}
                />
              </div>

              <div>
                <Label>Delivery Note Number</Label>
                <Input
                  value={deliveryNoteNumber}
                  onChange={(e) => setDeliveryNoteNumber(e.target.value)}
                  placeholder="DN-12345"
                  disabled={isViewMode}
                />
              </div>

              <div>
                <Label>Vehicle Number</Label>
                <Input
                  value={vehicleNumber}
                  onChange={(e) => setVehicleNumber(e.target.value)}
                  placeholder="ABC-1234"
                  disabled={isViewMode}
                />
              </div>

              <div>
                <Label>Driver Name</Label>
                <Input
                  value={driverName}
                  onChange={(e) => setDriverName(e.target.value)}
                  placeholder="Driver name"
                  disabled={isViewMode}
                />
              </div>

              <div>
                <Label>Received By</Label>
                <Input value={currentUser.username} disabled />
              </div>
            </div>

            <div>
              <Label>General Notes</Label>
              <Textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Add any delivery notes or observations"
                disabled={isViewMode}
                rows={3}
              />
            </div>
          </TabsContent>

          <TabsContent value="items" className="space-y-4">
            {items.length === 0 ? (
              <Card className="p-8 text-center">
                <Package size={48} className="mx-auto text-muted-foreground mb-3" />
                <p className="text-muted-foreground">
                  Select a purchase order to see items
                </p>
              </Card>
            ) : (
              <div className="space-y-3">
                <div className="grid grid-cols-14 gap-2 px-3 text-xs font-medium text-muted-foreground">
                  <div className="col-span-2">Item</div>
                  <div className="col-span-1 text-right">Ordered</div>
                  <div className="col-span-1 text-right">Received</div>
                  <div className="col-span-1 text-right">Damaged</div>
                  <div className="col-span-2">Batch No.</div>
                  <div className="col-span-2">Expiry</div>
                  <div className="col-span-2">Mfg Date</div>
                  <div className="col-span-2">Quality</div>
                  <div className="col-span-1">Barcode</div>
                </div>
                {items.map((item, index) => {
                  const poItem = selectedPO?.items[index]
                  const hasVariance = item.receivedQuantity !== item.orderedQuantity
                  
                  return (
                    <Card key={item.id} className={`p-3 ${hasVariance ? 'border-destructive' : ''}`}>
                      <div className="grid grid-cols-14 gap-2 items-start">
                        <div className="col-span-2">
                          <p className="text-sm font-medium">{poItem?.name}</p>
                          <p className="text-xs text-muted-foreground font-mono">
                            {item.inventoryItemId.slice(-8)}
                          </p>
                          {item.barcode && (
                            <Badge variant="secondary" className="mt-1 gap-1 text-xs">
                              <Barcode size={12} />
                              {item.barcode}
                            </Badge>
                          )}
                        </div>
                        
                        <div className="col-span-1">
                          <p className="text-sm text-right font-medium">{item.orderedQuantity}</p>
                        </div>
                        
                        <div className="col-span-1">
                          {isViewMode ? (
                            <p className={`text-sm text-right font-medium ${hasVariance ? 'text-destructive' : ''}`}>
                              {item.receivedQuantity}
                            </p>
                          ) : (
                            <Input
                              type="number"
                              value={item.receivedQuantity}
                              onChange={(e) => handleUpdateReceived(item.id, e.target.value)}
                              className="text-right h-8"
                            />
                          )}
                        </div>
                        
                        <div className="col-span-1">
                          {isViewMode ? (
                            <p className="text-sm text-right text-destructive font-medium">
                              {item.damagedQuantity}
                            </p>
                          ) : (
                            <Input
                              type="number"
                              value={item.damagedQuantity}
                              onChange={(e) => handleUpdateDamaged(item.id, e.target.value)}
                              className="text-right h-8"
                            />
                          )}
                        </div>
                        
                        <div className="col-span-2">
                          {isViewMode ? (
                            <p className="text-sm">{item.batchNumber || '-'}</p>
                          ) : (
                            <Input
                              value={item.batchNumber || ''}
                              onChange={(e) => handleUpdateBatch(item.id, e.target.value)}
                              placeholder="Batch #"
                              className="h-8"
                            />
                          )}
                        </div>
                        
                        <div className="col-span-2">
                          {isViewMode ? (
                            <p className="text-sm">
                              {item.expiryDate ? formatDate(item.expiryDate) : '-'}
                            </p>
                          ) : (
                            <Input
                              type="date"
                              value={item.expiryDate ? new Date(item.expiryDate).toISOString().split('T')[0] : ''}
                              onChange={(e) => handleUpdateExpiry(item.id, e.target.value)}
                              className="h-8"
                            />
                          )}
                        </div>
                        
                        <div className="col-span-2">
                          {isViewMode ? (
                            <p className="text-sm">
                              {item.manufactureDate ? formatDate(item.manufactureDate) : '-'}
                            </p>
                          ) : (
                            <Input
                              type="date"
                              value={item.manufactureDate ? new Date(item.manufactureDate).toISOString().split('T')[0] : ''}
                              onChange={(e) => handleUpdateManufactureDate(item.id, e.target.value)}
                              className="h-8"
                            />
                          )}
                        </div>
                        
                        <div className="col-span-2">
                          {isViewMode ? (
                            <Badge variant={
                              item.qualityStatus === 'excellent' ? 'default' :
                              item.qualityStatus === 'good' ? 'secondary' :
                              item.qualityStatus === 'fair' ? 'outline' :
                              'destructive'
                            }>
                              {item.qualityStatus}
                            </Badge>
                          ) : (
                            <Select 
                              value={item.qualityStatus || 'good'} 
                              onValueChange={(v) => handleUpdateQuality(item.id, v)}
                            >
                              <SelectTrigger className="h-8">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="excellent">Excellent</SelectItem>
                                <SelectItem value="good">Good</SelectItem>
                                <SelectItem value="fair">Fair</SelectItem>
                                <SelectItem value="poor">Poor</SelectItem>
                                <SelectItem value="rejected">Rejected</SelectItem>
                              </SelectContent>
                            </Select>
                          )}
                        </div>
                        
                        <div className="col-span-1">
                          {!isViewMode && (
                            scanningForItemId === item.id ? (
                              <div className="flex gap-1">
                                <Input
                                  value={barcodeInput}
                                  onChange={(e) => setBarcodeInput(e.target.value)}
                                  placeholder="Scan..."
                                  className="h-8 text-xs"
                                  autoFocus
                                  onKeyDown={(e) => {
                                    if (e.key === 'Enter') handleBarcodeSubmit(item.id)
                                    if (e.key === 'Escape') setScanningForItemId(null)
                                  }}
                                />
                                <Button 
                                  size="sm" 
                                  variant="ghost"
                                  onClick={() => handleBarcodeSubmit(item.id)}
                                  className="h-8 w-8 p-0"
                                >
                                  <Check size={16} />
                                </Button>
                                <Button 
                                  size="sm" 
                                  variant="ghost"
                                  onClick={() => setScanningForItemId(null)}
                                  className="h-8 w-8 p-0"
                                >
                                  <X size={16} />
                                </Button>
                              </div>
                            ) : (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => setScanningForItemId(item.id)}
                                className="h-8 w-full"
                              >
                                <Barcode size={16} />
                              </Button>
                            )
                          )}
                        </div>
                      </div>
                      
                      {hasVariance && !isViewMode && (
                        <div className="mt-3 pt-3 border-t">
                          <Label className="text-xs">Variance Reason</Label>
                          <Input
                            value={item.varianceReason || ''}
                            onChange={(e) => handleUpdateVarianceReason(item.id, e.target.value)}
                            placeholder="Explain the variance..."
                            className="h-8 mt-1"
                          />
                        </div>
                      )}
                    </Card>
                  )
                })}

                <Card className="p-4 bg-muted/30">
                  <div className="grid grid-cols-4 gap-4 text-sm">
                    <div>
                      <p className="text-muted-foreground">Total Items</p>
                      <p className="font-semibold text-lg">{items.length}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Total Ordered</p>
                      <p className="font-semibold text-lg">
                        {items.reduce((sum, item) => sum + item.orderedQuantity, 0)}
                      </p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Total Received</p>
                      <p className="font-semibold text-lg">
                        {items.reduce((sum, item) => sum + item.receivedQuantity, 0)}
                      </p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Total Damaged</p>
                      <p className="font-semibold text-lg text-destructive">
                        {items.reduce((sum, item) => sum + item.damagedQuantity, 0)}
                      </p>
                    </div>
                  </div>
                </Card>
              </div>
            )}
          </TabsContent>

          <TabsContent value="attachments" className="space-y-4">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              multiple
              className="hidden"
              onChange={handleFileUpload}
            />

            <div className="grid grid-cols-2 gap-6">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <Label className="text-base">Invoice Photos</Label>
                  {!isViewMode && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        setUploadType('invoice')
                        fileInputRef.current?.click()
                      }}
                    >
                      <Camera size={16} className="mr-2" />
                      Upload
                    </Button>
                  )}
                </div>
                
                {invoicePhotos.length === 0 ? (
                  <Card className="p-8 text-center border-dashed">
                    <ImageIcon size={48} className="mx-auto text-muted-foreground mb-2" />
                    <p className="text-sm text-muted-foreground">No invoice photos</p>
                  </Card>
                ) : (
                  <div className="grid grid-cols-2 gap-2">
                    {invoicePhotos.map((photo, index) => (
                      <div key={index} className="relative group">
                        <img 
                          src={photo} 
                          alt={`Invoice ${index + 1}`} 
                          className="w-full h-32 object-cover rounded-lg border"
                        />
                        {!isViewMode && (
                          <Button
                            size="sm"
                            variant="destructive"
                            className="absolute top-1 right-1 h-6 w-6 p-0 opacity-0 group-hover:opacity-100"
                            onClick={() => removePhoto('invoice', index)}
                          >
                            <X size={14} />
                          </Button>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div>
                <div className="flex items-center justify-between mb-3">
                  <Label className="text-base">Delivery Note Photos</Label>
                  {!isViewMode && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        setUploadType('delivery')
                        fileInputRef.current?.click()
                      }}
                    >
                      <Camera size={16} className="mr-2" />
                      Upload
                    </Button>
                  )}
                </div>
                
                {deliveryNotePhotos.length === 0 ? (
                  <Card className="p-8 text-center border-dashed">
                    <ImageIcon size={48} className="mx-auto text-muted-foreground mb-2" />
                    <p className="text-sm text-muted-foreground">No delivery note photos</p>
                  </Card>
                ) : (
                  <div className="grid grid-cols-2 gap-2">
                    {deliveryNotePhotos.map((photo, index) => (
                      <div key={index} className="relative group">
                        <img 
                          src={photo} 
                          alt={`Delivery note ${index + 1}`} 
                          className="w-full h-32 object-cover rounded-lg border"
                        />
                        {!isViewMode && (
                          <Button
                            size="sm"
                            variant="destructive"
                            className="absolute top-1 right-1 h-6 w-6 p-0 opacity-0 group-hover:opacity-100"
                            onClick={() => removePhoto('delivery', index)}
                          >
                            <X size={14} />
                          </Button>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="variance" className="space-y-4">
            {!selectedPO ? (
              <Card className="p-8 text-center">
                <Warning size={48} className="mx-auto text-muted-foreground mb-3" />
                <p className="text-muted-foreground">
                  Select a purchase order to check variance
                </p>
              </Card>
            ) : (
              <div className="space-y-4">
                {hasAnyVariance ? (
                  <Alert variant="destructive">
                    <Warning size={20} />
                    <AlertDescription>
                      <span className="font-semibold">Variance detected!</span> The received quantities or damaged items differ from the purchase order.
                    </AlertDescription>
                  </Alert>
                ) : (
                  <Alert>
                    <Check size={20} />
                    <AlertDescription>
                      <span className="font-semibold">No variance detected.</span> All items match the purchase order.
                    </AlertDescription>
                  </Alert>
                )}

                <Card className="p-4">
                  <h3 className="font-semibold mb-3">Variance Summary</h3>
                  <div className="space-y-2">
                    {items.map((item, index) => {
                      const poItem = selectedPO.items[index]
                      const qtyVariance = item.receivedQuantity - item.orderedQuantity
                      const hasItemVariance = qtyVariance !== 0 || item.damagedQuantity > 0
                      
                      if (!hasItemVariance) return null
                      
                      return (
                        <div key={item.id} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                          <div className="flex-1">
                            <p className="font-medium">{poItem?.name}</p>
                            <div className="flex gap-4 mt-1 text-sm">
                              {qtyVariance !== 0 && (
                                <span className={qtyVariance > 0 ? 'text-success' : 'text-destructive'}>
                                  Qty: {qtyVariance > 0 ? '+' : ''}{qtyVariance}
                                </span>
                              )}
                              {item.damagedQuantity > 0 && (
                                <span className="text-destructive">
                                  Damaged: {item.damagedQuantity}
                                </span>
                              )}
                            </div>
                            {item.varianceReason && (
                              <p className="text-xs text-muted-foreground mt-1">
                                Reason: {item.varianceReason}
                              </p>
                            )}
                          </div>
                          <div className="text-right">
                            {item.varianceAmount !== undefined && item.varianceAmount !== 0 && (
                              <p className={`font-semibold ${item.varianceAmount > 0 ? 'text-success' : 'text-destructive'}`}>
                                {item.varianceAmount > 0 ? '+' : ''}{formatCurrency(Math.abs(item.varianceAmount))}
                              </p>
                            )}
                          </div>
                        </div>
                      )
                    })}
                  </div>

                  {totalVariance !== 0 && (
                    <div className="mt-4 pt-4 border-t flex items-center justify-between">
                      <span className="font-semibold">Total Variance:</span>
                      <span className={`text-lg font-bold ${totalVariance > 0 ? 'text-success' : 'text-destructive'}`}>
                        {totalVariance > 0 ? '+' : ''}{formatCurrency(Math.abs(totalVariance))}
                      </span>
                    </div>
                  )}
                </Card>

                {hasAnyVariance && (
                  <div>
                    <Label>Variance Notes</Label>
                    <Textarea
                      value={varianceNotes}
                      onChange={(e) => setVarianceNotes(e.target.value)}
                      placeholder="Explain the overall variance, actions taken, or agreements with supplier..."
                      disabled={isViewMode}
                      rows={3}
                    />
                  </div>
                )}
              </div>
            )}
          </TabsContent>
        </Tabs>

        <DialogFooter>
          {isViewMode ? (
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Close
            </Button>
          ) : (
            <>
              <Button variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button onClick={handleSave}>
                <Package size={18} className="mr-2" />
                Create GRN & Update Stock
              </Button>
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
