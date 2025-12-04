import { useState } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { Switch } from '@/components/ui/switch'
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Receipt, Plus, Pencil, Trash, FloppyDisk } from '@phosphor-icons/react'
import { toast } from 'sonner'
import type { TaxConfiguration, ServiceChargeConfiguration, SystemUser, Department, TaxType } from '@/lib/types'

interface TaxSettingsProps {
  taxes: TaxConfiguration[]
  setTaxes: (setter: (current: TaxConfiguration[]) => TaxConfiguration[]) => void
  serviceCharge: ServiceChargeConfiguration | null
  setServiceCharge: (setter: (current: ServiceChargeConfiguration | null) => ServiceChargeConfiguration) => void
  currentUser: SystemUser
}

const taxTypes: { value: TaxType; label: string }[] = [
  { value: 'vat', label: 'VAT' },
  { value: 'gst', label: 'GST' },
  { value: 'service-charge', label: 'Service Charge' },
  { value: 'sales-tax', label: 'Sales Tax' },
  { value: 'tourism-tax', label: 'Tourism Tax' },
  { value: 'municipal-tax', label: 'Municipal Tax' },
]

const departments: Department[] = [
  'front-office',
  'housekeeping',
  'fnb',
  'kitchen',
]

export function TaxSettings({
  taxes,
  setTaxes,
  serviceCharge,
  setServiceCharge,
  currentUser
}: TaxSettingsProps) {
  const [taxDialogOpen, setTaxDialogOpen] = useState(false)
  const [serviceChargeDialogOpen, setServiceChargeDialogOpen] = useState(false)
  const [editingTax, setEditingTax] = useState<TaxConfiguration | null>(null)
  const [selectedDepartments, setSelectedDepartments] = useState<Department[]>([])

  const handleAddTax = () => {
    setEditingTax(null)
    setSelectedDepartments([])
    setTaxDialogOpen(true)
  }

  const handleEditTax = (tax: TaxConfiguration) => {
    setEditingTax(tax)
    setSelectedDepartments(tax.appliesTo)
    setTaxDialogOpen(true)
  }

  const handleDeleteTax = (id: string) => {
    setTaxes((current) => current.filter(t => t.id !== id))
    toast.success('Tax configuration deleted')
  }

  const handleSaveTax = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    
    const now = Date.now()
    const taxConfig: TaxConfiguration = {
      id: editingTax?.id || `tax-${now}`,
      name: formData.get('name') as string,
      type: formData.get('type') as TaxType,
      rate: parseFloat(formData.get('rate') as string),
      isInclusive: formData.get('isInclusive') === 'on',
      isActive: formData.get('isActive') === 'on',
      isCompoundTax: formData.get('isCompoundTax') === 'on',
      appliesTo: selectedDepartments,
      calculationOrder: parseInt(formData.get('calculationOrder') as string) || 1,
      taxableOnServiceCharge: formData.get('taxableOnServiceCharge') === 'on',
      registrationNumber: formData.get('registrationNumber') as string || undefined,
      createdAt: editingTax?.createdAt || now,
      updatedAt: now,
    }

    if (editingTax) {
      setTaxes((current) => current.map(t => t.id === editingTax.id ? taxConfig : t))
      toast.success('Tax configuration updated')
    } else {
      setTaxes((current) => [...current, taxConfig])
      toast.success('Tax configuration added')
    }

    setTaxDialogOpen(false)
  }

  const handleSaveServiceCharge = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    
    const now = Date.now()
    const config: ServiceChargeConfiguration = {
      id: serviceCharge?.id || `sc-${now}`,
      rate: parseFloat(formData.get('rate') as string),
      isActive: formData.get('isActive') === 'on',
      appliesTo: selectedDepartments,
      isTaxable: formData.get('isTaxable') === 'on',
      createdAt: serviceCharge?.createdAt || now,
      updatedAt: now,
    }

    setServiceCharge(() => config)
    toast.success('Service charge configuration saved')
    setServiceChargeDialogOpen(false)
  }

  const toggleDepartment = (dept: Department) => {
    setSelectedDepartments((current) =>
      current.includes(dept)
        ? current.filter(d => d !== dept)
        : [...current, dept]
    )
  }

  return (
    <div className="space-y-6">
      <Card className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10">
              <Receipt size={24} className="text-primary" />
            </div>
            <div>
              <h2 className="text-xl font-semibold">Tax Configuration</h2>
              <p className="text-sm text-muted-foreground">Manage tax types, rates, and calculation rules</p>
            </div>
          </div>
          <Button onClick={handleAddTax} className="gap-2">
            <Plus size={18} />
            Add Tax
          </Button>
        </div>

        <Separator className="mb-6" />

        <div className="space-y-4">
          {taxes.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Receipt size={48} className="mx-auto mb-4 opacity-50" />
              <p>No tax configurations found</p>
              <p className="text-sm">Click "Add Tax" to create your first tax configuration</p>
            </div>
          ) : (
            taxes.map((tax) => (
              <div key={tax.id} className="p-4 border rounded-lg">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="font-semibold">{tax.name}</h3>
                      {tax.isActive ? (
                        <Badge variant="default">Active</Badge>
                      ) : (
                        <Badge variant="secondary">Inactive</Badge>
                      )}
                      {tax.isInclusive && <Badge variant="outline">Inclusive</Badge>}
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <span className="text-muted-foreground">Type:</span>
                        <span className="ml-2 font-medium">{taxTypes.find(t => t.value === tax.type)?.label}</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Rate:</span>
                        <span className="ml-2 font-medium">{tax.rate}%</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Order:</span>
                        <span className="ml-2 font-medium">{tax.calculationOrder}</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Departments:</span>
                        <span className="ml-2 font-medium">{tax.appliesTo.length}</span>
                      </div>
                    </div>
                    {tax.registrationNumber && (
                      <div className="mt-2 text-sm">
                        <span className="text-muted-foreground">Registration #:</span>
                        <span className="ml-2 font-medium">{tax.registrationNumber}</span>
                      </div>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <Button variant="ghost" size="icon" onClick={() => handleEditTax(tax)}>
                      <Pencil size={18} />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => handleDeleteTax(tax.id)}>
                      <Trash size={18} className="text-destructive" />
                    </Button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </Card>

      <Card className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-semibold">Service Charge Configuration</h2>
            <p className="text-sm text-muted-foreground">Configure service charge rate and applicability</p>
          </div>
          <Button 
            onClick={() => {
              setSelectedDepartments(serviceCharge?.appliesTo || [])
              setServiceChargeDialogOpen(true)
            }} 
            variant="outline"
            className="gap-2"
          >
            <Pencil size={18} />
            Configure
          </Button>
        </div>

        <Separator className="mb-6" />

        {serviceCharge ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 border rounded-lg">
              <div className="text-sm text-muted-foreground mb-1">Service Charge Rate</div>
              <div className="text-2xl font-semibold">{serviceCharge.rate}%</div>
            </div>
            <div className="p-4 border rounded-lg">
              <div className="text-sm text-muted-foreground mb-1">Status</div>
              <div className="text-lg font-semibold">
                {serviceCharge.isActive ? (
                  <Badge variant="default">Active</Badge>
                ) : (
                  <Badge variant="secondary">Inactive</Badge>
                )}
              </div>
            </div>
            <div className="p-4 border rounded-lg">
              <div className="text-sm text-muted-foreground mb-1">Taxable</div>
              <div className="text-lg font-semibold">
                {serviceCharge.isTaxable ? 'Yes' : 'No'}
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            <p>No service charge configuration found</p>
            <p className="text-sm">Click "Configure" to set up service charge</p>
          </div>
        )}
      </Card>

      <Dialog open={taxDialogOpen} onOpenChange={setTaxDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingTax ? 'Edit Tax Configuration' : 'Add Tax Configuration'}</DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSaveTax}>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="tax-name">Tax Name *</Label>
                  <Input
                    id="tax-name"
                    name="name"
                    defaultValue={editingTax?.name}
                    placeholder="e.g., VAT 15%"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="tax-type">Tax Type *</Label>
                  <Select name="type" defaultValue={editingTax?.type || 'vat'} required>
                    <SelectTrigger id="tax-type">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {taxTypes.map((type) => (
                        <SelectItem key={type.value} value={type.value}>
                          {type.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="tax-rate">Tax Rate (%) *</Label>
                  <Input
                    id="tax-rate"
                    name="rate"
                    type="number"
                    step="0.01"
                    defaultValue={editingTax?.rate}
                    placeholder="15.00"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="calc-order">Calculation Order</Label>
                  <Input
                    id="calc-order"
                    name="calculationOrder"
                    type="number"
                    defaultValue={editingTax?.calculationOrder || 1}
                    placeholder="1"
                  />
                </div>

                <div className="space-y-2 col-span-2">
                  <Label htmlFor="reg-number">Registration Number</Label>
                  <Input
                    id="reg-number"
                    name="registrationNumber"
                    defaultValue={editingTax?.registrationNumber}
                    placeholder="TRN-123456789"
                  />
                </div>
              </div>

              <Separator />

              <div className="space-y-3">
                <Label>Applies To Departments</Label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                  {departments.map((dept) => (
                    <div key={dept} className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id={`dept-${dept}`}
                        checked={selectedDepartments.includes(dept)}
                        onChange={() => toggleDepartment(dept)}
                        className="h-4 w-4"
                      />
                      <label htmlFor={`dept-${dept}`} className="text-sm capitalize cursor-pointer">
                        {dept.replace('-', ' ')}
                      </label>
                    </div>
                  ))}
                </div>
              </div>

              <Separator />

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label htmlFor="is-active">Active</Label>
                  <Switch
                    id="is-active"
                    name="isActive"
                    defaultChecked={editingTax?.isActive !== false}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="is-inclusive">Tax Inclusive</Label>
                    <p className="text-xs text-muted-foreground">Tax is included in the price</p>
                  </div>
                  <Switch
                    id="is-inclusive"
                    name="isInclusive"
                    defaultChecked={editingTax?.isInclusive}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="is-compound">Compound Tax</Label>
                    <p className="text-xs text-muted-foreground">Tax calculated on tax</p>
                  </div>
                  <Switch
                    id="is-compound"
                    name="isCompoundTax"
                    defaultChecked={editingTax?.isCompoundTax}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="taxable-on-sc">Taxable on Service Charge</Label>
                    <p className="text-xs text-muted-foreground">Apply tax to service charge</p>
                  </div>
                  <Switch
                    id="taxable-on-sc"
                    name="taxableOnServiceCharge"
                    defaultChecked={editingTax?.taxableOnServiceCharge}
                  />
                </div>
              </div>
            </div>

            <DialogFooter className="mt-6">
              <Button type="button" variant="outline" onClick={() => setTaxDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" className="gap-2">
                <FloppyDisk size={18} />
                Save Tax Configuration
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={serviceChargeDialogOpen} onOpenChange={setServiceChargeDialogOpen}>
        <DialogContent className="max-w-xl">
          <DialogHeader>
            <DialogTitle>Configure Service Charge</DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSaveServiceCharge}>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="sc-rate">Service Charge Rate (%) *</Label>
                <Input
                  id="sc-rate"
                  name="rate"
                  type="number"
                  step="0.01"
                  defaultValue={serviceCharge?.rate || 10}
                  placeholder="10.00"
                  required
                />
              </div>

              <Separator />

              <div className="space-y-3">
                <Label>Applies To Departments</Label>
                <div className="grid grid-cols-2 gap-2">
                  {departments.map((dept) => (
                    <div key={dept} className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id={`sc-dept-${dept}`}
                        checked={selectedDepartments.includes(dept)}
                        onChange={() => toggleDepartment(dept)}
                        className="h-4 w-4"
                      />
                      <label htmlFor={`sc-dept-${dept}`} className="text-sm capitalize cursor-pointer">
                        {dept.replace('-', ' ')}
                      </label>
                    </div>
                  ))}
                </div>
              </div>

              <Separator />

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label htmlFor="sc-active">Active</Label>
                  <Switch
                    id="sc-active"
                    name="isActive"
                    defaultChecked={serviceCharge?.isActive !== false}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="sc-taxable">Taxable</Label>
                    <p className="text-xs text-muted-foreground">Apply tax on service charge</p>
                  </div>
                  <Switch
                    id="sc-taxable"
                    name="isTaxable"
                    defaultChecked={serviceCharge?.isTaxable}
                  />
                </div>
              </div>
            </div>

            <DialogFooter className="mt-6">
              <Button type="button" variant="outline" onClick={() => setServiceChargeDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" className="gap-2">
                <FloppyDisk size={18} />
                Save Service Charge
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
