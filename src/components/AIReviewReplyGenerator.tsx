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
  Star,
  Brain,
  Sparkle,
  Copy,
  Spinner,
  CheckCircle,
} from '@phosphor-icons/react'

type Tone = 'friendly' | 'professional' | 'apologetic'

interface ReviewReplyState {
  reviewText: string
  rating: string
  guestName: string
  platform: string
  tone: Tone
  generatedReply: string
  provider: string
  model: string
}

const PLATFORMS = ['Google Reviews', 'Booking.com', 'Agoda', 'Airbnb', 'TripAdvisor', 'Expedia']

const TONE_DESCRIPTIONS: Record<Tone, string> = {
  friendly: 'Warm, approachable, and personable',
  professional: 'Formal and business-like',
  apologetic: 'Empathetic and apologetic for shortcomings',
}

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex gap-0.5">
      {Array.from({ length: 5 }, (_, i) => (
        <Star
          key={i}
          size={16}
          weight={i < rating ? 'fill' : 'regular'}
          className={i < rating ? 'text-amber-400' : 'text-muted-foreground/30'}
        />
      ))}
    </div>
  )
}

interface AIReviewReplyGeneratorProps {
  branding?: { hotelName?: string } | null
}

export function AIReviewReplyGenerator({ branding }: AIReviewReplyGeneratorProps) {
  const [state, setState] = useState<ReviewReplyState>({
    reviewText: '',
    rating: '4',
    guestName: '',
    platform: 'Google Reviews',
    tone: 'professional',
    generatedReply: '',
    provider: '',
    model: '',
  })
  const [isGenerating, setIsGenerating] = useState(false)
  const [copied, setCopied] = useState(false)

  const hotelName = branding?.hotelName ?? 'Our Hotel'

  const handleGenerate = async () => {
    if (!state.reviewText.trim()) {
      toast.error('Please enter the review text')
      return
    }
    setIsGenerating(true)
    try {
      const res = await fetch('/api/ai/review-reply', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          reviewText: state.reviewText,
          rating: Number(state.rating),
          guestName: state.guestName || 'Guest',
          platform: state.platform,
          tone: state.tone,
          hotelName,
        }),
      })
      if (!res.ok) {
        const err = await res.json()
        toast.error(err.error ?? 'Failed to generate reply')
        return
      }
      const data = await res.json()
      setState(prev => ({ ...prev, generatedReply: data.reply, provider: data.provider, model: data.model }))
      toast.success(`Reply generated using ${data.provider} (${data.model})`)
    } catch {
      toast.error('Failed to generate reply. Please check AI configuration in Settings.')
    } finally {
      setIsGenerating(false)
    }
  }

  const handleCopy = async () => {
    if (!state.generatedReply) return
    await navigator.clipboard.writeText(state.generatedReply)
    setCopied(true)
    toast.success('Reply copied to clipboard')
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold flex items-center gap-2">
          <Star size={22} weight="duotone" className="text-amber-500" />
          AI Review Reply Generator
        </h2>
        <p className="text-sm text-muted-foreground mt-1">
          Auto-generate professional replies to guest reviews with tone control
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Input Panel */}
        <Card className="p-5 space-y-4">
          <h3 className="font-medium text-sm text-muted-foreground uppercase tracking-wide">Review Details</h3>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>Guest Name</Label>
              <Input
                placeholder="e.g. John Smith"
                value={state.guestName}
                onChange={e => setState(prev => ({ ...prev, guestName: e.target.value }))}
              />
            </div>
            <div className="space-y-1.5">
              <Label>Platform</Label>
              <Select
                value={state.platform}
                onValueChange={v => setState(prev => ({ ...prev, platform: v }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {PLATFORMS.map(p => (
                    <SelectItem key={p} value={p}>{p}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-1.5">
            <Label>Rating</Label>
            <div className="flex items-center gap-3">
              <Select
                value={state.rating}
                onValueChange={v => setState(prev => ({ ...prev, rating: v }))}
              >
                <SelectTrigger className="w-28">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {[5, 4, 3, 2, 1].map(r => (
                    <SelectItem key={r} value={String(r)}>{r} Stars</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <StarRating rating={Number(state.rating)} />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label>Review Text</Label>
            <Textarea
              placeholder="Paste the guest review here..."
              value={state.reviewText}
              onChange={e => setState(prev => ({ ...prev, reviewText: e.target.value }))}
              rows={5}
            />
          </div>

          <div className="space-y-1.5">
            <Label>Reply Tone</Label>
            <div className="grid grid-cols-3 gap-2">
              {(['friendly', 'professional', 'apologetic'] as Tone[]).map(t => (
                <button
                  key={t}
                  onClick={() => setState(prev => ({ ...prev, tone: t }))}
                  className={`p-2.5 rounded-lg border text-left transition-all ${
                    state.tone === t
                      ? 'border-violet-500 bg-violet-50 dark:bg-violet-950/30'
                      : 'border-border hover:border-muted-foreground/50'
                  }`}
                >
                  <p className="text-xs font-medium capitalize">{t}</p>
                  <p className="text-[10px] text-muted-foreground mt-0.5">{TONE_DESCRIPTIONS[t]}</p>
                </button>
              ))}
            </div>
          </div>

          <Button
            onClick={handleGenerate}
            disabled={isGenerating || !state.reviewText.trim()}
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
            {state.provider && (
              <Badge variant="outline" className="gap-1 text-xs">
                <Brain size={12} />
                {state.provider} · {state.model}
              </Badge>
            )}
          </div>

          {state.generatedReply ? (
            <div className="space-y-3">
              <div className="p-4 rounded-lg bg-muted/50 border min-h-[160px]">
                <p className="text-sm leading-relaxed whitespace-pre-wrap">{state.generatedReply}</p>
              </div>
              <Button variant="outline" onClick={handleCopy} className="w-full gap-2">
                {copied ? <CheckCircle size={16} className="text-green-500" /> : <Copy size={16} />}
                {copied ? 'Copied!' : 'Copy to Clipboard'}
              </Button>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center min-h-[200px] text-center text-muted-foreground">
              <Star size={48} className="mb-3 opacity-20" />
              <p className="font-medium">No reply generated yet</p>
              <p className="text-sm mt-1">Fill in the review details and click generate</p>
            </div>
          )}
        </Card>
      </div>
    </div>
  )
}
