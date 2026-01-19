import { useState } from 'react'
import { Card } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { BrandingSettings } from '@/components/BrandingSettings'
import { SystemSettings } from '@/components/SystemSettings'
import { TaxSettings } from '@/components/TaxSettings'
import { UserPreferences } from '@/components/UserPreferences'
import { EmailTemplateManagement } from '@/components/EmailTemplateSettings'
import { DialogSettings } from '@/components/DialogSettings'
import { TestEmailTemplate } from '@/components/TestEmailTemplate'
import { BackupManagement } from '@/components/BackupManagement'
import { GoogleAnalyticsSettings } from '@/components/GoogleAnalyticsSettings'
import { SyncTestingPanel } from '@/components/SyncTestingPanel'
import { GitHubSyncSettings } from '@/components/GitHubSyncSettings'
import { HotelDataBackupSettings } from '@/components/HotelDataBackupSettings'
import type { 
  HotelBranding, 
  TaxConfiguration, 
  ServiceChargeConfiguration, 
  SystemUser
} from '@/lib/types'
import type { EmailTemplate } from '@/lib/invoiceEmailTemplates'
import { 
  Palette,
  Gear,
  Receipt,
  User,
  EnvelopeSimple,
  FrameCorners,
  FloppyDisk,
  Globe,
  ArrowsClockwise,
  GithubLogo
} from '@phosphor-icons/react'

interface SettingsProps {
  branding: HotelBranding | null
  setBranding: (update: (current: HotelBranding | null) => HotelBranding) => void
  taxes: TaxConfiguration[]
  setTaxes: (update: (current: TaxConfiguration[]) => TaxConfiguration[]) => void
  serviceCharge: ServiceChargeConfiguration | null
  setServiceCharge: (update: (current: ServiceChargeConfiguration | null) => ServiceChargeConfiguration) => void
  emailTemplates: EmailTemplate[]
  setEmailTemplates: (update: (current: EmailTemplate[]) => EmailTemplate[]) => void
  emailAnalytics: any[]
  campaignAnalytics: any[]
  emailRecords: any[]
  currentUser: SystemUser
  activeTab?: string
}

export function Settings({
  branding,
  setBranding,
  taxes,
  setTaxes,
  serviceCharge,
  setServiceCharge,
  emailTemplates,
  setEmailTemplates,
  emailAnalytics,
  campaignAnalytics,
  emailRecords,
  currentUser,
  activeTab: initialActiveTab
}: SettingsProps) {
  const [activeTab, setActiveTab] = useState(initialActiveTab || 'branding')

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl md:text-4xl font-semibold">Settings</h1>
        <p className="text-muted-foreground mt-1">Configure hotel branding, system preferences, and tax settings</p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3 lg:grid-cols-11 gap-1">
          <TabsTrigger value="branding" className="gap-2">
            <Palette size={18} />
            <span className="hidden sm:inline">Branding</span>
          </TabsTrigger>
          <TabsTrigger value="system" className="gap-2">
            <Gear size={18} />
            <span className="hidden sm:inline">System</span>
          </TabsTrigger>
          <TabsTrigger value="dialogs" className="gap-2">
            <FrameCorners size={18} />
            <span className="hidden sm:inline">Dialogs</span>
          </TabsTrigger>
          <TabsTrigger value="tax" className="gap-2">
            <Receipt size={18} />
            <span className="hidden sm:inline">Tax & Charges</span>
          </TabsTrigger>
          <TabsTrigger value="email-templates" className="gap-2">
            <EnvelopeSimple size={18} />
            <span className="hidden sm:inline">Templates</span>
          </TabsTrigger>
          <TabsTrigger value="google-analytics" className="gap-2">
            <Globe size={18} />
            <span className="hidden sm:inline">Google Analytics</span>
          </TabsTrigger>
          <TabsTrigger value="version-control" className="gap-2">
            <FloppyDisk size={18} />
            <span className="hidden sm:inline">Backups</span>
          </TabsTrigger>
          <TabsTrigger value="hotel-backup" className="gap-2">
            <FloppyDisk size={18} />
            <span className="hidden sm:inline">Hotel Backup</span>
          </TabsTrigger>
          <TabsTrigger value="github-sync" className="gap-2">
            <GithubLogo size={18} />
            <span className="hidden sm:inline">GitHub Sync</span>
          </TabsTrigger>
          <TabsTrigger value="sync-testing" className="gap-2">
            <ArrowsClockwise size={18} />
            <span className="hidden sm:inline">Sync Testing</span>
          </TabsTrigger>
          <TabsTrigger value="preferences" className="gap-2">
            <User size={18} />
            <span className="hidden sm:inline">Preferences</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="branding" className="mt-6">
          <BrandingSettings
            branding={branding}
            setBranding={setBranding}
            currentUser={currentUser}
          />
        </TabsContent>

        <TabsContent value="system" className="mt-6">
          <SystemSettings
            branding={branding}
            setBranding={setBranding}
            currentUser={currentUser}
          />
        </TabsContent>

        <TabsContent value="dialogs" className="mt-6">
          <DialogSettings />
        </TabsContent>

        <TabsContent value="tax" className="mt-6">
          <TaxSettings
            taxes={taxes}
            setTaxes={setTaxes}
            serviceCharge={serviceCharge}
            setServiceCharge={setServiceCharge}
            currentUser={currentUser}
          />
        </TabsContent>

        <TabsContent value="email-templates" className="mt-6">
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-semibold">Email Templates</h2>
                <p className="text-sm text-muted-foreground mt-1">
                  Create and customize email templates for guest communications
                </p>
              </div>
              <TestEmailTemplate 
                templates={emailTemplates}
                branding={branding}
              />
            </div>
            
            <EmailTemplateManagement 
              templates={emailTemplates}
              setTemplates={setEmailTemplates}
              branding={branding}
              currentUser={currentUser}
            />
          </div>
        </TabsContent>

        <TabsContent value="google-analytics" className="mt-6">
          <GoogleAnalyticsSettings currentUser={currentUser} />
        </TabsContent>

        <TabsContent value="version-control" className="mt-6">
          <BackupManagement currentUser={currentUser} />
        </TabsContent>

        <TabsContent value="github-sync" className="mt-6">
          <GitHubSyncSettings />
        </TabsContent>

        <TabsContent value="hotel-backup" className="mt-6">
          <HotelDataBackupSettings />
        </TabsContent>

        <TabsContent value="sync-testing" className="mt-6">
          <SyncTestingPanel />
        </TabsContent>

        <TabsContent value="preferences" className="mt-6">
          <UserPreferences currentUser={currentUser} />
        </TabsContent>
      </Tabs>
    </div>
  )
}
