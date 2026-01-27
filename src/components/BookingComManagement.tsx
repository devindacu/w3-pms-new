import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useBookingComAPI, type BookingComConfig, type PropertyData, type RoomTypeData, type PhotoData } from '@/hooks/use-booking-com-api';
import { PrintButton } from '@/components/PrintButton';
import { A4PrintWrapper } from '@/components/A4PrintWrapper';
import { Building, Image, Star, DollarSign, FileText, Upload } from 'lucide-react';
import { toast } from 'sonner';

export function BookingComManagement() {
  const { loading, error, updateProperty, updateRoomTypes, uploadPhoto, updateFacilities, getPayments, getReviews } = useBookingComAPI();
  
  const [config, setConfig] = useState<BookingComConfig>({
    propertyId: '',
    apiKey: ''
  });

  const [propertyData, setPropertyData] = useState<PropertyData>({
    name: '',
    address: '',
    city: '',
    country: '',
    phone: '',
    email: ''
  });

  const [roomTypes, setRoomTypes] = useState<RoomTypeData[]>([
    { id: 'deluxe', name: 'Deluxe Room', maxPersons: 2, smoking: false }
  ]);

  const [photoData, setPhotoData] = useState<PhotoData>({
    type: 'property',
    photoUrl: '',
    caption: ''
  });

  const [facilities, setFacilities] = useState<string>('');
  const [payments, setPayments] = useState<any[]>([]);
  const [reviews, setReviews] = useState<any[]>([]);

  const handleUpdateProperty = async () => {
    if (!config.propertyId || !config.apiKey) {
      toast.error('Please enter Property ID and API Key');
      return;
    }

    await updateProperty(config, propertyData);
  };

  const handleUpdateRoomTypes = async () => {
    if (!config.propertyId || !config.apiKey) {
      toast.error('Please enter Property ID and API Key');
      return;
    }

    await updateRoomTypes(config, roomTypes);
  };

  const handleUploadPhoto = async () => {
    if (!config.propertyId || !config.apiKey) {
      toast.error('Please enter Property ID and API Key');
      return;
    }

    if (!photoData.photoUrl) {
      toast.error('Please enter photo URL');
      return;
    }

    await uploadPhoto(config, photoData);
  };

  const handleUpdateFacilities = async () => {
    if (!config.propertyId || !config.apiKey) {
      toast.error('Please enter Property ID and API Key');
      return;
    }

    const facilitiesList = facilities.split(',').map(f => f.trim()).filter(f => f);
    if (facilitiesList.length === 0) {
      toast.error('Please enter at least one facility');
      return;
    }

    await updateFacilities(config, facilitiesList);
  };

  const handleGetPayments = async () => {
    if (!config.propertyId || !config.apiKey) {
      toast.error('Please enter Property ID and API Key');
      return;
    }

    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - 30);

    const data = await getPayments(config, startDate, endDate);
    setPayments(data);
  };

  const handleGetReviews = async () => {
    if (!config.propertyId || !config.apiKey) {
      toast.error('Please enter Property ID and API Key');
      return;
    }

    const data = await getReviews(config);
    setReviews(data);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Booking.com Management</h2>
          <p className="text-muted-foreground">Manage your property, rooms, photos, and more</p>
        </div>
        <div className="flex gap-2 items-center">
          <Badge variant="outline" className="gap-1">
            <Building className="h-3 w-3" />
            Booking.com API
          </Badge>
          <PrintButton
            elementId="booking-com-report"
            options={{
              title: 'Booking.com Management Report',
              filename: `booking-com-report-${Date.now()}.pdf`,
              includeHeader: true,
              headerText: 'Booking.com Property Management',
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
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="propertyId">Property ID</Label>
            <Input
              id="propertyId"
              value={config.propertyId}
              onChange={(e) => setConfig({ ...config, propertyId: e.target.value })}
              placeholder="Enter your property ID"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="apiKey">API Key</Label>
            <Input
              id="apiKey"
              type="password"
              value={config.apiKey}
              onChange={(e) => setConfig({ ...config, apiKey: e.target.value })}
              placeholder="Enter your API key"
            />
          </div>
        </div>
      </Card>

      <Tabs defaultValue="property" className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="property">Property</TabsTrigger>
          <TabsTrigger value="rooms">Rooms</TabsTrigger>
          <TabsTrigger value="photos">Photos</TabsTrigger>
          <TabsTrigger value="facilities">Facilities</TabsTrigger>
          <TabsTrigger value="data">Data</TabsTrigger>
        </TabsList>

        <TabsContent value="property" className="space-y-4">
          <Card className="p-4">
            <h3 className="font-semibold mb-4">Property Information</h3>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="propName">Property Name</Label>
                <Input
                  id="propName"
                  value={propertyData.name || ''}
                  onChange={(e) => setPropertyData({ ...propertyData, name: e.target.value })}
                  placeholder="Hotel name"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="propEmail">Email</Label>
                <Input
                  id="propEmail"
                  type="email"
                  value={propertyData.email || ''}
                  onChange={(e) => setPropertyData({ ...propertyData, email: e.target.value })}
                  placeholder="contact@hotel.com"
                />
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="propAddress">Address</Label>
                <Input
                  id="propAddress"
                  value={propertyData.address || ''}
                  onChange={(e) => setPropertyData({ ...propertyData, address: e.target.value })}
                  placeholder="Street address"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="propCity">City</Label>
                <Input
                  id="propCity"
                  value={propertyData.city || ''}
                  onChange={(e) => setPropertyData({ ...propertyData, city: e.target.value })}
                  placeholder="City"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="propCountry">Country</Label>
                <Input
                  id="propCountry"
                  value={propertyData.country || ''}
                  onChange={(e) => setPropertyData({ ...propertyData, country: e.target.value })}
                  placeholder="Country"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="propPhone">Phone</Label>
                <Input
                  id="propPhone"
                  value={propertyData.phone || ''}
                  onChange={(e) => setPropertyData({ ...propertyData, phone: e.target.value })}
                  placeholder="+1 234 567 8900"
                />
              </div>
            </div>
            <Separator className="my-4" />
            <Button onClick={handleUpdateProperty} disabled={loading}>
              <Building className="h-4 w-4 mr-2" />
              Update Property
            </Button>
          </Card>
        </TabsContent>

        <TabsContent value="rooms" className="space-y-4">
          <Card className="p-4">
            <h3 className="font-semibold mb-4">Room Types</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Configure your room types and their attributes
            </p>
            <Button onClick={handleUpdateRoomTypes} disabled={loading}>
              <Upload className="h-4 w-4 mr-2" />
              Sync Room Types
            </Button>
          </Card>
        </TabsContent>

        <TabsContent value="photos" className="space-y-4">
          <Card className="p-4">
            <h3 className="font-semibold mb-4">Upload Photos</h3>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="photoUrl">Photo URL</Label>
                <Input
                  id="photoUrl"
                  value={photoData.photoUrl}
                  onChange={(e) => setPhotoData({ ...photoData, photoUrl: e.target.value })}
                  placeholder="https://example.com/photo.jpg"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="photoCaption">Caption (optional)</Label>
                <Input
                  id="photoCaption"
                  value={photoData.caption || ''}
                  onChange={(e) => setPhotoData({ ...photoData, caption: e.target.value })}
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

        <TabsContent value="facilities" className="space-y-4">
          <Card className="p-4">
            <h3 className="font-semibold mb-4">Facilities & Amenities</h3>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="facilities">Facilities (comma-separated)</Label>
                <Textarea
                  id="facilities"
                  value={facilities}
                  onChange={(e) => setFacilities(e.target.value)}
                  placeholder="WiFi, Pool, Gym, Restaurant, Bar, Spa"
                  rows={4}
                />
              </div>
              <Button onClick={handleUpdateFacilities} disabled={loading}>
                <Star className="h-4 w-4 mr-2" />
                Update Facilities
              </Button>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="data" className="space-y-4">
          <Card className="p-4">
            <h3 className="font-semibold mb-4">Payments & Reviews</h3>
            <div className="space-y-4">
              <div>
                <Button onClick={handleGetPayments} disabled={loading} className="mr-2">
                  <DollarSign className="h-4 w-4 mr-2" />
                  Get Payments (Last 30 Days)
                </Button>
                <Button onClick={handleGetReviews} disabled={loading}>
                  <FileText className="h-4 w-4 mr-2" />
                  Get Reviews
                </Button>
              </div>

              {payments.length > 0 && (
                <div>
                  <h4 className="font-medium mb-2">Payments</h4>
                  <p className="text-sm text-muted-foreground">
                    {payments.length} payment(s) found
                  </p>
                </div>
              )}

              {reviews.length > 0 && (
                <div>
                  <h4 className="font-medium mb-2">Reviews</h4>
                  <p className="text-sm text-muted-foreground">
                    {reviews.length} review(s) found
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
          id="booking-com-report"
          title="Booking.com Property Management Report"
          headerContent={
            <div className="text-sm">
              <p>Property ID: {config.propertyId || 'Not configured'}</p>
              <p>Report Date: {new Date().toLocaleDateString()}</p>
            </div>
          }
          footerContent={
            <div className="text-xs text-center text-muted-foreground">
              Booking.com Management Console - Confidential
            </div>
          }
        >
          <div className="space-y-6">
            <section>
              <h2 className="text-lg font-semibold mb-4">Property Information</h2>
              <table className="w-full border-collapse">
                <tbody>
                  <tr>
                    <td className="border p-2 font-medium">Property Name</td>
                    <td className="border p-2">{propertyData.name || 'N/A'}</td>
                  </tr>
                  <tr>
                    <td className="border p-2 font-medium">Address</td>
                    <td className="border p-2">{propertyData.address || 'N/A'}</td>
                  </tr>
                  <tr>
                    <td className="border p-2 font-medium">City</td>
                    <td className="border p-2">{propertyData.city || 'N/A'}</td>
                  </tr>
                  <tr>
                    <td className="border p-2 font-medium">Country</td>
                    <td className="border p-2">{propertyData.country || 'N/A'}</td>
                  </tr>
                  <tr>
                    <td className="border p-2 font-medium">Phone</td>
                    <td className="border p-2">{propertyData.phone || 'N/A'}</td>
                  </tr>
                  <tr>
                    <td className="border p-2 font-medium">Email</td>
                    <td className="border p-2">{propertyData.email || 'N/A'}</td>
                  </tr>
                </tbody>
              </table>
            </section>

            <section>
              <h2 className="text-lg font-semibold mb-4">Statistics</h2>
              <table className="w-full border-collapse">
                <tbody>
                  <tr>
                    <td className="border p-2 font-medium">Total Payments</td>
                    <td className="border p-2">{payments.length}</td>
                  </tr>
                  <tr>
                    <td className="border p-2 font-medium">Total Reviews</td>
                    <td className="border p-2">{reviews.length}</td>
                  </tr>
                  <tr>
                    <td className="border p-2 font-medium">Room Types</td>
                    <td className="border p-2">{roomTypes.length}</td>
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
