import { Request, Response, NextFunction } from 'express';
import { z, ZodSchema } from 'zod';

/**
 * Generic validation middleware factory
 * Validates request body, params, or query against a Zod schema
 */
export const validate = (schema: ZodSchema, source: 'body' | 'params' | 'query' = 'body') => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const data = req[source];
      const validated = await schema.parseAsync(data);
      
      // Replace the source data with validated data
      req[source] = validated;
      next();
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({
          error: 'Validation Error',
          message: 'Invalid request data',
          details: error.errors.map(err => ({
            field: err.path.join('.'),
            message: err.message,
          })),
        });
      }
      next(error);
    }
  };
};

/**
 * Common validation schemas
 */

// ID parameter validation
export const idParamSchema = z.object({
  id: z.string().regex(/^\d+$/).transform(Number),
});

// Pagination query validation
export const paginationSchema = z.object({
  page: z.string().optional().default('1').transform(Number),
  limit: z.string().optional().default('50').transform(Number),
  sortBy: z.string().optional(),
  sortOrder: z.enum(['asc', 'desc']).optional().default('asc'),
});

// Guest schema
export const guestCreateSchema = z.object({
  firstName: z.string().min(1).max(100),
  lastName: z.string().min(1).max(100),
  email: z.string().email().max(255),
  phone: z.string().max(20),
  address: z.string().max(500).optional(),
  city: z.string().max(100).optional(),
  country: z.string().max(100).optional(),
  postalCode: z.string().max(20).optional(),
  dateOfBirth: z.string().optional(),
  nationality: z.string().max(100).optional(),
  passportNumber: z.string().max(50).optional(),
  idType: z.enum(['passport', 'drivers-license', 'national-id', 'other']).optional(),
  idNumber: z.string().max(50).optional(),
  loyaltyTier: z.enum(['bronze', 'silver', 'gold', 'platinum']).optional(),
  preferences: z.record(z.any()).optional(),
  notes: z.string().optional(),
  tags: z.array(z.string()).optional(),
  source: z.enum(['direct', 'booking-com', 'airbnb', 'expedia', 'agoda', 'other']).optional(),
});

export const guestUpdateSchema = guestCreateSchema.partial();

// Room schema
export const roomCreateSchema = z.object({
  roomNumber: z.string().min(1).max(20),
  roomType: z.string().min(1).max(50),
  floor: z.number().int().min(0),
  status: z.enum([
    'vacant-clean',
    'vacant-dirty',
    'occupied-clean',
    'occupied-dirty',
    'out-of-order',
    'under-maintenance',
  ]),
  bedType: z.string().max(50).optional(),
  maxOccupancy: z.number().int().min(1).optional(),
  baseRate: z.number().min(0).optional(),
  amenities: z.array(z.string()).optional(),
  description: z.string().optional(),
  images: z.array(z.string()).optional(),
  isActive: z.boolean().optional(),
});

export const roomUpdateSchema = roomCreateSchema.partial();

// Reservation schema
export const reservationCreateSchema = z.object({
  guestId: z.number().int().positive(),
  roomId: z.number().int().positive(),
  checkInDate: z.string().refine((date) => !isNaN(Date.parse(date)), {
    message: 'Invalid date format',
  }),
  checkOutDate: z.string().refine((date) => !isNaN(Date.parse(date)), {
    message: 'Invalid date format',
  }),
  numberOfGuests: z.number().int().min(1).optional(),
  numberOfChildren: z.number().int().min(0).optional(),
  roomRate: z.number().min(0),
  totalAmount: z.number().min(0),
  status: z.enum(['pending', 'confirmed', 'checked-in', 'checked-out', 'cancelled', 'no-show']).optional(),
  paymentStatus: z.enum(['pending', 'partial', 'paid', 'refunded']).optional(),
  specialRequests: z.string().optional(),
  source: z.enum(['direct', 'booking-com', 'airbnb', 'expedia', 'agoda', 'other']).optional(),
  confirmationNumber: z.string().max(50).optional(),
});

export const reservationUpdateSchema = reservationCreateSchema.partial();

// Housekeeping task schema
export const housekeepingTaskCreateSchema = z.object({
  roomId: z.number().int().positive(),
  assignedTo: z.number().int().positive().optional(),
  taskType: z.enum(['cleaning', 'inspection', 'maintenance', 'turndown', 'deep-cleaning']),
  priority: z.enum(['low', 'normal', 'high', 'urgent']).optional(),
  status: z.enum(['pending', 'in-progress', 'completed', 'verified']).optional(),
  notes: z.string().optional(),
  dueDate: z.string().optional(),
});

export const housekeepingTaskUpdateSchema = housekeepingTaskCreateSchema.partial();

// Menu item schema
export const menuItemCreateSchema = z.object({
  name: z.string().min(1).max(200),
  description: z.string().optional(),
  category: z.string().min(1).max(100),
  price: z.number().min(0),
  costPrice: z.number().min(0).optional(),
  preparationTime: z.number().int().min(0).optional(),
  isAvailable: z.boolean().optional(),
  isVegetarian: z.boolean().optional(),
  isVegan: z.boolean().optional(),
  isGlutenFree: z.boolean().optional(),
  allergens: z.array(z.string()).optional(),
  image: z.string().optional(),
  ingredients: z.array(z.any()).optional(),
});

export const menuItemUpdateSchema = menuItemCreateSchema.partial();

// Invoice schema
export const invoiceCreateSchema = z.object({
  invoiceNumber: z.string().min(1).max(50),
  supplierId: z.number().int().positive().optional(),
  guestId: z.number().int().positive().optional(),
  issueDate: z.string(),
  dueDate: z.string(),
  subtotal: z.number().min(0),
  tax: z.number().min(0),
  discount: z.number().min(0).optional(),
  total: z.number().min(0),
  status: z.enum(['draft', 'sent', 'approved', 'partially-paid', 'paid', 'overdue', 'cancelled']),
  notes: z.string().optional(),
  lineItems: z.array(z.any()),
});

export const invoiceUpdateSchema = invoiceCreateSchema.partial();

// Employee schema
export const employeeCreateSchema = z.object({
  employeeId: z.string().min(1).max(50),
  firstName: z.string().min(1).max(100),
  lastName: z.string().min(1).max(100),
  email: z.string().email().max(255),
  phone: z.string().max(20),
  department: z.string().max(100),
  position: z.string().max(100),
  hireDate: z.string(),
  salary: z.number().min(0).optional(),
  employmentType: z.enum(['full-time', 'part-time', 'contract', 'temporary']).optional(),
  status: z.enum(['active', 'inactive', 'on-leave', 'terminated']).optional(),
  emergencyContact: z.object({
    name: z.string(),
    relationship: z.string(),
    phone: z.string(),
  }).optional(),
  address: z.string().max(500).optional(),
  city: z.string().max(100).optional(),
  country: z.string().max(100).optional(),
});

export const employeeUpdateSchema = employeeCreateSchema.partial();

// Inventory item schema
export const inventoryItemCreateSchema = z.object({
  name: z.string().min(1).max(200),
  category: z.enum(['food', 'beverage', 'amenity', 'construction', 'general']),
  sku: z.string().max(50).optional(),
  unit: z.string().max(20),
  quantity: z.number().min(0),
  minQuantity: z.number().min(0).optional(),
  maxQuantity: z.number().min(0).optional(),
  reorderPoint: z.number().min(0).optional(),
  reorderQuantity: z.number().min(0).optional(),
  unitPrice: z.number().min(0).optional(),
  supplier: z.string().max(200).optional(),
  location: z.string().max(100).optional(),
  expiryDate: z.string().optional(),
  isPerishable: z.boolean().optional(),
});

export const inventoryItemUpdateSchema = inventoryItemCreateSchema.partial();
