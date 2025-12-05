import { ResponsiveDataView, type Column } from '@/components/ResponsiveDataView'
import { Badge } from '@/components/ui/badge'
import { formatCurrency } from '@/lib/helpers'
import { format } from 'date-fns'

interface Invoice {
  id: string
  invoiceNumber: string
  supplier: {
    name: string
    id: string
  }
  invoiceDate: Date
  dueDate: Date
  totalAmount: number
  status: 'draft' | 'pending' | 'approved' | 'paid' | 'rejected'
  isPaid: boolean
  category: string
}

interface InvoiceListExampleProps {
  invoices: Invoice[]
  onInvoiceClick: (invoice: Invoice) => void
}

export function InvoiceListExample({ invoices, onInvoiceClick }: InvoiceListExampleProps) {
  const columns: Column<Invoice>[] = [
    {
      key: 'invoiceNumber',
      label: 'Invoice #',
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
      key: 'invoiceDate',
      label: 'Invoice Date',
      sortable: true,
      filterable: true,
      filterType: 'dateRange',
      render: (invoice) => format(new Date(invoice.invoiceDate), 'MMM dd, yyyy'),
    },
    {
      key: 'dueDate',
      label: 'Due Date',
      sortable: true,
      filterable: true,
      filterType: 'dateRange',
      render: (invoice) => format(new Date(invoice.dueDate), 'MMM dd, yyyy'),
      hideOnMobile: true,
    },
    {
      key: 'totalAmount',
      label: 'Amount',
      sortable: true,
      filterable: true,
      filterType: 'range',
      render: (invoice) => formatCurrency(invoice.totalAmount),
      className: 'text-right',
    },
    {
      key: 'status',
      label: 'Status',
      sortable: true,
      filterable: true,
      filterType: 'select',
      filterOptions: [
        { label: 'Draft', value: 'draft' },
        { label: 'Pending', value: 'pending' },
        { label: 'Approved', value: 'approved' },
        { label: 'Paid', value: 'paid' },
        { label: 'Rejected', value: 'rejected' },
      ],
      render: (invoice) => {
        const variants: Record<Invoice['status'], 'default' | 'secondary' | 'destructive' | 'outline'> = {
          draft: 'outline',
          pending: 'secondary',
          approved: 'default',
          paid: 'default',
          rejected: 'destructive',
        }
        return <Badge variant={variants[invoice.status]}>{invoice.status}</Badge>
      },
    },
    {
      key: 'isPaid',
      label: 'Paid',
      sortable: true,
      filterable: true,
      filterType: 'boolean',
      render: (invoice) => (
        <Badge variant={invoice.isPaid ? 'default' : 'secondary'}>
          {invoice.isPaid ? 'Yes' : 'No'}
        </Badge>
      ),
      hideOnMobile: true,
    },
    {
      key: 'category',
      label: 'Category',
      sortable: true,
      filterable: true,
      filterType: 'text',
      hideOnMobile: true,
    },
  ]

  return (
    <ResponsiveDataView
      data={invoices}
      columns={columns}
      onRowClick={onInvoiceClick}
      emptyMessage="No invoices found"
      enableFiltering={true}
      enableSorting={true}
      defaultSort={{ field: 'invoiceDate', direction: 'desc' }}
    />
  )
}
