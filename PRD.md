# W3 Hotel Management System - Unified PMS Platform

A comprehensive cloud-based Property Management System integrating Front Office, Housekeeping, F&B/POS, Inventory, Procurement, Finance, HR, Engineering, CRM, and Analytics into one centralized platform for modern hotel operations.

**Experience Qualities**: 
1. **Efficient** - Streamlined workflows that reduce manual work and enable staff to focus on guest experience
2. **Unified** - All hotel operations accessible from a single integrated platform with real-time synchronization
3. **Intelligent** - Data-driven insights and automation that optimize operations and revenue

**Complexity Level**: Complex Application (advanced functionality, multi-module integration)
  - Enterprise hotel management with role-based access, real-time inventory tracking, automated workflows, financial integration, and comprehensive operational control across all departments

## Essential Features

### Alerts & Notifications
- **Functionality**: Real-time alert system tracking critical events across all modules with dashboard alerts, notification panel, email delivery, and auto-refresh monitoring
- **Purpose**: Keeps staff informed of critical issues requiring immediate attention and enables proactive operations management
- **Trigger**: System monitors inventory levels, pending approvals, due dates, quality issues, and operational thresholds every minute
- **Progression**: System detects condition → Generate notification → Display in panel with priority badge → Show critical alerts on dashboard → Email digest option → User reviews → Takes action → Marks as read/archive → Notification removed from active view
- **Success criteria**: All critical conditions detected within 1 minute, notifications categorized by priority (critical/high/medium/low), email delivery successful, zero missed critical alerts, dashboard shows top 5 urgent items, notification count badge accurate

### Unified Dashboard
- **Functionality**: Central command center displaying key metrics across all hotel operations (occupancy, revenue, inventory alerts, pending tasks, housekeeping status)
- **Purpose**: Provides instant operational overview enabling rapid decision-making and issue identification
- **Trigger**: User logs in or navigates to home
- **Progression**: Login → Dashboard loads with module widgets → View critical alerts → Navigate to specific module → Return to dashboard
- **Success criteria**: All metrics accurate and real-time, alerts prioritized correctly, navigation seamless

### Front Office Management
- **Functionality**: Guest reservations, check-in/check-out, room allocation, folio management, billing, payment processing, comprehensive reservation details viewing with full guest and stay information
- **Purpose**: Manages complete guest lifecycle from booking to departure with easy access to all reservation information
- **Trigger**: Guest booking received or walk-in arrival
- **Progression**: Create reservation → Assign room → View reservation details (guest info, room info, stay details, pricing breakdown, special requests, guest history) → Check-in guest → Update folio with charges → Process checkout → Generate invoice → Accept payment
- **Success criteria**: Booking conflicts prevented, folios accurate, payments reconcile, guest history maintained, reservation details accessible with one click showing comprehensive information including guest contact details, room amenities, stay duration, pricing breakdown, payment status, special requests, and loyalty information

### Housekeeping Operations
- **Functionality**: Room status tracking (clean/dirty/inspected), housekeeper assignment, workload planning, linen management
- **Purpose**: Ensures rooms are guest-ready and housekeeping efficiency maximized
- **Trigger**: Guest checkout or room status update
- **Progression**: Room becomes vacant → Housekeeper assigned → Clean room → Update status to inspected → Front desk notified → Room available for sale
- **Success criteria**: Status updates real-time, workload balanced, cleaning standards maintained

### Point of Sale (F&B)
- **Functionality**: Restaurant, bar, room service ordering with menu management, kitchen order tickets, auto inventory deduction
- **Purpose**: Streamlines F&B operations and integrates sales with inventory and guest billing
- **Trigger**: Order placed at restaurant, bar, or via room service
- **Progression**: Take order → Generate KOT to kitchen → Prepare items → Deduct ingredients from inventory → Close bill (room charge or cash) → Update guest folio if applicable
- **Success criteria**: Orders accurate, inventory updates automatic, bills reconcile, kitchen timing optimized

### Inventory & Procurement
- **Functionality**: Multi-store inventory tracking, stock alerts, requisition workflows, purchase orders with preview/print/email, goods receiving, FIFO/batch tracking, PO approval hierarchy, audit trails
- **Purpose**: Maintains optimal stock levels while minimizing waste and costs with comprehensive PO lifecycle management
- **Trigger**: Stock falls below reorder level or department submits requisition
- **Progression**: Low stock alert → Create requisition → Approve requisition → Auto-generate PO → Preview PO → Approve PO → Print/Email to supplier → Track PO status (Draft → Approved → Ordered → Received → Closed) → Receive goods (GRN) → Update inventory → Match invoice → Audit trail
- **Success criteria**: Stock-outs prevented, expiry minimized, procurement costs optimized, supplier performance tracked, PO approval workflow enforced, digital PO documents with QR codes, email delivery confirmation, complete audit trail

### Food Management
- **Functionality**: Dedicated food inventory tracking with category-based organization (perishable, non-perishable, frozen, beverage, spices, etc.), order frequency management (daily, weekly, monthly, on-demand), supplier assignment per food type, quality & expiry tracking for perishables, minimum stock alerts with auto re-order triggers
- **Purpose**: Maintains precise control over food inventory with emphasis on quality, freshness, and minimizing waste while ensuring adequate stock for kitchen operations
- **Trigger**: Daily/weekly/monthly ordering cycles, stock below reorder level, or quality check required
- **Progression**: Monitor food inventory → Quality check on perishables → Stock reaches reorder level → Auto-alert to procurement → Order from assigned supplier → Receive and quality inspect → Update batch and expiry dates → Track usage → Generate waste/expiry reports
- **Success criteria**: Fresh ingredients always available, minimal spoilage/waste, quality standards maintained, supplier performance tracked, cost variance controlled, expiry tracking prevents usage of expired items

### Recipe & Menu Management
- **Functionality**: Recipe builder with ingredient mapping, portion costing, menu management, auto inventory deduction from recipes
- **Purpose**: Controls food costs and ensures consistent quality
- **Trigger**: Chef creates recipe or updates menu
- **Progression**: Create recipe → Map ingredients to inventory → Calculate portion cost → Add to menu → When dish sold → Auto deduct ingredients from stock
- **Success criteria**: Recipe costs accurate, inventory deductions automatic, food cost variance minimized

### Guest Invoicing & Billing
- **Functionality**: Comprehensive invoice management with view, edit, download, and share capabilities including professional invoice viewer with detailed line items and tax breakdown, inline editing for draft invoices with real-time total recalculation, multi-format download (HTML/PDF/JSON) with fully styled templates, multi-channel sharing (email with custom messages, shareable links, WhatsApp/SMS integration), quick print functionality, and complete audit trail tracking
- **Purpose**: Streamlines guest billing workflows with professional invoice presentation, enables flexible invoice modifications before finalization, provides multiple delivery formats to match guest preferences, facilitates instant sharing via email or messaging platforms, ensures tax compliance with detailed breakdown, and maintains complete financial and delivery audit trails
- **Trigger**: Invoice list view access, individual invoice selection, checkout completion, payment received, or manual invoice generation request
- **Progression**: Navigate to invoice management → Search/filter invoices → Select invoice → View detailed invoice with formatted layout → Edit draft invoice (modify guest details, line items, instructions) → Download invoice (select format: HTML/PDF/JSON) → Share invoice (email with custom message OR copy shareable link OR share via WhatsApp/SMS) → Track delivery status → Update audit trail → Record in system
- **Success criteria**: Invoice list displays all invoices with search/filter/status tracking, view dialog shows professional formatted invoice matching brand identity with all charges and taxes accurately calculated, edit functionality allows modifications to draft/final invoices with real-time total updates, download generates properly formatted files in selected format (HTML with embedded styles, PDF-ready HTML, or structured JSON), share via email includes customizable subject and message with invoice attachment equivalent, shareable links copy to clipboard and work across platforms, WhatsApp/SMS sharing opens respective apps with pre-filled invoice link, quick actions (print/email) work from invoice list, all actions tracked in audit trail with timestamp and user, complete delivery history maintained per invoice

### Finance & Accounting
- **Functionality**: Chart of accounts, AP/AR, revenue centers, tax management, integration with all revenue/expense modules
- **Purpose**: Maintains financial accuracy and enables comprehensive reporting
- **Trigger**: Transaction occurs in any module (sale, purchase, payment)
- **Progression**: Transaction initiated → Auto journal entry created → Post to ledger → Update balances → Reconcile → Generate reports
- **Success criteria**: All transactions captured, reconciliation clean, reports accurate, audit trail complete

### CRM & Guest Engagement
- **Functionality**: Guest profiles, preferences, loyalty program, feedback tracking, marketing campaigns
- **Purpose**: Enhances guest satisfaction and drives repeat business
- **Trigger**: Guest check-in or profile update
- **Progression**: Guest arrives → Profile loaded with preferences → Personalize service → Capture feedback → Award loyalty points → Send post-stay communication
- **Success criteria**: Preferences applied, feedback captured, loyalty tracked, marketing effective

### Engineering & Maintenance
- **Functionality**: Preventive maintenance schedules, work order management, spare parts inventory, equipment history
- **Purpose**: Minimizes downtime and extends asset life
- **Trigger**: Scheduled maintenance due or issue reported
- **Progression**: Maintenance due → Create work order → Assign technician → Issue spare parts → Complete work → Update equipment log
- **Success criteria**: Schedules adhered to, response times met, parts availability maintained

### Maintenance & Construction
- **Functionality**: Construction material inventory management (electrical, plumbing, carpentry, masonry, painting, HVAC, hardware, safety equipment), project-based requirement creation, inventory segregation by segment (regular maintenance vs project construction vs emergency stock), contractor and supplier integration for quick order dispatch, project tracking with tasks and budget monitoring, material usage logging
- **Purpose**: Manages all engineering and construction-related consumables and materials, tracks ongoing and planned projects, ensures material availability for both routine maintenance and major construction projects
- **Trigger**: Project creation, material stock reaches reorder level, maintenance work order created, construction project approved
- **Progression**: Create project → Define material requirements → Allocate materials from inventory → Track usage → Monitor project progress and budget → Receive materials from suppliers → Update contractor assignments → Complete project tasks → Final inspection
- **Success criteria**: Materials available when needed, projects completed on time and within budget, contractors properly managed, inventory segregated by purpose, emergency stock maintained, material costs tracked accurately

### HR & Staff Management
- **Functionality**: Employee profiles, attendance, leave management, shift rosters, performance reviews, role-based access control
- **Purpose**: Optimizes staff scheduling and maintains employee records with comprehensive HR tracking
- **Trigger**: Shift planning period, leave request, or performance review cycle
- **Progression**: Create roster → Assign shifts by department → Track attendance → Process leave → Evaluate performance → Generate reports
- **Success criteria**: Coverage adequate, attendance accurate, leave approved timely, performance reviews completed, shift conflicts prevented

### Analytics & Reporting
- **Functionality**: Comprehensive reporting across all hotel operations including operational reports (order summary, supplier price comparison, department consumption, GRN variance, expiry forecast), financial reports (cost per department, food cost percentage, purchase cost trends, budget utilization), and kitchen & menu reports (ingredient usage, dish profitability, menu performance analysis) with export capabilities and period selection
- **Purpose**: Enables data-driven decisions through detailed analysis of purchasing patterns, cost control, supplier performance, inventory efficiency, and profitability metrics
- **Trigger**: User navigates to Analytics module or scheduled report generation
- **Progression**: Select report category (Operational/Financial/Kitchen) → Choose period (Daily/Weekly/Monthly/Custom) → View detailed tables and metrics → Apply advanced filters → Export report (CSV/PDF/Excel) → Print report → Analyze insights
- **Success criteria**: All reports display accurate data from integrated systems, period filtering works correctly, export functions generate proper files, supplier comparisons identify best prices, variance reports highlight discrepancies, profitability analysis shows margin calculations, budget utilization tracks spending vs allocation

### Revenue Management & Rate Planning
- **Functionality**: Room type configuration with bedding/view/amenities, hierarchical rate plans (parent/child with derived formulas), daily rate calendar with drag-drop editing, bulk rate updates, stay restrictions (min/max stay, CTA/CTD, stop-sell), seasonal pricing, event-based pricing, corporate negotiated rates, occupancy-based pricing (extra adult/child charges), meal plan rates (RO/BB/HB/FB/AI), promotional rates with blackout dates, rate override management, comprehensive audit logging
- **Purpose**: Provides sophisticated revenue management and yield control enabling hotels to maximize revenue through dynamic pricing, market segmentation, and demand-based rate optimization
- **Trigger**: Rate planning period, season change, special event, occupancy forecast change, corporate contract negotiation, competitive rate adjustment
- **Progression**: Define room types with attributes → Create parent rate plans (BAR, Corporate, etc.) → Derive child rate plans with formulas (BAR -10%, Early Bird, etc.) → Set up seasonal pricing → Configure meal plan rates → Add event days with multipliers → Set stay restrictions → Configure corporate accounts with negotiated rates → Set occupancy pricing rules → Populate rate calendar → Apply bulk updates → Monitor and override rates → Review audit logs → Analyze rate performance
- **Success criteria**: Rate hierarchy enforced, derived rates calculate correctly, restrictions prevent invalid bookings, seasonal rates apply automatically, event pricing triggers on dates, corporate rates honor contracts, occupancy pricing adjusts for extra guests, meal plans calculate properly, rate changes logged with full audit trail, calendar updates sync to channels, override approvals tracked

## Edge Case Handling

- **Double Bookings**: Real-time room availability checking prevents conflicts; manual override with warning for authorized users
- **Stock Discrepancies**: Variance tracking with adjustment workflows; automatic alerts for significant discrepancies
- **Payment Failures**: Transaction rollback with retry mechanism; manual reconciliation tools for failed transactions
- **Guest No-Shows**: Automatic no-show processing with configurable policies and revenue posting
- **Expired Items**: Automated alerts before expiry; batch tracking prevents expired stock usage; visual warnings for items expiring within 3 days; daily expiry reports
- **Quality Rejections**: Quality check workflow for incoming food items; rejected items quarantined and supplier notified; alternative supplier auto-suggested
- **Concurrent Edits**: Optimistic locking with conflict resolution prompts
- **Network Issues**: Offline mode queues critical operations; sync when connection restored
- **Missing Permissions**: Graceful denial with clear messaging and request access workflow

## Design Direction

The design embodies a futuristic, sophisticated aesthetic inspired by 2026 design trends - featuring dark mode with vibrant neon accents, glassmorphism effects, bold gradients, and fluid micro-interactions. The interface feels premium and immersive while maintaining operational clarity through strong visual hierarchy, purposeful animations, and intelligent use of light and color to guide user attention.

## Color Selection

Modern cyberpunk-inspired color scheme with deep dark backgrounds and vibrant neon accents creating a futuristic, high-tech atmosphere that feels both premium and energizing.

- **Primary Color**: Electric Purple (oklch(0.75 0.22 280)) - Bold, modern accent for key actions and focal points conveying innovation and premium quality
- **Secondary Colors**: Vivid Magenta (oklch(0.65 0.18 310)) for secondary actions; Deep Navy (oklch(0.13 0.015 250)) for backgrounds
- **Accent Color**: Neon Cyan (oklch(0.70 0.25 180)) - Striking highlight color for CTAs and interactive elements
- **Success Color**: Bright Lime (oklch(0.68 0.20 150)) - Clear positive feedback
- **Destructive Color**: Hot Coral (oklch(0.60 0.25 25)) - Attention-grabbing alerts
- **Foreground/Background Pairings**:
  - Background (Deep Navy oklch(0.13 0.015 250)): Bright White (oklch(0.98 0.005 250)) - Ratio 16.8:1 ✓
  - Card (Dark Slate oklch(0.17 0.02 250)): Bright White (oklch(0.98 0.005 250)) - Ratio 14.2:1 ✓
  - Primary (Electric Purple oklch(0.75 0.22 280)): Deep Navy (oklch(0.12 0.015 250)) - Ratio 10.5:1 ✓
  - Secondary (Vivid Magenta oklch(0.65 0.18 310)): Deep Navy (oklch(0.12 0.015 250)) - Ratio 8.7:1 ✓
  - Accent (Neon Cyan oklch(0.70 0.25 180)): Deep Navy (oklch(0.12 0.015 250)) - Ratio 9.8:1 ✓
  - Success (Bright Lime oklch(0.68 0.20 150)): Deep Navy (oklch(0.12 0.015 250)) - Ratio 9.2:1 ✓

## Font Selection

Typography should communicate professionalism and clarity with distinct fonts for interface elements versus data display, using IBM Plex Sans for UI clarity, IBM Plex Serif for editorial content, and Fira Code for data/numbers.

**Primary Font**: IBM Plex Sans - Professional, highly legible sans-serif perfect for UI elements and navigation
**Secondary Font**: IBM Plex Serif - Elegant serif for guest communications and formal content
**Monospace Font**: Fira Code - Clear monospace for financial data, codes, and technical information

- **Typographic Hierarchy**:
  - H1 (Dashboard Title): IBM Plex Sans SemiBold/36px/tight letter spacing (-0.02em)
  - H2 (Module Header): IBM Plex Sans SemiBold/28px/tight letter spacing (-0.01em)
  - H3 (Section Header): IBM Plex Sans Medium/20px/normal letter spacing
  - Body (Content): IBM Plex Sans Regular/15px/relaxed line height (1.6)
  - Data (Numbers/Financial): Fira Code Medium/14px/tabular numbers
  - Label (Form): IBM Plex Sans Medium/14px/wide letter spacing (0.005em)
  - Small (Meta): IBM Plex Sans Regular/13px/normal letter spacing

## Animations

Animations embody fluidity and sophistication with purpose-driven micro-interactions that enhance usability while creating moments of delight through smooth, physics-based motion and intelligent transitions.

- **Purposeful Meaning**: Fluid, confident transitions (200-400ms) with spring physics that communicate state changes, create spatial continuity, and guide users through complex workflows with natural, organic motion
- **Hierarchy of Movement**: 
  - Priority 1: Interactive elements (buttons, inputs) with scale transforms (1.05x on hover), glow effects, and spring animations (cubic-bezier(0.34, 1.56, 0.64, 1))
  - Priority 2: Cards and containers with lift effects (translateY -8px), enhanced shadows, and backdrop blur transitions
  - Priority 3: Page transitions with slide and fade combinations, maintaining spatial relationships
  - Priority 4: Background gradients with subtle mesh animations and floating elements creating ambient motion
  - Priority 5: Loading states with shimmer effects, pulse glows, and skeleton screens that maintain layout
- **Special Effects**:
  - Glassmorphism with backdrop-blur (20-32px) and semi-transparent backgrounds
  - Glow borders using gradient masks and opacity transitions
  - Shine effects on hover with diagonal gradient sweeps
  - Text shimmer for headings with gradient animation
  - Floating animations for decorative icons
  - Pulse glow for notifications and alerts

## Component Selection

- **Components**: 
  - **Card** for module widgets, room cards, reservation cards with status-coded borders
  - **Sheet/Dialog** for transaction forms (check-in, orders, requisitions) with multi-step wizards
  - **Table** for detailed listings (reservations, inventory, transactions) with sorting, filtering, inline actions
  - **Tabs** for switching between views (daily/weekly/monthly analytics, different POS sections)
  - **Badge** for status indicators with semantic colors (occupied/vacant, clean/dirty, approved/pending)
  - **Avatar** for staff and guest representation
  - **Calendar** for date picking in reservations and reports
  - **Select** with search for room selection, guest lookup, item selection
  - **Command** for quick navigation and global search (Cmd+K)
  - **Progress** for task completion, occupancy rates, inventory levels
  - **Separator** for organizing dense operational interfaces
  - **Alert** for critical operational notifications (stock-outs, maintenance issues)
  - **Sidebar** for primary navigation between modules with collapsible sections
  
- **Customizations**: 
  - Custom room grid component showing visual floor plan with real-time status
  - Custom inventory dashboard with aging analysis and reorder point visualizations
  - Custom guest folio component with running balance and itemized charges
  - Custom KOT (Kitchen Order Ticket) display for kitchen staff
  
- **States**: 
  - Room cards: color-coded by status (green=clean, red=dirty, blue=occupied, yellow=maintenance)
  - Transaction buttons: loading spinner during processing, success checkmark, error state with retry
  - Inventory items: warning state when below reorder point, danger when stock-out, info when near expiry
  
- **Icon Selection**: 
  - Gauge (Dashboard), BedDouble (Rooms), Broom (Housekeeping), ForkKnife (F&B), Package (Inventory), Carrot (Food Management), ShoppingCart (Procurement), CurrencyDollar (Finance), Users (HR), Wrench (Engineering), ChartBar (Analytics), Bell (Notifications), MagnifyingGlass (Search), Warning (Alerts), Calendar (Expiry), MapPin (Location), Barcode (Item ID)
  
- **Spacing**: 
  - Module cards: p-6, Dashboard grid: gap-6, Form sections: space-y-4, Page margins: p-6 md:p-8, Dense tables: gap-2
  
- **Mobile**: 
  - Desktop (≥1024px): Multi-column dashboard with persistent fixed sidebar (64 units wide), 4-column stat grids, 6-column room grids, split views for transactions
  - Tablet (768-1023px): Responsive 2-column grids, drawer sidebar accessible via hamburger menu, modal forms, 4-column room grids
  - Mobile (<768px): Single column layout, sticky top header with menu button, notification panel, and branding, full-width cards with responsive padding (p-4 vs p-6), 2-column room grids, flexible stacked layouts for complex cards, truncated text with line-clamp, responsive font sizes (text-2xl md:text-3xl lg:text-4xl), full-width buttons on mobile that adapt to auto-width on larger screens
