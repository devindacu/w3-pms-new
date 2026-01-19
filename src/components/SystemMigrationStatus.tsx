import { useState, useEffect } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { 
  Database, 
  Download, 
  Upload, 
  CheckCircle, 
  AlertTriangle,
  Clock,
  Shield
} from '@phosphor-icons/react'
import { MigrationManager } from '@/lib/migrations'
import { VersionControl } from '@/lib/versionControl'
import { DataIntegrity } from '@/lib/dataIntegrity'
import { toast } from 'sonner'

export function SystemMigrationStatus() {
  const [currentVersion, setCurrentVersion] = useState<string>('0.0.0')
  const [appliedMigrations, setAppliedMigrations] = useState<any[]>([])
  const [backupHistory, setBackupHistory] = useState<any[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    loadStatus()
  }, [])

  const loadStatus = async () => {
    const version = await VersionControl.getCurrentVersion()
    setCurrentVersion(version)
    
    const migrations = await MigrationManager.getAppliedMigrations()
    setAppliedMigrations(migrations)
    
    const backups = await DataIntegrity.getBackupHistory()
    setBackupHistory(backups)
  }

  const handleCreateBackup = async () => {
    setLoading(true)
    try {
      const backup = await DataIntegrity.createBackup('manual')
      toast.success(`Backup created: ${backup.id}`)
      await loadStatus()
    } catch (error) {
      toast.error('Backup creation failed')
    } finally {
      setLoading(false)
    }
  }

  const handleVerifyIntegrity = async () => {
    setLoading(true)
    try {
      const result = await DataIntegrity.verifyDataIntegrity()
      if (result.valid) {
        toast.success('Data integrity verified - all systems operational')
      } else {
        toast.error(`Issues found: ${result.errors.join(', ')}`)
      }
    } catch (error) {
      toast.error('Verification failed')
    } finally {
      setLoading(false)
    }
  }

  const handleExportData = async () => {
    setLoading(true)
    try {
      const data = await DataIntegrity.exportData()
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `w3-hotel-export-${Date.now()}.json`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
      toast.success('Data exported successfully')
    } catch (error) {
      toast.error('Export failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-6">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-muted-foreground">System Version</h3>
            <CheckCircle size={20} className="text-success" />
          </div>
          <p className="text-3xl font-semibold">{currentVersion}</p>
          <p className="text-xs text-muted-foreground mt-2">Latest stable release</p>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-muted-foreground">Applied Migrations</h3>
            <Database size={20} className="text-primary" />
          </div>
          <p className="text-3xl font-semibold">{appliedMigrations.length}</p>
          <p className="text-xs text-muted-foreground mt-2">Database updates</p>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-muted-foreground">Backups</h3>
            <Shield size={20} className="text-accent" />
          </div>
          <p className="text-3xl font-semibold">{backupHistory.length}</p>
          <p className="text-xs text-muted-foreground mt-2">Data snapshots</p>
        </Card>
      </div>

      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Data Management</h3>
        <div className="flex flex-wrap gap-3">
          <Button onClick={handleCreateBackup} disabled={loading}>
            <Download size={18} className="mr-2" />
            Create Backup
          </Button>
          <Button onClick={handleVerifyIntegrity} disabled={loading} variant="outline">
            <CheckCircle size={18} className="mr-2" />
            Verify Integrity
          </Button>
          <Button onClick={handleExportData} disabled={loading} variant="outline">
            <Upload size={18} className="mr-2" />
            Export Data
          </Button>
        </div>
      </Card>

      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Migration History</h3>
        <div className="space-y-3">
          {appliedMigrations.length === 0 ? (
            <p className="text-sm text-muted-foreground">No migrations applied yet</p>
          ) : (
            appliedMigrations.map((migration) => (
              <div key={migration.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                <div>
                  <p className="font-medium">{migration.name}</p>
                  <p className="text-sm text-muted-foreground">Version {migration.version}</p>
                </div>
                <div className="text-right">
                  <Badge variant="outline" className="mb-1">
                    {new Date(migration.appliedAt).toLocaleDateString()}
                  </Badge>
                  <p className="text-xs text-muted-foreground">
                    {new Date(migration.appliedAt).toLocaleTimeString()}
                  </p>
                </div>
              </div>
            ))
          )}
        </div>
      </Card>

      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Backup History</h3>
        <div className="space-y-3">
          {backupHistory.length === 0 ? (
            <p className="text-sm text-muted-foreground">No backups created yet</p>
          ) : (
            backupHistory.slice(-5).reverse().map((backup) => (
              <div key={backup.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                <div className="flex items-center gap-3">
                  <Shield size={20} className="text-accent" />
                  <div>
                    <p className="font-medium">{backup.id}</p>
                    <p className="text-sm text-muted-foreground">
                      {backup.keys.length} keys • Version {backup.version}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <Badge variant={
                    backup.type === 'manual' ? 'default' :
                    backup.type === 'pre-migration' ? 'secondary' :
                    'outline'
                  }>
                    {backup.type}
                  </Badge>
                  <p className="text-xs text-muted-foreground mt-1">
                    {new Date(backup.timestamp).toLocaleString()}
                  </p>
                </div>
              </div>
            ))
          )}
        </div>
      </Card>

      <Card className="p-6 bg-accent/10 border-accent">
        <div className="flex items-start gap-3">
          <AlertTriangle size={24} className="text-accent mt-1" />
          <div>
            <h4 className="font-semibold mb-2">Data Persistence Guidelines</h4>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>• All data is stored in persistent key-value storage</li>
              <li>• Code updates never reset or delete existing data</li>
              <li>• Migrations apply incremental schema changes only</li>
              <li>• Backups are created automatically before migrations</li>
              <li>• Settings, users, and history are always preserved</li>
            </ul>
          </div>
        </div>
      </Card>
    </div>
  )
}
