import type {
  ReportMetric,
  ReportDimension,
  ChartType,
  AggregationType,
  CustomReport,
  ReportData
} from './reportBuilderTypes'
import { toast } from 'sonner'

export const availableMetrics: ReportMetric[] = [
  {
    id: 'revenue-total',
    name: 'Total Revenue',
    description: 'Sum of all revenue streams',
    category: 'revenue',
    aggregation: 'sum',
    dataField: 'revenue.total',
    format: 'currency'
  },
  {
    id: 'revenue-room',
    name: 'Room Revenue',
    description: 'Revenue from room bookings',
    category: 'revenue',
    aggregation: 'sum',
    dataField: 'revenue.rooms',
    format: 'currency'
  },
  {
    id: 'revenue-fnb',
    name: 'F&B Revenue',
    description: 'Revenue from food and beverage sales',
    category: 'revenue',
    aggregation: 'sum',
    dataField: 'revenue.fnb',
    format: 'currency'
  },
  {
    id: 'revenue-extra-services',
    name: 'Extra Services Revenue',
    description: 'Revenue from additional services',
    category: 'revenue',
    aggregation: 'sum',
    dataField: 'revenue.extraServices',
    format: 'currency'
  },
  {
    id: 'revenue-average',
    name: 'Average Revenue',
    description: 'Average revenue per transaction',
    category: 'revenue',
    aggregation: 'average',
    dataField: 'revenue.total',
    format: 'currency'
  },
  {
    id: 'occupancy-rate',
    name: 'Occupancy Rate',
    description: 'Percentage of occupied rooms',
    category: 'occupancy',
    aggregation: 'percentage',
    dataField: 'rooms.occupied',
    format: 'percentage'
  },
  {
    id: 'rooms-available',
    name: 'Available Rooms',
    description: 'Number of available rooms',
    category: 'occupancy',
    aggregation: 'count',
    dataField: 'rooms.available',
    format: 'number'
  },
  {
    id: 'rooms-occupied',
    name: 'Occupied Rooms',
    description: 'Number of occupied rooms',
    category: 'occupancy',
    aggregation: 'count',
    dataField: 'rooms.occupied',
    format: 'number'
  },
  {
    id: 'adr',
    name: 'Average Daily Rate (ADR)',
    description: 'Average rate per occupied room',
    category: 'revenue',
    aggregation: 'average',
    dataField: 'revenue.adr',
    format: 'currency'
  },
  {
    id: 'revpar',
    name: 'Revenue Per Available Room (RevPAR)',
    description: 'Revenue divided by total rooms',
    category: 'revenue',
    aggregation: 'average',
    dataField: 'revenue.revpar',
    format: 'currency'
  },
  {
    id: 'guest-count',
    name: 'Total Guests',
    description: 'Number of guests',
    category: 'guest',
    aggregation: 'count',
    dataField: 'guests.total',
    format: 'number'
  },
  {
    id: 'guest-new',
    name: 'New Guests',
    description: 'First-time guests',
    category: 'guest',
    aggregation: 'count',
    dataField: 'guests.new',
    format: 'number'
  },
  {
    id: 'guest-returning',
    name: 'Returning Guests',
    description: 'Guests with previous stays',
    category: 'guest',
    aggregation: 'count',
    dataField: 'guests.returning',
    format: 'number'
  },
  {
    id: 'average-length-of-stay',
    name: 'Average Length of Stay',
    description: 'Average nights per booking',
    category: 'guest',
    aggregation: 'average',
    dataField: 'reservations.nights',
    format: 'decimal',
    unit: 'nights'
  },
  {
    id: 'booking-count',
    name: 'Total Bookings',
    description: 'Number of reservations',
    category: 'operational',
    aggregation: 'count',
    dataField: 'reservations.total',
    format: 'number'
  },
  {
    id: 'cancellation-count',
    name: 'Cancellations',
    description: 'Number of cancelled bookings',
    category: 'operational',
    aggregation: 'count',
    dataField: 'reservations.cancelled',
    format: 'number'
  },
  {
    id: 'cancellation-rate',
    name: 'Cancellation Rate',
    description: 'Percentage of cancelled bookings',
    category: 'operational',
    aggregation: 'percentage',
    dataField: 'reservations.cancellationRate',
    format: 'percentage'
  },
  {
    id: 'inventory-value',
    name: 'Inventory Value',
    description: 'Total value of inventory',
    category: 'inventory',
    aggregation: 'sum',
    dataField: 'inventory.value',
    format: 'currency'
  },
  {
    id: 'inventory-low-stock',
    name: 'Low Stock Items',
    description: 'Items below reorder level',
    category: 'inventory',
    aggregation: 'count',
    dataField: 'inventory.lowStock',
    format: 'number'
  },
  {
    id: 'expenses-total',
    name: 'Total Expenses',
    description: 'Sum of all expenses',
    category: 'financial',
    aggregation: 'sum',
    dataField: 'expenses.total',
    format: 'currency'
  },
  {
    id: 'profit-margin',
    name: 'Profit Margin',
    description: 'Revenue minus expenses as percentage',
    category: 'financial',
    aggregation: 'percentage',
    dataField: 'financial.profitMargin',
    format: 'percentage'
  },
  {
    id: 'net-profit',
    name: 'Net Profit',
    description: 'Total revenue minus total expenses',
    category: 'financial',
    aggregation: 'sum',
    dataField: 'financial.netProfit',
    format: 'currency'
  },
  {
    id: 'employee-count',
    name: 'Total Employees',
    description: 'Number of employees',
    category: 'hr',
    aggregation: 'count',
    dataField: 'employees.total',
    format: 'number'
  },
  {
    id: 'attendance-rate',
    name: 'Attendance Rate',
    description: 'Employee attendance percentage',
    category: 'hr',
    aggregation: 'percentage',
    dataField: 'hr.attendanceRate',
    format: 'percentage'
  },
  {
    id: 'labor-cost',
    name: 'Labor Cost',
    description: 'Total employee compensation',
    category: 'hr',
    aggregation: 'sum',
    dataField: 'hr.laborCost',
    format: 'currency'
  },
  {
    id: 'housekeeping-completed',
    name: 'Tasks Completed',
    description: 'Completed housekeeping tasks',
    category: 'operational',
    aggregation: 'count',
    dataField: 'housekeeping.completed',
    format: 'number'
  },
  {
    id: 'housekeeping-efficiency',
    name: 'Housekeeping Efficiency',
    description: 'Task completion rate',
    category: 'operational',
    aggregation: 'percentage',
    dataField: 'housekeeping.efficiency',
    format: 'percentage'
  },
  {
    id: 'fnb-orders',
    name: 'F&B Orders',
    description: 'Number of food and beverage orders',
    category: 'operational',
    aggregation: 'count',
    dataField: 'fnb.orders',
    format: 'number'
  },
  {
    id: 'average-order-value',
    name: 'Average Order Value',
    description: 'Average F&B order amount',
    category: 'revenue',
    aggregation: 'average',
    dataField: 'fnb.orderValue',
    format: 'currency'
  }
]

export const availableDimensions: ReportDimension[] = [
  {
    id: 'time-day',
    name: 'Day',
    description: 'Group by day',
    category: 'time',
    dataType: 'date',
    dataField: 'date.day',
    sortable: true,
    filterable: true
  },
  {
    id: 'time-week',
    name: 'Week',
    description: 'Group by week',
    category: 'time',
    dataType: 'date',
    dataField: 'date.week',
    sortable: true,
    filterable: true
  },
  {
    id: 'time-month',
    name: 'Month',
    description: 'Group by month',
    category: 'time',
    dataType: 'date',
    dataField: 'date.month',
    sortable: true,
    filterable: true
  },
  {
    id: 'time-quarter',
    name: 'Quarter',
    description: 'Group by quarter',
    category: 'time',
    dataType: 'date',
    dataField: 'date.quarter',
    sortable: true,
    filterable: true
  },
  {
    id: 'time-year',
    name: 'Year',
    description: 'Group by year',
    category: 'time',
    dataType: 'date',
    dataField: 'date.year',
    sortable: true,
    filterable: true
  },
  {
    id: 'time-day-of-week',
    name: 'Day of Week',
    description: 'Group by day of week',
    category: 'time',
    dataType: 'string',
    dataField: 'date.dayOfWeek',
    sortable: true,
    filterable: true
  },
  {
    id: 'room-type',
    name: 'Room Type',
    description: 'Group by room category',
    category: 'product',
    dataType: 'string',
    dataField: 'room.type',
    sortable: true,
    filterable: true
  },
  {
    id: 'room-floor',
    name: 'Floor',
    description: 'Group by floor number',
    category: 'location',
    dataType: 'number',
    dataField: 'room.floor',
    sortable: true,
    filterable: true
  },
  {
    id: 'booking-source',
    name: 'Booking Source',
    description: 'Group by booking channel',
    category: 'service',
    dataType: 'string',
    dataField: 'booking.source',
    sortable: true,
    filterable: true
  },
  {
    id: 'guest-nationality',
    name: 'Nationality',
    description: 'Group by guest country',
    category: 'demographic',
    dataType: 'string',
    dataField: 'guest.nationality',
    sortable: true,
    filterable: true
  },
  {
    id: 'guest-segment',
    name: 'Guest Segment',
    description: 'Group by guest type (business, leisure, group)',
    category: 'demographic',
    dataType: 'string',
    dataField: 'guest.segment',
    sortable: true,
    filterable: true
  },
  {
    id: 'payment-method',
    name: 'Payment Method',
    description: 'Group by payment type',
    category: 'service',
    dataType: 'string',
    dataField: 'payment.method',
    sortable: true,
    filterable: true
  },
  {
    id: 'department',
    name: 'Department',
    description: 'Group by hotel department',
    category: 'employee',
    dataType: 'string',
    dataField: 'employee.department',
    sortable: true,
    filterable: true
  },
  {
    id: 'employee-role',
    name: 'Employee Role',
    description: 'Group by employee position',
    category: 'employee',
    dataType: 'string',
    dataField: 'employee.role',
    sortable: true,
    filterable: true
  },
  {
    id: 'service-type',
    name: 'Service Type',
    description: 'Group by service category',
    category: 'service',
    dataType: 'string',
    dataField: 'service.type',
    sortable: true,
    filterable: true
  },
  {
    id: 'inventory-category',
    name: 'Inventory Category',
    description: 'Group by item category',
    category: 'product',
    dataType: 'string',
    dataField: 'inventory.category',
    sortable: true,
    filterable: true
  },
  {
    id: 'supplier',
    name: 'Supplier',
    description: 'Group by supplier name',
    category: 'service',
    dataType: 'string',
    dataField: 'supplier.name',
    sortable: true,
    filterable: true
  },
  {
    id: 'meal-period',
    name: 'Meal Period',
    description: 'Group by breakfast, lunch, dinner',
    category: 'service',
    dataType: 'string',
    dataField: 'fnb.mealPeriod',
    sortable: true,
    filterable: true
  }
]

export function getChartTypesForMetric(aggregation: AggregationType): ChartType[] {
  const baseCharts: ChartType[] = ['table', 'bar', 'line']
  
  switch (aggregation) {
    case 'sum':
    case 'count':
      return [...baseCharts, 'pie', 'area']
    case 'average':
      return [...baseCharts, 'area', 'scatter']
    case 'percentage':
      return [...baseCharts, 'pie']
    case 'min':
    case 'max':
      return [...baseCharts, 'scatter']
    default:
      return baseCharts
  }
}

export function validateReportConfiguration(config: {
  name: string
  metrics: ReportMetric[]
  dimensions: ReportDimension[]
}): { isValid: boolean; error?: string } {
  if (!config.name || config.name.trim() === '') {
    return { isValid: false, error: 'Report name is required' }
  }

  if (config.metrics.length === 0) {
    return { isValid: false, error: 'At least one metric is required' }
  }

  if (config.dimensions.length === 0) {
    return { isValid: false, error: 'At least one dimension is required' }
  }

  return { isValid: true }
}

export function generateReportPreview(report: CustomReport): ReportData {
  const labels = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun']
  const datasets = report.metrics.map((metric, index) => ({
    label: metric.name,
    data: Array.from({ length: 6 }, () => Math.floor(Math.random() * 10000)),
    backgroundColor: `hsl(${index * 60}, 70%, 60%)`,
    borderColor: `hsl(${index * 60}, 70%, 50%)`
  }))

  return { labels, datasets }
}

export function exportReport(report: CustomReport, format: 'pdf' | 'excel' | 'csv') {
  console.log(`Exporting report "${report.name}" as ${format.toUpperCase()}`)
  
  const data = generateReportPreview(report)
  
  if (format === 'csv') {
    let csv = 'Metric,' + data.labels.join(',') + '\n'
    data.datasets.forEach(dataset => {
      csv += dataset.label + ',' + dataset.data.join(',') + '\n'
    })
    
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${report.name.replace(/\s+/g, '_')}_${Date.now()}.csv`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    window.URL.revokeObjectURL(url)
  }
  
  if (format === 'excel' || format === 'pdf') {
    toast.info(`${format.toUpperCase()} export will be available soon`)
  }
}

export function formatMetricValue(value: number, format?: string): string {
  if (format === 'currency') {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(value)
  }
  
  if (format === 'percentage') {
    return `${value.toFixed(1)}%`
  }
  
  if (format === 'decimal') {
    return value.toFixed(2)
  }
  
  return value.toLocaleString()
}
