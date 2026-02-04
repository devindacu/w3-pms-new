import { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import {
  CookingPot,
  Clock,
  CheckCircle,
  Warning,
  Fire,
  Bell,
  Users,
  Timer,
} from '@phosphor-icons/react';
import { useKV } from '@github/spark/hooks';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

interface KDSOrder {
  id: number;
  orderNumber: string;
  tableNumber?: string;
  roomNumber?: string;
  orderType: 'dine-in' | 'room-service' | 'takeout';
  items: KDSOrderItem[];
  status: 'new' | 'preparing' | 'ready' | 'completed';
  priority: 'normal' | 'high' | 'urgent';
  createdAt: string;
  startedAt?: string;
  completedAt?: string;
  estimatedTime: number; // in minutes
  specialInstructions?: string;
  guestName?: string;
}

interface KDSOrderItem {
  id: number;
  name: string;
  quantity: number;
  status: 'pending' | 'preparing' | 'done';
  station: 'hot' | 'cold' | 'grill' | 'fryer' | 'pastry' | 'drinks';
  preparationTime: number; // in minutes
  modifiers?: string[];
  notes?: string;
}

export function KitchenDisplaySystem() {
  const [orders, setOrders] = useKV<KDSOrder[]>('kdsOrders', []);
  const [selectedStation, setSelectedStation] = useState<string>('all');
  const [soundEnabled, setSoundEnabled] = useKV<boolean>('kdsSoundEnabled', true);
  const [autoRefresh, setAutoRefresh] = useState(true);

  // Auto-refresh every 5 seconds
  useEffect(() => {
    if (!autoRefresh) return;

    const interval = setInterval(() => {
      // In a real implementation, this would fetch new orders from the server
      // Trigger re-render by updating timestamp
      setOrders((current) => [...current]);
    }, 5000);

    return () => clearInterval(interval);
  }, [autoRefresh, setOrders]); // Removed 'orders' dependency to prevent unnecessary re-renders

  // Play sound for new orders
  useEffect(() => {
    const newOrders = orders.filter((o) => o.status === 'new');
    if (newOrders.length > 0 && soundEnabled) {
      // In a real implementation, play a sound here
      // new Audio('/notification.mp3').play();
    }
  }, [orders, soundEnabled]);

  const filteredOrders = useMemo(() => {
    let filtered = orders.filter((order) => order.status !== 'completed');

    if (selectedStation !== 'all') {
      filtered = filtered.filter((order) =>
        order.items.some((item) => item.station === selectedStation)
      );
    }

    // Sort by priority and time
    filtered.sort((a, b) => {
      // Urgent first
      if (a.priority === 'urgent' && b.priority !== 'urgent') return -1;
      if (a.priority !== 'urgent' && b.priority === 'urgent') return 1;
      
      // High priority second
      if (a.priority === 'high' && b.priority === 'normal') return -1;
      if (a.priority === 'normal' && b.priority === 'high') return 1;

      // Then by creation time (oldest first)
      return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
    });

    return filtered;
  }, [orders, selectedStation]);

  const stats = useMemo(() => {
    return {
      total: orders.filter((o) => o.status !== 'completed').length,
      new: orders.filter((o) => o.status === 'new').length,
      preparing: orders.filter((o) => o.status === 'preparing').length,
      ready: orders.filter((o) => o.status === 'ready').length,
      urgent: orders.filter((o) => o.priority === 'urgent' && o.status !== 'completed').length,
    };
  }, [orders]);

  const getElapsedTime = (createdAt: string, startedAt?: string): string => {
    const start = startedAt ? new Date(startedAt) : new Date(createdAt);
    const elapsed = Math.floor((Date.now() - start.getTime()) / 1000 / 60);
    return `${elapsed} min`;
  };

  const getProgressPercentage = (order: KDSOrder): number => {
    const completedItems = order.items.filter((i) => i.status === 'done').length;
    return (completedItems / order.items.length) * 100;
  };

  const handleStartOrder = (orderId: number) => {
    setOrders(
      orders.map((o) =>
        o.id === orderId
          ? {
              ...o,
              status: 'preparing',
              startedAt: new Date().toISOString(),
            }
          : o
      )
    );
    toast.success('Order started');
  };

  const handleCompleteItem = (orderId: number, itemId: number) => {
    setOrders(
      orders.map((o) => {
        if (o.id === orderId) {
          const updatedItems = o.items.map((item) =>
            item.id === itemId ? { ...item, status: 'done' as const } : item
          );
          const allDone = updatedItems.every((item) => item.status === 'done');

          return {
            ...o,
            items: updatedItems,
            status: allDone ? ('ready' as const) : o.status,
            completedAt: allDone ? new Date().toISOString() : o.completedAt,
          };
        }
        return o;
      })
    );
  };

  const handleMarkReady = (orderId: number) => {
    setOrders(
      orders.map((o) =>
        o.id === orderId
          ? {
              ...o,
              status: 'ready',
              completedAt: new Date().toISOString(),
            }
          : o
      )
    );
    toast.success('Order ready for pickup');
  };

  const handleCompleteOrder = (orderId: number) => {
    setOrders(
      orders.map((o) =>
        o.id === orderId
          ? {
              ...o,
              status: 'completed',
            }
          : o
      )
    );
    toast.success('Order completed');
  };

  const getOrderCardColor = (order: KDSOrder) => {
    const elapsed = Math.floor(
      (Date.now() - new Date(order.startedAt || order.createdAt).getTime()) / 1000 / 60
    );

    if (order.priority === 'urgent') {
      return 'border-destructive bg-destructive/5';
    }
    if (elapsed > order.estimatedTime * 1.5) {
      return 'border-destructive bg-destructive/5';
    }
    if (elapsed > order.estimatedTime) {
      return 'border-accent bg-accent/5';
    }
    if (order.status === 'ready') {
      return 'border-success bg-success/5';
    }
    return 'border-primary bg-primary/5';
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'new':
        return <Bell size={20} weight="fill" className="text-blue-600" />;
      case 'preparing':
        return <CookingPot size={20} weight="fill" className="text-accent" />;
      case 'ready':
        return <CheckCircle size={20} weight="fill" className="text-success" />;
      default:
        return <Clock size={20} weight="fill" />;
    }
  };

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case 'urgent':
        return (
          <Badge variant="destructive" className="animate-pulse">
            <Fire size={14} weight="fill" className="mr-1" />
            URGENT
          </Badge>
        );
      case 'high':
        return (
          <Badge variant="outline" className="border-accent text-accent">
            <Warning size={14} weight="fill" className="mr-1" />
            High Priority
          </Badge>
        );
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6 p-6 bg-background min-h-screen">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold tracking-tight">Kitchen Display System</h1>
          <p className="text-muted-foreground">Real-time order management for kitchen staff</p>
        </div>
        <div className="flex items-center gap-4">
          <Select value={selectedStation} onValueChange={setSelectedStation}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Filter Station" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Stations</SelectItem>
              <SelectItem value="hot">Hot Station</SelectItem>
              <SelectItem value="cold">Cold Station</SelectItem>
              <SelectItem value="grill">Grill</SelectItem>
              <SelectItem value="fryer">Fryer</SelectItem>
              <SelectItem value="pastry">Pastry</SelectItem>
              <SelectItem value="drinks">Drinks</SelectItem>
            </SelectContent>
          </Select>
          <Button
            variant={soundEnabled ? 'default' : 'outline'}
            size="sm"
            onClick={() => setSoundEnabled(!soundEnabled)}
          >
            <Bell size={20} weight={soundEnabled ? 'fill' : 'regular'} />
          </Button>
        </div>
      </div>

      {/* Statistics */}
      <div className="grid gap-4 md:grid-cols-5">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Orders</CardTitle>
            <CookingPot className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">New</CardTitle>
            <Bell className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-blue-600">{stats.new}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Preparing</CardTitle>
            <Fire className="h-4 w-4 text-accent" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-accent">{stats.preparing}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ready</CardTitle>
            <CheckCircle className="h-4 w-4 text-success" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-success">{stats.ready}</div>
          </CardContent>
        </Card>
        <Card className={stats.urgent > 0 ? 'border-destructive animate-pulse' : ''}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Urgent</CardTitle>
            <Warning className="h-4 w-4 text-destructive" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-destructive">{stats.urgent}</div>
          </CardContent>
        </Card>
      </div>

      {/* Orders Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {filteredOrders.map((order) => (
          <Card key={order.id} className={cn('border-2', getOrderCardColor(order))}>
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    {getStatusIcon(order.status)}
                    <CardTitle className="text-2xl font-bold">
                      #{order.orderNumber}
                    </CardTitle>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {order.orderType === 'dine-in' && order.tableNumber && (
                      <div className="flex items-center gap-1">
                        <Users size={14} />
                        Table {order.tableNumber}
                      </div>
                    )}
                    {order.orderType === 'room-service' && order.roomNumber && (
                      <div>Room {order.roomNumber}</div>
                    )}
                    {order.guestName && <div>{order.guestName}</div>}
                  </div>
                </div>
                <div className="text-right space-y-1">
                  {getPriorityBadge(order.priority)}
                  <div className="flex items-center gap-1 text-sm">
                    <Timer size={14} />
                    {getElapsedTime(order.createdAt, order.startedAt)}
                  </div>
                </div>
              </div>
            </CardHeader>

            <CardContent className="space-y-3">
              {/* Order Items */}
              <div className="space-y-2">
                {order.items.map((item) => (
                  <div
                    key={item.id}
                    className={cn(
                      'p-2 rounded border',
                      item.status === 'done'
                        ? 'bg-success/10 border-success/30 line-through'
                        : 'bg-background'
                    )}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="font-medium">
                          {item.quantity}x {item.name}
                        </div>
                        {item.modifiers && item.modifiers.length > 0 && (
                          <div className="text-xs text-muted-foreground">
                            {item.modifiers.join(', ')}
                          </div>
                        )}
                        {item.notes && (
                          <div className="text-xs text-accent font-medium mt-1">
                            Note: {item.notes}
                          </div>
                        )}
                      </div>
                      {item.status !== 'done' && order.status === 'preparing' && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleCompleteItem(order.id, item.id)}
                        >
                          <CheckCircle size={16} />
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {order.specialInstructions && (
                <div className="p-2 bg-accent/10 border border-accent/30 rounded text-sm">
                  <div className="font-medium text-accent">Special Instructions:</div>
                  <div>{order.specialInstructions}</div>
                </div>
              )}

              {/* Progress Bar */}
              {order.status === 'preparing' && (
                <div className="space-y-1">
                  <Progress value={getProgressPercentage(order)} className="h-2" />
                  <div className="text-xs text-muted-foreground text-right">
                    {order.items.filter((i) => i.status === 'done').length} /{' '}
                    {order.items.length} items done
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex gap-2 pt-2">
                {order.status === 'new' && (
                  <Button
                    className="w-full"
                    size="lg"
                    onClick={() => handleStartOrder(order.id)}
                  >
                    <Fire size={20} weight="fill" className="mr-2" />
                    Start Order
                  </Button>
                )}
                {order.status === 'preparing' && getProgressPercentage(order) === 100 && (
                  <Button
                    className="w-full"
                    size="lg"
                    variant="default"
                    onClick={() => handleMarkReady(order.id)}
                  >
                    <CheckCircle size={20} weight="fill" className="mr-2" />
                    Mark Ready
                  </Button>
                )}
                {order.status === 'ready' && (
                  <Button
                    className="w-full bg-success hover:bg-success/90"
                    size="lg"
                    onClick={() => handleCompleteOrder(order.id)}
                  >
                    <CheckCircle size={20} weight="fill" className="mr-2" />
                    Complete Order
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredOrders.length === 0 && (
        <Card className="py-12">
          <CardContent>
            <div className="text-center text-muted-foreground">
              <CookingPot size={48} className="mx-auto mb-4 opacity-50" />
              <p className="text-lg">No active orders</p>
              <p className="text-sm">New orders will appear here automatically</p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
