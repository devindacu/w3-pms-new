import { useState, useEffect, useMemo } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card } from '@/components/ui/card'
import { Slider } from '@/components/ui/slider'
import { Badge } from '@/components/ui/badge'
import {
  Code,
  Copy,
  Eye,
  Rows,
  SquaresFour,
  Medal,
  CheckCircle,
  Info,
} from '@phosphor-icons/react'
import { toast } from 'sonner'
import { ulid } from 'ulid'
import type {
  NormalizedReview,
  ReviewAggregate,
  ReviewWidgetConfig,
  ReviewWidgetLayout,
  ReviewWidgetTheme,
  ReviewWidgetSort,
} from '@/lib/types'
import { ReviewWidget } from '@/components/ReviewWidget'

// ─── Sample / demo data (shown when no real reviews are synced yet) ────────────

const NOW = Date.now()
const DAY = 86_400_000

const SAMPLE_REVIEWS: NormalizedReview[] = [
  {
    id: 'sample-1',
    source: 'google-maps',
    sourceId: 'g-1',
    authorName: 'Sarah Mitchell',
    rating: 5,
    reviewText: 'Absolutely stunning property! The staff went above and beyond to make our anniversary stay unforgettable. The room was immaculate, the breakfast was superb, and the location is unbeatable. Will definitely be back!',
    reviewDate: NOW - 2 * DAY,
    verified: true,
    sentiment: 'positive',
    importedAt: NOW,
  },
  {
    id: 'sample-2',
    source: 'booking.com',
    sourceId: 'b-1',
    authorName: 'James Thornton',
    rating: 4,
    reviewText: 'Great hotel overall. Clean rooms, friendly reception, and excellent facilities. The pool area was a highlight. Minor issue with Wi-Fi speed in the room, but nothing that ruined the trip.',
    reviewDate: NOW - 5 * DAY,
    verified: true,
    sentiment: 'positive',
    importedAt: NOW,
  },
  {
    id: 'sample-3',
    source: 'tripadvisor',
    sourceId: 't-1',
    authorName: 'Priya Nair',
    rating: 5,
    reviewText: 'One of the best hotels I have ever stayed in. The spa treatments were exceptional, room service was prompt, and the ocean view from our suite was breathtaking. Highly recommend the chef\'s tasting menu!',
    reviewDate: NOW - 8 * DAY,
    verified: true,
    sentiment: 'positive',
    importedAt: NOW,
  },
  {
    id: 'sample-4',
    source: 'airbnb',
    sourceId: 'a-1',
    authorName: 'Lucas Fernandez',
    rating: 4,
    reviewText: 'Lovely villa with a private pool and beautiful gardens. The host was incredibly responsive and helpful. Check-in was smooth. Only small note: the kitchen could use a few more utensils. Would stay again.',
    reviewDate: NOW - 11 * DAY,
    verified: true,
    sentiment: 'positive',
    importedAt: NOW,
  },
  {
    id: 'sample-5',
    source: 'google-maps',
    sourceId: 'g-2',
    authorName: 'Emma Clarke',
    rating: 3,
    reviewText: 'Decent stay but room was smaller than the photos suggested. The rooftop bar is fantastic and staff were very polite. Might have been an off-season thing, but the restaurant was quite slow at lunch.',
    reviewDate: NOW - 15 * DAY,
    verified: true,
    sentiment: 'neutral',
    importedAt: NOW,
  },
  {
    id: 'sample-6',
    source: 'facebook',
    sourceId: 'f-1',
    authorName: 'Ahmed Al-Rashid',
    rating: 5,
    reviewText: 'Exceptional service from start to finish. The concierge arranged everything for our honeymoon — private dinner, flower decorations, and sunset tour. Could not have asked for more. Perfect in every way.',
    reviewDate: NOW - 18 * DAY,
    verified: true,
    sentiment: 'positive',
    importedAt: NOW,
  },
  {
    id: 'sample-7',
    source: 'booking.com',
    sourceId: 'b-2',
    authorName: 'Chen Wei',
    rating: 4,
    reviewText: 'Very comfortable beds and excellent housekeeping. Breakfast buffet had a wide variety including Asian options which we appreciated. The shuttle service to the city was convenient and on time.',
    reviewDate: NOW - 22 * DAY,
    verified: true,
    sentiment: 'positive',
    importedAt: NOW,
  },
  {
    id: 'sample-8',
    source: 'tripadvisor',
    sourceId: 't-2',
    authorName: 'Olivia Bennett',
    rating: 2,
    reviewText: 'Unfortunately our room had a noise issue from the street. When we asked to move, the alternative room wasn\'t ready for several hours. The pool and breakfast were nice but the service let us down.',
    reviewDate: NOW - 25 * DAY,
    verified: true,
    sentiment: 'negative',
    importedAt: NOW,
  },
  {
    id: 'sample-9',
    source: 'google-maps',
    sourceId: 'g-3',
    authorName: 'Ravi Shankar',
    rating: 5,
    reviewText: 'Stayed here for a business trip and the meeting facilities were top-notch. Fast internet, well-equipped gym, and the executive lounge made long working days much easier. Great property for corporate travellers.',
    reviewDate: NOW - 30 * DAY,
    verified: true,
    sentiment: 'positive',
    importedAt: NOW,
  },
  {
    id: 'sample-10',
    source: 'airbnb',
    sourceId: 'a-2',
    authorName: 'Isabella Romano',
    rating: 4,
    reviewText: 'Charming boutique property with great character. The terrace with its vineyard views made every morning special. Staff knew all the local gems — thanks for the restaurant recommendations! Parking could be tricky.',
    reviewDate: NOW - 35 * DAY,
    verified: true,
    sentiment: 'positive',
    importedAt: NOW,
  },
]

const SAMPLE_AGGREGATE: ReviewAggregate = {
  overallRating: 4.1,
  totalReviews: 10,
  distribution: { 5: 5, 4: 3, 3: 1, 2: 1, 1: 0 },
  bySource: {
    'google-maps': { count: 3, avgRating: 4.3 },
    'booking.com': { count: 2, avgRating: 4.0 },
    'tripadvisor': { count: 2, avgRating: 3.5 },
    'airbnb': { count: 2, avgRating: 4.0 },
    'facebook': { count: 1, avgRating: 5.0 },
  },
}

interface ReviewWidgetConfigDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  reviews: NormalizedReview[]
  aggregate: ReviewAggregate
  config?: ReviewWidgetConfig
  /** The public base URL used for embed codes (e.g. https://yourdomain.com). */
  baseUrl?: string
  onSave: (config: ReviewWidgetConfig) => void
}

const DEFAULT_CONFIG: Omit<ReviewWidgetConfig, 'id' | 'createdAt' | 'updatedAt'> = {
  name: 'My Reviews Widget',
  layout: 'horizontal',
  theme: 'light',
  limit: 10,
  minRating: 1,
  hideNegative: false,
  showSource: true,
  showAvatar: true,
  autoScroll: false,
  sort: 'latest',
}

function buildIframeUrl(baseUrl: string, cfg: ReviewWidgetConfig): string {
  const params = new URLSearchParams({
    layout: cfg.layout,
    theme: cfg.theme,
    limit: String(cfg.limit),
    minRating: String(cfg.minRating),
    hideNegative: String(cfg.hideNegative),
    showSource: String(cfg.showSource),
    showAvatar: String(cfg.showAvatar),
    sort: cfg.sort,
  })
  return `${baseUrl}/embed/reviews?${params.toString()}`
}

function buildJsEmbedCode(baseUrl: string, cfg: ReviewWidgetConfig): string {
  return `<script src="${baseUrl}/widget.js" defer></script>
<div id="w3-reviews-widget"
  data-layout="${cfg.layout}"
  data-theme="${cfg.theme}"
  data-limit="${cfg.limit}"
  data-min-rating="${cfg.minRating}"
  data-hide-negative="${cfg.hideNegative}"
  data-show-source="${cfg.showSource}"
  data-show-avatar="${cfg.showAvatar}"
  data-sort="${cfg.sort}">
</div>`
}

function buildIframeEmbedCode(baseUrl: string, cfg: ReviewWidgetConfig): string {
  const src = buildIframeUrl(baseUrl, cfg)
  const LAYOUT_HEIGHT: Record<ReviewWidgetLayout, string> = {
    badge: '180',
    horizontal: '320',
    vertical: '600',
  }
  const height = LAYOUT_HEIGHT[cfg.layout]
  return `<iframe
  src="${src}"
  width="100%"
  height="${height}"
  style="border:none;"
  scrolling="no"
  loading="lazy"
  title="Guest Reviews">
</iframe>`
}

export function ReviewWidgetConfigDialog({
  open,
  onOpenChange,
  reviews,
  aggregate,
  config,
  baseUrl = 'https://yourdomain.com',
  onSave,
}: ReviewWidgetConfigDialogProps) {
  const [cfg, setCfg] = useState<ReviewWidgetConfig>(
    config ?? { ...DEFAULT_CONFIG, id: ulid(), createdAt: Date.now(), updatedAt: Date.now() }
  )
  const [activeTab, setActiveTab] = useState<'settings' | 'preview' | 'embed'>('settings')
  const [copiedJs, setCopiedJs] = useState(false)
  const [copiedIframe, setCopiedIframe] = useState(false)

  // Use real reviews when available; fall back to sample demo data for preview
  const usingDemoData = reviews.length === 0
  const previewReviews = usingDemoData ? SAMPLE_REVIEWS : reviews
  const previewAggregate = usingDemoData ? SAMPLE_AGGREGATE : aggregate

  useEffect(() => {
    if (config) {
      setCfg(config)
    } else {
      setCfg({ ...DEFAULT_CONFIG, id: ulid(), createdAt: Date.now(), updatedAt: Date.now() })
    }
    setActiveTab('settings')
  }, [config, open])

  const jsCode = useMemo(() => buildJsEmbedCode(baseUrl, cfg), [baseUrl, cfg])
  const iframeCode = useMemo(() => buildIframeEmbedCode(baseUrl, cfg), [baseUrl, cfg])

  const copy = async (text: string, kind: 'js' | 'iframe') => {
    await navigator.clipboard.writeText(text)
    if (kind === 'js') {
      setCopiedJs(true)
      setTimeout(() => setCopiedJs(false), 2000)
    } else {
      setCopiedIframe(true)
      setTimeout(() => setCopiedIframe(false), 2000)
    }
    toast.success('Copied to clipboard')
  }

  const handleSave = () => {
    onSave({ ...cfg, updatedAt: Date.now() })
    onOpenChange(false)
    toast.success('Widget configuration saved')
  }

  const set = <K extends keyof ReviewWidgetConfig>(key: K, value: ReviewWidgetConfig[K]) =>
    setCfg(prev => ({ ...prev, [key]: value }))

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[92vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle>Review Widget &amp; Embed</DialogTitle>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={v => setActiveTab(v as typeof activeTab)} className="flex-1 overflow-hidden flex flex-col">
          <TabsList className="shrink-0">
            <TabsTrigger value="settings">
              <SquaresFour size={16} className="mr-2" />
              Configure
            </TabsTrigger>
            <TabsTrigger value="preview">
              <Eye size={16} className="mr-2" />
              Preview
            </TabsTrigger>
            <TabsTrigger value="embed">
              <Code size={16} className="mr-2" />
              Embed Code
            </TabsTrigger>
          </TabsList>

          {/* ── Settings tab ─────────────────────────────────────────── */}
          <TabsContent value="settings" className="flex-1 overflow-y-auto space-y-5 py-4 pr-1">
            {/* Widget name */}
            <div className="space-y-2">
              <Label>Widget Name</Label>
              <Input
                value={cfg.name}
                onChange={e => set('name', e.target.value)}
                placeholder="My Reviews Widget"
              />
            </div>

            {/* Layout */}
            <div className="space-y-2">
              <Label>Layout</Label>
              <div className="grid grid-cols-3 gap-3">
                {(
                  [
                    { value: 'horizontal', label: 'Horizontal', icon: <Rows size={20} /> },
                    { value: 'vertical', label: 'Vertical', icon: <SquaresFour size={20} /> },
                    { value: 'badge', label: 'Badge', icon: <Medal size={20} /> },
                  ] as { value: ReviewWidgetLayout; label: string; icon: React.ReactNode }[]
                ).map(opt => (
                  <button
                    key={opt.value}
                    onClick={() => set('layout', opt.value)}
                    className={`flex flex-col items-center gap-1.5 p-3 rounded-lg border-2 transition-colors text-sm font-medium
                      ${cfg.layout === opt.value
                        ? 'border-primary bg-primary/5 text-primary'
                        : 'border-border hover:border-primary/40'}`}
                  >
                    {opt.icon}
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Theme */}
            <div className="space-y-2">
              <Label>Theme</Label>
              <Select value={cfg.theme} onValueChange={v => set('theme', v as ReviewWidgetTheme)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="light">Light</SelectItem>
                  <SelectItem value="dark">Dark</SelectItem>
                  <SelectItem value="auto">Auto (follows site)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Number of reviews */}
            <div className="space-y-2">
              <Label>Number of Reviews to Show: <strong>{cfg.limit}</strong></Label>
              <Slider
                min={1} max={50} step={1}
                value={[cfg.limit]}
                onValueChange={([v]) => set('limit', v)}
                className="w-full"
              />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>1</span><span>50</span>
              </div>
            </div>

            {/* Sort */}
            <div className="space-y-2">
              <Label>Sort Reviews By</Label>
              <Select value={cfg.sort} onValueChange={v => set('sort', v as ReviewWidgetSort)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="latest">Latest first</SelectItem>
                  <SelectItem value="highest">Highest rated first</SelectItem>
                  <SelectItem value="lowest">Lowest rated first</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Minimum rating */}
            <div className="space-y-2">
              <Label>Minimum Star Rating to Show: <strong>{cfg.minRating} ★</strong></Label>
              <Slider
                min={1} max={5} step={1}
                value={[cfg.minRating]}
                onValueChange={([v]) => set('minRating', v)}
                className="w-full"
              />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>1 ★</span><span>5 ★</span>
              </div>
            </div>

            {/* Toggles */}
            <div className="space-y-3">
              {(
                [
                  { key: 'hideNegative', label: 'Hide Negative Reviews', desc: 'Hide reviews with rating below 3 stars' },
                  { key: 'showSource', label: 'Show Review Source', desc: 'Display platform badge (Google, Booking.com, etc.)' },
                  { key: 'showAvatar', label: 'Show Author Avatar', desc: 'Show letter avatar for each reviewer' },
                  { key: 'autoScroll', label: 'Auto-Scroll', desc: 'Automatically scroll (horizontal layout only)' },
                ] as { key: keyof ReviewWidgetConfig; label: string; desc: string }[]
              ).map(({ key, label, desc }) => (
                <div key={key} className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <p className="text-sm font-medium">{label}</p>
                    <p className="text-xs text-muted-foreground">{desc}</p>
                  </div>
                  <Switch
                    checked={cfg[key] as boolean}
                    onCheckedChange={v => set(key, v as ReviewWidgetConfig[typeof key])}
                  />
                </div>
              ))}
            </div>
          </TabsContent>

          {/* ── Preview tab ───────────────────────────────────────────── */}
          <TabsContent value="preview" className="flex-1 overflow-y-auto py-4 space-y-3">
            {/* Demo data banner */}
            {usingDemoData && (
              <div className="flex items-start gap-2.5 rounded-lg border border-amber-200 bg-amber-50 dark:border-amber-800 dark:bg-amber-950 px-3 py-2.5">
                <Info size={16} className="text-amber-600 dark:text-amber-400 mt-0.5 shrink-0" />
                <p className="text-xs text-amber-800 dark:text-amber-200 leading-relaxed">
                  <strong>Demo preview</strong> — sample reviews are shown because no real reviews have been synced yet.
                  Sync a review source to see your actual data here.
                </p>
              </div>
            )}

            {/* Active-filter badges */}
            <div className="flex items-center gap-2 flex-wrap">
              <Badge variant="outline">{cfg.layout} layout</Badge>
              <Badge variant="outline">{cfg.theme} theme</Badge>
              <Badge variant="outline">limit: {cfg.limit}</Badge>
              {cfg.hideNegative && <Badge variant="secondary">hiding negative</Badge>}
              {cfg.minRating > 1 && <Badge variant="secondary">min {cfg.minRating}★</Badge>}
              <Badge variant="outline">
                {{ latest: 'Latest first', highest: 'Highest rated', lowest: 'Lowest rated' }[cfg.sort]}
              </Badge>
            </div>

            {/* Widget preview */}
            <Card className={`overflow-auto ${cfg.layout === 'vertical' ? 'max-h-[420px]' : ''}`}>
              <div className={`p-4 ${cfg.theme === 'dark' ? 'bg-gray-900 rounded-lg' : ''}`}>
                <ReviewWidget
                  reviews={previewReviews}
                  aggregate={previewAggregate}
                  config={cfg}
                  forceTheme={cfg.theme === 'auto' ? 'light' : cfg.theme}
                />
              </div>
            </Card>
          </TabsContent>

          {/* ── Embed code tab ────────────────────────────────────────── */}
          <TabsContent value="embed" className="flex-1 overflow-y-auto py-4 space-y-5">
            <Card className="p-4 bg-blue-50 dark:bg-blue-950 border-blue-200 dark:border-blue-800">
              <div className="flex gap-3">
                <CheckCircle size={20} className="text-blue-600 dark:text-blue-400 mt-0.5 shrink-0" />
                <div className="text-sm">
                  <p className="font-semibold text-blue-900 dark:text-blue-100 mb-1">How to embed</p>
                  <p className="text-blue-700 dark:text-blue-300">
                    Copy either code snippet below and paste it into your website's HTML where you want the widget to appear.
                    The <strong>JS Embed</strong> is recommended for best performance. Use the <strong>iFrame</strong> if you need strict isolation.
                  </p>
                </div>
              </div>
            </Card>

            {/* JS Embed */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label className="text-base font-semibold">JS Embed (Recommended)</Label>
                <Button size="sm" variant="outline" onClick={() => copy(jsCode, 'js')}>
                  {copiedJs ? <CheckCircle size={16} className="mr-2 text-green-600" /> : <Copy size={16} className="mr-2" />}
                  {copiedJs ? 'Copied!' : 'Copy'}
                </Button>
              </div>
              <pre className="bg-muted rounded-lg p-4 text-xs overflow-x-auto whitespace-pre-wrap break-all leading-5">
                {jsCode}
              </pre>
            </div>

            {/* iFrame Embed */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label className="text-base font-semibold">iFrame Embed</Label>
                <Button size="sm" variant="outline" onClick={() => copy(iframeCode, 'iframe')}>
                  {copiedIframe ? <CheckCircle size={16} className="mr-2 text-green-600" /> : <Copy size={16} className="mr-2" />}
                  {copiedIframe ? 'Copied!' : 'Copy'}
                </Button>
              </div>
              <pre className="bg-muted rounded-lg p-4 text-xs overflow-x-auto whitespace-pre-wrap break-all leading-5">
                {iframeCode}
              </pre>
            </div>

            {/* Options reference */}
            <div className="space-y-2">
              <Label className="text-base font-semibold">Available Options</Label>
              <div className="overflow-x-auto">
                <table className="w-full text-xs border-collapse">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-1.5 pr-4 font-semibold">Option</th>
                      <th className="text-left py-1.5 pr-4 font-semibold">Values</th>
                      <th className="text-left py-1.5 font-semibold">Description</th>
                    </tr>
                  </thead>
                  <tbody className="text-muted-foreground">
                    {[
                      ['layout', 'horizontal | vertical | badge', 'Display style'],
                      ['theme', 'light | dark | auto', 'Colour scheme'],
                      ['limit', '1–50', 'Max reviews to show'],
                      ['min-rating', '1–5', 'Hide reviews below this star rating'],
                      ['hide-negative', 'true | false', 'Hide reviews with rating < 3'],
                      ['show-source', 'true | false', 'Show platform badge'],
                      ['show-avatar', 'true | false', 'Show author avatar'],
                      ['sort', 'latest | highest | lowest', 'Review sort order'],
                    ].map(([opt, vals, desc]) => (
                      <tr key={opt} className="border-b border-border/50">
                        <td className="py-1.5 pr-4 font-mono text-foreground/80">{opt}</td>
                        <td className="py-1.5 pr-4">{vals}</td>
                        <td className="py-1.5">{desc}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </TabsContent>
        </Tabs>

        <DialogFooter className="shrink-0 pt-2 border-t">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave}>Save Widget Config</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
