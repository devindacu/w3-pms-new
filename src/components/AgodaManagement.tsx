import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  useAgodaAPI, 
  type AgodaConfig, 
  type AgodaPropertyData, 
  type AgodaRoomData,
  type AgodaRateData,
  type AgodaInventoryUpdate 
} from '@/hooks/use-agoda-api';
import { PrintButton } from '@/components/PrintButton';
import { A4PrintWrapper } from '@/components/A4PrintWrapper';
import { 
  Building, 
  Bed, 
  DollarSign, 
  Calendar, 
  Star,
  RefreshCw,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import { toast } from 'sonner';
import { formatDate } from '@/lib/helpers';

export function AgodaManagement() {
  const {
    loading,
    error,
    updateProperty,
    updateRooms,
    updateRates,
    updateInventory,
    getBookings,
    getReviews,
    syncAvailability
  } = useAgodaAPI();

  const [config, setConfig] = useState<AgodaConfig>({
    propertyId: '',
    apiKey: '',
    apiSecret: ''
  });

  const [propertyData, setPropertyData] = useState<AgodaPropertyData>({
    name: '',
    description: '',
    address: '',
    city: '',
    country: '',
    postalCode: '',
    phone: '',
    email: '',
    checkInTime: '14:00',
    checkOutTime: '12:00'
  });

  const [rooms, setRooms] = useState<AgodaRoomData[]>([
    {
      id: 'deluxe-001',
      name: 'Deluxe Room',
      description: 'Spacious room with city view',
      maxOccupancy: 2,
      bedType: 'King',
      roomSize: 30,
      smokingAllowed: false
    }
  ]);

  const [rates, setRates] = useState<AgodaRateData[]>([]);
  const [bookings, setBookings] = useState<any[]>([]);
  const [reviews, setReviews] = useState<any[]>([]);
  const [syncStatus, setSyncStatus] = useState<'idle' | 'syncing' | 'success' | 'error'>('idle');

  // State for new room form
  const [newRoom, setNewRoom] = useState<AgodaRoomData>({
    id: '',
    name: '',
    description: '',
    maxOccupancy: 2,
    bedType: 'King',
    roomSize: 0,
    smokingAllowed: false
  });

  // State for rate updates
  const [rateUpdate, setRateUpdate] = useState<AgodaRateData>({
    roomId: '',
    date: formatDate(Date.now()),
    baseRate: 0,
    currency: 'USD',
    availability: 0,
    minStay: 1,
    maxStay: 30,
    closedToArrival: false,
    closedToDeparture: false
  });

  const handleUpdateProperty = async () => {
    if (!config.propertyId || !config.apiKey || !config.apiSecret) {
      toast.error('Please enter all API credentials');
      return;
    }

    await updateProperty(config, propertyData);
  };

  const handleAddRoom = () => {
    if (!newRoom.id || !newRoom.name) {
      toast.error('Please enter room ID and name');
      return;
    }

    setRooms([...rooms, { ...newRoom }]);
    setNewRoom({
      id: '',
      name: '',
      description: '',
      maxOccupancy: 2,
      bedType: 'King',
      roomSize: 0,
      smokingAllowed: false
    });
    toast.success('Room added to list');
  };

  const handleRemoveRoom = (roomId: string) => {
    setRooms(rooms.filter(r => r.id !== roomId));
    toast.success('Room removed from list');
  };

  const handleUpdateRooms = async () => {
    if (!config.propertyId || !config.apiKey || !config.apiSecret) {
      toast.error('Please enter all API credentials');
      return;
    }

    if (rooms.length === 0) {
      toast.error('Please add at least one room');
      return;
    }

    await updateRooms(config, rooms);
  };

  const handleAddRate = () => {
    if (!rateUpdate.roomId || rateUpdate.baseRate <= 0) {
      toast.error('Please select a room and enter a valid rate');
      return;
    }

    setRates([...rates, { ...rateUpdate }]);
    toast.success('Rate added to list');
  };

  const handleUpdateRates = async () => {
    if (!config.propertyId || !config.apiKey || !config.apiSecret) {
      toast.error('Please enter all API credentials');
      return;
    }

    if (rates.length === 0) {
      toast.error('Please add at least one rate');
      return;
    }

    await updateRates(config, rates);
    setRates([]);
  };

  const handleGetBookings = async () => {
    if (!config.propertyId || !config.apiKey || !config.apiSecret) {
      toast.error('Please enter all API credentials');
      return;
    }

    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - 30);

    const result = await getBookings(config, startDate, endDate);
    if (result) {
      setBookings(result);
      toast.success(`Fetched ${result.length} bookings from Agoda`);
    }
  };

  const handleGetReviews = async () => {
    if (!config.propertyId || !config.apiKey || !config.apiSecret) {
      toast.error('Please enter all API credentials');
      return;
    }

    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - 90);

    const result = await getReviews(config, startDate, endDate);
    if (result) {
      setReviews(result);
      toast.success(`Fetched ${result.length} reviews from Agoda`);
    }
  };

  const handleSyncAvailability = async (roomId: string) => {
    if (!config.propertyId || !config.apiKey || !config.apiSecret) {
      toast.error('Please enter all API credentials');
      return;
    }

    setSyncStatus('syncing');
    const endDate = new Date();
    endDate.setDate(endDate.getDate() + 30);
    const startDate = new Date();

    const result = await syncAvailability(config, roomId, startDate, endDate);
    setSyncStatus(result ? 'success' : 'error');
    
    setTimeout(() => setSyncStatus('idle'), 3000);
  };

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Agoda Channel Management</h1>
          <p className="text-muted-foreground mt-1">
            Manage your property, rooms, rates, and bookings on Agoda
          </p>
        </div>
        <Badge variant={loading ? 'secondary' : error ? 'destructive' : 'default'}>
          {loading ? 'Loading...' : error ? 'Error' : 'Ready'}
        </Badge>
      </div>

      <Separator />

      {/* API Configuration */}
      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <Building className="w-5 h-5" />
          API Configuration
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label htmlFor="propertyId">Property ID *</Label>
            <Input
              id="propertyId"
              value={config.propertyId}
              onChange={(e) => setConfig({ ...config, propertyId: e.target.value })}
              placeholder="Enter Agoda Property ID"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="apiKey">API Key *</Label>
            <Input
              id="apiKey"
              type="password"
              value={config.apiKey}
              onChange={(e) => setConfig({ ...config, apiKey: e.target.value })}
              placeholder="Enter API Key"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="apiSecret">API Secret *</Label>
            <Input
              id="apiSecret"
              type="password"
              value={config.apiSecret}
              onChange={(e) => setConfig({ ...config, apiSecret: e.target.value })}
              placeholder="Enter API Secret"
            />
          </div>
        </div>
      </Card>

      {/* Tabs for different operations */}
      <Tabs defaultValue="property" className="space-y-4">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="property">Property</TabsTrigger>
          <TabsTrigger value="rooms">Rooms</TabsTrigger>
          <TabsTrigger value="rates">Rates & Inventory</TabsTrigger>
          <TabsTrigger value="bookings">Bookings</TabsTrigger>
          <TabsTrigger value="reviews">Reviews</TabsTrigger>
        </TabsList>

        {/* Property Tab */}
        <TabsContent value="property">
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Property Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="propName">Property Name</Label>
                <Input
                  id="propName"
                  value={propertyData.name}
                  onChange={(e) => setPropertyData({ ...propertyData, name: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="city">City</Label>
                <Input
                  id="city"
                  value={propertyData.city}
                  onChange={(e) => setPropertyData({ ...propertyData, city: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="country">Country</Label>
                <Input
                  id="country"
                  value={propertyData.country}
                  onChange={(e) => setPropertyData({ ...propertyData, country: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Phone</Label>
                <Input
                  id="phone"
                  value={propertyData.phone}
                  onChange={(e) => setPropertyData({ ...propertyData, phone: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={propertyData.email}
                  onChange={(e) => setPropertyData({ ...propertyData, email: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="checkIn">Check-in Time</Label>
                <Input
                  id="checkIn"
                  type="time"
                  value={propertyData.checkInTime}
                  onChange={(e) => setPropertyData({ ...propertyData, checkInTime: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="checkOut">Check-out Time</Label>
                <Input
                  id="checkOut"
                  type="time"
                  value={propertyData.checkOutTime}
                  onChange={(e) => setPropertyData({ ...propertyData, checkOutTime: e.target.value })}
                />
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="address">Address</Label>
                <Input
                  id="address"
                  value={propertyData.address}
                  onChange={(e) => setPropertyData({ ...propertyData, address: e.target.value })}
                />
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={propertyData.description}
                  onChange={(e) => setPropertyData({ ...propertyData, description: e.target.value })}
                  rows={3}
                />
              </div>
            </div>
            <div className="mt-6">
              <Button onClick={handleUpdateProperty} disabled={loading} className="w-full md:w-auto">
                {loading ? 'Updating...' : 'Update Property on Agoda'}
              </Button>
            </div>
          </Card>
        </TabsContent>

        {/* Rooms Tab */}
        <TabsContent value="rooms">
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Bed className="w-5 h-5" />
              Room Management
            </h3>
            
            {/* Current Rooms */}
            {rooms.length > 0 && (
              <div className="mb-6 space-y-2">
                <h4 className="font-medium">Current Rooms ({rooms.length})</h4>
                {rooms.map((room) => (
                  <div key={room.id} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                    <div className="flex-1">
                      <p className="font-medium">{room.name} ({room.id})</p>
                      <p className="text-sm text-muted-foreground">
                        {room.maxOccupancy} guests • {room.bedType} • {room.roomSize}m²
                        {room.smokingAllowed && ' • Smoking Allowed'}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleSyncAvailability(room.id)}
                        disabled={syncStatus === 'syncing'}
                      >
                        <RefreshCw className={`w-4 h-4 ${syncStatus === 'syncing' ? 'animate-spin' : ''}`} />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRemoveRoom(room.id)}
                      >
                        Remove
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Add New Room */}
            <div className="space-y-4 p-4 bg-muted/50 rounded-lg">
              <h4 className="font-medium">Add New Room</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="roomId">Room ID *</Label>
                  <Input
                    id="roomId"
                    value={newRoom.id}
                    onChange={(e) => setNewRoom({ ...newRoom, id: e.target.value })}
                    placeholder="e.g., deluxe-001"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="roomName">Room Name *</Label>
                  <Input
                    id="roomName"
                    value={newRoom.name}
                    onChange={(e) => setNewRoom({ ...newRoom, name: e.target.value })}
                    placeholder="e.g., Deluxe Room"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="maxOccupancy">Max Occupancy</Label>
                  <Input
                    id="maxOccupancy"
                    type="number"
                    value={newRoom.maxOccupancy}
                    onChange={(e) => setNewRoom({ ...newRoom, maxOccupancy: parseInt(e.target.value) || 0 })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="bedType">Bed Type</Label>
                  <Select
                    value={newRoom.bedType}
                    onValueChange={(value) => setNewRoom({ ...newRoom, bedType: value })}
                  >
                    <SelectTrigger id="bedType">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="King">King</SelectItem>
                      <SelectItem value="Queen">Queen</SelectItem>
                      <SelectItem value="Twin">Twin</SelectItem>
                      <SelectItem value="Double">Double</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="roomSize">Room Size (m²)</Label>
                  <Input
                    id="roomSize"
                    type="number"
                    value={newRoom.roomSize}
                    onChange={(e) => setNewRoom({ ...newRoom, roomSize: parseFloat(e.target.value) || 0 })}
                  />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="roomDescription">Description</Label>
                  <Textarea
                    id="roomDescription"
                    value={newRoom.description}
                    onChange={(e) => setNewRoom({ ...newRoom, description: e.target.value })}
                    rows={2}
                  />
                </div>
              </div>
              <Button onClick={handleAddRoom}>Add Room to List</Button>
            </div>

            <div className="mt-6">
              <Button onClick={handleUpdateRooms} disabled={loading || rooms.length === 0} className="w-full md:w-auto">
                {loading ? 'Updating...' : `Update ${rooms.length} Room(s) on Agoda`}
              </Button>
            </div>
          </Card>
        </TabsContent>

        {/* Rates & Inventory Tab */}
        <TabsContent value="rates">
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <DollarSign className="w-5 h-5" />
              Rates & Availability
            </h3>
            
            {/* Pending Rates */}
            {rates.length > 0 && (
              <div className="mb-6 space-y-2">
                <h4 className="font-medium">Pending Rate Updates ({rates.length})</h4>
                {rates.map((rate, idx) => (
                  <div key={idx} className="flex items-center justify-between p-3 bg-muted rounded-lg text-sm">
                    <div>
                      <span className="font-medium">{rate.roomId}</span> • {rate.date} • 
                      {rate.currency} {rate.baseRate} • {rate.availability} rooms
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Add Rate Update */}
            <div className="space-y-4 p-4 bg-muted/50 rounded-lg">
              <h4 className="font-medium">Add Rate Update</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="rateRoomId">Room ID *</Label>
                  <Select
                    value={rateUpdate.roomId}
                    onValueChange={(value) => setRateUpdate({ ...rateUpdate, roomId: value })}
                  >
                    <SelectTrigger id="rateRoomId">
                      <SelectValue placeholder="Select room" />
                    </SelectTrigger>
                    <SelectContent>
                      {rooms.map((room) => (
                        <SelectItem key={room.id} value={room.id}>
                          {room.name} ({room.id})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="rateDate">Date</Label>
                  <Input
                    id="rateDate"
                    type="date"
                    value={rateUpdate.date}
                    onChange={(e) => setRateUpdate({ ...rateUpdate, date: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="baseRate">Rate *</Label>
                  <Input
                    id="baseRate"
                    type="number"
                    value={rateUpdate.baseRate}
                    onChange={(e) => setRateUpdate({ ...rateUpdate, baseRate: parseFloat(e.target.value) || 0 })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="availability">Availability</Label>
                  <Input
                    id="availability"
                    type="number"
                    value={rateUpdate.availability}
                    onChange={(e) => setRateUpdate({ ...rateUpdate, availability: parseInt(e.target.value) || 0 })}
                  />
                </div>
              </div>
              <Button onClick={handleAddRate}>Add to Rate List</Button>
            </div>

            <div className="mt-6">
              <Button onClick={handleUpdateRates} disabled={loading || rates.length === 0} className="w-full md:w-auto">
                {loading ? 'Updating...' : `Push ${rates.length} Rate Update(s) to Agoda`}
              </Button>
            </div>
          </Card>
        </TabsContent>

        {/* Bookings Tab */}
        <TabsContent value="bookings">
          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <Calendar className="w-5 h-5" />
                Bookings
              </h3>
              <Button onClick={handleGetBookings} disabled={loading}>
                {loading ? 'Loading...' : 'Fetch Bookings (Last 30 Days)'}
              </Button>
            </div>

            {bookings.length > 0 ? (
              <div className="space-y-2">
                {bookings.map((booking, idx) => (
                  <div key={idx} className="p-4 bg-muted rounded-lg">
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="font-medium">{booking.guestName}</p>
                        <p className="text-sm text-muted-foreground">
                          Booking ID: {booking.bookingId}
                        </p>
                        <p className="text-sm mt-1">
                          {booking.checkIn} to {booking.checkOut} • {booking.roomType}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold">{booking.currency} {booking.totalAmount}</p>
                        <Badge variant={booking.status === 'confirmed' ? 'default' : 'secondary'}>
                          {booking.status}
                        </Badge>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                No bookings loaded. Click "Fetch Bookings" to retrieve recent bookings from Agoda.
              </div>
            )}
          </Card>
        </TabsContent>

        {/* Reviews Tab */}
        <TabsContent value="reviews">
          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <Star className="w-5 h-5" />
                Reviews
              </h3>
              <Button onClick={handleGetReviews} disabled={loading}>
                {loading ? 'Loading...' : 'Fetch Reviews (Last 90 Days)'}
              </Button>
            </div>

            {reviews.length > 0 ? (
              <div className="space-y-3">
                {reviews.map((review, idx) => (
                  <div key={idx} className="p-4 bg-muted rounded-lg">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <p className="font-medium">{review.guestName}</p>
                        <div className="flex items-center gap-1 mt-1">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className={`w-4 h-4 ${i < review.rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`}
                            />
                          ))}
                        </div>
                      </div>
                      <p className="text-sm text-muted-foreground">{review.date}</p>
                    </div>
                    <p className="text-sm">{review.comment}</p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                No reviews loaded. Click "Fetch Reviews" to retrieve recent reviews from Agoda.
              </div>
            )}
          </Card>
        </TabsContent>
      </Tabs>

      {/* Error Display */}
      {error && (
        <Card className="p-4 border-destructive bg-destructive/10">
          <div className="flex items-center gap-2 text-destructive">
            <AlertCircle className="w-5 h-5" />
            <p className="font-medium">{error}</p>
          </div>
        </Card>
      )}
    </div>
  );
}
