@echo off
REM ========================================
REM Kill Node.js Server Script
REM ========================================

echo.
echo ====================================
echo   Kill Node.js Server
echo ====================================
echo.

REM Method 1: Kill all node processes
echo [1] Killing all node.js processes...
tasklist /FI "IMAGENAME eq node.exe" 2>NUL | find /I /N "node.exe">NUL
if "%ERRORLEVEL%"=="0" (
    taskkill /F /IM node.exe >NUL 2>&1
    echo     ✓ All node.js processes killed
) else (
    echo     ℹ No node.js processes found
)

echo.

REM Method 2: Kill process on port 3000
echo [2] Checking port 3000...
for /f "tokens=5" %%a in ('netstat -ano ^| findstr :3000 ^| findstr LISTENING') do (
    echo     ✓ Found process on port 3000 (PID: %%a)
    taskkill /F /PID %%a >NUL 2>&1
    echo     ✓ Process killed
    goto :done
)
echo     ℹ No process found on port 3000

:done
echo.
echo ====================================
echo   Done! Port 3000 is now free
echo ====================================
echo.
pause
