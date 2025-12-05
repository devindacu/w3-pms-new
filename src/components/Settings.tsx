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
  FrameCorners
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
  currentUser
}: SettingsProps) {
  const [activeTab, setActiveTab] = useState('branding')

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl md:text-4xl font-semibold">Settings</h1>
        <p className="text-muted-foreground mt-1">Configure hotel branding, system preferences, and tax settings</p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4 lg:grid-cols-7 gap-1">
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
          <EmailTemplateManagement 
            templates={emailTemplates}
            setTemplates={setEmailTemplates}
            branding={branding}
            currentUser={currentUser}
          />
        </TabsContent>

        <TabsContent value="email-analytics" className="mt-6">
          <EmailTemplateAnalyticsComponent
            templateAnalytics={emailAnalytics}
            campaignAnalytics={campaignAnalytics}
            emailRecords={emailRecords}
          />
        </TabsContent>

        <TabsContent value="preferences" className="mt-6">
          <UserPreferences currentUser={currentUser} />
        </TabsContent>
      </Tabs>
    </div>
  )
}
