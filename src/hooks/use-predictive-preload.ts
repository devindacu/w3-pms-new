import { useEffect, useCallback, useRef } from 'react'
import { useKV } from '@github/spark/hooks'

type Module = 
  | 'dashboard'
  | 'quick-ops'
  | 'front-office'
  | 'housekeeping'
  | 'fnb'
  | 'inventory'
  | 'procurement'
  | 'finance'
  | 'hr'
  | 'analytics'
  | 'construction'
  | 'suppliers'
  | 'user-management'
  | 'kitchen'
  | 'forecasting'
  | 'crm'
  | 'channel-manager'
  | 'room-revenue'
  | 'extra-services'
  | 'invoice-center'
  | 'revenue-comparison'
  | 'settings'

export interface NavigationPattern {
  from: Module
  to: Module
  count: number
  lastVisited: number
}

interface ModuleVisit {
  module: Module
  timestamp: number
  duration?: number
}

interface NavigationHistory {
  patterns: NavigationPattern[]
  recentVisits: ModuleVisit[]
  moduleFrequency: Record<Module, number>
  timeOfDayPatterns: Record<string, Module[]>
}

const MAX_PATTERNS = 100
const MAX_RECENT_VISITS = 50
const PATTERN_THRESHOLD = 2
const TIME_BUCKET_HOURS = 2

export function usePredictivePreload(
  currentModule: Module,
  preloadModule: (module: string) => Promise<any>
) {
  const [navigationHistory, setNavigationHistory] = useKV<NavigationHistory>(
    'w3-navigation-history',
    {
      patterns: [],
      recentVisits: [],
      moduleFrequency: {} as Record<Module, number>,
      timeOfDayPatterns: {}
    }
  )

  const lastModuleRef = useRef<Module | null>(null)
  const moduleStartTimeRef = useRef<number>(Date.now())
  const predictionTimeoutRef = useRef<number | undefined>(undefined)

  const getTimeOfDayBucket = useCallback(() => {
    const hour = new Date().getHours()
    const bucket = Math.floor(hour / TIME_BUCKET_HOURS)
    return `bucket-${bucket}`
  }, [])

  const recordNavigation = useCallback(
    (fromModule: Module, toModule: Module) => {
      setNavigationHistory((current) => {
        const history = current || {
          patterns: [],
          recentVisits: [],
          moduleFrequency: {} as Record<Module, number>,
          timeOfDayPatterns: {}
        }

        const existingPatternIndex = history.patterns.findIndex(
          (p) => p.from === fromModule && p.to === toModule
        )

        let updatedPatterns = [...history.patterns]
        if (existingPatternIndex >= 0) {
          updatedPatterns[existingPatternIndex] = {
            ...updatedPatterns[existingPatternIndex],
            count: updatedPatterns[existingPatternIndex].count + 1,
            lastVisited: Date.now()
          }
        } else {
          updatedPatterns.push({
            from: fromModule,
            to: toModule,
            count: 1,
            lastVisited: Date.now()
          })
        }

        updatedPatterns = updatedPatterns
          .sort((a, b) => b.count - a.count)
          .slice(0, MAX_PATTERNS)

        const updatedFrequency = { ...history.moduleFrequency }
        updatedFrequency[toModule] = (updatedFrequency[toModule] || 0) + 1

        const timeBucket = getTimeOfDayBucket()
        const updatedTimePatterns = { ...history.timeOfDayPatterns }
        const currentBucketModules = updatedTimePatterns[timeBucket] || []
        if (!currentBucketModules.includes(toModule)) {
          updatedTimePatterns[timeBucket] = [...currentBucketModules, toModule].slice(0, 5)
        }

        const duration = Date.now() - moduleStartTimeRef.current
        const lastVisit = history.recentVisits[history.recentVisits.length - 1]
        const updatedRecentVisits = [...history.recentVisits]
        
        if (lastVisit && lastVisit.module === fromModule && !lastVisit.duration) {
          updatedRecentVisits[updatedRecentVisits.length - 1] = {
            ...lastVisit,
            duration
          }
        }

        updatedRecentVisits.push({
          module: toModule,
          timestamp: Date.now()
        })

        return {
          patterns: updatedPatterns,
          recentVisits: updatedRecentVisits.slice(-MAX_RECENT_VISITS),
          moduleFrequency: updatedFrequency,
          timeOfDayPatterns: updatedTimePatterns
        }
      })

      moduleStartTimeRef.current = Date.now()
    },
    [setNavigationHistory, getTimeOfDayBucket]
  )

  const getPredictedModules = useCallback(
    (fromModule: Module): Module[] => {
      if (!navigationHistory) return []

      const predictions: Map<Module, number> = new Map()

      navigationHistory.patterns
        .filter((p) => p.from === fromModule && p.count >= PATTERN_THRESHOLD)
        .forEach((pattern) => {
          const score = pattern.count * 10
          const recencyBonus = Math.max(0, 5 - (Date.now() - pattern.lastVisited) / (1000 * 60 * 60 * 24))
          predictions.set(pattern.to, (predictions.get(pattern.to) || 0) + score + recencyBonus)
        })

      const recentSequences = navigationHistory.recentVisits.slice(-10)
      for (let i = 0; i < recentSequences.length - 1; i++) {
        if (recentSequences[i].module === fromModule) {
          const nextModule = recentSequences[i + 1].module
          predictions.set(nextModule, (predictions.get(nextModule) || 0) + 5)
        }
      }

      const timeBucket = getTimeOfDayBucket()
      const timeBasedModules = navigationHistory.timeOfDayPatterns[timeBucket] || []
      timeBasedModules.forEach((module) => {
        if (module !== fromModule) {
          predictions.set(module, (predictions.get(module) || 0) + 3)
        }
      })

      Object.entries(navigationHistory.moduleFrequency)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 5)
        .forEach(([module, frequency]) => {
          if (module !== fromModule) {
            predictions.set(module as Module, (predictions.get(module as Module) || 0) + frequency * 0.5)
          }
        })

      return Array.from(predictions.entries())
        .sort((a, b) => b[1] - a[1])
        .map(([module]) => module)
        .slice(0, 3)
    },
    [navigationHistory, getTimeOfDayBucket]
  )

  const preloadPredictedModules = useCallback(
    (fromModule: Module) => {
      const predicted = getPredictedModules(fromModule)
      
      if (predicted.length === 0) return

      predicted.forEach((module, index) => {
        if (module !== 'dashboard' && module !== 'quick-ops') {
          setTimeout(() => {
            preloadModule(module)
          }, index * 200)
        }
      })
    },
    [getPredictedModules, preloadModule]
  )

  useEffect(() => {
    if (lastModuleRef.current && lastModuleRef.current !== currentModule) {
      recordNavigation(lastModuleRef.current, currentModule)
    }
    lastModuleRef.current = currentModule

    if (predictionTimeoutRef.current) {
      clearTimeout(predictionTimeoutRef.current)
    }

    predictionTimeoutRef.current = window.setTimeout(() => {
      preloadPredictedModules(currentModule)
    }, 500)

    return () => {
      if (predictionTimeoutRef.current) {
        clearTimeout(predictionTimeoutRef.current)
      }
    }
  }, [currentModule, recordNavigation, preloadPredictedModules])

  const getNavigationInsights = useCallback(() => {
    if (!navigationHistory) {
      return {
        mostVisited: [],
        commonPatterns: [],
        timeBasedPreferences: {}
      }
    }

    const mostVisited = Object.entries(navigationHistory.moduleFrequency)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5)
      .map(([module, count]) => ({ module: module as Module, count }))

    const commonPatterns = navigationHistory.patterns
      .filter((p) => p.count >= PATTERN_THRESHOLD)
      .sort((a, b) => b.count - a.count)
      .slice(0, 10)

    return {
      mostVisited,
      commonPatterns,
      timeBasedPreferences: navigationHistory.timeOfDayPatterns
    }
  }, [navigationHistory])

  const clearNavigationHistory = useCallback(() => {
    setNavigationHistory({
      patterns: [],
      recentVisits: [],
      moduleFrequency: {} as Record<Module, number>,
      timeOfDayPatterns: {}
    })
  }, [setNavigationHistory])

  return {
    getPredictedModules,
    getNavigationInsights,
    clearNavigationHistory,
    navigationHistory
  }
}
