/**
 * Advanced Revenue Management System
 * Dynamic pricing, occupancy forecasting, and revenue optimization
 */

import { useState, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  TrendUp,
  TrendDown,
  CurrencyDollar,
  Percent,
  Calendar,
  Users,
  ChartLine,
  Sparkle,
} from '@phosphor-icons/react';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import { useKV } from '@/hooks/use-kv';

interface PricingStrategy {
  id: number;
  name: string;
  type: 'dynamic' | 'seasonal' | 'event-based' | 'competitor-based' | 'occupancy-based';
  active: boolean;
  rules: PricingRule[];
  description?: string;
}

interface PricingRule {
  id: number;
  condition: string; // e.g., "occupancy > 80"
  adjustment: number; // percentage or fixed amount
  adjustmentType: 'percentage' | 'fixed';
  priority: number;
}

interface RevenueMetrics {
  date: string;
  revenue: number;
  occupancy: number;
  adr: number; // Average Daily Rate
  revpar: number; // Revenue Per Available Room
  bookings: number;
  cancellations: number;
}

interface RoomTypePricing {
  roomType: string;
  baseRate: number;
  currentRate: number;
  recommendedRate: number;
  occupancy: number;
  revenue: number;
  trend: 'up' | 'down' | 'stable';
}

export function RevenueManagementSystem() {
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d' | '1y'>('30d');
  const [strategies] = useKV<PricingStrategy[]>('pricingStrategies', [
    {
      id: 1,
      name: 'High Occupancy Premium',
      type: 'occupancy-based',
      active: true,
      rules: [
        {
          id: 1,
          condition: 'occupancy > 80',
          adjustment: 20,
          adjustmentType: 'percentage',
          priority: 1,
        },
        {
          id: 2,
          condition: 'occupancy > 90',
          adjustment: 30,
          adjustmentType: 'percentage',
          priority: 2,
        },
      ],
      description: 'Increase rates when occupancy is high',
    },
    {
      id: 2,
      name: 'Low Occupancy Discount',
      type: 'occupancy-based',
      active: true,
      rules: [
        {
          id: 3,
          condition: 'occupancy < 50',
          adjustment: -15,
          adjustmentType: 'percentage',
          priority: 1,
        },
      ],
      description: 'Offer discounts to boost bookings during low demand',
    },
    {
      id: 3,
      name: 'Weekend Premium',
      type: 'seasonal',
      active: true,
      rules: [
        {
          id: 4,
          condition: 'day in [fri, sat]',
          adjustment: 25,
          adjustmentType: 'percentage',
          priority: 1,
        },
      ],
      description: 'Higher rates on weekends',
    },
  ]);

  // Mock data - in production, fetch from API
  const revenueData: RevenueMetrics[] = useMemo(() => {
    const days = timeRange === '7d' ? 7 : timeRange === '30d' ? 30 : timeRange === '90d' ? 90 : 365;
    const data: RevenueMetrics[] = [];
    
    for (let i = days - 1; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      
      const baseOccupancy = 65 + Math.random() * 20;
      const baseAdr = 150 + Math.random() * 50;
      const totalRooms = 100;
      const occupiedRooms = Math.floor((baseOccupancy / 100) * totalRooms);
      
      data.push({
        date: date.toISOString().split('T')[0],
        revenue: occupiedRooms * baseAdr,
        occupancy: baseOccupancy,
        adr: baseAdr,
        revpar: (baseOccupancy / 100) * baseAdr,
        bookings: Math.floor(10 + Math.random() * 15),
        cancellations: Math.floor(Math.random() * 5),
      });
    }
    
    return data;
  }, [timeRange]);

  const roomTypePricing: RoomTypePricing[] = [
    {
      roomType: 'Standard Room',
      baseRate: 150,
      currentRate: 165,
      recommendedRate: 180,
      occupancy: 85,
      revenue: 14025,
      trend: 'up',
    },
    {
      roomType: 'Deluxe Room',
      baseRate: 220,
      currentRate: 242,
      recommendedRate: 250,
      occupancy: 78,
      revenue: 18876,
      trend: 'up',
    },
    {
      roomType: 'Suite',
      baseRate: 350,
      currentRate: 350,
      recommendedRate: 385,
      occupancy: 65,
      revenue: 22750,
      trend: 'stable',
    },
    {
      roomType: 'Executive Suite',
      baseRate: 500,
      currentRate: 475,
      recommendedRate: 520,
      occupancy: 55,
      revenue: 26125,
      trend: 'down',
    },
  ];

  const totals = useMemo(() => {
    const total = revenueData.reduce((acc, day) => ({
      revenue: acc.revenue + day.revenue,
      bookings: acc.bookings + day.bookings,
      cancellations: acc.cancellations + day.cancellations,
    }), { revenue: 0, bookings: 0, cancellations: 0 });

    const avgOccupancy = revenueData.reduce((sum, day) => sum + day.occupancy, 0) / revenueData.length;
    const avgAdr = revenueData.reduce((sum, day) => sum + day.adr, 0) / revenueData.length;
    const avgRevpar = revenueData.reduce((sum, day) => sum + day.revpar, 0) / revenueData.length;

    return {
      ...total,
      avgOccupancy,
      avgAdr,
      avgRevpar,
    };
  }, [revenueData]);

  const COLORS = ['#7C3AED', '#3B82F6', '#10B981', '#F59E0B'];

  const getTrendIcon = (trend: 'up' | 'down' | 'stable') => {
    if (trend === 'up') return <TrendUp size={16} weight="fill" className="text-success" />;
    if (trend === 'down') return <TrendDown size={16} weight="fill" className="text-destructive" />;
    return <span className="text-muted-foreground">—</span>;
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
    }).format(value);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Revenue Management</h2>
          <p className="text-muted-foreground">
            Dynamic pricing and revenue optimization analytics
          </p>
        </div>
        <Select value={timeRange} onValueChange={(val: any) => setTimeRange(val)}>
          <SelectTrigger className="w-32">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="7d">Last 7 days</SelectItem>
            <SelectItem value="30d">Last 30 days</SelectItem>
            <SelectItem value="90d">Last 90 days</SelectItem>
            <SelectItem value="1y">Last year</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* KPI Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <CurrencyDollar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(totals.revenue)}</div>
            <p className="text-xs text-muted-foreground">
              +12.5% from previous period
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Occupancy</CardTitle>
            <Percent className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totals.avgOccupancy.toFixed(1)}%</div>
            <p className="text-xs text-muted-foreground">
              +3.2% from previous period
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">ADR</CardTitle>
            <CurrencyDollar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(totals.avgAdr)}</div>
            <p className="text-xs text-success flex items-center gap-1">
              <TrendUp size={12} weight="fill" />
              +8.1% from previous period
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">RevPAR</CardTitle>
            <ChartLine className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(totals.avgRevpar)}</div>
            <p className="text-xs text-success flex items-center gap-1">
              <TrendUp size={12} weight="fill" />
              +11.3% from previous period
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="pricing">Dynamic Pricing</TabsTrigger>
          <TabsTrigger value="forecast">Forecast</TabsTrigger>
          <TabsTrigger value="strategies">Strategies</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          {/* Revenue Trend Chart */}
          <Card>
            <CardHeader>
              <CardTitle>Revenue Trend</CardTitle>
              <CardDescription>Daily revenue and occupancy rates</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={revenueData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis
                    dataKey="date"
                    tickFormatter={(date) => new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  />
                  <YAxis yAxisId="left" />
                  <YAxis yAxisId="right" orientation="right" />
                  <Tooltip
                    labelFormatter={(date) => new Date(date).toLocaleDateString()}
                    formatter={(value: number, name: string) => {
                      if (name === 'revenue') return formatCurrency(value);
                      if (name === 'occupancy') return `${value.toFixed(1)}%`;
                      return value;
                    }}
                  />
                  <Legend />
                  <Area
                    yAxisId="left"
                    type="monotone"
                    dataKey="revenue"
                    stroke="#7C3AED"
                    fill="#7C3AED"
                    fillOpacity={0.3}
                    name="Revenue"
                  />
                  <Line
                    yAxisId="right"
                    type="monotone"
                    dataKey="occupancy"
                    stroke="#10B981"
                    name="Occupancy %"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* ADR and RevPAR */}
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Average Daily Rate (ADR)</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={200}>
                  <LineChart data={revenueData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis
                      dataKey="date"
                      tickFormatter={(date) => new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    />
                    <YAxis />
                    <Tooltip
                      labelFormatter={(date) => new Date(date).toLocaleDateString()}
                      formatter={(value: number) => formatCurrency(value)}
                    />
                    <Line type="monotone" dataKey="adr" stroke="#3B82F6" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Revenue Per Available Room (RevPAR)</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={200}>
                  <LineChart data={revenueData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis
                      dataKey="date"
                      tickFormatter={(date) => new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    />
                    <YAxis />
                    <Tooltip
                      labelFormatter={(date) => new Date(date).toLocaleDateString()}
                      formatter={(value: number) => formatCurrency(value)}
                    />
                    <Line type="monotone" dataKey="revpar" stroke="#F59E0B" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="pricing" className="space-y-4">
          {/* Room Type Pricing */}
          <Card>
            <CardHeader>
              <CardTitle>Room Type Pricing Optimization</CardTitle>
              <CardDescription>
                Current rates vs. recommended rates based on demand
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {roomTypePricing.map((room) => (
                  <div key={room.roomType} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h3 className="font-semibold text-lg">{room.roomType}</h3>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <span>{room.occupancy}% occupied</span>
                          {getTrendIcon(room.trend)}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-bold">{formatCurrency(room.currentRate)}</div>
                        <div className="text-sm text-muted-foreground">Current rate</div>
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-4 pt-4 border-t">
                      <div>
                        <div className="text-sm text-muted-foreground">Base Rate</div>
                        <div className="font-medium">{formatCurrency(room.baseRate)}</div>
                      </div>
                      <div>
                        <div className="text-sm text-muted-foreground">Recommended</div>
                        <div className="font-medium text-success">
                          {formatCurrency(room.recommendedRate)}
                        </div>
                      </div>
                      <div>
                        <div className="text-sm text-muted-foreground">Total Revenue</div>
                        <div className="font-medium">{formatCurrency(room.revenue)}</div>
                      </div>
                    </div>

                    {room.currentRate !== room.recommendedRate && (
                      <div className="mt-4">
                        <Button size="sm" className="w-full">
                          <Sparkle size={16} weight="fill" className="mr-2" />
                          Apply Recommended Rate ({formatCurrency(room.recommendedRate)})
                        </Button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="forecast" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Occupancy Forecast</CardTitle>
              <CardDescription>
                Predicted occupancy for the next 30 days
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12 text-muted-foreground">
                <Calendar size={48} className="mx-auto mb-4 opacity-50" />
                <p className="text-lg">Forecasting feature coming soon</p>
                <p className="text-sm">AI-powered demand prediction and optimization</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="strategies" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Active Pricing Strategies</CardTitle>
              <CardDescription>
                Automated pricing rules and adjustments
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {strategies.map((strategy) => (
                  <div key={strategy.id} className="border rounded-lg p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold">{strategy.name}</h3>
                          <Badge variant={strategy.active ? 'default' : 'outline'}>
                            {strategy.active ? 'Active' : 'Inactive'}
                          </Badge>
                          <Badge variant="outline" className="capitalize">
                            {strategy.type}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mt-1">
                          {strategy.description}
                        </p>
                        
                        <div className="mt-3 space-y-2">
                          {strategy.rules.map((rule) => (
                            <div key={rule.id} className="text-sm bg-muted/50 rounded p-2">
                              <span className="font-mono">{rule.condition}</span>
                              {' → '}
                              <span className="font-semibold text-primary">
                                {rule.adjustment > 0 ? '+' : ''}
                                {rule.adjustment}
                                {rule.adjustmentType === 'percentage' ? '%' : ' USD'}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
