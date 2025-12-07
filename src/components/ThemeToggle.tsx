import { useState, useEffect, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Moon, Sun } from '@phosphor-icons/react'
import { useTheme } from '@/hooks/use-theme'

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
    overlay.style.right = `${window.innerWidth - rect.right + rect.width / 2}px`
    
    document.body.appendChild(overlay)
    
    setTimeout(() => {
      overlay.remove()
    }, 1000)
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
      }, 150)
    }, 150)
  }

  return (
    <Button
      ref={buttonRef}
      variant="ghost"
      size="icon"
      onClick={toggleDarkMode}
      disabled={isAnimating}
      className="shine-effect relative group"
      title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
    >
      <div className="relative">
        {isDark ? (
          <Sun 
            size={20} 
            className="text-primary transition-all duration-500 group-hover:rotate-180 group-hover:scale-110" 
            weight="duotone" 
          />
        ) : (
          <Moon 
            size={20} 
            className="text-primary transition-all duration-500 group-hover:-rotate-12 group-hover:scale-110" 
            weight="duotone" 
          />
        )}
      </div>
    </Button>
  )
}
