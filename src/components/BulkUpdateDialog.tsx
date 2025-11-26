import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import type { BulkUpdateOperation, OTAConnection, RoomType } from '@/lib/types'

interface BulkUpdateDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  connections: OTAConnection[]
  onSave: (operation: BulkUpdateOperation) => void
  currentUser: { firstName: string; lastName: string }
}

export function BulkUpdateDialog({
  open,
  onOpenChange,
  connections,
  onSave,
  currentUser
}: BulkUpdateDialogProps) {
  const [operationType, setOperationType] = useState<'rate-update' | 'availability-update'>('rate-update')
  const [selectedChannels, setSelectedChannels] = useState<string[]>([])
  const [selectedRoomTypes, setSelectedRoomTypes] = useState<RoomType[]>([])
  const [dateFrom, setDateFrom] = useState(new Date().toISOString().split('T')[0])
  const [dateTo, setDateTo] = useState(new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0])
  const [rateValue, setRateValue] = useState<number>(0)
  const [availabilityValue, setAvailabilityValue] = useState<number>(0)

  const roomTypes: RoomType[] = ['standard', 'deluxe', 'suite', 'executive', 'presidential']

  const handleSave = () => {
    const op: BulkUpdateOperation = {
      id: `bulk-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      operationType,
      status: 'pending',
      channels: selectedChannels as any[],
      roomTypes: selectedRoomTypes,
      dateRange: {
        from: new Date(dateFrom).getTime(),
        to: new Date(dateTo).getTime()
      },
      updates: operationType === 'rate-update' 
        ? { rate: rateValue }
        : { availability: availabilityValue },
      totalRecords: selectedChannels.length * selectedRoomTypes.length * 30,
      processedRecords: 0,
      failedRecords: 0,
      createdBy: `${currentUser.firstName} ${currentUser.lastName}`,
      createdAt: Date.now()
    }
    onSave(op)
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Bulk Update</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="opType">Operation Type</Label>
            <Select value={operationType} onValueChange={(v) => setOperationType(v as any)}>
              <SelectTrigger id="opType">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="rate-update">Rate Update</SelectItem>
                <SelectItem value="availability-update">Availability Update</SelectItem>
                <SelectItem value="restriction-update">Restriction Update</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="dateFrom">From Date</Label>
              <Input
                id="dateFrom"
                type="date"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="dateTo">To Date</Label>
              <Input
                id="dateTo"
                type="date"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Channels</Label>
            <div className="grid grid-cols-2 gap-2">
              {connections.map((conn) => (
                <div key={conn.id} className="flex items-center space-x-2">
                  <Checkbox
                    id={`ch-${conn.id}`}
                    checked={selectedChannels.includes(conn.channel)}
                    onCheckedChange={(checked) => {
                      setSelectedChannels(checked
                        ? [...selectedChannels, conn.channel]
                        : selectedChannels.filter((c) => c !== conn.channel)
                      )
                    }}
                  />
                  <label htmlFor={`ch-${conn.id}`} className="text-sm">
                    {conn.name}
                  </label>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <Label>Room Types</Label>
            <div className="grid grid-cols-2 gap-2">
              {roomTypes.map((type) => (
                <div key={type} className="flex items-center space-x-2">
                  <Checkbox
                    id={`rt-${type}`}
                    checked={selectedRoomTypes.includes(type)}
                    onCheckedChange={(checked) => {
                      setSelectedRoomTypes(checked
                        ? [...selectedRoomTypes, type]
                        : selectedRoomTypes.filter((t) => t !== type)
                      )
                    }}
                  />
                  <label htmlFor={`rt-${type}`} className="text-sm capitalize">
                    {type.replace('-', ' ')}
                  </label>
                </div>
              ))}
            </div>
          </div>

          {operationType === 'rate-update' && (
            <div className="space-y-2">
              <Label htmlFor="rate">New Rate</Label>
              <Input
                id="rate"
                type="number"
                value={rateValue}
                onChange={(e) => setRateValue(parseFloat(e.target.value))}
                placeholder="100.00"
                step="0.01"
              />
            </div>
          )}

          {operationType === 'availability-update' && (
            <div className="space-y-2">
              <Label htmlFor="availability">Available Rooms</Label>
              <Input
                id="availability"
                type="number"
                value={availabilityValue}
                onChange={(e) => setAvailabilityValue(parseInt(e.target.value))}
                placeholder="10"
              />
            </div>
          )}

          <div className="p-4 bg-muted/50 rounded-lg">
            <p className="text-sm text-muted-foreground">
              This will update {selectedChannels.length} channels × {selectedRoomTypes.length} room types 
              for the selected date range.
            </p>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            disabled={!selectedChannels.length || !selectedRoomTypes.length}
          >
            Schedule Update
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
