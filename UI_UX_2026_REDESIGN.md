# W3 Hotel PMS - 2026 UI/UX Redesign Plan

## Design Philosophy

### Core Principles
1. **Spatial Efficiency**: Maximize information density without clutter
2. **Purposeful Motion**: Subtle, meaningful animations that guide attention
3. **Visual Hierarchy**: Clear distinction between primary and secondary actions
4. **Adaptive Design**: Seamless light/dark/custom theme support
5. **Accessible Excellence**: WCAG AA compliant with enhanced readability

## Design Language

### Typography System
- **Primary Font**: IBM Plex Sans (clean, technical, professional)
- **Monospace**: Fira Code (data, codes, numbers)
- **Serif**: IBM Plex Serif (optional for headings)

**Scale**:
- Display: 40px / 2.5rem (Dashboard titles)
- H1: 32px / 2rem (Page headers)
- H2: 24px / 1.5rem (Section headers)
- H3: 20px / 1.25rem (Card titles)
- Body: 16px / 1rem (Content)
- Small: 14px / 0.875rem (Metadata)
- Tiny: 12px / 0.75rem (Captions)

### Color Architecture

#### Light Theme (Default)
```css
Background: oklch(0.99 0.002 260)     // Near white with subtle blue
Surface: oklch(1 0 0)                 // Pure white
Card: oklch(0.98 0.004 260)           // Soft white
Primary: oklch(0.50 0.20 265)         // Deep purple-blue
Secondary: oklch(0.65 0.15 195)       // Teal
Accent: oklch(0.60 0.22 35)           // Warm orange
Success: oklch(0.55 0.18 150)         // Green
Warning: oklch(0.70 0.18 70)          // Amber
Destructive: oklch(0.55 0.22 25)      // Red
```

#### Dark Theme
```css
Background: oklch(0.10 0.015 265)     // Deep navy
Surface: oklch(0.14 0.020 265)        // Charcoal blue
Card: oklch(0.16 0.022 265)           // Elevated charcoal
Primary: oklch(0.70 0.24 280)         // Bright purple
Secondary: oklch(0.65 0.18 180)       // Cyan
Accent: oklch(0.68 0.22 40)           // Warm coral
Success: oklch(0.65 0.20 150)         // Bright green
Warning: oklch(0.75 0.20 75)          // Bright amber
Destructive: oklch(0.60 0.24 25)      // Bright red
```

### Spacing System
- 2px / 0.125rem: Hairline gaps
- 4px / 0.25rem: Tight spacing
- 8px / 0.5rem: Compact spacing
- 12px / 0.75rem: Default gap
- 16px / 1rem: Standard spacing
- 24px / 1.5rem: Section spacing
- 32px / 2rem: Large spacing
- 48px / 3rem: Major divisions
- 64px / 4rem: Hero spacing

### Border Radius System
- sm: 8px (buttons, inputs)
- md: 12px (cards, small panels)
- lg: 16px (dialogs, major cards)
- xl: 20px (hero elements)
- 2xl: 24px (feature showcases)
- full: 9999px (pills, avatars)

## Layout Architecture

### Grid System
- **Sidebar**: Fixed 280px (collapsed: 72px)
- **Header**: Fixed 64px height
- **Content**: Fluid with max-width 1920px
- **Footer**: Auto height, minimal

### Responsive Breakpoints
- Mobile: < 640px
- Tablet: 640px - 1024px
- Desktop: 1024px - 1440px
- Wide: > 1440px

## Component Redesign

### 1. Sidebar Navigation
**Style**: Floating panel with glassmorphism
- Translucent background with backdrop blur
- Subtle shadow elevation
- Rounded corners (24px on right side)
- Icons: Phosphor (regular weight, fill on active)
- Collapse animation: width 300ms cubic-bezier
- Hover states: subtle scale + background shift

### 2. Header
**Style**: Glass panel with dynamic blur
- Height: 64px
- Backdrop blur: 16px
- Border: 1px solid border/30
- Search: Prominent, command-palette style
- Actions: Icon buttons with tooltips
- Theme switcher: Smooth transition overlay

### 3. Cards
**Style**: Elevated surfaces with micro-interactions
- Border: 1px solid border
- Shadow: layered (sm on rest, md on hover)
- Radius: 16px
- Hover: translateY(-2px), shadow increase
- Transition: 200ms ease-out

### 4. Data Tables
**Desktop**: Modern grid with sticky headers
- Row hover: subtle background change
- Row height: 56px (comfortable)
- Header: bold, uppercase tracking
- Borders: horizontal only, subtle

**Mobile**: Card-based stacking
- Each row becomes a card
- Key info prominent
- Actions as bottom sheet

### 5. Forms & Dialogs
**Style**: Modal with smart backdrop
- Backdrop: blur(24px) + overlay
- Dialog: center, max-width based on content
- Animation: scale(0.96) → scale(1) + fadeIn
- Inputs: outlined style, floating labels
- Buttons: Primary (filled), Secondary (outline)

### 6. Buttons
**Primary**: 
- Filled background
- Height: 40px (default), 48px (large), 32px (small)
- Padding: 16px horizontal
- Radius: 10px
- Font: 500 weight
- Hover: brightness increase + subtle scale

**Secondary**:
- Outlined border
- Transparent background
- Same dimensions as primary
- Hover: background fill (subtle)

### 7. Status Indicators
**Style**: Semantic color coding
- Pills with colored backgrounds (10% opacity)
- Border: 1px solid same color (30% opacity)
- Icon prefix where applicable
- Size: 24px height, 6px padding vertical

### 8. Dashboard Widgets
**Style**: Interactive insight cards
- Header: Icon + Title + Action menu
- Body: Metric or chart
- Footer: Trend indicator + CTA
- Skeleton loading states
- Refresh animation: pulse ring

## Motion Design

### Transitions
```css
/* Standard easing */
cubic-bezier(0.4, 0, 0.2, 1)

/* Sharp */
cubic-bezier(0.4, 0, 0.6, 1)

/* Deceleration */
cubic-bezier(0, 0, 0.2, 1)
```

### Duration Scale
- Instant: 100ms (hover feedback)
- Quick: 200ms (simple transitions)
- Standard: 300ms (layout shifts)
- Complex: 400ms (page transitions)

### Key Animations
1. **Page Enter**: fadeIn + slideUp(16px) 300ms
2. **Modal Open**: scale(0.96→1) + fadeIn 200ms
3. **Theme Switch**: radial ripple from click point
4. **Notification**: slideInRight + bounce
5. **Delete Confirm**: shake + pulse

## Advanced Features

### 1. Glassmorphism Panels
```css
background: rgba(var(--surface-rgb), 0.8);
backdrop-filter: blur(24px) saturate(180%);
border: 1px solid rgba(255, 255, 255, 0.1);
```

### 2. Gradient Accents
- Subtle gradients on primary actions
- 135deg angle
- Two-color stops from primary to accent

### 3. Micro-interactions
- Button ripple effect on click
- Input focus glow
- Card hover lift
- Menu cascade reveal

### 4. Loading States
- Skeleton screens (shimmer animation)
- Spinner: circular progress with gradient
- Progress bars: animated gradient fill

## Accessibility

### Focus Management
- Visible focus rings (2px solid primary)
- Skip to content link
- Keyboard navigation for all interactions
- Focus trap in modals

### Color Contrast
- All text: minimum 4.5:1 ratio
- Large text (>18px): minimum 3:1
- Interactive elements: 3:1 minimum

### Screen Reader Support
- Semantic HTML
- ARIA labels where needed
- Live regions for dynamic content
- Status announcements

## Implementation Strategy

### Phase 1: Foundation (Current)
- Update color system
- Implement new typography scale
- Create spacing utilities
- Build motion system

### Phase 2: Core Components
- Redesign Sidebar
- Redesign Header
- Redesign Card components
- Update Button system

### Phase 3: Layouts
- Dashboard grid
- Form layouts
- Table/Data views
- Mobile adaptations

### Phase 4: Polish
- Animations
- Transitions
- Loading states
- Error states

## Performance Targets
- First Contentful Paint: < 1.5s
- Time to Interactive: < 3.5s
- Cumulative Layout Shift: < 0.1
- Animation FPS: 60fps consistent
