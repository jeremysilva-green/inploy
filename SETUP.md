# InPloy Setup Guide

Complete guide to get the InPloy employer check-in/check-out system running.

## Prerequisites

- Node.js >= 20.0.0
- pnpm >= 8.0.0
- PostgreSQL >= 15 (or use Docker)
- Clerk account ([clerk.com](https://clerk.com))

## Quick Start (Development)

### 1. Install Dependencies

```bash
cd /Users/jeremy/InPloy
pnpm install
```

### 2. Set Up Clerk Authentication

1. Go to [clerk.com](https://clerk.com) and create an account
2. Create a new application
3. Get your API keys from the dashboard:
   - Publishable Key (starts with `pk_test_`)
   - Secret Key (starts with `sk_test_`)

### 3. Configure Environment Variables

```bash
cp .env.example .env
```

Edit `.env` and add your credentials:

```env
# Database
DATABASE_URL=postgresql://inploy:inploy_password@localhost:5432/inploy

# Clerk Authentication
CLERK_SECRET_KEY=sk_test_YOUR_SECRET_KEY_HERE
CLERK_PUBLISHABLE_KEY=pk_test_YOUR_PUBLISHABLE_KEY_HERE

# Server
NODE_ENV=development
PORT=3000
API_URL=http://localhost:3000

# Frontend
VITE_API_URL=http://localhost:3000
VITE_CLERK_PUBLISHABLE_KEY=pk_test_YOUR_PUBLISHABLE_KEY_HERE

# Timezone
TZ=America/Asuncion

# Exchange Rate (PYG to USD)
DEFAULT_EXCHANGE_RATE=7300
```

### 4. Start PostgreSQL Database

**Option A: Using Docker (Recommended)**

```bash
cd docker
docker-compose up postgres -d
```

**Option B: Local PostgreSQL**

Install PostgreSQL and create a database:

```sql
CREATE DATABASE inploy;
CREATE USER inploy WITH PASSWORD 'inploy_password';
GRANT ALL PRIVILEGES ON DATABASE inploy TO inploy;
```

### 5. Run Database Migrations

```bash
pnpm migrate:dev
```

This will:
- Create all database tables
- Set up indexes and constraints
- Generate Prisma client

### 6. Seed Sample Data (Optional)

```bash
pnpm db:seed
```

This creates:
- 1 admin user
- 3 sample employers (Juan, María, Carlos)
- Sample check-ins for today

### 7. Start Development Servers

**Terminal 1 - Backend:**
```bash
pnpm dev:server
```

Server will start at `http://localhost:3000`

**Terminal 2 - Frontend:**
```bash
pnpm dev:web
```

Web app will start at `http://localhost:8081`

### 8. Open the Application

Visit `http://localhost:8081` in your browser

## Testing the Application

### Without Clerk (Direct API Testing)

You can test the backend API directly:

1. **Health Check:**
   ```bash
   curl http://localhost:3000/health
   ```

2. **Get Employers:**
   ```bash
   curl http://localhost:3000/api/v1/employers
   ```

### With Clerk Authentication

For full application testing with Clerk:

1. Configure Clerk user roles:
   - Go to Clerk Dashboard → Users
   - Set user role to `ADMIN` or `EMPLOYER`

2. The frontend will use Clerk's UI components for authentication

## Database Management

### View Database in Prisma Studio

```bash
pnpm db:studio
```

Opens a web UI at `http://localhost:5555` to view and edit data.

### Reset Database

```bash
cd packages/server
npx prisma migrate reset
```

This will drop all tables and re-run migrations.

### Create New Migration

```bash
cd packages/server
npx prisma migrate dev --name your_migration_name
```

## Docker Deployment (Full Stack)

### 1. Create `.env` file in `docker/` directory

```bash
cd docker
cp ../.env.example .env
# Edit .env with your Clerk keys
```

### 2. Start All Services

```bash
docker-compose up -d
```

This starts:
- PostgreSQL database on port 5432
- Backend API on port 3000
- Frontend web app on port 8081

### 3. Run Migrations in Container

```bash
docker-compose exec server sh -c "cd packages/server && npx prisma migrate deploy"
```

### 4. Seed Data (Optional)

```bash
docker-compose exec server sh -c "cd packages/server && npx prisma db seed"
```

### 5. View Logs

```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f server
docker-compose logs -f web
```

### 6. Stop Services

```bash
docker-compose down
```

## Project Structure

```
InPloy/
├── packages/
│   ├── shared/              # Shared TypeScript types
│   ├── server/              # Backend API (Express + Prisma)
│   └── web/                 # Frontend (React + Expo)
├── docker/                  # Docker configuration
├── .env                     # Environment variables (create from .env.example)
└── README.md               # Project documentation
```

## Available Scripts

### Root Level

- `pnpm dev` - Start all packages in development mode
- `pnpm build` - Build all packages
- `pnpm test` - Run tests
- `pnpm clean` - Clean all build artifacts

### Backend (Server)

- `pnpm dev:server` - Start backend server
- `pnpm build:server` - Build backend for production
- `pnpm migrate:dev` - Run database migrations
- `pnpm db:seed` - Seed database with sample data
- `pnpm db:studio` - Open Prisma Studio

### Frontend (Web)

- `pnpm dev:web` - Start frontend development server
- `pnpm build:web` - Build frontend for production

## Troubleshooting

### Port Already in Use

If ports 3000 or 8081 are already in use:

```bash
# Kill process on port 3000
lsof -ti:3000 | xargs kill -9

# Kill process on port 8081
lsof -ti:8081 | xargs kill -9
```

### Database Connection Error

1. Check PostgreSQL is running:
   ```bash
   docker-compose ps postgres
   ```

2. Test connection:
   ```bash
   psql postgresql://inploy:inploy_password@localhost:5432/inploy
   ```

### Prisma Client Not Generated

```bash
cd packages/server
npx prisma generate
```

### Module Not Found Errors

```bash
# Clear node_modules and reinstall
pnpm clean
pnpm install
```

### Clerk Authentication Issues

1. Verify API keys in `.env` are correct
2. Check Clerk dashboard for application status
3. Ensure user has proper role assigned (ADMIN or EMPLOYER)

## Next Steps

Now that the system is running:

1. **Add Real Employers**: Use the admin interface to add actual employees
2. **Configure Salary**: Set up salary configurations per employer
3. **Test Check-ins**: Try checking in/out on the employer screen
4. **View Metrics**: Check the admin dashboard for hours and deductions
5. **Customize**: Adjust theme colors, exchange rates, etc.

## Support

For issues or questions:
- Check the [README.md](README.md) for feature documentation
- Review the [plan file](/Users/jeremy/.claude/plans/vast-discovering-spring.md) for architecture details
- Open an issue on GitHub

---

**Happy tracking! 🚀**
