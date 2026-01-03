import React, { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { Palette, Check, PaintBrush } from '@phosphor-icons/react'
import { useTheme, type ColorMood, colorMoods } from '@/hooks/use-theme'
import { toast } from 'sonner'
import { CustomColorPicker } from '@/components/CustomColorPicker'
import { motion } from 'framer-motion'

const moodLabels: Record<ColorMood, string> = {
  indigo: 'Indigo',
  violet: 'Violet',
  emerald: 'Emerald',
  rose: 'Rose',
  amber: 'Amber',
  cyan: 'Cyan',
  slate: 'Slate',
  crimson: 'Crimson',
}

const moodDescriptions: Record<ColorMood, string> = {
  indigo: 'Professional & trusted',
  violet: 'Creative & luxurious',
  emerald: 'Fresh & natural',
  rose: 'Elegant & warm',
  amber: 'Energetic & bold',
  cyan: 'Modern & clean',
  slate: 'Minimal & focused',
  crimson: 'Powerful & dynamic',
}

export function ColorMoodSelector() {
  const [selectedMood, setSelectedMood] = useState<ColorMood>('indigo')
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
    
    document.body.appendChild(overlay)
    
    setTimeout(() => {
      overlay.remove()
    }, 800)
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
      toast.success(`Theme: ${moodLabels[mood]}`, {
        description: moodDescriptions[mood],
      })
      setIsAnimating(false)
    }, 150)
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
            className="relative w-10 h-10 rounded-xl bg-muted/50 hover:bg-muted border border-border/50"
            title="Change color theme"
          >
            <Palette size={20} className="text-primary" weight="duotone" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-72 p-4 rounded-2xl" align="end">
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                <Palette size={16} className="text-primary" weight="fill" />
              </div>
              <div>
                <h3 className="font-semibold text-sm">Color Theme</h3>
                <p className="text-xs text-muted-foreground">Choose your accent color</p>
              </div>
            </div>
            
            <div className="grid grid-cols-4 gap-2">
              {(Object.keys(colorMoods) as ColorMood[]).map((mood, index) => {
                const isSelected = mood === selectedMood && !hasCustomColors
                return (
                  <motion.button
                    key={mood}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: index * 0.03 }}
                    onClick={() => handleMoodChange(mood)}
                    disabled={isAnimating}
                    className={`
                      group relative p-2 rounded-xl border-2 transition-all duration-200
                      hover:scale-105 disabled:opacity-50
                      ${isSelected ? 'border-primary bg-primary/5 shadow-sm' : 'border-transparent hover:border-border bg-muted/30'}
                    `}
                  >
                    <div className="flex flex-col items-center gap-1.5">
                      <div 
                        className="w-8 h-8 rounded-full shadow-sm transition-transform group-hover:scale-110"
                        style={{ backgroundColor: getMoodPreviewColor(mood) }}
                      />
                      <span className="text-[10px] font-medium truncate w-full text-center text-muted-foreground group-hover:text-foreground">
                        {moodLabels[mood]}
                      </span>
                    </div>
                    {isSelected && (
                      <motion.div 
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-primary flex items-center justify-center"
                      >
                        <Check size={10} weight="bold" className="text-primary-foreground" />
                      </motion.div>
                    )}
                  </motion.button>
                )
              })}
            </div>
            
            <div className="pt-2 border-t border-border">
              <Button 
                variant="outline" 
                size="sm" 
                className="w-full rounded-xl"
                onClick={() => {
                  setOpen(false)
                  setCustomPickerOpen(true)
                }}
              >
                <PaintBrush size={16} className="mr-2" />
                Custom Colors
              </Button>
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
