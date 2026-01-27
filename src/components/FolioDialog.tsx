import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Separator } from '@/components/ui/separator'
import { Badge } from '@/components/ui/badge'
import { PrintButton } from '@/components/PrintButton'
import { A4PrintWrapper } from '@/components/A4PrintWrapper'
import { toast } from 'sonner'
import { type Folio, type Reservation, type Guest, type Department, type FolioExtraService, type ExtraService, type ExtraServiceCategory } from '@/lib/types'
import { formatDateTime, formatCurrency, generateId } from '@/lib/helpers'
import { Plus, Receipt, Sparkle } from '@phosphor-icons/react'
import { AssignExtraServiceDialog } from '@/components/AssignExtraServiceDialog'

interface FolioDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  folio?: Folio
  reservation?: Reservation
  folios: Folio[]
  setFolios: (folios: Folio[] | ((prev: Folio[]) => Folio[])) => void
  guests: Guest[]
  extraServices?: ExtraService[]
  serviceCategories?: ExtraServiceCategory[]
  folioExtraServices?: FolioExtraService[]
  setFolioExtraServices?: (services: FolioExtraService[] | ((prev: FolioExtraService[]) => FolioExtraService[])) => void
  currentUser?: { id: string; firstName: string; lastName: string }
}

export function FolioDialog({ 
  open, 
  onOpenChange, 
  folio,
  reservation,
  folios,
  setFolios,
  guests,
  extraServices = [],
  serviceCategories = [],
  folioExtraServices = [],
  setFolioExtraServices,
  currentUser = { id: 'system', firstName: 'System', lastName: 'User' }
}: FolioDialogProps) {
  const [chargeDescription, setChargeDescription] = useState('')
  const [chargeAmount, setChargeAmount] = useState(0)
  const [chargeQuantity, setChargeQuantity] = useState(1)
  const [chargeDepartment, setChargeDepartment] = useState<Department>('front-office')
  const [paymentAmount, setPaymentAmount] = useState(0)
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'card' | 'bank-transfer' | 'mobile-payment'>('card')
  const [extraServiceDialogOpen, setExtraServiceDialogOpen] = useState(false)

  if (!folio && !reservation) return null

  const currentFolio = folio || folios.find(f => f.reservationId === reservation?.id)
  const guest = guests.find(g => g.id === (currentFolio?.guestId || reservation?.guestId))

  if (!currentFolio) return null

  const folioServices = folioExtraServices.filter(s => s.folioId === currentFolio.id)
  const extraServicesTotal = folioServices.reduce((sum, s) => sum + s.totalAmount, 0)

  const totalCharges = currentFolio.charges.reduce((sum, c) => sum + (c.amount * c.quantity), 0)
  const totalPayments = currentFolio.payments.reduce((sum, p) => sum + p.amount, 0)
  const balance = totalCharges + extraServicesTotal - totalPayments

  const handleSaveExtraService = (folioService: FolioExtraService) => {
    if (setFolioExtraServices) {
      setFolioExtraServices((prev) => [...prev, folioService])
    }
  }

  const handleAddCharge = () => {
    if (!chargeDescription.trim() || chargeAmount <= 0) {
      toast.error('Please enter valid charge details')
      return
    }

    setFolios((prev) => prev.map(f => 
      f.id === currentFolio.id 
        ? {
            ...f,
            charges: [
              ...f.charges,
              {
                id: generateId(),
                folioId: f.id,
                description: chargeDescription,
                amount: chargeAmount,
                quantity: chargeQuantity,
                department: chargeDepartment,
                timestamp: Date.now(),
                postedBy: 'system'
              }
            ],
            balance: f.balance + (chargeAmount * chargeQuantity),
            updatedAt: Date.now()
          }
        : f
    ))

    setChargeDescription('')
    setChargeAmount(0)
    setChargeQuantity(1)
    toast.success('Charge added successfully')
  }

  const handleAddPayment = () => {
    if (paymentAmount <= 0) {
      toast.error('Please enter a valid payment amount')
      return
    }

    setFolios((prev) => prev.map(f => 
      f.id === currentFolio.id 
        ? {
            ...f,
            payments: [
              ...f.payments,
              {
                id: generateId(),
                folioId: f.id,
                amount: paymentAmount,
                method: paymentMethod,
                status: 'paid',
                timestamp: Date.now(),
                receivedBy: 'system'
              }
            ],
            balance: f.balance - paymentAmount,
            updatedAt: Date.now()
          }
        : f
    ))

    setPaymentAmount(0)
    toast.success('Payment recorded successfully')
  }

  const handlePrint = () => {
    // Print functionality is handled by PrintButton component
  }

  const folioId = `FOLIO-${currentFolio.id.slice(0, 8).toUpperCase()}`

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Receipt size={24} />
              Guest Folio
            </div>
            <PrintButton
              elementId="folio-printable"
              options={{
                title: `Guest Folio - ${folioId}`,
                filename: `folio-${folioId}.pdf`,
                includeHeader: true,
                headerText: `Hotel Management System - Folio ${folioId}`,
                includeFooter: true,
                footerText: `Generated on ${new Date().toLocaleDateString()}`
              }}
              variant="outline"
              size="sm"
            />
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Guest Name</Label>
              <p className="font-semibold">
                {guest ? `${guest.firstName} ${guest.lastName}` : 'Unknown Guest'}
              </p>
            </div>
            <div>
              <Label>Folio Number</Label>
              <p className="font-mono">{currentFolio.id.slice(0, 8).toUpperCase()}</p>
            </div>
          </div>

          <Separator />

          <div>
            <h3 className="text-lg font-semibold mb-4">Charges</h3>
            <div className="space-y-2 mb-4">
              {currentFolio.charges.map(charge => (
                <div key={charge.id} className="flex justify-between p-3 bg-muted rounded-lg">
                  <div className="flex-1">
                    <p className="font-medium">{charge.description}</p>
                    <p className="text-sm text-muted-foreground">
                      {formatDateTime(charge.timestamp)} • {charge.department}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold">
                      {formatCurrency(charge.amount)} × {charge.quantity}
                    </p>
                    <p className="text-sm font-bold">
                      {formatCurrency(charge.amount * charge.quantity)}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            <div className="grid grid-cols-12 gap-2">
              <div className="col-span-4">
                <Input
                  placeholder="Description"
                  value={chargeDescription}
                  onChange={(e) => setChargeDescription(e.target.value)}
                />
              </div>
              <div className="col-span-2">
                <Input
                  type="number"
                  placeholder="Amount"
                  min="0"
                  step="0.01"
                  value={chargeAmount || ''}
                  onChange={(e) => setChargeAmount(parseFloat(e.target.value) || 0)}
                />
              </div>
              <div className="col-span-2">
                <Input
                  type="number"
                  placeholder="Qty"
                  min="1"
                  value={chargeQuantity}
                  onChange={(e) => setChargeQuantity(parseInt(e.target.value) || 1)}
                />
              </div>
              <div className="col-span-3">
                <Select value={chargeDepartment} onValueChange={(value: Department) => setChargeDepartment(value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="front-office">Front Office</SelectItem>
                    <SelectItem value="fnb">F&B</SelectItem>
                    <SelectItem value="housekeeping">Housekeeping</SelectItem>
                    <SelectItem value="kitchen">Kitchen</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="col-span-1">
                <Button onClick={handleAddCharge} className="w-full">
                  <Plus size={16} />
                </Button>
              </div>
            </div>
          </div>

          <Separator />

          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Extra Services</h3>
              {extraServices.length > 0 && setFolioExtraServices && (
                <Button variant="outline" size="sm" onClick={() => setExtraServiceDialogOpen(true)}>
                  <Sparkle size={16} className="mr-2" />
                  Add Service
                </Button>
              )}
            </div>
            <div className="space-y-2">
              {folioServices.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">
                  No extra services added
                </p>
              ) : (
                folioServices.map(service => (
                  <div key={service.id} className="flex justify-between p-3 bg-accent/10 border border-accent/20 rounded-lg">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <p className="font-medium">{service.serviceName}</p>
                        <Badge variant="outline" className="text-xs">{service.categoryName}</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {formatDateTime(service.postedAt)}
                        {service.comments && ` • ${service.comments}`}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-muted-foreground">
                        {formatCurrency(service.unitPrice)} × {service.quantity}
                      </p>
                      {service.taxRate > 0 && (
                        <p className="text-xs text-muted-foreground">
                          +{formatCurrency(service.taxAmount)} tax ({service.taxRate}%)
                        </p>
                      )}
                      <p className="font-semibold text-accent">
                        {formatCurrency(service.totalAmount)}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          <Separator />

          <div>
            <h3 className="text-lg font-semibold mb-4">Payments</h3>
            <div className="space-y-2 mb-4">
              {currentFolio.payments.map(payment => (
                <div key={payment.id} className="flex justify-between p-3 bg-muted rounded-lg">
                  <div className="flex-1">
                    <p className="font-medium capitalize">{payment.method.replace('-', ' ')}</p>
                    <p className="text-sm text-muted-foreground">
                      {formatDateTime(payment.timestamp)}
                    </p>
                  </div>
                  <p className="font-semibold text-success">
                    {formatCurrency(payment.amount)}
                  </p>
                </div>
              ))}
            </div>

            <div className="grid grid-cols-12 gap-2">
              <div className="col-span-5">
                <Input
                  type="number"
                  placeholder="Payment amount"
                  min="0"
                  step="0.01"
                  value={paymentAmount || ''}
                  onChange={(e) => setPaymentAmount(parseFloat(e.target.value) || 0)}
                />
              </div>
              <div className="col-span-6">
                <Select value={paymentMethod} onValueChange={(value: any) => setPaymentMethod(value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="cash">Cash</SelectItem>
                    <SelectItem value="card">Card</SelectItem>
                    <SelectItem value="bank-transfer">Bank Transfer</SelectItem>
                    <SelectItem value="mobile-payment">Mobile Payment</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="col-span-1">
                <Button onClick={handleAddPayment} className="w-full">
                  <Plus size={16} />
                </Button>
              </div>
            </div>
          </div>

          <Separator />

          <div className="p-4 bg-muted rounded-lg space-y-2">
            <div className="flex justify-between text-lg">
              <span>Room Charges:</span>
              <span className="font-semibold">{formatCurrency(totalCharges)}</span>
            </div>
            {extraServicesTotal > 0 && (
              <div className="flex justify-between text-lg">
                <span>Extra Services:</span>
                <span className="font-semibold">{formatCurrency(extraServicesTotal)}</span>
              </div>
            )}
            <div className="flex justify-between text-lg">
              <span>Total Payments:</span>
              <span className="font-semibold">{formatCurrency(totalPayments)}</span>
            </div>
            <Separator />
            <div className="flex justify-between text-xl font-bold">
              <span>Balance:</span>
              <span className={balance > 0 ? 'text-destructive' : 'text-success'}>
                {formatCurrency(balance)}
              </span>
            </div>
          </div>
        </div>

        <DialogFooter className="no-print">
          <Button onClick={() => onOpenChange(false)}>
            Close
          </Button>
        </DialogFooter>

        {/* Hidden printable content */}
        <div className="hidden">
          <A4PrintWrapper
            id="folio-printable"
            title={`Guest Folio - ${folioId}`}
            headerContent={
              <div className="text-sm">
                <p><strong>Guest:</strong> {guest ? `${guest.firstName} ${guest.lastName}` : 'Unknown Guest'}</p>
                <p><strong>Folio Number:</strong> {folioId}</p>
                <p><strong>Date:</strong> {new Date().toLocaleDateString()}</p>
              </div>
            }
          >
            <div className="space-y-6">
              <section>
                <h2 className="text-lg font-semibold mb-4">Charges</h2>
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="bg-gray-100">
                      <th className="border p-2 text-left">Description</th>
                      <th className="border p-2 text-left">Department</th>
                      <th className="border p-2 text-right">Unit Price</th>
                      <th className="border p-2 text-right">Qty</th>
                      <th className="border p-2 text-right">Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    {currentFolio.charges.map(charge => (
                      <tr key={charge.id}>
                        <td className="border p-2">{charge.description}</td>
                        <td className="border p-2">{charge.department}</td>
                        <td className="border p-2 text-right">{formatCurrency(charge.amount)}</td>
                        <td className="border p-2 text-right">{charge.quantity}</td>
                        <td className="border p-2 text-right font-semibold">{formatCurrency(charge.amount * charge.quantity)}</td>
                      </tr>
                    ))}
                    <tr className="bg-gray-50">
                      <td colSpan={4} className="border p-2 text-right font-semibold">Total Charges:</td>
                      <td className="border p-2 text-right font-bold">{formatCurrency(totalCharges)}</td>
                    </tr>
                  </tbody>
                </table>
              </section>

              {folioServices.length > 0 && (
                <section>
                  <h2 className="text-lg font-semibold mb-4">Extra Services</h2>
                  <table className="w-full border-collapse">
                    <thead>
                      <tr className="bg-gray-100">
                        <th className="border p-2 text-left">Service</th>
                        <th className="border p-2 text-left">Category</th>
                        <th className="border p-2 text-right">Unit Price</th>
                        <th className="border p-2 text-right">Qty</th>
                        <th className="border p-2 text-right">Tax</th>
                        <th className="border p-2 text-right">Total</th>
                      </tr>
                    </thead>
                    <tbody>
                      {folioServices.map(service => (
                        <tr key={service.id}>
                          <td className="border p-2">{service.serviceName}</td>
                          <td className="border p-2">{service.categoryName}</td>
                          <td className="border p-2 text-right">{formatCurrency(service.unitPrice)}</td>
                          <td className="border p-2 text-right">{service.quantity}</td>
                          <td className="border p-2 text-right">{formatCurrency(service.taxAmount)}</td>
                          <td className="border p-2 text-right font-semibold">{formatCurrency(service.totalAmount)}</td>
                        </tr>
                      ))}
                      <tr className="bg-gray-50">
                        <td colSpan={5} className="border p-2 text-right font-semibold">Total Extra Services:</td>
                        <td className="border p-2 text-right font-bold">{formatCurrency(extraServicesTotal)}</td>
                      </tr>
                    </tbody>
                  </table>
                </section>
              )}

              <section>
                <h2 className="text-lg font-semibold mb-4">Payments</h2>
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="bg-gray-100">
                      <th className="border p-2 text-left">Date</th>
                      <th className="border p-2 text-left">Method</th>
                      <th className="border p-2 text-right">Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    {currentFolio.payments.map(payment => (
                      <tr key={payment.id}>
                        <td className="border p-2">{formatDateTime(payment.timestamp)}</td>
                        <td className="border p-2 capitalize">{payment.method.replace('-', ' ')}</td>
                        <td className="border p-2 text-right font-semibold">{formatCurrency(payment.amount)}</td>
                      </tr>
                    ))}
                    <tr className="bg-gray-50">
                      <td colSpan={2} className="border p-2 text-right font-semibold">Total Payments:</td>
                      <td className="border p-2 text-right font-bold">{formatCurrency(totalPayments)}</td>
                    </tr>
                  </tbody>
                </table>
              </section>

              <section className="mt-6 p-4 bg-gray-100 border-2 border-gray-300">
                <div className="space-y-2">
                  <div className="flex justify-between text-lg">
                    <span className="font-semibold">Total Charges:</span>
                    <span>{formatCurrency(totalCharges + extraServicesTotal)}</span>
                  </div>
                  <div className="flex justify-between text-lg">
                    <span className="font-semibold">Total Payments:</span>
                    <span>{formatCurrency(totalPayments)}</span>
                  </div>
                  <div className="border-t-2 border-gray-400 pt-2 mt-2">
                    <div className="flex justify-between text-xl font-bold">
                      <span>Balance Due:</span>
                      <span className={balance > 0 ? 'text-red-600' : 'text-green-600'}>
                        {formatCurrency(balance)}
                      </span>
                    </div>
                  </div>
                </div>
              </section>
            </div>
          </A4PrintWrapper>
        </div>
      </DialogContent>

      {extraServices.length > 0 && setFolioExtraServices && (
        <AssignExtraServiceDialog
          open={extraServiceDialogOpen}
          onOpenChange={setExtraServiceDialogOpen}
          folioId={currentFolio.id}
          services={extraServices}
          categories={serviceCategories}
          onSave={handleSaveExtraService}
          currentUser={currentUser}
        />
      )}
    </Dialog>
  )
}
