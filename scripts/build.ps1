# PowerShell script to run Next.js build
Write-Host "🚀 Starting Next.js build..." -ForegroundColor Green

# Change to the project directory
Set-Location $PSScriptRoot\..

# Run the Next.js build command
& npx next build
