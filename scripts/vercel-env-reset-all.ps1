# Master script to reset Vercel env for all projects
# This removes existing env vars and uploads from .env.production
# Run: .\scripts\vercel-env-reset-all.ps1

$basePath = "c:\Users\JaAb450\Documents\E-Commerce"
$scriptPath = "$basePath\scripts\vercel-env-reset.ps1"

# ============================================================================
# PROJECT LIST - Update this list as needed
# Format: @{ LocalPath = "relative\path"; VercelName = "vercel-project-name" }
# ============================================================================
$projects = @(
    @{ LocalPath = "services\product-service"; VercelName = "e-product-service" },
    @{ LocalPath = "services\order-service"; VercelName = "e-order-service" },
    @{ LocalPath = "services\graphql-gateway"; VercelName = "e-graphql-gateway" },
    @{ LocalPath = "apps\admin-app"; VercelName = "e-admin-app" },
    @{ LocalPath = "apps\seller-app"; VercelName = "e-seller-app" },
    @{ LocalPath = "apps\shell-app"; VercelName = "e-shell-app" },
    @{ LocalPath = "apps\storefront-app"; VercelName = "e-storefront-app" }
)

Write-Host ""
Write-Host "============================================" -ForegroundColor Magenta
Write-Host "  VERCEL ENVIRONMENT RESET - ALL PROJECTS" -ForegroundColor Magenta
Write-Host "============================================" -ForegroundColor Magenta
Write-Host ""
Write-Host "This will process $($projects.Count) projects:" -ForegroundColor Yellow
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

foreach ($project in $projects) {
    $fullPath = Join-Path $basePath $project.LocalPath
    
    try {
        powershell -ExecutionPolicy Bypass -File $scriptPath -ProjectPath $fullPath -VercelProjectName $project.VercelName
        $successCount++
    } catch {
        Write-Host "ERROR processing $($project.VercelName): $_" -ForegroundColor Red
        $failCount++
    }
}

Write-Host ""
Write-Host "============================================" -ForegroundColor Magenta
Write-Host "  COMPLETED" -ForegroundColor Magenta
Write-Host "============================================" -ForegroundColor Magenta
Write-Host "  Success: $successCount" -ForegroundColor Green
if ($failCount -gt 0) {
    Write-Host "  Failed:  $failCount" -ForegroundColor Red
} else {
    Write-Host "  Failed:  $failCount" -ForegroundColor Green
}
Write-Host ""
