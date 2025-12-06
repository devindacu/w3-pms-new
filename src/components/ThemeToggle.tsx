import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Moon, Sun } from '@phosphor-icons/react'
import { useTheme } from '@/hooks/use-theme'

export function ThemeToggle() {
  const [isDark, setIsDark] = useState(false)
  const { applyDarkMode } = useTheme()

  useEffect(() => {
    const savedDarkMode = localStorage.getItem('theme-dark-mode')
    if (savedDarkMode !== null) {
      const darkMode = savedDarkMode === 'true'
      setIsDark(darkMode)
    }
  }, [])

  const toggleDarkMode = () => {
    const newDarkMode = !isDark
    setIsDark(newDarkMode)
    applyDarkMode(newDarkMode)
    localStorage.setItem('theme-dark-mode', String(newDarkMode))
  }

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={toggleDarkMode}
      className="shine-effect relative"
      title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
    >
      {isDark ? (
        <Sun size={20} className="text-primary" weight="duotone" />
      ) : (
        <Moon size={20} className="text-primary" weight="duotone" />
      )}
    </Button>
  )
}
