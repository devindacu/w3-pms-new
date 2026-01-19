import { useState, useEffect } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import type { MenuItemCategory } from '@/lib/types'
import { 
  ForkKnife, 
  Coffee, 
  Hamburger, 
  Pizza, 
  Wine, 
  Cookie, 
  IceCream, 
  Martini,
  Fish,
  Cake
} from '@phosphor-icons/react'

interface MenuCategoryDialogProps {
  category?: MenuItemCategory
  open: boolean
  onOpenChange: (open: boolean) => void
  onSave: (category: MenuItemCategory) => void
}

const ICON_OPTIONS = [
  { value: 'ForkKnife', label: 'Fork & Knife', icon: ForkKnife },
  { value: 'Coffee', label: 'Coffee', icon: Coffee },
  { value: 'Hamburger', label: 'Burger', icon: Hamburger },
  { value: 'Pizza', label: 'Pizza', icon: Pizza },
  { value: 'Wine', label: 'Wine', icon: Wine },
  { value: 'Cookie', label: 'Dessert', icon: Cookie },
  { value: 'IceCream', label: 'Ice Cream', icon: IceCream },
  { value: 'Martini', label: 'Cocktail', icon: Martini },
  { value: 'Cake', label: 'Cake', icon: Cake },
  { value: 'Fish', label: 'Seafood', icon: Fish },
]

const COLOR_OPTIONS = [
  { value: '#ef4444', label: 'Red' },
  { value: '#f97316', label: 'Orange' },
  { value: '#eab308', label: 'Yellow' },
  { value: '#22c55e', label: 'Green' },
  { value: '#3b82f6', label: 'Blue' },
  { value: '#a855f7', label: 'Purple' },
  { value: '#ec4899', label: 'Pink' },
  { value: '#64748b', label: 'Gray' },
]

export function MenuCategoryDialog({ category, open, onOpenChange, onSave }: MenuCategoryDialogProps) {
  const [formData, setFormData] = useState<Partial<MenuItemCategory>>({
    name: '',
    description: '',
    icon: 'ForkKnife',
    color: '#3b82f6',
    sortOrder: 0,
    isActive: true,
  })

  useEffect(() => {
    if (category) {
      setFormData(category)
    } else {
      setFormData({
        name: '',
        description: '',
        icon: 'ForkKnife',
        color: '#3b82f6',
        sortOrder: 0,
        isActive: true,
      })
    }
  }, [category, open])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    const newCategory: MenuItemCategory = {
      id: category?.id || `cat-${Date.now()}`,
      name: formData.name || '',
      description: formData.description,
      icon: formData.icon || 'ForkKnife',
      color: formData.color || '#3b82f6',
      sortOrder: Number(formData.sortOrder) || 0,
      isActive: formData.isActive ?? true,
      createdAt: category?.createdAt || Date.now(),
      updatedAt: Date.now(),
    }

    onSave(newCategory)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>{category ? 'Edit Category' : 'Add Category'}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <Label htmlFor="name">Category Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g., Appetizers, Main Course, Desserts"
                required
              />
            </div>

            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Describe this category..."
                rows={2}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Icon</Label>
                <div className="grid grid-cols-5 gap-2 mt-2">
                  {ICON_OPTIONS.map((option) => {
                    const Icon = option.icon
                    return (
                      <button
                        key={option.value}
                        type="button"
                        onClick={() => setFormData({ ...formData, icon: option.value })}
                        className={`p-3 border rounded-lg flex items-center justify-center transition-all ${
                          formData.icon === option.value
                            ? 'border-primary bg-primary/10 scale-110'
                            : 'border-border hover:border-primary/50'
                        }`}
                        title={option.label}
                      >
                        <Icon size={24} />
                      </button>
                    )
                  })}
                </div>
              </div>

              <div>
                <Label>Color</Label>
                <div className="grid grid-cols-4 gap-2 mt-2">
                  {COLOR_OPTIONS.map((option) => (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => setFormData({ ...formData, color: option.value })}
                      className={`h-10 rounded-lg border-2 transition-all ${
                        formData.color === option.value
                          ? 'border-foreground scale-110'
                          : 'border-transparent hover:scale-105'
                      }`}
                      style={{ backgroundColor: option.value }}
                      title={option.label}
                    />
                  ))}
                </div>
              </div>
            </div>

            <div>
              <Label htmlFor="sortOrder">Sort Order</Label>
              <Input
                id="sortOrder"
                type="number"
                min="0"
                value={formData.sortOrder}
                onChange={(e) => setFormData({ ...formData, sortOrder: parseInt(e.target.value) })}
                placeholder="0"
              />
              <p className="text-xs text-muted-foreground mt-1">
                Lower numbers appear first
              </p>
            </div>

            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div>
                <Label htmlFor="isActive" className="cursor-pointer">Active</Label>
                <p className="text-sm text-muted-foreground">
                  Show this category in the menu
                </p>
              </div>
              <Switch
                id="isActive"
                checked={formData.isActive}
                onCheckedChange={(checked) => setFormData({ ...formData, isActive: checked })}
              />
            </div>
          </div>

          <DialogFooter className="mt-6">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit">
              {category ? 'Update Category' : 'Add Category'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
