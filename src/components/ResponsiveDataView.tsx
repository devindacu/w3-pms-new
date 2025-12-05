import { useState } from 'react'
import { Card } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { SquaresFour, List as ListIcon } from '@phosphor-icons/react'
import { cn } from '@/lib/utils'

export interface Column<T> {
  key: keyof T | string
  label: string
  render?: (item: T) => React.ReactNode
  className?: string
  mobileLabel?: string
  hideOnMobile?: boolean
}

export interface ResponsiveDataViewProps<T> {
  data: T[]
  columns: Column<T>[]
  keyExtractor: (item: T) => string | number
  onRowClick?: (item: T) => void
  renderCardContent?: (item: T) => React.ReactNode
  emptyMessage?: string
  cardClassName?: string
  tableClassName?: string
  defaultView?: 'table' | 'cards'
  allowViewToggle?: boolean
  mobileBreakpoint?: number
}

export function ResponsiveDataView<T extends Record<string, any>>({
  data,
  columns,
  keyExtractor,
  onRowClick,
  renderCardContent,
  emptyMessage = 'No data available',
  cardClassName,
  tableClassName,
  defaultView = 'table',
  allowViewToggle = true,
}: ResponsiveDataViewProps<T>) {
  const [viewMode, setViewMode] = useState<'table' | 'cards'>(defaultView)

  const getValue = (item: T, key: string | keyof T): any => {
    if (typeof key === 'string' && key.includes('.')) {
      const keys = key.split('.')
      let value: any = item
      for (const k of keys) {
        value = value?.[k]
      }
      return value
    }
    return item[key as keyof T]
  }

  if (data.length === 0) {
    return (
      <Card className="p-8 text-center">
        <p className="text-muted-foreground">{emptyMessage}</p>
      </Card>
    )
  }

  const TableView = () => (
    <div className="hidden md:block overflow-x-auto rounded-lg border">
      <Table className={cn('min-w-full', tableClassName)}>
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
          className={cn(
            'p-4',
            onRowClick && 'cursor-pointer hover:shadow-md transition-shadow',
            cardClassName
          )}
        >
          {renderCardContent ? (
            renderCardContent(item)
          ) : (
            <div className="space-y-3">
              {columns.map((column, index) => {
                const value = column.render ? column.render(item) : getValue(item, column.key)
                if (!value && value !== 0) return null
                
                return (
                  <div key={index}>
                    {index > 0 && <Separator className="my-2" />}
                    <div className="flex items-start justify-between gap-3">
                      <span className="text-sm font-medium text-muted-foreground min-w-[100px]">
                        {column.mobileLabel || column.label}
                      </span>
                      <span className="text-sm text-right flex-1 break-words">
                        {value}
                      </span>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </Card>
      ))}
    </div>
  )

  const MobileCardsView = () => (
    <div className="md:hidden grid grid-cols-1 gap-3">
      {data.map((item) => (
        <Card
          key={keyExtractor(item)}
          onClick={() => onRowClick?.(item)}
          className={cn(
            'p-4',
            onRowClick && 'cursor-pointer active:bg-muted/50',
            cardClassName
          )}
        >
          {renderCardContent ? (
            renderCardContent(item)
          ) : (
            <div className="space-y-2">
              {columns.filter(col => !col.hideOnMobile).map((column, index) => {
                const value = column.render ? column.render(item) : getValue(item, column.key)
                if (!value && value !== 0) return null
                
                return (
                  <div key={index}>
                    {index > 0 && <Separator className="my-2" />}
                    <div className="flex items-start justify-between gap-3">
                      <span className="text-xs font-medium text-muted-foreground min-w-[90px] shrink-0">
                        {column.mobileLabel || column.label}
                      </span>
                      <span className="text-sm text-right flex-1 break-words">
                        {value}
                      </span>
                    </div>
                  </div>
                )
              })}
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
          <div className="inline-flex rounded-lg border p-1 gap-1">
            <Button
              variant={viewMode === 'table' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('table')}
              className="h-8"
            >
              <ListIcon size={16} className="mr-2" />
              Table
            </Button>
            <Button
              variant={viewMode === 'cards' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('cards')}
              className="h-8"
            >
              <SquaresFour size={16} className="mr-2" />
              Cards
            </Button>
          </div>
        </div>
      )}

      {viewMode === 'table' ? (
        <>
          <TableView />
          <MobileCardsView />
        </>
      ) : (
        <CardsView />
      )}
    </div>
  )
}
