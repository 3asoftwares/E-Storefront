# 🛠️ Technology Stack - E-Commerce Platform

## 📊 Overview

| Layer               | Technology                                 |
| ------------------- | ------------------------------------------ |
| **Architecture**    | Microservices + Micro-frontends (Monorepo) |
| **Package Manager** | Yarn Workspaces                            |
| **Language**        | TypeScript 5.x                             |
| **Container**       | Docker + Docker Compose                    |
| **Orchestration**   | Kubernetes (K8s)                           |
| **Reverse Proxy**   | NGINX                                      |
| **CI/CD**           | GitHub Actions                             |
| **Deployment**      | Vercel (Frontend) / Kubernetes (Full)      |

---

## 🖥️ Frontend Applications

### 1. Storefront App (Customer-facing)

| Category             | Technology                        |
| -------------------- | --------------------------------- |
| **Framework**        | Next.js 16 (App Router)           |
| **UI Library**       | React 18                          |
| **Styling**          | Tailwind CSS 3.4 + DaisyUI 4.x    |
| **State Management** | Zustand, Recoil                   |
| **Data Fetching**    | Apollo Client, TanStack Query 5.x |
| **Icons**            | Font Awesome 7                    |
| **HTTP Client**      | Axios                             |
| **Testing**          | Jest 29 + React Testing Library   |

### 2. Admin App (Platform management)

| Category             | Technology                              |
| -------------------- | --------------------------------------- |
| **Build Tool**       | Vite 4.5                                |
| **UI Library**       | React 18                                |
| **Styling**          | Tailwind CSS 3.4 + DaisyUI 4.x          |
| **State Management** | Redux Toolkit 2, React Redux 9, Zustand |
| **Data Fetching**    | TanStack Query 5.x                      |
| **Routing**          | React Router DOM 6                      |
| **Media**            | Cloudinary SDK                          |
| **Micro-frontend**   | Vite Plugin Federation                  |
| **Testing**          | Jest 29 + React Testing Library         |

### 3. Seller App (Seller portal)

| Category             | Technology                      |
| -------------------- | ------------------------------- |
| **Build Tool**       | Vite 4.5                        |
| **UI Library**       | React 18                        |
| **Styling**          | Tailwind CSS 3.4 + DaisyUI 4.x  |
| **State Management** | Redux Toolkit 2, React Redux 9  |
| **Data Fetching**    | TanStack Query 5.x              |
| **Routing**          | React Router DOM 6              |
| **Media**            | Cloudinary SDK                  |
| **Micro-frontend**   | Vite Plugin Federation          |
| **Testing**          | Jest 29 + React Testing Library |

### 4. Shell App (Central launcher)

| Category             | Technology                           |
| -------------------- | ------------------------------------ |
| **Build Tool**       | Webpack 5                            |
| **Transpiler**       | Babel 7 (React + TypeScript presets) |
| **UI Library**       | React 18                             |
| **Styling**          | Tailwind CSS 3.4 + DaisyUI 4.x       |
| **State Management** | Zustand                              |
| **Routing**          | React Router DOM 6                   |
| **Testing**          | Jest 29 + React Testing Library      |

---

## ⚙️ Backend Services

### Common Stack (All Services)

| Category        | Technology             |
| --------------- | ---------------------- |
| **Runtime**     | Node.js                |
| **Framework**   | Express.js 4.18        |
| **Language**    | TypeScript 5.3         |
| **Database**    | MongoDB 7 (Mongoose 8) |
| **Security**    | Helmet, CORS           |
| **Logging**     | Morgan                 |
| **Validation**  | Express Validator 7    |
| **Environment** | dotenv                 |
| **Dev Server**  | Nodemon + ts-node      |
| **Testing**     | Jest 29 + ts-jest      |

### Auth Service (Authentication)

| Extra Feature        | Technology                                  |
| -------------------- | ------------------------------------------- |
| **Authentication**   | JWT (jsonwebtoken 9)                        |
| **Password Hashing** | bcryptjs                                    |
| **Email**            | Nodemailer                                  |
| **API Docs**         | Swagger (swagger-jsdoc, swagger-ui-express) |
| **Deployment**       | Vercel Serverless (@vercel/node)            |

### Product Service (Products & Reviews)

| Extra Feature | Technology        |
| ------------- | ----------------- |
| **Caching**   | Redis 7 (ioredis) |

### GraphQL Gateway (API Aggregation)

| Extra Feature           | Technology            |
| ----------------------- | --------------------- |
| **API Layer**           | Apollo Server 4       |
| **Query Language**      | GraphQL 16            |
| **HTTP Client**         | Axios                 |
| **Next.js Integration** | @as-integrations/next |

---

## 📦 Shared Packages

### @3asoftwares/types

| Category       | Technology                  |
| -------------- | --------------------------- |
| **Purpose**    | TypeScript type definitions |
| **Build Tool** | tsup 8                      |
| **Testing**    | Vitest 4                    |

### @3asoftwares/utils

| Category       | Technology                           |
| -------------- | ------------------------------------ |
| **Purpose**    | Shared utilities, configs, constants |
| **Build Tool** | tsup 8                               |
| **Testing**    | Vitest 4                             |
| **Exports**    | Client/Server split bundles          |

### @3asoftwares/ui

| Category          | Technology              |
| ----------------- | ----------------------- |
| **Purpose**       | React component library |
| **Build Tool**    | Vite + tsup             |
| **Documentation** | Storybook               |
| **Testing**       | Vitest 4                |
| **Icons**         | Font Awesome            |

---

## 🧪 Testing Stack

| Layer              | Technology                         |
| ------------------ | ---------------------------------- |
| **Frontend Tests** | Jest 29 + React Testing Library 14 |
| **Backend Tests**  | Jest 29 + ts-jest                  |
| **Package Tests**  | Vitest 4                           |
| **Coverage**       | @vitest/coverage-v8                |

---

## 📐 Code Quality

| Tool                          | Purpose           |
| ----------------------------- | ----------------- |
| **ESLint 8**                  | Linting           |
| **TypeScript ESLint**         | TS-specific rules |
| **eslint-plugin-react**       | React rules       |
| **eslint-plugin-react-hooks** | Hooks rules       |
| **eslint-plugin-jsx-a11y**    | Accessibility     |
| **Prettier**                  | Code formatting   |

---

## 🏗️ Infrastructure & DevOps

### Container Orchestration

| Technology      | Purpose                                |
| --------------- | -------------------------------------- |
| **Docker**      | Containerization                       |
| **Docker Compose** | Local development & simple production |
| **Kubernetes**  | Production-grade orchestration         |
| **Helm**        | K8s package management (optional)      |

### NGINX (Reverse Proxy & Load Balancer)

| Feature              | Implementation                          |
| -------------------- | --------------------------------------- |
| **Reverse Proxy**    | Routes traffic to microservices         |
| **Load Balancing**   | Distributes load across service replicas |
| **Rate Limiting**    | API: 10 req/s, Auth: 5 req/s            |
| **Gzip Compression** | Reduces bandwidth, faster responses     |
| **Security Headers** | XSS, CSRF, Clickjacking protection      |
| **Static Serving**   | Admin & Seller app static files         |
| **WebSocket**        | GraphQL subscriptions support           |

### Kubernetes Features

| Feature                    | Purpose                              |
| -------------------------- | ------------------------------------ |
| **Deployments**            | Declarative pod management           |
| **Services**               | Internal networking & discovery      |
| **Ingress**                | External traffic routing             |
| **ConfigMaps**             | Configuration management             |
| **Secrets**                | Sensitive data storage               |
| **HPA**                    | Horizontal Pod Autoscaling           |
| **Network Policies**       | Pod-to-pod traffic control           |
| **PodDisruptionBudgets**   | High availability during updates     |
| **Resource Quotas**        | Namespace resource limits            |

### CI/CD Pipeline (GitHub Actions)

| Workflow               | Trigger                    | Purpose                           |
| ---------------------- | -------------------------- | --------------------------------- |
| **CI Pipeline**        | Push to any branch         | Build, test, lint all apps        |
| **Deploy to Vercel**   | Push to main (6hr throttle)| Deploy frontend apps              |
| **Deploy to K8s**      | Manual trigger             | Deploy to Kubernetes cluster      |
| **Manual Deploy**      | Manual trigger             | Deploy specific app to env        |
| **Team Notifications** | Workflow completion        | Notify team on success/failure    |
| **PR Labeler**         | PR opened                  | Auto-label based on files changed |
| **Stale Handler**      | Daily schedule             | Mark/close stale issues & PRs     |

### Deployment Options

| Option          | Use Case                    | Technology                    |
| --------------- | --------------------------- | ----------------------------- |
| **Vercel**      | Frontend apps (serverless)  | Automatic, edge deployment    |
| **Docker Compose** | Local dev, small production | Single-host deployment        |
| **Kubernetes**  | Large-scale production      | Multi-node, auto-scaling      |

---

## 📈 Technology Summary

```
┌─────────────────────────────────────────────────────────────────┐
│                    E-COMMERCE PLATFORM                          │
├─────────────────────────────────────────────────────────────────┤
│  FRONTEND (4 Apps)           │  BACKEND (6 Services)           │
│  ─────────────────           │  ──────────────────             │
│  • Next.js 16 (Storefront)   │  • Express.js 4.18              │
│  • Vite 4.5 (Admin, Seller)  │  • Apollo Server 4 (Gateway)    │
│  • Webpack 5 (Shell)         │  • MongoDB 7 + Mongoose 8       │
│  • React 18 + TypeScript     │  • Redis 7 (ioredis)            │
│  • Tailwind + DaisyUI        │  • JWT Authentication           │
│  • Redux Toolkit / Zustand   │  • Swagger API Docs             │
│  • TanStack Query / Apollo   │                                 │
├─────────────────────────────────────────────────────────────────┤
│  SHARED PACKAGES             │  INFRASTRUCTURE                 │
│  ────────────────            │  ──────────────                 │
│  • @3asoftwares/types        │  • Docker + Docker Compose      │
│  • @3asoftwares/utils        │  • Kubernetes (K8s)             │
│  • @3asoftwares/ui           │  • NGINX (Reverse Proxy/LB)     │
│  • Storybook                 │  • GitHub Actions CI/CD         │
│  • tsup Build Tool           │  • Vercel (Frontend Deploy)     │
├─────────────────────────────────────────────────────────────────┤
│  DEVOPS & TEAM TOOLS                                            │
│  ───────────────────                                            │
│  • CODEOWNERS (Auto-assign reviewers)                           │
│  • PR Templates (Standardized PRs)                              │
│  • Issue Templates (Bug reports, Features)                      │
│  • Branch Protection Rules                                      │
│  • Deployment Environments (Staging, Production)                │
│  • Auto-labeling PRs                                            │
│  • Stale issue/PR management                                    │
└─────────────────────────────────────────────────────────────────┘
```

---

## 📁 Project Structure

```
E-Commerce/
├── apps/                    # Frontend applications
│   ├── storefront-app/      # Next.js 16 (Customer store)
│   ├── admin-app/           # Vite + React (Platform admin)
│   ├── seller-app/          # Vite + React (Seller portal)
│   └── shell-app/           # Webpack + React (MFE container)
│
├── services/                # Backend microservices
│   ├── auth-service/        # Authentication & JWT
│   ├── product-service/     # Products & inventory
│   ├── order-service/       # Orders & checkout
│   ├── category-service/    # Product categories
│   ├── coupon-service/      # Discounts & coupons
│   └── graphql-gateway/     # Apollo GraphQL aggregator
│
├── packages/                # Shared libraries
│   ├── types/               # TypeScript definitions
│   ├── utils/               # Shared utilities
│   └── ui-library/          # React component library
│
├── k8s/                     # Kubernetes configurations
│   ├── apps/                # Frontend deployments
│   ├── services/            # Backend deployments
│   ├── database/            # MongoDB & Redis
│   ├── nginx/               # NGINX deployment
│   ├── ingress.yaml         # Ingress rules
│   ├── network-policies.yaml
│   └── deploy.ps1 / .sh     # Deploy scripts
│
├── nginx/                   # NGINX for Docker Compose
│   ├── Dockerfile
│   └── nginx.conf
│
├── .github/                 # GitHub configurations
│   ├── workflows/           # CI/CD pipelines
│   ├── CODEOWNERS           # Auto-assign reviewers
│   ├── PULL_REQUEST_TEMPLATE.md
│   ├── CONTRIBUTING.md
│   └── ISSUE_TEMPLATE/      # Bug & feature templates
│
└── docs/                    # Documentation
```

---

## 📊 Technology Count

| Category                   | Count                                       |
| -------------------------- | ------------------------------------------- |
| **Languages**              | 2 (TypeScript, JavaScript)                  |
| **Frontend Frameworks**    | 2 (React, Next.js)                          |
| **Build Tools**            | 4 (Vite, Webpack, tsup, Next.js)            |
| **State Management**       | 4 (Redux, Zustand, Recoil, TanStack Query)  |
| **Databases**              | 2 (MongoDB, Redis)                          |
| **Testing Frameworks**     | 2 (Jest, Vitest)                            |
| **Infrastructure**         | 4 (Docker, K8s, NGINX, Vercel)              |
| **CI/CD Workflows**        | 8                                           |
| **Total npm Dependencies** | ~100+ packages                              |
