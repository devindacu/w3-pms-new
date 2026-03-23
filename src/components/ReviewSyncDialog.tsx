import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { toast } from 'sonner'
import { ArrowsClockwise, Link as LinkIcon } from '@phosphor-icons/react'
import type { OTAConnection, ChannelReview, OTAChannel, ReviewSource } from '@/lib/types'
import { fetchReviewsFromUrl, detectReviewSource } from '@/lib/reviewSyncHelpers'

interface ReviewSyncDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  connections: OTAConnection[]
  onSync: (reviews: ChannelReview[]) => void
}

/** Map an OTAChannel to the closest ReviewSource understood by fetchReviewsFromUrl */
function channelToReviewSource(channel: OTAChannel): Exclude<ReviewSource, 'manual'> {
  switch (channel) {
    case 'booking.com': return 'booking.com'
    case 'airbnb': return 'airbnb'
    case 'tripadvisor': return 'tripadvisor'
    case 'agoda':
    case 'expedia':
    case 'makemytrip':
    case 'goibibo':
    case 'hotels.com':
    case 'direct-website': return 'tripadvisor'
    default: return 'tripadvisor'
  }
}

export function ReviewSyncDialog({ open, onOpenChange, connections, onSync }: ReviewSyncDialogProps) {
  const [url, setUrl] = useState('')
  const [selectedChannel, setSelectedChannel] = useState<OTAChannel | ''>('')
  const [syncing, setSyncing] = useState(false)

  // Pre-fill review URL from the selected connection's configured reviewUrl
  useEffect(() => {
    if (selectedChannel) {
      const conn = connections.find(c => c.channel === selectedChannel)
      if (conn?.reviewUrl) {
        setUrl(conn.reviewUrl)
      }
    }
  }, [selectedChannel, connections])

  const handleSync = async () => {
    if (!url || !selectedChannel) {
      toast.error('Please provide URL and select channel')
      return
    }

    setSyncing(true)

    try {
      // Detect platform from URL first; fall back to the selected channel mapping
      const detectedSource = detectReviewSource(url) ?? channelToReviewSource(selectedChannel as OTAChannel)

      const result = await fetchReviewsFromUrl(url, detectedSource)

      if (!result.success || result.reviews.length === 0) {
        toast.error(result.errors?.[0] ?? 'No reviews found for the provided URL')
        return
      }

      // Convert GuestFeedback[] → ChannelReview[] for the channel-manager view
      const channelReviews: ChannelReview[] = result.reviews.map(feedback => ({
        id: feedback.id,
        channel: selectedChannel as OTAChannel,
        externalReviewId: feedback.externalReviewId ?? `ext-${feedback.id}`,
        guestName: feedback.guestName,
        rating: feedback.overallRating,
        reviewText: feedback.comments ?? '',
        submittedAt: feedback.submittedAt,
        verified: true,
        sentiment: feedback.sentiment,
        categories: {},
        helpful: 0,
        notHelpful: 0,
        isPublic: feedback.reviewPublic ?? true,
        syncedToFeedback: false,
        importedAt: Date.now(),
        lastSyncedAt: Date.now(),
        tags: feedback.tags
      }))

      onSync(channelReviews)
      onOpenChange(false)
      setUrl('')
      setSelectedChannel('')
      toast.success(`Synced ${channelReviews.length} reviews from ${url}`)
    } catch {
      toast.error('Failed to sync reviews')
    } finally {
      setSyncing(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Sync Reviews from URL</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="review-channel">Select Channel</Label>
            <Select value={selectedChannel} onValueChange={(v) => setSelectedChannel(v as OTAChannel)}>
              <SelectTrigger id="review-channel">
                <SelectValue placeholder="Choose a channel" />
              </SelectTrigger>
              <SelectContent>
                {connections.map((conn) => (
                  <SelectItem key={conn.id} value={conn.channel}>
                    {conn.name}
                  </SelectItem>
                ))}
                <SelectItem value="tripadvisor">TripAdvisor</SelectItem>
                <SelectItem value="google-maps">Google Maps</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="review-url">Review Page URL</Label>
            <div className="flex gap-2">
              <LinkIcon size={20} className="mt-2 text-muted-foreground" />
              <Input
                id="review-url"
                placeholder="https://www.booking.com/hotel/..."
                value={url}
                onChange={(e) => setUrl(e.target.value)}
              />
            </div>
            <p className="text-xs text-muted-foreground">
              Enter the URL of your hotel's review page on the selected platform
            </p>
          </div>

          <div className="p-4 bg-muted/50 rounded-lg">
            <p className="text-sm text-muted-foreground">
              This will fetch all publicly available reviews from the provided URL and import them into your system.
            </p>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={syncing}>
            Cancel
          </Button>
          <Button onClick={handleSync} disabled={!url || !selectedChannel || syncing}>
            {syncing ? (
              <>
                <ArrowsClockwise size={18} className="mr-2 animate-spin" />
                Syncing...
              </>
            ) : (
              <>
                <ArrowsClockwise size={18} className="mr-2" />
                Sync Reviews
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
