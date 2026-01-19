import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card } from '@/components/ui/card'
import { toast } from 'sonner'
import { Plus, Trash, Calendar, Clock, Tag, TrendUp, Package } from '@phosphor-icons/react'
import type { MealCombo, MenuItem, ComboDiscountType, ComboStatus, ComboAvailability, AllergenType, DietaryRestriction, TimeSlot } from '@/lib/types'
import { ulid } from 'ulid'

interface MealComboDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  combo?: MealCombo
  menuItems: MenuItem[]
  onSave: (combo: MealCombo) => void
  currentUser: { id: string; firstName: string; lastName: string }
}

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']

const ALLERGENS: AllergenType[] = ['milk', 'eggs', 'fish', 'shellfish', 'tree-nuts', 'peanuts', 'wheat', 'soybeans', 'sesame']
const DIETARY_INFO: DietaryRestriction[] = ['vegetarian', 'vegan', 'gluten-free', 'dairy-free', 'nut-free', 'halal', 'kosher']

export function MealComboDialog({ open, onOpenChange, combo, menuItems, onSave, currentUser }: MealComboDialogProps) {
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [imageUrl, setImageUrl] = useState('')
  const [discountType, setDiscountType] = useState<ComboDiscountType>('percentage')
  const [discountValue, setDiscountValue] = useState(0)
  const [comboPrice, setComboPrice] = useState(0)
  const [status, setStatus] = useState<ComboStatus>('active')
  const [availability, setAvailability] = useState<ComboAvailability>('all-day')
  const [availableDays, setAvailableDays] = useState<string[]>(DAYS)
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([])
  const [validFrom, setValidFrom] = useState<string>('')
  const [validTo, setValidTo] = useState<string>('')
  const [maxOrdersPerDay, setMaxOrdersPerDay] = useState<number | undefined>(undefined)
  const [isSpecial, setIsSpecial] = useState(false)
  const [tags, setTags] = useState<string[]>([])
  const [tagInput, setTagInput] = useState('')
  
  const [selectedItems, setSelectedItems] = useState<{
    menuItemId: string
    quantity: number
    isRequired: boolean
    allowSubstitution: boolean
  }[]>([])

  useEffect(() => {
    if (combo) {
      setName(combo.name)
      setDescription(combo.description || '')
      setImageUrl(combo.imageUrl || '')
      setDiscountType(combo.discountType)
      setDiscountValue(combo.discountValue)
      setComboPrice(combo.comboPrice)
      setStatus(combo.status)
      setAvailability(combo.availability)
      setAvailableDays(combo.availableDays || DAYS)
      setTimeSlots(combo.availableTimeSlots || [])
      setValidFrom(combo.validFrom ? new Date(combo.validFrom).toISOString().slice(0, 10) : '')
      setValidTo(combo.validTo ? new Date(combo.validTo).toISOString().slice(0, 10) : '')
      setMaxOrdersPerDay(combo.maxOrdersPerDay)
      setIsSpecial(combo.isSpecial)
      setTags(combo.tags || [])
      setSelectedItems(combo.items.map(item => ({
        menuItemId: item.menuItemId,
        quantity: item.quantity,
        isRequired: item.isRequired,
        allowSubstitution: item.allowSubstitution
      })))
    } else {
      resetForm()
    }
  }, [combo, open])

  const resetForm = () => {
    setName('')
    setDescription('')
    setImageUrl('')
    setDiscountType('percentage')
    setDiscountValue(0)
    setComboPrice(0)
    setStatus('active')
    setAvailability('all-day')
    setAvailableDays(DAYS)
    setTimeSlots([])
    setValidFrom('')
    setValidTo('')
    setMaxOrdersPerDay(undefined)
    setIsSpecial(false)
    setTags([])
    setTagInput('')
    setSelectedItems([])
  }

  const calculatePrices = () => {
    const originalPrice = selectedItems.reduce((sum, item) => {
      const menuItem = menuItems.find(m => m.id === item.menuItemId)
      return sum + (menuItem?.price || 0) * item.quantity
    }, 0)

    let calculatedComboPrice = 0
    let calculatedSavings = 0

    if (discountType === 'percentage') {
      calculatedComboPrice = originalPrice * (1 - discountValue / 100)
      calculatedSavings = originalPrice - calculatedComboPrice
    } else if (discountType === 'fixed-amount') {
      calculatedComboPrice = originalPrice - discountValue
      calculatedSavings = discountValue
    } else {
      calculatedComboPrice = comboPrice
      calculatedSavings = originalPrice - comboPrice
    }

    return {
      originalPrice,
      comboPrice: Math.max(0, calculatedComboPrice),
      savings: Math.max(0, calculatedSavings),
      savingsPercentage: originalPrice > 0 ? (calculatedSavings / originalPrice) * 100 : 0
    }
  }

  const addMenuItem = () => {
    setSelectedItems(prev => [...prev, {
      menuItemId: '',
      quantity: 1,
      isRequired: true,
      allowSubstitution: false
    }])
  }

  const removeMenuItem = (index: number) => {
    setSelectedItems(prev => prev.filter((_, i) => i !== index))
  }

  const updateMenuItem = (index: number, field: string, value: any) => {
    setSelectedItems(prev => prev.map((item, i) =>
      i === index ? { ...item, [field]: value } : item
    ))
  }

  const addTimeSlot = () => {
    setTimeSlots(prev => [...prev, { startTime: '09:00', endTime: '17:00' }])
  }

  const removeTimeSlot = (index: number) => {
    setTimeSlots(prev => prev.filter((_, i) => i !== index))
  }

  const updateTimeSlot = (index: number, field: 'startTime' | 'endTime', value: string) => {
    setTimeSlots(prev => prev.map((slot, i) =>
      i === index ? { ...slot, [field]: value } : slot
    ))
  }

  const addTag = () => {
    if (tagInput.trim() && !tags.includes(tagInput.trim())) {
      setTags(prev => [...prev, tagInput.trim()])
      setTagInput('')
    }
  }

  const removeTag = (tag: string) => {
    setTags(prev => prev.filter(t => t !== tag))
  }

  const toggleDay = (day: string) => {
    setAvailableDays(prev =>
      prev.includes(day) ? prev.filter(d => d !== day) : [...prev, day]
    )
  }

  const handleSave = () => {
    if (!name.trim()) {
      toast.error('Please enter a combo name')
      return
    }

    if (selectedItems.length === 0) {
      toast.error('Please add at least one menu item')
      return
    }

    if (selectedItems.some(item => !item.menuItemId)) {
      toast.error('Please select a menu item for all entries')
      return
    }

    const prices = calculatePrices()
    
    const allergens: AllergenType[] = []
    const dietaryInfo: DietaryRestriction[] = []
    let totalCalories = 0
    let maxPrepTime = 0

    selectedItems.forEach(item => {
      const menuItem = menuItems.find(m => m.id === item.menuItemId)
      if (menuItem) {
        if (menuItem.allergens) {
          menuItem.allergens.forEach(a => {
            if (!allergens.includes(a)) allergens.push(a)
          })
        }
        if (menuItem.dietaryInfo) {
          menuItem.dietaryInfo.forEach(d => {
            if (!dietaryInfo.includes(d)) dietaryInfo.push(d)
          })
        }
        totalCalories += (menuItem.calories || 0) * item.quantity
        maxPrepTime = Math.max(maxPrepTime, menuItem.preparationTime || 0)
      }
    })

    const comboData: MealCombo = {
      id: combo?.id || ulid(),
      name: name.trim(),
      description: description.trim() || undefined,
      imageUrl: imageUrl.trim() || undefined,
      items: selectedItems.map(item => {
        const menuItem = menuItems.find(m => m.id === item.menuItemId)!
        return {
          id: ulid(),
          menuItemId: item.menuItemId,
          menuItemName: menuItem.name,
          quantity: item.quantity,
          isRequired: item.isRequired,
          allowSubstitution: item.allowSubstitution,
          substituteOptions: [],
          price: menuItem.price,
          category: menuItem.category
        }
      }),
      originalPrice: prices.originalPrice,
      comboPrice: prices.comboPrice,
      discountType,
      discountValue,
      savings: prices.savings,
      savingsPercentage: prices.savingsPercentage,
      status,
      availability,
      availableDays: availableDays.length > 0 ? availableDays : undefined,
      availableTimeSlots: timeSlots.length > 0 ? timeSlots : undefined,
      validFrom: validFrom ? new Date(validFrom).getTime() : undefined,
      validTo: validTo ? new Date(validTo).getTime() : undefined,
      maxOrdersPerDay,
      ordersToday: combo?.ordersToday || 0,
      tags: tags.length > 0 ? tags : undefined,
      allergens: allergens.length > 0 ? allergens : undefined,
      dietaryInfo: dietaryInfo.length > 0 ? dietaryInfo : undefined,
      totalCalories: totalCalories > 0 ? totalCalories : undefined,
      preparationTime: maxPrepTime,
      isSpecial,
      sortOrder: combo?.sortOrder || 0,
      createdAt: combo?.createdAt || Date.now(),
      updatedAt: Date.now(),
      createdBy: combo?.createdBy || currentUser.id
    }

    onSave(comboData)
    onOpenChange(false)
    resetForm()
  }

  const prices = calculatePrices()

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader className="dialog-header-fixed">
          <DialogTitle className="text-2xl font-bold flex items-center gap-2">
            <Package className="text-primary" size={28} />
            {combo ? 'Edit Meal Combo' : 'Create Meal Combo'}
          </DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="basic" className="flex-1 overflow-hidden flex flex-col">
          <TabsList className="grid w-full grid-cols-4 mb-4">
            <TabsTrigger value="basic">Basic Info</TabsTrigger>
            <TabsTrigger value="items">Items ({selectedItems.length})</TabsTrigger>
            <TabsTrigger value="pricing">Pricing</TabsTrigger>
            <TabsTrigger value="availability">Availability</TabsTrigger>
          </TabsList>

          <div className="flex-1 overflow-y-auto dialog-body-scrollable">
            <TabsContent value="basic" className="space-y-4 mt-0">
              <div className="dialog-grid-2">
                <div className="dialog-form-field">
                  <Label htmlFor="name" className="dialog-form-label">Combo Name *</Label>
                  <Input
                    id="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g., Breakfast Special"
                    className="dialog-form-input"
                  />
                </div>

                <div className="dialog-form-field">
                  <Label htmlFor="status" className="dialog-form-label">Status</Label>
                  <Select value={status} onValueChange={(value: ComboStatus) => setStatus(value)}>
                    <SelectTrigger className="dialog-form-input">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="inactive">Inactive</SelectItem>
                      <SelectItem value="scheduled">Scheduled</SelectItem>
                      <SelectItem value="expired">Expired</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="dialog-form-field">
                <Label htmlFor="description" className="dialog-form-label">Description</Label>
                <Textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Describe what makes this combo special..."
                  className="dialog-form-textarea"
                  rows={3}
                />
              </div>

              <div className="dialog-form-field">
                <Label htmlFor="imageUrl" className="dialog-form-label">Image URL</Label>
                <Input
                  id="imageUrl"
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  placeholder="https://example.com/combo-image.jpg"
                  className="dialog-form-input"
                />
              </div>

              <div className="flex items-center gap-3">
                <Switch
                  id="isSpecial"
                  checked={isSpecial}
                  onCheckedChange={setIsSpecial}
                />
                <Label htmlFor="isSpecial" className="cursor-pointer">Mark as Special/Featured</Label>
              </div>

              <div className="dialog-form-field">
                <Label className="dialog-form-label flex items-center gap-2">
                  <Tag size={16} />
                  Tags
                </Label>
                <div className="flex gap-2">
                  <Input
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                    placeholder="Add tags (press Enter)"
                    className="dialog-form-input"
                  />
                  <Button type="button" onClick={addTag} variant="outline" className="dialog-button">
                    <Plus size={18} />
                  </Button>
                </div>
                {tags.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-2">
                    {tags.map(tag => (
                      <Badge key={tag} variant="secondary" className="cursor-pointer" onClick={() => removeTag(tag)}>
                        {tag} ×
                      </Badge>
                    ))}
                  </div>
                )}
              </div>
            </TabsContent>

            <TabsContent value="items" className="space-y-4 mt-0">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold">Combo Items</h3>
                <Button type="button" onClick={addMenuItem} className="dialog-button-sm">
                  <Plus size={18} className="mr-2" />
                  Add Item
                </Button>
              </div>

              {selectedItems.length === 0 ? (
                <Card className="p-8 text-center">
                  <Package size={48} className="mx-auto text-muted-foreground mb-3" />
                  <p className="text-muted-foreground mb-4">No items added yet</p>
                  <Button onClick={addMenuItem} variant="outline">
                    <Plus size={18} className="mr-2" />
                    Add First Item
                  </Button>
                </Card>
              ) : (
                <div className="space-y-3">
                  {selectedItems.map((item, index) => {
                    const menuItem = menuItems.find(m => m.id === item.menuItemId)
                    return (
                      <Card key={index} className="p-4">
                        <div className="dialog-grid-4 items-start gap-3">
                          <div className="col-span-2 dialog-form-field">
                            <Label className="dialog-form-label text-xs">Menu Item *</Label>
                            <Select
                              value={item.menuItemId}
                              onValueChange={(value) => updateMenuItem(index, 'menuItemId', value)}
                            >
                              <SelectTrigger className="dialog-form-input">
                                <SelectValue placeholder="Select item..." />
                              </SelectTrigger>
                              <SelectContent>
                                {menuItems
                                  .filter(m => m.available)
                                  .map(m => (
                                    <SelectItem key={m.id} value={m.id}>
                                      {m.name} - ${m.price.toFixed(2)}
                                    </SelectItem>
                                  ))}
                              </SelectContent>
                            </Select>
                          </div>

                          <div className="dialog-form-field">
                            <Label className="dialog-form-label text-xs">Quantity</Label>
                            <Input
                              type="number"
                              min={1}
                              value={item.quantity}
                              onChange={(e) => updateMenuItem(index, 'quantity', parseInt(e.target.value) || 1)}
                              className="dialog-form-input"
                            />
                          </div>

                          <div className="flex items-end justify-end">
                            <Button
                              type="button"
                              variant="destructive"
                              size="sm"
                              onClick={() => removeMenuItem(index)}
                              className="dialog-button-sm"
                            >
                              <Trash size={16} />
                            </Button>
                          </div>
                        </div>

                        {menuItem && (
                          <div className="mt-3 text-sm text-muted-foreground">
                            <p className="font-medium">{menuItem.category}</p>
                            {menuItem.description && <p className="text-xs mt-1">{menuItem.description}</p>}
                          </div>
                        )}

                        <div className="mt-3 flex gap-4">
                          <div className="flex items-center gap-2">
                            <Switch
                              checked={item.isRequired}
                              onCheckedChange={(checked) => updateMenuItem(index, 'isRequired', checked)}
                            />
                            <Label className="text-xs cursor-pointer">Required</Label>
                          </div>
                          <div className="flex items-center gap-2">
                            <Switch
                              checked={item.allowSubstitution}
                              onCheckedChange={(checked) => updateMenuItem(index, 'allowSubstitution', checked)}
                            />
                            <Label className="text-xs cursor-pointer">Allow Substitution</Label>
                          </div>
                        </div>
                      </Card>
                    )
                  })}
                </div>
              )}
            </TabsContent>

            <TabsContent value="pricing" className="space-y-4 mt-0">
              <Card className="p-6 bg-primary/5 border-primary/20">
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Original Price</p>
                    <p className="text-2xl font-bold">${prices.originalPrice.toFixed(2)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Combo Price</p>
                    <p className="text-2xl font-bold text-primary">${prices.comboPrice.toFixed(2)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">You Save</p>
                    <p className="text-2xl font-bold text-success">
                      ${prices.savings.toFixed(2)}
                      <span className="text-sm ml-2">({prices.savingsPercentage.toFixed(1)}%)</span>
                    </p>
                  </div>
                </div>
              </Card>

              <div className="dialog-grid-2">
                <div className="dialog-form-field">
                  <Label className="dialog-form-label">Discount Type</Label>
                  <Select value={discountType} onValueChange={(value: ComboDiscountType) => setDiscountType(value)}>
                    <SelectTrigger className="dialog-form-input">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="percentage">Percentage Discount</SelectItem>
                      <SelectItem value="fixed-amount">Fixed Amount Off</SelectItem>
                      <SelectItem value="custom-price">Custom Price</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {discountType === 'custom-price' ? (
                  <div className="dialog-form-field">
                    <Label className="dialog-form-label">Custom Combo Price</Label>
                    <Input
                      type="number"
                      min={0}
                      step={0.01}
                      value={comboPrice}
                      onChange={(e) => setComboPrice(parseFloat(e.target.value) || 0)}
                      className="dialog-form-input"
                    />
                  </div>
                ) : (
                  <div className="dialog-form-field">
                    <Label className="dialog-form-label">
                      {discountType === 'percentage' ? 'Discount Percentage (%)' : 'Discount Amount ($)'}
                    </Label>
                    <Input
                      type="number"
                      min={0}
                      step={discountType === 'percentage' ? 1 : 0.01}
                      value={discountValue}
                      onChange={(e) => setDiscountValue(parseFloat(e.target.value) || 0)}
                      className="dialog-form-input"
                    />
                  </div>
                )}
              </div>
            </TabsContent>

            <TabsContent value="availability" className="space-y-4 mt-0">
              <div className="dialog-grid-2">
                <div className="dialog-form-field">
                  <Label className="dialog-form-label flex items-center gap-2">
                    <Clock size={16} />
                    Availability
                  </Label>
                  <Select value={availability} onValueChange={(value: ComboAvailability) => setAvailability(value)}>
                    <SelectTrigger className="dialog-form-input">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all-day">All Day</SelectItem>
                      <SelectItem value="breakfast">Breakfast</SelectItem>
                      <SelectItem value="lunch">Lunch</SelectItem>
                      <SelectItem value="dinner">Dinner</SelectItem>
                      <SelectItem value="custom">Custom Time Slots</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="dialog-form-field">
                  <Label className="dialog-form-label">Max Orders Per Day</Label>
                  <Input
                    type="number"
                    min={0}
                    value={maxOrdersPerDay || ''}
                    onChange={(e) => setMaxOrdersPerDay(e.target.value ? parseInt(e.target.value) : undefined)}
                    placeholder="Unlimited"
                    className="dialog-form-input"
                  />
                </div>
              </div>

              <div className="dialog-form-field">
                <Label className="dialog-form-label">Available Days</Label>
                <div className="flex flex-wrap gap-2">
                  {DAYS.map(day => (
                    <Badge
                      key={day}
                      variant={availableDays.includes(day) ? 'default' : 'outline'}
                      className="cursor-pointer"
                      onClick={() => toggleDay(day)}
                    >
                      {day.slice(0, 3)}
                    </Badge>
                  ))}
                </div>
              </div>

              {availability === 'custom' && (
                <div className="dialog-form-field">
                  <div className="flex justify-between items-center mb-2">
                    <Label className="dialog-form-label">Time Slots</Label>
                    <Button type="button" onClick={addTimeSlot} variant="outline" size="sm" className="dialog-button-sm">
                      <Plus size={16} className="mr-2" />
                      Add Slot
                    </Button>
                  </div>
                  <div className="space-y-2">
                    {timeSlots.map((slot, index) => (
                      <div key={index} className="flex gap-2 items-center">
                        <Input
                          type="time"
                          value={slot.startTime}
                          onChange={(e) => updateTimeSlot(index, 'startTime', e.target.value)}
                          className="dialog-form-input"
                        />
                        <span className="text-muted-foreground">to</span>
                        <Input
                          type="time"
                          value={slot.endTime}
                          onChange={(e) => updateTimeSlot(index, 'endTime', e.target.value)}
                          className="dialog-form-input"
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removeTimeSlot(index)}
                        >
                          <Trash size={16} />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="dialog-grid-2">
                <div className="dialog-form-field">
                  <Label className="dialog-form-label flex items-center gap-2">
                    <Calendar size={16} />
                    Valid From
                  </Label>
                  <Input
                    type="date"
                    value={validFrom}
                    onChange={(e) => setValidFrom(e.target.value)}
                    className="dialog-form-input"
                  />
                </div>

                <div className="dialog-form-field">
                  <Label className="dialog-form-label flex items-center gap-2">
                    <Calendar size={16} />
                    Valid To
                  </Label>
                  <Input
                    type="date"
                    value={validTo}
                    onChange={(e) => setValidTo(e.target.value)}
                    className="dialog-form-input"
                  />
                </div>
              </div>
            </TabsContent>
          </div>
        </Tabs>

        <div className="dialog-footer-fixed flex justify-between items-center">
          <div className="text-sm text-muted-foreground">
            {selectedItems.length} item{selectedItems.length !== 1 ? 's' : ''} • 
            Save {prices.savingsPercentage.toFixed(1)}%
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => onOpenChange(false)} className="dialog-button">
              Cancel
            </Button>
            <Button onClick={handleSave} className="dialog-button">
              {combo ? 'Update' : 'Create'} Combo
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
