import { useState, useEffect } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Separator } from '@/components/ui/separator'
import { useSettingState } from '@/hooks/use-api-state'
import { toast } from 'sonner'
import type { SystemUser } from '@/lib/types'
import {
  MapPin,
  Eye,
  EyeSlash,
  CheckCircle,
  WarningCircle,
  Info,
  Spinner,
  Key,
  Plug,
  Trash,
} from '@phosphor-icons/react'

interface ApiIntegrationsConfig {
  googlePlacesApiKey?: string
  googlePlacesStatus?: 'connected' | 'error' | 'unconfigured'
  googlePlacesLastTested?: number
  googlePlacesError?: string
  updatedAt?: number
  updatedBy?: string
}

interface ApiIntegrationsSettingsProps {
  currentUser: SystemUser
}

export function ApiIntegrationsSettings({ currentUser }: ApiIntegrationsSettingsProps) {
  const [config, setConfig] = useSettingState<ApiIntegrationsConfig>('api-integrations', {})

  const [googleKey, setGoogleKey] = useState(config?.googlePlacesApiKey || '')
  const [showKey, setShowKey] = useState(false)
  const [isEditing, setIsEditing] = useState(!config?.googlePlacesApiKey)
  const [isTesting, setIsTesting] = useState(false)

  useEffect(() => {
    setGoogleKey(config?.googlePlacesApiKey || '')
    if (config?.googlePlacesApiKey) setIsEditing(false)
  }, [config?.googlePlacesApiKey])

  const handleSave = () => {
    if (!googleKey.trim()) {
      toast.error('Please enter a valid API key')
      return
    }

    setConfig((prev) => ({
      ...prev,
      googlePlacesApiKey: googleKey.trim(),
      googlePlacesStatus: 'unconfigured',
      updatedAt: Date.now(),
      updatedBy: currentUser.id,
    }))

    setIsEditing(false)
    toast.success('Google Places API key saved — click "Test Connection" to verify it works')
  }

  const handleTest = async () => {
    const keyToTest = googleKey.trim() || config?.googlePlacesApiKey
    if (!keyToTest) {
      toast.error('Enter an API key first')
      return
    }

    setIsTesting(true)
    try {
      const resp = await fetch('/api/reviews/test-google-places-key', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ apiKey: keyToTest }),
      })
      const data = await resp.json()

      if (data.success) {
        setConfig((prev) => ({
          ...prev,
          googlePlacesApiKey: keyToTest,
          googlePlacesStatus: 'connected',
          googlePlacesLastTested: Date.now(),
          googlePlacesError: undefined,
          updatedAt: Date.now(),
          updatedBy: currentUser.id,
        }))
        setIsEditing(false)
        toast.success(`Google Places API key is valid! (${data.detail || 'Connection successful'})`)
      } else {
        setConfig((prev) => ({
          ...prev,
          googlePlacesStatus: 'error',
          googlePlacesLastTested: Date.now(),
          googlePlacesError: data.error || 'Unknown error',
          updatedAt: Date.now(),
        }))
        toast.error(`API key test failed: ${data.error || 'Unknown error'}`)
      }
    } catch (err) {
      toast.error('Could not reach server to test API key')
    } finally {
      setIsTesting(false)
    }
  }

  const handleRemove = () => {
    setConfig((prev) => ({
      ...prev,
      googlePlacesApiKey: undefined,
      googlePlacesStatus: 'unconfigured',
      googlePlacesLastTested: undefined,
      googlePlacesError: undefined,
      updatedAt: Date.now(),
      updatedBy: currentUser.id,
    }))
    setGoogleKey('')
    setIsEditing(true)
    toast.info('Google Places API key removed')
  }

  const status = config?.googlePlacesStatus || 'unconfigured'
  const hasKey = !!config?.googlePlacesApiKey

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold">API Integrations</h2>
        <p className="text-sm text-muted-foreground mt-1">
          Configure third-party API keys to enable live data features across the system
        </p>
      </div>

      <Card className="p-6 space-y-6">
        <div className="flex items-start gap-3">
          <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900/30">
            <MapPin size={22} className="text-blue-600 dark:text-blue-400" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="font-semibold text-base">Google Places API</h3>
              {status === 'connected' && (
                <Badge className="bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 gap-1">
                  <CheckCircle size={12} />
                  Connected
                </Badge>
              )}
              {status === 'error' && (
                <Badge variant="destructive" className="gap-1">
                  <WarningCircle size={12} />
                  Error
                </Badge>
              )}
              {status === 'unconfigured' && hasKey && (
                <Badge variant="secondary" className="gap-1">
                  <Key size={12} />
                  Saved (untested)
                </Badge>
              )}
              {!hasKey && (
                <Badge variant="outline" className="gap-1 text-muted-foreground">
                  Not configured
                </Badge>
              )}
            </div>
            <p className="text-sm text-muted-foreground mt-1">
              Enables live review imports from Google Maps — up to 5 real guest reviews per sync, with overall rating and total count.
            </p>
          </div>
        </div>

        <Separator />

        {config?.googlePlacesError && status === 'error' && (
          <Alert variant="destructive">
            <WarningCircle size={16} />
            <AlertDescription>{config.googlePlacesError}</AlertDescription>
          </Alert>
        )}

        {status === 'connected' && config?.googlePlacesLastTested && (
          <Alert className="border-green-200 bg-green-50 dark:bg-green-900/10">
            <CheckCircle size={16} className="text-green-600" />
            <AlertDescription className="text-green-700 dark:text-green-400">
              Key verified {new Date(config.googlePlacesLastTested).toLocaleString()}. Review sync will use real Google Maps data.
            </AlertDescription>
          </Alert>
        )}

        {isEditing ? (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="places-api-key">API Key</Label>
              <div className="relative">
                <Input
                  id="places-api-key"
                  type={showKey ? 'text' : 'password'}
                  value={googleKey}
                  onChange={(e) => setGoogleKey(e.target.value)}
                  placeholder="AIza..."
                  className="pr-10 font-mono text-sm"
                  autoComplete="off"
                />
                <button
                  type="button"
                  onClick={() => setShowKey((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showKey ? <EyeSlash size={16} /> : <Eye size={16} />}
                </button>
              </div>
              <p className="text-xs text-muted-foreground">
                Create a key at{' '}
                <a
                  href="https://console.cloud.google.com/apis/credentials"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline hover:text-foreground"
                >
                  console.cloud.google.com
                </a>{' '}
                with the <strong>Places API</strong> enabled.
              </p>
            </div>

            <Alert>
              <Info size={16} />
              <AlertDescription>
                <strong>Required API:</strong> Enable the <em>Places API</em> (not Places API New) in your Google Cloud project. The free tier includes 40 requests/day — more than enough for regular review syncing.
              </AlertDescription>
            </Alert>

            <div className="flex gap-2 flex-wrap">
              <Button onClick={handleSave} disabled={!googleKey.trim()}>
                Save Key
              </Button>
              <Button
                variant="outline"
                onClick={handleTest}
                disabled={isTesting || !googleKey.trim()}
                className="gap-2"
              >
                {isTesting ? (
                  <>
                    <Spinner size={16} className="animate-spin" />
                    Testing...
                  </>
                ) : (
                  <>
                    <Plug size={16} />
                    Test & Save
                  </>
                )}
              </Button>
              {hasKey && (
                <Button variant="ghost" onClick={() => { setGoogleKey(config?.googlePlacesApiKey || ''); setIsEditing(false) }}>
                  Cancel
                </Button>
              )}
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-3 flex-wrap">
            <div className="flex items-center gap-2 text-sm text-muted-foreground bg-muted rounded px-3 py-2 font-mono flex-1 min-w-0">
              <Key size={14} />
              <span className="truncate">
                {config?.googlePlacesApiKey
                  ? `${config.googlePlacesApiKey.substring(0, 8)}${'•'.repeat(20)}`
                  : '—'}
              </span>
            </div>
            <Button variant="outline" size="sm" onClick={() => setIsEditing(true)}>
              Edit
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleTest}
              disabled={isTesting}
              className="gap-1"
            >
              {isTesting ? <Spinner size={14} className="animate-spin" /> : <Plug size={14} />}
              Test
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleRemove}
              className="gap-1 text-destructive hover:text-destructive"
            >
              <Trash size={14} />
              Remove
            </Button>
          </div>
        )}
      </Card>

      <Card className="p-5 border-dashed opacity-60">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-muted">
            <Plug size={20} className="text-muted-foreground" />
          </div>
          <div>
            <p className="font-medium text-sm">More integrations coming soon</p>
            <p className="text-xs text-muted-foreground mt-0.5">
              TripAdvisor Content API, Booking.com Partner API, and social media integrations will be added here.
            </p>
          </div>
        </div>
      </Card>
    </div>
  )
}
