import { useState, useEffect } from 'react'
import { type Supplier, type SupplierContactPerson } from '@/lib/types'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Switch } from '@/components/ui/switch'
import { Card } from '@/components/ui/card'
import { Plus, Trash, X, Star } from '@phosphor-icons/react'
import { generateNumber } from '@/lib/helpers'

interface SupplierDialogProps {
  open: boolean
  onClose: () => void
  onSave: (supplier: Supplier) => void
  supplier?: Supplier
}

const SUPPLIER_CATEGORIES = [
  'Food',
  'Amenities',
  'Linen',
  'Cleaning',
  'Beverages',
  'Construction',
  'Maintenance',
  'Hardware',
  'General Products',
  'Office Supplies',
  'Technology',
  'Seasonal Items',
  'Uniforms'
]

const PAYMENT_TERMS = [
  'Cash on Delivery',
  'Net 7',
  'Net 15',
  'Net 30',
  'Net 45',
  'Net 60',
  'Net 90',
  'Credit Card',
  'Bank Transfer',
  '2/10 Net 30'
]

export function SupplierDialog({ open, onClose, onSave, supplier }: SupplierDialogProps) {
  const [formData, setFormData] = useState<Supplier>({
    id: supplier?.id || `sup-${Date.now()}`,
    supplierId: supplier?.supplierId || `SUP-${new Date().getFullYear()}-${String(Math.floor(Math.random() * 900) + 100).padStart(3, '0')}`,
    name: supplier?.name || '',
    category: supplier?.category || [],
    contactPersons: supplier?.contactPersons || [],
    email: supplier?.email || '',
    phone: supplier?.phone || '',
    address: supplier?.address || '',
    city: supplier?.city || '',
    state: supplier?.state || '',
    country: supplier?.country || '',
    postalCode: supplier?.postalCode || '',
    taxId: supplier?.taxId || '',
    businessRegNumber: supplier?.businessRegNumber || '',
    website: supplier?.website || '',
    paymentTerms: supplier?.paymentTerms || 'Net 30',
    creditLimit: supplier?.creditLimit,
    deliveryTimeDays: supplier?.deliveryTimeDays || 3,
    minimumOrderValue: supplier?.minimumOrderValue,
    rating: supplier?.rating || 0,
    deliveryTimeRating: supplier?.deliveryTimeRating || 0,
    costRating: supplier?.costRating || 0,
    qualityRating: supplier?.qualityRating || 0,
    totalOrders: supplier?.totalOrders || 0,
    totalSpent: supplier?.totalSpent || 0,
    bankName: supplier?.bankName || '',
    bankAccountNumber: supplier?.bankAccountNumber || '',
    bankBranch: supplier?.bankBranch || '',
    notes: supplier?.notes || '',
    isActive: supplier?.isActive ?? true,
    createdAt: supplier?.createdAt || Date.now(),
    updatedAt: Date.now()
  })

  const [newCategory, setNewCategory] = useState('')
  const [showBankDetails, setShowBankDetails] = useState(
    !!(supplier?.bankName || supplier?.bankAccountNumber || supplier?.bankBranch)
  )

  const addContactPerson = () => {
    setFormData(prev => ({
      ...prev,
      contactPersons: [
        ...prev.contactPersons,
        {
          id: `cp-${Date.now()}`,
          name: '',
          role: '',
          email: '',
          phone: '',
          isPrimary: prev.contactPersons.length === 0
        }
      ]
    }))
  }

  const updateContactPerson = (index: number, field: keyof SupplierContactPerson, value: string | boolean) => {
    setFormData(prev => ({
      ...prev,
      contactPersons: prev.contactPersons.map((cp, i) => 
        i === index ? { ...cp, [field]: value } : field === 'isPrimary' && value ? { ...cp, isPrimary: false } : cp
      )
    }))
  }

  const removeContactPerson = (index: number) => {
    setFormData(prev => ({
      ...prev,
      contactPersons: prev.contactPersons.filter((_, i) => i !== index)
    }))
  }

  const addCategory = (category: string) => {
    if (category && !formData.category.includes(category)) {
      setFormData(prev => ({
        ...prev,
        category: [...prev.category, category]
      }))
    }
  }

  const removeCategory = (category: string) => {
    setFormData(prev => ({
      ...prev,
      category: prev.category.filter(c => c !== category)
    }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.name.trim() || !formData.phone.trim()) {
      return
    }
    if (formData.category.length === 0) {
      return
    }
    onSave(formData)
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{supplier ? 'Edit Supplier' : 'Add New Supplier'}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <h3 className="font-semibold mb-4">Basic Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="supplierId">Supplier ID</Label>
                <Input
                  id="supplierId"
                  value={formData.supplierId}
                  onChange={(e) => setFormData(prev => ({ ...prev, supplierId: e.target.value }))}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="name">Supplier Name *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  required
                />
              </div>
            </div>
          </div>

          <div>
            <Label>Categories *</Label>
            <div className="flex gap-2 mt-2 mb-3 flex-wrap">
              {formData.category.map(cat => (
                <Badge key={cat} variant="secondary" className="pl-3 pr-1 py-1">
                  {cat}
                  <button
                    type="button"
                    onClick={() => removeCategory(cat)}
                    className="ml-2 hover:text-destructive"
                  >
                    <X size={14} />
                  </button>
                </Badge>
              ))}
            </div>
            <div className="flex gap-2 flex-wrap">
              {SUPPLIER_CATEGORIES.filter(cat => !formData.category.includes(cat)).map(cat => (
                <Button
                  key={cat}
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => addCategory(cat)}
                >
                  <Plus size={14} className="mr-1" />
                  {cat}
                </Button>
              ))}
            </div>
            <div className="flex gap-2 mt-2">
              <Input
                placeholder="Custom category"
                value={newCategory}
                onChange={(e) => setNewCategory(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault()
                    addCategory(newCategory)
                    setNewCategory('')
                  }
                }}
              />
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  addCategory(newCategory)
                  setNewCategory('')
                }}
              >
                Add
              </Button>
            </div>
          </div>

          <Separator />

          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold">Contact Persons</h3>
              <Button type="button" variant="outline" size="sm" onClick={addContactPerson}>
                <Plus size={16} className="mr-1" />
                Add Contact
              </Button>
            </div>
            <div className="space-y-3">
              {formData.contactPersons.map((person, index) => (
                <Card key={person.id} className="p-4">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Switch
                          checked={person.isPrimary}
                          onCheckedChange={(checked) => updateContactPerson(index, 'isPrimary', checked)}
                        />
                        <Label>Primary Contact</Label>
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeContactPerson(index)}
                      >
                        <Trash size={16} />
                      </Button>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div className="space-y-2">
                        <Label>Name</Label>
                        <Input
                          value={person.name}
                          onChange={(e) => updateContactPerson(index, 'name', e.target.value)}
                          placeholder="Contact name"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Role</Label>
                        <Input
                          value={person.role}
                          onChange={(e) => updateContactPerson(index, 'role', e.target.value)}
                          placeholder="e.g., Sales Manager"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Email</Label>
                        <Input
                          type="email"
                          value={person.email}
                          onChange={(e) => updateContactPerson(index, 'email', e.target.value)}
                          placeholder="email@example.com"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Phone</Label>
                        <Input
                          value={person.phone}
                          onChange={(e) => updateContactPerson(index, 'phone', e.target.value)}
                          placeholder="+1-555-0000"
                        />
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
              {formData.contactPersons.length === 0 && (
                <p className="text-sm text-muted-foreground text-center py-4">
                  No contact persons added yet
                </p>
              )}
            </div>
          </div>

          <Separator />

          <div>
            <h3 className="font-semibold mb-4">Company Details</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="email">Company Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Company Phone *</Label>
                <Input
                  id="phone"
                  value={formData.phone}
                  onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                  required
                />
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="address">Address</Label>
                <Input
                  id="address"
                  value={formData.address}
                  onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="city">City</Label>
                <Input
                  id="city"
                  value={formData.city}
                  onChange={(e) => setFormData(prev => ({ ...prev, city: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="state">State/Province</Label>
                <Input
                  id="state"
                  value={formData.state}
                  onChange={(e) => setFormData(prev => ({ ...prev, state: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="country">Country</Label>
                <Input
                  id="country"
                  value={formData.country}
                  onChange={(e) => setFormData(prev => ({ ...prev, country: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="postalCode">Postal Code</Label>
                <Input
                  id="postalCode"
                  value={formData.postalCode}
                  onChange={(e) => setFormData(prev => ({ ...prev, postalCode: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="website">Website</Label>
                <Input
                  id="website"
                  value={formData.website}
                  onChange={(e) => setFormData(prev => ({ ...prev, website: e.target.value }))}
                  placeholder="www.example.com"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="taxId">Tax ID</Label>
                <Input
                  id="taxId"
                  value={formData.taxId}
                  onChange={(e) => setFormData(prev => ({ ...prev, taxId: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="businessRegNumber">Business Reg Number</Label>
                <Input
                  id="businessRegNumber"
                  value={formData.businessRegNumber}
                  onChange={(e) => setFormData(prev => ({ ...prev, businessRegNumber: e.target.value }))}
                />
              </div>
            </div>
          </div>

          <Separator />

          <div>
            <h3 className="font-semibold mb-4">Payment & Delivery</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="paymentTerms">Payment Terms</Label>
                <select
                  id="paymentTerms"
                  value={formData.paymentTerms}
                  onChange={(e) => setFormData(prev => ({ ...prev, paymentTerms: e.target.value }))}
                  className="w-full h-10 px-3 rounded-md border border-input bg-background"
                >
                  {PAYMENT_TERMS.map(term => (
                    <option key={term} value={term}>{term}</option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="creditLimit">Credit Limit</Label>
                <Input
                  id="creditLimit"
                  type="number"
                  value={formData.creditLimit || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, creditLimit: e.target.value ? Number(e.target.value) : undefined }))}
                  placeholder="0.00"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="deliveryTimeDays">Delivery Time (Days)</Label>
                <Input
                  id="deliveryTimeDays"
                  type="number"
                  value={formData.deliveryTimeDays}
                  onChange={(e) => setFormData(prev => ({ ...prev, deliveryTimeDays: Number(e.target.value) }))}
                  min="1"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="minimumOrderValue">Minimum Order Value</Label>
                <Input
                  id="minimumOrderValue"
                  type="number"
                  value={formData.minimumOrderValue || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, minimumOrderValue: e.target.value ? Number(e.target.value) : undefined }))}
                  placeholder="0.00"
                />
              </div>
            </div>

            <div className="mt-4">
              <div className="flex items-center gap-2 mb-3">
                <Switch
                  checked={showBankDetails}
                  onCheckedChange={setShowBankDetails}
                />
                <Label>Add Bank Details</Label>
              </div>
              {showBankDetails && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="bankName">Bank Name</Label>
                    <Input
                      id="bankName"
                      value={formData.bankName}
                      onChange={(e) => setFormData(prev => ({ ...prev, bankName: e.target.value }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="bankAccountNumber">Account Number</Label>
                    <Input
                      id="bankAccountNumber"
                      value={formData.bankAccountNumber}
                      onChange={(e) => setFormData(prev => ({ ...prev, bankAccountNumber: e.target.value }))}
                    />
                  </div>
                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="bankBranch">Branch</Label>
                    <Input
                      id="bankBranch"
                      value={formData.bankBranch}
                      onChange={(e) => setFormData(prev => ({ ...prev, bankBranch: e.target.value }))}
                    />
                  </div>
                </div>
              )}
            </div>
          </div>

          <Separator />

          <div>
            <h3 className="font-semibold mb-4">Performance Ratings</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="deliveryTimeRating">Delivery Time Rating</Label>
                <div className="flex items-center gap-2">
                  <Input
                    id="deliveryTimeRating"
                    type="number"
                    min="0"
                    max="5"
                    step="0.1"
                    value={formData.deliveryTimeRating}
                    onChange={(e) => setFormData(prev => ({ ...prev, deliveryTimeRating: Number(e.target.value) }))}
                  />
                  <Star size={20} className="text-accent" />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="costRating">Cost Rating</Label>
                <div className="flex items-center gap-2">
                  <Input
                    id="costRating"
                    type="number"
                    min="0"
                    max="5"
                    step="0.1"
                    value={formData.costRating}
                    onChange={(e) => setFormData(prev => ({ ...prev, costRating: Number(e.target.value) }))}
                  />
                  <Star size={20} className="text-accent" />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="qualityRating">Quality Rating</Label>
                <div className="flex items-center gap-2">
                  <Input
                    id="qualityRating"
                    type="number"
                    min="0"
                    max="5"
                    step="0.1"
                    value={formData.qualityRating}
                    onChange={(e) => setFormData(prev => ({ ...prev, qualityRating: Number(e.target.value) }))}
                  />
                  <Star size={20} className="text-accent" />
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
              rows={3}
              placeholder="Additional notes about this supplier..."
            />
          </div>

          <div className="flex items-center gap-2">
            <Switch
              checked={formData.isActive}
              onCheckedChange={(checked) => setFormData(prev => ({ ...prev, isActive: checked }))}
            />
            <Label>Active Supplier</Label>
          </div>

          <div className="flex gap-2 justify-end pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit">
              {supplier ? 'Update Supplier' : 'Add Supplier'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
