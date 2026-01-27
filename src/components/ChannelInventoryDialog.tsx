import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import type { ChannelInventory, OTAConnection, Room, RoomType, OTAChannel } from '@/lib/types'
import { PrintButton } from '@/components/PrintButton'
import { A4PrintWrapper } from '@/components/A4PrintWrapper'

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
          <DialogTitle className="flex items-center justify-between">
            <span>Allocate Channel Inventory</span>
            <PrintButton
              elementId="channel-inventory-printable"
              options={{
                title: 'Channel Inventory Allocation',
                filename: `channel-inventory-${selectedDate}.pdf`
              }}
              variant="outline"
              size="sm"
            />
          </DialogTitle>
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

        {/* Hidden printable content */}
        <div className="hidden">
          <A4PrintWrapper
            id="channel-inventory-printable"
            title="Channel Inventory Allocation"
            headerContent={
              <div className="text-sm">
                <p><strong>Date:</strong> {new Date(selectedDate).toLocaleDateString()}</p>
                <p><strong>Room Type:</strong> {selectedRoomType}</p>
                <p><strong>Total Rooms:</strong> {totalRooms}</p>
              </div>
            }
          >
            <div className="space-y-6">
              <section>
                <h2 className="text-lg font-semibold mb-4">Allocation Summary</h2>
                <table className="w-full border-collapse mb-6">
                  <tbody>
                    <tr className="border-b">
                      <td className="p-2 font-semibold">Date</td>
                      <td className="p-2">{new Date(selectedDate).toLocaleDateString()}</td>
                    </tr>
                    <tr className="border-b">
                      <td className="p-2 font-semibold">Room Type</td>
                      <td className="p-2 capitalize">{selectedRoomType}</td>
                    </tr>
                    <tr className="border-b">
                      <td className="p-2 font-semibold">Total Rooms</td>
                      <td className="p-2">{totalRooms}</td>
                    </tr>
                    <tr className="border-b">
                      <td className="p-2 font-semibold">Allocated Rooms</td>
                      <td className="p-2">{allocatedTotal}</td>
                    </tr>
                    <tr className="border-b">
                      <td className="p-2 font-semibold">Available Rooms</td>
                      <td className="p-2">{totalRooms - allocatedTotal}</td>
                    </tr>
                  </tbody>
                </table>
              </section>

              <section>
                <h2 className="text-lg font-semibold mb-4">Channel Allocations</h2>
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="bg-gray-100">
                      <th className="border p-2 text-left">Channel</th>
                      <th className="border p-2 text-right">Allocated Rooms</th>
                    </tr>
                  </thead>
                  <tbody>
                    {connections.map((conn) => (
                      <tr key={conn.id}>
                        <td className="border p-2">{conn.name}</td>
                        <td className="border p-2 text-right font-semibold">{allocations[conn.channel] || 0}</td>
                      </tr>
                    ))}
                    <tr className="bg-gray-50">
                      <td className="border p-2 text-right font-semibold">Total:</td>
                      <td className="border p-2 text-right font-bold">{allocatedTotal}</td>
                    </tr>
                  </tbody>
                </table>
              </section>
            </div>
          </A4PrintWrapper>
        </div>
      </DialogContent>
    </Dialog>
  )
}
