import { useState } from 'react'
import { Card } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { List, SquaresFour } from '@phosphor-icons/react'

export interface Column<T> {
  label: string
  key: keyof T | string
  render?: (item: T) => React.ReactNode
  className?: string
  hideOnMobile?: boolean
  mobileLabel?: string
}

export interface ResponsiveDataViewProps<T> {
  data: T[]
  columns: Column<T>[]
  keyExtractor: (item: T) => string
  renderCardContent?: (item: T) => React.ReactNode
  onRowClick?: (item: T) => void
  emptyMessage?: string
  tableClassName?: string
  cardClassName?: string
  allowViewToggle?: boolean
}

export function ResponsiveDataView<T>({
  data,
  columns,
  keyExtractor,
  renderCardContent,
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
          {data.map((item) => (
            <TableRow
              key={keyExtractor(item)}
              onClick={() => onRowClick?.(item)}
              className={onRowClick ? 'cursor-pointer hover:bg-muted/50' : ''}
            >
              {columns.filter(col => !col.hideOnMobile).map((column, index) => (
                <TableCell key={index} className={column.className}>
                  {column.render ? column.render(item) : getValue(item, column.key)}
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )

  const CardsView = () => (
    <div className="grid grid-cols-1 gap-3 md:gap-4">
      {data.map((item) => (
        <Card
          key={keyExtractor(item)}
          onClick={() => onRowClick?.(item)}
          className={`p-4 ${onRowClick ? 'cursor-pointer hover:border-primary' : ''} ${cardClassName || ''}`}
        >
          {renderCardContent ? (
            renderCardContent(item)
          ) : (
            <div className="space-y-2">
              {columns.filter(col => !col.hideOnMobile).map((column, index) => (
                <div key={index} className="flex items-start justify-between gap-3 text-sm">
                  <span className="font-medium text-muted-foreground min-w-[100px] shrink-0">
                    {column.mobileLabel || column.label}
                  </span>
                  <span className="text-right flex-1 break-words">
                    {column.render ? column.render(item) : getValue(item, column.key)}
                  </span>
                </div>
              ))}
            </div>
          )}
        </Card>
      ))}
    </div>
  )

  return (
    <div className="space-y-4">
      {allowViewToggle && (
        <div className="flex justify-end">
          <Tabs value={viewMode} onValueChange={(v) => setViewMode(v as 'table' | 'cards')}>
            <TabsList className="grid w-[200px] grid-cols-2">
              <TabsTrigger value="table" className="flex items-center gap-2">
                <List size={16} />
                Table
              </TabsTrigger>
              <TabsTrigger value="cards" className="flex items-center gap-2">
                <SquaresFour size={16} />
                Cards
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      )}

      {viewMode === 'table' ? <TableView /> : <CardsView />}
    </div>
  )
}
