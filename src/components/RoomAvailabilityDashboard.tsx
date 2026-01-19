import { useState, useMemo } from 'react'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  Bed, 
  MagnifyingGlass, 
  Broom,
  Wrench,
  CheckCircle,
  Clock,
  XCircle,
  Warning,
  CalendarBlank,
  Users
} from '@phosphor-icons/react'
import { type Room, type Reservation } from '@/lib/types'
import { formatDate } from '@/lib/helpers'

interface RoomAvailabilityDashboardProps {
  rooms: Room[]
  reservations: Reservation[]
  onRoomClick?: (room: Room) => void
  onQuickAssign?: (roomId: string) => void
}

export function RoomAvailabilityDashboard({ 
  rooms, 
  reservations,
  onRoomClick,
  onQuickAssign
}: RoomAvailabilityDashboardProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [filterStatus, setFilterStatus] = useState<string>('all')
  const [filterFloor, setFilterFloor] = useState<string>('all')
  const [view, setView] = useState<'grid' | 'list'>('grid')

  const floors = useMemo(() => {
    const floorSet = new Set(rooms.map(r => String(r.floor || 1)))
    return Array.from(floorSet).sort((a, b) => parseInt(a) - parseInt(b))
  }, [rooms])

  const statusCounts = useMemo(() => {
    const counts = {
      vacant: 0,
      occupied: 0,
      dirty: 0,
      maintenance: 0,
      reserved: 0
    }
    
    rooms.forEach(room => {
      if (room.status === 'vacant-clean') counts.vacant++
      else if (room.status === 'occupied-clean' || room.status === 'occupied-dirty') counts.occupied++
      else if (room.status === 'vacant-dirty') counts.dirty++
      else if (room.status === 'out-of-order' || room.status === 'maintenance') counts.maintenance++
      
      const hasUpcomingReservation = reservations.some(
        r => r.roomId === room.id && r.status === 'confirmed' && 
        new Date(r.checkInDate) > new Date() && 
        new Date(r.checkInDate) <= new Date(Date.now() + 24 * 60 * 60 * 1000)
      )
      if (hasUpcomingReservation) counts.reserved++
    })
    
    return counts
  }, [rooms, reservations])

  const filteredRooms = useMemo(() => {
    return rooms.filter(room => {
      const matchesSearch = searchQuery === '' || 
        room.roomNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
        room.roomType.toLowerCase().includes(searchQuery.toLowerCase())
      
      const matchesStatus = filterStatus === 'all' || 
        (filterStatus === 'vacant' && room.status === 'vacant-clean') ||
        (filterStatus === 'occupied' && (room.status === 'occupied-clean' || room.status === 'occupied-dirty')) ||
        (filterStatus === 'dirty' && room.status === 'vacant-dirty') ||
        (filterStatus === 'maintenance' && (room.status === 'out-of-order' || room.status === 'maintenance'))
      
      const matchesFloor = filterFloor === 'all' || String(room.floor) === filterFloor
      
      return matchesSearch && matchesStatus && matchesFloor
    })
  }, [rooms, searchQuery, filterStatus, filterFloor])

  const getRoomStatusIcon = (status: string) => {
    switch (status) {
      case 'vacant-clean':
        return <CheckCircle size={20} className="text-success" weight="fill" />
      case 'occupied':
        return <Users size={20} className="text-primary" weight="fill" />
      case 'vacant-dirty':
      case 'dirty':
        return <Broom size={20} className="text-accent" weight="fill" />
      case 'out-of-order':
        return <Wrench size={20} className="text-destructive" weight="fill" />
      default:
        return <Clock size={20} className="text-muted-foreground" />
    }
  }

  const getRoomStatusColor = (status: string) => {
    switch (status) {
      case 'vacant-clean':
        return 'bg-success/10 border-success/30 hover:bg-success/20'
      case 'occupied':
        return 'bg-primary/10 border-primary/30 hover:bg-primary/20'
      case 'vacant-dirty':
      case 'dirty':
        return 'bg-accent/10 border-accent/30 hover:bg-accent/20'
      case 'out-of-order':
        return 'bg-destructive/10 border-destructive/30 hover:bg-destructive/20'
      default:
        return 'bg-muted border-border hover:bg-muted/80'
    }
  }

  const getRoomStatusLabel = (status: string) => {
    switch (status) {
      case 'vacant-clean':
        return 'Available'
      case 'occupied':
        return 'Occupied'
      case 'vacant-dirty':
      case 'dirty':
        return 'Dirty'
      case 'out-of-order':
        return 'Maintenance'
      default:
        return status
    }
  }

  const getUpcomingReservation = (roomId: string) => {
    return reservations.find(
      r => r.roomId === roomId && 
      r.status === 'confirmed' && 
      new Date(r.checkInDate) > new Date()
    )
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <Card className="p-4 border-l-4 border-l-success">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-muted-foreground">Available</h3>
            <CheckCircle size={20} className="text-success" weight="fill" />
          </div>
          <p className="text-3xl font-semibold">{statusCounts.vacant}</p>
        </Card>

        <Card className="p-4 border-l-4 border-l-primary">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-muted-foreground">Occupied</h3>
            <Users size={20} className="text-primary" weight="fill" />
          </div>
          <p className="text-3xl font-semibold">{statusCounts.occupied}</p>
        </Card>

        <Card className="p-4 border-l-4 border-l-accent">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-muted-foreground">Dirty</h3>
            <Broom size={20} className="text-accent" weight="fill" />
          </div>
          <p className="text-3xl font-semibold">{statusCounts.dirty}</p>
        </Card>

        <Card className="p-4 border-l-4 border-l-destructive">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-muted-foreground">Maintenance</h3>
            <Wrench size={20} className="text-destructive" weight="fill" />
          </div>
          <p className="text-3xl font-semibold">{statusCounts.maintenance}</p>
        </Card>

        <Card className="p-4 border-l-4 border-l-secondary">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-muted-foreground">Reserved (24h)</h3>
            <CalendarBlank size={20} className="text-secondary" weight="fill" />
          </div>
          <p className="text-3xl font-semibold">{statusCounts.reserved}</p>
        </Card>
      </div>

      <Card className="p-6">
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="flex-1 relative">
            <MagnifyingGlass className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={20} />
            <Input
              placeholder="Search by room number or type..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>

          <Select value={filterStatus} onValueChange={setFilterStatus}>
            <SelectTrigger className="w-full md:w-48">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="vacant">Available</SelectItem>
              <SelectItem value="occupied">Occupied</SelectItem>
              <SelectItem value="dirty">Dirty</SelectItem>
              <SelectItem value="maintenance">Maintenance</SelectItem>
            </SelectContent>
          </Select>

          <Select value={filterFloor} onValueChange={setFilterFloor}>
            <SelectTrigger className="w-full md:w-32">
              <SelectValue placeholder="Floor" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Floors</SelectItem>
              {floors.map(floor => (
                <SelectItem key={floor} value={floor}>Floor {floor}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Tabs value={view} onValueChange={(v) => setView(v as 'grid' | 'list')} className="w-full md:w-auto">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="grid">Grid</TabsTrigger>
              <TabsTrigger value="list">List</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        {view === 'grid' ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
            {filteredRooms.map(room => {
              const upcomingReservation = getUpcomingReservation(room.id)
              return (
                <Card
                  key={room.id}
                  className={`p-4 cursor-pointer transition-all hover:scale-105 border-2 ${getRoomStatusColor(room.status)}`}
                  onClick={() => onRoomClick?.(room)}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h3 className="font-semibold text-lg">{room.roomNumber}</h3>
                      <p className="text-xs text-muted-foreground">{room.roomType}</p>
                    </div>
                    {getRoomStatusIcon(room.status)}
                  </div>
                  
                  <div className="space-y-1">
                    <Badge variant="secondary" className="text-xs">
                      {getRoomStatusLabel(room.status)}
                    </Badge>
                    
                    {upcomingReservation && (
                      <div className="mt-2 p-2 bg-secondary/20 rounded text-xs">
                        <div className="flex items-center gap-1 text-secondary-foreground">
                          <CalendarBlank size={12} />
                          <span>Reserved</span>
                        </div>
                        <p className="text-muted-foreground mt-1">
                          {formatDate(upcomingReservation.checkInDate)}
                        </p>
                      </div>
                    )}
                  </div>

                  {room.status === 'vacant-clean' && onQuickAssign && (
                    <Button
                      size="sm"
                      variant="ghost"
                      className="w-full mt-3"
                      onClick={(e) => {
                        e.stopPropagation()
                        onQuickAssign(room.id)
                      }}
                    >
                      Quick Assign
                    </Button>
                  )}
                </Card>
              )
            })}
          </div>
        ) : (
          <div className="space-y-2">
            {filteredRooms.map(room => {
              const upcomingReservation = getUpcomingReservation(room.id)
              return (
                <Card
                  key={room.id}
                  className={`p-4 cursor-pointer hover:bg-accent/5 border ${getRoomStatusColor(room.status)}`}
                  onClick={() => onRoomClick?.(room)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      {getRoomStatusIcon(room.status)}
                      <div>
                        <h3 className="font-semibold">{room.roomNumber}</h3>
                        <p className="text-sm text-muted-foreground">{room.roomType}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <Badge variant="secondary">
                          {getRoomStatusLabel(room.status)}
                        </Badge>
                        {upcomingReservation && (
                          <p className="text-xs text-muted-foreground mt-1">
                            Reserved: {formatDate(upcomingReservation.checkInDate)}
                          </p>
                        )}
                      </div>
                      
                      {room.status === 'vacant-clean' && onQuickAssign && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={(e) => {
                            e.stopPropagation()
                            onQuickAssign(room.id)
                          }}
                        >
                          Quick Assign
                        </Button>
                      )}
                    </div>
                  </div>
                </Card>
              )
            })}
          </div>
        )}

        {filteredRooms.length === 0 && (
          <div className="text-center py-12">
            <Bed size={48} className="mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No rooms found</h3>
            <p className="text-muted-foreground">
              Try adjusting your search or filters
            </p>
          </div>
        )}
      </Card>

      <Card className="p-6">
        <h3 className="font-semibold mb-4">Legend</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="flex items-center gap-3">
            <CheckCircle size={20} className="text-success" weight="fill" />
            <span className="text-sm">Available - Ready for check-in</span>
          </div>
          <div className="flex items-center gap-3">
            <Users size={20} className="text-primary" weight="fill" />
            <span className="text-sm">Occupied - Guest checked in</span>
          </div>
          <div className="flex items-center gap-3">
            <Broom size={20} className="text-accent" weight="fill" />
            <span className="text-sm">Dirty - Needs housekeeping</span>
          </div>
          <div className="flex items-center gap-3">
            <Wrench size={20} className="text-destructive" weight="fill" />
            <span className="text-sm">Maintenance - Out of order</span>
          </div>
        </div>
      </Card>
    </div>
  )
}
