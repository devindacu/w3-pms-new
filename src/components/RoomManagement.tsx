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
  Tag
} from '@phosphor-icons/react'
import type { Room, RoomStatus, RoomType, RoomTypeConfig } from '@/lib/types'
import { RoomDialog } from '@/components/RoomDialog'
import { RoomDetailsDialog } from '@/components/RoomDetailsDialog'
import { RoomTypeDialog } from '@/components/RoomTypeDialog'
import { formatCurrency } from '@/lib/helpers'

interface RoomManagementProps {
  rooms: Room[]
  setRooms: (rooms: Room[] | ((prev: Room[]) => Room[])) => void
}

export function RoomManagement({ rooms, setRooms }: RoomManagementProps) {
  const [roomTypes, setRoomTypes] = useKV<RoomTypeConfig[]>('w3-hotel-room-types', [])
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<RoomStatus | 'all'>('all')
  const [typeFilter, setTypeFilter] = useState<RoomType | 'all'>('all')
  const [floorFilter, setFloorFilter] = useState<string>('all')
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null)
  const [selectedRoomType, setSelectedRoomType] = useState<RoomTypeConfig | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isDetailsOpen, setIsDetailsOpen] = useState(false)
  const [isRoomTypeDialogOpen, setIsRoomTypeDialogOpen] = useState(false)
  const [viewMode, setViewMode] = useState<'table' | 'grid'>('grid')
  const [activeTab, setActiveTab] = useState<'rooms' | 'types'>('rooms')

  const floors = Array.from(new Set(rooms.map(r => r.floor))).sort((a, b) => a - b)

  const filteredRooms = rooms.filter(room => {
    const matchesSearch = room.roomNumber.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesStatus = statusFilter === 'all' || room.status === statusFilter
    const matchesType = typeFilter === 'all' || room.roomType === typeFilter
    const matchesFloor = floorFilter === 'all' || room.floor.toString() === floorFilter

    return matchesSearch && matchesStatus && matchesType && matchesFloor
  })

  const handleAdd = () => {
    setSelectedRoom(null)
    setIsDialogOpen(true)
  }

  const handleEdit = (room: Room) => {
    setSelectedRoom(room)
    setIsDialogOpen(true)
  }

  const handleView = (room: Room) => {
    setSelectedRoom(room)
    setIsDetailsOpen(true)
  }

  const handleDelete = (roomId: string) => {
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

  const handleSave = (room: Room) => {
    if (selectedRoom) {
      setRooms(prev => prev.map(r => r.id === room.id ? room : r))
      toast.success('Room updated successfully')
    } else {
      setRooms(prev => [...prev, room])
      toast.success('Room added successfully')
    }
    setIsDialogOpen(false)
  }

  const handleAddRoomType = () => {
    setSelectedRoomType(null)
    setIsRoomTypeDialogOpen(true)
  }

  const handleEditRoomType = (roomType: RoomTypeConfig) => {
    setSelectedRoomType(roomType)
    setIsRoomTypeDialogOpen(true)
  }

  const handleDeleteRoomType = (roomTypeId: string) => {
    const roomTypeConfig = (roomTypes || []).find(rt => rt.id === roomTypeId)
    const roomsUsingType = rooms.filter(r => roomTypeConfig && r.roomType === roomTypeConfig.code)
    
    if (roomsUsingType.length > 0) {
      toast.error(`Cannot delete room type: ${roomsUsingType.length} room(s) are using this type`)
      return
    }

    if (confirm('Are you sure you want to delete this room type?')) {
      setRoomTypes((prev) => (prev || []).filter(rt => rt.id !== roomTypeId))
      toast.success('Room type deleted successfully')
    }
  }

  const handleSaveRoomType = (roomType: RoomTypeConfig) => {
    if (selectedRoomType) {
      setRoomTypes((prev) => (prev || []).map(rt => rt.id === roomType.id ? roomType : rt))
      toast.success('Room type updated successfully')
    } else {
      setRoomTypes((prev) => [...(prev || []), roomType])
      toast.success('Room type added successfully')
    }
    setIsRoomTypeDialogOpen(false)
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
    const roomTypeConfig = (roomTypes || []).find(rt => rt.code === type)
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

  const stats = getStatusStats()

  const renderRoomsTab = () => (
    <>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <Card className="p-4">
          <div className="text-sm text-muted-foreground mb-1">Total Rooms</div>
          <div className="text-2xl font-semibold">{stats.total}</div>
        </Card>
        <Card className={`p-4 border-l-4 ${getRoomStatusColor('vacant-clean')}`}>
          <div className="text-sm mb-1 flex items-center gap-1">
            {getRoomStatusIcon('vacant-clean')}
            <span>Vacant Clean</span>
          </div>
          <div className="text-2xl font-semibold">{stats['vacant-clean']}</div>
        </Card>
        <Card className={`p-4 border-l-4 ${getRoomStatusColor('vacant-dirty')}`}>
          <div className="text-sm mb-1 flex items-center gap-1">
            {getRoomStatusIcon('vacant-dirty')}
            <span>Vacant Dirty</span>
          </div>
          <div className="text-2xl font-semibold">{stats['vacant-dirty']}</div>
        </Card>
        <Card className={`p-4 border-l-4 ${getRoomStatusColor('occupied-clean')}`}>
          <div className="text-sm mb-1 flex items-center gap-1">
            {getRoomStatusIcon('occupied-clean')}
            <span>Occupied Clean</span>
          </div>
          <div className="text-2xl font-semibold">{stats['occupied-clean']}</div>
        </Card>
        <Card className={`p-4 border-l-4 ${getRoomStatusColor('occupied-dirty')}`}>
          <div className="text-sm mb-1 flex items-center gap-1">
            {getRoomStatusIcon('occupied-dirty')}
            <span>Occupied Dirty</span>
          </div>
          <div className="text-2xl font-semibold">{stats['occupied-dirty']}</div>
        </Card>
        <Card className={`p-4 border-l-4 ${getRoomStatusColor('maintenance')}`}>
          <div className="text-sm mb-1 flex items-center gap-1">
            {getRoomStatusIcon('maintenance')}
            <span>Maintenance</span>
          </div>
          <div className="text-2xl font-semibold">{stats['maintenance'] + stats['out-of-order']}</div>
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
              {(roomTypes || []).filter(rt => rt.isActive).length > 0 ? (
                (roomTypes || []).filter(rt => rt.isActive).map(rt => (
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
                onClick={() => handleView(room)}
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
                      onClick={() => handleEdit(room)}
                    >
                      <PencilSimple size={14} />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="flex-1 h-8"
                      onClick={() => handleDelete(room.id)}
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
                            onClick={() => handleView(room)}
                          >
                            <Eye size={16} />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleEdit(room)}
                          >
                            <PencilSimple size={16} />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleDelete(room.id)}
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
    </>
  )

  const renderRoomTypesTab = () => (
    <Card className="p-6">
      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Code</TableHead>
              <TableHead>Base Rate</TableHead>
              <TableHead>Max Occupancy</TableHead>
              <TableHead>Size</TableHead>
              <TableHead>Amenities</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {(roomTypes || []).length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                  No room types configured. Add your first room type to get started.
                </TableCell>
              </TableRow>
            ) : (
              (roomTypes || []).map(roomType => (
                <TableRow key={roomType.id}>
                  <TableCell className="font-medium">{roomType.name}</TableCell>
                  <TableCell>
                    <Badge variant="outline">{roomType.code}</Badge>
                  </TableCell>
                  <TableCell>{formatCurrency(roomType.baseRate)}/night</TableCell>
                  <TableCell>{roomType.maxOccupancy} guests</TableCell>
                  <TableCell>{roomType.size ? `${roomType.size} sq ft` : '-'}</TableCell>
                  <TableCell>
                    <div className="flex gap-1 flex-wrap max-w-[200px]">
                      {roomType.amenities.slice(0, 2).map((amenity, idx) => (
                        <Badge key={idx} variant="secondary" className="text-xs">
                          {amenity}
                        </Badge>
                      ))}
                      {roomType.amenities.length > 2 && (
                        <Badge variant="secondary" className="text-xs">
                          +{roomType.amenities.length - 2}
                        </Badge>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={roomType.isActive ? 'default' : 'secondary'}>
                      {roomType.isActive ? 'Active' : 'Inactive'}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleEditRoomType(roomType)}
                      >
                        <PencilSimple size={16} />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleDeleteRoomType(roomType.id)}
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
    </Card>
  )

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-semibold">Room Management</h1>
          <p className="text-muted-foreground mt-1">Manage hotel rooms, types, and their status</p>
        </div>
        <Button onClick={activeTab === 'rooms' ? handleAdd : handleAddRoomType} size="lg">
          <Plus size={20} className="mr-2" />
          {activeTab === 'rooms' ? 'Add Room' : 'Add Room Type'}
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={(val) => setActiveTab(val as 'rooms' | 'types')}>
        <TabsList>
          <TabsTrigger value="rooms">
            <Bed size={18} className="mr-2" />
            Rooms
          </TabsTrigger>
          <TabsTrigger value="types">
            <Tag size={18} className="mr-2" />
            Room Types
          </TabsTrigger>
        </TabsList>

        <TabsContent value="rooms" className="space-y-6 mt-6">
          {renderRoomsTab()}
        </TabsContent>

        <TabsContent value="types" className="space-y-6 mt-6">
          {renderRoomTypesTab()}
        </TabsContent>
      </Tabs>

      <RoomDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        room={selectedRoom}
        onSave={handleSave}
      />

      <RoomDetailsDialog
        open={isDetailsOpen}
        onOpenChange={setIsDetailsOpen}
        room={selectedRoom}
        onEdit={handleEdit}
      />

      <RoomTypeDialog
        open={isRoomTypeDialogOpen}
        onOpenChange={setIsRoomTypeDialogOpen}
        roomType={selectedRoomType}
        onSave={handleSaveRoomType}
      />
    </div>
  )
}
