# AuraPOS & Mini E-Commerce Platform

Production-ready unified **Mini POS (Point of Sale)** and **Mini E-Commerce** application designed with high performance, strict typing, clean architecture, and anti-slop design principles.

---

## Tech Stack Overview

| Layer | Technologies |
| :--- | :--- |
| **Frontend** | [Next.js 15](https://nextjs.org/) (App Router, RSC), [React 19](https://react.dev/), [TypeScript](https://www.typescriptlang.org/), [Tailwind CSS](https://tailwindcss.com/), [Zod](https://zod.dev/) |
| **Backend** | [NestJS 11](https://nestjs.com/), [Node.js](https://nodejs.org/), [TypeScript](https://www.typescriptlang.org/), REST API, [GraphQL / Apollo](https://nestjs.com/graphql) |
| **Database & ORM** | [PostgreSQL 16](https://www.postgresql.org/), [Drizzle ORM](https://orm.drizzle.team/), Drizzle Kit |
| **Cache & Queue** | [Redis 7](https://redis.io/), [BullMQ](https://docs.bullmq.io/) (Background tasks & asynchronous jobs) |
| **Authentication** | JWT Access & Refresh Token rotation, Role-Based Access Control (`ADMIN`, `CASHIER`, `CUSTOMER`) |
| **Testing** | [Jest](https://jestjs.io/) (Backend unit & integration), [Cypress](https://www.cypress.io/) (E2E testing) |
| **DevOps & CI/CD** | [Docker Compose](https://docs.docker.com/compose/), [GitHub Actions](https://github.com/features/actions) |
| **Documentation** | [OpenAPI / Swagger](http://localhost:4000/api/docs), [GraphQL Playground](http://localhost:4000/graphql) |

---

## Monorepo Project Structure

```
mini-pos/
├── apps/
│   ├── api/                       # NestJS Backend Application
│   │   ├── src/
│   │   │   ├── auth/              # JWT Strategy, Refresh Tokens & RBAC
│   │   │   ├── catalog/           # GraphQL Catalog Queries & Redis Resolver
│   │   │   ├── categories/        # Categories REST CRUD
│   │   │   ├── products/          # Products REST CRUD & Barcode Lookup
│   │   │   ├── orders/            # Orders & Transaction Engine
│   │   │   ├── pos/               # POS Fast Checkout Terminal Controller
│   │   │   ├── jobs/              # BullMQ Queues (Receipts & Stock Alerts)
│   │   │   ├── redis/             # Redis Cache Service
│   │   │   ├── database/          # Drizzle Schemas, Migrations & Seeders
│   │   │   └── common/            # Guards, Interceptors, Pipes & Filters
│   │   ├── Dockerfile
│   │   └── package.json
│   └── web/                       # Next.js Frontend Web Application
│       ├── src/
│       │   ├── app/
│       │   │   ├── (auth)/login/  # Role Preset Authentication Page
│       │   │   ├── (pos)/pos/     # High-Speed POS Cashier Terminal
│       │   │   ├── (ecommerce)/   # Catalog with Interactive Filters
│       │   │   ├── (admin)/       # Store Operations & Real-time Metrics
│       │   │   └── globals.css    # Lively Design System Tokens
│       ├── cypress/               # Cypress End-to-End Test Specs
│       ├── Dockerfile
│       └── package.json
├── packages/
│   └── shared/                    # Shared Types, Zod Schemas, and Role Enums
├── .github/
│   └── workflows/ci.yml           # GitHub Actions CI Workflow
├── docker-compose.yml             # Postgres, Redis, API & Web Multi-Container Setup
├── .env.example                   # Environment Template
├── tsconfig.json                  # Root TypeScript Config
└── package.json                   # NPM Workspace Root Config
```

---

## Quick Start Guide

### Prerequisites
- Node.js `>= 20.0.0`
- NPM `>= 10.0.0`
- Docker & Docker Compose

### 1. Clone & Install Dependencies
```bash
git clone <repository-url>
cd mini-pos

# Copy environment variables template
cp .env.example .env

# Install all workspace dependencies
npm install
```

### 2. Start PostgreSQL & Redis with Docker Compose
```bash
docker compose up -d postgres redis
```

### 3. Database Migration & Seeding
```bash
# Push schema or run migration
npm run db:migrate

# Seed initial admin, cashier, categories, and sample products
npm run db:seed
```

### 4. Run Development Servers
```bash
# Start both Backend (Port 4000) and Frontend (Port 3000) concurrently
npm run dev

# Or start individually:
npm run dev:api   # NestJS API: http://localhost:4000
npm run dev:web   # Next.js Web: http://localhost:3000
```

---

## Seed Accounts & Default Credentials

| Role | Email | Password | Allowed Scopes |
| :--- | :--- | :--- | :--- |
| **ADMIN** | `admin@minipos.local` | `password123` | Full Access, Inventory Management, Store Metrics, User Roles |
| **CASHIER** | `cashier@minipos.local` | `password123` | POS Terminal, Rapid Checkout, Stock Level Updates |
| **CUSTOMER** | `customer@minipos.local` | `password123` | Storefront Catalog Browsing, Cart & Checkout |

---

## API & Documentation Endpoints

- **Swagger / OpenAPI Interactive Docs**: [http://localhost:4000/api/docs](http://localhost:4000/api/docs)
- **GraphQL Endpoint & Playground**: [http://localhost:4000/graphql](http://localhost:4000/graphql)
- **Next.js Web Frontend**: [http://localhost:3000](http://localhost:3000)
- **Cashier POS Interface**: [http://localhost:3000/pos](http://localhost:3000/pos)
- **Online Catalog**: [http://localhost:3000/catalog](http://localhost:3000/catalog)
- **Admin Dashboard**: [http://localhost:3000/admin/dashboard](http://localhost:3000/admin/dashboard)

---

## Scripts Reference

```bash
# Development
npm run dev              # Run all workspaces in dev mode
npm run dev:api          # Run NestJS API with watch mode
npm run dev:web          # Run Next.js web application

# Building & Typechecking
npm run build            # Build all packages and apps
npm run typecheck        # Check TypeScript types across workspaces
npm run lint             # Run ESLint rules

# Testing
npm run test             # Run unit tests across workspaces
npm run test:api         # Run backend Jest tests
npm run test:e2e         # Run Cypress end-to-end tests

# Database (Drizzle ORM)
npm run db:generate      # Generate Drizzle migration files
npm run db:migrate       # Apply migrations to PostgreSQL
npm run db:seed          # Seed sample database data
npm run db:studio        # Open Drizzle Web Studio
```

---

## Production Deployment via Docker Compose

Run the entire cluster in isolated production containers with a single command:
```bash
docker compose up --build -d
```
All services (PostgreSQL 16, Redis 7, NestJS API on `:4000`, Next.js Frontend on `:3000`) will boot up with automatic health checks and persistent storage.
