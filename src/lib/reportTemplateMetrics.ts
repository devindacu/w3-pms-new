import type { ReportTemplateMetric, ReportMetricCategory } from './reportTemplateTypes'

export const reportTemplateMetrics: ReportTemplateMetric[] = [
  {
    id: 'total-revenue',
    name: 'Total Revenue',
    description: 'Total revenue from all sources',
    category: 'revenue',
    format: 'currency',
    aggregation: 'sum',
    dataSource: 'invoices.grandTotal'
  },
  {
    id: 'room-revenue',
    name: 'Room Revenue',
    description: 'Revenue generated from room bookings',
    category: 'revenue',
    format: 'currency',
    aggregation: 'sum',
    dataSource: 'reservations.totalAmount'
  },
  {
    id: 'fnb-revenue',
    name: 'F&B Revenue',
    description: 'Revenue from food and beverage sales',
    category: 'revenue',
    format: 'currency',
    aggregation: 'sum',
    dataSource: 'orders.total'
  },
  {
    id: 'extra-services-revenue',
    name: 'Extra Services Revenue',
    description: 'Revenue from additional services',
    category: 'revenue',
    format: 'currency',
    aggregation: 'sum',
    dataSource: 'folioExtraServices.totalAmount'
  },
  {
    id: 'average-daily-rate',
    name: 'Average Daily Rate (ADR)',
    description: 'Average revenue per occupied room',
    category: 'revenue',
    format: 'currency',
    aggregation: 'average',
    dataSource: 'reservations.ratePerNight'
  },
  {
    id: 'revenue-per-available-room',
    name: 'RevPAR',
    description: 'Revenue per available room',
    category: 'revenue',
    format: 'currency',
    aggregation: 'average',
    dataSource: 'calculated'
  },
  {
    id: 'total-rooms',
    name: 'Total Rooms',
    description: 'Total number of rooms in the property',
    category: 'occupancy',
    format: 'number',
    aggregation: 'count',
    dataSource: 'rooms'
  },
  {
    id: 'occupied-rooms',
    name: 'Occupied Rooms',
    description: 'Number of rooms currently occupied',
    category: 'occupancy',
    format: 'number',
    aggregation: 'count',
    dataSource: 'rooms.status=occupied'
  },
  {
    id: 'available-rooms',
    name: 'Available Rooms',
    description: 'Number of rooms available for booking',
    category: 'occupancy',
    format: 'number',
    aggregation: 'count',
    dataSource: 'rooms.status=vacant'
  },
  {
    id: 'occupancy-rate',
    name: 'Occupancy Rate',
    description: 'Percentage of rooms occupied',
    category: 'occupancy',
    format: 'percentage',
    aggregation: 'average',
    dataSource: 'calculated'
  },
  {
    id: 'average-length-of-stay',
    name: 'Average Length of Stay',
    description: 'Average number of nights guests stay',
    category: 'occupancy',
    format: 'decimal',
    aggregation: 'average',
    dataSource: 'reservations.nights'
  },
  {
    id: 'total-reservations',
    name: 'Total Reservations',
    description: 'Total number of reservations',
    category: 'occupancy',
    format: 'number',
    aggregation: 'count',
    dataSource: 'reservations'
  },
  {
    id: 'confirmed-reservations',
    name: 'Confirmed Reservations',
    description: 'Number of confirmed reservations',
    category: 'occupancy',
    format: 'number',
    aggregation: 'count',
    dataSource: 'reservations.status=confirmed'
  },
  {
    id: 'pending-reservations',
    name: 'Pending Reservations',
    description: 'Number of pending reservations',
    category: 'occupancy',
    format: 'number',
    aggregation: 'count',
    dataSource: 'reservations.status=pending'
  },
  {
    id: 'cancelled-reservations',
    name: 'Cancelled Reservations',
    description: 'Number of cancelled reservations',
    category: 'occupancy',
    format: 'number',
    aggregation: 'count',
    dataSource: 'reservations.status=cancelled'
  },
  {
    id: 'total-guests',
    name: 'Total Guests',
    description: 'Total number of guests',
    category: 'guest',
    format: 'number',
    aggregation: 'count',
    dataSource: 'guests'
  },
  {
    id: 'new-guests',
    name: 'New Guests',
    description: 'Number of first-time guests',
    category: 'guest',
    format: 'number',
    aggregation: 'count',
    dataSource: 'guests.isFirstVisit=true'
  },
  {
    id: 'returning-guests',
    name: 'Returning Guests',
    description: 'Number of repeat guests',
    category: 'guest',
    format: 'number',
    aggregation: 'count',
    dataSource: 'guests.visitCount>1'
  },
  {
    id: 'guest-satisfaction-score',
    name: 'Guest Satisfaction Score',
    description: 'Average guest satisfaction rating',
    category: 'guest',
    format: 'decimal',
    aggregation: 'average',
    dataSource: 'guestFeedback.rating'
  },
  {
    id: 'total-complaints',
    name: 'Total Complaints',
    description: 'Number of guest complaints',
    category: 'guest',
    format: 'number',
    aggregation: 'count',
    dataSource: 'complaints'
  },
  {
    id: 'resolved-complaints',
    name: 'Resolved Complaints',
    description: 'Number of resolved complaints',
    category: 'guest',
    format: 'number',
    aggregation: 'count',
    dataSource: 'complaints.status=resolved'
  },
  {
    id: 'pending-complaints',
    name: 'Pending Complaints',
    description: 'Number of pending complaints',
    category: 'guest',
    format: 'number',
    aggregation: 'count',
    dataSource: 'complaints.status=pending'
  },
  {
    id: 'total-orders',
    name: 'Total F&B Orders',
    description: 'Total number of food and beverage orders',
    category: 'fnb',
    format: 'number',
    aggregation: 'count',
    dataSource: 'orders'
  },
  {
    id: 'completed-orders',
    name: 'Completed Orders',
    description: 'Number of completed orders',
    category: 'fnb',
    format: 'number',
    aggregation: 'count',
    dataSource: 'orders.status=completed'
  },
  {
    id: 'pending-orders',
    name: 'Pending Orders',
    description: 'Number of pending orders',
    category: 'fnb',
    format: 'number',
    aggregation: 'count',
    dataSource: 'orders.status=pending'
  },
  {
    id: 'average-order-value',
    name: 'Average Order Value',
    description: 'Average value of F&B orders',
    category: 'fnb',
    format: 'currency',
    aggregation: 'average',
    dataSource: 'orders.total'
  },
  {
    id: 'food-cost-percentage',
    name: 'Food Cost %',
    description: 'Food cost as percentage of F&B revenue',
    category: 'fnb',
    format: 'percentage',
    aggregation: 'average',
    dataSource: 'calculated'
  },
  {
    id: 'total-menu-items',
    name: 'Total Menu Items',
    description: 'Number of items on menu',
    category: 'fnb',
    format: 'number',
    aggregation: 'count',
    dataSource: 'menuItems'
  },
  {
    id: 'top-selling-items',
    name: 'Top Selling Items',
    description: 'Most ordered menu items',
    category: 'fnb',
    format: 'number',
    aggregation: 'count',
    dataSource: 'orders.items'
  },
  {
    id: 'total-housekeeping-tasks',
    name: 'Total Housekeeping Tasks',
    description: 'Total number of housekeeping tasks',
    category: 'housekeeping',
    format: 'number',
    aggregation: 'count',
    dataSource: 'housekeepingTasks'
  },
  {
    id: 'completed-tasks',
    name: 'Completed Tasks',
    description: 'Number of completed housekeeping tasks',
    category: 'housekeeping',
    format: 'number',
    aggregation: 'count',
    dataSource: 'housekeepingTasks.status=completed'
  },
  {
    id: 'pending-tasks',
    name: 'Pending Tasks',
    description: 'Number of pending housekeeping tasks',
    category: 'housekeeping',
    format: 'number',
    aggregation: 'count',
    dataSource: 'housekeepingTasks.status=pending'
  },
  {
    id: 'in-progress-tasks',
    name: 'In Progress Tasks',
    description: 'Number of tasks currently in progress',
    category: 'housekeeping',
    format: 'number',
    aggregation: 'count',
    dataSource: 'housekeepingTasks.status=in-progress'
  },
  {
    id: 'average-cleaning-time',
    name: 'Average Cleaning Time',
    description: 'Average time to clean a room (minutes)',
    category: 'housekeeping',
    format: 'number',
    aggregation: 'average',
    dataSource: 'housekeepingTasks.duration'
  },
  {
    id: 'housekeeping-efficiency',
    name: 'Housekeeping Efficiency',
    description: 'Task completion rate percentage',
    category: 'housekeeping',
    format: 'percentage',
    aggregation: 'average',
    dataSource: 'calculated'
  },
  {
    id: 'dirty-rooms',
    name: 'Dirty Rooms',
    description: 'Number of rooms needing cleaning',
    category: 'housekeeping',
    format: 'number',
    aggregation: 'count',
    dataSource: 'rooms.status=dirty'
  },
  {
    id: 'clean-rooms',
    name: 'Clean Rooms',
    description: 'Number of clean rooms',
    category: 'housekeeping',
    format: 'number',
    aggregation: 'count',
    dataSource: 'rooms.status=clean'
  },
  {
    id: 'total-inventory-items',
    name: 'Total Inventory Items',
    description: 'Total number of inventory items',
    category: 'inventory',
    format: 'number',
    aggregation: 'count',
    dataSource: 'inventory'
  },
  {
    id: 'low-stock-items',
    name: 'Low Stock Items',
    description: 'Number of items below reorder level',
    category: 'inventory',
    format: 'number',
    aggregation: 'count',
    dataSource: 'inventory.currentStock<=reorderLevel'
  },
  {
    id: 'out-of-stock-items',
    name: 'Out of Stock Items',
    description: 'Number of items out of stock',
    category: 'inventory',
    format: 'number',
    aggregation: 'count',
    dataSource: 'inventory.currentStock=0'
  },
  {
    id: 'inventory-value',
    name: 'Inventory Value',
    description: 'Total value of current inventory',
    category: 'inventory',
    format: 'currency',
    aggregation: 'sum',
    dataSource: 'calculated'
  },
  {
    id: 'inventory-turnover',
    name: 'Inventory Turnover',
    description: 'Rate of inventory turnover',
    category: 'inventory',
    format: 'decimal',
    aggregation: 'average',
    dataSource: 'calculated'
  },
  {
    id: 'urgent-food-items',
    name: 'Urgent Food Items',
    description: 'Food items needing immediate reorder',
    category: 'inventory',
    format: 'number',
    aggregation: 'count',
    dataSource: 'foodItems.currentStock<reorderLevel'
  },
  {
    id: 'expiring-items',
    name: 'Expiring Items',
    description: 'Items expiring within 7 days',
    category: 'inventory',
    format: 'number',
    aggregation: 'count',
    dataSource: 'foodItems.expiryDate<7days'
  },
  {
    id: 'total-invoices',
    name: 'Total Invoices',
    description: 'Total number of invoices',
    category: 'finance',
    format: 'number',
    aggregation: 'count',
    dataSource: 'guestInvoices'
  },
  {
    id: 'paid-invoices',
    name: 'Paid Invoices',
    description: 'Number of fully paid invoices',
    category: 'finance',
    format: 'number',
    aggregation: 'count',
    dataSource: 'guestInvoices.amountDue=0'
  },
  {
    id: 'unpaid-invoices',
    name: 'Unpaid Invoices',
    description: 'Number of unpaid invoices',
    category: 'finance',
    format: 'number',
    aggregation: 'count',
    dataSource: 'guestInvoices.amountDue>0'
  },
  {
    id: 'total-payments',
    name: 'Total Payments',
    description: 'Total payment amount received',
    category: 'finance',
    format: 'currency',
    aggregation: 'sum',
    dataSource: 'payments.amount'
  },
  {
    id: 'total-expenses',
    name: 'Total Expenses',
    description: 'Total expenses incurred',
    category: 'finance',
    format: 'currency',
    aggregation: 'sum',
    dataSource: 'expenses.amount'
  },
  {
    id: 'accounts-receivable',
    name: 'Accounts Receivable',
    description: 'Total outstanding receivables',
    category: 'finance',
    format: 'currency',
    aggregation: 'sum',
    dataSource: 'guestInvoices.amountDue'
  },
  {
    id: 'accounts-payable',
    name: 'Accounts Payable',
    description: 'Total outstanding payables',
    category: 'finance',
    format: 'currency',
    aggregation: 'sum',
    dataSource: 'invoices.amountDue'
  },
  {
    id: 'net-profit',
    name: 'Net Profit',
    description: 'Total revenue minus total expenses',
    category: 'finance',
    format: 'currency',
    aggregation: 'sum',
    dataSource: 'calculated'
  },
  {
    id: 'profit-margin',
    name: 'Profit Margin',
    description: 'Net profit as percentage of revenue',
    category: 'finance',
    format: 'percentage',
    aggregation: 'average',
    dataSource: 'calculated'
  },
  {
    id: 'cash-flow',
    name: 'Cash Flow',
    description: 'Net cash flow for the period',
    category: 'finance',
    format: 'currency',
    aggregation: 'sum',
    dataSource: 'calculated'
  },
  {
    id: 'total-employees',
    name: 'Total Employees',
    description: 'Total number of employees',
    category: 'hr',
    format: 'number',
    aggregation: 'count',
    dataSource: 'employees'
  },
  {
    id: 'active-employees',
    name: 'Active Employees',
    description: 'Number of currently active employees',
    category: 'hr',
    format: 'number',
    aggregation: 'count',
    dataSource: 'employees.status=active'
  },
  {
    id: 'attendance-rate',
    name: 'Attendance Rate',
    description: 'Employee attendance percentage',
    category: 'hr',
    format: 'percentage',
    aggregation: 'average',
    dataSource: 'calculated'
  },
  {
    id: 'absent-employees',
    name: 'Absent Employees',
    description: 'Number of absent employees',
    category: 'hr',
    format: 'number',
    aggregation: 'count',
    dataSource: 'attendance.status=absent'
  },
  {
    id: 'pending-leave-requests',
    name: 'Pending Leave Requests',
    description: 'Number of pending leave requests',
    category: 'hr',
    format: 'number',
    aggregation: 'count',
    dataSource: 'leaveRequests.status=pending'
  },
  {
    id: 'approved-leaves',
    name: 'Approved Leaves',
    description: 'Number of approved leave requests',
    category: 'hr',
    format: 'number',
    aggregation: 'count',
    dataSource: 'leaveRequests.status=approved'
  },
  {
    id: 'labor-cost',
    name: 'Total Labor Cost',
    description: 'Total labor cost for the period',
    category: 'hr',
    format: 'currency',
    aggregation: 'sum',
    dataSource: 'employees.salary'
  },
  {
    id: 'labor-cost-percentage',
    name: 'Labor Cost %',
    description: 'Labor cost as percentage of revenue',
    category: 'hr',
    format: 'percentage',
    aggregation: 'average',
    dataSource: 'calculated'
  },
  {
    id: 'average-performance-score',
    name: 'Average Performance Score',
    description: 'Average employee performance rating',
    category: 'hr',
    format: 'decimal',
    aggregation: 'average',
    dataSource: 'performanceReviews.rating'
  },
  {
    id: 'maintenance-requests',
    name: 'Maintenance Requests',
    description: 'Total number of maintenance requests',
    category: 'operational',
    format: 'number',
    aggregation: 'count',
    dataSource: 'maintenanceRequests'
  },
  {
    id: 'pending-maintenance',
    name: 'Pending Maintenance',
    description: 'Number of pending maintenance requests',
    category: 'operational',
    format: 'number',
    aggregation: 'count',
    dataSource: 'maintenanceRequests.status=pending'
  },
  {
    id: 'completed-maintenance',
    name: 'Completed Maintenance',
    description: 'Number of completed maintenance requests',
    category: 'operational',
    format: 'number',
    aggregation: 'count',
    dataSource: 'maintenanceRequests.status=completed'
  },
  {
    id: 'no-show-rate',
    name: 'No-Show Rate',
    description: 'Percentage of reservations with no-shows',
    category: 'operational',
    format: 'percentage',
    aggregation: 'average',
    dataSource: 'calculated'
  },
  {
    id: 'cancellation-rate',
    name: 'Cancellation Rate',
    description: 'Percentage of cancelled reservations',
    category: 'operational',
    format: 'percentage',
    aggregation: 'average',
    dataSource: 'calculated'
  },
  {
    id: 'average-response-time',
    name: 'Average Response Time',
    description: 'Average time to respond to guest requests (minutes)',
    category: 'operational',
    format: 'number',
    aggregation: 'average',
    dataSource: 'calculated'
  }
]

export const getMetricsByCategory = (category: ReportMetricCategory): ReportTemplateMetric[] => {
  return reportTemplateMetrics.filter(m => m.category === category)
}

export const getMetricById = (id: string): ReportTemplateMetric | undefined => {
  return reportTemplateMetrics.find(m => m.id === id)
}

export const getMetricCategoryColor = (category: ReportMetricCategory): string => {
  const colors: Record<ReportMetricCategory, string> = {
    revenue: 'bg-green-500',
    occupancy: 'bg-blue-500',
    guest: 'bg-purple-500',
    fnb: 'bg-orange-500',
    housekeeping: 'bg-pink-500',
    inventory: 'bg-yellow-500',
    finance: 'bg-emerald-500',
    hr: 'bg-indigo-500',
    operational: 'bg-cyan-500'
  }
  return colors[category] || 'bg-gray-500'
}
