# Database Setup Guide

Since Docker is not installed on your system, here are your options:

## Option 1: Use Supabase (Recommended - Free & Easy)

1. **Go to** [supabase.com](https://supabase.com)
2. **Sign up** for a free account
3. **Create a new project**
4. **Get your database URL**:
   - Go to Project Settings → Database
   - Copy the "Connection string" (URI format)
   - It looks like: `postgresql://postgres:[YOUR-PASSWORD]@db.[PROJECT-ID].supabase.co:5432/postgres`

5. **Update** `/Users/jeremy/InPloy/.env`:
   ```env
   DATABASE_URL=postgresql://postgres:[YOUR-PASSWORD]@db.[PROJECT-ID].supabase.co:5432/postgres
   ```

6. **Run migrations**:
   ```bash
   cd /Users/jeremy/InPloy/packages/server
   npx prisma migrate dev
   npx tsx prisma/seed.ts
   ```

## Option 2: Install PostgreSQL Locally

### On macOS:
```bash
# Install PostgreSQL using Homebrew
brew install postgresql@15

# Start PostgreSQL service
brew services start postgresql@15

# Create database
createdb inploy
```

Then your `.env` stays as:
```env
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/inploy
```

## Option 3: Install Docker Desktop

1. Download from [docker.com](https://www.docker.com/products/docker-desktop/)
2. Install and start Docker Desktop
3. Run:
   ```bash
   cd /Users/jeremy/InPloy/docker
   docker-compose up postgres -d
   ```

## For Quick Testing (Without Database)

The frontend will still work and you can see the UI! Just some features won't work:
- Adding/editing employees won't persist
- Dashboard metrics won't show real data

The database is only needed for actual data storage and the backend API.
