#!/bin/bash

# Quick Fix Script - Rewards Manager Unauthorized Issue
# Run this script di server untuk troubleshooting

echo "🔧 Docterbee Rewards Manager - Troubleshooting Script"
echo "=================================================="
echo ""

# 1. Check if server is running
echo "1️⃣ Checking if server is running..."
if lsof -Pi :3000 -sTCP:LISTEN -t >/dev/null ; then
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
if [ ${NODE_VERSION:1:2} -lt 18 ]; then
    echo "⚠️  Warning: Node.js 18+ recommended"
fi

echo ""

# 3. Check .env file
echo "3️⃣ Checking .env file..."
if [ -f .env ]; then
    echo "✅ .env file exists"
    if grep -q "SESSION_SECRET" .env; then
        echo "   ✅ SESSION_SECRET is set"
    else
        echo "   ⚠️  SESSION_SECRET not found in .env"
    fi
    if grep -q "ADMIN_USERNAME" .env; then
        echo "   ✅ ADMIN_USERNAME is set"
    else
        echo "   ⚠️  ADMIN_USERNAME not found (using default: admin)"
    fi
else
    echo "⚠️  .env file not found"
    echo "   Copy .env.example to .env and configure"
fi

echo ""

# 4. Test Admin Login Endpoint
echo "4️⃣ Testing admin login endpoint..."
LOGIN_RESPONSE=$(curl -s -X POST http://localhost:3000/api/admin/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"docterbee2025"}' \
  -c /tmp/docterbee_cookies.txt \
  -w "\nHTTP_CODE:%{http_code}")

HTTP_CODE=$(echo "$LOGIN_RESPONSE" | grep "HTTP_CODE" | cut -d: -f2)

if [ "$HTTP_CODE" = "200" ]; then
    echo "✅ Admin login successful (HTTP 200)"
else
    echo "❌ Admin login failed (HTTP $HTTP_CODE)"
    echo "   Response: $LOGIN_RESPONSE"
fi

echo ""

# 5. Test Rewards Admin Endpoint
echo "5️⃣ Testing rewards admin endpoint (with session)..."
REWARDS_RESPONSE=$(curl -s http://localhost:3000/api/rewards/admin/all \
  -b /tmp/docterbee_cookies.txt \
  -w "\nHTTP_CODE:%{http_code}")

HTTP_CODE=$(echo "$REWARDS_RESPONSE" | grep "HTTP_CODE" | cut -d: -f2)

if [ "$HTTP_CODE" = "200" ]; then
    echo "✅ Rewards admin endpoint accessible (HTTP 200)"
    echo "   🎉 Rewards Manager is working correctly!"
else
    echo "❌ Rewards admin endpoint returned HTTP $HTTP_CODE"
    echo "   Response: $REWARDS_RESPONSE"
    echo ""
    echo "   🔧 Troubleshooting steps:"
    echo "   1. Restart server: npm start"
    echo "   2. Check backend/routes/rewards.mjs logs"
    echo "   3. Verify session configuration in backend/server.mjs"
fi

echo ""

# 6. Test Public Rewards Endpoint
echo "6️⃣ Testing public rewards endpoint..."
PUBLIC_RESPONSE=$(curl -s http://localhost:3000/api/rewards \
  -w "\nHTTP_CODE:%{http_code}")

HTTP_CODE=$(echo "$PUBLIC_RESPONSE" | grep "HTTP_CODE" | cut -d: -f2)

if [ "$HTTP_CODE" = "200" ]; then
    echo "✅ Public rewards endpoint working (HTTP 200)"
else
    echo "⚠️  Public rewards endpoint returned HTTP $HTTP_CODE"
fi

echo ""

# 7. Check database connection
echo "7️⃣ Checking database..."
DB_CHECK=$(curl -s http://localhost:3000/api/rewards)
if echo "$DB_CHECK" | grep -q "success"; then
    echo "✅ Database connection OK"
else
    echo "❌ Database connection issue"
    echo "   Check MySQL service and credentials"
fi

echo ""
echo "=================================================="
echo "🏁 Troubleshooting complete!"
echo ""
echo "📋 Summary:"
echo "   - Admin login endpoint: Check step 4"
echo "   - Rewards admin access: Check step 5"
echo "   - Public rewards access: Check step 6"
echo ""
echo "📖 Full guide: docs/SERVER_DEPLOYMENT_TROUBLESHOOTING.md"
echo ""

# Cleanup
rm -f /tmp/docterbee_cookies.txt
