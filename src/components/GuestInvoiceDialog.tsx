import { useState } from 'react'
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { toast } from 'sonner'
import { Receipt, User, Bed } from '@phosphor-icons/react'
import type { GuestInvoice, Guest, Reservation, SystemUser, GuestInvoiceType, GuestInvoiceStatus } from '@/lib/types'
import { formatDate, generateNumber } from '@/lib/helpers'

interface GuestInvoiceDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  guests: Guest[]
  reservations: Reservation[]
  onInvoiceCreated: (invoice: GuestInvoice) => void
  currentUser: SystemUser
}

export function GuestInvoiceDialog({
  open,
  onOpenChange,
  guests,
  reservations,
  onInvoiceCreated,
  currentUser
}: GuestInvoiceDialogProps) {
  const [selectedGuestId, setSelectedGuestId] = useState<string>('')
  const [selectedReservationId, setSelectedReservationId] = useState<string>('')
  const [invoiceType, setInvoiceType] = useState<GuestInvoiceType>('standard')
  const [notes, setNotes] = useState<string>('')

  const handleSubmit = () => {
    if (!selectedGuestId) {
      toast.error('Please select a guest')
      return
    }

    const guest = guests.find(g => g.id === selectedGuestId)
    if (!guest) {
      toast.error('Guest not found')
      return
    }

    const reservation = selectedReservationId 
      ? reservations.find(r => r.id === selectedReservationId)
      : undefined

    const newInvoice: GuestInvoice = {
      id: `ginv-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      invoiceNumber: generateNumber('INV'),
      guestId: selectedGuestId,
      guestName: guest.name,
      reservationId: selectedReservationId || undefined,
      roomNumber: reservation?.roomNumber,
      invoiceType,
      status: 'draft' as GuestInvoiceStatus,
      currency: 'LKR',
      lineItems: [],
      subtotal: 0,
      totalTax: 0,
      totalDiscount: 0,
      serviceChargeAmount: 0,
      grandTotal: 0,
      totalPaid: 0,
      amountDue: 0,
      issueDate: formatDate(new Date()),
      dueDate: formatDate(new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)), // 7 days from now
      notes,
      createdAt: Date.now(),
      createdBy: currentUser.id,
      updatedAt: Date.now(),
      updatedBy: currentUser.id
    }

    onInvoiceCreated(newInvoice)
    onOpenChange(false)
    toast.success('Invoice created successfully')

    // Reset form
    setSelectedGuestId('')
    setSelectedReservationId('')
    setInvoiceType('standard')
    setNotes('')
  }

  const selectedGuest = guests.find(g => g.id === selectedGuestId)
  const guestReservations = reservations.filter(r => r.guestId === selectedGuestId)

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Receipt size={24} className="text-primary" />
            Create Guest Invoice
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Guest Selection */}
          <div className="space-y-2">
            <Label htmlFor="guest">Guest *</Label>
            <Select
              value={selectedGuestId}
              onValueChange={(value) => {
                setSelectedGuestId(value)
                setSelectedReservationId('') // Reset reservation when guest changes
              }}
            >
              <SelectTrigger id="guest">
                <SelectValue placeholder="Select guest..." />
              </SelectTrigger>
              <SelectContent>
                {guests.length === 0 ? (
                  <div className="p-4 text-sm text-muted-foreground text-center">
                    No guests found
                  </div>
                ) : (
                  guests.map((guest) => (
                    <SelectItem key={guest.id} value={guest.id}>
                      <div className="flex items-center gap-2">
                        <User size={16} />
                        <div>
                          <div className="font-medium">{guest.name}</div>
                          <div className="text-xs text-muted-foreground">
                            {guest.email || guest.phone || 'No contact info'}
                          </div>
                        </div>
                      </div>
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
          </div>

          {/* Reservation Selection (Optional) */}
          {selectedGuestId && (
            <div className="space-y-2">
              <Label htmlFor="reservation">
                Link to Reservation (Optional)
              </Label>
              <Select
                value={selectedReservationId}
                onValueChange={setSelectedReservationId}
              >
                <SelectTrigger id="reservation">
                  <SelectValue placeholder="Select reservation..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">None (Standalone Invoice)</SelectItem>
                  {guestReservations.map((reservation) => (
                    <SelectItem key={reservation.id} value={reservation.id}>
                      <div className="flex items-center gap-2">
                        <Bed size={16} />
                        <div>
                          <div className="font-medium">
                            Room {reservation.roomNumber} | {reservation.roomType}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {formatDate(new Date(reservation.checkIn))} - {formatDate(new Date(reservation.checkOut))}
                          </div>
                        </div>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Invoice Type */}
          <div className="space-y-2">
            <Label htmlFor="invoiceType">Invoice Type</Label>
            <Select
              value={invoiceType}
              onValueChange={(value: GuestInvoiceType) => setInvoiceType(value)}
            >
              <SelectTrigger id="invoiceType">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="standard">Standard Invoice</SelectItem>
                <SelectItem value="proforma">Proforma Invoice</SelectItem>
                <SelectItem value="credit-note">Credit Note</SelectItem>
                <SelectItem value="debit-note">Debit Note</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Selected Guest Info */}
          {selectedGuest && (
            <div className="p-4 bg-muted/30 rounded-lg space-y-2">
              <h3 className="font-semibold text-sm">Guest Information</h3>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div>
                  <span className="text-muted-foreground">Name:</span>
                  <div className="font-medium">{selectedGuest.name}</div>
                </div>
                <div>
                  <span className="text-muted-foreground">Email:</span>
                  <div className="font-medium">{selectedGuest.email || 'N/A'}</div>
                </div>
                <div>
                  <span className="text-muted-foreground">Phone:</span>
                  <div className="font-medium">{selectedGuest.phone || 'N/A'}</div>
                </div>
                <div>
                  <span className="text-muted-foreground">ID Number:</span>
                  <div className="font-medium">{selectedGuest.idNumber || 'N/A'}</div>
                </div>
              </div>
            </div>
          )}

          {/* Notes */}
          <div className="space-y-2">
            <Label htmlFor="notes">Notes (Optional)</Label>
            <Textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Add any notes about this invoice..."
              rows={3}
            />
          </div>

          <div className="p-3 bg-primary/10 border border-primary/20 rounded-lg">
            <p className="text-sm text-muted-foreground">
              <span className="font-medium">Note:</span> After creating the invoice, you can add line items 
              by posting charges (room, F&B, extra services) from the Charges tab.
            </p>
          </div>
        </div>

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={!selectedGuestId}>
            Create Invoice
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
