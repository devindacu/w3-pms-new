import { useState } from 'react'
import { Table, TableBody, TableCell, Table
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { List, SquaresFour } from '@phosphor-ic
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { List, SquaresFour } from '@phosphor-icons/react'

  className?: string
  label: string
}
  render?: (item: T) => React.ReactNode
  data: T[]
  hideOnMobile?: boolean
  mobileLabel?: string
}

  onRowClick,
  tableClas
  allowViewToggle = tr
  const [viewMode, setViewMode] = u
  const getValue = (item: T, key: string | keyof T
      const keys = key.split('.'
      for (const k of k
      }
    }
  }
 

      </Card>
  }
  const Ta
      <Table>
          <TableRow>
  onRowClick,
  emptyMessage = 'No data available',
  tableClassName,
  cardClassName,
  allowViewToggle = true,
}: ResponsiveDataViewProps<T>) {
  const [viewMode, setViewMode] = useState<'table' | 'cards'>('table')

  const getValue = (item: T, key: string | keyof T): any => {
    if (typeof key === 'string' && key.includes('.')) {
      const keys = key.split('.')
      let value: any = item
      for (const k of keys) {
        value = value?.[k]
      }
      return value
    }
    return (item as any)[key]
  }

  if (data.length === 0) {
    return (
      <Card className="p-8 md:p-12 text-center">
        <p className="text-muted-foreground">{emptyMessage}</p>
      </Card>
    )
  }

  const TableView = () => (
    <div className={`overflow-x-auto rounded-lg border ${tableClassName || ''}`}>
      <Table>
        <TableHeader>
          <TableRow>
            {columns.filter(col => !col.hideOnMobile).map((column, index) => (
            </TabsList>
        </div>

    </div>
}








































































