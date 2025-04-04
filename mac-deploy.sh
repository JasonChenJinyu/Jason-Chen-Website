#!/bin/bash

# ----------------------------------------------------------------------
# MAC DEPLOYMENT SCRIPT
# ----------------------------------------------------------------------
# This script is specifically for deploying on the Mac Mini
# It sets up the Next.js application and configures nginx on macOS
# 
# DO NOT use this script on the Alibaba Cloud server
# For the cloud server, use deploy.sh instead
# ----------------------------------------------------------------------

# Exit on error
set -e

echo "🚀 Starting Mac Mini deployment..."

# Kill any existing Next.js processes
echo "📝 Cleaning up existing processes..."
pkill -f "next" || true
pkill -f "node" || true

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Generate Prisma client
echo "🔄 Generating Prisma client..."
npx prisma generate

# Build the application
echo "🏗️ Building the application..."
NEXT_PUBLIC_DISABLE_ESLINT=true NODE_ENV=production npm run build

# Update Nginx configuration
echo "🔧 Setting up Nginx configuration..."
cp /opt/homebrew/etc/nginx/servers/nextjs.conf /opt/homebrew/etc/nginx/servers/nextjs.conf.bak
cp nginx.conf /opt/homebrew/etc/nginx/servers/nextjs.conf

# Start the application in development mode (for simplicity)
echo "🚀 Starting the application..."
npm run dev &

# Restart Nginx
echo "🔄 Restarting Nginx..."
brew services restart nginx

echo "✅ Deployment complete!"
echo "🌐 Your site should be accessible at http://localhost and http://47.106.67.151" 