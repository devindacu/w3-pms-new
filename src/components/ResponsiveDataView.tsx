import { useState } from 'react'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { List, SquaresFour } from '@phosphor-icons/react'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'

export interface Column<T> {
  key: string | keyof T
  label: string
  render?: (item: T) => React.ReactNode
  hideOnMobile?: boolean
  mobileLabel?: string
  className?: string
}

export interface ResponsiveDataViewProps<T> {
  data: T[]
  columns: Column<T>[]
  onRowClick?: (item: T) => void
  emptyMessage?: string
  tableClassName?: string
  cardClassName?: string
  allowViewToggle?: boolean
}

export function ResponsiveDataView<T>({
  data,
  columns,
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
              <TableHead key={index} className={column.className}>
                {column.label}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.map((item, rowIndex) => (
            <TableRow
              key={rowIndex}
              onClick={() => onRowClick?.(item)}
              className={onRowClick ? 'cursor-pointer hover:bg-muted/50' : ''}
            >
              {columns.filter(col => !col.hideOnMobile).map((column, colIndex) => (
                <TableCell key={colIndex} className={column.className}>
                  {column.render ? column.render(item) : getValue(item, column.key)}
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )

  const CardView = () => (
    <div className="space-y-3">
      {data.map((item, index) => (
        <Card
          key={index}
          className={`p-4 ${onRowClick ? 'cursor-pointer hover:bg-muted/50' : ''} ${cardClassName || ''}`}
          onClick={() => onRowClick?.(item)}
        >
          <div className="space-y-3">
            {columns.map((column, colIndex) => {
              const value = column.render ? column.render(item) : getValue(item, column.key)
              return (
                <div key={colIndex} className="mobile-card-field">
                  <span className="mobile-card-label">
                    {column.mobileLabel || column.label}:
                  </span>
                  <span className="mobile-card-value">{value}</span>
                </div>
              )
            })}
          </div>
        </Card>
      ))}
    </div>
  )

  return (
    <div className="space-y-4">
      {allowViewToggle && (
        <div className="flex justify-end">
          <Tabs value={viewMode} onValueChange={(v) => setViewMode(v as 'table' | 'cards')}>
            <TabsList>
              <TabsTrigger value="table" className="gap-2">
                <List size={16} />
                <span className="hidden sm:inline">Table</span>
              </TabsTrigger>
              <TabsTrigger value="cards" className="gap-2">
                <SquaresFour size={16} />
                <span className="hidden sm:inline">Cards</span>
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      )}

      <div className="hidden md:block">
        <TableView />
      </div>

      <div className="md:hidden">
        <CardView />
      </div>

      {allowViewToggle && (
        <div className="hidden md:block">
          {viewMode === 'cards' ? <CardView /> : <TableView />}
        </div>
      )}
    </div>
  )
}
