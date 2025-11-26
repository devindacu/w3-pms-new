import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Plus, Trash, FloppyDisk } from '@phosphor-icons/react'
import { toast } from 'sonner'
import { type Menu, type MenuRecipeItem, type Recipe, type MenuType } from '@/lib/types'
import { formatCurrency } from '@/lib/helpers'

interface MenuDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  menu?: Menu
  menus: Menu[]
  setMenus: (menus: Menu[]) => void
  recipes: Recipe[]
}

export function MenuDialog({ open, onOpenChange, menu, menus, setMenus, recipes }: MenuDialogProps) {
  const [formData, setFormData] = useState<Partial<Menu>>({
    name: '',
    menuCode: '',
    description: '',
    type: 'a-la-carte',
    category: '',
    items: [],
    isActive: true
  })

  useEffect(() => {
    if (menu) {
      setFormData(menu)
    } else {
      const menuNumber = (menus.length + 1).toString().padStart(4, '0')
      setFormData(prev => ({
        ...prev,
        menuCode: `MNU-${menuNumber}`
      }))
    }
  }, [menu, menus.length])

  const addMenuItem = () => {
    const newItem: MenuRecipeItem = {
      id: crypto.randomUUID(),
      recipeId: '',
      recipeName: '',
      displayOrder: (formData.items?.length || 0) + 1,
      price: 0,
      isAvailable: true,
      soldToday: 0
    }
    setFormData(prev => ({
      ...prev,
      items: [...(prev.items || []), newItem]
    }))
  }

  const updateMenuItem = (id: string, field: keyof MenuRecipeItem, value: any) => {
    setFormData(prev => ({
      ...prev,
      items: prev.items?.map(item => {
        if (item.id === id) {
          const updated = { ...item, [field]: value }
          if (field === 'recipeId' && value) {
            const recipe = recipes.find(r => r.id === value)
            if (recipe) {
              updated.recipeName = recipe.name
              updated.price = recipe.sellingPrice || recipe.costPerPortion * 3
            }
          }
          return updated
        }
        return item
      })
    }))
  }

  const removeMenuItem = (id: string) => {
    setFormData(prev => ({
      ...prev,
      items: prev.items?.filter(item => item.id !== id).map((item, index) => ({
        ...item,
        displayOrder: index + 1
      }))
    }))
  }

  const moveMenuItem = (id: string, direction: 'up' | 'down') => {
    const items = formData.items || []
    const index = items.findIndex(item => item.id === id)
    if (index === -1) return
    
    const newIndex = direction === 'up' ? index - 1 : index + 1
    if (newIndex < 0 || newIndex >= items.length) return

    const newItems = [...items]
    const temp = newItems[index]
    newItems[index] = newItems[newIndex]
    newItems[newIndex] = temp

    setFormData(prev => ({
      ...prev,
      items: newItems.map((item, idx) => ({ ...item, displayOrder: idx + 1 }))
    }))
  }

  const handleSave = () => {
    if (!formData.name || !formData.menuCode) {
      toast.error('Please fill in required fields')
      return
    }

    const now = Date.now()
    const menuData: Menu = {
      id: menu?.id || crypto.randomUUID(),
      menuCode: formData.menuCode!,
      name: formData.name!,
      description: formData.description || '',
      type: formData.type as MenuType,
      category: formData.category || '',
      items: formData.items || [],
      startDate: formData.startDate,
      endDate: formData.endDate,
      daysAvailable: formData.daysAvailable,
      timeSlotsAvailable: formData.timeSlotsAvailable,
      isActive: formData.isActive ?? true,
      pricing: formData.pricing,
      notes: formData.notes || '',
      createdBy: 'Current User',
      createdAt: menu?.createdAt || now,
      updatedAt: now
    }

    if (menu) {
      setMenus(menus.map(m => m.id === menu.id ? menuData : m))
      toast.success('Menu updated successfully')
    } else {
      setMenus([...menus, menuData])
      toast.success('Menu created successfully')
    }

    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle>{menu ? 'Edit Menu' : 'Create Menu'}</DialogTitle>
        </DialogHeader>

        <ScrollArea className="max-h-[calc(90vh-150px)] pr-4">
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="menuCode">Menu Code*</Label>
                <Input
                  id="menuCode"
                  value={formData.menuCode}
                  onChange={(e) => setFormData({ ...formData, menuCode: e.target.value })}
                  placeholder="MNU-0001"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="name">Menu Name*</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Breakfast Menu"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Describe the menu..."
                rows={2}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="type">Menu Type</Label>
                <Select
                  value={formData.type}
                  onValueChange={(value: MenuType) => setFormData({ ...formData, type: value })}
                >
                  <SelectTrigger id="type">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="breakfast">Breakfast</SelectItem>
                    <SelectItem value="lunch">Lunch</SelectItem>
                    <SelectItem value="dinner">Dinner</SelectItem>
                    <SelectItem value="buffet">Buffet</SelectItem>
                    <SelectItem value="a-la-carte">A la Carte</SelectItem>
                    <SelectItem value="banquet">Banquet</SelectItem>
                    <SelectItem value="staff-meal">Staff Meal</SelectItem>
                    <SelectItem value="seasonal">Seasonal</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="category">Category</Label>
                <Input
                  id="category"
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  placeholder="e.g., Continental, Asian"
                />
              </div>
            </div>

            {(formData.type === 'buffet' || formData.type === 'banquet') && (
              <Card className="p-4 space-y-4">
                <h4 className="font-medium">Buffet/Banquet Pricing</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="adultPrice">Adult Price</Label>
                    <Input
                      id="adultPrice"
                      type="number"
                      step="0.01"
                      value={formData.pricing?.adultPrice || ''}
                      onChange={(e) => setFormData({
                        ...formData,
                        pricing: {
                          ...formData.pricing,
                          adultPrice: parseFloat(e.target.value) || 0
                        }
                      })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="childPrice">Child Price</Label>
                    <Input
                      id="childPrice"
                      type="number"
                      step="0.01"
                      value={formData.pricing?.childPrice || ''}
                      onChange={(e) => setFormData({
                        ...formData,
                        pricing: {
                          ...formData.pricing,
                          childPrice: parseFloat(e.target.value) || 0
                        }
                      })}
                    />
                  </div>
                </div>
              </Card>
            )}

            <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
              <Label htmlFor="isActive">Menu Active</Label>
              <Switch
                id="isActive"
                checked={formData.isActive}
                onCheckedChange={(checked) => setFormData({ ...formData, isActive: checked })}
              />
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-medium">Menu Items</h3>
                <Button onClick={addMenuItem} size="sm">
                  <Plus size={16} className="mr-2" />
                  Add Item
                </Button>
              </div>

              {formData.items && formData.items.length > 0 ? (
                <div className="space-y-3">
                  {formData.items.map((item, index) => (
                    <Card key={item.id} className="p-4">
                      <div className="space-y-3">
                        <div className="flex items-center gap-3">
                          <div className="flex flex-col gap-1">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-6 w-6"
                              disabled={index === 0}
                              onClick={() => moveMenuItem(item.id, 'up')}
                            >
                              ↑
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-6 w-6"
                              disabled={index === formData.items!.length - 1}
                              onClick={() => moveMenuItem(item.id, 'down')}
                            >
                              ↓
                            </Button>
                          </div>

                          <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-semibold text-sm">
                            {item.displayOrder}
                          </div>

                          <div className="flex-1 grid grid-cols-12 gap-3">
                            <div className="col-span-5">
                              <Label className="text-xs">Recipe</Label>
                              <Select
                                value={item.recipeId}
                                onValueChange={(value) => updateMenuItem(item.id, 'recipeId', value)}
                              >
                                <SelectTrigger>
                                  <SelectValue placeholder="Select recipe" />
                                </SelectTrigger>
                                <SelectContent>
                                  {recipes.filter(r => r.isActive).map((recipe) => (
                                    <SelectItem key={recipe.id} value={recipe.id}>
                                      {recipe.name}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>
                            <div className="col-span-3">
                              <Label className="text-xs">Price</Label>
                              <Input
                                type="number"
                                step="0.01"
                                value={item.price}
                                onChange={(e) => updateMenuItem(item.id, 'price', parseFloat(e.target.value) || 0)}
                              />
                            </div>
                            <div className="col-span-3">
                              <Label className="text-xs">Max Daily Qty</Label>
                              <Input
                                type="number"
                                value={item.maxDailyQuantity || ''}
                                onChange={(e) => updateMenuItem(item.id, 'maxDailyQuantity', parseInt(e.target.value) || undefined)}
                                placeholder="Optional"
                              />
                            </div>
                            <div className="col-span-1 flex items-end">
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => removeMenuItem(item.id)}
                              >
                                <Trash size={16} className="text-destructive" />
                              </Button>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-4 ml-20">
                          <div className="flex items-center gap-2">
                            <Switch
                              checked={item.isAvailable}
                              onCheckedChange={(checked) => updateMenuItem(item.id, 'isAvailable', checked)}
                            />
                            <Label className="text-xs">Available</Label>
                          </div>
                          {item.recipeId && (
                            <div className="text-xs text-muted-foreground">
                              {(() => {
                                const recipe = recipes.find(r => r.id === item.recipeId)
                                if (!recipe) return null
                                const profit = item.price - recipe.costPerPortion
                                const margin = (profit / item.price) * 100
                                return (
                                  <span>
                                    Cost: {formatCurrency(recipe.costPerPortion)} | 
                                    Profit: {formatCurrency(profit)} ({margin.toFixed(1)}%)
                                  </span>
                                )
                              })()}
                            </div>
                          )}
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              ) : (
                <Card className="p-8 text-center">
                  <p className="text-muted-foreground">No menu items added yet</p>
                </Card>
              )}
            </div>
          </div>
        </ScrollArea>

        <div className="flex justify-end gap-3 pt-4 border-t">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave}>
            <FloppyDisk size={20} className="mr-2" />
            Save Menu
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
