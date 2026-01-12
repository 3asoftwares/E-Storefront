# CI/CD Setup Guide

This document explains how to set up the CI/CD pipelines for the E-Commerce platform.

## Overview

The platform uses GitHub Actions for CI/CD with three main deployment targets:

| Target | Platform | Components |
|--------|----------|------------|
| **Frontend** | Vercel | admin-app, seller-app, shell-app |
| **Backend** | Railway | auth-service, category-service, coupon-service, graphql-gateway, order-service, product-service |
| **Packages** | npm | @3asoftwares/types, @3asoftwares/utils, @3asoftwares/ui-library |

## Quick Start

### 1. Set Up GitHub Secrets

Go to your GitHub repository → **Settings** → **Secrets and variables** → **Actions** → **New repository secret**

Add the following secrets:

#### Vercel Secrets (Frontend)
| Secret Name | Description | How to Get |
|-------------|-------------|------------|
| `VERCEL_TOKEN` | Vercel API token | [Vercel Tokens](https://vercel.com/account/tokens) → Create Token |
| `VERCEL_ORG_ID` | Your Vercel team/org ID | Project Settings → General → Copy "Team ID" |
| `VERCEL_PROJECT_ID_ADMIN` | Project ID for admin-app | Create project in Vercel, copy Project ID from settings |
| `VERCEL_PROJECT_ID_SELLER` | Project ID for seller-app | Create project in Vercel, copy Project ID from settings |
| `VERCEL_PROJECT_ID_SHELL` | Project ID for shell-app | Create project in Vercel, copy Project ID from settings |

#### Railway Secrets (Backend)
| Secret Name | Description | How to Get |
|-------------|-------------|------------|
| `RAILWAY_TOKEN` | Railway API token | [Railway Tokens](https://railway.app/account/tokens) → Create Token |
| `RAILWAY_PROJECT_ID` | Railway project ID | Project Settings → General → Copy Project ID |

#### npm Secrets (Packages)
| Secret Name | Description | How to Get |
|-------------|-------------|------------|
| `NPM_TOKEN` | npm automation token | [npm Tokens](https://www.npmjs.com/settings/YOUR_USERNAME/tokens) → Generate New Token → Automation |

---

## Detailed Setup Instructions

### Vercel Setup

#### Step 1: Create Vercel Account & Team
1. Go to [vercel.com](https://vercel.com) and sign up
2. Create a team (optional, for VERCEL_ORG_ID)

#### Step 2: Get VERCEL_TOKEN
1. Go to [Account Settings → Tokens](https://vercel.com/account/tokens)
2. Click "Create Token"
3. Name it (e.g., "GitHub Actions")
4. Select scope: "Full Account" or specific team
5. Copy the token and save as `VERCEL_TOKEN` in GitHub Secrets

#### Step 3: Get VERCEL_ORG_ID
1. Go to [Team Settings](https://vercel.com/teams) (or Account Settings if personal)
2. Copy the "Team ID" (or use your username for personal accounts)
3. Save as `VERCEL_ORG_ID` in GitHub Secrets

#### Step 4: Create Projects & Get Project IDs
For each frontend app (admin-app, seller-app, shell-app):

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Click "Add New" → "Project"
3. Import your GitHub repository
4. Configure:
   - **Framework Preset**: Vite (for admin-app, seller-app) or Custom (for shell-app)
   - **Root Directory**: `apps/admin-app` (or respective app folder)
   - **Build Command**: `yarn build`
   - **Output Directory**: `dist`
5. Deploy once to create the project
6. Go to Project Settings → General
7. Copy the "Project ID"
8. Save as the corresponding secret:
   - admin-app → `VERCEL_PROJECT_ID_ADMIN`
   - seller-app → `VERCEL_PROJECT_ID_SELLER`
   - shell-app → `VERCEL_PROJECT_ID_SHELL`

---

### Railway Setup

#### Step 1: Create Railway Account & Project
1. Go to [railway.app](https://railway.app) and sign up
2. Create a new project

#### Step 2: Get RAILWAY_TOKEN
1. Go to [Account Settings → Tokens](https://railway.app/account/tokens)
2. Click "Create Token"
3. Name it (e.g., "GitHub Actions")
4. Copy the token and save as `RAILWAY_TOKEN` in GitHub Secrets

#### Step 3: Get RAILWAY_PROJECT_ID
1. Open your Railway project
2. Go to Project Settings (gear icon)
3. Copy the "Project ID" from the URL or settings
4. Save as `RAILWAY_PROJECT_ID` in GitHub Secrets

#### Step 4: Create Services in Railway
For each microservice, create a service in your Railway project:
- auth-service
- category-service
- coupon-service
- graphql-gateway
- order-service
- product-service

The services will be automatically linked during deployment.

---

### npm Setup

#### Step 1: Create npm Account
1. Go to [npmjs.com](https://www.npmjs.com) and sign up
2. Verify your email

#### Step 2: Create Organization (Optional)
1. Go to [Organizations](https://www.npmjs.com/org/create)
2. Create organization (e.g., @3asoftwares)

#### Step 3: Get NPM_TOKEN
1. Go to [Access Tokens](https://www.npmjs.com/settings/YOUR_USERNAME/tokens)
2. Click "Generate New Token" → "Classic Token"
3. Select "Automation" type
4. Copy the token and save as `NPM_TOKEN` in GitHub Secrets

---

## Workflow Triggers

### Automatic Deployment (Push to Main Only)

Deployments only happen when:
1. **Push to `main` branch** - Only commits to main trigger deployments
2. **6-hour interval check** - If last deployment was less than 6 hours ago, deployment is skipped
3. **File changes detected** - Only affected apps/services are deployed

| Changed Files | Workflow Triggered |
|--------------|-------------------|
| `apps/admin-app/**` | Vercel: admin-app |
| `apps/seller-app/**` | Vercel: seller-app |
| `apps/shell-app/**` | Vercel: shell-app |
| `services/**` | Railway: affected service |
| `packages/types/**` | npm: types + all dependents |
| `packages/utils/**` | npm: utils + all dependents |
| `packages/ui-library/**` | npm: ui-library |

### 6-Hour Deployment Interval

To prevent excessive deployments and save resources:
- Each workflow checks when it last ran successfully
- If less than 6 hours have passed, deployment is **skipped**
- Use "Force deployment" option in manual dispatch to bypass this check

### Manual Deployment
All workflows support manual triggering via GitHub Actions UI:
1. Go to Actions tab
2. Select the workflow
3. Click "Run workflow"
4. Check "Force deployment" to bypass 6-hour check
5. Select options and run

---

## Workflow Files

| File | Purpose |
|------|---------|
| [deploy-vercel.yml](.github/workflows/deploy-vercel.yml) | Deploy frontend apps to Vercel |
| [deploy-railway.yml](.github/workflows/deploy-railway.yml) | Deploy backend services to Railway |
| [publish-packages.yml](.github/workflows/publish-packages.yml) | Publish packages to npm |
| [scheduled-deploy.yml](.github/workflows/scheduled-deploy.yml) | Scheduled full deployment (every 6 hours) |
| [ci.yml](.github/workflows/ci.yml) | Build and test on every push/PR |

---

## Troubleshooting

### Error: "You specified VERCEL_ORG_ID but forgot VERCEL_PROJECT_ID"
**Cause**: Missing project-specific Vercel secret

**Fix**: Add the missing secret:
- `VERCEL_PROJECT_ID_ADMIN` for admin-app
- `VERCEL_PROJECT_ID_SELLER` for seller-app
- `VERCEL_PROJECT_ID_SHELL` for shell-app

### Error: "Unauthorized. Please login with railway login"
**Cause**: Missing or invalid Railway secrets

**Fix**:
1. Ensure `RAILWAY_TOKEN` is set correctly
2. Ensure `RAILWAY_PROJECT_ID` is set correctly
3. Generate a new token if the old one expired

### Error: "npm publish failed - 403 Forbidden"
**Cause**: Version already exists or invalid token

**Fix**:
1. Bump the version in package.json before publishing
2. Verify `NPM_TOKEN` has publish permissions
3. Ensure the package name is available

### Deployment not triggering on push
**Cause**: Path filters not matching

**Fix**: Check that your changes are in the monitored paths:
- Frontend: `apps/<app-name>/**`
- Backend: `services/<service-name>/**`
- Packages: `packages/<package-name>/**`

---

## Secret Checklist

Use this checklist to verify all secrets are configured:

```
GitHub Secrets:
├── Vercel (Frontend)
│   ├── [ ] VERCEL_TOKEN
│   ├── [ ] VERCEL_ORG_ID
│   ├── [ ] VERCEL_PROJECT_ID_ADMIN
│   ├── [ ] VERCEL_PROJECT_ID_SELLER
│   └── [ ] VERCEL_PROJECT_ID_SHELL
├── Railway (Backend)
│   ├── [ ] RAILWAY_TOKEN
│   └── [ ] RAILWAY_PROJECT_ID
└── npm (Packages)
    └── [ ] NPM_TOKEN
```

---

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                     GitHub Repository                        │
│                                                              │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐          │
│  │   apps/     │  │  services/  │  │  packages/  │          │
│  │ admin-app   │  │ auth-srv    │  │   types     │          │
│  │ seller-app  │  │ category    │  │   utils     │          │
│  │ shell-app   │  │ coupon-srv  │  │ ui-library  │          │
│  │             │  │ gateway     │  │             │          │
│  │             │  │ order-srv   │  │             │          │
│  │             │  │ product-srv │  │             │          │
│  └──────┬──────┘  └──────┬──────┘  └──────┬──────┘          │
│         │                │                │                  │
└─────────┼────────────────┼────────────────┼──────────────────┘
          │                │                │
          ▼                ▼                ▼
    ┌──────────┐    ┌──────────┐    ┌──────────┐
    │  Vercel  │    │ Railway  │    │   npm    │
    │          │    │          │    │ Registry │
    │ 3 Apps   │    │ 6 Micro  │    │ 3 Pkgs   │
    │          │    │ Services │    │          │
    └──────────┘    └──────────┘    └──────────┘
```

---

## Support

If you encounter issues:
1. Check the GitHub Actions logs for detailed error messages
2. Verify all secrets are correctly configured
3. Ensure your tokens haven't expired
4. Check the platform-specific dashboards (Vercel, Railway, npm) for additional logs
