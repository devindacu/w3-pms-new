# W3 Hotel PMS

A comprehensive hotel Property Management System (PMS) built with React, Vite, and TypeScript.

## Overview

This is a full-featured hotel management platform that integrates all hotel operations including:
- Front Office (check-in/out, reservations, guest management)
- Housekeeping management
- F&B / POS operations
- Inventory & Procurement
- Finance & Accounting
- HR Management
- Kitchen Operations
- Channel Management
- Extra Services

## Recent Changes

### Database Integration (January 2026)
- Added PostgreSQL database with comprehensive schema for all PMS modules
- Created Express API server running on port 3001
- Added React Query hooks for data fetching
- Database seeded with sample data

## Architecture

### Frontend
- **Framework**: React 19 with Vite 7
- **Styling**: Tailwind CSS 4 with custom theme
- **UI Components**: Radix UI + shadcn/ui pattern
- **State Management**: GitHub Spark KV storage + React Query
- **Port**: 5000 (frontend dev server)

### Backend
- **Framework**: Express.js
- **ORM**: Drizzle ORM
- **Database**: PostgreSQL (Neon-backed)
- **Port**: 3001 (API server)

### Project Structure
```
├── src/                    # Frontend React app
│   ├── components/         # UI components
│   ├── hooks/              # Custom React hooks
│   ├── lib/                # Utilities, types, sample data
│   └── styles/             # CSS and theme files
├── server/                 # Backend Express server
│   ├── index.ts            # API endpoints
│   ├── db.ts               # Database connection
│   └── seed.ts             # Database seeding script
├── shared/                 # Shared code between frontend/backend
│   └── schema.ts           # Drizzle database schema
└── drizzle.config.ts       # Drizzle ORM configuration
```

## Database Schema

The database includes the following core tables:
- **guests** - Guest profiles and loyalty data
- **rooms** - Room inventory and status
- **reservations** - Booking records
- **folios** - Guest billing records
- **folio_charges** - Charges on folios
- **folio_payments** - Payments on folios
- **inventory_items** - Stock management
- **housekeeping_tasks** - Room cleaning tasks
- **menu_items** - F&B menu items
- **orders** / **order_items** - F&B orders
- **suppliers** - Vendor management
- **employees** - Staff records
- **requisitions** - Purchase requisitions
- **purchase_orders** - POs
- **goods_received_notes** - GRNs
- **accounts** - Chart of accounts
- **budgets** - Budget tracking
- **cost_centers** / **profit_centers** - Financial centers
- **extra_services** / **extra_service_categories** - Additional services
- **shifts** / **duty_rosters** / **attendances** - HR scheduling
- **system_users** / **activity_logs** - System administration

## Development Commands

```bash
# Start development (frontend + backend)
npm run dev

# Run database migration
npm run db:push

# Seed database with sample data
npm run db:seed

# View database studio
npm run db:studio

# Build for production
npm run build
```

## API Endpoints

All endpoints are prefixed with `/api/`:

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /guests | List all guests |
| POST | /guests | Create guest |
| PUT | /guests/:id | Update guest |
| GET | /rooms | List all rooms |
| POST | /rooms | Create room |
| PUT | /rooms/:id | Update room |
| GET | /reservations | List reservations |
| POST | /reservations | Create reservation |
| GET | /inventory | List inventory |
| GET | /suppliers | List suppliers |
| GET | /employees | List employees |
| ... | ... | (and more for all entities) |

## User Preferences

- Dark theme is enabled by default
- The app uses GitHub Spark integration for some features
- Data can be loaded via the "Load Sample Data" button

## Key Dependencies

- React 19 + TypeScript
- Vite 7 + SWC
- Tailwind CSS 4
- Radix UI components
- Drizzle ORM + PostgreSQL
- React Query (TanStack Query)
- Sonner for toasts
- Recharts for analytics
