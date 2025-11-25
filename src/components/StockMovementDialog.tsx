import { useState, useEffect } from 'react'
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Textarea } from '@/components/ui/textarea'
import { ArrowUp, ArrowDown, ArrowsLeftRight, Trash, Plus } from '@phosphor-icons/react'
import { toast } from 'sonner'
import { format } from 'date-fns'

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

interface StockMovement {
  id: string
  itemId: string
  itemName: string
  type: 'in' | 'out' | 'adjustment' | 'transfer' | 'waste'
  quantity: number
  fromLocation?: string
  toLocation?: string
  reference?: string
  reason?: string
  timestamp: number
  createdBy: string
}

interface StockMovementDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  item: UnifiedInventoryItem
}

export function StockMovementDialog({
  open,
  onOpenChange,
  item,
}: StockMovementDialogProps) {
  const [movements, setMovements] = useKV<StockMovement[]>('w3-hotel-stock-movements', [])
  const [movementType, setMovementType] = useState<'in' | 'out' | 'adjustment' | 'transfer' | 'waste'>('in')
  const [quantity, setQuantity] = useState('')
  const [fromLocation, setFromLocation] = useState(item.storeLocation)
  const [toLocation, setToLocation] = useState('')
  const [reference, setReference] = useState('')
  const [reason, setReason] = useState('')

  useEffect(() => {
    setFromLocation(item.storeLocation)
  }, [item.storeLocation])

  const itemMovements = (movements || [])
    .filter(m => m.itemId === item.id)
    .sort((a, b) => b.timestamp - a.timestamp)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!quantity || parseFloat(quantity) <= 0) {
      toast.error('Please enter a valid quantity')
      return
    }

    const newMovement: StockMovement = {
      id: `mov_${Date.now()}`,
      itemId: item.id,
      itemName: item.name,
      type: movementType,
      quantity: parseFloat(quantity),
      fromLocation: movementType === 'transfer' ? fromLocation : undefined,
      toLocation: movementType === 'transfer' ? toLocation : movementType === 'in' ? item.storeLocation : undefined,
      reference,
      reason: reason || undefined,
      timestamp: Date.now(),
      createdBy: 'Current User',
    }

    setMovements((current) => [...(current || []), newMovement])
    
    toast.success(`Stock movement recorded: ${movementType.toUpperCase()} ${quantity} ${item.unit}`)
    
    setQuantity('')
    setReference('')
    setReason('')
    setToLocation('')
  }

  const getMovementIcon = (type: string) => {
    switch (type) {
      case 'in':
        return <ArrowDown size={16} className="text-success" />
      case 'out':
        return <ArrowUp size={16} className="text-destructive" />
      case 'transfer':
        return <ArrowsLeftRight size={16} className="text-accent" />
      case 'waste':
        return <Trash size={16} className="text-destructive" />
      default:
        return <ArrowsLeftRight size={16} className="text-muted-foreground" />
    }
  }

  const getMovementBadge = (type: string) => {
    switch (type) {
      case 'in':
        return <Badge variant="outline" className="bg-success/10 text-success border-success/20">Incoming</Badge>
      case 'out':
        return <Badge variant="outline" className="bg-destructive/10 text-destructive border-destructive/20">Outgoing</Badge>
      case 'transfer':
        return <Badge variant="outline" className="bg-accent/10 text-accent border-accent/20">Transfer</Badge>
      case 'waste':
        return <Badge variant="destructive">Waste</Badge>
      case 'adjustment':
        return <Badge variant="outline">Adjustment</Badge>
      default:
        return null
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Stock Movement - {item.name}</DialogTitle>
          <DialogDescription>
            Track incoming, outgoing, and internal transfers of inventory items
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          <div className="grid grid-cols-3 gap-4 p-4 bg-muted/50 rounded-lg">
            <div>
              <p className="text-sm text-muted-foreground">Current Stock</p>
              <p className="text-2xl font-semibold">{item.currentStock} {item.unit}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Location</p>
              <p className="text-lg font-medium">{item.storeLocation}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Product ID</p>
              <p className="text-lg font-mono">{item.productId}</p>
            </div>
          </div>

          <Separator />

          <form onSubmit={handleSubmit} className="space-y-4">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <Plus size={20} />
              Record New Movement
            </h3>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="movement-type">Movement Type</Label>
                <Select value={movementType} onValueChange={(value: any) => setMovementType(value)}>
                  <SelectTrigger id="movement-type">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="in">Incoming (Purchase/Receive)</SelectItem>
                    <SelectItem value="out">Outgoing (Consumption/Use)</SelectItem>
                    <SelectItem value="transfer">Transfer Between Locations</SelectItem>
                    <SelectItem value="adjustment">Stock Adjustment</SelectItem>
                    <SelectItem value="waste">Waste/Disposal</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="quantity">Quantity ({item.unit})</Label>
                <Input
                  id="quantity"
                  type="number"
                  step="0.01"
                  placeholder="Enter quantity"
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                  required
                />
              </div>
            </div>

            {movementType === 'transfer' && (
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="from-location">From Location</Label>
                  <Input
                    id="from-location"
                    placeholder="Source location"
                    value={fromLocation}
                    onChange={(e) => setFromLocation(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="to-location">To Location</Label>
                  <Input
                    id="to-location"
                    placeholder="Destination location"
                    value={toLocation}
                    onChange={(e) => setToLocation(e.target.value)}
                    required
                  />
                </div>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="reference">Reference (PO#, Invoice#, etc.)</Label>
              <Input
                id="reference"
                placeholder="Optional reference number"
                value={reference}
                onChange={(e) => setReference(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="reason">Reason/Notes</Label>
              <Textarea
                id="reason"
                placeholder="Optional reason or additional notes"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                rows={2}
              />
            </div>

            <Button type="submit" className="w-full">
              <Plus size={20} className="mr-2" />
              Record Movement
            </Button>
          </form>

          <Separator />

          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Movement History</h3>
            
            {itemMovements.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">No movements recorded yet</p>
            ) : (
              <div className="rounded-lg border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date & Time</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead className="text-right">Quantity</TableHead>
                      <TableHead>Location</TableHead>
                      <TableHead>Reference</TableHead>
                      <TableHead>Reason</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {itemMovements.slice(0, 10).map((movement) => (
                      <TableRow key={movement.id}>
                        <TableCell className="text-sm">
                          {format(movement.timestamp, 'MMM dd, yyyy HH:mm')}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            {getMovementIcon(movement.type)}
                            {getMovementBadge(movement.type)}
                          </div>
                        </TableCell>
                        <TableCell className="text-right font-medium">
                          {movement.quantity} {item.unit}
                        </TableCell>
                        <TableCell className="text-sm">
                          {movement.type === 'transfer'
                            ? `${movement.fromLocation} → ${movement.toLocation}`
                            : movement.toLocation || movement.fromLocation || '-'}
                        </TableCell>
                        <TableCell className="text-sm font-mono">
                          {movement.reference || '-'}
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground max-w-xs truncate">
                          {movement.reason || '-'}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
            
            {itemMovements.length > 10 && (
              <p className="text-sm text-muted-foreground text-center">
                Showing latest 10 of {itemMovements.length} movements
              </p>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
