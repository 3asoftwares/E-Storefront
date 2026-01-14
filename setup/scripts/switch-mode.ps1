# Environment Mode Switcher (PowerShell Version)
# Switch between local and production environment configurations

param(
    [Parameter(Position=0)]
    [ValidateSet("local", "production", "status", "help")]
    [string]$Command = "help"
)

# Helper functions
function Write-Header {
    param([string]$text)
    Write-Host "================================================" -ForegroundColor Blue
    Write-Host $text -ForegroundColor Blue
    Write-Host "================================================" -ForegroundColor Blue
}

function Write-Success {
    param([string]$text)
    Write-Host "[OK] $text" -ForegroundColor Green
}

function Write-Info {
    param([string]$text)
    Write-Host "[INFO] $text" -ForegroundColor Cyan
}

function Write-Warn {
    param([string]$text)
    Write-Host "[WARN] $text" -ForegroundColor Yellow
}

# Get current mode
function Get-CurrentMode {
    if (Test-Path ".env") {
        return "configured"
    }
    return "unknown"
}

# Switch to local development mode
function Switch-ToLocal {
    Write-Header -text "Switching to LOCAL mode"
    
    # Copy root .env.local to .env
    if (Test-Path ".env.local") {
        Copy-Item ".env.local" ".env" -Force
        Write-Success -text "Created root .env from .env.local"
    } else {
        Write-Warn -text "Missing root .env.local"
    }
    
    # Copy .env.local to .env for each app
    $apps = @("admin-app", "seller-app", "shell-app")
    foreach ($app in $apps) {
        $envLocal = "apps/$app/.env.local"
        $envTarget = "apps/$app/.env"
        if (Test-Path $envLocal) {
            Copy-Item $envLocal $envTarget -Force
            Write-Success -text "Created $envTarget"
        } else {
            Write-Warn -text "Missing $envLocal"
        }
    }
    
    # Copy .env.local to .env for each service
    $services = @("auth-service", "category-service", "coupon-service", "product-service", "order-service", "ticket-service", "graphql-gateway")
    foreach ($service in $services) {
        $envLocal = "services/$service/.env.local"
        $envTarget = "services/$service/.env"
        if (Test-Path $envLocal) {
            Copy-Item $envLocal $envTarget -Force
            Write-Success -text "Created $envTarget"
        } else {
            Write-Warn -text "Missing $envLocal"
        }
    }
    
    Write-Success -text "Switched to LOCAL mode"
}

# Switch to production mode
function Switch-ToProduction {
    Write-Header -text "Switching to PRODUCTION mode"
    
    # Copy root .env.production to .env
    if (Test-Path ".env.production") {
        Copy-Item ".env.production" ".env" -Force
        Write-Success -text "Created root .env from .env.production"
    } else {
        Write-Warn -text "Missing root .env.production"
    }
    
    # Copy .env.production to .env for each app
    $apps = @("admin-app", "seller-app", "shell-app")
    foreach ($app in $apps) {
        $envProd = "apps/$app/.env.production"
        $envTarget = "apps/$app/.env"
        if (Test-Path $envProd) {
            Copy-Item $envProd $envTarget -Force
            Write-Success -text "Created $envTarget"
        } else {
            Write-Warn -text "Missing $envProd"
        }
    }
    
    # Copy .env.production to .env for each service
    $services = @("auth-service", "category-service", "coupon-service", "product-service", "order-service", "graphql-gateway")
    foreach ($service in $services) {
        $envProd = "services/$service/.env.production"
        $envTarget = "services/$service/.env"
        if (Test-Path $envProd) {
            Copy-Item $envProd $envTarget -Force
            Write-Success -text "Created $envTarget"
        } else {
            Write-Warn -text "Missing $envProd"
        }
    }
    
    Write-Success -text "Switched to PRODUCTION mode"
}

# Show current mode
function Show-Status {
    Write-Header -text "Environment Status"
    
    if (Test-Path ".env") {
        Write-Host "Root .env: EXISTS" -ForegroundColor Green
    } else {
        Write-Host "Root .env: MISSING" -ForegroundColor Red
    }
    
    $apps = @("admin-app", "seller-app", "shell-app")
    foreach ($app in $apps) {
        if (Test-Path "apps/$app/.env") {
            Write-Host "apps/$app/.env: EXISTS" -ForegroundColor Green
        } else {
            Write-Host "apps/$app/.env: MISSING" -ForegroundColor Yellow
        }
    }
    
    $services = @("auth-service", "category-service", "coupon-service", "product-service", "order-service", "graphql-gateway")
    foreach ($service in $services) {
        if (Test-Path "services/$service/.env") {
            Write-Host "services/$service/.env: EXISTS" -ForegroundColor Green
        } else {
            Write-Host "services/$service/.env: MISSING" -ForegroundColor Yellow
        }
    }
}

# Show help
function Show-Help {
    Write-Host "Environment Mode Switcher"
    Write-Host ""
    Write-Host "Commands:"
    Write-Host "  help               Show this help message"
    Write-Host "  status             Show .env file status"
    Write-Host "  local              Copy .env.local files to .env"
    Write-Host "  production         Copy .env.production files to .env"
    Write-Host ""
    Write-Host "Examples:"
    Write-Host "  .\switch-mode.ps1 local"
    Write-Host "  .\switch-mode.ps1 status"
}

# Main switch
switch ($Command) {
    "help" { Show-Help }
    "local" { Switch-ToLocal }
    "status" { Show-Status }
    "production" { Switch-ToProduction }
    default { Show-Help }
}
