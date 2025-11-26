import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Plus, Trash, FloppyDisk } from '@phosphor-icons/react'
import { toast } from 'sonner'
import { formatCurrency } from '@/lib/helpers'
import {
  type WasteTracking,
  type WasteItem,
  type ShiftType,
  type KitchenStation,
  type KitchenStaff,
  type FoodItem
} from '@/lib/types'

interface WasteTrackingDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  waste?: WasteTracking
  wasteTracking: WasteTracking[]
  setWasteTracking: (waste: WasteTracking[] | ((prev: WasteTracking[]) => WasteTracking[])) => void
  stations: KitchenStation[]
  staff: KitchenStaff[]
  foodItems: FoodItem[]
}

const shiftTypes: ShiftType[] = ['morning', 'afternoon', 'evening', 'night', 'full-day']
const wasteCategories = [
  'preparation-waste',
  'overproduction',
  'spoilage',
  'customer-return',
  'quality-rejection',
  'breakage',
  'other'
]

export function WasteTrackingDialog({
  open,
  onOpenChange,
  waste,
  wasteTracking,
  setWasteTracking,
  stations,
  staff,
  foodItems
}: WasteTrackingDialogProps) {
  const [formData, setFormData] = useState<Partial<WasteTracking>>({
    wasteId: '',
    date: Date.now(),
    shiftType: 'morning',
    station: '',
    items: [],
    totalWasteCost: 0,
    reportedBy: '',
    supervisorApproval: '',
    correctiveActions: '',
    notes: ''
  })
  const [wasteItemInput, setWasteItemInput] = useState<Partial<WasteItem>>({
    itemType: 'ingredient',
    itemName: '',
    quantity: 0,
    unit: '',
    cost: 0,
    wasteCategory: 'preparation-waste',
    reason: '',
    preventable: false,
    preventionSuggestion: ''
  })

  useEffect(() => {
    if (waste) {
      setFormData(waste)
    } else {
      const newId = `WS-${Date.now().toString().slice(-6)}`
      setFormData(prev => ({ ...prev, wasteId: newId }))
    }
  }, [waste, open])

  const calculateTotalCost = (items: WasteItem[]) => {
    return items.reduce((sum, item) => sum + item.cost, 0)
  }

  const handleSave = () => {
    if (!formData.wasteId || !formData.station || !formData.reportedBy) {
      toast.error('Please fill in all required fields')
      return
    }

    const totalCost = calculateTotalCost(formData.items || [])

    const newWaste: WasteTracking = {
      id: waste?.id || `waste-${Date.now()}`,
      wasteId: formData.wasteId || '',
      date: formData.date || Date.now(),
      shiftType: (formData.shiftType || 'morning') as ShiftType,
      station: formData.station || '',
      items: formData.items || [],
      totalWasteCost: totalCost,
      reportedBy: formData.reportedBy || '',
      supervisorApproval: formData.supervisorApproval,
      approvedAt: formData.supervisorApproval ? Date.now() : formData.approvedAt,
      correctiveActions: formData.correctiveActions,
      notes: formData.notes,
      createdAt: waste?.createdAt || Date.now()
    }

    if (waste) {
      setWasteTracking((prev) => prev.map(w => w.id === waste.id ? newWaste : w))
      toast.success('Waste tracking updated successfully')
    } else {
      setWasteTracking((prev) => [...prev, newWaste])
      toast.success('Waste tracking created successfully')
    }

    onOpenChange(false)
  }

  const addWasteItem = () => {
    if (!wasteItemInput.itemName || !wasteItemInput.quantity || !wasteItemInput.cost) {
      toast.error('Please fill in item details')
      return
    }

    const newItem: WasteItem = {
      id: `witem-${Date.now()}`,
      itemType: (wasteItemInput.itemType || 'ingredient') as 'ingredient' | 'prepared-food' | 'finished-dish',
      itemId: wasteItemInput.itemId,
      itemName: wasteItemInput.itemName || '',
      quantity: wasteItemInput.quantity || 0,
      unit: wasteItemInput.unit || '',
      cost: wasteItemInput.cost || 0,
      wasteCategory: (wasteItemInput.wasteCategory || 'preparation-waste') as any,
      reason: wasteItemInput.reason || '',
      preventable: wasteItemInput.preventable || false,
      preventionSuggestion: wasteItemInput.preventionSuggestion
    }

    setFormData(prev => ({
      ...prev,
      items: [...(prev.items || []), newItem]
    }))

    setWasteItemInput({
      itemType: 'ingredient',
      itemName: '',
      quantity: 0,
      unit: '',
      cost: 0,
      wasteCategory: 'preparation-waste',
      reason: '',
      preventable: false,
      preventionSuggestion: ''
    })
  }

  const removeWasteItem = (id: string) => {
    setFormData(prev => ({
      ...prev,
      items: (prev.items || []).filter(item => item.id !== id)
    }))
  }

  const selectFoodItem = (foodItemId: string) => {
    const foodItem = foodItems.find(f => f.id === foodItemId)
    if (foodItem) {
      setWasteItemInput(prev => ({
        ...prev,
        itemId: foodItem.id,
        itemName: foodItem.name,
        unit: foodItem.unit,
        cost: foodItem.unitCost * (prev.quantity || 0)
      }))
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{waste ? 'Edit Waste Tracking' : 'Log Waste Tracking'}</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          <div className="grid grid-cols-3 gap-4">
            <div>
              <Label htmlFor="wasteId">Waste ID *</Label>
              <Input
                id="wasteId"
                value={formData.wasteId}
                onChange={(e) => setFormData({ ...formData, wasteId: e.target.value })}
                disabled={!!waste}
              />
            </div>
            <div>
              <Label htmlFor="date">Date *</Label>
              <Input
                id="date"
                type="date"
                value={new Date(formData.date || Date.now()).toISOString().split('T')[0]}
                onChange={(e) => setFormData({ ...formData, date: new Date(e.target.value).getTime() })}
              />
            </div>
            <div>
              <Label htmlFor="shiftType">Shift Type *</Label>
              <Select
                value={formData.shiftType}
                onValueChange={(value) => setFormData({ ...formData, shiftType: value as ShiftType })}
              >
                <SelectTrigger id="shiftType">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {shiftTypes.map(shift => (
                    <SelectItem key={shift} value={shift}>
                      {shift.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="station">Station *</Label>
              <Select
                value={formData.station}
                onValueChange={(value) => setFormData({ ...formData, station: value })}
              >
                <SelectTrigger id="station">
                  <SelectValue placeholder="Select station..." />
                </SelectTrigger>
                <SelectContent>
                  {stations.map(station => (
                    <SelectItem key={station.id} value={station.name}>
                      {station.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="reportedBy">Reported By *</Label>
              <Select
                value={formData.reportedBy}
                onValueChange={(value) => setFormData({ ...formData, reportedBy: value })}
              >
                <SelectTrigger id="reportedBy">
                  <SelectValue placeholder="Select staff..." />
                </SelectTrigger>
                <SelectContent>
                  {staff.map(s => (
                    <SelectItem key={s.id} value={`${s.firstName} ${s.lastName}`}>
                      {s.firstName} {s.lastName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <Card className="p-4">
            <h3 className="font-semibold mb-4">Waste Items</h3>

            <div className="grid grid-cols-6 gap-2 mb-4">
              <Select
                value={wasteItemInput.itemType}
                onValueChange={(value) => setWasteItemInput({ ...wasteItemInput, itemType: value as any })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ingredient">Ingredient</SelectItem>
                  <SelectItem value="prepared-food">Prepared Food</SelectItem>
                  <SelectItem value="finished-dish">Finished Dish</SelectItem>
                </SelectContent>
              </Select>

              <Select
                value={wasteItemInput.itemId}
                onValueChange={selectFoodItem}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select item..." />
                </SelectTrigger>
                <SelectContent>
                  {foodItems.map(item => (
                    <SelectItem key={item.id} value={item.id}>
                      {item.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Input
                type="number"
                placeholder="Qty"
                value={wasteItemInput.quantity || ''}
                onChange={(e) => {
                  const qty = parseFloat(e.target.value) || 0
                  const foodItem = foodItems.find(f => f.id === wasteItemInput.itemId)
                  setWasteItemInput({
                    ...wasteItemInput,
                    quantity: qty,
                    cost: foodItem ? foodItem.unitCost * qty : wasteItemInput.cost || 0
                  })
                }}
              />

              <Input
                placeholder="Unit"
                value={wasteItemInput.unit}
                onChange={(e) => setWasteItemInput({ ...wasteItemInput, unit: e.target.value })}
              />

              <Input
                type="number"
                placeholder="Cost"
                value={wasteItemInput.cost || ''}
                onChange={(e) => setWasteItemInput({ ...wasteItemInput, cost: parseFloat(e.target.value) || 0 })}
              />

              <Button type="button" onClick={addWasteItem}>
                <Plus size={18} />
              </Button>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-4">
              <Select
                value={wasteItemInput.wasteCategory}
                onValueChange={(value) => setWasteItemInput({ ...wasteItemInput, wasteCategory: value as any })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {wasteCategories.map(cat => (
                    <SelectItem key={cat} value={cat}>
                      {cat.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Input
                placeholder="Reason for waste"
                value={wasteItemInput.reason}
                onChange={(e) => setWasteItemInput({ ...wasteItemInput, reason: e.target.value })}
              />
            </div>

            <div className="flex items-center gap-4 mb-4">
              <div className="flex items-center gap-2">
                <Switch
                  id="preventable"
                  checked={wasteItemInput.preventable}
                  onCheckedChange={(checked) => setWasteItemInput({ ...wasteItemInput, preventable: checked })}
                />
                <Label htmlFor="preventable">Preventable</Label>
              </div>
              {wasteItemInput.preventable && (
                <Input
                  placeholder="Prevention suggestion"
                  value={wasteItemInput.preventionSuggestion}
                  onChange={(e) => setWasteItemInput({ ...wasteItemInput, preventionSuggestion: e.target.value })}
                  className="flex-1"
                />
              )}
            </div>

            <div className="space-y-2">
              {(formData.items || []).map((item) => (
                <div key={item.id} className="flex items-center justify-between p-3 bg-muted rounded">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="font-medium">{item.itemName}</p>
                      <Badge variant="outline" className="capitalize">
                        {item.itemType.replace('-', ' ')}
                      </Badge>
                      <Badge variant="secondary" className="capitalize">
                        {item.wasteCategory.replace('-', ' ')}
                      </Badge>
                      {item.preventable && (
                        <Badge variant="destructive">Preventable</Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {item.quantity} {item.unit} • {formatCurrency(item.cost)} • {item.reason}
                    </p>
                    {item.preventionSuggestion && (
                      <p className="text-sm text-success mt-1">
                        💡 {item.preventionSuggestion}
                      </p>
                    )}
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeWasteItem(item.id)}
                  >
                    <Trash size={16} />
                  </Button>
                </div>
              ))}
            </div>

            {(formData.items || []).length > 0 && (
              <div className="mt-4 p-4 bg-destructive/10 rounded">
                <p className="text-lg font-semibold text-destructive">
                  Total Waste Cost: {formatCurrency(calculateTotalCost(formData.items || []))}
                </p>
              </div>
            )}
          </Card>

          <div>
            <Label htmlFor="supervisorApproval">Supervisor Approval</Label>
            <Select
              value={formData.supervisorApproval}
              onValueChange={(value) => setFormData({ ...formData, supervisorApproval: value })}
            >
              <SelectTrigger id="supervisorApproval">
                <SelectValue placeholder="Select supervisor..." />
              </SelectTrigger>
              <SelectContent>
                {staff.filter(s => s.role === 'executive-chef' || s.role === 'sous-chef').map(s => (
                  <SelectItem key={s.id} value={`${s.firstName} ${s.lastName}`}>
                    {s.firstName} {s.lastName} - {s.role}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="correctiveActions">Corrective Actions</Label>
            <Textarea
              id="correctiveActions"
              value={formData.correctiveActions}
              onChange={(e) => setFormData({ ...formData, correctiveActions: e.target.value })}
              placeholder="Actions taken to prevent future waste..."
              rows={2}
            />
          </div>

          <div>
            <Label htmlFor="notes">Additional Notes</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="Any additional notes about this waste..."
              rows={2}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave}>
            <FloppyDisk size={18} className="mr-2" />
            Save Waste Log
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
