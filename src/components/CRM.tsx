import { useState } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import {
  Users,
  Star,
  Envelope,
  ChatCircle,
  TrendUp,
  Gift,
  MagnifyingGlass,
  Plus,
  Warning,
  ThumbsUp,
  Megaphone
} from '@phosphor-icons/react'
import type {
  GuestProfile,
  MarketingCampaign,
  MarketingTemplate,
  GuestComplaint,
  GuestFeedback,
  UpsellOffer,
  UpsellTransaction,
  LoyaltyTransaction
} from '@/lib/types'
import { GuestProfileDialog } from '@/components/GuestProfileDialog'
import { ComplaintDialog } from '@/components/ComplaintDialog'
import { FeedbackDialog } from '@/components/FeedbackDialog'
import { MarketingCampaignDialog } from '@/components/MarketingCampaignDialog'
import { MarketingTemplateDialog } from '@/components/MarketingTemplateDialog'
import { UpsellOfferDialog } from '@/components/UpsellOfferDialog'
import { UpsellTransactionDialog } from '@/components/UpsellTransactionDialog'
import { formatCurrency, formatDate } from '@/lib/helpers'
import { toast } from 'sonner'

interface CRMProps {
  guestProfiles: GuestProfile[]
  setGuestProfiles: (profiles: GuestProfile[] | ((prev: GuestProfile[]) => GuestProfile[])) => void
  complaints: GuestComplaint[]
  setComplaints: (complaints: GuestComplaint[] | ((prev: GuestComplaint[]) => GuestComplaint[])) => void
  feedback: GuestFeedback[]
  setFeedback: (feedback: GuestFeedback[] | ((prev: GuestFeedback[]) => GuestFeedback[])) => void
  campaigns: MarketingCampaign[]
  setCampaigns: (campaigns: MarketingCampaign[] | ((prev: MarketingCampaign[]) => MarketingCampaign[])) => void
  templates: MarketingTemplate[]
  setTemplates: (templates: MarketingTemplate[] | ((prev: MarketingTemplate[]) => MarketingTemplate[])) => void
  upsellOffers: UpsellOffer[]
  setUpsellOffers: (offers: UpsellOffer[] | ((prev: UpsellOffer[]) => UpsellOffer[])) => void
  upsellTransactions: UpsellTransaction[]
  setUpsellTransactions: (transactions: UpsellTransaction[] | ((prev: UpsellTransaction[]) => UpsellTransaction[])) => void
  loyaltyTransactions: LoyaltyTransaction[]
  setLoyaltyTransactions: (transactions: LoyaltyTransaction[] | ((prev: LoyaltyTransaction[]) => LoyaltyTransaction[])) => void
}

export function CRM({
  guestProfiles,
  setGuestProfiles,
  complaints,
  setComplaints,
  feedback,
  setFeedback,
  campaigns,
  setCampaigns,
  templates,
  setTemplates,
  upsellOffers,
  setUpsellOffers,
  upsellTransactions,
  setUpsellTransactions,
  loyaltyTransactions,
  setLoyaltyTransactions
}: CRMProps) {
  const [currentTab, setCurrentTab] = useState('guests')
  const [guestDialogOpen, setGuestDialogOpen] = useState(false)
  const [selectedGuest, setSelectedGuest] = useState<GuestProfile | undefined>()
  const [complaintDialogOpen, setComplaintDialogOpen] = useState(false)
  const [selectedComplaint, setSelectedComplaint] = useState<GuestComplaint | undefined>()
  const [feedbackDialogOpen, setFeedbackDialogOpen] = useState(false)
  const [selectedFeedback, setSelectedFeedback] = useState<GuestFeedback | undefined>()
  const [campaignDialogOpen, setCampaignDialogOpen] = useState(false)
  const [selectedCampaign, setSelectedCampaign] = useState<MarketingCampaign | undefined>()
  const [templateDialogOpen, setTemplateDialogOpen] = useState(false)
  const [selectedTemplate, setSelectedTemplate] = useState<MarketingTemplate | undefined>()
  const [upsellOfferDialogOpen, setUpsellOfferDialogOpen] = useState(false)
  const [selectedOffer, setSelectedOffer] = useState<UpsellOffer | undefined>()
  const [upsellTransactionDialogOpen, setUpsellTransactionDialogOpen] = useState(false)
  const [selectedTransaction, setSelectedTransaction] = useState<UpsellTransaction | undefined>()
  const [searchQuery, setSearchQuery] = useState('')

  const stats = {
    totalGuests: guestProfiles.length,
    vipGuests: guestProfiles.filter(g => g.segments.includes('vip')).length,
    activeComplaints: complaints.filter(c => c.status !== 'closed').length,
    averageRating: feedback.length > 0 
      ? (feedback.reduce((sum, f) => sum + f.overallRating, 0) / feedback.length).toFixed(1)
      : '0',
    totalLoyaltyPoints: guestProfiles.reduce((sum, g) => sum + g.loyaltyInfo.points, 0),
    upsellRevenue: upsellTransactions
      .filter(t => t.status === 'accepted')
      .reduce((sum, t) => sum + t.finalAmount, 0)
  }

  const getTierBadgeColor = (tier: string) => {
    switch (tier) {
      case 'diamond': return 'bg-blue-500 text-white'
      case 'platinum': return 'bg-gray-300 text-gray-900'
      case 'gold': return 'bg-yellow-500 text-white'
      case 'silver': return 'bg-gray-400 text-white'
      default: return 'bg-amber-700 text-white'
    }
  }

  const getComplaintPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'border-l-destructive'
      case 'high': return 'border-l-orange-500'
      case 'medium': return 'border-l-yellow-500'
      default: return 'border-l-blue-500'
    }
  }

  const filteredGuests = guestProfiles.filter(guest =>
    guest.firstName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    guest.lastName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    guest.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    guest.phone.includes(searchQuery)
  )

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-4xl font-semibold">CRM & Guest Relations</h1>
        <p className="text-muted-foreground mt-1">
          Comprehensive customer relationship management and engagement
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card className="p-6 border-l-4 border-l-primary">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-muted-foreground">Total Guests</h3>
            <Users size={20} className="text-primary" />
          </div>
          <p className="text-3xl font-semibold">{stats.totalGuests}</p>
          <p className="text-sm text-muted-foreground mt-1">{stats.vipGuests} VIP guests</p>
        </Card>

        <Card className="p-6 border-l-4 border-l-yellow-500">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-muted-foreground">Loyalty Points</h3>
            <Star size={20} className="text-yellow-500" />
          </div>
          <p className="text-3xl font-semibold">{stats.totalLoyaltyPoints.toLocaleString()}</p>
          <p className="text-sm text-muted-foreground mt-1">Total program points</p>
        </Card>

        <Card className="p-6 border-l-4 border-l-success">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-muted-foreground">Upsell Revenue</h3>
            <TrendUp size={20} className="text-success" />
          </div>
          <p className="text-3xl font-semibold">{formatCurrency(stats.upsellRevenue)}</p>
          <p className="text-sm text-muted-foreground mt-1">Additional revenue</p>
        </Card>

        <Card className="p-6 border-l-4 border-l-destructive">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-muted-foreground">Active Complaints</h3>
            <Warning size={20} className="text-destructive" />
          </div>
          <p className="text-3xl font-semibold">{stats.activeComplaints}</p>
          <p className="text-sm text-muted-foreground mt-1">Requiring attention</p>
        </Card>

        <Card className="p-6 border-l-4 border-l-blue-500">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-muted-foreground">Average Rating</h3>
            <ThumbsUp size={20} className="text-blue-500" />
          </div>
          <p className="text-3xl font-semibold">{stats.averageRating} / 5</p>
          <p className="text-sm text-muted-foreground mt-1">{feedback.length} reviews</p>
        </Card>

        <Card className="p-6 border-l-4 border-l-purple-500">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-muted-foreground">Campaigns</h3>
            <Megaphone size={20} className="text-purple-500" />
          </div>
          <p className="text-3xl font-semibold">{campaigns.filter(c => c.status === 'running').length}</p>
          <p className="text-sm text-muted-foreground mt-1">Active campaigns</p>
        </Card>
      </div>

      <Tabs value={currentTab} onValueChange={setCurrentTab}>
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="guests">
            <Users size={16} className="mr-2" />
            Guests
          </TabsTrigger>
          <TabsTrigger value="loyalty">
            <Star size={16} className="mr-2" />
            Loyalty
          </TabsTrigger>
          <TabsTrigger value="marketing">
            <Envelope size={16} className="mr-2" />
            Marketing
          </TabsTrigger>
          <TabsTrigger value="upsell">
            <Gift size={16} className="mr-2" />
            Upsell
          </TabsTrigger>
          <TabsTrigger value="feedback">
            <ChatCircle size={16} className="mr-2" />
            Feedback
          </TabsTrigger>
        </TabsList>

        <TabsContent value="guests" className="space-y-4 mt-6">
          <div className="flex items-center justify-between">
            <div className="relative flex-1 max-w-md">
              <MagnifyingGlass size={20} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search guests by name, email, or phone..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button onClick={() => {
              setSelectedGuest(undefined)
              setGuestDialogOpen(true)
            }}>
              <Plus size={20} className="mr-2" />
              Add Guest Profile
            </Button>
          </div>

          <div className="grid gap-4">
            {filteredGuests.map((guest) => (
              <Card
                key={guest.id}
                className="p-6 hover:shadow-md transition-shadow cursor-pointer"
                onClick={() => {
                  setSelectedGuest(guest)
                  setGuestDialogOpen(true)
                }}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      <h3 className="text-lg font-semibold">
                        {guest.salutation} {guest.firstName} {guest.lastName}
                      </h3>
                      <Badge className={getTierBadgeColor(guest.loyaltyInfo.tier)}>
                        {guest.loyaltyInfo.tier.toUpperCase()}
                      </Badge>
                      {guest.segments.map(segment => (
                        <Badge key={segment} variant="outline">
                          {segment}
                        </Badge>
                      ))}
                    </div>
                    <div className="mt-2 grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <p className="text-muted-foreground">Email</p>
                        <p className="font-medium">{guest.email || 'N/A'}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Phone</p>
                        <p className="font-medium">{guest.phone}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Total Stays</p>
                        <p className="font-medium">{guest.totalStays} stays</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Loyalty Points</p>
                        <p className="font-medium">{guest.loyaltyInfo.points.toLocaleString()}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Total Spent</p>
                        <p className="font-medium">{formatCurrency(guest.totalSpent)}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Last Stay</p>
                        <p className="font-medium">
                          {guest.lastStayDate ? formatDate(guest.lastStayDate) : 'Never'}
                        </p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Member Since</p>
                        <p className="font-medium">{formatDate(guest.createdAt)}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Nationality</p>
                        <p className="font-medium">{guest.nationality || 'N/A'}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
            {filteredGuests.length === 0 && (
              <Card className="p-16 text-center">
                <Users size={64} className="mx-auto text-muted-foreground mb-4" />
                <h3 className="text-xl font-semibold mb-2">No guests found</h3>
                <p className="text-muted-foreground mb-6">
                  {searchQuery ? 'Try adjusting your search query' : 'Add your first guest profile to get started'}
                </p>
                {!searchQuery && (
                  <Button onClick={() => {
                    setSelectedGuest(undefined)
                    setGuestDialogOpen(true)
                  }}>
                    <Plus size={20} className="mr-2" />
                    Add Guest Profile
                  </Button>
                )}
              </Card>
            )}
          </div>
        </TabsContent>

        <TabsContent value="loyalty" className="space-y-4 mt-6">
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Loyalty Program Overview</h3>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-6">
              {['bronze', 'silver', 'gold', 'platinum', 'diamond'].map((tier) => {
                const count = guestProfiles.filter(g => g.loyaltyInfo.tier === tier).length
                return (
                  <div key={tier} className="text-center">
                    <Badge className={`${getTierBadgeColor(tier)} text-lg px-4 py-2`}>
                      {tier.toUpperCase()}
                    </Badge>
                    <p className="mt-2 text-2xl font-semibold">{count}</p>
                    <p className="text-sm text-muted-foreground">Members</p>
                  </div>
                )
              })}
            </div>
          </Card>

          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">Recent Loyalty Transactions</h3>
          </div>

          <div className="grid gap-4">
            {loyaltyTransactions.slice(0, 20).map((transaction) => {
              const guest = guestProfiles.find(g => g.id === transaction.guestId)
              return (
                <Card key={transaction.id} className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-semibold">{guest?.firstName} {guest?.lastName}</p>
                      <p className="text-sm text-muted-foreground">{transaction.reason}</p>
                    </div>
                    <div className="text-right">
                      <p className={`text-lg font-semibold ${transaction.type === 'earned' ? 'text-success' : 'text-destructive'}`}>
                        {transaction.type === 'earned' ? '+' : '-'}{transaction.points} pts
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Balance: {transaction.balance}
                      </p>
                    </div>
                  </div>
                </Card>
              )
            })}
          </div>
        </TabsContent>

        <TabsContent value="marketing" className="space-y-4 mt-6">
          <Tabs defaultValue="campaigns">
            <TabsList>
              <TabsTrigger value="campaigns">Campaigns</TabsTrigger>
              <TabsTrigger value="templates">Templates</TabsTrigger>
            </TabsList>

            <TabsContent value="campaigns" className="space-y-4 mt-6">
              <div className="flex justify-end">
                <Button onClick={() => {
                  setSelectedCampaign(undefined)
                  setCampaignDialogOpen(true)
                }}>
                  <Plus size={20} className="mr-2" />
                  Create Campaign
                </Button>
              </div>

              <div className="grid gap-4">
                {campaigns.map((campaign) => (
                  <Card
                    key={campaign.id}
                    className="p-6 cursor-pointer hover:shadow-md transition-shadow"
                    onClick={() => {
                      setSelectedCampaign(campaign)
                      setCampaignDialogOpen(true)
                    }}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3">
                          <h3 className="text-lg font-semibold">{campaign.name}</h3>
                          <Badge variant={campaign.status === 'running' ? 'default' : 'outline'}>
                            {campaign.status}
                          </Badge>
                          <Badge variant="outline">{campaign.channel}</Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mt-1">{campaign.description}</p>
                        <div className="mt-4 grid grid-cols-4 gap-4 text-sm">
                          <div>
                            <p className="text-muted-foreground">Recipients</p>
                            <p className="font-medium">{campaign.recipientCount}</p>
                          </div>
                          <div>
                            <p className="text-muted-foreground">Sent</p>
                            <p className="font-medium">{campaign.emailsSent + campaign.smsSent}</p>
                          </div>
                          <div>
                            <p className="text-muted-foreground">Opens</p>
                            <p className="font-medium">{campaign.emailsOpened}</p>
                          </div>
                          <div>
                            <p className="text-muted-foreground">Revenue</p>
                            <p className="font-medium">{formatCurrency(campaign.revenue)}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </Card>
                ))}
                {campaigns.length === 0 && (
                  <Card className="p-16 text-center">
                    <Megaphone size={64} className="mx-auto text-muted-foreground mb-4" />
                    <h3 className="text-xl font-semibold mb-2">No campaigns yet</h3>
                    <p className="text-muted-foreground mb-6">Create your first marketing campaign</p>
                    <Button onClick={() => {
                      setSelectedCampaign(undefined)
                      setCampaignDialogOpen(true)
                    }}>
                      <Plus size={20} className="mr-2" />
                      Create Campaign
                    </Button>
                  </Card>
                )}
              </div>
            </TabsContent>

            <TabsContent value="templates" className="space-y-4 mt-6">
              <div className="flex justify-end">
                <Button onClick={() => {
                  setSelectedTemplate(undefined)
                  setTemplateDialogOpen(true)
                }}>
                  <Plus size={20} className="mr-2" />
                  Create Template
                </Button>
              </div>

              <div className="grid gap-4">
                {templates.map((template) => (
                  <Card
                    key={template.id}
                    className="p-6 cursor-pointer hover:shadow-md transition-shadow"
                    onClick={() => {
                      setSelectedTemplate(template)
                      setTemplateDialogOpen(true)
                    }}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3">
                          <h3 className="text-lg font-semibold">{template.name}</h3>
                          <Badge variant={template.isActive ? 'default' : 'outline'}>
                            {template.isActive ? 'Active' : 'Inactive'}
                          </Badge>
                          <Badge variant="outline">{template.type}</Badge>
                          <Badge variant="outline">{template.channel}</Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mt-1">{template.description}</p>
                        <div className="mt-4 flex gap-6 text-sm">
                          <div>
                            <span className="text-muted-foreground">Used: </span>
                            <span className="font-medium">{template.usage} times</span>
                          </div>
                          {template.openRate && (
                            <div>
                              <span className="text-muted-foreground">Open Rate: </span>
                              <span className="font-medium">{(template.openRate * 100).toFixed(1)}%</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </Card>
                ))}
                {templates.length === 0 && (
                  <Card className="p-16 text-center">
                    <Envelope size={64} className="mx-auto text-muted-foreground mb-4" />
                    <h3 className="text-xl font-semibold mb-2">No templates yet</h3>
                    <p className="text-muted-foreground mb-6">Create reusable templates for campaigns</p>
                    <Button onClick={() => {
                      setSelectedTemplate(undefined)
                      setTemplateDialogOpen(true)
                    }}>
                      <Plus size={20} className="mr-2" />
                      Create Template
                    </Button>
                  </Card>
                )}
              </div>
            </TabsContent>
          </Tabs>
        </TabsContent>

        <TabsContent value="upsell" className="space-y-4 mt-6">
          <Tabs defaultValue="offers">
            <TabsList>
              <TabsTrigger value="offers">Offers</TabsTrigger>
              <TabsTrigger value="transactions">Transactions</TabsTrigger>
            </TabsList>

            <TabsContent value="offers" className="space-y-4 mt-6">
              <div className="flex justify-end">
                <Button onClick={() => {
                  setSelectedOffer(undefined)
                  setUpsellOfferDialogOpen(true)
                }}>
                  <Plus size={20} className="mr-2" />
                  Create Offer
                </Button>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                {upsellOffers.map((offer) => (
                  <Card
                    key={offer.id}
                    className="p-6 cursor-pointer hover:shadow-md transition-shadow"
                    onClick={() => {
                      setSelectedOffer(offer)
                      setUpsellOfferDialogOpen(true)
                    }}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h3 className="text-lg font-semibold">{offer.name}</h3>
                        <Badge variant="outline" className="mt-1">{offer.category}</Badge>
                      </div>
                      <Badge variant={offer.isActive ? 'default' : 'outline'}>
                        {offer.isActive ? 'Active' : 'Inactive'}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mb-4">{offer.description}</p>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-2xl font-semibold">{formatCurrency(offer.discountedPrice || offer.basePrice)}</p>
                        {offer.discountedPrice && (
                          <p className="text-sm text-muted-foreground line-through">{formatCurrency(offer.basePrice)}</p>
                        )}
                      </div>
                      {offer.inventory && (
                        <div className="text-right">
                          <p className="text-sm font-medium">{offer.inventory.available} available</p>
                          <p className="text-xs text-muted-foreground">of {offer.inventory.total}</p>
                        </div>
                      )}
                    </div>
                  </Card>
                ))}
                {upsellOffers.length === 0 && (
                  <Card className="p-16 text-center col-span-2">
                    <Gift size={64} className="mx-auto text-muted-foreground mb-4" />
                    <h3 className="text-xl font-semibold mb-2">No upsell offers yet</h3>
                    <p className="text-muted-foreground mb-6">Create offers to drive additional revenue</p>
                    <Button onClick={() => {
                      setSelectedOffer(undefined)
                      setUpsellOfferDialogOpen(true)
                    }}>
                      <Plus size={20} className="mr-2" />
                      Create Offer
                    </Button>
                  </Card>
                )}
              </div>
            </TabsContent>

            <TabsContent value="transactions" className="space-y-4 mt-6">
              <div className="grid gap-4">
                {upsellTransactions.map((transaction) => {
                  const guest = guestProfiles.find(g => g.id === transaction.guestId)
                  return (
                    <Card
                      key={transaction.id}
                      className="p-4 cursor-pointer hover:shadow-md transition-shadow"
                      onClick={() => {
                        setSelectedTransaction(transaction)
                        setUpsellTransactionDialogOpen(true)
                      }}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3">
                            <p className="font-semibold">{guest?.firstName} {guest?.lastName}</p>
                            <Badge variant="outline">{transaction.category}</Badge>
                            <Badge variant={
                              transaction.status === 'accepted' ? 'default' :
                              transaction.status === 'declined' ? 'destructive' :
                              'secondary'
                            }>
                              {transaction.status}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground mt-1">{transaction.offerName}</p>
                          <p className="text-xs text-muted-foreground">
                            Offered via {transaction.offeredVia} on {formatDate(transaction.offeredAt)}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-lg font-semibold">{formatCurrency(transaction.finalAmount)}</p>
                          {transaction.discount && (
                            <p className="text-sm text-success">-{formatCurrency(transaction.discount)}</p>
                          )}
                        </div>
                      </div>
                    </Card>
                  )
                })}
                {upsellTransactions.length === 0 && (
                  <Card className="p-16 text-center">
                    <TrendUp size={64} className="mx-auto text-muted-foreground mb-4" />
                    <h3 className="text-xl font-semibold mb-2">No transactions yet</h3>
                    <p className="text-muted-foreground">Upsell transactions will appear here</p>
                  </Card>
                )}
              </div>
            </TabsContent>
          </Tabs>
        </TabsContent>

        <TabsContent value="feedback" className="space-y-4 mt-6">
          <Tabs defaultValue="feedback">
            <TabsList>
              <TabsTrigger value="feedback">Guest Feedback</TabsTrigger>
              <TabsTrigger value="complaints">Complaints</TabsTrigger>
            </TabsList>

            <TabsContent value="feedback" className="space-y-4 mt-6">
              <div className="grid gap-4">
                {feedback.map((fb) => {
                  const guest = guestProfiles.find(g => g.id === fb.guestId)
                  return (
                    <Card
                      key={fb.id}
                      className="p-6 cursor-pointer hover:shadow-md transition-shadow"
                      onClick={() => {
                        setSelectedFeedback(fb)
                        setFeedbackDialogOpen(true)
                      }}
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <div className="flex items-center gap-3">
                            <h3 className="text-lg font-semibold">
                              {guest?.firstName} {guest?.lastName}
                            </h3>
                            <div className="flex items-center gap-1">
                              <Star size={16} className="text-yellow-500 fill-yellow-500" />
                              <span className="font-semibold">{fb.overallRating}/5</span>
                            </div>
                            <Badge variant={
                              fb.sentiment === 'positive' ? 'default' :
                              fb.sentiment === 'negative' ? 'destructive' :
                              'secondary'
                            }>
                              {fb.sentiment}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground mt-1">
                            {formatDate(fb.submittedAt)} via {fb.channel}
                          </p>
                        </div>
                      </div>
                      {fb.comments && (
                        <p className="text-sm mt-3">{fb.comments}</p>
                      )}
                      <div className="mt-4 flex items-center gap-4 text-sm">
                        <span className={`${fb.wouldRecommend ? 'text-success' : 'text-destructive'}`}>
                          {fb.wouldRecommend ? '✓' : '✗'} Would recommend
                        </span>
                        <span className={`${fb.wouldReturn ? 'text-success' : 'text-destructive'}`}>
                          {fb.wouldReturn ? '✓' : '✗'} Would return
                        </span>
                      </div>
                    </Card>
                  )
                })}
                {feedback.length === 0 && (
                  <Card className="p-16 text-center">
                    <ThumbsUp size={64} className="mx-auto text-muted-foreground mb-4" />
                    <h3 className="text-xl font-semibold mb-2">No feedback yet</h3>
                    <p className="text-muted-foreground">Guest feedback will appear here</p>
                  </Card>
                )}
              </div>
            </TabsContent>

            <TabsContent value="complaints" className="space-y-4 mt-6">
              <div className="flex justify-end">
                <Button onClick={() => {
                  setSelectedComplaint(undefined)
                  setComplaintDialogOpen(true)
                }}>
                  <Plus size={20} className="mr-2" />
                  Log Complaint
                </Button>
              </div>

              <div className="grid gap-4">
                {complaints.map((complaint) => {
                  const guest = guestProfiles.find(g => g.id === complaint.guestId)
                  return (
                    <Card
                      key={complaint.id}
                      className={`p-6 border-l-4 cursor-pointer hover:shadow-md transition-shadow ${getComplaintPriorityColor(complaint.priority)}`}
                      onClick={() => {
                        setSelectedComplaint(complaint)
                        setComplaintDialogOpen(true)
                      }}
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <div className="flex items-center gap-3">
                            <h3 className="font-semibold">{complaint.complaintNumber}</h3>
                            <Badge variant={
                              complaint.status === 'resolved' ? 'default' :
                              complaint.status === 'escalated' ? 'destructive' :
                              'secondary'
                            }>
                              {complaint.status}
                            </Badge>
                            <Badge variant="outline">{complaint.priority}</Badge>
                            <Badge variant="outline">{complaint.category}</Badge>
                          </div>
                          <p className="text-sm text-muted-foreground mt-1">
                            {guest?.firstName} {guest?.lastName} - {formatDate(complaint.reportedAt)}
                          </p>
                          <p className="font-medium mt-2">{complaint.subject}</p>
                          <p className="text-sm text-muted-foreground mt-1">{complaint.description}</p>
                          {complaint.resolution && (
                            <div className="mt-3 p-3 bg-muted rounded-md">
                              <p className="text-sm font-medium">Resolution:</p>
                              <p className="text-sm text-muted-foreground">{complaint.resolution}</p>
                            </div>
                          )}
                        </div>
                      </div>
                    </Card>
                  )
                })}
                {complaints.length === 0 && (
                  <Card className="p-16 text-center">
                    <Warning size={64} className="mx-auto text-muted-foreground mb-4" />
                    <h3 className="text-xl font-semibold mb-2">No complaints logged</h3>
                    <p className="text-muted-foreground mb-6">Guest complaints will appear here</p>
                    <Button onClick={() => {
                      setSelectedComplaint(undefined)
                      setComplaintDialogOpen(true)
                    }}>
                      <Plus size={20} className="mr-2" />
                      Log Complaint
                    </Button>
                  </Card>
                )}
              </div>
            </TabsContent>
          </Tabs>
        </TabsContent>
      </Tabs>

      <GuestProfileDialog
        open={guestDialogOpen}
        onOpenChange={setGuestDialogOpen}
        guest={selectedGuest}
        onSave={(guest) => {
          if (selectedGuest) {
            setGuestProfiles((prev) => prev.map(g => g.id === guest.id ? guest : g))
            toast.success('Guest profile updated')
          } else {
            setGuestProfiles((prev) => [...prev, guest])
            toast.success('Guest profile created')
          }
          setGuestDialogOpen(false)
        }}
      />

      <ComplaintDialog
        open={complaintDialogOpen}
        onOpenChange={setComplaintDialogOpen}
        complaint={selectedComplaint}
        guests={guestProfiles}
        onSave={(complaint) => {
          if (selectedComplaint) {
            setComplaints((prev) => prev.map(c => c.id === complaint.id ? complaint : c))
            toast.success('Complaint updated')
          } else {
            setComplaints((prev) => [...prev, complaint])
            toast.success('Complaint logged')
          }
          setComplaintDialogOpen(false)
        }}
      />

      <FeedbackDialog
        open={feedbackDialogOpen}
        onOpenChange={setFeedbackDialogOpen}
        feedback={selectedFeedback}
        guests={guestProfiles}
        onSave={(feedback) => {
          setFeedback((prev) => prev.map(f => f.id === feedback.id ? feedback : f))
          toast.success('Feedback updated')
          setFeedbackDialogOpen(false)
        }}
      />

      <MarketingCampaignDialog
        open={campaignDialogOpen}
        onOpenChange={setCampaignDialogOpen}
        campaign={selectedCampaign}
        templates={templates}
        guests={guestProfiles}
        onSave={(campaign) => {
          if (selectedCampaign) {
            setCampaigns((prev) => prev.map(c => c.id === campaign.id ? campaign : c))
            toast.success('Campaign updated')
          } else {
            setCampaigns((prev) => [...prev, campaign])
            toast.success('Campaign created')
          }
          setCampaignDialogOpen(false)
        }}
      />

      <MarketingTemplateDialog
        open={templateDialogOpen}
        onOpenChange={setTemplateDialogOpen}
        template={selectedTemplate}
        onSave={(template) => {
          if (selectedTemplate) {
            setTemplates((prev) => prev.map(t => t.id === template.id ? template : t))
            toast.success('Template updated')
          } else {
            setTemplates((prev) => [...prev, template])
            toast.success('Template created')
          }
          setTemplateDialogOpen(false)
        }}
      />

      <UpsellOfferDialog
        open={upsellOfferDialogOpen}
        onOpenChange={setUpsellOfferDialogOpen}
        offer={selectedOffer}
        onSave={(offer) => {
          if (selectedOffer) {
            setUpsellOffers((prev) => prev.map(o => o.id === offer.id ? offer : o))
            toast.success('Offer updated')
          } else {
            setUpsellOffers((prev) => [...prev, offer])
            toast.success('Offer created')
          }
          setUpsellOfferDialogOpen(false)
        }}
      />

      <UpsellTransactionDialog
        open={upsellTransactionDialogOpen}
        onOpenChange={setUpsellTransactionDialogOpen}
        transaction={selectedTransaction}
        guests={guestProfiles}
        offers={upsellOffers}
        onSave={(transaction) => {
          if (selectedTransaction) {
            setUpsellTransactions((prev) => prev.map(t => t.id === transaction.id ? transaction : t))
            toast.success('Transaction updated')
          } else {
            setUpsellTransactions((prev) => [...prev, transaction])
            toast.success('Transaction created')
          }
          setUpsellTransactionDialogOpen(false)
        }}
      />
    </div>
  )
}
