import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Clock, User, House, Truck, Coffee } from '@phosphor-icons/react'
import type { Order, Guest, Room } from '@/lib/types'
import { formatCurrency } from '@/lib/helpers'

interface OrderDialogProps {
  order: Order | null
  open: boolean
  onOpenChange: (open: boolean) => void
  guests: Guest[]
  rooms: Room[]
}

export function OrderDialog({ order, open, onOpenChange, guests, rooms }: OrderDialogProps) {
  if (!order) return null

  const guest = guests.find(g => g.id === order.guestId)
  const room = rooms.find(r => r.id === order.roomId)

  const getOrderTypeIcon = () => {
    switch (order.type) {
      case 'room-service': return <Truck size={16} />
      case 'dine-in': return <House size={16} />
      case 'takeaway': return <Coffee size={16} />
      default: return null
    }
  }

  return (
    <DialogAdapter open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Order Details - {order.orderNumber}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-muted-foreground">Order Type</p>
              <div className="flex items-center gap-2 mt-1">
                {getOrderTypeIcon()}
                <p className="font-medium capitalize">{order.type.replace('-', ' ')}</p>
              </div>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Status</p>
              <Badge className="mt-1 capitalize">{order.status}</Badge>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Payment Status</p>
              <Badge variant="outline" className="mt-1 capitalize">{order.paymentStatus}</Badge>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Order Time</p>
              <div className="flex items-center gap-2 mt-1">
                <Clock size={16} className="text-muted-foreground" />
                <p className="font-medium">{new Date(order.createdAt).toLocaleString()}</p>
              </div>
            </div>
          </div>

          {order.type === 'dine-in' && order.tableNumber && (
            <div>
              <p className="text-sm text-muted-foreground">Table Number</p>
              <p className="font-medium mt-1">{order.tableNumber}</p>
            </div>
          )}

          {order.type === 'room-service' && room && (
            <div>
              <p className="text-sm text-muted-foreground">Room</p>
              <p className="font-medium mt-1">Room {room.roomNumber}</p>
            </div>
          )}

          {guest && (
            <div>
              <p className="text-sm text-muted-foreground">Guest</p>
              <div className="flex items-center gap-2 mt-1">
                <User size={16} className="text-muted-foreground" />
                <p className="font-medium">{guest.firstName} {guest.lastName}</p>
              </div>
            </div>
          )}

          <Separator />

          <div>
            <h3 className="font-semibold mb-3">Order Items</h3>
            <div className="space-y-2">
              {order.items.map((item) => (
                <div key={item.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                  <div className="flex-1">
                    <p className="font-medium">{item.name}</p>
                    {item.specialInstructions && (
                      <p className="text-sm text-muted-foreground">{item.specialInstructions}</p>
                    )}
                    <p className="text-sm text-muted-foreground">{formatCurrency(item.price)} × {item.quantity}</p>
                  </div>
                  <p className="font-semibold">{formatCurrency(item.price * item.quantity)}</p>
                </div>
              ))}
            </div>
          </div>

          {order.notes && (
            <div>
              <p className="text-sm text-muted-foreground">Notes</p>
              <p className="mt-1">{order.notes}</p>
            </div>
          )}

          <Separator />

          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Subtotal</span>
              <span className="font-medium">{formatCurrency(order.subtotal)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Tax</span>
              <span className="font-medium">{formatCurrency(order.tax)}</span>
            </div>
            <Separator />
            <div className="flex justify-between text-lg font-bold">
              <span>Total</span>
              <span className="text-primary">{formatCurrency(order.total)}</span>
            </div>
          </div>
        </div>
      </DialogContent>
    </DialogAdapter>
  )
}
