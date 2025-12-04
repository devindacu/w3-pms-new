import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Download, Printer, ShareNetwork } from '@phosphor-icons/react'
import type { GuestInvoice, SystemUser, HotelBranding } from '@/lib/types'
import { InvoiceViewerA4 } from '@/components/InvoiceViewerA4'

interface InvoiceViewDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  invoice: GuestInvoice
  branding: HotelBranding
  currentUser: SystemUser
}

export function InvoiceViewDialog({ open, onOpenChange, invoice, branding, currentUser }: InvoiceViewDialogProps) {
  const handleDownload = () => {
    window.print()
  }

  const handlePrint = () => {
    window.print()
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[900px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span>Invoice #{invoice.invoiceNumber}</span>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={handleDownload}>
                <Download size={16} className="mr-2" />
                Download
              </Button>
              <Button variant="outline" size="sm" onClick={handlePrint}>
                <Printer size={16} className="mr-2" />
                Print
              </Button>
            </div>
          </DialogTitle>
        </DialogHeader>

        <div className="mt-4">
          <InvoiceViewerA4
            invoice={invoice}
            hotelInfo={branding}
            currentUser={currentUser}
          />
        </div>
      </DialogContent>
    </Dialog>
  )
}
