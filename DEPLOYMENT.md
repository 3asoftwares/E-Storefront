# Deployment Guide

Deploy the E-Commerce platform using a **cost-effective** stack:

| Component | Service | Free Tier |
|-----------|---------|-----------|
| **Frontend** | Vercel | ✅ Generous free tier |
| **Backend APIs** | Fly.io | ✅ 3 shared VMs free |
| **Database** | MongoDB Atlas | ✅ 512MB free (M0) |
| **Cache** | Upstash Redis | ✅ 10K commands/day |
| **Auth/Edge** | Cloudflare Workers | ✅ 100K requests/day |

---

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                        VERCEL (Frontend)                        │
├─────────────┬─────────────┬─────────────┬──────────────────────┤
│  Shell App  │  Admin App  │ Seller App  │   Storefront App     │
│  (React)    │  (Vite)     │  (Vite)     │   (Next.js SSR)      │
└──────┬──────┴──────┬──────┴──────┬──────┴──────────┬───────────┘
       │             │             │                  │
       └─────────────┴──────┬──────┴──────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────────┐
│                       FLY.IO (Backend)                           │
├─────────────────────────────────────────────────────────────────┤
│                    GraphQL Gateway                               │
├──────────┬──────────┬──────────┬──────────┬────────────────────┤
│   Auth   │ Product  │  Order   │ Category │      Coupon        │
│ Service  │ Service  │ Service  │ Service  │     Service        │
└──────────┴──────────┴──────────┴──────────┴────────────────────┘
        │                   │
        ▼                   ▼
┌───────────────────┐  ┌───────────────────┐
│  MongoDB Atlas    │  │  Upstash Redis    │
│  (Database)       │  │  (Cache)          │
└───────────────────┘  └───────────────────┘
```

---

## Step 1: MongoDB Atlas Setup (Database)

> **Note:** Your codebase uses MongoDB/Mongoose. Supabase uses PostgreSQL which would require code migration.

### 1.1 Create Free Cluster
1. Go to [cloud.mongodb.com](https://cloud.mongodb.com)
2. Sign up / Sign in
3. Create new project: `ecommerce-platform`
4. Build a Database → **M0 Free Tier**
5. Choose region closest to your users

### 1.2 Configure Access
1. **Database Access** → Add User
   - Username: `ecommerce-admin`
   - Password: Generate secure password (save it!)
   - Role: `Atlas Admin`

2. **Network Access** → Add IP
   - Click "Allow Access from Anywhere" (0.0.0.0/0)

### 1.3 Get Connection String
1. Click "Connect" on cluster
2. Choose "Connect your application"
3. Copy string:
```
mongodb+srv://ecommerce-admin:<password>@cluster0.xxxxx.mongodb.net/ecommerce?retryWrites=true&w=majority
```

---

## Step 2: Upstash Redis Setup (Cache)

### 2.1 Create Redis Database
1. Go to [upstash.com](https://upstash.com)
2. Sign up with GitHub
3. Create Database:
   - Name: `ecommerce-cache`
   - Region: Same as Fly.io (e.g., `us-east-1`)
   - Type: Regional

### 2.2 Get Connection Details
From dashboard, copy:
```
REDIS_URL=redis://default:xxxxx@us1-xxxxx.upstash.io:6379
```

Or use the REST API:
```
UPSTASH_REDIS_REST_URL=https://us1-xxxxx.upstash.io
UPSTASH_REDIS_REST_TOKEN=xxxxx
```

---

## Step 3: Fly.io Backend Deployment

### 3.1 Install Fly CLI

**Windows (PowerShell):**
```powershell
pwsh -Command "iwr https://fly.io/install.ps1 -useb | iex"
```

**Or download from:** https://fly.io/docs/hands-on/install-flyctl/

### 3.2 Login to Fly.io
```bash
fly auth login
```

### 3.3 Deploy Each Service

Navigate to project root and deploy each service:

#### Deploy Auth Service
```bash
cd services/auth-service
fly launch --name ecommerce-auth-service --no-deploy

# Set secrets
fly secrets set \
  MONGODB_URI="mongodb+srv://user:pass@cluster.mongodb.net/ecommerce" \
  JWT_SECRET="your-256-bit-secret" \
  JWT_REFRESH_SECRET="your-refresh-secret" \
  SMTP_HOST="smtp.gmail.com" \
  SMTP_PORT="587" \
  SMTP_USER="your-email@gmail.com" \
  SMTP_PASS="your-app-password" \
  EMAIL_FROM="noreply@yourdomain.com" \
  GOOGLE_CLIENT_ID="your-google-client-id" \
  GOOGLE_CLIENT_SECRET="your-google-client-secret" \
  ALLOWED_ORIGINS="https://your-storefront.vercel.app,https://your-admin.vercel.app" \
  FRONTEND_URL="https://your-storefront.vercel.app"

# Deploy
fly deploy
```

#### Deploy Product Service
```bash
cd ../product-service
fly launch --name ecommerce-product-service --no-deploy

fly secrets set \
  MONGODB_URI="mongodb+srv://user:pass@cluster.mongodb.net/ecommerce" \
  JWT_SECRET="your-256-bit-secret" \
  REDIS_URL="redis://default:xxx@us1-xxx.upstash.io:6379" \
  ALLOWED_ORIGINS="https://your-storefront.vercel.app,https://your-admin.vercel.app"

fly deploy
```

#### Deploy Order Service
```bash
cd ../order-service
fly launch --name ecommerce-order-service --no-deploy

fly secrets set \
  MONGODB_URI="mongodb+srv://user:pass@cluster.mongodb.net/ecommerce" \
  JWT_SECRET="your-256-bit-secret" \
  ALLOWED_ORIGINS="https://your-storefront.vercel.app,https://your-admin.vercel.app"

fly deploy
```

#### Deploy Category Service
```bash
cd ../category-service
fly launch --name ecommerce-category-service --no-deploy

fly secrets set \
  MONGODB_URI="mongodb+srv://user:pass@cluster.mongodb.net/ecommerce" \
  ALLOWED_ORIGINS="https://your-storefront.vercel.app,https://your-admin.vercel.app"

fly deploy
```

#### Deploy Coupon Service
```bash
cd ../coupon-service
fly launch --name ecommerce-coupon-service --no-deploy

fly secrets set \
  MONGODB_URI="mongodb+srv://user:pass@cluster.mongodb.net/ecommerce" \
  JWT_SECRET="your-256-bit-secret" \
  ALLOWED_ORIGINS="https://your-storefront.vercel.app,https://your-admin.vercel.app"

fly deploy
```

#### Deploy GraphQL Gateway
```bash
cd ../graphql-gateway
fly launch --name ecommerce-graphql-gateway --no-deploy

fly secrets set \
  AUTH_SERVICE_URL="https://ecommerce-auth-service.fly.dev" \
  PRODUCT_SERVICE_URL="https://ecommerce-product-service.fly.dev" \
  ORDER_SERVICE_URL="https://ecommerce-order-service.fly.dev" \
  CATEGORY_SERVICE_URL="https://ecommerce-category-service.fly.dev" \
  COUPON_SERVICE_URL="https://ecommerce-coupon-service.fly.dev" \
  ALLOWED_ORIGINS="https://your-storefront.vercel.app,https://your-admin.vercel.app"

fly deploy
```

### 3.4 Verify Deployments
```bash
# Check status
fly status -a ecommerce-auth-service
fly status -a ecommerce-graphql-gateway

# View logs
fly logs -a ecommerce-auth-service

# Check health
curl https://ecommerce-auth-service.fly.dev/health
curl https://ecommerce-graphql-gateway.fly.dev/graphql?query=%7B__typename%7D
```

---

## Step 4: Vercel Frontend Deployment

### 4.1 Install Vercel CLI (Optional)
```bash
npm i -g vercel
```

### 4.2 Deploy via Vercel Dashboard (Recommended)

#### Deploy Storefront App
1. Go to [vercel.com](https://vercel.com) → New Project
2. Import `E-Commerce-Microservices-Platform`
3. Configure:
   - **Framework**: Next.js
   - **Root Directory**: `apps/storefront-app`
4. Environment Variables:
   ```
   NEXT_PUBLIC_ENV=production
   NEXT_PUBLIC_GRAPHQL_URL=https://ecommerce-graphql-gateway.fly.dev/graphql
   NEXT_PUBLIC_AUTH_API_URL=https://ecommerce-auth-service.fly.dev
   NEXT_PUBLIC_GOOGLE_CLIENT_ID=your-google-client-id
   ```
5. Deploy

#### Deploy Admin App
1. New Project → Same repo
2. Configure:
   - **Framework**: Vite
   - **Root Directory**: `apps/admin-app`
3. Environment Variables:
   ```
   VITE_ENV=production
   VITE_GRAPHQL_URL=https://ecommerce-graphql-gateway.fly.dev/graphql
   VITE_CLOUDINARY_CLOUD_NAME=your-cloud-name
   VITE_CLOUDINARY_UPLOAD_PRESET=your-preset
   ```

#### Deploy Seller App
1. New Project → Same repo
2. Configure:
   - **Framework**: Vite
   - **Root Directory**: `apps/seller-app`
3. Environment Variables:
   ```
   VITE_ENV=production
   VITE_AUTH_API=https://ecommerce-auth-service.fly.dev
   VITE_PRODUCT_API=https://ecommerce-product-service.fly.dev
   VITE_ORDER_API=https://ecommerce-order-service.fly.dev
   VITE_CATEGORY_API=https://ecommerce-category-service.fly.dev
   VITE_SHELL_APP_URL=https://your-shell-app.vercel.app
   VITE_CLOUDINARY_CLOUD_NAME=your-cloud-name
   VITE_CLOUDINARY_UPLOAD_PRESET=your-preset
   ```

#### Deploy Shell App
1. New Project → Same repo
2. Configure:
   - **Framework**: Other
   - **Root Directory**: `apps/shell-app`
   - **Build Command**: `cd ../.. && yarn install && yarn workspace shell-app build`
   - **Output Directory**: `dist`
3. Environment Variables:
   ```
   NODE_ENV=production
   GRAPHQL_URL=https://ecommerce-graphql-gateway.fly.dev/graphql
   ADMIN_APP_URL=https://your-admin-app.vercel.app
   SELLER_APP_URL=https://your-seller-app.vercel.app
   ```

---

## Step 5: Update CORS After Deployment

After all deployments, update `ALLOWED_ORIGINS` in each Fly.io service:

```bash
fly secrets set ALLOWED_ORIGINS="https://storefront-xxx.vercel.app,https://admin-xxx.vercel.app,https://seller-xxx.vercel.app,https://shell-xxx.vercel.app" -a ecommerce-auth-service

# Repeat for all services...
```

---

## Step 6: Cloudflare Workers (Optional - Edge Auth)

For edge-optimized authentication, you can add Cloudflare Workers:

### 6.1 Create Worker
```bash
npm create cloudflare@latest ecommerce-auth-edge
```

### 6.2 Example Worker for JWT Validation
```typescript
// src/index.ts
export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const token = request.headers.get('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return new Response('Unauthorized', { status: 401 });
    }

    // Validate JWT at the edge
    try {
      const payload = await verifyJWT(token, env.JWT_SECRET);
      
      // Forward to backend with validated user
      const backendUrl = `${env.AUTH_SERVICE_URL}${new URL(request.url).pathname}`;
      return fetch(backendUrl, {
        ...request,
        headers: {
          ...Object.fromEntries(request.headers),
          'X-User-Id': payload.userId,
          'X-User-Role': payload.role,
        },
      });
    } catch (e) {
      return new Response('Invalid token', { status: 401 });
    }
  },
};
```

---

## Quick Reference - Service URLs

After deployment, your URLs will be:

### Backend (Fly.io)
```
https://ecommerce-auth-service.fly.dev
https://ecommerce-product-service.fly.dev
https://ecommerce-order-service.fly.dev
https://ecommerce-category-service.fly.dev
https://ecommerce-coupon-service.fly.dev
https://ecommerce-graphql-gateway.fly.dev
```

### Frontend (Vercel)
```
https://ecommerce-storefront.vercel.app
https://ecommerce-admin.vercel.app
https://ecommerce-seller.vercel.app
https://ecommerce-shell.vercel.app
```

---

## Fly.io CLI Quick Commands

```bash
# List all apps
fly apps list

# Check app status
fly status -a <app-name>

# View logs
fly logs -a <app-name>

# SSH into container
fly ssh console -a <app-name>

# Scale up/down
fly scale count 2 -a <app-name>

# Update secrets
fly secrets set KEY=value -a <app-name>

# Restart app
fly apps restart <app-name>
```

---

## Cost Estimation

### Free Tier Limits

| Service | Free Tier Limit |
|---------|-----------------|
| **Fly.io** | 3 shared-cpu VMs, 160GB outbound |
| **Vercel** | 100GB bandwidth, 100 deployments/day |
| **MongoDB Atlas** | 512MB storage (M0) |
| **Upstash Redis** | 10K commands/day, 256MB |
| **Cloudflare Workers** | 100K requests/day |

### Estimated Monthly Cost (Scaling Up)

| Service | Hobby/Pro Plan |
|---------|----------------|
| Fly.io (6 services) | ~$15-30/month |
| Vercel Pro | $20/month |
| MongoDB Atlas M10 | $57/month |
| Upstash Pay-as-you-go | ~$5/month |
| **Total** | **~$100/month** |

---

## Troubleshooting

### Fly.io Build Fails
```bash
# Check build logs
fly logs -a <app-name>

# Rebuild
fly deploy --no-cache
```

### CORS Errors
- Ensure all Vercel URLs are in `ALLOWED_ORIGINS`
- No trailing slashes in URLs
- Check protocol (https not http)

### Database Connection Issues
- Verify MongoDB Atlas IP whitelist includes `0.0.0.0/0`
- Check connection string format
- Ensure database user has correct permissions

### Fly.io Machine Sleeping
Free tier machines auto-stop. First request may be slow (~2s cold start).
To keep alive:
```bash
fly scale count 1 --min-machines-running=1 -a <app-name>
```
