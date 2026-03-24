import { useState } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { toast } from 'sonner'
import {
  ChatCircleText,
  Brain,
  Sparkle,
  Copy,
  Spinner,
  CheckCircle,
  Translate,
} from '@phosphor-icons/react'

const LANGUAGES = [
  { value: 'auto', label: 'Auto (detect from message)' },
  { value: 'English', label: 'English' },
  { value: 'Chinese', label: 'Chinese (Mandarin)' },
  { value: 'Japanese', label: 'Japanese' },
  { value: 'Korean', label: 'Korean' },
  { value: 'French', label: 'French' },
  { value: 'German', label: 'German' },
  { value: 'Spanish', label: 'Spanish' },
  { value: 'Arabic', label: 'Arabic' },
  { value: 'Russian', label: 'Russian' },
  { value: 'Sinhala', label: 'Sinhala' },
  { value: 'Tamil', label: 'Tamil' },
]

const CONTEXT_PRESETS = [
  { label: 'Check-in 3 PM, Check-out 12 PM', value: 'Check-in time is 3:00 PM and check-out is 12:00 PM noon.' },
  { label: 'Free WiFi available', value: 'Complimentary WiFi is available throughout the property.' },
  { label: 'Pool & spa on site', value: 'We have a swimming pool (8 AM–8 PM) and a spa (by appointment).' },
  { label: 'Airport transfer available', value: 'Airport transfer can be arranged at an additional cost.' },
]

interface AIGuestMessagingProps {
  branding?: { hotelName?: string } | null
}

export function AIGuestMessaging({ branding }: AIGuestMessagingProps) {
  const [guestName, setGuestName] = useState('')
  const [guestMessage, setGuestMessage] = useState('')
  const [language, setLanguage] = useState('auto')
  const [context, setContext] = useState('')
  const [generatedReply, setGeneratedReply] = useState('')
  const [provider, setProvider] = useState('')
  const [model, setModel] = useState('')
  const [isGenerating, setIsGenerating] = useState(false)
  const [copied, setCopied] = useState(false)

  const hotelName = branding?.hotelName ?? 'Our Hotel'

  const handleGenerate = async () => {
    if (!guestMessage.trim()) {
      toast.error('Please enter the guest message')
      return
    }
    setIsGenerating(true)
    try {
      const res = await fetch('/api/ai/guest-message', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          guestName: guestName || 'Guest',
          guestMessage,
          language: language === 'auto' ? undefined : language,
          context: context || undefined,
          hotelName,
        }),
      })
      if (!res.ok) {
        const err = await res.json()
        toast.error(err.error ?? 'Failed to generate reply')
        return
      }
      const data = await res.json()
      setGeneratedReply(data.reply)
      setProvider(data.provider)
      setModel(data.model)
      toast.success(`Reply generated using ${data.provider} (${data.model})`)
    } catch {
      toast.error('Failed to generate reply. Please check AI configuration in Settings.')
    } finally {
      setIsGenerating(false)
    }
  }

  const handleCopy = async () => {
    if (!generatedReply) return
    await navigator.clipboard.writeText(generatedReply)
    setCopied(true)
    toast.success('Reply copied to clipboard')
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold flex items-center gap-2">
          <ChatCircleText size={22} weight="duotone" className="text-blue-500" />
          AI Guest Messaging
        </h2>
        <p className="text-sm text-muted-foreground mt-1">
          Auto-reply to guest inquiries with multi-language support
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Input Panel */}
        <Card className="p-5 space-y-4">
          <h3 className="font-medium text-sm text-muted-foreground uppercase tracking-wide">Guest Inquiry</h3>

          <div className="space-y-1.5">
            <Label>Guest Name (optional)</Label>
            <Input
              placeholder="e.g. Tanaka San"
              value={guestName}
              onChange={e => setGuestName(e.target.value)}
            />
          </div>

          <div className="space-y-1.5">
            <Label>Guest Message</Label>
            <Textarea
              placeholder="Paste or type the guest message here..."
              value={guestMessage}
              onChange={e => setGuestMessage(e.target.value)}
              rows={5}
            />
          </div>

          <div className="space-y-1.5">
            <Label className="flex items-center gap-1.5">
              <Translate size={14} />
              Reply Language
            </Label>
            <Select value={language} onValueChange={setLanguage}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {LANGUAGES.map(l => (
                  <SelectItem key={l.value} value={l.value}>{l.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label>Hotel Context (optional)</Label>
            <Textarea
              placeholder="Add hotel-specific details the AI should know..."
              value={context}
              onChange={e => setContext(e.target.value)}
              rows={3}
            />
            <div className="flex flex-wrap gap-1.5">
              {CONTEXT_PRESETS.map(preset => (
                <button
                  key={preset.label}
                  onClick={() => setContext(prev => prev ? `${prev}\n${preset.value}` : preset.value)}
                  className="text-xs px-2 py-1 rounded-full border border-dashed hover:bg-muted transition-colors"
                >
                  + {preset.label}
                </button>
              ))}
            </div>
          </div>

          <Button
            onClick={handleGenerate}
            disabled={isGenerating || !guestMessage.trim()}
            className="w-full gap-2"
          >
            {isGenerating ? <Spinner size={16} className="animate-spin" /> : <Sparkle size={16} />}
            {isGenerating ? 'Generating Reply…' : 'Generate AI Reply'}
          </Button>
        </Card>

        {/* Output Panel */}
        <Card className="p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-medium text-sm text-muted-foreground uppercase tracking-wide">Generated Reply</h3>
            {provider && (
              <Badge variant="outline" className="gap-1 text-xs">
                <Brain size={12} />
                {provider} · {model}
              </Badge>
            )}
          </div>

          {generatedReply ? (
            <div className="space-y-3">
              <div className="p-4 rounded-lg bg-muted/50 border min-h-[180px]">
                <p className="text-sm leading-relaxed whitespace-pre-wrap">{generatedReply}</p>
              </div>
              <Button variant="outline" onClick={handleCopy} className="w-full gap-2">
                {copied ? <CheckCircle size={16} className="text-green-500" /> : <Copy size={16} />}
                {copied ? 'Copied!' : 'Copy to Clipboard'}
              </Button>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center min-h-[200px] text-center text-muted-foreground">
              <ChatCircleText size={48} className="mb-3 opacity-20" />
              <p className="font-medium">No reply generated yet</p>
              <p className="text-sm mt-1">Enter the guest message and click generate</p>
            </div>
          )}
        </Card>
      </div>
    </div>
  )
}
