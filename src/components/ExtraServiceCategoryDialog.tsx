import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { toast } from 'sonner'
import type { ExtraServiceCategory } from '@/lib/types'
import { ulid } from 'ulid'

interface ExtraServiceCategoryDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  category: ExtraServiceCategory | null
  onSave: (category: ExtraServiceCategory) => void
  existingCategories: ExtraServiceCategory[]
}

export function ExtraServiceCategoryDialog({
  open,
  onOpenChange,
  category,
  onSave,
  existingCategories
}: ExtraServiceCategoryDialogProps) {
  const [formData, setFormData] = useState<Partial<ExtraServiceCategory>>({})

  useEffect(() => {
    if (category) {
      setFormData(category)
    } else {
      setFormData({
        isActive: true,
        sortOrder: existingCategories.length + 1
      })
    }
  }, [category, open, existingCategories.length])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.name?.trim()) {
      toast.error('Category name is required')
      return
    }

    const categoryData: ExtraServiceCategory = {
      id: category?.id || ulid(),
      name: formData.name.trim(),
      description: formData.description?.trim(),
      icon: formData.icon?.trim(),
      sortOrder: formData.sortOrder || existingCategories.length + 1,
      isActive: formData.isActive ?? true,
      createdAt: category?.createdAt || Date.now(),
      updatedAt: Date.now()
    }

    onSave(categoryData)
    toast.success(category ? 'Category updated' : 'Category created')
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{category ? 'Edit' : 'Create'} Service Category</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="category-name">Category Name</Label>
            <Input
              id="category-name"
              value={formData.name || ''}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="e.g., Spa Services, Laundry, Transportation"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="category-description">Description</Label>
            <Textarea
              id="category-description"
              value={formData.description || ''}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Brief description of this category"
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="category-sort-order">Sort Order</Label>
            <Input
              id="category-sort-order"
              type="number"
              min="1"
              value={formData.sortOrder || ''}
              onChange={(e) => setFormData({ ...formData, sortOrder: parseInt(e.target.value) || 1 })}
            />
          </div>

          <div className="flex items-center justify-between">
            <Label htmlFor="category-active">Active Status</Label>
            <Switch
              id="category-active"
              checked={formData.isActive ?? true}
              onCheckedChange={(checked) => setFormData({ ...formData, isActive: checked })}
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit">
              {category ? 'Update' : 'Create'} Category
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
