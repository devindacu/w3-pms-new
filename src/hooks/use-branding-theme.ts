import { useEffect } from 'react'
import type { HotelBranding } from '@/lib/types'

function hexToOklch(hex: string): string {
  const r = parseInt(hex.slice(1, 3), 16) / 255
  const g = parseInt(hex.slice(3, 5), 16) / 255
  const b = parseInt(hex.slice(5, 7), 16) / 255

  const max = Math.max(r, g, b)
  const min = Math.min(r, g, b)
  const l = (max + min) / 2

  let h = 0
  let s = 0

  if (max !== min) {
    const d = max - min
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min)

    switch (max) {
      case r:
        h = ((g - b) / d + (g < b ? 6 : 0)) / 6
        break
      case g:
        h = ((b - r) / d + 2) / 6
        break
      case b:
        h = ((r - g) / d + 4) / 6
        break
    }
  }

  const lightness = l
  const chroma = s * Math.min(l, 1 - l) * 2
  const hue = h * 360

  return `${lightness.toFixed(3)} ${chroma.toFixed(3)} ${hue.toFixed(1)}`
}

export function useBrandingTheme(branding: HotelBranding | null) {
  useEffect(() => {
    if (!branding?.colorScheme) return

    const root = document.documentElement
    const { primary, secondary, accent } = branding.colorScheme

    try {
      const primaryOklch = hexToOklch(primary)
      const secondaryOklch = hexToOklch(secondary)
      const accentOklch = hexToOklch(accent)

      root.style.setProperty('--primary', `oklch(${primaryOklch})`)
      root.style.setProperty('--secondary', `oklch(${secondaryOklch})`)
      root.style.setProperty('--accent', `oklch(${accentOklch})`)
      
      root.style.setProperty('--sidebar-primary', `oklch(${primaryOklch})`)
      root.style.setProperty('--ring', `oklch(${primaryOklch})`)
      root.style.setProperty('--sidebar-ring', `oklch(${primaryOklch})`)
      
      root.style.setProperty('--chart-1', `oklch(${primaryOklch})`)
      root.style.setProperty('--chart-2', `oklch(${secondaryOklch})`)
      root.style.setProperty('--chart-4', `oklch(${accentOklch})`)
    } catch (error) {
      console.error('Error applying branding colors:', error)
    }

    return () => {
      root.style.removeProperty('--primary')
      root.style.removeProperty('--secondary')
      root.style.removeProperty('--accent')
      root.style.removeProperty('--sidebar-primary')
      root.style.removeProperty('--ring')
      root.style.removeProperty('--sidebar-ring')
      root.style.removeProperty('--chart-1')
      root.style.removeProperty('--chart-2')
      root.style.removeProperty('--chart-4')
    }
  }, [branding?.colorScheme])
}
