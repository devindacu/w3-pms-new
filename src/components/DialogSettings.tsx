import { useState } from 'react'
import { useKV } from '@github/spark/hooks'
import { Card } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { toast } from 'sonner'
import { 
  DEFAULT_DIALOG_SETTINGS, 
  type GlobalDialogSettings,
  DIALOG_SIZE_PRESETS,
  DIALOG_HEIGHT_PRESETS,
  DIALOG_MODULE_DEFAULTS
} from '@/lib/dialog-settings'

export function DialogSettings() {
  const [settings, setSettings] = useKV<GlobalDialogSettings>(
    'w3-hotel-dialog-settings',
    DEFAULT_DIALOG_SETTINGS
  )

  const handleReset = () => {
    setSettings(DEFAULT_DIALOG_SETTINGS)
    toast.success('Dialog settings reset to defaults')
  }

  const updateSetting = <K extends keyof GlobalDialogSettings>(
    key: K,
    value: GlobalDialogSettings[K]
  ) => {
    setSettings((current) => ({
      ...(current || DEFAULT_DIALOG_SETTINGS),
      [key]: value,
    }))
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold">Dialog & Popup Settings</h2>
        <p className="text-muted-foreground mt-1">
          Configure global settings for all dialog windows and popups throughout the system
        </p>
      </div>

      <Card className="p-6">
        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-semibold mb-4">Default Dialog Dimensions</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="default-size">Default Width</Label>
                <Select
                  value={settings?.defaultSize || 'lg'}
                  onValueChange={(value) => updateSetting('defaultSize', value as any)}
                >
                  <SelectTrigger id="default-size">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="sm">Small (28rem / 448px)</SelectItem>
                    <SelectItem value="md">Medium (42rem / 672px)</SelectItem>
                    <SelectItem value="lg">Large (56rem / 896px) - Default</SelectItem>
                    <SelectItem value="xl">Extra Large (72rem / 1152px)</SelectItem>
                    <SelectItem value="2xl">2X Large (80rem / 1280px)</SelectItem>
                    <SelectItem value="full">Full Width (95vw)</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">
                  Default width for new dialogs (can be overridden per dialog)
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="default-height">Default Height</Label>
                <Select
                  value={settings?.defaultHeight || 'auto'}
                  onValueChange={(value) => updateSetting('defaultHeight', value as any)}
                >
                  <SelectTrigger id="default-height">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="auto">Auto (85vh) - Default</SelectItem>
                    <SelectItem value="sm">Small (50vh)</SelectItem>
                    <SelectItem value="md">Medium (65vh)</SelectItem>
                    <SelectItem value="lg">Large (80vh)</SelectItem>
                    <SelectItem value="xl">Extra Large (90vh)</SelectItem>
                    <SelectItem value="full">Full Height (95vh)</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">
                  Maximum height before content scrolls
                </p>
              </div>
            </div>
          </div>

          <Separator />

          <div>
            <h3 className="text-lg font-semibold mb-4">Dialog Behavior</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="fixed-headers">Fixed Headers</Label>
                  <p className="text-sm text-muted-foreground">
                    Keep dialog title and header visible while scrolling
                  </p>
                </div>
                <Switch
                  id="fixed-headers"
                  checked={settings?.enableFixedHeaders ?? true}
                  onCheckedChange={(checked) => updateSetting('enableFixedHeaders', checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="fixed-footers">Fixed Footers</Label>
                  <p className="text-sm text-muted-foreground">
                    Keep action buttons visible at the bottom while scrolling
                  </p>
                </div>
                <Switch
                  id="fixed-footers"
                  checked={settings?.enableFixedFooters ?? true}
                  onCheckedChange={(checked) => updateSetting('enableFixedFooters', checked)}
                />
              </div>
            </div>
          </div>

          <Separator />

          <div>
            <h3 className="text-lg font-semibold mb-4">Module-Specific Defaults</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Different modules use optimized dialog sizes for their content
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {Object.entries(DIALOG_MODULE_DEFAULTS).map(([module, settings]) => (
                <div key={module} className="border rounded-lg p-3 space-y-1">
                  <p className="font-medium capitalize text-sm">
                    {module.replace('-', ' ')}
                  </p>
                  <div className="text-xs text-muted-foreground space-y-0.5">
                    <p>Size: {settings.defaultSize}</p>
                    <p>Height: {settings.defaultHeight}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <Separator />

          <div className="flex items-center justify-between pt-4">
            <p className="text-sm text-muted-foreground">
              Changes apply immediately to all new dialogs
            </p>
            <Button variant="outline" onClick={handleReset}>
              Reset to Defaults
            </Button>
          </div>
        </div>
      </Card>

      <Card className="p-6 bg-muted/50">
        <h3 className="text-lg font-semibold mb-3">Tips for Optimal Dialog Display</h3>
        <ul className="space-y-2 text-sm text-muted-foreground">
          <li className="flex items-start gap-2">
            <span className="text-primary mt-0.5">•</span>
            <span>
              <strong>Small (sm)</strong> - Best for confirmations and simple alerts
            </span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-primary mt-0.5">•</span>
            <span>
              <strong>Medium (md)</strong> - Ideal for basic forms with 5-10 fields
            </span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-primary mt-0.5">•</span>
            <span>
              <strong>Large (lg)</strong> - Good for standard data entry forms
            </span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-primary mt-0.5">•</span>
            <span>
              <strong>Extra Large (xl)</strong> - Perfect for complex forms with multiple sections
            </span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-primary mt-0.5">•</span>
            <span>
              <strong>2X Large (2xl)</strong> - Designed for data tables and detailed reports
            </span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-primary mt-0.5">•</span>
            <span>
              <strong>Full Width</strong> - Reserved for dashboards and analytics views
            </span>
          </li>
        </ul>
      </Card>
    </div>
  )
}
