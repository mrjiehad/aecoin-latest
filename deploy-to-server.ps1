# AECOIN Store - Windows Deployment Script
# This script helps deploy your application to a production server

param(
    [Parameter(Mandatory=$true)]
    [string]$ServerIP,
    
    [Parameter(Mandatory=$true)]
    [string]$ServerUser = "root",
    
    [Parameter(Mandatory=$false)]
    [string]$DeployPath = "/var/www/aecoin-store"
)

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "AECOIN Store - Production Deployment" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Check if build exists
if (-not (Test-Path "dist")) {
    Write-Host "❌ Build not found. Running build..." -ForegroundColor Red
    npm run build
    if ($LASTEXITCODE -ne 0) {
        Write-Host "❌ Build failed. Please fix errors and try again." -ForegroundColor Red
        exit 1
    }
}

Write-Host "✓ Build found" -ForegroundColor Green

# Files to deploy
$filesToDeploy = @(
    "dist",
    "attached_assets",
    "package.json",
    "package-lock.json",
    ".env.production",
    "deploy.sh"
)

Write-Host ""
Write-Host "📦 Files to deploy:" -ForegroundColor Yellow
foreach ($file in $filesToDeploy) {
    if (Test-Path $file) {
        Write-Host "  ✓ $file" -ForegroundColor Green
    } else {
        Write-Host "  ⚠ $file (not found)" -ForegroundColor Yellow
    }
}

Write-Host ""
Write-Host "🚀 Deployment Target:" -ForegroundColor Cyan
Write-Host "  Server: $ServerUser@$ServerIP" -ForegroundColor White
Write-Host "  Path: $DeployPath" -ForegroundColor White
Write-Host ""

$confirm = Read-Host "Continue with deployment? (yes/no)"
if ($confirm -ne "yes") {
    Write-Host "Deployment cancelled." -ForegroundColor Yellow
    exit 0
}

Write-Host ""
Write-Host "📤 Uploading files to server..." -ForegroundColor Cyan

# Create deployment directory on server
Write-Host "Creating directory on server..." -ForegroundColor Yellow
ssh "$ServerUser@$ServerIP" "mkdir -p $DeployPath"

# Upload files using SCP
Write-Host "Uploading application files..." -ForegroundColor Yellow

foreach ($file in $filesToDeploy) {
    if (Test-Path $file) {
        Write-Host "  Uploading $file..." -ForegroundColor Gray
        scp -r $file "$ServerUser@$ServerIP`:$DeployPath/"
        if ($LASTEXITCODE -eq 0) {
            Write-Host "  ✓ $file uploaded" -ForegroundColor Green
        } else {
            Write-Host "  ❌ Failed to upload $file" -ForegroundColor Red
        }
    }
}

Write-Host ""
Write-Host "🔧 Setting up application on server..." -ForegroundColor Cyan

# Run setup commands on server
$setupCommands = @"
cd $DeployPath
echo '✓ Changed to deployment directory'

# Copy production env to .env
cp .env.production .env
echo '✓ Environment configured'

# Install dependencies
npm ci --production
echo '✓ Dependencies installed'

# Make deploy script executable
chmod +x deploy.sh
echo '✓ Deploy script ready'

echo ''
echo '========================================='
echo 'Files uploaded successfully!'
echo '========================================='
echo ''
echo 'Next steps:'
echo '1. Run automated deployment: sudo ./deploy.sh'
echo '   OR'
echo '2. Start manually with PM2:'
echo '   pm2 start dist/index.js --name aecoin-store'
echo '   pm2 save'
echo ''
"@

Write-Host "Running setup commands..." -ForegroundColor Yellow
ssh "$ServerUser@$ServerIP" $setupCommands

Write-Host ""
Write-Host "========================================" -ForegroundColor Green
Write-Host "✅ Deployment Complete!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""
Write-Host "📋 Next Steps:" -ForegroundColor Cyan
Write-Host ""
Write-Host "1. SSH into your server:" -ForegroundColor White
Write-Host "   ssh $ServerUser@$ServerIP" -ForegroundColor Gray
Write-Host ""
Write-Host "2. Navigate to deployment directory:" -ForegroundColor White
Write-Host "   cd $DeployPath" -ForegroundColor Gray
Write-Host ""
Write-Host "3. Run automated deployment:" -ForegroundColor White
Write-Host "   sudo ./deploy.sh" -ForegroundColor Gray
Write-Host ""
Write-Host "   OR start manually:" -ForegroundColor White
Write-Host "   pm2 start dist/index.js --name aecoin-store" -ForegroundColor Gray
Write-Host "   pm2 save" -ForegroundColor Gray
Write-Host ""
Write-Host "4. Configure Nginx and SSL (see PRODUCTION_DEPLOY.md)" -ForegroundColor White
Write-Host ""
Write-Host "📖 Full documentation: PRODUCTION_DEPLOY.md" -ForegroundColor Yellow
Write-Host ""
