# W3 Hotel PMS

A modern, comprehensive hotel property management system built with React, TypeScript, and Tailwind CSS.

## Overview

W3 Hotel PMS is an enterprise-grade property management platform designed for efficient hotel operations in 2026. It features a clean, professional interface with modules for front desk, housekeeping, F&B, kitchen, inventory, procurement, finance, HR, analytics, and guest relations.

## Key Features

- **Front Office Management** - Reservations, check-ins, check-outs, room assignments, and guest folios
- **Housekeeping Operations** - Room status tracking, task assignment, and staff scheduling
- **F&B & Kitchen** - Point of sale, menu management, orders, recipes, and kitchen operations
- **Guest Relations (CRM)** - Guest profiles, preferences, complaints, loyalty programs, and marketing
- **Revenue Management** - Room types, rate plans, seasons, corporate accounts, and pricing
- **Channel Manager** - OTA connections, inventory sync, rate distribution, and review management
- **Inventory & Procurement** - Stock tracking, suppliers, purchase orders, GRNs, and automated reordering
- **Financial Management** - Invoicing, payments, expenses, budgets, journal entries, and reporting
- **HR & Staff** - Employee records, attendance, leave, shifts, rosters, and performance reviews
- **Analytics** - Revenue analytics, occupancy trends, forecasting, and custom reports
- **Construction & Maintenance** - Project tracking, materials, contractors, and maintenance requests

## Tech Stack

- **Framework**: React 19 with TypeScript
- **Styling**: Tailwind CSS v4 with shadcn/ui components
- **State Management**: React hooks with @github/spark/hooks for persistence
- **Icons**: Lucide React & Phosphor Icons
- **Charts**: Recharts for data visualization
- **Forms**: React Hook Form with Zod validation
- **Notifications**: Sonner for toast messages
- **Build Tool**: Vite 7

## Documentation

- **[PRD.md](./PRD.md)** - Complete product requirements and design specifications
- **[SECURITY.md](./SECURITY.md)** - Security guidelines and best practices
- **[CONTRIBUTING.md](./CONTRIBUTING.md)** - Contributing guidelines and git workflow

## Getting Started

The application uses the Spark runtime environment. All data is persisted using the Spark KV store, providing seamless data persistence without external databases.

### Key Concepts

- **Modules**: Self-contained feature areas accessible from the sidebar navigation
- **Persistence**: Uses `useKV` hook for reactive, persistent state management
- **Offline Support**: Critical operations continue working offline with automatic sync
- **Role-Based Access**: Different user roles see appropriate features and data

## Project Structure

```
src/
├── components/          # React components
│   ├── ui/             # shadcn/ui components
│   ├── [Module].tsx    # Feature modules
│   └── ...
├── hooks/              # Custom React hooks
├── lib/                # Utilities and types
├── styles/             # CSS files
└── assets/             # Images, fonts, etc.
```

## Development

The system uses lazy loading for modules to improve initial load time. All modules are loaded on-demand as users navigate through the application.

### Contributing

We welcome contributions! Please read our [Contributing Guidelines](./CONTRIBUTING.md) before submitting pull requests.

To set up your local development environment:

1. Clone the repository
2. Install dependencies: `npm install`
3. Start the development server: `npm run dev`
4. Make your changes following our [git commit guidelines](./CONTRIBUTING.md#git-commit-guidelines)

### Setting up Git Commit Template (Optional)

To use the project's commit message template:

```bash
git config commit.template .gitmessage
```

This will help you write properly formatted commit messages.

## License

The Spark Template files and resources from GitHub are licensed under the terms of the MIT license, Copyright GitHub, Inc.
