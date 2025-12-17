# Dashboard Customization Guide

## Overview

The W3 Hotel PMS now features a fully customizable dashboard with drag-and-drop functionality, allowing users to personalize their dashboard layout according to their role and preferences.

## Features

### 🎯 Core Capabilities

1. **Drag-and-Drop Reordering**
   - Simply drag widgets to reorder them
   - Visual feedback during dragging
   - Smooth animations and transitions

2. **Widget Management**
   - Add new widgets from a categorized library
   - Remove unwanted widgets
   - Show/hide widgets without removing them
   - Adjust widget sizes (Small, Medium, Large, Full Width)

3. **Layout Customization**
   - Choose between 1-4 column layouts
   - Live preview of layout changes
   - Responsive design for all screen sizes

4. **Role-Based Presets**
   - Pre-configured layouts for each user role
   - Recommended widgets based on role
   - Quick-add recommended widgets

5. **Import/Export**
   - Export dashboard layouts as JSON
   - Import saved layouts
   - Share layouts between users

6. **Layout Operations**
   - Duplicate existing layouts
   - Reset to default layout
   - Save custom layouts

## Available Widgets

### Operations
- **Occupancy** - Current room occupancy rate
- **Housekeeping** - Room cleaning status
- **Maintenance Status** - Active maintenance requests
- **Room Status** - Detailed room status overview
- **Arrivals & Departures** - Today's check-ins and check-outs

### Revenue & Finance
- **Revenue Today** - Daily revenue tracker
- **Revenue Chart** - Visual revenue trends
- **Financial Summary** - Comprehensive financial overview
- **Channel Performance** - OTA and booking channel metrics

### Inventory
- **Amenities Stock** - Housekeeping amenities levels
- **Food Inventory** - Kitchen food stock
- **Low Stock** - Items requiring reorder
- **Maintenance & Construction** - Construction materials inventory

### F&B
- **F&B Performance** - Restaurant and bar metrics
- **Kitchen Operations** - Kitchen workflow and production

### CRM & Guests
- **Guest Feedback** - Recent guest reviews and comments
- **CRM Summary** - Guest relationship overview

### Performance
- **Occupancy Chart** - Visual occupancy trends
- **Department Performance** - Team and department metrics
- **Pending Approvals** - Items requiring approval

## How to Customize Your Dashboard

### Opening the Customization Panel

1. Click the **"Customize Dashboard"** button in the top-right corner of your dashboard
2. The customization dialog will open with two tabs: **Widgets** and **Layout Settings**

### Managing Widgets (Widgets Tab)

#### Reordering Widgets
1. **Drag Method**: Click and hold the drag handle (⋮⋮) on any widget card
2. Drag the widget to the desired position
3. Drop it where you want it to appear
4. The order updates immediately

#### Adding Widgets
1. Scroll to the "Add New Widgets" section
2. Widgets are organized by category
3. Click the **"+ Widget Name"** button to add
4. Already added widgets show a checkmark and are disabled

#### Adjusting Widget Size
1. Use the dropdown menu on each widget card
2. Choose from:
   - **Small**: Single column width
   - **Medium**: Spans appropriately based on layout
   - **Large**: Spans 2 columns
   - **Full**: Full dashboard width

#### Hiding/Showing Widgets
1. Click the eye icon (👁️) to toggle visibility
2. Hidden widgets remain in your layout but don't display
3. Easily re-enable them later without re-adding

#### Removing Widgets
1. Click the trash icon (🗑️) on the widget card
2. Widget is permanently removed from your layout
3. Can be re-added from the "Add New Widgets" section

### Configuring Layout (Layout Settings Tab)

#### Choosing Columns
1. Select between 1-4 column layouts
2. Click the desired column button
3. Preview updates in real-time

#### Layout Preview
- See exactly how your dashboard will look
- Widgets are displayed in their actual positions
- Color-coded by widget type

#### Role-Based Recommendations
- View widgets recommended for your role
- Click badges to quick-add recommended widgets
- Checkmarks (✓) indicate already-added widgets

#### Layout Statistics
- **Total Widgets**: All widgets in your layout
- **Visible**: Currently displayed widgets
- **Hidden**: Widgets that are hidden

### Advanced Actions

#### Export Layout
1. Click the **"Export"** button
2. Layout is saved as a JSON file
3. Use this to backup or share your layout

#### Import Layout
1. Click the **"Import"** button
2. Select a previously exported JSON file
3. Layout is immediately applied
4. Review and save to confirm

#### Duplicate Layout
1. Click the **"Duplicate"** button
2. Creates a copy of your current layout
3. Name is automatically appended with "(Copy)"
4. Modify without affecting the original

#### Reset to Default
1. Click the **"Reset"** button
2. Restores the default layout for your role
3. All customizations are removed
4. Use this if you want to start fresh

### Saving Your Changes

1. Review your customizations in both tabs
2. Check the layout preview
3. Click **"Save Layout"** in the bottom-right
4. Your dashboard updates immediately
5. Layout is saved to your user preferences

## Role-Based Default Layouts

### Administrator
- **Columns**: 3
- **Focus**: Complete oversight of all operations
- **Default Widgets**: Occupancy, Revenue Today, Financial Summary, Department Performance, Pending Approvals, Housekeeping, Room Status, Channel Performance

### Manager
- **Columns**: 2
- **Focus**: Operations, revenue, and team performance
- **Default Widgets**: Occupancy, Revenue Today, Housekeeping, F&B Performance, Pending Approvals, CRM Summary, Room Status

### Front Desk
- **Columns**: 2
- **Focus**: Guest arrivals, departures, and reservations
- **Default Widgets**: Arrivals & Departures, Occupancy, Room Status, Housekeeping, Guest Feedback

### Housekeeper
- **Columns**: 2
- **Focus**: Room status and cleaning tasks
- **Default Widgets**: Housekeeping, Room Status, Amenities Stock, Occupancy

### Chef
- **Columns**: 2
- **Focus**: Kitchen operations and food inventory
- **Default Widgets**: Kitchen Operations, F&B Performance, Food Inventory, Low Stock

### Accountant
- **Columns**: 2
- **Focus**: Financial tracking and reporting
- **Default Widgets**: Revenue Today, Financial Summary, Pending Approvals, Revenue Chart, Occupancy

### Procurement Manager
- **Columns**: 2
- **Focus**: Inventory and supplier management
- **Default Widgets**: Low Stock, Food Inventory, Amenities Stock, Maintenance & Construction, Pending Approvals

## Widget Sizing Guidelines

### Small Widgets
Best for: Single metrics, KPIs, quick stats
- Occupancy percentage
- Revenue today
- Single inventory counts

### Medium Widgets
Best for: Lists, tables, small charts
- Recent activity feeds
- Department summaries
- Pending items

### Large Widgets
Best for: Detailed tables, large charts
- Room status grid
- Revenue charts
- Performance dashboards

### Full Width Widgets
Best for: Comprehensive overviews, reports
- Complete room status
- Full revenue breakdown
- Detailed analytics

## Best Practices

### 1. Prioritize Your Workflow
- Place most-used widgets at the top
- Group related widgets together
- Hide rarely-used widgets instead of removing them

### 2. Balance Information Density
- Mix small and large widgets for visual interest
- Don't overcrowd your dashboard
- Use appropriate widget sizes for content

### 3. Utilize Role Recommendations
- Start with recommended widgets for your role
- Add specialized widgets as needed
- Consider widgets used by similar roles

### 4. Regular Review
- Review your layout monthly
- Adjust based on changing responsibilities
- Export successful layouts as backups

### 5. Experiment Safely
- Use duplicate to test new layouts
- Export before major changes
- Reset to default if needed

## Keyboard Shortcuts

While in the customization dialog:
- **Tab**: Navigate between interactive elements
- **Escape**: Close the dialog (changes not saved)
- **Enter**: Save layout (when Save button is focused)

## Troubleshooting

### Widgets Not Reordering
- Ensure you're dragging from the drag handle (⋮⋮)
- Try refreshing the page
- Check that you're in the Widgets tab

### Layout Not Saving
- Ensure you click "Save Layout" before closing
- Check for error notifications
- Verify you have permission to save layouts

### Missing Widgets
- Check if widgets are hidden (eye icon)
- Verify widgets weren't removed
- Try resetting to default layout

### Import Not Working
- Ensure the JSON file is valid
- Check file wasn't corrupted
- Try exporting and re-importing

## Technical Details

### Data Persistence
- Layouts are saved using `useKV` hook
- Stored in user preferences
- Synced across sessions

### Widget Types
All widgets are defined in `/src/lib/widgetConfig.ts`

### Widget Rendering
Widgets are rendered in `/src/components/DashboardWidgets.tsx`

### Layout Structure
```typescript
interface DashboardLayout {
  id: string
  userId: string
  userRole: SystemRole | UserRole
  name: string
  isDefault: boolean
  isShared: boolean
  widgets: DashboardWidget[]
  columns: 1 | 2 | 3 | 4
  createdAt: number
  updatedAt: number
  createdBy: string
}
```

### Widget Structure
```typescript
interface DashboardWidget {
  id: string
  type: DashboardWidgetType
  title: string
  size: WidgetSize // 'small' | 'medium' | 'large' | 'full'
  position: number
  isVisible: boolean
  refreshInterval?: number
  config?: Record<string, any>
}
```

## Future Enhancements

Planned features for future releases:
- [ ] Shared layouts between users
- [ ] Multiple saved layouts per user
- [ ] Widget-specific configurations
- [ ] Auto-refresh intervals per widget
- [ ] Widget color themes
- [ ] Advanced filters per widget
- [ ] Mobile-optimized widget views
- [ ] Widget templates marketplace

## Support

For issues or questions about dashboard customization:
1. Check this guide first
2. Review the troubleshooting section
3. Contact your system administrator
4. Submit feedback through the system

---

**Last Updated**: 2024
**Version**: 2.0
**System**: W3 Hotel PMS
