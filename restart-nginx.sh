#!/bin/bash

echo "📝 Stopping Nginx if running..."
sudo /opt/homebrew/bin/nginx -s stop || true

echo "🔧 Setting up Nginx on port 8080..."
sudo cp nginx.conf /opt/homebrew/etc/nginx/servers/nextjs.conf

echo "🚀 Starting Nginx..."
sudo /opt/homebrew/bin/nginx

echo "✅ Nginx is now running on port 8080"
echo "🌐 Your site should be accessible at http://localhost:8080"
echo "🌐 Make sure your cloud server (47.106.67.151) is forwarding port 80 to your Mac Mini's port 8080"