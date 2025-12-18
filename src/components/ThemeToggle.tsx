import { useState, useEffect, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Moon, Sun } from '@phosphor-icons/react'
import { useTheme } from '@/hooks/use-theme'
import { motion, AnimatePresence } from 'framer-motion'

export function ThemeToggle() {
  const [isDark, setIsDark] = useState(false)
  const [isAnimating, setIsAnimating] = useState(false)
  const { applyDarkMode, loadSavedTheme } = useTheme()
  const buttonRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    const savedDarkMode = localStorage.getItem('theme-dark-mode')
    if (savedDarkMode !== null) {
      const darkMode = savedDarkMode === 'true'
      setIsDark(darkMode)
    } else {
      const hasDarkClass = document.documentElement.classList.contains('dark')
      setIsDark(hasDarkClass)
      if (!hasDarkClass) {
        localStorage.setItem('theme-dark-mode', 'false')
      }
    }
  }, [])

  const createTransitionOverlay = () => {
    if (!buttonRef.current) return

    const overlay = document.createElement('div')
    overlay.className = 'theme-transition-overlay'
    
    const rect = buttonRef.current.getBoundingClientRect()
    overlay.style.top = `${rect.top + rect.height / 2}px`
    overlay.style.left = `${rect.left + rect.width / 2}px`
    
    document.body.appendChild(overlay)
    
    setTimeout(() => {
      overlay.remove()
    }, 800)
  }

  const toggleDarkMode = () => {
    if (isAnimating) return
    
    setIsAnimating(true)
    createTransitionOverlay()
    
    setTimeout(() => {
      const newDarkMode = !isDark
      setIsDark(newDarkMode)
      applyDarkMode(newDarkMode, true)
      localStorage.setItem('theme-dark-mode', String(newDarkMode))
      
      setTimeout(() => {
        loadSavedTheme()
        setIsAnimating(false)
      }, 100)
    }, 100)
  }

  return (
    <Button
      ref={buttonRef}
      variant="ghost"
      size="icon"
      onClick={toggleDarkMode}
      disabled={isAnimating}
      className="relative w-10 h-10 rounded-xl bg-muted/50 hover:bg-muted border border-border/50 overflow-hidden"
      title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
    >
      <AnimatePresence mode="wait" initial={false}>
        {isDark ? (
          <motion.div
            key="sun"
            initial={{ y: -20, opacity: 0, rotate: -90 }}
            animate={{ y: 0, opacity: 1, rotate: 0 }}
            exit={{ y: 20, opacity: 0, rotate: 90 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
          >
            <Sun size={20} className="text-amber-400" weight="fill" />
          </motion.div>
        ) : (
          <motion.div
            key="moon"
            initial={{ y: -20, opacity: 0, rotate: 90 }}
            animate={{ y: 0, opacity: 1, rotate: 0 }}
            exit={{ y: 20, opacity: 0, rotate: -90 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
          >
            <Moon size={20} className="text-primary" weight="fill" />
          </motion.div>
        )}
      </AnimatePresence>
    </Button>
  )
}
