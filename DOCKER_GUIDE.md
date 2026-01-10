# Docker Setup Guide - E-Commerce Platform

Complete Docker configuration and setup guide for the E-Commerce Platform local development environment.

## 🐳 Docker Architecture

```
┌─────────────────────────────────────────────┐
│     Docker Compose Network                  │
│     (ecommerce-network)                     │
│                                             │
│  ┌──────────────┐    ┌──────────────┐      │
│  │  MongoDB     │    │  Redis       │      │
│  │  Container   │    │  Container   │      │
│  │  (ecommerce) │    │ (ecommerce)  │      │
│  └──────┬───────┘    └──────┬───────┘      │
│         │                   │              │
│  ┌──────┴───────────────────┴─────────┐    │
│  │                                    │    │
│  │  Main App Container                │    │
│  │  (ecommerce-app)                   │    │
│  │                                    │    │
│  │  - Frontend Apps                   │    │
│  │    • Shell App (3000)              │    │
│  │    • Admin App (3001)              │    │
│  │    • Seller App (3002)             │    │
│  │    • Storefront (3003)             │    │
│  │                                    │    │
│  │  - Backend Services                │    │
│  │    • Auth Service (3011)           │    │
│  │    • Category Service (3012)       │    │
│  │    • Coupon Service (3013)         │    │
│  │    • Product Service (3014)        │    │
│  │    • Order Service (3015)          │    │
│  │    • GraphQL Gateway (4000)        │    │
│  │    • Storybook (6006)              │    │
│  └────────────────────────────────────┘    │
│                                             │
└─────────────────────────────────────────────┘
```

## 📋 Prerequisites

- Docker Desktop (macOS, Windows) or Docker Engine (Linux)
- Docker Compose v3.8+
- Node.js v20+ (for local development without Docker)
- Git

### Installation

- **macOS/Windows**: [Docker Desktop](https://www.docker.com/products/docker-desktop)
- **Linux**: [Docker Engine](https://docs.docker.com/engine/install/)

```bash
# Verify Docker installation
docker --version
docker-compose --version
```

## 🗄️ Database Configuration

### MongoDB Container: `ecommerce`

- **Database Name**: `ecommerce`
- **Port**: `27017`
- **Username**: `admin`
- **Password**: `password` (change in production)
- **Connection URL**: `mongodb://admin:password@mongodb:27017/ecommerce?authSource=admin`

**Collections:**
- `users` - User accounts and authentication
- `products` - Product catalog with full-text search index
- `categories` - Product categories with hierarchical structure
- `orders` - Customer orders
- `coupons` - Discount coupons with expiration tracking
- `reviews` - Product reviews and ratings
- `addresses` - Customer shipping/billing addresses

**Indexes:**
```javascript
// Products
db.products.createIndex({ name: 'text', description: 'text' });
db.products.createIndex({ category: 1 });
db.products.createIndex({ price: 1 });
db.products.createIndex({ createdAt: -1 });

// Orders
db.orders.createIndex({ userId: 1 });
db.orders.createIndex({ status: 1 });
db.orders.createIndex({ createdAt: -1 });

// Users
db.users.createIndex({ email: 1 }, { unique: true });
db.users.createIndex({ role: 1 });

// Categories
db.categories.createIndex({ slug: 1 }, { unique: true });
db.categories.createIndex({ parentId: 1 });

// Coupons
db.coupons.createIndex({ code: 1 }, { unique: true });
db.coupons.createIndex({ expiresAt: 1 });
```

### Redis Container: `ecommerce-redis`

- **Database Index**: `0`
- **Port**: `6379`
- **Connection URL**: `redis://redis:6379/0`
- **Key Prefix**: `ecommerce:`

**Usage:**
- Session storage
- Caching layer for frequently accessed data
- Product cache (catalog, categories)
- User session management
- Rate limiting

## 🚀 Quick Start

### 1. Basic Setup

```bash
# Clone the repository
git clone https://github.com/3asoftwares/E-Commerce.git
cd E-Commerce

# Install dependencies
yarn install

# Copy environment file
cp .env.docker.example .env.docker
```

### 2. Start Docker Containers

```bash
# Start all services (MongoDB, Redis, and App)
docker-compose up -d

# Verify containers are running
docker-compose ps

# Expected output:
# NAME              IMAGE              STATUS
# ecommerce         mongo:7.0          Healthy
# ecommerce-redis   redis:7-alpine     Healthy
# ecommerce-app     e-commerce-app     Running
```

### 3. Verify Services

```bash
# Check MongoDB
docker exec ecommerce mongosh --username admin --password password --authenticationDatabase admin --eval "db.adminCommand('ping')"

# Check Redis
docker exec ecommerce-redis redis-cli ping

# View application logs
docker-compose logs -f app
```

## 🛠️ Common Docker Commands

### Container Management

```bash
# Start services
docker-compose up -d

# Stop services (keeps data in volumes)
docker-compose stop

# Stop and remove containers
docker-compose down

# Rebuild images
docker-compose build --no-cache

# Restart services
docker-compose restart

# View all containers
docker-compose ps

# View container logs
docker-compose logs app
docker-compose logs -f app  # Follow logs
docker-compose logs --tail 100 app  # Last 100 lines
```

### Database Operations

```bash
# MongoDB - Connect to database
docker exec -it ecommerce mongosh --username admin --password password --authenticationDatabase admin

# MongoDB - List databases
docker exec ecommerce mongosh --username admin --password password --authenticationDatabase admin --eval "db.adminCommand('listDatabases')"

# MongoDB - List collections
docker exec ecommerce mongosh --username admin --password password --authenticationDatabase admin ecommerce --eval "db.listCollections().toArray()"

# Redis - Connect to CLI
docker exec -it ecommerce-redis redis-cli

# Redis - Check database size
docker exec ecommerce-redis redis-cli dbsize

# Redis - Get all keys
docker exec ecommerce-redis redis-cli keys '*'

# Redis - Clear all data
docker exec ecommerce-redis redis-cli FLUSHALL
```

### Volume Management

```bash
# List volumes
docker volume ls

# Inspect volume
docker volume inspect e-commerce_mongodb_data
docker volume inspect e-commerce_redis_data

# Remove volumes (WARNING: Deletes data!)
docker volume rm e-commerce_mongodb_data
docker volume rm e-commerce_redis_data
```

## 📊 Service Ports

| Service | Port | URL |
|---------|------|-----|
| Shell App | 3000 | http://localhost:3000 |
| Admin App | 3001 | http://localhost:3001 |
| Seller App | 3002 | http://localhost:3002 |
| Storefront | 3003 | http://localhost:3003 |
| Auth Service | 3011 | http://localhost:3011 |
| Category Service | 3012 | http://localhost:3012 |
| Coupon Service | 3013 | http://localhost:3013 |
| Product Service | 3014 | http://localhost:3014 |
| Order Service | 3015 | http://localhost:3015 |
| GraphQL Gateway | 4000 | http://localhost:4000/graphql |
| Storybook | 6006 | http://localhost:6006 |
| MongoDB | 27017 | mongodb://localhost:27017 |
| Redis | 6379 | redis://localhost:6379 |

## 🔧 Configuration Files

### .env.docker

Local development environment variables. See [.env.docker](.env.docker) for all options.

**Key Variables:**
```bash
# Database Configuration
MONGODB_URL=mongodb://admin:password@mongodb:27017/ecommerce?authSource=admin
REDIS_URL=redis://redis:6379/0

# Service URLs
AUTH_SERVICE_URL=http://localhost:3011
CATEGORY_SERVICE_URL=http://localhost:3012
COUPON_SERVICE_URL=http://localhost:3013
PRODUCT_SERVICE_URL=http://localhost:3014
ORDER_SERVICE_URL=http://localhost:3015
GRAPHQL_GATEWAY_URL=http://localhost:4000

# CORS & API URLs
ALLOWED_ORIGINS=http://localhost:3000,http://localhost:3001,http://localhost:3002,http://localhost:3003,http://localhost:6006
VITE_API_URL=http://localhost:4000/graphql
NEXT_PUBLIC_API_URL=http://localhost:4000/graphql

# JWT Configuration
JWT_SECRET=docker-dev-jwt-secret-key-change-in-production
JWT_EXPIRES_IN=24h
```

### docker-compose.yml

Main Docker Compose configuration for local development. Includes:
- MongoDB service with health checks
- Redis service with health checks
- Main application container with all frontend and backend services

### Dockerfile

Main application Dockerfile with:
- Multi-layer build for optimized image size
- Yarn workspace support
- All dependencies pre-installed
- All services exposed on appropriate ports

### .dockerignore

Optimized for faster builds by excluding:
- `node_modules` directories
- Build outputs (dist, build, .next)
- Git files and configuration
- IDE and OS files
- Test files and coverage

## 🌱 Seeding Database

### Using Docker

```bash
# 1. Start containers
docker-compose up -d

# 2. Wait for MongoDB to be healthy
docker-compose ps

# 3. Seed the database
docker exec ecommerce-app yarn workspace sample-data run seed

# Alternative: Run directly
cd sample-data
yarn install
yarn seed
```

### Seed Data Includes

- **100 Users** - Various roles (admin, seller, customer)
- **300 Products** - Across multiple categories
- **20 Categories** - Hierarchical structure
- **20 Coupons** - With various discount rules
- **50 Orders** - Different statuses and payment states
- **100 Addresses** - For users
- **100 Reviews** - Product ratings

## 🐛 Troubleshooting

### Container Won't Start

```bash
# Check logs
docker-compose logs app

# Check if ports are in use
lsof -i :3000
lsof -i :27017
lsof -i :6379

# Clean up and restart
docker-compose down -v  # Remove volumes too
docker-compose build --no-cache
docker-compose up -d
```

### Database Connection Errors

```bash
# Check MongoDB health
docker-compose ps
# Should show "healthy"

# Verify MongoDB is accepting connections
docker exec ecommerce mongosh --username admin --password password --authenticationDatabase admin --eval "db.adminCommand('ping')"

# Check MongoDB logs
docker-compose logs mongodb
```

### Redis Connection Issues

```bash
# Check Redis health
docker-compose ps
# Should show "healthy"

# Test Redis connection
docker exec ecommerce-redis redis-cli ping

# Check Redis logs
docker-compose logs redis
```

### Services Crashing

```bash
# Check application logs
docker-compose logs -f app --tail 100

# Common issue: Package build failures
# Solution: Rebuild without cache
docker-compose build --no-cache
docker-compose up -d

# Check file permissions
docker exec ecommerce-app ls -la /app
```

### Port Already in Use

```bash
# Find process using port
lsof -i :3000  # Replace with your port

# Kill process
kill -9 <PID>

# Or change port in docker-compose.yml
# Example: "3000:3000" -> "3001:3000"
```

## 📦 Working with Volumes

### MongoDB Data Persistence

MongoDB data is stored in `e-commerce_mongodb_data` volume.

```bash
# Backup MongoDB data
docker run --rm -v e-commerce_mongodb_data:/data -v $(pwd):/backup mongo:7.0 \
  mongodump --uri="mongodb://admin:password@localhost:27017/ecommerce?authSource=admin" --out=/backup/mongodb_backup

# Restore MongoDB data
docker run --rm -v e-commerce_mongodb_data:/data -v $(pwd):/backup mongo:7.0 \
  mongorestore --uri="mongodb://admin:password@localhost:27017?authSource=admin" /backup/mongodb_backup
```

### Redis Data Persistence

Redis data is stored in `e-commerce_redis_data` volume (if persistence is enabled).

```bash
# Backup Redis data
docker cp ecommerce-redis:/data/dump.rdb ./redis_backup.rdb

# Restore Redis data
docker cp ./redis_backup.rdb ecommerce-redis:/data/dump.rdb
```

## 🔐 Security Considerations

### Development vs Production

**DO NOT use these credentials in production:**
- MongoDB: `admin:password`
- JWT Secret: `docker-dev-jwt-secret-key-change-in-production`

### For Production

1. Generate strong passwords
2. Use environment-specific `.env` files
3. Enable MongoDB authentication
4. Enable Redis password protection
5. Use HTTPS for all services
6. Implement proper CORS configuration
7. Use secrets management (Docker Secrets, HashiCorp Vault, etc.)

## 📚 Additional Resources

- [Docker Documentation](https://docs.docker.com/)
- [Docker Compose Reference](https://docs.docker.com/compose/compose-file/)
- [MongoDB in Docker](https://hub.docker.com/_/mongo)
- [Redis in Docker](https://hub.docker.com/_/redis)
- [Node.js in Docker](https://hub.docker.com/_/node)

## 🤝 Support

For issues or questions:

1. Check the troubleshooting section above
2. Review Docker Compose logs: `docker-compose logs`
3. Check individual service logs: `docker-compose logs <service>`
4. Refer to service-specific documentation in their respective directories

## 📝 Version Information

- Docker Compose: 3.8+
- Node.js: 20-alpine
- MongoDB: 7.0
- Redis: 7-alpine
- Yarn: 1.22+

---

**Last Updated**: January 10, 2026

For the latest setup instructions, see [README.md](../README.md) and [DEPLOYMENT.md](../DEPLOYMENT.md)
