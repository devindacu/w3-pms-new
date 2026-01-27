# Extended Channel Manager API Services

This document describes the expanded API services for Booking.com and Airbnb integrations.

## Booking.com Extended API Services

Based on the official [Booking.com Connectivity API](https://developers.booking.com/connectivity/home), we've implemented the following services:

### 1. Property Management API

**Endpoint**: `POST /api/channels/booking-com/property`

Update property details on Booking.com.

**Request Body**:
```json
{
  "config": {
    "propertyId": "PROP123456",
    "apiKey": "your-api-key"
  },
  "propertyData": {
    "name": "Grand Hotel",
    "address": "123 Main Street",
    "city": "New York",
    "country": "USA",
    "phone": "+1 234 567 8900",
    "email": "contact@grandhotel.com"
  }
}
```

### 2. Room Types Management API

**Endpoint**: `POST /api/channels/booking-com/rooms`

Configure and update room types.

**Request Body**:
```json
{
  "config": { "propertyId": "...", "apiKey": "..." },
  "roomTypes": [
    {
      "id": "deluxe",
      "name": "Deluxe Room",
      "maxPersons": 2,
      "smoking": false
    }
  ]
}
```

### 3. Photos API

**Endpoint**: `POST /api/channels/booking-com/photos`

Upload photos for property or individual rooms.

**Request Body**:
```json
{
  "config": { "propertyId": "...", "apiKey": "..." },
  "photoData": {
    "type": "property",
    "photoUrl": "https://example.com/photo.jpg",
    "caption": "Lobby view"
  }
}
```

### 4. Facilities API

**Endpoint**: `POST /api/channels/booking-com/facilities`

Update amenities and facilities.

**Request Body**:
```json
{
  "config": { "propertyId": "...", "apiKey": "..." },
  "facilities": ["WiFi", "Pool", "Gym", "Restaurant", "Bar"]
}
```

### 5. Payments API

**Endpoint**: `POST /api/channels/booking-com/payments`

Retrieve payment and payout information.

**Request Body**:
```json
{
  "config": { "propertyId": "...", "apiKey": "..." },
  "startDate": "2024-01-01",
  "endDate": "2024-01-31"
}
```

### 6. Reviews API

**Endpoint**: `GET /api/channels/booking-com/reviews`

Fetch guest reviews.

**Query Parameters**:
- `config`: JSON stringified configuration
- `startDate`: Optional start date
- `endDate`: Optional end date

---

## Airbnb Extended API Services

Based on the official [Airbnb API for Developers](https://developer.airbnb.com/), we've implemented:

### 1. Listing Management API

**Endpoint**: `POST /api/channels/airbnb/listing`

Update listing details.

**Request Body**:
```json
{
  "config": {
    "propertyId": "listing-123",
    "apiKey": "key",
    "apiSecret": "secret"
  },
  "listingData": {
    "name": "Cozy Downtown Apartment",
    "description": "Beautiful 2BR apartment",
    "propertyType": "apartment",
    "roomType": "entire_place",
    "accommodates": 4,
    "bedrooms": 2,
    "beds": 2,
    "bathrooms": 1,
    "amenities": ["wifi", "kitchen", "washer"]
  }
}
```

### 2. Photos API

**Endpoint**: `POST /api/channels/airbnb/photos`

Upload listing photos.

**Request Body**:
```json
{
  "config": { "propertyId": "...", "apiKey": "...", "apiSecret": "..." },
  "photoUrl": "https://example.com/photo.jpg",
  "caption": "Living room view"
}
```

### 3. Messaging API

**Send Message**: `POST /api/channels/airbnb/messages`

Send message to a guest.

**Request Body**:
```json
{
  "config": { "propertyId": "...", "apiKey": "...", "apiSecret": "..." },
  "reservationId": "res-123",
  "message": "Thank you for your booking!"
}
```

**Get Messages**: `GET /api/channels/airbnb/messages/:reservationId`

Retrieve messages for a reservation.

### 4. Reviews API

**Get Reviews**: `GET /api/channels/airbnb/reviews`

Fetch all reviews for the listing.

**Respond to Review**: `POST /api/channels/airbnb/reviews/:reviewId/response`

Respond to a guest review.

**Request Body**:
```json
{
  "config": { "propertyId": "...", "apiKey": "...", "apiSecret": "..." },
  "response": "Thank you for your feedback!"
}
```

### 5. Pricing Rules API

**Endpoint**: `POST /api/channels/airbnb/pricing`

Update pricing configuration.

**Request Body**:
```json
{
  "config": { "propertyId": "...", "apiKey": "...", "apiSecret": "..." },
  "pricingRules": {
    "basePrice": 100,
    "weekendPrice": 120,
    "monthlyDiscount": 10,
    "weeklyDiscount": 5,
    "cleaningFee": 50,
    "extraPersonFee": 15
  }
}
```

### 6. Calendar API

**Endpoint**: `GET /api/channels/airbnb/calendar`

Get availability calendar.

**Query Parameters**:
- `config`: JSON stringified configuration
- `startDate`: Start date (ISO format)
- `endDate`: End date (ISO format)

### 7. Analytics API

**Endpoint**: `GET /api/channels/airbnb/analytics`

Fetch listing performance data.

**Query Parameters**:
- `config`: JSON stringified configuration
- `startDate`: Start date (ISO format)
- `endDate`: End date (ISO format)

---

## React Hooks for Frontend Integration

### useBookingComAPI

```typescript
import { useBookingComAPI } from '@/hooks/use-booking-com-api';

function MyComponent() {
  const {
    loading,
    error,
    updateProperty,
    updateRoomTypes,
    uploadPhoto,
    updateFacilities,
    getPayments,
    getReviews
  } = useBookingComAPI();

  const handleUpdate = async () => {
    const config = { propertyId: '...', apiKey: '...' };
    const propertyData = { name: 'My Hotel', city: 'NYC' };
    await updateProperty(config, propertyData);
  };

  // ... use other methods
}
```

### useAirbnbAPI

```typescript
import { useAirbnbAPI } from '@/hooks/use-airbnb-api';

function MyComponent() {
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

  const handleUpdate = async () => {
    const config = { propertyId: '...', apiKey: '...', apiSecret: '...' };
    const listingData = { name: 'My Apartment', accommodates: 4 };
    await updateListing(config, listingData);
  };

  // ... use other methods
}
```

---

## UI Components

### BookingComManagement

Comprehensive UI for managing Booking.com properties:

```tsx
import { BookingComManagement } from '@/components/BookingComManagement';

function MyPage() {
  return <BookingComManagement />;
}
```

**Features**:
- Property information form
- Room type configuration
- Photo upload interface
- Facilities management
- Payments data display
- Reviews display

### AirbnbManagement

Comprehensive UI for managing Airbnb listings:

```tsx
import { AirbnbManagement } from '@/components/AirbnbManagement';

function MyPage() {
  return <AirbnbManagement />;
}
```

**Features**:
- Listing details editor
- Photo upload interface
- Guest messaging panel
- Review management and response
- Pricing rules editor
- Calendar viewer
- Analytics dashboard

---

## API Authentication

### Booking.com

Uses **Basic Authentication** with Property ID and API Key:

```
Authorization: Basic base64(propertyId:apiKey)
```

### Airbnb

Uses **Bearer Token** authentication:

```
X-Airbnb-API-Key: your-api-key
Authorization: Bearer your-api-secret
```

---

## Error Handling

All APIs return consistent error responses:

```json
{
  "error": "Error description",
  "details": "Detailed error message"
}
```

HTTP Status Codes:
- `200`: Success
- `400`: Bad request (invalid parameters)
- `500`: Server error

---

## Testing

Both services include placeholder XML/JSON parsers. For production use:

1. **Booking.com**: Implement proper XML parser (recommended: `fast-xml-parser`)
2. **Airbnb**: JSON parsing is production-ready
3. Test with actual API credentials in a sandbox environment
4. Monitor rate limits and API quotas

---

## Rate Limits

Be aware of API rate limits:

- **Booking.com**: Varies by endpoint and partnership tier
- **Airbnb**: Varies by endpoint, typically 180 requests per minute

Implement exponential backoff and retry logic for failed requests.

---

## Next Steps

1. Obtain API credentials from respective platforms
2. Configure credentials in the UI components
3. Test basic operations (property/listing updates)
4. Implement webhook listeners for real-time updates
5. Add automated syncing schedules
6. Monitor API usage and performance

---

## Support Resources

- [Booking.com Developer Portal](https://developers.booking.com/connectivity/home)
- [Booking.com API Reference](https://developers.booking.com/connectivity/docs/api-reference)
- [Airbnb Developer Portal](https://developer.airbnb.com/)
- [Airbnb API Documentation](https://developer.airbnb.com/docs)

---

**Last Updated**: 2024-01-27
**Version**: 2.0.0
