import { useOfflineStatus } from '@/hooks/use-offline'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { WifiSlash, ArrowsClockwise, X } from '@phosphor-icons/react'
import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

export function OfflineModeBanner() {
  const { isOnline, queueStatus, syncPending } = useOfflineStatus()
  const [dismissed, setDismissed] = useState(false)

  const shouldShow = !isOnline || queueStatus.pending > 0

  if (!shouldShow || dismissed) {
    return null
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        className="fixed top-16 left-0 right-0 z-40 px-4 md:px-6 lg:px-8 pointer-events-none"
      >
        <div className="mx-auto max-w-4xl pointer-events-auto">
          <Alert
            className={`border-2 shadow-lg ${
              !isOnline
                ? 'bg-destructive/10 border-destructive/50'
                : 'bg-warning/10 border-warning/50'
            }`}
          >
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-3 flex-1">
                <WifiSlash
                  size={24}
                  weight="bold"
                  className={!isOnline ? 'text-destructive' : 'text-warning'}
                />
                <AlertDescription className="flex-1">
                  {!isOnline ? (
                    <div>
                      <p className="font-semibold">Working Offline</p>
                      <p className="text-sm text-muted-foreground">
                        Your changes are being saved locally and will sync when
                        you're back online.
                      </p>
                    </div>
                  ) : (
                    <div>
                      <p className="font-semibold">
                        {queueStatus.pending} operation(s) pending
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Click sync to update your changes to the server.
                      </p>
                    </div>
                  )}
                </AlertDescription>
              </div>
              <div className="flex items-center gap-2">
                {isOnline && queueStatus.pending > 0 && (
                  <Button onClick={syncPending} size="sm" variant="default">
                    <ArrowsClockwise size={16} className="mr-2" weight="bold" />
                    Sync Now
                  </Button>
                )}
                <Button
                  onClick={() => setDismissed(true)}
                  size="icon"
                  variant="ghost"
                  className="h-8 w-8 rounded-lg"
                >
                  <X size={16} />
                </Button>
              </div>
            </div>
          </Alert>
        </div>
      </motion.div>
    </AnimatePresence>
  )
}
