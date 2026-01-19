import type { ReportTemplate } from './reportTemplateTypes'

export const defaultReportTemplates: ReportTemplate[] = [
  {
    id: 'daily-sales',
    name: 'Daily Sales Report',
    description: 'Comprehensive daily sales summary including room revenue, F&B, and extra services',
    category: 'financial',
    layout: '2-column',
    sections: [
      {
        id: 'revenue-overview',
        title: 'Revenue Overview',
        metrics: ['total-revenue', 'room-revenue', 'fnb-revenue', 'extra-services-revenue'],
        position: 0,
        columnSpan: 2,
        chartType: 'bar'
      },
      {
        id: 'financial-metrics',
        title: 'Financial Metrics',
        metrics: ['total-invoices', 'paid-invoices', 'unpaid-invoices', 'accounts-receivable'],
        position: 1,
        columnSpan: 1,
        chartType: 'none'
      },
      {
        id: 'payment-summary',
        title: 'Payment Summary',
        metrics: ['total-payments', 'cash-flow'],
        position: 2,
        columnSpan: 1,
        chartType: 'none'
      }
    ],
    availableMetrics: ['total-revenue', 'room-revenue', 'fnb-revenue', 'extra-services-revenue', 'total-invoices', 'paid-invoices', 'unpaid-invoices', 'accounts-receivable', 'total-payments', 'cash-flow', 'average-daily-rate', 'revenue-per-available-room'],
    isCustomizable: true,
    defaultDateRange: 'today'
  },
  {
    id: 'occupancy-report',
    name: 'Occupancy Report',
    description: 'Room occupancy statistics with trends and forecasts',
    category: 'operational',
    layout: '2-column',
    sections: [
      {
        id: 'occupancy-overview',
        title: 'Occupancy Overview',
        metrics: ['total-rooms', 'occupied-rooms', 'available-rooms', 'occupancy-rate'],
        position: 0,
        columnSpan: 2,
        chartType: 'line'
      },
      {
        id: 'reservation-status',
        title: 'Reservation Status',
        metrics: ['total-reservations', 'confirmed-reservations', 'pending-reservations', 'cancelled-reservations'],
        position: 1,
        columnSpan: 1,
        chartType: 'pie'
      },
      {
        id: 'performance-metrics',
        title: 'Performance Metrics',
        metrics: ['average-length-of-stay', 'average-daily-rate', 'revenue-per-available-room'],
        position: 2,
        columnSpan: 1,
        chartType: 'none'
      }
    ],
    availableMetrics: ['total-rooms', 'occupied-rooms', 'available-rooms', 'occupancy-rate', 'total-reservations', 'confirmed-reservations', 'pending-reservations', 'cancelled-reservations', 'average-length-of-stay', 'average-daily-rate', 'revenue-per-available-room', 'clean-rooms', 'dirty-rooms'],
    isCustomizable: true,
    defaultDateRange: 'this-week'
  },
  {
    id: 'guest-satisfaction',
    name: 'Guest Satisfaction Report',
    description: 'Feedback analysis, ratings, and complaint resolution metrics',
    category: 'guest',
    layout: '3-column',
    sections: [
      {
        id: 'guest-metrics',
        title: 'Guest Metrics',
        metrics: ['total-guests', 'new-guests', 'returning-guests', 'guest-satisfaction-score'],
        position: 0,
        columnSpan: 3,
        chartType: 'area'
      },
      {
        id: 'complaints',
        title: 'Complaints',
        metrics: ['total-complaints', 'resolved-complaints', 'pending-complaints'],
        position: 1,
        columnSpan: 1,
        chartType: 'pie'
      },
      {
        id: 'reservations',
        title: 'Reservations',
        metrics: ['total-reservations', 'confirmed-reservations'],
        position: 2,
        columnSpan: 1,
        chartType: 'none'
      },
      {
        id: 'operational',
        title: 'Operational Metrics',
        metrics: ['no-show-rate', 'cancellation-rate'],
        position: 3,
        columnSpan: 1,
        chartType: 'none'
      }
    ],
    availableMetrics: ['total-guests', 'new-guests', 'returning-guests', 'guest-satisfaction-score', 'total-complaints', 'resolved-complaints', 'pending-complaints', 'total-reservations', 'confirmed-reservations', 'no-show-rate', 'cancellation-rate'],
    isCustomizable: true,
    defaultDateRange: 'this-month'
  },
  {
    id: 'fnb-performance',
    name: 'F&B Performance Report',
    description: 'Restaurant and bar sales, popular items, and cost analysis',
    category: 'operational',
    layout: '2-column',
    sections: [
      {
        id: 'revenue',
        title: 'F&B Revenue',
        metrics: ['fnb-revenue', 'total-orders', 'average-order-value'],
        position: 0,
        columnSpan: 2,
        chartType: 'bar'
      },
      {
        id: 'order-status',
        title: 'Order Status',
        metrics: ['total-orders', 'completed-orders', 'pending-orders'],
        position: 1,
        columnSpan: 1,
        chartType: 'pie'
      },
      {
        id: 'cost-analysis',
        title: 'Cost Analysis',
        metrics: ['food-cost-percentage', 'total-menu-items'],
        position: 2,
        columnSpan: 1,
        chartType: 'none'
      }
    ],
    availableMetrics: ['fnb-revenue', 'total-orders', 'completed-orders', 'pending-orders', 'average-order-value', 'food-cost-percentage', 'total-menu-items', 'top-selling-items'],
    isCustomizable: true,
    defaultDateRange: 'this-month'
  },
  {
    id: 'housekeeping-performance',
    name: 'Housekeeping Performance',
    description: 'Task completion rates, room cleaning times, and efficiency metrics',
    category: 'operational',
    layout: '2-column',
    sections: [
      {
        id: 'task-overview',
        title: 'Task Overview',
        metrics: ['total-housekeeping-tasks', 'completed-tasks', 'pending-tasks', 'in-progress-tasks'],
        position: 0,
        columnSpan: 2,
        chartType: 'bar'
      },
      {
        id: 'room-status',
        title: 'Room Status',
        metrics: ['dirty-rooms', 'clean-rooms'],
        position: 1,
        columnSpan: 1,
        chartType: 'pie'
      },
      {
        id: 'efficiency',
        title: 'Efficiency Metrics',
        metrics: ['average-cleaning-time', 'housekeeping-efficiency'],
        position: 2,
        columnSpan: 1,
        chartType: 'none'
      }
    ],
    availableMetrics: ['total-housekeeping-tasks', 'completed-tasks', 'pending-tasks', 'in-progress-tasks', 'dirty-rooms', 'clean-rooms', 'average-cleaning-time', 'housekeeping-efficiency'],
    isCustomizable: true,
    defaultDateRange: 'this-week'
  },
  {
    id: 'inventory-status',
    name: 'Inventory Status Report',
    description: 'Current stock levels, reorder requirements, and valuation',
    category: 'inventory',
    layout: '3-column',
    sections: [
      {
        id: 'inventory-overview',
        title: 'Inventory Overview',
        metrics: ['total-inventory-items', 'low-stock-items', 'out-of-stock-items', 'inventory-value'],
        position: 0,
        columnSpan: 3,
        chartType: 'none'
      },
      {
        id: 'food-items',
        title: 'Food Items',
        metrics: ['urgent-food-items', 'expiring-items'],
        position: 1,
        columnSpan: 1,
        chartType: 'none'
      },
      {
        id: 'stock-status',
        title: 'Stock Status',
        metrics: ['low-stock-items', 'out-of-stock-items'],
        position: 2,
        columnSpan: 1,
        chartType: 'pie'
      },
      {
        id: 'metrics',
        title: 'Inventory Metrics',
        metrics: ['inventory-value', 'inventory-turnover'],
        position: 3,
        columnSpan: 1,
        chartType: 'none'
      }
    ],
    availableMetrics: ['total-inventory-items', 'low-stock-items', 'out-of-stock-items', 'inventory-value', 'inventory-turnover', 'urgent-food-items', 'expiring-items'],
    isCustomizable: true,
    defaultDateRange: 'today'
  },
  {
    id: 'profit-loss',
    name: 'Profit & Loss Statement',
    description: 'Complete P&L statement with income, expenses, and net profit',
    category: 'financial',
    layout: '1-column',
    sections: [
      {
        id: 'revenue',
        title: 'Revenue',
        metrics: ['total-revenue', 'room-revenue', 'fnb-revenue', 'extra-services-revenue'],
        position: 0,
        columnSpan: 1,
        chartType: 'bar'
      },
      {
        id: 'expenses',
        title: 'Expenses',
        metrics: ['total-expenses', 'labor-cost'],
        position: 1,
        columnSpan: 1,
        chartType: 'none'
      },
      {
        id: 'profit',
        title: 'Profit',
        metrics: ['net-profit', 'profit-margin'],
        position: 2,
        columnSpan: 1,
        chartType: 'none'
      },
      {
        id: 'balance',
        title: 'Balance Sheet',
        metrics: ['accounts-receivable', 'accounts-payable', 'cash-flow'],
        position: 3,
        columnSpan: 1,
        chartType: 'table'
      }
    ],
    availableMetrics: ['total-revenue', 'room-revenue', 'fnb-revenue', 'extra-services-revenue', 'total-expenses', 'labor-cost', 'net-profit', 'profit-margin', 'accounts-receivable', 'accounts-payable', 'cash-flow'],
    isCustomizable: true,
    defaultDateRange: 'this-month'
  },
  {
    id: 'hr-summary',
    name: 'HR Summary Report',
    description: 'Employee attendance, leave requests, and performance metrics',
    category: 'hr',
    layout: '2-column',
    sections: [
      {
        id: 'employee-overview',
        title: 'Employee Overview',
        metrics: ['total-employees', 'active-employees', 'attendance-rate'],
        position: 0,
        columnSpan: 2,
        chartType: 'line'
      },
      {
        id: 'attendance',
        title: 'Attendance',
        metrics: ['attendance-rate', 'absent-employees'],
        position: 1,
        columnSpan: 1,
        chartType: 'pie'
      },
      {
        id: 'leave-management',
        title: 'Leave Management',
        metrics: ['pending-leave-requests', 'approved-leaves'],
        position: 2,
        columnSpan: 1,
        chartType: 'none'
      },
      {
        id: 'labor-costs',
        title: 'Labor Costs',
        metrics: ['labor-cost', 'labor-cost-percentage'],
        position: 3,
        columnSpan: 1,
        chartType: 'none'
      },
      {
        id: 'performance',
        title: 'Performance',
        metrics: ['average-performance-score'],
        position: 4,
        columnSpan: 1,
        chartType: 'none'
      }
    ],
    availableMetrics: ['total-employees', 'active-employees', 'attendance-rate', 'absent-employees', 'pending-leave-requests', 'approved-leaves', 'labor-cost', 'labor-cost-percentage', 'average-performance-score'],
    isCustomizable: true,
    defaultDateRange: 'this-month'
  },
  {
    id: 'front-desk-daily',
    name: 'Front Desk Daily Report',
    description: 'Daily front office operations: check-ins, check-outs, arrivals, and departures',
    category: 'operational',
    layout: '2-column',
    sections: [
      {
        id: 'daily-activity',
        title: 'Daily Activity',
        metrics: ['arrivals-today', 'departures-today', 'in-house-guests', 'no-shows'],
        position: 0,
        columnSpan: 2,
        chartType: 'bar'
      },
      {
        id: 'reservation-breakdown',
        title: 'Reservation Breakdown',
        metrics: ['confirmed-reservations', 'pending-reservations', 'cancelled-reservations'],
        position: 1,
        columnSpan: 1,
        chartType: 'pie'
      },
      {
        id: 'room-status',
        title: 'Room Status',
        metrics: ['occupied-rooms', 'available-rooms', 'out-of-order-rooms'],
        position: 2,
        columnSpan: 1,
        chartType: 'pie'
      }
    ],
    availableMetrics: ['arrivals-today', 'departures-today', 'in-house-guests', 'no-shows', 'confirmed-reservations', 'pending-reservations', 'cancelled-reservations', 'occupied-rooms', 'available-rooms', 'out-of-order-rooms', 'occupancy-rate'],
    isCustomizable: true,
    defaultDateRange: 'today'
  },
  {
    id: 'weekly-revenue',
    name: 'Weekly Revenue Summary',
    description: 'Week-over-week revenue performance across all departments',
    category: 'financial',
    layout: '2-column',
    sections: [
      {
        id: 'weekly-revenue-trend',
        title: 'Weekly Revenue Trend',
        metrics: ['total-revenue', 'room-revenue', 'fnb-revenue', 'extra-services-revenue'],
        position: 0,
        columnSpan: 2,
        chartType: 'line'
      },
      {
        id: 'revenue-comparison',
        title: 'Week-over-Week Comparison',
        metrics: ['revenue-growth', 'average-daily-rate', 'revenue-per-available-room'],
        position: 1,
        columnSpan: 1,
        chartType: 'none'
      },
      {
        id: 'department-breakdown',
        title: 'Department Breakdown',
        metrics: ['room-revenue-percentage', 'fnb-revenue-percentage', 'other-revenue-percentage'],
        position: 2,
        columnSpan: 1,
        chartType: 'pie'
      }
    ],
    availableMetrics: ['total-revenue', 'room-revenue', 'fnb-revenue', 'extra-services-revenue', 'revenue-growth', 'average-daily-rate', 'revenue-per-available-room', 'room-revenue-percentage', 'fnb-revenue-percentage', 'other-revenue-percentage'],
    isCustomizable: true,
    defaultDateRange: 'this-week'
  },
  {
    id: 'monthly-performance',
    name: 'Monthly Performance Dashboard',
    description: 'Comprehensive monthly overview of all key performance indicators',
    category: 'operational',
    layout: '3-column',
    sections: [
      {
        id: 'kpi-overview',
        title: 'Key Performance Indicators',
        metrics: ['occupancy-rate', 'average-daily-rate', 'revenue-per-available-room', 'guest-satisfaction-score'],
        position: 0,
        columnSpan: 3,
        chartType: 'area'
      },
      {
        id: 'revenue',
        title: 'Revenue',
        metrics: ['total-revenue', 'revenue-growth'],
        position: 1,
        columnSpan: 1,
        chartType: 'none'
      },
      {
        id: 'guests',
        title: 'Guests',
        metrics: ['total-guests', 'new-guests', 'returning-guests'],
        position: 2,
        columnSpan: 1,
        chartType: 'pie'
      },
      {
        id: 'operations',
        title: 'Operations',
        metrics: ['total-reservations', 'completed-tasks', 'total-orders'],
        position: 3,
        columnSpan: 1,
        chartType: 'none'
      }
    ],
    availableMetrics: ['occupancy-rate', 'average-daily-rate', 'revenue-per-available-room', 'guest-satisfaction-score', 'total-revenue', 'revenue-growth', 'total-guests', 'new-guests', 'returning-guests', 'total-reservations', 'completed-tasks', 'total-orders', 'net-profit', 'profit-margin'],
    isCustomizable: true,
    defaultDateRange: 'this-month'
  },
  {
    id: 'quarterly-analysis',
    name: 'Quarterly Business Analysis',
    description: 'Quarterly trends, comparisons, and strategic insights',
    category: 'financial',
    layout: '2-column',
    sections: [
      {
        id: 'quarterly-trends',
        title: 'Quarterly Trends',
        metrics: ['total-revenue', 'total-expenses', 'net-profit', 'profit-margin'],
        position: 0,
        columnSpan: 2,
        chartType: 'line'
      },
      {
        id: 'quarter-comparison',
        title: 'Quarter-over-Quarter',
        metrics: ['revenue-growth', 'occupancy-growth', 'guest-growth'],
        position: 1,
        columnSpan: 1,
        chartType: 'bar'
      },
      {
        id: 'strategic-metrics',
        title: 'Strategic Metrics',
        metrics: ['average-daily-rate', 'revenue-per-available-room', 'labor-cost-percentage'],
        position: 2,
        columnSpan: 1,
        chartType: 'none'
      }
    ],
    availableMetrics: ['total-revenue', 'total-expenses', 'net-profit', 'profit-margin', 'revenue-growth', 'occupancy-growth', 'guest-growth', 'average-daily-rate', 'revenue-per-available-room', 'labor-cost-percentage', 'guest-satisfaction-score'],
    isCustomizable: true,
    defaultDateRange: 'this-quarter'
  },
  {
    id: 'yearly-summary',
    name: 'Annual Summary Report',
    description: 'Year-end comprehensive performance review and annual statistics',
    category: 'financial',
    layout: '3-column',
    sections: [
      {
        id: 'annual-overview',
        title: 'Annual Overview',
        metrics: ['total-revenue', 'net-profit', 'total-guests', 'occupancy-rate'],
        position: 0,
        columnSpan: 3,
        chartType: 'area'
      },
      {
        id: 'revenue-analysis',
        title: 'Revenue Analysis',
        metrics: ['room-revenue', 'fnb-revenue', 'extra-services-revenue'],
        position: 1,
        columnSpan: 1,
        chartType: 'pie'
      },
      {
        id: 'guest-statistics',
        title: 'Guest Statistics',
        metrics: ['total-guests', 'new-guests', 'returning-guests', 'guest-satisfaction-score'],
        position: 2,
        columnSpan: 1,
        chartType: 'bar'
      },
      {
        id: 'financial-summary',
        title: 'Financial Summary',
        metrics: ['total-revenue', 'total-expenses', 'net-profit', 'profit-margin'],
        position: 3,
        columnSpan: 1,
        chartType: 'table'
      }
    ],
    availableMetrics: ['total-revenue', 'net-profit', 'total-guests', 'occupancy-rate', 'room-revenue', 'fnb-revenue', 'extra-services-revenue', 'new-guests', 'returning-guests', 'guest-satisfaction-score', 'total-expenses', 'profit-margin', 'average-daily-rate', 'revenue-per-available-room'],
    isCustomizable: true,
    defaultDateRange: 'this-year'
  },
  {
    id: 'kitchen-operations',
    name: 'Kitchen Operations Report',
    description: 'Kitchen efficiency, waste tracking, and cost analysis',
    category: 'operational',
    layout: '2-column',
    sections: [
      {
        id: 'kitchen-performance',
        title: 'Kitchen Performance',
        metrics: ['total-orders', 'completed-orders', 'average-preparation-time'],
        position: 0,
        columnSpan: 2,
        chartType: 'bar'
      },
      {
        id: 'inventory-usage',
        title: 'Inventory Usage',
        metrics: ['food-cost-percentage', 'waste-percentage', 'inventory-turnover'],
        position: 1,
        columnSpan: 1,
        chartType: 'pie'
      },
      {
        id: 'cost-control',
        title: 'Cost Control',
        metrics: ['total-food-cost', 'waste-cost', 'cost-per-order'],
        position: 2,
        columnSpan: 1,
        chartType: 'none'
      }
    ],
    availableMetrics: ['total-orders', 'completed-orders', 'average-preparation-time', 'food-cost-percentage', 'waste-percentage', 'inventory-turnover', 'total-food-cost', 'waste-cost', 'cost-per-order', 'top-selling-items'],
    isCustomizable: true,
    defaultDateRange: 'this-week'
  },
  {
    id: 'maintenance-report',
    name: 'Maintenance & Engineering Report',
    description: 'Maintenance requests, completion rates, and equipment status',
    category: 'operational',
    layout: '2-column',
    sections: [
      {
        id: 'maintenance-overview',
        title: 'Maintenance Overview',
        metrics: ['total-maintenance-requests', 'completed-maintenance', 'pending-maintenance', 'emergency-requests'],
        position: 0,
        columnSpan: 2,
        chartType: 'bar'
      },
      {
        id: 'request-priority',
        title: 'Request Priority',
        metrics: ['high-priority-requests', 'medium-priority-requests', 'low-priority-requests'],
        position: 1,
        columnSpan: 1,
        chartType: 'pie'
      },
      {
        id: 'performance-metrics',
        title: 'Performance Metrics',
        metrics: ['average-resolution-time', 'completion-rate', 'cost-of-maintenance'],
        position: 2,
        columnSpan: 1,
        chartType: 'none'
      }
    ],
    availableMetrics: ['total-maintenance-requests', 'completed-maintenance', 'pending-maintenance', 'emergency-requests', 'high-priority-requests', 'medium-priority-requests', 'low-priority-requests', 'average-resolution-time', 'completion-rate', 'cost-of-maintenance'],
    isCustomizable: true,
    defaultDateRange: 'this-month'
  },
  {
    id: 'procurement-summary',
    name: 'Procurement Summary Report',
    description: 'Purchase orders, supplier performance, and spending analysis',
    category: 'inventory',
    layout: '2-column',
    sections: [
      {
        id: 'procurement-overview',
        title: 'Procurement Overview',
        metrics: ['total-purchase-orders', 'approved-pos', 'pending-pos', 'total-procurement-spend'],
        position: 0,
        columnSpan: 2,
        chartType: 'bar'
      },
      {
        id: 'supplier-metrics',
        title: 'Supplier Metrics',
        metrics: ['total-suppliers', 'on-time-deliveries', 'supplier-performance-score'],
        position: 1,
        columnSpan: 1,
        chartType: 'none'
      },
      {
        id: 'spending-breakdown',
        title: 'Spending Breakdown',
        metrics: ['food-procurement', 'amenity-procurement', 'construction-procurement'],
        position: 2,
        columnSpan: 1,
        chartType: 'pie'
      }
    ],
    availableMetrics: ['total-purchase-orders', 'approved-pos', 'pending-pos', 'total-procurement-spend', 'total-suppliers', 'on-time-deliveries', 'supplier-performance-score', 'food-procurement', 'amenity-procurement', 'construction-procurement'],
    isCustomizable: true,
    defaultDateRange: 'this-month'
  },
  {
    id: 'cash-flow-analysis',
    name: 'Cash Flow Analysis',
    description: 'Cash receipts, payments, and liquidity analysis',
    category: 'financial',
    layout: '2-column',
    sections: [
      {
        id: 'cash-flow-trend',
        title: 'Cash Flow Trend',
        metrics: ['total-receipts', 'total-payments', 'net-cash-flow'],
        position: 0,
        columnSpan: 2,
        chartType: 'line'
      },
      {
        id: 'receivables',
        title: 'Accounts Receivable',
        metrics: ['accounts-receivable', 'overdue-receivables', 'collection-rate'],
        position: 1,
        columnSpan: 1,
        chartType: 'none'
      },
      {
        id: 'payables',
        title: 'Accounts Payable',
        metrics: ['accounts-payable', 'overdue-payables', 'payment-efficiency'],
        position: 2,
        columnSpan: 1,
        chartType: 'none'
      }
    ],
    availableMetrics: ['total-receipts', 'total-payments', 'net-cash-flow', 'accounts-receivable', 'overdue-receivables', 'collection-rate', 'accounts-payable', 'overdue-payables', 'payment-efficiency', 'cash-flow'],
    isCustomizable: true,
    defaultDateRange: 'this-month'
  },
  {
    id: 'guest-demographic',
    name: 'Guest Demographics Report',
    description: 'Guest profiles, booking sources, and demographic analysis',
    category: 'guest',
    layout: '3-column',
    sections: [
      {
        id: 'demographic-breakdown',
        title: 'Demographic Breakdown',
        metrics: ['total-guests', 'new-guests', 'returning-guests', 'vip-guests'],
        position: 0,
        columnSpan: 3,
        chartType: 'pie'
      },
      {
        id: 'booking-source',
        title: 'Booking Source',
        metrics: ['direct-bookings', 'ota-bookings', 'corporate-bookings'],
        position: 1,
        columnSpan: 1,
        chartType: 'pie'
      },
      {
        id: 'stay-patterns',
        title: 'Stay Patterns',
        metrics: ['average-length-of-stay', 'advance-booking-days', 'cancellation-rate'],
        position: 2,
        columnSpan: 1,
        chartType: 'none'
      },
      {
        id: 'nationality',
        title: 'Guest Nationality',
        metrics: ['domestic-guests', 'international-guests'],
        position: 3,
        columnSpan: 1,
        chartType: 'pie'
      }
    ],
    availableMetrics: ['total-guests', 'new-guests', 'returning-guests', 'vip-guests', 'direct-bookings', 'ota-bookings', 'corporate-bookings', 'average-length-of-stay', 'advance-booking-days', 'cancellation-rate', 'domestic-guests', 'international-guests'],
    isCustomizable: true,
    defaultDateRange: 'this-month'
  },
  {
    id: 'revenue-manager',
    name: 'Revenue Manager Daily Brief',
    description: 'Daily revenue management metrics and pricing recommendations',
    category: 'financial',
    layout: '2-column',
    sections: [
      {
        id: 'daily-performance',
        title: 'Daily Performance',
        metrics: ['occupancy-rate', 'average-daily-rate', 'revenue-per-available-room', 'total-revenue'],
        position: 0,
        columnSpan: 2,
        chartType: 'bar'
      },
      {
        id: 'forecast-vs-actual',
        title: 'Forecast vs. Actual',
        metrics: ['forecasted-occupancy', 'actual-occupancy', 'revenue-variance'],
        position: 1,
        columnSpan: 1,
        chartType: 'none'
      },
      {
        id: 'pickup-analysis',
        title: 'Pickup Analysis',
        metrics: ['new-reservations', 'cancellations', 'modifications'],
        position: 2,
        columnSpan: 1,
        chartType: 'bar'
      }
    ],
    availableMetrics: ['occupancy-rate', 'average-daily-rate', 'revenue-per-available-room', 'total-revenue', 'forecasted-occupancy', 'actual-occupancy', 'revenue-variance', 'new-reservations', 'cancellations', 'modifications'],
    isCustomizable: true,
    defaultDateRange: 'today'
  },
  {
    id: 'department-labor',
    name: 'Departmental Labor Report',
    description: 'Labor costs, productivity, and efficiency by department',
    category: 'hr',
    layout: '2-column',
    sections: [
      {
        id: 'labor-overview',
        title: 'Labor Cost Overview',
        metrics: ['total-labor-cost', 'labor-cost-percentage', 'revenue-per-employee'],
        position: 0,
        columnSpan: 2,
        chartType: 'bar'
      },
      {
        id: 'department-breakdown',
        title: 'Department Breakdown',
        metrics: ['front-office-labor', 'housekeeping-labor', 'fnb-labor', 'maintenance-labor'],
        position: 1,
        columnSpan: 1,
        chartType: 'pie'
      },
      {
        id: 'productivity',
        title: 'Productivity Metrics',
        metrics: ['rooms-per-housekeeper', 'covers-per-server', 'revenue-per-labor-hour'],
        position: 2,
        columnSpan: 1,
        chartType: 'none'
      }
    ],
    availableMetrics: ['total-labor-cost', 'labor-cost-percentage', 'revenue-per-employee', 'front-office-labor', 'housekeeping-labor', 'fnb-labor', 'maintenance-labor', 'rooms-per-housekeeper', 'covers-per-server', 'revenue-per-labor-hour'],
    isCustomizable: true,
    defaultDateRange: 'this-month'
  },
  {
    id: 'night-audit',
    name: 'Night Audit Report',
    description: 'End-of-day financial reconciliation and operational summary',
    category: 'financial',
    layout: '2-column',
    sections: [
      {
        id: 'daily-summary',
        title: 'Daily Summary',
        metrics: ['total-revenue', 'room-revenue', 'fnb-revenue', 'total-payments'],
        position: 0,
        columnSpan: 2,
        chartType: 'bar'
      },
      {
        id: 'room-statistics',
        title: 'Room Statistics',
        metrics: ['arrivals-today', 'departures-today', 'in-house-guests', 'occupancy-rate'],
        position: 1,
        columnSpan: 1,
        chartType: 'none'
      },
      {
        id: 'financial-reconciliation',
        title: 'Financial Reconciliation',
        metrics: ['cash-receipts', 'card-receipts', 'outstanding-balance'],
        position: 2,
        columnSpan: 1,
        chartType: 'pie'
      }
    ],
    availableMetrics: ['total-revenue', 'room-revenue', 'fnb-revenue', 'total-payments', 'arrivals-today', 'departures-today', 'in-house-guests', 'occupancy-rate', 'cash-receipts', 'card-receipts', 'outstanding-balance'],
    isCustomizable: true,
    defaultDateRange: 'today'
  },
  {
    id: 'marketing-campaign',
    name: 'Marketing Campaign Performance',
    description: 'Campaign effectiveness, ROI, and conversion metrics',
    category: 'guest',
    layout: '2-column',
    sections: [
      {
        id: 'campaign-overview',
        title: 'Campaign Overview',
        metrics: ['total-campaigns', 'active-campaigns', 'campaign-reach', 'total-conversions'],
        position: 0,
        columnSpan: 2,
        chartType: 'bar'
      },
      {
        id: 'performance-metrics',
        title: 'Performance Metrics',
        metrics: ['conversion-rate', 'cost-per-acquisition', 'campaign-roi'],
        position: 1,
        columnSpan: 1,
        chartType: 'none'
      },
      {
        id: 'channel-performance',
        title: 'Channel Performance',
        metrics: ['email-campaigns', 'social-media-campaigns', 'direct-campaigns'],
        position: 2,
        columnSpan: 1,
        chartType: 'pie'
      }
    ],
    availableMetrics: ['total-campaigns', 'active-campaigns', 'campaign-reach', 'total-conversions', 'conversion-rate', 'cost-per-acquisition', 'campaign-roi', 'email-campaigns', 'social-media-campaigns', 'direct-campaigns'],
    isCustomizable: true,
    defaultDateRange: 'this-month'
  }
]
