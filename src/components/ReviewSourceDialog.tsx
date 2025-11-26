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
import { ArrowsClockwise, CheckCircle } from '@phosphor-icons/react'

interface ReviewSourceDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  source?: ReviewSourceConfig
  onSave: (source: ReviewSourceConfig) => void
  onImportReviews?: (source: ReviewSourceConfig) => Promise<GuestFeedback[]>
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

  const getSourceDescription = (sourceType: string) => {
    switch (sourceType) {
      case 'google-maps': return 'Enter your Google Maps business URL'
      case 'tripadvisor': return 'Enter your TripAdvisor listing URL'
      case 'booking.com': return 'Enter your Booking.com property URL'
      case 'airbnb': return 'Enter your Airbnb listing URL'
      case 'facebook': return 'Enter your Facebook page URL'
      default: return 'Enter the review source URL'
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{source ? 'Edit Review Source' : 'Add Review Source'}</DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          <div className="space-y-2">
            <Label htmlFor="source-type">Review Platform *</Label>
            <Select
              value={formData.source}
              onValueChange={(value) => setFormData({ ...formData, source: value as Exclude<ReviewSource, 'manual'> })}
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
            <p className="text-xs text-muted-foreground">
              {getSourceDescription(formData.source || '')}
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="url">Review Source URL *</Label>
            <Input
              id="url"
              value={formData.url || ''}
              onChange={(e) => setFormData({ ...formData, url: e.target.value })}
              placeholder="https://..."
            />
            <p className="text-xs text-muted-foreground">
              Paste the complete URL of your {formData.source?.replace('-', ' ')} listing
            </p>
          </div>

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
                  {isImporting ? 'Importing...' : 'Import Now'}
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

          <Card className="p-4 bg-blue-50 dark:bg-blue-950 border-blue-200 dark:border-blue-800">
            <div className="flex gap-3">
              <CheckCircle size={20} className="text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
              <div className="text-sm space-y-1">
                <p className="font-medium text-blue-900 dark:text-blue-100">How it works</p>
                <p className="text-blue-700 dark:text-blue-300">
                  When you save this review source, the system will simulate importing reviews from the platform.
                  In a production environment, this would connect to the actual review platform API to fetch real reviews.
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
