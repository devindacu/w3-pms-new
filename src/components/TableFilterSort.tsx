import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
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
import { Badge } from '@/components/ui/badge'
import { Calendar } from '@/components/ui/calendar'
import { Separator } from '@/components/ui/separator'
import {
  Funnel,
  SortAscending,
  SortDescending,
  X,
  CalendarBlank,
  CaretDown,
  CaretUp,
} from '@phosphor-icons/react'
import { type FilterConfig, type SortConfig } from '@/hooks/use-table-filter-sort'
import { format } from 'date-fns'

export interface FilterField {
  field: string
  label: string
  type?: 'text' | 'number' | 'date' | 'select' | 'boolean' | 'range' | 'dateRange'
  options?: { label: string; value: string | number | boolean }[]
  operators?: ('equals' | 'contains' | 'startsWith' | 'endsWith' | 'gt' | 'gte' | 'lt' | 'lte' | 'between')[]
}

export interface SortField {
  field: string
  label: string
}

interface TableFilterSortProps {
  filterFields?: FilterField[]
  sortFields?: SortField[]
  filters: FilterConfig[]
  sortConfig: SortConfig | null
  onAddFilter: (filter: FilterConfig) => void
  onRemoveFilter: (field: string) => void
  onClearFilters: () => void
  onSetSort: (field: string) => void
  resultCount?: number
  totalCount?: number
}

export function TableFilterSort({
  filterFields = [],
  sortFields = [],
  filters,
  sortConfig,
  onAddFilter,
  onRemoveFilter,
  onClearFilters,
  onSetSort,
  resultCount,
  totalCount,
}: TableFilterSortProps) {
  const [filterPopoverOpen, setFilterPopoverOpen] = useState(false)
  const [sortPopoverOpen, setSortPopoverOpen] = useState(false)
  const [selectedField, setSelectedField] = useState<FilterField | null>(null)
  const [filterValue, setFilterValue] = useState<any>('')
  const [filterOperator, setFilterOperator] = useState<string>('contains')
  const [dateValue, setDateValue] = useState<Date | undefined>()
  const [dateRangeStart, setDateRangeStart] = useState<Date | undefined>()
  const [dateRangeEnd, setDateRangeEnd] = useState<Date | undefined>()
  const [rangeMin, setRangeMin] = useState<string>('')
  const [rangeMax, setRangeMax] = useState<string>('')

  const handleAddFilter = () => {
    if (!selectedField) return

    let value: any = filterValue

    if (selectedField.type === 'date' && dateValue) {
      value = dateValue
    } else if (selectedField.type === 'dateRange' && dateRangeStart && dateRangeEnd) {
      value = [dateRangeStart, dateRangeEnd]
    } else if (selectedField.type === 'range' && rangeMin && rangeMax) {
      value = [Number(rangeMin), Number(rangeMax)]
    } else if (selectedField.type === 'number' && filterValue) {
      value = Number(filterValue)
    } else if (selectedField.type === 'boolean') {
      value = filterValue === 'true' || filterValue === true
    }

    if (value === '' || value === null || value === undefined) return

    onAddFilter({
      field: selectedField.field,
      value,
      type: selectedField.type || 'text',
      operator: filterOperator as any,
    })

    setFilterValue('')
    setDateValue(undefined)
    setDateRangeStart(undefined)
    setDateRangeEnd(undefined)
    setRangeMin('')
    setRangeMax('')
    setSelectedField(null)
    setFilterPopoverOpen(false)
  }

  const getFilterLabel = (filter: FilterConfig): string => {
    const field = filterFields.find((f) => f.field === filter.field)
    if (!field) return filter.field

    let valueLabel = ''

    if (filter.type === 'date' && filter.value instanceof Date) {
      valueLabel = format(filter.value, 'MMM dd, yyyy')
    } else if (filter.type === 'dateRange' && Array.isArray(filter.value)) {
      const [start, end] = filter.value
      valueLabel = `${format(new Date(start), 'MMM dd')} - ${format(new Date(end), 'MMM dd, yyyy')}`
    } else if (filter.type === 'range' && Array.isArray(filter.value)) {
      const [min, max] = filter.value
      valueLabel = `${min} - ${max}`
    } else if (filter.type === 'select' && field.options) {
      const option = field.options.find((o) => o.value === filter.value)
      valueLabel = option?.label || String(filter.value)
    } else {
      valueLabel = String(filter.value)
    }

    return `${field.label}: ${valueLabel}`
  }

  const getSortLabel = (): string => {
    if (!sortConfig) return 'Sort'
    const field = sortFields.find((f) => f.field === sortConfig.field)
    const direction = sortConfig.direction === 'asc' ? '↑' : '↓'
    return `${field?.label || sortConfig.field} ${direction}`
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap items-center gap-2">
        {filterFields.length > 0 && (
          <Popover open={filterPopoverOpen} onOpenChange={setFilterPopoverOpen}>
            <PopoverTrigger asChild>
              <Button variant="outline" size="sm" className="gap-2">
                <Funnel size={16} />
                Add Filter
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80 p-4" align="start">
              <div className="space-y-4">
                <div>
                  <Label className="text-xs font-medium mb-2 block">Field</Label>
                  <Select
                    value={selectedField?.field}
                    onValueChange={(value) => {
                      const field = filterFields.find((f) => f.field === value)
                      setSelectedField(field || null)
                      setFilterOperator(
                        field?.type === 'text'
                          ? 'contains'
                          : field?.type === 'number'
                          ? 'equals'
                          : 'equals'
                      )
                      setFilterValue('')
                      setDateValue(undefined)
                      setDateRangeStart(undefined)
                      setDateRangeEnd(undefined)
                      setRangeMin('')
                      setRangeMax('')
                    }}
                  >
                    <SelectTrigger className="h-9">
                      <SelectValue placeholder="Select field..." />
                    </SelectTrigger>
                    <SelectContent>
                      {filterFields.map((field) => (
                        <SelectItem key={field.field} value={field.field}>
                          {field.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {selectedField && (
                  <>
                    {(selectedField.type === 'text' || selectedField.type === 'number') && (
                      <>
                        {selectedField.operators && selectedField.operators.length > 1 && (
                          <div>
                            <Label className="text-xs font-medium mb-2 block">Operator</Label>
                            <Select value={filterOperator} onValueChange={setFilterOperator}>
                              <SelectTrigger className="h-9">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                {selectedField.operators.map((op) => (
                                  <SelectItem key={op} value={op}>
                                    {op === 'contains' && 'Contains'}
                                    {op === 'equals' && 'Equals'}
                                    {op === 'startsWith' && 'Starts with'}
                                    {op === 'endsWith' && 'Ends with'}
                                    {op === 'gt' && 'Greater than'}
                                    {op === 'gte' && 'Greater than or equal'}
                                    {op === 'lt' && 'Less than'}
                                    {op === 'lte' && 'Less than or equal'}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                        )}
                        <div>
                          <Label className="text-xs font-medium mb-2 block">Value</Label>
                          <Input
                            type={selectedField.type === 'number' ? 'number' : 'text'}
                            value={filterValue}
                            onChange={(e) => setFilterValue(e.target.value)}
                            placeholder={`Enter ${selectedField.label.toLowerCase()}...`}
                            className="h-9"
                          />
                        </div>
                      </>
                    )}

                    {selectedField.type === 'select' && (
                      <div>
                        <Label className="text-xs font-medium mb-2 block">Value</Label>
                        <Select value={String(filterValue)} onValueChange={setFilterValue}>
                          <SelectTrigger className="h-9">
                            <SelectValue placeholder="Select value..." />
                          </SelectTrigger>
                          <SelectContent>
                            {selectedField.options?.map((option) => (
                              <SelectItem key={String(option.value)} value={String(option.value)}>
                                {option.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    )}

                    {selectedField.type === 'boolean' && (
                      <div>
                        <Label className="text-xs font-medium mb-2 block">Value</Label>
                        <Select value={String(filterValue)} onValueChange={setFilterValue}>
                          <SelectTrigger className="h-9">
                            <SelectValue placeholder="Select value..." />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="true">Yes / True</SelectItem>
                            <SelectItem value="false">No / False</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    )}

                    {selectedField.type === 'date' && (
                      <div>
                        <Label className="text-xs font-medium mb-2 block">Date</Label>
                        <Popover>
                          <PopoverTrigger asChild>
                            <Button
                              variant="outline"
                              className="w-full justify-start text-left h-9 font-normal"
                            >
                              <CalendarBlank size={16} className="mr-2" />
                              {dateValue ? format(dateValue, 'PPP') : 'Pick a date'}
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0" align="start">
                            <Calendar mode="single" selected={dateValue} onSelect={setDateValue} />
                          </PopoverContent>
                        </Popover>
                      </div>
                    )}

                    {selectedField.type === 'dateRange' && (
                      <div className="space-y-3">
                        <div>
                          <Label className="text-xs font-medium mb-2 block">Start Date</Label>
                          <Popover>
                            <PopoverTrigger asChild>
                              <Button
                                variant="outline"
                                className="w-full justify-start text-left h-9 font-normal"
                              >
                                <CalendarBlank size={16} className="mr-2" />
                                {dateRangeStart ? format(dateRangeStart, 'PPP') : 'Pick start date'}
                              </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0" align="start">
                              <Calendar
                                mode="single"
                                selected={dateRangeStart}
                                onSelect={setDateRangeStart}
                              />
                            </PopoverContent>
                          </Popover>
                        </div>
                        <div>
                          <Label className="text-xs font-medium mb-2 block">End Date</Label>
                          <Popover>
                            <PopoverTrigger asChild>
                              <Button
                                variant="outline"
                                className="w-full justify-start text-left h-9 font-normal"
                              >
                                <CalendarBlank size={16} className="mr-2" />
                                {dateRangeEnd ? format(dateRangeEnd, 'PPP') : 'Pick end date'}
                              </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0" align="start">
                              <Calendar
                                mode="single"
                                selected={dateRangeEnd}
                                onSelect={setDateRangeEnd}
                              />
                            </PopoverContent>
                          </Popover>
                        </div>
                      </div>
                    )}

                    {selectedField.type === 'range' && (
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <Label className="text-xs font-medium mb-2 block">Min</Label>
                          <Input
                            type="number"
                            value={rangeMin}
                            onChange={(e) => setRangeMin(e.target.value)}
                            placeholder="Min"
                            className="h-9"
                          />
                        </div>
                        <div>
                          <Label className="text-xs font-medium mb-2 block">Max</Label>
                          <Input
                            type="number"
                            value={rangeMax}
                            onChange={(e) => setRangeMax(e.target.value)}
                            placeholder="Max"
                            className="h-9"
                          />
                        </div>
                      </div>
                    )}

                    <Button onClick={handleAddFilter} className="w-full" size="sm">
                      Apply Filter
                    </Button>
                  </>
                )}
              </div>
            </PopoverContent>
          </Popover>
        )}

        {sortFields.length > 0 && (
          <Popover open={sortPopoverOpen} onOpenChange={setSortPopoverOpen}>
            <PopoverTrigger asChild>
              <Button variant="outline" size="sm" className="gap-2">
                {sortConfig?.direction === 'asc' ? (
                  <SortAscending size={16} />
                ) : sortConfig?.direction === 'desc' ? (
                  <SortDescending size={16} />
                ) : (
                  <SortAscending size={16} />
                )}
                {getSortLabel()}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-64 p-2" align="start">
              <div className="space-y-1">
                {sortFields.map((field) => (
                  <Button
                    key={field.field}
                    variant={sortConfig?.field === field.field ? 'secondary' : 'ghost'}
                    className="w-full justify-between"
                    size="sm"
                    onClick={() => {
                      onSetSort(field.field)
                      setSortPopoverOpen(false)
                    }}
                  >
                    <span>{field.label}</span>
                    {sortConfig?.field === field.field && (
                      <>
                        {sortConfig.direction === 'asc' ? (
                          <CaretUp size={16} />
                        ) : (
                          <CaretDown size={16} />
                        )}
                      </>
                    )}
                  </Button>
                ))}
                {sortConfig && (
                  <>
                    <Separator className="my-1" />
                    <Button
                      variant="ghost"
                      className="w-full"
                      size="sm"
                      onClick={() => {
                        onSetSort(sortConfig.field)
                        setSortPopoverOpen(false)
                      }}
                    >
                      Clear Sort
                    </Button>
                  </>
                )}
              </div>
            </PopoverContent>
          </Popover>
        )}

        {filters.length > 0 && (
          <Button variant="ghost" size="sm" onClick={onClearFilters} className="gap-2">
            <X size={16} />
            Clear All
          </Button>
        )}

        {(resultCount !== undefined || totalCount !== undefined) && (
          <div className="ml-auto text-sm text-muted-foreground">
            {resultCount !== undefined && totalCount !== undefined
              ? `Showing ${resultCount} of ${totalCount} results`
              : resultCount !== undefined
              ? `${resultCount} results`
              : totalCount !== undefined
              ? `${totalCount} total`
              : null}
          </div>
        )}
      </div>

      {filters.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {filters.map((filter) => (
            <Badge key={filter.field} variant="secondary" className="gap-2 pr-1 pl-3 py-1.5">
              <span className="text-xs">{getFilterLabel(filter)}</span>
              <Button
                variant="ghost"
                size="icon"
                className="h-4 w-4 p-0 hover:bg-transparent"
                onClick={() => onRemoveFilter(filter.field)}
              >
                <X size={12} />
              </Button>
            </Badge>
          ))}
        </div>
      )}
    </div>
  )
}
