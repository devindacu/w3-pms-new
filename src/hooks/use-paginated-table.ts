import { useState, useMemo, useCallback } from 'react'
import { usePagination } from '@/lib/performance-utils'

export interface UsePaginatedTableOptions<T> {
  initialItemsPerPage?: number
  searchFields?: (keyof T)[]
  enableSelection?: boolean
}

export interface UsePaginatedTableResult<T> {
  paginatedData: T[]
  pagination: {
    currentPage: number
    itemsPerPage: number
    totalItems: number
    totalPages: number
  }
  goToPage: (page: number) => void
  setItemsPerPage: (items: number) => void
  nextPage: () => void
  prevPage: () => void
  searchQuery: string
  setSearchQuery: (query: string) => void
  filteredData: T[]
  selectedIds: Set<string>
  toggleSelect: (id: string) => void
  toggleSelectAll: () => void
  clearSelection: () => void
  selectedItems: T[]
}

export function usePaginatedTable<T extends { id: string }>(
  data: T[],
  options: UsePaginatedTableOptions<T> = {}
): UsePaginatedTableResult<T> {
  const {
    initialItemsPerPage = 50,
    searchFields = [],
    enableSelection = true,
  } = options

  const [searchQuery, setSearchQuery] = useState('')
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())

  const filteredData = useMemo(() => {
    if (!searchQuery.trim()) return data

    const query = searchQuery.toLowerCase().trim()
    return data.filter((item) => {
      if (searchFields.length === 0) {
        return JSON.stringify(item).toLowerCase().includes(query)
      }

      return searchFields.some((field) => {
        const value = item[field]
        if (value == null) return false
        return String(value).toLowerCase().includes(query)
      })
    })
  }, [data, searchQuery, searchFields])

  const {
    paginatedData,
    pagination,
    goToPage,
    setItemsPerPage,
    nextPage,
    prevPage,
  } = usePagination(filteredData, initialItemsPerPage)

  const toggleSelect = useCallback((id: string) => {
    setSelectedIds((prev) => {
      const newSet = new Set(prev)
      if (newSet.has(id)) {
        newSet.delete(id)
      } else {
        newSet.add(id)
      }
      return newSet
    })
  }, [])

  const toggleSelectAll = useCallback(() => {
    setSelectedIds((prev) => {
      if (prev.size === paginatedData.length && paginatedData.length > 0) {
        return new Set()
      }
      return new Set(paginatedData.map((item) => item.id))
    })
  }, [paginatedData])

  const clearSelection = useCallback(() => {
    setSelectedIds(new Set())
  }, [])

  const selectedItems = useMemo(() => {
    return data.filter((item) => selectedIds.has(item.id))
  }, [data, selectedIds])

  return {
    paginatedData,
    pagination,
    goToPage,
    setItemsPerPage,
    nextPage,
    prevPage,
    searchQuery,
    setSearchQuery,
    filteredData,
    selectedIds,
    toggleSelect,
    toggleSelectAll,
    clearSelection,
    selectedItems,
  }
}
