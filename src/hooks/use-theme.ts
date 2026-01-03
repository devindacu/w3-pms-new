import React, { useEffect } from 'react'

export interface ThemeColors {
  primary: string
  secondary: string
  accent: string
}

export type ColorMood = 'indigo' | 'violet' | 'emerald' | 'rose' | 'amber' | 'cyan' | 'slate' | 'crimson'

export const colorMoods: Record<ColorMood, ThemeColors> = {
  indigo: {
    primary: 'oklch(0.55 0.24 265)',
    secondary: 'oklch(0.50 0.20 280)',
    accent: 'oklch(0.62 0.20 180)',
  },
  violet: {
    primary: 'oklch(0.60 0.28 300)',
    secondary: 'oklch(0.55 0.24 290)',
    accent: 'oklch(0.68 0.22 320)',
  },
  emerald: {
    primary: 'oklch(0.55 0.22 160)',
    secondary: 'oklch(0.50 0.20 150)',
    accent: 'oklch(0.62 0.24 180)',
  },
  rose: {
    primary: 'oklch(0.60 0.24 10)',
    secondary: 'oklch(0.55 0.22 350)',
    accent: 'oklch(0.68 0.20 30)',
  },
  amber: {
    primary: 'oklch(0.70 0.22 70)',
    secondary: 'oklch(0.65 0.20 60)',
    accent: 'oklch(0.62 0.24 45)',
  },
  cyan: {
    primary: 'oklch(0.60 0.22 200)',
    secondary: 'oklch(0.55 0.20 210)',
    accent: 'oklch(0.65 0.24 180)',
  },
  slate: {
    primary: 'oklch(0.50 0.05 260)',
    secondary: 'oklch(0.45 0.04 260)',
    accent: 'oklch(0.60 0.20 200)',
  },
  crimson: {
    primary: 'oklch(0.55 0.26 20)',
    secondary: 'oklch(0.50 0.24 10)',
    accent: 'oklch(0.65 0.22 35)',
  },
}

const applyTheme = (colors: ThemeColors) => {
  const root = document.documentElement
  
  root.style.setProperty('--primary', colors.primary)
  root.style.setProperty('--secondary', colors.secondary)
  root.style.setProperty('--accent', colors.accent)
  
  const primaryGlow = colors.primary.replace(')', ' / 0.25)')
  root.style.setProperty('--primary-glow', primaryGlow)
  
  const primaryHover = colors.primary.replace(/(\d+\.?\d*)\)$/, (match, num) => {
    const newNum = Math.max(0.4, parseFloat(num) - 0.05)
    return `${newNum})`
  })
  root.style.setProperty('--primary-hover', primaryHover)
  
  root.style.setProperty('--ring', colors.primary)
  root.style.setProperty('--sidebar-primary', colors.primary)
  root.style.setProperty('--sidebar-ring', colors.primary)
  
  root.style.setProperty('--chart-1', colors.primary)
  root.style.setProperty('--chart-2', colors.accent)
  root.style.setProperty('--chart-3', colors.secondary)
  root.style.setProperty('--chart-4', 'oklch(0.72 0.20 70)')
  root.style.setProperty('--chart-5', 'oklch(0.55 0.24 25)')
}

const applyDarkMode = (isDark: boolean, animated: boolean = true) => {
  const root = document.documentElement
  const body = document.body
  
  if (!animated) {
    body.style.transition = 'none'
    root.style.transition = 'none'
  }
  
  if (isDark) {
    root.classList.add('dark')
    body.classList.add('dark')
  } else {
    root.classList.remove('dark')
    body.classList.remove('dark')
  }
  
  if (!animated) {
    requestAnimationFrame(() => {
      body.style.transition = ''
      root.style.transition = ''
    })
  }
}

const applyColorMood = (mood: ColorMood) => {
  const colors = colorMoods[mood]
  applyTheme(colors)
  localStorage.setItem('theme-color-mood', mood)
  localStorage.removeItem('theme-custom-colors')
}

const applyCustomColors = (colors: ThemeColors) => {
  applyTheme(colors)
  localStorage.setItem('theme-custom-colors', JSON.stringify(colors))
  localStorage.removeItem('theme-color-mood')
}

const loadSavedTheme = () => {
  const savedCustomColors = localStorage.getItem('theme-custom-colors')
  if (savedCustomColors) {
    try {
      const colors = JSON.parse(savedCustomColors) as ThemeColors
      applyTheme(colors)
      return true
    } catch {
      localStorage.removeItem('theme-custom-colors')
    }
  }
  
  const savedMood = localStorage.getItem('theme-color-mood') as ColorMood | null
  if (savedMood && colorMoods[savedMood]) {
    applyTheme(colorMoods[savedMood])
    return true
  }
  
  return false
}

export function useTheme() {
  useEffect(() => {
    loadSavedTheme()

    const savedDarkMode = localStorage.getItem('theme-dark-mode')
    if (savedDarkMode !== null) {
      const isDark = savedDarkMode === 'true'
      applyDarkMode(isDark, false)
    } else {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
      applyDarkMode(prefersDark, false)
      localStorage.setItem('theme-dark-mode', String(prefersDark))
    }
  }, [])

  return { applyTheme, applyDarkMode, applyColorMood, applyCustomColors, loadSavedTheme }
}
