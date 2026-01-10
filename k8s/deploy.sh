#!/bin/bash
# ===========================================
# E-Commerce Platform - Kubernetes Deployment Script
# ===========================================
# This script deploys the entire platform to Kubernetes

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Print colored message
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check prerequisites
check_prerequisites() {
    print_status "Checking prerequisites..."
    
    if ! command -v kubectl &> /dev/null; then
        print_error "kubectl is not installed. Please install kubectl first."
        exit 1
    fi
    
    if ! kubectl cluster-info &> /dev/null; then
        print_error "Cannot connect to Kubernetes cluster. Please check your kubeconfig."
        exit 1
    fi
    
    print_success "Prerequisites check passed!"
}

# Deploy to Kubernetes
deploy() {
    print_status "Starting deployment..."
    
    # 1. Create namespace
    print_status "Creating namespace..."
    kubectl apply -f k8s/namespace.yaml
    
    # 2. Apply secrets (make sure to update with real values first!)
    print_warning "Make sure to update k8s/secrets.yaml with real values before production deployment!"
    kubectl apply -f k8s/secrets.yaml
    
    # 3. Apply ConfigMaps
    print_status "Applying ConfigMaps..."
    kubectl apply -f k8s/configmap.yaml
    
    # 4. Apply Resource Quotas and Limits
    print_status "Applying Resource Quotas..."
    kubectl apply -f k8s/resource-quotas.yaml
    
    # 5. Deploy databases
    print_status "Deploying databases..."
    kubectl apply -f k8s/database/
    
    # Wait for databases to be ready
    print_status "Waiting for MongoDB to be ready..."
    kubectl -n ecommerce wait --for=condition=ready pod -l app=mongodb --timeout=120s || true
    
    print_status "Waiting for Redis to be ready..."
    kubectl -n ecommerce wait --for=condition=ready pod -l app=redis --timeout=60s || true
    
    # 6. Deploy backend services
    print_status "Deploying backend services..."
    kubectl apply -f k8s/services/
    
    # 7. Deploy frontend apps
    print_status "Deploying frontend apps..."
    kubectl apply -f k8s/apps/
    
    # 8. Deploy NGINX
    print_status "Deploying NGINX..."
    kubectl apply -f k8s/nginx/
    
    # 9. Apply Network Policies
    print_status "Applying Network Policies..."
    kubectl apply -f k8s/network-policies.yaml
    
    # 10. Apply Pod Disruption Budgets
    print_status "Applying Pod Disruption Budgets..."
    kubectl apply -f k8s/pod-disruption-budgets.yaml
    
    # 11. Apply Ingress
    print_status "Applying Ingress..."
    kubectl apply -f k8s/ingress.yaml
    
    print_success "Deployment completed!"
}

# Show status
show_status() {
    print_status "Deployment Status:"
    echo ""
    
    echo "=== Pods ==="
    kubectl -n ecommerce get pods
    echo ""
    
    echo "=== Services ==="
    kubectl -n ecommerce get services
    echo ""
    
    echo "=== Ingress ==="
    kubectl -n ecommerce get ingress
    echo ""
    
    echo "=== HPA ==="
    kubectl -n ecommerce get hpa
}

# Delete deployment
delete() {
    print_warning "This will delete the entire ecommerce namespace!"
    read -p "Are you sure? (y/N) " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        kubectl delete namespace ecommerce
        print_success "Namespace deleted!"
    else
        print_status "Aborted."
    fi
}

# Main
case "$1" in
    deploy)
        check_prerequisites
        deploy
        show_status
        ;;
    status)
        show_status
        ;;
    delete)
        delete
        ;;
    *)
        echo "Usage: $0 {deploy|status|delete}"
        echo ""
        echo "Commands:"
        echo "  deploy  - Deploy the entire platform to Kubernetes"
        echo "  status  - Show deployment status"
        echo "  delete  - Delete the entire deployment"
        exit 1
        ;;
esac
