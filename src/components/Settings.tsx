import { useState } from 'react'
import { Card } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { BrandingSettings } from '@/components/BrandingSettings'
import { SystemSettings } from '@/components/SystemSettings'
import { TaxSettings } from '@/components/TaxSettings'
import { UserPreferences } from '@/components/UserPreferences'
import { EmailTemplateManagement } from '@/components/EmailTemplateSettings'
import { EmailTemplateAnalyticsComponent } from '@/components/EmailTemplateAnalytics'
import { DialogSettings } from '@/components/DialogSettings'
import { TestEmailTemplate } from '@/components/TestEmailTemplate'
import { NavigationInsights } from '@/components/NavigationInsights'
import type { 
  HotelBranding, 
  TaxConfiguration, 
  ServiceChargeConfiguration, 
  SystemUser,
  EmailTemplateAnalytics,
  EmailSentRecord,
  EmailCampaignAnalytics
} from '@/lib/types'
import type { EmailTemplate } from '@/lib/invoiceEmailTemplates'
import { 
  Palette,
  Gear,
  Receipt,
  User,
  EnvelopeSimple,
  ChartBar,
  FrameCorners,
  Sparkle
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
  emailAnalytics: EmailTemplateAnalytics[]
  campaignAnalytics: EmailCampaignAnalytics[]
  emailRecords: EmailSentRecord[]
  currentUser: SystemUser
  navigationInsights?: {
    mostVisited: Array<{ module: string; count: number }>
    commonPatterns: any[]
    timeBasedPreferences: Record<string, string[]>
  }
  onClearNavigationHistory?: () => void
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
  navigationInsights,
  onClearNavigationHistory
}: SettingsProps) {
  const [activeTab, setActiveTab] = useState('branding')

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl md:text-4xl font-semibold">Settings</h1>
        <p className="text-muted-foreground mt-1">Configure hotel branding, system preferences, and tax settings</p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4 lg:grid-cols-8 gap-1">
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
          <TabsTrigger value="email-analytics" className="gap-2">
            <ChartBar size={18} />
            <span className="hidden sm:inline">Analytics</span>
          </TabsTrigger>
          <TabsTrigger value="navigation" className="gap-2">
            <Sparkle size={18} />
            <span className="hidden sm:inline">Navigation AI</span>
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

        <TabsContent value="email-analytics" className="mt-6">
          <EmailTemplateAnalyticsComponent
            templateAnalytics={emailAnalytics}
            campaignAnalytics={campaignAnalytics}
            emailRecords={emailRecords}
          />
        </TabsContent>

        <TabsContent value="navigation" className="mt-6">
          {navigationInsights && onClearNavigationHistory ? (
            <NavigationInsights
              mostVisited={navigationInsights.mostVisited}
              commonPatterns={navigationInsights.commonPatterns}
              timeBasedPreferences={navigationInsights.timeBasedPreferences}
              onClearHistory={onClearNavigationHistory}
            />
          ) : (
            <Card className="p-8 text-center">
              <Sparkle size={48} className="mx-auto mb-4 text-muted-foreground opacity-50" />
              <h3 className="text-lg font-semibold mb-2">Navigation Insights Unavailable</h3>
              <p className="text-sm text-muted-foreground">
                Navigation pattern data is not available at this time.
              </p>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="preferences" className="mt-6">
          <UserPreferences currentUser={currentUser} />
        </TabsContent>
      </Tabs>
    </div>
  )
}
