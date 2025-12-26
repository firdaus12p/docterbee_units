#!/bin/bash
# ===========================================
# Docterbee Deployment Script
# Usage: ./deploy.sh [branch]
# Example: ./deploy.sh main
#          ./deploy.sh clean
# ===========================================

set -e  # Exit on any error

BRANCH=${1:-main}  # Default to 'main' if no argument

echo "🚀 Starting deployment..."
echo "📌 Target branch: $BRANCH"

# 1. Fetch latest changes
echo "📥 Fetching from origin..."
git fetch origin

# 2. Checkout and pull branch
echo "🔀 Switching to branch: $BRANCH"
git checkout $BRANCH
git pull origin $BRANCH

# 3. Install dependencies
echo "📦 Installing dependencies..."
npm install

# 4. Run database migrations (if any)
echo "🗄️ Running setup..."
npm run setup 2>/dev/null || echo "Setup skipped or already done"

# 5. Restart server (adjust based on your process manager)
if command -v pm2 &> /dev/null; then
    echo "🔄 Restarting server with PM2..."
    pm2 restart docterbee 2>/dev/null || pm2 start backend/server.mjs --name docterbee
else
    echo "⚠️ PM2 not found. Please restart server manually."
fi

echo "✅ Deployment complete!"
echo "🌐 Server should be running on your configured port"
