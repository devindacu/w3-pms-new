import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Card } from '@/components/ui/card'
import { Plus, Trash, FloppyDisk, CheckCircle } from '@phosphor-icons/react'
import { toast } from 'sonner'
import {
  type KitchenInventoryIssue,
  type InventoryIssueItem,
  type FoodItem,
  type KitchenStation,
  type KitchenStaff
} from '@/lib/types'

interface InventoryIssueDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  issue?: KitchenInventoryIssue
  issues: KitchenInventoryIssue[]
  setIssues: (issues: KitchenInventoryIssue[] | ((prev: KitchenInventoryIssue[]) => KitchenInventoryIssue[])) => void
  foodItems: FoodItem[]
  stations: KitchenStation[]
  staff: KitchenStaff[]
}

export function InventoryIssueDialog({
  open,
  onOpenChange,
  issue,
  issues,
  setIssues,
  foodItems,
  stations,
  staff
}: InventoryIssueDialogProps) {
  const [formData, setFormData] = useState<Partial<KitchenInventoryIssue>>({
    issueNumber: '',
    requestedBy: '',
    requestedFor: '',
    station: '',
    scheduleId: '',
    items: [],
    status: 'pending',
    requestedAt: Date.now(),
    notes: ''
  })
  const [selectedFoodItem, setSelectedFoodItem] = useState<string>('')
  const [quantity, setQuantity] = useState<number>(0)
  const [purpose, setPurpose] = useState<string>('')

  useEffect(() => {
    if (issue) {
      setFormData(issue)
    } else {
      const newId = `ISS-${Date.now().toString().slice(-6)}`
      setFormData(prev => ({ ...prev, issueNumber: newId }))
    }
  }, [issue, open])

  const handleSave = () => {
    if (!formData.issueNumber || !formData.requestedBy || !formData.requestedFor) {
      toast.error('Please fill in all required fields')
      return
    }

    const newIssue: KitchenInventoryIssue = {
      id: issue?.id || `issue-${Date.now()}`,
      issueNumber: formData.issueNumber || '',
      requestedBy: formData.requestedBy || '',
      requestedFor: formData.requestedFor || '',
      station: formData.station,
      scheduleId: formData.scheduleId,
      items: formData.items || [],
      status: (formData.status || 'pending') as 'pending' | 'partially-issued' | 'issued' | 'rejected',
      requestedAt: formData.requestedAt || Date.now(),
      issuedBy: formData.issuedBy,
      issuedAt: formData.issuedAt,
      notes: formData.notes
    }

    if (issue) {
      setIssues((prev) => prev.map(i => i.id === issue.id ? newIssue : i))
      toast.success('Inventory issue updated successfully')
    } else {
      setIssues((prev) => [...prev, newIssue])
      toast.success('Inventory issue created successfully')
    }

    onOpenChange(false)
  }

  const addItem = () => {
    if (!selectedFoodItem || quantity <= 0) {
      toast.error('Please select an item and enter quantity')
      return
    }

    const foodItem = foodItems.find(f => f.id === selectedFoodItem)
    if (!foodItem) return

    const newItem: InventoryIssueItem = {
      id: `item-${Date.now()}`,
      foodItemId: foodItem.id,
      itemName: foodItem.name,
      requestedQuantity: quantity,
      issuedQuantity: 0,
      unit: foodItem.unit,
      batchNumber: foodItem.batchNumber,
      storeLocation: foodItem.storeLocation,
      purpose: purpose || 'Production'
    }

    setFormData(prev => ({
      ...prev,
      items: [...(prev.items || []), newItem]
    }))

    setSelectedFoodItem('')
    setQuantity(0)
    setPurpose('')
  }

  const removeItem = (id: string) => {
    setFormData(prev => ({
      ...prev,
      items: (prev.items || []).filter(i => i.id !== id)
    }))
  }

  const updateIssuedQuantity = (id: string, issuedQty: number) => {
    setFormData(prev => ({
      ...prev,
      items: (prev.items || []).map(item =>
        item.id === id ? { ...item, issuedQuantity: issuedQty } : item
      )
    }))
  }

  const issueAllItems = () => {
    setFormData(prev => ({
      ...prev,
      items: (prev.items || []).map(item => ({
        ...item,
        issuedQuantity: item.requestedQuantity
      })),
      status: 'issued',
      issuedBy: 'current-user',
      issuedAt: Date.now()
    }))
    toast.success('All items marked as issued')
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{issue ? 'Edit Inventory Issue' : 'Create Inventory Issue'}</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="issueNumber">Issue Number *</Label>
              <Input
                id="issueNumber"
                value={formData.issueNumber}
                onChange={(e) => setFormData({ ...formData, issueNumber: e.target.value })}
                disabled={!!issue}
              />
            </div>
            <div>
              <Label htmlFor="status">Status</Label>
              <Select
                value={formData.status}
                onValueChange={(value) => setFormData({ ...formData, status: value as any })}
              >
                <SelectTrigger id="status">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="partially-issued">Partially Issued</SelectItem>
                  <SelectItem value="issued">Issued</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="requestedBy">Requested By *</Label>
              <Select
                value={formData.requestedBy}
                onValueChange={(value) => setFormData({ ...formData, requestedBy: value })}
              >
                <SelectTrigger id="requestedBy">
                  <SelectValue placeholder="Select staff..." />
                </SelectTrigger>
                <SelectContent>
                  {staff.map(s => (
                    <SelectItem key={s.id} value={`${s.firstName} ${s.lastName}`}>
                      {s.firstName} {s.lastName} - {s.role}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="requestedFor">Requested For *</Label>
              <Input
                id="requestedFor"
                value={formData.requestedFor}
                onChange={(e) => setFormData({ ...formData, requestedFor: e.target.value })}
                placeholder="e.g., Breakfast Service"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="station">Station</Label>
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
              <Label htmlFor="scheduleId">Schedule ID</Label>
              <Input
                id="scheduleId"
                value={formData.scheduleId}
                onChange={(e) => setFormData({ ...formData, scheduleId: e.target.value })}
                placeholder="Optional production schedule ID"
              />
            </div>
          </div>

          <Card className="p-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold">Items ({(formData.items || []).length})</h3>
              {formData.status === 'pending' && (formData.items || []).length > 0 && (
                <Button variant="outline" size="sm" onClick={issueAllItems}>
                  <CheckCircle size={16} className="mr-2" />
                  Issue All Items
                </Button>
              )}
            </div>

            <div className="grid grid-cols-5 gap-2 mb-4">
              <div className="col-span-2">
                <Select value={selectedFoodItem} onValueChange={setSelectedFoodItem}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select item..." />
                  </SelectTrigger>
                  <SelectContent>
                    {foodItems.map(item => (
                      <SelectItem key={item.id} value={item.id}>
                        {item.name} ({item.currentStock} {item.unit})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <Input
                type="number"
                placeholder="Quantity"
                value={quantity || ''}
                onChange={(e) => setQuantity(parseFloat(e.target.value) || 0)}
              />
              <Input
                placeholder="Purpose"
                value={purpose}
                onChange={(e) => setPurpose(e.target.value)}
              />
              <Button type="button" onClick={addItem}>
                <Plus size={18} />
              </Button>
            </div>

            <div className="space-y-2">
              {(formData.items || []).map((item) => (
                <div key={item.id} className="flex items-center gap-4 p-3 bg-muted rounded">
                  <div className="flex-1">
                    <p className="font-medium">{item.itemName}</p>
                    <p className="text-sm text-muted-foreground">
                      {item.purpose} • {item.storeLocation}
                      {item.batchNumber && ` • Batch: ${item.batchNumber}`}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="text-right">
                      <p className="text-sm text-muted-foreground">Requested</p>
                      <p className="font-medium">{item.requestedQuantity} {item.unit}</p>
                    </div>
                    {formData.status !== 'pending' && (
                      <div className="text-right">
                        <p className="text-sm text-muted-foreground">Issued</p>
                        <Input
                          type="number"
                          className="w-24"
                          value={item.issuedQuantity}
                          onChange={(e) => updateIssuedQuantity(item.id, parseFloat(e.target.value) || 0)}
                          disabled={formData.status === 'issued'}
                        />
                      </div>
                    )}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeItem(item.id)}
                      disabled={formData.status !== 'pending'}
                    >
                      <Trash size={16} />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          <div>
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="Additional notes about this inventory issue..."
              rows={3}
            />
          </div>

          {formData.issuedBy && (
            <div className="p-4 bg-muted rounded">
              <p className="text-sm">
                <span className="font-medium">Issued by:</span> {formData.issuedBy}
              </p>
              {formData.issuedAt && (
                <p className="text-sm text-muted-foreground">
                  {new Date(formData.issuedAt).toLocaleString()}
                </p>
              )}
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave}>
            <FloppyDisk size={18} className="mr-2" />
            Save Issue
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
