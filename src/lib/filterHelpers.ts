import type { DashboardFilters, DashboardFilterCategory } from '@/components/DashboardFilters'
import type {
  Room,
  Reservation,
  HousekeepingTask,
  Order,
  InventoryItem,
  MaintenanceRequest,
  Guest,
  Employee,
  Payment,
  Expense,
  GuestInvoice,
  FoodItem,
  Amenity,
  ConstructionMaterial,
  GeneralProduct
} from '@/lib/types'
import { isWithinInterval, parseISO } from 'date-fns'

export function filterDataByDateRange<T extends { createdAt?: number; date?: number; timestamp?: number }>(
  data: T[],
  dateRange: { from: Date; to: Date }
): T[] {
  const fromTime = dateRange.from.getTime()
  const toTime = dateRange.to.setHours(23, 59, 59, 999)

  return data.filter(item => {
    const itemDate = item.createdAt || item.date || item.timestamp
    if (!itemDate) return true
    return itemDate >= fromTime && itemDate <= toTime
  })
}

export function filterReservationsByDateRange(
  reservations: Reservation[],
  dateRange: { from: Date; to: Date }
): Reservation[] {
  return reservations.filter(reservation => {
    const checkIn = new Date(reservation.checkInDate).getTime()
    const checkOut = new Date(reservation.checkOutDate).getTime()
    const fromTime = dateRange.from.getTime()
    const toTime = dateRange.to.setHours(23, 59, 59, 999)
    
    return (checkIn >= fromTime && checkIn <= toTime) ||
           (checkOut >= fromTime && checkOut <= toTime) ||
           (checkIn <= fromTime && checkOut >= toTime)
  })
}

export function filterOrdersByDateRange(
  orders: Order[],
  dateRange: { from: Date; to: Date }
): Order[] {
  return orders.filter(order => {
    const orderDate = order.createdAt
    const fromTime = dateRange.from.getTime()
    const toTime = dateRange.to.setHours(23, 59, 59, 999)
    return orderDate >= fromTime && orderDate <= toTime
  })
}

export function filterTasksByDateRange(
  tasks: HousekeepingTask[],
  dateRange: { from: Date; to: Date }
): HousekeepingTask[] {
  return tasks.filter(task => {
    const taskDate = task.createdAt
    const fromTime = dateRange.from.getTime()
    const toTime = dateRange.to.setHours(23, 59, 59, 999)
    return taskDate >= fromTime && taskDate <= toTime
  })
}

export function filterMaintenanceByDateRange(
  requests: MaintenanceRequest[],
  dateRange: { from: Date; to: Date }
): MaintenanceRequest[] {
  return requests.filter(request => {
    const requestDate = request.createdAt
    const fromTime = dateRange.from.getTime()
    const toTime = dateRange.to.setHours(23, 59, 59, 999)
    return requestDate >= fromTime && requestDate <= toTime
  })
}

export function filterPaymentsByDateRange(
  payments: Payment[],
  dateRange: { from: Date; to: Date }
): Payment[] {
  return payments.filter(payment => {
    const paymentDate = payment.processedAt
    const fromTime = dateRange.from.getTime()
    const toTime = dateRange.to.setHours(23, 59, 59, 999)
    return paymentDate >= fromTime && paymentDate <= toTime
  })
}

export function filterExpensesByDateRange(
  expenses: Expense[],
  dateRange: { from: Date; to: Date }
): Expense[] {
  return expenses.filter(expense => {
    const expenseDate = expense.date
    const fromTime = dateRange.from.getTime()
    const toTime = dateRange.to.setHours(23, 59, 59, 999)
    return expenseDate >= fromTime && expenseDate <= toTime
  })
}

export function filterInvoicesByDateRange(
  invoices: GuestInvoice[],
  dateRange: { from: Date; to: Date }
): GuestInvoice[] {
  return invoices.filter(invoice => {
    const invoiceDate = invoice.invoiceDate
    const fromTime = dateRange.from.getTime()
    const toTime = dateRange.to.setHours(23, 59, 59, 999)
    return invoiceDate >= fromTime && invoiceDate <= toTime
  })
}

export interface FilteredDashboardData {
  rooms: Room[]
  reservations: Reservation[]
  housekeepingTasks: HousekeepingTask[]
  orders: Order[]
  inventory: InventoryItem[]
  maintenanceRequests: MaintenanceRequest[]
  guests: Guest[]
  employees: Employee[]
  payments: Payment[]
  expenses: Expense[]
  invoices: GuestInvoice[]
  foodItems: FoodItem[]
  amenities: Amenity[]
  constructionMaterials: ConstructionMaterial[]
  generalProducts: GeneralProduct[]
}

export function filterDashboardDataByCategory(
  data: FilteredDashboardData,
  category: DashboardFilterCategory
): FilteredDashboardData {
  if (category === 'all') return data

  const emptyArray = <T>(): T[] => []

  switch (category) {
    case 'rooms':
      return {
        ...data,
        orders: emptyArray(),
        inventory: emptyArray(),
        maintenanceRequests: emptyArray(),
        payments: emptyArray(),
        expenses: emptyArray(),
        employees: emptyArray(),
        foodItems: emptyArray(),
        amenities: emptyArray(),
        constructionMaterials: emptyArray(),
        generalProducts: emptyArray(),
      }
    
    case 'revenue':
      return {
        ...data,
        rooms: emptyArray(),
        housekeepingTasks: emptyArray(),
        inventory: emptyArray(),
        maintenanceRequests: emptyArray(),
        employees: emptyArray(),
        foodItems: emptyArray(),
        amenities: emptyArray(),
        constructionMaterials: emptyArray(),
        generalProducts: emptyArray(),
      }
    
    case 'housekeeping':
      return {
        ...data,
        orders: emptyArray(),
        inventory: emptyArray(),
        payments: emptyArray(),
        expenses: emptyArray(),
        invoices: emptyArray(),
        employees: emptyArray(),
        guests: emptyArray(),
        foodItems: emptyArray(),
        amenities: emptyArray(),
        constructionMaterials: emptyArray(),
        generalProducts: emptyArray(),
      }
    
    case 'fnb':
      return {
        ...data,
        rooms: emptyArray(),
        reservations: emptyArray(),
        housekeepingTasks: emptyArray(),
        maintenanceRequests: emptyArray(),
        payments: emptyArray(),
        expenses: emptyArray(),
        invoices: emptyArray(),
        employees: emptyArray(),
        guests: emptyArray(),
        amenities: emptyArray(),
        constructionMaterials: emptyArray(),
        generalProducts: emptyArray(),
      }
    
    case 'inventory':
      return {
        ...data,
        rooms: emptyArray(),
        reservations: emptyArray(),
        housekeepingTasks: emptyArray(),
        orders: emptyArray(),
        maintenanceRequests: emptyArray(),
        payments: emptyArray(),
        expenses: emptyArray(),
        invoices: emptyArray(),
        employees: emptyArray(),
        guests: emptyArray(),
      }
    
    case 'guests':
      return {
        ...data,
        inventory: emptyArray(),
        maintenanceRequests: emptyArray(),
        payments: emptyArray(),
        expenses: emptyArray(),
        employees: emptyArray(),
        foodItems: emptyArray(),
        amenities: emptyArray(),
        constructionMaterials: emptyArray(),
        generalProducts: emptyArray(),
      }
    
    case 'operations':
      return {
        ...data,
        payments: emptyArray(),
        expenses: emptyArray(),
        invoices: emptyArray(),
        employees: emptyArray(),
        guests: emptyArray(),
      }
    
    case 'hr':
      return {
        ...data,
        rooms: emptyArray(),
        reservations: emptyArray(),
        housekeepingTasks: emptyArray(),
        orders: emptyArray(),
        inventory: emptyArray(),
        maintenanceRequests: emptyArray(),
        payments: emptyArray(),
        expenses: emptyArray(),
        invoices: emptyArray(),
        guests: emptyArray(),
        foodItems: emptyArray(),
        amenities: emptyArray(),
        constructionMaterials: emptyArray(),
        generalProducts: emptyArray(),
      }
    
    case 'finance':
      return {
        ...data,
        rooms: emptyArray(),
        reservations: emptyArray(),
        housekeepingTasks: emptyArray(),
        orders: emptyArray(),
        inventory: emptyArray(),
        maintenanceRequests: emptyArray(),
        employees: emptyArray(),
        guests: emptyArray(),
        foodItems: emptyArray(),
        amenities: emptyArray(),
        constructionMaterials: emptyArray(),
        generalProducts: emptyArray(),
      }
    
    default:
      return data
  }
}

export function applyDashboardFilters(
  rawData: FilteredDashboardData,
  filters: DashboardFilters
): { current: FilteredDashboardData; comparison?: FilteredDashboardData } {
  let currentData = { ...rawData }
  
  currentData.reservations = filterReservationsByDateRange(
    currentData.reservations,
    filters.dateRange
  )
  currentData.orders = filterOrdersByDateRange(
    currentData.orders,
    filters.dateRange
  )
  currentData.housekeepingTasks = filterTasksByDateRange(
    currentData.housekeepingTasks,
    filters.dateRange
  )
  currentData.maintenanceRequests = filterMaintenanceByDateRange(
    currentData.maintenanceRequests,
    filters.dateRange
  )
  currentData.payments = filterPaymentsByDateRange(
    currentData.payments,
    filters.dateRange
  )
  currentData.expenses = filterExpensesByDateRange(
    currentData.expenses,
    filters.dateRange
  )
  currentData.invoices = filterInvoicesByDateRange(
    currentData.invoices,
    filters.dateRange
  )
  
  currentData = filterDashboardDataByCategory(currentData, filters.category)
  
  let comparisonData: FilteredDashboardData | undefined
  
  if (filters.compareWith) {
    comparisonData = { ...rawData }
    
    comparisonData.reservations = filterReservationsByDateRange(
      comparisonData.reservations,
      filters.compareWith
    )
    comparisonData.orders = filterOrdersByDateRange(
      comparisonData.orders,
      filters.compareWith
    )
    comparisonData.housekeepingTasks = filterTasksByDateRange(
      comparisonData.housekeepingTasks,
      filters.compareWith
    )
    comparisonData.maintenanceRequests = filterMaintenanceByDateRange(
      comparisonData.maintenanceRequests,
      filters.compareWith
    )
    comparisonData.payments = filterPaymentsByDateRange(
      comparisonData.payments,
      filters.compareWith
    )
    comparisonData.expenses = filterExpensesByDateRange(
      comparisonData.expenses,
      filters.compareWith
    )
    comparisonData.invoices = filterInvoicesByDateRange(
      comparisonData.invoices,
      filters.compareWith
    )
    
    comparisonData = filterDashboardDataByCategory(comparisonData, filters.category)
  }
  
  return {
    current: currentData,
    comparison: comparisonData
  }
}
