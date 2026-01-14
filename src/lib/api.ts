const API_BASE = '/api';

async function fetchAPI<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE}${endpoint}`, {
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
    ...options,
  });
  
  if (!response.ok) {
    throw new Error(`API error: ${response.statusText}`);
  }
  
  return response.json();
}

export const api = {
  guests: {
    getAll: () => fetchAPI<any[]>('/guests'),
    create: (data: any) => fetchAPI<any>('/guests', { method: 'POST', body: JSON.stringify(data) }),
    update: (id: string, data: any) => fetchAPI<any>(`/guests/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
    delete: (id: string) => fetchAPI<{ success: boolean }>(`/guests/${id}`, { method: 'DELETE' }),
  },
  
  rooms: {
    getAll: () => fetchAPI<any[]>('/rooms'),
    create: (data: any) => fetchAPI<any>('/rooms', { method: 'POST', body: JSON.stringify(data) }),
    update: (id: string, data: any) => fetchAPI<any>(`/rooms/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  },
  
  reservations: {
    getAll: () => fetchAPI<any[]>('/reservations'),
    create: (data: any) => fetchAPI<any>('/reservations', { method: 'POST', body: JSON.stringify(data) }),
    update: (id: string, data: any) => fetchAPI<any>(`/reservations/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  },
  
  folios: {
    getAll: () => fetchAPI<any[]>('/folios'),
    create: (data: any) => fetchAPI<any>('/folios', { method: 'POST', body: JSON.stringify(data) }),
  },
  
  folioCharges: {
    getAll: () => fetchAPI<any[]>('/folio-charges'),
    create: (data: any) => fetchAPI<any>('/folio-charges', { method: 'POST', body: JSON.stringify(data) }),
  },
  
  folioPayments: {
    getAll: () => fetchAPI<any[]>('/folio-payments'),
    create: (data: any) => fetchAPI<any>('/folio-payments', { method: 'POST', body: JSON.stringify(data) }),
  },
  
  inventory: {
    getAll: () => fetchAPI<any[]>('/inventory'),
    create: (data: any) => fetchAPI<any>('/inventory', { method: 'POST', body: JSON.stringify(data) }),
    update: (id: string, data: any) => fetchAPI<any>(`/inventory/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  },
  
  housekeepingTasks: {
    getAll: () => fetchAPI<any[]>('/housekeeping-tasks'),
    create: (data: any) => fetchAPI<any>('/housekeeping-tasks', { method: 'POST', body: JSON.stringify(data) }),
    update: (id: string, data: any) => fetchAPI<any>(`/housekeeping-tasks/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  },
  
  menuItems: {
    getAll: () => fetchAPI<any[]>('/menu-items'),
    create: (data: any) => fetchAPI<any>('/menu-items', { method: 'POST', body: JSON.stringify(data) }),
    update: (id: string, data: any) => fetchAPI<any>(`/menu-items/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  },
  
  orders: {
    getAll: () => fetchAPI<any[]>('/orders'),
    create: (data: any) => fetchAPI<any>('/orders', { method: 'POST', body: JSON.stringify(data) }),
    update: (id: string, data: any) => fetchAPI<any>(`/orders/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  },
  
  suppliers: {
    getAll: () => fetchAPI<any[]>('/suppliers'),
    create: (data: any) => fetchAPI<any>('/suppliers', { method: 'POST', body: JSON.stringify(data) }),
    update: (id: string, data: any) => fetchAPI<any>(`/suppliers/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  },
  
  employees: {
    getAll: () => fetchAPI<any[]>('/employees'),
    create: (data: any) => fetchAPI<any>('/employees', { method: 'POST', body: JSON.stringify(data) }),
    update: (id: string, data: any) => fetchAPI<any>(`/employees/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  },
  
  maintenanceRequests: {
    getAll: () => fetchAPI<any[]>('/maintenance-requests'),
    create: (data: any) => fetchAPI<any>('/maintenance-requests', { method: 'POST', body: JSON.stringify(data) }),
    update: (id: string, data: any) => fetchAPI<any>(`/maintenance-requests/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  },
  
  requisitions: {
    getAll: () => fetchAPI<any[]>('/requisitions'),
    create: (data: any) => fetchAPI<any>('/requisitions', { method: 'POST', body: JSON.stringify(data) }),
    update: (id: string, data: any) => fetchAPI<any>(`/requisitions/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  },
  
  purchaseOrders: {
    getAll: () => fetchAPI<any[]>('/purchase-orders'),
    create: (data: any) => fetchAPI<any>('/purchase-orders', { method: 'POST', body: JSON.stringify(data) }),
    update: (id: string, data: any) => fetchAPI<any>(`/purchase-orders/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  },
  
  grns: {
    getAll: () => fetchAPI<any[]>('/grns'),
    create: (data: any) => fetchAPI<any>('/grns', { method: 'POST', body: JSON.stringify(data) }),
  },
  
  systemUsers: {
    getAll: () => fetchAPI<any[]>('/system-users'),
    create: (data: any) => fetchAPI<any>('/system-users', { method: 'POST', body: JSON.stringify(data) }),
  },
  
  activityLogs: {
    getAll: () => fetchAPI<any[]>('/activity-logs'),
    create: (data: any) => fetchAPI<any>('/activity-logs', { method: 'POST', body: JSON.stringify(data) }),
  },
  
  extraServiceCategories: {
    getAll: () => fetchAPI<any[]>('/extra-service-categories'),
    create: (data: any) => fetchAPI<any>('/extra-service-categories', { method: 'POST', body: JSON.stringify(data) }),
  },
  
  extraServices: {
    getAll: () => fetchAPI<any[]>('/extra-services'),
    create: (data: any) => fetchAPI<any>('/extra-services', { method: 'POST', body: JSON.stringify(data) }),
  },
  
  accounts: {
    getAll: () => fetchAPI<any[]>('/accounts'),
    create: (data: any) => fetchAPI<any>('/accounts', { method: 'POST', body: JSON.stringify(data) }),
  },
  
  payments: {
    getAll: () => fetchAPI<any[]>('/payments'),
    create: (data: any) => fetchAPI<any>('/payments', { method: 'POST', body: JSON.stringify(data) }),
  },
  
  expenses: {
    getAll: () => fetchAPI<any[]>('/expenses'),
    create: (data: any) => fetchAPI<any>('/expenses', { method: 'POST', body: JSON.stringify(data) }),
  },
  
  budgets: {
    getAll: () => fetchAPI<any[]>('/budgets'),
    create: (data: any) => fetchAPI<any>('/budgets', { method: 'POST', body: JSON.stringify(data) }),
  },
  
  costCenters: {
    getAll: () => fetchAPI<any[]>('/cost-centers'),
    create: (data: any) => fetchAPI<any>('/cost-centers', { method: 'POST', body: JSON.stringify(data) }),
  },
  
  profitCenters: {
    getAll: () => fetchAPI<any[]>('/profit-centers'),
    create: (data: any) => fetchAPI<any>('/profit-centers', { method: 'POST', body: JSON.stringify(data) }),
  },
  
  amenities: {
    getAll: () => fetchAPI<any[]>('/amenities'),
    create: (data: any) => fetchAPI<any>('/amenities', { method: 'POST', body: JSON.stringify(data) }),
  },
  
  attendances: {
    getAll: () => fetchAPI<any[]>('/attendances'),
    create: (data: any) => fetchAPI<any>('/attendances', { method: 'POST', body: JSON.stringify(data) }),
  },
  
  leaveRequests: {
    getAll: () => fetchAPI<any[]>('/leave-requests'),
    create: (data: any) => fetchAPI<any>('/leave-requests', { method: 'POST', body: JSON.stringify(data) }),
  },
  
  shifts: {
    getAll: () => fetchAPI<any[]>('/shifts'),
    create: (data: any) => fetchAPI<any>('/shifts', { method: 'POST', body: JSON.stringify(data) }),
  },
  
  dutyRosters: {
    getAll: () => fetchAPI<any[]>('/duty-rosters'),
    create: (data: any) => fetchAPI<any>('/duty-rosters', { method: 'POST', body: JSON.stringify(data) }),
  },
};
