# Planning Guide

Create visual charts for email open rates and click-through rates in the Analytics module to provide actionable insights into email campaign performance.

**Experience Qualities**:
1. **Data-Driven** - Surface actionable insights from email analytics with clear visualizations showing open rates, click-through rates, and engagement patterns
2. **Professional** - Present email metrics with polished charts and enterprise-grade reporting interfaces
3. **Insightful** - Make it easy to spot trends, compare performance across templates, and identify optimization opportunities

**Complexity Level**: Light Application (multiple features with basic state)
  - Focused on email analytics data visualization with interactive charts and trend analysis

## Essential Features

### Email Open Rate Trend Chart
- **Functionality**: Display time-series visualization of email open rates over the last 14 days
- **Purpose**: Help users identify patterns in email engagement and optimal sending times
- **Trigger**: User navigates to Analytics module → Email tab
- **Progression**: View chart → Hover for detailed metrics → Compare across time periods
- **Success criteria**: Line chart displays smoothly, tooltips show precise values, trend is clearly visible

### Click-Through Rate Trend Chart
- **Functionality**: Show click-through rate trends alongside open rates for comparison
- **Purpose**: Track email effectiveness and content engagement over time
- **Trigger**: User views Email Analytics dashboard
- **Progression**: View dual-line trend chart → Analyze correlation between opens and clicks → Identify high-performing periods
- **Success criteria**: Both metrics visible on same chart, legend clearly differentiates lines, data updates correctly

### Template Performance Comparison
- **Functionality**: Bar chart comparing open rates and click rates across different email templates
- **Purpose**: Identify top-performing templates and those needing improvement
- **Trigger**: Email Analytics tab loads
- **Progression**: View bar chart → Compare template performance → Click template for detailed insights
- **Success criteria**: Up to 8 templates displayed, bars grouped by metric, templates ranked by performance

### Engagement Funnel Visualization
- **Functionality**: Horizontal bar chart showing sent → opened → clicked progression for each template
- **Purpose**: Visualize drop-off at each stage of email engagement
- **Trigger**: User scrolls to funnel section in Email Analytics
- **Progression**: View funnel → Identify templates with high drop-off → Investigate causes
- **Success criteria**: Clear visual hierarchy showing funnel stages, easy to spot bottlenecks

### Click-to-Open Rate Distribution
- **Functionality**: Area chart displaying click-to-open rate trends across templates
- **Purpose**: Measure content quality and relevance independent of deliverability
- **Trigger**: User views advanced metrics section
- **Progression**: Analyze CTR distribution → Compare against benchmarks → Identify outliers
- **Success criteria**: Smooth area visualization, percentage formatting clear, comparisons intuitive

## Edge Case Handling
- **No Email Data**: Display empty state with message "No email analytics data available" and helpful next steps
- **Single Template**: Show single bar/data point with context that more templates enable better comparison
- **Date Range Too Short**: Warn when selected period has insufficient data for trend analysis
- **All Zero Values**: Handle gracefully with message explaining potential causes
- **Very High/Low Values**: Chart scales automatically to accommodate outliers without distorting visualization

## Design Direction
The design should feel analytical and insight-driven while remaining approachable. Charts should inspire confidence through professional styling, clear legends, and interactive tooltips. Color choices should make it easy to distinguish between metrics and identify performance levels at a glance.

## Color Selection
A sophisticated data-focused palette optimized for chart readability and metric distinction.

- **Primary Color**: Deep Purple (oklch(0.65 0.22 265)) - Used for open rate metrics and primary data series
- **Secondary Colors**: 
  - Teal (oklch(0.55 0.16 220)) - For secondary data series and supporting metrics
  - Mint (oklch(0.60 0.18 155)) - For positive/success indicators in engagement funnels
- **Accent Color**: Warm Orange (oklch(0.68 0.24 35)) - Highlights click rate metrics and calls-to-action
- **Foreground/Background Pairings**: 
  - Primary (Deep Purple oklch(0.65 0.22 265)): Dark background - Ratio 8.2:1 ✓
  - Accent (Warm Orange oklch(0.68 0.24 35)): Dark background - Ratio 7.5:1 ✓
  - Chart Background (Dark oklch(0.18 0.015 265)): Grid lines (oklch(0.28 0.020 265)) - Ratio 4.2:1 ✓

## Font Selection
Typography should emphasize numerical data while maintaining excellent readability for labels and legends.

- **Typographic Hierarchy**: 
  - H1 (Page Title): IBM Plex Sans SemiBold/24px/tight tracking
  - H2 (Chart Titles): IBM Plex Sans SemiBold/16px/normal tracking
  - Chart Values: IBM Plex Sans Medium/14px/tabular numerals
  - Axis Labels: IBM Plex Sans Regular/12px/normal tracking
  - Tooltips: IBM Plex Sans Regular/13px/1.4 line-height
  - Legends: IBM Plex Sans Medium/12px/normal tracking

## Animations
Chart animations should enhance comprehension without causing distraction or delay.

- Charts fade in with 300ms ease-out when tab becomes active
- Data points animate into position with 400ms spring easing
- Tooltips appear instantly on hover, fade out with 150ms delay
- Line chart paths draw from left to right over 500ms
- Bar charts grow from zero to final value over 400ms with stagger
- Hover states on chart elements respond within 100ms

## Component Selection
- **Components**: 
  - Card (chart containers), Tabs (switching between analytics views), Badge (metric indicators), Select (period/template filters)
  - Recharts components: LineChart (open/click rate trends), BarChart (template comparison), AreaChart (click-to-open distribution), ComposedChart (combined metrics)
- **Customizations**: 
  - Custom chart tooltips with dark background matching app theme
  - Custom legend with larger hit areas for mobile interaction
  - Responsive chart containers that adapt to screen size
  - Custom axis formatters for percentage and count values
- **States**: 
  - Charts: Loading (skeleton), empty (helpful message), error (retry option), populated (interactive)
  - Tooltips: Hidden (default), visible on hover (desktop), visible on tap (mobile)
  - Filters: Default, selected (accented), disabled (when no data available)
- **Icon Selection**: 
  - TrendUp (positive metrics), TrendDown (metrics needing attention), ChartBar (analytics sections), EnvelopeOpen (open rate), CursorClick (click rate)
- **Spacing**: 
  - Chart cards: p-6 (24px padding)
  - Grid gaps: gap-6 (24px between charts)
  - Chart margins: Responsive based on axis label length
- **Mobile**: 
  - Charts stack vertically on screens < 768px
  - Reduced chart heights on mobile (250px vs 300px)
  - Larger touch targets for interactive elements (44px minimum)
  - Simplified tooltips with essential information only

## System Configuration

### Currency Settings
- **Default Base Currency**: Sri Lankan Rupee (LKR)
- **Currency Symbol**: Rs
- **Decimal Places**: 2
- **Automatic Initialization**: System automatically initializes LKR as base currency with default exchange rates on first load
- **Multi-Currency Support**: Supports 32 international currencies including USD, EUR, GBP, JPY, CNY, AUD, CAD, INR, etc.
- **Exchange Rate Management**: Pre-configured exchange rates with LKR as base, updatable through Settings > Currency Management
- **Display Format**: All monetary values throughout the system display in LKR by default with proper formatting (e.g., Rs 50,000.00)

## Previous Features (Context)

### Google Analytics Integration
- Integrated Google Analytics API for tracking website audience data and acquisition metrics
- Configuration management in Settings menu with secure credential storage
- Mock data mode for exploring interface before API connection 
  - ChartBar (analytics navigation), Globe (audience metrics), MagnifyingGlass (acquisition data), Plug (connection status), CheckCircle (connected), WarningCircle (disconnected), Calendar (date picker), ArrowUp/ArrowDown (trends), Eye/EyeSlash (show/hide credentials)
- **Spacing**: 
  - Consistent 4px base unit
  - Card padding: 6 (24px)
  - Section gaps: 6 (24px)
  - Metric card internal spacing: 4 (16px)
  - Form field gaps: 4 (16px)
- **Mobile**: 
  - Stack metric cards vertically on mobile
  - Charts adjust height/width responsively
  - Tabs switch to dropdown menu below 640px
  - Form inputs full-width on mobile
  - Data tables switch to card layout on small screens
