import { useEffect, useRef, useCallback } from 'react'
import { useKV } from '@github/spark/hooks'
import { useGitHubSync } from './use-github-sync'

export interface AutoSaveConfig {
  debounceMs?: number
  enableGitHubSync?: boolean
  gitHubConfig?: {
    owner: string
    repo: string
    branch?: string
    token?: string
    autoSyncInterval?: number
  }
}

export function useAutoSave<T>(
  key: string,
  defaultValue: T,
  config: AutoSaveConfig = {}
) {
  const [value, setValue, deleteValue] = useKV<T>(key, defaultValue)
  const { recordChange } = useGitHubSync({
    owner: config.gitHubConfig?.owner || '',
    repo: config.gitHubConfig?.repo || '',
    branch: config.gitHubConfig?.branch || 'Primary', // Default Spark repository branch
    token: config.gitHubConfig?.token,
    autoSyncInterval: config.gitHubConfig?.autoSyncInterval || 300000,
    enabled: config.enableGitHubSync || false
  })

  const debounceMs = config.debounceMs || 1000
  const timeoutRef = useRef<NodeJS.Timeout | null>(null)
  const previousValueRef = useRef<T>(value)

  const setValueWithAutoSave = useCallback(
    (newValue: T | ((prev: T) => T)) => {
      setValue((currentValue) => {
        const prevValue = currentValue ?? defaultValue
        const resolvedValue = typeof newValue === 'function'
          ? (newValue as (prev: T) => T)(prevValue)
          : newValue

        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current)
        }

        timeoutRef.current = setTimeout(() => {
          if (config.enableGitHubSync && JSON.stringify(resolvedValue) !== JSON.stringify(previousValueRef.current)) {
            const action = !previousValueRef.current ? 'create' : 'update'
            recordChange(key, action, resolvedValue)
            previousValueRef.current = resolvedValue
          }
        }, debounceMs)

        return resolvedValue
      })
    },
    [setValue, key, recordChange, config.enableGitHubSync, debounceMs, defaultValue]
  )

  const deleteValueWithAutoSave = useCallback(() => {
    if (config.enableGitHubSync) {
      recordChange(key, 'delete')
    }
    deleteValue()
  }, [deleteValue, key, recordChange, config.enableGitHubSync])

  useEffect(() => {
    previousValueRef.current = value
  }, [value])

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }
  }, [])

  return [value, setValueWithAutoSave, deleteValueWithAutoSave] as const
}
