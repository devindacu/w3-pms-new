import { useState, useEffect } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Slider } from '@/components/ui/slider'
import { Separator } from '@/components/ui/separator'
import { useSettingState } from '@/hooks/use-api-state'
import { toast } from 'sonner'
import type { AIConfiguration, AIFeatureKey, AIModel, AIProvider } from '@/lib/types'
import {
  Brain,
  Key,
  Robot,
  Sparkle,
  Eye,
  EyeSlash,
  CheckCircle,
  WarningCircle,
  Lightning,
  ArrowsLeftRight,
  ChartLine,
  ChatCircleText,
  Star,
  ShoppingCart,
  CurrencyDollar,
  Translate,
  Spinner,
} from '@phosphor-icons/react'

const DEFAULT_CONFIG: AIConfiguration = {
  id: 'ai-config-default',
  provider: 'auto',
  openaiModel: 'gpt-4o',
  geminiModel: 'gemini-1.5-pro',
  temperature: 0.7,
  maxTokens: 1024,
  features: {
    guestMessaging: true,
    reviewReplies: true,
    bookingAssistant: true,
    demandForecasting: true,
    revenueInsights: true,
    upsellingEngine: true,
    smartPricing: false,
    autoTranslation: false,
  },
  failoverEnabled: true,
  monthlyTokenLimit: 100000,
  currentMonthTokens: 0,
  isActive: false,
  createdAt: Date.now(),
  updatedAt: Date.now(),
}

const FEATURE_LABELS: Record<AIFeatureKey, { label: string; description: string; icon: React.ReactNode }> = {
  guestMessaging: { label: 'Guest Messaging', description: 'Auto-reply to guest inquiries via WhatsApp/email', icon: <ChatCircleText size={16} /> },
  reviewReplies: { label: 'Review Reply Generator', description: 'Auto-generate replies for Google, Booking.com, Agoda reviews', icon: <Star size={16} /> },
  bookingAssistant: { label: 'Booking Assistant', description: 'Chatbot for website to answer availability & pricing', icon: <Robot size={16} /> },
  demandForecasting: { label: 'Demand Forecasting', description: 'Predict occupancy and ADR for the next 30/60/90 days', icon: <ChartLine size={16} /> },
  revenueInsights: { label: 'Revenue Insights', description: 'AI-powered revenue recommendations and alerts', icon: <CurrencyDollar size={16} /> },
  upsellingEngine: { label: 'Upselling Engine', description: 'Suggest upgrades, spa, transport, and activities to guests', icon: <ShoppingCart size={16} /> },
  smartPricing: { label: 'Smart Pricing', description: 'Automated dynamic pricing based on demand signals', icon: <Lightning size={16} /> },
  autoTranslation: { label: 'Auto Translation', description: 'Multi-language guest communication', icon: <Translate size={16} /> },
}

const OPENAI_MODELS: Array<{ value: AIModel; label: string }> = [
  { value: 'gpt-4o', label: 'GPT-4o (Recommended)' },
  { value: 'gpt-4o-mini', label: 'GPT-4o Mini (Faster & cheaper)' },
  { value: 'gpt-4-turbo', label: 'GPT-4 Turbo' },
]

const GEMINI_MODELS: Array<{ value: AIModel; label: string }> = [
  { value: 'gemini-1.5-pro', label: 'Gemini 1.5 Pro (Recommended)' },
  { value: 'gemini-1.5-flash', label: 'Gemini 1.5 Flash (Fastest)' },
  { value: 'gemini-2.0-flash', label: 'Gemini 2.0 Flash (Latest)' },
]

export function AIConfigurationSettings() {
  const [config, setConfig] = useSettingState<AIConfiguration>('ai-configuration', DEFAULT_CONFIG)
  const [showOpenAIKey, setShowOpenAIKey] = useState(false)
  const [showGeminiKey, setShowGeminiKey] = useState(false)
  const [isTesting, setIsTesting] = useState(false)
  const [usageStats, setUsageStats] = useState<{
    totalRequests: number; totalTokens: number; totalCost: number; currentMonthCost: number; successRate: number
  } | null>(null)

  const [form, setForm] = useState({
    provider: config.provider,
    openaiApiKey: config.openaiApiKey ?? '',
    geminiApiKey: config.geminiApiKey ?? '',
    openaiModel: config.openaiModel,
    geminiModel: config.geminiModel,
    temperature: config.temperature,
    maxTokens: config.maxTokens,
    failoverEnabled: config.failoverEnabled,
    monthlyTokenLimit: config.monthlyTokenLimit,
    features: { ...config.features },
  })

  // Sync form when config loads from DB
  useEffect(() => {
    setForm({
      provider: config.provider,
      openaiApiKey: config.openaiApiKey ?? '',
      geminiApiKey: config.geminiApiKey ?? '',
      openaiModel: config.openaiModel,
      geminiModel: config.geminiModel,
      temperature: config.temperature,
      maxTokens: config.maxTokens,
      failoverEnabled: config.failoverEnabled,
      monthlyTokenLimit: config.monthlyTokenLimit,
      features: { ...config.features },
    })
  }, [config])

  const handleSave = () => {
    setConfig(prev => ({
      ...prev,
      provider: form.provider,
      openaiApiKey: form.openaiApiKey || undefined,
      geminiApiKey: form.geminiApiKey || undefined,
      openaiModel: form.openaiModel,
      geminiModel: form.geminiModel,
      temperature: form.temperature,
      maxTokens: form.maxTokens,
      failoverEnabled: form.failoverEnabled,
      monthlyTokenLimit: form.monthlyTokenLimit,
      features: form.features,
      isActive: !!(form.openaiApiKey || form.geminiApiKey),
      updatedAt: Date.now(),
    }))
    toast.success('AI Configuration saved successfully')
  }

  const handleTestConnection = async () => {
    if (!form.openaiApiKey && !form.geminiApiKey) {
      toast.error('Please enter at least one API key to test')
      return
    }
    setIsTesting(true)
    try {
      // Save current form first so the server can use the keys
      handleSave()
      await new Promise(resolve => setTimeout(resolve, 500)) // wait for useSettingState debounce (500ms) to flush to the server

      const res = await fetch('/api/ai/request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: 'Reply with a single word: "Connected"',
          feature: 'general',
          maxTokens: 10,
        }),
      })
      if (res.ok) {
        const data = await res.json()
        toast.success(`Connection successful! Provider: ${data.provider}, Model: ${data.model}`)
      } else {
        const err = await res.json()
        toast.error(`Connection failed: ${err.error}`)
      }
    } catch {
      toast.error('Connection test failed. Please check your API keys.')
    } finally {
      setIsTesting(false)
    }
  }

  const loadUsageStats = async () => {
    try {
      const res = await fetch('/api/ai/usage')
      if (res.ok) {
        setUsageStats(await res.json())
      }
    } catch {
      toast.error('Failed to load usage statistics')
    }
  }

  const toggleFeature = (key: AIFeatureKey) => {
    setForm(prev => ({
      ...prev,
      features: { ...prev.features, [key]: !prev.features[key] },
    }))
  }

  const activeFeatureCount = Object.values(form.features).filter(Boolean).length

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold flex items-center gap-2">
            <Brain size={22} weight="duotone" className="text-violet-500" />
            AI Configuration
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            Configure the AI engine powering smart features across your PMS
          </p>
        </div>
        <Badge variant={config.isActive ? 'default' : 'secondary'} className="gap-1">
          {config.isActive ? <CheckCircle size={14} weight="fill" /> : <WarningCircle size={14} />}
          {config.isActive ? 'Active' : 'Not Configured'}
        </Badge>
      </div>

      {/* Provider Selection */}
      <Card className="p-5 space-y-4">
        <h3 className="font-medium flex items-center gap-2">
          <Robot size={18} className="text-blue-500" />
          AI Provider
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {(['openai', 'gemini', 'auto'] as AIProvider[]).map(p => (
            <button
              key={p}
              onClick={() => setForm(prev => ({ ...prev, provider: p }))}
              className={`p-4 rounded-lg border-2 text-left transition-all ${
                form.provider === p
                  ? 'border-violet-500 bg-violet-50 dark:bg-violet-950/30'
                  : 'border-border hover:border-muted-foreground/50'
              }`}
            >
              <div className="font-medium capitalize">
                {p === 'openai' && '🤖 OpenAI (ChatGPT)'}
                {p === 'gemini' && '🧠 Google Gemini'}
                {p === 'auto' && '⚡ Auto (Smart Routing)'}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                {p === 'openai' && 'Best for complex tasks, reports, and CRM'}
                {p === 'gemini' && 'Fast & cost-efficient for real-time responses'}
                {p === 'auto' && 'Automatically selects the best available provider'}
              </p>
            </button>
          ))}
        </div>
      </Card>

      {/* API Keys */}
      <Card className="p-5 space-y-4">
        <h3 className="font-medium flex items-center gap-2">
          <Key size={18} className="text-amber-500" />
          API Keys
        </h3>

        <div className="space-y-4">
          {/* OpenAI Key */}
          <div className="space-y-1.5">
            <Label className="flex items-center gap-1.5">
              🤖 OpenAI API Key
              {form.openaiApiKey && <CheckCircle size={14} className="text-green-500" weight="fill" />}
            </Label>
            <div className="relative">
              <Input
                type={showOpenAIKey ? 'text' : 'password'}
                placeholder="sk-..."
                value={form.openaiApiKey}
                onChange={e => setForm(prev => ({ ...prev, openaiApiKey: e.target.value }))}
                className="pr-10"
              />
              <button
                type="button"
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                onClick={() => setShowOpenAIKey(v => !v)}
              >
                {showOpenAIKey ? <EyeSlash size={16} /> : <Eye size={16} />}
              </button>
            </div>
            <p className="text-xs text-muted-foreground">
              Get your key at{' '}
              <a href="https://platform.openai.com/api-keys" target="_blank" rel="noopener noreferrer" className="text-blue-500 underline">
                platform.openai.com
              </a>
            </p>
          </div>

          <Separator />

          {/* Gemini Key */}
          <div className="space-y-1.5">
            <Label className="flex items-center gap-1.5">
              🧠 Google Gemini API Key
              {form.geminiApiKey && <CheckCircle size={14} className="text-green-500" weight="fill" />}
            </Label>
            <div className="relative">
              <Input
                type={showGeminiKey ? 'text' : 'password'}
                placeholder="AIza..."
                value={form.geminiApiKey}
                onChange={e => setForm(prev => ({ ...prev, geminiApiKey: e.target.value }))}
                className="pr-10"
              />
              <button
                type="button"
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                onClick={() => setShowGeminiKey(v => !v)}
              >
                {showGeminiKey ? <EyeSlash size={16} /> : <Eye size={16} />}
              </button>
            </div>
            <p className="text-xs text-muted-foreground">
              Get your key at{' '}
              <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noopener noreferrer" className="text-blue-500 underline">
                aistudio.google.com
              </a>
            </p>
          </div>
        </div>
      </Card>

      {/* Model Selection */}
      <Card className="p-5 space-y-4">
        <h3 className="font-medium flex items-center gap-2">
          <Sparkle size={18} className="text-violet-500" />
          Model Selection
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label>OpenAI Model</Label>
            <Select
              value={form.openaiModel}
              onValueChange={v => setForm(prev => ({ ...prev, openaiModel: v as AIModel }))}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {OPENAI_MODELS.map(m => (
                  <SelectItem key={m.value} value={m.value}>{m.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label>Gemini Model</Label>
            <Select
              value={form.geminiModel}
              onValueChange={v => setForm(prev => ({ ...prev, geminiModel: v as AIModel }))}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {GEMINI_MODELS.map(m => (
                  <SelectItem key={m.value} value={m.value}>{m.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Temperature */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label>Temperature (Creativity)</Label>
            <span className="text-sm font-mono text-muted-foreground">{form.temperature.toFixed(1)}</span>
          </div>
          <Slider
            min={0}
            max={1}
            step={0.1}
            value={[form.temperature]}
            onValueChange={([v]) => setForm(prev => ({ ...prev, temperature: v }))}
          />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>Focused (0.0)</span>
            <span>Balanced (0.7)</span>
            <span>Creative (1.0)</span>
          </div>
        </div>

        {/* Max Tokens */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label>Max Tokens per Request</Label>
            <span className="text-sm font-mono text-muted-foreground">{form.maxTokens.toLocaleString()}</span>
          </div>
          <Slider
            min={256}
            max={4096}
            step={256}
            value={[form.maxTokens]}
            onValueChange={([v]) => setForm(prev => ({ ...prev, maxTokens: v }))}
          />
        </div>
      </Card>

      {/* Feature Toggles */}
      <Card className="p-5 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-medium flex items-center gap-2">
            <Lightning size={18} className="text-orange-500" />
            Feature Toggles
          </h3>
          <Badge variant="outline">{activeFeatureCount} of {Object.keys(FEATURE_LABELS).length} enabled</Badge>
        </div>

        <div className="grid grid-cols-1 gap-3">
          {(Object.keys(FEATURE_LABELS) as AIFeatureKey[]).map(key => {
            const meta = FEATURE_LABELS[key]
            return (
              <div key={key} className="flex items-center justify-between p-3 rounded-lg border bg-muted/30">
                <div className="flex items-start gap-3">
                  <span className="text-muted-foreground mt-0.5">{meta.icon}</span>
                  <div>
                    <p className="text-sm font-medium">{meta.label}</p>
                    <p className="text-xs text-muted-foreground">{meta.description}</p>
                  </div>
                </div>
                <Switch
                  checked={form.features[key]}
                  onCheckedChange={() => toggleFeature(key)}
                />
              </div>
            )
          })}
        </div>
      </Card>

      {/* Advanced Options */}
      <Card className="p-5 space-y-4">
        <h3 className="font-medium flex items-center gap-2">
          <ArrowsLeftRight size={18} className="text-green-500" />
          Advanced Options
        </h3>

        <div className="flex items-center justify-between p-3 rounded-lg border">
          <div>
            <p className="text-sm font-medium">Failover Mode</p>
            <p className="text-xs text-muted-foreground">Automatically switch to the other provider if one fails</p>
          </div>
          <Switch
            checked={form.failoverEnabled}
            onCheckedChange={v => setForm(prev => ({ ...prev, failoverEnabled: v }))}
          />
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label>Monthly Token Limit</Label>
            <span className="text-sm font-mono text-muted-foreground">{form.monthlyTokenLimit.toLocaleString()}</span>
          </div>
          <Slider
            min={10000}
            max={1000000}
            step={10000}
            value={[form.monthlyTokenLimit]}
            onValueChange={([v]) => setForm(prev => ({ ...prev, monthlyTokenLimit: v }))}
          />
          <p className="text-xs text-muted-foreground">Stop AI requests when this limit is reached to control costs</p>
        </div>
      </Card>

      {/* Usage Stats */}
      {usageStats && (
        <Card className="p-5 space-y-4">
          <h3 className="font-medium flex items-center gap-2">
            <ChartLine size={18} className="text-blue-500" />
            Usage Statistics
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
            <div className="text-center">
              <p className="text-2xl font-bold">{usageStats.totalRequests.toLocaleString()}</p>
              <p className="text-xs text-muted-foreground">Total Requests</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold">{(usageStats.totalTokens / 1000).toFixed(1)}K</p>
              <p className="text-xs text-muted-foreground">Total Tokens</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold">${usageStats.totalCost.toFixed(4)}</p>
              <p className="text-xs text-muted-foreground">Total Cost</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold">${usageStats.currentMonthCost.toFixed(4)}</p>
              <p className="text-xs text-muted-foreground">This Month</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold">{usageStats.successRate.toFixed(0)}%</p>
              <p className="text-xs text-muted-foreground">Success Rate</p>
            </div>
          </div>
        </Card>
      )}

      {!config.isActive && (
        <Alert>
          <WarningCircle size={16} />
          <AlertDescription>
            AI features are <strong>not active</strong>. Enter at least one API key and save to enable.
          </AlertDescription>
        </Alert>
      )}

      {/* Action Buttons */}
      <div className="flex flex-wrap gap-3">
        <Button onClick={handleSave} className="gap-2">
          <CheckCircle size={16} />
          Save Configuration
        </Button>
        <Button variant="outline" onClick={handleTestConnection} disabled={isTesting} className="gap-2">
          {isTesting ? <Spinner size={16} className="animate-spin" /> : <Lightning size={16} />}
          Test Connection
        </Button>
        <Button variant="ghost" onClick={loadUsageStats} className="gap-2">
          <ChartLine size={16} />
          Load Usage Stats
        </Button>
      </div>
    </div>
  )
}
