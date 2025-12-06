import { useEffect } from 'react'

export interface ThemeColors {
  primary: string
  secondary: string
  accent: string
}

export function useTheme() {
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme-colors')
    if (savedTheme) {
      try {
        const colors: ThemeColors = JSON.parse(savedTheme)
        applyTheme(colors)
      } catch (error) {
        console.error('Failed to load saved theme:', error)
      }
    }

    const savedDarkMode = localStorage.getItem('theme-dark-mode')
    if (savedDarkMode !== null) {
      const isDark = savedDarkMode === 'true'
      applyDarkMode(isDark)
    }
  }, [])

  const applyTheme = (colors: ThemeColors) => {
    const root = document.documentElement
    
    root.style.setProperty('--primary', colors.primary)
    root.style.setProperty('--secondary', colors.secondary)
    root.style.setProperty('--accent', colors.accent)
    
    const glowPrimary = colors.primary.replace(')', ' / 0.4)')
    const glowAccent = colors.accent.replace(')', ' / 0.3)')
    root.style.setProperty('--glow-primary', glowPrimary)
    root.style.setProperty('--glow-accent', glowAccent)
    
    root.style.setProperty('--ring', colors.primary)
    root.style.setProperty('--sidebar-primary', colors.primary)
    root.style.setProperty('--sidebar-ring', colors.primary)
  }

  const applyDarkMode = (isDark: boolean) => {
    const root = document.documentElement
    if (isDark) {
      root.classList.add('dark')
    } else {
      root.classList.remove('dark')
    }
  }

  return { applyTheme, applyDarkMode }
}
