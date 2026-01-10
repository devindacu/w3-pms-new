import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Sparkle } from '@phosphor-icons/react'

interface PreloadIndicatorProps {
  isActive: boolean
  moduleName?: string
}

export function PreloadIndicator({ isActive, moduleName }: PreloadIndicatorProps) {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    if (isActive) {
      setVisible(true)
      const timer = setTimeout(() => setVisible(false), 2000)
      return () => clearTimeout(timer)
    }
  }, [isActive])

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className="fixed bottom-6 right-6 z-50"
        >
          <div className="flex items-center gap-3 px-4 py-3 bg-primary/10 border border-primary/20 rounded-xl shadow-lg backdrop-blur-sm">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
            >
              <Sparkle size={20} className="text-primary" weight="fill" />
            </motion.div>
            <div className="flex flex-col">
              <span className="text-sm font-semibold text-foreground">
                Smart Preloading
              </span>
              {moduleName && (
                <span className="text-xs text-muted-foreground">
                  Preparing {moduleName}
                </span>
              )}
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
