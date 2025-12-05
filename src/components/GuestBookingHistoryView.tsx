import { useState } from 'react'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  CalendarBlank,
  Bed,
  CurrencyDollar,
  Star,
  Users,
  ForkKnife,
  Sparkle,
  ChartLine,
  ClockCounterClockwise,
  TrendUp,
  Heart,
  Warning,
  CheckCircle
} from '@phosphor-icons/react'
import type { GuestBookingHistory, GuestProfile } from '@/lib/types'
import { formatCurrency, formatDate } from '@/lib/helpers'

interface GuestBookingHistoryViewProps {
  profile: GuestProfile
  bookingHistory: GuestBookingHistory[]
}

export function GuestBookingHistoryView({ profile, bookingHistory }: GuestBookingHistoryViewProps) {
  const [selectedBooking, setSelectedBooking] = useState<GuestBookingHistory | null>(null)

  const sortedHistory = [...bookingHistory].sort((a, b) => b.checkInDate - a.checkInDate)
  
  const calculateStats = () => {
    const totalStays = bookingHistory.filter(b => b.status === 'checked-out').length
    const totalNights = bookingHistory.reduce((sum, b) => sum + b.nights, 0)
    const totalSpent = bookingHistory.reduce((sum, b) => sum + b.totalAmount, 0)
    const avgSpendPerStay = totalStays > 0 ? totalSpent / totalStays : 0
    const totalFnBSpend = bookingHistory.reduce((sum, b) => sum + (b.totalFnBSpend || 0), 0)
    const totalExtraServicesSpend = bookingHistory.reduce((sum, b) => sum + (b.totalExtraServicesSpend || 0), 0)
    
    const roomTypePreferences = bookingHistory.reduce((acc, b) => {
      acc[b.roomType] = (acc[b.roomType] || 0) + 1
      return acc
    }, {} as Record<string, number>)
    
    const mostBookedRoomType = Object.entries(roomTypePreferences).sort((a, b) => b[1] - a[1])[0]
    
    const avgRating = bookingHistory.filter(b => b.rating).reduce((sum, b, _, arr) => {
      return sum + (b.rating || 0) / arr.length
    }, 0)
    
    const totalComplaints = bookingHistory.reduce((sum, b) => sum + (b.complaintsFiled || 0), 0)
    
    return {
      totalStays,
      totalNights,
      totalSpent,
      avgSpendPerStay,
      totalFnBSpend,
      totalExtraServicesSpend,
      mostBookedRoomType: mostBookedRoomType ? mostBookedRoomType[0] : 'N/A',
      avgRating: avgRating || 0,
      totalComplaints
    }
  }

  const stats = calculateStats()

  const getStatusBadge = (status: string) => {
    const variants: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
      'confirmed': 'default',
      'checked-in': 'default',
      'checked-out': 'secondary',
      'cancelled': 'destructive',
      'no-show': 'destructive'
    }
    return (
      <Badge variant={variants[status] || 'outline'} className="capitalize">
        {status.replace('-', ' ')}
      </Badge>
    )
  }

  const extractPreferences = () => {
    const preferences: {
      category: string
      items: { label: string, value: string | number, frequency: number }[]
    }[] = []

    const roomTypes = bookingHistory.reduce((acc, b) => {
      acc[b.roomType] = (acc[b.roomType] || 0) + 1
      return acc
    }, {} as Record<string, number>)

    if (Object.keys(roomTypes).length > 0) {
      preferences.push({
        category: 'Room Type Preferences',
        items: Object.entries(roomTypes).map(([type, count]) => ({
          label: type.replace('-', ' ').toUpperCase(),
          value: `${count} stay${count > 1 ? 's' : ''}`,
          frequency: count
        })).sort((a, b) => b.frequency - a.frequency)
      })
    }

    const services = bookingHistory
      .flatMap(b => b.servicesUsed || [])
      .reduce((acc, service) => {
        acc[service] = (acc[service] || 0) + 1
        return acc
      }, {} as Record<string, number>)

    if (Object.keys(services).length > 0) {
      preferences.push({
        category: 'Services Frequently Used',
        items: Object.entries(services).map(([service, count]) => ({
          label: service,
          value: `${count} time${count > 1 ? 's' : ''}`,
          frequency: count
        })).sort((a, b) => b.frequency - a.frequency).slice(0, 5)
      })
    }

    const sources = bookingHistory.reduce((acc, b) => {
      acc[b.source] = (acc[b.source] || 0) + 1
      return acc
    }, {} as Record<string, number>)

    if (Object.keys(sources).length > 0) {
      preferences.push({
        category: 'Booking Sources',
        items: Object.entries(sources).map(([source, count]) => ({
          label: source,
          value: `${count} booking${count > 1 ? 's' : ''}`,
          frequency: count
        })).sort((a, b) => b.frequency - a.frequency)
      })
    }

    const avgAdults = bookingHistory.reduce((sum, b) => sum + b.adults, 0) / bookingHistory.length
    const avgChildren = bookingHistory.reduce((sum, b) => sum + b.children, 0) / bookingHistory.length

    preferences.push({
      category: 'Travel Patterns',
      items: [
        { label: 'Average Adults', value: avgAdults.toFixed(1), frequency: 1 },
        { label: 'Average Children', value: avgChildren.toFixed(1), frequency: 1 },
        { label: 'Average Stay Duration', value: `${(stats.totalNights / stats.totalStays).toFixed(1)} nights`, frequency: 1 }
      ]
    })

    return preferences
  }

  const preferences = extractPreferences()

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-4 border-l-4 border-l-primary">
          <div className="flex items-center justify-between mb-2">
            <h4 className="text-sm font-medium text-muted-foreground">Total Stays</h4>
            <ClockCounterClockwise size={20} className="text-primary" />
          </div>
          <p className="text-2xl font-semibold">{stats.totalStays}</p>
          <p className="text-xs text-muted-foreground mt-1">{stats.totalNights} total nights</p>
        </Card>

        <Card className="p-4 border-l-4 border-l-success">
          <div className="flex items-center justify-between mb-2">
            <h4 className="text-sm font-medium text-muted-foreground">Total Spent</h4>
            <CurrencyDollar size={20} className="text-success" />
          </div>
          <p className="text-2xl font-semibold">{formatCurrency(stats.totalSpent)}</p>
          <p className="text-xs text-muted-foreground mt-1">
            Avg: {formatCurrency(stats.avgSpendPerStay)} per stay
          </p>
        </Card>

        <Card className="p-4 border-l-4 border-l-accent">
          <div className="flex items-center justify-between mb-2">
            <h4 className="text-sm font-medium text-muted-foreground">Guest Rating</h4>
            <Star size={20} className="text-accent" weight="fill" />
          </div>
          <p className="text-2xl font-semibold">{stats.avgRating.toFixed(1)}/5</p>
          <p className="text-xs text-muted-foreground mt-1">
            {stats.totalComplaints} complaint{stats.totalComplaints !== 1 ? 's' : ''}
          </p>
        </Card>

        <Card className="p-4 border-l-4 border-l-secondary">
          <div className="flex items-center justify-between mb-2">
            <h4 className="text-sm font-medium text-muted-foreground">Preferred Room</h4>
            <Bed size={20} className="text-secondary" />
          </div>
          <p className="text-2xl font-semibold capitalize">{stats.mostBookedRoomType.replace('-', ' ')}</p>
          <p className="text-xs text-muted-foreground mt-1">Most frequently booked</p>
        </Card>
      </div>

      <Tabs defaultValue="history" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="history">
            <ClockCounterClockwise size={16} className="mr-2" />
            Booking History
          </TabsTrigger>
          <TabsTrigger value="preferences">
            <Heart size={16} className="mr-2" />
            Preferences & Patterns
          </TabsTrigger>
        </TabsList>

        <TabsContent value="history" className="space-y-4">
          {sortedHistory.length === 0 ? (
            <Card className="p-8 text-center">
              <ClockCounterClockwise size={48} className="mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No Booking History</h3>
              <p className="text-muted-foreground">
                This guest has no previous stays recorded.
              </p>
            </Card>
          ) : (
            <ScrollArea className="h-[500px] pr-4">
              <div className="space-y-3">
                {sortedHistory.map((booking) => (
                  <Card
                    key={booking.id}
                    className={`p-4 cursor-pointer transition-all hover:shadow-md ${
                      selectedBooking?.id === booking.id ? 'ring-2 ring-primary' : ''
                    }`}
                    onClick={() => setSelectedBooking(selectedBooking?.id === booking.id ? null : booking)}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 space-y-2">
                        <div className="flex items-center gap-3 flex-wrap">
                          <h4 className="font-semibold">
                            {formatDate(booking.checkInDate)} - {formatDate(booking.checkOutDate)}
                          </h4>
                          {getStatusBadge(booking.status)}
                          {booking.rating && (
                            <div className="flex items-center gap-1">
                              <Star size={14} weight="fill" className="text-accent" />
                              <span className="text-sm font-medium">{booking.rating}/5</span>
                            </div>
                          )}
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm">
                          <div className="flex items-center gap-1 text-muted-foreground">
                            <Bed size={14} />
                            <span className="capitalize">{booking.roomType.replace('-', ' ')}</span>
                          </div>
                          {booking.roomNumber && (
                            <div className="flex items-center gap-1 text-muted-foreground">
                              <span className="font-medium">Room {booking.roomNumber}</span>
                            </div>
                          )}
                          <div className="flex items-center gap-1 text-muted-foreground">
                            <Users size={14} />
                            <span>{booking.adults} adult{booking.adults > 1 ? 's' : ''}</span>
                            {booking.children > 0 && <span>, {booking.children} child{booking.children > 1 ? 'ren' : ''}</span>}
                          </div>
                          <div className="flex items-center gap-1 text-muted-foreground">
                            <CalendarBlank size={14} />
                            <span>{booking.nights} night{booking.nights > 1 ? 's' : ''}</span>
                          </div>
                        </div>

                        <div className="flex items-center gap-4 text-sm">
                          <div>
                            <span className="text-muted-foreground">Total:</span>{' '}
                            <span className="font-semibold">{formatCurrency(booking.totalAmount)}</span>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Paid:</span>{' '}
                            <span className="font-semibold text-success">{formatCurrency(booking.amountPaid)}</span>
                          </div>
                          {booking.amountPaid < booking.totalAmount && (
                            <div>
                              <span className="text-muted-foreground">Balance:</span>{' '}
                              <span className="font-semibold text-destructive">
                                {formatCurrency(booking.totalAmount - booking.amountPaid)}
                              </span>
                            </div>
                          )}
                        </div>

                        {selectedBooking?.id === booking.id && (
                          <>
                            <Separator className="my-3" />
                            
                            <div className="space-y-3 text-sm">
                              {booking.source && (
                                <div>
                                  <span className="text-muted-foreground">Booking Source:</span>{' '}
                                  <Badge variant="outline">{booking.source}</Badge>
                                </div>
                              )}

                              {booking.ratePerNight && (
                                <div>
                                  <span className="text-muted-foreground">Rate Per Night:</span>{' '}
                                  <span className="font-medium">{formatCurrency(booking.ratePerNight)}</span>
                                </div>
                              )}

                              {(booking.totalFnBSpend || booking.totalExtraServicesSpend) && (
                                <div className="grid grid-cols-2 gap-2">
                                  {booking.totalFnBSpend && booking.totalFnBSpend > 0 && (
                                    <div>
                                      <div className="flex items-center gap-1 text-muted-foreground mb-1">
                                        <ForkKnife size={14} />
                                        <span>F&B Spend</span>
                                      </div>
                                      <span className="font-medium">{formatCurrency(booking.totalFnBSpend)}</span>
                                    </div>
                                  )}
                                  {booking.totalExtraServicesSpend && booking.totalExtraServicesSpend > 0 && (
                                    <div>
                                      <div className="flex items-center gap-1 text-muted-foreground mb-1">
                                        <Sparkle size={14} />
                                        <span>Extra Services</span>
                                      </div>
                                      <span className="font-medium">{formatCurrency(booking.totalExtraServicesSpend)}</span>
                                    </div>
                                  )}
                                </div>
                              )}

                              {booking.servicesUsed && booking.servicesUsed.length > 0 && (
                                <div>
                                  <div className="text-muted-foreground mb-2">Services Used:</div>
                                  <div className="flex flex-wrap gap-1">
                                    {booking.servicesUsed.map((service, idx) => (
                                      <Badge key={idx} variant="secondary" className="text-xs">
                                        {service}
                                      </Badge>
                                    ))}
                                  </div>
                                </div>
                              )}

                              {booking.specialRequests && (
                                <div>
                                  <div className="text-muted-foreground mb-1">Special Requests:</div>
                                  <p className="text-sm bg-muted p-2 rounded">{booking.specialRequests}</p>
                                </div>
                              )}

                              {booking.feedback && (
                                <div>
                                  <div className="text-muted-foreground mb-1">Guest Feedback:</div>
                                  <p className="text-sm bg-muted p-2 rounded">{booking.feedback}</p>
                                </div>
                              )}

                              {booking.complaintsFiled && booking.complaintsFiled > 0 && (
                                <div className="flex items-center gap-2 text-destructive">
                                  <Warning size={16} weight="fill" />
                                  <span className="font-medium">
                                    {booking.complaintsFiled} complaint{booking.complaintsFiled > 1 ? 's' : ''} filed
                                  </span>
                                </div>
                              )}
                            </div>
                          </>
                        )}
                      </div>

                      <div className="text-xs text-muted-foreground">
                        {formatDate(booking.createdAt)}
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </ScrollArea>
          )}
        </TabsContent>

        <TabsContent value="preferences" className="space-y-4">
          {preferences.length === 0 ? (
            <Card className="p-8 text-center">
              <Heart size={48} className="mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No Preferences Data</h3>
              <p className="text-muted-foreground">
                Not enough booking history to determine preferences.
              </p>
            </Card>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {preferences.map((pref, idx) => (
                <Card key={idx} className="p-4">
                  <h4 className="font-semibold mb-3 flex items-center gap-2">
                    <ChartLine size={18} className="text-primary" />
                    {pref.category}
                  </h4>
                  <div className="space-y-2">
                    {pref.items.map((item, itemIdx) => (
                      <div
                        key={itemIdx}
                        className="flex items-center justify-between p-2 bg-muted/50 rounded"
                      >
                        <span className="font-medium capitalize">{item.label}</span>
                        <span className="text-sm text-muted-foreground">{item.value}</span>
                      </div>
                    ))}
                  </div>
                </Card>
              ))}

              <Card className="p-4 lg:col-span-2">
                <h4 className="font-semibold mb-3 flex items-center gap-2">
                  <TrendUp size={18} className="text-success" />
                  Spending Analysis
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="p-3 bg-muted/50 rounded">
                    <div className="text-sm text-muted-foreground mb-1">Room Revenue</div>
                    <div className="text-xl font-semibold">
                      {formatCurrency(stats.totalSpent - stats.totalFnBSpend - stats.totalExtraServicesSpend)}
                    </div>
                    <div className="text-xs text-muted-foreground mt-1">
                      {((stats.totalSpent - stats.totalFnBSpend - stats.totalExtraServicesSpend) / stats.totalSpent * 100).toFixed(1)}% of total
                    </div>
                  </div>
                  <div className="p-3 bg-muted/50 rounded">
                    <div className="text-sm text-muted-foreground mb-1">F&B Revenue</div>
                    <div className="text-xl font-semibold">{formatCurrency(stats.totalFnBSpend)}</div>
                    <div className="text-xs text-muted-foreground mt-1">
                      {(stats.totalFnBSpend / stats.totalSpent * 100).toFixed(1)}% of total
                    </div>
                  </div>
                  <div className="p-3 bg-muted/50 rounded">
                    <div className="text-sm text-muted-foreground mb-1">Extra Services</div>
                    <div className="text-xl font-semibold">{formatCurrency(stats.totalExtraServicesSpend)}</div>
                    <div className="text-xs text-muted-foreground mt-1">
                      {(stats.totalExtraServicesSpend / stats.totalSpent * 100).toFixed(1)}% of total
                    </div>
                  </div>
                </div>
              </Card>

              {profile.dietaryRestrictions && profile.dietaryRestrictions.length > 0 && (
                <Card className="p-4">
                  <h4 className="font-semibold mb-3">Dietary Restrictions</h4>
                  <div className="flex flex-wrap gap-1">
                    {profile.dietaryRestrictions.map((restriction, idx) => (
                      <Badge key={idx} variant="outline">
                        {restriction}
                      </Badge>
                    ))}
                  </div>
                </Card>
              )}

              {profile.allergies && profile.allergies.length > 0 && (
                <Card className="p-4">
                  <h4 className="font-semibold mb-3 flex items-center gap-2">
                    <Warning size={18} className="text-destructive" />
                    Allergies
                  </h4>
                  <div className="flex flex-wrap gap-1">
                    {profile.allergies.map((allergy, idx) => (
                      <Badge key={idx} variant="destructive">
                        {allergy}
                      </Badge>
                    ))}
                  </div>
                </Card>
              )}

              {profile.specialRequests && profile.specialRequests.length > 0 && (
                <Card className="p-4 lg:col-span-2">
                  <h4 className="font-semibold mb-3">Recurring Special Requests</h4>
                  <div className="flex flex-wrap gap-2">
                    {profile.specialRequests.map((request, idx) => (
                      <Badge key={idx} variant="secondary">
                        <CheckCircle size={14} className="mr-1" />
                        {request}
                      </Badge>
                    ))}
                  </div>
                </Card>
              )}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
