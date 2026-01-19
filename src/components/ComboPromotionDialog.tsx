import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Sparkle, Plus, Trash, CalendarBlank } from '@phosphor-icons/react'
import type { MealCombo, ComboPromotion, PromotionType, PromotionTrigger } from '@/lib/types'
import { toast } from 'sonner'
import { format } from 'date-fns'
import { ulid } from 'ulid'

interface ComboPromotionDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  combo: MealCombo
  onSave: (combo: MealCombo) => void
  currentUser: { id: string; firstName: string; lastName: string }
}

export function ComboPromotionDialog({
  open,
  onOpenChange,
  combo,
  onSave,
  currentUser
}: ComboPromotionDialogProps) {
  const [promotions, setPromotions] = useState<ComboPromotion[]>(combo.promotions || [])
  const [editingPromotion, setEditingPromotion] = useState<ComboPromotion | null>(null)
  const [isCreating, setIsCreating] = useState(false)

  useEffect(() => {
    setPromotions(combo.promotions || [])
    setEditingPromotion(null)
    setIsCreating(false)
  }, [combo, open])

  const handleCreatePromotion = () => {
    const now = Date.now()
    const newPromotion: ComboPromotion = {
      id: ulid(),
      promotionType: 'limited-time',
      promotionName: '',
      isActive: true,
      trigger: 'time-based',
      startDate: now,
      endDate: now + 7 * 24 * 60 * 60 * 1000,
      additionalDiscountPercentage: 10,
      currentRedemptions: 0,
      requiresCode: false,
      autoApply: true,
      showCountdownTimer: true,
      priorityLevel: 1,
      createdAt: now,
      createdBy: currentUser.id
    }
    setEditingPromotion(newPromotion)
    setIsCreating(true)
  }

  const handleSavePromotion = () => {
    if (!editingPromotion) return

    if (!editingPromotion.promotionName.trim()) {
      toast.error('Please enter a promotion name')
      return
    }

    if (isCreating) {
      setPromotions([...promotions, editingPromotion])
      toast.success('Promotion created successfully')
    } else {
      setPromotions(promotions.map(p => p.id === editingPromotion.id ? editingPromotion : p))
      toast.success('Promotion updated successfully')
    }

    setEditingPromotion(null)
    setIsCreating(false)
  }

  const handleDeletePromotion = (id: string) => {
    if (confirm('Are you sure you want to delete this promotion?')) {
      setPromotions(promotions.filter(p => p.id !== id))
      toast.success('Promotion deleted')
    }
  }

  const handleSaveAll = () => {
    const updatedCombo = {
      ...combo,
      promotions
    }
    onSave(updatedCombo)
    toast.success('Promotions saved successfully')
    onOpenChange(false)
  }

  const promotionTypes: { value: PromotionType; label: string }[] = [
    { value: 'flash-sale', label: 'Flash Sale' },
    { value: 'early-bird', label: 'Early Bird' },
    { value: 'happy-hour', label: 'Happy Hour' },
    { value: 'seasonal', label: 'Seasonal' },
    { value: 'limited-time', label: 'Limited Time' },
    { value: 'daily-special', label: 'Daily Special' },
    { value: 'weekend-special', label: 'Weekend Special' },
    { value: 'buy-one-get-one', label: 'BOGO' },
    { value: 'loyalty-exclusive', label: 'Loyalty Exclusive' },
    { value: 'first-timer', label: 'First Timer' },
    { value: 'custom', label: 'Custom' }
  ]

  const triggerTypes: { value: PromotionTrigger; label: string }[] = [
    { value: 'time-based', label: 'Time Based' },
    { value: 'quantity-limited', label: 'Quantity Limited' },
    { value: 'first-x-customers', label: 'First X Customers' },
    { value: 'minimum-order', label: 'Minimum Order' },
    { value: 'day-of-week', label: 'Day of Week' },
    { value: 'auto-apply', label: 'Auto Apply' }
  ]

  const daysOfWeek = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="dialog-content-wrapper max-w-4xl">
        <DialogHeader className="dialog-header-fixed">
          <DialogTitle className="flex items-center gap-2">
            <Sparkle className="text-primary" size={24} />
            Manage Promotions - {combo.name}
          </DialogTitle>
        </DialogHeader>

        <div className="dialog-body-scrollable">
          <Tabs defaultValue="list" className="space-y-4">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="list">Active Promotions ({promotions.length})</TabsTrigger>
              <TabsTrigger value="edit" disabled={!editingPromotion}>
                {isCreating ? 'Create New' : 'Edit'} Promotion
              </TabsTrigger>
            </TabsList>

            <TabsContent value="list" className="space-y-4">
              <div className="flex justify-between items-center">
                <p className="text-sm text-muted-foreground">
                  Create time-limited promotions with special discounts
                </p>
                <Button onClick={handleCreatePromotion}>
                  <Plus size={18} className="mr-2" />
                  New Promotion
                </Button>
              </div>

              {promotions.length === 0 ? (
                <Card className="p-12 text-center">
                  <Sparkle size={48} className="mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No promotions yet</h3>
                  <p className="text-muted-foreground mb-4">
                    Create your first promotion to boost sales with time-limited offers
                  </p>
                  <Button onClick={handleCreatePromotion}>
                    <Plus size={18} className="mr-2" />
                    Create First Promotion
                  </Button>
                </Card>
              ) : (
                <div className="space-y-3">
                  {promotions.map((promo) => (
                    <Card key={promo.id} className="p-4">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1 space-y-2">
                          <div className="flex items-center gap-2">
                            <h4 className="font-semibold">{promo.promotionName}</h4>
                            {promo.isActive ? (
                              <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                                Active
                              </Badge>
                            ) : (
                              <Badge variant="secondary">Inactive</Badge>
                            )}
                            <Badge variant="outline">{promotionTypes.find(t => t.value === promo.promotionType)?.label}</Badge>
                          </div>

                          {promo.promotionDescription && (
                            <p className="text-sm text-muted-foreground">{promo.promotionDescription}</p>
                          )}

                          <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-sm">
                            <div>
                              <span className="text-muted-foreground">Discount:</span>{' '}
                              <span className="font-medium">
                                {promo.additionalDiscountPercentage}%
                                {promo.additionalDiscountAmount ? ` + $${promo.additionalDiscountAmount}` : ''}
                              </span>
                            </div>
                            <div>
                              <span className="text-muted-foreground">Period:</span>{' '}
                              <span className="font-medium">
                                {format(promo.startDate, 'MMM dd')} - {format(promo.endDate, 'MMM dd')}
                              </span>
                            </div>
                            {promo.maxRedemptions && (
                              <div>
                                <span className="text-muted-foreground">Redemptions:</span>{' '}
                                <span className="font-medium">
                                  {promo.currentRedemptions} / {promo.maxRedemptions}
                                </span>
                              </div>
                            )}
                            {promo.promotionCode && (
                              <div>
                                <span className="text-muted-foreground">Code:</span>{' '}
                                <span className="font-mono font-medium">{promo.promotionCode}</span>
                              </div>
                            )}
                          </div>
                        </div>

                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setEditingPromotion(promo)
                              setIsCreating(false)
                            }}
                          >
                            Edit
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDeletePromotion(promo.id)}
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
            </TabsContent>

            <TabsContent value="edit" className="space-y-6">
              {editingPromotion && (
                <>
                  <div className="dialog-grid-2">
                    <div className="space-y-2">
                      <Label htmlFor="promo-name">Promotion Name *</Label>
                      <Input
                        id="promo-name"
                        value={editingPromotion.promotionName}
                        onChange={(e) =>
                          setEditingPromotion({ ...editingPromotion, promotionName: e.target.value })
                        }
                        placeholder="e.g., Weekend Flash Sale"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="promo-type">Promotion Type</Label>
                      <Select
                        value={editingPromotion.promotionType}
                        onValueChange={(value: PromotionType) =>
                          setEditingPromotion({ ...editingPromotion, promotionType: value })
                        }
                      >
                        <SelectTrigger id="promo-type">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {promotionTypes.map((type) => (
                            <SelectItem key={type.value} value={type.value}>
                              {type.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="promo-desc">Description</Label>
                    <Input
                      id="promo-desc"
                      value={editingPromotion.promotionDescription || ''}
                      onChange={(e) =>
                        setEditingPromotion({ ...editingPromotion, promotionDescription: e.target.value })
                      }
                      placeholder="Brief description of the promotion"
                    />
                  </div>

                  <div className="dialog-grid-2">
                    <div className="space-y-2">
                      <Label htmlFor="start-date">Start Date *</Label>
                      <Input
                        id="start-date"
                        type="datetime-local"
                        value={format(editingPromotion.startDate, "yyyy-MM-dd'T'HH:mm")}
                        onChange={(e) =>
                          setEditingPromotion({
                            ...editingPromotion,
                            startDate: new Date(e.target.value).getTime()
                          })
                        }
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="end-date">End Date *</Label>
                      <Input
                        id="end-date"
                        type="datetime-local"
                        value={format(editingPromotion.endDate, "yyyy-MM-dd'T'HH:mm")}
                        onChange={(e) =>
                          setEditingPromotion({
                            ...editingPromotion,
                            endDate: new Date(e.target.value).getTime()
                          })
                        }
                      />
                    </div>
                  </div>

                  <div className="dialog-grid-2">
                    <div className="space-y-2">
                      <Label htmlFor="discount-percent">Additional Discount %</Label>
                      <Input
                        id="discount-percent"
                        type="number"
                        min="0"
                        max="100"
                        value={editingPromotion.additionalDiscountPercentage}
                        onChange={(e) =>
                          setEditingPromotion({
                            ...editingPromotion,
                            additionalDiscountPercentage: parseFloat(e.target.value) || 0
                          })
                        }
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="discount-amount">Additional Discount Amount ($)</Label>
                      <Input
                        id="discount-amount"
                        type="number"
                        min="0"
                        step="0.01"
                        value={editingPromotion.additionalDiscountAmount || ''}
                        onChange={(e) =>
                          setEditingPromotion({
                            ...editingPromotion,
                            additionalDiscountAmount: parseFloat(e.target.value) || undefined
                          })
                        }
                        placeholder="Optional"
                      />
                    </div>
                  </div>

                  <div className="dialog-grid-2">
                    <div className="space-y-2">
                      <Label htmlFor="max-redemptions">Max Redemptions (Total)</Label>
                      <Input
                        id="max-redemptions"
                        type="number"
                        min="0"
                        value={editingPromotion.maxRedemptions || ''}
                        onChange={(e) =>
                          setEditingPromotion({
                            ...editingPromotion,
                            maxRedemptions: parseInt(e.target.value) || undefined
                          })
                        }
                        placeholder="Unlimited"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="max-per-customer">Max Redemptions (Per Customer)</Label>
                      <Input
                        id="max-per-customer"
                        type="number"
                        min="0"
                        value={editingPromotion.maxRedemptionsPerCustomer || ''}
                        onChange={(e) =>
                          setEditingPromotion({
                            ...editingPromotion,
                            maxRedemptionsPerCustomer: parseInt(e.target.value) || undefined
                          })
                        }
                        placeholder="Unlimited"
                      />
                    </div>
                  </div>

                  <div className="dialog-grid-2">
                    <div className="space-y-2">
                      <Label htmlFor="promo-code">Promotion Code (Optional)</Label>
                      <Input
                        id="promo-code"
                        value={editingPromotion.promotionCode || ''}
                        onChange={(e) =>
                          setEditingPromotion({ ...editingPromotion, promotionCode: e.target.value || undefined })
                        }
                        placeholder="e.g., WEEKEND50"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="badge-text">Badge Text</Label>
                      <Input
                        id="badge-text"
                        value={editingPromotion.badgeText || ''}
                        onChange={(e) =>
                          setEditingPromotion({ ...editingPromotion, badgeText: e.target.value || undefined })
                        }
                        placeholder="e.g., FLASH SALE"
                      />
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="is-active">Active</Label>
                      <Switch
                        id="is-active"
                        checked={editingPromotion.isActive}
                        onCheckedChange={(checked) =>
                          setEditingPromotion({ ...editingPromotion, isActive: checked })
                        }
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <Label htmlFor="requires-code">Requires Promotion Code</Label>
                      <Switch
                        id="requires-code"
                        checked={editingPromotion.requiresCode}
                        onCheckedChange={(checked) =>
                          setEditingPromotion({ ...editingPromotion, requiresCode: checked })
                        }
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <Label htmlFor="auto-apply">Auto Apply (No Code Needed)</Label>
                      <Switch
                        id="auto-apply"
                        checked={editingPromotion.autoApply}
                        onCheckedChange={(checked) =>
                          setEditingPromotion({ ...editingPromotion, autoApply: checked })
                        }
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <Label htmlFor="show-countdown">Show Countdown Timer</Label>
                      <Switch
                        id="show-countdown"
                        checked={editingPromotion.showCountdownTimer}
                        onCheckedChange={(checked) =>
                          setEditingPromotion({ ...editingPromotion, showCountdownTimer: checked })
                        }
                      />
                    </div>
                  </div>

                  <div className="flex gap-2 pt-4 border-t">
                    <Button onClick={handleSavePromotion} className="flex-1">
                      {isCreating ? 'Create' : 'Update'} Promotion
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => {
                        setEditingPromotion(null)
                        setIsCreating(false)
                      }}
                    >
                      Cancel
                    </Button>
                  </div>
                </>
              )}
            </TabsContent>
          </Tabs>
        </div>

        <DialogFooter className="dialog-footer-fixed">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Close
          </Button>
          <Button onClick={handleSaveAll}>
            Save All Promotions
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
