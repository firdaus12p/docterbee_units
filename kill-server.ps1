# ========================================
# Kill Node.js Server Script (PowerShell)
# ========================================

Write-Host ""
Write-Host "====================================" -ForegroundColor Cyan
Write-Host "   Kill Node.js Server" -ForegroundColor Cyan
Write-Host "====================================" -ForegroundColor Cyan
Write-Host ""

# Method 1: Kill all node processes
Write-Host "[1] Killing all node.js processes..." -ForegroundColor Yellow
$nodeProcesses = Get-Process -Name node -ErrorAction SilentlyContinue
if ($nodeProcesses) {
    $nodeProcesses | Stop-Process -Force
    Write-Host "    ✓ Killed $($nodeProcesses.Count) node.js process(es)" -ForegroundColor Green
} else {
    Write-Host "    ℹ No node.js processes found" -ForegroundColor Gray
}

Write-Host ""

# Method 2: Kill process on port 3000
Write-Host "[2] Checking port 3000..." -ForegroundColor Yellow
$port3000 = netstat -ano | Select-String ":3000" | Select-String "LISTENING"
if ($port3000) {
    $pid = ($port3000 -split '\s+')[-1]
    Write-Host "    ✓ Found process on port 3000 (PID: $pid)" -ForegroundColor Green
    taskkill /F /PID $pid | Out-Null
    Write-Host "    ✓ Process killed" -ForegroundColor Green
} else {
    Write-Host "    ℹ No process found on port 3000" -ForegroundColor Gray
}

Write-Host ""
Write-Host "====================================" -ForegroundColor Cyan
Write-Host "   Done! Port 3000 is now free" -ForegroundColor Cyan
Write-Host "====================================" -ForegroundColor Cyan
Write-Host ""

# Wait for 2 seconds before closing
Start-Sleep -Seconds 2
