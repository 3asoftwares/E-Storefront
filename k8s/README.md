# Kubernetes Deployment Guide

This guide explains how to deploy the E-Commerce platform to Kubernetes.

## 📋 Prerequisites

1. **kubectl** - Kubernetes CLI
2. **Kubernetes Cluster** - Any of:
   - Local: Minikube, Docker Desktop, Kind
   - Cloud: AWS EKS, Google GKE, Azure AKS, DigitalOcean DOKS
3. **Helm** (optional) - For installing ingress controller and cert-manager
4. **Container Registry** - GitHub Container Registry (ghcr.io) or others

## 📁 Directory Structure

```
k8s/
├── namespace.yaml           # Namespace definition
├── secrets.yaml             # Secrets (update before deployment!)
├── configmap.yaml           # ConfigMaps including NGINX config
├── ingress.yaml             # Ingress rules and TLS
├── network-policies.yaml    # Network security policies
├── pod-disruption-budgets.yaml
├── resource-quotas.yaml     # Resource limits
├── deploy.sh                # Linux/Mac deployment script
├── deploy.ps1               # Windows deployment script
├── apps/
│   └── storefront.yaml      # Storefront (Next.js) deployment
├── database/
│   ├── mongodb.yaml         # MongoDB StatefulSet
│   └── redis.yaml           # Redis deployment
├── nginx/
│   └── nginx-deployment.yaml
└── services/
    ├── auth-service.yaml
    ├── product-service.yaml
    ├── order-service.yaml
    ├── category-service.yaml
    ├── coupon-service.yaml
    └── graphql-gateway.yaml
```

## 🚀 Quick Start

### 1. Update Secrets

**IMPORTANT:** Edit `k8s/secrets.yaml` with your real credentials before deploying:

```yaml
stringData:
  mongodb-uri: 'mongodb://admin:YOUR_REAL_PASSWORD@mongodb:27017/ecommerce'
  redis-password: 'YOUR_REAL_REDIS_PASSWORD'
  jwt-secret: 'YOUR_256_BIT_SECRET'
```

### 2. Update Domain Names

Edit `k8s/ingress.yaml` and replace:
- `yourdomain.com` → Your actual domain
- `admin@yourdomain.com` → Your email for Let's Encrypt

### 3. Deploy

**Windows:**
```powershell
.\k8s\deploy.ps1 -Action deploy
```

**Linux/Mac:**
```bash
chmod +x k8s/deploy.sh
./k8s/deploy.sh deploy
```

**Manual:**
```bash
# Apply in order
kubectl apply -f k8s/namespace.yaml
kubectl apply -f k8s/secrets.yaml
kubectl apply -f k8s/configmap.yaml
kubectl apply -f k8s/resource-quotas.yaml
kubectl apply -f k8s/database/
kubectl apply -f k8s/services/
kubectl apply -f k8s/apps/
kubectl apply -f k8s/nginx/
kubectl apply -f k8s/network-policies.yaml
kubectl apply -f k8s/pod-disruption-budgets.yaml
kubectl apply -f k8s/ingress.yaml
```

## 🔧 Install Prerequisites

### NGINX Ingress Controller

```bash
kubectl apply -f https://raw.githubusercontent.com/kubernetes/ingress-nginx/main/deploy/static/provider/cloud/deploy.yaml
```

### cert-manager (for TLS)

```bash
kubectl apply -f https://github.com/cert-manager/cert-manager/releases/download/v1.13.0/cert-manager.yaml
```

## 📊 Monitoring

### Check Status

```bash
# All pods
kubectl -n ecommerce get pods

# All services
kubectl -n ecommerce get services

# Ingress
kubectl -n ecommerce get ingress

# HPA status
kubectl -n ecommerce get hpa

# Pod logs
kubectl -n ecommerce logs -f deployment/graphql-gateway
```

### Port Forwarding (for local testing)

```bash
# GraphQL Gateway
kubectl -n ecommerce port-forward svc/graphql-gateway 4000:4000

# Storefront
kubectl -n ecommerce port-forward svc/storefront 3003:3003

# MongoDB
kubectl -n ecommerce port-forward svc/mongodb 27017:27017
```

## 🔒 Security Features

| Feature | Description |
|---------|-------------|
| **Network Policies** | Restrict pod-to-pod communication |
| **Resource Quotas** | Limit namespace resources |
| **Pod Security** | Non-root containers, read-only filesystem |
| **Secrets** | Sensitive data in Kubernetes secrets |
| **TLS** | Automatic certificates via cert-manager |

## 📈 Scaling

### Manual Scaling

```bash
kubectl -n ecommerce scale deployment/product-service --replicas=5
```

### Automatic Scaling (HPA)

HPAs are configured for:
- `graphql-gateway`: 2-10 replicas
- `auth-service`: 2-5 replicas
- `product-service`: 2-8 replicas
- `order-service`: 2-6 replicas
- `storefront`: 2-6 replicas

## 🗑️ Cleanup

```bash
# Delete everything
kubectl delete namespace ecommerce

# Or using script
./k8s/deploy.sh delete      # Linux/Mac
.\k8s\deploy.ps1 -Action delete  # Windows
```

## 🌐 Cloud-Specific Notes

### AWS EKS

- Use `aws-load-balancer-controller` for ALB/NLB
- Use `gp3` StorageClass for MongoDB

### Google GKE

- Enable Workload Identity
- Use Cloud SQL for production databases

### Azure AKS

- Use Azure CNI for networking
- Use Azure Managed Disks for storage

## ⚠️ Production Checklist

- [ ] Updated all secrets with real values
- [ ] Configured proper domain names
- [ ] Set up container registry credentials
- [ ] Enabled cluster autoscaling
- [ ] Configured monitoring (Prometheus/Grafana)
- [ ] Set up log aggregation (ELK/Loki)
- [ ] Configured backup for databases
- [ ] Tested disaster recovery procedures
- [ ] Set up alerting
