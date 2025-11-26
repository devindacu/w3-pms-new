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
import { Plus, Trash, FloppyDisk, X } from '@phosphor-icons/react'
import { toast } from 'sonner'
import {
  type KitchenStation,
  type KitchenStationType,
  type StationMaintenance,
  type SafetyCheckItem,
  type KitchenStaff
} from '@/lib/types'

interface KitchenStationDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  station?: KitchenStation
  stations: KitchenStation[]
  setStations: (stations: KitchenStation[] | ((prev: KitchenStation[]) => KitchenStation[])) => void
  staff: KitchenStaff[]
}

const stationTypes: KitchenStationType[] = [
  'hot-kitchen', 'cold-kitchen', 'pastry', 'butchery', 'prep-station',
  'desserts', 'grill', 'fry-station', 'salad-bar', 'bakery'
]

export function KitchenStationDialog({
  open,
  onOpenChange,
  station,
  stations,
  setStations,
  staff
}: KitchenStationDialogProps) {
  const [formData, setFormData] = useState<Partial<KitchenStation>>({
    name: '',
    stationId: '',
    type: 'prep-station',
    description: '',
    location: '',
    equipment: [],
    capacity: 10,
    assignedStaff: [],
    isActive: true,
    maintenanceSchedule: [],
    safetyChecklist: [],
    notes: ''
  })
  const [equipmentInput, setEquipmentInput] = useState('')
  const [maintenanceItem, setMaintenanceItem] = useState<Partial<StationMaintenance>>({})
  const [safetyItem, setSafetyItem] = useState<Partial<SafetyCheckItem>>({})

  useEffect(() => {
    if (station) {
      setFormData(station)
    } else {
      const newId = `ST-${Date.now().toString().slice(-6)}`
      setFormData(prev => ({ ...prev, stationId: newId }))
    }
  }, [station, open])

  const handleSave = () => {
    if (!formData.name || !formData.stationId || !formData.location) {
      toast.error('Please fill in all required fields')
      return
    }

    const newStation: KitchenStation = {
      id: station?.id || `station-${Date.now()}`,
      stationId: formData.stationId || '',
      name: formData.name || '',
      type: (formData.type || 'prep-station') as KitchenStationType,
      description: formData.description,
      location: formData.location || '',
      equipment: formData.equipment || [],
      capacity: formData.capacity || 10,
      assignedStaff: formData.assignedStaff || [],
      isActive: formData.isActive !== undefined ? formData.isActive : true,
      maintenanceSchedule: formData.maintenanceSchedule || [],
      safetyChecklist: formData.safetyChecklist || [],
      notes: formData.notes,
      createdAt: station?.createdAt || Date.now(),
      updatedAt: Date.now()
    }

    if (station) {
      setStations((prev) => prev.map(s => s.id === station.id ? newStation : s))
      toast.success('Kitchen station updated successfully')
    } else {
      setStations((prev) => [...prev, newStation])
      toast.success('Kitchen station created successfully')
    }

    onOpenChange(false)
  }

  const addEquipment = () => {
    if (equipmentInput.trim()) {
      setFormData(prev => ({
        ...prev,
        equipment: [...(prev.equipment || []), equipmentInput.trim()]
      }))
      setEquipmentInput('')
    }
  }

  const removeEquipment = (index: number) => {
    setFormData(prev => ({
      ...prev,
      equipment: (prev.equipment || []).filter((_, i) => i !== index)
    }))
  }

  const addMaintenance = () => {
    if (maintenanceItem.equipmentName && maintenanceItem.nextMaintenance) {
      const newMaintenance: StationMaintenance = {
        id: `maint-${Date.now()}`,
        equipmentName: maintenanceItem.equipmentName,
        nextMaintenance: maintenanceItem.nextMaintenance,
        maintenanceType: maintenanceItem.maintenanceType || 'weekly',
        lastMaintenance: maintenanceItem.lastMaintenance,
        assignedTo: maintenanceItem.assignedTo,
        notes: maintenanceItem.notes
      }
      setFormData(prev => ({
        ...prev,
        maintenanceSchedule: [...(prev.maintenanceSchedule || []), newMaintenance]
      }))
      setMaintenanceItem({})
    }
  }

  const removeMaintenance = (id: string) => {
    setFormData(prev => ({
      ...prev,
      maintenanceSchedule: (prev.maintenanceSchedule || []).filter(m => m.id !== id)
    }))
  }

  const addSafetyCheck = () => {
    if (safetyItem.checkName && safetyItem.description) {
      const newCheck: SafetyCheckItem = {
        id: `safety-${Date.now()}`,
        checkName: safetyItem.checkName,
        description: safetyItem.description,
        frequency: safetyItem.frequency || 'daily',
        isCompleted: false
      }
      setFormData(prev => ({
        ...prev,
        safetyChecklist: [...(prev.safetyChecklist || []), newCheck]
      }))
      setSafetyItem({})
    }
  }

  const removeSafetyCheck = (id: string) => {
    setFormData(prev => ({
      ...prev,
      safetyChecklist: (prev.safetyChecklist || []).filter(s => s.id !== id)
    }))
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{station ? 'Edit Kitchen Station' : 'Add Kitchen Station'}</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="stationId">Station ID *</Label>
              <Input
                id="stationId"
                value={formData.stationId}
                onChange={(e) => setFormData({ ...formData, stationId: e.target.value })}
                disabled={!!station}
              />
            </div>
            <div>
              <Label htmlFor="name">Station Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g., Main Grill Station"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="type">Station Type *</Label>
              <Select
                value={formData.type}
                onValueChange={(value) => setFormData({ ...formData, type: value as KitchenStationType })}
              >
                <SelectTrigger id="type">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {stationTypes.map(type => (
                    <SelectItem key={type} value={type}>
                      {type.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="location">Location *</Label>
              <Input
                id="location"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                placeholder="e.g., Main Kitchen - Left Wing"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="capacity">Capacity (units/hour)</Label>
              <Input
                id="capacity"
                type="number"
                value={formData.capacity}
                onChange={(e) => setFormData({ ...formData, capacity: parseInt(e.target.value) || 0 })}
              />
            </div>
            <div className="flex items-center gap-2 mt-6">
              <Switch
                id="isActive"
                checked={formData.isActive}
                onCheckedChange={(checked) => setFormData({ ...formData, isActive: checked })}
              />
              <Label htmlFor="isActive">Station is Active</Label>
            </div>
          </div>

          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Station description and purpose..."
              rows={3}
            />
          </div>

          <Card className="p-4">
            <h3 className="font-semibold mb-3">Equipment</h3>
            <div className="flex gap-2 mb-3">
              <Input
                placeholder="Add equipment..."
                value={equipmentInput}
                onChange={(e) => setEquipmentInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && addEquipment()}
              />
              <Button type="button" onClick={addEquipment} size="sm">
                <Plus size={18} />
              </Button>
            </div>
            <div className="flex flex-wrap gap-2">
              {(formData.equipment || []).map((item, index) => (
                <Badge key={index} variant="secondary" className="gap-1">
                  {item}
                  <X
                    size={14}
                    className="cursor-pointer"
                    onClick={() => removeEquipment(index)}
                  />
                </Badge>
              ))}
            </div>
          </Card>

          <Card className="p-4">
            <h3 className="font-semibold mb-3">Assigned Staff</h3>
            <div className="space-y-2">
              {staff.filter(s => formData.assignedStaff?.includes(s.employeeId)).map(s => (
                <div key={s.id} className="flex items-center justify-between p-2 bg-muted rounded">
                  <span>{s.firstName} {s.lastName} - {s.role}</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setFormData(prev => ({
                      ...prev,
                      assignedStaff: (prev.assignedStaff || []).filter(id => id !== s.employeeId)
                    }))}
                  >
                    <Trash size={16} />
                  </Button>
                </div>
              ))}
              <Select
                onValueChange={(value) => {
                  if (!formData.assignedStaff?.includes(value)) {
                    setFormData(prev => ({
                      ...prev,
                      assignedStaff: [...(prev.assignedStaff || []), value]
                    }))
                  }
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Add staff member..." />
                </SelectTrigger>
                <SelectContent>
                  {staff.filter(s => !formData.assignedStaff?.includes(s.employeeId)).map(s => (
                    <SelectItem key={s.id} value={s.employeeId}>
                      {s.firstName} {s.lastName} - {s.role}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </Card>

          <div>
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="Additional notes about the station..."
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
            Save Station
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
