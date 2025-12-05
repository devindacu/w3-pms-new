import { ResponsiveDataView, type Column } from '@/components/ResponsiveDataView'
import { Badge } from '@/components/ui/badge'
import { formatCurrency } from '@/lib/helpers'
import { format } from 'date-fns'

interface PurchaseOrder {
  id: string
  poNumber: string
  supplier: {
    name: string
    id: string
  }
  orderDate: Date
  expectedDeliveryDate: Date
  totalAmount: number
  status: 'draft' | 'submitted' | 'approved' | 'received' | 'cancelled'
  priority: 'low' | 'normal' | 'high' | 'urgent'
  itemCount: number
  isUrgent: boolean
  department: string
}

interface PurchaseOrderListExampleProps {
  purchaseOrders: PurchaseOrder[]
  onOrderClick: (order: PurchaseOrder) => void
}

export function PurchaseOrderListExample({ 
  purchaseOrders, 
  onOrderClick 
}: PurchaseOrderListExampleProps) {
  const columns: Column<PurchaseOrder>[] = [
    {
      key: 'poNumber',
      label: 'PO Number',
      sortable: true,
      filterable: true,
      filterType: 'text',
      filterOperators: ['contains', 'equals', 'startsWith'],
    },
    {
      key: 'supplier.name',
      label: 'Supplier',
      sortable: true,
      filterable: true,
      filterType: 'text',
    },
    {
      key: 'orderDate',
      label: 'Order Date',
      sortable: true,
      filterable: true,
      filterType: 'dateRange',
      render: (order) => format(new Date(order.orderDate), 'MMM dd, yyyy'),
    },
    {
      key: 'expectedDeliveryDate',
      label: 'Expected Delivery',
      sortable: true,
      filterable: true,
      filterType: 'dateRange',
      render: (order) => format(new Date(order.expectedDeliveryDate), 'MMM dd, yyyy'),
      hideOnMobile: true,
    },
    {
      key: 'status',
      label: 'Status',
      sortable: true,
      filterable: true,
      filterType: 'select',
      filterOptions: [
        { label: 'Draft', value: 'draft' },
        { label: 'Submitted', value: 'submitted' },
        { label: 'Approved', value: 'approved' },
        { label: 'Received', value: 'received' },
        { label: 'Cancelled', value: 'cancelled' },
      ],
      render: (order) => {
        const variants: Record<PurchaseOrder['status'], 'default' | 'secondary' | 'destructive' | 'outline'> = {
          draft: 'outline',
          submitted: 'secondary',
          approved: 'default',
          received: 'default',
          cancelled: 'destructive',
        }
        return <Badge variant={variants[order.status]}>{order.status}</Badge>
      },
    },
    {
      key: 'priority',
      label: 'Priority',
      sortable: true,
      filterable: true,
      filterType: 'select',
      filterOptions: [
        { label: 'Low', value: 'low' },
        { label: 'Normal', value: 'normal' },
        { label: 'High', value: 'high' },
        { label: 'Urgent', value: 'urgent' },
      ],
      render: (order) => {
        const colors: Record<PurchaseOrder['priority'], string> = {
          low: 'bg-blue-100 text-blue-800',
          normal: 'bg-gray-100 text-gray-800',
          high: 'bg-orange-100 text-orange-800',
          urgent: 'bg-red-100 text-red-800',
        }
        return (
          <Badge variant="outline" className={colors[order.priority]}>
            {order.priority.toUpperCase()}
          </Badge>
        )
      },
      hideOnMobile: true,
    },
    {
      key: 'totalAmount',
      label: 'Total Amount',
      sortable: true,
      filterable: true,
      filterType: 'range',
      render: (order) => formatCurrency(order.totalAmount),
      className: 'text-right',
    },
    {
      key: 'itemCount',
      label: 'Items',
      sortable: true,
      filterable: true,
      filterType: 'number',
      filterOperators: ['equals', 'gt', 'gte', 'lt', 'lte'],
      className: 'text-center',
      hideOnMobile: true,
    },
    {
      key: 'isUrgent',
      label: 'Urgent',
      sortable: true,
      filterable: true,
      filterType: 'boolean',
      render: (order) => (
        order.isUrgent ? (
          <Badge variant="destructive">URGENT</Badge>
        ) : (
          <span className="text-muted-foreground text-xs">-</span>
        )
      ),
      hideOnMobile: true,
    },
    {
      key: 'department',
      label: 'Department',
      sortable: true,
      filterable: true,
      filterType: 'text',
      hideOnMobile: true,
    },
  ]

  return (
    <ResponsiveDataView
      data={purchaseOrders}
      columns={columns}
      onRowClick={onOrderClick}
      emptyMessage="No purchase orders found"
      enableFiltering={true}
      enableSorting={true}
      defaultSort={{ field: 'orderDate', direction: 'desc' }}
      allowViewToggle={true}
    />
  )
}
