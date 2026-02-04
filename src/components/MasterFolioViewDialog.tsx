import { useState } from 'react'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table'
import { 
  type MasterFolio, 
  type Folio, 
  type Reservation, 
  type Guest 
} from '@/lib/types'
import { 
  Buildings, 
  Receipt, 
  CurrencyDollar,
  Users,
  ArrowsLeftRight,
  Pencil,
  Eye,
  FileText,
  MapPin,
  Phone,
  EnvelopeSimple,
  User
} from '@phosphor-icons/react'
import { formatCurrency, formatDate } from '@/lib/helpers'

interface MasterFolioViewDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  masterFolio: MasterFolio
  folios: Folio[]
  reservations: Reservation[]
  guests: Guest[]
  onEdit: () => void
}

export function MasterFolioViewDialog({
  open,
  onOpenChange,
  masterFolio,
  folios,
  reservations,
  guests,
  onEdit
}: MasterFolioViewDialogProps) {
  const childFolios = folios.filter(f => masterFolio.childFolioIds.includes(f.id))

  const getStatusBadge = (status: MasterFolio['status']) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-green-100 text-green-800">Active</Badge>
      case 'closed':
        return <Badge variant="secondary">Closed</Badge>
      case 'suspended':
        return <Badge variant="destructive">Suspended</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  const getTotalCharges = () => {
    const masterCharges = masterFolio.charges.reduce((sum, c) => sum + (c.amount * c.quantity), 0)
    const childCharges = childFolios.reduce((sum, folio) => {
      return sum + folio.charges.reduce((s, c) => s + (c.amount * c.quantity), 0)
    }, 0)
    return masterCharges + childCharges
  }

  const getTotalPayments = () => {
    const masterPayments = masterFolio.payments.reduce((sum, p) => sum + p.amount, 0)
    const childPayments = childFolios.reduce((sum, folio) => {
      return sum + folio.payments.reduce((s, p) => s + p.amount, 0)
    }, 0)
    return masterPayments + childPayments
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-6xl max-h-[90vh]">
        <DialogHeader className="dialog-header-fixed">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <DialogTitle className="text-2xl flex items-center gap-2">
                <Buildings size={24} className="text-primary" />
                {masterFolio.name}
              </DialogTitle>
              <DialogDescription>
                Master Folio Number: {masterFolio.masterFolioNumber}
              </DialogDescription>
            </div>
            <div className="flex items-center gap-2">
              {getStatusBadge(masterFolio.status)}
              <Badge variant="outline">
                {masterFolio.type.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
              </Badge>
            </div>
          </div>
        </DialogHeader>

        <Tabs defaultValue="overview" className="dialog-body-scrollable">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="folios">
              Child Folios ({childFolios.length})
            </TabsTrigger>
            <TabsTrigger value="charges">
              Charges ({masterFolio.charges.length})
            </TabsTrigger>
            <TabsTrigger value="payments">
              Payments ({masterFolio.payments.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="dialog-section space-y-6 mt-4">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card className="p-4 border-l-4 border-l-primary">
                <div className="flex items-center justify-between mb-1">
                  <h4 className="text-sm font-medium text-muted-foreground">Total Charges</h4>
                  <Receipt size={16} className="text-primary" />
                </div>
                <p className="text-2xl font-bold">{formatCurrency(getTotalCharges())}</p>
              </Card>

              <Card className="p-4 border-l-4 border-l-success">
                <div className="flex items-center justify-between mb-1">
                  <h4 className="text-sm font-medium text-muted-foreground">Total Payments</h4>
                  <CurrencyDollar size={16} className="text-success" />
                </div>
                <p className="text-2xl font-bold">{formatCurrency(getTotalPayments())}</p>
              </Card>

              <Card className="p-4 border-l-4 border-l-accent">
                <div className="flex items-center justify-between mb-1">
                  <h4 className="text-sm font-medium text-muted-foreground">Balance</h4>
                  <CurrencyDollar size={16} className="text-accent" />
                </div>
                <p className="text-2xl font-bold">{formatCurrency(masterFolio.totalBalance)}</p>
              </Card>

              <Card className="p-4 border-l-4 border-l-secondary">
                <div className="flex items-center justify-between mb-1">
                  <h4 className="text-sm font-medium text-muted-foreground">Child Folios</h4>
                  <Users size={16} className="text-secondary" />
                </div>
                <p className="text-2xl font-bold">{childFolios.length}</p>
              </Card>
            </div>

            <Separator />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="p-6">
                <h3 className="font-semibold mb-4 flex items-center gap-2">
                  <User size={20} className="text-primary" />
                  Primary Contact
                </h3>
                <div className="space-y-3">
                  <div>
                    <p className="text-sm text-muted-foreground">Name</p>
                    <p className="font-medium">{masterFolio.primaryContact.name}</p>
                  </div>
                  {masterFolio.primaryContact.company && (
                    <div>
                      <p className="text-sm text-muted-foreground">Company</p>
                      <p className="font-medium">{masterFolio.primaryContact.company}</p>
                    </div>
                  )}
                  {masterFolio.primaryContact.email && (
                    <div>
                      <p className="text-sm text-muted-foreground flex items-center gap-1">
                        <EnvelopeSimple size={14} /> Email
                      </p>
                      <p className="font-medium">{masterFolio.primaryContact.email}</p>
                    </div>
                  )}
                  {masterFolio.primaryContact.phone && (
                    <div>
                      <p className="text-sm text-muted-foreground flex items-center gap-1">
                        <Phone size={14} /> Phone
                      </p>
                      <p className="font-medium">{masterFolio.primaryContact.phone}</p>
                    </div>
                  )}
                  {masterFolio.primaryContact.address && (
                    <div>
                      <p className="text-sm text-muted-foreground flex items-center gap-1">
                        <MapPin size={14} /> Address
                      </p>
                      <p className="font-medium">{masterFolio.primaryContact.address}</p>
                    </div>
                  )}
                </div>
              </Card>

              <Card className="p-6">
                <h3 className="font-semibold mb-4 flex items-center gap-2">
                  <FileText size={20} className="text-primary" />
                  Billing Details
                </h3>
                <div className="space-y-3">
                  <div>
                    <p className="text-sm text-muted-foreground">Billing Arrangement</p>
                    <p className="font-medium">
                      {masterFolio.billingArrangement.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                    </p>
                  </div>
                  {masterFolio.creditLimit && (
                    <div>
                      <p className="text-sm text-muted-foreground">Credit Limit</p>
                      <p className="font-medium">{formatCurrency(masterFolio.creditLimit)}</p>
                      <div className="mt-2 flex items-center gap-2">
                        <div className="flex-1 bg-muted rounded-full h-2">
                          <div
                            className={`rounded-full h-2 transition-all ${
                              (masterFolio.totalBalance / masterFolio.creditLimit) > 0.9 
                                ? 'bg-destructive' 
                                : 'bg-primary'
                            }`}
                            style={{
                              width: `${Math.min((masterFolio.totalBalance / masterFolio.creditLimit) * 100, 100)}%`
                            }}
                          />
                        </div>
                        <p className="text-xs text-muted-foreground whitespace-nowrap">
                          {Math.round((masterFolio.totalBalance / masterFolio.creditLimit) * 100)}%
                        </p>
                      </div>
                    </div>
                  )}
                  {masterFolio.paymentTerms && (
                    <div>
                      <p className="text-sm text-muted-foreground">Payment Terms</p>
                      <p className="font-medium">{masterFolio.paymentTerms}</p>
                    </div>
                  )}
                  <div>
                    <p className="text-sm text-muted-foreground">Created</p>
                    <p className="font-medium">{formatDate(masterFolio.createdAt)}</p>
                  </div>
                  {masterFolio.closedAt && (
                    <div>
                      <p className="text-sm text-muted-foreground">Closed</p>
                      <p className="font-medium">{formatDate(masterFolio.closedAt)}</p>
                    </div>
                  )}
                </div>
              </Card>
            </div>

            {masterFolio.billingAddress && (
              <>
                <Separator />
                <Card className="p-6">
                  <h3 className="font-semibold mb-4 flex items-center gap-2">
                    <MapPin size={20} className="text-primary" />
                    Billing Address
                  </h3>
                  <div>
                    <p>{masterFolio.billingAddress.street}</p>
                    <p>
                      {masterFolio.billingAddress.city}
                      {masterFolio.billingAddress.state && `, ${masterFolio.billingAddress.state}`}
                      {' '}{masterFolio.billingAddress.zipCode}
                    </p>
                    <p>{masterFolio.billingAddress.country}</p>
                  </div>
                </Card>
              </>
            )}

            {masterFolio.routingRules.length > 0 && (
              <>
                <Separator />
                <Card className="p-6">
                  <h3 className="font-semibold mb-4 flex items-center gap-2">
                    <ArrowsLeftRight size={20} className="text-primary" />
                    Routing Rules ({masterFolio.routingRules.length})
                  </h3>
                  <div className="space-y-2">
                    {masterFolio.routingRules.map(rule => (
                      <div key={rule.id} className="p-3 bg-muted/30 rounded-lg">
                        <div className="flex items-center gap-2 mb-1">
                          <Badge variant="outline">
                            {rule.ruleType.replace(/-/g, ' ').toUpperCase()}
                          </Badge>
                          {!rule.isActive && (
                            <Badge variant="secondary">Inactive</Badge>
                          )}
                        </div>
                        <p className="text-sm">
                          Route to: <span className="font-medium">
                            {rule.targetFolioId === 'master' ? 'Master Folio' : (() => {
                              const folio = folios.find(f => f.id === rule.targetFolioId)
                              const guest = guests.find(g => g.id === folio?.guestId)
                              return guest ? `${guest.firstName} ${guest.lastName}` : 'Unknown'
                            })()}
                          </span>
                        </p>
                        {rule.percentage && (
                          <p className="text-sm text-muted-foreground">
                            {rule.percentage}% of charges
                          </p>
                        )}
                        {rule.description && (
                          <p className="text-xs text-muted-foreground mt-1">{rule.description}</p>
                        )}
                      </div>
                    ))}
                  </div>
                </Card>
              </>
            )}

            {masterFolio.specialInstructions && (
              <>
                <Separator />
                <Card className="p-6">
                  <h3 className="font-semibold mb-2">Special Instructions</h3>
                  <p className="text-sm text-muted-foreground">{masterFolio.specialInstructions}</p>
                </Card>
              </>
            )}

            {masterFolio.description && (
              <>
                <Separator />
                <Card className="p-6">
                  <h3 className="font-semibold mb-2">Description</h3>
                  <p className="text-sm text-muted-foreground">{masterFolio.description}</p>
                </Card>
              </>
            )}
          </TabsContent>

          <TabsContent value="folios" className="dialog-section mt-4">
            {childFolios.length === 0 ? (
              <Card className="p-12 text-center">
                <Receipt size={48} className="mx-auto mb-2 text-muted-foreground opacity-50" />
                <p className="text-muted-foreground">No child folios linked</p>
              </Card>
            ) : (
              <div className="responsive-table-wrapper">
                <Table className="responsive-table">
                  <TableHeader>
                    <TableRow>
                      <TableHead>Guest</TableHead>
                      <TableHead>Folio Number</TableHead>
                      <TableHead>Room</TableHead>
                      <TableHead>Charges</TableHead>
                      <TableHead>Payments</TableHead>
                      <TableHead>Balance</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {childFolios.map(folio => {
                      const guest = guests.find(g => g.id === folio.guestId)
                      const reservation = reservations.find(r => r.id === folio.reservationId)
                      const charges = folio.charges.reduce((sum, c) => sum + (c.amount * c.quantity), 0)
                      const payments = folio.payments.reduce((sum, p) => sum + p.amount, 0)

                      return (
                        <TableRow key={folio.id}>
                          <TableCell>
                            <div>
                              <p className="font-medium">
                                {guest ? `${guest.firstName} ${guest.lastName}` : 'Unknown'}
                              </p>
                              {guest?.email && (
                                <p className="text-xs text-muted-foreground">{guest.email}</p>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline">{folio.folioNumber || folio.id.slice(0, 8)}</Badge>
                          </TableCell>
                          <TableCell>{reservation?.roomId || 'Unassigned'}</TableCell>
                          <TableCell>{formatCurrency(charges)}</TableCell>
                          <TableCell>{formatCurrency(payments)}</TableCell>
                          <TableCell>
                            <span className={folio.balance > 0 ? 'text-destructive font-semibold' : 'font-semibold'}>
                              {formatCurrency(folio.balance)}
                            </span>
                          </TableCell>
                        </TableRow>
                      )
                    })}
                  </TableBody>
                </Table>
              </div>
            )}
          </TabsContent>

          <TabsContent value="charges" className="dialog-section mt-4">
            {masterFolio.charges.length === 0 ? (
              <Card className="p-12 text-center">
                <Receipt size={48} className="mx-auto mb-2 text-muted-foreground opacity-50" />
                <p className="text-muted-foreground">No charges on master folio</p>
              </Card>
            ) : (
              <div className="responsive-table-wrapper">
                <Table className="responsive-table">
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Description</TableHead>
                      <TableHead>Department</TableHead>
                      <TableHead>Quantity</TableHead>
                      <TableHead>Unit Price</TableHead>
                      <TableHead>Total</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {masterFolio.charges.map(charge => (
                      <TableRow key={charge.id}>
                        <TableCell>{formatDate(charge.timestamp)}</TableCell>
                        <TableCell>{charge.description}</TableCell>
                        <TableCell>
                          <Badge variant="outline">
                            {charge.department.replace(/-/g, ' ')}
                          </Badge>
                        </TableCell>
                        <TableCell>{charge.quantity}</TableCell>
                        <TableCell>{formatCurrency(charge.amount)}</TableCell>
                        <TableCell className="font-semibold">
                          {formatCurrency(charge.amount * charge.quantity)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </TabsContent>

          <TabsContent value="payments" className="dialog-section mt-4">
            {masterFolio.payments.length === 0 ? (
              <Card className="p-12 text-center">
                <CurrencyDollar size={48} className="mx-auto mb-2 text-muted-foreground opacity-50" />
                <p className="text-muted-foreground">No payments recorded</p>
              </Card>
            ) : (
              <div className="responsive-table-wrapper">
                <Table className="responsive-table">
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Method</TableHead>
                      <TableHead>Reference</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Received By</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {masterFolio.payments.map(payment => (
                      <TableRow key={payment.id}>
                        <TableCell>{formatDate(payment.timestamp)}</TableCell>
                        <TableCell className="font-semibold">{formatCurrency(payment.amount)}</TableCell>
                        <TableCell>
                          <Badge variant="outline">
                            {payment.method.replace(/-/g, ' ')}
                          </Badge>
                        </TableCell>
                        <TableCell>{payment.reference || '-'}</TableCell>
                        <TableCell>
                          <Badge className={
                            payment.status === 'paid' ? 'bg-green-100 text-green-800' :
                            payment.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-gray-100 text-gray-800'
                          }>
                            {payment.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {payment.receivedBy}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </TabsContent>
        </Tabs>

        <DialogFooter className="dialog-footer-fixed">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Close
          </Button>
          {masterFolio.status === 'active' && (
            <Button onClick={onEdit}>
              <Pencil size={16} className="mr-2" />
              Edit Master Folio
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
