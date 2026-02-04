import { useState, useEffect } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { DialogAdapter } from '@/components/adapters/DialogAdapter'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import type { MenuItem } from '@/lib/types'

interface MenuItemDialogProps {
  menuItem?: MenuItem
  open: boolean
  onOpenChange: (open: boolean) => void
  onSave: (menuItem: MenuItem) => void
}

export function MenuItemDialog({ menuItem, open, onOpenChange, onSave }: MenuItemDialogProps) {
  const [formData, setFormData] = useState<Partial<MenuItem>>({
    name: '',
    description: '',
    category: '',
    price: 0,
    preparationTime: 0,
    available: true,
  })

  useEffect(() => {
    if (menuItem) {
      setFormData(menuItem)
    } else {
      setFormData({
        name: '',
        description: '',
        category: '',
        price: 0,
        preparationTime: 0,
        available: true,
      })
    }
  }, [menuItem, open])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    const item: MenuItem = {
      id: menuItem?.id || `menu-${Date.now()}`,
      name: formData.name || '',
      description: formData.description,
      category: formData.category || '',
      price: Number(formData.price) || 0,
      preparationTime: Number(formData.preparationTime) || 0,
      available: formData.available ?? true,
    }

    onSave(item)
  }

  return (
    <DialogAdapter 
      open={open} 
      onOpenChange={onOpenChange}
      size="lg"
      showAnimation={true}
    >
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>{menuItem ? 'Edit Menu Item' : 'Add Menu Item'}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <Label htmlFor="name">Item Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g., Margherita Pizza"
                required
              />
            </div>

            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Describe the menu item..."
                rows={3}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="category">Category *</Label>
                <Input
                  id="category"
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  placeholder="e.g., Mains, Beverages"
                  required
                />
              </div>

              <div>
                <Label htmlFor="price">Price *</Label>
                <Input
                  id="price"
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) })}
                  placeholder="0.00"
                  required
                />
              </div>
            </div>

            <div>
              <Label htmlFor="preparationTime">Preparation Time (minutes) *</Label>
              <Input
                id="preparationTime"
                type="number"
                min="0"
                value={formData.preparationTime}
                onChange={(e) => setFormData({ ...formData, preparationTime: parseInt(e.target.value) })}
                placeholder="0"
                required
              />
            </div>

            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div>
                <Label htmlFor="available" className="cursor-pointer">Available for Order</Label>
                <p className="text-sm text-muted-foreground">
                  Enable this item to be available for customers
                </p>
              </div>
              <Switch
                id="available"
                checked={formData.available}
                onCheckedChange={(checked) => setFormData({ ...formData, available: checked })}
              />
            </div>
          </div>

          <DialogFooter className="mt-6">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit">
              {menuItem ? 'Update Item' : 'Add Item'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </DialogAdapter>
  )
}
