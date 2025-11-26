import { useState } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { 
  CurrencyDollar, 
  Calendar as CalendarIcon,
  Plus,
  TrendUp,
  Buildings,
  Percent,
  Users,
  ChartLine
} from '@phosphor-icons/react'
import type { 
  RoomTypeConfig,
  RatePlanConfig,
  Season,
  EventDay,
  CorporateAccount,
  RateCalendar,
  SystemUser
} from '@/lib/types'

interface RevenueManagementProps {
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
}

export function RevenueManagement({
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
  currentUser
}: RevenueManagementProps) {
  const [activeTab, setActiveTab] = useState('overview')

  const stats = {
    activeRoomTypes: roomTypes.filter(rt => rt.isActive).length,
    totalRoomTypes: roomTypes.length,
    activeRatePlans: ratePlans.filter(rp => rp.isActive).length,
    totalRatePlans: ratePlans.length,
    parentRatePlans: ratePlans.filter(rp => rp.isParent).length,
    derivedRatePlans: ratePlans.filter(rp => !rp.isParent && rp.parentRatePlanId).length,
    activeSeasons: seasons.filter(s => s.isActive).length,
    upcomingEvents: eventDays.filter(e => e.date > Date.now()).length,
    corporateAccounts: corporateAccounts.filter(ca => ca.isActive).length,
    avgRoomRate: roomTypes.length > 0 
      ? roomTypes.reduce((sum, rt) => sum + rt.baseRate, 0) / roomTypes.length 
      : 0
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-semibold">Revenue Management</h1>
          <p className="text-muted-foreground mt-1">
            Comprehensive rate planning and yield management
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <ChartLine size={18} className="mr-2" />
            Analytics
          </Button>
          <Button>
            <Plus size={18} className="mr-2" />
            Quick Setup
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-4 border-l-4 border-l-primary">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-muted-foreground">Room Types</h3>
            <Buildings size={18} className="text-primary" />
          </div>
          <div className="space-y-1">
            <p className="text-2xl font-semibold">{stats.activeRoomTypes}</p>
            <p className="text-xs text-muted-foreground">
              {stats.totalRoomTypes} total configured
            </p>
          </div>
        </Card>

        <Card className="p-4 border-l-4 border-l-accent">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-muted-foreground">Rate Plans</h3>
            <CurrencyDollar size={18} className="text-accent" />
          </div>
          <div className="space-y-1">
            <p className="text-2xl font-semibold">{stats.activeRatePlans}</p>
            <p className="text-xs text-muted-foreground">
              {stats.parentRatePlans} parent, {stats.derivedRatePlans} derived
            </p>
          </div>
        </Card>

        <Card className="p-4 border-l-4 border-l-success">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-muted-foreground">Avg Room Rate</h3>
            <TrendUp size={18} className="text-success" />
          </div>
          <div className="space-y-1">
            <p className="text-2xl font-semibold">
              ${stats.avgRoomRate.toFixed(2)}
            </p>
            <p className="text-xs text-muted-foreground">
              Across all room types
            </p>
          </div>
        </Card>

        <Card className="p-4 border-l-4 border-l-destructive">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-muted-foreground">Corporate Accounts</h3>
            <Users size={18} className="text-destructive" />
          </div>
          <div className="space-y-1">
            <p className="text-2xl font-semibold">{stats.corporateAccounts}</p>
            <p className="text-xs text-muted-foreground">
              Active negotiated rates
            </p>
          </div>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="room-types">Room Types</TabsTrigger>
          <TabsTrigger value="rate-plans">Rate Plans</TabsTrigger>
          <TabsTrigger value="calendar">Rate Calendar</TabsTrigger>
          <TabsTrigger value="seasons">Seasons & Events</TabsTrigger>
          <TabsTrigger value="corporate">Corporate</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <Card className="p-6">
            <h2 className="text-2xl font-semibold mb-4">Revenue Management Overview</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Quick Stats</h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center p-3 bg-muted/50 rounded-lg">
                    <span className="text-sm">Active Seasons</span>
                    <Badge>{stats.activeSeasons}</Badge>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-muted/50 rounded-lg">
                    <span className="text-sm">Upcoming Events</span>
                    <Badge variant="secondary">{stats.upcomingEvents}</Badge>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-muted/50 rounded-lg">
                    <span className="text-sm">Rate Calendar Entries</span>
                    <Badge variant="outline">{rateCalendar.length}</Badge>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-lg font-medium">Rate Plan Hierarchy</h3>
                <div className="space-y-2">
                  {ratePlans.filter(rp => rp.isParent).slice(0, 5).map(rp => (
                    <div key={rp.id} className="p-3 border rounded-lg">
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-medium">{rp.name}</span>
                        <Badge variant="outline">{rp.type}</Badge>
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {ratePlans.filter(child => child.parentRatePlanId === rp.id).length} derived plans
                      </div>
                    </div>
                  ))}
                  {ratePlans.filter(rp => rp.isParent).length === 0 && (
                    <p className="text-sm text-muted-foreground text-center py-8">
                      No parent rate plans configured yet
                    </p>
                  )}
                </div>
              </div>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="room-types">
          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-semibold">Room Type Configuration</h2>
              <Button>
                <Plus size={18} className="mr-2" />
                Add Room Type
              </Button>
            </div>
            <p className="text-sm text-muted-foreground mb-6">
              Configure room types with bedding, views, amenities, and base rates
            </p>
            {roomTypes.length === 0 ? (
              <div className="text-center py-12">
                <Buildings size={48} className="mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">No room types configured</p>
                <Button className="mt-4">Create First Room Type</Button>
              </div>
            ) : (
              <div className="space-y-3">
                {roomTypes.map(rt => (
                  <div key={rt.id} className="p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="font-semibold">{rt.name}</h3>
                          <Badge variant="outline">{rt.code}</Badge>
                          {!rt.isActive && <Badge variant="destructive">Inactive</Badge>}
                        </div>
                        <p className="text-sm text-muted-foreground mb-2">{rt.description}</p>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                          <div>
                            <span className="text-muted-foreground">Base Rate:</span>
                            <span className="ml-2 font-medium">${rt.baseRate}</span>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Rack Rate:</span>
                            <span className="ml-2 font-medium">${rt.rackRate}</span>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Occupancy:</span>
                            <span className="ml-2 font-medium">{rt.baseOccupancy}/{rt.maxOccupancy}</span>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Size:</span>
                            <span className="ml-2 font-medium">{rt.size || 'N/A'} sqm</span>
                          </div>
                        </div>
                        <div className="mt-2 flex gap-2 flex-wrap">
                          {rt.bedding.map((bed, idx) => (
                            <Badge key={idx} variant="secondary" className="capitalize">
                              {bed.replace('-', ' ')}
                            </Badge>
                          ))}
                          {rt.viewTypes.map((view, idx) => (
                            <Badge key={idx} variant="outline" className="capitalize">
                              {view.replace('-', ' ')} view
                            </Badge>
                          ))}
                        </div>
                      </div>
                      <Button variant="outline" size="sm">Edit</Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </TabsContent>

        <TabsContent value="rate-plans">
          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-semibold">Rate Plan Hierarchy</h2>
              <Button>
                <Plus size={18} className="mr-2" />
                Create Rate Plan
              </Button>
            </div>
            <p className="text-sm text-muted-foreground mb-6">
              Manage parent and derived rate plans with formulas and restrictions
            </p>
            {ratePlans.length === 0 ? (
              <div className="text-center py-12">
                <Percent size={48} className="mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">No rate plans configured</p>
                <Button className="mt-4">Create First Rate Plan</Button>
              </div>
            ) : (
              <div className="space-y-4">
                {ratePlans.filter(rp => rp.isParent).map(parent => (
                  <div key={parent.id} className="border rounded-lg">
                    <div className="p-4 bg-muted/30">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-1">
                            <h3 className="font-semibold">{parent.name}</h3>
                            <Badge>{parent.type}</Badge>
                            {parent.mealPlan && (
                              <Badge variant="outline" className="uppercase">
                                {parent.mealPlan}
                              </Badge>
                            )}
                            {!parent.isActive && <Badge variant="destructive">Inactive</Badge>}
                          </div>
                          <p className="text-sm text-muted-foreground">{parent.description}</p>
                          {parent.baseRate && (
                            <p className="text-sm mt-1">
                              <span className="text-muted-foreground">Base Rate:</span>
                              <span className="ml-2 font-medium">${parent.baseRate}</span>
                            </p>
                          )}
                        </div>
                        <Button variant="outline" size="sm">Edit</Button>
                      </div>
                    </div>
                    
                    <div className="p-4 space-y-2">
                      {ratePlans
                        .filter(child => child.parentRatePlanId === parent.id)
                        .map(child => (
                          <div key={child.id} className="pl-4 py-2 border-l-2 border-accent/30 hover:bg-muted/50 rounded">
                            <div className="flex items-center justify-between">
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                  <span className="font-medium text-sm">{child.name}</span>
                                  {child.derivedRateConfig && (
                                    <Badge variant="secondary" className="text-xs">
                                      {child.derivedRateConfig.derivedType === 'percentage-discount' && 
                                        `-${child.derivedRateConfig.value}%`}
                                      {child.derivedRateConfig.derivedType === 'percentage-markup' && 
                                        `+${child.derivedRateConfig.value}%`}
                                      {child.derivedRateConfig.derivedType === 'fixed-discount' && 
                                        `-$${child.derivedRateConfig.value}`}
                                      {child.derivedRateConfig.derivedType === 'fixed-markup' && 
                                        `+$${child.derivedRateConfig.value}`}
                                    </Badge>
                                  )}
                                </div>
                                <p className="text-xs text-muted-foreground">{child.description}</p>
                              </div>
                              <Button variant="ghost" size="sm">Edit</Button>
                            </div>
                          </div>
                        ))}
                      {ratePlans.filter(child => child.parentRatePlanId === parent.id).length === 0 && (
                        <p className="text-xs text-muted-foreground text-center py-2">
                          No derived plans
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </TabsContent>

        <TabsContent value="calendar">
          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-semibold">Rate Calendar</h2>
              <div className="flex gap-2">
                <Button variant="outline">
                  <CalendarIcon size={18} className="mr-2" />
                  Bulk Update
                </Button>
                <Button>
                  <Plus size={18} className="mr-2" />
                  Add Override
                </Button>
              </div>
            </div>
            <p className="text-sm text-muted-foreground mb-6">
              Manage daily rates, restrictions, and availability across all room types
            </p>
            <div className="text-center py-12">
              <CalendarIcon size={48} className="mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground mb-2">Rate Calendar View</p>
              <p className="text-sm text-muted-foreground">
                Interactive calendar with drag-drop rate updates coming soon
              </p>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="seasons">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold">Seasons</h2>
                <Button size="sm">
                  <Plus size={18} className="mr-2" />
                  Add Season
                </Button>
              </div>
              {seasons.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-sm text-muted-foreground">No seasons configured</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {seasons.map(season => (
                    <div key={season.id} className="p-3 border rounded-lg">
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-medium">{season.name}</span>
                        <div className="flex items-center gap-2">
                          <Badge className="capitalize">{season.type}</Badge>
                          <Badge variant="secondary">{season.rateMultiplier}x</Badge>
                        </div>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {new Date(season.startDate).toLocaleDateString()} - {new Date(season.endDate).toLocaleDateString()}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </Card>

            <Card className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold">Special Events</h2>
                <Button size="sm">
                  <Plus size={18} className="mr-2" />
                  Add Event
                </Button>
              </div>
              {eventDays.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-sm text-muted-foreground">No special events configured</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {eventDays.map(event => (
                    <div key={event.id} className="p-3 border rounded-lg">
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-medium">{event.name}</span>
                        <Badge variant="destructive">{event.rateMultiplier}x</Badge>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {new Date(event.date).toLocaleDateString()}
                      </p>
                      {event.minimumStay && (
                        <p className="text-xs text-muted-foreground">
                          Min stay: {event.minimumStay} nights
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="corporate">
          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-semibold">Corporate Accounts</h2>
              <Button>
                <Plus size={18} className="mr-2" />
                Add Corporate Account
              </Button>
            </div>
            <p className="text-sm text-muted-foreground mb-6">
              Manage negotiated corporate rates and contracts
            </p>
            {corporateAccounts.length === 0 ? (
              <div className="text-center py-12">
                <Users size={48} className="mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">No corporate accounts configured</p>
                <Button className="mt-4">Add First Corporate Account</Button>
              </div>
            ) : (
              <div className="space-y-3">
                {corporateAccounts.map(corp => (
                  <div key={corp.id} className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-1">
                          <h3 className="font-semibold">{corp.companyName}</h3>
                          <Badge variant="outline">{corp.code}</Badge>
                          {!corp.isActive && <Badge variant="destructive">Inactive</Badge>}
                        </div>
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <span className="text-muted-foreground">Contact:</span>
                            <span className="ml-2">{corp.contactPerson}</span>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Email:</span>
                            <span className="ml-2">{corp.email}</span>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Negotiated Rates:</span>
                            <span className="ml-2 font-medium">{corp.negotiatedRates.length}</span>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Room Allotment:</span>
                            <span className="ml-2 font-medium">{corp.roomAllotment || 'N/A'}</span>
                          </div>
                        </div>
                      </div>
                      <Button variant="outline" size="sm">Edit</Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
