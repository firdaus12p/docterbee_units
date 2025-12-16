#!/bin/bash

# Quick Health Check Script - Rewards Manager (SAFE VERSION)
# This script does NOT contain hardcoded credentials
# Usage: ./troubleshoot-rewards-safe.sh [admin_username] [admin_password]

echo "🔧 Docterbee Rewards Manager - Health Check"
echo "=================================================="
echo ""

# Check for credentials from arguments or environment
ADMIN_USER="${1:-${ADMIN_USERNAME}}"
ADMIN_PASS="${2:-${ADMIN_PASSWORD}}"

if [ -z "$ADMIN_USER" ] || [ -z "$ADMIN_PASS" ]; then
    echo "❌ Credentials required!"
    echo ""
    echo "Usage:"
    echo "  ./troubleshoot-rewards-safe.sh <username> <password>"
    echo ""
    echo "Or set environment variables:"
    echo "  export ADMIN_USERNAME=admin"
    echo "  export ADMIN_PASSWORD=your_password"
    echo "  ./troubleshoot-rewards-safe.sh"
    exit 1
fi

# 1. Check if server is running
echo "1️⃣ Checking if server is running..."
if lsof -Pi :3000 -sTCP:LISTEN -t >/dev/null 2>&1 ; then
    echo "✅ Server is running on port 3000"
    SERVER_PID=$(lsof -ti:3000)
    echo "   PID: $SERVER_PID"
else
    echo "❌ Server is NOT running on port 3000"
    echo "   Start server with: npm start"
    exit 1
fi

echo ""

# 2. Check Node.js version
echo "2️⃣ Checking Node.js version..."
NODE_VERSION=$(node -v)
echo "   Node.js: $NODE_VERSION"

echo ""

# 3. Test Admin Login Endpoint
echo "3️⃣ Testing admin login endpoint..."
LOGIN_RESPONSE=$(curl -s -X POST http://localhost:3000/api/admin/login \
  -H "Content-Type: application/json" \
  -d "{\"username\":\"$ADMIN_USER\",\"password\":\"$ADMIN_PASS\"}" \
  -c /tmp/docterbee_cookies.txt \
  -w "\nHTTP_CODE:%{http_code}")

HTTP_CODE=$(echo "$LOGIN_RESPONSE" | grep "HTTP_CODE" | cut -d: -f2)

if [ "$HTTP_CODE" = "200" ]; then
    echo "✅ Admin login successful (HTTP 200)"
else
    echo "❌ Admin login failed (HTTP $HTTP_CODE)"
    rm -f /tmp/docterbee_cookies.txt
    exit 1
fi

echo ""

# 4. Test Rewards Admin Endpoint
echo "4️⃣ Testing rewards admin endpoint..."
REWARDS_RESPONSE=$(curl -s http://localhost:3000/api/rewards/admin/all \
  -b /tmp/docterbee_cookies.txt \
  -w "\nHTTP_CODE:%{http_code}")

HTTP_CODE=$(echo "$REWARDS_RESPONSE" | grep "HTTP_CODE" | cut -d: -f2)

if [ "$HTTP_CODE" = "200" ]; then
    echo "✅ Rewards admin endpoint accessible (HTTP 200)"
    echo "   🎉 Rewards Manager is working correctly!"
else
    echo "❌ Rewards admin endpoint returned HTTP $HTTP_CODE"
fi

echo ""

# 5. Test Public Rewards Endpoint
echo "5️⃣ Testing public rewards endpoint..."
PUBLIC_RESPONSE=$(curl -s http://localhost:3000/api/rewards \
  -w "\nHTTP_CODE:%{http_code}")

HTTP_CODE=$(echo "$PUBLIC_RESPONSE" | grep "HTTP_CODE" | cut -d: -f2)

if [ "$HTTP_CODE" = "200" ]; then
    echo "✅ Public rewards endpoint working (HTTP 200)"
else
    echo "⚠️  Public rewards endpoint returned HTTP $HTTP_CODE"
fi

echo ""
echo "=================================================="
echo "🏁 Health check complete!"

# Cleanup
rm -f /tmp/docterbee_cookies.txt
