import { useState } from 'react'
import { Card } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'

  key: keyof T | string
  render?: (item: T) => React.ReactNode
  mobileLabel?: string

export interface ResponsiveD
  columns: Column<T>[]
  onRowClick?: 
  emptyMessage?: string
  tableClassName?: s
  allowViewToggle?: bo
}
e

  onRowClick,
  emptyMess
  tableClassName,
  allowViewToggle = true,
  const [viewMode, setViewMode] 
  const getValue = (item: T, key: string | keyof T
      const keys = key.
      for (const k of ke
      }
    }
  }
  if (data.length === 0) {
 

  }
  const
      <Tab
          <Tabl
             
              </Tabl
          </TableRow>
        <TableBo
            <Tabl
              onClick={(
            >
                <TableCell key={
                </TableCell>

        </TableBody>
    </div>

    <div className="grid gr
        <Card
          onClick={() => o
       
            cardCl
     
            renderCardContent(i
   

                
            
                    <div className="flex
                        {column.mobileLabel || column.label}
             
     
   

          )}
      ))}
  )
  const MobileCardsVi
      {data.map((ite
          key={keyExtractor(item)}
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
      {viewMode === 'tab
          <TableVi
        </>
        <CardsView />
    </div>
}












































































































