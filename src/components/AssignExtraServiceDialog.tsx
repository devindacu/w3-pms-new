import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { toast } from 'sonner'
import type { FolioExtraService, ExtraService, ExtraServiceCategory } from '@/lib/types'
import { ulid } from 'ulid'
import { formatCurrency } from '@/lib/helpers'

interface AssignExtraServiceDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  folioId: string
  services: ExtraService[]
  categories: ExtraServiceCategory[]
  onSave: (folioService: FolioExtraService) => void
  currentUser: { id: string; firstName: string; lastName: string }
}

export function AssignExtraServiceDialog({
  open,
  onOpenChange,
  folioId,
  services,
  categories,
  onSave,
  currentUser
}: AssignExtraServiceDialogProps) {
  const [selectedServiceId, setSelectedServiceId] = useState<string>('')
  const [selectedService, setSelectedService] = useState<ExtraService | null>(null)
  const [quantity, setQuantity] = useState<number>(1)
  const [comments, setComments] = useState<string>('')

  useEffect(() => {
    if (selectedServiceId) {
      const service = services.find(s => s.id === selectedServiceId)
      setSelectedService(service || null)
    } else {
      setSelectedService(null)
    }
  }, [selectedServiceId, services])

  useEffect(() => {
    if (!open) {
      setSelectedServiceId('')
      setSelectedService(null)
      setQuantity(1)
      setComments('')
    }
  }, [open])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!selectedService) {
      toast.error('Please select a service')
      return
    }

    if (quantity <= 0) {
      toast.error('Quantity must be greater than 0')
      return
    }

    if (selectedService.maxQuantity && quantity > selectedService.maxQuantity) {
      toast.error(`Maximum quantity for this service is ${selectedService.maxQuantity}`)
      return
    }

    const category = categories.find(c => c.id === selectedService.categoryId)
    const subtotal = selectedService.basePrice * quantity
    const taxAmount = (subtotal * selectedService.taxRate) / 100
    const totalAmount = subtotal + taxAmount

    const folioService: FolioExtraService = {
      id: ulid(),
      folioId,
      serviceId: selectedService.id,
      serviceName: selectedService.name,
      categoryName: category?.name || 'Uncategorized',
      quantity,
      unitPrice: selectedService.basePrice,
      taxRate: selectedService.taxRate,
      taxAmount,
      totalAmount,
      comments: comments.trim() || undefined,
      postedBy: currentUser.id,
      postedAt: Date.now()
    }

    onSave(folioService)
    toast.success('Extra service added to bill')
    onOpenChange(false)
  }

  const getCategoryServices = (categoryId: string) => {
    return services.filter(s => s.categoryId === categoryId && s.status === 'active')
  }

  const calculateTotal = () => {
    if (!selectedService) return 0
    const subtotal = selectedService.basePrice * quantity
    const tax = (subtotal * selectedService.taxRate) / 100
    return subtotal + tax
  }

  const calculateSubtotal = () => {
    if (!selectedService) return 0
    return selectedService.basePrice * quantity
  }

  const calculateTax = () => {
    if (!selectedService) return 0
    const subtotal = selectedService.basePrice * quantity
    return (subtotal * selectedService.taxRate) / 100
  }

  const activeCategories = categories.filter(c => c.isActive).sort((a, b) => a.sortOrder - b.sortOrder)

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Add Extra Service to Bill</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="service-select">Select Service</Label>
            <Select
              value={selectedServiceId}
              onValueChange={setSelectedServiceId}
            >
              <SelectTrigger id="service-select">
                <SelectValue placeholder="Choose a service" />
              </SelectTrigger>
              <SelectContent>
                {activeCategories.map((category) => {
                  const categoryServices = getCategoryServices(category.id)
                  if (categoryServices.length === 0) return null

                  return (
                    <div key={category.id}>
                      <div className="px-2 py-1.5 text-sm font-semibold text-muted-foreground">
                        {category.name}
                      </div>
                      {categoryServices.map((service) => (
                        <SelectItem key={service.id} value={service.id}>
                          <div className="flex items-center justify-between w-full">
                            <span>{service.name}</span>
                            <span className="ml-4 text-muted-foreground">
                              {formatCurrency(service.basePrice)}
                            </span>
                          </div>
                        </SelectItem>
                      ))}
                    </div>
                  )
                })}
              </SelectContent>
            </Select>
          </div>

          {selectedService && (
            <>
              {selectedService.description && (
                <div className="p-3 bg-muted rounded-lg">
                  <p className="text-sm text-muted-foreground">{selectedService.description}</p>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="service-quantity">Quantity</Label>
                  <Input
                    id="service-quantity"
                    type="number"
                    min="1"
                    max={selectedService.maxQuantity}
                    value={quantity}
                    onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
                    required
                  />
                  {selectedService.maxQuantity && (
                    <p className="text-xs text-muted-foreground">
                      Max: {selectedService.maxQuantity} {selectedService.unit}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label>Unit Price</Label>
                  <div className="h-10 flex items-center text-lg font-semibold">
                    {formatCurrency(selectedService.basePrice)} / {selectedService.unit}
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="service-comments">Comments (Optional)</Label>
                <Textarea
                  id="service-comments"
                  value={comments}
                  onChange={(e) => setComments(e.target.value)}
                  placeholder="Add any special notes or instructions"
                  rows={2}
                />
              </div>

              <div className="border-t pt-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Subtotal:</span>
                  <span className="font-medium">{formatCurrency(calculateSubtotal())}</span>
                </div>
                {selectedService.taxRate > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Tax ({selectedService.taxRate}%):</span>
                    <span className="font-medium">{formatCurrency(calculateTax())}</span>
                  </div>
                )}
                <div className="flex justify-between text-lg font-semibold border-t pt-2">
                  <span>Total:</span>
                  <span>{formatCurrency(calculateTotal())}</span>
                </div>
              </div>

              {selectedService.requiresApproval && (
                <div className="p-3 bg-accent/10 border border-accent rounded-lg">
                  <p className="text-sm text-accent-foreground">
                    ⚠️ This service requires manager approval before posting
                  </p>
                </div>
              )}
            </>
          )}

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={!selectedService}>
              Add to Bill
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
