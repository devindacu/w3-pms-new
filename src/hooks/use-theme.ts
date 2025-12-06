import { useEffect } from 'react'

export interface ThemeColors {
  primary: string
  secondary: string
  accent: string
}

export type ColorMood = 'blue' | 'purple' | 'green' | 'orange' | 'rose' | 'cyan'

export const colorMoods: Record<ColorMood, ThemeColors> = {
  blue: {
    primary: 'oklch(0.48 0.18 265)',
    secondary: 'oklch(0.72 0.14 195)',
    accent: 'oklch(0.62 0.20 30)',
  },
  purple: {
    primary: 'oklch(0.52 0.22 300)',
    secondary: 'oklch(0.68 0.16 280)',
    accent: 'oklch(0.65 0.24 320)',
  },
  green: {
    primary: 'oklch(0.50 0.16 150)',
    secondary: 'oklch(0.70 0.14 130)',
    accent: 'oklch(0.62 0.20 90)',
  },
  orange: {
    primary: 'oklch(0.58 0.20 40)',
    secondary: 'oklch(0.72 0.16 60)',
    accent: 'oklch(0.65 0.22 25)',
  },
  rose: {
    primary: 'oklch(0.55 0.20 10)',
    secondary: 'oklch(0.70 0.16 350)',
    accent: 'oklch(0.60 0.22 340)',
  },
  cyan: {
    primary: 'oklch(0.55 0.18 200)',
    secondary: 'oklch(0.72 0.14 220)',
    accent: 'oklch(0.62 0.20 180)',
  },
}

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

const applyDarkMode = (isDark: boolean, animated: boolean = true) => {
  const root = document.documentElement
  
  if (animated) {
    root.style.setProperty('view-transition-name', 'theme-transition')
  }
  
  if (isDark) {
    root.classList.add('dark')
  } else {
    root.classList.remove('dark')
  }
  
  if (animated) {
    setTimeout(() => {
      root.style.removeProperty('view-transition-name')
    }, 500)
  }
}

const applyColorMood = (mood: ColorMood) => {
  const colors = colorMoods[mood]
  applyTheme(colors)
  localStorage.setItem('theme-color-mood', mood)
  localStorage.setItem('theme-colors', JSON.stringify(colors))
}

export function useTheme() {
  useEffect(() => {
    const savedMood = localStorage.getItem('theme-color-mood') as ColorMood | null
    if (savedMood && colorMoods[savedMood]) {
      applyTheme(colorMoods[savedMood])
    } else {
      const savedTheme = localStorage.getItem('theme-colors')
      if (savedTheme) {
        try {
          const colors: ThemeColors = JSON.parse(savedTheme)
          applyTheme(colors)
        } catch (error) {
          console.error('Failed to load saved theme:', error)
        }
      }
    }

    const savedDarkMode = localStorage.getItem('theme-dark-mode')
    if (savedDarkMode !== null) {
      const isDark = savedDarkMode === 'true'
      applyDarkMode(isDark, false)
    }
  }, [])

  return { applyTheme, applyDarkMode, applyColorMood }
}
