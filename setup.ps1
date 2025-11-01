# Awaz-e-Kisan Quick Setup Script
# Run this in PowerShell

Write-Host "🌾 Awaz-e-Kisan Setup Starting..." -ForegroundColor Green
Write-Host ""

# Check Node.js version
Write-Host "Checking Node.js version..." -ForegroundColor Yellow
$nodeVersion = node --version
if ($nodeVersion -match "v(\d+)") {
    $majorVersion = [int]$matches[1]
    if ($majorVersion -lt 18) {
        Write-Host "❌ Node.js version $nodeVersion is too old. Please install Node.js 18 or higher." -ForegroundColor Red
        exit 1
    }
    Write-Host "✅ Node.js $nodeVersion detected" -ForegroundColor Green
}

# Check if Firebase CLI is installed
Write-Host ""
Write-Host "Checking Firebase CLI..." -ForegroundColor Yellow
try {
    $firebaseVersion = firebase --version
    Write-Host "✅ Firebase CLI installed: $firebaseVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ Firebase CLI not found. Installing..." -ForegroundColor Yellow
    npm install -g firebase-tools
    Write-Host "✅ Firebase CLI installed" -ForegroundColor Green
}

# Install frontend dependencies
Write-Host ""
Write-Host "Installing frontend dependencies..." -ForegroundColor Yellow
npm install
if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Frontend dependencies installed" -ForegroundColor Green
} else {
    Write-Host "❌ Failed to install frontend dependencies" -ForegroundColor Red
    exit 1
}

# Install functions dependencies
Write-Host ""
Write-Host "Installing Cloud Functions dependencies..." -ForegroundColor Yellow
Set-Location functions
npm install
if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Functions dependencies installed" -ForegroundColor Green
} else {
    Write-Host "❌ Failed to install functions dependencies" -ForegroundColor Red
    exit 1
}
Set-Location ..

# Create .env.local if it doesn't exist
Write-Host ""
if (!(Test-Path .env.local)) {
    Write-Host "Creating .env.local file..." -ForegroundColor Yellow
    Copy-Item .env.local.example .env.local
    Write-Host "✅ .env.local created. Please edit with your Firebase config." -ForegroundColor Green
} else {
    Write-Host "✅ .env.local already exists" -ForegroundColor Green
}

# Summary
Write-Host ""
Write-Host "================================" -ForegroundColor Cyan
Write-Host "🎉 Setup Complete!" -ForegroundColor Green
Write-Host "================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Yellow
Write-Host "1. Edit .env.local with your Firebase configuration"
Write-Host "2. Login to Firebase: firebase login"
Write-Host "3. Select project: firebase use --add"
Write-Host "4. Set function configs: firebase functions:config:set openai.key='sk-...'"
Write-Host "5. Start dev server: npm run dev"
Write-Host ""
Write-Host "For deployment: npm run build && firebase deploy" -ForegroundColor Cyan
Write-Host ""
Write-Host "📖 See DEPLOYMENT.md for detailed instructions" -ForegroundColor Yellow
Write-Host "💡 See INNOVATIONS.md for feature ideas" -ForegroundColor Yellow
Write-Host ""
Write-Host "آوازِ کسان - Voice of the Farmer 🌾" -ForegroundColor Green
