import { useState, useEffect } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import { toast } from 'sonner'
import { 
  Palette, 
  MagicWand, 
  ArrowClockwise,
  Check,
  Sparkle,
  Moon,
  Sun,
  PaintBrush
} from '@phosphor-icons/react'
import type { SystemUser } from '@/lib/types'
import { CustomColorPicker } from '@/components/CustomColorPicker'

interface ThemePreset {
  name: string
  description: string
  colors: {
    primary: string
    secondary: string
    accent: string
  }
  preview: string[]
}

const themePresets: ThemePreset[] = [
  {
    name: 'Vibrant Purple',
    description: 'Bold and energetic with purple tones',
    colors: {
      primary: 'oklch(0.75 0.22 280)',
      secondary: 'oklch(0.65 0.18 310)',
      accent: 'oklch(0.70 0.25 180)'
    },
    preview: ['280', '310', '180']
  },
  {
    name: 'Ocean Blue',
    description: 'Cool and professional blue palette',
    colors: {
      primary: 'oklch(0.60 0.20 240)',
      secondary: 'oklch(0.70 0.15 220)',
      accent: 'oklch(0.75 0.20 190)'
    },
    preview: ['240', '220', '190']
  },
  {
    name: 'Emerald Green',
    description: 'Fresh and natural green theme',
    colors: {
      primary: 'oklch(0.65 0.20 150)',
      secondary: 'oklch(0.70 0.18 165)',
      accent: 'oklch(0.75 0.22 140)'
    },
    preview: ['150', '165', '140']
  },
  {
    name: 'Sunset Orange',
    description: 'Warm and inviting orange tones',
    colors: {
      primary: 'oklch(0.70 0.22 40)',
      secondary: 'oklch(0.75 0.18 30)',
      accent: 'oklch(0.65 0.25 60)'
    },
    preview: ['40', '30', '60']
  },
  {
    name: 'Rose Pink',
    description: 'Elegant and sophisticated pink',
    colors: {
      primary: 'oklch(0.68 0.20 340)',
      secondary: 'oklch(0.72 0.18 350)',
      accent: 'oklch(0.75 0.22 320)'
    },
    preview: ['340', '350', '320']
  },
  {
    name: 'Midnight Blue',
    description: 'Deep and luxurious blue tones',
    colors: {
      primary: 'oklch(0.55 0.25 260)',
      secondary: 'oklch(0.60 0.20 250)',
      accent: 'oklch(0.70 0.22 200)'
    },
    preview: ['260', '250', '200']
  },
  {
    name: 'Crimson Red',
    description: 'Bold and passionate red theme',
    colors: {
      primary: 'oklch(0.60 0.25 20)',
      secondary: 'oklch(0.65 0.22 15)',
      accent: 'oklch(0.70 0.20 35)'
    },
    preview: ['20', '15', '35']
  },
  {
    name: 'Gold Luxe',
    description: 'Premium gold and amber tones',
    colors: {
      primary: 'oklch(0.75 0.18 80)',
      secondary: 'oklch(0.70 0.20 70)',
      accent: 'oklch(0.80 0.15 90)'
    },
    preview: ['80', '70', '90']
  },
  {
    name: 'Slate Gray',
    description: 'Modern and minimalist gray',
    colors: {
      primary: 'oklch(0.50 0.05 250)',
      secondary: 'oklch(0.60 0.04 260)',
      accent: 'oklch(0.70 0.15 200)'
    },
    preview: ['250', '260', '200']
  },
  {
    name: 'Teal Aqua',
    description: 'Refreshing teal and aqua colors',
    colors: {
      primary: 'oklch(0.65 0.18 190)',
      secondary: 'oklch(0.70 0.16 180)',
      accent: 'oklch(0.75 0.20 170)'
    },
    preview: ['190', '180', '170']
  }
]

interface ThemeCustomizationProps {
  currentUser: SystemUser
  onThemeChange?: (colors: { primary: string; secondary: string; accent: string }) => void
}

export function ThemeCustomization({ currentUser, onThemeChange }: ThemeCustomizationProps) {
  const [selectedPreset, setSelectedPreset] = useState<ThemePreset | null>(null)
  const [customColors, setCustomColors] = useState({
    primary: 'oklch(0.75 0.22 280)',
    secondary: 'oklch(0.65 0.18 310)',
    accent: 'oklch(0.70 0.25 180)'
  })
  const [isCustomMode, setIsCustomMode] = useState(false)
  const [isDarkMode, setIsDarkMode] = useState(false)
  const [customPickerOpen, setCustomPickerOpen] = useState(false)

  const getCurrentTheme = () => {
    const root = document.documentElement
    const primary = getComputedStyle(root).getPropertyValue('--primary').trim()
    const secondary = getComputedStyle(root).getPropertyValue('--secondary').trim()
    const accent = getComputedStyle(root).getPropertyValue('--accent').trim()
    
    return { primary, secondary, accent }
  }

  useEffect(() => {
    const current = getCurrentTheme()
    setCustomColors(current)
    
    const matchingPreset = themePresets.find(
      preset => preset.colors.primary === current.primary
    )
    if (matchingPreset) {
      setSelectedPreset(matchingPreset)
    }

    const savedDarkMode = localStorage.getItem('theme-dark-mode')
    if (savedDarkMode !== null) {
      setIsDarkMode(savedDarkMode === 'true')
    } else {
      const hasDarkClass = document.documentElement.classList.contains('dark')
      setIsDarkMode(hasDarkClass)
    }
  }, [])

  const applyTheme = (colors: { primary: string; secondary: string; accent: string }) => {
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
    
    localStorage.setItem('theme-colors', JSON.stringify(colors))
    
    if (onThemeChange) {
      onThemeChange(colors)
    }
    
    toast.success('Theme applied successfully', {
      description: 'Your color scheme has been updated'
    })
  }

  const handlePresetSelect = (preset: ThemePreset) => {
    setSelectedPreset(preset)
    setIsCustomMode(false)
    setCustomColors(preset.colors)
    applyTheme(preset.colors)
  }

  const handleCustomColorChange = (colorKey: 'primary' | 'secondary' | 'accent', value: string) => {
    const newColors = {
      ...customColors,
      [colorKey]: value
    }
    setCustomColors(newColors)
  }

  const applyCustomColors = () => {
    setSelectedPreset(null)
    setIsCustomMode(true)
    applyTheme(customColors)
  }

  const resetToDefault = () => {
    const defaultColors = themePresets[0].colors
    setSelectedPreset(themePresets[0])
    setIsCustomMode(false)
    setCustomColors(defaultColors)
    applyTheme(defaultColors)
  }

  const getColorFromOklch = (oklchString: string): string => {
    const match = oklchString.match(/oklch\(([\d.]+)\s+([\d.]+)\s+([\d.]+)\)/)
    if (match) {
      const [, l, c, h] = match
      return `oklch(${l} ${c} ${h})`
    }
    return oklchString
  }

  const generateRandomTheme = () => {
    const randomHue1 = Math.floor(Math.random() * 360)
    const randomHue2 = (randomHue1 + 30 + Math.floor(Math.random() * 60)) % 360
    const randomHue3 = (randomHue1 - 30 - Math.floor(Math.random() * 60) + 360) % 360
    
    const newColors = {
      primary: `oklch(${0.65 + Math.random() * 0.15} ${0.18 + Math.random() * 0.08} ${randomHue1})`,
      secondary: `oklch(${0.65 + Math.random() * 0.1} ${0.15 + Math.random() * 0.06} ${randomHue2})`,
      accent: `oklch(${0.70 + Math.random() * 0.1} ${0.20 + Math.random() * 0.08} ${randomHue3})`
    }
    
    setCustomColors(newColors)
    setSelectedPreset(null)
    setIsCustomMode(true)
    applyTheme(newColors)
    
    toast.success('Random theme generated!', {
      description: 'Feel free to adjust or try another'
    })
  }

  const toggleDarkMode = (checked: boolean) => {
    setIsDarkMode(checked)
    const root = document.documentElement
    
    if (checked) {
      root.classList.add('dark')
    } else {
      root.classList.remove('dark')
    }
    
    localStorage.setItem('theme-dark-mode', String(checked))
    
    toast.success(checked ? 'Dark mode enabled' : 'Light mode enabled', {
      description: `Switched to ${checked ? 'dark' : 'light'} theme`
    })
  }

  return (
    <div className="space-y-6">
      <Card className="p-6 glass-card">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10">
              <Palette size={24} className="text-primary" />
            </div>
            <div>
              <h2 className="text-xl font-semibold">Theme Customization</h2>
              <p className="text-sm text-muted-foreground">Personalize your interface colors</p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button
              variant="default"
              size="sm"
              onClick={() => setCustomPickerOpen(true)}
              className="gap-2"
            >
              <PaintBrush size={16} />
              Advanced Picker
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={generateRandomTheme}
              className="gap-2"
            >
              <MagicWand size={16} />
              Random
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={resetToDefault}
              className="gap-2"
            >
              <ArrowClockwise size={16} />
              Reset
            </Button>
          </div>
        </div>

        <Separator className="mb-6" />

        <Card className="p-4 mb-6 bg-muted/30">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                {isDarkMode ? <Moon size={20} className="text-primary" /> : <Sun size={20} className="text-primary" />}
              </div>
              <div>
                <Label htmlFor="dark-mode-toggle" className="text-base font-medium cursor-pointer">
                  Dark Mode
                </Label>
                <p className="text-sm text-muted-foreground">
                  {isDarkMode ? 'Switch to light theme' : 'Switch to dark theme'}
                </p>
              </div>
            </div>
            <Switch
              id="dark-mode-toggle"
              checked={isDarkMode}
              onCheckedChange={toggleDarkMode}
            />
          </div>
        </Card>

        <Tabs defaultValue="presets" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-6">
            <TabsTrigger value="presets">Theme Presets</TabsTrigger>
            <TabsTrigger value="custom">Custom Colors</TabsTrigger>
          </TabsList>

          <TabsContent value="presets" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {themePresets.map((preset, index) => (
                <Card
                  key={index}
                  className={`p-4 cursor-pointer transition-all hover:shadow-lg hover:scale-105 ${
                    selectedPreset?.name === preset.name && !isCustomMode
                      ? 'ring-2 ring-primary shadow-lg'
                      : ''
                  }`}
                  onClick={() => handlePresetSelect(preset)}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <h3 className="font-semibold mb-1">{preset.name}</h3>
                      <p className="text-xs text-muted-foreground">{preset.description}</p>
                    </div>
                    {selectedPreset?.name === preset.name && !isCustomMode && (
                      <div className="p-1 rounded-full bg-primary text-primary-foreground">
                        <Check size={16} />
                      </div>
                    )}
                  </div>
                  
                  <div className="flex gap-2 mt-3">
                    <div
                      className="h-12 flex-1 rounded-lg shadow-inner"
                      style={{ background: preset.colors.primary }}
                      title="Primary"
                    />
                    <div
                      className="h-12 flex-1 rounded-lg shadow-inner"
                      style={{ background: preset.colors.secondary }}
                      title="Secondary"
                    />
                    <div
                      className="h-12 flex-1 rounded-lg shadow-inner"
                      style={{ background: preset.colors.accent }}
                      title="Accent"
                    />
                  </div>
                  
                  <div className="mt-3 flex gap-1">
                    {preset.preview.map((hue, idx) => (
                      <Badge key={idx} variant="outline" className="text-xs">
                        {hue}°
                      </Badge>
                    ))}
                  </div>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="custom" className="space-y-6">
            <Card className="p-6 bg-muted/30">
              <div className="space-y-6">
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <Label className="text-base font-semibold">Primary Color</Label>
                    <Badge variant="secondary">{customColors.primary}</Badge>
                  </div>
                  <div className="flex gap-3 items-center">
                    <div
                      className="h-16 w-24 rounded-lg shadow-md border-2 border-border"
                      style={{ background: customColors.primary }}
                    />
                    <input
                      type="text"
                      value={customColors.primary}
                      onChange={(e) => handleCustomColorChange('primary', e.target.value)}
                      className="flex-1 px-3 py-2 rounded-lg border bg-background"
                      placeholder="oklch(0.75 0.22 280)"
                    />
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">
                    Main brand color used for primary actions and highlights
                  </p>
                </div>

                <Separator />

                <div>
                  <div className="flex items-center justify-between mb-3">
                    <Label className="text-base font-semibold">Secondary Color</Label>
                    <Badge variant="secondary">{customColors.secondary}</Badge>
                  </div>
                  <div className="flex gap-3 items-center">
                    <div
                      className="h-16 w-24 rounded-lg shadow-md border-2 border-border"
                      style={{ background: customColors.secondary }}
                    />
                    <input
                      type="text"
                      value={customColors.secondary}
                      onChange={(e) => handleCustomColorChange('secondary', e.target.value)}
                      className="flex-1 px-3 py-2 rounded-lg border bg-background"
                      placeholder="oklch(0.65 0.18 310)"
                    />
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">
                    Supporting color for less prominent elements
                  </p>
                </div>

                <Separator />

                <div>
                  <div className="flex items-center justify-between mb-3">
                    <Label className="text-base font-semibold">Accent Color</Label>
                    <Badge variant="secondary">{customColors.accent}</Badge>
                  </div>
                  <div className="flex gap-3 items-center">
                    <div
                      className="h-16 w-24 rounded-lg shadow-md border-2 border-border"
                      style={{ background: customColors.accent }}
                    />
                    <input
                      type="text"
                      value={customColors.accent}
                      onChange={(e) => handleCustomColorChange('accent', e.target.value)}
                      className="flex-1 px-3 py-2 rounded-lg border bg-background"
                      placeholder="oklch(0.70 0.25 180)"
                    />
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">
                    Highlight color for special elements and emphasis
                  </p>
                </div>

                <Separator />

                <Button
                  onClick={applyCustomColors}
                  className="w-full gap-2"
                  size="lg"
                >
                  <Sparkle size={20} />
                  Apply Custom Colors
                </Button>
              </div>
            </Card>

            <Card className="p-4 bg-blue-500/10 border-blue-500/20">
              <div className="flex gap-3">
                <div className="text-blue-500 mt-1">
                  <Sparkle size={20} />
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold text-sm mb-1">OKLCH Color Format</h4>
                  <p className="text-xs text-muted-foreground">
                    Use the OKLCH color format: <code className="px-1 py-0.5 bg-muted rounded text-xs">oklch(lightness chroma hue)</code>
                  </p>
                  <ul className="mt-2 space-y-1 text-xs text-muted-foreground">
                    <li>• <strong>Lightness:</strong> 0.0 to 1.0 (0 = black, 1 = white)</li>
                    <li>• <strong>Chroma:</strong> 0.0 to 0.37 (color intensity)</li>
                    <li>• <strong>Hue:</strong> 0 to 360 (color wheel degrees)</li>
                  </ul>
                </div>
              </div>
            </Card>
          </TabsContent>
        </Tabs>
      </Card>

      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Preview</h3>
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="p-4 bg-primary text-primary-foreground">
              <h4 className="font-semibold mb-2">Primary</h4>
              <p className="text-sm opacity-90">This is how primary color looks on cards and buttons</p>
              <Button variant="secondary" size="sm" className="mt-3">
                Button Example
              </Button>
            </Card>
            
            <Card className="p-4 bg-secondary text-secondary-foreground">
              <h4 className="font-semibold mb-2">Secondary</h4>
              <p className="text-sm opacity-90">Secondary elements use this color scheme</p>
              <Button variant="outline" size="sm" className="mt-3">
                Button Example
              </Button>
            </Card>
            
            <Card className="p-4 bg-accent text-accent-foreground">
              <h4 className="font-semibold mb-2">Accent</h4>
              <p className="text-sm opacity-90">Accent color for highlights and special elements</p>
              <Button variant="ghost" size="sm" className="mt-3">
                Button Example
              </Button>
            </Card>
          </div>

          <div className="flex gap-3 flex-wrap">
            <Button variant="default">Primary Button</Button>
            <Button variant="secondary">Secondary Button</Button>
            <Button variant="outline">Outline Button</Button>
            <Button variant="ghost">Ghost Button</Button>
            <Badge>Badge</Badge>
            <Badge variant="secondary">Secondary Badge</Badge>
            <Badge variant="outline">Outline Badge</Badge>
          </div>
        </div>
      </Card>
      
      <CustomColorPicker 
        open={customPickerOpen} 
        onOpenChange={setCustomPickerOpen} 
      />
    </div>
  )
}
