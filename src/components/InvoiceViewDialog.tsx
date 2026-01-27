import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { PrintButton } from '@/components/PrintButton'
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
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[900px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span>Invoice #{invoice.invoiceNumber}</span>
            <PrintButton
              elementId="invoice-viewer-content"
              options={{
                title: `Invoice ${invoice.invoiceNumber}`,
                filename: `invoice-${invoice.invoiceNumber}.pdf`,
                includeHeader: true,
                headerText: branding.hotelName,
                includeFooter: true,
                footerText: `Invoice ${invoice.invoiceNumber} - Generated on ${new Date().toLocaleDateString()}`
              }}
              variant="outline"
              size="sm"
            />
          </DialogTitle>
        </DialogHeader>

        <div className="mt-4" id="invoice-viewer-content">
          <InvoiceViewerA4
            invoice={invoice}
            hotelInfo={{
              name: branding.hotelName,
              address: branding.hotelAddress,
              phone: branding.hotelPhone,
              email: branding.hotelEmail,
              website: branding.hotelWebsite,
              taxRegistrationNumber: branding.taxRegistrationNumber,
              logo: branding.logo
            }}
            currentUser={currentUser}
          />
        </div>
      </DialogContent>
    </Dialog>
  )
}
