import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import {
  Bed,
  CheckCircle,
  Warning,
  Wrench,
  Broom,
  Users,
  Clock,
} from '@phosphor-icons/react';
import { type Room, type Reservation } from '@/lib/types';
import { cn } from '@/lib/utils';

interface VisualFloorPlanProps {
  rooms: Room[];
  reservations: Reservation[];
  onRoomClick?: (room: Room) => void;
}

export function VisualFloorPlan({
  rooms,
  reservations,
  onRoomClick,
}: VisualFloorPlanProps) {
  const [selectedFloor, setSelectedFloor] = useState<number>(1);

  // Extract unique floors
  const floors = useMemo(() => {
    const floorSet = new Set(rooms.map((r) => r.floor || 1));
    return Array.from(floorSet).sort((a, b) => a - b);
  }, [rooms]);

  // Filter rooms by selected floor
  const floorRooms = useMemo(() => {
    return rooms.filter((r) => (r.floor || 1) === selectedFloor);
  }, [rooms, selectedFloor]);

  // Group rooms by position (for visual layout)
  const roomLayout = useMemo(() => {
    // Create a grid layout - 10 rooms per row
    const ROOMS_PER_ROW = 10;
    const rows: Room[][] = [];
    
    for (let i = 0; i < floorRooms.length; i += ROOMS_PER_ROW) {
      rows.push(floorRooms.slice(i, i + ROOMS_PER_ROW));
    }
    
    return rows;
  }, [floorRooms]);

  // Get room status details
  const getRoomDetails = (room: Room) => {
    const activeReservation = reservations.find(
      (r) =>
        r.roomId === room.id &&
        r.status === 'checked-in'
    );

    const upcomingReservation = reservations.find(
      (r) =>
        r.roomId === room.id &&
        r.status === 'confirmed' &&
        new Date(r.checkInDate) > new Date()
    );

    return {
      activeReservation,
      upcomingReservation,
    };
  };

  // Get room status color and icon
  const getRoomVisual = (room: Room) => {
    const { activeReservation, upcomingReservation } = getRoomDetails(room);

    switch (room.status) {
      case 'vacant-clean':
        return {
          bgColor: upcomingReservation
            ? 'bg-blue-100 dark:bg-blue-900/20 border-blue-300 dark:border-blue-800'
            : 'bg-success/10 border-success/30',
          icon: <CheckCircle size={20} weight="fill" className="text-success" />,
          label: upcomingReservation ? 'Reserved' : 'Available',
          textColor: upcomingReservation ? 'text-blue-700 dark:text-blue-300' : 'text-success',
        };
      case 'occupied-clean':
      case 'occupied-dirty':
        return {
          bgColor: 'bg-primary/10 border-primary/30',
          icon: <Users size={20} weight="fill" className="text-primary" />,
          label: 'Occupied',
          textColor: 'text-primary',
        };
      case 'vacant-dirty':
        return {
          bgColor: 'bg-accent/10 border-accent/30',
          icon: <Broom size={20} weight="fill" className="text-accent" />,
          label: 'Needs Cleaning',
          textColor: 'text-accent',
        };
      case 'out-of-order':
      case 'maintenance':
      case 'under-maintenance':
        return {
          bgColor: 'bg-destructive/10 border-destructive/30',
          icon: <Wrench size={20} weight="fill" className="text-destructive" />,
          label: 'Maintenance',
          textColor: 'text-destructive',
        };
      default:
        return {
          bgColor: 'bg-muted border-muted-foreground/20',
          icon: <Warning size={20} weight="fill" className="text-muted-foreground" />,
          label: 'Unknown',
          textColor: 'text-muted-foreground',
        };
    }
  };

  // Get legend items
  const legendItems = [
    {
      label: 'Available',
      color: 'bg-success/10 border-success/30',
      icon: <CheckCircle size={16} weight="fill" className="text-success" />,
    },
    {
      label: 'Reserved',
      color: 'bg-blue-100 dark:bg-blue-900/20 border-blue-300 dark:border-blue-800',
      icon: <Clock size={16} weight="fill" className="text-blue-600" />,
    },
    {
      label: 'Occupied',
      color: 'bg-primary/10 border-primary/30',
      icon: <Users size={16} weight="fill" className="text-primary" />,
    },
    {
      label: 'Needs Cleaning',
      color: 'bg-accent/10 border-accent/30',
      icon: <Broom size={16} weight="fill" className="text-accent" />,
    },
    {
      label: 'Maintenance',
      color: 'bg-destructive/10 border-destructive/30',
      icon: <Wrench size={16} weight="fill" className="text-destructive" />,
    },
  ];

  // Room statistics
  const stats = useMemo(() => {
    const total = floorRooms.length;
    const available = floorRooms.filter((r) => r.status === 'vacant-clean').length;
    const occupied = floorRooms.filter(
      (r) => r.status === 'occupied-clean' || r.status === 'occupied-dirty'
    ).length;
    const cleaning = floorRooms.filter((r) => r.status === 'vacant-dirty').length;
    const maintenance = floorRooms.filter(
      (r) => r.status === 'out-of-order' || r.status === 'under-maintenance'
    ).length;

    return { total, available, occupied, cleaning, maintenance };
  }, [floorRooms]);

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Bed size={24} weight="fill" className="text-primary" />
            Visual Floor Plan
          </CardTitle>
          <Select
            value={String(selectedFloor)}
            onValueChange={(val) => setSelectedFloor(Number(val))}
          >
            <SelectTrigger className="w-32">
              <SelectValue placeholder="Select Floor" />
            </SelectTrigger>
            <SelectContent>
              {floors.map((floor) => (
                <SelectItem key={floor} value={String(floor)}>
                  Floor {floor}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-5 gap-2 mt-4">
          <div className="text-center">
            <div className="text-2xl font-bold">{stats.total}</div>
            <div className="text-xs text-muted-foreground">Total</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-success">{stats.available}</div>
            <div className="text-xs text-muted-foreground">Available</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-primary">{stats.occupied}</div>
            <div className="text-xs text-muted-foreground">Occupied</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-accent">{stats.cleaning}</div>
            <div className="text-xs text-muted-foreground">Cleaning</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-destructive">{stats.maintenance}</div>
            <div className="text-xs text-muted-foreground">Maintenance</div>
          </div>
        </div>
      </CardHeader>

      <CardContent>
        {/* Legend */}
        <div className="flex flex-wrap gap-4 mb-6 pb-4 border-b">
          {legendItems.map((item) => (
            <div key={item.label} className="flex items-center gap-2">
              <div className={cn('w-6 h-6 rounded border flex items-center justify-center', item.color)}>
                {item.icon}
              </div>
              <span className="text-sm text-muted-foreground">{item.label}</span>
            </div>
          ))}
        </div>

        {/* Floor Layout */}
        <div className="space-y-4">
          {roomLayout.map((row, rowIndex) => (
            <div key={rowIndex} className="flex flex-wrap gap-3">
              {row.map((room) => {
                const visual = getRoomVisual(room);
                const { activeReservation, upcomingReservation } = getRoomDetails(room);

                return (
                  <TooltipProvider key={room.id}>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="outline"
                          className={cn(
                            'h-20 w-24 flex flex-col items-center justify-center gap-1 border-2 transition-all hover:scale-105',
                            visual.bgColor,
                            'cursor-pointer'
                          )}
                          onClick={() => onRoomClick?.(room)}
                        >
                          {visual.icon}
                          <div className="font-bold text-lg">{room.roomNumber}</div>
                          <div className={cn('text-xs', visual.textColor)}>
                            {visual.label}
                          </div>
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent side="top" className="max-w-xs">
                        <div className="space-y-1">
                          <div className="font-bold">Room {room.roomNumber}</div>
                          <div className="text-sm">Type: {room.roomType}</div>
                          <div className="text-sm">Status: {visual.label}</div>
                          {room.maxOccupancy && (
                            <div className="text-sm">Capacity: {room.maxOccupancy} guests</div>
                          )}
                          {activeReservation && (
                            <div className="text-sm text-primary">
                              Current Guest: Check-out{' '}
                              {new Date(activeReservation.checkOutDate).toLocaleDateString()}
                            </div>
                          )}
                          {upcomingReservation && !activeReservation && (
                            <div className="text-sm text-blue-600">
                              Reserved: Check-in{' '}
                              {new Date(upcomingReservation.checkInDate).toLocaleDateString()}
                            </div>
                          )}
                        </div>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                );
              })}
            </div>
          ))}
        </div>

        {floorRooms.length === 0 && (
          <div className="text-center py-12 text-muted-foreground">
            No rooms on this floor
          </div>
        )}
      </CardContent>
    </Card>
  );
}
