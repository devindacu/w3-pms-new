import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Separator } from '@/components/ui/separator'
import { Badge } from '@/components/ui/badge'
import {
  EnvelopeSimple,
  Lock,
  CheckCircle,
  XCircle,
  WifiHigh,
  PaperPlaneTilt,
  Eye,
  EyeSlash,
  FloppyDisk,
} from '@phosphor-icons/react'
import { toast } from 'sonner'

interface SMTPSettings {
  host: string
  port: number
  secure: boolean
  user: string
  password: string
  fromName: string
  fromEmail: string
  replyTo: string
}

const DEFAULT_SETTINGS: SMTPSettings = {
  host: '',
  port: 587,
  secure: false,
  user: '',
  password: '',
  fromName: 'W3 Hotel PMS',
  fromEmail: '',
  replyTo: '',
}

const PRESETS: Array<{ label: string; host: string; port: number; secure: boolean }> = [
  { label: 'Gmail', host: 'smtp.gmail.com', port: 587, secure: false },
  { label: 'Gmail (SSL)', host: 'smtp.gmail.com', port: 465, secure: true },
  { label: 'Outlook / Office 365', host: 'smtp.office365.com', port: 587, secure: false },
  { label: 'Yahoo Mail', host: 'smtp.mail.yahoo.com', port: 587, secure: false },
  { label: 'SendGrid', host: 'smtp.sendgrid.net', port: 587, secure: false },
  { label: 'Mailgun', host: 'smtp.mailgun.org', port: 587, secure: false },
  { label: 'Amazon SES', host: 'email-smtp.us-east-1.amazonaws.com', port: 587, secure: false },
  { label: 'Zoho Mail', host: 'smtp.zoho.com', port: 587, secure: false },
]

export function EmailSMTPSettings() {
  const [settings, setSettings] = useState<SMTPSettings>(DEFAULT_SETTINGS)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [verifying, setVerifying] = useState(false)
  const [sendingTest, setSendingTest] = useState(false)
  const [connectionStatus, setConnectionStatus] = useState<'unknown' | 'ok' | 'error'>('unknown')
  const [connectionMsg, setConnectionMsg] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [testRecipient, setTestRecipient] = useState('')

  useEffect(() => {
    fetch('/api/email-settings')
      .then(r => r.json())
      .then(data => {
        if (data) setSettings(s => ({ ...s, ...data }))
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  function set<K extends keyof SMTPSettings>(field: K, value: SMTPSettings[K]) {
    setSettings(s => ({ ...s, [field]: value }))
    setConnectionStatus('unknown')
  }

  function applyPreset(preset: (typeof PRESETS)[number]) {
    setSettings(s => ({ ...s, host: preset.host, port: preset.port, secure: preset.secure }))
    setConnectionStatus('unknown')
  }

  async function save() {
    if (!settings.host || !settings.user || !settings.fromEmail) {
      toast.error('SMTP host, username, and from email are required')
      return
    }
    setSaving(true)
    try {
      const resp = await fetch('/api/email-settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings),
      })
      if (!resp.ok) throw new Error((await resp.json()).error || 'Save failed')
      toast.success('SMTP settings saved')
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to save')
    } finally {
      setSaving(false)
    }
  }

  async function verifyConnection() {
    setVerifying(true)
    setConnectionStatus('unknown')
    try {
      // Save first so the server uses the latest settings
      const saveResp = await fetch('/api/email-settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings),
      })
      if (!saveResp.ok) throw new Error((await saveResp.json()).error || 'Save failed')

      const resp = await fetch('/api/email/verify', { method: 'POST' })
      const data = await resp.json()
      if (!resp.ok || data.error) {
        setConnectionStatus('error')
        setConnectionMsg(data.error || 'Connection failed')
        toast.error(`SMTP test failed: ${data.error}`)
      } else {
        setConnectionStatus('ok')
        setConnectionMsg(data.message || 'Connected')
        toast.success('SMTP connection verified!')
      }
    } catch (err) {
      setConnectionStatus('error')
      setConnectionMsg(err instanceof Error ? err.message : 'Connection failed')
      toast.error('SMTP verification failed')
    } finally {
      setVerifying(false)
    }
  }

  async function sendTestEmail() {
    if (!testRecipient) { toast.error('Enter a recipient email address'); return }
    setSendingTest(true)
    try {
      const resp = await fetch('/api/email/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ to: testRecipient }),
      })
      const data = await resp.json()
      if (!resp.ok || data.error) {
        toast.error(data.error || 'Failed to send test email')
      } else {
        toast.success(data.message || `Test email sent to ${testRecipient}`)
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to send test email')
    } finally {
      setSendingTest(false)
    }
  }

  if (loading) return <p className="text-muted-foreground py-4">Loading SMTP settings…</p>

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-xl font-semibold">SMTP Email Configuration</h2>
          <p className="text-sm text-muted-foreground mt-1">
            Configure your outgoing email server. Emails for invoices, notifications, and guest
            communications will be sent via these settings.
          </p>
        </div>
        <div className="flex items-center gap-2">
          {connectionStatus === 'ok' && (
            <Badge className="gap-1 bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 border-green-200">
              <CheckCircle size={12} />
              Connected
            </Badge>
          )}
          {connectionStatus === 'error' && (
            <Badge variant="destructive" className="gap-1">
              <XCircle size={12} />
              Error
            </Badge>
          )}
        </div>
      </div>

      {/* Quick Presets */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Quick Presets</CardTitle>
          <CardDescription>Select a provider to pre-fill host and port settings</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {PRESETS.map(p => (
              <Button
                key={p.label}
                variant="outline"
                size="sm"
                onClick={() => applyPreset(p)}
                className={
                  settings.host === p.host && settings.port === p.port
                    ? 'border-primary text-primary'
                    : ''
                }
              >
                {p.label}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Server Settings */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <WifiHigh size={16} />
            Server Settings
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="sm:col-span-2 space-y-1">
              <Label>SMTP Host *</Label>
              <Input
                placeholder="smtp.gmail.com"
                value={settings.host}
                onChange={e => set('host', e.target.value)}
              />
            </div>
            <div className="space-y-1">
              <Label>Port *</Label>
              <Input
                type="number"
                placeholder="587"
                value={settings.port}
                onChange={e => set('port', parseInt(e.target.value) || 587)}
              />
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Switch
              id="secure"
              checked={settings.secure}
              onCheckedChange={v => set('secure', v)}
            />
            <div>
              <Label htmlFor="secure" className="cursor-pointer">Use SSL/TLS</Label>
              <p className="text-xs text-muted-foreground">
                Enable for port 465 (SSL). Leave off for port 587 (STARTTLS).
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Authentication */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Lock size={16} />
            Authentication
          </CardTitle>
          <CardDescription>
            For Gmail, use an{' '}
            <a
              href="https://support.google.com/accounts/answer/185833"
              target="_blank"
              rel="noopener noreferrer"
              className="underline text-primary"
            >
              App Password
            </a>{' '}
            (requires 2-Factor Authentication).
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <Label>SMTP Username *</Label>
              <Input
                type="email"
                placeholder="your@email.com"
                value={settings.user}
                onChange={e => set('user', e.target.value)}
                autoComplete="email"
              />
            </div>
            <div className="space-y-1">
              <Label>SMTP Password *</Label>
              <div className="relative">
                <Input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="App password or SMTP password"
                  value={settings.password}
                  onChange={e => set('password', e.target.value)}
                  autoComplete="new-password"
                  className="pr-10"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute right-0 top-0 h-9 w-9"
                  onClick={() => setShowPassword(v => !v)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeSlash size={16} /> : <Eye size={16} />}
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Sender Info */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <EnvelopeSimple size={16} />
            Sender Information
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <Label>From Name *</Label>
              <Input
                placeholder="W3 Hotel PMS"
                value={settings.fromName}
                onChange={e => set('fromName', e.target.value)}
              />
            </div>
            <div className="space-y-1">
              <Label>From Email *</Label>
              <Input
                type="email"
                placeholder="noreply@yourhotel.com"
                value={settings.fromEmail}
                onChange={e => set('fromEmail', e.target.value)}
              />
            </div>
            <div className="space-y-1">
              <Label>Reply-To Email <span className="text-muted-foreground font-normal">(optional)</span></Label>
              <Input
                type="email"
                placeholder="reception@yourhotel.com"
                value={settings.replyTo}
                onChange={e => set('replyTo', e.target.value)}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Action buttons */}
      <div className="flex flex-wrap gap-3">
        <Button onClick={save} disabled={saving} className="gap-2">
          <FloppyDisk size={16} />
          {saving ? 'Saving…' : 'Save Settings'}
        </Button>
        <Button
          variant="outline"
          onClick={verifyConnection}
          disabled={verifying || !settings.host || !settings.user}
          className="gap-2"
        >
          <WifiHigh size={16} />
          {verifying ? 'Verifying…' : 'Test Connection'}
        </Button>
      </div>

      {connectionMsg && connectionStatus !== 'unknown' && (
        <div
          className={`rounded-md px-4 py-3 text-sm flex items-center gap-2 ${
            connectionStatus === 'ok'
              ? 'bg-green-50 text-green-700 border border-green-200 dark:bg-green-900/20 dark:text-green-400 dark:border-green-800'
              : 'bg-destructive/10 text-destructive border border-destructive/20'
          }`}
        >
          {connectionStatus === 'ok' ? <CheckCircle size={16} /> : <XCircle size={16} />}
          {connectionMsg}
        </div>
      )}

      <Separator />

      {/* Send Test Email */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <PaperPlaneTilt size={16} />
            Send Test Email
          </CardTitle>
          <CardDescription>
            Send a test email to verify end-to-end delivery after saving your SMTP settings.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-3 max-w-lg">
            <Input
              type="email"
              placeholder="recipient@example.com"
              value={testRecipient}
              onChange={e => setTestRecipient(e.target.value)}
              className="flex-1"
            />
            <Button
              onClick={sendTestEmail}
              disabled={sendingTest || !testRecipient}
              variant="secondary"
              className="gap-2 shrink-0"
            >
              <PaperPlaneTilt size={16} />
              {sendingTest ? 'Sending…' : 'Send Test Email'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
