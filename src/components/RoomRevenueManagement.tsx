import { useState } from 'react'
import { useKV } from '@github/spark/hooks'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Plus,
  Bed,
  MagnifyingGlass,
  PencilSimple,
  Trash,
  Eye,
  Broom,
  Wrench,
  Check,
  X,
  FunnelSimple,
  Tag,
  CurrencyDollar,
  Calendar as CalendarIcon,
  TrendUp,
  Buildings,
  Percent,
  Users,
  ChartLine,
  Brain
} from '@phosphor-icons/react'
import type { Room, RoomStatus, RoomType, RoomTypeConfig, RatePlanConfig, Season, EventDay, CorporateAccount, RateCalendar, SystemUser, Reservation, GuestInvoice } from '@/lib/types'
import { RoomDialog } from '@/components/RoomDialog'
import { RoomDetailsDialog } from '@/components/RoomDetailsDialog'
import { RoomTypeDialog } from '@/components/RoomTypeDialog'
import { RoomTypeConfigDialog } from '@/components/RoomTypeConfigDialog'
import { RatePlanConfigDialog } from '@/components/RatePlanConfigDialog'
import { RateCalendarView } from '@/components/RateCalendarView'
import { SeasonDialog } from '@/components/SeasonDialog'
import { EventDayDialog } from '@/components/EventDayDialog'
import { CorporateAccountDialog } from '@/components/CorporateAccountDialog'
import { RevenueBreakdownDialog } from '@/components/RevenueBreakdownDialog'
import { AIPricingRecommendations } from '@/components/AIPricingRecommendations'
import { formatCurrency } from '@/lib/helpers'

interface RoomRevenueManagementProps {
  rooms: Room[]
  setRooms: (rooms: Room[] | ((prev: Room[]) => Room[])) => void
  roomTypes: RoomTypeConfig[]
  setRoomTypes: (roomTypes: RoomTypeConfig[] | ((current: RoomTypeConfig[]) => RoomTypeConfig[])) => void
  ratePlans: RatePlanConfig[]
  setRatePlans: (ratePlans: RatePlanConfig[] | ((current: RatePlanConfig[]) => RatePlanConfig[])) => void
  seasons: Season[]
  setSeasons: (seasons: Season[] | ((current: Season[]) => Season[])) => void
  eventDays: EventDay[]
  setEventDays: (eventDays: EventDay[] | ((current: EventDay[]) => EventDay[])) => void
  corporateAccounts: CorporateAccount[]
  setCorporateAccounts: (accounts: CorporateAccount[] | ((current: CorporateAccount[]) => CorporateAccount[])) => void
  rateCalendar: RateCalendar[]
  setRateCalendar: (calendar: RateCalendar[] | ((current: RateCalendar[]) => RateCalendar[])) => void
  currentUser: SystemUser
  reservations?: Reservation[]
  invoices?: GuestInvoice[]
}

export function RoomRevenueManagement({
  rooms,
  setRooms,
  roomTypes,
  setRoomTypes,
  ratePlans,
  setRatePlans,
  seasons,
  setSeasons,
  eventDays,
  setEventDays,
  corporateAccounts,
  setCorporateAccounts,
  rateCalendar,
  setRateCalendar,
  currentUser,
  reservations = [],
  invoices = []
}: RoomRevenueManagementProps) {
  const [activeTab, setActiveTab] = useState('rooms')
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<RoomStatus | 'all'>('all')
  const [typeFilter, setTypeFilter] = useState<RoomType | 'all'>('all')
  const [floorFilter, setFloorFilter] = useState<string>('all')
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null)
  const [selectedRoomType, setSelectedRoomType] = useState<RoomTypeConfig | null>(null)
  const [selectedRatePlan, setSelectedRatePlan] = useState<RatePlanConfig | null>(null)
  const [selectedSeason, setSelectedSeason] = useState<Season | null>(null)
  const [selectedEvent, setSelectedEvent] = useState<EventDay | null>(null)
  const [selectedCorporateAccount, setSelectedCorporateAccount] = useState<CorporateAccount | null>(null)
  const [isRoomDialogOpen, setIsRoomDialogOpen] = useState(false)
  const [isDetailsOpen, setIsDetailsOpen] = useState(false)
  const [isRoomTypeDialogOpen, setIsRoomTypeDialogOpen] = useState(false)
  const [roomTypeDialogOpen, setRoomTypeDialogOpen] = useState(false)
  const [ratePlanDialogOpen, setRatePlanDialogOpen] = useState(false)
  const [seasonDialogOpen, setSeasonDialogOpen] = useState(false)
  const [eventDialogOpen, setEventDialogOpen] = useState(false)
  const [corporateDialogOpen, setCorporateDialogOpen] = useState(false)
  const [viewMode, setViewMode] = useState<'table' | 'grid'>('grid')

  const floors = Array.from(new Set(rooms.map(r => r.floor))).sort((a, b) => a - b)

  const filteredRooms = rooms.filter(room => {
    const matchesSearch = room.roomNumber.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesStatus = statusFilter === 'all' || room.status === statusFilter
    const matchesType = typeFilter === 'all' || room.roomType === typeFilter
    const matchesFloor = floorFilter === 'all' || room.floor.toString() === floorFilter

    return matchesSearch && matchesStatus && matchesType && matchesFloor
  })

  const stats = {
    activeRoomTypes: roomTypes.filter(rt => rt.isActive).length,
    totalRoomTypes: roomTypes.length,
    activeRatePlans: ratePlans.filter(rp => rp.isActive).length,
    totalRatePlans: ratePlans.length,
    parentRatePlans: ratePlans.filter(rp => rp.isParent).length,
    derivedRatePlans: ratePlans.filter(rp => !rp.isParent && rp.parentRatePlanId).length,
    activeSeasons: seasons.filter(s => s.isActive).length,
    upcomingEvents: eventDays.filter(e => e.date > Date.now()).length,
    corporateAccounts: corporateAccounts.filter(ca => ca.isActive).length,
    avgRoomRate: roomTypes.length > 0 
      ? roomTypes.reduce((sum, rt) => sum + rt.baseRate, 0) / roomTypes.length 
      : 0
  }

  const handleAddRoom = () => {
    setSelectedRoom(null)
    setIsRoomDialogOpen(true)
  }

  const handleEditRoom = (room: Room) => {
    setSelectedRoom(room)
    setIsRoomDialogOpen(true)
  }

  const handleViewRoom = (room: Room) => {
    setSelectedRoom(room)
    setIsDetailsOpen(true)
  }

  const handleDeleteRoom = (roomId: string) => {
    const room = rooms.find(r => r.id === roomId)
    if (room?.status.includes('occupied')) {
      toast.error('Cannot delete an occupied room')
      return
    }

    if (confirm('Are you sure you want to delete this room?')) {
      setRooms(prev => prev.filter(r => r.id !== roomId))
      toast.success('Room deleted successfully')
    }
  }

  const handleSaveRoom = (room: Room) => {
    if (selectedRoom) {
      setRooms(prev => prev.map(r => r.id === room.id ? room : r))
      toast.success('Room updated successfully')
    } else {
      setRooms(prev => [...prev, room])
      toast.success('Room added successfully')
    }
    setIsRoomDialogOpen(false)
  }

  const handleSaveRoomType = (roomType: RoomTypeConfig) => {
    setRoomTypes((current) => {
      const existing = current.find(rt => rt.id === roomType.id)
      if (existing) {
        toast.success('Room type updated successfully')
        return current.map(rt => rt.id === roomType.id ? roomType : rt)
      }
      toast.success('Room type added successfully')
      return [...current, roomType]
    })
    setSelectedRoomType(null)
    setRoomTypeDialogOpen(false)
    setIsRoomTypeDialogOpen(false)
  }

  const handleDeleteRoomType = (id: string) => {
    const roomTypeConfig = roomTypes.find(rt => rt.id === id)
    const roomsUsingType = rooms.filter(r => roomTypeConfig && r.roomType === roomTypeConfig.code)
    
    if (roomsUsingType.length > 0) {
      toast.error(`Cannot delete room type: ${roomsUsingType.length} room(s) are using this type`)
      return
    }

    if (confirm('Are you sure you want to delete this room type?')) {
      setRoomTypes((current) => current.filter(rt => rt.id !== id))
      toast.success('Room type deleted successfully')
    }
  }

  const handleSaveRatePlan = (ratePlan: RatePlanConfig) => {
    setRatePlans((current) => {
      const existing = current.find(rp => rp.id === ratePlan.id)
      if (existing) {
        toast.success('Rate plan updated successfully')
        return current.map(rp => rp.id === ratePlan.id ? ratePlan : rp)
      }
      toast.success('Rate plan added successfully')
      return [...current, ratePlan]
    })
    setSelectedRatePlan(null)
    setRatePlanDialogOpen(false)
  }

  const handleDeleteRatePlan = (id: string) => {
    if (confirm('Are you sure you want to delete this rate plan?')) {
      setRatePlans((current) => current.filter(rp => rp.id !== id))
      toast.success('Rate plan deleted successfully')
    }
  }

  const handleSaveSeason = (season: Season) => {
    setSeasons((current) => {
      const existing = current.find(s => s.id === season.id)
      if (existing) {
        toast.success('Season updated successfully')
        return current.map(s => s.id === season.id ? season : s)
      }
      toast.success('Season added successfully')
      return [...current, season]
    })
    setSelectedSeason(null)
    setSeasonDialogOpen(false)
  }

  const handleDeleteSeason = (id: string) => {
    if (confirm('Are you sure you want to delete this season?')) {
      setSeasons((current) => current.filter(s => s.id !== id))
      toast.success('Season deleted successfully')
    }
  }

  const handleSaveEvent = (event: EventDay) => {
    setEventDays((current) => {
      const existing = current.find(e => e.id === event.id)
      if (existing) {
        toast.success('Event updated successfully')
        return current.map(e => e.id === event.id ? event : e)
      }
      toast.success('Event added successfully')
      return [...current, event]
    })
    setSelectedEvent(null)
    setEventDialogOpen(false)
  }

  const handleDeleteEvent = (id: string) => {
    if (confirm('Are you sure you want to delete this event?')) {
      setEventDays((current) => current.filter(e => e.id !== id))
      toast.success('Event deleted successfully')
    }
  }

  const handleSaveCorporateAccount = (account: CorporateAccount) => {
    setCorporateAccounts((current) => {
      const existing = current.find(ca => ca.id === account.id)
      if (existing) {
        toast.success('Corporate account updated successfully')
        return current.map(ca => ca.id === account.id ? account : ca)
      }
      toast.success('Corporate account added successfully')
      return [...current, account]
    })
    setSelectedCorporateAccount(null)
    setCorporateDialogOpen(false)
  }

  const handleDeleteCorporateAccount = (id: string) => {
    if (confirm('Are you sure you want to delete this corporate account?')) {
      setCorporateAccounts((current) => current.filter(ca => ca.id !== id))
      toast.success('Corporate account deleted successfully')
    }
  }

  const getRoomStatusColor = (status: RoomStatus) => {
    switch (status) {
      case 'vacant-clean':
        return 'bg-success/10 text-success border-success'
      case 'vacant-dirty':
        return 'bg-accent/10 text-accent border-accent'
      case 'occupied-clean':
        return 'bg-primary/10 text-primary border-primary'
      case 'occupied-dirty':
        return 'bg-destructive/10 text-destructive border-destructive'
      case 'maintenance':
        return 'bg-muted text-muted-foreground border-muted-foreground'
      case 'out-of-order':
        return 'bg-destructive/20 text-destructive border-destructive'
      default:
        return 'bg-muted text-muted-foreground border-border'
    }
  }

  const getRoomStatusIcon = (status: RoomStatus) => {
    switch (status) {
      case 'vacant-clean':
        return <Check size={16} />
      case 'vacant-dirty':
        return <Broom size={16} />
      case 'occupied-clean':
        return <Bed size={16} />
      case 'occupied-dirty':
        return <Bed size={16} />
      case 'maintenance':
        return <Wrench size={16} />
      case 'out-of-order':
        return <X size={16} />
      default:
        return null
    }
  }

  const getRoomTypeLabel = (type: RoomType) => {
    const roomTypeConfig = roomTypes.find(rt => rt.code === type)
    if (roomTypeConfig) {
      return roomTypeConfig.name
    }
    return type.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')
  }

  const getStatusStats = () => {
    const stats = {
      total: rooms.length,
      'vacant-clean': 0,
      'vacant-dirty': 0,
      'occupied-clean': 0,
      'occupied-dirty': 0,
      'maintenance': 0,
      'out-of-order': 0
    }

    rooms.forEach(room => {
      stats[room.status]++
    })

    return stats
  }

  const roomStats = getStatusStats()
  const parentRatePlansForDialog = ratePlans.filter(rp => rp.isParent)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-semibold">Room & Revenue Management</h1>
          <p className="text-muted-foreground mt-1">
            Unified management of rooms, types, rates, and revenue optimization
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <RevenueBreakdownDialog
            reservations={reservations}
            invoices={invoices}
            roomTypes={roomTypes}
            ratePlans={ratePlans}
          />
          {activeTab === 'rooms' && (
            <Button onClick={handleAddRoom} size="lg">
              <Plus size={20} className="mr-2" />
              Add Room
            </Button>
          )}
          {activeTab === 'room-types' && (
            <Button onClick={() => { setSelectedRoomType(null); setRoomTypeDialogOpen(true) }} size="lg">
              <Plus size={20} className="mr-2" />
              Add Room Type
            </Button>
          )}
          {activeTab === 'rate-plans' && (
            <Button onClick={() => { setSelectedRatePlan(null); setRatePlanDialogOpen(true) }} size="lg">
              <Plus size={20} className="mr-2" />
              Create Rate Plan
            </Button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-4 border-l-4 border-l-primary">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-muted-foreground">Total Rooms</h3>
            <Bed size={18} className="text-primary" />
          </div>
          <div className="space-y-1">
            <p className="text-2xl font-semibold">{roomStats.total}</p>
            <p className="text-xs text-muted-foreground">
              {roomStats['vacant-clean']} available
            </p>
          </div>
        </Card>

        <Card className="p-4 border-l-4 border-l-accent">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-muted-foreground">Room Types</h3>
            <Buildings size={18} className="text-accent" />
          </div>
          <div className="space-y-1">
            <p className="text-2xl font-semibold">{stats.activeRoomTypes}</p>
            <p className="text-xs text-muted-foreground">
              {stats.totalRoomTypes} total configured
            </p>
          </div>
        </Card>

        <Card className="p-4 border-l-4 border-l-success">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-muted-foreground">Avg Room Rate</h3>
            <TrendUp size={18} className="text-success" />
          </div>
          <div className="space-y-1">
            <p className="text-2xl font-semibold">
              {formatCurrency(stats.avgRoomRate)}
            </p>
            <p className="text-xs text-muted-foreground">
              Across all room types
            </p>
          </div>
        </Card>

        <Card className="p-4 border-l-4 border-l-destructive">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-muted-foreground">Rate Plans</h3>
            <CurrencyDollar size={18} className="text-destructive" />
          </div>
          <div className="space-y-1">
            <p className="text-2xl font-semibold">{stats.activeRatePlans}</p>
            <p className="text-xs text-muted-foreground">
              {stats.parentRatePlans} parent, {stats.derivedRatePlans} derived
            </p>
          </div>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-7">
          <TabsTrigger value="rooms">Rooms</TabsTrigger>
          <TabsTrigger value="room-types">Room Types</TabsTrigger>
          <TabsTrigger value="rate-plans">Rate Plans</TabsTrigger>
          <TabsTrigger value="ai-pricing">AI Pricing</TabsTrigger>
          <TabsTrigger value="calendar">Rate Calendar</TabsTrigger>
          <TabsTrigger value="seasons">Seasons & Events</TabsTrigger>
          <TabsTrigger value="corporate">Corporate</TabsTrigger>
        </TabsList>

        <TabsContent value="rooms" className="space-y-6 mt-6">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            <Card className="p-4">
              <div className="text-sm text-muted-foreground mb-1">Total Rooms</div>
              <div className="text-2xl font-semibold">{roomStats.total}</div>
            </Card>
            <Card className={`p-4 border-l-4 ${getRoomStatusColor('vacant-clean')}`}>
              <div className="text-sm mb-1 flex items-center gap-1">
                {getRoomStatusIcon('vacant-clean')}
                <span>Vacant Clean</span>
              </div>
              <div className="text-2xl font-semibold">{roomStats['vacant-clean']}</div>
            </Card>
            <Card className={`p-4 border-l-4 ${getRoomStatusColor('vacant-dirty')}`}>
              <div className="text-sm mb-1 flex items-center gap-1">
                {getRoomStatusIcon('vacant-dirty')}
                <span>Vacant Dirty</span>
              </div>
              <div className="text-2xl font-semibold">{roomStats['vacant-dirty']}</div>
            </Card>
            <Card className={`p-4 border-l-4 ${getRoomStatusColor('occupied-clean')}`}>
              <div className="text-sm mb-1 flex items-center gap-1">
                {getRoomStatusIcon('occupied-clean')}
                <span>Occupied Clean</span>
              </div>
              <div className="text-2xl font-semibold">{roomStats['occupied-clean']}</div>
            </Card>
            <Card className={`p-4 border-l-4 ${getRoomStatusColor('occupied-dirty')}`}>
              <div className="text-sm mb-1 flex items-center gap-1">
                {getRoomStatusIcon('occupied-dirty')}
                <span>Occupied Dirty</span>
              </div>
              <div className="text-2xl font-semibold">{roomStats['occupied-dirty']}</div>
            </Card>
            <Card className={`p-4 border-l-4 ${getRoomStatusColor('maintenance')}`}>
              <div className="text-sm mb-1 flex items-center gap-1">
                {getRoomStatusIcon('maintenance')}
                <span>Maintenance</span>
              </div>
              <div className="text-2xl font-semibold">{roomStats['maintenance'] + roomStats['out-of-order']}</div>
            </Card>
          </div>

          <Card className="p-6">
            <div className="flex flex-col md:flex-row gap-4 mb-6">
              <div className="flex-1">
                <div className="relative">
                  <MagnifyingGlass className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
                  <Input
                    placeholder="Search by room number..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              <Select value={floorFilter} onValueChange={setFloorFilter}>
                <SelectTrigger className="w-full md:w-[180px]">
                  <FunnelSimple size={18} className="mr-2" />
                  <SelectValue placeholder="All Floors" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Floors</SelectItem>
                  {floors.map(floor => (
                    <SelectItem key={floor} value={floor.toString()}>Floor {floor}</SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={typeFilter} onValueChange={(val) => setTypeFilter(val as RoomType | 'all')}>
                <SelectTrigger className="w-full md:w-[180px]">
                  <SelectValue placeholder="All Types" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  {roomTypes.filter(rt => rt.isActive).length > 0 ? (
                    roomTypes.filter(rt => rt.isActive).map(rt => (
                      <SelectItem key={rt.id} value={rt.code}>
                        {rt.name}
                      </SelectItem>
                    ))
                  ) : (
                    <>
                      <SelectItem value="standard">Standard</SelectItem>
                      <SelectItem value="deluxe">Deluxe</SelectItem>
                      <SelectItem value="suite">Suite</SelectItem>
                      <SelectItem value="executive">Executive</SelectItem>
                      <SelectItem value="presidential">Presidential</SelectItem>
                    </>
                  )}
                </SelectContent>
              </Select>

              <Select value={statusFilter} onValueChange={(val) => setStatusFilter(val as RoomStatus | 'all')}>
                <SelectTrigger className="w-full md:w-[180px]">
                  <SelectValue placeholder="All Statuses" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="vacant-clean">Vacant Clean</SelectItem>
                  <SelectItem value="vacant-dirty">Vacant Dirty</SelectItem>
                  <SelectItem value="occupied-clean">Occupied Clean</SelectItem>
                  <SelectItem value="occupied-dirty">Occupied Dirty</SelectItem>
                  <SelectItem value="maintenance">Maintenance</SelectItem>
                  <SelectItem value="out-of-order">Out of Order</SelectItem>
                </SelectContent>
              </Select>

              <div className="flex gap-2">
                <Button
                  variant={viewMode === 'grid' ? 'default' : 'outline'}
                  size="icon"
                  onClick={() => setViewMode('grid')}
                >
                  <span className="text-sm">⊞</span>
                </Button>
                <Button
                  variant={viewMode === 'table' ? 'default' : 'outline'}
                  size="icon"
                  onClick={() => setViewMode('table')}
                >
                  <span className="text-sm">☰</span>
                </Button>
              </div>
            </div>

            {viewMode === 'grid' ? (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                {filteredRooms.map(room => (
                  <Card
                    key={room.id}
                    className={`p-4 border-2 hover:shadow-lg transition-shadow cursor-pointer ${getRoomStatusColor(room.status)}`}
                    onClick={() => handleViewRoom(room)}
                  >
                    <div className="space-y-3">
                      <div className="flex items-start justify-between">
                        <div>
                          <div className="text-xl font-semibold">{room.roomNumber}</div>
                          <div className="text-xs text-muted-foreground">Floor {room.floor}</div>
                        </div>
                        {getRoomStatusIcon(room.status)}
                      </div>

                      <div className="space-y-1">
                        <Badge variant="outline" className="text-xs">
                          {getRoomTypeLabel(room.roomType)}
                        </Badge>
                        <div className="text-xs font-medium">
                          {formatCurrency(room.baseRate)}/night
                        </div>
                      </div>

                      <div className="text-xs text-muted-foreground capitalize">
                        {room.status.replace('-', ' ')}
                      </div>

                      <div className="flex gap-1 pt-2" onClick={(e) => e.stopPropagation()}>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="flex-1 h-8"
                          onClick={() => handleEditRoom(room)}
                        >
                          <PencilSimple size={14} />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="flex-1 h-8"
                          onClick={() => handleDeleteRoom(room.id)}
                        >
                          <Trash size={14} />
                        </Button>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="border rounded-lg">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Room Number</TableHead>
                      <TableHead>Floor</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Rate/Night</TableHead>
                      <TableHead>Max Occupancy</TableHead>
                      <TableHead>Amenities</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredRooms.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                          No rooms found
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredRooms.map(room => (
                        <TableRow key={room.id} className="cursor-pointer hover:bg-muted/50">
                          <TableCell className="font-medium">{room.roomNumber}</TableCell>
                          <TableCell>{room.floor}</TableCell>
                          <TableCell>
                            <Badge variant="outline">{getRoomTypeLabel(room.roomType)}</Badge>
                          </TableCell>
                          <TableCell>
                            <Badge className={getRoomStatusColor(room.status)}>
                              <span className="flex items-center gap-1">
                                {getRoomStatusIcon(room.status)}
                                <span className="capitalize">{room.status.replace('-', ' ')}</span>
                              </span>
                            </Badge>
                          </TableCell>
                          <TableCell>{formatCurrency(room.baseRate)}</TableCell>
                          <TableCell>{room.maxOccupancy} guests</TableCell>
                          <TableCell>
                            <div className="flex gap-1 flex-wrap max-w-[200px]">
                              {room.amenities.slice(0, 2).map((amenity, idx) => (
                                <Badge key={idx} variant="secondary" className="text-xs">
                                  {amenity}
                                </Badge>
                              ))}
                              {room.amenities.length > 2 && (
                                <Badge variant="secondary" className="text-xs">
                                  +{room.amenities.length - 2}
                                </Badge>
                              )}
                            </div>
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-2">
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => handleViewRoom(room)}
                              >
                                <Eye size={16} />
                              </Button>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => handleEditRoom(room)}
                              >
                                <PencilSimple size={16} />
                              </Button>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => handleDeleteRoom(room.id)}
                              >
                                <Trash size={16} />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            )}

            {filteredRooms.length === 0 && rooms.length > 0 && (
              <div className="text-center py-12">
                <Bed size={48} className="mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">No rooms match your filters</p>
                <Button
                  variant="outline"
                  className="mt-4"
                  onClick={() => {
                    setSearchQuery('')
                    setStatusFilter('all')
                    setTypeFilter('all')
                    setFloorFilter('all')
                  }}
                >
                  Clear Filters
                </Button>
              </div>
            )}
          </Card>
        </TabsContent>

        <TabsContent value="room-types">
          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-semibold">Room Type Configuration</h2>
              <Button onClick={() => { setSelectedRoomType(null); setRoomTypeDialogOpen(true) }}>
                <Plus size={18} className="mr-2" />
                Add Room Type
              </Button>
            </div>
            <p className="text-sm text-muted-foreground mb-6">
              Configure room types with bedding, views, amenities, and base rates
            </p>
            {roomTypes.length === 0 ? (
              <div className="text-center py-12">
                <Buildings size={48} className="mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">No room types configured</p>
                <Button className="mt-4" onClick={() => { setSelectedRoomType(null); setRoomTypeDialogOpen(true) }}>
                  Create First Room Type
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                {roomTypes.map(rt => (
                  <div key={rt.id} className="p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="font-semibold">{rt.name}</h3>
                          <Badge variant="outline">{rt.code}</Badge>
                          {!rt.isActive && <Badge variant="destructive">Inactive</Badge>}
                        </div>
                        <p className="text-sm text-muted-foreground mb-2">{rt.description}</p>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                          <div>
                            <span className="text-muted-foreground">Base Rate:</span>
                            <span className="ml-2 font-medium">{formatCurrency(rt.baseRate)}</span>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Rack Rate:</span>
                            <span className="ml-2 font-medium">{formatCurrency(rt.rackRate)}</span>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Occupancy:</span>
                            <span className="ml-2 font-medium">{rt.baseOccupancy}/{rt.maxOccupancy}</span>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Size:</span>
                            <span className="ml-2 font-medium">{rt.size || 'N/A'} sqm</span>
                          </div>
                        </div>
                        <div className="mt-2 flex gap-2 flex-wrap">
                          {rt.bedding.map((bed, idx) => (
                            <Badge key={idx} variant="secondary" className="capitalize">
                              {bed.replace('-', ' ')}
                            </Badge>
                          ))}
                          {rt.viewTypes.map((view, idx) => (
                            <Badge key={idx} variant="outline" className="capitalize">
                              {view.replace('-', ' ')} view
                            </Badge>
                          ))}
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => { setSelectedRoomType(rt); setRoomTypeDialogOpen(true) }}
                        >
                          <PencilSimple size={16} className="mr-1" />
                          Edit
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleDeleteRoomType(rt.id)}
                        >
                          <Trash size={16} />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </TabsContent>

        <TabsContent value="rate-plans">
          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-semibold">Rate Plan Hierarchy</h2>
              <Button onClick={() => { setSelectedRatePlan(null); setRatePlanDialogOpen(true) }}>
                <Plus size={18} className="mr-2" />
                Create Rate Plan
              </Button>
            </div>
            <p className="text-sm text-muted-foreground mb-6">
              Manage parent and derived rate plans with formulas and restrictions
            </p>
            {ratePlans.length === 0 ? (
              <div className="text-center py-12">
                <Percent size={48} className="mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">No rate plans configured</p>
                <Button className="mt-4" onClick={() => { setSelectedRatePlan(null); setRatePlanDialogOpen(true) }}>
                  Create First Rate Plan
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {ratePlans.filter(rp => rp.isParent).map(parent => (
                  <div key={parent.id} className="border rounded-lg">
                    <div className="p-4 bg-muted/30">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-1">
                            <h3 className="font-semibold">{parent.name}</h3>
                            <Badge>{parent.type}</Badge>
                            {parent.mealPlan && (
                              <Badge variant="outline" className="uppercase">
                                {parent.mealPlan}
                              </Badge>
                            )}
                            {!parent.isActive && <Badge variant="destructive">Inactive</Badge>}
                          </div>
                          <p className="text-sm text-muted-foreground">{parent.description}</p>
                          {parent.baseRate && (
                            <p className="text-sm mt-1">
                              <span className="text-muted-foreground">Base Rate:</span>
                              <span className="ml-2 font-medium">{formatCurrency(parent.baseRate)}</span>
                            </p>
                          )}
                        </div>
                        <div className="flex gap-2">
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => { setSelectedRatePlan(parent); setRatePlanDialogOpen(true) }}
                          >
                            <PencilSimple size={16} className="mr-1" />
                            Edit
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => handleDeleteRatePlan(parent.id)}
                          >
                            <Trash size={16} />
                          </Button>
                        </div>
                      </div>
                    </div>
                    
                    <div className="p-4 space-y-2">
                      {ratePlans
                        .filter(child => child.parentRatePlanId === parent.id)
                        .map(child => (
                          <div key={child.id} className="pl-4 py-2 border-l-2 border-accent/30 hover:bg-muted/50 rounded">
                            <div className="flex items-center justify-between">
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                  <span className="font-medium text-sm">{child.name}</span>
                                  {child.derivedRateConfig && (
                                    <Badge variant="secondary" className="text-xs">
                                      {child.derivedRateConfig.derivedType === 'percentage-discount' && 
                                        `-${child.derivedRateConfig.value}%`}
                                      {child.derivedRateConfig.derivedType === 'percentage-markup' && 
                                        `+${child.derivedRateConfig.value}%`}
                                      {child.derivedRateConfig.derivedType === 'fixed-discount' && 
                                        `-$${child.derivedRateConfig.value}`}
                                      {child.derivedRateConfig.derivedType === 'fixed-markup' && 
                                        `+$${child.derivedRateConfig.value}`}
                                    </Badge>
                                  )}
                                </div>
                                <p className="text-xs text-muted-foreground">{child.description}</p>
                              </div>
                              <div className="flex gap-2">
                                <Button 
                                  variant="ghost" 
                                  size="sm"
                                  onClick={() => { setSelectedRatePlan(child); setRatePlanDialogOpen(true) }}
                                >
                                  <PencilSimple size={14} className="mr-1" />
                                  Edit
                                </Button>
                                <Button 
                                  variant="ghost" 
                                  size="sm"
                                  onClick={() => handleDeleteRatePlan(child.id)}
                                >
                                  <Trash size={14} />
                                </Button>
                              </div>
                            </div>
                          </div>
                        ))}
                      {ratePlans.filter(child => child.parentRatePlanId === parent.id).length === 0 && (
                        <p className="text-xs text-muted-foreground text-center py-2">
                          No derived plans
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </TabsContent>

        <TabsContent value="ai-pricing">
          <AIPricingRecommendations
            roomTypes={roomTypes}
            reservations={reservations || []}
            invoices={invoices || []}
            onApplyRecommendation={(roomTypeId, newRate) => {
              setRoomTypes((current) => 
                current.map(rt => 
                  rt.id === roomTypeId 
                    ? { ...rt, baseRate: newRate }
                    : rt
                )
              )
            }}
          />
        </TabsContent>

        <TabsContent value="calendar">
          <RateCalendarView
            rateCalendar={rateCalendar}
            setRateCalendar={setRateCalendar}
            roomTypes={roomTypes}
            ratePlans={ratePlans}
            currentUser={currentUser}
          />
        </TabsContent>

        <TabsContent value="seasons">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold">Seasons</h2>
                <Button size="sm" onClick={() => { setSelectedSeason(null); setSeasonDialogOpen(true) }}>
                  <Plus size={18} className="mr-2" />
                  Add Season
                </Button>
              </div>
              {seasons.length === 0 ? (
                <div className="text-center py-8">
                  <CalendarIcon size={48} className="mx-auto text-muted-foreground mb-4" />
                  <p className="text-sm text-muted-foreground mb-4">No seasons configured</p>
                  <Button size="sm" onClick={() => { setSelectedSeason(null); setSeasonDialogOpen(true) }}>
                    Create First Season
                  </Button>
                </div>
              ) : (
                <div className="space-y-2">
                  {seasons.map(season => (
                    <div key={season.id} className="p-3 border rounded-lg hover:bg-muted/50 transition-colors">
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-medium">{season.name}</span>
                        <div className="flex items-center gap-2">
                          <Badge className="capitalize" variant={
                            season.type === 'peak' ? 'destructive' :
                            season.type === 'high' ? 'default' :
                            season.type === 'mid' ? 'secondary' :
                            'outline'
                          }>{season.type}</Badge>
                          <Badge variant="secondary">{season.rateMultiplier}x</Badge>
                          {!season.isActive && <Badge variant="destructive">Inactive</Badge>}
                        </div>
                      </div>
                      <p className="text-xs text-muted-foreground mb-2">
                        {new Date(season.startDate).toLocaleDateString()} - {new Date(season.endDate).toLocaleDateString()}
                      </p>
                      {season.description && (
                        <p className="text-xs text-muted-foreground mb-2">{season.description}</p>
                      )}
                      <div className="flex gap-2 mt-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => { setSelectedSeason(season); setSeasonDialogOpen(true) }}
                        >
                          <PencilSimple size={14} className="mr-1" />
                          Edit
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDeleteSeason(season.id)}
                        >
                          <Trash size={14} />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </Card>

            <Card className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold">Special Events</h2>
                <Button size="sm" onClick={() => { setSelectedEvent(null); setEventDialogOpen(true) }}>
                  <Plus size={18} className="mr-2" />
                  Add Event
                </Button>
              </div>
              {eventDays.length === 0 ? (
                <div className="text-center py-8">
                  <CalendarIcon size={48} className="mx-auto text-muted-foreground mb-4" />
                  <p className="text-sm text-muted-foreground mb-4">No special events configured</p>
                  <Button size="sm" onClick={() => { setSelectedEvent(null); setEventDialogOpen(true) }}>
                    Create First Event
                  </Button>
                </div>
              ) : (
                <div className="space-y-2">
                  {eventDays
                    .sort((a, b) => a.date - b.date)
                    .map(event => (
                    <div key={event.id} className="p-3 border rounded-lg hover:bg-muted/50 transition-colors">
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-medium">{event.name}</span>
                        <div className="flex items-center gap-2">
                          <Badge variant="destructive">{event.rateMultiplier}x</Badge>
                          {!event.isActive && <Badge variant="secondary">Inactive</Badge>}
                        </div>
                      </div>
                      <p className="text-xs text-muted-foreground mb-1">
                        {new Date(event.date).toLocaleDateString('en-US', { 
                          weekday: 'short', 
                          year: 'numeric', 
                          month: 'short', 
                          day: 'numeric' 
                        })}
                      </p>
                      {event.description && (
                        <p className="text-xs text-muted-foreground mb-1">{event.description}</p>
                      )}
                      {event.minimumStay && (
                        <p className="text-xs text-accent font-medium">
                          Min stay: {event.minimumStay} nights
                        </p>
                      )}
                      <div className="flex gap-2 mt-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => { setSelectedEvent(event); setEventDialogOpen(true) }}
                        >
                          <PencilSimple size={14} className="mr-1" />
                          Edit
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDeleteEvent(event.id)}
                        >
                          <Trash size={14} />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="corporate">
          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-semibold">Corporate Accounts</h2>
              <Button onClick={() => { setSelectedCorporateAccount(null); setCorporateDialogOpen(true) }}>
                <Plus size={18} className="mr-2" />
                Add Corporate Account
              </Button>
            </div>
            <p className="text-sm text-muted-foreground mb-6">
              Manage negotiated corporate rates and contracts
            </p>
            {corporateAccounts.length === 0 ? (
              <div className="text-center py-12">
                <Users size={48} className="mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground mb-4">No corporate accounts configured</p>
                <Button onClick={() => { setSelectedCorporateAccount(null); setCorporateDialogOpen(true) }}>
                  Add First Corporate Account
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                {corporateAccounts.map(corp => (
                  <div key={corp.id} className="p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-1">
                          <h3 className="font-semibold">{corp.companyName}</h3>
                          <Badge variant="outline">{corp.code}</Badge>
                          {!corp.isActive && <Badge variant="destructive">Inactive</Badge>}
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm mt-2">
                          <div>
                            <span className="text-muted-foreground">Contact:</span>
                            <span className="ml-2">{corp.contactPerson}</span>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Email:</span>
                            <span className="ml-2">{corp.email}</span>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Phone:</span>
                            <span className="ml-2">{corp.phone}</span>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Rates:</span>
                            <span className="ml-2 font-medium">{corp.negotiatedRates.length}</span>
                          </div>
                        </div>
                        {corp.roomAllotment && (
                          <div className="mt-2 text-sm">
                            <span className="text-muted-foreground">Room Allotment:</span>
                            <span className="ml-2 font-medium">{corp.roomAllotment} rooms</span>
                          </div>
                        )}
                        {corp.creditLimit && (
                          <div className="mt-1 text-sm">
                            <span className="text-muted-foreground">Credit Limit:</span>
                            <span className="ml-2 font-medium">{formatCurrency(corp.creditLimit)}</span>
                          </div>
                        )}
                      </div>
                      <div className="flex gap-2">
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => { setSelectedCorporateAccount(corp); setCorporateDialogOpen(true) }}
                        >
                          <PencilSimple size={16} className="mr-1" />
                          Edit
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleDeleteCorporateAccount(corp.id)}
                        >
                          <Trash size={16} />
                        </Button>
                      </div>
                    </div>
                    
                    {corp.negotiatedRates.length > 0 && (
                      <div className="mt-3 pt-3 border-t">
                        <p className="text-xs font-medium text-muted-foreground mb-2">Negotiated Rates:</p>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                          {corp.negotiatedRates.slice(0, 4).map((rate, idx) => {
                            const roomType = roomTypes.find(rt => rt.id === rate.roomTypeId)
                            const ratePlan = ratePlans.find(rp => rp.id === rate.ratePlanId)
                            return (
                              <div key={idx} className="text-xs p-2 bg-muted/50 rounded">
                                <div className="font-medium">{roomType?.name || 'Unknown'}</div>
                                <div className="text-muted-foreground">{ratePlan?.name || 'Unknown'}: {formatCurrency(rate.rate)}</div>
                              </div>
                            )
                          })}
                          {corp.negotiatedRates.length > 4 && (
                            <div className="text-xs p-2 bg-muted/50 rounded flex items-center justify-center text-muted-foreground">
                              +{corp.negotiatedRates.length - 4} more
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </Card>
        </TabsContent>
      </Tabs>

      <RoomDialog
        open={isRoomDialogOpen}
        onOpenChange={setIsRoomDialogOpen}
        room={selectedRoom}
        onSave={handleSaveRoom}
      />

      <RoomDetailsDialog
        open={isDetailsOpen}
        onOpenChange={setIsDetailsOpen}
        room={selectedRoom}
        onEdit={handleEditRoom}
      />

      <RoomTypeDialog
        open={isRoomTypeDialogOpen}
        onOpenChange={setIsRoomTypeDialogOpen}
        roomType={selectedRoomType}
        onSave={handleSaveRoomType}
      />

      <RoomTypeConfigDialog
        open={roomTypeDialogOpen}
        onClose={() => { setRoomTypeDialogOpen(false); setSelectedRoomType(null) }}
        roomType={selectedRoomType}
        onSave={handleSaveRoomType}
        currentUser={currentUser}
      />

      <RatePlanConfigDialog
        open={ratePlanDialogOpen}
        onClose={() => { setRatePlanDialogOpen(false); setSelectedRatePlan(null) }}
        ratePlan={selectedRatePlan}
        onSave={handleSaveRatePlan}
        roomTypes={roomTypes}
        parentRatePlans={parentRatePlansForDialog}
        currentUser={currentUser}
      />

      <SeasonDialog
        open={seasonDialogOpen}
        onClose={() => { setSeasonDialogOpen(false); setSelectedSeason(null) }}
        season={selectedSeason}
        onSave={handleSaveSeason}
      />

      <EventDayDialog
        open={eventDialogOpen}
        onClose={() => { setEventDialogOpen(false); setSelectedEvent(null) }}
        event={selectedEvent}
        onSave={handleSaveEvent}
      />

      <CorporateAccountDialog
        open={corporateDialogOpen}
        onClose={() => { setCorporateDialogOpen(false); setSelectedCorporateAccount(null) }}
        account={selectedCorporateAccount}
        onSave={handleSaveCorporateAccount}
        roomTypes={roomTypes}
        ratePlans={ratePlans}
      />
    </div>
  )
}
