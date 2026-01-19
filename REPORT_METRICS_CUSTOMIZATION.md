# Report Template Metrics Customization

## Overview
Enhanced the Reports module with comprehensive metric customization capabilities, allowing users to add, remove, and configure specific metrics for each report template.

## New Features

### 1. Template Metric Customizer
**Component**: `TemplateMetricCustomizer.tsx`

A full-featured interface for customizing metrics in report templates:

#### Key Features:
- **Drag & Drop Interface**: Drag metrics from the available pool to report sections
- **Section-Based Organization**: Organize metrics by report sections
- **Metric Reordering**: Move metrics up/down within sections
- **Cross-Section Moving**: Move metrics between different sections
- **Visual Categorization**: Color-coded metrics by category (Revenue, Occupancy, Guest, F&B, etc.)
- **Real-Time Preview**: See changes instantly as you customize
- **Search & Filter**: Find metrics quickly with search and category filters

#### Capabilities:
- Add individual metrics by dragging or clicking the + button
- Remove metrics from sections with the - button
- Reorder metrics within a section using up/down arrows
- Move metrics between sections via drag & drop
- Reset to original template configuration
- Save customized templates for reuse

### 2. Bulk Metric Selector
**Component**: `BulkMetricSelector.tsx`

A streamlined interface for selecting multiple metrics at once:

#### Key Features:
- **Category-Based Selection**: Select all metrics from a category with one click
- **Multi-Select Interface**: Check/uncheck multiple metrics quickly
- **Search Functionality**: Find specific metrics across all categories
- **Selection Statistics**: See how many metrics are selected in real-time
- **Category Tabs**: Browse metrics by category
- **Batch Operations**: Select/deselect all visible metrics

#### Operations:
- Select All / Deselect All for current view
- Add entire categories at once
- Remove entire categories at once
- Individual metric toggle
- Real-time selection counter

### 3. Integration with Reports Module

#### New Buttons in Report Templates:
- **Customize Button**: Opens the Template Metric Customizer (only for customizable templates)
- **Bulk Add Button**: Within the customizer, quickly add multiple metrics

#### Template Badges:
- "Customizable" badge shows which templates support metric customization
- Visual indicators for customized vs. default templates

## Available Metrics

### Categories & Metrics:

#### Revenue (15 metrics)
- Total Revenue
- Room Revenue  
- F&B Revenue
- Extra Services Revenue
- Average Daily Rate (ADR)
- RevPAR
- And more...

#### Occupancy (8 metrics)
- Total Rooms
- Occupied Rooms
- Available Rooms
- Occupancy Rate
- Average Length of Stay
- Total/Confirmed/Pending/Cancelled Reservations

#### Guest (10 metrics)
- Total Guests
- New Guests
- Returning Guests
- Guest Satisfaction Score
- Average Guest Spend
- Check-ins/Check-outs (Today)
- And more...

#### F&B (8 metrics)
- F&B Revenue (duplicate from revenue category)
- Total Orders
- Average Order Value
- Popular Menu Items
- F&B Covers
- And more...

#### Housekeeping (7 metrics)
- Rooms Cleaned
- Pending Tasks
- Completed Tasks
- Average Cleaning Time
- Maintenance Requests
- And more...

#### Inventory (10 metrics)
- Total Inventory Value
- Low Stock Items
- Out of Stock Items
- Inventory Turnover Rate
- Stock Accuracy
- And more...

#### Finance (12 metrics)
- Accounts Receivable
- Accounts Payable
- Cash Balance
- Total Expenses
- Net Profit
- Profit Margin
- And more...

#### HR (8 metrics)
- Total Employees
- Active Employees
- On Leave
- Average Salary
- Staff Turnover Rate
- And more...

#### Operational (8 metrics)
- Average Response Time
- Complaint Resolution Rate
- No-Show Rate
- Cancellation Rate
- And more...

**Total**: 86+ metrics available across 9 categories

## Metric Properties

Each metric includes:
- **ID**: Unique identifier
- **Name**: Display name
- **Description**: Detailed explanation
- **Category**: Classification (Revenue, Occupancy, etc.)
- **Format**: How to display (currency, percentage, number, decimal, text)
- **Aggregation**: Calculation method (sum, average, count, min, max, current)
- **Data Source**: Where the data comes from

## User Workflows

### Workflow 1: Customize Existing Template
1. Navigate to Reports module
2. Find a template with "Customizable" badge
3. Click "Customize" button
4. Select a section to edit
5. Search/filter for metrics
6. Drag metrics or click + to add
7. Reorder with up/down arrows
8. Click "Save Changes"

### Workflow 2: Bulk Add Metrics
1. Open Template Metric Customizer
2. Select a section
3. Click "Bulk Add Metrics" button
4. Browse by category or search
5. Check/uncheck desired metrics
6. Click category buttons to select/deselect entire categories
7. Review selection counter
8. Click "Save Selection"

### Workflow 3: Reorganize Report Structure
1. Open customizer
2. Drag metrics between sections
3. Reorder metrics within sections
4. Remove unwanted metrics
5. Add new metrics as needed
6. Preview the layout
7. Save when satisfied

## Benefits

1. **Flexibility**: Create reports tailored to specific needs
2. **Efficiency**: Bulk operations save time
3. **Organization**: Section-based structure keeps reports organized
4. **Discovery**: Browse all 86+ available metrics easily
5. **Reusability**: Save customized templates for future use
6. **Visual Feedback**: Color coding and badges improve usability
7. **Error Prevention**: Drag & drop with visual feedback prevents mistakes

## Technical Implementation

### State Management
- Uses React hooks (useState) for local state
- useKV for persistent storage of customized templates
- Real-time updates without page refresh

### UI/UX Features
- Drag & drop with visual indicators
- Responsive design (mobile-friendly)
- Search with instant filtering
- Category-based organization
- Keyboard accessibility
- Toast notifications for feedback

### Data Flow
1. Template loaded from storage
2. User customizes metrics
3. Changes tracked in local state
4. Save updates persistent storage
5. Templates available across sessions

## Future Enhancements

Potential additions:
- Metric formulas and custom calculations
- Conditional metric visibility
- Metric grouping and sub-categories
- Export/import template configurations
- Template sharing between users
- Metric value thresholds and alerts
- Custom metric creation
