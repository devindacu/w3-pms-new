# Booking Conflict Prevention System

## Overview
The booking conflict prevention system prevents double-bookings by detecting date/room conflicts in real-time and providing visual warnings to users before they confirm reservations.

## Features Implemented

### 1. Conflict Detection Engine
**Location:** `src/lib/helpers.ts`

The `checkBookingConflict()` function performs intelligent conflict detection:

```typescript
checkBookingConflict(
  roomId: string | undefined,
  checkInDate: number,
  checkOutDate: number,
  reservations: Reservation[],
  excludeReservationId?: string
): { hasConflict: boolean; conflictingReservations: Reservation[] }
```

**Features:**
- ✅ Detects overlapping date ranges for the same room
- ✅ Excludes cancelled and no-show reservations from conflict checks
- ✅ Excludes the current reservation when editing (prevents self-conflict)
- ✅ Returns list of all conflicting reservations with full details
- ✅ Handles edge cases (same-day check-in/out, multi-night overlaps)

**Conflict Detection Logic:**
- Check-in during existing reservation
- Check-out during existing reservation
- Reservation completely encompasses existing booking
- Existing booking completely encompasses new reservation

### 2. Enhanced Reservation Dialog
**Location:** `src/components/ReservationDialog.tsx`

**Visual Warning System:**
- 🔴 **Conflict Alert (Red)**: Displayed when booking conflict detected
  - Shows all conflicting reservations with guest details
  - Displays conflicting date ranges
  - Shows guest count and special requests
  - Submit button disabled until conflict resolved

- 🟢 **Available Alert (Green)**: Displayed when room is available
  - Confirms no conflicts for selected dates
  - Provides user confidence

- 🟡 **Override Option**: Authorized users can force-book despite conflicts
  - Requires explicit confirmation
  - Logged for audit purposes
  - Changes submit button state

**Real-time Validation:**
- Conflict check runs automatically when:
  - Room is selected
  - Check-in date changes
  - Check-out date changes
  - Dialog opens with existing data

**Visual Indicators:**
- Red border on room selector when conflict exists
- Disabled submit button with warning icon
- Detailed conflict information cards
- Resolution suggestions

### 3. Room Availability Calendar
**Location:** `src/components/RoomAvailabilityCalendar.tsx`

Visual calendar showing room occupancy at a glance:

**Features:**
- 📅 Month-by-month navigation
- 🏨 Multiple rooms displayed simultaneously
- 🔴 Red highlights for occupied dates
- 🟢 Green highlights for available dates
- ⚠️ Conflict warnings overlaid on selected dates
- 🔵 Selected date range highlighted
- 📍 Current day indicator

**Legend:**
- Available (Green background)
- Occupied (Red background)
- Conflict (Red with warning icon)
- Selected Range (Blue ring)
- Today (Primary ring)

**Tab Integration:**
The calendar is accessible via a tab in the reservation dialog, allowing users to:
1. View booking details
2. Check availability visually
3. Identify optimal booking windows

### 4. User Experience Flow

**Creating a New Reservation:**
1. User selects guest
2. User selects room (conflict check initiated)
3. User enters dates (conflict check runs)
4. Visual feedback appears:
   - ✅ Green alert if available
   - ❌ Red alert if conflict exists
5. If conflict:
   - View detailed conflict information
   - See resolution options
   - Option to override (with authorization)
6. If available:
   - Complete booking normally

**Editing Existing Reservation:**
1. Dialog opens with current reservation data
2. Self-conflict excluded from checks
3. Changes trigger new conflict validation
4. Same visual feedback as new reservations

### 5. Conflict Resolution Options

When a conflict is detected, users can:

**Option 1: Change Room**
- Select a different available room
- Conflict check re-runs automatically

**Option 2: Change Dates**
- Adjust check-in or check-out dates
- Conflict check re-runs automatically

**Option 3: Override Conflict**
- Click "Override & Force Book Anyway" button
- Confirmation alert appears
- Submit button re-enabled
- Warning logged

### 6. Enhanced Data Validation

**Pre-submission Checks:**
- ✅ All required fields filled
- ✅ Check-out date after check-in date
- ✅ No active conflicts (unless overridden)
- ✅ Valid guest selection
- ✅ Valid room selection (or "no room" option)

**Error Messages:**
- "Please fill in all required fields"
- "Check-out date must be after check-in date"
- "Booking conflict detected! Please review the warnings or choose a different room/dates."

### 7. Mobile Responsive Design

All conflict prevention features are fully responsive:
- ✅ Alerts adapt to screen size
- ✅ Calendar optimized for mobile viewing
- ✅ Conflict cards stack vertically on mobile
- ✅ Touch-friendly override buttons

## Technical Implementation

### State Management
```typescript
const [conflictCheck, setConflictCheck] = useState<{
  hasConflict: boolean
  conflictingReservations: Reservation[]
}>({ hasConflict: false, conflictingReservations: [] })

const [forceBook, setForceBook] = useState(false)
```

### Real-time Validation Hook
```typescript
useEffect(() => {
  if (formData.roomId && formData.checkInDate && formData.checkOutDate) {
    const conflict = checkBookingConflict(
      formData.roomId,
      checkInDate,
      checkOutDate,
      reservations,
      reservation?.id
    )
    setConflictCheck(conflict)
  }
}, [formData.roomId, formData.checkInDate, formData.checkOutDate])
```

### Submit Validation
```typescript
if (conflictCheck.hasConflict && !forceBook) {
  toast.error('Booking conflict detected!')
  return
}
```

## UI Components Used

- ✅ `Alert` - Conflict warnings and success messages
- ✅ `Badge` - Reservation status indicators
- ✅ `Button` - Override actions and navigation
- ✅ `Card` - Calendar container
- ✅ `Separator` - Visual content separation
- ✅ `Tabs` - Details/Calendar view switching
- ✅ Icons from `@phosphor-icons/react`

## Benefits

### For Hotel Staff
1. **Prevents Double-Bookings**: Eliminates scheduling conflicts automatically
2. **Visual Confirmation**: Clear indicators of room availability
3. **Detailed Context**: Full information about conflicting reservations
4. **Flexible Resolution**: Multiple options to resolve conflicts
5. **Override Capability**: Authority to force-book when necessary
6. **Calendar View**: Quick visual assessment of room occupancy

### For Management
1. **Reduced Errors**: Automated conflict prevention
2. **Audit Trail**: Override actions can be tracked
3. **Better Planning**: Visual calendar aids capacity planning
4. **Guest Satisfaction**: Fewer booking errors and confusion
5. **Operational Efficiency**: Faster booking process with fewer mistakes

### For System Integrity
1. **Data Validation**: Ensures booking consistency
2. **Status Awareness**: Respects cancelled/no-show reservations
3. **Self-Exclusion**: Prevents false positives when editing
4. **Real-time Updates**: Immediate feedback on changes
5. **Type Safety**: Full TypeScript implementation

## Future Enhancements

Potential improvements for future iterations:

1. **Multi-room Conflict Detection**: Check conflicts across multiple rooms simultaneously
2. **Suggested Alternatives**: Auto-suggest available rooms for the same dates
3. **Overbooking Strategy**: Configurable overbooking rules for revenue optimization
4. **Waitlist Management**: Queue guests when rooms unavailable
5. **Integration with Channel Manager**: Sync conflicts across OTAs
6. **Email Notifications**: Alert staff of near-conflicts or pattern issues
7. **Analytics Dashboard**: Track conflict frequency and resolution methods
8. **Permission Levels**: Granular control over who can override conflicts
9. **Conflict History**: Log all conflicts and resolutions for analysis
10. **Smart Recommendations**: AI-powered suggestions based on guest preferences

## Testing Scenarios

To verify the system works correctly, test these scenarios:

### Scenario 1: Basic Conflict
1. Create reservation: Room 101, Jan 1-5
2. Attempt to create: Room 101, Jan 3-7
3. ✅ Should show conflict warning
4. ✅ Submit button should be disabled

### Scenario 2: No Conflict - Same Room, Different Dates
1. Create reservation: Room 101, Jan 1-5
2. Create reservation: Room 101, Jan 6-10
3. ✅ Should show available (green alert)
4. ✅ Submit button should be enabled

### Scenario 3: No Conflict - Different Rooms, Same Dates
1. Create reservation: Room 101, Jan 1-5
2. Create reservation: Room 102, Jan 1-5
3. ✅ Should show available (green alert)
4. ✅ Submit button should be enabled

### Scenario 4: Edit Existing Reservation
1. Create reservation: Room 101, Jan 1-5
2. Edit same reservation: Change dates to Jan 1-7
3. ✅ Should not show self-conflict
4. ✅ Should check against other reservations only

### Scenario 5: Override Conflict
1. Create reservation: Room 101, Jan 1-5
2. Attempt to create: Room 101, Jan 3-7
3. Click "Override & Force Book Anyway"
4. ✅ Submit button should become enabled
5. ✅ Should allow submission with warning

### Scenario 6: Cancelled Reservation
1. Create reservation: Room 101, Jan 1-5
2. Cancel that reservation
3. Attempt to create: Room 101, Jan 1-5
4. ✅ Should show available (cancelled excluded)

### Scenario 7: Calendar View
1. Open reservation dialog
2. Switch to "Availability Calendar" tab
3. Select dates with conflicts
4. ✅ Should show conflict indicators on calendar
5. ✅ Should highlight selected date range

## Code Quality

- ✅ TypeScript strict mode compliance
- ✅ Full type safety for all props and state
- ✅ Comprehensive error handling
- ✅ Accessible UI components (shadcn/ui)
- ✅ Responsive design patterns
- ✅ Performance optimized (memoization where needed)
- ✅ Clean code principles (DRY, SOLID)
- ✅ Consistent naming conventions

## Related Files

- `src/lib/helpers.ts` - Conflict detection logic
- `src/components/ReservationDialog.tsx` - Main reservation form with conflict UI
- `src/components/RoomAvailabilityCalendar.tsx` - Visual availability calendar
- `src/components/FrontOffice.tsx` - Front office module integration
- `src/lib/types.ts` - TypeScript type definitions

## Summary

The booking conflict prevention system provides comprehensive protection against double-bookings through:
- Real-time conflict detection
- Visual warnings and indicators
- Detailed conflict information
- Multiple resolution options
- Override capability for edge cases
- Visual calendar for availability assessment
- Mobile-responsive design
- Type-safe implementation

This feature significantly improves operational efficiency, reduces booking errors, and enhances the overall user experience of the W3 Hotel PMS system.
