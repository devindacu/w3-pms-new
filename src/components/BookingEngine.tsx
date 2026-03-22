import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Separator } from '@/components/ui/separator'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { toast } from 'sonner'
import { Plus, Minus, Rows, Columns, Tag, Users, CalendarBlank, X } from '@phosphor-icons/react'
import type { Room, Reservation } from '@/lib/types'
import { generateId } from '@/lib/helpers'
import { BOOKING_LS_KEYS } from '@/components/BookingWidgetAdmin'

// ─── Types ────────────────────────────────────────────────────────────────────

interface RateBreakdown {
  label: string
  amount: number
}

interface RateQuote {
  roomId: number
  ratePlanId: number
  ratePlanName: string
  checkIn: string
  checkOut: string
  nights: number
  rateType: 'resident' | 'nonResident'
  baseRatePerNight: number
  seasonalMultiplier: number
  adjustedRatePerNight: number
  subtotal: number
  promoDiscount: number
  afterPromo: number
  serviceCharge: number
  tax: number
  totalAmount: number
  currency: string
  promoCode?: string
  breakdown: RateBreakdown[]
}

interface RoomWithQuote {
  id: number
  number: string
  type: string
  floor: number | null
  capacity: number | null
  baseRate: string
  status: string
  amenities: string | null
  description: string | null
  quote: RateQuote
}

interface GuestDetails {
  firstName: string
  lastName: string
  email: string
  phone: string
  specialRequests: string
}

interface BookingResult {
  success: boolean
  confirmationNumber: string
  reservationId: number
  quote: RateQuote
  guestDetails: GuestDetails
}

// ─── Country list (abbreviated) ──────────────────────────────────────────────
const COUNTRIES = [
  { code: 'KE', name: 'Kenya' },
  { code: 'TZ', name: 'Tanzania' },
  { code: 'UG', name: 'Uganda' },
  { code: 'RW', name: 'Rwanda' },
  { code: 'ET', name: 'Ethiopia' },
  { code: 'ZA', name: 'South Africa' },
  { code: 'NG', name: 'Nigeria' },
  { code: 'GH', name: 'Ghana' },
  { code: 'GB', name: 'United Kingdom' },
  { code: 'US', name: 'United States' },
  { code: 'DE', name: 'Germany' },
  { code: 'FR', name: 'France' },
  { code: 'IN', name: 'India' },
  { code: 'CN', name: 'China' },
  { code: 'JP', name: 'Japan' },
  { code: 'AU', name: 'Australia' },
  { code: 'CA', name: 'Canada' },
  { code: 'AE', name: 'UAE' },
  { code: 'SA', name: 'Saudi Arabia' },
  { code: 'OTHER', name: 'Other' },
]

// ─── Step 1: Search ───────────────────────────────────────────────────────────

interface RoomEntry {
  adults: number
  children: number
}

interface SearchParams {
  checkIn: string
  checkOut: string
  adults: number
  children: number
  guestCountry: string
  nationality: 'resident' | 'non-resident'
  rooms: RoomEntry[]
  promoCode: string
}

type WidgetLayout = 'horizontal' | 'vertical'

// Counter component for adults/children
function Counter({ value, onChange, min = 0, max = 10, label }: {
  value: number
  onChange: (v: number) => void
  min?: number
  max?: number
  label: string
}) {
  return (
    <div className="flex items-center gap-2">
      <Button
        type="button"
        variant="outline"
        size="icon"
        className="h-8 w-8 shrink-0"
        onClick={() => onChange(Math.max(min, value - 1))}
        disabled={value <= min}
        aria-label={`Decrease ${label}`}
      >
        <Minus size={12} />
      </Button>
      <span className="w-6 text-center font-medium text-sm tabular-nums">{value}</span>
      <Button
        type="button"
        variant="outline"
        size="icon"
        className="h-8 w-8 shrink-0"
        onClick={() => onChange(Math.min(max, value + 1))}
        disabled={value >= max}
        aria-label={`Increase ${label}`}
      >
        <Plus size={12} />
      </Button>
    </div>
  )
}

function SearchPage({ onSearch, layout = 'vertical' }: { onSearch: (p: SearchParams) => void; layout?: WidgetLayout }) {
  const today = new Date().toISOString().split('T')[0]
  const tomorrow = new Date(Date.now() + 86400000).toISOString().split('T')[0]
  const [params, setParams] = useState<SearchParams>({
    checkIn: today,
    checkOut: tomorrow,
    adults: 1,
    children: 0,
    guestCountry: 'LK',
    nationality: 'resident',
    rooms: [{ adults: 1, children: 0 }],
    promoCode: '',
  })
  const [showPromoInput, setShowPromoInput] = useState(false)
  const [promoInput, setPromoInput] = useState('')

  function addRoom() {
    setParams(p => ({
      ...p,
      rooms: [...p.rooms, { adults: 1, children: 0 }],
    }))
  }

  function removeRoom(index: number) {
    setParams(p => ({
      ...p,
      rooms: p.rooms.filter((_, i) => i !== index),
    }))
  }

  function updateRoom(index: number, field: keyof RoomEntry, value: number) {
    setParams(p => ({
      ...p,
      rooms: p.rooms.map((r, i) => i === index ? { ...r, [field]: value } : r),
    }))
  }

  function handle() {
    if (!params.checkIn || !params.checkOut) {
      toast.error('Please select check-in and check-out dates')
      return
    }
    if (params.checkOut <= params.checkIn) {
      toast.error('Check-out must be after check-in')
      return
    }
    // Aggregate adults/children from all rooms
    const totalAdults = params.rooms.reduce((sum, r) => sum + r.adults, 0)
    const totalChildren = params.rooms.reduce((sum, r) => sum + r.children, 0)
    onSearch({
      ...params,
      adults: totalAdults,
      children: totalChildren,
      promoCode: promoInput,
    })
  }

  const isHorizontal = layout === 'horizontal'

  return (
    <div className={isHorizontal ? 'w-full' : 'max-w-2xl mx-auto'}>
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            <CalendarBlank size={20} className="text-primary" />
            Search Available Rooms
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className={isHorizontal
            ? 'flex flex-wrap gap-4 items-end'
            : 'space-y-4'
          }>
            {/* Dates */}
            <div className={isHorizontal ? 'flex gap-3 flex-1 min-w-[260px]' : 'grid grid-cols-1 sm:grid-cols-2 gap-4'}>
              <div className="space-y-1 flex-1">
                <Label>Check-in Date</Label>
                <Input
                  type="date"
                  min={today}
                  value={params.checkIn}
                  onChange={e => setParams(p => ({ ...p, checkIn: e.target.value }))}
                />
              </div>
              <div className="space-y-1 flex-1">
                <Label>Check-out Date</Label>
                <Input
                  type="date"
                  min={params.checkIn || today}
                  value={params.checkOut}
                  onChange={e => setParams(p => ({ ...p, checkOut: e.target.value }))}
                />
              </div>
            </div>

            {/* Nationality */}
            <div className={isHorizontal ? 'space-y-1 min-w-[180px]' : 'space-y-1'}>
              <Label>Nationality</Label>
              <Select
                value={params.nationality}
                onValueChange={v => setParams(p => ({ ...p, nationality: v as 'resident' | 'non-resident' }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="resident">🏠 Resident</SelectItem>
                  <SelectItem value="non-resident">✈️ Non-Resident</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Rooms */}
            <div className={isHorizontal ? 'flex-1 min-w-[280px]' : ''}>
              <div className="flex items-center justify-between mb-2">
                <Label className="flex items-center gap-1.5">
                  <Users size={14} />
                  Rooms & Guests
                </Label>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="h-7 text-xs gap-1"
                  onClick={addRoom}
                >
                  <Plus size={11} />
                  Add Room
                </Button>
              </div>
              <div className="space-y-2">
                {params.rooms.map((room, index) => (
                  <div
                    key={index}
                    className="flex flex-wrap items-center gap-3 p-2.5 rounded-lg border bg-muted/30"
                  >
                    <span className="text-xs font-medium text-muted-foreground w-14 shrink-0">
                      Room {index + 1}
                    </span>
                    <div className="flex items-center gap-2 flex-1 flex-wrap">
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-muted-foreground">Adults</span>
                        <Counter
                          value={room.adults}
                          onChange={v => updateRoom(index, 'adults', v)}
                          min={1}
                          label="adults"
                        />
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-muted-foreground">Children</span>
                        <Counter
                          value={room.children}
                          onChange={v => updateRoom(index, 'children', v)}
                          label="children"
                        />
                      </div>
                    </div>
                    {params.rooms.length > 1 && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6 text-muted-foreground hover:text-destructive"
                        onClick={() => removeRoom(index)}
                        aria-label="Remove room"
                      >
                        <X size={12} />
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Promo code */}
            <div className={isHorizontal ? 'space-y-1 min-w-[160px]' : 'space-y-1'}>
              {!showPromoInput ? (
                <button
                  type="button"
                  className="flex items-center gap-1.5 text-sm text-primary hover:text-primary/80 transition-colors mt-4"
                  onClick={() => setShowPromoInput(true)}
                >
                  <Tag size={14} />
                  Add Promo Code
                </button>
              ) : (
                <>
                  <Label>Promo Code</Label>
                  <div className="flex gap-2">
                    <Input
                      placeholder="Enter promo code"
                      value={promoInput}
                      onChange={e => setPromoInput(e.target.value.toUpperCase())}
                      className="uppercase"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => { setShowPromoInput(false); setPromoInput('') }}
                    >
                      <X size={14} />
                    </Button>
                  </div>
                </>
              )}
            </div>

            {/* Search button */}
            <div className={isHorizontal ? 'shrink-0' : ''}>
              <Button
                className={isHorizontal ? 'h-10 px-6 mt-5' : 'w-full mt-2'}
                onClick={handle}
              >
                Find Rooms
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

// ─── Step 2: Room Selection ───────────────────────────────────────────────────

function RoomSelectionPage({
  rooms,
  searchParams,
  loading,
  promoCode,
  onPromoChange,
  onApplyPromo,
  onSelect,
  onBack,
}: {
  rooms: RoomWithQuote[]
  searchParams: SearchParams
  loading: boolean
  promoCode: string
  onPromoChange: (v: string) => void
  onApplyPromo: () => void
  onSelect: (room: RoomWithQuote) => void
  onBack: () => void
}) {
  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-muted-foreground animate-pulse">Searching for available rooms…</p>
      </div>
    )
  }

  const nights = Math.max(
    1,
    Math.round(
      (new Date(searchParams.checkOut).getTime() - new Date(searchParams.checkIn).getTime()) / 86400000
    )
  )

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold">Available Rooms</h2>
          <p className="text-sm text-muted-foreground">
            {searchParams.checkIn} → {searchParams.checkOut} · {nights} night{nights > 1 ? 's' : ''} · {searchParams.adults} adult{searchParams.adults > 1 ? 's' : ''}
          </p>
        </div>
        <Button variant="outline" onClick={onBack}>← Back</Button>
      </div>

      <div className="flex gap-2 max-w-sm">
        <Input
          placeholder="Promo code"
          value={promoCode}
          onChange={e => onPromoChange(e.target.value.toUpperCase())}
        />
        <Button variant="outline" onClick={onApplyPromo}>Apply</Button>
      </div>

      {rooms.length === 0 ? (
        <Card>
          <CardContent className="py-10 text-center text-muted-foreground">
            No rooms available for the selected dates. Please try different dates.
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {rooms.map(room => (
            <Card key={room.id} className="hover:shadow-md transition-shadow">
              <CardContent className="pt-5 space-y-3">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="font-semibold text-lg">Room {room.number}</p>
                    <p className="text-sm text-muted-foreground capitalize">{room.type}</p>
                    {room.floor !== null && (
                      <p className="text-xs text-muted-foreground">Floor {room.floor}</p>
                    )}
                  </div>
                  <div className="text-right">
                    <Badge variant={room.quote.rateType === 'resident' ? 'default' : 'secondary'}>
                      {room.quote.rateType === 'resident' ? 'Resident' : 'Non-Resident'}
                    </Badge>
                  </div>
                </div>
                {room.description && (
                  <p className="text-sm text-muted-foreground">{room.description}</p>
                )}
                <Separator />
                <div className="text-sm space-y-1">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Rate/night</span>
                    <span>{room.quote.currency} {room.quote.adjustedRatePerNight.toFixed(2)}</span>
                  </div>
                  {room.quote.promoDiscount > 0 && (
                    <div className="flex justify-between text-green-600">
                      <span>Promo discount</span>
                      <span>-{room.quote.currency} {room.quote.promoDiscount.toFixed(2)}</span>
                    </div>
                  )}
                  <div className="flex justify-between font-semibold pt-1">
                    <span>Total ({nights} night{nights > 1 ? 's' : ''})</span>
                    <span>{room.quote.currency} {room.quote.totalAmount.toFixed(2)}</span>
                  </div>
                  <p className="text-xs text-muted-foreground">Incl. service charge & tax</p>
                </div>
                <Button className="w-full" onClick={() => onSelect(room)}>
                  Select Room
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}

// ─── Step 3: Add-Ons ─────────────────────────────────────────────────────────

const ADD_ONS = [
  { id: 'breakfast', label: 'Daily Breakfast', price: 1500 },
  { id: 'airport_transfer', label: 'Airport Transfer', price: 3500 },
  { id: 'welcome_fruit', label: 'Welcome Fruit Basket', price: 800 },
  { id: 'late_checkout', label: 'Late Checkout (2pm)', price: 2000 },
  { id: 'early_checkin', label: 'Early Check-in (10am)', price: 2000 },
]

function AddOnsPage({
  selected,
  onToggle,
  onNext,
  onBack,
  currency,
}: {
  selected: string[]
  onToggle: (id: string) => void
  onNext: () => void
  onBack: () => void
  currency: string
}) {
  return (
    <div className="max-w-xl mx-auto space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Enhance Your Stay</h2>
        <Button variant="outline" onClick={onBack}>← Back</Button>
      </div>
      <Card>
        <CardContent className="pt-5 space-y-3">
          {ADD_ONS.map(addon => (
            <div
              key={addon.id}
              className="flex items-center justify-between p-3 rounded-md border cursor-pointer hover:bg-muted/50 transition-colors"
              onClick={() => onToggle(addon.id)}
            >
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  readOnly
                  checked={selected.includes(addon.id)}
                  className="w-4 h-4"
                />
                <span className="font-medium">{addon.label}</span>
              </div>
              <span className="text-sm text-muted-foreground">{currency} {addon.price.toLocaleString()}</span>
            </div>
          ))}
        </CardContent>
      </Card>
      <Button className="w-full" onClick={onNext}>Continue to Guest Details →</Button>
    </div>
  )
}

// ─── Step 4: Checkout ─────────────────────────────────────────────────────────

function CheckoutPage({
  selectedRoom,
  guestDetails,
  onChange,
  onSubmit,
  onBack,
  submitting,
}: {
  selectedRoom: RoomWithQuote
  guestDetails: GuestDetails
  onChange: (field: keyof GuestDetails, value: string) => void
  onSubmit: () => void
  onBack: () => void
  submitting: boolean
}) {
  const q = selectedRoom.quote
  return (
    <div className="max-w-2xl mx-auto space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Your Details</h2>
        <Button variant="outline" onClick={onBack}>← Back</Button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Guest form */}
        <Card>
          <CardHeader><CardTitle className="text-base">Guest Information</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label>First Name *</Label>
                <Input value={guestDetails.firstName} onChange={e => onChange('firstName', e.target.value)} />
              </div>
              <div className="space-y-1">
                <Label>Last Name *</Label>
                <Input value={guestDetails.lastName} onChange={e => onChange('lastName', e.target.value)} />
              </div>
            </div>
            <div className="space-y-1">
              <Label>Email *</Label>
              <Input type="email" value={guestDetails.email} onChange={e => onChange('email', e.target.value)} />
            </div>
            <div className="space-y-1">
              <Label>Phone *</Label>
              <Input type="tel" value={guestDetails.phone} onChange={e => onChange('phone', e.target.value)} />
            </div>
            <div className="space-y-1">
              <Label>Special Requests</Label>
              <Input value={guestDetails.specialRequests} onChange={e => onChange('specialRequests', e.target.value)} placeholder="Optional" />
            </div>
          </CardContent>
        </Card>
        {/* Price summary */}
        <Card>
          <CardHeader><CardTitle className="text-base">Booking Summary</CardTitle></CardHeader>
          <CardContent className="space-y-2 text-sm">
            <p className="font-medium">Room {selectedRoom.number} · {selectedRoom.type}</p>
            <p className="text-muted-foreground">{q.checkIn} → {q.checkOut} · {q.nights} night{q.nights > 1 ? 's' : ''}</p>
            <Separator />
            {q.breakdown.map((b, i) => (
              <div key={i} className={`flex justify-between ${b.amount < 0 ? 'text-green-600' : ''}`}>
                <span>{b.label}</span>
                <span>{b.amount < 0 ? '-' : ''}{q.currency} {Math.abs(b.amount).toFixed(2)}</span>
              </div>
            ))}
            <Separator />
            <div className="flex justify-between font-semibold">
              <span>Total</span>
              <span>{q.currency} {q.totalAmount.toFixed(2)}</span>
            </div>
            <p className="text-xs text-muted-foreground">Rate plan: {q.ratePlanName}</p>
            <Badge variant={q.rateType === 'resident' ? 'default' : 'secondary'} className="mt-1">
              {q.rateType === 'resident' ? 'Resident Rate' : 'Non-Resident Rate'}
            </Badge>
          </CardContent>
        </Card>
      </div>
      <Button
        className="w-full"
        onClick={onSubmit}
        disabled={submitting}
      >
        {submitting ? 'Confirming Booking…' : `Confirm Booking · ${q.currency} ${q.totalAmount.toFixed(2)}`}
      </Button>
    </div>
  )
}

// ─── Step 5: Confirmation ─────────────────────────────────────────────────────

function ConfirmationPage({
  result,
  onNewSearch,
}: {
  result: BookingResult
  onNewSearch: () => void
}) {
  const q = result.quote
  return (
    <div className="max-w-lg mx-auto space-y-4">
      <Card className="border-green-200 bg-green-50 dark:bg-green-950/20">
        <CardContent className="pt-6 text-center space-y-2">
          <div className="text-4xl">✓</div>
          <h2 className="text-xl font-bold text-green-700 dark:text-green-400">Booking Confirmed!</h2>
          <p className="text-lg font-mono font-semibold">{result.confirmationNumber}</p>
          <p className="text-sm text-muted-foreground">
            A confirmation has been recorded. Reference: #{result.reservationId}
          </p>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="pt-5 space-y-3 text-sm">
          <div className="grid grid-cols-2 gap-2">
            <div>
              <p className="text-muted-foreground">Guest</p>
              <p className="font-medium">{result.guestDetails.firstName} {result.guestDetails.lastName}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Email</p>
              <p className="font-medium">{result.guestDetails.email}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Check-in</p>
              <p className="font-medium">{q.checkIn}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Check-out</p>
              <p className="font-medium">{q.checkOut}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Duration</p>
              <p className="font-medium">{q.nights} night{q.nights > 1 ? 's' : ''}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Total Amount</p>
              <p className="font-medium">{q.currency} {q.totalAmount.toFixed(2)}</p>
            </div>
          </div>
        </CardContent>
      </Card>
      <Button className="w-full" variant="outline" onClick={onNewSearch}>Make Another Booking</Button>
    </div>
  )
}

// ─── Main Component ───────────────────────────────────────────────────────────

type Step = 'search' | 'rooms' | 'addons' | 'checkout' | 'confirmation'

interface BookingEngineProps {
  rooms?: Room[]
  reservations?: Reservation[]
  onNewReservation?: (data: Omit<Reservation, 'id' | 'createdAt' | 'updatedAt'>) => void
}

export function BookingEngine({ rooms: hotelRooms = [], reservations: hotelReservations = [], onNewReservation }: BookingEngineProps) {
  const [step, setStep] = useState<Step>('search')
  const [searchParams, setSearchParams] = useState<SearchParams | null>(null)
  const [rooms, setRooms] = useState<RoomWithQuote[]>([])
  const [loadingRooms, setLoadingRooms] = useState(false)
  const [selectedRoom, setSelectedRoom] = useState<RoomWithQuote | null>(null)
  const [promoCode, setPromoCode] = useState('')
  const [addOns, setAddOns] = useState<string[]>([])
  const [submitting, setSubmitting] = useState(false)
  const [bookingResult, setBookingResult] = useState<BookingResult | null>(null)
  const [widgetLayout, setWidgetLayout] = useState<WidgetLayout>('vertical')
  const [currency] = useState(() => {
    try { return JSON.parse(localStorage.getItem(BOOKING_LS_KEYS.widgetSettings) || '{}').currencyCode || 'LKR' } catch (e) { console.warn('Failed to read widget settings:', e); return 'LKR' }
  })
  const [guestDetails, setGuestDetails] = useState<GuestDetails>({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    specialRequests: '',
  })

  function calculateAvailability(params: SearchParams) {
    setLoadingRooms(true)
    try {
      const checkInTs = new Date(params.checkIn).getTime()
      const checkOutTs = new Date(params.checkOut).getTime()
      const nights = Math.max(1, Math.round((checkOutTs - checkInTs) / 86400000))

      // Rooms already booked in this date range
      const bookedRoomIds = new Set(
        hotelReservations
          .filter(r => ['confirmed', 'checked-in'].includes(r.status) && r.roomId)
          .filter(r => r.checkInDate < checkOutTs && r.checkOutDate > checkInTs)
          .map(r => r.roomId)
      )

      const TAX_RATE = 0.16
      const SERVICE_CHARGE_RATE = 0.05

      const availableRooms: RoomWithQuote[] = hotelRooms
        .filter(room => !['out-of-order', 'maintenance'].includes(room.status) && !bookedRoomIds.has(room.id))
        .filter(room => room.maxOccupancy >= params.adults)
        .map((room, idx) => {
          const numericId = parseInt(room.id) || (idx + 1)
          const baseRate = room.baseRate
          const subtotal = baseRate * nights
          const serviceCharge = subtotal * SERVICE_CHARGE_RATE
          const tax = (subtotal + serviceCharge) * TAX_RATE
          const totalAmount = subtotal + serviceCharge + tax

          return {
            id: numericId,
            number: room.roomNumber,
            type: room.roomType,
            floor: room.floor,
            capacity: room.maxOccupancy,
            baseRate: String(room.baseRate),
            status: room.status,
            amenities: room.amenities.join(', '),
            description: null,
            quote: {
              roomId: numericId,
              ratePlanId: 1,
              ratePlanName: 'Standard Rate',
              checkIn: params.checkIn,
              checkOut: params.checkOut,
              nights,
              rateType: params.nationality === 'resident' ? 'resident' : 'nonResident',
              baseRatePerNight: baseRate,
              seasonalMultiplier: 1,
              adjustedRatePerNight: baseRate,
              subtotal,
              promoDiscount: 0,
              afterPromo: subtotal,
              serviceCharge,
              tax,
              totalAmount,
              currency,
              breakdown: [
                { label: `Room rate × ${nights} night${nights !== 1 ? 's' : ''}`, amount: subtotal },
                { label: 'Service charge (5%)', amount: serviceCharge },
                { label: 'Tax (16%)', amount: tax },
              ],
            },
          }
        })

      setRooms(availableRooms)
      setStep('rooms')
    } catch {
      toast.error('Error calculating availability')
    } finally {
      setLoadingRooms(false)
    }
  }

  async function applyPromo() {
    if (!searchParams) return
    calculateAvailability(searchParams)
  }

  async function handleReserve() {
    if (!selectedRoom || !searchParams) return
    if (!guestDetails.firstName || !guestDetails.lastName || !guestDetails.email || !guestDetails.phone) {
      toast.error('Please fill in all required guest fields')
      return
    }
    setSubmitting(true)
    try {
      const confirmationNumber = `BK${generateId().toUpperCase()}`

      onNewReservation?.({
        guestId: '',
        roomId: String(selectedRoom.id),
        checkInDate: new Date(searchParams.checkIn).getTime(),
        checkOutDate: new Date(searchParams.checkOut).getTime(),
        adults: searchParams.adults,
        children: searchParams.children,
        status: 'confirmed',
        ratePerNight: selectedRoom.quote.adjustedRatePerNight,
        totalAmount: selectedRoom.quote.totalAmount,
        advancePaid: 0,
        source: 'booking-engine',
        specialRequests: guestDetails.specialRequests,
        createdBy: 'booking-engine',
      })

      setBookingResult({
        success: true,
        confirmationNumber,
        reservationId: parseInt(generateId().replace(/\D/g, '').slice(0, 9)) || 1,
        quote: selectedRoom.quote,
        guestDetails,
      })
      setStep('confirmation')
      toast.success('Booking confirmed!')
    } catch {
      toast.error('Booking failed. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  function resetAll() {
    setStep('search')
    setSearchParams(null)
    setRooms([])
    setSelectedRoom(null)
    setPromoCode('')
    setAddOns([])
    setBookingResult(null)
    setGuestDetails({ firstName: '', lastName: '', email: '', phone: '', specialRequests: '' })
  }

  // Step indicator
  const STEPS: { key: Step; label: string }[] = [
    { key: 'search', label: 'Search' },
    { key: 'rooms', label: 'Select Room' },
    { key: 'addons', label: 'Add-Ons' },
    { key: 'checkout', label: 'Guest Details' },
    { key: 'confirmation', label: 'Confirmation' },
  ]
  const stepIndex = STEPS.findIndex(s => s.key === step)

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Booking Engine</h1>
          <p className="text-muted-foreground text-sm">Direct booking portal with real-time pricing</p>
        </div>
        {step === 'search' && (
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground">Layout:</span>
            <Tabs value={widgetLayout} onValueChange={v => setWidgetLayout(v as WidgetLayout)}>
              <TabsList className="h-8">
                <TabsTrigger value="vertical" className="h-7 px-2.5 gap-1.5 text-xs">
                  <Rows size={13} />
                  Vertical
                </TabsTrigger>
                <TabsTrigger value="horizontal" className="h-7 px-2.5 gap-1.5 text-xs">
                  <Columns size={13} />
                  Horizontal
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
        )}
      </div>

      {/* Step indicator */}
      {step !== 'confirmation' && (
        <div className="flex items-center gap-1 overflow-x-auto pb-1">
          {STEPS.filter(s => s.key !== 'confirmation').map((s, i) => (
            <div key={s.key} className="flex items-center gap-1 shrink-0">
              <div
                className={`flex items-center justify-center w-7 h-7 rounded-full text-xs font-semibold transition-colors ${
                  i < stepIndex
                    ? 'bg-primary text-primary-foreground'
                    : i === stepIndex
                    ? 'bg-primary text-primary-foreground ring-2 ring-primary ring-offset-2'
                    : 'bg-muted text-muted-foreground'
                }`}
              >
                {i < stepIndex ? '✓' : i + 1}
              </div>
              <span className={`text-xs hidden sm:inline ${i === stepIndex ? 'font-medium' : 'text-muted-foreground'}`}>
                {s.label}
              </span>
              {i < STEPS.filter(s2 => s2.key !== 'confirmation').length - 1 && (
                <div className="w-6 h-px bg-border mx-1" />
              )}
            </div>
          ))}
        </div>
      )}

      {/* Pages */}
      {step === 'search' && (
        <SearchPage
          layout={widgetLayout}
          onSearch={params => {
            setSearchParams(params)
            calculateAvailability(params)
          }}
        />
      )}

      {step === 'rooms' && searchParams && (
        <RoomSelectionPage
          rooms={rooms}
          searchParams={searchParams}
          loading={loadingRooms}
          promoCode={promoCode}
          onPromoChange={setPromoCode}
          onApplyPromo={applyPromo}
          onSelect={room => {
            setSelectedRoom(room)
            setStep('addons')
          }}
          onBack={() => setStep('search')}
        />
      )}

      {step === 'addons' && (
        <AddOnsPage
          selected={addOns}
          onToggle={id => setAddOns(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id])}
          onNext={() => setStep('checkout')}
          onBack={() => setStep('rooms')}
          currency={currency}
        />
      )}

      {step === 'checkout' && selectedRoom && (
        <CheckoutPage
          selectedRoom={selectedRoom}
          guestDetails={guestDetails}
          onChange={(field, value) => setGuestDetails(prev => ({ ...prev, [field]: value }))}
          onSubmit={handleReserve}
          onBack={() => setStep('addons')}
          submitting={submitting}
        />
      )}

      {step === 'confirmation' && bookingResult && (
        <ConfirmationPage result={bookingResult} onNewSearch={resetAll} />
      )}
    </div>
  )
}
