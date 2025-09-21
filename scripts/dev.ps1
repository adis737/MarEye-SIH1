# PowerShell script to run Next.js dev server
Write-Host "🚀 Starting Next.js development server..." -ForegroundColor Green

# Change to the project directory
Set-Location $PSScriptRoot\..

# Run the Next.js dev command
& npx next dev
