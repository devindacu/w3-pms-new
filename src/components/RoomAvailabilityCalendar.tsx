import { useState, useMemo } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { type Reservation, type Room } from '@/lib/types'
import { formatDate } from '@/lib/helpers'
import { CaretLeft, CaretRight, Warning } from '@phosphor-icons/react'

interface RoomAvailabilityCalendarProps {
  rooms: Room[]
  reservations: Reservation[]
  selectedRoomId?: string
  selectedCheckIn?: number
  selectedCheckOut?: number
  onDateRangeSelect?: (checkIn: number, checkOut: number) => void
}

export function RoomAvailabilityCalendar({
  rooms,
  reservations,
  selectedRoomId,
  selectedCheckIn,
  selectedCheckOut,
  onDateRangeSelect
}: RoomAvailabilityCalendarProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date())

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear()
    const month = date.getMonth()
    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)
    const daysInMonth = lastDay.getDate()
    const startingDayOfWeek = firstDay.getDay()

    return { daysInMonth, startingDayOfWeek, year, month }
  }

  const { daysInMonth, startingDayOfWeek, year, month } = getDaysInMonth(currentMonth)

  const getRoomReservationsForDay = (roomId: string, day: number) => {
    const dayStart = new Date(year, month, day, 0, 0, 0).getTime()
    const dayEnd = new Date(year, month, day, 23, 59, 59).getTime()

    return reservations.filter(res => {
      if (res.roomId !== roomId) return false
      if (res.status === 'cancelled' || res.status === 'no-show') return false

      const checkIn = res.checkInDate
      const checkOut = res.checkOutDate

      return (
        (checkIn <= dayEnd && checkOut > dayStart) ||
        (checkIn >= dayStart && checkIn < dayEnd)
      )
    })
  }

  const isDateInSelectedRange = (day: number) => {
    if (!selectedCheckIn || !selectedCheckOut) return false
    const dayTimestamp = new Date(year, month, day).getTime()
    return dayTimestamp >= selectedCheckIn && dayTimestamp < selectedCheckOut
  }

  const hasConflict = (roomId: string, day: number) => {
    if (!selectedRoomId || selectedRoomId !== roomId) return false
    if (!isDateInSelectedRange(day)) return false
    
    const roomReservations = getRoomReservationsForDay(roomId, day)
    return roomReservations.length > 0
  }

  const previousMonth = () => {
    setCurrentMonth(new Date(year, month - 1, 1))
  }

  const nextMonth = () => {
    setCurrentMonth(new Date(year, month + 1, 1))
  }

  const monthName = currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })

  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

  const displayedRooms = selectedRoomId 
    ? rooms.filter(r => r.id === selectedRoomId) 
    : rooms.slice(0, 5)

  return (
    <Card className="p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold">Room Availability Calendar</h3>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={previousMonth}>
            <CaretLeft className="h-4 w-4" />
          </Button>
          <span className="text-sm font-medium min-w-[150px] text-center">{monthName}</span>
          <Button variant="outline" size="sm" onClick={nextMonth}>
            <CaretRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="space-y-2">
        <div className="grid grid-cols-8 gap-1 text-xs font-medium text-muted-foreground">
          <div className="p-2">Room</div>
          {dayNames.map(day => (
            <div key={day} className="p-2 text-center">{day}</div>
          ))}
        </div>

        <ScrollArea className="h-[400px]">
          <div className="space-y-1">
            {displayedRooms.map(room => (
              <div key={room.id} className="grid grid-cols-8 gap-1 items-center">
                <div className="p-2 text-sm font-medium truncate">
                  {room.roomNumber}
                </div>
                
                {Array.from({ length: startingDayOfWeek }).map((_, i) => (
                  <div key={`empty-${i}`} className="p-1"></div>
                ))}

                {Array.from({ length: daysInMonth }).map((_, i) => {
                  const day = i + 1
                  const roomReservations = getRoomReservationsForDay(room.id, day)
                  const isOccupied = roomReservations.length > 0
                  const inSelectedRange = isDateInSelectedRange(day)
                  const conflict = hasConflict(room.id, day)
                  const isToday = new Date().toDateString() === new Date(year, month, day).toDateString()

                  return (
                    <div
                      key={day}
                      className={`
                        p-1 text-xs text-center rounded relative
                        ${isToday ? 'ring-2 ring-primary' : ''}
                        ${isOccupied ? 'bg-destructive/20 text-destructive' : 'bg-success/20 text-success'}
                        ${inSelectedRange ? 'ring-2 ring-accent' : ''}
                        ${conflict ? 'bg-destructive text-destructive-foreground' : ''}
                      `}
                      title={
                        isOccupied
                          ? `${roomReservations.length} reservation(s)`
                          : 'Available'
                      }
                    >
                      <div className="flex flex-col items-center">
                        <span>{day}</span>
                        {conflict && (
                          <Warning className="h-3 w-3 mt-0.5" />
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            ))}
          </div>
        </ScrollArea>

        <div className="flex items-center gap-4 text-xs mt-4 pt-4 border-t">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-success/20 rounded"></div>
            <span>Available</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-destructive/20 rounded"></div>
            <span>Occupied</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-destructive rounded"></div>
            <span>Conflict</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 ring-2 ring-accent rounded"></div>
            <span>Selected Range</span>
          </div>
        </div>
      </div>
    </Card>
  )
}
