import { useState, useEffect } from 'react'
import { useKV } from '@github/spark/hooks'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Checkbox } from '@/components/ui/checkbox'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Progress } from '@/components/ui/progress'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
  ClockCounterClockwise,
  ArrowRight,
  ArrowLeft,
  Check,
  Warning,
  Info,
  Database,
  LockKey,
  ShieldCheck,
  FileArchive,
  MagnifyingGlass,
  Eye,
  CloudArrowDown,
  CheckCircle,
  XCircle
} from '@phosphor-icons/react'
import {
  type BackupMetadata,
  restoreBackup,
  restoreAllKVData,
  formatBytes
} from '@/lib/backupEncryption'
import type { SystemUser } from '@/lib/types'

interface RollbackWizardProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  currentUser: SystemUser
}

interface RollbackStep {
  id: number
  title: string
  description: string
  icon: React.ReactNode
}

interface DataModuleSelection {
  key: string
  label: string
  description: string
  category: 'core' | 'operational' | 'financial' | 'analytics'
  selected: boolean
  recordCount?: number
}

interface RollbackPreview {
  module: string
  currentRecords: number
  backupRecords: number
  changeType: 'add' | 'remove' | 'replace' | 'none'
  impact: 'low' | 'medium' | 'high' | 'critical'
}

interface RollbackLog {
  id: string
  timestamp: number
  backupId: string
  backupName: string
  modulesRestored: string[]
  recordsRestored: number
  status: 'success' | 'partial' | 'failed'
  errors?: string[]
  performedBy: string
}

const ROLLBACK_STEPS: RollbackStep[] = [
  {
    id: 1,
    title: 'Select Backup',
    description: 'Choose the backup you want to restore from',
    icon: <FileArchive size={24} />
  },
  {
    id: 2,
    title: 'Verify Backup',
    description: 'Verify backup integrity and authentication',
    icon: <ShieldCheck size={24} />
  },
  {
    id: 3,
    title: 'Select Data',
    description: 'Choose which data modules to restore',
    icon: <Database size={24} />
  },
  {
    id: 4,
    title: 'Preview Changes',
    description: 'Review what will change after restoration',
    icon: <Eye size={24} />
  },
  {
    id: 5,
    title: 'Restore',
    description: 'Execute the rollback operation',
    icon: <CloudArrowDown size={24} />
  }
]

const DATA_MODULES: Omit<DataModuleSelection, 'selected' | 'recordCount'>[] = [
  { key: 'w3-hotel-rooms', label: 'Rooms', description: 'Room inventory and configurations', category: 'core' },
  { key: 'w3-hotel-guests', label: 'Guests', description: 'Guest records and profiles', category: 'core' },
  { key: 'w3-hotel-reservations', label: 'Reservations', description: 'Booking and reservation data', category: 'core' },
  { key: 'w3-hotel-folios', label: 'Folios', description: 'Guest folio transactions', category: 'financial' },
  { key: 'w3-hotel-housekeeping', label: 'Housekeeping', description: 'Housekeeping tasks and assignments', category: 'operational' },
  { key: 'w3-hotel-employees', label: 'Employees', description: 'Staff and employee records', category: 'operational' },
  { key: 'w3-hotel-inventory', label: 'Inventory', description: 'General inventory items', category: 'operational' },
  { key: 'w3-hotel-food-items', label: 'Food Inventory', description: 'F&B inventory and stock', category: 'operational' },
  { key: 'w3-hotel-amenities', label: 'Amenities', description: 'Room amenities inventory', category: 'operational' },
  { key: 'w3-hotel-menu', label: 'Menu Items', description: 'Restaurant menu and pricing', category: 'operational' },
  { key: 'w3-hotel-orders', label: 'F&B Orders', description: 'Food and beverage orders', category: 'operational' },
  { key: 'w3-hotel-suppliers', label: 'Suppliers', description: 'Supplier contacts and records', category: 'operational' },
  { key: 'w3-hotel-invoices', label: 'Supplier Invoices', description: 'Purchase invoices and bills', category: 'financial' },
  { key: 'w3-hotel-guest-invoices', label: 'Guest Invoices', description: 'Guest billing invoices', category: 'financial' },
  { key: 'w3-hotel-payments', label: 'Payments', description: 'Payment transactions', category: 'financial' },
  { key: 'w3-hotel-expenses', label: 'Expenses', description: 'Operating expenses', category: 'financial' },
  { key: 'w3-hotel-guest-profiles', label: 'Guest CRM', description: 'Guest profiles and preferences', category: 'analytics' },
  { key: 'w3-hotel-system-users', label: 'System Users', description: 'User accounts and permissions', category: 'core' },
  { key: 'w3-hotel-branding', label: 'Branding Settings', description: 'Hotel branding and theme', category: 'core' },
  { key: 'w3-hotel-taxes', label: 'Tax Configuration', description: 'Tax rates and settings', category: 'core' }
]

export function RollbackWizard({ open, onOpenChange, currentUser }: RollbackWizardProps) {
  const [backups, setBackups] = useKV<BackupMetadata[]>('w3-hotel-backups', [])
  const [backupData, setBackupData] = useKV<Record<string, string>>('w3-hotel-backup-data', {})
  const [rollbackLogs, setRollbackLogs] = useKV<RollbackLog[]>('w3-hotel-rollback-logs', [])
  
  const [currentStep, setCurrentStep] = useState(1)
  const [selectedBackup, setSelectedBackup] = useState<BackupMetadata | null>(null)
  const [password, setPassword] = useState('')
  const [verificationStatus, setVerificationStatus] = useState<'pending' | 'verifying' | 'success' | 'failed'>('pending')
  const [dataModules, setDataModules] = useState<DataModuleSelection[]>([])
  const [restoreMode, setRestoreMode] = useState<'full' | 'selective'>('selective')
  const [createPreRollbackBackup, setCreatePreRollbackBackup] = useState(true)
  const [previews, setPreviews] = useState<RollbackPreview[]>([])
  const [restoring, setRestoring] = useState(false)
  const [restoreProgress, setRestoreProgress] = useState(0)
  const [restoreStatus, setRestoreStatus] = useState<'idle' | 'preparing' | 'restoring' | 'complete' | 'error'>('idle')
  const [errors, setErrors] = useState<string[]>([])
  const [searchTerm, setSearchTerm] = useState('')

  useEffect(() => {
    if (open) {
      resetWizard()
    }
  }, [open])

  const resetWizard = () => {
    setCurrentStep(1)
    setSelectedBackup(null)
    setPassword('')
    setVerificationStatus('pending')
    setRestoreMode('selective')
    setCreatePreRollbackBackup(true)
    setPreviews([])
    setRestoring(false)
    setRestoreProgress(0)
    setRestoreStatus('idle')
    setErrors([])
    setSearchTerm('')
    initializeDataModules()
  }

  const initializeDataModules = async () => {
    const modules = await Promise.all(
      DATA_MODULES.map(async (module) => {
        try {
          const data = await window.spark.kv.get(module.key)
          const recordCount = Array.isArray(data) ? data.length : data ? 1 : 0
          return {
            ...module,
            selected: false,
            recordCount
          }
        } catch {
          return {
            ...module,
            selected: false,
            recordCount: 0
          }
        }
      })
    )
    setDataModules(modules)
  }

  const handleBackupSelect = (backup: BackupMetadata) => {
    setSelectedBackup(backup)
  }

  const handleVerifyBackup = async () => {
    if (!selectedBackup) return

    if (selectedBackup.encrypted && !password) {
      toast.error('Password required for encrypted backup')
      return
    }

    setVerificationStatus('verifying')
    
    try {
      const data = backupData?.[selectedBackup.id]
      if (!data) {
        throw new Error('Backup data not found')
      }

      await restoreBackup(
        data,
        selectedBackup.encrypted ? password : undefined,
        true
      )

      setVerificationStatus('success')
      toast.success('Backup verified successfully')
      
      setTimeout(() => {
        setCurrentStep(3)
      }, 1000)
    } catch (error) {
      setVerificationStatus('failed')
      toast.error('Backup verification failed: ' + (error as Error).message)
    }
  }

  const handleModuleToggle = (key: string) => {
    setDataModules((current) =>
      current.map((module) =>
        module.key === key ? { ...module, selected: !module.selected } : module
      )
    )
  }

  const handleSelectAll = () => {
    setDataModules((current) => current.map((module) => ({ ...module, selected: true })))
  }

  const handleDeselectAll = () => {
    setDataModules((current) => current.map((module) => ({ ...module, selected: false })))
  }

  const handleSelectCategory = (category: DataModuleSelection['category']) => {
    setDataModules((current) =>
      current.map((module) =>
        module.category === category ? { ...module, selected: true } : module
      )
    )
  }

  const generatePreviews = async () => {
    if (!selectedBackup) return

    const data = backupData?.[selectedBackup.id]
    if (!data) {
      toast.error('Backup data not found')
      return
    }

    try {
      const restoredData = await restoreBackup(
        data,
        selectedBackup.encrypted ? password : undefined,
        true
      )

      const selectedModules = dataModules.filter((m) => m.selected)
      const newPreviews: RollbackPreview[] = []

      for (const module of selectedModules) {
        const backupRecords = restoredData[module.key]
        const backupCount = Array.isArray(backupRecords) ? backupRecords.length : backupRecords ? 1 : 0
        const currentCount = module.recordCount || 0

        let changeType: RollbackPreview['changeType'] = 'none'
        let impact: RollbackPreview['impact'] = 'low'

        if (backupCount > currentCount) {
          changeType = 'add'
          impact = backupCount - currentCount > 10 ? 'medium' : 'low'
        } else if (backupCount < currentCount) {
          changeType = 'remove'
          impact = currentCount - backupCount > 10 ? 'high' : 'medium'
        } else if (backupCount === currentCount && backupCount > 0) {
          changeType = 'replace'
          impact = 'medium'
        }

        if (module.category === 'financial' && changeType !== 'none') {
          impact = 'critical'
        }

        newPreviews.push({
          module: module.label,
          currentRecords: currentCount,
          backupRecords: backupCount,
          changeType,
          impact
        })
      }

      setPreviews(newPreviews)
      setCurrentStep(4)
    } catch (error) {
      toast.error('Failed to generate preview: ' + (error as Error).message)
    }
  }

  const handleRestore = async () => {
    if (!selectedBackup) return

    setRestoring(true)
    setRestoreStatus('preparing')
    setRestoreProgress(10)
    setErrors([])

    try {
      if (createPreRollbackBackup) {
        setRestoreStatus('preparing')
        toast.info('Creating pre-rollback backup...')
        await createEmergencyBackup()
        setRestoreProgress(30)
      }

      setRestoreStatus('restoring')
      toast.info('Restoring data...')
      
      const data = backupData?.[selectedBackup.id]
      if (!data) {
        throw new Error('Backup data not found')
      }

      const restoredData = await restoreBackup(
        data,
        selectedBackup.encrypted ? password : undefined,
        true
      )

      setRestoreProgress(50)

      const selectedModules = dataModules.filter((m) => m.selected)
      let restoredCount = 0
      const newErrors: string[] = []

      for (let i = 0; i < selectedModules.length; i++) {
        const module = selectedModules[i]
        try {
          const backupValue = restoredData[module.key]
          if (backupValue !== undefined) {
            await window.spark.kv.set(module.key, backupValue)
            restoredCount++
          }
          setRestoreProgress(50 + ((i + 1) / selectedModules.length) * 40)
        } catch (error) {
          newErrors.push(`Failed to restore ${module.label}: ${(error as Error).message}`)
        }
      }

      setRestoreProgress(95)

      const log: RollbackLog = {
        id: `rollback-${Date.now()}`,
        timestamp: Date.now(),
        backupId: selectedBackup.id,
        backupName: selectedBackup.name,
        modulesRestored: selectedModules.map((m) => m.label),
        recordsRestored: restoredCount,
        status: newErrors.length === 0 ? 'success' : newErrors.length < selectedModules.length ? 'partial' : 'failed',
        errors: newErrors.length > 0 ? newErrors : undefined,
        performedBy: `${currentUser.firstName} ${currentUser.lastName}`
      }

      setRollbackLogs((current) => [...(current || []), log])
      setErrors(newErrors)
      setRestoreProgress(100)
      setRestoreStatus('complete')

      if (newErrors.length === 0) {
        toast.success('Data restored successfully! Page will refresh...')
        setTimeout(() => {
          window.location.reload()
        }, 2000)
      } else if (newErrors.length < selectedModules.length) {
        toast.warning('Partial restoration completed with some errors')
      } else {
        toast.error('Restoration failed')
      }
    } catch (error) {
      setRestoreStatus('error')
      setErrors([`Critical error: ${(error as Error).message}`])
      toast.error('Restoration failed: ' + (error as Error).message)
    } finally {
      setRestoring(false)
    }
  }

  const createEmergencyBackup = async () => {
    const kvData: Record<string, any> = {}
    const selectedModules = dataModules.filter((m) => m.selected)

    for (const module of selectedModules) {
      try {
        const data = await window.spark.kv.get(module.key)
        if (data !== undefined) {
          kvData[module.key] = data
        }
      } catch (error) {
        console.error(`Failed to backup ${module.key}:`, error)
      }
    }

    const backupString = JSON.stringify({
      version: '1.0.0',
      timestamp: Date.now(),
      data: kvData
    })

    const backup: BackupMetadata = {
      id: `emergency-${Date.now()}`,
      name: `Pre-Rollback Backup ${new Date().toLocaleString()}`,
      description: 'Automatically created before rollback operation',
      timestamp: Date.now(),
      size: new Blob([backupString]).size,
      encrypted: false,
      autoBackup: true,
      dataKeys: Object.keys(kvData),
      checksum: ''
    }

    setBackups((current) => [...(current || []), backup])
    setBackupData((current) => ({
      ...(current || {}),
      [backup.id]: backupString
    }))
  }

  const filteredBackups = (backups || [])
    .filter((backup) =>
      backup.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      backup.description?.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => b.timestamp - a.timestamp)

  const selectedModuleCount = dataModules.filter((m) => m.selected).length
  const totalRecordsToRestore = dataModules
    .filter((m) => m.selected)
    .reduce((sum, m) => sum + (m.recordCount || 0), 0)

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="flex-1">
                <Input
                  placeholder="Search backups..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full"
                />
              </div>
              <MagnifyingGlass size={20} className="text-muted-foreground" />
            </div>

            <ScrollArea className="h-[400px] pr-4">
              <div className="space-y-3">
                {filteredBackups.length === 0 ? (
                  <Card className="p-8 text-center">
                    <Database size={48} className="mx-auto text-muted-foreground mb-3" />
                    <p className="text-muted-foreground">No backups available</p>
                    <p className="text-sm text-muted-foreground mt-1">
                      Create a backup first to enable rollback
                    </p>
                  </Card>
                ) : (
                  filteredBackups.map((backup) => (
                    <Card
                      key={backup.id}
                      className={`p-4 cursor-pointer transition-all ${
                        selectedBackup?.id === backup.id
                          ? 'border-primary bg-primary/5'
                          : 'hover:border-primary/50'
                      }`}
                      onClick={() => handleBackupSelect(backup)}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <h4 className="font-medium">{backup.name}</h4>
                            {backup.encrypted && (
                              <Badge variant="secondary" className="text-xs">
                                <LockKey size={12} className="mr-1" />
                                Encrypted
                              </Badge>
                            )}
                            {backup.autoBackup && (
                              <Badge variant="outline" className="text-xs">
                                Auto
                              </Badge>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground mt-1">
                            {backup.description || 'No description'}
                          </p>
                          <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                            <span>{new Date(backup.timestamp).toLocaleString()}</span>
                            <span>{formatBytes(backup.size)}</span>
                            <span>{backup.dataKeys.length} modules</span>
                          </div>
                        </div>
                        {selectedBackup?.id === backup.id && (
                          <CheckCircle size={24} className="text-primary" />
                        )}
                      </div>
                    </Card>
                  ))
                )}
              </div>
            </ScrollArea>
          </div>
        )

      case 2:
        return (
          <div className="space-y-6">
            {selectedBackup && (
              <Card className="p-6">
                <h4 className="font-medium mb-4">Selected Backup</h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground">Name</p>
                    <p className="font-medium">{selectedBackup.name}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Date</p>
                    <p className="font-medium">
                      {new Date(selectedBackup.timestamp).toLocaleString()}
                    </p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Size</p>
                    <p className="font-medium">{formatBytes(selectedBackup.size)}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Modules</p>
                    <p className="font-medium">{selectedBackup.dataKeys.length}</p>
                  </div>
                </div>
              </Card>
            )}

            {selectedBackup?.encrypted && (
              <div className="space-y-3">
                <Label htmlFor="password">Backup Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Enter backup password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={verificationStatus === 'verifying' || verificationStatus === 'success'}
                />
              </div>
            )}

            {verificationStatus === 'verifying' && (
              <Alert>
                <Info size={16} />
                <AlertDescription>Verifying backup integrity...</AlertDescription>
              </Alert>
            )}

            {verificationStatus === 'success' && (
              <Alert className="border-green-500 bg-green-50 dark:bg-green-950">
                <CheckCircle size={16} className="text-green-600" />
                <AlertDescription className="text-green-600">
                  Backup verified successfully! Ready to proceed.
                </AlertDescription>
              </Alert>
            )}

            {verificationStatus === 'failed' && (
              <Alert className="border-red-500 bg-red-50 dark:bg-red-950">
                <XCircle size={16} className="text-red-600" />
                <AlertDescription className="text-red-600">
                  Backup verification failed. Please check your password and try again.
                </AlertDescription>
              </Alert>
            )}

            {verificationStatus === 'pending' && (
              <Button
                onClick={handleVerifyBackup}
                className="w-full"
                size="lg"
                disabled={!selectedBackup || (selectedBackup.encrypted && !password)}
              >
                <ShieldCheck size={20} className="mr-2" />
                Verify Backup
              </Button>
            )}
          </div>
        )

      case 3:
        return (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium">Restore Mode</h4>
                <p className="text-sm text-muted-foreground">Choose full or selective restoration</p>
              </div>
              <RadioGroup value={restoreMode} onValueChange={(v) => setRestoreMode(v as 'full' | 'selective')}>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="full" id="full" />
                  <Label htmlFor="full">Full Restore</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="selective" id="selective" />
                  <Label htmlFor="selective">Selective Restore</Label>
                </div>
              </RadioGroup>
            </div>

            {restoreMode === 'selective' && (
              <>
                <div className="flex items-center gap-2 flex-wrap">
                  <Button variant="outline" size="sm" onClick={handleSelectAll}>
                    Select All
                  </Button>
                  <Button variant="outline" size="sm" onClick={handleDeselectAll}>
                    Deselect All
                  </Button>
                  <Separator orientation="vertical" className="h-6" />
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleSelectCategory('core')}
                  >
                    Core Data
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleSelectCategory('operational')}
                  >
                    Operational
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleSelectCategory('financial')}
                  >
                    Financial
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleSelectCategory('analytics')}
                  >
                    Analytics
                  </Button>
                </div>

                <ScrollArea className="h-[350px] pr-4">
                  <div className="space-y-2">
                    {dataModules.map((module) => (
                      <Card
                        key={module.key}
                        className={`p-4 cursor-pointer transition-all ${
                          module.selected ? 'border-primary bg-primary/5' : 'hover:border-primary/50'
                        }`}
                        onClick={() => handleModuleToggle(module.key)}
                      >
                        <div className="flex items-start gap-3">
                          <Checkbox
                            checked={module.selected}
                            onCheckedChange={() => handleModuleToggle(module.key)}
                          />
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <h5 className="font-medium">{module.label}</h5>
                              <Badge variant="outline" className="text-xs">
                                {module.category}
                              </Badge>
                            </div>
                            <p className="text-sm text-muted-foreground mt-1">
                              {module.description}
                            </p>
                            <p className="text-xs text-muted-foreground mt-1">
                              Current records: {module.recordCount || 0}
                            </p>
                          </div>
                        </div>
                      </Card>
                    ))}
                  </div>
                </ScrollArea>

                <Alert>
                  <Info size={16} />
                  <AlertDescription>
                    {selectedModuleCount} module{selectedModuleCount !== 1 ? 's' : ''} selected
                    {selectedModuleCount > 0 && ` (${totalRecordsToRestore} records)`}
                  </AlertDescription>
                </Alert>
              </>
            )}

            {restoreMode === 'full' && (
              <Alert className="border-yellow-500 bg-yellow-50 dark:bg-yellow-950">
                <Warning size={16} className="text-yellow-600" />
                <AlertDescription className="text-yellow-600">
                  Full restore will replace all data in the system with the backup. This action
                  cannot be undone unless you create a pre-rollback backup.
                </AlertDescription>
              </Alert>
            )}
          </div>
        )

      case 4:
        return (
          <div className="space-y-6">
            <Alert>
              <Info size={16} />
              <AlertDescription>
                Review the changes that will occur. Critical changes are highlighted.
              </AlertDescription>
            </Alert>

            <ScrollArea className="h-[400px] pr-4">
              <div className="space-y-3">
                {previews.map((preview, index) => (
                  <Card
                    key={index}
                    className={`p-4 ${
                      preview.impact === 'critical'
                        ? 'border-red-500'
                        : preview.impact === 'high'
                        ? 'border-yellow-500'
                        : ''
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <h5 className="font-medium">{preview.module}</h5>
                          <Badge
                            variant={
                              preview.impact === 'critical'
                                ? 'destructive'
                                : preview.impact === 'high'
                                ? 'default'
                                : 'secondary'
                            }
                            className="text-xs"
                          >
                            {preview.impact}
                          </Badge>
                        </div>
                        <div className="grid grid-cols-3 gap-4 mt-3 text-sm">
                          <div>
                            <p className="text-muted-foreground">Current</p>
                            <p className="font-medium">{preview.currentRecords} records</p>
                          </div>
                          <div>
                            <p className="text-muted-foreground">Backup</p>
                            <p className="font-medium">{preview.backupRecords} records</p>
                          </div>
                          <div>
                            <p className="text-muted-foreground">Change</p>
                            <p className={`font-medium ${
                              preview.changeType === 'add' ? 'text-green-600' :
                              preview.changeType === 'remove' ? 'text-red-600' :
                              preview.changeType === 'replace' ? 'text-yellow-600' :
                              'text-muted-foreground'
                            }`}>
                              {preview.changeType === 'add' && `+${preview.backupRecords - preview.currentRecords}`}
                              {preview.changeType === 'remove' && `-${preview.currentRecords - preview.backupRecords}`}
                              {preview.changeType === 'replace' && 'Replace'}
                              {preview.changeType === 'none' && 'No change'}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </ScrollArea>

            <div className="flex items-start gap-3 p-4 bg-muted rounded-lg">
              <Checkbox
                id="pre-backup"
                checked={createPreRollbackBackup}
                onCheckedChange={(checked) => setCreatePreRollbackBackup(checked as boolean)}
              />
              <div className="flex-1">
                <Label htmlFor="pre-backup" className="cursor-pointer">
                  Create pre-rollback backup (Recommended)
                </Label>
                <p className="text-sm text-muted-foreground mt-1">
                  Automatically create a backup of current data before restoring. This allows you to
                  revert the rollback if needed.
                </p>
              </div>
            </div>
          </div>
        )

      case 5:
        return (
          <div className="space-y-6">
            {restoreStatus === 'idle' && (
              <Alert className="border-yellow-500 bg-yellow-50 dark:bg-yellow-950">
                <Warning size={16} className="text-yellow-600" />
                <AlertDescription className="text-yellow-600">
                  You are about to restore {selectedModuleCount} module
                  {selectedModuleCount !== 1 ? 's' : ''} from backup. This will replace current data
                  and may affect ongoing operations.
                </AlertDescription>
              </Alert>
            )}

            {(restoreStatus === 'preparing' || restoreStatus === 'restoring') && (
              <div className="space-y-4">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">
                    {restoreStatus === 'preparing' ? 'Preparing...' : 'Restoring data...'}
                  </span>
                  <span className="font-medium">{restoreProgress}%</span>
                </div>
                <Progress value={restoreProgress} className="h-2" />
              </div>
            )}

            {restoreStatus === 'complete' && (
              <Alert className="border-green-500 bg-green-50 dark:bg-green-950">
                <CheckCircle size={16} className="text-green-600" />
                <AlertDescription className="text-green-600">
                  Restoration completed successfully! The page will refresh to apply changes.
                </AlertDescription>
              </Alert>
            )}

            {restoreStatus === 'error' && (
              <Alert className="border-red-500 bg-red-50 dark:bg-red-950">
                <XCircle size={16} className="text-red-600" />
                <AlertDescription className="text-red-600">
                  Restoration failed. Please check the errors below and try again.
                </AlertDescription>
              </Alert>
            )}

            {errors.length > 0 && (
              <Card className="p-4">
                <h5 className="font-medium mb-3 text-red-600">Errors</h5>
                <ScrollArea className="h-[200px]">
                  <div className="space-y-2">
                    {errors.map((error, index) => (
                      <div key={index} className="text-sm text-red-600 flex items-start gap-2">
                        <XCircle size={16} className="mt-0.5 shrink-0" />
                        <span>{error}</span>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </Card>
            )}

            {restoreStatus === 'idle' && (
              <Card className="p-6">
                <h4 className="font-medium mb-4">Restoration Summary</h4>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Backup</span>
                    <span className="font-medium">{selectedBackup?.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Modules to restore</span>
                    <span className="font-medium">{selectedModuleCount}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Pre-rollback backup</span>
                    <span className="font-medium">
                      {createPreRollbackBackup ? 'Yes' : 'No'}
                    </span>
                  </div>
                </div>
              </Card>
            )}
          </div>
        )

      default:
        return null
    }
  }

  const canProceed = () => {
    switch (currentStep) {
      case 1:
        return selectedBackup !== null
      case 2:
        return verificationStatus === 'success'
      case 3:
        return restoreMode === 'full' || selectedModuleCount > 0
      case 4:
        return previews.length > 0
      case 5:
        return restoreStatus === 'idle' || restoreStatus === 'complete'
      default:
        return false
    }
  }

  const handleNext = () => {
    if (currentStep === 3 && restoreMode === 'full') {
      handleSelectAll()
    }
    
    if (currentStep === 3) {
      generatePreviews()
    } else if (currentStep === 4) {
      setCurrentStep(5)
    } else {
      setCurrentStep((prev) => prev + 1)
    }
  }

  const handleBack = () => {
    if (currentStep === 3 && verificationStatus === 'success') {
      setVerificationStatus('pending')
    }
    setCurrentStep((prev) => prev - 1)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-2xl">
            <ClockCounterClockwise size={28} className="text-primary" />
            Rollback Wizard
          </DialogTitle>
          <DialogDescription>
            Step-by-step guided data recovery from backups
          </DialogDescription>
        </DialogHeader>

        <div className="py-6">
          <div className="mb-8">
            <div className="flex items-center justify-between">
              {ROLLBACK_STEPS.map((step, index) => (
                <div key={step.id} className="flex items-center flex-1">
                  <div className="flex flex-col items-center">
                    <div
                      className={`w-12 h-12 rounded-full flex items-center justify-center border-2 transition-all ${
                        currentStep === step.id
                          ? 'border-primary bg-primary text-primary-foreground'
                          : currentStep > step.id
                          ? 'border-green-500 bg-green-500 text-white'
                          : 'border-muted bg-muted text-muted-foreground'
                      }`}
                    >
                      {currentStep > step.id ? <Check size={20} /> : step.icon}
                    </div>
                    <p
                      className={`text-xs mt-2 text-center max-w-[100px] ${
                        currentStep === step.id ? 'font-medium' : 'text-muted-foreground'
                      }`}
                    >
                      {step.title}
                    </p>
                  </div>
                  {index < ROLLBACK_STEPS.length - 1 && (
                    <div
                      className={`h-0.5 flex-1 mx-2 ${
                        currentStep > step.id ? 'bg-green-500' : 'bg-muted'
                      }`}
                    />
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="min-h-[450px]">{renderStepContent()}</div>
        </div>

        <DialogFooter>
          <div className="flex items-center justify-between w-full">
            <Button
              variant="outline"
              onClick={handleBack}
              disabled={currentStep === 1 || restoring || restoreStatus === 'complete'}
            >
              <ArrowLeft size={18} className="mr-2" />
              Back
            </Button>

            <div className="flex items-center gap-2">
              {currentStep < 5 ? (
                <Button
                  onClick={handleNext}
                  disabled={!canProceed() || restoring}
                >
                  Next
                  <ArrowRight size={18} className="ml-2" />
                </Button>
              ) : (
                <>
                  {restoreStatus === 'idle' && (
                    <Button
                      onClick={handleRestore}
                      disabled={!canProceed() || restoring}
                      className="bg-primary"
                    >
                      <CloudArrowDown size={20} className="mr-2" />
                      Start Restoration
                    </Button>
                  )}
                  {restoreStatus === 'complete' && (
                    <Button onClick={() => onOpenChange(false)}>
                      Close
                    </Button>
                  )}
                </>
              )}
            </div>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
