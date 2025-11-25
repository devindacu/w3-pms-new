import { useState } from 'react'
import { type Supplier } from '@/lib/types'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Separator } from '@/components/ui/separator'
import { toast } from 'sonner'
import {
  Plus,
  MagnifyingGlass,
  Phone,
  Envelope,
  MapPin,
  Star,
  Package,
  CurrencyDollar,
  Trash,
  PencilSimple,
  User,
  Buildings,
  Calendar,
  Clock
} from '@phosphor-icons/react'
import { SupplierDialog } from '@/components/SupplierDialog'
import { formatCurrency } from '@/lib/helpers'
import { format } from 'date-fns'

interface SupplierManagementProps {
  suppliers: Supplier[]
  setSuppliers: (updater: (current: Supplier[]) => Supplier[]) => void
}

export function SupplierManagement({ suppliers, setSuppliers }: SupplierManagementProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingSupplier, setEditingSupplier] = useState<Supplier | null>(null)
  const [viewingSupplier, setViewingSupplier] = useState<Supplier | null>(null)

  const allCategories = Array.from(
    new Set(suppliers.flatMap(s => s.category))
  ).sort()

  const filteredSuppliers = suppliers.filter(supplier => {
    const matchesSearch = 
      supplier.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      supplier.supplierId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      supplier.contactPersons.some(cp => 
        cp.name.toLowerCase().includes(searchTerm.toLowerCase())
      )
    const matchesCategory = selectedCategory === 'all' || supplier.category.includes(selectedCategory)
    return matchesSearch && matchesCategory
  })

  const handleAddSupplier = (supplier: Supplier) => {
    setSuppliers(current => [...current, supplier])
    setDialogOpen(false)
    toast.success('Supplier added successfully')
  }

  const handleUpdateSupplier = (supplier: Supplier) => {
    setSuppliers(current => 
      current.map(s => s.id === supplier.id ? supplier : s)
    )
    setEditingSupplier(null)
    toast.success('Supplier updated successfully')
  }

  const handleDeleteSupplier = (id: string) => {
    setSuppliers(current => current.filter(s => s.id !== id))
    toast.success('Supplier deleted successfully')
  }

  const getOverallRating = (supplier: Supplier) => {
    return ((supplier.deliveryTimeRating + supplier.costRating + supplier.qualityRating) / 3).toFixed(1)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-semibold">Supplier Management</h1>
          <p className="text-muted-foreground mt-1">Centralized database for all suppliers</p>
        </div>
        <Button onClick={() => setDialogOpen(true)} size="lg">
          <Plus size={20} className="mr-2" />
          Add Supplier
        </Button>
      </div>

      <Card className="p-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <MagnifyingGlass size={20} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search suppliers by name, ID, or contact person..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <div className="flex gap-2 flex-wrap">
            <Button
              variant={selectedCategory === 'all' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedCategory('all')}
            >
              All ({suppliers.length})
            </Button>
            {allCategories.map(category => (
              <Button
                key={category}
                variant={selectedCategory === category ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedCategory(category)}
              >
                {category} ({suppliers.filter(s => s.category.includes(category)).length})
              </Button>
            ))}
          </div>
        </div>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredSuppliers.map(supplier => (
          <Card 
            key={supplier.id} 
            className="p-6 hover:border-primary transition-colors cursor-pointer"
            onClick={() => setViewingSupplier(supplier)}
          >
            <div className="space-y-4">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <Buildings size={20} className="text-primary" />
                    <h3 className="font-semibold text-lg">{supplier.name}</h3>
                  </div>
                  <p className="text-sm text-muted-foreground">{supplier.supplierId}</p>
                </div>
                {!supplier.isActive && (
                  <Badge variant="destructive">Inactive</Badge>
                )}
              </div>

              <div className="flex flex-wrap gap-1">
                {supplier.category.slice(0, 3).map(cat => (
                  <Badge key={cat} variant="secondary" className="text-xs">
                    {cat}
                  </Badge>
                ))}
                {supplier.category.length > 3 && (
                  <Badge variant="secondary" className="text-xs">
                    +{supplier.category.length - 3}
                  </Badge>
                )}
              </div>

              <Separator />

              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <User size={16} />
                  <span>{supplier.contactPersons.find(cp => cp.isPrimary)?.name || 'No primary contact'}</span>
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Phone size={16} />
                  <span>{supplier.phone}</span>
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Clock size={16} />
                  <span>{supplier.deliveryTimeDays} days delivery</span>
                </div>
              </div>

              <Separator />

              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Overall Rating</span>
                  <div className="flex items-center gap-1">
                    <Star size={16} className="text-accent fill-accent" />
                    <span className="font-semibold">{getOverallRating(supplier)}/5.0</span>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-2 text-xs">
                  <div className="text-center">
                    <div className="text-muted-foreground">Delivery</div>
                    <div className="font-semibold">{supplier.deliveryTimeRating}</div>
                  </div>
                  <div className="text-center">
                    <div className="text-muted-foreground">Cost</div>
                    <div className="font-semibold">{supplier.costRating}</div>
                  </div>
                  <div className="text-center">
                    <div className="text-muted-foreground">Quality</div>
                    <div className="font-semibold">{supplier.qualityRating}</div>
                  </div>
                </div>
              </div>

              <Separator />

              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <div className="text-muted-foreground text-xs">Total Orders</div>
                  <div className="font-semibold flex items-center gap-1">
                    <Package size={16} />
                    {supplier.totalOrders}
                  </div>
                </div>
                <div>
                  <div className="text-muted-foreground text-xs">Total Spent</div>
                  <div className="font-semibold flex items-center gap-1">
                    <CurrencyDollar size={16} />
                    {formatCurrency(supplier.totalSpent)}
                  </div>
                </div>
              </div>

              <div className="flex gap-2 pt-2" onClick={(e) => e.stopPropagation()}>
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1"
                  onClick={() => {
                    setEditingSupplier(supplier)
                  }}
                >
                  <PencilSimple size={16} className="mr-1" />
                  Edit
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleDeleteSupplier(supplier.id)}
                >
                  <Trash size={16} />
                </Button>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {filteredSuppliers.length === 0 && (
        <Card className="p-16 text-center">
          <Buildings size={64} className="mx-auto text-muted-foreground mb-4" />
          <h3 className="text-2xl font-semibold mb-2">No suppliers found</h3>
          <p className="text-muted-foreground mb-6">
            {searchTerm || selectedCategory !== 'all'
              ? 'Try adjusting your filters'
              : 'Add your first supplier to get started'}
          </p>
          {!searchTerm && selectedCategory === 'all' && (
            <Button onClick={() => setDialogOpen(true)}>
              <Plus size={20} className="mr-2" />
              Add Supplier
            </Button>
          )}
        </Card>
      )}

      {dialogOpen && (
        <SupplierDialog
          open={dialogOpen}
          onClose={() => setDialogOpen(false)}
          onSave={handleAddSupplier}
        />
      )}

      {editingSupplier && (
        <SupplierDialog
          open={!!editingSupplier}
          onClose={() => setEditingSupplier(null)}
          onSave={handleUpdateSupplier}
          supplier={editingSupplier}
        />
      )}

      {viewingSupplier && (
        <SupplierDetailDialog
          supplier={viewingSupplier}
          open={!!viewingSupplier}
          onClose={() => setViewingSupplier(null)}
          onEdit={() => {
            setEditingSupplier(viewingSupplier)
            setViewingSupplier(null)
          }}
        />
      )}
    </div>
  )
}

interface SupplierDetailDialogProps {
  supplier: Supplier
  open: boolean
  onClose: () => void
  onEdit: () => void
}

function SupplierDetailDialog({ supplier, open, onClose, onEdit }: SupplierDetailDialogProps) {
  const { Dialog, DialogContent, DialogHeader, DialogTitle } = require('@/components/ui/dialog')
  
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl">Supplier Details</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-xl font-semibold">{supplier.name}</h3>
                <p className="text-sm text-muted-foreground">{supplier.supplierId}</p>
              </div>
              <div className="flex gap-2">
                {!supplier.isActive && <Badge variant="destructive">Inactive</Badge>}
                <Button variant="outline" size="sm" onClick={onEdit}>
                  <PencilSimple size={16} className="mr-1" />
                  Edit
                </Button>
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              {supplier.category.map(cat => (
                <Badge key={cat} variant="secondary">{cat}</Badge>
              ))}
            </div>
          </div>

          <Separator />

          <div>
            <h4 className="font-semibold mb-3 flex items-center gap-2">
              <User size={18} />
              Contact Persons
            </h4>
            <div className="space-y-3">
              {supplier.contactPersons.map(person => (
                <Card key={person.id} className="p-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-medium">{person.name}</p>
                        {person.isPrimary && <Badge variant="default" className="text-xs">Primary</Badge>}
                      </div>
                      <p className="text-sm text-muted-foreground">{person.role}</p>
                      <div className="mt-2 space-y-1 text-sm">
                        {person.email && (
                          <div className="flex items-center gap-2 text-muted-foreground">
                            <Envelope size={14} />
                            {person.email}
                          </div>
                        )}
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <Phone size={14} />
                          {person.phone}
                        </div>
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>

          <Separator />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-semibold mb-3 flex items-center gap-2">
                <Buildings size={18} />
                Company Information
              </h4>
              <div className="space-y-2 text-sm">
                {supplier.email && (
                  <div>
                    <span className="text-muted-foreground">Email:</span>
                    <p>{supplier.email}</p>
                  </div>
                )}
                <div>
                  <span className="text-muted-foreground">Phone:</span>
                  <p>{supplier.phone}</p>
                </div>
                {supplier.address && (
                  <div>
                    <span className="text-muted-foreground">Address:</span>
                    <p>{supplier.address}</p>
                    {supplier.city && <p>{supplier.city}, {supplier.state} {supplier.postalCode}</p>}
                    {supplier.country && <p>{supplier.country}</p>}
                  </div>
                )}
                {supplier.website && (
                  <div>
                    <span className="text-muted-foreground">Website:</span>
                    <p>{supplier.website}</p>
                  </div>
                )}
                {supplier.taxId && (
                  <div>
                    <span className="text-muted-foreground">Tax ID:</span>
                    <p>{supplier.taxId}</p>
                  </div>
                )}
                {supplier.businessRegNumber && (
                  <div>
                    <span className="text-muted-foreground">Business Reg #:</span>
                    <p>{supplier.businessRegNumber}</p>
                  </div>
                )}
              </div>
            </div>

            <div>
              <h4 className="font-semibold mb-3 flex items-center gap-2">
                <CurrencyDollar size={18} />
                Financial Information
              </h4>
              <div className="space-y-2 text-sm">
                <div>
                  <span className="text-muted-foreground">Payment Terms:</span>
                  <p>{supplier.paymentTerms}</p>
                </div>
                {supplier.creditLimit && (
                  <div>
                    <span className="text-muted-foreground">Credit Limit:</span>
                    <p>{formatCurrency(supplier.creditLimit)}</p>
                  </div>
                )}
                {supplier.minimumOrderValue && (
                  <div>
                    <span className="text-muted-foreground">Min Order Value:</span>
                    <p>{formatCurrency(supplier.minimumOrderValue)}</p>
                  </div>
                )}
                {supplier.bankName && (
                  <div>
                    <span className="text-muted-foreground">Bank:</span>
                    <p>{supplier.bankName}</p>
                    {supplier.bankAccountNumber && <p>Account: {supplier.bankAccountNumber}</p>}
                    {supplier.bankBranch && <p>Branch: {supplier.bankBranch}</p>}
                  </div>
                )}
              </div>
            </div>
          </div>

          <Separator />

          <div>
            <h4 className="font-semibold mb-3 flex items-center gap-2">
              <Star size={18} />
              Performance Ratings
            </h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Card className="p-4 text-center">
                <div className="text-muted-foreground text-sm mb-1">Overall</div>
                <div className="text-2xl font-semibold">{((supplier.deliveryTimeRating + supplier.costRating + supplier.qualityRating) / 3).toFixed(1)}</div>
                <div className="flex items-center justify-center gap-1 mt-1">
                  <Star size={14} className="text-accent fill-accent" />
                  <span className="text-xs text-muted-foreground">/ 5.0</span>
                </div>
              </Card>
              <Card className="p-4 text-center">
                <div className="text-muted-foreground text-sm mb-1">Delivery Time</div>
                <div className="text-2xl font-semibold">{supplier.deliveryTimeRating}</div>
                <div className="flex items-center justify-center gap-1 mt-1">
                  <Star size={14} className="text-accent fill-accent" />
                  <span className="text-xs text-muted-foreground">/ 5.0</span>
                </div>
              </Card>
              <Card className="p-4 text-center">
                <div className="text-muted-foreground text-sm mb-1">Cost</div>
                <div className="text-2xl font-semibold">{supplier.costRating}</div>
                <div className="flex items-center justify-center gap-1 mt-1">
                  <Star size={14} className="text-accent fill-accent" />
                  <span className="text-xs text-muted-foreground">/ 5.0</span>
                </div>
              </Card>
              <Card className="p-4 text-center">
                <div className="text-muted-foreground text-sm mb-1">Quality</div>
                <div className="text-2xl font-semibold">{supplier.qualityRating}</div>
                <div className="flex items-center justify-center gap-1 mt-1">
                  <Star size={14} className="text-accent fill-accent" />
                  <span className="text-xs text-muted-foreground">/ 5.0</span>
                </div>
              </Card>
            </div>
          </div>

          <Separator />

          <div>
            <h4 className="font-semibold mb-3 flex items-center gap-2">
              <Package size={18} />
              Order Statistics
            </h4>
            <div className="grid grid-cols-3 gap-4">
              <Card className="p-4 text-center">
                <div className="text-muted-foreground text-sm mb-1">Total Orders</div>
                <div className="text-2xl font-semibold">{supplier.totalOrders}</div>
              </Card>
              <Card className="p-4 text-center">
                <div className="text-muted-foreground text-sm mb-1">Total Spent</div>
                <div className="text-2xl font-semibold">{formatCurrency(supplier.totalSpent)}</div>
              </Card>
              <Card className="p-4 text-center">
                <div className="text-muted-foreground text-sm mb-1">Delivery Days</div>
                <div className="text-2xl font-semibold">{supplier.deliveryTimeDays}</div>
              </Card>
            </div>
          </div>

          {supplier.notes && (
            <>
              <Separator />
              <div>
                <h4 className="font-semibold mb-2">Notes</h4>
                <p className="text-sm text-muted-foreground">{supplier.notes}</p>
              </div>
            </>
          )}

          <Separator />

          <div className="text-xs text-muted-foreground flex items-center gap-4">
            <div className="flex items-center gap-1">
              <Calendar size={14} />
              <span>Created: {format(new Date(supplier.createdAt), 'MMM dd, yyyy')}</span>
            </div>
            <div className="flex items-center gap-1">
              <Calendar size={14} />
              <span>Updated: {format(new Date(supplier.updatedAt), 'MMM dd, yyyy')}</span>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
