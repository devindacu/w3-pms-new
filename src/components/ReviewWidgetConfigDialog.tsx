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
            <div className="flex items-center gap-2 mb-2">
              <Badge variant="outline">{cfg.layout} layout</Badge>
              <Badge variant="outline">{cfg.theme} theme</Badge>
              <Badge variant="outline">limit: {cfg.limit}</Badge>
              {cfg.hideNegative && <Badge variant="secondary">hiding negative</Badge>}
              {cfg.minRating > 1 && <Badge variant="secondary">min {cfg.minRating}★</Badge>}
            </div>
            <Card className="p-4 overflow-auto">
              <ReviewWidget
                reviews={reviews}
                aggregate={aggregate}
                config={cfg}
                forceTheme={cfg.theme === 'auto' ? 'light' : cfg.theme}
              />
            </Card>
            {reviews.length === 0 && (
              <p className="text-sm text-muted-foreground text-center">
                Sync some reviews first to see a live preview here.
              </p>
            )}
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
