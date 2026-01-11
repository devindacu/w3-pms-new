import { useState } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { Calendar } from '@/components/ui/calendar'
import { Separator } from '@/components/ui/separator'
import {
  CalendarBlank,
  FunnelSimple,
  X,
  CaretDown,
  CheckCircle
} from '@phosphor-icons/react'
import { format, subDays, startOfMonth, endOfMonth, startOfYear, endOfYear } from 'date-fns'
import type { DateRange } from 'react-day-picker'

export type DashboardFilterCategory = 
  | 'all'
  | 'rooms'
  | 'revenue'
  | 'housekeeping'
  | 'fnb'
  | 'inventory'
  | 'guests'
  | 'operations'
  | 'hr'
  | 'finance'

export interface DashboardFilters {
  dateRange: {
    from: Date
    to: Date
  }
  category: DashboardFilterCategory
  compareWith?: {
    from: Date
    to: Date
  }
}

interface DashboardFiltersProps {
  filters: DashboardFilters
  onFiltersChange: (filters: DashboardFilters) => void
  onReset: () => void
}

const categoryOptions: { value: DashboardFilterCategory; label: string; color: string }[] = [
  { value: 'all', label: 'All Categories', color: 'bg-primary' },
  { value: 'rooms', label: 'Rooms & Occupancy', color: 'bg-primary' },
  { value: 'revenue', label: 'Revenue & Finance', color: 'bg-success' },
  { value: 'housekeeping', label: 'Housekeeping', color: 'bg-accent' },
  { value: 'fnb', label: 'Food & Beverage', color: 'bg-secondary' },
  { value: 'inventory', label: 'Inventory & Stock', color: 'bg-chart-3' },
  { value: 'guests', label: 'Guest Relations', color: 'bg-chart-4' },
  { value: 'operations', label: 'Operations', color: 'bg-chart-5' },
  { value: 'hr', label: 'Human Resources', color: 'bg-destructive' },
  { value: 'finance', label: 'Finance & Accounting', color: 'bg-success' },
]

const datePresets = [
  { label: 'Today', getValue: () => ({ from: new Date(), to: new Date() }) },
  { label: 'Yesterday', getValue: () => ({ from: subDays(new Date(), 1), to: subDays(new Date(), 1) }) },
  { label: 'Last 7 Days', getValue: () => ({ from: subDays(new Date(), 6), to: new Date() }) },
  { label: 'Last 30 Days', getValue: () => ({ from: subDays(new Date(), 29), to: new Date() }) },
  { label: 'This Month', getValue: () => ({ from: startOfMonth(new Date()), to: endOfMonth(new Date()) }) },
  { label: 'Last Month', getValue: () => ({ 
    from: startOfMonth(subDays(startOfMonth(new Date()), 1)), 
    to: endOfMonth(subDays(startOfMonth(new Date()), 1)) 
  }) },
  { label: 'This Year', getValue: () => ({ from: startOfYear(new Date()), to: endOfYear(new Date()) }) },
  { label: 'Last Year', getValue: () => ({ 
    from: startOfYear(subDays(startOfYear(new Date()), 1)), 
    to: endOfYear(subDays(startOfYear(new Date()), 1)) 
  }) },
]

export function DashboardFilters({ filters, onFiltersChange, onReset }: DashboardFiltersProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [dateRangeOpen, setDateRangeOpen] = useState(false)
  const [compareRangeOpen, setCompareRangeOpen] = useState(false)
  const [enableComparison, setEnableComparison] = useState(!!filters.compareWith)

  const handleCategoryChange = (category: DashboardFilterCategory) => {
    onFiltersChange({ ...filters, category })
  }

  const handleDateRangeChange = (range: DateRange | undefined) => {
    if (range?.from && range?.to) {
      onFiltersChange({
        ...filters,
        dateRange: { from: range.from, to: range.to }
      })
      setDateRangeOpen(false)
    }
  }

  const handleCompareRangeChange = (range: DateRange | undefined) => {
    if (range?.from && range?.to) {
      onFiltersChange({
        ...filters,
        compareWith: { from: range.from, to: range.to }
      })
      setCompareRangeOpen(false)
    }
  }

  const handlePresetSelect = (preset: typeof datePresets[0]) => {
    const range = preset.getValue()
    onFiltersChange({
      ...filters,
      dateRange: range
    })
    setDateRangeOpen(false)
  }

  const handleToggleComparison = () => {
    const newValue = !enableComparison
    setEnableComparison(newValue)
    if (!newValue) {
      const { compareWith, ...rest } = filters
      onFiltersChange(rest)
    } else {
      const compareRange = {
        from: subDays(filters.dateRange.from, 30),
        to: subDays(filters.dateRange.to, 30)
      }
      onFiltersChange({ ...filters, compareWith: compareRange })
    }
  }

  const handleReset = () => {
    setEnableComparison(false)
    onReset()
  }

  const activeFiltersCount = () => {
    let count = 0
    if (filters.category !== 'all') count++
    if (filters.compareWith) count++
    return count
  }

  const selectedCategory = categoryOptions.find(c => c.value === filters.category)

  return (
    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          <Button variant="outline" className="gap-2 relative">
            <FunnelSimple size={18} />
            Filters
            {activeFiltersCount() > 0 && (
              <Badge className="ml-2 h-5 w-5 rounded-full p-0 flex items-center justify-center bg-primary text-primary-foreground text-xs">
                {activeFiltersCount()}
              </Badge>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-96 p-0" align="start">
          <div className="p-4 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-base">Dashboard Filters</h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleReset}
                className="h-8 text-xs"
              >
                Reset All
              </Button>
            </div>

            <Separator />

            <div className="space-y-2">
              <Label className="text-sm font-medium">Category</Label>
              <Select
                value={filters.category}
                onValueChange={(value) => handleCategoryChange(value as DashboardFilterCategory)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {categoryOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      <div className="flex items-center gap-2">
                        <div className={`w-2 h-2 rounded-full ${option.color}`} />
                        {option.label}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <Separator />

            <div className="space-y-3">
              <Label className="text-sm font-medium">Date Range</Label>
              <div className="grid grid-cols-2 gap-2">
                {datePresets.slice(0, 4).map((preset) => (
                  <Button
                    key={preset.label}
                    variant="outline"
                    size="sm"
                    className="text-xs"
                    onClick={() => handlePresetSelect(preset)}
                  >
                    {preset.label}
                  </Button>
                ))}
              </div>
              <div className="grid grid-cols-2 gap-2">
                {datePresets.slice(4).map((preset) => (
                  <Button
                    key={preset.label}
                    variant="outline"
                    size="sm"
                    className="text-xs"
                    onClick={() => handlePresetSelect(preset)}
                  >
                    {preset.label}
                  </Button>
                ))}
              </div>
            </div>

            <Separator />

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label className="text-sm font-medium">Period Comparison</Label>
                <Button
                  variant={enableComparison ? "default" : "outline"}
                  size="sm"
                  onClick={handleToggleComparison}
                  className="h-7 text-xs"
                >
                  {enableComparison ? (
                    <>
                      <CheckCircle size={14} className="mr-1" />
                      Enabled
                    </>
                  ) : (
                    'Enable'
                  )}
                </Button>
              </div>
              {enableComparison && filters.compareWith && (
                <div className="p-3 bg-muted/50 rounded-lg text-xs space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Compare with:</span>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-6 text-xs"
                      onClick={() => setCompareRangeOpen(true)}
                    >
                      Change
                    </Button>
                  </div>
                  <p className="font-medium">
                    {format(filters.compareWith.from, 'MMM dd, yyyy')} - {format(filters.compareWith.to, 'MMM dd, yyyy')}
                  </p>
                </div>
              )}
            </div>
          </div>
        </PopoverContent>
      </Popover>

      <Popover open={dateRangeOpen} onOpenChange={setDateRangeOpen}>
        <PopoverTrigger asChild>
          <Button variant="outline" className="gap-2">
            <CalendarBlank size={18} />
            <span className="hidden sm:inline">
              {format(filters.dateRange.from, 'MMM dd')} - {format(filters.dateRange.to, 'MMM dd, yyyy')}
            </span>
            <span className="sm:hidden">
              {format(filters.dateRange.from, 'MM/dd')} - {format(filters.dateRange.to, 'MM/dd/yy')}
            </span>
            <CaretDown size={14} />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            mode="range"
            selected={{
              from: filters.dateRange.from,
              to: filters.dateRange.to
            }}
            onSelect={handleDateRangeChange}
            numberOfMonths={2}
            defaultMonth={filters.dateRange.from}
          />
        </PopoverContent>
      </Popover>

      {enableComparison && filters.compareWith && (
        <Popover open={compareRangeOpen} onOpenChange={setCompareRangeOpen}>
          <PopoverTrigger asChild>
            <Button variant="outline" className="gap-2 border-dashed">
              <CalendarBlank size={18} className="text-muted-foreground" />
              <span className="hidden sm:inline text-muted-foreground">
                vs {format(filters.compareWith.from, 'MMM dd')} - {format(filters.compareWith.to, 'MMM dd, yyyy')}
              </span>
              <span className="sm:hidden text-muted-foreground">
                vs {format(filters.compareWith.from, 'MM/dd')} - {format(filters.compareWith.to, 'MM/dd/yy')}
              </span>
              <CaretDown size={14} />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              mode="range"
              selected={{
                from: filters.compareWith.from,
                to: filters.compareWith.to
              }}
              onSelect={handleCompareRangeChange}
              numberOfMonths={2}
              defaultMonth={filters.compareWith.from}
            />
          </PopoverContent>
        </Popover>
      )}

      {activeFiltersCount() > 0 && (
        <div className="flex items-center gap-2 flex-wrap">
          {filters.category !== 'all' && (
            <Badge variant="secondary" className="gap-1 pr-1">
              {selectedCategory?.label}
              <Button
                variant="ghost"
                size="sm"
                className="h-4 w-4 p-0 hover:bg-transparent"
                onClick={() => handleCategoryChange('all')}
              >
                <X size={12} />
              </Button>
            </Badge>
          )}
          {filters.compareWith && (
            <Badge variant="secondary" className="gap-1 pr-1">
              Comparison Enabled
              <Button
                variant="ghost"
                size="sm"
                className="h-4 w-4 p-0 hover:bg-transparent"
                onClick={handleToggleComparison}
              >
                <X size={12} />
              </Button>
            </Badge>
          )}
        </div>
      )}
    </div>
  )
}
