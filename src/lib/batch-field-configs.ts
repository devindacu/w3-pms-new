import type { BatchField } from '@/components/UniversalBatchDialog'

export const guestBatchFields: BatchField[] = [
  {
    key: 'status',
    label: 'Status',
    type: 'select',
    options: [
      { value: 'active', label: 'Active' },
      { value: 'inactive', label: 'Inactive' },
      { value: 'blacklisted', label: 'Blacklisted' },
    ],
  },
  {
    key: 'phone',
    label: 'Phone',
    type: 'text',
    placeholder: 'Enter phone number',
  },
  {
    key: 'email',
    label: 'Email',
    type: 'text',
    placeholder: 'Enter email',
  },
  {
    key: 'notes',
    label: 'Notes',
    type: 'textarea',
    placeholder: 'Add notes',
  },
]

export const roomBatchFields: BatchField[] = [
  {
    key: 'status',
    label: 'Status',
    type: 'select',
    options: [
      { value: 'available', label: 'Available' },
      { value: 'occupied', label: 'Occupied' },
      { value: 'maintenance', label: 'Under Maintenance' },
      { value: 'cleaning', label: 'Being Cleaned' },
      { value: 'reserved', label: 'Reserved' },
    ],
  },
  {
    key: 'baseRate',
    label: 'Base Rate',
    type: 'number',
    placeholder: 'Enter base rate',
  },
  {
    key: 'assignedHousekeeper',
    label: 'Assigned Housekeeper',
    type: 'text',
    placeholder: 'Housekeeper ID',
  },
  {
    key: 'notes',
    label: 'Notes',
    type: 'textarea',
    placeholder: 'Add notes',
  },
]

export const reservationBatchFields: BatchField[] = [
  {
    key: 'status',
    label: 'Status',
    type: 'select',
    options: [
      { value: 'confirmed', label: 'Confirmed' },
      { value: 'pending', label: 'Pending' },
      { value: 'checked-in', label: 'Checked In' },
      { value: 'checked-out', label: 'Checked Out' },
      { value: 'cancelled', label: 'Cancelled' },
      { value: 'no-show', label: 'No Show' },
    ],
  },
  {
    key: 'specialRequests',
    label: 'Special Requests',
    type: 'textarea',
    placeholder: 'Add special requests',
  },
]

export const housekeepingBatchFields: BatchField[] = [
  {
    key: 'status',
    label: 'Status',
    type: 'select',
    options: [
      { value: 'pending', label: 'Pending' },
      { value: 'in-progress', label: 'In Progress' },
      { value: 'completed', label: 'Completed' },
      { value: 'cancelled', label: 'Cancelled' },
    ],
  },
  {
    key: 'priority',
    label: 'Priority',
    type: 'select',
    options: [
      { value: 'low', label: 'Low' },
      { value: 'medium', label: 'Medium' },
      { value: 'high', label: 'High' },
      { value: 'urgent', label: 'Urgent' },
    ],
  },
  {
    key: 'assignedTo',
    label: 'Assign To',
    type: 'text',
    placeholder: 'Employee ID',
  },
]

export const employeeBatchFields: BatchField[] = [
  {
    key: 'status',
    label: 'Status',
    type: 'select',
    options: [
      { value: 'active', label: 'Active' },
      { value: 'on-leave', label: 'On Leave' },
      { value: 'suspended', label: 'Suspended' },
      { value: 'terminated', label: 'Terminated' },
    ],
  },
  {
    key: 'department',
    label: 'Department',
    type: 'select',
    options: [
      { value: 'Front Office', label: 'Front Office' },
      { value: 'Housekeeping', label: 'Housekeeping' },
      { value: 'F&B', label: 'F&B' },
      { value: 'Kitchen', label: 'Kitchen' },
      { value: 'Maintenance', label: 'Maintenance' },
      { value: 'Finance', label: 'Finance' },
      { value: 'HR', label: 'HR' },
      { value: 'Management', label: 'Management' },
    ],
  },
  {
    key: 'salary',
    label: 'Salary',
    type: 'number',
    placeholder: 'Enter salary',
  },
]

export const inventoryBatchFields: BatchField[] = [
  {
    key: 'status',
    label: 'Status',
    type: 'select',
    options: [
      { value: 'in-stock', label: 'In Stock' },
      { value: 'low-stock', label: 'Low Stock' },
      { value: 'out-of-stock', label: 'Out of Stock' },
      { value: 'discontinued', label: 'Discontinued' },
    ],
  },
  {
    key: 'reorderLevel',
    label: 'Reorder Level',
    type: 'number',
    placeholder: 'Minimum stock level',
  },
  {
    key: 'unitPrice',
    label: 'Unit Price',
    type: 'number',
    placeholder: 'Price per unit',
  },
]

export const supplierBatchFields: BatchField[] = [
  {
    key: 'status',
    label: 'Status',
    type: 'select',
    options: [
      { value: 'active', label: 'Active' },
      { value: 'inactive', label: 'Inactive' },
      { value: 'blacklisted', label: 'Blacklisted' },
    ],
  },
  {
    key: 'paymentTerms',
    label: 'Payment Terms',
    type: 'select',
    options: [
      { value: 'immediate', label: 'Immediate' },
      { value: 'net-7', label: 'Net 7' },
      { value: 'net-15', label: 'Net 15' },
      { value: 'net-30', label: 'Net 30' },
      { value: 'net-60', label: 'Net 60' },
    ],
  },
  {
    key: 'email',
    label: 'Email',
    type: 'text',
    placeholder: 'supplier@example.com',
  },
  {
    key: 'phone',
    label: 'Phone',
    type: 'text',
    placeholder: '+1 234 567 8900',
  },
]

export const purchaseOrderBatchFields: BatchField[] = [
  {
    key: 'status',
    label: 'Status',
    type: 'select',
    options: [
      { value: 'draft', label: 'Draft' },
      { value: 'submitted', label: 'Submitted' },
      { value: 'approved', label: 'Approved' },
      { value: 'rejected', label: 'Rejected' },
      { value: 'received', label: 'Received' },
      { value: 'cancelled', label: 'Cancelled' },
    ],
  },
  {
    key: 'priority',
    label: 'Priority',
    type: 'select',
    options: [
      { value: 'low', label: 'Low' },
      { value: 'medium', label: 'Medium' },
      { value: 'high', label: 'High' },
      { value: 'urgent', label: 'Urgent' },
    ],
  },
]

export const invoiceBatchFields: BatchField[] = [
  {
    key: 'status',
    label: 'Status',
    type: 'select',
    options: [
      { value: 'draft', label: 'Draft' },
      { value: 'final', label: 'Final' },
      { value: 'proforma', label: 'Proforma' },
      { value: 'paid', label: 'Paid' },
      { value: 'partially-paid', label: 'Partially Paid' },
      { value: 'cancelled', label: 'Cancelled' },
    ],
  },
  {
    key: 'dueDate',
    label: 'Due Date',
    type: 'date',
  },
]

export const menuItemBatchFields: BatchField[] = [
  {
    key: 'available',
    label: 'Available',
    type: 'boolean',
  },
  {
    key: 'category',
    label: 'Category',
    type: 'select',
    options: [
      { value: 'appetizer', label: 'Appetizer' },
      { value: 'main', label: 'Main Course' },
      { value: 'dessert', label: 'Dessert' },
      { value: 'beverage', label: 'Beverage' },
      { value: 'special', label: 'Special' },
    ],
  },
  {
    key: 'price',
    label: 'Price',
    type: 'number',
    placeholder: 'Enter price',
  },
]

export const orderBatchFields: BatchField[] = [
  {
    key: 'status',
    label: 'Status',
    type: 'select',
    options: [
      { value: 'pending', label: 'Pending' },
      { value: 'preparing', label: 'Preparing' },
      { value: 'ready', label: 'Ready' },
      { value: 'served', label: 'Served' },
      { value: 'completed', label: 'Completed' },
      { value: 'cancelled', label: 'Cancelled' },
    ],
  },
  {
    key: 'priority',
    label: 'Priority',
    type: 'select',
    options: [
      { value: 'normal', label: 'Normal' },
      { value: 'high', label: 'High' },
      { value: 'urgent', label: 'Urgent' },
    ],
  },
]

export const maintenanceBatchFields: BatchField[] = [
  {
    key: 'status',
    label: 'Status',
    type: 'select',
    options: [
      { value: 'pending', label: 'Pending' },
      { value: 'in-progress', label: 'In Progress' },
      { value: 'completed', label: 'Completed' },
      { value: 'cancelled', label: 'Cancelled' },
    ],
  },
  {
    key: 'priority',
    label: 'Priority',
    type: 'select',
    options: [
      { value: 'low', label: 'Low' },
      { value: 'medium', label: 'Medium' },
      { value: 'high', label: 'High' },
      { value: 'critical', label: 'Critical' },
    ],
  },
  {
    key: 'assignedTo',
    label: 'Assigned To',
    type: 'text',
    placeholder: 'Technician ID',
  },
]

export const requisitionBatchFields: BatchField[] = [
  {
    key: 'status',
    label: 'Status',
    type: 'select',
    options: [
      { value: 'pending-approval', label: 'Pending Approval' },
      { value: 'approved', label: 'Approved' },
      { value: 'rejected', label: 'Rejected' },
      { value: 'converted-to-po', label: 'Converted to PO' },
      { value: 'cancelled', label: 'Cancelled' },
    ],
  },
  {
    key: 'priority',
    label: 'Priority',
    type: 'select',
    options: [
      { value: 'low', label: 'Low' },
      { value: 'medium', label: 'Medium' },
      { value: 'high', label: 'High' },
      { value: 'urgent', label: 'Urgent' },
    ],
  },
]

export const leaveRequestBatchFields: BatchField[] = [
  {
    key: 'status',
    label: 'Status',
    type: 'select',
    options: [
      { value: 'pending', label: 'Pending' },
      { value: 'approved', label: 'Approved' },
      { value: 'rejected', label: 'Rejected' },
      { value: 'cancelled', label: 'Cancelled' },
    ],
  },
]

export const foodItemBatchFields: BatchField[] = [
  {
    key: 'category',
    label: 'Category',
    type: 'select',
    options: [
      { value: 'vegetables', label: 'Vegetables' },
      { value: 'fruits', label: 'Fruits' },
      { value: 'meat', label: 'Meat' },
      { value: 'seafood', label: 'Seafood' },
      { value: 'dairy', label: 'Dairy' },
      { value: 'grains', label: 'Grains' },
      { value: 'spices', label: 'Spices' },
      { value: 'beverages', label: 'Beverages' },
    ],
  },
  {
    key: 'reorderLevel',
    label: 'Reorder Level',
    type: 'number',
    placeholder: 'Minimum stock level',
  },
  {
    key: 'unitPrice',
    label: 'Unit Price',
    type: 'number',
    placeholder: 'Price per unit',
  },
]

export const amenityBatchFields: BatchField[] = [
  {
    key: 'category',
    label: 'Category',
    type: 'select',
    options: [
      { value: 'bathroom', label: 'Bathroom' },
      { value: 'bedroom', label: 'Bedroom' },
      { value: 'toiletries', label: 'Toiletries' },
      { value: 'stationery', label: 'Stationery' },
      { value: 'other', label: 'Other' },
    ],
  },
  {
    key: 'reorderLevel',
    label: 'Reorder Level',
    type: 'number',
    placeholder: 'Minimum stock level',
  },
  {
    key: 'autoOrderEnabled',
    label: 'Auto Order',
    type: 'boolean',
  },
]

export const constructionMaterialBatchFields: BatchField[] = [
  {
    key: 'category',
    label: 'Category',
    type: 'select',
    options: [
      { value: 'cement', label: 'Cement' },
      { value: 'steel', label: 'Steel' },
      { value: 'wood', label: 'Wood' },
      { value: 'electrical', label: 'Electrical' },
      { value: 'plumbing', label: 'Plumbing' },
      { value: 'paint', label: 'Paint' },
      { value: 'tiles', label: 'Tiles' },
      { value: 'other', label: 'Other' },
    ],
  },
  {
    key: 'reorderLevel',
    label: 'Reorder Level',
    type: 'number',
    placeholder: 'Minimum stock level',
  },
]

export const constructionProjectBatchFields: BatchField[] = [
  {
    key: 'status',
    label: 'Status',
    type: 'select',
    options: [
      { value: 'planned', label: 'Planned' },
      { value: 'in-progress', label: 'In Progress' },
      { value: 'on-hold', label: 'On Hold' },
      { value: 'completed', label: 'Completed' },
      { value: 'cancelled', label: 'Cancelled' },
    ],
  },
  {
    key: 'priority',
    label: 'Priority',
    type: 'select',
    options: [
      { value: 'low', label: 'Low' },
      { value: 'medium', label: 'Medium' },
      { value: 'high', label: 'High' },
      { value: 'critical', label: 'Critical' },
    ],
  },
]

export const systemUserBatchFields: BatchField[] = [
  {
    key: 'role',
    label: 'Role',
    type: 'select',
    options: [
      { value: 'admin', label: 'Admin' },
      { value: 'manager', label: 'Manager' },
      { value: 'supervisor', label: 'Supervisor' },
      { value: 'staff', label: 'Staff' },
    ],
  },
  {
    key: 'isActive',
    label: 'Active',
    type: 'boolean',
  },
]

export const guestProfileBatchFields: BatchField[] = [
  {
    key: 'tier',
    label: 'Loyalty Tier',
    type: 'select',
    options: [
      { value: 'bronze', label: 'Bronze' },
      { value: 'silver', label: 'Silver' },
      { value: 'gold', label: 'Gold' },
      { value: 'platinum', label: 'Platinum' },
    ],
  },
  {
    key: 'vipStatus',
    label: 'VIP Status',
    type: 'boolean',
  },
]

export const extraServiceBatchFields: BatchField[] = [
  {
    key: 'isActive',
    label: 'Active',
    type: 'boolean',
  },
  {
    key: 'price',
    label: 'Price',
    type: 'number',
    placeholder: 'Service price',
  },
  {
    key: 'taxable',
    label: 'Taxable',
    type: 'boolean',
  },
]

export const channelReservationBatchFields: BatchField[] = [
  {
    key: 'status',
    label: 'Status',
    type: 'select',
    options: [
      { value: 'pending', label: 'Pending' },
      { value: 'confirmed', label: 'Confirmed' },
      { value: 'cancelled', label: 'Cancelled' },
    ],
  },
]

export const recipeBatchFields: BatchField[] = [
  {
    key: 'isActive',
    label: 'Active',
    type: 'boolean',
  },
  {
    key: 'category',
    label: 'Category',
    type: 'select',
    options: [
      { value: 'appetizer', label: 'Appetizer' },
      { value: 'main', label: 'Main Course' },
      { value: 'dessert', label: 'Dessert' },
      { value: 'beverage', label: 'Beverage' },
      { value: 'sauce', label: 'Sauce' },
    ],
  },
]
