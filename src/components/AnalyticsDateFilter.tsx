import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Calendar } from '@/components/ui/calendar'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { CalendarBlank, X } from '@phosphor-icons/react'
import { format } from 'date-fns'
import { cn } from '@/lib/utils'

export type DateRange = {
  from: Date
  to: Date
}

export type DatePreset = 'today' | 'yesterday' | 'last7days' | 'last30days' | 'thisMonth' | 'lastMonth' | 'thisQuarter' | 'lastQuarter' | 'thisYear' | 'lastYear' | 'custom'

interface AnalyticsDateFilterProps {
  dateRange: DateRange
  onDateRangeChange: (range: DateRange) => void
  onReset?: () => void
  className?: string
}

export function AnalyticsDateFilter({ dateRange, onDateRangeChange, onReset, className }: AnalyticsDateFilterProps) {
  const [preset, setPreset] = useState<DatePreset>('last30days')
  const [isCustomRange, setIsCustomRange] = useState(false)

  const getPresetDateRange = (presetType: DatePreset): DateRange => {
    const now = new Date()
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    
    switch (presetType) {
      case 'today':
        return {
          from: today,
          to: today
        }
      case 'yesterday': {
        const yesterday = new Date(today)
        yesterday.setDate(yesterday.getDate() - 1)
        return {
          from: yesterday,
          to: yesterday
        }
      }
      case 'last7days': {
        const weekAgo = new Date(today)
        weekAgo.setDate(weekAgo.getDate() - 7)
        return {
          from: weekAgo,
          to: today
        }
      }
      case 'last30days': {
        const monthAgo = new Date(today)
        monthAgo.setDate(monthAgo.getDate() - 30)
        return {
          from: monthAgo,
          to: today
        }
      }
      case 'thisMonth':
        return {
          from: new Date(now.getFullYear(), now.getMonth(), 1),
          to: today
        }
      case 'lastMonth': {
        const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1)
        const lastDayOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0)
        return {
          from: lastMonth,
          to: lastDayOfLastMonth
        }
      }
      case 'thisQuarter': {
        const quarter = Math.floor(now.getMonth() / 3)
        const quarterStart = new Date(now.getFullYear(), quarter * 3, 1)
        return {
          from: quarterStart,
          to: today
        }
      }
      case 'lastQuarter': {
        const quarter = Math.floor(now.getMonth() / 3)
        const lastQuarterStart = new Date(now.getFullYear(), (quarter - 1) * 3, 1)
        const lastQuarterEnd = new Date(now.getFullYear(), quarter * 3, 0)
        return {
          from: lastQuarterStart,
          to: lastQuarterEnd
        }
      }
      case 'thisYear':
        return {
          from: new Date(now.getFullYear(), 0, 1),
          to: today
        }
      case 'lastYear':
        return {
          from: new Date(now.getFullYear() - 1, 0, 1),
          to: new Date(now.getFullYear() - 1, 11, 31)
        }
      default:
        return dateRange
    }
  }

  const handlePresetChange = (value: DatePreset) => {
    setPreset(value)
    if (value === 'custom') {
      setIsCustomRange(true)
    } else {
      setIsCustomRange(false)
      const newRange = getPresetDateRange(value)
      onDateRangeChange(newRange)
    }
  }

  const handleCustomDateSelect = (selectedRange: { from?: Date; to?: Date } | undefined) => {
    if (selectedRange?.from && selectedRange?.to) {
      onDateRangeChange({
        from: selectedRange.from,
        to: selectedRange.to
      })
    }
  }

  const handleReset = () => {
    setPreset('last30days')
    setIsCustomRange(false)
    const defaultRange = getPresetDateRange('last30days')
    onDateRangeChange(defaultRange)
    onReset?.()
  }

  return (
    <div className={cn("flex flex-col sm:flex-row gap-3 items-start sm:items-center", className)}>
      <div className="flex items-center gap-2 flex-wrap">
        <Select value={preset} onValueChange={handlePresetChange}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Select period" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="today">Today</SelectItem>
            <SelectItem value="yesterday">Yesterday</SelectItem>
            <SelectItem value="last7days">Last 7 Days</SelectItem>
            <SelectItem value="last30days">Last 30 Days</SelectItem>
            <SelectItem value="thisMonth">This Month</SelectItem>
            <SelectItem value="lastMonth">Last Month</SelectItem>
            <SelectItem value="thisQuarter">This Quarter</SelectItem>
            <SelectItem value="lastQuarter">Last Quarter</SelectItem>
            <SelectItem value="thisYear">This Year</SelectItem>
            <SelectItem value="lastYear">Last Year</SelectItem>
            <SelectItem value="custom">Custom Range</SelectItem>
          </SelectContent>
        </Select>

        {isCustomRange ? (
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" className="justify-start text-left font-normal">
                <CalendarBlank size={16} className="mr-2" />
                {dateRange?.from ? (
                  dateRange.to ? (
                    <>
                      {format(dateRange.from, "LLL dd, y")} - {format(dateRange.to, "LLL dd, y")}
                    </>
                  ) : (
                    format(dateRange.from, "LLL dd, y")
                  )
                ) : (
                  <span>Pick a date range</span>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                initialFocus
                mode="range"
                defaultMonth={dateRange?.from}
                selected={{ from: dateRange?.from, to: dateRange?.to }}
                onSelect={handleCustomDateSelect}
                numberOfMonths={2}
              />
            </PopoverContent>
          </Popover>
        ) : (
          <div className="px-3 py-2 bg-muted/50 rounded-md text-sm">
            {format(dateRange.from, "LLL dd, y")} - {format(dateRange.to, "LLL dd, y")}
          </div>
        )}
      </div>

      {onReset && (
        <Button variant="ghost" size="sm" onClick={handleReset}>
          <X size={16} className="mr-1" />
          Reset
        </Button>
      )}
    </div>
  )
}
