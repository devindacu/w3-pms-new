import { useState } from 'react'
import { useKV } from '@github/spark/hooks'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { Badge } from '@/components/ui/badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Calendar } from '@/components/ui/calendar'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { Barcode, CalendarBlank, Package, Plus, Warning } from '@phosphor-icons/react'
import { toast } from 'sonner'
import { format, formatDistanceToNow, differenceInDays } from 'date-fns'
import { cn } from '@/lib/utils'

interface UnifiedInventoryItem {
  id: string
  productId: string
  name: string
  category: string
  source: 'food' | 'amenities' | 'construction' | 'general'
  unit: string
  currentStock: number
  reorderLevel: number
  reorderQuantity: number
  unitCost: number
  totalValue: number
  supplierIds: string[]
  storeLocation: string
  batchNumber?: string
  expiryDate?: number
  lastUpdated: number
  stockStatus: 'in-stock' | 'low-stock' | 'out-of-stock' | 'expiring'
}

interface BatchInfo {
  id: string
  itemId: string
  batchNumber: string
  quantity: number
  unit: string
  receivedDate: number
  expiryDate?: number
  supplier?: string
  purchaseReference?: string
  location: string
  status: 'active' | 'expired' | 'recalled' | 'depleted'
  createdAt: number
}

interface BatchTrackingDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  item: UnifiedInventoryItem
}

export function BatchTrackingDialog({
  open,
  onOpenChange,
  item,
}: BatchTrackingDialogProps) {
  const [batches, setBatches] = useKV<BatchInfo[]>('w3-hotel-batch-tracking', [])
  const [batchNumber, setBatchNumber] = useState('')
  const [quantity, setQuantity] = useState('')
  const [expiryDate, setExpiryDate] = useState<Date>()
  const [supplier, setSupplier] = useState('')
  const [purchaseReference, setPurchaseReference] = useState('')

  const itemBatches = (batches || [])
    .filter(b => b.itemId === item.id)
    .sort((a, b) => b.receivedDate - a.receivedDate)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!batchNumber) {
      toast.error('Please enter a batch number')
      return
    }

    if (!quantity || parseFloat(quantity) <= 0) {
      toast.error('Please enter a valid quantity')
      return
    }

    const newBatch: BatchInfo = {
      id: `batch_${Date.now()}`,
      itemId: item.id,
      batchNumber,
      quantity: parseFloat(quantity),
      unit: item.unit,
      receivedDate: Date.now(),
      expiryDate: expiryDate ? expiryDate.getTime() : undefined,
      supplier: supplier || undefined,
      purchaseReference: purchaseReference || undefined,
      location: item.storeLocation,
      status: 'active',
      createdAt: Date.now(),
    }

    setBatches((current) => [...(current || []), newBatch])
    
    toast.success(`Batch ${batchNumber} recorded successfully`)
    
    setBatchNumber('')
    setQuantity('')
    setExpiryDate(undefined)
    setSupplier('')
    setPurchaseReference('')
  }

  const getExpiryStatus = (expiryDate?: number) => {
    if (!expiryDate) return null
    
    const daysToExpiry = differenceInDays(expiryDate, Date.now())
    
    if (daysToExpiry < 0) {
      return <Badge variant="destructive">Expired</Badge>
    } else if (daysToExpiry <= 7) {
      return <Badge variant="outline" className="bg-destructive/10 text-destructive border-destructive/20">
        Expires in {daysToExpiry} days
      </Badge>
    } else if (daysToExpiry <= 30) {
      return <Badge variant="outline" className="bg-accent/10 text-accent border-accent/20">
        Expires in {daysToExpiry} days
      </Badge>
    } else {
      return <Badge variant="outline" className="bg-success/10 text-success border-success/20">
        Valid
      </Badge>
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge variant="outline" className="bg-success/10 text-success border-success/20">Active</Badge>
      case 'expired':
        return <Badge variant="destructive">Expired</Badge>
      case 'recalled':
        return <Badge variant="destructive">Recalled</Badge>
      case 'depleted':
        return <Badge variant="outline">Depleted</Badge>
      default:
        return null
    }
  }

  const totalBatchQuantity = itemBatches
    .filter(b => b.status === 'active')
    .reduce((sum, b) => sum + b.quantity, 0)

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Batch & Expiry Tracking - {item.name}</DialogTitle>
          <DialogDescription>
            Track batch numbers and expiry dates for quality control and compliance
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          <div className="grid grid-cols-4 gap-4 p-4 bg-muted/50 rounded-lg">
            <div>
              <p className="text-sm text-muted-foreground">Total Stock</p>
              <p className="text-2xl font-semibold">{item.currentStock} {item.unit}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Tracked in Batches</p>
              <p className="text-2xl font-semibold">{totalBatchQuantity} {item.unit}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Active Batches</p>
              <p className="text-2xl font-semibold">{itemBatches.filter(b => b.status === 'active').length}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Current Batch</p>
              <p className="text-lg font-mono">{item.batchNumber || 'N/A'}</p>
            </div>
          </div>

          <Separator />

          <form onSubmit={handleSubmit} className="space-y-4">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <Plus size={20} />
              Add New Batch
            </h3>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="batch-number">Batch Number *</Label>
                <div className="relative">
                  <Barcode size={20} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="batch-number"
                    placeholder="e.g., BATCH-2024-001"
                    value={batchNumber}
                    onChange={(e) => setBatchNumber(e.target.value)}
                    className="pl-10"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="batch-quantity">Quantity ({item.unit}) *</Label>
                <Input
                  id="batch-quantity"
                  type="number"
                  step="0.01"
                  placeholder="Enter quantity"
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Expiry Date</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !expiryDate && "text-muted-foreground"
                      )}
                    >
                      <CalendarBlank size={16} className="mr-2" />
                      {expiryDate ? format(expiryDate, "PPP") : "Select expiry date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={expiryDate}
                      onSelect={setExpiryDate}
                      disabled={(date) => date < new Date()}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>

              <div className="space-y-2">
                <Label htmlFor="supplier">Supplier</Label>
                <Input
                  id="supplier"
                  placeholder="Supplier name"
                  value={supplier}
                  onChange={(e) => setSupplier(e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="purchase-ref">Purchase Reference</Label>
              <Input
                id="purchase-ref"
                placeholder="PO number or invoice reference"
                value={purchaseReference}
                onChange={(e) => setPurchaseReference(e.target.value)}
              />
            </div>

            <Button type="submit" className="w-full">
              <Plus size={20} className="mr-2" />
              Add Batch
            </Button>
          </form>

          <Separator />

          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Batch Records</h3>
            
            {itemBatches.length === 0 ? (
              <div className="text-center py-8">
                <Package size={48} className="mx-auto text-muted-foreground mb-2" />
                <p className="text-muted-foreground">No batches recorded yet</p>
              </div>
            ) : (
              <div className="rounded-lg border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Batch Number</TableHead>
                      <TableHead className="text-right">Quantity</TableHead>
                      <TableHead>Received</TableHead>
                      <TableHead>Expiry Date</TableHead>
                      <TableHead>Supplier</TableHead>
                      <TableHead>Reference</TableHead>
                      <TableHead>Location</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {itemBatches.map((batch) => (
                      <TableRow key={batch.id}>
                        <TableCell className="font-mono font-medium">{batch.batchNumber}</TableCell>
                        <TableCell className="text-right">{batch.quantity} {batch.unit}</TableCell>
                        <TableCell className="text-sm">
                          {format(batch.receivedDate, 'MMM dd, yyyy')}
                          <br />
                          <span className="text-xs text-muted-foreground">
                            {formatDistanceToNow(batch.receivedDate, { addSuffix: true })}
                          </span>
                        </TableCell>
                        <TableCell>
                          {batch.expiryDate ? (
                            <div className="space-y-1">
                              <div className="text-sm">{format(batch.expiryDate, 'MMM dd, yyyy')}</div>
                              {getExpiryStatus(batch.expiryDate)}
                            </div>
                          ) : (
                            <span className="text-muted-foreground text-sm">No expiry</span>
                          )}
                        </TableCell>
                        <TableCell className="text-sm">{batch.supplier || '-'}</TableCell>
                        <TableCell className="text-sm font-mono">{batch.purchaseReference || '-'}</TableCell>
                        <TableCell className="text-sm">{batch.location}</TableCell>
                        <TableCell>{getStatusBadge(batch.status)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </div>

          {itemBatches.some(b => b.expiryDate && differenceInDays(b.expiryDate, Date.now()) <= 7 && differenceInDays(b.expiryDate, Date.now()) >= 0) && (
            <div className="p-4 bg-destructive/10 border border-destructive/20 rounded-lg flex items-start gap-3">
              <Warning size={24} className="text-destructive flex-shrink-0" />
              <div>
                <h4 className="font-semibold text-destructive mb-1">Expiring Soon</h4>
                <p className="text-sm text-muted-foreground">
                  Some batches are expiring within the next 7 days. Please review and take appropriate action.
                </p>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
