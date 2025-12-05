import { useState, useEffect } from 'react'
import { useKV } from '@github/spark/hooks'

export type ViewMode = 'table' | 'cards'

interface UseTableViewOptions {
  storageKey?: string
  defaultView?: ViewMode
  mobileBreakpoint?: number
}

export function useTableView({
  storageKey = 'table-view-preference',
  defaultView = 'table',
  mobileBreakpoint = 768,
}: UseTableViewOptions = {}) {
  const [viewMode, setViewMode] = useKV<ViewMode>(storageKey, defaultView)
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < mobileBreakpoint)
    }

    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [mobileBreakpoint])

  const effectiveView = isMobile ? 'cards' : viewMode

  return {
    viewMode: effectiveView,
    setViewMode,
    isMobile,
    isTableView: effectiveView === 'table',
    isCardsView: effectiveView === 'cards',
  }
}
