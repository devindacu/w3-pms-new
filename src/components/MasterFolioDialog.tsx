import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Switch } from '@/components/ui/switch'
import { 
  type MasterFolio, 
  type MasterFolioType, 
  type BillingArrangement,
  type RoutingRule,
  type RoutingRuleType,
  type Department,
  type Folio,
  type Reservation,
  type Guest
} from '@/lib/types'
import { 
  Plus, 
  Trash, 
  ArrowsLeftRight, 
  Buildings,
  Users,
  CurrencyDollar,
  Receipt,
  X
} from '@phosphor-icons/react'
import { generateId, formatCurrency } from '@/lib/helpers'
import { toast } from 'sonner'

interface MasterFolioDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  masterFolio?: MasterFolio | null
  folios: Folio[]
  reservations: Reservation[]
  guests: Guest[]
  onSave: (masterFolio: MasterFolio) => void
  currentUser: { id: string; firstName: string; lastName: string }
}

export function MasterFolioDialog({
  open,
  onOpenChange,
  masterFolio,
  folios,
  reservations,
  guests,
  onSave,
  currentUser
}: MasterFolioDialogProps) {
  const [formData, setFormData] = useState<Partial<MasterFolio>>({
    type: 'group',
    billingArrangement: 'master-only',
    status: 'active',
    childFolioIds: [],
    routingRules: [],
    charges: [],
    payments: [],
    totalBalance: 0
  })

  const [selectedFolios, setSelectedFolios] = useState<string[]>([])
  const [newRoutingRule, setNewRoutingRule] = useState<Partial<RoutingRule>>({
    ruleType: 'all-charges',
    targetFolioId: 'master',
    isActive: true
  })

  useEffect(() => {
    if (masterFolio) {
      setFormData(masterFolio)
      setSelectedFolios(masterFolio.childFolioIds || [])
    } else {
      setFormData({
        type: 'group',
        billingArrangement: 'master-only',
        status: 'active',
        childFolioIds: [],
        routingRules: [],
        charges: [],
        payments: [],
        totalBalance: 0
      })
      setSelectedFolios([])
    }
  }, [masterFolio, open])

  const handleSave = () => {
    if (!formData.name || !formData.primaryContact?.name) {
      toast.error('Please fill in required fields')
      return
    }

    const masterFolioData: MasterFolio = {
      id: masterFolio?.id || generateId(),
      masterFolioNumber: masterFolio?.masterFolioNumber || `MF-${Date.now()}`,
      type: formData.type || 'group',
      name: formData.name!,
      description: formData.description,
      billingArrangement: formData.billingArrangement || 'master-only',
      primaryContact: formData.primaryContact || { name: '' },
      billingAddress: formData.billingAddress,
      childFolioIds: selectedFolios,
      routingRules: formData.routingRules || [],
      charges: masterFolio?.charges || [],
      payments: masterFolio?.payments || [],
      creditLimit: formData.creditLimit,
      paymentTerms: formData.paymentTerms,
      specialInstructions: formData.specialInstructions,
      status: formData.status || 'active',
      totalBalance: calculateTotalBalance(),
      createdAt: masterFolio?.createdAt || Date.now(),
      updatedAt: Date.now(),
      createdBy: masterFolio?.createdBy || currentUser.id,
      closedAt: formData.closedAt,
      closedBy: formData.closedBy
    }

    onSave(masterFolioData)
    toast.success(`Master folio ${masterFolio ? 'updated' : 'created'} successfully`)
    onOpenChange(false)
  }

  const calculateTotalBalance = () => {
    const masterCharges = (formData.charges || []).reduce((sum, c) => sum + (c.amount * c.quantity), 0)
    const masterPayments = (formData.payments || []).reduce((sum, p) => sum + p.amount, 0)
    
    const childBalances = selectedFolios.reduce((sum, folioId) => {
      const folio = folios.find(f => f.id === folioId)
      return sum + (folio?.balance || 0)
    }, 0)

    return masterCharges - masterPayments + childBalances
  }

  const addRoutingRule = () => {
    if (!newRoutingRule.ruleType) {
      toast.error('Please select a rule type')
      return
    }

    const rule: RoutingRule = {
      id: generateId(),
      masterFolioId: masterFolio?.id || 'pending',
      ruleType: newRoutingRule.ruleType!,
      sourceFolioId: newRoutingRule.sourceFolioId,
      targetFolioId: newRoutingRule.targetFolioId || 'master',
      chargeTypes: newRoutingRule.chargeTypes,
      percentage: newRoutingRule.percentage,
      description: newRoutingRule.description,
      isActive: true,
      createdAt: Date.now()
    }

    setFormData(prev => ({
      ...prev,
      routingRules: [...(prev.routingRules || []), rule]
    }))

    setNewRoutingRule({
      ruleType: 'all-charges',
      targetFolioId: 'master',
      isActive: true
    })

    toast.success('Routing rule added')
  }

  const removeRoutingRule = (ruleId: string) => {
    setFormData(prev => ({
      ...prev,
      routingRules: (prev.routingRules || []).filter(r => r.id !== ruleId)
    }))
    toast.success('Routing rule removed')
  }

  const toggleFolioSelection = (folioId: string) => {
    setSelectedFolios(prev => 
      prev.includes(folioId) 
        ? prev.filter(id => id !== folioId)
        : [...prev, folioId]
    )
  }

  const availableFolios = folios.filter(f => !f.masterFolioId || f.masterFolioId === masterFolio?.id)

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-6xl max-h-[90vh]">
        <DialogHeader className="dialog-header-fixed">
          <DialogTitle className="text-2xl flex items-center gap-2">
            <Buildings size={24} className="text-primary" />
            {masterFolio ? 'Edit Master Folio' : 'Create Master Folio'}
          </DialogTitle>
          <DialogDescription>
            {masterFolio 
              ? `Manage master folio ${masterFolio.masterFolioNumber}` 
              : 'Create a new master folio for group billing'}
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="basic" className="dialog-body-scrollable">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="basic">Basic Info</TabsTrigger>
            <TabsTrigger value="folios">
              Child Folios ({selectedFolios.length})
            </TabsTrigger>
            <TabsTrigger value="routing">
              Routing Rules ({(formData.routingRules || []).length})
            </TabsTrigger>
            <TabsTrigger value="summary">Summary</TabsTrigger>
          </TabsList>

          <TabsContent value="basic" className="dialog-section space-y-6 mt-4">
            <div className="dialog-grid-2">
              <div className="dialog-form-field">
                <Label htmlFor="name" className="dialog-form-label">
                  Master Folio Name *
                </Label>
                <Input
                  id="name"
                  value={formData.name || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="e.g., ABC Corp Annual Conference 2024"
                  className="dialog-form-input"
                />
              </div>

              <div className="dialog-form-field">
                <Label htmlFor="type" className="dialog-form-label">Type</Label>
                <Select
                  value={formData.type}
                  onValueChange={(value: MasterFolioType) => setFormData(prev => ({ ...prev, type: value }))}
                >
                  <SelectTrigger id="type" className="dialog-form-input">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="group">Group</SelectItem>
                    <SelectItem value="corporate">Corporate</SelectItem>
                    <SelectItem value="event">Event</SelectItem>
                    <SelectItem value="travel-agency">Travel Agency</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="dialog-form-field">
              <Label htmlFor="description" className="dialog-form-label">Description</Label>
              <Textarea
                id="description"
                value={formData.description || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Optional description or notes about this master folio"
                className="dialog-form-textarea"
              />
            </div>

            <Separator />

            <div className="dialog-section">
              <h3 className="dialog-section-title">Primary Contact</h3>
              <div className="dialog-grid-2">
                <div className="dialog-form-field">
                  <Label htmlFor="contactName" className="dialog-form-label">
                    Contact Name *
                  </Label>
                  <Input
                    id="contactName"
                    value={formData.primaryContact?.name || ''}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      primaryContact: { ...prev.primaryContact, name: e.target.value }
                    }))}
                    placeholder="Contact person name"
                    className="dialog-form-input"
                  />
                </div>

                <div className="dialog-form-field">
                  <Label htmlFor="contactEmail" className="dialog-form-label">Email</Label>
                  <Input
                    id="contactEmail"
                    type="email"
                    value={formData.primaryContact?.email || ''}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      primaryContact: { ...prev.primaryContact, email: e.target.value }
                    }))}
                    placeholder="email@example.com"
                    className="dialog-form-input"
                  />
                </div>

                <div className="dialog-form-field">
                  <Label htmlFor="contactPhone" className="dialog-form-label">Phone</Label>
                  <Input
                    id="contactPhone"
                    value={formData.primaryContact?.phone || ''}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      primaryContact: { ...prev.primaryContact, phone: e.target.value }
                    }))}
                    placeholder="Phone number"
                    className="dialog-form-input"
                  />
                </div>

                <div className="dialog-form-field">
                  <Label htmlFor="contactCompany" className="dialog-form-label">Company</Label>
                  <Input
                    id="contactCompany"
                    value={formData.primaryContact?.company || ''}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      primaryContact: { ...prev.primaryContact, company: e.target.value }
                    }))}
                    placeholder="Company name"
                    className="dialog-form-input"
                  />
                </div>
              </div>
            </div>

            <Separator />

            <div className="dialog-section">
              <h3 className="dialog-section-title">Billing Configuration</h3>
              <div className="dialog-grid-2">
                <div className="dialog-form-field">
                  <Label htmlFor="billingArrangement" className="dialog-form-label">
                    Billing Arrangement
                  </Label>
                  <Select
                    value={formData.billingArrangement}
                    onValueChange={(value: BillingArrangement) => 
                      setFormData(prev => ({ ...prev, billingArrangement: value }))
                    }
                  >
                    <SelectTrigger id="billingArrangement" className="dialog-form-input">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="master-only">Master Only</SelectItem>
                      <SelectItem value="split-billing">Split Billing</SelectItem>
                      <SelectItem value="individual-with-routing">Individual with Routing</SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-muted-foreground mt-1">
                    {formData.billingArrangement === 'master-only' && 'All charges billed to master folio'}
                    {formData.billingArrangement === 'split-billing' && 'Charges split between master and individual folios'}
                    {formData.billingArrangement === 'individual-with-routing' && 'Individual folios with custom routing rules'}
                  </p>
                </div>

                <div className="dialog-form-field">
                  <Label htmlFor="creditLimit" className="dialog-form-label">Credit Limit</Label>
                  <Input
                    id="creditLimit"
                    type="number"
                    value={formData.creditLimit || ''}
                    onChange={(e) => setFormData(prev => ({ 
                      ...prev, 
                      creditLimit: parseFloat(e.target.value) || undefined 
                    }))}
                    placeholder="Optional credit limit"
                    className="dialog-form-input"
                  />
                </div>

                <div className="dialog-form-field col-span-2">
                  <Label htmlFor="paymentTerms" className="dialog-form-label">Payment Terms</Label>
                  <Input
                    id="paymentTerms"
                    value={formData.paymentTerms || ''}
                    onChange={(e) => setFormData(prev => ({ ...prev, paymentTerms: e.target.value }))}
                    placeholder="e.g., Net 30, Due on receipt"
                    className="dialog-form-input"
                  />
                </div>
              </div>
            </div>

            <div className="dialog-form-field">
              <Label htmlFor="specialInstructions" className="dialog-form-label">
                Special Instructions
              </Label>
              <Textarea
                id="specialInstructions"
                value={formData.specialInstructions || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, specialInstructions: e.target.value }))}
                placeholder="Any special billing instructions or notes"
                className="dialog-form-textarea"
              />
            </div>
          </TabsContent>

          <TabsContent value="folios" className="dialog-section space-y-4 mt-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="dialog-section-title">Select Child Folios</h3>
                <p className="text-sm text-muted-foreground">
                  Choose individual folios to link to this master folio
                </p>
              </div>
              <Badge variant="outline" className="text-lg px-3 py-1">
                {selectedFolios.length} Selected
              </Badge>
            </div>

            <ScrollArea className="h-[400px] border rounded-lg">
              <div className="p-4 space-y-2">
                {availableFolios.length === 0 ? (
                  <div className="text-center py-12 text-muted-foreground">
                    <Receipt size={48} className="mx-auto mb-2 opacity-50" />
                    <p>No available folios</p>
                  </div>
                ) : (
                  availableFolios.map(folio => {
                    const reservation = reservations.find(r => r.id === folio.reservationId)
                    const guest = guests.find(g => g.id === folio.guestId)
                    const isSelected = selectedFolios.includes(folio.id)

                    return (
                      <Card
                        key={folio.id}
                        className={`p-4 cursor-pointer transition-all ${
                          isSelected ? 'border-primary bg-primary/5' : 'hover:border-primary/50'
                        }`}
                        onClick={() => toggleFolioSelection(folio.id)}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <h4 className="font-medium">
                                {guest ? `${guest.firstName} ${guest.lastName}` : 'Unknown Guest'}
                              </h4>
                              {folio.folioNumber && (
                                <Badge variant="outline">{folio.folioNumber}</Badge>
                              )}
                            </div>
                            {reservation && (
                              <p className="text-sm text-muted-foreground mt-1">
                                Room: {reservation.roomId || 'Unassigned'} • 
                                Balance: {formatCurrency(folio.balance)}
                              </p>
                            )}
                          </div>
                          <div className="flex items-center gap-3">
                            <div className="text-right">
                              <p className="text-sm font-medium">
                                {formatCurrency(folio.balance)}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                {folio.charges.length} charges
                              </p>
                            </div>
                            {isSelected && (
                              <div className="w-5 h-5 rounded-full bg-primary flex items-center justify-center">
                                <svg
                                  className="w-3 h-3 text-primary-foreground"
                                  fill="none"
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth="2"
                                  viewBox="0 0 24 24"
                                  stroke="currentColor"
                                >
                                  <path d="M5 13l4 4L19 7" />
                                </svg>
                              </div>
                            )}
                          </div>
                        </div>
                      </Card>
                    )
                  })
                )}
              </div>
            </ScrollArea>
          </TabsContent>

          <TabsContent value="routing" className="dialog-section space-y-4 mt-4">
            <div>
              <h3 className="dialog-section-title">Routing Rules</h3>
              <p className="text-sm text-muted-foreground">
                Define how charges should be routed between folios
              </p>
            </div>

            <Card className="p-4 bg-muted/30">
              <h4 className="font-medium mb-3">Add New Routing Rule</h4>
              <div className="dialog-grid-2 mb-3">
                <div className="dialog-form-field">
                  <Label className="dialog-form-label">Rule Type</Label>
                  <Select
                    value={newRoutingRule.ruleType}
                    onValueChange={(value: RoutingRuleType) => 
                      setNewRoutingRule(prev => ({ ...prev, ruleType: value }))
                    }
                  >
                    <SelectTrigger className="dialog-form-input">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all-charges">All Charges</SelectItem>
                      <SelectItem value="room-charges">Room Charges Only</SelectItem>
                      <SelectItem value="fnb-charges">F&B Charges Only</SelectItem>
                      <SelectItem value="extra-services">Extra Services Only</SelectItem>
                      <SelectItem value="custom">Custom</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="dialog-form-field">
                  <Label className="dialog-form-label">Target</Label>
                  <Select
                    value={newRoutingRule.targetFolioId}
                    onValueChange={(value) => 
                      setNewRoutingRule(prev => ({ ...prev, targetFolioId: value }))
                    }
                  >
                    <SelectTrigger className="dialog-form-input">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="master">Master Folio</SelectItem>
                      {selectedFolios.map(folioId => {
                        const folio = folios.find(f => f.id === folioId)
                        const guest = guests.find(g => g.id === folio?.guestId)
                        return (
                          <SelectItem key={folioId} value={folioId}>
                            {guest ? `${guest.firstName} ${guest.lastName}` : folioId}
                          </SelectItem>
                        )
                      })}
                    </SelectContent>
                  </Select>
                </div>

                {newRoutingRule.ruleType === 'custom' && (
                  <div className="dialog-form-field col-span-2">
                    <Label className="dialog-form-label">Percentage to Route</Label>
                    <Input
                      type="number"
                      min="0"
                      max="100"
                      value={newRoutingRule.percentage || ''}
                      onChange={(e) => setNewRoutingRule(prev => ({ 
                        ...prev, 
                        percentage: parseInt(e.target.value) || undefined 
                      }))}
                      placeholder="0-100"
                      className="dialog-form-input"
                    />
                  </div>
                )}

                <div className="dialog-form-field col-span-2">
                  <Label className="dialog-form-label">Description</Label>
                  <Input
                    value={newRoutingRule.description || ''}
                    onChange={(e) => setNewRoutingRule(prev => ({ 
                      ...prev, 
                      description: e.target.value 
                    }))}
                    placeholder="Optional description"
                    className="dialog-form-input"
                  />
                </div>
              </div>

              <Button onClick={addRoutingRule} className="w-full">
                <Plus size={16} className="mr-2" />
                Add Routing Rule
              </Button>
            </Card>

            <div className="space-y-2">
              {(formData.routingRules || []).length === 0 ? (
                <Card className="p-8 text-center text-muted-foreground">
                  <ArrowsLeftRight size={48} className="mx-auto mb-2 opacity-50" />
                  <p>No routing rules defined</p>
                  <p className="text-sm mt-1">Add rules to control charge routing</p>
                </Card>
              ) : (
                (formData.routingRules || []).map(rule => (
                  <Card key={rule.id} className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <Badge variant="outline">
                            {rule.ruleType.replace(/-/g, ' ').toUpperCase()}
                          </Badge>
                          {!rule.isActive && (
                            <Badge variant="destructive">Inactive</Badge>
                          )}
                        </div>
                        <p className="text-sm">
                          Route to: <span className="font-medium">
                            {rule.targetFolioId === 'master' ? 'Master Folio' : (() => {
                              const folio = folios.find(f => f.id === rule.targetFolioId)
                              const guest = guests.find(g => g.id === folio?.guestId)
                              return guest ? `${guest.firstName} ${guest.lastName}` : 'Unknown'
                            })()}
                          </span>
                        </p>
                        {rule.percentage && (
                          <p className="text-sm text-muted-foreground">
                            {rule.percentage}% of charges
                          </p>
                        )}
                        {rule.description && (
                          <p className="text-xs text-muted-foreground mt-1">{rule.description}</p>
                        )}
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => removeRoutingRule(rule.id)}
                        className="text-destructive hover:text-destructive"
                      >
                        <Trash size={16} />
                      </Button>
                    </div>
                  </Card>
                ))
              )}
            </div>
          </TabsContent>

          <TabsContent value="summary" className="dialog-section space-y-4 mt-4">
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">Master Folio Summary</h3>
              
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div>
                  <p className="text-sm text-muted-foreground">Master Folio Name</p>
                  <p className="font-medium">{formData.name || 'Not set'}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Type</p>
                  <Badge>{formData.type}</Badge>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Billing Arrangement</p>
                  <p className="font-medium">
                    {formData.billingArrangement?.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Primary Contact</p>
                  <p className="font-medium">{formData.primaryContact?.name || 'Not set'}</p>
                </div>
              </div>

              <Separator className="my-4" />

              <div className="grid grid-cols-3 gap-4 mb-6">
                <Card className="p-4 border-l-4 border-l-primary">
                  <p className="text-sm text-muted-foreground mb-1">Child Folios</p>
                  <p className="text-2xl font-bold">{selectedFolios.length}</p>
                </Card>
                <Card className="p-4 border-l-4 border-l-accent">
                  <p className="text-sm text-muted-foreground mb-1">Routing Rules</p>
                  <p className="text-2xl font-bold">{(formData.routingRules || []).length}</p>
                </Card>
                <Card className="p-4 border-l-4 border-l-secondary">
                  <p className="text-sm text-muted-foreground mb-1">Total Balance</p>
                  <p className="text-2xl font-bold">{formatCurrency(calculateTotalBalance())}</p>
                </Card>
              </div>

              {formData.creditLimit && (
                <div className="mb-4">
                  <p className="text-sm text-muted-foreground mb-2">Credit Limit</p>
                  <div className="flex items-center gap-2">
                    <div className="flex-1 bg-muted rounded-full h-2">
                      <div
                        className="bg-primary rounded-full h-2 transition-all"
                        style={{
                          width: `${Math.min((calculateTotalBalance() / formData.creditLimit) * 100, 100)}%`
                        }}
                      />
                    </div>
                    <p className="text-sm font-medium">
                      {formatCurrency(calculateTotalBalance())} / {formatCurrency(formData.creditLimit)}
                    </p>
                  </div>
                </div>
              )}

              {formData.specialInstructions && (
                <>
                  <Separator className="my-4" />
                  <div>
                    <p className="text-sm text-muted-foreground mb-2">Special Instructions</p>
                    <p className="text-sm">{formData.specialInstructions}</p>
                  </div>
                </>
              )}
            </Card>
          </TabsContent>
        </Tabs>

        <DialogFooter className="dialog-footer-fixed">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave}>
            {masterFolio ? 'Update Master Folio' : 'Create Master Folio'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
