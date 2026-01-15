# Vercel Environment Variables Setup

## Required Environment Variables

Add these in your Vercel project: Settings → Environment Variables

### 1. Database
```
DATABASE_URL=postgresql://user:password@ep-xxx.region.aws.neon.tech/neondb?sslmode=require
```
**Get from:** https://neon.tech (after creating a project)

### 2. Clerk Authentication (Already Added ✓)
```
CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...
```

### 3. JWT Secret
```
JWT_SECRET=your-super-secret-jwt-key-min-32-chars-long-random-string
```
**Generate with:** `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`

### 4. Node Environment
```
NODE_ENV=production
```

### 5. Port (optional)
```
PORT=3000
```

## After Adding Environment Variables

### Run Database Migrations

You have two options:

**Option 1: From your local machine**
```bash
# Set production database URL temporarily
export DATABASE_URL="your-neon-connection-string"

# Run migrations
cd packages/server
npx prisma migrate deploy
npx prisma db seed
```

**Option 2: From Vercel CLI**
```bash
# Install Vercel CLI if needed
npm i -g vercel

# Link to your project
vercel link

# Run migration script
vercel env pull .env.production
cd packages/server
DATABASE_URL=$(grep DATABASE_URL ../../.env.production | cut -d '=' -f2-) npx prisma migrate deploy
```

## Verify Deployment

1. Check Vercel deployment logs
2. Visit your deployment URL
3. Test the API: `https://your-app.vercel.app/api/v1/health`
