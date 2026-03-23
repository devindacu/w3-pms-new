import { useMemo, useRef, useState } from 'react'
import { Star, ArrowLeft, ArrowRight } from '@phosphor-icons/react'
import type { NormalizedReview, ReviewAggregate, ReviewWidgetConfig, ReviewWidgetTheme } from '@/lib/types'

// ─── Source label / colour helpers ────────────────────────────────────────────

const SOURCE_LABELS: Record<string, string> = {
  'google-maps': 'Google',
  'tripadvisor': 'TripAdvisor',
  'booking.com': 'Booking.com',
  'airbnb': 'Airbnb',
  'facebook': 'Facebook',
  'manual': 'Direct',
}

const SOURCE_COLOURS: Record<string, string> = {
  'google-maps': 'bg-blue-100 text-blue-800',
  'tripadvisor': 'bg-green-100 text-green-800',
  'booking.com': 'bg-blue-700 text-white',
  'airbnb': 'bg-rose-100 text-rose-800',
  'facebook': 'bg-indigo-100 text-indigo-800',
  'manual': 'bg-gray-100 text-gray-800',
}

// ─── Sub-components ────────────────────────────────────────────────────────────

function StarRow({ rating, max = 5, size = 16 }: { rating: number; max?: number; size?: number }) {
  return (
    <span className="inline-flex gap-0.5">
      {Array.from({ length: max }, (_, i) => (
        <Star
          key={i}
          size={size}
          weight={i < Math.round(rating) ? 'fill' : 'regular'}
          className={i < Math.round(rating) ? 'text-yellow-400' : 'text-gray-300'}
        />
      ))}
    </span>
  )
}

function SourceBadge({ source }: { source: string }) {
  const label = SOURCE_LABELS[source] ?? source
  const colour = SOURCE_COLOURS[source] ?? 'bg-gray-100 text-gray-700'
  return (
    <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-full ${colour}`}>
      {label}
    </span>
  )
}

interface ReviewCardProps {
  review: NormalizedReview
  showSource: boolean
  showAvatar: boolean
}

function ReviewCard({ review, showSource, showAvatar }: ReviewCardProps) {
  const [expanded, setExpanded] = useState(false)
  const isLong = review.reviewText.length > 200

  return (
    <div className="flex flex-col gap-2 p-4 rounded-xl border border-border bg-card shadow-sm min-w-[260px] max-w-[320px] h-full">
      <div className="flex items-center gap-2">
        {showAvatar && (
          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-sm shrink-0">
            {review.authorName.charAt(0).toUpperCase()}
          </div>
        )}
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold truncate">{review.authorName}</p>
          <p className="text-xs text-muted-foreground">
            {new Date(review.reviewDate).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}
          </p>
        </div>
        {showSource && <SourceBadge source={review.source} />}
      </div>
      <StarRow rating={review.rating} />
      <p className={`text-sm text-foreground/80 ${expanded ? '' : 'line-clamp-4'}`}>{review.reviewText}</p>
      {isLong && (
        <button
          onClick={() => setExpanded(prev => !prev)}
          className="text-xs text-primary hover:underline text-left mt-0.5"
        >
          {expanded ? 'Show less' : 'Read more'}
        </button>
      )}
    </div>
  )
}

// ─── Aggregate badge ───────────────────────────────────────────────────────────

interface AggregateBadgeProps {
  aggregate: ReviewAggregate
}

function AggregateBadge({ aggregate }: AggregateBadgeProps) {
  return (
    <div className="inline-flex items-center gap-3 rounded-xl border border-border bg-card px-4 py-3 shadow-sm">
      <div className="text-center">
        <p className="text-3xl font-extrabold leading-none">{aggregate.overallRating.toFixed(1)}</p>
        <StarRow rating={aggregate.overallRating} size={14} />
      </div>
      <div className="h-10 w-px bg-border" />
      <p className="text-sm text-muted-foreground">
        Based on <strong>{aggregate.totalReviews}</strong> review{aggregate.totalReviews !== 1 ? 's' : ''}
      </p>
    </div>
  )
}

// ─── Rating distribution bar ───────────────────────────────────────────────────

interface DistributionBarProps {
  aggregate: ReviewAggregate
}

function DistributionBars({ aggregate }: DistributionBarProps) {
  const { distribution, totalReviews } = aggregate
  const stars = [5, 4, 3, 2, 1] as const
  return (
    <div className="space-y-1 w-full max-w-[220px]">
      {stars.map(s => {
        const pct = totalReviews > 0 ? Math.round((distribution[s] / totalReviews) * 100) : 0
        return (
          <div key={s} className="flex items-center gap-1.5 text-xs">
            <span className="w-4 text-right text-muted-foreground">{s}</span>
            <Star size={11} weight="fill" className="text-yellow-400 shrink-0" />
            <div className="flex-1 h-2 rounded-full bg-muted overflow-hidden">
              <div className="h-full rounded-full bg-yellow-400" style={{ width: `${pct}%` }} />
            </div>
            <span className="w-8 text-muted-foreground">{distribution[s]}</span>
          </div>
        )
      })}
    </div>
  )
}

// ─── Filter & sort helpers ────────────────────────────────────────────────────

function applyFilters(reviews: NormalizedReview[], config: ReviewWidgetConfig): NormalizedReview[] {
  let filtered = reviews.filter(r => {
    if (config.hideNegative && r.rating < 3) return false
    if (r.rating < config.minRating) return false
    return true
  })

  switch (config.sort) {
    case 'highest':
      filtered = filtered.sort((a, b) => b.rating - a.rating)
      break
    case 'lowest':
      filtered = filtered.sort((a, b) => a.rating - b.rating)
      break
    case 'latest':
    default:
      filtered = filtered.sort((a, b) => b.reviewDate - a.reviewDate)
  }

  return filtered.slice(0, config.limit)
}

// ─── Public ReviewWidget ───────────────────────────────────────────────────────

interface ReviewWidgetProps {
  reviews: NormalizedReview[]
  aggregate: ReviewAggregate
  config: ReviewWidgetConfig
  /** When true the widget is rendered in a forced light/dark wrapper for preview. */
  forceTheme?: ReviewWidgetTheme
}

export function ReviewWidget({ reviews, aggregate, config, forceTheme }: ReviewWidgetProps) {
  const theme = forceTheme ?? config.theme
  const themeClass = theme === 'dark'
    ? 'dark'
    : theme === 'light'
    ? 'light'
    : ''

  const displayReviews = useMemo(() => applyFilters(reviews, config), [reviews, config])

  return (
    <div className={`${themeClass} font-sans`}>
      <div className="bg-background text-foreground">
        {config.layout === 'badge'
          ? <BadgeLayout aggregate={aggregate} />
          : config.layout === 'horizontal'
          ? <HorizontalLayout reviews={displayReviews} aggregate={aggregate} config={config} />
          : <VerticalLayout reviews={displayReviews} aggregate={aggregate} config={config} />
        }
      </div>
    </div>
  )
}

// ─── Badge layout ──────────────────────────────────────────────────────────────

function BadgeLayout({ aggregate }: { aggregate: ReviewAggregate }) {
  return (
    <div className="flex flex-col gap-4 items-start">
      <AggregateBadge aggregate={aggregate} />
      <DistributionBars aggregate={aggregate} />
    </div>
  )
}

// ─── Horizontal slider layout ──────────────────────────────────────────────────

interface HorizontalLayoutProps {
  reviews: NormalizedReview[]
  aggregate: ReviewAggregate
  config: ReviewWidgetConfig
}

function HorizontalLayout({ reviews, aggregate, config }: HorizontalLayoutProps) {
  const trackRef = useRef<HTMLDivElement>(null)
  const [canScrollLeft, setCanScrollLeft] = useState(false)
  const [canScrollRight, setCanScrollRight] = useState(true)

  const scroll = (dir: 'left' | 'right') => {
    if (!trackRef.current) return
    const amount = 280
    trackRef.current.scrollBy({ left: dir === 'left' ? -amount : amount, behavior: 'smooth' })
  }

  const onScroll = () => {
    if (!trackRef.current) return
    setCanScrollLeft(trackRef.current.scrollLeft > 0)
    setCanScrollRight(
      trackRef.current.scrollLeft + trackRef.current.clientWidth < trackRef.current.scrollWidth - 4
    )
  }

  if (reviews.length === 0) {
    return <EmptyState />
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <AggregateBadge aggregate={aggregate} />
        <div className="flex gap-2">
          <button
            onClick={() => scroll('left')}
            disabled={!canScrollLeft}
            className="p-1.5 rounded-lg border border-border hover:bg-muted disabled:opacity-30 transition-opacity"
          >
            <ArrowLeft size={16} />
          </button>
          <button
            onClick={() => scroll('right')}
            disabled={!canScrollRight}
            className="p-1.5 rounded-lg border border-border hover:bg-muted disabled:opacity-30 transition-opacity"
          >
            <ArrowRight size={16} />
          </button>
        </div>
      </div>

      <div
        ref={trackRef}
        onScroll={onScroll}
        className="flex gap-3 overflow-x-auto scroll-smooth pb-2 scrollbar-thin scrollbar-thumb-muted"
        style={{ scrollbarWidth: 'thin' }}
      >
        {reviews.map(r => (
          <ReviewCard key={r.id} review={r} showSource={config.showSource} showAvatar={config.showAvatar} />
        ))}
      </div>
    </div>
  )
}

// ─── Vertical list layout ──────────────────────────────────────────────────────

interface VerticalLayoutProps {
  reviews: NormalizedReview[]
  aggregate: ReviewAggregate
  config: ReviewWidgetConfig
}

function VerticalLayout({ reviews, aggregate, config }: VerticalLayoutProps) {
  if (reviews.length === 0) {
    return <EmptyState />
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <AggregateBadge aggregate={aggregate} />
        <DistributionBars aggregate={aggregate} />
      </div>

      <div className="space-y-3">
        {reviews.map(r => (
          <div key={r.id} className="flex gap-3 p-4 rounded-xl border border-border bg-card shadow-sm">
            {config.showAvatar && (
              <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-sm shrink-0">
                {r.authorName.charAt(0).toUpperCase()}
              </div>
            )}
            <div className="flex-1 min-w-0 space-y-1">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-sm font-semibold">{r.authorName}</span>
                {config.showSource && <SourceBadge source={r.source} />}
                <span className="text-xs text-muted-foreground ml-auto">
                  {new Date(r.reviewDate).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}
                </span>
              </div>
              <StarRow rating={r.rating} size={14} />
              <p className="text-sm text-foreground/80">{r.reviewText}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

// ─── Empty state ───────────────────────────────────────────────────────────────

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-10 text-muted-foreground gap-2">
      <Star size={40} weight="regular" />
      <p className="text-sm">No reviews match the current filters.</p>
    </div>
  )
}
