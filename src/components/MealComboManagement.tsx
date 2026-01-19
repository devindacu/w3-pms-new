import { useState } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Plus, MagnifyingGlass, Package, Pencil, Trash, Eye, Clock, TrendUp, CalendarBlank } from '@phosphor-icons/react'
import { MealComboDialog } from '@/components/MealComboDialog'
import type { MealCombo, MenuItem } from '@/lib/types'
import { toast } from 'sonner'
import { format } from 'date-fns'

interface MealComboManagementProps {
  combos: MealCombo[]
  setCombos: (combos: MealCombo[] | ((prev: MealCombo[]) => MealCombo[])) => void
  menuItems: MenuItem[]
  currentUser: { id: string; firstName: string; lastName: string }
}

export function MealComboManagement({ combos, setCombos, menuItems, currentUser }: MealComboManagementProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [availabilityFilter, setAvailabilityFilter] = useState<string>('all')
  const [dialogOpen, setDialogOpen] = useState(false)
  const [selectedCombo, setSelectedCombo] = useState<MealCombo | undefined>(undefined)

  const filteredCombos = combos.filter(combo => {
    const matchesSearch = combo.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      combo.description?.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === 'all' || combo.status === statusFilter
    const matchesAvailability = availabilityFilter === 'all' || combo.availability === availabilityFilter
    return matchesSearch && matchesStatus && matchesAvailability
  })

  const handleCreate = () => {
    setSelectedCombo(undefined)
    setDialogOpen(true)
  }

  const handleEdit = (combo: MealCombo) => {
    setSelectedCombo(combo)
    setDialogOpen(true)
  }

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this combo?')) {
      setCombos((prev) => prev.filter(c => c.id !== id))
      toast.success('Combo deleted successfully')
    }
  }

  const handleSave = (combo: MealCombo) => {
    if (selectedCombo) {
      setCombos((prev) => prev.map(c => c.id === combo.id ? combo : c))
      toast.success('Combo updated successfully')
    } else {
      setCombos((prev) => [...prev, combo])
      toast.success('Combo created successfully')
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
      case 'inactive': return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
      case 'scheduled': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
      case 'expired': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
    }
  }

  const stats = {
    total: combos.length,
    active: combos.filter(c => c.status === 'active').length,
    totalSavings: combos.reduce((sum, c) => sum + c.savings, 0),
    avgDiscount: combos.length > 0 ? combos.reduce((sum, c) => sum + c.savingsPercentage, 0) / combos.length : 0
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-semibold flex items-center gap-2">
            <Package className="text-primary" size={28} />
            Meal Combos & Bundles
          </h2>
          <p className="text-muted-foreground mt-1">Create and manage combo packages with special pricing</p>
        </div>
        <Button onClick={handleCreate} className="mobile-optimized-button">
          <Plus size={20} className="mr-2" />
          Create Combo
        </Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-4 border-l-4 border-l-primary">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-muted-foreground">Total Combos</span>
            <Package className="text-primary" size={20} />
          </div>
          <p className="text-2xl font-bold">{stats.total}</p>
        </Card>

        <Card className="p-4 border-l-4 border-l-success">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-muted-foreground">Active Combos</span>
            <TrendUp className="text-success" size={20} />
          </div>
          <p className="text-2xl font-bold">{stats.active}</p>
        </Card>

        <Card className="p-4 border-l-4 border-l-accent">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-muted-foreground">Total Savings</span>
            <TrendUp className="text-accent" size={20} />
          </div>
          <p className="text-2xl font-bold">${stats.totalSavings.toFixed(2)}</p>
        </Card>

        <Card className="p-4 border-l-4 border-l-secondary">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-muted-foreground">Avg. Discount</span>
            <TrendUp className="text-secondary" size={20} />
          </div>
          <p className="text-2xl font-bold">{stats.avgDiscount.toFixed(1)}%</p>
        </Card>
      </div>

      <Card className="p-6">
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <MagnifyingGlass className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
              <Input
                placeholder="Search combos..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex gap-2">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-2 border rounded-md bg-background text-foreground"
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="scheduled">Scheduled</option>
                <option value="expired">Expired</option>
              </select>
              <select
                value={availabilityFilter}
                onChange={(e) => setAvailabilityFilter(e.target.value)}
                className="px-3 py-2 border rounded-md bg-background text-foreground"
              >
                <option value="all">All Times</option>
                <option value="all-day">All Day</option>
                <option value="breakfast">Breakfast</option>
                <option value="lunch">Lunch</option>
                <option value="dinner">Dinner</option>
                <option value="custom">Custom</option>
              </select>
            </div>
          </div>

          {filteredCombos.length === 0 ? (
            <div className="text-center py-12">
              <Package size={64} className="mx-auto text-muted-foreground mb-4" />
              <h3 className="text-xl font-semibold mb-2">No combos found</h3>
              <p className="text-muted-foreground mb-6">
                {searchTerm || statusFilter !== 'all' || availabilityFilter !== 'all'
                  ? 'Try adjusting your filters'
                  : 'Create your first meal combo to get started'}
              </p>
              {!searchTerm && statusFilter === 'all' && availabilityFilter === 'all' && (
                <Button onClick={handleCreate}>
                  <Plus size={18} className="mr-2" />
                  Create First Combo
                </Button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredCombos
                .sort((a, b) => b.createdAt - a.createdAt)
                .map((combo) => (
                  <Card key={combo.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                    {combo.imageUrl && (
                      <div className="h-40 overflow-hidden bg-muted">
                        <img
                          src={combo.imageUrl}
                          alt={combo.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}
                    <div className="p-4 space-y-3">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-lg truncate">{combo.name}</h3>
                          {combo.description && (
                            <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
                              {combo.description}
                            </p>
                          )}
                        </div>
                        {combo.isSpecial && (
                          <Badge variant="default" className="shrink-0">
                            Special
                          </Badge>
                        )}
                      </div>

                      <div className="flex items-center gap-2 flex-wrap">
                        <Badge className={getStatusColor(combo.status)}>
                          {combo.status}
                        </Badge>
                        <Badge variant="outline" className="flex items-center gap-1">
                          <Clock size={12} />
                          {combo.availability}
                        </Badge>
                      </div>

                      <div className="space-y-2 pt-2 border-t">
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Items:</span>
                          <span className="font-medium">{combo.items.length}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Original:</span>
                          <span className="line-through">${combo.originalPrice.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="font-semibold text-primary">Combo Price:</span>
                          <span className="font-bold text-primary text-lg">${combo.comboPrice.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between items-center bg-success/10 -mx-2 px-2 py-1 rounded">
                          <span className="text-success font-semibold text-sm">You Save:</span>
                          <span className="text-success font-bold">
                            ${combo.savings.toFixed(2)} ({combo.savingsPercentage.toFixed(1)}%)
                          </span>
                        </div>
                      </div>

                      {(combo.validFrom || combo.validTo) && (
                        <div className="flex items-center gap-2 text-xs text-muted-foreground pt-2 border-t">
                          <CalendarBlank size={14} />
                          {combo.validFrom && <span>From {format(combo.validFrom, 'MMM dd')}</span>}
                          {combo.validTo && <span>To {format(combo.validTo, 'MMM dd')}</span>}
                        </div>
                      )}

                      <div className="flex gap-2 pt-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEdit(combo)}
                          className="flex-1"
                        >
                          <Pencil size={16} className="mr-1" />
                          Edit
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDelete(combo.id)}
                          className="text-destructive hover:bg-destructive hover:text-destructive-foreground"
                        >
                          <Trash size={16} />
                        </Button>
                      </div>
                    </div>
                  </Card>
                ))}
            </div>
          )}
        </div>
      </Card>

      <MealComboDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        combo={selectedCombo}
        menuItems={menuItems}
        onSave={handleSave}
        currentUser={currentUser}
      />
    </div>
  )
}
