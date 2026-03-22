import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { Card } from '@/components/ui/card'
import type { ReviewSourceConfig, ReviewSource, GuestFeedback } from '@/lib/types'
import { ulid } from 'ulid'
import { toast } from 'sonner'
import { ArrowsClockwise, CheckCircle, ArrowSquareOut, ListNumbers } from '@phosphor-icons/react'

interface ReviewSourceDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  source?: ReviewSourceConfig
  onSave: (source: ReviewSourceConfig) => void
  onImportReviews?: (source: ReviewSourceConfig) => Promise<GuestFeedback[]>
}

interface PlatformInfo {
  label: string
  placeholder: string
  exampleUrl: string
  steps: string[]
  profileUrl: string
}

const PLATFORM_INFO: Record<string, PlatformInfo> = {
  'google-maps': {
    label: 'Google Maps',
    placeholder: 'https://maps.app.goo.gl/... or https://www.google.com/maps/place/...',
    exampleUrl: 'https://maps.app.goo.gl/AbCdEfGh',
    steps: [
      'Go to Google Maps (maps.google.com) and search for your property name.',
      'Click on your property listing in the search results.',
      'Click the "Share" button (⬆) in the left panel.',
      'Select "Copy link" — paste that link here.',
      'Alternatively, copy the full URL from your browser address bar on your property page.',
    ],
    profileUrl: 'https://maps.google.com',
  },
  'tripadvisor': {
    label: 'TripAdvisor',
    placeholder: 'https://www.tripadvisor.com/Hotel_Review-...',
    exampleUrl: 'https://www.tripadvisor.com/Hotel_Review-g123456-d789012-Reviews-My_Hotel.html',
    steps: [
      'Go to tripadvisor.com and search for your property.',
      'Click on your property to open the listing page.',
      'Copy the full URL from your browser address bar.',
      'It should look like: tripadvisor.com/Hotel_Review-g…-Reviews-Your_Hotel.html',
      'Alternatively, log in to your TripAdvisor Management Centre — the URL shown there is your listing URL.',
    ],
    profileUrl: 'https://www.tripadvisor.com',
  },
  'booking.com': {
    label: 'Booking.com',
    placeholder: 'https://www.booking.com/hotel/...',
    exampleUrl: 'https://www.booking.com/hotel/lk/my-hotel.html',
    steps: [
      'Log in to the Booking.com Extranet (admin.booking.com).',
      'Go to "Property" → "Property details" in the left menu.',
      'Click "View your property on Booking.com" — the page that opens is your public listing.',
      'Copy the URL from the browser address bar.',
      'It should look like: booking.com/hotel/[country-code]/[property-slug].html',
    ],
    profileUrl: 'https://admin.booking.com',
  },
  'airbnb': {
    label: 'Airbnb',
    placeholder: 'https://www.airbnb.com/rooms/...',
    exampleUrl: 'https://www.airbnb.com/rooms/12345678',
    steps: [
      'Log in to airbnb.com and go to your Host Dashboard.',
      'Click on your listing title or go to "Listings" in the top menu.',
      'Open the listing you want to track.',
      'Click "View listing" to see the public page.',
      'Copy the URL — it should look like: airbnb.com/rooms/[listing-id]',
    ],
    profileUrl: 'https://www.airbnb.com/hosting',
  },
  'facebook': {
    label: 'Facebook',
    placeholder: 'https://www.facebook.com/yourhotelpage/reviews',
    exampleUrl: 'https://www.facebook.com/myhotel/reviews',
    steps: [
      'Go to your hotel\'s Facebook Business Page.',
      'Click the "Reviews" or "Recommendations" tab in the left sidebar.',
      'Copy the URL from your browser address bar.',
      'It should look like: facebook.com/[your-page-name]/reviews',
      'Tip: Enable reviews on your page via Settings → Templates and Tabs → Reviews.',
    ],
    profileUrl: 'https://www.facebook.com',
  },
}

export function ReviewSourceDialog({
  open,
  onOpenChange,
  source,
  onSave,
  onImportReviews
}: ReviewSourceDialogProps) {
  const [formData, setFormData] = useState<Partial<ReviewSourceConfig>>({
    source: 'google-maps',
    isActive: true,
    reviewCount: 0,
    averageRating: 0
  })
  const [isImporting, setIsImporting] = useState(false)
  const [showInstructions, setShowInstructions] = useState(false)

  useEffect(() => {
    if (source) {
      setFormData(source)
    } else {
      setFormData({
        source: 'google-maps',
        isActive: true,
        reviewCount: 0,
        averageRating: 0
      })
    }
    setShowInstructions(false)
  }, [source, open])

  const handleImport = async () => {
    if (!formData.url) {
      toast.error('Please enter a review source URL first')
      return
    }

    setIsImporting(true)
    try {
      if (onImportReviews && formData as ReviewSourceConfig) {
        const importedReviews = await onImportReviews(formData as ReviewSourceConfig)
        toast.success(`Imported ${importedReviews.length} reviews successfully`)

        setFormData(prev => ({
          ...prev,
          reviewCount: importedReviews.length,
          averageRating: importedReviews.length > 0
            ? importedReviews.reduce((sum, r) => sum + (r.overallRating * 2), 0) / importedReviews.length
            : 0,
          lastSync: Date.now()
        }))
      }
    } catch (error) {
      toast.error('Failed to import reviews')
    } finally {
      setIsImporting(false)
    }
  }

  const handleSave = () => {
    if (!formData.url || !formData.source) {
      toast.error('Please fill in all required fields')
      return
    }

    const reviewSource: ReviewSourceConfig = {
      id: source?.id || ulid(),
      source: formData.source as Exclude<ReviewSource, 'manual'>,
      url: formData.url,
      isActive: formData.isActive ?? true,
      lastSync: formData.lastSync,
      reviewCount: formData.reviewCount || 0,
      averageRating: formData.averageRating || 0,
      createdAt: source?.createdAt || Date.now(),
      updatedAt: Date.now()
    }

    onSave(reviewSource)
    onOpenChange(false)
  }

  const platformKey = formData.source || 'google-maps'
  const platform = PLATFORM_INFO[platformKey] ?? PLATFORM_INFO['google-maps']

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{source ? 'Edit Review Source' : 'Add Review Source'}</DialogTitle>
        </DialogHeader>

        <div className="space-y-5 py-4">
          {/* Platform selector */}
          <div className="space-y-2">
            <Label htmlFor="source-type">Review Platform *</Label>
            <Select
              value={formData.source}
              onValueChange={(value) => {
                setFormData({ ...formData, source: value as Exclude<ReviewSource, 'manual'> })
                setShowInstructions(true)
              }}
            >
              <SelectTrigger id="source-type">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="google-maps">Google Maps</SelectItem>
                <SelectItem value="tripadvisor">TripAdvisor</SelectItem>
                <SelectItem value="booking.com">Booking.com</SelectItem>
                <SelectItem value="airbnb">Airbnb</SelectItem>
                <SelectItem value="facebook">Facebook</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* How-to instructions card — shown when platform is selected */}
          <Card className="p-4 border-amber-200 bg-amber-50 dark:border-amber-800 dark:bg-amber-950">
            <div className="flex items-start justify-between gap-2 mb-2">
              <div className="flex items-center gap-2">
                <ListNumbers size={18} className="text-amber-700 dark:text-amber-300 flex-shrink-0" />
                <p className="text-sm font-semibold text-amber-900 dark:text-amber-100">
                  How to find your {platform.label} review URL
                </p>
              </div>
              <a
                href={platform.profileUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-amber-700 dark:text-amber-300 flex items-center gap-1 hover:underline shrink-0"
              >
                Open {platform.label}
                <ArrowSquareOut size={12} />
              </a>
            </div>
            <ol className="list-decimal list-inside space-y-1 text-xs text-amber-800 dark:text-amber-200">
              {platform.steps.map((step, i) => (
                <li key={i}>{step}</li>
              ))}
            </ol>
            <p className="mt-2 text-xs text-amber-700 dark:text-amber-300">
              <span className="font-medium">Example URL: </span>
              <code className="bg-amber-100 dark:bg-amber-900 px-1 rounded text-[11px]">{platform.exampleUrl}</code>
            </p>
          </Card>

          {/* URL input */}
          <div className="space-y-2">
            <Label htmlFor="url">Review Source URL *</Label>
            <Input
              id="url"
              value={formData.url || ''}
              onChange={(e) => setFormData({ ...formData, url: e.target.value })}
              placeholder={platform.placeholder}
            />
          </div>

          {/* Active toggle */}
          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div className="space-y-0.5">
              <Label>Active</Label>
              <p className="text-sm text-muted-foreground">
                Enable automatic review import from this source
              </p>
            </div>
            <Switch
              checked={formData.isActive}
              onCheckedChange={(checked) => setFormData({ ...formData, isActive: checked })}
            />
          </div>

          {/* Sync statistics (existing sources only) */}
          {source && (
            <Card className="p-4 space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="font-semibold">Import Statistics</h4>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleImport}
                  disabled={isImporting || !formData.url}
                >
                  <ArrowsClockwise size={16} className={`mr-2 ${isImporting ? 'animate-spin' : ''}`} />
                  {isImporting ? 'Syncing...' : 'Sync Now'}
                </Button>
              </div>
              <div className="grid grid-cols-3 gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground">Total Reviews</p>
                  <p className="text-lg font-semibold">{formData.reviewCount || 0}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Avg Rating</p>
                  <p className="text-lg font-semibold">{(formData.averageRating || 0).toFixed(1)}/10</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Last Synced</p>
                  <p className="text-sm font-medium">
                    {formData.lastSync ? new Date(formData.lastSync).toLocaleDateString() : 'Never'}
                  </p>
                </div>
              </div>
            </Card>
          )}

          {/* How it works info */}
          <Card className="p-4 bg-blue-50 dark:bg-blue-950 border-blue-200 dark:border-blue-800">
            <div className="flex gap-3">
              <CheckCircle size={20} className="text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
              <div className="text-sm space-y-1">
                <p className="font-medium text-blue-900 dark:text-blue-100">How syncing works</p>
                <p className="text-blue-700 dark:text-blue-300">
                  Save this review source, then click <strong>Sync Now</strong> (or use <strong>Sync All Sources</strong> from the Review Sources tab)
                  to import reviews. Reviews are de-duplicated automatically. Inactive sources are skipped during bulk sync.
                </p>
              </div>
            </div>
          </Card>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave}>
            {source ? 'Update' : 'Add'} Review Source
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
