import { useEffect, useRef } from 'react'

export type SyncMessage = {
  type: 'kv-update' | 'kv-delete' | 'user-activity' | 'notification'
  key?: string
  value?: any
  timestamp: number
  tabId: string
  userId?: string
}

const TAB_ID = `tab-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`

export function useBroadcastSync(onMessage?: (message: SyncMessage) => void) {
  const channelRef = useRef<BroadcastChannel | null>(null)

  useEffect(() => {
    if (typeof BroadcastChannel === 'undefined') {
      console.warn('BroadcastChannel not supported in this browser')
      return
    }

    const channel = new BroadcastChannel('w3-hotel-sync')
    channelRef.current = channel

    const handleMessage = (event: MessageEvent<SyncMessage>) => {
      if (event.data.tabId === TAB_ID) return
      
      onMessage?.(event.data)
    }

    channel.addEventListener('message', handleMessage)

    channel.postMessage({
      type: 'user-activity',
      timestamp: Date.now(),
      tabId: TAB_ID,
    } as SyncMessage)

    return () => {
      channel.removeEventListener('message', handleMessage)
      channel.close()
    }
  }, [onMessage])

  const broadcast = (message: Omit<SyncMessage, 'tabId' | 'timestamp'>) => {
    if (!channelRef.current) return

    const fullMessage: SyncMessage = {
      ...message,
      tabId: TAB_ID,
      timestamp: Date.now(),
    }

    channelRef.current.postMessage(fullMessage)
  }

  return { broadcast, tabId: TAB_ID }
}
