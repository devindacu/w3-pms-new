import { useState, useMemo } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import {
  Bed,
  Check,
  Broom,
  Wrench,
  Clock,
  DoorOpen,
  MagnifyingGlass,
  FunnelSimple,
  SquaresFour,
  List as ListIcon
} from '@phosphor-icons/react'
import type { Room, RoomStatus, RoomType, Reservation } from '@/lib/types'
import { formatCurrency, getRoomStatusColor } from '@/lib/helpers'
import { motion } from 'framer-motion'

interface RoomAvailabilityDashboardProps {
  rooms: Room[]
  reservations: Reservation[]
  onRoomClick: (room: Room) => void
  onQuickAction?: (room: Room, action: 'clean' | 'inspect' | 'maintenance' | 'assign') => void
}

export function RoomAvailabilityDashboard({
  rooms,
  reservations,
  onRoomClick,
  onQuickAction
}: RoomAvailabilityDashboardProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<RoomStatus | 'all'>('all')
  const [typeFilter, setTypeFilter] = useState<RoomType | 'all'>('all')
  const [floorFilter, setFloorFilter] = useState<string>('all')
  const [viewMode, setViewMode] = useState<'grid' | 'floor'>('grid')

  const floors = useMemo(() => 
    Array.from(new Set(rooms.map(r => r.floor))).sort((a, b) => a - b),
    [rooms]
  )

  const filteredRooms = useMemo(() => {
    return rooms.filter(room => {
      const matchesSearch = room.roomNumber.toLowerCase().includes(searchQuery.toLowerCase())
      const matchesStatus = statusFilter === 'all' || room.status === statusFilter
      const matchesType = typeFilter === 'all' || room.roomType === typeFilter
      const matchesFloor = floorFilter === 'all' || room.floor.toString() === floorFilter
      return matchesSearch && matchesStatus && matchesType && matchesFloor
    })
  }, [rooms, searchQuery, statusFilter, typeFilter, floorFilter])

  const roomStats = useMemo(() => {
    const total = rooms.length
    const available = rooms.filter(r => r.status === 'vacant-clean').length
    const occupied = rooms.filter(r => r.status.includes('occupied')).length
    const dirty = rooms.filter(r => r.status.includes('dirty')).length
    const maintenance = rooms.filter(r => r.status.includes('maintenance')).length
    const occupancyRate = total > 0 ? ((occupied / total) * 100).toFixed(1) : '0'
    
    return { total, available, occupied, dirty, maintenance, occupancyRate }
  }, [rooms])

  const getStatusIcon = (status: RoomStatus) => {
    if (status.includes('occupied')) return <Bed size={18} weight="fill" />
    if (status.includes('dirty')) return <Broom size={18} />
    if (status.includes('maintenance')) return <Wrench size={18} />
    if (status.includes('clean')) return <Check size={18} weight="bold" />
    return <DoorOpen size={18} />
  }

  const getStatusLabel = (status: RoomStatus): string => {
    const labels: Record<string, string> = {
      'vacant-clean': 'Available',
      'vacant-dirty': 'Needs Cleaning',
      'occupied-clean': 'Occupied',
      'occupied-dirty': 'Occupied',
      'out-of-order': 'Maintenance',
      'maintenance': 'Maintenance'
    }
    return labels[status] || status
  }

  const getQuickActions = (room: Room) => {
    const actions: Array<{ action: 'clean' | 'inspect' | 'maintenance' | 'assign', label: string, icon: React.ReactElement }> = []
    
    if (room.status.includes('dirty')) {
      actions.push({ action: 'clean', label: 'Mark Clean', icon: <Broom size={14} /> })
    }
    if (room.status === 'vacant-clean' && onQuickAction) {
      actions.push({ action: 'assign', label: 'Assign Guest', icon: <Bed size={14} /> })
    }
    if (!room.status.includes('maintenance')) {
      actions.push({ action: 'maintenance', label: 'Maintenance', icon: <Wrench size={14} /> })
    }
    
    return actions
  }

  return (
    <div className="space-y-4 md:space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3 md:gap-4">
        <Card className="p-4 border-l-4 border-l-primary">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs md:text-sm text-muted-foreground">Total Rooms</p>
              <p className="text-2xl md:text-3xl font-bold">{roomStats.total}</p>
            </div>
            <Bed size={32} className="text-primary" />
          </div>
        </Card>

        <Card className="p-4 border-l-4 border-l-success">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs md:text-sm text-muted-foreground">Available</p>
              <p className="text-2xl md:text-3xl font-bold text-success">{roomStats.available}</p>
            </div>
            <Check size={32} className="text-success" weight="bold" />
          </div>
        </Card>

        <Card className="p-4 border-l-4 border-l-accent">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs md:text-sm text-muted-foreground">Occupied</p>
              <p className="text-2xl md:text-3xl font-bold text-accent">{roomStats.occupied}</p>
            </div>
            <Bed size={32} className="text-accent" weight="fill" />
          </div>
        </Card>

        <Card className="p-4 border-l-4 border-l-destructive">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs md:text-sm text-muted-foreground">Dirty</p>
              <p className="text-2xl md:text-3xl font-bold text-destructive">{roomStats.dirty}</p>
            </div>
            <Broom size={32} className="text-destructive" />
          </div>
        </Card>

        <Card className="p-4 border-l-4 border-l-secondary">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs md:text-sm text-muted-foreground">Occupancy</p>
              <p className="text-2xl md:text-3xl font-bold text-secondary">{roomStats.occupancyRate}%</p>
            </div>
            <Clock size={32} className="text-secondary" />
          </div>
        </Card>
      </div>

      <Card className="p-4 md:p-6">
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <h3 className="text-lg font-semibold">Room Status Overview</h3>
            <div className="flex items-center gap-2">
              <Button
                variant={viewMode === 'grid' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('grid')}
              >
                <SquaresFour size={16} className="mr-1" />
                Grid
              </Button>
              <Button
                variant={viewMode === 'floor' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('floor')}
              >
                <ListIcon size={16} className="mr-1" />
                By Floor
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            <div className="relative">
              <MagnifyingGlass size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search room..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>

            <Select value={statusFilter} onValueChange={(val) => setStatusFilter(val as RoomStatus | 'all')}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="vacant-clean">Available</SelectItem>
                <SelectItem value="vacant-dirty">Dirty</SelectItem>
                <SelectItem value="occupied-clean">Occupied</SelectItem>
                <SelectItem value="out-of-order">Maintenance</SelectItem>
              </SelectContent>
            </Select>

            <Select value={typeFilter} onValueChange={(val) => setTypeFilter(val as RoomType | 'all')}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="standard">Standard</SelectItem>
                <SelectItem value="deluxe">Deluxe</SelectItem>
                <SelectItem value="suite">Suite</SelectItem>
                <SelectItem value="presidential">Presidential</SelectItem>
              </SelectContent>
            </Select>

            <Select value={floorFilter} onValueChange={setFloorFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by floor" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Floors</SelectItem>
                {floors.map(floor => (
                  <SelectItem key={floor} value={floor.toString()}>
                    Floor {floor}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {viewMode === 'grid' ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-3">
              {filteredRooms.map((room) => (
                <TooltipProvider key={room.id}>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <motion.div
                        whileHover={{ scale: 1.05, y: -4 }}
                        whileTap={{ scale: 0.98 }}
                        transition={{ duration: 0.2 }}
                      >
                        <Card
                          className={`
                            p-3 cursor-pointer transition-all duration-200
                            border-2 hover:shadow-lg
                            ${getRoomStatusColor(room.status)}
                          `}
                          onClick={() => onRoomClick(room)}
                        >
                          <div className="space-y-2">
                            <div className="flex items-center justify-between">
                              <span className="font-bold text-lg">{room.roomNumber}</span>
                              {getStatusIcon(room.status)}
                            </div>
                            <Badge variant="secondary" className="text-xs w-full justify-center">
                              {room.roomType}
                            </Badge>
                            <div className="text-xs text-muted-foreground">
                              Floor {room.floor}
                            </div>
                          </div>
                        </Card>
                      </motion.div>
                    </TooltipTrigger>
                    <TooltipContent side="top" className="p-3">
                      <div className="space-y-1">
                        <p className="font-semibold">{room.roomNumber} - {room.roomType}</p>
                        <p className="text-xs">Status: {getStatusLabel(room.status)}</p>
                        <p className="text-xs">Rate: {formatCurrency(room.baseRate)}/night</p>
                        <p className="text-xs">Floor: {room.floor} | Capacity: {room.maxOccupancy}</p>
                        {getQuickActions(room).length > 0 && (
                          <div className="flex gap-1 mt-2 pt-2 border-t">
                            {getQuickActions(room).map((qa) => (
                              <Button
                                key={qa.action}
                                size="sm"
                                variant="outline"
                                className="text-xs h-7 px-2"
                                onClick={(e) => {
                                  e.stopPropagation()
                                  onQuickAction?.(room, qa.action)
                                }}
                              >
                                {qa.icon}
                                <span className="ml-1">{qa.label}</span>
                              </Button>
                            ))}
                          </div>
                        )}
                      </div>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              ))}
            </div>
          ) : (
            <div className="space-y-6">
              {floors.map(floor => {
                const floorRooms = filteredRooms.filter(r => r.floor === floor)
                if (floorRooms.length === 0) return null
                
                return (
                  <div key={floor} className="space-y-3">
                    <h4 className="font-semibold text-lg flex items-center gap-2">
                      <span className="bg-primary text-primary-foreground px-3 py-1 rounded-full text-sm">
                        Floor {floor}
                      </span>
                      <span className="text-sm text-muted-foreground">
                        ({floorRooms.length} rooms)
                      </span>
                    </h4>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-3">
                      {floorRooms.map((room) => (
                        <TooltipProvider key={room.id}>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <motion.div
                                whileHover={{ scale: 1.05, y: -4 }}
                                whileTap={{ scale: 0.98 }}
                                transition={{ duration: 0.2 }}
                              >
                                <Card
                                  className={`
                                    p-3 cursor-pointer transition-all duration-200
                                    border-2 hover:shadow-lg
                                    ${getRoomStatusColor(room.status)}
                                  `}
                                  onClick={() => onRoomClick(room)}
                                >
                                  <div className="space-y-2">
                                    <div className="flex items-center justify-between">
                                      <span className="font-bold text-lg">{room.roomNumber}</span>
                                      {getStatusIcon(room.status)}
                                    </div>
                                    <Badge variant="secondary" className="text-xs w-full justify-center">
                                      {room.roomType}
                                    </Badge>
                                  </div>
                                </Card>
                              </motion.div>
                            </TooltipTrigger>
                            <TooltipContent side="top" className="p-3">
                              <div className="space-y-1">
                                <p className="font-semibold">{room.roomNumber} - {room.roomType}</p>
                                <p className="text-xs">Status: {getStatusLabel(room.status)}</p>
                                <p className="text-xs">Rate: {formatCurrency(room.baseRate)}/night</p>
                                <p className="text-xs">Capacity: {room.maxOccupancy}</p>
                              </div>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      ))}
                    </div>
                  </div>
                )
              })}
            </div>
          )}

          {filteredRooms.length === 0 && (
            <div className="text-center py-12">
              <Bed size={64} className="mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">No rooms found matching your filters</p>
            </div>
          )}
        </div>
      </Card>
    </div>
  )
}
