import { 
  type Room, 
  type Guest, 
  type Reservation, 
  type InventoryItem,
  type HousekeepingTask,
  type MenuItem,
  type Order,
  type Supplier,
  type Employee,
  type MaintenanceRequest
} from './types'

export const sampleGuests: Guest[] = [
  {
    id: 'guest-1',
    firstName: 'John',
    lastName: 'Smith',
    email: 'john.smith@email.com',
    phone: '+1-555-0101',
    nationality: 'USA',
    loyaltyPoints: 1200,
    totalStays: 5,
    totalSpent: 4500,
    preferences: ['Non-smoking', 'High floor', 'King bed'],
    createdAt: Date.now() - 30 * 24 * 60 * 60 * 1000,
    updatedAt: Date.now()
  },
  {
    id: 'guest-2',
    firstName: 'Sarah',
    lastName: 'Johnson',
    email: 'sarah.j@email.com',
    phone: '+1-555-0102',
    nationality: 'Canada',
    loyaltyPoints: 800,
    totalStays: 3,
    totalSpent: 2800,
    preferences: ['Pool view', 'Late checkout'],
    createdAt: Date.now() - 60 * 24 * 60 * 60 * 1000,
    updatedAt: Date.now()
  },
  {
    id: 'guest-3',
    firstName: 'Michael',
    lastName: 'Chen',
    email: 'mchen@email.com',
    phone: '+1-555-0103',
    nationality: 'Singapore',
    loyaltyPoints: 2100,
    totalStays: 8,
    totalSpent: 7200,
    preferences: ['Extra pillows', 'Quiet room'],
    createdAt: Date.now() - 90 * 24 * 60 * 60 * 1000,
    updatedAt: Date.now()
  }
]

export const sampleRooms: Room[] = [
  { id: 'room-101', roomNumber: '101', floor: 1, roomType: 'standard', status: 'vacant-clean', baseRate: 120, maxOccupancy: 2, amenities: ['WiFi', 'TV', 'AC'] },
  { id: 'room-102', roomNumber: '102', floor: 1, roomType: 'standard', status: 'occupied-clean', baseRate: 120, maxOccupancy: 2, amenities: ['WiFi', 'TV', 'AC'] },
  { id: 'room-103', roomNumber: '103', floor: 1, roomType: 'deluxe', status: 'vacant-dirty', baseRate: 180, maxOccupancy: 2, amenities: ['WiFi', 'TV', 'AC', 'Mini Bar'] },
  { id: 'room-104', roomNumber: '104', floor: 1, roomType: 'deluxe', status: 'occupied-dirty', baseRate: 180, maxOccupancy: 2, amenities: ['WiFi', 'TV', 'AC', 'Mini Bar'] },
  { id: 'room-201', roomNumber: '201', floor: 2, roomType: 'standard', status: 'vacant-clean', baseRate: 120, maxOccupancy: 2, amenities: ['WiFi', 'TV', 'AC'] },
  { id: 'room-202', roomNumber: '202', floor: 2, roomType: 'standard', status: 'occupied-clean', baseRate: 120, maxOccupancy: 2, amenities: ['WiFi', 'TV', 'AC'] },
  { id: 'room-203', roomNumber: '203', floor: 2, roomType: 'suite', status: 'vacant-clean', baseRate: 280, maxOccupancy: 4, amenities: ['WiFi', 'TV', 'AC', 'Mini Bar', 'Balcony', 'Jacuzzi'] },
  { id: 'room-204', roomNumber: '204', floor: 2, roomType: 'suite', status: 'maintenance', baseRate: 280, maxOccupancy: 4, amenities: ['WiFi', 'TV', 'AC', 'Mini Bar', 'Balcony'] },
  { id: 'room-301', roomNumber: '301', floor: 3, roomType: 'executive', status: 'vacant-clean', baseRate: 220, maxOccupancy: 3, amenities: ['WiFi', 'TV', 'AC', 'Mini Bar', 'Work Desk'] },
  { id: 'room-302', roomNumber: '302', floor: 3, roomType: 'executive', status: 'occupied-clean', baseRate: 220, maxOccupancy: 3, amenities: ['WiFi', 'TV', 'AC', 'Mini Bar', 'Work Desk'] },
  { id: 'room-303', roomNumber: '303', floor: 3, roomType: 'presidential', status: 'vacant-clean', baseRate: 500, maxOccupancy: 6, amenities: ['WiFi', 'TV', 'AC', 'Mini Bar', 'Balcony', 'Jacuzzi', 'Kitchen', 'Living Room'] },
  { id: 'room-304', roomNumber: '304', floor: 3, roomType: 'deluxe', status: 'out-of-order', baseRate: 180, maxOccupancy: 2, amenities: ['WiFi', 'TV', 'AC', 'Mini Bar'] }
]

export const sampleReservations: Reservation[] = [
  {
    id: 'res-1',
    guestId: 'guest-1',
    roomId: 'room-102',
    checkInDate: Date.now() - 1 * 24 * 60 * 60 * 1000,
    checkOutDate: Date.now() + 2 * 24 * 60 * 60 * 1000,
    adults: 2,
    children: 0,
    status: 'checked-in',
    ratePerNight: 120,
    totalAmount: 360,
    advancePaid: 120,
    source: 'Direct',
    createdAt: Date.now() - 5 * 24 * 60 * 60 * 1000,
    updatedAt: Date.now(),
    createdBy: 'user-1'
  },
  {
    id: 'res-2',
    guestId: 'guest-2',
    roomId: 'room-104',
    checkInDate: Date.now(),
    checkOutDate: Date.now() + 3 * 24 * 60 * 60 * 1000,
    adults: 1,
    children: 1,
    status: 'checked-in',
    ratePerNight: 180,
    totalAmount: 540,
    advancePaid: 180,
    source: 'Booking.com',
    createdAt: Date.now() - 7 * 24 * 60 * 60 * 1000,
    updatedAt: Date.now(),
    createdBy: 'user-1'
  },
  {
    id: 'res-3',
    guestId: 'guest-3',
    checkInDate: Date.now() + 2 * 24 * 60 * 60 * 1000,
    checkOutDate: Date.now() + 5 * 24 * 60 * 60 * 1000,
    adults: 2,
    children: 0,
    status: 'confirmed',
    ratePerNight: 280,
    totalAmount: 840,
    advancePaid: 280,
    source: 'Website',
    specialRequests: 'Pool view preferred',
    createdAt: Date.now() - 3 * 24 * 60 * 60 * 1000,
    updatedAt: Date.now(),
    createdBy: 'user-1'
  }
]

export const sampleInventory: InventoryItem[] = [
  {
    id: 'inv-1',
    name: 'Chicken Breast',
    category: 'Meat',
    unit: 'kg',
    currentStock: 25,
    reorderLevel: 15,
    reorderQuantity: 30,
    unitCost: 8.50,
    storeLocation: 'Kitchen Cold Storage',
    expiryDate: Date.now() + 5 * 24 * 60 * 60 * 1000,
    lastUpdated: Date.now()
  },
  {
    id: 'inv-2',
    name: 'Tomatoes',
    category: 'Vegetables',
    unit: 'kg',
    currentStock: 8,
    reorderLevel: 10,
    reorderQuantity: 20,
    unitCost: 3.20,
    storeLocation: 'Kitchen Pantry',
    expiryDate: Date.now() + 3 * 24 * 60 * 60 * 1000,
    lastUpdated: Date.now()
  },
  {
    id: 'inv-3',
    name: 'Olive Oil',
    category: 'Cooking Oils',
    unit: 'liter',
    currentStock: 12,
    reorderLevel: 5,
    reorderQuantity: 15,
    unitCost: 15.00,
    storeLocation: 'Kitchen Pantry',
    lastUpdated: Date.now()
  },
  {
    id: 'inv-4',
    name: 'Bed Sheets (Queen)',
    category: 'Linen',
    unit: 'set',
    currentStock: 45,
    reorderLevel: 20,
    reorderQuantity: 30,
    unitCost: 25.00,
    storeLocation: 'Housekeeping Store',
    lastUpdated: Date.now()
  },
  {
    id: 'inv-5',
    name: 'Bath Towels',
    category: 'Linen',
    unit: 'piece',
    currentStock: 120,
    reorderLevel: 50,
    reorderQuantity: 100,
    unitCost: 8.00,
    storeLocation: 'Housekeeping Store',
    lastUpdated: Date.now()
  },
  {
    id: 'inv-6',
    name: 'Shampoo Bottles',
    category: 'Amenities',
    unit: 'bottle',
    currentStock: 200,
    reorderLevel: 100,
    reorderQuantity: 300,
    unitCost: 1.50,
    storeLocation: 'Housekeeping Store',
    lastUpdated: Date.now()
  },
  {
    id: 'inv-7',
    name: 'Coffee Beans',
    category: 'Beverages',
    unit: 'kg',
    currentStock: 5,
    reorderLevel: 8,
    reorderQuantity: 15,
    unitCost: 22.00,
    storeLocation: 'Kitchen Pantry',
    expiryDate: Date.now() + 30 * 24 * 60 * 60 * 1000,
    lastUpdated: Date.now()
  },
  {
    id: 'inv-8',
    name: 'Fresh Milk',
    category: 'Dairy',
    unit: 'liter',
    currentStock: 15,
    reorderLevel: 20,
    reorderQuantity: 40,
    unitCost: 2.50,
    storeLocation: 'Kitchen Cold Storage',
    expiryDate: Date.now() + 4 * 24 * 60 * 60 * 1000,
    lastUpdated: Date.now()
  }
]

export const sampleMenuItems: MenuItem[] = [
  {
    id: 'menu-1',
    name: 'Grilled Chicken Sandwich',
    description: 'Grilled chicken breast with lettuce, tomato, and mayo',
    category: 'Mains',
    price: 15.99,
    available: true,
    preparationTime: 15
  },
  {
    id: 'menu-2',
    name: 'Caesar Salad',
    description: 'Fresh romaine lettuce with Caesar dressing and croutons',
    category: 'Salads',
    price: 12.99,
    available: true,
    preparationTime: 10
  },
  {
    id: 'menu-3',
    name: 'Club Sandwich',
    description: 'Triple decker with turkey, bacon, lettuce, and tomato',
    category: 'Mains',
    price: 14.99,
    available: true,
    preparationTime: 12
  },
  {
    id: 'menu-4',
    name: 'Cappuccino',
    description: 'Espresso with steamed milk and foam',
    category: 'Beverages',
    price: 4.99,
    available: true,
    preparationTime: 5
  },
  {
    id: 'menu-5',
    name: 'Fresh Orange Juice',
    description: 'Freshly squeezed orange juice',
    category: 'Beverages',
    price: 5.99,
    available: true,
    preparationTime: 3
  }
]

export const sampleHousekeepingTasks: HousekeepingTask[] = [
  {
    id: 'hk-1',
    roomId: 'room-103',
    assignedTo: 'emp-1',
    taskType: 'clean',
    status: 'pending',
    priority: 'normal',
    createdAt: Date.now()
  },
  {
    id: 'hk-2',
    roomId: 'room-104',
    assignedTo: 'emp-1',
    taskType: 'turndown',
    status: 'pending',
    priority: 'normal',
    createdAt: Date.now()
  },
  {
    id: 'hk-3',
    roomId: 'room-203',
    taskType: 'deep-clean',
    status: 'pending',
    priority: 'high',
    createdAt: Date.now()
  }
]

export const sampleSuppliers: Supplier[] = [
  {
    id: 'sup-1',
    name: 'Fresh Foods Co.',
    contactPerson: 'David Miller',
    email: 'david@freshfoods.com',
    phone: '+1-555-0201',
    category: ['Meat', 'Vegetables', 'Dairy'],
    paymentTerms: 'Net 30',
    rating: 4.5,
    totalOrders: 45,
    totalSpent: 25000,
    createdAt: Date.now() - 180 * 24 * 60 * 60 * 1000
  },
  {
    id: 'sup-2',
    name: 'Linen Supply Inc.',
    contactPerson: 'Emma Wilson',
    email: 'emma@linensupply.com',
    phone: '+1-555-0202',
    category: ['Linen', 'Amenities'],
    paymentTerms: 'Net 15',
    rating: 4.8,
    totalOrders: 32,
    totalSpent: 18000,
    createdAt: Date.now() - 150 * 24 * 60 * 60 * 1000
  },
  {
    id: 'sup-3',
    name: 'Beverage Wholesalers',
    contactPerson: 'Robert Brown',
    email: 'robert@beveragewholesale.com',
    phone: '+1-555-0203',
    category: ['Beverages'],
    paymentTerms: 'Net 30',
    rating: 4.2,
    totalOrders: 28,
    totalSpent: 12000,
    createdAt: Date.now() - 120 * 24 * 60 * 60 * 1000
  }
]

export const sampleEmployees: Employee[] = [
  {
    id: 'emp-1',
    employeeId: 'EMP001',
    firstName: 'Maria',
    lastName: 'Garcia',
    email: 'maria.g@hotel.com',
    phone: '+1-555-0301',
    department: 'housekeeping',
    role: 'housekeeper',
    joinDate: Date.now() - 365 * 24 * 60 * 60 * 1000,
    status: 'active',
    createdAt: Date.now() - 365 * 24 * 60 * 60 * 1000
  },
  {
    id: 'emp-2',
    employeeId: 'EMP002',
    firstName: 'James',
    lastName: 'Anderson',
    email: 'james.a@hotel.com',
    phone: '+1-555-0302',
    department: 'front-office',
    role: 'front-desk',
    joinDate: Date.now() - 240 * 24 * 60 * 60 * 1000,
    status: 'active',
    createdAt: Date.now() - 240 * 24 * 60 * 60 * 1000
  },
  {
    id: 'emp-3',
    employeeId: 'EMP003',
    firstName: 'Sophie',
    lastName: 'Martin',
    email: 'sophie.m@hotel.com',
    phone: '+1-555-0303',
    department: 'fnb',
    role: 'chef',
    joinDate: Date.now() - 480 * 24 * 60 * 60 * 1000,
    status: 'active',
    createdAt: Date.now() - 480 * 24 * 60 * 60 * 1000
  }
]

export const sampleMaintenanceRequests: MaintenanceRequest[] = [
  {
    id: 'maint-1',
    requestNumber: 'MR001',
    roomId: 'room-204',
    location: 'Room 204',
    issueType: 'AC Repair',
    description: 'Air conditioning not cooling properly',
    priority: 'high',
    status: 'in-progress',
    assignedTo: 'emp-4',
    reportedBy: 'emp-1',
    createdAt: Date.now() - 2 * 60 * 60 * 1000,
    scheduledAt: Date.now() - 1 * 60 * 60 * 1000,
    startedAt: Date.now() - 30 * 60 * 1000
  },
  {
    id: 'maint-2',
    requestNumber: 'MR002',
    roomId: 'room-304',
    location: 'Room 304',
    issueType: 'Plumbing',
    description: 'Leaking faucet in bathroom',
    priority: 'urgent',
    status: 'scheduled',
    reportedBy: 'emp-2',
    createdAt: Date.now() - 3 * 60 * 60 * 1000,
    scheduledAt: Date.now() + 1 * 60 * 60 * 1000
  }
]
