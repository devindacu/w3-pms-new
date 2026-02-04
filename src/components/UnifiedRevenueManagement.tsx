/**
 * Unified Revenue Management Component
 * Combines Room & Revenue Management with Advanced Revenue Management System
 */

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  Buildings, 
  TrendUp, 
  Brain,
  CurrencyDollar,
  Calendar as CalendarIcon,
  ChartLine
} from '@phosphor-icons/react'
import { RoomRevenueManagement } from '@/components/RoomRevenueManagement'
import { RevenueManagementSystem } from '@/components/RevenueManagementSystem'
import type { 
  Room,
  RoomTypeConfig,
  RatePlanConfig,
  Season,
  EventDay,
  CorporateAccount,
  RateCalendar,
  SystemUser,
  Reservation,
  GuestInvoice
} from '@/lib/types'

interface UnifiedRevenueManagementProps {
  // Room Revenue Management props
  rooms: Room[]
  setRooms: (rooms: Room[] | ((prev: Room[]) => Room[])) => void
  roomTypes: RoomTypeConfig[]
  setRoomTypes: (roomTypes: RoomTypeConfig[] | ((current: RoomTypeConfig[]) => RoomTypeConfig[])) => void
  ratePlans: RatePlanConfig[]
  setRatePlans: (ratePlans: RatePlanConfig[] | ((current: RatePlanConfig[]) => RatePlanConfig[])) => void
  seasons: Season[]
  setSeasons: (seasons: Season[] | ((current: Season[]) => Season[])) => void
  eventDays: EventDay[]
  setEventDays: (eventDays: EventDay[] | ((current: EventDay[]) => EventDay[])) => void
  corporateAccounts: CorporateAccount[]
  setCorporateAccounts: (accounts: CorporateAccount[] | ((current: CorporateAccount[]) => CorporateAccount[])) => void
  rateCalendar: RateCalendar[]
  setRateCalendar: (calendar: RateCalendar[] | ((current: RateCalendar[]) => RateCalendar[])) => void
  currentUser: SystemUser
  reservations?: Reservation[]
  invoices?: GuestInvoice[]
}

export function UnifiedRevenueManagement({
  rooms,
  setRooms,
  roomTypes,
  setRoomTypes,
  ratePlans,
  setRatePlans,
  seasons,
  setSeasons,
  eventDays,
  setEventDays,
  corporateAccounts,
  setCorporateAccounts,
  rateCalendar,
  setRateCalendar,
  currentUser,
  reservations = [],
  invoices = []
}: UnifiedRevenueManagementProps) {
  const [activeSection, setActiveSection] = useState<'room-revenue' | 'advanced-revenue'>('room-revenue')

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Revenue Management</h1>
        <p className="text-muted-foreground mt-1">
          Comprehensive revenue optimization and room management
        </p>
      </div>

      <Tabs value={activeSection} onValueChange={(v) => setActiveSection(v as any)} className="space-y-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="room-revenue" className="flex items-center gap-2">
            <Buildings size={18} />
            <span>Room & Revenue Setup</span>
          </TabsTrigger>
          <TabsTrigger value="advanced-revenue" className="flex items-center gap-2">
            <TrendUp size={18} />
            <span>Advanced Analytics & Pricing</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="room-revenue" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Buildings size={20} />
                Room Types, Rates & Revenue Configuration
              </CardTitle>
              <CardDescription>
                Manage room inventory, pricing strategies, seasons, corporate accounts, and rate calendar
              </CardDescription>
            </CardHeader>
            <CardContent>
              <RoomRevenueManagement
                rooms={rooms}
                setRooms={setRooms}
                roomTypes={roomTypes}
                setRoomTypes={setRoomTypes}
                ratePlans={ratePlans}
                setRatePlans={setRatePlans}
                seasons={seasons}
                setSeasons={setSeasons}
                eventDays={eventDays}
                setEventDays={setEventDays}
                corporateAccounts={corporateAccounts}
                setCorporateAccounts={setCorporateAccounts}
                rateCalendar={rateCalendar}
                setRateCalendar={setRateCalendar}
                currentUser={currentUser}
                reservations={reservations}
                invoices={invoices}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="advanced-revenue" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Brain size={20} />
                Advanced Revenue Analytics & Dynamic Pricing
              </CardTitle>
              <CardDescription>
                AI-powered pricing recommendations, revenue forecasting, and optimization strategies
              </CardDescription>
            </CardHeader>
            <CardContent>
              <RevenueManagementSystem />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <Card className="border-dashed">
        <CardContent className="pt-6">
          <div className="grid gap-4 md:grid-cols-3">
            <div className="flex items-center gap-3">
              <div className="rounded-full bg-primary/10 p-3">
                <Buildings className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-sm font-medium">Room Management</p>
                <p className="text-xs text-muted-foreground">
                  Configure room types, rates & inventory
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="rounded-full bg-primary/10 p-3">
                <Brain className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-sm font-medium">AI Pricing</p>
                <p className="text-xs text-muted-foreground">
                  Dynamic pricing & recommendations
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="rounded-full bg-primary/10 p-3">
                <ChartLine className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-sm font-medium">Revenue Analytics</p>
                <p className="text-xs text-muted-foreground">
                  Forecasting & optimization strategies
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
