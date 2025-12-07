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
            className="shine-effect relative group"
            title="Change color theme"
          >
            <Palette 
              size={20} 
              className="text-primary transition-all duration-300 group-hover:scale-110" 
              weight="duotone" 
            />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-96 p-4" align="end">
          <div className="space-y-3">
            <div className="flex items-center gap-2 pb-2 border-b">
              <Palette size={20} className="text-primary" weight="duotone" />
              <h3 className="font-semibold text-sm">Color Mood</h3>
            </div>
            <p className="text-xs text-muted-foreground">
              Choose a color palette to personalize your experience
            </p>
            <div className="grid grid-cols-3 gap-2 max-h-[400px] overflow-y-auto pr-1">
              {(Object.keys(colorMoods) as ColorMood[]).map((mood) => {
                const isSelected = mood === selectedMood && !hasCustomColors
                return (
                  <button
                    key={mood}
                    onClick={() => handleMoodChange(mood)}
                    disabled={isAnimating}
                    className={`
                      relative p-2.5 rounded-lg border-2 transition-all duration-300
                      hover:scale-105 hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed
                      ${isSelected 
                        ? 'border-primary bg-primary/10 shadow-md ring-2 ring-primary/20' 
                        : 'border-border hover:border-primary/50'
                      }
                    `}
                  >
                    <div className="flex flex-col items-center gap-1.5">
                      <div 
                        className={`w-8 h-8 rounded-full ring-2 ring-offset-2 ring-offset-background transition-all duration-300 ${isSelected ? 'ring-primary' : 'ring-transparent'}`}
                        style={{ 
                          backgroundColor: getMoodPreviewColor(mood),
                          boxShadow: `0 0 16px ${getMoodPreviewColor(mood)}50`,
                        }}
                      />
                      <span className="text-[10px] font-medium leading-tight text-center">
                        {moodLabels[mood]}
                      </span>
                    </div>
                    {isSelected && (
                      <div className="absolute top-1 right-1 animate-in fade-in zoom-in duration-300">
                        <Check size={12} weight="bold" className="text-primary" />
                      </div>
                    )}
                  </button>
                )
              })}
            </div>
            <div className="pt-3 border-t">
              <Button 
                variant="outline" 
                size="sm" 
                className="w-full shine-effect"
                onClick={() => {
                  setOpen(false)
                  setCustomPickerOpen(true)
                }}
              >
                <PaintBrush size={16} className="mr-2" />
                Create Custom Colors
              </Button>
            </div>
            <div className="pt-2 border-t">
              <p className="text-[10px] text-muted-foreground text-center">
                {hasCustomColors ? (
                  <span className="font-medium text-primary flex items-center justify-center gap-1">
                    <Sparkle size={12} weight="fill" />
                    Custom Colors Active
                  </span>
                ) : (
                  <>
                    Selected: <span className="font-medium text-foreground">{moodLabels[selectedMood]}</span>
                  </>
                )}
              </p>
            </div>
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
