import { useState } from 'react'
import { ResponsiveDataView, type Column } from '@/components/ResponsiveDataView'
import { MobileTableCard, MobileTableGrid } from '@/components/MobileTableCard'
import { useTableView } from '@/hooks/use-table-view'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { MagnifyingGlass, Eye, PencilSimple, Trash, List as ListIcon, SquaresFour } from '@phosphor-icons/react'
import { formatCurrency, formatDate } from '@/lib/helpers'

interface ExampleItem {
  id: string
  name: string
  email: string
  amount: number
  status: 'active' | 'pending' | 'inactive'
  date: number
  category: string
}

const sampleData: ExampleItem[] = [
  {
    id: '1',
    name: 'John Doe',
    email: 'john@example.com',
    amount: 1250.00,
    status: 'active',
    date: Date.now(),
    category: 'Premium',
  },
  {
    id: '2',
    name: 'Jane Smith',
    email: 'jane@example.com',
    amount: 850.50,
    status: 'pending',
    date: Date.now() - 86400000,
    category: 'Standard',
  },
  {
    id: '3',
    name: 'Bob Johnson',
    email: 'bob@example.com',
    amount: 2100.75,
    status: 'inactive',
    date: Date.now() - 172800000,
    category: 'Premium',
  },
]

export function ResponsiveTableExample() {
  const [data] = useState<ExampleItem[]>(sampleData)
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [selectedItem, setSelectedItem] = useState<ExampleItem | null>(null)

  const filteredData = data.filter(item => {
    const matchesSearch = 
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.email.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesStatus = statusFilter === 'all' || item.status === statusFilter
    return matchesSearch && matchesStatus
  })

  const columns: Column<ExampleItem>[] = [
    {
      key: 'name',
      label: 'Name',
      className: 'font-medium',
    },
    {
      key: 'email',
      label: 'Email',
      mobileLabel: 'Email',
      className: 'text-muted-foreground',
    },
    {
      key: 'category',
      label: 'Category',
      hideOnMobile: true,
    },
    {
      key: 'amount',
      label: 'Amount',
      render: (item) => (
        <span className="font-semibold">{formatCurrency(item.amount)}</span>
      ),
      className: 'text-right',
    },
    {
      key: 'status',
      label: 'Status',
      render: (item) => (
        <Badge
          variant={
            item.status === 'active'
              ? 'default'
              : item.status === 'pending'
              ? 'secondary'
              : 'outline'
          }
        >
          {item.status}
        </Badge>
      ),
    },
    {
      key: 'date',
      label: 'Date',
      render: (item) => formatDate(item.date),
      hideOnMobile: true,
    },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold mb-2">Responsive Table Example</h2>
        <p className="text-muted-foreground">
          This table automatically switches to card layout on mobile devices
        </p>
      </div>

      <Card className="p-4 sm:p-6">
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <div className="flex-1 relative">
            <MagnifyingGlass
              className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
              size={18}
            />
            <Input
              placeholder="Search by name or email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>

          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full sm:w-[200px]">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="inactive">Inactive</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <ResponsiveDataView
          data={filteredData}
          columns={columns}
          onRowClick={(item) => setSelectedItem(item)}
          emptyMessage="No items found"
          allowViewToggle={true}
        />
      </Card>

      {selectedItem && (
        <Card className="p-4 sm:p-6 bg-muted/50">
          <h3 className="font-semibold mb-2">Selected Item</h3>
          <p className="text-sm text-muted-foreground">
            You clicked on: <span className="font-medium text-foreground">{selectedItem.name}</span>
          </p>
        </Card>
      )}
    </div>
  )
}

export function ManualMobileCardsExample() {
  const [data] = useState<ExampleItem[]>(sampleData)
  const { viewMode, setViewMode, isMobile } = useTableView({
    storageKey: 'example-view-preference',
  })

  const getStatusVariant = (status: string) => {
    switch (status) {
      case 'active':
        return 'default'
      case 'pending':
        return 'secondary'
      default:
        return 'outline'
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold mb-2">Manual View Control Example</h2>
          <p className="text-muted-foreground">
            Toggle between table and card views manually
          </p>
        </div>

        {!isMobile && (
          <div className="flex gap-2">
            <Button
              variant={viewMode === 'table' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setViewMode('table')}
            >
              <ListIcon size={16} className="mr-2" />
              Table
            </Button>
            <Button
              variant={viewMode === 'cards' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setViewMode('cards')}
            >
              <SquaresFour size={16} className="mr-2" />
              Cards
            </Button>
          </div>
        )}
      </div>

      {viewMode === 'table' ? (
        <div className="responsive-table-wrapper">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Category</TableHead>
                <TableHead className="text-right">Amount</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.map((item) => (
                <TableRow key={item.id}>
                  <TableCell className="font-medium">{item.name}</TableCell>
                  <TableCell className="text-muted-foreground">{item.email}</TableCell>
                  <TableCell>{item.category}</TableCell>
                  <TableCell className="text-right font-semibold">
                    {formatCurrency(item.amount)}
                  </TableCell>
                  <TableCell>
                    <Badge variant={getStatusVariant(item.status)}>
                      {item.status}
                    </Badge>
                  </TableCell>
                  <TableCell>{formatDate(item.date)}</TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button size="sm" variant="ghost">
                        <Eye size={16} />
                      </Button>
                      <Button size="sm" variant="ghost">
                        <PencilSimple size={16} />
                      </Button>
                      <Button size="sm" variant="ghost">
                        <Trash size={16} />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      ) : (
        <MobileTableGrid>
          {data.map((item) => (
            <MobileTableCard
              key={item.id}
              header={
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-base">{item.name}</span>
                  <Badge variant={getStatusVariant(item.status)}>
                    {item.status}
                  </Badge>
                </div>
              }
              fields={[
                { label: 'Email', value: item.email },
                { label: 'Category', value: item.category },
                {
                  label: 'Amount',
                  value: formatCurrency(item.amount),
                  className: 'font-semibold text-primary',
                },
                { label: 'Date', value: formatDate(item.date) },
              ]}
              actions={
                <>
                  <Button size="sm" variant="outline" className="flex-1">
                    <Eye size={16} className="mr-2" />
                    View
                  </Button>
                  <Button size="sm" variant="outline" className="flex-1">
                    <PencilSimple size={16} className="mr-2" />
                    Edit
                  </Button>
                  <Button size="sm" variant="destructive" className="flex-1">
                    <Trash size={16} className="mr-2" />
                    Delete
                  </Button>
                </>
              }
            />
          ))}
        </MobileTableGrid>
      )}
    </div>
  )
}
