@echo off
REM Zahi Spa - Production Deployment Setup for Windows

echo.
echo 🚀 Zahi Spa - Production Deployment Setup
echo ==========================================
echo.

REM Check if git is initialized
if not exist .git (
    echo ❌ Git not initialized. Run: git init
    pause
    exit /b 1
)

echo ✅ Git repository ready
echo.
echo 📋 Deployment Checklist:
echo ========================
echo.
echo 1. Stripe Keys Configured?
echo    Get from: https://dashboard.stripe.com/apikeys
echo.
echo 2. Repository pushed to GitHub?
echo    Create at: https://github.com/new
echo.
echo 3. Railway account created?
echo    Go to: https://railway.app
echo.
echo 📱 Next Steps:
echo =============
echo.
echo A. Via Railway Dashboard (Easiest):
echo    1. Go to https://railway.app
echo    2. Click 'Create New Project'
echo    3. Select 'Deploy from GitHub'
echo    4. Select your repository
echo    5. Add environment variables:
echo       - STRIPE_SECRET_KEY
echo       - STRIPE_PUBLISHABLE_KEY
echo    6. Click Deploy
echo.
echo B. Via Railway CLI:
echo    1. npm install -g @railway/cli
echo    2. railway login
echo    3. railway init
echo    4. railway variables set STRIPE_SECRET_KEY=sk_test_...
echo    5. railway variables set STRIPE_PUBLISHABLE_KEY=pk_test_...
echo    6. railway up
echo.
echo 💡 TIP: See DEPLOYMENT.md for complete guide
echo.
echo 📝 Quick Commands:
echo ==================
echo.
echo To commit changes:
echo   git add .
echo   git commit -m "Deployment ready"
echo   git push origin main
echo.
echo To check git status:
echo   git status
echo.
pause
