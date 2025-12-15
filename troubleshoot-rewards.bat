@echo off
REM Quick Fix Script - Rewards Manager Unauthorized Issue (Windows)
REM Run this script di server untuk troubleshooting

echo ========================================
echo Docterbee Rewards Manager - Troubleshooting
echo ========================================
echo.

REM 1. Check if server is running
echo 1. Checking if server is running...
netstat -ano | findstr :3000 | findstr LISTENING >nul
if %errorlevel% equ 0 (
    echo [OK] Server is running on port 3000
) else (
    echo [ERROR] Server is NOT running on port 3000
    echo Start server with: npm start
    pause
    exit /b 1
)
echo.

REM 2. Check Node.js version
echo 2. Checking Node.js version...
node -v
echo.

REM 3. Check .env file
echo 3. Checking .env file...
if exist .env (
    echo [OK] .env file exists
    findstr /C:"SESSION_SECRET" .env >nul
    if %errorlevel% equ 0 (
        echo [OK] SESSION_SECRET is set
    ) else (
        echo [WARNING] SESSION_SECRET not found
    )
) else (
    echo [WARNING] .env file not found
)
echo.

REM 4. Test Admin Login
echo 4. Testing admin login endpoint...
curl -s -X POST http://localhost:3000/api/admin/login -H "Content-Type: application/json" -d "{\"username\":\"admin\",\"password\":\"docterbee2025\"}" -c cookies.txt
if %errorlevel% equ 0 (
    echo [OK] Admin login test completed
) else (
    echo [ERROR] Admin login test failed
)
echo.

REM 5. Test Rewards Admin Endpoint
echo 5. Testing rewards admin endpoint...
curl -s http://localhost:3000/api/rewards/admin/all -b cookies.txt
if %errorlevel% equ 0 (
    echo [OK] Rewards admin endpoint test completed
) else (
    echo [ERROR] Rewards admin endpoint test failed
)
echo.

REM 6. Test Public Endpoint
echo 6. Testing public rewards endpoint...
curl -s http://localhost:3000/api/rewards
if %errorlevel% equ 0 (
    echo [OK] Public rewards endpoint working
) else (
    echo [ERROR] Public rewards endpoint failed
)
echo.

echo ========================================
echo Troubleshooting complete!
echo.
echo Full guide: docs\SERVER_DEPLOYMENT_TROUBLESHOOTING.md
echo.

REM Cleanup
if exist cookies.txt del cookies.txt

pause
