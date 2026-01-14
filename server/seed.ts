import "dotenv/config";
import { db, pool } from "./db";
import {
  guests, rooms, reservations, folios, folioCharges, folioPayments,
  inventoryItems, housekeepingTasks, menuItems, orders, orderItems,
  suppliers, employees, maintenanceRequests, requisitions, purchaseOrders,
  systemUsers, extraServiceCategories, extraServices, accounts, 
  budgets, costCenters, profitCenters, amenities, shifts
} from "../shared/schema";

async function seed() {
  console.log("Starting database seed...");

  try {
    console.log("Seeding guests...");
    await db.insert(guests).values([
      {
        id: 'guest-1',
        firstName: 'John',
        lastName: 'Smith',
        email: 'john.smith@email.com',
        phone: '+1-555-0101',
        nationality: 'USA',
        loyaltyPoints: 1200,
        totalStays: 5,
        totalSpent: "4500",
        preferences: ['Non-smoking', 'High floor', 'King bed'],
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
        totalSpent: "2800",
        preferences: ['Pool view', 'Late checkout'],
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
        totalSpent: "7200",
        preferences: ['Extra pillows', 'Quiet room'],
      }
    ]).onConflictDoNothing();

    console.log("Seeding rooms...");
    await db.insert(rooms).values([
      { id: 'room-101', roomNumber: '101', floor: 1, roomType: 'standard', status: 'vacant-clean', baseRate: "120", maxOccupancy: 2, amenities: ['WiFi', 'TV', 'AC'] },
      { id: 'room-102', roomNumber: '102', floor: 1, roomType: 'standard', status: 'occupied-clean', baseRate: "120", maxOccupancy: 2, amenities: ['WiFi', 'TV', 'AC'] },
      { id: 'room-103', roomNumber: '103', floor: 1, roomType: 'deluxe', status: 'vacant-dirty', baseRate: "180", maxOccupancy: 2, amenities: ['WiFi', 'TV', 'AC', 'Mini Bar'] },
      { id: 'room-104', roomNumber: '104', floor: 1, roomType: 'deluxe', status: 'occupied-dirty', baseRate: "180", maxOccupancy: 2, amenities: ['WiFi', 'TV', 'AC', 'Mini Bar'] },
      { id: 'room-201', roomNumber: '201', floor: 2, roomType: 'standard', status: 'vacant-clean', baseRate: "120", maxOccupancy: 2, amenities: ['WiFi', 'TV', 'AC'] },
      { id: 'room-202', roomNumber: '202', floor: 2, roomType: 'standard', status: 'occupied-clean', baseRate: "120", maxOccupancy: 2, amenities: ['WiFi', 'TV', 'AC'] },
      { id: 'room-203', roomNumber: '203', floor: 2, roomType: 'suite', status: 'vacant-clean', baseRate: "280", maxOccupancy: 4, amenities: ['WiFi', 'TV', 'AC', 'Mini Bar', 'Balcony', 'Jacuzzi'] },
      { id: 'room-204', roomNumber: '204', floor: 2, roomType: 'suite', status: 'maintenance', baseRate: "280", maxOccupancy: 4, amenities: ['WiFi', 'TV', 'AC', 'Mini Bar', 'Balcony'] },
      { id: 'room-301', roomNumber: '301', floor: 3, roomType: 'executive', status: 'vacant-clean', baseRate: "220", maxOccupancy: 3, amenities: ['WiFi', 'TV', 'AC', 'Mini Bar', 'Work Desk'] },
      { id: 'room-302', roomNumber: '302', floor: 3, roomType: 'executive', status: 'occupied-clean', baseRate: "220", maxOccupancy: 3, amenities: ['WiFi', 'TV', 'AC', 'Mini Bar', 'Work Desk'] },
      { id: 'room-303', roomNumber: '303', floor: 3, roomType: 'presidential', status: 'vacant-clean', baseRate: "500", maxOccupancy: 6, amenities: ['WiFi', 'TV', 'AC', 'Mini Bar', 'Balcony', 'Jacuzzi', 'Kitchen', 'Living Room'] },
      { id: 'room-304', roomNumber: '304', floor: 3, roomType: 'deluxe', status: 'out-of-order', baseRate: "180", maxOccupancy: 2, amenities: ['WiFi', 'TV', 'AC', 'Mini Bar'] }
    ]).onConflictDoNothing();

    console.log("Seeding reservations...");
    const now = new Date();
    await db.insert(reservations).values([
      {
        id: 'res-1',
        guestId: 'guest-1',
        roomId: 'room-102',
        checkInDate: new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000),
        checkOutDate: new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000),
        adults: 2,
        children: 0,
        status: 'checked-out',
        ratePerNight: "18500",
        totalAmount: "37000",
        advancePaid: "18500",
        source: 'Direct',
        specialRequests: 'High floor, non-smoking',
        createdBy: 'user-1'
      },
      {
        id: 'res-2',
        guestId: 'guest-2',
        roomId: 'room-104',
        checkInDate: new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000),
        checkOutDate: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000),
        adults: 2,
        children: 1,
        status: 'checked-out',
        ratePerNight: "28000",
        totalAmount: "84000",
        advancePaid: "28000",
        source: 'Booking.com',
        specialRequests: 'Extra bed for child, pool view',
        createdBy: 'user-1'
      },
      {
        id: 'res-3',
        guestId: 'guest-3',
        roomId: 'room-203',
        checkInDate: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000),
        checkOutDate: new Date(now.getTime() + 2 * 24 * 60 * 60 * 1000),
        adults: 2,
        children: 0,
        status: 'checked-in',
        ratePerNight: "42000",
        totalAmount: "168000",
        advancePaid: "42000",
        source: 'Website',
        specialRequests: 'Honeymoon package',
        createdBy: 'user-1'
      },
      {
        id: 'res-4',
        guestId: 'guest-1',
        roomId: 'room-301',
        checkInDate: new Date(now.getTime() + 5 * 24 * 60 * 60 * 1000),
        checkOutDate: new Date(now.getTime() + 10 * 24 * 60 * 60 * 1000),
        adults: 1,
        children: 0,
        status: 'confirmed',
        ratePerNight: "32000",
        totalAmount: "160000",
        advancePaid: "32000",
        source: 'Direct',
        specialRequests: 'Business traveler, early check-in',
        createdBy: 'user-1'
      }
    ]).onConflictDoNothing();

    console.log("Seeding folios...");
    await db.insert(folios).values([
      { id: 'folio-1', reservationId: 'res-1', guestId: 'guest-1', balance: "240" },
      { id: 'folio-2', reservationId: 'res-2', guestId: 'guest-2', balance: "385" },
      { id: 'folio-3', reservationId: 'res-3', guestId: 'guest-3', balance: "126000" }
    ]).onConflictDoNothing();

    console.log("Seeding folio charges...");
    await db.insert(folioCharges).values([
      { id: 'charge-1', folioId: 'folio-1', description: 'Room Charges', amount: "120", quantity: 3, department: 'front-office', postedBy: 'system' },
      { id: 'charge-2', folioId: 'folio-2', description: 'Room Charges', amount: "180", quantity: 3, department: 'front-office', postedBy: 'system' },
      { id: 'charge-3', folioId: 'folio-2', description: 'Mini Bar', amount: "25", quantity: 1, department: 'fnb', postedBy: 'user-1' },
      { id: 'charge-4', folioId: 'folio-3', description: 'Room Charges', amount: "42000", quantity: 4, department: 'front-office', postedBy: 'system' }
    ]).onConflictDoNothing();

    console.log("Seeding folio payments...");
    await db.insert(folioPayments).values([
      { id: 'payment-1', folioId: 'folio-1', amount: "120", method: 'card', status: 'paid', receivedBy: 'user-1' },
      { id: 'payment-2', folioId: 'folio-2', amount: "180", method: 'card', status: 'paid', receivedBy: 'user-1' },
      { id: 'payment-3', folioId: 'folio-3', amount: "42000", method: 'bank-transfer', status: 'paid', receivedBy: 'user-1' }
    ]).onConflictDoNothing();

    console.log("Seeding inventory items...");
    await db.insert(inventoryItems).values([
      { id: 'inv-1', name: 'Chicken Breast', category: 'Meat', unit: 'kg', currentStock: "25", reorderLevel: "15", reorderQuantity: "30", unitCost: "8.50", storeLocation: 'Kitchen Cold Storage' },
      { id: 'inv-2', name: 'Tomatoes', category: 'Vegetables', unit: 'kg', currentStock: "8", reorderLevel: "10", reorderQuantity: "20", unitCost: "3.20", storeLocation: 'Kitchen Pantry' },
      { id: 'inv-3', name: 'Olive Oil', category: 'Cooking Oils', unit: 'liter', currentStock: "12", reorderLevel: "5", reorderQuantity: "15", unitCost: "15.00", storeLocation: 'Kitchen Pantry' },
      { id: 'inv-4', name: 'Bed Sheets (Queen)', category: 'Linen', unit: 'set', currentStock: "45", reorderLevel: "20", reorderQuantity: "30", unitCost: "25.00", storeLocation: 'Housekeeping Store' },
      { id: 'inv-5', name: 'Bath Towels', category: 'Linen', unit: 'piece', currentStock: "120", reorderLevel: "50", reorderQuantity: "100", unitCost: "8.00", storeLocation: 'Housekeeping Store' },
      { id: 'inv-6', name: 'Shampoo Bottles', category: 'Amenities', unit: 'bottle', currentStock: "200", reorderLevel: "100", reorderQuantity: "300", unitCost: "1.50", storeLocation: 'Housekeeping Store' },
      { id: 'inv-7', name: 'Coffee Beans', category: 'Beverages', unit: 'kg', currentStock: "5", reorderLevel: "8", reorderQuantity: "15", unitCost: "22.00", storeLocation: 'Kitchen Pantry' },
      { id: 'inv-8', name: 'Fresh Milk', category: 'Dairy', unit: 'liter', currentStock: "15", reorderLevel: "20", reorderQuantity: "40", unitCost: "2.50", storeLocation: 'Kitchen Cold Storage' }
    ]).onConflictDoNothing();

    console.log("Seeding housekeeping tasks...");
    await db.insert(housekeepingTasks).values([
      { id: 'hk-1', roomId: 'room-103', assignedTo: 'emp-1', taskType: 'clean', status: 'pending', priority: 'normal' },
      { id: 'hk-2', roomId: 'room-104', assignedTo: 'emp-1', taskType: 'turndown', status: 'pending', priority: 'normal' },
      { id: 'hk-3', roomId: 'room-203', taskType: 'deep-clean', status: 'pending', priority: 'high' }
    ]).onConflictDoNothing();

    console.log("Seeding menu items...");
    await db.insert(menuItems).values([
      { id: 'menu-1', name: 'Grilled Chicken Sandwich', description: 'Grilled chicken breast with lettuce, tomato, and mayo', category: 'Mains', price: "15.99", available: true, preparationTime: 15 },
      { id: 'menu-2', name: 'Caesar Salad', description: 'Fresh romaine lettuce with Caesar dressing and croutons', category: 'Salads', price: "12.99", available: true, preparationTime: 10 },
      { id: 'menu-3', name: 'Club Sandwich', description: 'Triple decker with turkey, bacon, lettuce, and tomato', category: 'Mains', price: "14.99", available: true, preparationTime: 12 },
      { id: 'menu-4', name: 'Cappuccino', description: 'Espresso with steamed milk and foam', category: 'Beverages', price: "4.99", available: true, preparationTime: 5 },
      { id: 'menu-5', name: 'Fresh Orange Juice', description: 'Freshly squeezed orange juice', category: 'Beverages', price: "5.99", available: true, preparationTime: 3 }
    ]).onConflictDoNothing();

    console.log("Seeding suppliers...");
    await db.insert(suppliers).values([
      {
        id: 'sup-1',
        supplierId: 'SUP-2024-001',
        name: 'Fresh Foods Co.',
        category: ['Food', 'Meat', 'Vegetables', 'Dairy'],
        contactPersons: [{ id: 'cp-1', name: 'David Miller', role: 'Sales Manager', email: 'david@freshfoods.com', phone: '+1-555-0201', isPrimary: true }],
        email: 'info@freshfoods.com',
        phone: '+1-555-0200',
        address: '123 Food Street',
        city: 'New York',
        state: 'NY',
        country: 'USA',
        paymentTerms: 'Net 30',
        creditLimit: "50000",
        deliveryTimeDays: 2,
        rating: "4.5",
        isActive: true
      },
      {
        id: 'sup-2',
        supplierId: 'SUP-2024-002',
        name: 'Linen Supply Inc.',
        category: ['Amenities', 'Linen', 'Cleaning'],
        contactPersons: [{ id: 'cp-2', name: 'Emma Wilson', role: 'Director', email: 'emma@linensupply.com', phone: '+1-555-0301', isPrimary: true }],
        email: 'contact@linensupply.com',
        phone: '+1-555-0300',
        address: '456 Textile Ave',
        city: 'Los Angeles',
        state: 'CA',
        country: 'USA',
        paymentTerms: 'Net 15',
        creditLimit: "30000",
        deliveryTimeDays: 3,
        rating: "4.8",
        isActive: true
      },
      {
        id: 'sup-3',
        supplierId: 'SUP-2024-003',
        name: 'Beverage Wholesalers',
        category: ['Food', 'Beverages'],
        contactPersons: [{ id: 'cp-3', name: 'Robert Brown', role: 'Sales Rep', email: 'robert@beveragewholesale.com', phone: '+1-555-0401', isPrimary: true }],
        email: 'sales@beveragewholesale.com',
        phone: '+1-555-0400',
        address: '789 Distribution Blvd',
        city: 'Chicago',
        state: 'IL',
        country: 'USA',
        paymentTerms: 'Net 30',
        deliveryTimeDays: 1,
        rating: "4.2",
        isActive: true
      }
    ]).onConflictDoNothing();

    console.log("Seeding employees...");
    await db.insert(employees).values([
      { id: 'emp-1', employeeId: 'EMP-001', firstName: 'Maria', lastName: 'Garcia', email: 'maria.garcia@hotel.com', phone: '+1-555-1001', department: 'housekeeping', position: 'Housekeeper', role: 'housekeeper', isActive: true },
      { id: 'emp-2', employeeId: 'EMP-002', firstName: 'James', lastName: 'Wilson', email: 'james.wilson@hotel.com', phone: '+1-555-1002', department: 'front-office', position: 'Front Desk Agent', role: 'front-desk', isActive: true },
      { id: 'emp-3', employeeId: 'EMP-003', firstName: 'Sophie', lastName: 'Chen', email: 'sophie.chen@hotel.com', phone: '+1-555-1003', department: 'fnb', position: 'Chef', role: 'chef', isActive: true },
      { id: 'emp-4', employeeId: 'EMP-004', firstName: 'David', lastName: 'Brown', email: 'david.brown@hotel.com', phone: '+1-555-1004', department: 'engineering', position: 'Maintenance Engineer', role: 'engineer', isActive: true },
      { id: 'emp-5', employeeId: 'EMP-005', firstName: 'Lisa', lastName: 'Thompson', email: 'lisa.thompson@hotel.com', phone: '+1-555-1005', department: 'admin', position: 'General Manager', role: 'manager', isActive: true }
    ]).onConflictDoNothing();

    console.log("Seeding system users...");
    await db.insert(systemUsers).values([
      { id: 'user-1', username: 'admin', displayName: 'System Administrator', email: 'admin@hotel.com', role: 'admin', department: 'admin', isActive: true },
      { id: 'user-2', username: 'frontdesk', displayName: 'Front Desk', email: 'frontdesk@hotel.com', role: 'front-desk', department: 'front-office', isActive: true },
      { id: 'user-3', username: 'manager', displayName: 'Hotel Manager', email: 'manager@hotel.com', role: 'manager', department: 'admin', isActive: true }
    ]).onConflictDoNothing();

    console.log("Seeding extra service categories...");
    await db.insert(extraServiceCategories).values([
      { id: 'cat-1', name: 'Spa & Wellness', description: 'Relaxation and wellness services', icon: 'spa', sortOrder: 1, isActive: true },
      { id: 'cat-2', name: 'Transportation', description: 'Airport transfers and car rentals', icon: 'car', sortOrder: 2, isActive: true },
      { id: 'cat-3', name: 'Dining', description: 'Special dining experiences', icon: 'restaurant', sortOrder: 3, isActive: true },
      { id: 'cat-4', name: 'Laundry', description: 'Laundry and dry cleaning services', icon: 'laundry', sortOrder: 4, isActive: true }
    ]).onConflictDoNothing();

    console.log("Seeding extra services...");
    await db.insert(extraServices).values([
      { id: 'srv-1', categoryId: 'cat-1', name: 'Full Body Massage', description: '60-minute relaxing massage', basePrice: "120", taxRate: "10", unit: 'session', status: 'active', department: 'fnb', requiresApproval: false, createdBy: 'user-1' },
      { id: 'srv-2', categoryId: 'cat-2', name: 'Airport Transfer', description: 'One-way airport pickup/dropoff', basePrice: "45", taxRate: "10", unit: 'trip', status: 'active', department: 'front-office', requiresApproval: false, createdBy: 'user-1' },
      { id: 'srv-3', categoryId: 'cat-3', name: 'Private Dinner', description: 'Romantic dinner setup on balcony', basePrice: "250", taxRate: "10", unit: 'event', status: 'active', department: 'fnb', requiresApproval: true, createdBy: 'user-1' },
      { id: 'srv-4', categoryId: 'cat-4', name: 'Express Laundry', description: 'Same-day laundry service', basePrice: "35", taxRate: "10", unit: 'kg', status: 'active', department: 'housekeeping', requiresApproval: false, createdBy: 'user-1' }
    ]).onConflictDoNothing();

    console.log("Seeding accounts...");
    await db.insert(accounts).values([
      { id: 'acc-1', accountCode: 'CASH-001', name: 'Petty Cash', type: 'asset', category: 'Cash', balance: "5000", isActive: true },
      { id: 'acc-2', accountCode: 'BANK-001', name: 'Main Operating Account', type: 'asset', category: 'Bank', balance: "150000", isActive: true },
      { id: 'acc-3', accountCode: 'REV-001', name: 'Room Revenue', type: 'revenue', category: 'Revenue', balance: "0", isActive: true },
      { id: 'acc-4', accountCode: 'REV-002', name: 'F&B Revenue', type: 'revenue', category: 'Revenue', balance: "0", isActive: true },
      { id: 'acc-5', accountCode: 'EXP-001', name: 'Operating Expenses', type: 'expense', category: 'Expense', balance: "0", isActive: true }
    ]).onConflictDoNothing();

    console.log("Seeding budgets...");
    await db.insert(budgets).values([
      { id: 'budget-1', name: 'Q1 2024 Housekeeping', department: 'housekeeping', category: 'Supplies', allocatedAmount: "15000", spentAmount: "8500", startDate: new Date('2024-01-01'), endDate: new Date('2024-03-31'), status: 'active' },
      { id: 'budget-2', name: 'Q1 2024 F&B', department: 'fnb', category: 'Food & Beverage', allocatedAmount: "50000", spentAmount: "35000", startDate: new Date('2024-01-01'), endDate: new Date('2024-03-31'), status: 'active' },
      { id: 'budget-3', name: 'Q1 2024 Marketing', department: 'admin', category: 'Marketing', allocatedAmount: "20000", spentAmount: "12000", startDate: new Date('2024-01-01'), endDate: new Date('2024-03-31'), status: 'active' }
    ]).onConflictDoNothing();

    console.log("Seeding cost centers...");
    await db.insert(costCenters).values([
      { id: 'cc-1', code: 'CC-HK', name: 'Housekeeping', department: 'housekeeping', manager: 'Maria Garcia', budget: "50000", spent: "35000", isActive: true },
      { id: 'cc-2', code: 'CC-FO', name: 'Front Office', department: 'front-office', manager: 'James Wilson', budget: "30000", spent: "22000", isActive: true },
      { id: 'cc-3', code: 'CC-FB', name: 'Food & Beverage', department: 'fnb', manager: 'Sophie Chen', budget: "80000", spent: "65000", isActive: true },
      { id: 'cc-4', code: 'CC-ENG', name: 'Engineering', department: 'engineering', manager: 'David Brown', budget: "40000", spent: "28000", isActive: true }
    ]).onConflictDoNothing();

    console.log("Seeding profit centers...");
    await db.insert(profitCenters).values([
      { id: 'pc-1', code: 'PC-ROOMS', name: 'Rooms Division', department: 'front-office', manager: 'Lisa Thompson', targetRevenue: "500000", actualRevenue: "450000", targetCost: "150000", actualCost: "140000", isActive: true },
      { id: 'pc-2', code: 'PC-FB', name: 'F&B Division', department: 'fnb', manager: 'Sophie Chen', targetRevenue: "200000", actualRevenue: "180000", targetCost: "80000", actualCost: "75000", isActive: true },
      { id: 'pc-3', code: 'PC-SPA', name: 'Spa & Recreation', department: 'fnb', manager: 'Lisa Thompson', targetRevenue: "50000", actualRevenue: "42000", targetCost: "20000", actualCost: "18000", isActive: true }
    ]).onConflictDoNothing();

    console.log("Seeding amenities...");
    await db.insert(amenities).values([
      { id: 'am-1', name: 'Shampoo', category: 'toiletries', unit: 'bottle', currentStock: "500", reorderLevel: "100", costPerUnit: "1.50", department: 'housekeeping', isActive: true },
      { id: 'am-2', name: 'Soap Bar', category: 'toiletries', unit: 'piece', currentStock: "800", reorderLevel: "200", costPerUnit: "0.50", department: 'housekeeping', isActive: true },
      { id: 'am-3', name: 'Bath Robe', category: 'linens', unit: 'piece', currentStock: "50", reorderLevel: "10", costPerUnit: "45.00", department: 'housekeeping', isActive: true },
      { id: 'am-4', name: 'Coffee Sachets', category: 'beverages', unit: 'sachet', currentStock: "1000", reorderLevel: "300", costPerUnit: "0.25", department: 'front-office', isActive: true }
    ]).onConflictDoNothing();

    console.log("Seeding shifts...");
    await db.insert(shifts).values([
      { id: 'shift-1', name: 'Morning Shift', department: 'front-office', startTime: '06:00', endTime: '14:00', breakDuration: 60, isActive: true },
      { id: 'shift-2', name: 'Afternoon Shift', department: 'front-office', startTime: '14:00', endTime: '22:00', breakDuration: 60, isActive: true },
      { id: 'shift-3', name: 'Night Shift', department: 'front-office', startTime: '22:00', endTime: '06:00', breakDuration: 60, isActive: true },
      { id: 'shift-4', name: 'Kitchen Morning', department: 'fnb', startTime: '05:00', endTime: '13:00', breakDuration: 60, isActive: true },
      { id: 'shift-5', name: 'Kitchen Evening', department: 'fnb', startTime: '13:00', endTime: '21:00', breakDuration: 60, isActive: true }
    ]).onConflictDoNothing();

    console.log("Database seeding completed successfully!");
  } catch (error) {
    console.error("Error seeding database:", error);
    throw error;
  } finally {
    await pool.end();
  }
}

seed();
