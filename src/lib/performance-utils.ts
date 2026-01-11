import { useEffect, useRef, useState, useMemo } from 'react'

export const ITEMS_PER_PAGE = 50
export const ITEMS_PER_PAGE_OPTIONS = [25, 50, 100, 200]

export interface PaginationState {
  currentPage: number
  itemsPerPage: number
  totalItems: number
  totalPages: number
}

export interface PaginationResult<T> {
  paginatedData: T[]
  pagination: PaginationState
  goToPage: (page: number) => void
  setItemsPerPage: (items: number) => void
  nextPage: () => void
  prevPage: () => void
}

export function usePagination<T>(
  data: T[],
  initialItemsPerPage: number = ITEMS_PER_PAGE
): PaginationResult<T> {
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPageState] = useState(initialItemsPerPage)

  const totalItems = data.length
  const totalPages = Math.ceil(totalItems / itemsPerPage) || 1

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages)
    }
  }, [currentPage, totalPages])

  const paginatedData = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage
    const endIndex = startIndex + itemsPerPage
    return data.slice(startIndex, endIndex)
  }, [data, currentPage, itemsPerPage])

  const goToPage = (page: number) => {
    const validPage = Math.max(1, Math.min(page, totalPages))
    setCurrentPage(validPage)
  }

  const setItemsPerPage = (items: number) => {
    setItemsPerPageState(items)
    setCurrentPage(1)
  }

  const nextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1)
    }
  }

  const prevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1)
    }
  }

  return {
    paginatedData,
    pagination: {
      currentPage,
      itemsPerPage,
      totalItems,
      totalPages,
    },
    goToPage,
    setItemsPerPage,
    nextPage,
    prevPage,
  }
}

export interface CacheEntry<T> {
  data: T
  timestamp: number
  expiresAt: number
}

export class ClientCache {
  private cache: Map<string, CacheEntry<any>> = new Map()
  private defaultTTL: number = 5 * 60 * 1000

  set<T>(key: string, data: T, ttl?: number): void {
    const timestamp = Date.now()
    const expiresAt = timestamp + (ttl || this.defaultTTL)
    this.cache.set(key, { data, timestamp, expiresAt })
  }

  get<T>(key: string): T | null {
    const entry = this.cache.get(key)
    if (!entry) return null

    if (Date.now() > entry.expiresAt) {
      this.cache.delete(key)
      return null
    }

    return entry.data as T
  }

  has(key: string): boolean {
    const entry = this.cache.get(key)
    if (!entry) return false

    if (Date.now() > entry.expiresAt) {
      this.cache.delete(key)
      return false
    }

    return true
  }

  delete(key: string): void {
    this.cache.delete(key)
  }

  clear(): void {
    this.cache.clear()
  }

  invalidatePattern(pattern: RegExp): void {
    const keysToDelete: string[] = []
    for (const key of this.cache.keys()) {
      if (pattern.test(key)) {
        keysToDelete.push(key)
      }
    }
    keysToDelete.forEach(key => this.cache.delete(key))
  }

  getStats(): { size: number; keys: string[] } {
    this.cleanup()
    return {
      size: this.cache.size,
      keys: Array.from(this.cache.keys()),
    }
  }

  private cleanup(): void {
    const now = Date.now()
    const keysToDelete: string[] = []
    for (const [key, entry] of this.cache.entries()) {
      if (now > entry.expiresAt) {
        keysToDelete.push(key)
      }
    }
    keysToDelete.forEach(key => this.cache.delete(key))
  }
}

export const globalCache = new ClientCache()

export function useClientCache<T>(
  key: string,
  fetchFn: () => T | Promise<T>,
  deps: any[] = [],
  ttl?: number
): { data: T | null; loading: boolean; refresh: () => void } {
  const [data, setData] = useState<T | null>(globalCache.get<T>(key))
  const [loading, setLoading] = useState(!globalCache.has(key))
  const fetchRef = useRef(fetchFn)

  fetchRef.current = fetchFn

  const refresh = async () => {
    setLoading(true)
    try {
      const result = await Promise.resolve(fetchRef.current())
      globalCache.set(key, result, ttl)
      setData(result)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (!globalCache.has(key)) {
      refresh()
    }
  }, [key, ...deps])

  return { data, loading, refresh }
}

export function useDebounce<T>(value: T, delay: number = 300): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value)

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedValue(value)
    }, delay)

    return () => {
      clearTimeout(timer)
    }
  }, [value, delay])

  return debouncedValue
}

export function useVirtualScroll<T>(
  items: T[],
  itemHeight: number,
  containerHeight: number
) {
  const [scrollTop, setScrollTop] = useState(0)

  const visibleStart = Math.floor(scrollTop / itemHeight)
  const visibleEnd = Math.ceil((scrollTop + containerHeight) / itemHeight)

  const visibleItems = items.slice(
    Math.max(0, visibleStart - 5),
    Math.min(items.length, visibleEnd + 5)
  )

  const totalHeight = items.length * itemHeight
  const offsetY = Math.max(0, visibleStart - 5) * itemHeight

  return {
    visibleItems,
    totalHeight,
    offsetY,
    onScroll: (e: React.UIEvent<HTMLElement>) => {
      setScrollTop(e.currentTarget.scrollTop)
    },
  }
}

export function batchArray<T>(array: T[], batchSize: number): T[][] {
  const batches: T[][] = []
  for (let i = 0; i < array.length; i += batchSize) {
    batches.push(array.slice(i, i + batchSize))
  }
  return batches
}

export async function processBatch<T, R>(
  items: T[],
  processor: (item: T) => Promise<R>,
  batchSize: number = 10
): Promise<R[]> {
  const results: R[] = []
  const batches = batchArray(items, batchSize)

  for (const batch of batches) {
    const batchResults = await Promise.all(batch.map(processor))
    results.push(...batchResults)
  }

  return results
}

export function memoizeFunction<T extends (...args: any[]) => any>(
  fn: T,
  keyGenerator?: (...args: Parameters<T>) => string
): T {
  const cache = new Map<string, ReturnType<T>>()

  return ((...args: Parameters<T>) => {
    const key = keyGenerator
      ? keyGenerator(...args)
      : JSON.stringify(args)

    if (cache.has(key)) {
      return cache.get(key)
    }

    const result = fn(...args)
    cache.set(key, result)
    return result
  }) as T
}

export function throttle<T extends (...args: any[]) => any>(
  fn: T,
  delay: number
): (...args: Parameters<T>) => void {
  let lastCall = 0
  return (...args: Parameters<T>) => {
    const now = Date.now()
    if (now - lastCall >= delay) {
      lastCall = now
      fn(...args)
    }
  }
}

export function measurePerformance<T>(
  fn: () => T,
  label: string = 'Operation'
): T {
  const start = performance.now()
  const result = fn()
  const end = performance.now()
  console.log(`[Performance] ${label}: ${(end - start).toFixed(2)}ms`)
  return result
}

export async function measureAsyncPerformance<T>(
  fn: () => Promise<T>,
  label: string = 'Async Operation'
): Promise<T> {
  const start = performance.now()
  const result = await fn()
  const end = performance.now()
  console.log(`[Performance] ${label}: ${(end - start).toFixed(2)}ms`)
  return result
}
