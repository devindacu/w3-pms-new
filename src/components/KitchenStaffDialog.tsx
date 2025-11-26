import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Card } from '@/components/ui/card'
import { Plus, Trash, FloppyDisk, X } from '@phosphor-icons/react'
import { toast } from 'sonner'
import {
  type KitchenStaff,
  type KitchenStaffRole,
  type ShiftType,
  type StaffCertification,
  type Employee,
  type KitchenStation
} from '@/lib/types'

interface KitchenStaffDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  staff?: KitchenStaff
  allStaff: KitchenStaff[]
  setStaff: (staff: KitchenStaff[] | ((prev: KitchenStaff[]) => KitchenStaff[])) => void
  employees: Employee[]
  stations: KitchenStation[]
}

const staffRoles: KitchenStaffRole[] = [
  'executive-chef', 'sous-chef', 'chef-de-partie', 'commis-chef', 
  'line-cook', 'prep-cook', 'pastry-chef', 'kitchen-steward'
]

const shiftTypes: ShiftType[] = ['morning', 'afternoon', 'evening', 'night', 'full-day']

export function KitchenStaffDialog({
  open,
  onOpenChange,
  staff,
  allStaff,
  setStaff,
  employees,
  stations
}: KitchenStaffDialogProps) {
  const [formData, setFormData] = useState<Partial<KitchenStaff>>({
    employeeId: '',
    firstName: '',
    lastName: '',
    role: 'line-cook',
    specializations: [],
    shiftType: 'morning',
    primaryStation: '',
    secondaryStations: [],
    certifications: [],
    performanceRating: 4.0,
    tasksCompleted: 0,
    efficiency: 85,
    qualityRating: 4.0,
    isAvailable: true,
    status: 'active',
    phone: '',
    email: '',
    hireDate: Date.now(),
    notes: ''
  })
  const [specializationInput, setSpecializationInput] = useState('')
  const [certInput, setCertInput] = useState<Partial<StaffCertification>>({})

  useEffect(() => {
    if (staff) {
      setFormData(staff)
    } else {
      setFormData(prev => ({ ...prev, employeeId: `EMP-${Date.now().toString().slice(-6)}` }))
    }
  }, [staff, open])

  const handleSave = () => {
    if (!formData.employeeId || !formData.firstName || !formData.lastName) {
      toast.error('Please fill in all required fields')
      return
    }

    const newStaff: KitchenStaff = {
      id: staff?.id || `staff-${Date.now()}`,
      employeeId: formData.employeeId || '',
      firstName: formData.firstName || '',
      lastName: formData.lastName || '',
      role: (formData.role || 'line-cook') as KitchenStaffRole,
      specializations: formData.specializations || [],
      shiftType: (formData.shiftType || 'morning') as ShiftType,
      primaryStation: formData.primaryStation,
      secondaryStations: formData.secondaryStations || [],
      certifications: formData.certifications || [],
      performanceRating: formData.performanceRating || 4.0,
      tasksCompleted: formData.tasksCompleted || 0,
      efficiency: formData.efficiency || 85,
      qualityRating: formData.qualityRating || 4.0,
      isAvailable: formData.isAvailable !== undefined ? formData.isAvailable : true,
      status: (formData.status || 'active') as 'active' | 'on-leave' | 'off-duty',
      phone: formData.phone,
      email: formData.email,
      hireDate: formData.hireDate || Date.now(),
      notes: formData.notes
    }

    if (staff) {
      setStaff((prev) => prev.map(s => s.id === staff.id ? newStaff : s))
      toast.success('Kitchen staff updated successfully')
    } else {
      setStaff((prev) => [...prev, newStaff])
      toast.success('Kitchen staff added successfully')
    }

    onOpenChange(false)
  }

  const addSpecialization = () => {
    if (specializationInput.trim()) {
      setFormData(prev => ({
        ...prev,
        specializations: [...(prev.specializations || []), specializationInput.trim()]
      }))
      setSpecializationInput('')
    }
  }

  const removeSpecialization = (index: number) => {
    setFormData(prev => ({
      ...prev,
      specializations: (prev.specializations || []).filter((_, i) => i !== index)
    }))
  }

  const addCertification = () => {
    if (certInput.name && certInput.issuedBy && certInput.issuedDate) {
      const newCert: StaffCertification = {
        id: `cert-${Date.now()}`,
        name: certInput.name,
        issuedBy: certInput.issuedBy,
        issuedDate: certInput.issuedDate,
        expiryDate: certInput.expiryDate,
        certificateNumber: certInput.certificateNumber
      }
      setFormData(prev => ({
        ...prev,
        certifications: [...(prev.certifications || []), newCert]
      }))
      setCertInput({})
    }
  }

  const removeCertification = (id: string) => {
    setFormData(prev => ({
      ...prev,
      certifications: (prev.certifications || []).filter(c => c.id !== id)
    }))
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{staff ? 'Edit Kitchen Staff' : 'Add Kitchen Staff'}</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          <div className="grid grid-cols-3 gap-4">
            <div>
              <Label htmlFor="employeeId">Employee ID *</Label>
              <Input
                id="employeeId"
                value={formData.employeeId}
                onChange={(e) => setFormData({ ...formData, employeeId: e.target.value })}
                disabled={!!staff}
              />
            </div>
            <div>
              <Label htmlFor="firstName">First Name *</Label>
              <Input
                id="firstName"
                value={formData.firstName}
                onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="lastName">Last Name *</Label>
              <Input
                id="lastName"
                value={formData.lastName}
                onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="role">Role *</Label>
              <Select
                value={formData.role}
                onValueChange={(value) => setFormData({ ...formData, role: value as KitchenStaffRole })}
              >
                <SelectTrigger id="role">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {staffRoles.map(role => (
                    <SelectItem key={role} value={role}>
                      {role.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
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
              <Label htmlFor="primaryStation">Primary Station</Label>
              <Select
                value={formData.primaryStation}
                onValueChange={(value) => setFormData({ ...formData, primaryStation: value })}
              >
                <SelectTrigger id="primaryStation">
                  <SelectValue placeholder="Select station..." />
                </SelectTrigger>
                <SelectContent>
                  {stations.map(station => (
                    <SelectItem key={station.id} value={station.stationId}>
                      {station.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="status">Status</Label>
              <Select
                value={formData.status}
                onValueChange={(value) => setFormData({ ...formData, status: value as 'active' | 'on-leave' | 'off-duty' })}
              >
                <SelectTrigger id="status">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="on-leave">On Leave</SelectItem>
                  <SelectItem value="off-duty">Off Duty</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="phone">Phone</Label>
              <Input
                id="phone"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              />
            </div>
          </div>

          <Card className="p-4">
            <h3 className="font-semibold mb-3">Specializations</h3>
            <div className="flex gap-2 mb-3">
              <Input
                placeholder="Add specialization..."
                value={specializationInput}
                onChange={(e) => setSpecializationInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && addSpecialization()}
              />
              <Button type="button" onClick={addSpecialization} size="sm">
                <Plus size={18} />
              </Button>
            </div>
            <div className="flex flex-wrap gap-2">
              {(formData.specializations || []).map((spec, index) => (
                <Badge key={index} variant="secondary" className="gap-1">
                  {spec}
                  <X
                    size={14}
                    className="cursor-pointer"
                    onClick={() => removeSpecialization(index)}
                  />
                </Badge>
              ))}
            </div>
          </Card>

          <div className="grid grid-cols-4 gap-4">
            <div>
              <Label htmlFor="performanceRating">Performance Rating</Label>
              <Input
                id="performanceRating"
                type="number"
                step="0.1"
                min="0"
                max="5"
                value={formData.performanceRating}
                onChange={(e) => setFormData({ ...formData, performanceRating: parseFloat(e.target.value) || 0 })}
              />
            </div>
            <div>
              <Label htmlFor="efficiency">Efficiency %</Label>
              <Input
                id="efficiency"
                type="number"
                min="0"
                max="100"
                value={formData.efficiency}
                onChange={(e) => setFormData({ ...formData, efficiency: parseInt(e.target.value) || 0 })}
              />
            </div>
            <div>
              <Label htmlFor="qualityRating">Quality Rating</Label>
              <Input
                id="qualityRating"
                type="number"
                step="0.1"
                min="0"
                max="5"
                value={formData.qualityRating}
                onChange={(e) => setFormData({ ...formData, qualityRating: parseFloat(e.target.value) || 0 })}
              />
            </div>
            <div>
              <Label htmlFor="tasksCompleted">Tasks Completed</Label>
              <Input
                id="tasksCompleted"
                type="number"
                value={formData.tasksCompleted}
                onChange={(e) => setFormData({ ...formData, tasksCompleted: parseInt(e.target.value) || 0 })}
              />
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave}>
            <FloppyDisk size={18} className="mr-2" />
            Save Staff
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
