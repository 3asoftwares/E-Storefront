# Vercel Environment Reset Script
# This script removes all env variables and uploads from .env.production

param(
    [string]$ProjectPath,
    [string]$ProjectName
)

Write-Host "=== Processing $ProjectName ===" -ForegroundColor Cyan

# Navigate to project
Set-Location $ProjectPath

# Link project if not already linked
if (-not (Test-Path ".vercel")) {
    Write-Host "Linking to Vercel project..." -ForegroundColor Yellow
    npx vercel link --yes
}

# Get current env variables
Write-Host "Fetching current environment variables..." -ForegroundColor Yellow
$envOutput = npx vercel env ls 2>&1 | Out-String

# Extract variable names (skip header lines)
$lines = $envOutput -split "`n" | Where-Object { $_ -match "^\s+\w+" -and $_ -notmatch "name\s+value" }
$varNames = @()
foreach ($line in $lines) {
    if ($line -match "^\s*(\w+)\s+Encrypted") {
        $varNames += $matches[1]
    }
}

Write-Host "Found $($varNames.Count) variables to remove" -ForegroundColor Yellow

# Remove each variable
foreach ($var in $varNames) {
    Write-Host "  Removing $var..." -ForegroundColor Gray
    npx vercel env rm $var production --yes 2>$null | Out-Null
}

Write-Host "All variables removed!" -ForegroundColor Green

# Upload from .env.production if exists
$envProdFile = Join-Path $ProjectPath ".env.production"
if (Test-Path $envProdFile) {
    Write-Host "Uploading variables from .env.production..." -ForegroundColor Yellow
    
    $content = Get-Content $envProdFile
    foreach ($line in $content) {
        # Skip comments and empty lines
        if ($line -match "^\s*#" -or $line -match "^\s*$") {
            continue
        }
        
        # Parse KEY=VALUE
        if ($line -match "^([^=]+)=(.*)$") {
            $key = $matches[1].Trim()
            $value = $matches[2].Trim()
            
            Write-Host "  Adding $key..." -ForegroundColor Gray
            # Use echo to pipe the value
            echo $value | npx vercel env add $key production 2>$null | Out-Null
        }
    }
    Write-Host "Variables uploaded!" -ForegroundColor Green
} else {
    Write-Host "No .env.production file found, skipping upload" -ForegroundColor Yellow
}

Write-Host "=== Completed $ProjectName ===" -ForegroundColor Cyan
Write-Host ""
