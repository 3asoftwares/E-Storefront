# ===========================================
# E-Commerce Platform - Kubernetes Deployment Script (PowerShell)
# ===========================================
# This script deploys the entire platform to Kubernetes

param(
    [Parameter(Mandatory=$true)]
    [ValidateSet("deploy", "status", "delete")]
    [string]$Action
)

# Colors
function Write-Status { param($Message) Write-Host "[INFO] $Message" -ForegroundColor Blue }
function Write-Success { param($Message) Write-Host "[SUCCESS] $Message" -ForegroundColor Green }
function Write-Warn { param($Message) Write-Host "[WARNING] $Message" -ForegroundColor Yellow }
function Write-Err { param($Message) Write-Host "[ERROR] $Message" -ForegroundColor Red }

# Check prerequisites
function Test-Prerequisites {
    Write-Status "Checking prerequisites..."
    
    if (-not (Get-Command kubectl -ErrorAction SilentlyContinue)) {
        Write-Err "kubectl is not installed. Please install kubectl first."
        exit 1
    }
    
    $clusterInfo = kubectl cluster-info 2>&1
    if ($LASTEXITCODE -ne 0) {
        Write-Err "Cannot connect to Kubernetes cluster. Please check your kubeconfig."
        exit 1
    }
    
    Write-Success "Prerequisites check passed!"
}

# Deploy to Kubernetes
function Start-Deploy {
    Write-Status "Starting deployment..."
    
    # 1. Create namespace
    Write-Status "Creating namespace..."
    kubectl apply -f k8s/namespace.yaml
    
    # 2. Apply secrets
    Write-Warn "Make sure to update k8s/secrets.yaml with real values before production deployment!"
    kubectl apply -f k8s/secrets.yaml
    
    # 3. Apply ConfigMaps
    Write-Status "Applying ConfigMaps..."
    kubectl apply -f k8s/configmap.yaml
    
    # 4. Apply Resource Quotas and Limits
    Write-Status "Applying Resource Quotas..."
    kubectl apply -f k8s/resource-quotas.yaml
    
    # 5. Deploy databases
    Write-Status "Deploying databases..."
    kubectl apply -f k8s/database/
    
    # Wait for databases
    Write-Status "Waiting for MongoDB to be ready..."
    kubectl -n ecommerce wait --for=condition=ready pod -l app=mongodb --timeout=120s 2>$null
    
    Write-Status "Waiting for Redis to be ready..."
    kubectl -n ecommerce wait --for=condition=ready pod -l app=redis --timeout=60s 2>$null
    
    # 6. Deploy backend services
    Write-Status "Deploying backend services..."
    kubectl apply -f k8s/services/
    
    # 7. Deploy frontend apps
    Write-Status "Deploying frontend apps..."
    kubectl apply -f k8s/apps/
    
    # 8. Deploy NGINX
    Write-Status "Deploying NGINX..."
    kubectl apply -f k8s/nginx/
    
    # 9. Apply Network Policies
    Write-Status "Applying Network Policies..."
    kubectl apply -f k8s/network-policies.yaml
    
    # 10. Apply Pod Disruption Budgets
    Write-Status "Applying Pod Disruption Budgets..."
    kubectl apply -f k8s/pod-disruption-budgets.yaml
    
    # 11. Apply Ingress
    Write-Status "Applying Ingress..."
    kubectl apply -f k8s/ingress.yaml
    
    Write-Success "Deployment completed!"
}

# Show status
function Show-Status {
    Write-Status "Deployment Status:"
    Write-Host ""
    
    Write-Host "=== Pods ===" -ForegroundColor Cyan
    kubectl -n ecommerce get pods
    Write-Host ""
    
    Write-Host "=== Services ===" -ForegroundColor Cyan
    kubectl -n ecommerce get services
    Write-Host ""
    
    Write-Host "=== Ingress ===" -ForegroundColor Cyan
    kubectl -n ecommerce get ingress
    Write-Host ""
    
    Write-Host "=== HPA ===" -ForegroundColor Cyan
    kubectl -n ecommerce get hpa
}

# Delete deployment
function Remove-Deploy {
    Write-Warn "This will delete the entire ecommerce namespace!"
    $confirm = Read-Host "Are you sure? (y/N)"
    if ($confirm -eq 'y' -or $confirm -eq 'Y') {
        kubectl delete namespace ecommerce
        Write-Success "Namespace deleted!"
    } else {
        Write-Status "Aborted."
    }
}

# Main
switch ($Action) {
    "deploy" {
        Test-Prerequisites
        Start-Deploy
        Show-Status
    }
    "status" {
        Show-Status
    }
    "delete" {
        Remove-Deploy
    }
}
