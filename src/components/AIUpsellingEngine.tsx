import { useState } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { toast } from 'sonner'
import type { Reservation } from '@/lib/types'
import {
  ShoppingCart,
  Sparkle,
  Spinner,
  Brain,
  Bed,
  FirstAid,
  ForkKnife,
  Airplane,
  MapPin,
} from '@phosphor-icons/react'

type UpsellType = 'room-upgrade' | 'spa' | 'dining' | 'transport' | 'activity'

interface UpsellSuggestion {
  type: UpsellType
  title: string
  description: string
  estimatedPrice: number
  confidence: number
}

const TYPE_ICONS: Record<UpsellType, React.ReactNode> = {
  'room-upgrade': <Bed size={18} />,
  spa: <FirstAid size={18} />,
  dining: <ForkKnife size={18} />,
  transport: <Airplane size={18} />,
  activity: <MapPin size={18} />,
}

const TYPE_COLORS: Record<UpsellType, string> = {
  'room-upgrade': 'text-violet-600 bg-violet-50 border-violet-200',
  spa: 'text-rose-600 bg-rose-50 border-rose-200',
  dining: 'text-orange-600 bg-orange-50 border-orange-200',
  transport: 'text-blue-600 bg-blue-50 border-blue-200',
  activity: 'text-green-600 bg-green-50 border-green-200',
}

interface AIUpsellingEngineProps {
  reservations: Reservation[]
  branding?: { hotelName?: string } | null
}

export function AIUpsellingEngine({ reservations, branding }: AIUpsellingEngineProps) {
  const [guestName, setGuestName] = useState('')
  const [roomType, setRoomType] = useState('Standard Room')
  const [checkInDate, setCheckInDate] = useState('')
  const [checkOutDate, setCheckOutDate] = useState('')
  const [suggestions, setSuggestions] = useState<UpsellSuggestion[]>([])
  const [provider, setProvider] = useState('')
  const [model, setModel] = useState('')
  const [isGenerating, setIsGenerating] = useState(false)
  const [rawText, setRawText] = useState('')

  const hotelName = branding?.hotelName ?? 'Our Hotel'

  const handleLoadFromReservation = (reservationId: string) => {
    const res = reservations.find(r => r.id === reservationId)
    if (!res) return
    setGuestName(res.guestId ?? '')
    setCheckInDate(res.checkInDate ? new Date(res.checkInDate).toISOString().split('T')[0] : '')
    setCheckOutDate(res.checkOutDate ? new Date(res.checkOutDate).toISOString().split('T')[0] : '')
  }

  const handleGenerate = async () => {
    setIsGenerating(true)
    setSuggestions([])
    setRawText('')
    try {
      const res = await fetch('/api/ai/upsell-suggestions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          guestName: guestName || 'Valued Guest',
          roomType: roomType || 'Standard Room',
          checkInDate: checkInDate || new Date().toISOString().split('T')[0],
          checkOutDate: checkOutDate || new Date(Date.now() + 3 * 86400000).toISOString().split('T')[0],
          hotelName,
          availableServices: ['Deluxe Room Upgrade', 'Spa Treatment', 'Airport Transfer', 'Candlelight Dinner', 'City Tour', 'Swimming Pool Access', 'Breakfast Package'],
        }),
      })
      if (!res.ok) {
        const err = await res.json()
        toast.error(err.error ?? 'Failed to generate upsell suggestions')
        return
      }
      const data = await res.json()
      setSuggestions(Array.isArray(data.suggestions) ? data.suggestions as UpsellSuggestion[] : [])
      setRawText(data.rawText ?? '')
      setProvider(data.provider)
      setModel(data.model)
      toast.success(`Generated ${Array.isArray(data.suggestions) ? data.suggestions.length : 0} upsell suggestions`)
    } catch {
      toast.error('Failed to generate suggestions. Please check AI configuration in Settings.')
    } finally {
      setIsGenerating(false)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold flex items-center gap-2">
          <ShoppingCart size={22} weight="duotone" className="text-orange-500" />
          AI Upselling Engine
        </h2>
        <p className="text-sm text-muted-foreground mt-1">
          AI-powered upsell suggestions for room upgrades, spa, dining, and more
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Input */}
        <Card className="p-5 space-y-4">
          <h3 className="font-medium text-sm text-muted-foreground uppercase tracking-wide">Guest Details</h3>

          <div className="space-y-1.5">
            <Label>Guest Name</Label>
            <Input placeholder="e.g. Ms. Tanaka" value={guestName} onChange={e => setGuestName(e.target.value)} />
          </div>

          <div className="space-y-1.5">
            <Label>Room Type</Label>
            <Input placeholder="e.g. Standard Room" value={roomType} onChange={e => setRoomType(e.target.value)} />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>Check-in Date</Label>
              <Input type="date" value={checkInDate} onChange={e => setCheckInDate(e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label>Check-out Date</Label>
              <Input type="date" value={checkOutDate} onChange={e => setCheckOutDate(e.target.value)} />
            </div>
          </div>

          <Button onClick={handleGenerate} disabled={isGenerating} className="w-full gap-2">
            {isGenerating ? <Spinner size={16} className="animate-spin" /> : <Sparkle size={16} />}
            {isGenerating ? 'Generating…' : 'Generate Upsell Suggestions'}
          </Button>
        </Card>

        {/* Suggestions */}
        <div className="space-y-3">
          {provider && (
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium">Suggestions</p>
              <Badge variant="outline" className="gap-1 text-xs">
                <Brain size={12} />
                {provider} · {model}
              </Badge>
            </div>
          )}

          {isGenerating ? (
            <Card className="p-8 flex items-center justify-center">
              <div className="text-center text-muted-foreground">
                <Spinner size={32} className="animate-spin mx-auto mb-2 opacity-50" />
                <p className="text-sm">Generating personalised suggestions…</p>
              </div>
            </Card>
          ) : suggestions.length > 0 ? (
            suggestions.map((s, i) => (
              <Card key={i} className={`p-4 border ${TYPE_COLORS[s.type] || ''}`}>
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3 flex-1">
                    <div className="mt-0.5 flex-shrink-0">
                      {TYPE_ICONS[s.type] ?? <ShoppingCart size={18} />}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="font-medium text-sm">{s.title}</p>
                        <Badge variant="outline" className="text-xs capitalize">{s.type}</Badge>
                      </div>
                      <p className="text-xs text-muted-foreground mt-0.5">{s.description}</p>
                      {s.estimatedPrice > 0 && (
                        <p className="text-sm font-semibold mt-1.5">
                          LKR {s.estimatedPrice.toLocaleString()}
                        </p>
                      )}
                      <div className="mt-2 space-y-0.5">
                        <div className="flex items-center justify-between text-xs text-muted-foreground">
                          <span>AI Confidence</span>
                          <span>{Math.round(s.confidence * 100)}%</span>
                        </div>
                        <Progress value={s.confidence * 100} className="h-1.5" />
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            ))
          ) : !isGenerating && rawText ? (
            <Card className="p-4">
              <p className="text-sm text-muted-foreground whitespace-pre-wrap">{rawText}</p>
            </Card>
          ) : (
            <Card className="p-8">
              <div className="flex flex-col items-center justify-center text-center text-muted-foreground">
                <ShoppingCart size={48} className="mb-3 opacity-20" />
                <p className="font-medium">No suggestions yet</p>
                <p className="text-sm mt-1">Enter guest details and click generate</p>
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
