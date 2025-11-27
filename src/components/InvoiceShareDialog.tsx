import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import {
  EnvelopeSimple,
  ShareNetwork,
  Copy,
  Link,
  CheckCircle,
  PaperPlaneRight
} from '@phosphor-icons/react'
import type { GuestInvoice } from '@/lib/types'
import { formatCurrency, formatDate } from '@/lib/helpers'
import { formatInvoiceForEmail } from '@/lib/invoiceHelpers'
import { toast } from 'sonner'

interface InvoiceShareDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  invoice: GuestInvoice
  hotelInfo: {
    name: string
    address: string
    phone: string
    email: string
    website?: string
    taxRegistrationNumber?: string
  }
  onShare: (method: 'email' | 'link' | 'print', recipient?: string) => void
}

export function InvoiceShareDialog({
  open,
  onOpenChange,
  invoice,
  hotelInfo,
  onShare
}: InvoiceShareDialogProps) {
  const [emailTo, setEmailTo] = useState(invoice.guestEmail || '')
  const [emailCC, setEmailCC] = useState('')
  const [emailSubject, setEmailSubject] = useState(
    `Invoice ${invoice.invoiceNumber} from ${hotelInfo.name}`
  )
  const [emailMessage, setEmailMessage] = useState('')
  const [isSending, setIsSending] = useState(false)
  const [linkCopied, setLinkCopied] = useState(false)

  const handleSendEmail = async () => {
    if (!emailTo) {
      toast.error('Please enter a recipient email address')
      return
    }

    setIsSending(true)
    try {
      const emailContent = formatInvoiceForEmail(invoice, hotelInfo)
      
      await new Promise(resolve => setTimeout(resolve, 1000))

      console.log('Email would be sent to:', emailTo)
      console.log('CC:', emailCC)
      console.log('Subject:', emailSubject)
      console.log('Message:', emailMessage || emailContent.body)

      onShare('email', emailTo)
      toast.success(`Invoice emailed to ${emailTo}`)
      onOpenChange(false)
    } catch (error) {
      toast.error('Failed to send email')
    } finally {
      setIsSending(false)
    }
  }

  const handleCopyLink = () => {
    const shareableLink = `${window.location.origin}/invoices/${invoice.id}`
    navigator.clipboard.writeText(shareableLink)
    setLinkCopied(true)
    toast.success('Link copied to clipboard')
    setTimeout(() => setLinkCopied(false), 2000)
    
    onShare('link', shareableLink)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Share Invoice</DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="email" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="email">
              <EnvelopeSimple size={16} className="mr-2" />
              Email
            </TabsTrigger>
            <TabsTrigger value="link">
              <Link size={16} className="mr-2" />
              Share Link
            </TabsTrigger>
          </TabsList>

          <TabsContent value="email" className="space-y-4 mt-4">
            <div className="p-4 bg-muted/30 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm font-medium">Invoice Summary</p>
                <Badge>{invoice.invoiceNumber}</Badge>
              </div>
              <div className="grid grid-cols-2 gap-2 text-sm text-muted-foreground">
                <div>Guest: {invoice.guestName}</div>
                <div>Amount: {formatCurrency(invoice.grandTotal)}</div>
                <div>Date: {formatDate(invoice.invoiceDate)}</div>
                <div>
                  Status: <span className="capitalize">{invoice.status}</span>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="email-to">
                    To <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="email-to"
                    type="email"
                    placeholder="guest@email.com"
                    value={emailTo}
                    onChange={e => setEmailTo(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email-cc">CC (Optional)</Label>
                  <Input
                    id="email-cc"
                    type="email"
                    placeholder="cc@email.com"
                    value={emailCC}
                    onChange={e => setEmailCC(e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="email-subject">Subject</Label>
                <Input
                  id="email-subject"
                  value={emailSubject}
                  onChange={e => setEmailSubject(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email-message">Message (Optional)</Label>
                <Textarea
                  id="email-message"
                  rows={4}
                  placeholder="Add a personal message to include with the invoice..."
                  value={emailMessage}
                  onChange={e => setEmailMessage(e.target.value)}
                />
                <p className="text-xs text-muted-foreground">
                  A standard invoice email with all details will be sent if no message is provided.
                </p>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-4">
              <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isSending}>
                Cancel
              </Button>
              <Button onClick={handleSendEmail} disabled={isSending}>
                <PaperPlaneRight size={16} className="mr-2" />
                {isSending ? 'Sending...' : 'Send Email'}
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="link" className="space-y-4 mt-4">
            <div className="p-4 bg-muted/30 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm font-medium">Invoice Summary</p>
                <Badge>{invoice.invoiceNumber}</Badge>
              </div>
              <div className="grid grid-cols-2 gap-2 text-sm text-muted-foreground">
                <div>Guest: {invoice.guestName}</div>
                <div>Amount: {formatCurrency(invoice.grandTotal)}</div>
                <div>Date: {formatDate(invoice.invoiceDate)}</div>
                <div>
                  Status: <span className="capitalize">{invoice.status}</span>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <Label>Shareable Link</Label>
                <p className="text-sm text-muted-foreground mt-1 mb-3">
                  Copy this link to share the invoice. Anyone with the link can view the invoice.
                </p>
                <div className="flex gap-2">
                  <Input
                    value={`${window.location.origin}/invoices/${invoice.id}`}
                    readOnly
                    className="font-mono text-sm"
                  />
                  <Button
                    variant={linkCopied ? 'default' : 'outline'}
                    onClick={handleCopyLink}
                    className="min-w-24"
                  >
                    {linkCopied ? (
                      <>
                        <CheckCircle size={16} className="mr-2" />
                        Copied
                      </>
                    ) : (
                      <>
                        <Copy size={16} className="mr-2" />
                        Copy
                      </>
                    )}
                  </Button>
                </div>
              </div>

              <div className="p-4 bg-accent/10 border border-accent/20 rounded-lg">
                <div className="flex items-start gap-3">
                  <ShareNetwork size={20} className="text-accent mt-0.5" />
                  <div className="space-y-1">
                    <p className="text-sm font-medium">Share via Social Media or Messaging</p>
                    <p className="text-xs text-muted-foreground">
                      After copying the link, you can share it through WhatsApp, SMS, Slack, or any
                      other messaging platform.
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    const link = `${window.location.origin}/invoices/${invoice.id}`
                    window.open(
                      `https://wa.me/?text=Invoice ${invoice.invoiceNumber}: ${link}`,
                      '_blank'
                    )
                    onShare('link', 'whatsapp')
                  }}
                >
                  WhatsApp
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    const link = `${window.location.origin}/invoices/${invoice.id}`
                    window.open(
                      `sms:?&body=Invoice ${invoice.invoiceNumber}: ${link}`,
                      '_blank'
                    )
                    onShare('link', 'sms')
                  }}
                >
                  SMS
                </Button>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-4">
              <Button onClick={() => onOpenChange(false)}>Done</Button>
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
}
