# Docker Setup Guide - E-Commerce Platform

## Overview

This guide provides comprehensive instructions for setting up the E-Commerce platform using Docker for both **local development** and **production deployment**.

---

## 📋 Prerequisites

Before you begin, ensure you have the following installed:

- **Docker Desktop** (macOS/Windows) or Docker Engine (Linux)
- **Docker Compose** (included with Docker Desktop)
- **Git** for cloning the repository
- **Node.js** v20+ (for local development without Docker)

### Installation Links
- Docker: https://www.docker.com/products/docker-desktop
- Docker Linux: https://docs.docker.com/engine/install/

---

## 🗄️ Database Configuration

### Local Development

```
MongoDB:  mongodb://localhost:27017/ecommerce
Redis:    redis://localhost:6379
Database: ecommerce
```

### Production

```
MongoDB:  mongodb+srv://admin:admin@cluster0.wei5wdz.mongodb.net/ecommerce?appName=Cluster0
Redis:    redis://default:admin@redis-19256.c98.us-east-1-4.ec2.cloud.redislabs.com:19256
Database: ecommerce
```

---

## 🚀 Quick Start - Local Development

### Step 1: Setup Environment Files

```bash
# Copy the example environment file for local development
cp .env.docker.example .env.docker
```

The `.env.docker` file contains:
- **MongoDB**: `mongodb://localhost:27017/ecommerce`
- **Redis**: `redis://localhost:6379`
- Local service URLs pointing to `localhost`

### Step 2: Build Docker Images

```bash
# Build all Docker images
docker-compose -f docker-compose.yml build

# Or build with no cache for fresh dependencies
docker-compose -f docker-compose.yml build --no-cache
```

### Step 3: Start Services

```bash
# Start all services (MongoDB, Redis, and App)
docker-compose -f docker-compose.yml up -d

# Or view logs in real-time
docker-compose -f docker-compose.yml up
```

### Step 4: Verify Services

```bash
# Check running containers
docker-compose ps

# View service logs
docker-compose logs -f app

# Check MongoDB
docker-compose logs -f mongodb

# Check Redis
docker-compose logs -f redis
```

---

## 📱 Accessing Applications (Local)

Once services are running, access them at:

| Application    | URL                                    | Port |
|----------------|----------------------------------------|------|
| Shell App      | http://localhost:3000                  | 3000 |
| Admin App      | http://localhost:3001                  | 3001 |
| Seller App     | http://localhost:3002                  | 3002 |
| Storefront     | http://localhost:3003                  | 3003 |
| GraphQL Gateway| http://localhost:4000/graphql          | 4000 |
| Storybook      | http://localhost:6006                  | 6006 |

**Microservices (Backend)**

| Service    | URL                   | Port |
|------------|-----------------------|------|
| Auth       | http://localhost:3011 | 3011 |
| Category   | http://localhost:3012 | 3012 |
| Coupon     | http://localhost:3013 | 3013 |
| Product    | http://localhost:3014 | 3014 |
| Order      | http://localhost:3015 | 3015 |

**Databases**

| Database | Connection String         | Port  |
|----------|---------------------------|-------|
| MongoDB  | mongodb://localhost:27017 | 27017 |
| Redis    | redis://localhost:6379    | 6379  |

---

## 🛠️ Common Docker Commands

### View Status

```bash
# List all running containers
docker-compose ps

# Check container health
docker-compose ps --health
```

### View Logs

```bash
# All services logs
docker-compose logs

# Specific service logs
docker-compose logs app
docker-compose logs mongodb
docker-compose logs redis

# Follow logs in real-time
docker-compose logs -f

# Last 100 lines
docker-compose logs --tail=100
```

### Restart Services

```bash
# Restart specific service
docker-compose restart app

# Restart all services
docker-compose restart

# Stop and start specific service
docker-compose stop app
docker-compose start app
```

### Stop Services

```bash
# Stop all services (keep volumes)
docker-compose stop

# Stop and remove containers
docker-compose down

# Stop, remove containers and volumes
docker-compose down -v
```

### Database Access

```bash
# Access MongoDB CLI
docker-compose exec mongodb mongosh -u admin -p password --authenticationDatabase admin

# Access Redis CLI
docker-compose exec redis redis-cli

# List all databases in MongoDB
docker-compose exec mongodb mongosh -u admin -p password --authenticationDatabase admin --eval "db.adminCommand('listDatabases')"
```

---

## 🔧 Development Workflow

### Making Changes to Code

The project uses **volume mounts** for live reload during development:

```bash
# Edit files locally, changes appear in container automatically
# The app watches for changes and restarts services

# View live logs
docker-compose logs -f app
```

### Installing New Dependencies

```bash
# Inside the container
docker-compose exec app yarn add package-name

# Or rebuild the image
docker-compose build --no-cache
docker-compose up -d
```

### Running Commands in Container

```bash
# Execute arbitrary commands
docker-compose exec app yarn build:all
docker-compose exec app yarn test:all
docker-compose exec app yarn lint:admin
```

---

## 📦 Production Deployment

### Step 1: Setup Production Environment

```bash
# Create production environment file
cp .env.production .env.prod
```

Update `.env.prod` with your production credentials:

```dotenv
# Production MongoDB (MongoDB Atlas)
MONGODB_URL=mongodb+srv://admin:admin@cluster0.wei5wdz.mongodb.net/ecommerce?appName=Cluster0

# Production Redis (Redis Labs)
REDIS_URL=redis://default:admin@redis-19256.c98.us-east-1-4.ec2.cloud.redislabs.com:19256

# Update service URLs, JWT secrets, and API endpoints
```

### Step 2: Use Production Docker Compose

```bash
# Use production compose file
docker-compose -f docker-compose.production.yml up -d
```

### Step 3: Verify Production Services

```bash
# Check status
docker-compose -f docker-compose.production.yml ps

# View logs
docker-compose -f docker-compose.production.yml logs -f
```

---

## 🗄️ Database Management

### MongoDB

**Creating Database Backups**
```bash
# Backup MongoDB
docker-compose exec mongodb mongodump --out /backup

# Restore MongoDB
docker-compose exec mongodb mongorestore /backup
```

**Seeding Sample Data**
```bash
# Go to sample-data directory
cd sample-data

# Install dependencies
npm install

# Run seeding script
npm run setup
```

### Redis

**Persist Data**
```bash
# Redis data is automatically persisted to docker volume
# Location: e-commerce_redis_data

# Manual backup
docker-compose exec redis redis-cli BGSAVE
```

---

## 🐛 Troubleshooting

### Services Not Starting

```bash
# Check Docker daemon is running
docker ps

# View detailed error logs
docker-compose logs app
docker-compose logs mongodb
docker-compose logs redis

# Rebuild without cache
docker-compose down -v
docker-compose build --no-cache
docker-compose up -d
```

### Port Already in Use

```bash
# Find process using port
lsof -i :3000

# Stop conflicting service
kill -9 <PID>

# Or change Docker port mappings in docker-compose.yml
```

### Memory Issues

```bash
# Increase Docker desktop memory allocation
# Docker Desktop Settings → Resources → Memory

# Or check container resource usage
docker stats
```

### Database Connection Issues

```bash
# Test MongoDB connection
docker-compose exec mongodb mongosh -u admin -p password --authenticationDatabase admin

# Test Redis connection
docker-compose exec redis redis-cli ping

# Check network connectivity
docker-compose exec app ping mongodb
docker-compose exec app ping redis
```

---

## 📁 Volume Mounts Explained

The project uses the following volume mounts:

```yaml
volumes:
  - .:/app                                    # Mount source code
  - /app/node_modules                         # Prevent overwriting
  - /app/apps/*/node_modules                  # Prevent overwriting
  - /app/services/*/node_modules              # Prevent overwriting
  - /app/packages/*/node_modules              # Prevent overwriting
```

This allows:
- **Live code editing** - Changes are reflected immediately
- **Dependency isolation** - Container node_modules don't conflict with host
- **Performance** - Leverages container's optimized dependencies

---

## 🔒 Security Considerations

### For Local Development
- Default credentials are used (`admin:password`)
- JWT secrets are simple for testing
- Debug mode is enabled

### For Production
**⚠️ IMPORTANT: Change all defaults!**

1. **MongoDB Atlas Credentials**
   ```
   ❌ DON'T: Use default passwords
   ✅ DO: Create strong, unique passwords
   ```

2. **Redis Labs Credentials**
   ```
   Update: redis://default:STRONG_PASSWORD@redis-host
   ```

3. **JWT Secrets**
   ```bash
   # Generate strong JWT secrets
   node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
   ```

4. **Environment Variables**
   - Never commit `.env.production` to git
   - Use `.gitignore` to prevent accidental commits
   - Store secrets in secure vaults (AWS Secrets Manager, etc.)

---

## 📊 Docker Compose Files

### `docker-compose.yml` (Development)
- All services in one compose file
- Volume mounts for live reload
- Healthchecks enabled
- Services on localhost

### `docker-compose.dev.yml` (Separate Dev)
- Separate containers for backend and frontend
- Useful for distributed development

### `docker-compose.production.yml` (Production)
- Optimized for production
- No volume mounts
- External database connections
- Production service URLs

---

## 📚 Additional Resources

- [Docker Compose Documentation](https://docs.docker.com/compose/)
- [MongoDB Atlas Setup](https://www.mongodb.com/cloud/atlas)
- [Redis Labs (Upstash)](https://upstash.com/)
- [Project README](./README.md)
- [Deployment Guide](./DEPLOYMENT.md)

---

## 🆘 Support

For issues or questions:
1. Check the troubleshooting section above
2. Review Docker logs: `docker-compose logs -f`
3. Check MongoDB/Redis connectivity
4. Verify environment variables in `.env.docker`
5. Rebuild containers: `docker-compose build --no-cache`

---

**Last Updated:** January 10, 2026
**Version:** 1.0.0
