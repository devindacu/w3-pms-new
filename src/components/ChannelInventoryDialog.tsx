import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import type { ChannelInventory, OTAConnection, Room, RoomType, OTAChannel } from '@/lib/types'

interface ChannelInventoryDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  connections: OTAConnection[]
  rooms: Room[]
  onSave: (inventory: ChannelInventory[]) => void
  currentUser: { firstName: string; lastName: string }
}

export function ChannelInventoryDialog({
  open,
  onOpenChange,
  connections,
  rooms,
  onSave,
  currentUser
}: ChannelInventoryDialogProps) {
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0])
  const [selectedRoomType, setSelectedRoomType] = useState<RoomType>('standard')
  const [allocations, setAllocations] = useState<Record<OTAChannel, number>>({} as any)

  const totalRooms = rooms.filter(r => r.roomType === selectedRoomType).length
  const allocatedTotal = Object.values(allocations).reduce((sum, val) => sum + val, 0)

  const handleSave = () => {
    const inv: ChannelInventory = {
      id: `inv-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      date: new Date(selectedDate).getTime(),
      roomType: selectedRoomType,
      totalRooms,
      availableRooms: totalRooms - allocatedTotal,
      channelAllocations: allocations,
      reservedRooms: allocatedTotal,
      blockedRooms: 0,
      overbooking: 0,
      lastUpdated: Date.now(),
      updatedBy: `${currentUser.firstName} ${currentUser.lastName}`
    }
    onSave([inv])
    onOpenChange(false)
    setAllocations({} as any)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Allocate Channel Inventory</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="date">Date</Label>
            <Input
              id="date"
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="roomType">Room Type</Label>
            <Select value={selectedRoomType} onValueChange={(v) => setSelectedRoomType(v as RoomType)}>
              <SelectTrigger id="roomType">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="standard">Standard</SelectItem>
                <SelectItem value="deluxe">Deluxe</SelectItem>
                <SelectItem value="suite">Suite</SelectItem>
                <SelectItem value="executive">Executive</SelectItem>
                <SelectItem value="presidential">Presidential</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-sm text-muted-foreground">
              Total rooms: {totalRooms} | Allocated: {allocatedTotal} | Available: {totalRooms - allocatedTotal}
            </p>
          </div>

          <div className="space-y-3">
            <Label>Channel Allocations</Label>
            {connections.map((conn) => (
              <div key={conn.id} className="flex items-center justify-between gap-2">
                <Label htmlFor={conn.id} className="text-sm">{conn.name}</Label>
                <Input
                  id={conn.id}
                  type="number"
                  value={allocations[conn.channel] || 0}
                  onChange={(e) => setAllocations({
                    ...allocations,
                    [conn.channel]: parseInt(e.target.value) || 0
                  })}
                  className="w-24"
                  min="0"
                  max={totalRooms}
                />
              </div>
            ))}
          </div>

          {allocatedTotal > totalRooms && (
            <div className="p-3 bg-destructive/10 rounded-lg text-sm text-destructive">
              Warning: Allocated rooms ({allocatedTotal}) exceed available rooms ({totalRooms})
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={allocatedTotal > totalRooms}>
            Save Allocation
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
