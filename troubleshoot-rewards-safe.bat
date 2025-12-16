@echo off
REM Quick Health Check Script - Rewards Manager (SAFE VERSION)
REM This script does NOT contain hardcoded credentials
REM Usage: troubleshoot-rewards-safe.bat [admin_username] [admin_password]

echo ========================================
echo Docterbee Rewards Manager - Health Check
echo ========================================
echo.

REM Get credentials from arguments or environment
set "ADMIN_USER=%~1"
set "ADMIN_PASS=%~2"

if "%ADMIN_USER%"=="" set "ADMIN_USER=%ADMIN_USERNAME%"
if "%ADMIN_PASS%"=="" set "ADMIN_PASS=%ADMIN_PASSWORD%"

if "%ADMIN_USER%"=="" goto :no_credentials
if "%ADMIN_PASS%"=="" goto :no_credentials

REM 1. Check if server is running
echo 1. Checking if server is running...
netstat -ano | findstr :3000 | findstr LISTENING >nul
if %errorlevel% equ 0 (
    echo [OK] Server is running on port 3000
) else (
    echo [ERROR] Server is NOT running on port 3000
    pause
    exit /b 1
)
echo.

REM 2. Check Node.js version
echo 2. Checking Node.js version...
node -v
echo.

REM 3. Test Admin Login
echo 3. Testing admin login endpoint...
curl -s -X POST http://localhost:3000/api/admin/login -H "Content-Type: application/json" -d "{\"username\":\"%ADMIN_USER%\",\"password\":\"%ADMIN_PASS%\"}" -c cookies.txt
if %errorlevel% equ 0 (
    echo [OK] Admin login test completed
) else (
    echo [ERROR] Admin login test failed
)
echo.

REM 4. Test Rewards Admin Endpoint
echo 4. Testing rewards admin endpoint...
curl -s http://localhost:3000/api/rewards/admin/all -b cookies.txt
if %errorlevel% equ 0 (
    echo [OK] Rewards admin endpoint working
) else (
    echo [ERROR] Rewards admin endpoint failed
)
echo.

REM 5. Test Public Endpoint
echo 5. Testing public rewards endpoint...
curl -s http://localhost:3000/api/rewards
if %errorlevel% equ 0 (
    echo [OK] Public rewards endpoint working
) else (
    echo [ERROR] Public rewards endpoint failed
)
echo.

echo ========================================
echo Health check complete!
echo.

REM Cleanup
if exist cookies.txt del cookies.txt
pause
exit /b 0

:no_credentials
echo [ERROR] Credentials required!
echo.
echo Usage:
echo   troubleshoot-rewards-safe.bat ^<username^> ^<password^>
echo.
echo Or set environment variables:
echo   set ADMIN_USERNAME=admin
echo   set ADMIN_PASSWORD=your_password
echo   troubleshoot-rewards-safe.bat
echo.
pause
exit /b 1
