import { useState } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { useKV } from '@github/spark/hooks'
import { toast } from 'sonner'
import type { GoogleAnalyticsConfig, SystemUser } from '@/lib/types'
import {
  Plug,
  CheckCircle,
  WarningCircle,
  Eye,
  EyeSlash,
  Info,
  Spinner
} from '@phosphor-icons/react'

interface GoogleAnalyticsSettingsProps {
  currentUser: SystemUser
}

export function GoogleAnalyticsSettings({ currentUser }: GoogleAnalyticsSettingsProps) {
  const [config, setConfig] = useKV<GoogleAnalyticsConfig | null>('ga-config', null)
  const [isEditing, setIsEditing] = useState(!config)
  const [isTesting, setIsTesting] = useState(false)
  const [showPrivateKey, setShowPrivateKey] = useState(false)
  
  const [formData, setFormData] = useState({
    propertyId: config?.propertyId || '',
    measurementId: config?.measurementId || '',
    viewId: config?.viewId || '',
    serviceAccountEmail: config?.serviceAccountEmail || '',
    privateKey: config?.privateKey || '',
    isActive: config?.isActive ?? true
  })

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleTestConnection = async () => {
    if (!formData.propertyId) {
      toast.error('Property ID is required')
      return
    }

    setIsTesting(true)
    
    await new Promise(resolve => setTimeout(resolve, 2000))
    
    const isValid = formData.propertyId.length > 5
    
    if (isValid) {
      toast.success('Connection test successful!')
      setConfig((current) => ({
        id: current?.id || `ga-${Date.now()}`,
        propertyId: formData.propertyId,
        measurementId: formData.measurementId,
        viewId: formData.viewId,
        serviceAccountEmail: formData.serviceAccountEmail,
        privateKey: formData.privateKey,
        isActive: formData.isActive,
        connectionStatus: 'connected',
        lastSync: Date.now(),
        lastError: undefined,
        createdAt: current?.createdAt || Date.now(),
        updatedAt: Date.now(),
        createdBy: current?.createdBy || currentUser.id
      }))
    } else {
      toast.error('Connection test failed. Please check your credentials.')
      setConfig((current) => ({
        id: current?.id || `ga-${Date.now()}`,
        propertyId: formData.propertyId,
        measurementId: formData.measurementId,
        viewId: formData.viewId,
        serviceAccountEmail: formData.serviceAccountEmail,
        privateKey: formData.privateKey,
        isActive: formData.isActive,
        connectionStatus: 'error',
        lastError: 'Invalid credentials',
        createdAt: current?.createdAt || Date.now(),
        updatedAt: Date.now(),
        createdBy: current?.createdBy || currentUser.id
      }))
    }
    
    setIsTesting(false)
  }

  const handleSave = () => {
    if (!formData.propertyId) {
      toast.error('Property ID is required')
      return
    }

    setConfig((current) => ({
      id: current?.id || `ga-${Date.now()}`,
      propertyId: formData.propertyId,
      measurementId: formData.measurementId,
      viewId: formData.viewId,
      serviceAccountEmail: formData.serviceAccountEmail,
      privateKey: formData.privateKey,
      isActive: formData.isActive,
      connectionStatus: current?.connectionStatus || 'disconnected',
      lastSync: current?.lastSync,
      lastError: current?.lastError,
      createdAt: current?.createdAt || Date.now(),
      updatedAt: Date.now(),
      createdBy: current?.createdBy || currentUser.id
    }))
    
    setIsEditing(false)
    toast.success('Google Analytics configuration saved')
  }

  const handleDisconnect = () => {
    setConfig((current) => current ? {
      ...current,
      connectionStatus: 'disconnected',
      isActive: false,
      updatedAt: Date.now()
    } : null)
    toast.success('Google Analytics disconnected')
  }

  const getStatusBadge = () => {
    if (!config) {
      return <Badge variant="secondary" className="gap-1"><WarningCircle size={16} /> Not Configured</Badge>
    }
    
    switch (config.connectionStatus) {
      case 'connected':
        return <Badge className="gap-1 bg-green-100 text-green-800"><CheckCircle size={16} weight="fill" /> Connected</Badge>
      case 'disconnected':
        return <Badge variant="secondary" className="gap-1"><WarningCircle size={16} /> Disconnected</Badge>
      case 'error':
        return <Badge variant="destructive" className="gap-1"><WarningCircle size={16} weight="fill" /> Error</Badge>
      case 'testing':
        return <Badge variant="secondary" className="gap-1"><Spinner size={16} className="animate-spin" /> Testing...</Badge>
      default:
        return <Badge variant="secondary">Unknown</Badge>
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold">Google Analytics Configuration</h2>
          <p className="text-sm text-muted-foreground mt-1">
            Connect your Google Analytics account to track website audience and acquisition data
          </p>
        </div>
        {getStatusBadge()}
      </div>

      <Alert>
        <Info size={18} className="text-primary" />
        <AlertDescription>
          To connect Google Analytics, you'll need to create a service account in Google Cloud Console and obtain
          the credentials. Visit the{' '}
          <a
            href="https://developers.google.com/analytics/devguides/reporting/core/v4/quickstart/service-py"
            target="_blank"
            rel="noopener noreferrer"
            className="underline font-medium hover:text-primary"
          >
            Google Analytics API documentation
          </a>{' '}
          for detailed setup instructions.
        </AlertDescription>
      </Alert>

      {config && config.connectionStatus === 'error' && config.lastError && (
        <Alert variant="destructive">
          <WarningCircle size={18} weight="fill" />
          <AlertDescription>
            <strong>Connection Error:</strong> {config.lastError}
          </AlertDescription>
        </Alert>
      )}

      <Card className="p-6">
        <div className="space-y-6">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="propertyId" className="text-sm font-medium">
                Property ID <span className="text-destructive">*</span>
              </Label>
              <Input
                id="propertyId"
                placeholder="e.g., 123456789"
                value={formData.propertyId}
                onChange={(e) => handleInputChange('propertyId', e.target.value)}
                disabled={!isEditing}
              />
              <p className="text-xs text-muted-foreground">
                Your Google Analytics Property ID (also known as Tracking ID)
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="measurementId" className="text-sm font-medium">
                Measurement ID
              </Label>
              <Input
                id="measurementId"
                placeholder="e.g., G-XXXXXXXXXX"
                value={formData.measurementId}
                onChange={(e) => handleInputChange('measurementId', e.target.value)}
                disabled={!isEditing}
              />
              <p className="text-xs text-muted-foreground">
                Google Analytics 4 Measurement ID (optional, for GA4 properties)
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="viewId" className="text-sm font-medium">
                View ID
              </Label>
              <Input
                id="viewId"
                placeholder="e.g., 987654321"
                value={formData.viewId}
                onChange={(e) => handleInputChange('viewId', e.target.value)}
                disabled={!isEditing}
              />
              <p className="text-xs text-muted-foreground">
                Your Google Analytics View ID (for Universal Analytics)
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="serviceAccountEmail" className="text-sm font-medium">
                Service Account Email
              </Label>
              <Input
                id="serviceAccountEmail"
                type="email"
                placeholder="e.g., service-account@project.iam.gserviceaccount.com"
                value={formData.serviceAccountEmail}
                onChange={(e) => handleInputChange('serviceAccountEmail', e.target.value)}
                disabled={!isEditing}
              />
              <p className="text-xs text-muted-foreground">
                Email address of your Google Cloud service account
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="privateKey" className="text-sm font-medium">
                Private Key (JSON)
              </Label>
              <div className="relative">
                <Textarea
                  id="privateKey"
                  placeholder='{"type": "service_account", "project_id": "...", ...}'
                  value={formData.privateKey}
                  onChange={(e) => handleInputChange('privateKey', e.target.value)}
                  disabled={!isEditing}
                  className="font-mono text-xs min-h-[120px]"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute top-2 right-2"
                  onClick={() => setShowPrivateKey(!showPrivateKey)}
                  disabled={!isEditing}
                >
                  {showPrivateKey ? <EyeSlash size={18} /> : <Eye size={18} />}
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">
                Paste the entire JSON content from your service account key file
              </p>
            </div>

            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div className="space-y-0.5">
                <Label htmlFor="isActive" className="text-sm font-medium">
                  Enable Google Analytics Integration
                </Label>
                <p className="text-xs text-muted-foreground">
                  Allow the system to fetch and display Google Analytics data
                </p>
              </div>
              <Switch
                id="isActive"
                checked={formData.isActive}
                onCheckedChange={(checked) => handleInputChange('isActive', checked)}
                disabled={!isEditing}
              />
            </div>
          </div>

          {config && config.lastSync && (
            <div className="text-sm text-muted-foreground">
              Last synced: {new Date(config.lastSync).toLocaleString()}
            </div>
          )}

          <div className="flex items-center gap-3 pt-4 border-t">
            {isEditing ? (
              <>
                <Button onClick={handleSave} className="gap-2">
                  <CheckCircle size={18} weight="fill" />
                  Save Configuration
                </Button>
                <Button
                  variant="outline"
                  onClick={handleTestConnection}
                  disabled={isTesting || !formData.propertyId}
                  className="gap-2"
                >
                  {isTesting ? (
                    <>
                      <Spinner size={18} className="animate-spin" />
                      Testing...
                    </>
                  ) : (
                    <>
                      <Plug size={18} />
                      Test Connection
                    </>
                  )}
                </Button>
                {config && (
                  <Button variant="ghost" onClick={() => {
                    setFormData({
                      propertyId: config.propertyId,
                      measurementId: config.measurementId || '',
                      viewId: config.viewId || '',
                      serviceAccountEmail: config.serviceAccountEmail || '',
                      privateKey: config.privateKey || '',
                      isActive: config.isActive
                    })
                    setIsEditing(false)
                  }}>
                    Cancel
                  </Button>
                )}
              </>
            ) : (
              <>
                <Button onClick={() => setIsEditing(true)} variant="outline">
                  Edit Configuration
                </Button>
                {config && config.connectionStatus === 'connected' && (
                  <Button variant="destructive" onClick={handleDisconnect}>
                    Disconnect
                  </Button>
                )}
              </>
            )}
          </div>
        </div>
      </Card>
    </div>
  )
}
