#!/bin/bash

# Production Database Migration Script
# Usage: ./migrate-production.sh [your-neon-database-url]

if [ -z "$1" ]; then
  echo "❌ Error: Please provide your production database URL"
  echo "Usage: ./migrate-production.sh 'postgresql://user:password@host/db'"
  exit 1
fi

echo "🔄 Setting up production database..."
export DATABASE_URL="$1"

cd packages/server

echo "📦 Running Prisma migrations..."
npx prisma migrate deploy

echo "🌱 Seeding database..."
npx prisma db seed

echo "✅ Production database setup complete!"
echo ""
echo "Next steps:"
echo "1. Redeploy on Vercel to pick up the new environment variables"
echo "2. Visit your app URL to test"
