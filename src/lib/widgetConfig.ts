import type {
  DashboardWidgetType,
  SystemRole,
  UserRole,
  RoleWidgetPreset,
  WidgetSize
} from './types'

export const ALL_WIDGETS: DashboardWidgetType[] = [
  'occupancy',
  'revenue-today',
  'housekeeping',
  'amenities-stock',
  'food-inventory',
  'maintenance-construction',
  'fnb-performance',
  'maintenance-status',
  'room-status',
  'low-stock',
  'arrivals-departures',
  'guest-feedback',
  'revenue-chart',
  'occupancy-chart',
  'department-performance',
  'pending-approvals',
  'financial-summary',
  'kitchen-operations',
  'crm-summary',
  'channel-performance',
  'period-comparison'
]

const ROLE_PRESETS: Record<SystemRole | UserRole, RoleWidgetPreset> = {
  admin: {
    role: 'admin',
    name: 'Administrator Dashboard',
    description: 'Complete overview of all hotel operations, financials, and staff performance',
    defaultWidgets: [
      'occupancy',
      'revenue-today',
      'financial-summary',
      'department-performance',
      'pending-approvals',
      'housekeeping',
      'room-status',
      'channel-performance'
    ],
    recommendedWidgets: [
      'revenue-chart',
      'occupancy-chart',
      'crm-summary',
      'fnb-performance',
      'maintenance-status'
    ],
    layout: {
      columns: 3,
      widgetSizes: {
        'occupancy': 'small',
        'revenue-today': 'small',
        'financial-summary': 'medium',
        'department-performance': 'large',
        'pending-approvals': 'medium',
        'housekeeping': 'small',
        'room-status': 'large',
        'channel-performance': 'large',
        'revenue-chart': 'large',
        'occupancy-chart': 'large',
        'crm-summary': 'medium',
        'fnb-performance': 'medium',
        'maintenance-status': 'medium',
        'amenities-stock': 'small',
        'food-inventory': 'small',
        'maintenance-construction': 'small',
        'low-stock': 'large',
        'arrivals-departures': 'medium',
        'guest-feedback': 'medium',
        'kitchen-operations': 'medium',
        'period-comparison': 'large'
      }
    }
  },

  manager: {
    role: 'manager',
    name: 'Manager Dashboard',
    description: 'Monitor operations, revenue, guest satisfaction, and team performance',
    defaultWidgets: [
      'occupancy',
      'revenue-today',
      'housekeeping',
      'fnb-performance',
      'pending-approvals',
      'crm-summary',
      'room-status'
    ],
    recommendedWidgets: [
      'arrivals-departures',
      'guest-feedback',
      'maintenance-status',
      'channel-performance'
    ],
    layout: {
      columns: 2,
      widgetSizes: {
        'occupancy': 'small',
        'revenue-today': 'small',
        'housekeeping': 'small',
        'fnb-performance': 'medium',
        'pending-approvals': 'medium',
        'crm-summary': 'medium',
        'room-status': 'large',
        'arrivals-departures': 'medium',
        'guest-feedback': 'medium',
        'maintenance-status': 'medium',
        'channel-performance': 'large',
        'financial-summary': 'medium',
        'department-performance': 'large',
        'amenities-stock': 'small',
        'food-inventory': 'small',
        'maintenance-construction': 'small',
        'low-stock': 'large',
        'revenue-chart': 'large',
        'occupancy-chart': 'large',
        'kitchen-operations': 'medium',
        'period-comparison': 'large'
      }
    }
  },

  'front-desk': {
    role: 'front-desk',
    name: 'Front Desk Dashboard',
    description: 'Focus on guest arrivals, departures, reservations, and room status',
    defaultWidgets: [
      'arrivals-departures',
      'occupancy',
      'room-status',
      'housekeeping',
      'guest-feedback'
    ],
    recommendedWidgets: [
      'crm-summary',
      'pending-approvals'
    ],
    layout: {
      columns: 2,
      widgetSizes: {
        'arrivals-departures': 'large',
        'occupancy': 'small',
        'room-status': 'large',
        'housekeeping': 'small',
        'guest-feedback': 'medium',
        'crm-summary': 'medium',
        'pending-approvals': 'medium',
        'revenue-today': 'small',
        'fnb-performance': 'medium',
        'maintenance-status': 'medium',
        'amenities-stock': 'small',
        'food-inventory': 'small',
        'maintenance-construction': 'small',
        'low-stock': 'large',
        'revenue-chart': 'large',
        'occupancy-chart': 'large',
        'department-performance': 'large',
        'financial-summary': 'medium',
        'kitchen-operations': 'medium',
        'channel-performance': 'large',
        'period-comparison': 'large'
      }
    }
  },

  housekeeper: {
    role: 'housekeeper',
    name: 'Housekeeping Dashboard',
    description: 'Track room status, cleaning tasks, and inventory for housekeeping operations',
    defaultWidgets: [
      'housekeeping',
      'room-status',
      'amenities-stock',
      'occupancy'
    ],
    recommendedWidgets: [
      'arrivals-departures',
      'low-stock'
    ],
    layout: {
      columns: 2,
      widgetSizes: {
        'housekeeping': 'medium',
        'room-status': 'large',
        'amenities-stock': 'small',
        'occupancy': 'small',
        'arrivals-departures': 'medium',
        'low-stock': 'large',
        'revenue-today': 'small',
        'fnb-performance': 'medium',
        'maintenance-status': 'medium',
        'food-inventory': 'small',
        'maintenance-construction': 'small',
        'revenue-chart': 'large',
        'occupancy-chart': 'large',
        'department-performance': 'large',
        'pending-approvals': 'medium',
        'financial-summary': 'medium',
        'kitchen-operations': 'medium',
        'crm-summary': 'medium',
        'guest-feedback': 'medium',
        'channel-performance': 'large',
        'period-comparison': 'large'
      }
    }
  },

  chef: {
    role: 'chef',
    name: 'Kitchen Operations Dashboard',
    description: 'Monitor kitchen operations, food inventory, orders, and menu performance',
    defaultWidgets: [
      'kitchen-operations',
      'fnb-performance',
      'food-inventory',
      'low-stock'
    ],
    recommendedWidgets: [
      'occupancy',
      'arrivals-departures'
    ],
    layout: {
      columns: 2,
      widgetSizes: {
        'kitchen-operations': 'large',
        'fnb-performance': 'medium',
        'food-inventory': 'small',
        'low-stock': 'large',
        'occupancy': 'small',
        'arrivals-departures': 'medium',
        'housekeeping': 'small',
        'room-status': 'large',
        'amenities-stock': 'small',
        'revenue-today': 'small',
        'maintenance-status': 'medium',
        'maintenance-construction': 'small',
        'revenue-chart': 'large',
        'occupancy-chart': 'large',
        'department-performance': 'large',
        'pending-approvals': 'medium',
        'financial-summary': 'medium',
        'crm-summary': 'medium',
        'guest-feedback': 'medium',
        'channel-performance': 'large',
        'period-comparison': 'large'
      }
    }
  },

  waiter: {
    role: 'waiter',
    name: 'F&B Service Dashboard',
    description: 'Track orders, menu performance, and guest preferences',
    defaultWidgets: [
      'fnb-performance',
      'occupancy',
      'guest-feedback'
    ],
    recommendedWidgets: [
      'arrivals-departures',
      'crm-summary'
    ],
    layout: {
      columns: 2,
      widgetSizes: {
        'fnb-performance': 'large',
        'occupancy': 'small',
        'guest-feedback': 'medium',
        'arrivals-departures': 'medium',
        'crm-summary': 'medium',
        'housekeeping': 'small',
        'room-status': 'large',
        'amenities-stock': 'small',
        'food-inventory': 'small',
        'revenue-today': 'small',
        'maintenance-status': 'medium',
        'low-stock': 'large',
        'maintenance-construction': 'small',
        'revenue-chart': 'large',
        'occupancy-chart': 'large',
        'department-performance': 'large',
        'pending-approvals': 'medium',
        'financial-summary': 'medium',
        'kitchen-operations': 'medium',
        'channel-performance': 'large',
        'period-comparison': 'large'
      }
    }
  },

  engineer: {
    role: 'engineer',
    name: 'Maintenance Dashboard',
    description: 'Monitor maintenance requests, construction projects, and equipment status',
    defaultWidgets: [
      'maintenance-status',
      'maintenance-construction',
      'room-status',
      'low-stock'
    ],
    recommendedWidgets: [
      'pending-approvals',
      'occupancy'
    ],
    layout: {
      columns: 2,
      widgetSizes: {
        'maintenance-status': 'large',
        'maintenance-construction': 'medium',
        'room-status': 'large',
        'low-stock': 'medium',
        'pending-approvals': 'medium',
        'occupancy': 'small',
        'housekeeping': 'small',
        'amenities-stock': 'small',
        'food-inventory': 'small',
        'revenue-today': 'small',
        'fnb-performance': 'medium',
        'revenue-chart': 'large',
        'occupancy-chart': 'large',
        'department-performance': 'large',
        'financial-summary': 'medium',
        'kitchen-operations': 'medium',
        'crm-summary': 'medium',
        'guest-feedback': 'medium',
        'arrivals-departures': 'medium',
        'channel-performance': 'large',
        'period-comparison': 'large'
      }
    }
  },

  accountant: {
    role: 'accountant',
    name: 'Finance Dashboard',
    description: 'Track revenue, expenses, invoices, and financial performance',
    defaultWidgets: [
      'revenue-today',
      'financial-summary',
      'pending-approvals',
      'revenue-chart',
      'occupancy'
    ],
    recommendedWidgets: [
      'channel-performance',
      'department-performance'
    ],
    layout: {
      columns: 2,
      widgetSizes: {
        'revenue-today': 'small',
        'financial-summary': 'large',
        'pending-approvals': 'medium',
        'revenue-chart': 'large',
        'occupancy': 'small',
        'channel-performance': 'large',
        'department-performance': 'large',
        'housekeeping': 'small',
        'room-status': 'large',
        'amenities-stock': 'small',
        'food-inventory': 'small',
        'maintenance-status': 'medium',
        'low-stock': 'large',
        'maintenance-construction': 'small',
        'occupancy-chart': 'large',
        'fnb-performance': 'medium',
        'kitchen-operations': 'medium',
        'crm-summary': 'medium',
        'guest-feedback': 'medium',
        'arrivals-departures': 'medium',
        'period-comparison': 'large'
      }
    }
  },

  'hr-staff': {
    role: 'hr-staff',
    name: 'HR Dashboard',
    description: 'Monitor staff performance, attendance, and department operations',
    defaultWidgets: [
      'department-performance',
      'pending-approvals',
      'occupancy'
    ],
    recommendedWidgets: [
      'housekeeping',
      'fnb-performance',
      'maintenance-status'
    ],
    layout: {
      columns: 2,
      widgetSizes: {
        'department-performance': 'large',
        'pending-approvals': 'medium',
        'occupancy': 'small',
        'housekeeping': 'small',
        'fnb-performance': 'medium',
        'maintenance-status': 'medium',
        'room-status': 'large',
        'amenities-stock': 'small',
        'food-inventory': 'small',
        'revenue-today': 'small',
        'low-stock': 'large',
        'maintenance-construction': 'small',
        'revenue-chart': 'large',
        'occupancy-chart': 'large',
        'financial-summary': 'medium',
        'kitchen-operations': 'medium',
        'crm-summary': 'medium',
        'guest-feedback': 'medium',
        'arrivals-departures': 'medium',
        'channel-performance': 'large',
        'period-comparison': 'large'
      }
    }
  },

  'procurement-manager': {
    role: 'procurement-manager',
    name: 'Procurement Dashboard',
    description: 'Track inventory levels, purchase orders, and supplier management',
    defaultWidgets: [
      'low-stock',
      'food-inventory',
      'amenities-stock',
      'maintenance-construction',
      'pending-approvals'
    ],
    recommendedWidgets: [
      'occupancy',
      'fnb-performance'
    ],
    layout: {
      columns: 2,
      widgetSizes: {
        'low-stock': 'large',
        'food-inventory': 'small',
        'amenities-stock': 'small',
        'maintenance-construction': 'small',
        'pending-approvals': 'medium',
        'occupancy': 'small',
        'fnb-performance': 'medium',
        'housekeeping': 'small',
        'room-status': 'large',
        'revenue-today': 'small',
        'maintenance-status': 'medium',
        'revenue-chart': 'large',
        'occupancy-chart': 'large',
        'department-performance': 'large',
        'financial-summary': 'medium',
        'kitchen-operations': 'medium',
        'crm-summary': 'medium',
        'guest-feedback': 'medium',
        'arrivals-departures': 'medium',
        'channel-performance': 'large',
        'period-comparison': 'large'
      }
    }
  },

  'department-head': {
    role: 'department-head',
    name: 'Department Head Dashboard',
    description: 'Monitor team performance, resources, and operational metrics',
    defaultWidgets: [
      'department-performance',
      'pending-approvals',
      'occupancy',
      'revenue-today'
    ],
    recommendedWidgets: [
      'housekeeping',
      'fnb-performance',
      'low-stock'
    ],
    layout: {
      columns: 2,
      widgetSizes: {
        'department-performance': 'large',
        'pending-approvals': 'medium',
        'occupancy': 'small',
        'revenue-today': 'small',
        'housekeeping': 'small',
        'fnb-performance': 'medium',
        'low-stock': 'large',
        'room-status': 'large',
        'amenities-stock': 'small',
        'food-inventory': 'small',
        'maintenance-status': 'medium',
        'maintenance-construction': 'small',
        'revenue-chart': 'large',
        'occupancy-chart': 'large',
        'financial-summary': 'medium',
        'kitchen-operations': 'medium',
        'crm-summary': 'medium',
        'guest-feedback': 'medium',
        'arrivals-departures': 'medium',
        'channel-performance': 'large',
        'period-comparison': 'large'
      }
    }
  },

  storekeeper: {
    role: 'storekeeper',
    name: 'Inventory Dashboard',
    description: 'Track all inventory levels, stock movements, and reorder requirements',
    defaultWidgets: [
      'low-stock',
      'food-inventory',
      'amenities-stock',
      'maintenance-construction',
      'pending-approvals'
    ],
    recommendedWidgets: [
      'occupancy',
      'housekeeping'
    ],
    layout: {
      columns: 2,
      widgetSizes: {
        'low-stock': 'large',
        'food-inventory': 'small',
        'amenities-stock': 'small',
        'maintenance-construction': 'small',
        'pending-approvals': 'medium',
        'occupancy': 'small',
        'housekeeping': 'small',
        'room-status': 'large',
        'revenue-today': 'small',
        'fnb-performance': 'medium',
        'maintenance-status': 'medium',
        'revenue-chart': 'large',
        'occupancy-chart': 'large',
        'department-performance': 'large',
        'financial-summary': 'medium',
        'kitchen-operations': 'medium',
        'crm-summary': 'medium',
        'guest-feedback': 'medium',
        'arrivals-departures': 'medium',
        'channel-performance': 'large',
        'period-comparison': 'large'
      }
    }
  },

  accounts: {
    role: 'accounts',
    name: 'Accounts Dashboard',
    description: 'Monitor financial transactions, invoices, and payment processing',
    defaultWidgets: [
      'revenue-today',
      'financial-summary',
      'pending-approvals',
      'revenue-chart'
    ],
    recommendedWidgets: [
      'occupancy',
      'channel-performance',
      'department-performance'
    ],
    layout: {
      columns: 2,
      widgetSizes: {
        'revenue-today': 'small',
        'financial-summary': 'large',
        'pending-approvals': 'medium',
        'revenue-chart': 'large',
        'occupancy': 'small',
        'channel-performance': 'large',
        'department-performance': 'large',
        'housekeeping': 'small',
        'room-status': 'large',
        'amenities-stock': 'small',
        'food-inventory': 'small',
        'maintenance-status': 'medium',
        'low-stock': 'large',
        'maintenance-construction': 'small',
        'occupancy-chart': 'large',
        'fnb-performance': 'medium',
        'kitchen-operations': 'medium',
        'crm-summary': 'medium',
        'guest-feedback': 'medium',
        'arrivals-departures': 'medium',
        'period-comparison': 'large'
      }
    }
  },

  'user-requester': {
    role: 'user-requester',
    name: 'User Dashboard',
    description: 'View basic metrics and submit requests',
    defaultWidgets: [
      'occupancy',
      'housekeeping',
      'pending-approvals'
    ],
    recommendedWidgets: [
      'low-stock',
      'maintenance-status'
    ],
    layout: {
      columns: 2,
      widgetSizes: {
        'occupancy': 'small',
        'housekeeping': 'small',
        'pending-approvals': 'medium',
        'low-stock': 'large',
        'maintenance-status': 'medium',
        'room-status': 'large',
        'amenities-stock': 'small',
        'food-inventory': 'small',
        'revenue-today': 'small',
        'fnb-performance': 'medium',
        'maintenance-construction': 'small',
        'revenue-chart': 'large',
        'occupancy-chart': 'large',
        'department-performance': 'large',
        'financial-summary': 'medium',
        'kitchen-operations': 'medium',
        'crm-summary': 'medium',
        'guest-feedback': 'medium',
        'arrivals-departures': 'medium',
        'channel-performance': 'large',
        'period-comparison': 'large'
      }
    }
  }
}

export function getRoleWidgetPresets(role: SystemRole | UserRole): RoleWidgetPreset | null {
  return ROLE_PRESETS[role] || null
}

export function getDefaultWidgetsForRole(role: SystemRole | UserRole): DashboardWidgetType[] {
  const preset = ROLE_PRESETS[role]
  return preset ? preset.defaultWidgets : []
}

export function getAvailableWidgets(): DashboardWidgetType[] {
  return ALL_WIDGETS
}

export function getWidgetSize(role: SystemRole | UserRole, widgetType: DashboardWidgetType): WidgetSize {
  const preset = ROLE_PRESETS[role]
  return preset?.layout.widgetSizes[widgetType] || 'medium'
}
