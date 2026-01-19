# W3 Hotel PMS

## Overview

W3 Hotel PMS is a comprehensive Property Management System for hotels built with React, TypeScript, and Vite. The application provides full-featured hotel operations management including front office, housekeeping, F&B/POS, inventory, procurement, kitchen operations, finance, HR, CRM, channel management, revenue management, and analytics across 21 integrated modules.

The system is approximately 62% complete with 234 of 380 catalogued features implemented. It uses a client-side architecture with persistent state management via KV store hooks, optional GitHub-based data backup, and a responsive design supporting both desktop and mobile interfaces.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Stack
- **Framework**: React 19 with TypeScript
- **Build Tool**: Vite 7.x
- **Styling**: Tailwind CSS 4.x with shadcn/ui components
- **UI Primitives**: Radix UI for accessible component foundations
- **Charts**: Recharts for analytics and data visualization

### State Management Pattern
- **Primary Hook**: `useKV` - Persistent key-value storage that survives page refreshes
- **Server Sync**: `useServerSync` - For data synchronization operations
- **Functional Updates**: All state setters use functional form `setItems((prev) => [...prev, newItem])` to prevent stale closures
- **Cross-Module Sharing**: Modules share data through common `useKV` keys (e.g., `'w3-hotel-guests'`, `'w3-hotel-rooms'`, `'w3-hotel-reservations'`)

### Module Architecture
The system contains 21 integrated modules organized into categories:
- **Property Management**: Front Office, Housekeeping, F&B/POS, Extra Services, CRM
- **Revenue & Distribution**: Room & Revenue Management, Channel Manager
- **Inventory & Supply Chain**: Inventory, Suppliers, Procurement, Kitchen Operations
- **Finance & HR**: Finance & Accounting, Invoice Center, HR Management, User Management
- **Operations**: Maintenance & Construction
- **Analytics**: Analytics, Revenue Trends, AI Forecasting, Reports, Settings

### Component Patterns
- **Dialog System**: Unified `ResponsiveDialog` component with standardized sizing (sm, md, lg, xl, 2xl, full)
- **Data Display**: `ResponsiveDataView` component that switches between table (desktop) and card (mobile) layouts
- **Batch Operations**: `BatchOperationsToolbar` and `useBatchSelection` hook for bulk actions
- **Filtering/Sorting**: `useTableFilterSort` hook with `TableFilterSort` component for data filtering
- **Pagination**: `usePaginatedTable` hook with `Pagination` component for large datasets

### Currency & Localization
- Primary currency: LKR (Sri Lankan Rupee)
- Central `formatCurrency()` helper in `/src/lib/helpers.ts`
- Format: `LKR 1,234.56`

### Type System
- Types defined in `/src/lib/types.ts`
- Key types: `Guest`, `Room`, `Reservation`, `Folio`, `GuestInvoice`, `Invoice` (procurement), `Employee`, `Supplier`, `PurchaseOrder`, etc.
- Separate invoice types: `Invoice` for procurement/suppliers, `GuestInvoice` for guest billing

### File Organization
```
src/
├── components/     # React components (one per module + shared)
├── hooks/          # Custom React hooks (useKV, usePaginatedTable, etc.)
├── lib/            # Utilities, types, helpers
└── main.tsx        # Application entry point
```

## External Dependencies

### UI Component Libraries
- **@radix-ui/***: Accessible UI primitives (dialog, dropdown, tabs, etc.)
- **shadcn/ui**: Pre-built component collection built on Radix
- **lucide-react**: Icon library
- **recharts**: Charting library for analytics

### Data & State
- **Spark KV Store**: Persistent client-side storage via `useKV` hooks
- **GitHub API**: Optional data backup and sync to GitHub repositories

### Build & Development
- **Vite**: Build tool and dev server
- **TypeScript**: Type checking
- **Tailwind CSS**: Utility-first styling
- **PostCSS**: CSS processing

### Optional Integrations (Configured but may need setup)
- **GitHub Sync**: Automatic backup to GitHub repository (configurable in Settings)
- **Default branch**: `primary` for GitHub sync operations