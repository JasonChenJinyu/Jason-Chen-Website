#!/bin/bash

# ----------------------------------------------------------------------
# CLOUD SERVER DEPLOYMENT SCRIPT
# ----------------------------------------------------------------------
# This script is specifically for deploying on the Alibaba Cloud server
# It sets up the Next.js application and configures nginx on Linux
# 
# DO NOT use this script on the Mac Mini
# For the Mac Mini, use mac-deploy.sh instead
# ----------------------------------------------------------------------

# Exit on error
set -e

echo "🚀 Starting Cloud Server deployment..."

# Kill any existing Next.js processes
echo "📝 Cleaning up existing processes..."
pkill -f "next" || true
pkill -f "node" || true

# Clean up old build files
echo "🧹 Cleaning up old build files..."
rm -rf .next
rm -rf /var/www/html/_next
rm -rf /var/www/html/public

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Generate Prisma client
echo "🔄 Generating Prisma client..."
npx prisma generate

# Build the application
echo "🏗️ Building the application..."
NODE_ENV=production npm run build

# Create necessary directories
echo "📁 Creating necessary directories..."
sudo mkdir -p /var/www/html
sudo mkdir -p /var/log/nginx

# Set proper permissions
echo "🔒 Setting proper permissions..."
sudo chown -R $USER:$USER /var/www/html
sudo chmod -R 755 /var/www/html

# Copy built files
echo "📋 Copying built files..."
cp -r .next /var/www/html/
cp -r public /var/www/html/
cp -r node_modules /var/www/html/
cp package.json /var/www/html/
cp next.config.js /var/www/html/

# Copy Nginx configuration
echo "🔧 Setting up Nginx configuration..."
sudo cp nginx.conf /etc/nginx/nginx.conf

# Start the application in production mode
echo "🚀 Starting the application..."
cd /var/www/html
NODE_ENV=production PORT=3000 npm run start &

# Restart Nginx
echo "🔄 Restarting Nginx..."
sudo systemctl restart nginx

echo "✅ Deployment complete!" 