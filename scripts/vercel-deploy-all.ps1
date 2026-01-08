# Vercel Deploy All Projects Script
# This script deploys all projects to Vercel
# Run: .\scripts\vercel-deploy-all.ps1

param(
    [switch]$Production
)

$basePath = "c:\Users\JaAb450\Documents\E-Commerce"

# ============================================================================
# PROJECT LIST - Update this list as needed
# ============================================================================
$projects = @(
    @{ LocalPath = "services\auth-service"; VercelName = "e-auth-service" },
    @{ LocalPath = "services\category-service"; VercelName = "e-category-service" },
    @{ LocalPath = "services\coupon-service"; VercelName = "e-coupon-service" },
    @{ LocalPath = "services\product-service"; VercelName = "e-product-service" },
    @{ LocalPath = "services\order-service"; VercelName = "e-order-service" },
    @{ LocalPath = "services\graphql-gateway"; VercelName = "e-graphql-gateway" },
    @{ LocalPath = "apps\admin-app"; VercelName = "e-admin-app" },
    @{ LocalPath = "apps\seller-app"; VercelName = "e-seller-app" },
    @{ LocalPath = "apps\shell-app"; VercelName = "e-shell-app" },
    @{ LocalPath = "apps\storefront-app"; VercelName = "e-storefront-app" }
)

$deployType = if ($Production) { "PRODUCTION" } else { "PREVIEW" }

Write-Host ""
Write-Host "============================================" -ForegroundColor Cyan
Write-Host "  VERCEL DEPLOY ALL - $deployType" -ForegroundColor Cyan
Write-Host "============================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "This will deploy $($projects.Count) projects:" -ForegroundColor Yellow
foreach ($p in $projects) {
    Write-Host "  - $($p.VercelName)" -ForegroundColor Gray
}
Write-Host ""

$confirm = Read-Host "Continue? (y/n)"
if ($confirm -ne "y") {
    Write-Host "Aborted." -ForegroundColor Red
    exit
}

$successCount = 0
$failCount = 0
$startTime = Get-Date

foreach ($project in $projects) {
    $fullPath = Join-Path $basePath $project.LocalPath
    
    Write-Host ""
    Write-Host "----------------------------------------" -ForegroundColor Cyan
    Write-Host "Deploying: $($project.VercelName)" -ForegroundColor Cyan
    Write-Host "----------------------------------------" -ForegroundColor Cyan
    
    Set-Location $fullPath
    
    try {
        # Link to project
        npx vercel link --project $project.VercelName -y 2>$null | Out-Null
        
        # Deploy
        if ($Production) {
            npx vercel --prod -y
        } else {
            npx vercel -y
        }
        
        if ($LASTEXITCODE -eq 0) {
            Write-Host "[OK] Deployed: $($project.VercelName)" -ForegroundColor Green
            $successCount++
        } else {
            Write-Host "[FAIL] $($project.VercelName)" -ForegroundColor Red
            $failCount++
        }
    } catch {
        Write-Host "[FAIL] $($project.VercelName): $_" -ForegroundColor Red
        $failCount++
    }
}

$endTime = Get-Date
$duration = $endTime - $startTime

Set-Location $basePath

Write-Host ""
Write-Host "============================================" -ForegroundColor Magenta
Write-Host "  DEPLOYMENT COMPLETED" -ForegroundColor Magenta
Write-Host "============================================" -ForegroundColor Magenta
Write-Host "  Success: $successCount" -ForegroundColor Green
if ($failCount -gt 0) {
    Write-Host "  Failed:  $failCount" -ForegroundColor Red
} else {
    Write-Host "  Failed:  $failCount" -ForegroundColor Green
}
Write-Host "  Duration: $($duration.Minutes)m $($duration.Seconds)s" -ForegroundColor Gray
Write-Host ""
