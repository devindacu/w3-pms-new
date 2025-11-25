import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Slider } from '@/components/ui/slider'
import { toast } from 'sonner'
import { type PerformanceReview, type Employee } from '@/lib/types'

interface PerformanceReviewDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  review: PerformanceReview | null
  employees: Employee[]
  reviews: PerformanceReview[]
  setReviews: (reviews: PerformanceReview[]) => void
}

export function PerformanceReviewDialog({ open, onOpenChange, review, employees, reviews, setReviews }: PerformanceReviewDialogProps) {
  const [formData, setFormData] = useState({
    employeeId: '',
    reviewerId: '',
    reviewPeriodStart: new Date(Date.now() - 180 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    reviewPeriodEnd: new Date().toISOString().split('T')[0],
    punctuality: 3,
    qualityOfWork: 3,
    teamwork: 3,
    communication: 3,
    initiative: 3,
    strengths: '',
    areasForImprovement: '',
    goals: '',
    comments: '',
    status: 'draft' as 'draft' | 'submitted' | 'acknowledged'
  })

  useEffect(() => {
    if (review) {
      setFormData({
        employeeId: review.employeeId,
        reviewerId: review.reviewerId,
        reviewPeriodStart: new Date(review.reviewPeriodStart).toISOString().split('T')[0],
        reviewPeriodEnd: new Date(review.reviewPeriodEnd).toISOString().split('T')[0],
        punctuality: review.punctuality,
        qualityOfWork: review.qualityOfWork,
        teamwork: review.teamwork,
        communication: review.communication,
        initiative: review.initiative,
        strengths: review.strengths,
        areasForImprovement: review.areasForImprovement,
        goals: review.goals,
        comments: review.comments,
        status: review.status
      })
    } else {
      setFormData({
        employeeId: '',
        reviewerId: '',
        reviewPeriodStart: new Date(Date.now() - 180 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        reviewPeriodEnd: new Date().toISOString().split('T')[0],
        punctuality: 3,
        qualityOfWork: 3,
        teamwork: 3,
        communication: 3,
        initiative: 3,
        strengths: '',
        areasForImprovement: '',
        goals: '',
        comments: '',
        status: 'draft'
      })
    }
  }, [review, open])

  const calculateOverallRating = () => {
    const { punctuality, qualityOfWork, teamwork, communication, initiative } = formData
    return ((punctuality + qualityOfWork + teamwork + communication + initiative) / 5).toFixed(1)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.employeeId || !formData.reviewerId) {
      toast.error('Please select employee and reviewer')
      return
    }

    if (!formData.strengths || !formData.areasForImprovement || !formData.goals) {
      toast.error('Please fill in all text fields')
      return
    }

    const overallRating = parseFloat(calculateOverallRating())

    if (review) {
      setReviews(reviews.map(r =>
        r.id === review.id
          ? {
              ...r,
              employeeId: formData.employeeId,
              reviewerId: formData.reviewerId,
              reviewPeriodStart: new Date(formData.reviewPeriodStart).getTime(),
              reviewPeriodEnd: new Date(formData.reviewPeriodEnd).getTime(),
              punctuality: formData.punctuality,
              qualityOfWork: formData.qualityOfWork,
              teamwork: formData.teamwork,
              communication: formData.communication,
              initiative: formData.initiative,
              overallRating,
              strengths: formData.strengths,
              areasForImprovement: formData.areasForImprovement,
              goals: formData.goals,
              comments: formData.comments,
              status: formData.status,
              submittedAt: formData.status === 'submitted' || formData.status === 'acknowledged' ? (review.submittedAt || Date.now()) : undefined,
              acknowledgedAt: formData.status === 'acknowledged' ? Date.now() : undefined,
              updatedAt: Date.now()
            }
          : r
      ))
      toast.success('Performance review updated successfully')
    } else {
      const newReview: PerformanceReview = {
        id: `review-${Date.now()}`,
        employeeId: formData.employeeId,
        reviewerId: formData.reviewerId,
        reviewPeriodStart: new Date(formData.reviewPeriodStart).getTime(),
        reviewPeriodEnd: new Date(formData.reviewPeriodEnd).getTime(),
        punctuality: formData.punctuality,
        qualityOfWork: formData.qualityOfWork,
        teamwork: formData.teamwork,
        communication: formData.communication,
        initiative: formData.initiative,
        overallRating,
        strengths: formData.strengths,
        areasForImprovement: formData.areasForImprovement,
        goals: formData.goals,
        comments: formData.comments,
        status: formData.status,
        submittedAt: formData.status === 'submitted' ? Date.now() : undefined,
        createdAt: Date.now(),
        updatedAt: Date.now()
      }
      setReviews([...reviews, newReview])
      toast.success('Performance review created successfully')
    }

    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{review ? 'Edit Performance Review' : 'New Performance Review'}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="employee">Employee *</Label>
              <Select value={formData.employeeId} onValueChange={(value) => setFormData({ ...formData, employeeId: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Select employee" />
                </SelectTrigger>
                <SelectContent>
                  {employees.filter(e => e.status === 'active').map((emp) => (
                    <SelectItem key={emp.id} value={emp.id}>
                      {emp.firstName} {emp.lastName} - {emp.department}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="reviewer">Reviewer *</Label>
              <Select value={formData.reviewerId} onValueChange={(value) => setFormData({ ...formData, reviewerId: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Select reviewer" />
                </SelectTrigger>
                <SelectContent>
                  {employees.filter(e => e.status === 'active' && e.id !== formData.employeeId).map((emp) => (
                    <SelectItem key={emp.id} value={emp.id}>
                      {emp.firstName} {emp.lastName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="periodStart">Review Period Start *</Label>
              <input
                id="periodStart"
                type="date"
                className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-base shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 md:text-sm"
                value={formData.reviewPeriodStart}
                onChange={(e) => setFormData({ ...formData, reviewPeriodStart: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="periodEnd">Review Period End *</Label>
              <input
                id="periodEnd"
                type="date"
                className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-base shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 md:text-sm"
                value={formData.reviewPeriodEnd}
                onChange={(e) => setFormData({ ...formData, reviewPeriodEnd: e.target.value })}
                required
              />
            </div>
          </div>

          <div className="space-y-4 p-4 border rounded-lg">
            <h3 className="font-semibold">Performance Ratings (1-5)</h3>
            
            <div className="space-y-2">
              <div className="flex justify-between">
                <Label>Punctuality</Label>
                <span className="text-sm font-medium">{formData.punctuality}</span>
              </div>
              <Slider
                value={[formData.punctuality]}
                onValueChange={([value]) => setFormData({ ...formData, punctuality: value })}
                min={1}
                max={5}
                step={1}
              />
            </div>

            <div className="space-y-2">
              <div className="flex justify-between">
                <Label>Quality of Work</Label>
                <span className="text-sm font-medium">{formData.qualityOfWork}</span>
              </div>
              <Slider
                value={[formData.qualityOfWork]}
                onValueChange={([value]) => setFormData({ ...formData, qualityOfWork: value })}
                min={1}
                max={5}
                step={1}
              />
            </div>

            <div className="space-y-2">
              <div className="flex justify-between">
                <Label>Teamwork</Label>
                <span className="text-sm font-medium">{formData.teamwork}</span>
              </div>
              <Slider
                value={[formData.teamwork]}
                onValueChange={([value]) => setFormData({ ...formData, teamwork: value })}
                min={1}
                max={5}
                step={1}
              />
            </div>

            <div className="space-y-2">
              <div className="flex justify-between">
                <Label>Communication</Label>
                <span className="text-sm font-medium">{formData.communication}</span>
              </div>
              <Slider
                value={[formData.communication]}
                onValueChange={([value]) => setFormData({ ...formData, communication: value })}
                min={1}
                max={5}
                step={1}
              />
            </div>

            <div className="space-y-2">
              <div className="flex justify-between">
                <Label>Initiative</Label>
                <span className="text-sm font-medium">{formData.initiative}</span>
              </div>
              <Slider
                value={[formData.initiative]}
                onValueChange={([value]) => setFormData({ ...formData, initiative: value })}
                min={1}
                max={5}
                step={1}
              />
            </div>

            <div className="pt-4 border-t">
              <div className="flex justify-between items-center">
                <span className="font-semibold text-lg">Overall Rating:</span>
                <span className="text-2xl font-bold text-success">{calculateOverallRating()}</span>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="strengths">Strengths *</Label>
            <Textarea
              id="strengths"
              value={formData.strengths}
              onChange={(e) => setFormData({ ...formData, strengths: e.target.value })}
              rows={3}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="improvements">Areas for Improvement *</Label>
            <Textarea
              id="improvements"
              value={formData.areasForImprovement}
              onChange={(e) => setFormData({ ...formData, areasForImprovement: e.target.value })}
              rows={3}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="goals">Goals *</Label>
            <Textarea
              id="goals"
              value={formData.goals}
              onChange={(e) => setFormData({ ...formData, goals: e.target.value })}
              rows={3}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="comments">Additional Comments</Label>
            <Textarea
              id="comments"
              value={formData.comments}
              onChange={(e) => setFormData({ ...formData, comments: e.target.value })}
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="status">Status</Label>
            <Select value={formData.status} onValueChange={(value: any) => setFormData({ ...formData, status: value })}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="draft">Draft</SelectItem>
                <SelectItem value="submitted">Submitted</SelectItem>
                <SelectItem value="acknowledged">Acknowledged</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit">
              {review ? 'Update' : 'Create'} Review
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
