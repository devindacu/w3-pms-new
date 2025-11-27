import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import type { CorporateAccount, CorporateRate, RoomTypeConfig, RatePlanConfig } from '@/lib/types'
import { Plus, Trash, Calendar as CalendarIcon, Info } from '@phosphor-icons/react'
import { formatCurrency } from '@/lib/helpers'
import { Calendar } from '@/components/ui/calendar'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { format } from 'date-fns'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

interface CorporateAccountDialogProps {
  open: boolean
  onClose: () => void
  account: CorporateAccount | null
  onSave: (account: CorporateAccount) => void
  roomTypes: RoomTypeConfig[]
  ratePlans: RatePlanConfig[]
}

export function CorporateAccountDialog({
  open,
  onClose,
  account,
  onSave,
  roomTypes,
  ratePlans,
}: CorporateAccountDialogProps) {
  const [formData, setFormData] = useState<Partial<CorporateAccount>>({
    companyName: '',
    code: '',
    contactPerson: '',
    email: '',
    phone: '',
    address: '',
    negotiatedRates: [],
    blackoutDates: [],
    roomAllotment: undefined,
    creditLimit: undefined,
    paymentTerms: '',
    commissionRate: undefined,
    isActive: true,
  })

  const [newRate, setNewRate] = useState<Partial<CorporateRate>>({
    roomTypeId: '',
    ratePlanId: '',
    rate: 0,
    validFrom: Date.now(),
    validTo: undefined,
  })

  const [selectedBlackoutDate, setSelectedBlackoutDate] = useState<Date | undefined>()

  useEffect(() => {
    if (account) {
      setFormData(account)
    } else {
      setFormData({
        companyName: '',
        code: '',
        contactPerson: '',
        email: '',
        phone: '',
        address: '',
        negotiatedRates: [],
        blackoutDates: [],
        roomAllotment: undefined,
        creditLimit: undefined,
        paymentTerms: '',
        commissionRate: undefined,
        isActive: true,
      })
    }
  }, [account, open])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    const accountData: CorporateAccount = {
      id: account?.id || `corp-${Date.now()}`,
      companyName: formData.companyName || '',
      code: formData.code || '',
      contactPerson: formData.contactPerson || '',
      email: formData.email || '',
      phone: formData.phone || '',
      address: formData.address,
      negotiatedRates: formData.negotiatedRates || [],
      blackoutDates: formData.blackoutDates,
      roomAllotment: formData.roomAllotment,
      creditLimit: formData.creditLimit,
      paymentTerms: formData.paymentTerms,
      commissionRate: formData.commissionRate,
      isActive: formData.isActive ?? true,
      createdAt: account?.createdAt || Date.now(),
      updatedAt: Date.now(),
    }

    onSave(accountData)
    onClose()
  }

  const handleCodeGeneration = (name: string) => {
    const code = name
      .toUpperCase()
      .replace(/[^A-Z0-9\s]/g, '')
      .replace(/\s+/g, '_')
      .substring(0, 10)
    setFormData((prev) => ({ ...prev, code }))
  }

  const handleAddRate = () => {
    if (!newRate.roomTypeId || !newRate.ratePlanId || !newRate.rate) {
      return
    }

    const corporateRate: CorporateRate = {
      roomTypeId: newRate.roomTypeId,
      ratePlanId: newRate.ratePlanId,
      rate: newRate.rate,
      validFrom: newRate.validFrom || Date.now(),
      validTo: newRate.validTo,
    }

    setFormData((prev) => ({
      ...prev,
      negotiatedRates: [...(prev.negotiatedRates || []), corporateRate],
    }))

    setNewRate({
      roomTypeId: '',
      ratePlanId: '',
      rate: 0,
      validFrom: Date.now(),
      validTo: undefined,
    })
  }

  const handleRemoveRate = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      negotiatedRates: prev.negotiatedRates?.filter((_, i) => i !== index) || [],
    }))
  }

  const handleAddBlackoutDate = (date: Date | undefined) => {
    if (!date) return

    const timestamp = date.getTime()
    if (formData.blackoutDates?.includes(timestamp)) return

    setFormData((prev) => ({
      ...prev,
      blackoutDates: [...(prev.blackoutDates || []), timestamp],
    }))
    setSelectedBlackoutDate(undefined)
  }

  const handleRemoveBlackoutDate = (timestamp: number) => {
    setFormData((prev) => ({
      ...prev,
      blackoutDates: prev.blackoutDates?.filter((d) => d !== timestamp) || [],
    }))
  }

  const getRoomTypeName = (id: string) => {
    return roomTypes.find((rt) => rt.id === id)?.name || 'Unknown'
  }

  const getRatePlanName = (id: string) => {
    return ratePlans.find((rp) => rp.id === id)?.name || 'Unknown'
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {account ? 'Edit Corporate Account' : 'Add Corporate Account'}
          </DialogTitle>
          <DialogDescription>
            Manage corporate rates, allotments, and special terms for business accounts
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <Tabs defaultValue="details" className="py-4">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="details">Account Details</TabsTrigger>
              <TabsTrigger value="rates">Negotiated Rates</TabsTrigger>
              <TabsTrigger value="blackout">Blackout Dates</TabsTrigger>
              <TabsTrigger value="terms">Terms & Limits</TabsTrigger>
            </TabsList>

            <TabsContent value="details" className="space-y-4 mt-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="companyName">Company Name *</Label>
                  <Input
                    id="companyName"
                    value={formData.companyName}
                    onChange={(e) => {
                      setFormData((prev) => ({ ...prev, companyName: e.target.value }))
                      if (!account) handleCodeGeneration(e.target.value)
                    }}
                    placeholder="e.g., Acme Corporation"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="code">Corporate Code *</Label>
                  <Input
                    id="code"
                    value={formData.code}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        code: e.target.value.toUpperCase(),
                      }))
                    }
                    placeholder="e.g., ACME_CORP"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="contactPerson">Contact Person *</Label>
                  <Input
                    id="contactPerson"
                    value={formData.contactPerson}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, contactPerson: e.target.value }))
                    }
                    placeholder="e.g., John Smith"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email *</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, email: e.target.value }))
                    }
                    placeholder="corporate@example.com"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone *</Label>
                  <Input
                    id="phone"
                    type="tel"
                    value={formData.phone}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, phone: e.target.value }))
                    }
                    placeholder="+1 (555) 123-4567"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="roomAllotment">Room Allotment</Label>
                  <Input
                    id="roomAllotment"
                    type="number"
                    min="0"
                    value={formData.roomAllotment || ''}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        roomAllotment: e.target.value ? parseInt(e.target.value) : undefined,
                      }))
                    }
                    placeholder="e.g., 10 rooms"
                  />
                  <p className="text-xs text-muted-foreground">
                    Number of rooms guaranteed for this account
                  </p>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="address">Address</Label>
                <Textarea
                  id="address"
                  value={formData.address}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, address: e.target.value }))
                  }
                  placeholder="Corporate office address..."
                  rows={3}
                />
              </div>

              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div className="space-y-0.5">
                  <Label htmlFor="active">Active Status</Label>
                  <p className="text-sm text-muted-foreground">
                    Enable this corporate account for bookings
                  </p>
                </div>
                <Switch
                  id="active"
                  checked={formData.isActive}
                  onCheckedChange={(checked) =>
                    setFormData((prev) => ({ ...prev, isActive: checked }))
                  }
                />
              </div>
            </TabsContent>

            <TabsContent value="rates" className="space-y-4 mt-4">
              <Alert>
                <Info size={16} />
                <AlertDescription>
                  Configure special negotiated rates for different room types and rate plans
                </AlertDescription>
              </Alert>

              <div className="p-4 border rounded-lg space-y-4">
                <h4 className="font-medium">Add Negotiated Rate</h4>
                <div className="grid grid-cols-4 gap-4">
                  <div className="space-y-2">
                    <Label>Room Type *</Label>
                    <Select
                      value={newRate.roomTypeId}
                      onValueChange={(value) =>
                        setNewRate((prev) => ({ ...prev, roomTypeId: value }))
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select room type" />
                      </SelectTrigger>
                      <SelectContent>
                        {roomTypes.filter(rt => rt.isActive).map((rt) => (
                          <SelectItem key={rt.id} value={rt.id}>
                            {rt.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Rate Plan *</Label>
                    <Select
                      value={newRate.ratePlanId}
                      onValueChange={(value) =>
                        setNewRate((prev) => ({ ...prev, ratePlanId: value }))
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select rate plan" />
                      </SelectTrigger>
                      <SelectContent>
                        {ratePlans.filter(rp => rp.isActive).map((rp) => (
                          <SelectItem key={rp.id} value={rp.id}>
                            {rp.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Rate *</Label>
                    <Input
                      type="number"
                      step="0.01"
                      min="0"
                      value={newRate.rate || ''}
                      onChange={(e) =>
                        setNewRate((prev) => ({
                          ...prev,
                          rate: parseFloat(e.target.value) || 0,
                        }))
                      }
                      placeholder="0.00"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>&nbsp;</Label>
                    <Button
                      type="button"
                      onClick={handleAddRate}
                      className="w-full"
                      disabled={!newRate.roomTypeId || !newRate.ratePlanId || !newRate.rate}
                    >
                      <Plus size={16} className="mr-2" />
                      Add Rate
                    </Button>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Valid From</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className="w-full justify-start text-left font-normal"
                        >
                          <CalendarIcon size={16} className="mr-2" />
                          {newRate.validFrom
                            ? format(new Date(newRate.validFrom), 'PPP')
                            : 'Select date'}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={
                            newRate.validFrom ? new Date(newRate.validFrom) : undefined
                          }
                          onSelect={(date) =>
                            setNewRate((prev) => ({
                              ...prev,
                              validFrom: date?.getTime() || Date.now(),
                            }))
                          }
                        />
                      </PopoverContent>
                    </Popover>
                  </div>

                  <div className="space-y-2">
                    <Label>Valid To (Optional)</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className="w-full justify-start text-left font-normal"
                        >
                          <CalendarIcon size={16} className="mr-2" />
                          {newRate.validTo
                            ? format(new Date(newRate.validTo), 'PPP')
                            : 'No end date'}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={newRate.validTo ? new Date(newRate.validTo) : undefined}
                          onSelect={(date) =>
                            setNewRate((prev) => ({
                              ...prev,
                              validTo: date?.getTime(),
                            }))
                          }
                          disabled={(date) =>
                            newRate.validFrom ? date < new Date(newRate.validFrom) : false
                          }
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                </div>
              </div>

              {formData.negotiatedRates && formData.negotiatedRates.length > 0 ? (
                <div className="border rounded-lg">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Room Type</TableHead>
                        <TableHead>Rate Plan</TableHead>
                        <TableHead>Rate</TableHead>
                        <TableHead>Valid From</TableHead>
                        <TableHead>Valid To</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {formData.negotiatedRates.map((rate, index) => (
                        <TableRow key={index}>
                          <TableCell>{getRoomTypeName(rate.roomTypeId)}</TableCell>
                          <TableCell>{getRatePlanName(rate.ratePlanId)}</TableCell>
                          <TableCell className="font-medium">
                            {formatCurrency(rate.rate)}
                          </TableCell>
                          <TableCell className="text-sm text-muted-foreground">
                            {format(new Date(rate.validFrom), 'PP')}
                          </TableCell>
                          <TableCell className="text-sm text-muted-foreground">
                            {rate.validTo ? format(new Date(rate.validTo), 'PP') : 'Ongoing'}
                          </TableCell>
                          <TableCell className="text-right">
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => handleRemoveRate(index)}
                            >
                              <Trash size={16} />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  No negotiated rates configured
                </div>
              )}
            </TabsContent>

            <TabsContent value="blackout" className="space-y-4 mt-4">
              <Alert>
                <Info size={16} />
                <AlertDescription>
                  Define dates when corporate rates are not available (holidays, events, etc.)
                </AlertDescription>
              </Alert>

              <div className="p-4 border rounded-lg">
                <div className="space-y-2">
                  <Label>Add Blackout Date</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        type="button"
                        variant="outline"
                        className="w-full justify-start text-left font-normal"
                      >
                        <CalendarIcon size={16} className="mr-2" />
                        {selectedBlackoutDate
                          ? format(selectedBlackoutDate, 'PPP')
                          : 'Select blackout date'}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={selectedBlackoutDate}
                        onSelect={(date) => {
                          handleAddBlackoutDate(date)
                        }}
                      />
                    </PopoverContent>
                  </Popover>
                </div>
              </div>

              {formData.blackoutDates && formData.blackoutDates.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {formData.blackoutDates
                    .sort((a, b) => a - b)
                    .map((timestamp) => (
                      <Badge key={timestamp} variant="secondary" className="pr-1">
                        {format(new Date(timestamp), 'PP')}
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="h-5 w-5 p-0 ml-2"
                          onClick={() => handleRemoveBlackoutDate(timestamp)}
                        >
                          <Trash size={12} />
                        </Button>
                      </Badge>
                    ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  No blackout dates configured
                </div>
              )}
            </TabsContent>

            <TabsContent value="terms" className="space-y-4 mt-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="creditLimit">Credit Limit</Label>
                  <Input
                    id="creditLimit"
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.creditLimit || ''}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        creditLimit: e.target.value ? parseFloat(e.target.value) : undefined,
                      }))
                    }
                    placeholder="0.00"
                  />
                  <p className="text-xs text-muted-foreground">
                    Maximum credit allowed for this account
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="commissionRate">Commission Rate (%)</Label>
                  <Input
                    id="commissionRate"
                    type="number"
                    step="0.1"
                    min="0"
                    max="100"
                    value={formData.commissionRate || ''}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        commissionRate: e.target.value
                          ? parseFloat(e.target.value)
                          : undefined,
                      }))
                    }
                    placeholder="e.g., 10"
                  />
                  <p className="text-xs text-muted-foreground">
                    Commission percentage for travel agent bookings
                  </p>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="paymentTerms">Payment Terms</Label>
                <Textarea
                  id="paymentTerms"
                  value={formData.paymentTerms}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, paymentTerms: e.target.value }))
                  }
                  placeholder="e.g., Net 30 days, Monthly billing on account, etc."
                  rows={4}
                />
              </div>

              <div className="p-4 bg-muted/50 rounded-lg">
                <h4 className="text-sm font-medium mb-3">Account Summary</h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-muted-foreground">Negotiated Rates:</span>
                    <span className="ml-2 font-medium">
                      {formData.negotiatedRates?.length || 0}
                    </span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Blackout Dates:</span>
                    <span className="ml-2 font-medium">
                      {formData.blackoutDates?.length || 0}
                    </span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Room Allotment:</span>
                    <span className="ml-2 font-medium">
                      {formData.roomAllotment || 'None'}
                    </span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Credit Limit:</span>
                    <span className="ml-2 font-medium">
                      {formData.creditLimit ? formatCurrency(formData.creditLimit) : 'None'}
                    </span>
                  </div>
                </div>
              </div>
            </TabsContent>
          </Tabs>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit">
              {account ? 'Update Account' : 'Create Account'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
