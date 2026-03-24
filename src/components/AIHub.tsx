import { useState } from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { AIForecastingDashboard } from '@/components/AIForecastingDashboard'
import { AIReviewReplyGenerator } from '@/components/AIReviewReplyGenerator'
import { AIGuestMessaging } from '@/components/AIGuestMessaging'
import { AIUpsellingEngine } from '@/components/AIUpsellingEngine'
import type { Reservation } from '@/lib/types'
import {
  Brain,
  ChartLine,
  Star,
  ChatCircleText,
  ShoppingCart,
} from '@phosphor-icons/react'

interface AIHubProps {
  reservations: Reservation[]
  branding?: { hotelName?: string } | null
  initialTab?: string
}

export function AIHub({ reservations, branding, initialTab }: AIHubProps) {
  const [activeTab, setActiveTab] = useState(initialTab ?? 'forecasting')

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-semibold flex items-center gap-3">
          <Brain size={32} weight="duotone" className="text-violet-500" />
          AI Intelligence Hub
        </h1>
        <p className="text-muted-foreground mt-1">
          AI-powered features to optimise revenue, engage guests, and drive growth
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="flex flex-wrap h-auto gap-1">
          <TabsTrigger value="forecasting" className="gap-2">
            <ChartLine size={16} />
            <span className="hidden sm:inline">Demand Forecasting</span>
          </TabsTrigger>
          <TabsTrigger value="review-replies" className="gap-2">
            <Star size={16} />
            <span className="hidden sm:inline">Review Replies</span>
          </TabsTrigger>
          <TabsTrigger value="guest-messaging" className="gap-2">
            <ChatCircleText size={16} />
            <span className="hidden sm:inline">Guest Messaging</span>
          </TabsTrigger>
          <TabsTrigger value="upselling" className="gap-2">
            <ShoppingCart size={16} />
            <span className="hidden sm:inline">Upselling Engine</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="forecasting" className="mt-6">
          <AIForecastingDashboard reservations={reservations} branding={branding} />
        </TabsContent>

        <TabsContent value="review-replies" className="mt-6">
          <AIReviewReplyGenerator branding={branding} />
        </TabsContent>

        <TabsContent value="guest-messaging" className="mt-6">
          <AIGuestMessaging branding={branding} />
        </TabsContent>

        <TabsContent value="upselling" className="mt-6">
          <AIUpsellingEngine reservations={reservations} branding={branding} />
        </TabsContent>
      </Tabs>
    </div>
  )
}
