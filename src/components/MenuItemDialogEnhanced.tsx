import { useState, useEffect, useRef } from 'react'
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
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import type { MenuItem, MenuItemCategory, AllergenType, DietaryRestriction } from '@/lib/types'
import { 
  Upload, 
  Image as ImageIcon, 
  X, 
  Flame,
  Check,
  Tag
} from '@phosphor-icons/react'
import { toast } from 'sonner'

interface MenuItemDialogEnhancedProps {
  menuItem?: MenuItem
  categories: MenuItemCategory[]
  open: boolean
  onOpenChange: (open: boolean) => void
  onSave: (menuItem: MenuItem) => void
}

const ALLERGEN_OPTIONS: AllergenType[] = [
  'milk', 'eggs', 'fish', 'shellfish', 'tree-nuts', 
  'peanuts', 'wheat', 'soybeans', 'sesame'
]

const DIETARY_OPTIONS: DietaryRestriction[] = [
  'vegetarian', 'vegan', 'gluten-free', 'dairy-free', 
  'nut-free', 'halal', 'kosher'
]

const SPICE_LEVELS = [
  { value: 'mild', label: 'Mild', icon: 1 },
  { value: 'medium', label: 'Medium', icon: 2 },
  { value: 'hot', label: 'Hot', icon: 3 },
  { value: 'extra-hot', label: 'Extra Hot', icon: 4 },
]

export function MenuItemDialogEnhanced({ 
  menuItem, 
  categories, 
  open, 
  onOpenChange, 
  onSave 
}: MenuItemDialogEnhancedProps) {
  const [formData, setFormData] = useState<Partial<MenuItem>>({
    name: '',
    description: '',
    category: '',
    categoryId: '',
    price: 0,
    preparationTime: 0,
    available: true,
    images: [],
    tags: [],
    allergens: [],
    dietaryInfo: [],
    spiceLevel: undefined,
    isSpecial: false,
    discountPercentage: 0,
    calories: undefined,
    servingSize: '',
    sortOrder: 0,
  })

  const [selectedImages, setSelectedImages] = useState<string[]>([])
  const [currentTag, setCurrentTag] = useState('')
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (menuItem) {
      setFormData(menuItem)
      setSelectedImages(menuItem.images || [menuItem.imageUrl].filter(Boolean) as string[])
    } else {
      setFormData({
        name: '',
        description: '',
        category: '',
        categoryId: '',
        price: 0,
        preparationTime: 0,
        available: true,
        images: [],
        tags: [],
        allergens: [],
        dietaryInfo: [],
        spiceLevel: undefined,
        isSpecial: false,
        discountPercentage: 0,
        calories: undefined,
        servingSize: '',
        sortOrder: 0,
      })
      setSelectedImages([])
    }
  }, [menuItem, open])

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files || files.length === 0) return

    Array.from(files).forEach((file) => {
      if (file.type.startsWith('image/')) {
        const reader = new FileReader()
        reader.onload = (event) => {
          const imageUrl = event.target?.result as string
          setSelectedImages((prev) => [...prev, imageUrl])
        }
        reader.readAsDataURL(file)
      } else {
        toast.error('Please select only image files')
      }
    })

    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const removeImage = (index: number) => {
    setSelectedImages((prev) => prev.filter((_, i) => i !== index))
  }

  const handleAddTag = () => {
    if (currentTag.trim() && !(formData.tags || []).includes(currentTag.trim())) {
      setFormData({
        ...formData,
        tags: [...(formData.tags || []), currentTag.trim()]
      })
      setCurrentTag('')
    }
  }

  const removeTag = (tag: string) => {
    setFormData({
      ...formData,
      tags: (formData.tags || []).filter(t => t !== tag)
    })
  }

  const toggleAllergen = (allergen: AllergenType) => {
    const current = formData.allergens || []
    if (current.includes(allergen)) {
      setFormData({
        ...formData,
        allergens: current.filter(a => a !== allergen)
      })
    } else {
      setFormData({
        ...formData,
        allergens: [...current, allergen]
      })
    }
  }

  const toggleDietary = (dietary: DietaryRestriction) => {
    const current = formData.dietaryInfo || []
    if (current.includes(dietary)) {
      setFormData({
        ...formData,
        dietaryInfo: current.filter(d => d !== dietary)
      })
    } else {
      setFormData({
        ...formData,
        dietaryInfo: [...current, dietary]
      })
    }
  }

  const handleCategoryChange = (categoryId: string) => {
    const category = categories.find(c => c.id === categoryId)
    setFormData({
      ...formData,
      categoryId,
      category: category?.name || ''
    })
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    const item: MenuItem = {
      id: menuItem?.id || `menu-${Date.now()}`,
      name: formData.name || '',
      description: formData.description,
      category: formData.category || '',
      categoryId: formData.categoryId,
      price: Number(formData.price) || 0,
      preparationTime: Number(formData.preparationTime) || 0,
      available: formData.available ?? true,
      imageUrl: selectedImages[0],
      images: selectedImages,
      tags: formData.tags || [],
      allergens: formData.allergens || [],
      dietaryInfo: formData.dietaryInfo || [],
      spiceLevel: formData.spiceLevel,
      isSpecial: formData.isSpecial || false,
      discountPercentage: Number(formData.discountPercentage) || 0,
      calories: formData.calories ? Number(formData.calories) : undefined,
      servingSize: formData.servingSize,
      sortOrder: Number(formData.sortOrder) || 0,
      createdAt: menuItem?.createdAt || Date.now(),
      updatedAt: Date.now(),
    }

    onSave(item)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{menuItem ? 'Edit Menu Item' : 'Add Menu Item'}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <Tabs defaultValue="basic" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="basic">Basic Info</TabsTrigger>
              <TabsTrigger value="images">Images & Media</TabsTrigger>
              <TabsTrigger value="details">Details & Properties</TabsTrigger>
            </TabsList>

            <TabsContent value="basic" className="space-y-4">
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
                  <Select
                    value={formData.categoryId}
                    onValueChange={handleCategoryChange}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.filter(c => c.isActive).map((cat) => (
                        <SelectItem key={cat.id} value={cat.id}>
                          {cat.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
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

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="preparationTime">Prep Time (minutes) *</Label>
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
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <Label htmlFor="available" className="cursor-pointer">Available</Label>
                    <p className="text-xs text-muted-foreground">
                      Ready to order
                    </p>
                  </div>
                  <Switch
                    id="available"
                    checked={formData.available}
                    onCheckedChange={(checked) => setFormData({ ...formData, available: checked })}
                  />
                </div>

                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <Label htmlFor="isSpecial" className="cursor-pointer">Special Item</Label>
                    <p className="text-xs text-muted-foreground">
                      Featured/Chef's special
                    </p>
                  </div>
                  <Switch
                    id="isSpecial"
                    checked={formData.isSpecial}
                    onCheckedChange={(checked) => setFormData({ ...formData, isSpecial: checked })}
                  />
                </div>
              </div>

              {formData.isSpecial && (
                <div>
                  <Label htmlFor="discount">Discount Percentage</Label>
                  <Input
                    id="discount"
                    type="number"
                    min="0"
                    max="100"
                    step="1"
                    value={formData.discountPercentage}
                    onChange={(e) => setFormData({ ...formData, discountPercentage: parseFloat(e.target.value) })}
                    placeholder="0"
                  />
                </div>
              )}
            </TabsContent>

            <TabsContent value="images" className="space-y-4">
              <div>
                <Label>Menu Item Images</Label>
                <div className="mt-2">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleImageUpload}
                    className="hidden"
                    id="image-upload"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full"
                  >
                    <Upload size={20} className="mr-2" />
                    Upload Images
                  </Button>
                  <p className="text-xs text-muted-foreground mt-2">
                    Upload multiple images. First image will be the primary image.
                  </p>
                </div>
              </div>

              {selectedImages.length > 0 && (
                <div className="grid grid-cols-3 gap-4">
                  {selectedImages.map((img, index) => (
                    <div key={index} className="relative group">
                      <img
                        src={img}
                        alt={`Item ${index + 1}`}
                        className="w-full h-32 object-cover rounded-lg border"
                      />
                      {index === 0 && (
                        <Badge className="absolute top-2 left-2 bg-primary">Primary</Badge>
                      )}
                      <Button
                        type="button"
                        variant="destructive"
                        size="icon"
                        className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={() => removeImage(index)}
                      >
                        <X size={16} />
                      </Button>
                    </div>
                  ))}
                </div>
              )}

              {selectedImages.length === 0 && (
                <div className="border-2 border-dashed rounded-lg p-12 text-center">
                  <ImageIcon size={48} className="mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">No images uploaded yet</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Click the upload button above to add images
                  </p>
                </div>
              )}

              <div>
                <Label htmlFor="tags">Tags</Label>
                <div className="flex gap-2 mt-2">
                  <Input
                    id="tags"
                    value={currentTag}
                    onChange={(e) => setCurrentTag(e.target.value)}
                    placeholder="e.g., Popular, New, Seasonal"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault()
                        handleAddTag()
                      }
                    }}
                  />
                  <Button type="button" onClick={handleAddTag} variant="outline">
                    <Tag size={16} className="mr-2" />
                    Add
                  </Button>
                </div>
                {(formData.tags || []).length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-3">
                    {(formData.tags || []).map((tag) => (
                      <Badge key={tag} variant="secondary" className="gap-2">
                        {tag}
                        <X 
                          size={14} 
                          className="cursor-pointer hover:text-destructive" 
                          onClick={() => removeTag(tag)}
                        />
                      </Badge>
                    ))}
                  </div>
                )}
              </div>
            </TabsContent>

            <TabsContent value="details" className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="calories">Calories</Label>
                  <Input
                    id="calories"
                    type="number"
                    min="0"
                    value={formData.calories || ''}
                    onChange={(e) => setFormData({ ...formData, calories: e.target.value ? parseInt(e.target.value) : undefined })}
                    placeholder="e.g., 450"
                  />
                </div>

                <div>
                  <Label htmlFor="servingSize">Serving Size</Label>
                  <Input
                    id="servingSize"
                    value={formData.servingSize}
                    onChange={(e) => setFormData({ ...formData, servingSize: e.target.value })}
                    placeholder="e.g., 300g, 1 plate"
                  />
                </div>
              </div>

              <div>
                <Label>Spice Level</Label>
                <div className="grid grid-cols-4 gap-2 mt-2">
                  {SPICE_LEVELS.map((level) => (
                    <button
                      key={level.value}
                      type="button"
                      onClick={() => setFormData({ ...formData, spiceLevel: level.value as any })}
                      className={`p-3 border rounded-lg flex flex-col items-center gap-2 transition-all ${
                        formData.spiceLevel === level.value
                          ? 'border-primary bg-primary/10 scale-105'
                          : 'border-border hover:border-primary/50'
                      }`}
                    >
                      <div className="flex gap-1">
                        {Array.from({ length: level.icon }).map((_, i) => (
                          <Flame
                            key={i}
                            size={16}
                            weight="fill"
                            className={formData.spiceLevel === level.value ? 'text-orange-500' : 'text-muted-foreground'}
                          />
                        ))}
                      </div>
                      <span className="text-xs">{level.label}</span>
                    </button>
                  ))}
                </div>
                {formData.spiceLevel && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => setFormData({ ...formData, spiceLevel: undefined })}
                    className="mt-2"
                  >
                    Clear
                  </Button>
                )}
              </div>

              <div>
                <Label>Allergens</Label>
                <div className="grid grid-cols-3 gap-2 mt-2">
                  {ALLERGEN_OPTIONS.map((allergen) => (
                    <button
                      key={allergen}
                      type="button"
                      onClick={() => toggleAllergen(allergen)}
                      className={`p-2 border rounded-lg text-sm transition-all ${
                        (formData.allergens || []).includes(allergen)
                          ? 'border-primary bg-primary/10'
                          : 'border-border hover:border-primary/50'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="capitalize">{allergen.replace('-', ' ')}</span>
                        {(formData.allergens || []).includes(allergen) && (
                          <Check size={16} className="text-primary" />
                        )}
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <Label>Dietary Information</Label>
                <div className="grid grid-cols-3 gap-2 mt-2">
                  {DIETARY_OPTIONS.map((dietary) => (
                    <button
                      key={dietary}
                      type="button"
                      onClick={() => toggleDietary(dietary)}
                      className={`p-2 border rounded-lg text-sm transition-all ${
                        (formData.dietaryInfo || []).includes(dietary)
                          ? 'border-primary bg-primary/10'
                          : 'border-border hover:border-primary/50'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="capitalize">{dietary.replace('-', ' ')}</span>
                        {(formData.dietaryInfo || []).includes(dietary) && (
                          <Check size={16} className="text-primary" />
                        )}
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </TabsContent>
          </Tabs>

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
    </Dialog>
  )
}
