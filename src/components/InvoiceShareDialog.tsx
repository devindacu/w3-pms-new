import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Envelope, DeviceMobile, ShareNetwork, WhatsappLogo } from '@phosphor-icons/react'
import { toast } from 'sonner'
import type { GuestInvoice, InvoiceDeliveryMethod } from '@/lib/types'

interface InvoiceShareDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  invoice: GuestInvoice
  onShare: (method: InvoiceDeliveryMethod['method'], recipient?: string) => void
}

export function InvoiceShareDialog({ open, onOpenChange, invoice, onShare }: InvoiceShareDialogProps) {
  const [email, setEmail] = useState(invoice.guestEmail || '')
  const [phone, setPhone] = useState(invoice.guestPhone || '')

  const handleEmailShare = () => {
    if (!email) {
      toast.error('Please enter an email address')
      return
    }
    onShare('email', email)
  }

  const handleSMSShare = () => {
    if (!phone) {
      toast.error('Please enter a phone number')
      return
    }
    onShare('sms', phone)
  }

  const handleWhatsAppShare = () => {
    if (!phone) {
      toast.error('Please enter a phone number')
      return
    }
    onShare('whatsapp', phone)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Share Invoice #{invoice.invoiceNumber}</DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="email" className="mt-4">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="email">
              <Envelope size={16} className="mr-2" />
              Email
            </TabsTrigger>
            <TabsTrigger value="sms">
              <DeviceMobile size={16} className="mr-2" />
              SMS
            </TabsTrigger>
            <TabsTrigger value="whatsapp">
              <WhatsappLogo size={16} className="mr-2" />
              WhatsApp
            </TabsTrigger>
          </TabsList>

          <TabsContent value="email" className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <Input
                id="email"
                type="email"
                placeholder="guest@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <Button onClick={handleEmailShare} className="w-full">
              <Envelope size={16} className="mr-2" />
              Send via Email
            </Button>
          </TabsContent>

          <TabsContent value="sms" className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number</Label>
              <Input
                id="phone"
                type="tel"
                placeholder="+94 77 123 4567"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
              />
            </div>
            <Button onClick={handleSMSShare} className="w-full">
              <DeviceMobile size={16} className="mr-2" />
              Send via SMS
            </Button>
          </TabsContent>

          <TabsContent value="whatsapp" className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="whatsappPhone">Phone Number</Label>
              <Input
                id="whatsappPhone"
                type="tel"
                placeholder="+94 77 123 4567"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
              />
            </div>
            <Button onClick={handleWhatsAppShare} className="w-full">
              <WhatsappLogo size={16} className="mr-2" />
              Send via WhatsApp
            </Button>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
}
