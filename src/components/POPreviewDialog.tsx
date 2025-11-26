import { useState, useRef } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  Printer, 
  PaperPlaneRight, 
  Download, 
  Eye, 
  Stamp,
  QrCode as QrCodeIcon,
  CheckCircle,
  XCircle,
  Clock,
  ArrowRight
} from '@phosphor-icons/react'
import { toast } from 'sonner'
import { type PurchaseOrder, type Supplier, type POAuditEntry } from '@/lib/types'
import { formatCurrency, formatDate, formatDateTime, generateId } from '@/lib/helpers'

interface POPreviewDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  purchaseOrder: PurchaseOrder
  supplier: Supplier
  onStatusChange: (newStatus: 'approved' | 'ordered', po: PurchaseOrder) => void
  currentUser: { username: string }
}

export function POPreviewDialog({
  open,
  onOpenChange,
  purchaseOrder,
  supplier,
  onStatusChange,
  currentUser
}: POPreviewDialogProps) {
  const [emailRecipients, setEmailRecipients] = useState(supplier.email || '')
  const [isSendingEmail, setIsSendingEmail] = useState(false)
  const printRef = useRef<HTMLDivElement>(null)

  const handlePrint = () => {
    const printWindow = window.open('', '', 'width=800,height=600')
    if (!printWindow) {
      toast.error('Unable to open print window')
      return
    }

    const content = printRef.current?.innerHTML || ''
    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Purchase Order - ${purchaseOrder.poNumber}</title>
          <style>
            * { margin: 0; padding: 0; box-sizing: border-box; }
            body { 
              font-family: 'IBM Plex Sans', Arial, sans-serif; 
              padding: 40px; 
              color: #1a1a1a;
              background: white;
            }
            .watermark {
              position: fixed;
              top: 50%;
              left: 50%;
              transform: translate(-50%, -50%) rotate(-45deg);
              font-size: 120px;
              font-weight: bold;
              opacity: 0.08;
              z-index: -1;
              color: ${purchaseOrder.watermark === 'DRAFT' ? '#6b7280' : purchaseOrder.watermark === 'APPROVED' ? '#10b981' : '#3b82f6'};
            }
            .header { display: flex; justify-between; align-items: start; margin-bottom: 30px; }
            .logo { font-size: 28px; font-weight: 700; color: #047857; }
            .po-details { text-align: right; }
            .po-number { font-size: 24px; font-weight: 600; color: #047857; }
            .status-badge { 
              display: inline-block; 
              padding: 6px 12px; 
              border-radius: 6px; 
              font-size: 12px;
              font-weight: 600;
              margin-top: 8px;
              background: ${purchaseOrder.status === 'draft' ? '#f3f4f6' : purchaseOrder.status === 'approved' ? '#d1fae5' : '#dbeafe'};
              color: ${purchaseOrder.status === 'draft' ? '#6b7280' : purchaseOrder.status === 'approved' ? '#065f46' : '#1e40af'};
            }
            .info-section { margin: 30px 0; display: flex; gap: 40px; }
            .info-block { flex: 1; }
            .info-block h3 { font-size: 12px; font-weight: 600; color: #6b7280; margin-bottom: 8px; text-transform: uppercase; letter-spacing: 0.5px; }
            .info-block p { margin: 4px 0; font-size: 14px; }
            table { width: 100%; border-collapse: collapse; margin: 30px 0; }
            thead { background: #f9fafb; }
            th { padding: 12px; text-align: left; font-size: 12px; font-weight: 600; color: #6b7280; text-transform: uppercase; border-bottom: 2px solid #e5e7eb; }
            td { padding: 12px; border-bottom: 1px solid #f3f4f6; font-size: 14px; }
            .text-right { text-align: right; }
            .totals { margin-top: 20px; }
            .totals-row { display: flex; justify-content: flex-end; margin: 8px 0; }
            .totals-label { width: 150px; font-weight: 600; }
            .totals-value { width: 120px; text-align: right; }
            .grand-total { font-size: 18px; font-weight: 700; color: #047857; padding-top: 8px; border-top: 2px solid #047857; }
            .notes { margin: 30px 0; padding: 16px; background: #f9fafb; border-left: 4px solid #047857; }
            .notes h3 { font-size: 14px; font-weight: 600; margin-bottom: 8px; }
            .notes p { font-size: 14px; color: #4b5563; }
            .footer { margin-top: 50px; padding-top: 20px; border-top: 2px solid #e5e7eb; }
            .signatures { display: flex; gap: 60px; margin-top: 40px; }
            .signature-block { flex: 1; }
            .signature-line { border-top: 1px solid #000; padding-top: 8px; margin-top: 50px; }
            .signature-label { font-size: 12px; color: #6b7280; }
            .qr-section { margin-top: 30px; text-align: center; }
            .qr-code { width: 120px; height: 120px; border: 2px solid #e5e7eb; display: inline-flex; align-items: center; justify-content: center; font-size: 10px; color: #6b7280; }
            @media print {
              body { padding: 20px; }
              .no-print { display: none; }
            }
          </style>
        </head>
        <body>
          <div class="watermark">${purchaseOrder.watermark || 'DRAFT'}</div>
          ${content}
        </body>
      </html>
    `)
    printWindow.document.close()
    printWindow.focus()
    
    setTimeout(() => {
      printWindow.print()
      printWindow.close()
      
      const updatedPO: PurchaseOrder = {
        ...purchaseOrder,
        printedAt: Date.now(),
        printedBy: currentUser.username,
        auditLog: [
          ...(purchaseOrder.auditLog || []),
          {
            id: generateId(),
            timestamp: Date.now(),
            action: 'Printed',
            performedBy: currentUser.username,
            details: 'PO document printed'
          }
        ]
      }
      
      onStatusChange(purchaseOrder.status as 'approved' | 'ordered', updatedPO)
      toast.success('Purchase order printed')
    }, 250)
  }

  const handleEmailSend = async () => {
    if (!emailRecipients.trim()) {
      toast.error('Please enter email recipients')
      return
    }

    setIsSendingEmail(true)

    await new Promise(resolve => setTimeout(resolve, 1500))

    const recipients = emailRecipients.split(',').map(e => e.trim()).filter(Boolean)
    
    const updatedPO: PurchaseOrder = {
      ...purchaseOrder,
      emailedTo: recipients,
      emailedAt: Date.now(),
      sentAt: Date.now(),
      sentBy: currentUser.username,
      status: 'ordered',
      auditLog: [
        ...(purchaseOrder.auditLog || []),
        {
          id: generateId(),
          timestamp: Date.now(),
          action: 'Emailed',
          performedBy: currentUser.username,
          details: `PO sent to ${recipients.join(', ')}`,
          previousStatus: purchaseOrder.status,
          newStatus: 'ordered'
        }
      ]
    }

    onStatusChange('ordered', updatedPO)
    setIsSendingEmail(false)
    toast.success(`Purchase order emailed to ${recipients.length} recipient(s)`)
    onOpenChange(false)
  }

  const handleApprove = () => {
    const updatedPO: PurchaseOrder = {
      ...purchaseOrder,
      status: 'approved',
      approvedBy: currentUser.username,
      approvedAt: Date.now(),
      watermark: 'APPROVED',
      auditLog: [
        ...(purchaseOrder.auditLog || []),
        {
          id: generateId(),
          timestamp: Date.now(),
          action: 'Approved',
          performedBy: currentUser.username,
          details: 'PO approved for sending',
          previousStatus: purchaseOrder.status,
          newStatus: 'approved'
        }
      ]
    }

    onStatusChange('approved', updatedPO)
    toast.success('Purchase order approved')
  }

  const handleDownload = () => {
    toast.info('PDF download feature - simulated')
    const updatedPO: PurchaseOrder = {
      ...purchaseOrder,
      auditLog: [
        ...(purchaseOrder.auditLog || []),
        {
          id: generateId(),
          timestamp: Date.now(),
          action: 'Downloaded',
          performedBy: currentUser.username,
          details: 'PO PDF downloaded'
        }
      ]
    }
    onStatusChange(purchaseOrder.status as 'approved' | 'ordered', updatedPO)
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'draft':
        return <Clock className="text-muted-foreground" />
      case 'approved':
        return <CheckCircle className="text-success" />
      case 'ordered':
        return <PaperPlaneRight className="text-primary" />
      case 'received':
        return <CheckCircle className="text-success" />
      case 'closed':
        return <CheckCircle className="text-muted-foreground" />
      default:
        return <Clock className="text-muted-foreground" />
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            <Eye size={24} className="text-primary" />
            Purchase Order Preview
          </DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="preview" className="flex-1">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="preview">Preview</TabsTrigger>
            <TabsTrigger value="audit">Audit Trail</TabsTrigger>
            <TabsTrigger value="email">Email</TabsTrigger>
          </TabsList>

          <TabsContent value="preview" className="mt-4">
            <ScrollArea className="h-[500px] pr-4">
              <div ref={printRef} className="bg-white p-8">
                <div className="header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '30px' }}>
                  <div>
                    <div className="logo" style={{ fontSize: '28px', fontWeight: 700, color: '#047857' }}>W3 Hotel</div>
                    <p style={{ fontSize: '14px', color: '#6b7280', marginTop: '4px' }}>Property Management System</p>
                    <p style={{ fontSize: '12px', color: '#9ca3af', marginTop: '2px' }}>123 Hotel Street, City, State 12345</p>
                  </div>
                  <div className="po-details">
                    <div className="po-number" style={{ fontSize: '24px', fontWeight: 600, color: '#047857' }}>
                      {purchaseOrder.poNumber}
                    </div>
                    <div className="status-badge" style={{ 
                      display: 'inline-block',
                      padding: '6px 12px',
                      borderRadius: '6px',
                      fontSize: '12px',
                      fontWeight: 600,
                      marginTop: '8px',
                      background: purchaseOrder.status === 'draft' ? '#f3f4f6' : purchaseOrder.status === 'approved' ? '#d1fae5' : '#dbeafe',
                      color: purchaseOrder.status === 'draft' ? '#6b7280' : purchaseOrder.status === 'approved' ? '#065f46' : '#1e40af'
                    }}>
                      {purchaseOrder.status.toUpperCase()}
                    </div>
                    <p style={{ fontSize: '12px', color: '#6b7280', marginTop: '8px' }}>
                      Rev. {purchaseOrder.revisionNumber}
                    </p>
                  </div>
                </div>

                <div className="info-section" style={{ margin: '30px 0', display: 'flex', gap: '40px' }}>
                  <div className="info-block" style={{ flex: 1 }}>
                    <h3 style={{ fontSize: '12px', fontWeight: 600, color: '#6b7280', marginBottom: '8px', textTransform: 'uppercase' }}>Supplier</h3>
                    <p style={{ fontWeight: 600, fontSize: '16px' }}>{supplier.name}</p>
                    {supplier.address && <p style={{ fontSize: '14px', marginTop: '4px' }}>{supplier.address}</p>}
                    {supplier.city && <p style={{ fontSize: '14px' }}>{supplier.city}, {supplier.state} {supplier.postalCode}</p>}
                    <p style={{ fontSize: '14px', marginTop: '8px' }}>Contact: {supplier.phone}</p>
                    {supplier.email && <p style={{ fontSize: '14px' }}>Email: {supplier.email}</p>}
                  </div>

                  <div className="info-block" style={{ flex: 1 }}>
                    <h3 style={{ fontSize: '12px', fontWeight: 600, color: '#6b7280', marginBottom: '8px', textTransform: 'uppercase' }}>Purchase Order Details</h3>
                    <p style={{ fontSize: '14px', margin: '4px 0' }}>
                      <span style={{ fontWeight: 600 }}>Date:</span> {formatDate(purchaseOrder.createdAt)}
                    </p>
                    <p style={{ fontSize: '14px', margin: '4px 0' }}>
                      <span style={{ fontWeight: 600 }}>Created By:</span> {purchaseOrder.createdBy}
                    </p>
                    {purchaseOrder.expectedDelivery && (
                      <p style={{ fontSize: '14px', margin: '4px 0' }}>
                        <span style={{ fontWeight: 600 }}>Expected Delivery:</span> {formatDate(purchaseOrder.expectedDelivery)}
                      </p>
                    )}
                    {purchaseOrder.approvedBy && (
                      <p style={{ fontSize: '14px', margin: '4px 0' }}>
                        <span style={{ fontWeight: 600 }}>Approved By:</span> {purchaseOrder.approvedBy}
                      </p>
                    )}
                    <p style={{ fontSize: '14px', margin: '4px 0' }}>
                      <span style={{ fontWeight: 600 }}>Payment Terms:</span> {supplier.paymentTerms}
                    </p>
                  </div>
                </div>

                <table style={{ width: '100%', borderCollapse: 'collapse', margin: '30px 0' }}>
                  <thead style={{ background: '#f9fafb' }}>
                    <tr>
                      <th style={{ padding: '12px', textAlign: 'left', fontSize: '12px', fontWeight: 600, color: '#6b7280', textTransform: 'uppercase', borderBottom: '2px solid #e5e7eb' }}>#</th>
                      <th style={{ padding: '12px', textAlign: 'left', fontSize: '12px', fontWeight: 600, color: '#6b7280', textTransform: 'uppercase', borderBottom: '2px solid #e5e7eb' }}>Item Description</th>
                      <th style={{ padding: '12px', textAlign: 'right', fontSize: '12px', fontWeight: 600, color: '#6b7280', textTransform: 'uppercase', borderBottom: '2px solid #e5e7eb' }}>Quantity</th>
                      <th style={{ padding: '12px', textAlign: 'right', fontSize: '12px', fontWeight: 600, color: '#6b7280', textTransform: 'uppercase', borderBottom: '2px solid #e5e7eb' }}>Unit Price</th>
                      <th style={{ padding: '12px', textAlign: 'right', fontSize: '12px', fontWeight: 600, color: '#6b7280', textTransform: 'uppercase', borderBottom: '2px solid #e5e7eb' }}>Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {purchaseOrder.items.map((item, index) => (
                      <tr key={item.id}>
                        <td style={{ padding: '12px', borderBottom: '1px solid #f3f4f6', fontSize: '14px' }}>{index + 1}</td>
                        <td style={{ padding: '12px', borderBottom: '1px solid #f3f4f6', fontSize: '14px' }}>
                          <div style={{ fontWeight: 600 }}>{item.name}</div>
                          <div style={{ fontSize: '12px', color: '#6b7280' }}>Unit: {item.unit}</div>
                        </td>
                        <td style={{ padding: '12px', borderBottom: '1px solid #f3f4f6', fontSize: '14px', textAlign: 'right' }}>{item.quantity}</td>
                        <td style={{ padding: '12px', borderBottom: '1px solid #f3f4f6', fontSize: '14px', textAlign: 'right' }}>{formatCurrency(item.unitPrice)}</td>
                        <td style={{ padding: '12px', borderBottom: '1px solid #f3f4f6', fontSize: '14px', textAlign: 'right', fontWeight: 600 }}>{formatCurrency(item.total)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                <div style={{ marginTop: '20px' }}>
                  <div style={{ display: 'flex', justifyContent: 'flex-end', margin: '8px 0' }}>
                    <div style={{ width: '150px', fontWeight: 600 }}>Subtotal:</div>
                    <div style={{ width: '120px', textAlign: 'right' }}>{formatCurrency(purchaseOrder.subtotal)}</div>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'flex-end', margin: '8px 0' }}>
                    <div style={{ width: '150px', fontWeight: 600 }}>Tax (10%):</div>
                    <div style={{ width: '120px', textAlign: 'right' }}>{formatCurrency(purchaseOrder.tax)}</div>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'flex-end', margin: '8px 0', fontSize: '18px', fontWeight: 700, color: '#047857', paddingTop: '8px', borderTop: '2px solid #047857' }}>
                    <div style={{ width: '150px' }}>Grand Total:</div>
                    <div style={{ width: '120px', textAlign: 'right' }}>{formatCurrency(purchaseOrder.total)}</div>
                  </div>
                </div>

                {purchaseOrder.notes && (
                  <div style={{ margin: '30px 0', padding: '16px', background: '#f9fafb', borderLeft: '4px solid #047857' }}>
                    <h3 style={{ fontSize: '14px', fontWeight: 600, marginBottom: '8px' }}>Notes</h3>
                    <p style={{ fontSize: '14px', color: '#4b5563' }}>{purchaseOrder.notes}</p>
                  </div>
                )}

                <div style={{ marginTop: '50px', paddingTop: '20px', borderTop: '2px solid #e5e7eb' }}>
                  <div style={{ display: 'flex', gap: '60px', marginTop: '40px' }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ borderTop: '1px solid #000', paddingTop: '8px', marginTop: '50px' }}>
                        <div style={{ fontSize: '12px', color: '#6b7280' }}>Prepared By</div>
                        <div style={{ fontSize: '14px', marginTop: '4px' }}>{purchaseOrder.createdBy}</div>
                        <div style={{ fontSize: '12px', color: '#6b7280', marginTop: '2px' }}>{formatDate(purchaseOrder.createdAt)}</div>
                      </div>
                    </div>
                    {purchaseOrder.approvedBy && (
                      <div style={{ flex: 1 }}>
                        <div style={{ borderTop: '1px solid #000', paddingTop: '8px', marginTop: '50px' }}>
                          <div style={{ fontSize: '12px', color: '#6b7280' }}>Approved By</div>
                          <div style={{ fontSize: '14px', marginTop: '4px' }}>{purchaseOrder.approvedBy}</div>
                          <div style={{ fontSize: '12px', color: '#6b7280', marginTop: '2px' }}>
                            {purchaseOrder.approvedAt ? formatDate(purchaseOrder.approvedAt) : ''}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  <div style={{ marginTop: '30px', textAlign: 'center' }}>
                    <div style={{ display: 'inline-flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
                      <div style={{ width: '120px', height: '120px', border: '2px solid #e5e7eb', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px', color: '#6b7280', background: '#f9fafb' }}>
                        <QrCodeIcon size={80} className="text-muted-foreground" />
                      </div>
                      <div style={{ fontSize: '10px', color: '#6b7280', fontFamily: 'monospace' }}>
                        {purchaseOrder.qrCode}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </ScrollArea>
          </TabsContent>

          <TabsContent value="audit" className="mt-4">
            <ScrollArea className="h-[500px] pr-4">
              <div className="space-y-4">
                <div className="flex items-center gap-3 text-sm font-medium text-muted-foreground mb-6">
                  <Stamp size={20} />
                  <span>Purchase Order Activity History</span>
                </div>

                {purchaseOrder.auditLog && purchaseOrder.auditLog.length > 0 ? (
                  <div className="space-y-3">
                    {[...purchaseOrder.auditLog].reverse().map((entry, index) => (
                      <div key={entry.id} className="border rounded-lg p-4 bg-card">
                        <div className="flex items-start gap-3">
                          <div className="mt-1">
                            {getStatusIcon(entry.newStatus || 'draft')}
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center justify-between mb-1">
                              <span className="font-semibold">{entry.action}</span>
                              <span className="text-xs text-muted-foreground">
                                {formatDateTime(entry.timestamp)}
                              </span>
                            </div>
                            <p className="text-sm text-muted-foreground mb-2">{entry.details}</p>
                            <div className="flex items-center gap-2 text-xs">
                              <Badge variant="secondary" className="text-xs">
                                {entry.performedBy}
                              </Badge>
                              {entry.previousStatus && entry.newStatus && (
                                <div className="flex items-center gap-1">
                                  <Badge variant="outline" className="text-xs capitalize">
                                    {entry.previousStatus}
                                  </Badge>
                                  <ArrowRight size={12} className="text-muted-foreground" />
                                  <Badge variant="outline" className="text-xs capitalize">
                                    {entry.newStatus}
                                  </Badge>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12 text-muted-foreground">
                    <Stamp size={48} className="mx-auto mb-3 opacity-50" />
                    <p>No audit trail entries yet</p>
                  </div>
                )}

                <div className="border rounded-lg p-4 bg-muted/30 mt-6">
                  <h4 className="font-semibold mb-3 flex items-center gap-2">
                    <Clock size={18} />
                    Status Timeline
                  </h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Created:</span>
                      <span className="font-medium">{formatDateTime(purchaseOrder.createdAt)}</span>
                    </div>
                    {purchaseOrder.approvedAt && (
                      <div className="flex justify-between">
                        <span>Approved:</span>
                        <span className="font-medium">{formatDateTime(purchaseOrder.approvedAt)}</span>
                      </div>
                    )}
                    {purchaseOrder.sentAt && (
                      <div className="flex justify-between">
                        <span>Sent to Supplier:</span>
                        <span className="font-medium">{formatDateTime(purchaseOrder.sentAt)}</span>
                      </div>
                    )}
                    {purchaseOrder.emailedAt && (
                      <div className="flex justify-between">
                        <span>Emailed:</span>
                        <span className="font-medium">{formatDateTime(purchaseOrder.emailedAt)}</span>
                      </div>
                    )}
                    {purchaseOrder.printedAt && (
                      <div className="flex justify-between">
                        <span>Last Printed:</span>
                        <span className="font-medium">{formatDateTime(purchaseOrder.printedAt)}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </ScrollArea>
          </TabsContent>

          <TabsContent value="email" className="mt-4">
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="email-recipients">Email Recipients</Label>
                <Input
                  id="email-recipients"
                  type="email"
                  placeholder="supplier@example.com, contact@supplier.com"
                  value={emailRecipients}
                  onChange={(e) => setEmailRecipients(e.target.value)}
                  disabled={purchaseOrder.status !== 'approved'}
                />
                <p className="text-xs text-muted-foreground">
                  Enter multiple email addresses separated by commas
                </p>
              </div>

              <Separator />

              <div className="space-y-2">
                <h4 className="font-semibold">Email Preview</h4>
                <div className="border rounded-lg p-4 bg-muted/30 text-sm space-y-2">
                  <div><strong>Subject:</strong> Purchase Order {purchaseOrder.poNumber} from W3 Hotel</div>
                  <div><strong>To:</strong> {emailRecipients || 'No recipients'}</div>
                  <Separator className="my-3" />
                  <div className="space-y-2 text-muted-foreground">
                    <p>Dear {supplier.name},</p>
                    <p>Please find attached our Purchase Order {purchaseOrder.poNumber} for your review and processing.</p>
                    <p><strong>PO Details:</strong></p>
                    <ul className="list-disc list-inside space-y-1 ml-4">
                      <li>Total Amount: {formatCurrency(purchaseOrder.total)}</li>
                      <li>Items: {purchaseOrder.items.length}</li>
                      {purchaseOrder.expectedDelivery && (
                        <li>Expected Delivery: {formatDate(purchaseOrder.expectedDelivery)}</li>
                      )}
                      <li>Payment Terms: {supplier.paymentTerms}</li>
                    </ul>
                    <p>Please confirm receipt and provide an estimated delivery date.</p>
                    <p>Best regards,<br />W3 Hotel Procurement Team</p>
                  </div>
                </div>
              </div>

              {purchaseOrder.emailedTo && purchaseOrder.emailedTo.length > 0 && (
                <div className="border rounded-lg p-4 bg-success/5">
                  <div className="flex items-start gap-2">
                    <CheckCircle size={20} className="text-success mt-0.5" />
                    <div>
                      <p className="font-medium text-sm">Previously emailed to:</p>
                      <p className="text-sm text-muted-foreground">{purchaseOrder.emailedTo.join(', ')}</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        on {purchaseOrder.emailedAt ? formatDateTime(purchaseOrder.emailedAt) : ''}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Close
          </Button>
          <Button variant="outline" onClick={handleDownload}>
            <Download size={18} className="mr-2" />
            Download PDF
          </Button>
          <Button variant="outline" onClick={handlePrint}>
            <Printer size={18} className="mr-2" />
            Print
          </Button>
          {purchaseOrder.status === 'draft' && (
            <Button onClick={handleApprove}>
              <CheckCircle size={18} className="mr-2" />
              Approve PO
            </Button>
          )}
          {purchaseOrder.status === 'approved' && (
            <Button onClick={handleEmailSend} disabled={isSendingEmail || !emailRecipients.trim()}>
              <PaperPlaneRight size={18} className="mr-2" />
              {isSendingEmail ? 'Sending...' : 'Send Email'}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
