import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { Palette, Check, PaintBrush, Sparkle } from '@phosphor-icons/react'
import { useTheme, type ColorMood, colorMoods } from '@/hooks/use-theme'
import { toast } from 'sonner'
import { CustomColorPicker } from '@/components/CustomColorPicker'

const moodLabels: Record<ColorMood, string> = {
  blue: 'Ocean Blue',
  purple: 'Royal Purple',
  green: 'Forest Green',
  orange: 'Sunset Orange',
  rose: 'Romantic Rose',
  cyan: 'Sky Cyan',
  teal: 'Deep Teal',
  amber: 'Golden Amber',
  indigo: 'Midnight Indigo',
  crimson: 'Bold Crimson',
  emerald: 'Rich Emerald',
  violet: 'Mystic Violet',
}

const moodDescriptions: Record<ColorMood, string> = {
  blue: 'Professional and calm',
  purple: 'Creative and luxurious',
  green: 'Fresh and natural',
  orange: 'Energetic and warm',
  rose: 'Elegant and sophisticated',
  cyan: 'Modern and clean',
  teal: 'Balanced and serene',
  amber: 'Warm and inviting',
  indigo: 'Deep and focused',
  crimson: 'Powerful and dynamic',
  emerald: 'Vibrant and lively',
  violet: 'Mysterious and creative',
}

export function ColorMoodSelector() {
  const [selectedMood, setSelectedMood] = useState<ColorMood>('blue')
  const [open, setOpen] = useState(false)
  const [customPickerOpen, setCustomPickerOpen] = useState(false)
  const [hasCustomColors, setHasCustomColors] = useState(false)
  const [isAnimating, setIsAnimating] = useState(false)
  const { applyColorMood } = useTheme()

  useEffect(() => {
    const savedCustomColors = localStorage.getItem('theme-custom-colors')
    if (savedCustomColors) {
      setHasCustomColors(true)
      return
    }
    
    const savedMood = localStorage.getItem('theme-color-mood') as ColorMood | null
    if (savedMood && colorMoods[savedMood]) {
      setSelectedMood(savedMood)
      setHasCustomColors(false)
    }
  }, [open])

  const createColorTransitionEffect = () => {
    const overlay = document.createElement('div')
    overlay.className = 'theme-transition-overlay'
    overlay.style.top = '50%'
    overlay.style.left = '50%'
    overlay.style.transform = 'translate(-50%, -50%)'
    
    document.body.appendChild(overlay)
    
    setTimeout(() => {
      overlay.remove()
    }, 1000)
  }

  const handleMoodChange = (mood: ColorMood) => {
    if (isAnimating) return
    
    setIsAnimating(true)
    setSelectedMood(mood)
    setHasCustomColors(false)
    createColorTransitionEffect()
    
    setTimeout(() => {
      applyColorMood(mood)
      setOpen(false)
      toast.success(`Theme changed to ${moodLabels[mood]}`, {
        description: moodDescriptions[mood],
      })
      setIsAnimating(false)
    }, 200)
  }

  const getMoodPreviewColor = (mood: ColorMood) => {
    return colorMoods[mood].primary
  }

  return (
    <>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="rounded-xl hover:bg-muted"
            title="Change color theme"
          >
            <Palette size={20} className="text-primary" weight="duotone" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-80 p-4" align="end">
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Palette size={18} className="text-primary" weight="duotone" />
              <h3 className="font-semibold text-sm">Color Theme</h3>
            </div>
            <div className="grid grid-cols-4 gap-2">
              {(Object.keys(colorMoods) as ColorMood[]).map((mood) => {
                const isSelected = mood === selectedMood && !hasCustomColors
                return (
                  <button
                    key={mood}
                    onClick={() => handleMoodChange(mood)}
                    disabled={isAnimating}
                    className={`
                      relative p-2 rounded-xl border-2 transition-all
                      hover:scale-105 disabled:opacity-50
                      ${isSelected ? 'border-primary bg-primary/5' : 'border-transparent hover:border-border'}
                    `}
                  >
                    <div className="flex flex-col items-center gap-1.5">
                      <div 
                        className="w-8 h-8 rounded-full"
                        style={{ backgroundColor: getMoodPreviewColor(mood) }}
                      />
                      <span className="text-[10px] font-medium truncate w-full text-center">
                        {moodLabels[mood].split(' ')[0]}
                      </span>
                    </div>
                    {isSelected && (
                      <div className="absolute top-1 right-1">
                        <Check size={10} weight="bold" className="text-primary" />
                      </div>
                    )}
                  </button>
                )
              })}
            </div>
            <Button 
              variant="outline" 
              size="sm" 
              className="w-full"
              onClick={() => {
                setOpen(false)
                setCustomPickerOpen(true)
              }}
            >
              <PaintBrush size={16} className="mr-2" />
              Custom Colors
            </Button>
          </div>
        </PopoverContent>
      </Popover>

      <CustomColorPicker 
        open={customPickerOpen} 
        onOpenChange={setCustomPickerOpen} 
      />
    </>
  )
}
