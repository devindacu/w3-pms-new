import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { cn } from '@/lib/utils'

interface MobileTableCardField {
  label: string
  value: React.ReactNode
  className?: string
  fullWidth?: boolean
  hide?: boolean
}

interface MobileTableCardProps {
  fields: MobileTableCardField[]
  onClick?: () => void
  className?: string
  header?: React.ReactNode
  actions?: React.ReactNode
  highlight?: boolean
}

export function MobileTableCard({
  fields,
  onClick,
  className,
  header,
  actions,
  highlight,
}: MobileTableCardProps) {
  const visibleFields = fields.filter(f => !f.hide)

  return (
    <Card
      onClick={onClick}
      className={cn(
        'p-4 transition-all',
        onClick && 'cursor-pointer active:scale-[0.98] hover:shadow-md',
        highlight && 'border-primary border-2',
        className
      )}
    >
      {header && (
        <>
          <div className="mb-3">{header}</div>
          {visibleFields.length > 0 && <Separator className="mb-3" />}
        </>
      )}

      <div className="space-y-3">
        {visibleFields.map((field, index) => (
          <div key={index}>
            {index > 0 && !field.fullWidth && <Separator className="my-2" />}
            <div
              className={cn(
                'flex gap-3',
                field.fullWidth ? 'flex-col' : 'items-start justify-between'
              )}
            >
              <span className={cn(
                'font-medium text-muted-foreground',
                field.fullWidth ? 'text-xs mb-1' : 'text-xs min-w-[100px] shrink-0'
              )}>
                {field.label}
              </span>
              <span className={cn(
                'break-words',
                field.fullWidth ? 'text-sm' : 'text-sm text-right flex-1',
                field.className
              )}>
                {field.value}
              </span>
            </div>
          </div>
        ))}
      </div>

      {actions && (
        <>
          <Separator className="my-3" />
          <div className="flex flex-wrap gap-2">
            {actions}
          </div>
        </>
      )}
    </Card>
  )
}

interface MobileTableGridProps {
  children: React.ReactNode
  className?: string
}

export function MobileTableGrid({ children, className }: MobileTableGridProps) {
  return (
    <div className={cn('md:hidden grid grid-cols-1 gap-3', className)}>
      {children}
    </div>
  )
}
