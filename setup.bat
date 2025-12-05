@echo off
echo ========================================
echo Xeno Shopify Insights - Setup Script
echo ========================================
echo.

echo [1/5] Installing root dependencies...
call npm install
if %errorlevel% neq 0 (
    echo ERROR: Root installation failed
    pause
    exit /b 1
)

echo.
echo [2/5] Installing backend dependencies...
cd backend
call npm install
if %errorlevel% neq 0 (
    echo ERROR: Backend installation failed
    pause
    exit /b 1
)

echo.
echo [3/5] Installing frontend dependencies...
cd ..\frontend
call npm install
if %errorlevel% neq 0 (
    echo ERROR: Frontend installation failed
    pause
    exit /b 1
)

cd ..

echo.
echo [4/5] Creating environment files...
if not exist backend\.env (
    copy backend\.env.example backend\.env
    echo Created backend\.env - PLEASE EDIT THIS FILE WITH YOUR DATABASE URL
) else (
    echo backend\.env already exists, skipping...
)

if not exist frontend\.env.local (
    copy frontend\.env.local.example frontend\.env.local
    echo Created frontend\.env.local
) else (
    echo frontend\.env.local already exists, skipping...
)

echo.
echo [5/5] Setup complete!
echo.
echo ========================================
echo NEXT STEPS:
echo ========================================
echo 1. Edit backend\.env with your database URL
echo 2. Run: cd backend
echo 3. Run: npm run db:migrate
echo 4. Run: cd ..
echo 5. Run: npm run dev
echo.
echo For detailed instructions, see QUICK_START.md
echo ========================================
pause
