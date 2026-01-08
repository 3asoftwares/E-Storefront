# Vercel Environment Reset Script
# This script removes all env variables from a Vercel project and uploads from .env.production
# Usage: .\vercel-env-reset.ps1 -ProjectPath "path\to\project" -VercelProjectName "e-auth-service"

param(
    [Parameter(Mandatory=$true)]
    [string]$ProjectPath,
    
    [Parameter(Mandatory=$true)]
    [string]$VercelProjectName
)

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Processing: $VercelProjectName" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan

# Check if .env.production exists
$envProdFile = Join-Path $ProjectPath ".env.production"
if (-not (Test-Path $envProdFile)) {
    Write-Host "ERROR: .env.production not found at $envProdFile" -ForegroundColor Red
    return
}

# Navigate to project
Set-Location $ProjectPath
Write-Host "Working directory: $ProjectPath" -ForegroundColor Gray

# Step 1: Link to Vercel project
Write-Host ""
Write-Host "[Step 1] Linking to Vercel project..." -ForegroundColor Yellow
npx vercel link --project $VercelProjectName -y 2>$null
Write-Host "Linked to $VercelProjectName" -ForegroundColor Green

# Step 2: Get current env variables
Write-Host ""
Write-Host "[Step 2] Fetching current environment variables..." -ForegroundColor Yellow
$envOutput = npx vercel env ls 2>&1 | Out-String

# Extract variable names
$varNames = @()
$lines = $envOutput -split "`n"
foreach ($line in $lines) {
    if ($line -match "^\s*([A-Z_][A-Z0-9_]*)\s+Encrypted") {
        $varNames += $matches[1]
    }
}

Write-Host "Found $($varNames.Count) existing variables" -ForegroundColor Gray

# Step 3: Remove all existing variables
if ($varNames.Count -gt 0) {
    Write-Host ""
    Write-Host "[Step 3] Removing existing variables..." -ForegroundColor Yellow
    foreach ($var in $varNames) {
        Write-Host "  Removing: $var" -ForegroundColor DarkGray
        echo "y" | npx vercel env rm $var production 2>$null | Out-Null
    }
    Write-Host "Removed $($varNames.Count) variables" -ForegroundColor Green
} else {
    Write-Host ""
    Write-Host "[Step 3] No existing variables to remove" -ForegroundColor Green
}

# Step 4: Upload .env.production variables
Write-Host ""
Write-Host "[Step 4] Uploading .env.production variables..." -ForegroundColor Yellow
$envContent = Get-Content $envProdFile
$uploadCount = 0
foreach ($line in $envContent) {
    # Skip empty lines and comments
    if ($line -match "^\s*$" -or $line -match "^\s*#") {
        continue
    }
    # Parse KEY=VALUE (handle values with = in them)
    $eqIndex = $line.IndexOf("=")
    if ($eqIndex -gt 0) {
        $key = $line.Substring(0, $eqIndex).Trim()
        $value = $line.Substring($eqIndex + 1).Trim()
        # Skip if key doesn't look valid
        if ($key -notmatch "^[A-Z_][A-Z0-9_]*$") {
            continue
        }
        # Remove surrounding quotes if present
        if (($value.StartsWith('"') -and $value.EndsWith('"')) -or ($value.StartsWith("'") -and $value.EndsWith("'"))) {
            $value = $value.Substring(1, $value.Length - 2)
        }
        Write-Host "  Adding: $key" -ForegroundColor DarkGray
        # Write value to temp file, then use it for vercel env add
        $tempFile = [System.IO.Path]::GetTempFileName()
        [System.IO.File]::WriteAllText($tempFile, $value)
        Get-Content $tempFile -Raw | npx vercel env add $key production 2>$null | Out-Null
        Remove-Item $tempFile -Force
        $uploadCount++
    }
}
Write-Host "Uploaded $uploadCount variables" -ForegroundColor Green

Write-Host "========================================" -ForegroundColor Green
Write-Host "  Completed: $VercelProjectName" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green