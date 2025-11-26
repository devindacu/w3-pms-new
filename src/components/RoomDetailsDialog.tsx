import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Card } from '@/components/ui/card'
import {
  Bed,
  Users,
  CurrencyDollar,
  CalendarBlank,
  User,
  NotePencil,
  PencilSimple,
  Check,
  Broom,
  Wrench,
  X
} from '@phosphor-icons/react'
import type { Room, RoomStatus } from '@/lib/types'
import { formatCurrency } from '@/lib/helpers'

interface RoomDetailsDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  room: Room | null
  onEdit: (room: Room) => void
}

export function RoomDetailsDialog({ open, onOpenChange, room, onEdit }: RoomDetailsDialogProps) {
  if (!room) return null

  const getRoomStatusColor = (status: RoomStatus) => {
    switch (status) {
      case 'vacant-clean':
        return 'bg-success/10 text-success border-success'
      case 'vacant-dirty':
        return 'bg-accent/10 text-accent border-accent'
      case 'occupied-clean':
        return 'bg-primary/10 text-primary border-primary'
      case 'occupied-dirty':
        return 'bg-destructive/10 text-destructive border-destructive'
      case 'maintenance':
        return 'bg-muted text-muted-foreground border-muted-foreground'
      case 'out-of-order':
        return 'bg-destructive/20 text-destructive border-destructive'
      default:
        return 'bg-muted text-muted-foreground border-border'
    }
  }

  const getRoomStatusIcon = (status: RoomStatus) => {
    switch (status) {
      case 'vacant-clean':
        return <Check size={20} />
      case 'vacant-dirty':
        return <Broom size={20} />
      case 'occupied-clean':
        return <Bed size={20} />
      case 'occupied-dirty':
        return <Bed size={20} />
      case 'maintenance':
        return <Wrench size={20} />
      case 'out-of-order':
        return <X size={20} />
      default:
        return null
    }
  }

  const getRoomTypeLabel = (type: string) => {
    return type.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')
  }

  const formatDate = (timestamp?: number) => {
    if (!timestamp) return 'Never'
    return new Date(timestamp).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span>Room Details - {room.roomNumber}</span>
            <Badge className={getRoomStatusColor(room.status)}>
              <span className="flex items-center gap-1">
                {getRoomStatusIcon(room.status)}
                <span className="capitalize">{room.status.replace('-', ' ')}</span>
              </span>
            </Badge>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <Card className="p-4">
              <div className="flex items-center gap-2 text-muted-foreground mb-2">
                <Bed size={18} />
                <span className="text-sm">Room Type</span>
              </div>
              <div className="text-xl font-semibold">
                {getRoomTypeLabel(room.roomType)}
              </div>
            </Card>

            <Card className="p-4">
              <div className="flex items-center gap-2 text-muted-foreground mb-2">
                <CurrencyDollar size={18} />
                <span className="text-sm">Base Rate</span>
              </div>
              <div className="text-xl font-semibold">
                {formatCurrency(room.baseRate)}/night
              </div>
            </Card>

            <Card className="p-4">
              <div className="flex items-center gap-2 text-muted-foreground mb-2">
                <Users size={18} />
                <span className="text-sm">Max Occupancy</span>
              </div>
              <div className="text-xl font-semibold">
                {room.maxOccupancy} guests
              </div>
            </Card>

            <Card className="p-4">
              <div className="flex items-center gap-2 text-muted-foreground mb-2">
                <span className="text-sm">Floor</span>
              </div>
              <div className="text-xl font-semibold">
                Floor {room.floor}
              </div>
            </Card>
          </div>

          <Separator />

          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <CalendarBlank size={18} className="text-muted-foreground" />
              <span className="text-sm font-medium">Last Cleaned</span>
            </div>
            <div className="text-muted-foreground">
              {formatDate(room.lastCleaned)}
            </div>
          </div>

          {room.assignedHousekeeper && (
            <>
              <Separator />
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <User size={18} className="text-muted-foreground" />
                  <span className="text-sm font-medium">Assigned Housekeeper</span>
                </div>
                <div className="text-muted-foreground">
                  {room.assignedHousekeeper}
                </div>
              </div>
            </>
          )}

          <Separator />

          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Bed size={18} className="text-muted-foreground" />
              <span className="text-sm font-medium">Amenities</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {room.amenities.length === 0 ? (
                <span className="text-sm text-muted-foreground">No amenities listed</span>
              ) : (
                room.amenities.map((amenity, idx) => (
                  <Badge key={idx} variant="secondary">
                    {amenity}
                  </Badge>
                ))
              )}
            </div>
          </div>

          {room.notes && (
            <>
              <Separator />
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <NotePencil size={18} className="text-muted-foreground" />
                  <span className="text-sm font-medium">Notes</span>
                </div>
                <div className="text-sm text-muted-foreground whitespace-pre-wrap">
                  {room.notes}
                </div>
              </div>
            </>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Close
          </Button>
          <Button onClick={() => {
            onOpenChange(false)
            onEdit(room)
          }}>
            <PencilSimple size={18} className="mr-2" />
            Edit Room
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
