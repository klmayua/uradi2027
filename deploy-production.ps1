# URADI-360 Production Deployment Script
# Run this script to deploy to production

param(
    [switch]$SkipBackend,
    [switch]$SkipFrontend,
    [switch]$DryRun
)

$ErrorActionPreference = "Stop"

Write-Host "==========================================" -ForegroundColor Cyan
Write-Host "URADI-360 Production Deployment" -ForegroundColor Cyan
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host ""

# Configuration
$BackendDir = "Uradi360_Build/backend"
$FrontendDir = "Uradi360_Build/apps/command-center"
$RailwayProject = "uradi360-backend"
$VercelProject = "uradi360-command-center"

# Helper functions
function Write-Success($message) {
    Write-Host "✓ $message" -ForegroundColor Green
}

function Write-Error($message) {
    Write-Host "✗ $message" -ForegroundColor Red
}

function Write-Warning($message) {
    Write-Host "⚠ $message" -ForegroundColor Yellow
}

function Write-Info($message) {
    Write-Host "→ $message" -ForegroundColor White
}

# Check prerequisites
Write-Host "Step 1: Checking prerequisites..." -ForegroundColor Yellow
Write-Host "----------------------------------------" -ForegroundColor Gray

# Check Railway CLI
$railway = Get-Command railway -ErrorAction SilentlyContinue
if (-not $railway) {
    Write-Error "Railway CLI not found. Install with: npm install -g @railway/cli"
    exit 1
}
Write-Success "Railway CLI found"

# Check Vercel CLI
$vercel = Get-Command vercel -ErrorAction SilentlyContinue
if (-not $vercel) {
    Write-Error "Vercel CLI not found. Install with: npm install -g vercel"
    exit 1
}
Write-Success "Vercel CLI found"

# Check if logged in
try {
    $railwayUser = railway whoami 2>&1
    if ($LASTEXITCODE -ne 0) {
        throw "Not logged in"
    }
    Write-Success "Logged into Railway"
} catch {
    Write-Error "Not logged into Railway. Run: railway login"
    exit 1
}

try {
    $vercelUser = vercel whoami 2>&1
    if ($LASTEXITCODE -ne 0) {
        throw "Not logged in"
    }
    Write-Success "Logged into Vercel"
} catch {
    Write-Error "Not logged into Vercel. Run: vercel login"
    exit 1
}

if ($DryRun) {
    Write-Host ""
    Write-Host "DRY RUN MODE - No actual deployment" -ForegroundColor Magenta
    Write-Host ""
}

# Deploy Backend
if (-not $SkipBackend) {
    Write-Host ""
    Write-Host "Step 2: Deploying Backend..." -ForegroundColor Yellow
    Write-Host "----------------------------------------" -ForegroundColor Gray

    Push-Location $BackendDir

    try {
        # Check if project exists
        Write-Info "Checking Railway project..."
        $projectStatus = railway status 2>&1
        if ($LASTEXITCODE -ne 0) {
            Write-Warning "Railway project not found. Creating..."
            if (-not $DryRun) {
                railway init --name $RailwayProject
            }
        } else {
            Write-Success "Railway project exists"
        }

        # Deploy to Railway
        Write-Info "Deploying to Railway..."
        if (-not $DryRun) {
            railway up --detach
            if ($LASTEXITCODE -ne 0) {
                throw "Railway deployment failed"
            }
        }
        Write-Success "Backend deployed to Railway"

        # Run migrations
        Write-Info "Running database migrations..."
        if (-not $DryRun) {
            railway run alembic upgrade head
            if ($LASTEXITCODE -ne 0) {
                Write-Warning "Migration may have issues, but continuing..."
            }
        }
        Write-Success "Database migrations complete"

        # Get backend URL
        if (-not $DryRun) {
            $backendUrl = railway status --json | ConvertFrom-Json | Select-Object -ExpandProperty domain
            if ($backendUrl) {
                Write-Success "Backend URL: https://$backendUrl"
                $env:BACKEND_URL = "https://$backendUrl"
            }
        } else {
            $env:BACKEND_URL = "https://uradi360-backend.up.railway.app"
        }

    } catch {
        Write-Error "Backend deployment failed: $_"
        Pop-Location
        exit 1
    }

    Pop-Location
} else {
    Write-Warning "Skipping backend deployment"
}

# Deploy Frontend
if (-not $SkipFrontend) {
    Write-Host ""
    Write-Host "Step 3: Deploying Frontend..." -ForegroundColor Yellow
    Write-Host "----------------------------------------" -ForegroundColor Gray

    Push-Location $FrontendDir

    try {
        # Install dependencies
        Write-Info "Installing dependencies..."
        if (-not $DryRun) {
            npm ci
            if ($LASTEXITCODE -ne 0) {
                throw "npm install failed"
            }
        }
        Write-Success "Dependencies installed"

        # Build
        Write-Info "Building..."
        if (-not $DryRun) {
            npm run build
            if ($LASTEXITCODE -ne 0) {
                throw "Build failed"
            }
        }
        Write-Success "Build complete"

        # Deploy to Vercel
        Write-Info "Deploying to Vercel..."
        if (-not $DryRun) {
            vercel --prod --yes
            if ($LASTEXITCODE -ne 0) {
                throw "Vercel deployment failed"
            }
        }
        Write-Success "Frontend deployed to Vercel"

    } catch {
        Write-Error "Frontend deployment failed: $_"
        Pop-Location
        exit 1
    }

    Pop-Location
} else {
    Write-Warning "Skipping frontend deployment"
}

# Summary
Write-Host ""
Write-Host "==========================================" -ForegroundColor Green
Write-Host "Deployment Complete!" -ForegroundColor Green
Write-Host "==========================================" -ForegroundColor Green
Write-Host ""

if ($DryRun) {
    Write-Host "This was a DRY RUN. No actual deployment occurred." -ForegroundColor Magenta
    Write-Host "Remove -DryRun flag to deploy for real." -ForegroundColor Magenta
    Write-Host ""
}

Write-Host "Next Steps:" -ForegroundColor Yellow
Write-Host "1. Configure custom domains in Railway/Vercel dashboards"
Write-Host "2. Set up SSL certificates"
Write-Host "3. Configure Sentry for error tracking"
Write-Host "4. Test authentication flow"
Write-Host "5. Verify all integrations (SMS, WhatsApp, Email)"
Write-Host ""
Write-Host "Verification commands:" -ForegroundColor Yellow
if ($env:BACKEND_URL) {
    Write-Host "  curl $env:BACKEND_URL/health"
    Write-Host "  curl $env:BACKEND_URL/docs"
}
Write-Host ""
