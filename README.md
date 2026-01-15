# InPloy - Employer Check-in/Check-out System

A professional web-based time tracking system for employers with automatic hours calculation, salary deductions, and admin dashboard.

## Features

- **Check-in/Check-out**: Simple button interface for employers (Entrada/Salida)
- **Lunch Break Tracking**: Automatic lunch time calculation (unpaid)
- **Hours Calculation**: Auto-calculate worked hours, hours gained, hours lost
- **Salary Management**: Configurable deduction formulas per employer
- **Admin Dashboard**: Real-time metrics across all employers
- **Currency Toggle**: Switch between PYG (Guaraníes) and USD
- **AI Voice Greetings**: Welcome message when employers check in (Spanish)
- **Days Off Management**: Track absences with automatic salary deductions
- **Mobile Responsive**: Works on tablets and smartphones

## Tech Stack

- **Frontend**: React + Expo (web) + TypeScript
- **Backend**: Node.js + Express + TypeScript
- **Database**: PostgreSQL + Prisma ORM
- **Authentication**: Clerk (role-based access control)
- **Real-time Updates**: Server-Sent Events (SSE)

## Project Structure

```
InPloy/
├── packages/
│   ├── shared/     # Shared TypeScript types
│   ├── web/        # React frontend
│   └── server/     # Express backend
```

## Prerequisites

- Node.js >= 20.0.0
- pnpm >= 8.0.0
- PostgreSQL >= 15
- Clerk account (for authentication)

## Getting Started

### 1. Install Dependencies

```bash
pnpm install
```

### 2. Set Up Environment Variables

```bash
cp .env.example .env
# Edit .env with your actual values
```

### 3. Set Up Database

```bash
# Run Prisma migrations
pnpm migrate:dev

# Seed database with sample data (optional)
pnpm db:seed
```

### 4. Start Development Servers

```bash
# Start both frontend and backend
pnpm dev

# Or start individually
pnpm dev:server  # Backend on http://localhost:3000
pnpm dev:web     # Frontend on http://localhost:8081
```

## Scripts

- `pnpm dev` - Start all packages in development mode
- `pnpm build` - Build all packages for production
- `pnpm test` - Run tests across all packages
- `pnpm lint` - Lint all packages
- `pnpm migrate:dev` - Run database migrations (development)
- `pnpm migrate:deploy` - Run database migrations (production)
- `pnpm db:seed` - Seed database with sample data
- `pnpm db:studio` - Open Prisma Studio to view database

## Authentication Setup

1. Create a Clerk account at [clerk.com](https://clerk.com)
2. Create a new application
3. Copy your Publishable Key and Secret Key
4. Add them to your `.env` file
5. Configure allowed roles: `ADMIN` and `EMPLOYER`

## Database Schema

- **users** - Clerk authentication mapping
- **employers** - Employee records
- **salary_configs** - Salary configuration per employer
- **check_ins** - Time tracking events (ENTRADA, SALIDA, ALMUERZO, RETURN)
- **days_off** - Absence tracking
- **daily_work_summaries** - Pre-calculated daily metrics

## API Endpoints

Base URL: `/api/v1`

- `POST /auth/sync-user` - Sync Clerk user with database
- `GET /employers` - List all employers
- `POST /employers` - Create new employer (Admin only)
- `POST /check-ins` - Create check-in event
- `GET /metrics/global` - Global dashboard metrics (Admin only)
- `GET /events/stream` - SSE stream for real-time updates

## Deployment

### Using Docker

```bash
docker-compose up -d
```

### Using Railway/Render

1. Connect your GitHub repository
2. Set environment variables
3. Deploy server and web packages separately
4. Run database migrations: `pnpm migrate:deploy`

## License

MIT
