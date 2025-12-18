import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useOfflineQueue } from '@/hooks/use-offline'
import { toast } from 'sonner'
import { Broom, CheckCircle, WifiSlash, Bed } from '@phosphor-icons/react'
import type { Room } from '@/lib/types'

type QuickRoomStatusProps = {
  rooms: Room[]
  onUpdateRoom: (roomId: string, updates: Partial<Room>) => void
  isOnline: boolean
}

const ROOM_STATUSES = [
  { value: 'vacant-clean', label: 'Vacant Clean', color: 'bg-success' },
  { value: 'vacant-dirty', label: 'Vacant Dirty', color: 'bg-warning' },
  { value: 'occupied', label: 'Occupied', color: 'bg-primary' },
  { value: 'maintenance', label: 'Maintenance', color: 'bg-destructive' },
  { value: 'out-of-order', label: 'Out of Order', color: 'bg-secondary' },
] as const

export function QuickRoomStatus({
  rooms,
  onUpdateRoom,
  isOnline,
}: QuickRoomStatusProps) {
  const { queueOperation } = useOfflineQueue()
  const [selectedRoom, setSelectedRoom] = useState<string>('')
  const [newStatus, setNewStatus] = useState<string>('')

  const handleStatusUpdate = async () => {
    if (!selectedRoom || !newStatus) {
      toast.error('Please select room and status')
      return
    }

    const room = rooms.find((r) => r.id === selectedRoom)
    if (!room) return

    try {
      onUpdateRoom(selectedRoom, {
        status: newStatus as any,
      })

      await queueOperation(
        'update',
        'room-status',
        {
          roomId: selectedRoom,
          roomNumber: room.roomNumber,
          oldStatus: room.status,
          newStatus,
          timestamp: Date.now(),
        },
        'high'
      )

      toast.success(
        `Room ${room.roomNumber} status updated${!isOnline ? ' (will sync when online)' : ''}`
      )

      setSelectedRoom('')
      setNewStatus('')
    } catch (error) {
      toast.error('Failed to update room status')
    }
  }

  const selectedRoomData = rooms.find((r) => r.id === selectedRoom)

  return (
    <Card className="p-4 md:p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold">Quick Status Update</h3>
        {!isOnline && (
          <Badge variant="outline" className="border-warning text-warning">
            <WifiSlash size={12} className="mr-1" />
            Offline Mode
          </Badge>
        )}
      </div>

      <div className="space-y-4">
        <div>
          <Label htmlFor="room-status-select">Select Room</Label>
          <Select value={selectedRoom} onValueChange={setSelectedRoom}>
            <SelectTrigger id="room-status-select">
              <SelectValue placeholder="Choose a room" />
            </SelectTrigger>
            <SelectContent>
              {rooms.map((room) => (
                <SelectItem key={room.id} value={room.id}>
                  <div className="flex items-center gap-2">
                    <Bed size={16} />
                    <span>Room {room.roomNumber}</span>
                    <Badge className="ml-auto text-xs">{room.status}</Badge>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {selectedRoomData && (
          <div className="p-3 bg-muted/50 rounded-lg">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Current Status:</span>
              <Badge>{selectedRoomData.status}</Badge>
            </div>
          </div>
        )}

        <div>
          <Label htmlFor="new-status-select">New Status</Label>
          <Select value={newStatus} onValueChange={setNewStatus}>
            <SelectTrigger id="new-status-select">
              <SelectValue placeholder="Select new status" />
            </SelectTrigger>
            <SelectContent>
              {ROOM_STATUSES.map((status) => (
                <SelectItem key={status.value} value={status.value}>
                  <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${status.color}`} />
                    <span>{status.label}</span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <Button
          onClick={handleStatusUpdate}
          className="w-full"
          size="lg"
          disabled={!selectedRoom || !newStatus}
        >
          <CheckCircle size={20} className="mr-2" weight="bold" />
          Update Status
        </Button>

        {!isOnline && (
          <div className="rounded-lg bg-warning/10 border border-warning/20 p-3 text-sm">
            <p className="text-warning font-medium mb-1">Working Offline</p>
            <p className="text-muted-foreground text-xs">
              Status updates are saved locally and will sync when you're back
              online.
            </p>
          </div>
        )}
      </div>
    </Card>
  )
}
