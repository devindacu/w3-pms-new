import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useAirbnbAPI, type AirbnbConfig, type ListingData, type PricingRules } from '@/hooks/use-airbnb-api';
import { PrintButton } from '@/components/PrintButton';
import { A4PrintWrapper } from '@/components/A4PrintWrapper';
import { Home, Image, MessageCircle, Star, DollarSign, Calendar, TrendingUp } from 'lucide-react';
import { toast } from 'sonner';

export function AirbnbManagement() {
  const {
    loading,
    error,
    updateListing,
    uploadPhoto,
    sendMessage,
    getMessages,
    getReviews,
    respondToReview,
    updatePricing,
    getCalendar,
    getAnalytics
  } = useAirbnbAPI();

  const [config, setConfig] = useState<AirbnbConfig>({
    propertyId: '',
    apiKey: '',
    apiSecret: ''
  });

  const [listingData, setListingData] = useState<ListingData>({
    name: '',
    description: '',
    propertyType: 'apartment',
    roomType: 'entire_place',
    accommodates: 2,
    bedrooms: 1,
    beds: 1,
    bathrooms: 1,
    amenities: []
  });

  const [photoUrl, setPhotoUrl] = useState('');
  const [photoCaption, setPhotoCaption] = useState('');
  const [messageText, setMessageText] = useState('');
  const [reservationId, setReservationId] = useState('');
  const [messages, setMessages] = useState<any[]>([]);
  const [reviews, setReviews] = useState<any[]>([]);
  const [reviewResponse, setReviewResponse] = useState('');
  const [selectedReviewId, setSelectedReviewId] = useState('');

  const [pricingRules, setPricingRules] = useState<PricingRules>({
    basePrice: 100,
    weekendPrice: 120,
    monthlyDiscount: 10,
    weeklyDiscount: 5,
    cleaningFee: 50,
    extraPersonFee: 15
  });

  const [calendar, setCalendar] = useState<any[]>([]);
  const [analytics, setAnalytics] = useState<any>(null);

  const handleUpdateListing = async () => {
    if (!config.propertyId || !config.apiKey || !config.apiSecret) {
      toast.error('Please enter all API credentials');
      return;
    }

    await updateListing(config, listingData);
  };

  const handleUploadPhoto = async () => {
    if (!config.propertyId || !config.apiKey || !config.apiSecret) {
      toast.error('Please enter all API credentials');
      return;
    }

    if (!photoUrl) {
      toast.error('Please enter photo URL');
      return;
    }

    await uploadPhoto(config, photoUrl, photoCaption);
    setPhotoUrl('');
    setPhotoCaption('');
  };

  const handleSendMessage = async () => {
    if (!config.propertyId || !config.apiKey || !config.apiSecret) {
      toast.error('Please enter all API credentials');
      return;
    }

    if (!reservationId || !messageText) {
      toast.error('Please enter reservation ID and message');
      return;
    }

    await sendMessage(config, reservationId, messageText);
    setMessageText('');
  };

  const handleGetMessages = async () => {
    if (!config.propertyId || !config.apiKey || !config.apiSecret) {
      toast.error('Please enter all API credentials');
      return;
    }

    if (!reservationId) {
      toast.error('Please enter reservation ID');
      return;
    }

    const data = await getMessages(config, reservationId);
    setMessages(data);
  };

  const handleGetReviews = async () => {
    if (!config.propertyId || !config.apiKey || !config.apiSecret) {
      toast.error('Please enter all API credentials');
      return;
    }

    const data = await getReviews(config);
    setReviews(data);
  };

  const handleRespondToReview = async () => {
    if (!config.propertyId || !config.apiKey || !config.apiSecret) {
      toast.error('Please enter all API credentials');
      return;
    }

    if (!selectedReviewId || !reviewResponse) {
      toast.error('Please select a review and enter a response');
      return;
    }

    await respondToReview(config, selectedReviewId, reviewResponse);
    setReviewResponse('');
    setSelectedReviewId('');
  };

  const handleUpdatePricing = async () => {
    if (!config.propertyId || !config.apiKey || !config.apiSecret) {
      toast.error('Please enter all API credentials');
      return;
    }

    await updatePricing(config, pricingRules);
  };

  const handleGetCalendar = async () => {
    if (!config.propertyId || !config.apiKey || !config.apiSecret) {
      toast.error('Please enter all API credentials');
      return;
    }

    const endDate = new Date();
    endDate.setDate(endDate.getDate() + 90);
    const startDate = new Date();

    const data = await getCalendar(config, startDate, endDate);
    setCalendar(data);
  };

  const handleGetAnalytics = async () => {
    if (!config.propertyId || !config.apiKey || !config.apiSecret) {
      toast.error('Please enter all API credentials');
      return;
    }

    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - 30);

    const data = await getAnalytics(config, startDate, endDate);
    setAnalytics(data);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Airbnb Management</h2>
          <p className="text-muted-foreground">Manage your listing, messaging, pricing, and more</p>
        </div>
        <div className="flex gap-2 items-center">
          <Badge variant="outline" className="gap-1">
            <Home className="h-3 w-3" />
            Airbnb API
          </Badge>
          <PrintButton
            elementId="airbnb-report"
            options={{
              title: 'Airbnb Listing Management Report',
              filename: `airbnb-report-${Date.now()}.pdf`,
              includeHeader: true,
              headerText: 'Airbnb Listing Management',
              includeFooter: true,
              footerText: `Generated on ${new Date().toLocaleDateString()}`
            }}
            variant="outline"
            size="sm"
          />
        </div>
      </div>

      {/* API Configuration */}
      <Card className="p-4">
        <h3 className="font-semibold mb-4">API Configuration</h3>
        <div className="grid gap-4 md:grid-cols-3">
          <div className="space-y-2">
            <Label htmlFor="listingId">Listing ID</Label>
            <Input
              id="listingId"
              value={config.propertyId}
              onChange={(e) => setConfig({ ...config, propertyId: e.target.value })}
              placeholder="Enter your listing ID"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="airbnbApiKey">API Key</Label>
            <Input
              id="airbnbApiKey"
              type="password"
              value={config.apiKey}
              onChange={(e) => setConfig({ ...config, apiKey: e.target.value })}
              placeholder="Enter your API key"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="airbnbApiSecret">API Secret</Label>
            <Input
              id="airbnbApiSecret"
              type="password"
              value={config.apiSecret}
              onChange={(e) => setConfig({ ...config, apiSecret: e.target.value })}
              placeholder="Enter your API secret"
            />
          </div>
        </div>
      </Card>

      <Tabs defaultValue="listing" className="w-full">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="listing">Listing</TabsTrigger>
          <TabsTrigger value="photos">Photos</TabsTrigger>
          <TabsTrigger value="messaging">Messages</TabsTrigger>
          <TabsTrigger value="reviews">Reviews</TabsTrigger>
          <TabsTrigger value="pricing">Pricing</TabsTrigger>
          <TabsTrigger value="data">Data</TabsTrigger>
        </TabsList>

        <TabsContent value="listing" className="space-y-4">
          <Card className="p-4">
            <h3 className="font-semibold mb-4">Listing Information</h3>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="listingName">Listing Name</Label>
                <Input
                  id="listingName"
                  value={listingData.name}
                  onChange={(e) => setListingData({ ...listingData, name: e.target.value })}
                  placeholder="Cozy apartment in downtown"
                />
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="listingDesc">Description</Label>
                <Textarea
                  id="listingDesc"
                  value={listingData.description}
                  onChange={(e) => setListingData({ ...listingData, description: e.target.value })}
                  placeholder="Describe your listing..."
                  rows={4}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="accommodates">Accommodates</Label>
                <Input
                  id="accommodates"
                  type="number"
                  value={listingData.accommodates}
                  onChange={(e) => setListingData({ ...listingData, accommodates: parseInt(e.target.value) })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="bedrooms">Bedrooms</Label>
                <Input
                  id="bedrooms"
                  type="number"
                  value={listingData.bedrooms}
                  onChange={(e) => setListingData({ ...listingData, bedrooms: parseInt(e.target.value) })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="beds">Beds</Label>
                <Input
                  id="beds"
                  type="number"
                  value={listingData.beds}
                  onChange={(e) => setListingData({ ...listingData, beds: parseInt(e.target.value) })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="bathrooms">Bathrooms</Label>
                <Input
                  id="bathrooms"
                  type="number"
                  value={listingData.bathrooms}
                  onChange={(e) => setListingData({ ...listingData, bathrooms: parseInt(e.target.value) })}
                />
              </div>
            </div>
            <Separator className="my-4" />
            <Button onClick={handleUpdateListing} disabled={loading}>
              <Home className="h-4 w-4 mr-2" />
              Update Listing
            </Button>
          </Card>
        </TabsContent>

        <TabsContent value="photos" className="space-y-4">
          <Card className="p-4">
            <h3 className="font-semibold mb-4">Upload Photos</h3>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="airbnbPhotoUrl">Photo URL</Label>
                <Input
                  id="airbnbPhotoUrl"
                  value={photoUrl}
                  onChange={(e) => setPhotoUrl(e.target.value)}
                  placeholder="https://example.com/photo.jpg"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="airbnbPhotoCaption">Caption (optional)</Label>
                <Input
                  id="airbnbPhotoCaption"
                  value={photoCaption}
                  onChange={(e) => setPhotoCaption(e.target.value)}
                  placeholder="Photo description"
                />
              </div>
              <Button onClick={handleUploadPhoto} disabled={loading}>
                <Image className="h-4 w-4 mr-2" />
                Upload Photo
              </Button>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="messaging" className="space-y-4">
          <Card className="p-4">
            <h3 className="font-semibold mb-4">Guest Messaging</h3>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="resId">Reservation ID</Label>
                <Input
                  id="resId"
                  value={reservationId}
                  onChange={(e) => setReservationId(e.target.value)}
                  placeholder="Enter reservation ID"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="msgText">Message</Label>
                <Textarea
                  id="msgText"
                  value={messageText}
                  onChange={(e) => setMessageText(e.target.value)}
                  placeholder="Type your message..."
                  rows={3}
                />
              </div>
              <div className="flex gap-2">
                <Button onClick={handleSendMessage} disabled={loading}>
                  <MessageCircle className="h-4 w-4 mr-2" />
                  Send Message
                </Button>
                <Button onClick={handleGetMessages} variant="outline" disabled={loading}>
                  Get Messages
                </Button>
              </div>
              {messages.length > 0 && (
                <div className="mt-4">
                  <h4 className="font-medium mb-2">Messages</h4>
                  <p className="text-sm text-muted-foreground">
                    {messages.length} message(s) found
                  </p>
                </div>
              )}
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="reviews" className="space-y-4">
          <Card className="p-4">
            <h3 className="font-semibold mb-4">Reviews</h3>
            <div className="space-y-4">
              <Button onClick={handleGetReviews} disabled={loading}>
                <Star className="h-4 w-4 mr-2" />
                Get Reviews
              </Button>
              {reviews.length > 0 && (
                <div className="space-y-4">
                  <p className="text-sm text-muted-foreground">
                    {reviews.length} review(s) found
                  </p>
                  <Separator />
                  <div className="space-y-2">
                    <Label htmlFor="reviewId">Review ID to respond</Label>
                    <Input
                      id="reviewId"
                      value={selectedReviewId}
                      onChange={(e) => setSelectedReviewId(e.target.value)}
                      placeholder="Enter review ID"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="reviewResp">Your Response</Label>
                    <Textarea
                      id="reviewResp"
                      value={reviewResponse}
                      onChange={(e) => setReviewResponse(e.target.value)}
                      placeholder="Thank you for your feedback..."
                      rows={3}
                    />
                  </div>
                  <Button onClick={handleRespondToReview} disabled={loading}>
                    Respond to Review
                  </Button>
                </div>
              )}
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="pricing" className="space-y-4">
          <Card className="p-4">
            <h3 className="font-semibold mb-4">Pricing Rules</h3>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="basePrice">Base Price</Label>
                <Input
                  id="basePrice"
                  type="number"
                  value={pricingRules.basePrice}
                  onChange={(e) => setPricingRules({ ...pricingRules, basePrice: parseFloat(e.target.value) })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="weekendPrice">Weekend Price</Label>
                <Input
                  id="weekendPrice"
                  type="number"
                  value={pricingRules.weekendPrice || ''}
                  onChange={(e) => setPricingRules({ ...pricingRules, weekendPrice: parseFloat(e.target.value) })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="cleaningFee">Cleaning Fee</Label>
                <Input
                  id="cleaningFee"
                  type="number"
                  value={pricingRules.cleaningFee || ''}
                  onChange={(e) => setPricingRules({ ...pricingRules, cleaningFee: parseFloat(e.target.value) })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="extraPersonFee">Extra Person Fee</Label>
                <Input
                  id="extraPersonFee"
                  type="number"
                  value={pricingRules.extraPersonFee || ''}
                  onChange={(e) => setPricingRules({ ...pricingRules, extraPersonFee: parseFloat(e.target.value) })}
                />
              </div>
            </div>
            <Separator className="my-4" />
            <Button onClick={handleUpdatePricing} disabled={loading}>
              <DollarSign className="h-4 w-4 mr-2" />
              Update Pricing
            </Button>
          </Card>
        </TabsContent>

        <TabsContent value="data" className="space-y-4">
          <Card className="p-4">
            <h3 className="font-semibold mb-4">Calendar & Analytics</h3>
            <div className="space-y-4">
              <div className="flex gap-2">
                <Button onClick={handleGetCalendar} disabled={loading}>
                  <Calendar className="h-4 w-4 mr-2" />
                  Get Calendar (Next 90 Days)
                </Button>
                <Button onClick={handleGetAnalytics} disabled={loading}>
                  <TrendingUp className="h-4 w-4 mr-2" />
                  Get Analytics (Last 30 Days)
                </Button>
              </div>

              {calendar.length > 0 && (
                <div>
                  <h4 className="font-medium mb-2">Calendar</h4>
                  <p className="text-sm text-muted-foreground">
                    {calendar.length} day(s) loaded
                  </p>
                </div>
              )}

              {analytics && (
                <div>
                  <h4 className="font-medium mb-2">Analytics</h4>
                  <p className="text-sm text-muted-foreground">
                    Performance data loaded
                  </p>
                </div>
              )}
            </div>
          </Card>
        </TabsContent>
      </Tabs>

      {error && (
        <Card className="p-4 border-destructive">
          <p className="text-destructive text-sm">{error}</p>
        </Card>
      )}

      {/* Printable Summary Report */}
      <div className="hidden">
        <A4PrintWrapper
          id="airbnb-report"
          title="Airbnb Listing Management Report"
          headerContent={
            <div className="text-sm">
              <p>Listing ID: {config.propertyId || 'Not configured'}</p>
              <p>Report Date: {new Date().toLocaleDateString()}</p>
            </div>
          }
          footerContent={
            <div className="text-xs text-center text-muted-foreground">
              Airbnb Management Console - Confidential
            </div>
          }
        >
          <div className="space-y-6">
            <section>
              <h2 className="text-lg font-semibold mb-4">Listing Information</h2>
              <table className="w-full border-collapse">
                <tbody>
                  <tr>
                    <td className="border p-2 font-medium">Listing Name</td>
                    <td className="border p-2">{listingData.name || 'N/A'}</td>
                  </tr>
                  <tr>
                    <td className="border p-2 font-medium">Description</td>
                    <td className="border p-2">{listingData.description || 'N/A'}</td>
                  </tr>
                  <tr>
                    <td className="border p-2 font-medium">Property Type</td>
                    <td className="border p-2">{listingData.propertyType}</td>
                  </tr>
                  <tr>
                    <td className="border p-2 font-medium">Room Type</td>
                    <td className="border p-2">{listingData.roomType}</td>
                  </tr>
                  <tr>
                    <td className="border p-2 font-medium">Accommodates</td>
                    <td className="border p-2">{listingData.accommodates} guests</td>
                  </tr>
                  <tr>
                    <td className="border p-2 font-medium">Bedrooms</td>
                    <td className="border p-2">{listingData.bedrooms}</td>
                  </tr>
                  <tr>
                    <td className="border p-2 font-medium">Beds</td>
                    <td className="border p-2">{listingData.beds}</td>
                  </tr>
                  <tr>
                    <td className="border p-2 font-medium">Bathrooms</td>
                    <td className="border p-2">{listingData.bathrooms}</td>
                  </tr>
                </tbody>
              </table>
            </section>

            <section>
              <h2 className="text-lg font-semibold mb-4">Pricing Information</h2>
              <table className="w-full border-collapse">
                <tbody>
                  <tr>
                    <td className="border p-2 font-medium">Base Price</td>
                    <td className="border p-2">${pricingRules.basePrice}/night</td>
                  </tr>
                  <tr>
                    <td className="border p-2 font-medium">Weekend Price</td>
                    <td className="border p-2">${pricingRules.weekendPrice || 'N/A'}/night</td>
                  </tr>
                  <tr>
                    <td className="border p-2 font-medium">Cleaning Fee</td>
                    <td className="border p-2">${pricingRules.cleaningFee || 'N/A'}</td>
                  </tr>
                  <tr>
                    <td className="border p-2 font-medium">Extra Person Fee</td>
                    <td className="border p-2">${pricingRules.extraPersonFee || 'N/A'}/person</td>
                  </tr>
                </tbody>
              </table>
            </section>

            <section>
              <h2 className="text-lg font-semibold mb-4">Statistics</h2>
              <table className="w-full border-collapse">
                <tbody>
                  <tr>
                    <td className="border p-2 font-medium">Total Messages</td>
                    <td className="border p-2">{messages.length}</td>
                  </tr>
                  <tr>
                    <td className="border p-2 font-medium">Total Reviews</td>
                    <td className="border p-2">{reviews.length}</td>
                  </tr>
                  <tr>
                    <td className="border p-2 font-medium">Calendar Days</td>
                    <td className="border p-2">{calendar.length}</td>
                  </tr>
                </tbody>
              </table>
            </section>
          </div>
        </A4PrintWrapper>
      </div>
    </div>
  );
}
