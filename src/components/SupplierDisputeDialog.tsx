import { useState, useEffect, useRef } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Alert, AlertDescription } from '@/components/ui/alert'
import {
  Warning,
  ChatCircle,
  Image as ImageIcon,
  Camera,
  X,
  Phone,
  Envelope,
  FileText,
  CheckCircle,
  Clock,
  ArrowRight
} from '@phosphor-icons/react'
import { toast } from 'sonner'
import {
  type SupplierDispute,
  type DisputeItem,
  type DisputeEvidence,
  type DisputeCommunication,
  type Supplier,
  type PurchaseOrder,
  type GoodsReceivedNote,
  type Invoice,
  type SystemUser,
  type DisputeType,
  type DisputeStatus,
  type DisputePriority,
  type DisputeResolution
} from '@/lib/types'
import { generateId, generateNumber, formatCurrency, formatDate } from '@/lib/helpers'

interface SupplierDisputeDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  dispute?: SupplierDispute
  disputes: SupplierDispute[]
  setDisputes: (disputes: SupplierDispute[]) => void
  suppliers: Supplier[]
  purchaseOrders: PurchaseOrder[]
  grns: GoodsReceivedNote[]
  invoices: Invoice[]
  currentUser: SystemUser
  initialData?: Partial<SupplierDispute>
}

export function SupplierDisputeDialog({
  open,
  onOpenChange,
  dispute,
  disputes,
  setDisputes,
  suppliers,
  purchaseOrders,
  grns,
  invoices,
  currentUser,
  initialData
}: SupplierDisputeDialogProps) {
  const [supplierId, setSupplierId] = useState<string | undefined>(undefined)
  const [purchaseOrderId, setPurchaseOrderId] = useState<string | undefined>(undefined)
  const [grnId, setGrnId] = useState<string | undefined>(undefined)
  const [invoiceId, setInvoiceId] = useState<string | undefined>(undefined)
  const [disputeType, setDisputeType] = useState<DisputeType>('quality-issue')
  const [status, setStatus] = useState<DisputeStatus>('open')
  const [priority, setPriority] = useState<DisputePriority>('medium')
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [disputedAmount, setDisputedAmount] = useState('')
  const [claimAmount, setClaimAmount] = useState('')
  const [items, setItems] = useState<DisputeItem[]>([])
  const [evidence, setEvidence] = useState<DisputeEvidence[]>([])
  const [communications, setCommunications] = useState<DisputeCommunication[]>([])
  const [resolution, setResolution] = useState<DisputeResolution | undefined>()
  const [resolutionDetails, setResolutionDetails] = useState('')
  const [agreedAmount, setAgreedAmount] = useState('')
  const [creditNoteNumber, setCreditNoteNumber] = useState('')
  const [creditNoteAmount, setCreditNoteAmount] = useState('')
  const [deadlineDate, setDeadlineDate] = useState('')
  const [notes, setNotes] = useState('')
  
  const [newCommunication, setNewCommunication] = useState({
    method: 'email' as const,
    contactPerson: '',
    subject: '',
    message: '',
    followUpRequired: false,
    followUpDate: ''
  })

  const fileInputRef = useRef<HTMLInputElement>(null)

  const isViewMode = !!dispute

  useEffect(() => {
    if (dispute) {
      setSupplierId(dispute.supplierId)
      setPurchaseOrderId(dispute.purchaseOrderId)
      setGrnId(dispute.grnId)
      setInvoiceId(dispute.invoiceId)
      setDisputeType(dispute.disputeType)
      setStatus(dispute.status)
      setPriority(dispute.priority)
      setTitle(dispute.title)
      setDescription(dispute.description)
      setDisputedAmount(dispute.disputedAmount.toString())
      setClaimAmount(dispute.claimAmount.toString())
      setItems(dispute.items)
      setEvidence(dispute.evidence)
      setCommunications(dispute.communications)
      setResolution(dispute.resolution)
      setResolutionDetails(dispute.resolutionDetails || '')
      setAgreedAmount(dispute.agreedAmount?.toString() || '')
      setCreditNoteNumber(dispute.creditNoteNumber || '')
      setCreditNoteAmount(dispute.creditNoteAmount?.toString() || '')
      setDeadlineDate(dispute.deadlineDate ? new Date(dispute.deadlineDate).toISOString().split('T')[0] : '')
      setNotes(dispute.notes || '')
    } else if (initialData) {
      setSupplierId(initialData.supplierId)
      setPurchaseOrderId(initialData.purchaseOrderId)
      setGrnId(initialData.grnId)
      setInvoiceId(initialData.invoiceId)
      setDisputeType(initialData.disputeType || 'quality-issue')
      setPriority(initialData.priority || 'medium')
      setTitle(initialData.title || '')
      setDescription(initialData.description || '')
      setDisputedAmount(initialData.disputedAmount?.toString() || '')
      setClaimAmount(initialData.claimAmount?.toString() || '')
      setItems(initialData.items || [])
    } else {
      resetForm()
    }
  }, [dispute, initialData, open])

  const resetForm = () => {
    setSupplierId(undefined)
    setPurchaseOrderId(undefined)
    setGrnId(undefined)
    setInvoiceId(undefined)
    setDisputeType('quality-issue')
    setStatus('open')
    setPriority('medium')
    setTitle('')
    setDescription('')
    setDisputedAmount('')
    setClaimAmount('')
    setItems([])
    setEvidence([])
    setCommunications([])
    setResolution(undefined)
    setResolutionDetails('')
    setAgreedAmount('')
    setCreditNoteNumber('')
    setCreditNoteAmount('')
    setDeadlineDate('')
    setNotes('')
  }

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files) return

    Array.from(files).forEach(file => {
      const reader = new FileReader()
      reader.onloadend = () => {
        const base64 = reader.result as string
        const newEvidence: DisputeEvidence = {
          id: generateId(),
          type: 'photo',
          title: file.name,
          fileData: base64,
          uploadedBy: currentUser.username,
          uploadedAt: Date.now()
        }
        setEvidence(prev => [...prev, newEvidence])
      }
      reader.readAsDataURL(file)
    })
    
    toast.success(`${files.length} file(s) uploaded`)
  }

  const removeEvidence = (id: string) => {
    setEvidence(prev => prev.filter(e => e.id !== id))
  }

  const handleAddCommunication = () => {
    if (!newCommunication.message.trim()) {
      toast.error('Please enter a message')
      return
    }

    const comm: DisputeCommunication = {
      id: generateId(),
      direction: 'outgoing',
      method: newCommunication.method,
      contactPerson: newCommunication.contactPerson || undefined,
      subject: newCommunication.subject || undefined,
      message: newCommunication.message,
      sentBy: currentUser.username,
      timestamp: Date.now(),
      followUpRequired: newCommunication.followUpRequired,
      followUpDate: newCommunication.followUpDate ? new Date(newCommunication.followUpDate).getTime() : undefined
    }

    setCommunications(prev => [...prev, comm])
    setNewCommunication({
      method: 'email',
      contactPerson: '',
      subject: '',
      message: '',
      followUpRequired: false,
      followUpDate: ''
    })
    toast.success('Communication logged')
  }

  const handleSave = () => {
    if (!supplierId) {
      toast.error('Please select a supplier')
      return
    }
    if (!title.trim()) {
      toast.error('Please enter a title')
      return
    }
    if (!description.trim()) {
      toast.error('Please enter a description')
      return
    }

    const now = Date.now()
    const supplier = suppliers.find(s => s.id === supplierId)

    if (dispute) {
      const updated = disputes.map(d =>
        d.id === dispute.id
          ? {
              ...d,
              status,
              priority,
              title,
              description,
              disputedAmount: parseFloat(disputedAmount) || 0,
              claimAmount: parseFloat(claimAmount) || 0,
              items,
              evidence,
              communications,
              resolution,
              resolutionDetails: resolutionDetails || undefined,
              agreedAmount: agreedAmount ? parseFloat(agreedAmount) : undefined,
              creditNoteNumber: creditNoteNumber || undefined,
              creditNoteAmount: creditNoteAmount ? parseFloat(creditNoteAmount) : undefined,
              deadlineDate: deadlineDate ? new Date(deadlineDate).getTime() : undefined,
              notes,
              resolvedAt: status === 'resolved' ? now : undefined,
              resolvedBy: status === 'resolved' ? currentUser.username : undefined,
              closedAt: status === 'closed' ? now : undefined,
              updatedAt: now
            }
          : d
      )
      setDisputes(updated)
      toast.success('Dispute updated')
    } else {
      const newDispute: SupplierDispute = {
        id: generateId(),
        disputeNumber: generateNumber('DISP'),
        supplierId,
        supplierName: supplier?.name || '',
        purchaseOrderId: purchaseOrderId || undefined,
        grnId: grnId || undefined,
        invoiceId: invoiceId || undefined,
        disputeType,
        status,
        priority,
        title,
        description,
        disputedAmount: parseFloat(disputedAmount) || 0,
        claimAmount: parseFloat(claimAmount) || 0,
        items,
        evidence,
        communications,
        resolution,
        resolutionDetails: resolutionDetails || undefined,
        agreedAmount: agreedAmount ? parseFloat(agreedAmount) : undefined,
        creditNoteNumber: creditNoteNumber || undefined,
        creditNoteAmount: creditNoteAmount ? parseFloat(creditNoteAmount) : undefined,
        deadlineDate: deadlineDate ? new Date(deadlineDate).getTime() : undefined,
        raisedBy: currentUser.username,
        raisedAt: now,
        notes,
        updatedAt: now
      }
      setDisputes([newDispute, ...disputes])
      toast.success('Dispute created')
    }

    onOpenChange(false)
  }

  const selectedSupplier = suppliers.find(s => s.id === supplierId)
  const selectedPO = purchaseOrders.find(po => po.id === purchaseOrderId)
  const selectedGRN = grns.find(g => g.id === grnId)
  const selectedInvoice = invoices.find(i => i.id === invoiceId)

  const getStatusBadge = (status: DisputeStatus) => {
    const variants = {
      'open': 'destructive',
      'in-review': 'default',
      'supplier-contacted': 'secondary',
      'awaiting-response': 'outline',
      'negotiating': 'default',
      'resolved': 'default',
      'closed': 'secondary',
      'escalated': 'destructive'
    }
    return <Badge variant={variants[status] as any}>{status.replace(/-/g, ' ').toUpperCase()}</Badge>
  }

  const getPriorityBadge = (priority: DisputePriority) => {
    const variants = {
      'low': 'secondary',
      'medium': 'default',
      'high': 'destructive',
      'critical': 'destructive'
    }
    return <Badge variant={variants[priority] as any}>{priority.toUpperCase()}</Badge>
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-7xl max-h-[95vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="flex items-center gap-3">
              <Warning size={24} />
              {dispute 
                ? `Supplier Dispute ${dispute.disputeNumber}` 
                : 'New Supplier Dispute'}
            </DialogTitle>
            {dispute && (
              <div className="flex items-center gap-2">
                {getStatusBadge(dispute.status)}
                {getPriorityBadge(dispute.priority)}
              </div>
            )}
          </div>
        </DialogHeader>

        <Tabs defaultValue="details" className="w-full">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="details">Details</TabsTrigger>
            <TabsTrigger value="items">Items</TabsTrigger>
            <TabsTrigger value="evidence">Evidence</TabsTrigger>
            <TabsTrigger value="communications">Communications</TabsTrigger>
            <TabsTrigger value="resolution">Resolution</TabsTrigger>
          </TabsList>

          <TabsContent value="details" className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Supplier *</Label>
                <Select value={supplierId} onValueChange={setSupplierId} disabled={isViewMode}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select supplier" />
                  </SelectTrigger>
                  <SelectContent>
                    {suppliers.map(s => (
                      <SelectItem key={s.id} value={s.id}>
                        {s.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Purchase Order</Label>
                <Select value={purchaseOrderId} onValueChange={setPurchaseOrderId} disabled={isViewMode}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select PO (optional)" />
                  </SelectTrigger>
                  <SelectContent>
                    {purchaseOrders
                      .filter(po => !supplierId || po.supplierId === supplierId)
                      .map(po => (
                        <SelectItem key={po.id} value={po.id}>
                          {po.poNumber} - {formatCurrency(po.total)}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>GRN</Label>
                <Select value={grnId} onValueChange={setGrnId} disabled={isViewMode}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select GRN (optional)" />
                  </SelectTrigger>
                  <SelectContent>
                    {grns
                      .filter(g => !purchaseOrderId || g.purchaseOrderId === purchaseOrderId)
                      .map(g => (
                        <SelectItem key={g.id} value={g.id}>
                          {g.grnNumber} - {formatDate(g.receivedAt)}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Invoice</Label>
                <Select value={invoiceId} onValueChange={setInvoiceId} disabled={isViewMode}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select Invoice (optional)" />
                  </SelectTrigger>
                  <SelectContent>
                    {invoices
                      .filter(i => !supplierId || i.supplierId === supplierId)
                      .map(i => (
                        <SelectItem key={i.id} value={i.id}>
                          {i.invoiceNumber} - {formatCurrency(i.total)}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Dispute Type *</Label>
                <Select value={disputeType} onValueChange={(v) => setDisputeType(v as DisputeType)} disabled={isViewMode}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="quality-issue">Quality Issue</SelectItem>
                    <SelectItem value="quantity-shortage">Quantity Shortage</SelectItem>
                    <SelectItem value="damaged-goods">Damaged Goods</SelectItem>
                    <SelectItem value="late-delivery">Late Delivery</SelectItem>
                    <SelectItem value="incorrect-items">Incorrect Items</SelectItem>
                    <SelectItem value="pricing-error">Pricing Error</SelectItem>
                    <SelectItem value="invoice-mismatch">Invoice Mismatch</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Priority *</Label>
                <Select value={priority} onValueChange={(v) => setPriority(v as DisputePriority)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="critical">Critical</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {isViewMode && (
                <div>
                  <Label>Status</Label>
                  <Select value={status} onValueChange={(v) => setStatus(v as DisputeStatus)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="open">Open</SelectItem>
                      <SelectItem value="in-review">In Review</SelectItem>
                      <SelectItem value="supplier-contacted">Supplier Contacted</SelectItem>
                      <SelectItem value="awaiting-response">Awaiting Response</SelectItem>
                      <SelectItem value="negotiating">Negotiating</SelectItem>
                      <SelectItem value="resolved">Resolved</SelectItem>
                      <SelectItem value="closed">Closed</SelectItem>
                      <SelectItem value="escalated">Escalated</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}

              <div>
                <Label>Deadline Date</Label>
                <Input
                  type="date"
                  value={deadlineDate}
                  onChange={(e) => setDeadlineDate(e.target.value)}
                />
              </div>
            </div>

            <div>
              <Label>Title *</Label>
              <Input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Brief title for the dispute"
                disabled={isViewMode}
              />
            </div>

            <div>
              <Label>Description *</Label>
              <Textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Detailed description of the dispute"
                disabled={isViewMode}
                rows={4}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Disputed Amount</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={disputedAmount}
                  onChange={(e) => setDisputedAmount(e.target.value)}
                  placeholder="0.00"
                  disabled={isViewMode}
                />
              </div>

              <div>
                <Label>Claim Amount</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={claimAmount}
                  onChange={(e) => setClaimAmount(e.target.value)}
                  placeholder="0.00"
                  disabled={isViewMode}
                />
              </div>
            </div>

            <div>
              <Label>Additional Notes</Label>
              <Textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Any additional information"
                rows={2}
              />
            </div>

            {selectedSupplier && (
              <Card className="p-4 bg-muted/30">
                <h3 className="font-semibold mb-3">Supplier Information</h3>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <span className="text-muted-foreground">Contact:</span>{' '}
                    {selectedSupplier.contactPersons[0]?.name || '-'}
                  </div>
                  <div>
                    <span className="text-muted-foreground">Phone:</span>{' '}
                    {selectedSupplier.phone}
                  </div>
                  <div>
                    <span className="text-muted-foreground">Email:</span>{' '}
                    {selectedSupplier.email || '-'}
                  </div>
                  <div>
                    <span className="text-muted-foreground">Payment Terms:</span>{' '}
                    {selectedSupplier.paymentTerms}
                  </div>
                </div>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="items" className="space-y-4">
            {items.length === 0 ? (
              <Card className="p-8 text-center border-dashed">
                <p className="text-muted-foreground">No disputed items added</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Add disputed items to track specific issues
                </p>
              </Card>
            ) : (
              <div className="space-y-3">
                {items.map((item, idx) => (
                  <Card key={item.id} className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <p className="font-medium">{item.itemName}</p>
                        <p className="text-sm text-muted-foreground mt-1">{item.issueDescription}</p>
                        <div className="grid grid-cols-3 gap-4 mt-3 text-sm">
                          {item.orderedQuantity && (
                            <div>
                              <span className="text-muted-foreground">Ordered:</span>{' '}
                              {item.orderedQuantity}
                            </div>
                          )}
                          {item.receivedQuantity && (
                            <div>
                              <span className="text-muted-foreground">Received:</span>{' '}
                              {item.receivedQuantity}
                            </div>
                          )}
                          {item.damagedQuantity && (
                            <div className="text-destructive">
                              <span>Damaged:</span> {item.damagedQuantity}
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-semibold text-destructive">
                          {formatCurrency(item.disputedAmount)}
                        </p>
                      </div>
                    </div>
                  </Card>
                ))}

                <Card className="p-4 bg-muted/30">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold">Total Disputed Amount:</span>
                    <span className="text-xl font-bold text-destructive">
                      {formatCurrency(items.reduce((sum, item) => sum + item.disputedAmount, 0))}
                    </span>
                  </div>
                </Card>
              </div>
            )}
          </TabsContent>

          <TabsContent value="evidence" className="space-y-4">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*,application/pdf"
              multiple
              className="hidden"
              onChange={handleFileUpload}
            />

            <div className="flex items-center justify-between">
              <Label className="text-base">Supporting Evidence</Label>
              {!isViewMode && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <Camera size={16} className="mr-2" />
                  Upload Files
                </Button>
              )}
            </div>

            {evidence.length === 0 ? (
              <Card className="p-8 text-center border-dashed">
                <ImageIcon size={48} className="mx-auto text-muted-foreground mb-2" />
                <p className="text-sm text-muted-foreground">No evidence uploaded</p>
              </Card>
            ) : (
              <div className="grid grid-cols-3 gap-3">
                {evidence.map((ev) => (
                  <Card key={ev.id} className="p-3">
                    <div className="relative group">
                      {ev.fileData && (
                        <img 
                          src={ev.fileData} 
                          alt={ev.title} 
                          className="w-full h-32 object-cover rounded-lg border mb-2"
                        />
                      )}
                      {!isViewMode && (
                        <Button
                          size="sm"
                          variant="destructive"
                          className="absolute top-1 right-1 h-6 w-6 p-0 opacity-0 group-hover:opacity-100"
                          onClick={() => removeEvidence(ev.id)}
                        >
                          <X size={14} />
                        </Button>
                      )}
                    </div>
                    <p className="text-sm font-medium truncate">{ev.title}</p>
                    <p className="text-xs text-muted-foreground">
                      {formatDate(ev.uploadedAt)} by {ev.uploadedBy}
                    </p>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="communications" className="space-y-4">
            {!isViewMode && (
              <Card className="p-4 bg-muted/30">
                <h3 className="font-semibold mb-3">Log New Communication</h3>
                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label>Method</Label>
                      <Select 
                        value={newCommunication.method} 
                        onValueChange={(v: any) => setNewCommunication({...newCommunication, method: v})}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="email">Email</SelectItem>
                          <SelectItem value="phone">Phone</SelectItem>
                          <SelectItem value="meeting">Meeting</SelectItem>
                          <SelectItem value="letter">Letter</SelectItem>
                          <SelectItem value="portal">Portal</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label>Contact Person</Label>
                      <Input
                        value={newCommunication.contactPerson}
                        onChange={(e) => setNewCommunication({...newCommunication, contactPerson: e.target.value})}
                        placeholder="Supplier contact name"
                      />
                    </div>
                  </div>

                  <div>
                    <Label>Subject</Label>
                    <Input
                      value={newCommunication.subject}
                      onChange={(e) => setNewCommunication({...newCommunication, subject: e.target.value})}
                      placeholder="Communication subject"
                    />
                  </div>

                  <div>
                    <Label>Message *</Label>
                    <Textarea
                      value={newCommunication.message}
                      onChange={(e) => setNewCommunication({...newCommunication, message: e.target.value})}
                      placeholder="Enter communication details"
                      rows={3}
                    />
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        id="followup"
                        checked={newCommunication.followUpRequired}
                        onChange={(e) => setNewCommunication({...newCommunication, followUpRequired: e.target.checked})}
                      />
                      <Label htmlFor="followup" className="cursor-pointer">Requires Follow-up</Label>
                    </div>
                    {newCommunication.followUpRequired && (
                      <Input
                        type="date"
                        value={newCommunication.followUpDate}
                        onChange={(e) => setNewCommunication({...newCommunication, followUpDate: e.target.value})}
                        className="w-48"
                      />
                    )}
                  </div>

                  <Button onClick={handleAddCommunication}>
                    <ChatCircle size={18} className="mr-2" />
                    Log Communication
                  </Button>
                </div>
              </Card>
            )}

            <Separator />

            {communications.length === 0 ? (
              <Card className="p-8 text-center border-dashed">
                <ChatCircle size={48} className="mx-auto text-muted-foreground mb-2" />
                <p className="text-sm text-muted-foreground">No communications logged</p>
              </Card>
            ) : (
              <div className="space-y-3">
                {communications.sort((a, b) => b.timestamp - a.timestamp).map((comm) => (
                  <Card key={comm.id} className="p-4">
                    <div className="flex items-start gap-3">
                      <div className="mt-1">
                        {comm.method === 'email' && <Envelope size={20} className="text-blue-500" />}
                        {comm.method === 'phone' && <Phone size={20} className="text-green-500" />}
                        {comm.method === 'meeting' && <ChatCircle size={20} className="text-purple-500" />}
                        {comm.method === 'letter' && <FileText size={20} className="text-orange-500" />}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-1">
                          <div className="flex items-center gap-2">
                            <Badge variant={comm.direction === 'outgoing' ? 'default' : 'secondary'}>
                              {comm.direction}
                            </Badge>
                            <span className="text-sm text-muted-foreground">{comm.method}</span>
                          </div>
                          <span className="text-xs text-muted-foreground">
                            {formatDate(comm.timestamp)}
                          </span>
                        </div>
                        {comm.subject && (
                          <p className="font-medium text-sm mb-1">{comm.subject}</p>
                        )}
                        {comm.contactPerson && (
                          <p className="text-xs text-muted-foreground mb-1">
                            Contact: {comm.contactPerson}
                          </p>
                        )}
                        <p className="text-sm">{comm.message}</p>
                        {comm.followUpRequired && (
                          <Alert className="mt-2">
                            <Clock size={16} />
                            <AlertDescription className="text-xs">
                              Follow-up required{comm.followUpDate ? ` by ${formatDate(comm.followUpDate)}` : ''}
                            </AlertDescription>
                          </Alert>
                        )}
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="resolution" className="space-y-4">
            {isViewMode && (
              <>
                <div>
                  <Label>Resolution Type</Label>
                  <Select 
                    value={resolution} 
                    onValueChange={(v) => setResolution(v as DisputeResolution)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select resolution type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="credit-note">Credit Note</SelectItem>
                      <SelectItem value="replacement">Replacement</SelectItem>
                      <SelectItem value="refund">Refund</SelectItem>
                      <SelectItem value="price-adjustment">Price Adjustment</SelectItem>
                      <SelectItem value="accepted-as-is">Accepted As-Is</SelectItem>
                      <SelectItem value="partial-credit">Partial Credit</SelectItem>
                      <SelectItem value="return-goods">Return Goods</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>Resolution Details</Label>
                  <Textarea
                    value={resolutionDetails}
                    onChange={(e) => setResolutionDetails(e.target.value)}
                    placeholder="Describe the resolution agreed upon"
                    rows={3}
                  />
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <Label>Agreed Amount</Label>
                    <Input
                      type="number"
                      step="0.01"
                      value={agreedAmount}
                      onChange={(e) => setAgreedAmount(e.target.value)}
                      placeholder="0.00"
                    />
                  </div>

                  <div>
                    <Label>Credit Note Number</Label>
                    <Input
                      value={creditNoteNumber}
                      onChange={(e) => setCreditNoteNumber(e.target.value)}
                      placeholder="CN-12345"
                    />
                  </div>

                  <div>
                    <Label>Credit Note Amount</Label>
                    <Input
                      type="number"
                      step="0.01"
                      value={creditNoteAmount}
                      onChange={(e) => setCreditNoteAmount(e.target.value)}
                      placeholder="0.00"
                    />
                  </div>
                </div>

                {resolution && (
                  <Alert>
                    <CheckCircle size={20} />
                    <AlertDescription>
                      Updating the resolution will change the dispute status. Make sure all details are accurate.
                    </AlertDescription>
                  </Alert>
                )}
              </>
            )}

            {!isViewMode && (
              <Card className="p-8 text-center border-dashed">
                <ArrowRight size={48} className="mx-auto text-muted-foreground mb-2" />
                <p className="text-muted-foreground">
                  Resolution details can be added after the dispute is created
                </p>
              </Card>
            )}
          </TabsContent>
        </Tabs>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            {isViewMode ? 'Close' : 'Cancel'}
          </Button>
          <Button onClick={handleSave}>
            <Warning size={18} className="mr-2" />
            {dispute ? 'Update Dispute' : 'Create Dispute'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
