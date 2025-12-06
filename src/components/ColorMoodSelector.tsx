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
import { Badge } from '@/components/ui/badge'

const moodLabels: Record<ColorMood, string> = {
  blue: 'Ocean Blue',
  purple: 'Royal Purple',
  green: 'Forest Green',
  orange: 'Sunset Orange',
  rose: 'Romantic Rose',
  cyan: 'Sky Cyan',
}

const moodDescriptions: Record<ColorMood, string> = {
  blue: 'Professional and calm',
  purple: 'Creative and luxurious',
  green: 'Fresh and natural',
  orange: 'Energetic and warm',
  rose: 'Elegant and sophisticated',
  cyan: 'Modern and clean',
}

export function ColorMoodSelector() {
  const [selectedMood, setSelectedMood] = useState<ColorMood>('blue')
  const [open, setOpen] = useState(false)
  const [customPickerOpen, setCustomPickerOpen] = useState(false)
  const [hasCustomMood, setHasCustomMood] = useState(false)
  const { applyColorMood } = useTheme()

  useEffect(() => {
    const activeCustom = localStorage.getItem('active-custom-mood')
    if (activeCustom) {
      setHasCustomMood(true)
    } else {
      setHasCustomMood(false)
      const savedMood = localStorage.getItem('theme-color-mood') as ColorMood | null
      if (savedMood && colorMoods[savedMood]) {
        setSelectedMood(savedMood)
      }
    }
  }, [open])

  const handleMoodChange = (mood: ColorMood) => {
    setSelectedMood(mood)
    setHasCustomMood(false)
    applyColorMood(mood)
    localStorage.removeItem('active-custom-mood')
    setOpen(false)
    toast.success(`Theme changed to ${moodLabels[mood]}`, {
      description: moodDescriptions[mood],
    })
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
            {hasCustomMood && (
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-accent rounded-full border-2 border-background" />
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-72 p-4" align="end">
          <div className="space-y-3">
            <div className="flex items-center gap-2 pb-2 border-b">
              <Palette size={20} className="text-primary" weight="duotone" />
              <h3 className="font-semibold text-sm">Color Mood</h3>
            </div>
            {hasCustomMood && (
              <div className="flex items-center gap-2 p-2 bg-accent/10 rounded-md border border-accent/20">
                <Sparkle size={16} className="text-accent" weight="fill" />
                <p className="text-xs text-accent font-medium">Custom mood active</p>
              </div>
            )}
            <p className="text-xs text-muted-foreground">
              Choose a color palette to personalize your experience
            </p>
            <div className="grid grid-cols-2 gap-2">
              {(Object.keys(colorMoods) as ColorMood[]).map((mood) => {
                const isSelected = mood === selectedMood && !hasCustomMood
                return (
                  <button
                    key={mood}
                    onClick={() => handleMoodChange(mood)}
                    className={`
                      relative p-3 rounded-lg border-2 transition-all duration-200
                      hover:scale-105 hover:shadow-md
                      ${isSelected 
                        ? 'border-primary bg-primary/5 shadow-sm' 
                        : 'border-border hover:border-primary/50'
                      }
                    `}
                  >
                    <div className="flex items-center gap-2 mb-1.5">
                      <div 
                        className="w-4 h-4 rounded-full ring-2 ring-offset-2 ring-offset-background"
                        style={{ 
                          backgroundColor: getMoodPreviewColor(mood),
                          boxShadow: `0 0 12px ${getMoodPreviewColor(mood)}40`,
                        }}
                      />
                      <span className="text-xs font-medium">
                        {moodLabels[mood]}
                      </span>
                    </div>
                    <p className="text-[10px] text-muted-foreground text-left">
                      {moodDescriptions[mood]}
                    </p>
                    {isSelected && (
                      <div className="absolute top-2 right-2">
                        <Check size={14} weight="bold" className="text-primary" />
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
                className="w-full"
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
                {hasCustomMood ? (
                  <span className="flex items-center justify-center gap-1">
                    <Sparkle size={12} className="text-accent" weight="fill" />
                    <span className="font-medium text-accent">Custom mood</span>
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
