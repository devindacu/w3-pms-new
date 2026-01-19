# Select.Item Empty Value Error Fix

## Issue Description
Runtime error: "A <Select.Item /> must have a value prop that is not an empty string."

This error occurs when a `SelectItem` component from shadcn's Select is rendered with an empty string as its value prop.

## Root Cause
The error was caused by dynamically mapping data arrays to `SelectItem` components where some records contained empty or null IDs/codes that were being used as the `value` prop.

## Files Fixed

### 1. RoomDialog.tsx
**Location:** `/workspaces/spark-template/src/components/RoomDialog.tsx`
**Issue:** Room type configurations with empty `code` values were being mapped to SelectItems
**Fix:** Added filtering to exclude room types with empty or whitespace-only codes:
```typescript
{(roomTypes || []).filter(rt => rt.isActive && rt.code && rt.code.trim() !== '').map(rt => (
  <SelectItem key={rt.id} value={rt.code}>
    {rt.name}
  </SelectItem>
))}
```

### 2. ReservationDialog.tsx
**Location:** `/workspaces/spark-template/src/components/ReservationDialog.tsx`
**Issue:** Guest and room data with empty IDs were being mapped to SelectItems
**Fixes:**
1. Guest selection - Added filtering to exclude guests with empty IDs:
```typescript
{guests.filter(guest => guest.id && guest.id.trim() !== '').map(guest => (
  <SelectItem key={guest.id} value={guest.id}>
    {guest.firstName} {guest.lastName} - {guest.phone}
  </SelectItem>
))}
```

2. Room selection - Added filtering to exclude rooms with empty IDs:
```typescript
{availableRooms.filter(room => room.id && room.id.trim() !== '').map(room => (
  <SelectItem key={room.id} value={room.id}>
    {room.roomNumber} - {room.roomType} (LKR {room.baseRate}/night)
  </SelectItem>
))}
```

## Prevention Pattern
When mapping data arrays to SelectItems, always filter out records with empty or invalid values:

```typescript
// ❌ WRONG - Can cause empty string errors
{dataArray.map(item => (
  <SelectItem key={item.id} value={item.id}>
    {item.name}
  </SelectItem>
))}

// ✅ CORRECT - Filters out empty values
{dataArray.filter(item => item.id && item.id.trim() !== '').map(item => (
  <SelectItem key={item.id} value={item.id}>
    {item.name}
  </SelectItem>
))}
```

## Testing
- ✅ Room Dialog with room type selection
- ✅ Reservation Dialog with guest selection
- ✅ Reservation Dialog with room selection

## Additional Notes
- The fix ensures data integrity by preventing empty values from being used in Select components
- Similar patterns have been applied in AdvancedFilterDialog.tsx (line 212) which was already implementing this safeguard
- All dialogs that dynamically populate Select components from data arrays should follow this pattern

## TypeScript Errors
Note: There are pre-existing TypeScript errors in the codebase (mainly in crossModuleIntegration.ts, nightAuditHelpers.ts, and trendAnalysis.ts) that are unrelated to this Select.Item fix. These errors involve type mismatches in cross-module integration code and will need to be addressed separately.

## Status
✅ **FIXED** - The runtime Select.Item error has been resolved by adding proper filtering to prevent empty string values in SelectItem components.
