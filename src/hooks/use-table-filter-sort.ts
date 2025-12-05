import { useState, useMemo } from 'react'

export type SortDirection = 'asc' | 'desc' | null
export type FilterValue = string | number | boolean | null | [number, number] | Date | [Date, Date]

export interface FilterConfig {
  field: string
  value: FilterValue
  type?: 'text' | 'number' | 'date' | 'select' | 'boolean' | 'range' | 'dateRange'
  operator?: 'equals' | 'contains' | 'startsWith' | 'endsWith' | 'gt' | 'gte' | 'lt' | 'lte' | 'between'
}

export interface SortConfig {
  field: string
  direction: SortDirection
}

export function useTableFilterSort<T extends Record<string, any>>(
  data: T[],
  defaultSort?: SortConfig
) {
  const [filters, setFilters] = useState<FilterConfig[]>([])
  const [sortConfig, setSortConfig] = useState<SortConfig | null>(defaultSort || null)

  const addFilter = (filter: FilterConfig) => {
    setFilters((current) => {
      const existing = current.findIndex((f) => f.field === filter.field)
      if (existing >= 0) {
        const updated = [...current]
        updated[existing] = filter
        return updated
      }
      return [...current, filter]
    })
  }

  const removeFilter = (field: string) => {
    setFilters((current) => current.filter((f) => f.field !== field))
  }

  const clearFilters = () => {
    setFilters([])
  }

  const setSort = (field: string, direction?: SortDirection) => {
    if (direction === null) {
      setSortConfig(null)
      return
    }

    if (sortConfig?.field === field) {
      if (sortConfig.direction === 'asc') {
        setSortConfig({ field, direction: 'desc' })
      } else if (sortConfig.direction === 'desc') {
        setSortConfig(null)
      } else {
        setSortConfig({ field, direction: 'asc' })
      }
    } else {
      setSortConfig({ field, direction: direction || 'asc' })
    }
  }

  const getNestedValue = (obj: any, path: string): any => {
    return path.split('.').reduce((acc, part) => acc?.[part], obj)
  }

  const applyFilter = (item: T, filter: FilterConfig): boolean => {
    const value = getNestedValue(item, filter.field)
    const filterValue = filter.value

    if (filterValue === null || filterValue === undefined || filterValue === '') {
      return true
    }

    const type = filter.type || 'text'
    const operator = filter.operator || 'contains'

    switch (type) {
      case 'text': {
        const itemStr = String(value || '').toLowerCase()
        const filterStr = String(filterValue).toLowerCase()

        switch (operator) {
          case 'equals':
            return itemStr === filterStr
          case 'contains':
            return itemStr.includes(filterStr)
          case 'startsWith':
            return itemStr.startsWith(filterStr)
          case 'endsWith':
            return itemStr.endsWith(filterStr)
          default:
            return itemStr.includes(filterStr)
        }
      }

      case 'number': {
        const itemNum = Number(value)
        const filterNum = Number(filterValue)

        if (isNaN(itemNum) || isNaN(filterNum)) return false

        switch (operator) {
          case 'equals':
            return itemNum === filterNum
          case 'gt':
            return itemNum > filterNum
          case 'gte':
            return itemNum >= filterNum
          case 'lt':
            return itemNum < filterNum
          case 'lte':
            return itemNum <= filterNum
          default:
            return itemNum === filterNum
        }
      }

      case 'range': {
        if (!Array.isArray(filterValue) || filterValue.length !== 2) return true
        const itemNum = Number(value)
        const [min, max] = filterValue as [number, number]
        if (isNaN(itemNum)) return false
        return itemNum >= min && itemNum <= max
      }

      case 'date': {
        const itemDate = new Date(value)
        const filterDate = new Date(filterValue as Date)
        
        if (isNaN(itemDate.getTime()) || isNaN(filterDate.getTime())) return false

        const itemDateOnly = new Date(itemDate.getFullYear(), itemDate.getMonth(), itemDate.getDate())
        const filterDateOnly = new Date(filterDate.getFullYear(), filterDate.getMonth(), filterDate.getDate())

        switch (operator) {
          case 'equals':
            return itemDateOnly.getTime() === filterDateOnly.getTime()
          case 'gt':
            return itemDateOnly.getTime() > filterDateOnly.getTime()
          case 'gte':
            return itemDateOnly.getTime() >= filterDateOnly.getTime()
          case 'lt':
            return itemDateOnly.getTime() < filterDateOnly.getTime()
          case 'lte':
            return itemDateOnly.getTime() <= filterDateOnly.getTime()
          default:
            return itemDateOnly.getTime() === filterDateOnly.getTime()
        }
      }

      case 'dateRange': {
        if (!Array.isArray(filterValue) || filterValue.length !== 2) return true
        const itemDate = new Date(value)
        const [startDate, endDate] = filterValue.map(d => new Date(d))
        
        if (isNaN(itemDate.getTime())) return false
        
        const itemDateOnly = new Date(itemDate.getFullYear(), itemDate.getMonth(), itemDate.getDate())
        const startDateOnly = new Date(startDate.getFullYear(), startDate.getMonth(), startDate.getDate())
        const endDateOnly = new Date(endDate.getFullYear(), endDate.getMonth(), endDate.getDate())

        return itemDateOnly.getTime() >= startDateOnly.getTime() && 
               itemDateOnly.getTime() <= endDateOnly.getTime()
      }

      case 'boolean': {
        return Boolean(value) === Boolean(filterValue)
      }

      case 'select': {
        if (Array.isArray(filterValue)) {
          return filterValue.includes(value)
        }
        return value === filterValue
      }

      default:
        return true
    }
  }

  const filteredData = useMemo(() => {
    if (filters.length === 0) return data

    return data.filter((item) => {
      return filters.every((filter) => applyFilter(item, filter))
    })
  }, [data, filters])

  const sortedData = useMemo(() => {
    if (!sortConfig || !sortConfig.direction) return filteredData

    const sorted = [...filteredData].sort((a, b) => {
      const aValue = getNestedValue(a, sortConfig.field)
      const bValue = getNestedValue(b, sortConfig.field)

      if (aValue === null || aValue === undefined) return 1
      if (bValue === null || bValue === undefined) return -1

      if (typeof aValue === 'string' && typeof bValue === 'string') {
        return sortConfig.direction === 'asc'
          ? aValue.localeCompare(bValue)
          : bValue.localeCompare(aValue)
      }

      if (typeof aValue === 'number' && typeof bValue === 'number') {
        return sortConfig.direction === 'asc' ? aValue - bValue : bValue - aValue
      }

      if (aValue instanceof Date && bValue instanceof Date) {
        return sortConfig.direction === 'asc'
          ? aValue.getTime() - bValue.getTime()
          : bValue.getTime() - aValue.getTime()
      }

      const aStr = String(aValue)
      const bStr = String(bValue)
      return sortConfig.direction === 'asc'
        ? aStr.localeCompare(bStr)
        : bStr.localeCompare(aStr)
    })

    return sorted
  }, [filteredData, sortConfig])

  return {
    filteredAndSortedData: sortedData,
    filters,
    sortConfig,
    addFilter,
    removeFilter,
    clearFilters,
    setSort,
    hasFilters: filters.length > 0,
    hasSorting: sortConfig !== null,
  }
}
