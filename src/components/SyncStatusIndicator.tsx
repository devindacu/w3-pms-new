import { useState, useEffect } from 'react'
import { Badge } from '@/components/ui/badge'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { Cloud, CloudSlash, Users } from '@phosphor-icons/react'
import { useBroadcastSync, type SyncMessage } from '@/hooks/use-broadcast-sync'

export function SyncStatusIndicator() {
  const [activeTabsCount, setActiveTabsCount] = useState(1)
  const [lastSyncTime, setLastSyncTime] = useState<number>(Date.now())
  const [isSyncing, setIsSyncing] = useState(false)
  const [syncSupported, setSyncSupported] = useState(true)

  const handleSyncMessage = (message: SyncMessage) => {
    if (message.type === 'user-activity') {
      setLastSyncTime(Date.now())
      setIsSyncing(true)
      setTimeout(() => setIsSyncing(false), 500)
    } else if (message.type === 'kv-update' || message.type === 'kv-delete') {
      setLastSyncTime(Date.now())
      setIsSyncing(true)
      setTimeout(() => setIsSyncing(false), 300)
    }
  }

  const { broadcast, tabId } = useBroadcastSync(handleSyncMessage)

  useEffect(() => {
    if (typeof BroadcastChannel === 'undefined') {
      setSyncSupported(false)
      return
    }

    const heartbeatInterval = setInterval(() => {
      broadcast({
        type: 'user-activity',
      })
    }, 5000)

    return () => clearInterval(heartbeatInterval)
  }, [broadcast])

  useEffect(() => {
    if (!syncSupported) return

    const channel = new BroadcastChannel('w3-hotel-sync-heartbeat')
    const activeTabs = new Set<string>()
    activeTabs.add(tabId)

    const handleHeartbeat = (event: MessageEvent) => {
      if (event.data.type === 'heartbeat') {
        activeTabs.add(event.data.tabId)
        setActiveTabsCount(activeTabs.size)
      }
    }

    channel.addEventListener('message', handleHeartbeat)

    const heartbeatInterval = setInterval(() => {
      channel.postMessage({ type: 'heartbeat', tabId, timestamp: Date.now() })
      
      const now = Date.now()
      const staleThreshold = 15000
      for (const tab of activeTabs) {
        if (tab !== tabId) {
          activeTabs.delete(tab)
        }
      }
    }, 5000)

    return () => {
      clearInterval(heartbeatInterval)
      channel.removeEventListener('message', handleHeartbeat)
      channel.close()
    }
  }, [tabId, syncSupported])

  if (!syncSupported) {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Badge variant="outline" className="gap-1.5 cursor-help">
              <CloudSlash size={14} className="text-muted-foreground" />
              <span className="text-xs">Sync Unavailable</span>
            </Badge>
          </TooltipTrigger>
          <TooltipContent>
            <p>Real-time sync not supported in this browser</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    )
  }

  const timeSinceSync = Date.now() - lastSyncTime
  const isRecent = timeSinceSync < 30000

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Badge 
            variant={isSyncing ? "default" : "outline"} 
            className={`gap-1.5 cursor-help transition-all ${isSyncing ? 'animate-pulse' : ''}`}
          >
            <Cloud 
              size={14} 
              className={isSyncing ? 'text-primary-foreground' : isRecent ? 'text-success' : 'text-muted-foreground'} 
              weight={isSyncing ? 'fill' : 'regular'}
            />
            <span className="text-xs">
              {isSyncing ? 'Syncing...' : 'Synced'}
            </span>
            {activeTabsCount > 1 && (
              <div className="flex items-center gap-1 ml-1 pl-1 border-l">
                <Users size={12} />
                <span className="text-xs font-medium">{activeTabsCount}</span>
              </div>
            )}
          </Badge>
        </TooltipTrigger>
        <TooltipContent>
          <div className="space-y-1">
            <p className="font-semibold">Real-time Sync Active</p>
            <p className="text-xs text-muted-foreground">
              {activeTabsCount === 1 
                ? 'Data syncs across all browser tabs' 
                : `${activeTabsCount} active tabs syncing`}
            </p>
            {isRecent && (
              <p className="text-xs text-success">
                Last sync: {timeSinceSync < 1000 ? 'Just now' : `${Math.floor(timeSinceSync / 1000)}s ago`}
              </p>
            )}
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}
