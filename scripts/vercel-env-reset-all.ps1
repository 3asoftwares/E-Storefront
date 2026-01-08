# Master script to reset Vercel env for all projects
# Run this from the E-Commerce root directory

$basePath = "c:\Users\JaAb450\Documents\E-Commerce"

$projects = @(
    @{ Path = "$basePath\services\auth-service"; Name = "e-auth-service" },
    @{ Path = "$basePath\services\category-service"; Name = "e-category-service" },
    @{ Path = "$basePath\services\coupon-service"; Name = "e-coupon-service" },
    @{ Path = "$basePath\services\product-service"; Name = "e-product-service" },
    @{ Path = "$basePath\services\order-service"; Name = "e-order-service" },
    @{ Path = "$basePath\services\graphql-gateway"; Name = "e-graphql-gateway" },
    @{ Path = "$basePath\apps\admin-app"; Name = "e-admin-app" },
    @{ Path = "$basePath\apps\seller-app"; Name = "e-seller-app" },
    @{ Path = "$basePath\apps\shell-app"; Name = "e-shell-app" },
    @{ Path = "$basePath\apps\storefront-app"; Name = "e-storefront-app" }
)

foreach ($project in $projects) {
    & "$basePath\scripts\vercel-env-reset.ps1" -ProjectPath $project.Path -ProjectName $project.Name
}

Write-Host "=== ALL PROJECTS COMPLETED ===" -ForegroundColor Green
