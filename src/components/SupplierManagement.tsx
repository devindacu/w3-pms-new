import { useState, useMemo } from 'react'
import { type Supplier } from '@/lib/types'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Separator } from '@/components/ui/separator'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
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
  Clock,
  ArrowsDownUp,
  FunnelSimple,
  Download,
  Upload
} from '@phosphor-icons/react'
import { SupplierDialog } from '@/components/SupplierDialog'
import { formatCurrency } from '@/lib/helpers'
import { format } from 'date-fns'

interface SupplierManagementProps {
  suppliers: Supplier[]
  setSuppliers: (updater: (current: Supplier[]) => Supplier[]) => void
}

type SortField = 'name' | 'rating' | 'totalOrders' | 'totalSpent' | 'deliveryTime'
type SortOrder = 'asc' | 'desc'

export function SupplierManagement({ suppliers, setSuppliers }: SupplierManagementProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all')
  const [sortField, setSortField] = useState<SortField>('name')
  const [sortOrder, setSortOrder] = useState<SortOrder>('asc')
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingSupplier, setEditingSupplier] = useState<Supplier | null>(null)
  const [viewingSupplier, setViewingSupplier] = useState<Supplier | null>(null)

  const allCategories = useMemo(() => 
    Array.from(new Set(suppliers.flatMap(s => s.category))).sort(),
    [suppliers]
  )

  const filteredAndSortedSuppliers = useMemo(() => {
    const filtered = suppliers.filter(supplier => {
      const matchesSearch = 
        supplier.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        supplier.supplierId.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (supplier.contactPersons || []).some(cp => 
          cp.name.toLowerCase().includes(searchTerm.toLowerCase())
        )
      const matchesCategory = selectedCategory === 'all' || supplier.category.includes(selectedCategory)
      const matchesStatus = statusFilter === 'all' || 
        (statusFilter === 'active' && supplier.isActive) ||
        (statusFilter === 'inactive' && !supplier.isActive)
      return matchesSearch && matchesCategory && matchesStatus
    })

    filtered.sort((a, b) => {
      let comparison = 0
      switch (sortField) {
        case 'name':
          comparison = a.name.localeCompare(b.name)
          break
        case 'rating': {
          const aRating = (a.deliveryTimeRating + a.costRating + a.qualityRating) / 3
          const bRating = (b.deliveryTimeRating + b.costRating + b.qualityRating) / 3
          comparison = aRating - bRating
          break
        }
        case 'totalOrders':
          comparison = a.totalOrders - b.totalOrders
          break
        case 'totalSpent':
          comparison = a.totalSpent - b.totalSpent
          break
        case 'deliveryTime':
          comparison = a.deliveryTimeDays - b.deliveryTimeDays
          break
      }
      return sortOrder === 'asc' ? comparison : -comparison
    })

    return filtered
  }, [suppliers, searchTerm, selectedCategory, statusFilter, sortField, sortOrder])

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

  const toggleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')
    } else {
      setSortField(field)
      setSortOrder('asc')
    }
  }

  const exportToCSV = () => {
    const headers = [
      'Supplier ID',
      'Name',
      'Category',
      'Phone',
      'Email',
      'Payment Terms',
      'Delivery Days',
      'Overall Rating',
      'Delivery Rating',
      'Cost Rating',
      'Quality Rating',
      'Total Orders',
      'Total Spent',
      'Status'
    ]
    
    const rows = suppliers.map(s => [
      s.supplierId,
      s.name,
      s.category.join('; '),
      s.phone,
      s.email || '',
      s.paymentTerms,
      s.deliveryTimeDays,
      getOverallRating(s),
      s.deliveryTimeRating,
      s.costRating,
      s.qualityRating,
      s.totalOrders,
      s.totalSpent,
      s.isActive ? 'Active' : 'Inactive'
    ])

    const csv = [headers, ...rows].map(row => row.join(',')).join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `suppliers-${new Date().toISOString().split('T')[0]}.csv`
    a.click()
    toast.success('Supplier data exported successfully')
  }

  const stats = useMemo(() => ({
    total: suppliers.length,
    active: suppliers.filter(s => s.isActive).length,
    inactive: suppliers.filter(s => !s.isActive).length,
    averageRating: suppliers.length > 0
      ? (suppliers.reduce((sum, s) => sum + Number(getOverallRating(s)), 0) / suppliers.length).toFixed(1)
      : '0.0',
    totalSpent: suppliers.reduce((sum, s) => sum + s.totalSpent, 0),
    totalOrders: suppliers.reduce((sum, s) => sum + s.totalOrders, 0)
  }), [suppliers])

  return (
    <div className="space-y-4 md:space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl lg:text-4xl font-semibold">Supplier Management</h1>
          <p className="text-muted-foreground mt-1 text-sm md:text-base">Centralized database for all suppliers</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={exportToCSV} variant="outline" size="sm" className="flex-1 sm:flex-initial sm:size-default">
            <Download size={18} className="sm:mr-2" />
            <span className="hidden sm:inline">Export</span>
          </Button>
          <Button onClick={() => setDialogOpen(true)} size="sm" className="flex-1 sm:flex-initial sm:size-default">
            <Plus size={18} className="sm:mr-2" />
            <span className="sm:inline">Add Supplier</span>
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <Card className="p-4">
          <div className="text-sm text-muted-foreground">Total Suppliers</div>
          <div className="text-2xl font-semibold mt-1">{stats.total}</div>
        </Card>
        <Card className="p-4">
          <div className="text-sm text-muted-foreground">Active</div>
          <div className="text-2xl font-semibold mt-1 text-success">{stats.active}</div>
        </Card>
        <Card className="p-4">
          <div className="text-sm text-muted-foreground">Inactive</div>
          <div className="text-2xl font-semibold mt-1 text-muted-foreground">{stats.inactive}</div>
        </Card>
        <Card className="p-4">
          <div className="text-sm text-muted-foreground">Avg Rating</div>
          <div className="text-2xl font-semibold mt-1 flex items-center gap-1">
            {stats.averageRating}
            <Star size={16} className="text-accent fill-accent" />
          </div>
        </Card>
        <Card className="p-4">
          <div className="text-sm text-muted-foreground">Total Orders</div>
          <div className="text-2xl font-semibold mt-1">{stats.totalOrders}</div>
        </Card>
        <Card className="p-4">
          <div className="text-sm text-muted-foreground">Total Spent</div>
          <div className="text-2xl font-semibold mt-1">{formatCurrency(stats.totalSpent)}</div>
        </Card>
      </div>

      <Card className="p-4 md:p-6">
        <div className="space-y-3 md:space-y-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="flex-1 relative">
              <MagnifyingGlass size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search suppliers..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 h-9 md:h-10 text-sm md:text-base"
              />
            </div>
            <div className="flex gap-2">
              <Select value={statusFilter} onValueChange={(value) => setStatusFilter(value as any)}>
                <SelectTrigger className="w-[110px] sm:w-[140px] h-9 md:h-10 text-sm md:text-base">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
              <Select value={sortField} onValueChange={(value) => setSortField(value as SortField)}>
                <SelectTrigger className="w-[120px] sm:w-[160px] h-9 md:h-10 text-sm md:text-base">
                  <ArrowsDownUp size={16} className="mr-1 sm:mr-2" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="name">Name</SelectItem>
                  <SelectItem value="rating">Rating</SelectItem>
                  <SelectItem value="totalOrders">Orders</SelectItem>
                  <SelectItem value="totalSpent">Spent</SelectItem>
                  <SelectItem value="deliveryTime">Delivery</SelectItem>
                </SelectContent>
              </Select>
              <Button
                variant="outline"
                size="icon"
                className="h-9 w-9 md:h-10 md:w-10 shrink-0"
                onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
              >
                <ArrowsDownUp size={18} />
              </Button>
            </div>
          </div>
          <div className="flex gap-2 flex-wrap">
            <Button
              variant={selectedCategory === 'all' ? 'default' : 'outline'}
              size="sm"
              className="h-8 text-xs sm:text-sm px-2 sm:px-3"
              onClick={() => setSelectedCategory('all')}
            >
              All ({suppliers.length})
            </Button>
            {allCategories.map(category => (
              <Button
                key={category}
                variant={selectedCategory === category ? 'default' : 'outline'}
                size="sm"
                className="h-8 text-xs sm:text-sm px-2 sm:px-3"
                onClick={() => setSelectedCategory(category)}
              >
                <span className="hidden sm:inline">{category}</span>
                <span className="sm:hidden">{category.length > 12 ? category.substring(0, 10) + '...' : category}</span>
                {' '}({suppliers.filter(s => s.category.includes(category)).length})
              </Button>
            ))}
          </div>
        </div>
      </Card>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4 lg:gap-6">
        {filteredAndSortedSuppliers.map(supplier => (
          <Card 
            key={supplier.id} 
            className="p-4 md:p-6 hover:border-primary transition-colors cursor-pointer"
            onClick={() => setViewingSupplier(supplier)}
          >
            <div className="space-y-3 md:space-y-4">
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <Buildings size={18} className="text-primary shrink-0" />
                    <h3 className="font-semibold text-base md:text-lg truncate">{supplier.name}</h3>
                  </div>
                  <p className="text-xs md:text-sm text-muted-foreground truncate">{supplier.supplierId}</p>
                </div>
                {!supplier.isActive && (
                  <Badge variant="destructive" className="text-xs shrink-0">Inactive</Badge>
                )}
              </div>

              <div className="flex flex-wrap gap-1">
                {supplier.category.slice(0, 2).map(cat => (
                  <Badge key={cat} variant="secondary" className="text-xs">
                    {cat.length > 15 ? cat.substring(0, 13) + '...' : cat}
                  </Badge>
                ))}
                {supplier.category.length > 2 && (
                  <Badge variant="secondary" className="text-xs">
                    +{supplier.category.length - 2}
                  </Badge>
                )}
              </div>

              <Separator />

              <div className="space-y-1.5 md:space-y-2 text-xs md:text-sm">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <User size={14} className="shrink-0" />
                  <span className="truncate">{(supplier.contactPersons || []).find(cp => cp.isPrimary)?.name || 'No contact'}</span>
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Phone size={14} className="shrink-0" />
                  <span className="truncate">{supplier.phone}</span>
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Clock size={14} className="shrink-0" />
                  <span>{supplier.deliveryTimeDays} days</span>
                </div>
              </div>

              <Separator />

              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs md:text-sm">
                  <span className="text-muted-foreground">Rating</span>
                  <div className="flex items-center gap-1">
                    <Star size={14} className="text-accent fill-accent" />
                    <span className="font-semibold">{getOverallRating(supplier)}</span>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-1.5 md:gap-2 text-xs">
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

              <div className="grid grid-cols-2 gap-3 md:gap-4 text-xs md:text-sm">
                <div>
                  <div className="text-muted-foreground text-xs">Orders</div>
                  <div className="font-semibold flex items-center gap-1">
                    <Package size={14} className="shrink-0" />
                    <span>{supplier.totalOrders}</span>
                  </div>
                </div>
                <div>
                  <div className="text-muted-foreground text-xs">Spent</div>
                  <div className="font-semibold flex items-center gap-1">
                    <CurrencyDollar size={14} className="shrink-0" />
                    <span className="truncate">{formatCurrency(supplier.totalSpent)}</span>
                  </div>
                </div>
              </div>

              <div className="flex gap-2 pt-1 md:pt-2" onClick={(e) => e.stopPropagation()}>
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1 h-8 text-xs md:text-sm"
                  onClick={() => {
                    setEditingSupplier(supplier)
                  }}
                >
                  <PencilSimple size={14} className="mr-1" />
                  Edit
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="h-8 w-8 p-0"
                  onClick={() => handleDeleteSupplier(supplier.id)}
                >
                  <Trash size={14} />
                </Button>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {filteredAndSortedSuppliers.length === 0 && (
        <Card className="p-8 md:p-12 lg:p-16 text-center">
          <Buildings size={48} className="mx-auto text-muted-foreground mb-3 md:mb-4 md:w-16 md:h-16" />
          <h3 className="text-xl md:text-2xl font-semibold mb-2">No suppliers found</h3>
          <p className="text-sm md:text-base text-muted-foreground mb-4 md:mb-6">
            {searchTerm || selectedCategory !== 'all'
              ? 'Try adjusting your filters'
              : 'Add your first supplier to get started'}
          </p>
          {!searchTerm && selectedCategory === 'all' && (
            <Button onClick={() => setDialogOpen(true)} size="sm" className="sm:size-default">
              <Plus size={18} className="mr-2" />
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
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-full sm:max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl md:text-2xl">Supplier Details</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 md:space-y-6">
          <div>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-3 md:mb-4">
              <div className="min-w-0 flex-1">
                <h3 className="text-lg md:text-xl font-semibold truncate">{supplier.name}</h3>
                <p className="text-sm text-muted-foreground truncate">{supplier.supplierId}</p>
              </div>
              <div className="flex gap-2">
                {!supplier.isActive && <Badge variant="destructive" className="text-xs">Inactive</Badge>}
                <Button variant="outline" size="sm" onClick={onEdit}>
                  <PencilSimple size={14} className="mr-1" />
                  Edit
                </Button>
              </div>
            </div>

            <div className="flex flex-wrap gap-1.5 md:gap-2">
              {supplier.category.map(cat => (
                <Badge key={cat} variant="secondary" className="text-xs">{cat}</Badge>
              ))}
            </div>
          </div>

          <Separator />

          <div>
            <h4 className="font-semibold mb-2 md:mb-3 flex items-center gap-2 text-sm md:text-base">
              <User size={16} className="md:w-[18px] md:h-[18px]" />
              Contact Persons
            </h4>
            <div className="space-y-2 md:space-y-3">
              {(supplier.contactPersons || []).map(person => (
                <Card key={person.id} className="p-3 md:p-4">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="font-medium text-sm md:text-base truncate">{person.name}</p>
                        {person.isPrimary && <Badge variant="default" className="text-xs shrink-0">Primary</Badge>}
                      </div>
                      <p className="text-xs md:text-sm text-muted-foreground truncate">{person.role}</p>
                      <div className="mt-1.5 md:mt-2 space-y-1 text-xs md:text-sm">
                        {person.email && (
                          <div className="flex items-center gap-2 text-muted-foreground">
                            <Envelope size={12} className="shrink-0 md:w-[14px] md:h-[14px]" />
                            <span className="truncate">{person.email}</span>
                          </div>
                        )}
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <Phone size={12} className="shrink-0 md:w-[14px] md:h-[14px]" />
                          <span>{person.phone}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
              {(!supplier.contactPersons || supplier.contactPersons.length === 0) && (
                <p className="text-xs md:text-sm text-muted-foreground text-center py-3 md:py-4">
                  No contact persons added
                </p>
              )}
            </div>
          </div>

          <Separator />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
            <div>
              <h4 className="font-semibold mb-2 md:mb-3 flex items-center gap-2 text-sm md:text-base">
                <Buildings size={16} className="md:w-[18px] md:h-[18px]" />
                Company Information
              </h4>
              <div className="space-y-1.5 md:space-y-2 text-xs md:text-sm">
                {supplier.email && (
                  <div>
                    <span className="text-muted-foreground">Email:</span>
                    <p className="break-all">{supplier.email}</p>
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
                    <p className="break-all">{supplier.website}</p>
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
              <h4 className="font-semibold mb-2 md:mb-3 flex items-center gap-2 text-sm md:text-base">
                <CurrencyDollar size={16} className="md:w-[18px] md:h-[18px]" />
                Financial Information
              </h4>
              <div className="space-y-1.5 md:space-y-2 text-xs md:text-sm">
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
            <h4 className="font-semibold mb-2 md:mb-3 flex items-center gap-2 text-sm md:text-base">
              <Star size={16} className="md:w-[18px] md:h-[18px]" />
              Performance Ratings
            </h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2 md:gap-4">
              <Card className="p-3 md:p-4 text-center">
                <div className="text-muted-foreground text-xs mb-1">Overall</div>
                <div className="text-xl md:text-2xl font-semibold">{((supplier.deliveryTimeRating + supplier.costRating + supplier.qualityRating) / 3).toFixed(1)}</div>
                <div className="flex items-center justify-center gap-1 mt-1">
                  <Star size={12} className="text-accent fill-accent md:w-[14px] md:h-[14px]" />
                  <span className="text-xs text-muted-foreground">/ 5.0</span>
                </div>
              </Card>
              <Card className="p-3 md:p-4 text-center">
                <div className="text-muted-foreground text-xs mb-1">Delivery</div>
                <div className="text-xl md:text-2xl font-semibold">{supplier.deliveryTimeRating}</div>
                <div className="flex items-center justify-center gap-1 mt-1">
                  <Star size={12} className="text-accent fill-accent md:w-[14px] md:h-[14px]" />
                  <span className="text-xs text-muted-foreground">/ 5.0</span>
                </div>
              </Card>
              <Card className="p-3 md:p-4 text-center">
                <div className="text-muted-foreground text-xs mb-1">Cost</div>
                <div className="text-xl md:text-2xl font-semibold">{supplier.costRating}</div>
                <div className="flex items-center justify-center gap-1 mt-1">
                  <Star size={12} className="text-accent fill-accent md:w-[14px] md:h-[14px]" />
                  <span className="text-xs text-muted-foreground">/ 5.0</span>
                </div>
              </Card>
              <Card className="p-3 md:p-4 text-center">
                <div className="text-muted-foreground text-xs mb-1">Quality</div>
                <div className="text-xl md:text-2xl font-semibold">{supplier.qualityRating}</div>
                <div className="flex items-center justify-center gap-1 mt-1">
                  <Star size={12} className="text-accent fill-accent md:w-[14px] md:h-[14px]" />
                  <span className="text-xs text-muted-foreground">/ 5.0</span>
                </div>
              </Card>
            </div>
          </div>

          <Separator />

          <div>
            <h4 className="font-semibold mb-2 md:mb-3 flex items-center gap-2 text-sm md:text-base">
              <Package size={16} className="md:w-[18px] md:h-[18px]" />
              Order Statistics
            </h4>
            <div className="grid grid-cols-3 gap-2 md:gap-4">
              <Card className="p-3 md:p-4 text-center">
                <div className="text-muted-foreground text-xs mb-1">Total Orders</div>
                <div className="text-lg md:text-2xl font-semibold">{supplier.totalOrders}</div>
              </Card>
              <Card className="p-3 md:p-4 text-center">
                <div className="text-muted-foreground text-xs mb-1">Total Spent</div>
                <div className="text-lg md:text-2xl font-semibold break-all text-xs md:text-2xl">{formatCurrency(supplier.totalSpent)}</div>
              </Card>
              <Card className="p-3 md:p-4 text-center">
                <div className="text-muted-foreground text-xs mb-1">Delivery Days</div>
                <div className="text-lg md:text-2xl font-semibold">{supplier.deliveryTimeDays}</div>
              </Card>
            </div>
          </div>

          {supplier.notes && (
            <>
              <Separator />
              <div>
                <h4 className="font-semibold mb-2 text-sm md:text-base">Notes</h4>
                <p className="text-xs md:text-sm text-muted-foreground">{supplier.notes}</p>
              </div>
            </>
          )}

          <Separator />

          <div className="text-xs text-muted-foreground flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
            <div className="flex items-center gap-1">
              <Calendar size={12} className="md:w-[14px] md:h-[14px]" />
              <span>Created: {format(new Date(supplier.createdAt), 'MMM dd, yyyy')}</span>
            </div>
            <div className="flex items-center gap-1">
              <Calendar size={12} className="md:w-[14px] md:h-[14px]" />
              <span>Updated: {format(new Date(supplier.updatedAt), 'MMM dd, yyyy')}</span>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

