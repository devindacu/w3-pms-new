import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
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
import {
  SignIn,
  SignOut,
  Bed,
  CheckCircle,
  WifiSlash,
} from '@phosphor-icons/react'
import type { Room } from '@/lib/types'

type QuickCheckInOutProps = {
  rooms: Room[]
  onUpdateRoom: (roomId: string, updates: Partial<Room>) => void
  isOnline: boolean
}

export function QuickCheckInOut({
  rooms,
  onUpdateRoom,
  isOnline,
}: QuickCheckInOutProps) {
  const { queueOperation } = useOfflineQueue()
  const [selectedRoom, setSelectedRoom] = useState<string>('')
  const [guestName, setGuestName] = useState('')
  const [action, setAction] = useState<'checkin' | 'checkout'>('checkin')

  const availableRooms = rooms.filter((r) =>
    action === 'checkin' ? r.status === 'vacant-clean' : r.status.startsWith('occupied')
  )

  const handleQuickAction = async () => {
    if (!selectedRoom) {
      toast.error('Please select a room')
      return
    }

    if (action === 'checkin' && !guestName.trim()) {
      toast.error('Please enter guest name')
      return
    }

    const room = rooms.find((r) => r.id === selectedRoom)
    if (!room) return

    const updates: Partial<Room> = {
      status: action === 'checkin' ? 'occupied-clean' : 'vacant-dirty',
    }

    try {
      onUpdateRoom(selectedRoom, updates)

      await queueOperation(
        'update',
        `room-${action}`,
        {
          roomId: selectedRoom,
          roomNumber: room.roomNumber,
          guestName: action === 'checkin' ? guestName : undefined,
          action,
          timestamp: Date.now(),
        },
        'high'
      )

      toast.success(
        `Room ${room.roomNumber} ${
          action === 'checkin' ? 'checked in' : 'checked out'
        } successfully${!isOnline ? ' (will sync when online)' : ''}`
      )

      setSelectedRoom('')
      setGuestName('')
    } catch (error) {
      toast.error('Failed to process action')
    }
  }

  return (
    <Card className="p-4 md:p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold">Quick Check-In/Out</h3>
        {!isOnline && (
          <Badge variant="outline" className="border-warning text-warning">
            <WifiSlash size={12} className="mr-1" />
            Offline Mode
          </Badge>
        )}
      </div>

      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-2">
          <Button
            variant={action === 'checkin' ? 'default' : 'outline'}
            onClick={() => {
              setAction('checkin')
              setSelectedRoom('')
            }}
            className="w-full"
          >
            <SignIn size={18} className="mr-2" />
            Check-In
          </Button>
          <Button
            variant={action === 'checkout' ? 'default' : 'outline'}
            onClick={() => {
              setAction('checkout')
              setSelectedRoom('')
              setGuestName('')
            }}
            className="w-full"
          >
            <SignOut size={18} className="mr-2" />
            Check-Out
          </Button>
        </div>

        <div className="space-y-3">
          <div>
            <Label htmlFor="room-select">Select Room</Label>
            <Select value={selectedRoom} onValueChange={setSelectedRoom}>
              <SelectTrigger id="room-select">
                <SelectValue placeholder="Choose a room" />
              </SelectTrigger>
              <SelectContent>
                {availableRooms.length === 0 ? (
                  <div className="p-4 text-center text-sm text-muted-foreground">
                    No {action === 'checkin' ? 'available' : 'occupied'} rooms
                  </div>
                ) : (
                  availableRooms.map((room) => (
                    <SelectItem key={room.id} value={room.id}>
                      <div className="flex items-center gap-2">
                        <Bed size={16} />
                        <span>Room {room.roomNumber}</span>
                        <span className="text-muted-foreground">
                          - {room.roomType}
                        </span>
                      </div>
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
          </div>

          {action === 'checkin' && (
            <div>
              <Label htmlFor="guest-name">Guest Name</Label>
              <Input
                id="guest-name"
                placeholder="Enter guest name"
                value={guestName}
                onChange={(e) => setGuestName(e.target.value)}
              />
            </div>
          )}

          <Button
            onClick={handleQuickAction}
            className="w-full"
            size="lg"
            disabled={!selectedRoom || (action === 'checkin' && !guestName)}
          >
            <CheckCircle size={20} className="mr-2" weight="bold" />
            {action === 'checkin' ? 'Complete Check-In' : 'Complete Check-Out'}
          </Button>
        </div>

        {!isOnline && (
          <div className="rounded-lg bg-warning/10 border border-warning/20 p-3 text-sm">
            <p className="text-warning font-medium mb-1">Working Offline</p>
            <p className="text-muted-foreground text-xs">
              This action will be saved locally and synced automatically when
              you're back online.
            </p>
          </div>
        )}
      </div>
    </Card>
  )
}
