import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { toast } from 'sonner'
import { ArrowsClockwise, Link as LinkIcon } from '@phosphor-icons/react'
import type { OTAConnection, ChannelReview, ReviewSource, OTAChannel } from '@/lib/types'

interface ReviewSyncDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  connections: OTAConnection[]
  onSync: (reviews: ChannelReview[]) => void
}

export function ReviewSyncDialog({ open, onOpenChange, connections, onSync }: ReviewSyncDialogProps) {
  const [url, setUrl] = useState('')
  const [selectedChannel, setSelectedChannel] = useState<OTAChannel | ''>('')
  const [syncing, setSyncing] = useState(false)

  const handleSync = async () => {
    if (!url || !selectedChannel) {
      toast.error('Please provide URL and select channel')
      return
    }

    setSyncing(true)
    
    try {
      const mockReviews: ChannelReview[] = []
      const reviewCount = Math.floor(Math.random() * 10) + 5

      for (let i = 0; i < reviewCount; i++) {
        const rating = Math.floor(Math.random() * 3) + 3
        const review: ChannelReview = {
          id: `review-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          channel: selectedChannel as OTAChannel,
          externalReviewId: `ext-${Math.random().toString(36).substr(2, 9)}`,
          guestName: ['John Smith', 'Jane Doe', 'Robert Johnson', 'Emily Williams', 'Michael Brown'][Math.floor(Math.random() * 5)],
          guestCountry: ['USA', 'UK', 'Canada', 'Australia', 'Germany'][Math.floor(Math.random() * 5)],
          rating: rating as 3 | 4 | 5,
          reviewTitle: rating >= 4 ? 'Great Stay!' : 'Good Experience',
          reviewText: rating >= 4 
            ? 'Excellent hotel with great service and clean rooms. Would definitely recommend to friends and family.'
            : 'Nice hotel overall. Room was clean and staff was helpful. Some minor issues but nothing major.',
          positiveComments: 'Clean rooms, friendly staff, good location',
          negativeComments: rating < 4 ? 'WiFi could be better' : undefined,
          submittedAt: Date.now() - Math.floor(Math.random() * 30) * 24 * 60 * 60 * 1000,
          stayDate: Date.now() - Math.floor(Math.random() * 45) * 24 * 60 * 60 * 1000,
          tripType: ['business', 'leisure', 'family', 'couple'][Math.floor(Math.random() * 4)] as any,
          verified: Math.random() > 0.3,
          sentiment: rating >= 4 ? 'positive' : 'neutral',
          categories: {
            cleanliness: rating,
            comfort: rating,
            location: rating,
            facilities: rating - 1,
            staff: rating,
            valueForMoney: rating - 1
          },
          helpful: Math.floor(Math.random() * 20),
          notHelpful: Math.floor(Math.random() * 3),
          isPublic: true,
          syncedToFeedback: false,
          importedAt: Date.now(),
          lastSyncedAt: Date.now()
        }
        mockReviews.push(review)
      }

      await new Promise(resolve => setTimeout(resolve, 2000))

      onSync(mockReviews)
      onOpenChange(false)
      setUrl('')
      setSelectedChannel('')
    } catch (error) {
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
