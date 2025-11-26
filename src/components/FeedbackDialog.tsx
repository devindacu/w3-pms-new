import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { Star, ThumbsUp } from '@phosphor-icons/react'
import type { GuestFeedback, GuestProfile, FeedbackRating, ReviewSource } from '@/lib/types'

interface FeedbackDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  feedback?: GuestFeedback
  guests: GuestProfile[]
  onSave: (feedback: GuestFeedback) => void
}

export function FeedbackDialog({ open, onOpenChange, feedback, guests, onSave }: FeedbackDialogProps) {
  const [formData, setFormData] = useState<Partial<GuestFeedback>>({
    overallRating: 5,
    ratings: {},
    wouldRecommend: true,
    wouldReturn: true,
    responseRequired: false,
    channel: 'front-desk',
    reviewSource: 'manual'
  })

  useEffect(() => {
    if (feedback) {
      setFormData(feedback)
    } else {
      setFormData({
        overallRating: 5,
        ratings: {},
        wouldRecommend: true,
        wouldReturn: true,
        responseRequired: false,
        channel: 'front-desk',
        reviewSource: 'manual'
      })
    }
  }, [feedback, open])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    const selectedGuest = guests.find(g => g.id === formData.guestId)
    
    const feedbackData: GuestFeedback = {
      id: feedback?.id || `FB-${Date.now()}`,
      feedbackNumber: feedback?.feedbackNumber || `F${String(Date.now()).slice(-6)}`,
      ...formData,
      guestName: formData.guestName || (selectedGuest ? `${selectedGuest.firstName} ${selectedGuest.lastName}` : ''),
      submittedAt: feedback?.submittedAt || Date.now(),
      createdAt: feedback?.createdAt || Date.now()
    } as GuestFeedback

    onSave(feedbackData)
  }

  const RatingSelector = ({ label, value, onChange }: { label: string; value?: FeedbackRating; onChange: (val: FeedbackRating) => void }) => (
    <div className="flex items-center justify-between">
      <Label>{label}</Label>
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((rating) => (
          <button
            key={rating}
            type="button"
            onClick={() => onChange(rating as FeedbackRating)}
            className="p-1 hover:scale-110 transition-transform"
          >
            <Star 
              size={24} 
              className={value && value >= rating ? 'text-yellow-500 fill-yellow-500' : 'text-gray-300'}
            />
          </button>
        ))}
      </div>
    </div>
  )

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ThumbsUp size={24} />
            {feedback ? 'View Feedback' : 'Guest Feedback'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="guestId">Guest {formData.reviewSource === 'manual' && '*'}</Label>
              <Select 
                value={formData.guestId} 
                onValueChange={(value) => setFormData({ ...formData, guestId: value })}
                required={formData.reviewSource === 'manual'}
                disabled={!!feedback}
              >
                <SelectTrigger id="guestId">
                  <SelectValue placeholder="Select guest or enter name" />
                </SelectTrigger>
                <SelectContent>
                  {guests.map((guest) => (
                    <SelectItem key={guest.id} value={guest.id}>
                      {guest.firstName} {guest.lastName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            {!formData.guestId && !feedback && (
              <div>
                <Label htmlFor="guestName">Guest Name *</Label>
                <Input
                  id="guestName"
                  value={formData.guestName || ''}
                  onChange={(e) => setFormData({ ...formData, guestName: e.target.value })}
                  placeholder="Enter guest name"
                  required={!formData.guestId}
                />
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="reviewSource">Review Source *</Label>
              <Select 
                value={formData.reviewSource} 
                onValueChange={(value) => setFormData({ ...formData, reviewSource: value as ReviewSource, channel: value === 'manual' ? 'front-desk' : 'review-site' })}
                disabled={!!feedback}
              >
                <SelectTrigger id="reviewSource">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="manual">Manual Entry</SelectItem>
                  <SelectItem value="google-maps">Google Maps</SelectItem>
                  <SelectItem value="tripadvisor">TripAdvisor</SelectItem>
                  <SelectItem value="booking.com">Booking.com</SelectItem>
                  <SelectItem value="airbnb">Airbnb</SelectItem>
                  <SelectItem value="facebook">Facebook</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="channel">Channel</Label>
              <Select 
                value={formData.channel} 
                onValueChange={(value) => setFormData({ ...formData, channel: value as any })}
                disabled={!!feedback || formData.reviewSource !== 'manual'}
              >
                <SelectTrigger id="channel">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="email">Email</SelectItem>
                  <SelectItem value="sms">SMS</SelectItem>
                  <SelectItem value="in-room-tablet">In-Room Tablet</SelectItem>
                  <SelectItem value="website">Website</SelectItem>
                  <SelectItem value="app">App</SelectItem>
                  <SelectItem value="front-desk">Front Desk</SelectItem>
                  <SelectItem value="phone">Phone</SelectItem>
                  <SelectItem value="review-site">Review Site</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {formData.reviewSource && formData.reviewSource !== 'manual' && !feedback && (
            <div>
              <Label htmlFor="reviewSourceUrl">Review Link (Optional)</Label>
              <Input
                id="reviewSourceUrl"
                value={formData.reviewSourceUrl || ''}
                onChange={(e) => setFormData({ ...formData, reviewSourceUrl: e.target.value })}
                placeholder="https://..."
              />
            </div>
          )}

          <div className="space-y-3 p-4 bg-muted/30 rounded-lg">
            <RatingSelector 
              label="Overall Rating *" 
              value={formData.overallRating}
              onChange={(val) => setFormData({ ...formData, overallRating: val })}
            />
            
            <RatingSelector 
              label="Room Cleanliness" 
              value={formData.ratings?.roomCleanliness}
              onChange={(val) => setFormData({ ...formData, ratings: { ...formData.ratings, roomCleanliness: val } })}
            />
            
            <RatingSelector 
              label="Staff Service" 
              value={formData.ratings?.staffService}
              onChange={(val) => setFormData({ ...formData, ratings: { ...formData.ratings, staffService: val } })}
            />
            
            <RatingSelector 
              label="Food Quality" 
              value={formData.ratings?.foodQuality}
              onChange={(val) => setFormData({ ...formData, ratings: { ...formData.ratings, foodQuality: val } })}
            />
            
            <RatingSelector 
              label="Value for Money" 
              value={formData.ratings?.valueForMoney}
              onChange={(val) => setFormData({ ...formData, ratings: { ...formData.ratings, valueForMoney: val } })}
            />
          </div>

          <div>
            <Label htmlFor="comments">Comments</Label>
            <Textarea
              id="comments"
              value={formData.comments}
              onChange={(e) => setFormData({ ...formData, comments: e.target.value })}
              rows={4}
              placeholder="Guest comments..."
              disabled={!!feedback}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-center justify-between p-3 border rounded-lg">
              <Label htmlFor="wouldRecommend">Would Recommend</Label>
              <Switch
                id="wouldRecommend"
                checked={formData.wouldRecommend}
                onCheckedChange={(checked) => setFormData({ ...formData, wouldRecommend: checked })}
                disabled={!!feedback}
              />
            </div>
            <div className="flex items-center justify-between p-3 border rounded-lg">
              <Label htmlFor="wouldReturn">Would Return</Label>
              <Switch
                id="wouldReturn"
                checked={formData.wouldReturn}
                onCheckedChange={(checked) => setFormData({ ...formData, wouldReturn: checked })}
                disabled={!!feedback}
              />
            </div>
          </div>

          {feedback && (
            <>
              <div>
                <Label htmlFor="responseText">Response</Label>
                <Textarea
                  id="responseText"
                  value={formData.responseText}
                  onChange={(e) => setFormData({ ...formData, responseText: e.target.value })}
                  rows={3}
                  placeholder="Response to guest feedback..."
                />
              </div>
            </>
          )}

          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              {feedback ? 'Close' : 'Cancel'}
            </Button>
            {!feedback && (
              <Button type="submit">
                Add Feedback
              </Button>
            )}
            {feedback && (
              <Button type="submit">
                Update Feedback
              </Button>
            )}
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
