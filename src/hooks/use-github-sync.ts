import { useState, useEffect, useCallback, useRef } from 'react'
import { useKV } from '@github/spark/hooks'

export interface GitHubSyncConfig {
  owner: string
  repo: string
  branch: string
  token?: string
  autoSyncInterval?: number
  enabled?: boolean
}

export interface SyncStatus {
  status: 'idle' | 'syncing' | 'success' | 'error'
  lastSyncTime?: number
  lastCommitSha?: string
  error?: string
  pendingChanges: number
}

export interface ChangeRecord {
  id: string
  timestamp: number
  key: string
  action: 'create' | 'update' | 'delete'
  value?: any
  synced: boolean
}

export function useGitHubSync(config: GitHubSyncConfig) {
  const [syncStatus, setSyncStatus] = useState<SyncStatus>({
    status: 'idle',
    pendingChanges: 0
  })
  
  const [changeLog, setChangeLog] = useKV<ChangeRecord[]>('github-sync-changelog', [])
  const [syncConfig, setSyncConfig] = useKV<GitHubSyncConfig>('github-sync-config', config)
  const [lastSyncSha, setLastSyncSha] = useKV<string>('github-sync-last-sha', '')
  
  const syncIntervalRef = useRef<NodeJS.Timeout | null>(null)
  const changeQueueRef = useRef<Map<string, ChangeRecord>>(new Map())

  const recordChange = useCallback((key: string, action: 'create' | 'update' | 'delete', value?: any) => {
    const change: ChangeRecord = {
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      timestamp: Date.now(),
      key,
      action,
      value,
      synced: false
    }
    
    changeQueueRef.current.set(key, change)
    
    setChangeLog((currentLog) => {
      const filtered = (currentLog || []).filter(c => c.key !== key || c.synced)
      return [...filtered, change]
    })
    
    setSyncStatus(prev => ({
      ...prev,
      pendingChanges: changeQueueRef.current.size
    }))
  }, [setChangeLog])

  const createGitHubCommit = useCallback(async (changes: ChangeRecord[]): Promise<{ success: boolean; sha?: string; error?: string }> => {
    if (!syncConfig?.token || !syncConfig.owner || !syncConfig.repo) {
      return { success: false, error: 'GitHub configuration incomplete' }
    }

    try {
      const user = await window.spark.user()
      
      if (!user) {
        return { success: false, error: 'User not authenticated' }
      }
      
      const changesData = changes.map(c => ({
        key: c.key,
        action: c.action,
        value: c.value,
        timestamp: c.timestamp
      }))

      const commitMessage = `Auto-sync: ${changes.length} change(s) by ${user.login}\n\n${
        changes.map(c => `- ${c.action.toUpperCase()} ${c.key}`).join('\n')
      }`

      const dataBlob = {
        syncTimestamp: Date.now(),
        user: user.login,
        changes: changesData,
        metadata: {
          appVersion: '1.0.0',
          source: 'W3 Hotel PMS'
        }
      }

      const response = await fetch(`https://api.github.com/repos/${syncConfig.owner}/${syncConfig.repo}/contents/sync-data/${Date.now()}.json`, {
        method: 'PUT',
        headers: {
          'Authorization': `token ${syncConfig.token}`,
          'Content-Type': 'application/json',
          'Accept': 'application/vnd.github.v3+json'
        },
        body: JSON.stringify({
          message: commitMessage,
          content: btoa(JSON.stringify(dataBlob, null, 2)),
          branch: syncConfig.branch || 'primary'
        })
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || 'GitHub API error')
      }

      const result = await response.json()
      return { success: true, sha: result.commit.sha }
    } catch (error) {
      console.error('GitHub sync error:', error)
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      }
    }
  }, [syncConfig])

  const syncChanges = useCallback(async () => {
    const pendingChanges = Array.from(changeQueueRef.current.values())
    
    if (pendingChanges.length === 0) {
      return { success: true, message: 'No changes to sync' }
    }

    setSyncStatus(prev => ({ ...prev, status: 'syncing' }))

    const result = await createGitHubCommit(pendingChanges)

    if (result.success) {
      setChangeLog((currentLog) => 
        (currentLog || []).map(c => 
          pendingChanges.find(pc => pc.id === c.id) 
            ? { ...c, synced: true } 
            : c
        )
      )
      
      pendingChanges.forEach(c => changeQueueRef.current.delete(c.key))
      
      if (result.sha) {
        setLastSyncSha(result.sha)
      }
      
      setSyncStatus({
        status: 'success',
        lastSyncTime: Date.now(),
        lastCommitSha: result.sha,
        pendingChanges: 0
      })

      return { success: true, sha: result.sha }
    } else {
      setSyncStatus(prev => ({
        ...prev,
        status: 'error',
        error: result.error
      }))

      return { success: false, error: result.error }
    }
  }, [createGitHubCommit, setChangeLog, setLastSyncSha])

  const startAutoSync = useCallback(() => {
    if (syncIntervalRef.current) {
      clearInterval(syncIntervalRef.current)
    }

    const interval = syncConfig?.autoSyncInterval || 300000

    syncIntervalRef.current = setInterval(() => {
      if (changeQueueRef.current.size > 0) {
        syncChanges()
      }
    }, interval)
  }, [syncConfig, syncChanges])

  const stopAutoSync = useCallback(() => {
    if (syncIntervalRef.current) {
      clearInterval(syncIntervalRef.current)
      syncIntervalRef.current = null
    }
  }, [])

  useEffect(() => {
    if (syncConfig?.enabled && syncConfig.autoSyncInterval) {
      startAutoSync()
    }

    return () => {
      stopAutoSync()
    }
  }, [syncConfig, startAutoSync, stopAutoSync])

  const updateConfig = useCallback((newConfig: Partial<GitHubSyncConfig>) => {
    setSyncConfig((current) => {
      const merged = { ...(current || config), ...newConfig }
      return {
        owner: merged.owner || '',
        repo: merged.repo || '',
        branch: merged.branch || 'primary',
        token: merged.token,
        autoSyncInterval: merged.autoSyncInterval,
        enabled: merged.enabled
      }
    })
  }, [setSyncConfig, config])

  const clearSyncedHistory = useCallback(() => {
    setChangeLog((currentLog) => (currentLog || []).filter(c => !c.synced))
  }, [setChangeLog])

  const forceSyncNow = useCallback(async () => {
    return await syncChanges()
  }, [syncChanges])

  return {
    syncStatus,
    recordChange,
    syncChanges: forceSyncNow,
    updateConfig,
    clearSyncedHistory,
    changeLog: changeLog || [],
    config: syncConfig,
    startAutoSync,
    stopAutoSync
  }
}
