import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Card } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { Warning } from '@phosphor-icons/react'
import type { GuestComplaint, GuestProfile, ComplaintCategory, ComplaintPriority, ComplaintStatus, Department } from '@/lib/types'

interface ComplaintDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  complaint?: GuestComplaint
  guests: GuestProfile[]
  onSave: (complaint: GuestComplaint) => void
}

export function ComplaintDialog({ open, onOpenChange, complaint, guests, onSave }: ComplaintDialogProps) {
  const [formData, setFormData] = useState<Partial<GuestComplaint>>({
    category: 'other',
    priority: 'medium',
    status: 'open',
    reportedVia: 'in-person',
    followUpRequired: false,
    actionsTaken: []
  })

  useEffect(() => {
    if (complaint) {
      setFormData(complaint)
    } else {
      setFormData({
        category: 'other',
        priority: 'medium',
        status: 'open',
        reportedVia: 'in-person',
        followUpRequired: false,
        actionsTaken: []
      })
    }
  }, [complaint, open])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    const selectedGuest = guests.find(g => g.id === formData.guestId)
    
    const complaintData: GuestComplaint = {
      id: complaint?.id || `CMPL-${Date.now()}`,
      complaintNumber: complaint?.complaintNumber || `C${String(Date.now()).slice(-6)}`,
      ...formData,
      guestName: selectedGuest ? `${selectedGuest.firstName} ${selectedGuest.lastName}` : '',
      reportedAt: complaint?.reportedAt || Date.now(),
      reportedBy: complaint?.reportedBy || 'current-user',
      actionsTaken: formData.actionsTaken || [],
      updatedAt: Date.now()
    } as GuestComplaint

    onSave(complaintData)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Warning size={24} className="text-destructive" />
            {complaint ? 'Update Complaint' : 'Log New Complaint'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="guestId">Guest *</Label>
              <Select 
                value={formData.guestId} 
                onValueChange={(value) => setFormData({ ...formData, guestId: value })}
                required
              >
                <SelectTrigger id="guestId">
                  <SelectValue placeholder="Select guest" />
                </SelectTrigger>
                <SelectContent>
                  {guests.map((guest) => (
                    <SelectItem key={guest.id} value={guest.id}>
                      {guest.firstName} {guest.lastName} - {guest.phone}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="roomNumber">Room Number</Label>
              <Input
                id="roomNumber"
                value={formData.roomNumber}
                onChange={(e) => setFormData({ ...formData, roomNumber: e.target.value })}
                placeholder="e.g., 201"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <Label htmlFor="category">Category *</Label>
              <Select 
                value={formData.category} 
                onValueChange={(value) => setFormData({ ...formData, category: value as ComplaintCategory })}
                required
              >
                <SelectTrigger id="category">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="room-cleanliness">Room Cleanliness</SelectItem>
                  <SelectItem value="staff-behavior">Staff Behavior</SelectItem>
                  <SelectItem value="food-quality">Food Quality</SelectItem>
                  <SelectItem value="billing-issue">Billing Issue</SelectItem>
                  <SelectItem value="amenities">Amenities</SelectItem>
                  <SelectItem value="noise">Noise</SelectItem>
                  <SelectItem value="service-delay">Service Delay</SelectItem>
                  <SelectItem value="facility-maintenance">Facility Maintenance</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="priority">Priority *</Label>
              <Select 
                value={formData.priority} 
                onValueChange={(value) => setFormData({ ...formData, priority: value as ComplaintPriority })}
                required
              >
                <SelectTrigger id="priority">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="urgent">Urgent</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="status">Status *</Label>
              <Select 
                value={formData.status} 
                onValueChange={(value) => setFormData({ ...formData, status: value as ComplaintStatus })}
                required
              >
                <SelectTrigger id="status">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="open">Open</SelectItem>
                  <SelectItem value="investigating">Investigating</SelectItem>
                  <SelectItem value="resolved">Resolved</SelectItem>
                  <SelectItem value="closed">Closed</SelectItem>
                  <SelectItem value="escalated">Escalated</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="reportedVia">Reported Via *</Label>
              <Select 
                value={formData.reportedVia} 
                onValueChange={(value) => setFormData({ ...formData, reportedVia: value as any })}
                required
              >
                <SelectTrigger id="reportedVia">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="in-person">In Person</SelectItem>
                  <SelectItem value="phone">Phone</SelectItem>
                  <SelectItem value="email">Email</SelectItem>
                  <SelectItem value="social-media">Social Media</SelectItem>
                  <SelectItem value="review-site">Review Site</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="department">Department</Label>
              <Select 
                value={formData.department} 
                onValueChange={(value) => setFormData({ ...formData, department: value as Department })}
              >
                <SelectTrigger id="department">
                  <SelectValue placeholder="Select department" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="front-office">Front Office</SelectItem>
                  <SelectItem value="housekeeping">Housekeeping</SelectItem>
                  <SelectItem value="fnb">F&B</SelectItem>
                  <SelectItem value="kitchen">Kitchen</SelectItem>
                  <SelectItem value="engineering">Engineering</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <Label htmlFor="subject">Subject *</Label>
            <Input
              id="subject"
              value={formData.subject}
              onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
              placeholder="Brief summary of the complaint"
              required
            />
          </div>

          <div>
            <Label htmlFor="description">Description *</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={4}
              placeholder="Detailed description of the complaint..."
              required
            />
          </div>

          {complaint && (
            <>
              <Separator />
              
              <div>
                <Label htmlFor="resolution">Resolution</Label>
                <Textarea
                  id="resolution"
                  value={formData.resolution}
                  onChange={(e) => setFormData({ ...formData, resolution: e.target.value })}
                  rows={3}
                  placeholder="How was the complaint resolved..."
                />
              </div>

              <div>
                <Label>Compensation Offered</Label>
                <Card className="p-4 space-y-3">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="compensationType">Type</Label>
                      <Select 
                        value={formData.compensationOffered?.type} 
                        onValueChange={(value) => setFormData({ 
                          ...formData, 
                          compensationOffered: { 
                            ...formData.compensationOffered!, 
                            type: value as any 
                          } 
                        })}
                      >
                        <SelectTrigger id="compensationType">
                          <SelectValue placeholder="Select type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="refund">Refund</SelectItem>
                          <SelectItem value="discount">Discount</SelectItem>
                          <SelectItem value="upgrade">Upgrade</SelectItem>
                          <SelectItem value="loyalty-points">Loyalty Points</SelectItem>
                          <SelectItem value="complimentary-service">Complimentary Service</SelectItem>
                          <SelectItem value="other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="compensationValue">Value</Label>
                      <Input
                        id="compensationValue"
                        type="number"
                        value={formData.compensationOffered?.value}
                        onChange={(e) => setFormData({ 
                          ...formData, 
                          compensationOffered: { 
                            ...formData.compensationOffered!, 
                            value: parseFloat(e.target.value) || 0 
                          } 
                        })}
                      />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="compensationDescription">Description</Label>
                    <Input
                      id="compensationDescription"
                      value={formData.compensationOffered?.description}
                      onChange={(e) => setFormData({ 
                        ...formData, 
                        compensationOffered: { 
                          ...formData.compensationOffered!, 
                          description: e.target.value 
                        } 
                      })}
                    />
                  </div>
                </Card>
              </div>
            </>
          )}

          <div>
            <Label htmlFor="internalNotes">Internal Notes</Label>
            <Textarea
              id="internalNotes"
              value={formData.internalNotes}
              onChange={(e) => setFormData({ ...formData, internalNotes: e.target.value })}
              rows={2}
              placeholder="Notes for internal use only..."
            />
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit">
              {complaint ? 'Update Complaint' : 'Log Complaint'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
