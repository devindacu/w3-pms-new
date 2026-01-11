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
  }
]
