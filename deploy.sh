#!/bin/bash
# Deploy script for GuestHouse-Ivanovka on Hetzner VPS
# Usage: ./deploy.sh

set -e

echo "🚀 Starting deployment..."

# Pull latest code
echo "📦 Pulling latest code from git..."
git pull origin main

# Install dependencies
echo "📥 Installing dependencies..."
npm ci

# Build the application
echo "🔨 Building the application..."
npm run build

# Restart PM2 process
echo "🔄 Restarting PM2 process..."
pm2 restart guesthouse || pm2 start ecosystem.config.js

# Save PM2 process list for auto-restart on reboot
pm2 save

echo "✅ Deployment complete!"
echo "📊 PM2 Status:"
pm2 status guesthouse
