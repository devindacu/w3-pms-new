import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import {
  TrendUp,
  TrendDown,
  Users,
  CurrencyDollar,
  Calendar,
  Bed,
  ChartBar,
  Package,
  Warning,
  CheckCircle,
  Clock,
  DotsSixVertical,
  Eye,
  EyeSlash,
  Sparkle,
} from '@phosphor-icons/react';
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import { cn } from '@/lib/utils';
import { useKV } from '@/hooks/use-kv';

interface DashboardWidget {
  id: string;
  type: 'metric' | 'chart' | 'list' | 'calendar' | 'alert';
  title: string;
  description?: string;
  size: 'small' | 'medium' | 'large' | 'full';
  visible: boolean;
  data?: any;
  config?: {
    icon?: any;
    color?: string;
    chartType?: 'line' | 'bar' | 'area' | 'pie';
  };
}

interface SortableWidgetProps {
  widget: DashboardWidget;
  children: React.ReactNode;
}

function SortableWidget({ widget, children }: SortableWidgetProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: widget.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div ref={setNodeRef} style={style} className={cn(widget.visible ? 'block' : 'hidden')}>
      <div className="group relative">
        <div
          {...attributes}
          {...listeners}
          className="absolute top-2 right-2 cursor-move opacity-0 group-hover:opacity-100 transition-opacity z-10 bg-background/80 backdrop-blur-sm rounded p-1"
        >
          <DotsSixVertical size={20} weight="bold" className="text-muted-foreground" />
        </div>
        {children}
      </div>
    </div>
  );
}

export function EnhancedDashboardWidgets() {
  const [widgets, setWidgets] = useKV<DashboardWidget[]>('dashboardWidgets', [
    {
      id: 'total-revenue',
      type: 'metric',
      title: 'Total Revenue',
      description: 'Last 30 days',
      size: 'small',
      visible: true,
      data: { value: 125840, change: 12.5, trend: 'up' },
      config: {
        icon: CurrencyDollar,
        color: 'text-success',
      },
    },
    {
      id: 'occupancy',
      type: 'metric',
      title: 'Occupancy Rate',
      description: 'Current',
      size: 'small',
      visible: true,
      data: { value: 78, change: 5.2, trend: 'up' },
      config: {
        icon: Bed,
        color: 'text-primary',
      },
    },
    {
      id: 'total-guests',
      type: 'metric',
      title: 'Total Guests',
      description: 'This month',
      size: 'small',
      visible: true,
      data: { value: 342, change: -2.1, trend: 'down' },
      config: {
        icon: Users,
        color: 'text-blue-600',
      },
    },
    {
      id: 'pending-tasks',
      type: 'metric',
      title: 'Pending Tasks',
      description: 'Housekeeping',
      size: 'small',
      visible: true,
      data: { value: 18, change: 0, trend: 'neutral' },
      config: {
        icon: Clock,
        color: 'text-accent',
      },
    },
    {
      id: 'revenue-chart',
      type: 'chart',
      title: 'Revenue Trend',
      description: 'Last 7 days',
      size: 'large',
      visible: true,
      data: [
        { date: 'Mon', revenue: 4200, bookings: 12 },
        { date: 'Tue', revenue: 3800, bookings: 10 },
        { date: 'Wed', revenue: 5100, bookings: 15 },
        { date: 'Thu', revenue: 4900, bookings: 14 },
        { date: 'Fri', revenue: 6200, bookings: 18 },
        { date: 'Sat', revenue: 7500, bookings: 22 },
        { date: 'Sun', revenue: 6800, bookings: 20 },
      ],
      config: {
        chartType: 'area',
      },
    },
    {
      id: 'room-status',
      type: 'chart',
      title: 'Room Status Distribution',
      description: 'Current status',
      size: 'medium',
      visible: true,
      data: [
        { name: 'Occupied', value: 45, color: '#7C3AED' },
        { name: 'Available', value: 28, color: '#10B981' },
        { name: 'Cleaning', value: 15, color: '#F59E0B' },
        { name: 'Maintenance', value: 12, color: '#EF4444' },
      ],
      config: {
        chartType: 'pie',
      },
    },
    {
      id: 'low-stock',
      type: 'alert',
      title: 'Low Stock Alerts',
      description: 'Items needing reorder',
      size: 'medium',
      visible: true,
      data: [
        { id: 1, name: 'Shampoo', quantity: 15, threshold: 50, status: 'critical' },
        { id: 2, name: 'Towels', quantity: 25, threshold: 40, status: 'warning' },
        { id: 3, name: 'Coffee', quantity: 8, threshold: 20, status: 'critical' },
      ],
    },
    {
      id: 'upcoming-checkins',
      type: 'list',
      title: 'Upcoming Check-ins',
      description: 'Today',
      size: 'medium',
      visible: true,
      data: [
        { id: 1, guest: 'John Smith', room: '301', time: '14:00', status: 'confirmed' },
        { id: 2, guest: 'Sarah Johnson', room: '205', time: '15:30', status: 'pending' },
        { id: 3, guest: 'Mike Brown', room: '412', time: '16:00', status: 'confirmed' },
      ],
    },
  ]);

  const [editMode, setEditMode] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      setWidgets((items) => {
        const oldIndex = items.findIndex((item) => item.id === active.id);
        const newIndex = items.findIndex((item) => item.id === over.id);

        return arrayMove(items, oldIndex, newIndex);
      });
    }
  };

  const toggleWidgetVisibility = (widgetId: string) => {
    setWidgets((prev) =>
      prev.map((w) => (w.id === widgetId ? { ...w, visible: !w.visible } : w))
    );
  };

  const getSizeClass = (size: string) => {
    switch (size) {
      case 'small':
        return 'md:col-span-1';
      case 'medium':
        return 'md:col-span-2';
      case 'large':
        return 'md:col-span-3';
      case 'full':
        return 'md:col-span-4';
      default:
        return 'md:col-span-1';
    }
  };

  const renderMetricWidget = (widget: DashboardWidget) => {
    const Icon = widget.config?.icon || ChartBar;
    const data = widget.data || {};

    return (
      <Card className="transition-all hover:shadow-lg">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">{widget.title}</CardTitle>
          <Icon className={cn('h-4 w-4', widget.config?.color)} weight="fill" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {typeof data.value === 'number'
              ? data.value.toLocaleString()
              : data.value}
          </div>
          {data.change !== undefined && (
            <p
              className={cn(
                'text-xs flex items-center gap-1 mt-1',
                data.change > 0 ? 'text-success' : data.change < 0 ? 'text-destructive' : 'text-muted-foreground'
              )}
            >
              {data.change > 0 ? (
                <TrendUp size={12} weight="fill" />
              ) : data.change < 0 ? (
                <TrendDown size={12} weight="fill" />
              ) : null}
              {Math.abs(data.change)}% from last period
            </p>
          )}
          {widget.description && (
            <p className="text-xs text-muted-foreground mt-1">{widget.description}</p>
          )}
        </CardContent>
      </Card>
    );
  };

  const renderChartWidget = (widget: DashboardWidget) => {
    const data = widget.data || [];

    return (
      <Card className="transition-all hover:shadow-lg">
        <CardHeader>
          <CardTitle>{widget.title}</CardTitle>
          {widget.description && <CardDescription>{widget.description}</CardDescription>}
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={200}>
            {widget.config?.chartType === 'area' ? (
              <AreaChart data={data}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Area
                  type="monotone"
                  dataKey="revenue"
                  stroke="#7C3AED"
                  fill="#7C3AED"
                  fillOpacity={0.3}
                />
              </AreaChart>
            ) : widget.config?.chartType === 'pie' ? (
              <PieChart>
                <Pie
                  data={data}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {data.map((entry: any, index: number) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            ) : (
              <BarChart data={data}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="revenue" fill="#7C3AED" />
              </BarChart>
            )}
          </ResponsiveContainer>
        </CardContent>
      </Card>
    );
  };

  const renderListWidget = (widget: DashboardWidget) => {
    const items = widget.data || [];

    return (
      <Card className="transition-all hover:shadow-lg">
        <CardHeader>
          <CardTitle>{widget.title}</CardTitle>
          {widget.description && <CardDescription>{widget.description}</CardDescription>}
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {items.map((item: any) => (
              <div
                key={item.id}
                className="flex items-center justify-between p-3 rounded-lg border bg-card"
              >
                <div className="flex-1">
                  <p className="font-medium">{item.guest}</p>
                  <p className="text-sm text-muted-foreground">
                    Room {item.room} • {item.time}
                  </p>
                </div>
                <Badge
                  variant={item.status === 'confirmed' ? 'default' : 'outline'}
                  className={cn(
                    item.status === 'confirmed' && 'bg-success/10 text-success border-success/20'
                  )}
                >
                  {item.status}
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  };

  const renderAlertWidget = (widget: DashboardWidget) => {
    const items = widget.data || [];

    return (
      <Card className="transition-all hover:shadow-lg border-accent/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Warning size={20} weight="fill" className="text-accent" />
            {widget.title}
          </CardTitle>
          {widget.description && <CardDescription>{widget.description}</CardDescription>}
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {items.map((item: any) => (
              <div key={item.id} className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">{item.name}</span>
                  <Badge
                    variant={item.status === 'critical' ? 'destructive' : 'outline'}
                    className={cn(
                      item.status === 'warning' && 'bg-accent/10 text-accent border-accent/20'
                    )}
                  >
                    {item.quantity} left
                  </Badge>
                </div>
                <Progress value={(item.quantity / item.threshold) * 100} className="h-2" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  };

  const renderWidget = (widget: DashboardWidget) => {
    switch (widget.type) {
      case 'metric':
        return renderMetricWidget(widget);
      case 'chart':
        return renderChartWidget(widget);
      case 'list':
        return renderListWidget(widget);
      case 'alert':
        return renderAlertWidget(widget);
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Dashboard</h2>
          <p className="text-muted-foreground">Overview of your hotel operations</p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setEditMode(!editMode)}
            className={cn(editMode && 'bg-primary text-primary-foreground')}
          >
            <Sparkle size={16} className="mr-2" />
            {editMode ? 'Done Editing' : 'Customize'}
          </Button>
        </div>
      </div>

      {/* Widget Visibility Toggles */}
      {editMode && (
        <Card>
          <CardHeader>
            <CardTitle>Widget Visibility</CardTitle>
            <CardDescription>Show or hide widgets on your dashboard</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {widgets.map((widget) => (
                <Button
                  key={widget.id}
                  variant="outline"
                  size="sm"
                  onClick={() => toggleWidgetVisibility(widget.id)}
                  className={cn(
                    'justify-start',
                    widget.visible && 'bg-primary/10 border-primary'
                  )}
                >
                  {widget.visible ? (
                    <Eye size={16} className="mr-2" />
                  ) : (
                    <EyeSlash size={16} className="mr-2" />
                  )}
                  {widget.title}
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Widgets Grid */}
      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext items={widgets.map((w) => w.id)} strategy={verticalListSortingStrategy}>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {widgets.map((widget) => (
              <div key={widget.id} className={getSizeClass(widget.size)}>
                {editMode ? (
                  <SortableWidget widget={widget}>{renderWidget(widget)}</SortableWidget>
                ) : (
                  widget.visible && renderWidget(widget)
                )}
              </div>
            ))}
          </div>
        </SortableContext>
      </DndContext>
    </div>
  );
}
