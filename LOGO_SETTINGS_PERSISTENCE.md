# Logo and Settings Persistence - Implementation Summary

## Overview
This document describes the implementation of logo and settings persistence functionality for the W3 Hotel PMS system.

## Problem Statement
Previously, branding settings (including logo, favicon, and other customization options) were stored only in browser localStorage using the `useKV` hook from GitHub Spark. This meant that when a user refreshed the page or accessed the system from a different browser, all customization settings would be lost.

## Solution Implemented

### 1. Database Storage
Branding settings are now persisted in the PostgreSQL database using the existing `systemSettings` table.

**Storage Format:**
- Key: `'branding'`
- Value: JSON string containing the complete `HotelBranding` object
- Category: `'branding'`
- Description: `'Hotel branding and customization settings'`

### 2. Server API Endpoints

#### GET /api/branding
Retrieves the current branding settings from the database.

**Response:**
```json
{
  "id": "branding-1",
  "hotelName": "W3 Hotel",
  "logo": "data:image/png;base64,...",
  "favicon": "data:image/png;base64,...",
  "emailHeaderLogo": "data:image/png;base64,...",
  "colorScheme": {
    "primary": "#2c5f2d",
    "secondary": "#97bc62",
    "accent": "#4a7c59"
  },
  // ... other branding properties
}
```

#### POST /api/branding
Saves or updates branding settings in the database.

**Request Body:**
```json
{
  "hotelName": "W3 Hotel",
  "logo": "data:image/png;base64,...",
  // ... other branding properties
}
```

**Features:**
- Automatic upsert (insert or update)
- Handles duplicate key conflicts gracefully
- Returns the saved branding object

### 3. Frontend Integration

#### BrandingSettings Component
Updated to save settings to the database instead of just localStorage.

**Changes Made:**
```typescript
const handleSave = async () => {
  try {
    const updatedBranding = {
      ...formData,
      updatedAt: Date.now(),
      updatedBy: currentUser.userId
    };

    // Save to database
    const response = await fetch('/api/branding', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updatedBranding),
    });

    if (!response.ok) {
      throw new Error('Failed to save branding to database');
    }

    const savedBranding = await response.json();
    
    // Update local state
    setBranding(() => savedBranding);
    
    toast.success('Branding settings saved successfully to database');
  } catch (error) {
    console.error('Error saving branding:', error);
    toast.error('Failed to save branding settings. Please try again.');
  }
};
```

#### App.tsx Component
Added automatic loading of branding settings from the database on application initialization.

**Changes Made:**
```typescript
// Load branding from database on app initialization
useEffect(() => {
  const loadBranding = async () => {
    try {
      const response = await fetch('/api/branding');
      if (response.ok) {
        const savedBranding = await response.json();
        if (savedBranding) {
          setBranding(savedBranding);
        }
      }
    } catch (error) {
      console.error('Failed to load branding from database:', error);
      // If branding fails to load, use local storage or defaults
    }
  };
  
  loadBranding();
}, []);
```

## Benefits

1. **Persistence Across Sessions**: Branding settings are preserved even after browser refresh or when accessing from different devices
2. **Multi-User Consistency**: All users see the same branding settings
3. **Centralized Management**: Settings are managed in a single database location
4. **Backup and Recovery**: Branding settings are included in database backups
5. **Audit Trail**: Database includes `createdAt` and `updatedAt` timestamps

## Testing Requirements

To test the logo persistence functionality, you need to:

1. Set up the `DATABASE_URL` environment variable pointing to your PostgreSQL database
2. Run database migrations using `npm run db:push`
3. Start the application with `npm run dev`
4. Navigate to Settings → Branding
5. Upload a logo and save settings
6. Refresh the page and verify the logo persists

## Technical Notes

- Logo files are converted to base64 strings before storage (max 2MB per image)
- The implementation maintains backward compatibility with localStorage for offline usage
- Error handling ensures graceful degradation if database is unavailable
- The same pattern can be applied to other settings (DialogSettings, etc.)

## Future Enhancements

1. Add image compression to reduce base64 size
2. Consider using object storage (S3, etc.) for larger images
3. Implement version control for branding settings
4. Add API endpoints for branding history/rollback
5. Extend to other settings categories (dialog settings, user preferences, etc.)
