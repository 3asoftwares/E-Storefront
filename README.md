# E-Commerce

## 🚀 Project Overview

A comprehensive, enterprise-grade 3asoftwares platform built with modern microservices architecture, featuring multiple frontend applications and backend services. The platform supports three user roles: **Customers**, **Sellers**, and **Administrators**.

**Key Highlights:**

- 🏗️ Microservices architecture with 6 backend services
- 🖥️ 4 frontend applications (React, Next.js)
- 📦 Yarn workspaces monorepo
- 🔐 JWT authentication with Google OAuth
- 🧪 291+ frontend tests, 50-67% backend coverage
- 📝 Comprehensive structured logging
- 🐳 Docker

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────────────────┐
│                           FRONTEND APPS                                  │
├──────────────┬──────────────┬──────────────┬───────────────────────────┤
│  Shell App   │  Admin App   │  Seller App  │     Storefront App        │
│  (Port 3000) │  (Port 3001) │  (Port 3002) │     (Port 3003)           │
│   Webpack    │     Vite     │     Vite     │       Next.js 16          │
│   Zustand    │ Redux+Query  │ Redux+Query  │   Apollo+Zustand          │
└──────────────┴──────────────┴──────────────┴───────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                       GraphQL Gateway (Port 4000)                        │
│                    Apollo Server 4 + Express                             │
└─────────────────────────────────────────────────────────────────────────┘
                                    │
        ┌───────────┬───────────────┼───────────────┬───────────┐
        ▼           ▼               ▼               ▼           ▼
┌───────────┐ ┌───────────┐ ┌───────────┐ ┌───────────┐ ┌───────────┐
│   Auth    │ │  Product  │ │   Order   │ │ Category  │ │  Coupon   │
│  Service  │ │  Service  │ │  Service  │ │  Service  │ │  Service  │
│  (4001)   │ │  (4002)   │ │  (4003)   │ │  (4004)   │ │  (4005)   │
│ JWT+OAuth │ │   Redis   │ │ Socket.io │ │  Swagger  │ │  Swagger  │
└───────────┘ └───────────┘ └───────────┘ └───────────┘ └───────────┘
        │           │               │               │           │
        └───────────┴───────────────┼───────────────┴───────────┘
                                    ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                    MongoDB Databases + Redis Cache                       │
└─────────────────────────────────────────────────────────────────────────┘
```

## 📦 Monorepo Structure

```
3asoftwares/
├── apps/                          # Frontend Applications
│   ├── shell-app/                 # Main launcher & auth gateway
│   ├── admin-app/                 # Admin dashboard
│   ├── seller-app/                # Seller portal
│   └── storefront-app/            # Customer storefront
│
├── services/                      # Backend Microservices
│   ├── auth-service/              # Authentication & authorization
│   ├── product-service/           # Product catalog
│   ├── order-service/             # Order management
│   ├── category-service/          # Category management
│   ├── coupon-service/            # Discount & coupons
│   └── graphql-gateway/           # API gateway
│
├── packages/                      # Shared Packages
│   ├── types/                     # TypeScript type definitions
│   ├── ui-library/                # Shared UI components
│   └── utils/                     # Shared utilities
│
├── k8s/                           # Kubernetes configurations
├── nginx/                         # Nginx reverse proxy config
├── mongo-init/                    # MongoDB initialization scripts
├── sample-data/                   # Sample data for development
│
├── docker-compose.yml             # Docker composition
├── docker-compose.dev.yml         # Development Docker setup
├── docker-compose.production.yml  # Production Docker setup
└── package.json                   # Root workspace configuration
```

## 🛠️ Tech Stack by Project

### Frontend Applications

| App            | Build Tool | State Management                   | UI Framework                | Testing             | Key Features                          |
| -------------- | ---------- | ---------------------------------- | --------------------------- | ------------------- | ------------------------------------- |
| **Shell App**  | Webpack 5  | Zustand 4                          | React 18, Tailwind, DaisyUI | Jest 29             | Module Federation host, Auth gateway  |
| **Admin App**  | Vite 4     | Redux Toolkit 2, TanStack Query 5  | React 18, Tailwind, DaisyUI | Jest 29 (66 tests)  | User/Order/Product management         |
| **Seller App** | Vite 4     | Redux Toolkit 2, TanStack Query 5  | React 18, Tailwind, DaisyUI | Jest 29 (66 tests)  | Inventory, Orders, Analytics          |
| **Storefront** | Next.js 16 | Zustand 4, Apollo Client 3, Recoil | React 18, Tailwind, DaisyUI | Jest 29 (110 tests) | SSR/SSG, Cart, Checkout, Google OAuth |

### Backend Services

| Service                     | Framework       | Database  | Key Libraries           | Features                                   |
| --------------------------- | --------------- | --------- | ----------------------- | ------------------------------------------ |
| **Auth Service** (4001)     | Express 4       | MongoDB 8 | JWT, Argon2, Nodemailer | JWT auth, Google OAuth, Email verification |
| **Product Service** (4002)  | Express 4       | MongoDB 8 | Redis (ioredis)         | CRUD, Caching, Search                      |
| **Order Service** (4003)    | Express 4       | MongoDB 8 | Socket.io, Swagger      | Real-time updates, Order tracking          |
| **Category Service** (4004) | Express 4       | MongoDB 8 | Swagger                 | Hierarchical categories                    |
| **Coupon Service** (4005)   | Express 4       | MongoDB 8 | Swagger                 | Discount management                        |
| **GraphQL Gateway** (4000)  | Apollo Server 4 | -         | Axios                   | Schema stitching, Auth forwarding          |

### Shared Packages

| Package                    | Purpose                 | Key Exports                                |
| -------------------------- | ----------------------- | ------------------------------------------ |
| **@3asoftwares/types**      | TypeScript definitions  | User, Product, Order, Cart types           |
| **@3asoftwares/ui** | React component library | Button, Badge, Modal, Spinner (Storybook)  |
| **@3asoftwares/utils**      | Shared utilities        | Logger, Validation, API helpers, Constants |

### Complete Tech Stack

| Category          | Technologies                                                          |
| ----------------- | --------------------------------------------------------------------- |
| **Languages**     | TypeScript 5, JavaScript ES2022                                       |
| **Frontend**      | React 18, Next.js 16, Vite 4, Webpack 5                               |
| **State**         | Redux Toolkit 2, Zustand 4, TanStack Query 5, Apollo Client 3, Recoil |
| **Styling**       | Tailwind CSS 3, DaisyUI 4, PostCSS                                    |
| **Backend**       | Node.js 18+, Express 4                                                |
| **Database**      | MongoDB 8, Mongoose 8                                                 |
| **Caching**       | Redis (ioredis 5)                                                     |
| **API**           | GraphQL (Apollo Server 4), REST                                       |
| **Auth**          | JWT, Google OAuth 2.0, Argon2                                         |
| **Real-time**     | Socket.io 4, WebSocket                                                |
| **Email**         | Nodemailer 6                                                          |
| **Media**         | Cloudinary                                                            |
| **Testing**       | Jest 29, React Testing Library 14, Vitest                             |
| **Code Quality**  | ESLint 8, TypeScript ESLint                                           |
| **Documentation** | Swagger, Storybook 8                                                  |
| **DevOps**        | Docker, Docker Compose, Kubernetes, Nginx                             |

## ✅ Features Implemented

### Authentication & Authorization

- [x] JWT-based authentication with access/refresh tokens
- [x] Google OAuth 2.0 login/signup
- [x] Role-based access control (Admin, Seller, Customer)
- [x] User registration with email verification
- [x] Password reset via email
- [x] Session management
- [x] Protected routes

### Product Management

- [x] CRUD operations for products
- [x] Image upload via Cloudinary
- [x] Product search and filtering
- [x] Category-based organization
- [x] Seller-specific product management
- [x] Product reviews and ratings

### Order Management

- [x] Shopping cart functionality
- [x] Order placement
- [x] Order status tracking
- [x] Real-time order updates (WebSocket)
- [x] Order history
- [x] Seller order fulfillment

### Categories & Coupons

- [x] Hierarchical category structure
- [x] Coupon creation and management
- [x] Discount application
- [x] Coupon validation

### UI/UX

- [x] Responsive design
- [x] Dark/Light theme
- [x] Shared component library
- [x] Storybook documentation

### Developer Experience

- [x] Comprehensive test coverage
- [x] Structured logging system
- [x] API documentation (Swagger)
- [x] Type-safe shared packages
- [x] Hot module replacement

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- Yarn 1.22+
- MongoDB 7+
- Docker (optional)

### Installation

```bash
# Clone the repository
git clone <repository-url>
cd 3asoftwares

# Install dependencies
yarn install

# Start all services (development)
yarn dev:all
```

### Individual Commands

```bash
# Frontend only
yarn dev:frontend

# Backend only
yarn dev:backend

# Specific app
yarn dev:admin
yarn dev:seller
yarn dev:shell
yarn dev:storefront

# Specific service
yarn dev:auth
yarn dev:product
yarn dev:order
yarn dev:gateway
```

### Docker

```bash
# Development
docker-compose -f docker-compose.dev.yml up

# Production
docker-compose -f docker-compose.production.yml up
```

## 🧪 Testing

```bash
# All tests
yarn test

# Frontend tests
yarn test:frontend

# Backend tests
yarn test:backend

# With coverage
yarn test:coverage:backend
```

### Test Coverage (Current)

| Service/App     | Coverage  |
| --------------- | --------- |
| auth-service    | ~50%      |
| product-service | ~56%      |
| order-service   | ~67%      |
| admin-app       | 66 tests  |
| shell-app       | 56 tests  |
| seller-app      | 59 tests  |
| storefront-app  | 110 tests |

## 📚 Documentation

- Each project has its own README.md with detailed documentation
- Storybook for UI components: `yarn dev:storybook`
- Swagger API docs: Available at `/api-docs` on each service

## 🔗 Port Reference

| Application/Service | Port |
| ------------------- | ---- |
| Shell App           | 3000 |
| Admin App           | 3001 |
| Seller App          | 3002 |
| Storefront App      | 3003 |
| GraphQL Gateway     | 4000 |
| Auth Service        | 4001 |
| Product Service     | 4002 |
| Order Service       | 4003 |
| Category Service    | 4004 |
| Coupon Service      | 4005 |
| Storybook           | 6006 |

---

# 🤖 ChatGPT/AI Assistant Context Prompt

**Copy this prompt when starting a new conversation with an AI assistant:**

```
I'm working on a comprehensive 3asoftwares platform. Here's the context:

## Project Overview
- Enterprise-grade 3asoftwares platform with microservices architecture
- Yarn workspaces monorepo structure
- Three user roles: Customer, Seller, Admin
- 4 frontend apps + 6 backend services + 3 shared packages

## Tech Stack
Frontend:
- React 18, Next.js 16, TypeScript 5
- Build: Vite 4 (admin/seller), Webpack 5 (shell), Next.js (storefront)
- State: Redux Toolkit 2, Zustand 4, TanStack Query 5, Apollo Client 3, Recoil
- Styling: Tailwind CSS 3, DaisyUI 4
- Testing: Jest 29, React Testing Library 14

Backend:
- Node.js 18+, Express 4, TypeScript 5
- Database: MongoDB 8, Mongoose 8
- Caching: Redis (ioredis 5)
- API: GraphQL (Apollo Server 4), REST with Swagger
- Auth: JWT (access/refresh tokens), Google OAuth 2.0, Argon2
- Real-time: Socket.io 4
- Email: Nodemailer 6
- Logging: Custom Logger (file + console)

DevOps:
- Docker, Docker Compose, Kubernetes, Nginx

## Architecture
Frontend Apps (apps/):
- shell-app (3000): Main launcher, auth gateway, Webpack, Zustand
- admin-app (3001): Admin dashboard, Vite, Redux+TanStack Query, 66 tests
- seller-app (3002): Seller portal, Vite, Redux+TanStack Query, 66 tests
- storefront-app (3003): Customer storefront, Next.js 16, Apollo+Zustand, 110 tests

Backend Services (services/):
- graphql-gateway (4000): Apollo Server 4, schema stitching
- auth-service (4001): JWT auth, Google OAuth, email verification, Nodemailer
- product-service (4002): Product CRUD, Redis caching, ~56% coverage
- order-service (4003): Orders, Socket.io real-time, Swagger, ~67% coverage
- category-service (4004): Hierarchical categories, Swagger
- coupon-service (4005): Discount codes, Swagger

Shared Packages (packages/):
- @3asoftwares/types: User, Product, Order, Cart TypeScript interfaces
- @3asoftwares/ui: Button, Badge, Modal, Spinner, Storybook 8
- @3asoftwares/utils: Logger (server/client), validation, API helpers, constants

## Current State
- All services functional and connected via GraphQL gateway
- JWT authentication with Google OAuth support
- Role-based access control (admin, seller, customer)
- Test coverage: ~50-67% backend, 291+ frontend tests
- Structured logging throughout (Logger class)
- ESLint configured for all frontend apps
- Docker/K8s production-ready configurations

## Key Files
- package.json: Root workspace scripts
- packages/utils/src/api/logger.ts: Server Logger (file+console)
- packages/utils/src/api/logger.client.ts: Client Logger (console)
- services/auth-service/src/controllers/: Auth endpoints
- apps/storefront-app/app/: Next.js App Router pages

## Commands
- yarn dev:all - Start all services
- yarn dev:frontend / yarn dev:backend - Start subset
- yarn test - Run all tests
- yarn build:all - Build everything
- yarn lint - Run ESLint

Please help me with: [YOUR REQUEST HERE]
```

---

## 📝 License

MIT License

## 👥 Contributors

Development Team
