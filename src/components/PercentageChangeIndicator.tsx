import { TrendUp, TrendDown, Minus } from '@phosphor-icons/react'
import { cn } from '@/lib/utils'
import { calculatePercentageChange, formatPercentageChange } from '@/lib/helpers'

interface PercentageChangeIndicatorProps {
  current: number
  previous: number
  showValue?: boolean
  size?: 'sm' | 'md' | 'lg'
  className?: string
  invertColors?: boolean
}

export function PercentageChangeIndicator({
  current,
  previous,
  showValue = true,
  size = 'md',
  className,
  invertColors = false
}: PercentageChangeIndicatorProps) {
  const change = calculatePercentageChange(current, previous)
  const formattedChange = formatPercentageChange(current, previous)
  
  const isPositive = change > 0
  const isNegative = change < 0
  const isNeutral = change === 0
  
  const colorClass = invertColors
    ? isPositive 
      ? 'text-destructive' 
      : isNegative 
      ? 'text-success' 
      : 'text-muted-foreground'
    : isPositive 
      ? 'text-success' 
      : isNegative 
      ? 'text-destructive' 
      : 'text-muted-foreground'
  
  const sizeClasses = {
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-base'
  }
  
  const iconSizes = {
    sm: 12,
    md: 16,
    lg: 20
  }
  
  return (
    <div className={cn('flex items-center gap-1 font-medium', colorClass, sizeClasses[size], className)}>
      {isPositive && <TrendUp size={iconSizes[size]} weight="bold" />}
      {isNegative && <TrendDown size={iconSizes[size]} weight="bold" />}
      {isNeutral && <Minus size={iconSizes[size]} weight="bold" />}
      {showValue && <span>{formattedChange}</span>}
    </div>
  )
}

interface PercentageChangeBadgeProps {
  current: number
  previous: number
  label?: string
  invertColors?: boolean
}

export function PercentageChangeBadge({
  current,
  previous,
  label,
  invertColors = false
}: PercentageChangeBadgeProps) {
  const change = calculatePercentageChange(current, previous)
  const formattedChange = formatPercentageChange(current, previous)
  
  const isPositive = change > 0
  const isNegative = change < 0
  
  const bgClass = invertColors
    ? isPositive 
      ? 'bg-destructive/10 text-destructive' 
      : isNegative 
      ? 'bg-success/10 text-success' 
      : 'bg-muted text-muted-foreground'
    : isPositive 
      ? 'bg-success/10 text-success' 
      : isNegative 
      ? 'bg-destructive/10 text-destructive' 
      : 'bg-muted text-muted-foreground'
  
  return (
    <div className={cn('inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold', bgClass)}>
      {isPositive && <TrendUp size={14} weight="bold" />}
      {isNegative && <TrendDown size={14} weight="bold" />}
      {change === 0 && <Minus size={14} weight="bold" />}
      <span>{formattedChange}</span>
      {label && <span className="opacity-80">{label}</span>}
    </div>
  )
}
