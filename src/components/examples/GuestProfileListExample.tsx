import { ResponsiveDataView, type Column } from '@/components/ResponsiveDataView'
import { Badge } from '@/components/ui/badge'
import { formatCurrency } from '@/lib/helpers'
import { format } from 'date-fns'

interface GuestProfile {
  id: string
  fullName: string
  email: string
  phone: string
  nationality: string
  loyaltyTier: 'bronze' | 'silver' | 'gold' | 'platinum'
  totalSpent: number
  totalVisits: number
  lastVisit: Date
  isVIP: boolean
  preferences: string[]
}

interface GuestProfileListExampleProps {
  guestProfiles: GuestProfile[]
  onGuestClick: (guest: GuestProfile) => void
}

export function GuestProfileListExample({ guestProfiles, onGuestClick }: GuestProfileListExampleProps) {
  const columns: Column<GuestProfile>[] = [
    {
      key: 'fullName',
      label: 'Name',
      sortable: true,
      filterable: true,
      filterType: 'text',
      filterOperators: ['contains', 'equals', 'startsWith'],
    },
    {
      key: 'email',
      label: 'Email',
      sortable: true,
      filterable: true,
      filterType: 'text',
      hideOnMobile: true,
    },
    {
      key: 'phone',
      label: 'Phone',
      sortable: false,
      filterable: true,
      filterType: 'text',
      hideOnMobile: true,
    },
    {
      key: 'nationality',
      label: 'Nationality',
      sortable: true,
      filterable: true,
      filterType: 'text',
      hideOnMobile: true,
    },
    {
      key: 'loyaltyTier',
      label: 'Loyalty Tier',
      sortable: true,
      filterable: true,
      filterType: 'select',
      filterOptions: [
        { label: 'Bronze', value: 'bronze' },
        { label: 'Silver', value: 'silver' },
        { label: 'Gold', value: 'gold' },
        { label: 'Platinum', value: 'platinum' },
      ],
      render: (guest) => {
        const colors: Record<GuestProfile['loyaltyTier'], string> = {
          bronze: 'bg-orange-100 text-orange-800 border-orange-300',
          silver: 'bg-gray-100 text-gray-800 border-gray-300',
          gold: 'bg-yellow-100 text-yellow-800 border-yellow-300',
          platinum: 'bg-purple-100 text-purple-800 border-purple-300',
        }
        return (
          <Badge variant="outline" className={colors[guest.loyaltyTier]}>
            {guest.loyaltyTier.toUpperCase()}
          </Badge>
        )
      },
    },
    {
      key: 'totalSpent',
      label: 'Total Spent',
      sortable: true,
      filterable: true,
      filterType: 'range',
      render: (guest) => formatCurrency(guest.totalSpent),
      className: 'text-right',
    },
    {
      key: 'totalVisits',
      label: 'Visits',
      sortable: true,
      filterable: true,
      filterType: 'number',
      filterOperators: ['equals', 'gt', 'gte', 'lt', 'lte'],
      className: 'text-center',
      hideOnMobile: true,
    },
    {
      key: 'lastVisit',
      label: 'Last Visit',
      sortable: true,
      filterable: true,
      filterType: 'dateRange',
      render: (guest) => format(new Date(guest.lastVisit), 'MMM dd, yyyy'),
      hideOnMobile: true,
    },
    {
      key: 'isVIP',
      label: 'VIP',
      sortable: true,
      filterable: true,
      filterType: 'boolean',
      render: (guest) => (
        guest.isVIP ? (
          <Badge variant="default" className="bg-purple-600">VIP</Badge>
        ) : (
          <span className="text-muted-foreground text-xs">-</span>
        )
      ),
    },
  ]

  return (
    <ResponsiveDataView
      data={guestProfiles}
      columns={columns}
      onRowClick={onGuestClick}
      emptyMessage="No guest profiles found"
      enableFiltering={true}
      enableSorting={true}
      defaultSort={{ field: 'lastVisit', direction: 'desc' }}
      allowViewToggle={true}
    />
  )
}
