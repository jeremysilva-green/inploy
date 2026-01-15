#!/bin/bash
echo "🔄 Stopping servers..."
lsof -ti:3000 | xargs kill -9 2>/dev/null
lsof -ti:8081 | xargs kill -9 2>/dev/null

echo "🧹 Clearing Metro bundler cache..."
cd /Users/jeremy/InPloy/packages/web
rm -rf .expo node_modules/.cache

echo "🚀 Starting backend server..."
cd /Users/jeremy/InPloy/packages/server
npm run dev > /tmp/backend.log 2>&1 &

echo "⏳ Waiting for backend..."
sleep 3

echo "🚀 Starting web server..."
cd /Users/jeremy/InPloy/packages/web
npm run dev > /tmp/web.log 2>&1 &

echo "⏳ Waiting for web server..."
sleep 5

echo "✅ Servers started!"
echo "📱 Web: http://localhost:8081"
echo "🔧 API: http://localhost:3000"
echo ""
echo "📋 Logs:"
echo "  Backend: tail -f /tmp/backend.log"
echo "  Web: tail -f /tmp/web.log"
