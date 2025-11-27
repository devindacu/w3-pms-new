import { useState, useMemo } from 'react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Textarea } from '@/components/ui/textarea'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Calendar,
  CurrencyDollar,
  ArrowLeft,
  ArrowRight,
  PencilSimple,
  Copy,
  ArrowsClockwise,
  Lock,
  LockOpen,
  Rows,
  CheckCircle,
  XCircle,
  Warning
} from '@phosphor-icons/react'
import type { RateCalendar, RoomTypeConfig, RatePlanConfig, YieldRestriction, SystemUser, RestrictionType } from '@/lib/types'
import { formatCurrency } from '@/lib/helpers'
import { format, addDays, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, addMonths, subMonths, startOfWeek, endOfWeek } from 'date-fns'

interface RateCalendarViewProps {
  rateCalendar: RateCalendar[]
  setRateCalendar: (calendar: RateCalendar[] | ((current: RateCalendar[]) => RateCalendar[])) => void
  roomTypes: RoomTypeConfig[]
  ratePlans: RatePlanConfig[]
  currentUser: SystemUser
}

interface BulkUpdateConfig {
  startDate: Date
  endDate: Date
  roomTypeIds: string[]
  ratePlanIds: string[]
  rateAdjustment: {
    type: 'fixed' | 'percentage'
    value: number
  }
  restrictions: YieldRestriction[]
  applyToWeekdays: boolean[]
  overrideExisting: boolean
  reason: string
}

interface RateOverride {
  date: Date
  roomTypeId: string
  ratePlanId: string
  newRate: number
  reason: string
}

export function RateCalendarView({
  rateCalendar,
  setRateCalendar,
  roomTypes,
  ratePlans,
  currentUser
}: RateCalendarViewProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date())
  const [selectedRoomType, setSelectedRoomType] = useState<string>(roomTypes[0]?.id || '')
  const [selectedRatePlan, setSelectedRatePlan] = useState<string>(ratePlans[0]?.id || '')
  const [viewMode, setViewMode] = useState<'month' | 'week'>('month')
  const [isBulkUpdateOpen, setIsBulkUpdateOpen] = useState(false)
  const [isOverrideDialogOpen, setIsOverrideDialogOpen] = useState(false)
  const [selectedDateForOverride, setSelectedDateForOverride] = useState<Date | null>(null)
  const [overrideRate, setOverrideRate] = useState('')
  const [overrideReason, setOverrideReason] = useState('')
  const [overrideAvailability, setOverrideAvailability] = useState('')
  const [selectedRestrictions, setSelectedRestrictions] = useState<YieldRestriction[]>([])

  const [bulkConfig, setBulkConfig] = useState<BulkUpdateConfig>({
    startDate: new Date(),
    endDate: addDays(new Date(), 30),
    roomTypeIds: [],
    ratePlanIds: [],
    rateAdjustment: { type: 'percentage', value: 0 },
    restrictions: [],
    applyToWeekdays: [true, true, true, true, true, true, true],
    overrideExisting: false,
    reason: ''
  })

  const calendarDays = useMemo(() => {
    if (viewMode === 'month') {
      const start = startOfMonth(currentMonth)
      const end = endOfMonth(currentMonth)
      const startWeek = startOfWeek(start)
      const endWeek = endOfWeek(end)
      return eachDayOfInterval({ start: startWeek, end: endWeek })
    } else {
      const start = startOfWeek(currentMonth)
      const end = endOfWeek(currentMonth)
      return eachDayOfInterval({ start, end })
    }
  }, [currentMonth, viewMode])

  const getRateForDate = (date: Date, roomTypeId: string, ratePlanId: string): RateCalendar | null => {
    const dateTimestamp = date.setHours(0, 0, 0, 0)
    return rateCalendar.find(
      rc => rc.date === dateTimestamp && rc.roomTypeId === roomTypeId && rc.ratePlanId === ratePlanId
    ) || null
  }

  const getBaseRate = (roomTypeId: string, ratePlanId: string): number => {
    const roomType = roomTypes.find(rt => rt.id === roomTypeId)
    const ratePlan = ratePlans.find(rp => rp.id === ratePlanId)
    
    if (ratePlan?.baseRate) return ratePlan.baseRate
    if (roomType?.baseRate) return roomType.baseRate
    return 0
  }

  const handleCellClick = (date: Date) => {
    setSelectedDateForOverride(date)
    const existing = getRateForDate(date, selectedRoomType, selectedRatePlan)
    if (existing) {
      setOverrideRate(existing.rate.toString())
      setOverrideAvailability(existing.availability.toString())
      setOverrideReason(existing.overrideReason || '')
      setSelectedRestrictions(existing.restrictions || [])
    } else {
      const baseRate = getBaseRate(selectedRoomType, selectedRatePlan)
      setOverrideRate(baseRate.toString())
      setOverrideAvailability('10')
      setOverrideReason('')
      setSelectedRestrictions([])
    }
    setIsOverrideDialogOpen(true)
  }

  const handleOverrideSave = () => {
    if (!selectedDateForOverride) return

    const rate = parseFloat(overrideRate)
    const availability = parseInt(overrideAvailability)

    if (isNaN(rate) || rate < 0) {
      toast.error('Please enter a valid rate')
      return
    }

    if (isNaN(availability) || availability < 0) {
      toast.error('Please enter a valid availability')
      return
    }

    const dateTimestamp = selectedDateForOverride.setHours(0, 0, 0, 0)
    
    setRateCalendar((current) => {
      const existing = current.find(
        rc => rc.date === dateTimestamp && 
        rc.roomTypeId === selectedRoomType && 
        rc.ratePlanId === selectedRatePlan
      )

      if (existing) {
        return current.map(rc =>
          rc.id === existing.id
            ? {
                ...rc,
                rate,
                availability,
                restrictions: selectedRestrictions,
                isOverride: true,
                overrideReason,
                updatedAt: Date.now(),
                updatedBy: currentUser.id
              }
            : rc
        )
      } else {
        const newEntry: RateCalendar = {
          id: `rate-${Date.now()}-${Math.random()}`,
          roomTypeId: selectedRoomType,
          ratePlanId: selectedRatePlan,
          date: dateTimestamp,
          rate,
          availability,
          restrictions: selectedRestrictions,
          isOverride: true,
          overrideReason,
          createdAt: Date.now(),
          updatedAt: Date.now(),
          updatedBy: currentUser.id
        }
        return [...current, newEntry]
      }
    })

    toast.success('Rate override applied successfully')
    setIsOverrideDialogOpen(false)
    resetOverrideDialog()
  }

  const resetOverrideDialog = () => {
    setSelectedDateForOverride(null)
    setOverrideRate('')
    setOverrideAvailability('')
    setOverrideReason('')
    setSelectedRestrictions([])
  }

  const handleBulkUpdate = () => {
    if (bulkConfig.roomTypeIds.length === 0 || bulkConfig.ratePlanIds.length === 0) {
      toast.error('Please select at least one room type and rate plan')
      return
    }

    if (!bulkConfig.reason.trim()) {
      toast.error('Please provide a reason for bulk update')
      return
    }

    const days = eachDayOfInterval({
      start: bulkConfig.startDate,
      end: bulkConfig.endDate
    })

    const filteredDays = days.filter(day => {
      const dayOfWeek = day.getDay()
      return bulkConfig.applyToWeekdays[dayOfWeek]
    })

    let updatedCount = 0
    let createdCount = 0

    setRateCalendar((current) => {
      const newCalendar = [...current]

      bulkConfig.roomTypeIds.forEach(roomTypeId => {
        bulkConfig.ratePlanIds.forEach(ratePlanId => {
          filteredDays.forEach(day => {
            const dateTimestamp = day.setHours(0, 0, 0, 0)
            const existingIndex = newCalendar.findIndex(
              rc => rc.date === dateTimestamp && 
              rc.roomTypeId === roomTypeId && 
              rc.ratePlanId === ratePlanId
            )

            if (existingIndex >= 0) {
              if (bulkConfig.overrideExisting || !newCalendar[existingIndex].isOverride) {
                const currentRate = newCalendar[existingIndex].rate
                const newRate = bulkConfig.rateAdjustment.type === 'percentage'
                  ? currentRate * (1 + bulkConfig.rateAdjustment.value / 100)
                  : currentRate + bulkConfig.rateAdjustment.value

                newCalendar[existingIndex] = {
                  ...newCalendar[existingIndex],
                  rate: Math.round(newRate * 100) / 100,
                  restrictions: bulkConfig.restrictions.length > 0 
                    ? bulkConfig.restrictions 
                    : newCalendar[existingIndex].restrictions,
                  isOverride: true,
                  overrideReason: bulkConfig.reason,
                  updatedAt: Date.now(),
                  updatedBy: currentUser.id
                }
                updatedCount++
              }
            } else {
              const baseRate = getBaseRate(roomTypeId, ratePlanId)
              const newRate = bulkConfig.rateAdjustment.type === 'percentage'
                ? baseRate * (1 + bulkConfig.rateAdjustment.value / 100)
                : baseRate + bulkConfig.rateAdjustment.value

              newCalendar.push({
                id: `rate-${Date.now()}-${Math.random()}`,
                roomTypeId,
                ratePlanId,
                date: dateTimestamp,
                rate: Math.round(newRate * 100) / 100,
                availability: 10,
                restrictions: bulkConfig.restrictions,
                isOverride: true,
                overrideReason: bulkConfig.reason,
                createdAt: Date.now(),
                updatedAt: Date.now(),
                updatedBy: currentUser.id
              })
              createdCount++
            }
          })
        })
      })

      return newCalendar
    })

    toast.success(`Bulk update completed: ${createdCount} created, ${updatedCount} updated`)
    setIsBulkUpdateOpen(false)
  }

  const handleCopyRates = () => {
    const nextMonth = addMonths(currentMonth, 1)
    const currentMonthDays = eachDayOfInterval({
      start: startOfMonth(currentMonth),
      end: endOfMonth(currentMonth)
    })

    let copiedCount = 0

    setRateCalendar((current) => {
      const newCalendar = [...current]

      currentMonthDays.forEach((day, index) => {
        const currentDateTimestamp = day.setHours(0, 0, 0, 0)
        const nextMonthDay = addDays(startOfMonth(nextMonth), index)
        const nextDateTimestamp = nextMonthDay.setHours(0, 0, 0, 0)

        const currentRates = current.filter(rc => rc.date === currentDateTimestamp)

        currentRates.forEach(rate => {
          const existingInNext = newCalendar.find(
            rc => rc.date === nextDateTimestamp &&
            rc.roomTypeId === rate.roomTypeId &&
            rc.ratePlanId === rate.ratePlanId
          )

          if (!existingInNext) {
            newCalendar.push({
              ...rate,
              id: `rate-${Date.now()}-${Math.random()}`,
              date: nextDateTimestamp,
              createdAt: Date.now(),
              updatedAt: Date.now(),
              updatedBy: currentUser.id,
              overrideReason: `Copied from ${format(day, 'MMM d, yyyy')}`
            })
            copiedCount++
          }
        })
      })

      return newCalendar
    })

    toast.success(`Copied ${copiedCount} rates to next month`)
  }

  const toggleRestriction = (type: RestrictionType) => {
    setSelectedRestrictions(current => {
      const existing = current.find(r => r.type === type)
      if (existing) {
        return current.filter(r => r.type !== type)
      } else {
        return [...current, { type, isActive: true }]
      }
    })
  }

  const updateRestrictionValue = (type: RestrictionType, value: number) => {
    setSelectedRestrictions(current =>
      current.map(r => r.type === type ? { ...r, value } : r)
    )
  }

  const selectedRoomTypeData = roomTypes.find(rt => rt.id === selectedRoomType)
  const selectedRatePlanData = ratePlans.find(rp => rp.id === selectedRatePlan)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold">Rate Calendar</h2>
          <p className="text-muted-foreground text-sm mt-1">
            Manage rates, availability, and restrictions
          </p>
        </div>
        <div className="flex gap-2">
          <Button onClick={() => setIsBulkUpdateOpen(true)} variant="outline">
            <Rows size={16} className="mr-2" />
            Bulk Update
          </Button>
          <Button onClick={handleCopyRates} variant="outline">
            <Copy size={16} className="mr-2" />
            Copy to Next Month
          </Button>
        </div>
      </div>

      <Card className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div>
            <Label>Room Type</Label>
            <Select value={selectedRoomType} onValueChange={setSelectedRoomType}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {roomTypes.filter(rt => rt.isActive).map(rt => (
                  <SelectItem key={rt.id} value={rt.id}>
                    {rt.name} ({rt.code})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label>Rate Plan</Label>
            <Select value={selectedRatePlan} onValueChange={setSelectedRatePlan}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {ratePlans.filter(rp => rp.isActive).map(rp => (
                  <SelectItem key={rp.id} value={rp.id}>
                    {rp.name} ({rp.code})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label>View Mode</Label>
            <Select value={viewMode} onValueChange={(v) => setViewMode(v as 'month' | 'week')}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="month">Month</SelectItem>
                <SelectItem value="week">Week</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label>Base Rate</Label>
            <div className="flex items-center h-10 px-3 rounded-md border bg-muted/30">
              <CurrencyDollar size={16} className="mr-2 text-muted-foreground" />
              <span className="font-semibold">
                {formatCurrency(getBaseRate(selectedRoomType, selectedRatePlan))}
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentMonth(
                viewMode === 'month' ? subMonths(currentMonth, 1) : addDays(currentMonth, -7)
              )}
            >
              <ArrowLeft size={16} />
            </Button>
            <h3 className="text-lg font-semibold min-w-[200px] text-center">
              {viewMode === 'month' 
                ? format(currentMonth, 'MMMM yyyy')
                : `Week of ${format(startOfWeek(currentMonth), 'MMM d, yyyy')}`
              }
            </h3>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentMonth(
                viewMode === 'month' ? addMonths(currentMonth, 1) : addDays(currentMonth, 7)
              )}
            >
              <ArrowRight size={16} />
            </Button>
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentMonth(new Date())}
          >
            Today
          </Button>
        </div>

        <div className="border rounded-lg overflow-hidden">
          <div className="grid grid-cols-7 bg-muted">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
              <div key={day} className="p-3 text-center font-semibold text-sm border-r last:border-r-0">
                {day}
              </div>
            ))}
          </div>

          <div className="grid grid-cols-7">
            {calendarDays.map(day => {
              const rate = getRateForDate(day, selectedRoomType, selectedRatePlan)
              const isCurrentMonth = day.getMonth() === currentMonth.getMonth()
              const isToday = isSameDay(day, new Date())
              const baseRate = getBaseRate(selectedRoomType, selectedRatePlan)
              const displayRate = rate?.rate || baseRate
              const hasRestrictions = rate && rate.restrictions.length > 0

              return (
                <div
                  key={day.toISOString()}
                  className={`
                    min-h-[120px] p-2 border-r border-b last:border-r-0
                    cursor-pointer hover:bg-muted/50 transition-colors
                    ${!isCurrentMonth && 'bg-muted/20 text-muted-foreground'}
                    ${isToday && 'ring-2 ring-primary ring-inset'}
                    ${rate?.isOverride && 'bg-accent/10'}
                  `}
                  onClick={() => handleCellClick(day)}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className={`text-sm font-medium ${isToday && 'text-primary'}`}>
                      {format(day, 'd')}
                    </span>
                    {rate?.isOverride && (
                      <Lock size={12} className="text-primary" />
                    )}
                  </div>

                  <div className="space-y-1">
                    <div className="text-lg font-semibold">
                      {formatCurrency(displayRate)}
                    </div>
                    
                    {rate && (
                      <div className="text-xs text-muted-foreground">
                        Avail: {rate.availability}
                      </div>
                    )}

                    {hasRestrictions && (
                      <div className="flex flex-wrap gap-1 mt-1">
                        {rate.restrictions.filter(r => r.isActive).map(r => (
                          <Badge key={r.type} variant="secondary" className="text-[10px] px-1 py-0">
                            {r.type === 'min-stay' && `Min ${r.value}`}
                            {r.type === 'max-stay' && `Max ${r.value}`}
                            {r.type === 'cta' && 'CTA'}
                            {r.type === 'ctd' && 'CTD'}
                            {r.type === 'stop-sell' && 'Stop'}
                          </Badge>
                        ))}
                      </div>
                    )}

                    {!rate && (
                      <div className="text-xs text-muted-foreground">
                        Click to set
                      </div>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        <div className="mt-4 flex items-center gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 border-2 border-primary rounded"></div>
            <span>Today</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-accent/10 border rounded"></div>
            <span>Override</span>
          </div>
          <div className="flex items-center gap-2">
            <Lock size={14} />
            <span>Manual Override</span>
          </div>
        </div>
      </Card>

      <Dialog open={isOverrideDialogOpen} onOpenChange={setIsOverrideDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Rate Override - {selectedDateForOverride && format(selectedDateForOverride, 'MMMM d, yyyy')}</DialogTitle>
            <DialogDescription>
              {selectedRoomTypeData?.name} - {selectedRatePlanData?.name}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Rate</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={overrideRate}
                  onChange={(e) => setOverrideRate(e.target.value)}
                  placeholder="Enter rate"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Base rate: {formatCurrency(getBaseRate(selectedRoomType, selectedRatePlan))}
                </p>
              </div>

              <div>
                <Label>Availability</Label>
                <Input
                  type="number"
                  value={overrideAvailability}
                  onChange={(e) => setOverrideAvailability(e.target.value)}
                  placeholder="Enter availability"
                />
              </div>
            </div>

            <div>
              <Label>Reason for Override</Label>
              <Textarea
                value={overrideReason}
                onChange={(e) => setOverrideReason(e.target.value)}
                placeholder="Enter reason for this override..."
                rows={2}
              />
            </div>

            <div>
              <Label className="mb-3 block">Restrictions</Label>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-2">
                    <Checkbox
                      checked={selectedRestrictions.some(r => r.type === 'min-stay')}
                      onCheckedChange={() => toggleRestriction('min-stay')}
                    />
                    <Label>Minimum Stay</Label>
                  </div>
                  {selectedRestrictions.some(r => r.type === 'min-stay') && (
                    <Input
                      type="number"
                      className="w-20"
                      value={selectedRestrictions.find(r => r.type === 'min-stay')?.value || 1}
                      onChange={(e) => updateRestrictionValue('min-stay', parseInt(e.target.value))}
                      min="1"
                    />
                  )}
                </div>

                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-2">
                    <Checkbox
                      checked={selectedRestrictions.some(r => r.type === 'max-stay')}
                      onCheckedChange={() => toggleRestriction('max-stay')}
                    />
                    <Label>Maximum Stay</Label>
                  </div>
                  {selectedRestrictions.some(r => r.type === 'max-stay') && (
                    <Input
                      type="number"
                      className="w-20"
                      value={selectedRestrictions.find(r => r.type === 'max-stay')?.value || 7}
                      onChange={(e) => updateRestrictionValue('max-stay', parseInt(e.target.value))}
                      min="1"
                    />
                  )}
                </div>

                <div className="flex items-center gap-2 p-3 border rounded-lg">
                  <Checkbox
                    checked={selectedRestrictions.some(r => r.type === 'cta')}
                    onCheckedChange={() => toggleRestriction('cta')}
                  />
                  <Label>Closed to Arrival (CTA)</Label>
                </div>

                <div className="flex items-center gap-2 p-3 border rounded-lg">
                  <Checkbox
                    checked={selectedRestrictions.some(r => r.type === 'ctd')}
                    onCheckedChange={() => toggleRestriction('ctd')}
                  />
                  <Label>Closed to Departure (CTD)</Label>
                </div>

                <div className="flex items-center gap-2 p-3 border rounded-lg">
                  <Checkbox
                    checked={selectedRestrictions.some(r => r.type === 'stop-sell')}
                    onCheckedChange={() => toggleRestriction('stop-sell')}
                  />
                  <Label>Stop Sell</Label>
                </div>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsOverrideDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleOverrideSave}>
              Save Override
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isBulkUpdateOpen} onOpenChange={setIsBulkUpdateOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Bulk Rate Update</DialogTitle>
            <DialogDescription>
              Update rates for multiple room types and rate plans
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Start Date</Label>
                <Input
                  type="date"
                  value={format(bulkConfig.startDate, 'yyyy-MM-dd')}
                  onChange={(e) => setBulkConfig({
                    ...bulkConfig,
                    startDate: new Date(e.target.value)
                  })}
                />
              </div>

              <div>
                <Label>End Date</Label>
                <Input
                  type="date"
                  value={format(bulkConfig.endDate, 'yyyy-MM-dd')}
                  onChange={(e) => setBulkConfig({
                    ...bulkConfig,
                    endDate: new Date(e.target.value)
                  })}
                />
              </div>
            </div>

            <div>
              <Label className="mb-2 block">Room Types</Label>
              <div className="space-y-2 max-h-40 overflow-y-auto border rounded-lg p-3">
                {roomTypes.filter(rt => rt.isActive).map(rt => (
                  <div key={rt.id} className="flex items-center gap-2">
                    <Checkbox
                      checked={bulkConfig.roomTypeIds.includes(rt.id)}
                      onCheckedChange={(checked) => {
                        setBulkConfig({
                          ...bulkConfig,
                          roomTypeIds: checked
                            ? [...bulkConfig.roomTypeIds, rt.id]
                            : bulkConfig.roomTypeIds.filter(id => id !== rt.id)
                        })
                      }}
                    />
                    <Label>{rt.name} ({rt.code})</Label>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <Label className="mb-2 block">Rate Plans</Label>
              <div className="space-y-2 max-h-40 overflow-y-auto border rounded-lg p-3">
                {ratePlans.filter(rp => rp.isActive).map(rp => (
                  <div key={rp.id} className="flex items-center gap-2">
                    <Checkbox
                      checked={bulkConfig.ratePlanIds.includes(rp.id)}
                      onCheckedChange={(checked) => {
                        setBulkConfig({
                          ...bulkConfig,
                          ratePlanIds: checked
                            ? [...bulkConfig.ratePlanIds, rp.id]
                            : bulkConfig.ratePlanIds.filter(id => id !== rp.id)
                        })
                      }}
                    />
                    <Label>{rp.name} ({rp.code})</Label>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <Label className="mb-2 block">Rate Adjustment</Label>
              <div className="grid grid-cols-2 gap-4">
                <Select
                  value={bulkConfig.rateAdjustment.type}
                  onValueChange={(value: 'fixed' | 'percentage') =>
                    setBulkConfig({
                      ...bulkConfig,
                      rateAdjustment: { ...bulkConfig.rateAdjustment, type: value }
                    })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="percentage">Percentage</SelectItem>
                    <SelectItem value="fixed">Fixed Amount</SelectItem>
                  </SelectContent>
                </Select>

                <Input
                  type="number"
                  step="0.01"
                  value={bulkConfig.rateAdjustment.value}
                  onChange={(e) => setBulkConfig({
                    ...bulkConfig,
                    rateAdjustment: {
                      ...bulkConfig.rateAdjustment,
                      value: parseFloat(e.target.value)
                    }
                  })}
                  placeholder={bulkConfig.rateAdjustment.type === 'percentage' ? '10 (for 10%)' : '50 (for $50)'}
                />
              </div>
            </div>

            <div>
              <Label className="mb-2 block">Apply to Days of Week</Label>
              <div className="grid grid-cols-7 gap-2">
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day, index) => (
                  <div key={day} className="flex flex-col items-center gap-1">
                    <Checkbox
                      checked={bulkConfig.applyToWeekdays[index]}
                      onCheckedChange={(checked) => {
                        const newWeekdays = [...bulkConfig.applyToWeekdays]
                        newWeekdays[index] = checked as boolean
                        setBulkConfig({ ...bulkConfig, applyToWeekdays: newWeekdays })
                      }}
                    />
                    <Label className="text-xs">{day}</Label>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex items-center gap-2 p-3 border rounded-lg">
              <Checkbox
                checked={bulkConfig.overrideExisting}
                onCheckedChange={(checked) =>
                  setBulkConfig({ ...bulkConfig, overrideExisting: checked as boolean })
                }
              />
              <div>
                <Label>Override Existing Rates</Label>
                <p className="text-xs text-muted-foreground">
                  Apply changes even to dates with existing overrides
                </p>
              </div>
            </div>

            <div>
              <Label>Reason for Bulk Update</Label>
              <Textarea
                value={bulkConfig.reason}
                onChange={(e) => setBulkConfig({ ...bulkConfig, reason: e.target.value })}
                placeholder="Enter reason for this bulk update..."
                rows={3}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsBulkUpdateOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleBulkUpdate}>
              Apply Bulk Update
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
