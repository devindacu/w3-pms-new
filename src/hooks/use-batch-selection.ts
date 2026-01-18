import { useState, useCallback } from 'react'

export interface UseBatchSelectionReturn {
  selectedIds: string[]
  isSelected: (id: string) => boolean
  toggleSelection: (id: string) => void
  toggleAll: (allIds: string[]) => void
  clearSelection: () => void
  selectAll: (allIds: string[]) => void
  isAllSelected: (allIds: string[]) => boolean
  isSomeSelected: (allIds: string[]) => boolean
}

export function useBatchSelection(): UseBatchSelectionReturn {
  const [selectedIds, setSelectedIds] = useState<string[]>([])

  const isSelected = useCallback(
    (id: string) => selectedIds.includes(id),
    [selectedIds]
  )

  const toggleSelection = useCallback((id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    )
  }, [])

  const toggleAll = useCallback((allIds: string[]) => {
    setSelectedIds((prev) => {
      if (prev.length === allIds.length) {
        return []
      }
      return allIds
    })
  }, [])

  const clearSelection = useCallback(() => {
    setSelectedIds([])
  }, [])

  const selectAll = useCallback((allIds: string[]) => {
    setSelectedIds(allIds)
  }, [])

  const isAllSelected = useCallback(
    (allIds: string[]) => allIds.length > 0 && selectedIds.length === allIds.length,
    [selectedIds]
  )

  const isSomeSelected = useCallback(
    (allIds: string[]) => selectedIds.length > 0 && selectedIds.length < allIds.length,
    [selectedIds]
  )

  return {
    selectedIds,
    isSelected,
    toggleSelection,
    toggleAll,
    clearSelection,
    selectAll,
    isAllSelected,
    isSomeSelected,
  }
}
