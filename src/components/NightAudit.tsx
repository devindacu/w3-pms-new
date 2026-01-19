import { useState, useEffect } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { Progress } from '@/components/ui/progress'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { 
  Moon, 
  PlayCircle, 
  CheckCircle, 
  XCircle,
  Warning,
  Calendar,
  Clock,
  Receipt,
  CurrencyDollar,
  FileText,
  Package,
  ChartBar,
  ArrowsClockwise,
  Database,
  Download,
  Printer,
  Eye,
  Bed,
  ForkKnife,
  Sparkle,
  TrendUp,
  TrendDown,
  Users
} from '@phosphor-icons/react'
import { 
  NightAuditLog,
  NightAuditOperation,
  Folio,
  Reservation,
  Room,
  GuestInvoice,
  Payment,
  TaxConfiguration,
  ServiceChargeConfiguration,
  InvoiceNumberSequence,
  SystemUser,
  Guest
} from '@/lib/types'
import {
  NightAuditConfig,
  getAuditPeriod,
  calculateRoomCharges,
  postRoomChargesToFolios,
  generateInvoiceFromFolio,
  reconcilePayments,
  getNextInvoiceNumber,
  validateAuditData
} from '@/lib/nightAuditHelpers'
import { formatCurrency, formatDate, formatTime } from '@/lib/helpers'
import { toast } from 'sonner'

interface NightAuditProps {
  folios: Folio[]
  setFolios: (folios: Folio[] | ((prev: Folio[]) => Folio[])) => void
  reservations: Reservation[]
  rooms: Room[]
  guests: Guest[]
  guestInvoices: GuestInvoice[]
  setGuestInvoices: (invoices: GuestInvoice[] | ((prev: GuestInvoice[]) => GuestInvoice[])) => void
  payments: Payment[]
  setPayments: (payments: Payment[] | ((prev: Payment[]) => Payment[])) => void
  taxes: TaxConfiguration[]
  serviceCharge: ServiceChargeConfiguration | null
  invoiceSequences: InvoiceNumberSequence[]
  setInvoiceSequences: (sequences: InvoiceNumberSequence[] | ((prev: InvoiceNumberSequence[]) => InvoiceNumberSequence[])) => void
  auditLogs: NightAuditLog[]
  setAuditLogs: (logs: NightAuditLog[] | ((prev: NightAuditLog[]) => NightAuditLog[])) => void
  currentUser: SystemUser
}

export function NightAudit({
  folios,
  setFolios,
  reservations,
  rooms,
  guests,
  guestInvoices,
  setGuestInvoices,
  payments,
  setPayments,
  taxes,
  serviceCharge,
  invoiceSequences,
  setInvoiceSequences,
  auditLogs,
  setAuditLogs,
  currentUser
}: NightAuditProps) {
  const [config, setConfig] = useState<NightAuditConfig>({
    postRoomCharges: true,
    postFnBCharges: true,
    postExtraCharges: true,
    closeFolios: false,
    generateInvoices: true,
    reconcilePayments: true,
    updateInventory: true,
    rotateInvoiceNumbers: true,
    generateReports: true,
    auditDate: Date.now()
  })
  
  const [currentAudit, setCurrentAudit] = useState<NightAuditLog | null>(null)
  const [isRunning, setIsRunning] = useState(false)
  const [showConfirmDialog, setShowConfirmDialog] = useState(false)
  const [progress, setProgress] = useState(0)
  const [currentOperation, setCurrentOperation] = useState<string>('')
  
  const lastAudit = auditLogs.length > 0 
    ? [...auditLogs].sort((a, b) => b.auditDate - a.auditDate)[0]
    : null

  useEffect(() => {
    const tomorrow = new Date()
    tomorrow.setDate(tomorrow.getDate() + 1)
    tomorrow.setHours(0, 0, 0, 0)
    setConfig(prev => ({ ...prev, auditDate: tomorrow.getTime() }))
  }, [])

  const handleConfigChange = (key: keyof NightAuditConfig, value: boolean | number) => {
    setConfig(prev => ({ ...prev, [key]: value }))
  }

  const runAudit = async () => {
    setShowConfirmDialog(false)
    setIsRunning(true)
    setProgress(0)
    
    const auditLog: NightAuditLog = {
      id: `audit-${Date.now()}`,
      auditDate: config.auditDate,
      auditPeriodStart: getAuditPeriod(config.auditDate).start,
      auditPeriodEnd: getAuditPeriod(config.auditDate).end,
      status: 'in-progress',
      startedBy: currentUser.id,
      startedAt: Date.now(),
      operations: [],
      roomChargesPosted: 0,
      fnbChargesPosted: 0,
      extraChargesPosted: 0,
      foliosClosed: 0,
      invoicesGenerated: 0,
      paymentsReconciled: 0,
      totalRevenue: 0,
      errors: [],
      warnings: [],
      summary: {
        roomRevenue: 0,
        fnbRevenue: 0,
        extraRevenue: 0,
        totalTax: 0,
        totalServiceCharge: 0,
        cashPayments: 0,
        cardPayments: 0,
        otherPayments: 0,
        outstandingBalance: 0
      },
      nextAuditDate: config.auditDate + 86400000
    }
    
    setCurrentAudit(auditLog)
    
    try {
      const { errors: validationErrors, warnings: validationWarnings } = validateAuditData(
        folios,
        reservations,
        rooms
      )
      
      auditLog.errors.push(...validationErrors)
      auditLog.warnings.push(...validationWarnings)
      
      if (validationErrors.filter(e => e.severity === 'critical').length > 0) {
        throw new Error('Critical validation errors found')
      }
      
      const operations: NightAuditOperation[] = []
      
      if (config.postRoomCharges) {
        setCurrentOperation('Posting room charges...')
        const operation = await postRoomChargesOperation(auditLog)
        operations.push(operation)
        setProgress(20)
      }
      
      if (config.generateInvoices) {
        setCurrentOperation('Generating invoices...')
        const operation = await generateInvoicesOperation(auditLog)
        operations.push(operation)
        setProgress(50)
      }
      
      if (config.reconcilePayments) {
        setCurrentOperation('Reconciling payments...')
        const operation = await reconcilePaymentsOperation(auditLog)
        operations.push(operation)
        setProgress(70)
      }
      
      if (config.rotateInvoiceNumbers) {
        setCurrentOperation('Rotating invoice numbers...')
        const operation = await rotateInvoiceNumbersOperation(auditLog)
        operations.push(operation)
        setProgress(85)
      }
      
      setCurrentOperation('Finalizing audit...')
      auditLog.operations = operations
      auditLog.status = 'completed'
      auditLog.completedAt = Date.now()
      auditLog.roomChargesPosted = operations.find(o => o.operationType === 'post-room-charges')?.recordsProcessed || 0
      auditLog.invoicesGenerated = operations.find(o => o.operationType === 'generate-invoices')?.recordsProcessed || 0
      auditLog.paymentsReconciled = operations.find(o => o.operationType === 'reconcile-payments')?.recordsProcessed || 0
      
      const newInvoices = guestInvoices.filter(inv => inv.invoiceDate >= auditLog.auditPeriodStart && inv.invoiceDate < auditLog.auditPeriodEnd)
      auditLog.summary.roomRevenue = newInvoices.reduce((sum, inv) => 
        sum + inv.lineItems.filter(li => li.department === 'front-office').reduce((s, li) => s + li.netAmount, 0), 0)
      auditLog.summary.fnbRevenue = newInvoices.reduce((sum, inv) => 
        sum + inv.lineItems.filter(li => li.department === 'fnb').reduce((s, li) => s + li.netAmount, 0), 0)
      auditLog.summary.extraRevenue = newInvoices.reduce((sum, inv) => 
        sum + inv.lineItems.filter(li => li.department !== 'front-office' && li.department !== 'fnb').reduce((s, li) => s + li.netAmount, 0), 0)
      auditLog.summary.totalTax = newInvoices.reduce((sum, inv) => sum + inv.totalTax, 0)
      auditLog.summary.totalServiceCharge = newInvoices.reduce((sum, inv) => sum + inv.serviceChargeAmount, 0)
      auditLog.summary.outstandingBalance = newInvoices.reduce((sum, inv) => sum + inv.amountDue, 0)
      auditLog.totalRevenue = auditLog.summary.roomRevenue + auditLog.summary.fnbRevenue + auditLog.summary.extraRevenue
      
      setProgress(100)
      setAuditLogs(prev => [...prev, auditLog])
      setCurrentAudit(auditLog)
      
      toast.success('Night Audit completed successfully!', {
        description: `${auditLog.invoicesGenerated} invoices generated, ${auditLog.roomChargesPosted} room charges posted`
      })
      
    } catch (error: any) {
      auditLog.status = 'failed'
      auditLog.completedAt = Date.now()
      auditLog.errors.push({
        id: `error-${Date.now()}`,
        errorType: 'audit-failed',
        message: error.message || 'Unknown error occurred',
        severity: 'critical',
        requiresAction: true
      })
      setAuditLogs(prev => [...prev, auditLog])
      setCurrentAudit(auditLog)
      
      toast.error('Night Audit failed', {
        description: error.message
      })
    } finally {
      setIsRunning(false)
      setCurrentOperation('')
    }
  }

  const postRoomChargesOperation = async (auditLog: NightAuditLog): Promise<NightAuditOperation> => {
    const operation: NightAuditOperation = {
      id: `op-${Date.now()}`,
      operationType: 'post-room-charges',
      status: 'pending',
      recordsProcessed: 0,
      startTime: Date.now()
    }
    
    try {
      const roomCharges = calculateRoomCharges(folios, reservations, rooms, config.auditDate)
      const { updatedFolios, charges } = postRoomChargesToFolios(folios, roomCharges, config.auditDate, currentUser.id)
      
      setFolios(updatedFolios)
      
      operation.recordsProcessed = charges.length
      operation.status = 'completed'
      operation.endTime = Date.now()
      operation.duration = operation.endTime - operation.startTime
      operation.details = { chargesPosted: charges.length, totalAmount: charges.reduce((sum, c) => sum + c.amount, 0) }
      
    } catch (error: any) {
      operation.status = 'failed'
      operation.errors = [error.message]
      operation.endTime = Date.now()
      operation.duration = operation.endTime - operation.startTime
    }
    
    return operation
  }

  const generateInvoicesOperation = async (auditLog: NightAuditLog): Promise<NightAuditOperation> => {
    const operation: NightAuditOperation = {
      id: `op-${Date.now()}`,
      operationType: 'generate-invoices',
      status: 'pending',
      recordsProcessed: 0,
      startTime: Date.now()
    }
    
    try {
      const newInvoices: GuestInvoice[] = []
      let currentSequence = invoiceSequences.find(s => s.invoiceType === 'guest-folio' && s.isActive)
      
      if (!currentSequence) {
        currentSequence = {
          id: `seq-${Date.now()}`,
          invoiceType: 'guest-folio',
          prefix: 'INV-',
          currentNumber: 0,
          paddingLength: 6,
          resetPeriod: 'yearly',
          isActive: true,
          createdAt: Date.now(),
          updatedAt: Date.now()
        }
      }
      
      const checkoutReservations = reservations.filter(r => {
        const checkoutDate = new Date(r.checkOutDate)
        checkoutDate.setHours(0, 0, 0, 0)
        const auditDateOnly = new Date(config.auditDate)
        auditDateOnly.setHours(0, 0, 0, 0)
        return checkoutDate.getTime() === auditDateOnly.getTime() && r.status === 'checked-out'
      })
      
      for (const reservation of checkoutReservations) {
        const folio = folios.find(f => f.reservationId === reservation.id)
        if (!folio) continue
        
        const guest = guests.find(g => g.id === reservation.guestId)
        if (!guest) continue
        
        const guestName = `${guest.firstName} ${guest.lastName}`
        const { number: invoiceNumber, updatedSequence } = getNextInvoiceNumber(currentSequence, config.auditDate)
        currentSequence = updatedSequence
        
        const invoice = generateInvoiceFromFolio(
          folio,
          reservation,
          guestName,
          invoiceNumber,
          taxes,
          serviceCharge,
          currentUser.id,
          config.auditDate
        )
        
        newInvoices.push(invoice)
      }
      
      setGuestInvoices(prev => [...prev, ...newInvoices])
      setInvoiceSequences(prev => 
        prev.map(seq => seq.id === currentSequence!.id ? currentSequence! : seq)
      )
      
      operation.recordsProcessed = newInvoices.length
      operation.status = 'completed'
      operation.endTime = Date.now()
      operation.duration = operation.endTime - operation.startTime
      operation.details = { 
        invoicesGenerated: newInvoices.length,
        totalRevenue: newInvoices.reduce((sum, inv) => sum + inv.grandTotal, 0)
      }
      
    } catch (error: any) {
      operation.status = 'failed'
      operation.errors = [error.message]
      operation.endTime = Date.now()
      operation.duration = operation.endTime - operation.startTime
    }
    
    return operation
  }

  const reconcilePaymentsOperation = async (auditLog: NightAuditLog): Promise<NightAuditOperation> => {
    const operation: NightAuditOperation = {
      id: `op-${Date.now()}`,
      operationType: 'reconcile-payments',
      status: 'pending',
      recordsProcessed: 0,
      startTime: Date.now()
    }
    
    try {
      const { reconciledCount, errors } = reconcilePayments(payments, guestInvoices, config.auditDate)
      
      const updatedPayments = payments.map(payment => {
        if (payment.reconciled) return payment
        if (payment.invoiceId && guestInvoices.find(inv => inv.id === payment.invoiceId)) {
          return {
            ...payment,
            reconciled: true,
            reconciledAt: config.auditDate,
            reconciledBy: currentUser.id
          }
        }
        return payment
      })
      
      setPayments(updatedPayments)
      
      operation.recordsProcessed = reconciledCount
      operation.status = 'completed'
      operation.endTime = Date.now()
      operation.duration = operation.endTime - operation.startTime
      operation.errors = errors.length > 0 ? errors : undefined
      operation.details = { reconciledCount, errorCount: errors.length }
      
    } catch (error: any) {
      operation.status = 'failed'
      operation.errors = [error.message]
      operation.endTime = Date.now()
      operation.duration = operation.endTime - operation.startTime
    }
    
    return operation
  }

  const rotateInvoiceNumbersOperation = async (auditLog: NightAuditLog): Promise<NightAuditOperation> => {
    const operation: NightAuditOperation = {
      id: `op-${Date.now()}`,
      operationType: 'rotate-invoice-numbers',
      status: 'pending',
      recordsProcessed: 0,
      startTime: Date.now()
    }
    
    try {
      operation.recordsProcessed = 0
      operation.status = 'completed'
      operation.endTime = Date.now()
      operation.duration = operation.endTime - operation.startTime
      
    } catch (error: any) {
      operation.status = 'failed'
      operation.errors = [error.message]
      operation.endTime = Date.now()
      operation.duration = operation.endTime - operation.startTime
    }
    
    return operation
  }

  const getStatusIcon = (status: NightAuditLog['status']) => {
    switch (status) {
      case 'completed':
        return <CheckCircle size={20} className="text-success" weight="fill" />
      case 'failed':
        return <XCircle size={20} className="text-destructive" weight="fill" />
      default:
        return <ArrowsClockwise size={20} className="text-primary animate-spin" />
    }
  }

  const getOperationIcon = (type: NightAuditOperation['operationType']) => {
    switch (type) {
      case 'post-room-charges':
        return <Receipt size={18} />
      case 'generate-invoices':
        return <FileText size={18} />
      case 'reconcile-payments':
        return <CurrencyDollar size={18} />
      case 'update-inventory':
        return <Package size={18} />
      case 'generate-reports':
        return <ChartBar size={18} />
      default:
        return <Database size={18} />
    }
  }

  const getOperationStatusBadge = (status: NightAuditOperation['status']) => {
    switch (status) {
      case 'completed':
        return <Badge className="bg-success text-success-foreground">Completed</Badge>
      case 'failed':
        return <Badge variant="destructive">Failed</Badge>
      case 'pending':
        return <Badge variant="secondary">Pending</Badge>
      default:
        return <Badge variant="outline">Skipped</Badge>
    }
  }

  const exportDailyReport = () => {
    if (!currentAudit) return
    toast.success('Report export functionality will be implemented')
  }

  const printDailyReport = () => {
    if (!currentAudit) return
    toast.success('Report printing functionality will be implemented')
  }

  const calculateOccupancy = () => {
    const totalRooms = rooms.length
    const occupiedRooms = reservations.filter(r => r.status === 'checked-in').length
    return totalRooms > 0 ? (occupiedRooms / totalRooms) * 100 : 0
  }

  const calculateADR = () => {
    const occupiedReservations = reservations.filter(r => r.status === 'checked-in')
    if (occupiedReservations.length === 0) return 0
    const totalRevenue = occupiedReservations.reduce((sum, r) => sum + r.ratePerNight, 0)
    return totalRevenue / occupiedReservations.length
  }

  const calculateRevPAR = () => {
    const occupancy = calculateOccupancy()
    const adr = calculateADR()
    return (occupancy / 100) * adr
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-semibold flex items-center gap-2">
            <Moon size={32} className="text-primary" weight="fill" />
            Night Audit
          </h1>
          <p className="text-muted-foreground mt-1">
            Daily reconciliation and automated posting
          </p>
        </div>
        <Button 
          onClick={() => setShowConfirmDialog(true)} 
          size="lg"
          disabled={isRunning}
          className="gap-2"
        >
          <PlayCircle size={20} weight="fill" />
          Run Night Audit
        </Button>
      </div>

      {lastAudit && (
        <Card className="p-6 border-l-4 border-l-primary">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-3">
              {getStatusIcon(lastAudit.status)}
              <div>
                <h3 className="font-semibold">Last Audit</h3>
                <p className="text-sm text-muted-foreground">
                  {formatDate(lastAudit.auditDate)} • {formatTime(lastAudit.startedAt)}
                </p>
              </div>
            </div>
            <Badge variant={lastAudit.status === 'completed' ? 'default' : 'destructive'}>
              {lastAudit.status}
            </Badge>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-4">
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground">Room Charges</p>
              <p className="text-2xl font-semibold">{lastAudit.roomChargesPosted}</p>
            </div>
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground">Invoices Generated</p>
              <p className="text-2xl font-semibold">{lastAudit.invoicesGenerated}</p>
            </div>
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground">Payments Reconciled</p>
              <p className="text-2xl font-semibold">{lastAudit.paymentsReconciled}</p>
            </div>
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground">Total Revenue</p>
              <p className="text-2xl font-semibold">{formatCurrency(lastAudit.totalRevenue)}</p>
            </div>
          </div>

          {(lastAudit.errors.length > 0 || lastAudit.warnings.length > 0) && (
            <>
              <Separator className="my-4" />
              <div className="space-y-2">
                {lastAudit.errors.length > 0 && (
                  <div className="flex items-center gap-2 text-destructive">
                    <XCircle size={16} />
                    <span className="text-sm font-medium">{lastAudit.errors.length} Errors</span>
                  </div>
                )}
                {lastAudit.warnings.length > 0 && (
                  <div className="flex items-center gap-2 text-amber-600">
                    <Warning size={16} />
                    <span className="text-sm font-medium">{lastAudit.warnings.length} Warnings</span>
                  </div>
                )}
              </div>
            </>
          )}
        </Card>
      )}

      {isRunning && currentAudit && (
        <Card className="p-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold">Audit in Progress...</h3>
              <span className="text-sm text-muted-foreground">{progress}%</span>
            </div>
            <Progress value={progress} className="h-2" />
            {currentOperation && (
              <p className="text-sm text-muted-foreground flex items-center gap-2">
                <ArrowsClockwise size={16} className="animate-spin" />
                {currentOperation}
              </p>
            )}
          </div>
        </Card>
      )}

      {currentAudit && !isRunning && (
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold">Daily Audit Report</h3>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={exportDailyReport}>
                <Download size={16} className="mr-2" />
                Export
              </Button>
              <Button variant="outline" size="sm" onClick={printDailyReport}>
                <Printer size={16} className="mr-2" />
                Print
              </Button>
            </div>
          </div>

          <Tabs defaultValue="summary" className="space-y-4">
            <TabsList className="grid w-full grid-cols-5">
              <TabsTrigger value="summary">Summary</TabsTrigger>
              <TabsTrigger value="revenue">Revenue</TabsTrigger>
              <TabsTrigger value="operations">Operations</TabsTrigger>
              <TabsTrigger value="reconciliation">Reconciliation</TabsTrigger>
              <TabsTrigger value="statistics">Statistics</TabsTrigger>
            </TabsList>

            <TabsContent value="summary" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card className="p-4 bg-card border-l-4 border-l-primary">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-sm text-muted-foreground">Room Revenue</p>
                    <Bed size={20} className="text-primary" />
                  </div>
                  <p className="text-2xl font-semibold">{formatCurrency(currentAudit.summary.roomRevenue)}</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {currentAudit.roomChargesPosted} charges posted
                  </p>
                </Card>
                <Card className="p-4 bg-card border-l-4 border-l-accent">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-sm text-muted-foreground">F&B Revenue</p>
                    <ForkKnife size={20} className="text-accent" />
                  </div>
                  <p className="text-2xl font-semibold">{formatCurrency(currentAudit.summary.fnbRevenue)}</p>
                  <p className="text-xs text-muted-foreground mt-1">Restaurant & Bar</p>
                </Card>
                <Card className="p-4 bg-card border-l-4 border-l-secondary">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-sm text-muted-foreground">Extra Services</p>
                    <Sparkle size={20} className="text-secondary" />
                  </div>
                  <p className="text-2xl font-semibold">{formatCurrency(currentAudit.summary.extraRevenue)}</p>
                  <p className="text-xs text-muted-foreground mt-1">Spa, Laundry, etc.</p>
                </Card>
                <Card className="p-4 bg-card border-l-4 border-l-success">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-sm text-muted-foreground">Total Revenue</p>
                    <TrendUp size={20} className="text-success" />
                  </div>
                  <p className="text-2xl font-semibold">{formatCurrency(currentAudit.totalRevenue)}</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {currentAudit.invoicesGenerated} invoices
                  </p>
                </Card>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card className="p-4">
                  <p className="text-sm text-muted-foreground mb-1">Tax Collected</p>
                  <p className="text-xl font-semibold">{formatCurrency(currentAudit.summary.totalTax)}</p>
                </Card>
                <Card className="p-4">
                  <p className="text-sm text-muted-foreground mb-1">Service Charge</p>
                  <p className="text-xl font-semibold">{formatCurrency(currentAudit.summary.totalServiceCharge)}</p>
                </Card>
                <Card className="p-4">
                  <p className="text-sm text-muted-foreground mb-1">Outstanding Balance</p>
                  <p className="text-xl font-semibold text-destructive">{formatCurrency(currentAudit.summary.outstandingBalance)}</p>
                </Card>
              </div>

              {currentAudit.errors.length > 0 && (
                <Alert variant="destructive">
                  <Warning size={16} />
                  <AlertDescription>
                    {currentAudit.errors.length} error(s) occurred during the audit. Please review and resolve.
                  </AlertDescription>
                </Alert>
              )}
            </TabsContent>

            <TabsContent value="revenue" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card className="p-4">
                  <h4 className="font-semibold mb-3">Revenue Breakdown</h4>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Bed size={16} className="text-primary" />
                        <span className="text-sm">Room Revenue</span>
                      </div>
                      <span className="font-medium">{formatCurrency(currentAudit.summary.roomRevenue)}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <ForkKnife size={16} className="text-accent" />
                        <span className="text-sm">F&B Revenue</span>
                      </div>
                      <span className="font-medium">{formatCurrency(currentAudit.summary.fnbRevenue)}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Sparkle size={16} className="text-secondary" />
                        <span className="text-sm">Extra Services</span>
                      </div>
                      <span className="font-medium">{formatCurrency(currentAudit.summary.extraRevenue)}</span>
                    </div>
                    <Separator />
                    <div className="flex items-center justify-between font-semibold">
                      <span>Subtotal</span>
                      <span>{formatCurrency(currentAudit.totalRevenue)}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Service Charge</span>
                      <span>{formatCurrency(currentAudit.summary.totalServiceCharge)}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Tax</span>
                      <span>{formatCurrency(currentAudit.summary.totalTax)}</span>
                    </div>
                    <Separator />
                    <div className="flex items-center justify-between font-bold text-lg">
                      <span>Grand Total</span>
                      <span className="text-primary">
                        {formatCurrency(currentAudit.totalRevenue + currentAudit.summary.totalServiceCharge + currentAudit.summary.totalTax)}
                      </span>
                    </div>
                  </div>
                </Card>

                <Card className="p-4">
                  <h4 className="font-semibold mb-3">Payment Collection</h4>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Cash Payments</span>
                      <span className="font-medium">{formatCurrency(currentAudit.summary.cashPayments)}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Card Payments</span>
                      <span className="font-medium">{formatCurrency(currentAudit.summary.cardPayments)}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Other Payments</span>
                      <span className="font-medium">{formatCurrency(currentAudit.summary.otherPayments)}</span>
                    </div>
                    <Separator />
                    <div className="flex items-center justify-between font-semibold">
                      <span>Total Collected</span>
                      <span className="text-success">
                        {formatCurrency(
                          currentAudit.summary.cashPayments + 
                          currentAudit.summary.cardPayments + 
                          currentAudit.summary.otherPayments
                        )}
                      </span>
                    </div>
                  </div>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="operations" className="space-y-4">
              <h4 className="font-semibold">Night Audit Operations</h4>
              <div className="space-y-2">
                {currentAudit.operations.map(operation => (
                  <div key={operation.id} className="flex items-center justify-between p-4 bg-muted/30 rounded-lg">
                    <div className="flex items-center gap-3">
                      {getOperationIcon(operation.operationType)}
                      <div>
                        <p className="font-medium text-sm">
                          {operation.operationType.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {operation.recordsProcessed} records processed
                          {operation.duration && ` • ${operation.duration}ms`}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      {getOperationStatusBadge(operation.status)}
                      {operation.errors && operation.errors.length > 0 && (
                        <p className="text-xs text-destructive mt-1">{operation.errors.length} errors</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="reconciliation" className="space-y-4">
              <h4 className="font-semibold mb-3">Payment Reconciliation</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card className="p-4 border-l-4 border-l-success">
                  <p className="text-sm text-muted-foreground mb-2">Reconciled Payments</p>
                  <p className="text-3xl font-semibold text-success">{currentAudit.paymentsReconciled}</p>
                </Card>
                <Card className="p-4 border-l-4 border-l-destructive">
                  <p className="text-sm text-muted-foreground mb-2">Unreconciled Amount</p>
                  <p className="text-3xl font-semibold text-destructive">
                    {formatCurrency(currentAudit.summary.outstandingBalance)}
                  </p>
                </Card>
              </div>

              {currentAudit.warnings.length > 0 && (
                <div className="space-y-2">
                  <h5 className="font-medium text-sm">Warnings</h5>
                  {currentAudit.warnings.map(warning => (
                    <Alert key={warning.id} className="border-amber-500">
                      <Warning size={16} className="text-amber-600" />
                      <AlertDescription>{warning.message}</AlertDescription>
                    </Alert>
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="statistics" className="space-y-4">
              <h4 className="font-semibold mb-3">Daily Statistics</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-sm text-muted-foreground">Occupancy Rate</p>
                    <Users size={20} className="text-primary" />
                  </div>
                  <p className="text-2xl font-semibold">{calculateOccupancy().toFixed(1)}%</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {reservations.filter(r => r.status === 'checked-in').length} / {rooms.length} rooms
                  </p>
                </Card>

                <Card className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-sm text-muted-foreground">ADR</p>
                    <CurrencyDollar size={20} className="text-accent" />
                  </div>
                  <p className="text-2xl font-semibold">{formatCurrency(calculateADR())}</p>
                  <p className="text-xs text-muted-foreground mt-1">Average Daily Rate</p>
                </Card>

                <Card className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-sm text-muted-foreground">RevPAR</p>
                    <TrendUp size={20} className="text-success" />
                  </div>
                  <p className="text-2xl font-semibold">{formatCurrency(calculateRevPAR())}</p>
                  <p className="text-xs text-muted-foreground mt-1">Revenue Per Available Room</p>
                </Card>
              </div>

              <Card className="p-4">
                <h5 className="font-semibold mb-3">Arrivals & Departures</h5>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Arrivals Today</p>
                    <p className="text-2xl font-semibold">
                      {reservations.filter(r => {
                        const checkInDate = new Date(r.checkInDate)
                        checkInDate.setHours(0, 0, 0, 0)
                        const auditDate = new Date(config.auditDate)
                        auditDate.setHours(0, 0, 0, 0)
                        return checkInDate.getTime() === auditDate.getTime()
                      }).length}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Departures Today</p>
                    <p className="text-2xl font-semibold">
                      {reservations.filter(r => {
                        const checkOutDate = new Date(r.checkOutDate)
                        checkOutDate.setHours(0, 0, 0, 0)
                        const auditDate = new Date(config.auditDate)
                        auditDate.setHours(0, 0, 0, 0)
                        return checkOutDate.getTime() === auditDate.getTime()
                      }).length}
                    </p>
                  </div>
                </div>
              </Card>
            </TabsContent>
          </Tabs>
        </Card>
      )}

      <Card className="p-6">
        <h3 className="font-semibold mb-4">Audit Configuration</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
            <div className="flex items-center gap-3">
              <Receipt size={20} />
              <div>
                <Label htmlFor="post-room">Post Room Charges</Label>
                <p className="text-xs text-muted-foreground">Automatically post nightly room charges</p>
              </div>
            </div>
            <Switch
              id="post-room"
              checked={config.postRoomCharges}
              onCheckedChange={(checked) => handleConfigChange('postRoomCharges', checked)}
              disabled={isRunning}
            />
          </div>

          <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
            <div className="flex items-center gap-3">
              <FileText size={20} />
              <div>
                <Label htmlFor="generate-invoices">Generate Invoices</Label>
                <p className="text-xs text-muted-foreground">Create invoices for checkouts</p>
              </div>
            </div>
            <Switch
              id="generate-invoices"
              checked={config.generateInvoices}
              onCheckedChange={(checked) => handleConfigChange('generateInvoices', checked)}
              disabled={isRunning}
            />
          </div>

          <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
            <div className="flex items-center gap-3">
              <CurrencyDollar size={20} />
              <div>
                <Label htmlFor="reconcile-payments">Reconcile Payments</Label>
                <p className="text-xs text-muted-foreground">Match payments to invoices</p>
              </div>
            </div>
            <Switch
              id="reconcile-payments"
              checked={config.reconcilePayments}
              onCheckedChange={(checked) => handleConfigChange('reconcilePayments', checked)}
              disabled={isRunning}
            />
          </div>

          <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
            <div className="flex items-center gap-3">
              <Database size={20} />
              <div>
                <Label htmlFor="rotate-numbers">Rotate Invoice Numbers</Label>
                <p className="text-xs text-muted-foreground">Update invoice sequences</p>
              </div>
            </div>
            <Switch
              id="rotate-numbers"
              checked={config.rotateInvoiceNumbers}
              onCheckedChange={(checked) => handleConfigChange('rotateInvoiceNumbers', checked)}
              disabled={isRunning}
            />
          </div>
        </div>

        <Separator className="my-6" />

        <div className="space-y-2">
          <Label>Audit Date</Label>
          <div className="flex items-center gap-2 text-sm">
            <Calendar size={16} className="text-muted-foreground" />
            <span>{formatDate(config.auditDate)}</span>
          </div>
          <p className="text-xs text-muted-foreground">
            Next audit should run for: {formatDate(config.auditDate)}
          </p>
        </div>
      </Card>

      <Card className="p-6">
        <h3 className="font-semibold mb-4">Audit History</h3>
        
        {auditLogs.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Moon size={48} className="mx-auto mb-3 opacity-50" />
            <p>No audit history available</p>
            <p className="text-sm mt-1">Run your first night audit to see the history</p>
          </div>
        ) : (
          <div className="space-y-2">
            {[...auditLogs].sort((a, b) => b.auditDate - a.auditDate).slice(0, 10).map(audit => (
              <div key={audit.id} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg hover:bg-muted/50 transition-colors">
                <div className="flex items-center gap-3">
                  {getStatusIcon(audit.status)}
                  <div>
                    <p className="font-medium text-sm">{formatDate(audit.auditDate)}</p>
                    <p className="text-xs text-muted-foreground">
                      {audit.invoicesGenerated} invoices • {formatCurrency(audit.totalRevenue)} revenue
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <Badge variant={audit.status === 'completed' ? 'default' : 'destructive'}>
                    {audit.status}
                  </Badge>
                  {audit.errors.length > 0 && (
                    <p className="text-xs text-destructive mt-1">{audit.errors.length} errors</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      <Dialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Warning size={24} className="text-amber-600" />
              Confirm Night Audit
            </DialogTitle>
            <DialogDescription>
              You are about to run the night audit for {formatDate(config.auditDate)}. This will:
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-2 my-4">
            {config.postRoomCharges && (
              <div className="flex items-center gap-2 text-sm">
                <CheckCircle size={16} className="text-success" />
                <span>Post room charges for checked-in guests</span>
              </div>
            )}
            {config.generateInvoices && (
              <div className="flex items-center gap-2 text-sm">
                <CheckCircle size={16} className="text-success" />
                <span>Generate invoices for checkout guests</span>
              </div>
            )}
            {config.reconcilePayments && (
              <div className="flex items-center gap-2 text-sm">
                <CheckCircle size={16} className="text-success" />
                <span>Reconcile all payments</span>
              </div>
            )}
          </div>

          <Alert>
            <Warning size={16} />
            <AlertDescription>
              This operation cannot be undone. Please ensure all data is backed up before proceeding.
            </AlertDescription>
          </Alert>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowConfirmDialog(false)}>
              Cancel
            </Button>
            <Button onClick={runAudit}>
              <PlayCircle size={16} className="mr-2" />
              Run Audit
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
