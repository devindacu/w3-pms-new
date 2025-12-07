import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Slider } from '@/components/ui/slider'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { 
  Palette, 
  Eye, 
  FloppyDisk, 
  Trash,
  Sparkle,
  PaintBrush
} from '@phosphor-icons/react'
import { toast } from 'sonner'
import { useTheme, type ThemeColors } from '@/hooks/use-theme'
import { useKV } from '@github/spark/hooks'

interface CustomColorMood {
  id: string
  name: string
  colors: ThemeColors
  createdAt: number
}

interface ColorPickerProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function CustomColorPicker({ open, onOpenChange }: ColorPickerProps) {
  const { applyTheme, applyCustomColors } = useTheme()
  const [customMoods, setCustomMoods] = useKV<CustomColorMood[]>('custom-color-moods', [])
  
  const [moodName, setMoodName] = useState('')
  const [primaryL, setPrimaryL] = useState(65)
  const [primaryC, setPrimaryC] = useState(22)
  const [primaryH, setPrimaryH] = useState(265)
  
  const [secondaryL, setSecondaryL] = useState(55)
  const [secondaryC, setSecondaryC] = useState(16)
  const [secondaryH, setSecondaryH] = useState(220)
  
  const [accentL, setAccentL] = useState(68)
  const [accentC, setAccentC] = useState(24)
  const [accentH, setAccentH] = useState(35)

  const primaryColor = `oklch(${primaryL / 100} ${primaryC / 100} ${primaryH})`
  const secondaryColor = `oklch(${secondaryL / 100} ${secondaryC / 100} ${secondaryH})`
  const accentColor = `oklch(${accentL / 100} ${accentC / 100} ${accentH})`

  const previewColors: ThemeColors = {
    primary: primaryColor,
    secondary: secondaryColor,
    accent: accentColor,
  }

  const handlePreview = () => {
    applyTheme(previewColors)
    toast.success('Preview applied!', {
      description: 'These colors are temporary. Save to make them permanent.',
    })
  }

  const handleSave = () => {
    if (!moodName.trim()) {
      toast.error('Please enter a name for this color mood')
      return
    }

    const newMood: CustomColorMood = {
      id: `custom-${Date.now()}`,
      name: moodName.trim(),
      colors: previewColors,
      createdAt: Date.now(),
    }

    setCustomMoods((currentMoods) => [...(currentMoods || []), newMood])
    
    applyCustomColors(previewColors)
    
    toast.success('Color mood saved!', {
      description: `"${moodName}" has been added to your custom moods`,
    })

    setMoodName('')
    onOpenChange(false)
  }

  const handleDelete = (moodId: string) => {
    setCustomMoods((currentMoods) => 
      (currentMoods || []).filter(m => m.id !== moodId)
    )
    
    toast.success('Custom mood deleted')
  }

  const handleApplyCustomMood = (mood: CustomColorMood) => {
    applyCustomColors(mood.colors)
    
    setPrimaryL(parseFloat(mood.colors.primary.match(/oklch\(([0-9.]+)/)?.[1] || '0.48') * 100)
    setPrimaryC(parseFloat(mood.colors.primary.match(/oklch\([0-9.]+ ([0-9.]+)/)?.[1] || '0.18') * 100)
    setPrimaryH(parseInt(mood.colors.primary.match(/oklch\([0-9.]+ [0-9.]+ ([0-9]+)\)/)?.[1] || '265'))
    
    setSecondaryL(parseFloat(mood.colors.secondary.match(/oklch\(([0-9.]+)/)?.[1] || '0.72') * 100)
    setSecondaryC(parseFloat(mood.colors.secondary.match(/oklch\([0-9.]+ ([0-9.]+)/)?.[1] || '0.14') * 100)
    setSecondaryH(parseInt(mood.colors.secondary.match(/oklch\([0-9.]+ [0-9.]+ ([0-9]+)\)/)?.[1] || '195'))
    
    setAccentL(parseFloat(mood.colors.accent.match(/oklch\(([0-9.]+)/)?.[1] || '0.62') * 100)
    setAccentC(parseFloat(mood.colors.accent.match(/oklch\([0-9.]+ ([0-9.]+)\)/)?.[1] || '0.20') * 100)
    setAccentH(parseInt(mood.colors.accent.match(/oklch\([0-9.]+ [0-9.]+ ([0-9]+)\)/)?.[1] || '30'))
    
    toast.success(`Applied "${mood.name}"`)
  }

  const colorPresets = [
    { name: 'Ocean', h: 210 },
    { name: 'Forest', h: 150 },
    { name: 'Sunset', h: 30 },
    { name: 'Lavender', h: 280 },
    { name: 'Rose', h: 350 },
    { name: 'Mint', h: 160 },
    { name: 'Amber', h: 45 },
    { name: 'Sky', h: 200 },
  ]

  const applyPreset = (hue: number) => {
    setPrimaryH(hue)
    setSecondaryH((hue + 30) % 360)
    setAccentH((hue - 40 + 360) % 360)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-primary/10">
              <PaintBrush size={24} className="text-primary" weight="duotone" />
            </div>
            <div>
              <DialogTitle>Custom Color Picker</DialogTitle>
              <DialogDescription>
                Create your personalized color mood using OKLCH color space
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <Tabs defaultValue="create" className="mt-4">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="create">
              <Sparkle size={16} className="mr-2" />
              Create New
            </TabsTrigger>
            <TabsTrigger value="saved">
              <FloppyDisk size={16} className="mr-2" />
              Saved Moods ({(customMoods || []).length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="create" className="space-y-6 mt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-6">
                <div>
                  <Label htmlFor="mood-name" className="text-sm font-medium mb-2 block">
                    Color Mood Name
                  </Label>
                  <Input
                    id="mood-name"
                    placeholder="e.g., Tropical Paradise"
                    value={moodName}
                    onChange={(e) => setMoodName(e.target.value)}
                  />
                </div>

                <Separator />

                <div>
                  <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
                    <Sparkle size={16} className="text-primary" />
                    Quick Presets
                  </h3>
                  <div className="grid grid-cols-4 gap-2">
                    {colorPresets.map((preset) => (
                      <Button
                        key={preset.name}
                        variant="outline"
                        size="sm"
                        onClick={() => applyPreset(preset.h)}
                        className="flex-col h-auto py-2 px-1 gap-1"
                      >
                        <div
                          className="w-8 h-8 rounded-full ring-2 ring-offset-2 ring-border"
                          style={{
                            backgroundColor: `oklch(0.5 0.15 ${preset.h})`,
                          }}
                        />
                        <span className="text-xs">{preset.name}</span>
                      </Button>
                    ))}
                  </div>
                </div>

                <Separator />

                <div className="space-y-4">
                  <h3 className="text-sm font-semibold">Primary Color</h3>
                  
                  <div className="space-y-3">
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <Label className="text-xs">Lightness</Label>
                        <Badge variant="outline" className="text-xs">{primaryL}%</Badge>
                      </div>
                      <Slider
                        value={[primaryL]}
                        onValueChange={([value]) => setPrimaryL(value)}
                        min={30}
                        max={70}
                        step={1}
                        className="w-full"
                      />
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <Label className="text-xs">Chroma (Saturation)</Label>
                        <Badge variant="outline" className="text-xs">{primaryC}%</Badge>
                      </div>
                      <Slider
                        value={[primaryC]}
                        onValueChange={([value]) => setPrimaryC(value)}
                        min={0}
                        max={40}
                        step={1}
                        className="w-full"
                      />
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <Label className="text-xs">Hue</Label>
                        <Badge variant="outline" className="text-xs">{primaryH}°</Badge>
                      </div>
                      <Slider
                        value={[primaryH]}
                        onValueChange={([value]) => setPrimaryH(value)}
                        min={0}
                        max={360}
                        step={1}
                        className="w-full"
                      />
                      <div
                        className="w-full h-2 rounded-full mt-2"
                        style={{
                          background: `linear-gradient(to right, 
                            oklch(0.5 0.2 0),
                            oklch(0.5 0.2 60),
                            oklch(0.5 0.2 120),
                            oklch(0.5 0.2 180),
                            oklch(0.5 0.2 240),
                            oklch(0.5 0.2 300),
                            oklch(0.5 0.2 360)
                          )`,
                        }}
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="text-sm font-semibold">Secondary Color</h3>
                  
                  <div className="space-y-3">
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <Label className="text-xs">Lightness</Label>
                        <Badge variant="outline" className="text-xs">{secondaryL}%</Badge>
                      </div>
                      <Slider
                        value={[secondaryL]}
                        onValueChange={([value]) => setSecondaryL(value)}
                        min={50}
                        max={80}
                        step={1}
                        className="w-full"
                      />
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <Label className="text-xs">Chroma</Label>
                        <Badge variant="outline" className="text-xs">{secondaryC}%</Badge>
                      </div>
                      <Slider
                        value={[secondaryC]}
                        onValueChange={([value]) => setSecondaryC(value)}
                        min={0}
                        max={30}
                        step={1}
                        className="w-full"
                      />
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <Label className="text-xs">Hue</Label>
                        <Badge variant="outline" className="text-xs">{secondaryH}°</Badge>
                      </div>
                      <Slider
                        value={[secondaryH]}
                        onValueChange={([value]) => setSecondaryH(value)}
                        min={0}
                        max={360}
                        step={1}
                        className="w-full"
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="text-sm font-semibold">Accent Color</h3>
                  
                  <div className="space-y-3">
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <Label className="text-xs">Lightness</Label>
                        <Badge variant="outline" className="text-xs">{accentL}%</Badge>
                      </div>
                      <Slider
                        value={[accentL]}
                        onValueChange={([value]) => setAccentL(value)}
                        min={40}
                        max={75}
                        step={1}
                        className="w-full"
                      />
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <Label className="text-xs">Chroma</Label>
                        <Badge variant="outline" className="text-xs">{accentC}%</Badge>
                      </div>
                      <Slider
                        value={[accentC]}
                        onValueChange={([value]) => setAccentC(value)}
                        min={0}
                        max={35}
                        step={1}
                        className="w-full"
                      />
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <Label className="text-xs">Hue</Label>
                        <Badge variant="outline" className="text-xs">{accentH}°</Badge>
                      </div>
                      <Slider
                        value={[accentH]}
                        onValueChange={([value]) => setAccentH(value)}
                        min={0}
                        max={360}
                        step={1}
                        className="w-full"
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-6">
                <Card className="p-6 border-2">
                  <div className="flex items-center gap-2 mb-4">
                    <Eye size={20} className="text-primary" />
                    <h3 className="text-sm font-semibold">Live Preview</h3>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <Label className="text-xs mb-2 block">Primary</Label>
                      <div className="flex items-center gap-3">
                        <div
                          className="w-20 h-20 rounded-xl ring-4 ring-offset-2 ring-offset-background shadow-lg"
                          style={{
                            backgroundColor: primaryColor,
                            boxShadow: `0 8px 24px ${primaryColor}40`,
                          }}
                        />
                        <div className="flex-1">
                          <code className="text-xs bg-muted p-2 rounded block break-all">
                            {primaryColor}
                          </code>
                        </div>
                      </div>
                    </div>

                    <div>
                      <Label className="text-xs mb-2 block">Secondary</Label>
                      <div className="flex items-center gap-3">
                        <div
                          className="w-20 h-20 rounded-xl ring-4 ring-offset-2 ring-offset-background shadow-lg"
                          style={{
                            backgroundColor: secondaryColor,
                            boxShadow: `0 8px 24px ${secondaryColor}40`,
                          }}
                        />
                        <div className="flex-1">
                          <code className="text-xs bg-muted p-2 rounded block break-all">
                            {secondaryColor}
                          </code>
                        </div>
                      </div>
                    </div>

                    <div>
                      <Label className="text-xs mb-2 block">Accent</Label>
                      <div className="flex items-center gap-3">
                        <div
                          className="w-20 h-20 rounded-xl ring-4 ring-offset-2 ring-offset-background shadow-lg"
                          style={{
                            backgroundColor: accentColor,
                            boxShadow: `0 8px 24px ${accentColor}40`,
                          }}
                        />
                        <div className="flex-1">
                          <code className="text-xs bg-muted p-2 rounded block break-all">
                            {accentColor}
                          </code>
                        </div>
                      </div>
                    </div>
                  </div>
                </Card>

                <Card className="p-6">
                  <h3 className="text-sm font-semibold mb-4">UI Preview</h3>
                  <div className="space-y-3">
                    <Button 
                      className="w-full" 
                      style={{ 
                        backgroundColor: primaryColor,
                        color: 'white',
                      }}
                    >
                      Primary Button
                    </Button>
                    <Button 
                      variant="secondary" 
                      className="w-full"
                      style={{ backgroundColor: secondaryColor }}
                    >
                      Secondary Button
                    </Button>
                    <Button 
                      variant="outline" 
                      className="w-full"
                      style={{ 
                        borderColor: accentColor,
                        color: accentColor,
                      }}
                    >
                      Accent Outline
                    </Button>
                    <div 
                      className="p-4 rounded-lg"
                      style={{ 
                        backgroundColor: `${primaryColor}15`,
                        borderLeft: `4px solid ${primaryColor}`,
                      }}
                    >
                      <p className="text-sm">This is how your cards and sections will look with the new color scheme.</p>
                    </div>
                  </div>
                </Card>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="saved" className="mt-6">
            {(customMoods || []).length === 0 ? (
              <Card className="p-12 text-center">
                <Palette size={64} className="mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">No Custom Moods Yet</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Create your first custom color mood to personalize your experience
                </p>
                <Button onClick={() => document.querySelector<HTMLButtonElement>('[data-state="inactive"]')?.click()}>
                  <Sparkle size={16} className="mr-2" />
                  Create Your First Mood
                </Button>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {(customMoods || []).map((mood) => {
                  return (
                    <Card key={mood.id} className="p-4 relative">
                      <h4 className="font-semibold mb-3">{mood.name}</h4>
                      <div className="flex gap-2 mb-4">
                        <div
                          className="w-12 h-12 rounded-lg ring-2 ring-offset-2 ring-border"
                          style={{ backgroundColor: mood.colors.primary }}
                          title="Primary"
                        />
                        <div
                          className="w-12 h-12 rounded-lg ring-2 ring-offset-2 ring-border"
                          style={{ backgroundColor: mood.colors.secondary }}
                          title="Secondary"
                        />
                        <div
                          className="w-12 h-12 rounded-lg ring-2 ring-offset-2 ring-border"
                          style={{ backgroundColor: mood.colors.accent }}
                          title="Accent"
                        />
                      </div>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="default"
                          className="flex-1"
                          onClick={() => handleApplyCustomMood(mood)}
                        >
                          <Eye size={14} className="mr-1" />
                          Apply
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => handleDelete(mood.id)}
                        >
                          <Trash size={14} />
                        </Button>
                      </div>
                      <p className="text-xs text-muted-foreground mt-2">
                        Created {new Date(mood.createdAt).toLocaleDateString()}
                      </p>
                    </Card>
                  )
                })}
              </div>
            )}
          </TabsContent>
        </Tabs>

        <DialogFooter className="mt-6">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button variant="secondary" onClick={handlePreview}>
            <Eye size={16} className="mr-2" />
            Preview
          </Button>
          <Button onClick={handleSave}>
            <FloppyDisk size={16} className="mr-2" />
            Save Color Mood
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
