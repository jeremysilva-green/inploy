# InPloy - Complete Feature Documentation

## 🎯 Overview

InPloy is a professional employer check-in/check-out system built with React, Expo (web), Node.js, Express, PostgreSQL, and Clerk authentication. It provides real-time time tracking, automatic salary calculations, and comprehensive analytics.

## ✨ Core Features

### 1. Employer Check-in System

**Location:** `📋 Check-in` Tab

- **Visual Interface**: Vertical list of all active employers
- **Check-in Buttons** (state-based colors):
  - 🟢 **ENTRADA** (Green) - Clock in to start work
  - 🔴 **SALIDA** (Red) - Clock out to end work
  - 🟡 **ALMUERZO** (Yellow) - Start/return from lunch break

- **Smart State Machine**:
  - `CHECKED_OUT` → Only ENTRADA enabled (green)
  - `CHECKED_IN` → SALIDA (red) and ALMUERZO (yellow) enabled
  - `ON_LUNCH` → ALMUERZO shows "En Almuerzo..." (yellow, pending)

- **Real-time Status Badges**:
  - "Fuera" (gray) - Not working
  - "Trabajando" (green) - Currently working
  - "Almuerzo" (yellow) - On lunch break

- **Voice Greetings**:
  - Spanish TTS on check-in: "Bienvenido Juan", "Buenos días María"
  - Uses Web Speech API (free, browser-native)
  - Randomized greetings for variety

- **State Validation**:
  - Cannot SALIDA without ENTRADA
  - Cannot ALMUERZO without ENTRADA
  - Must return from lunch before SALIDA
  - Clear error messages for invalid actions

### 2. Admin Dashboard

**Location:** `📊 Dashboard` Tab

- **Global Metrics Panel**:
  - 6 key performance indicators in card layout:
    1. **Horas Trabajadas** (green) - Total work hours
    2. **Horas Ganadas** (success) - Overtime hours
    3. **Horas Perdidas** (red) - Missed hours
    4. **Horas de Almuerzo** (yellow) - Lunch break hours
    5. **Deducciones Salariales** (red) - Total deductions
    6. **Empleados Activos** (blue) - Active employee count

- **Currency Toggle** (₲ PYG ⟷ $ USD):
  - Persists user preference
  - Updates all metrics in real-time
  - Automatic conversion using exchange rate

- **Employer Management Table**:
  - Name and position
  - Salary type (MONTHLY/HOURLY)
  - Salary amount (in selected currency)
  - Baseline hours per week
  - Active/Inactive status badges
  - Pagination support

### 3. Days Off Management

**Location:** `🏖️ Días Libres` Tab

- **Days Off Tracking**:
  - Create new days off with modal form
  - Select employer from dropdown
  - Choose date and type (Vacation, Sick Leave, Personal, Unpaid, Holiday)
  - Mark as paid or unpaid
  - Add optional reason/notes
  - Automatic deduction calculation for unpaid days

- **Days Off Table**:
  - Date, employee, type, paid/unpaid status
  - Deduction amount for unpaid days
  - Delete functionality
  - Real-time currency conversion

- **Deduction Formulas** (configurable per employer):
  - **Percentage**: Deduct X% of base salary
  - **Fixed**: Deduct fixed amount
  - **Tiered**: Different rates for different thresholds

### 4. Automatic Calculations

**Hours Calculation Engine:**
- Pairs ENTRADA → SALIDA for work periods
- Pairs ALMUERZO → RETURN for lunch breaks
- Sums multiple work periods in one day
- Subtracts lunch time (unpaid)
- Calculates hours gained/lost vs baseline
- Handles incomplete days (no SALIDA)

**Salary Calculation Engine:**
- **Monthly Employees**: `(baseSalary / expectedMonthlyHours) * hoursLost`
- **Hourly Employees**: `hourlyRate * hoursLost`
- Applies configurable deduction formulas
- Currency conversion (PYG ⟷ USD)
- Days off deductions

**Daily Work Summaries:**
- Pre-calculated for performance
- Total hours worked
- Lunch hours
- Expected hours
- Hours gained/lost
- Salary impact
- Completion status

## 🔐 Security Features

### Authentication & Authorization
- **Clerk Integration**: Secure JWT-based authentication
- **Role-based Access Control**:
  - `ADMIN`: Full access to all features
  - `EMPLOYER`: Can only check in/out for themselves
- **Row-level Security**: Employers can only access their own data

### Data Protection
- **Server-side Timestamps**: Prevents client-side manipulation
- **IP Address Logging**: Audit trail for all check-ins
- **Request Validation**: Zod schemas validate all inputs
- **Rate Limiting**: Prevents spam and abuse
- **CORS Protection**: Whitelist approved origins
- **SQL Injection Prevention**: Prisma ORM parameterized queries

### Edge Case Handling
1. **Multiple Check-ins**: Sums all work periods
2. **Forgot to Check Out**: Admin override + auto-complete after midnight
3. **Timezone Issues**: Stores UTC, displays in America/Asuncion
4. **Concurrent Requests**: Database transactions with row locking
5. **Network Failures**: Frontend retry with idempotency keys
6. **No Lunch Return**: Auto-calculates lunch until SALIDA
7. **Midnight Edge Cases**: Uses local date for "today" queries

## 📊 API Endpoints

### Base URL: `/api/v1`

#### Authentication
- `POST /auth/sync-user` - Sync Clerk user with database

#### Employers
- `GET /employers` - List all employers (paginated, searchable)
- `GET /employers/:id` - Get single employer with details
- `POST /employers` - Create new employer (Admin)
- `PUT /employers/:id` - Update employer (Admin)
- `DELETE /employers/:id` - Soft delete employer (Admin)

#### Check-ins
- `POST /check-ins` - Create check-in event (validates state)
- `GET /check-ins` - Get check-ins for date range
- `GET /check-ins/today?employerId=` - Today's check-ins + current state
- `GET /check-ins/employer/:id/summary` - Monthly summary

#### Metrics
- `GET /metrics/global` - Global dashboard metrics
- `GET /metrics/employer/:id` - Detailed employer metrics

#### Days Off
- `GET /days-off` - List days off (filterable)
- `POST /days-off` - Create day off record (Admin)
- `DELETE /days-off/:id` - Delete day off (Admin)
- `GET /days-off/employer/:id/summary` - Annual summary

## 🗄️ Database Schema

### Tables

**users** - Clerk authentication mapping
- Maps Clerk IDs to internal user records
- Role assignment (ADMIN/EMPLOYER)

**employers** - Employee records
- Personal info (name, email, phone)
- Employment details (position, department, employee number)
- Baseline hours per week
- Active status (soft delete)

**salary_configs** - Salary configuration per employer
- Salary type (MONTHLY/HOURLY)
- Base salary in PYG
- Hourly rate (if applicable)
- Deduction formula (JSON - flexible configuration)
- Exchange rate

**check_ins** - Time tracking events
- Event type (ENTRADA, SALIDA, ALMUERZO, RETURN)
- Timestamp (UTC) and date (local)
- Paired event ID (links ENTRADA→SALIDA)
- IP address (audit trail)
- Voice greeting flag

**days_off** - Absence tracking
- Date and type (VACATION, SICK_LEAVE, etc.)
- Paid/unpaid flag
- Deduction amount
- Approval info

**daily_work_summaries** - Pre-calculated metrics
- Total hours worked
- Lunch hours
- Expected hours
- Hours gained/lost
- Salary deductions
- Completion status

### Indexes
- Composite indexes on `(employerId, date)` for fast queries
- Unique constraints prevent duplicate records
- Optimized for dashboard and summary queries

## 🎨 Frontend Architecture

### State Management
- **React Query**: Server state with caching (5-minute stale time)
- **Zustand**: Client state (currency preference, persisted)
- **Optimistic Updates**: Instant UI feedback with rollback

### Component Structure
```
EmployerList
  └─ EmployerCard (for each employer)
      ├─ Avatar with initials
      ├─ Status badge (Fuera/Trabajando/Almuerzo)
      └─ CheckInButtons (3 buttons with state colors)

Dashboard
  ├─ CurrencyToggle (PYG ⟷ USD)
  ├─ GlobalMetricsPanel (6 metric cards)
  └─ EmployerManagement (table with all employers)

DaysOffManagement
  ├─ Add Day Off button → Modal form
  └─ Days Off table with delete functionality
```

### Performance Optimizations
- React Query caching (reduces API calls)
- Auto-refetch every 30 seconds for check-ins
- Pagination for large employer lists
- Lazy loading of admin dashboard
- Optimistic UI updates

## 📱 Mobile Responsiveness

- **Responsive Grid**: Metrics cards wrap on small screens
- **Touch-friendly**: Large button targets (60px min)
- **Scrollable Tables**: Horizontal scroll on mobile
- **Flexible Layout**: Adapts to tablet and phone sizes
- **Web-only Build**: Optimized for mobile browsers

## 🌍 Internationalization

- **Spanish Interface**: All UI text in Spanish
- **Paraguay Locale**: Date formatting (es-PY)
- **Currency**: Guaraníes (₲) as base currency
- **Timezone**: America/Asuncion (UTC-4/-3 with DST)

## 🚀 Export Functionality

CSV export utilities available for:
- **Employers List**: All employer data
- **Days Off**: Complete absence records
- **Check-ins**: Full time tracking history
- **Metrics**: Performance summaries

Usage:
```typescript
import { exportEmployersToCSV } from '../utils/export';
exportEmployersToCSV(employers);
```

## 📈 Future Enhancements

Potential features for future development:

1. **Authentication UI**: Full Clerk integration with sign-in/sign-up flows
2. **Charts & Graphs**: Visual metrics with recharts or Chart.js
3. **PDF Reports**: Generate professional PDF exports
4. **SSE Real-time**: Server-Sent Events for live dashboard updates
5. **Geofencing**: Check-in only from work location
6. **Facial Recognition**: Biometric verification
7. **Mobile Apps**: iOS/Android native apps via Expo
8. **Shift Scheduling**: Plan and assign work shifts
9. **Notifications**: SMS/Email alerts for late check-ins
10. **Multi-tenant**: Support multiple companies
11. **Advanced Analytics**: Trends, predictions, insights
12. **Break Tracking**: Additional break types beyond lunch
13. **Overtime Rules**: Configurable overtime calculations
14. **Leave Requests**: Employee self-service portal
15. **Integration**: Payroll system APIs

## 🔧 Configuration

### Environment Variables

```env
# Database
DATABASE_URL=postgresql://user:pass@localhost:5432/inploy

# Clerk
CLERK_SECRET_KEY=sk_test_...
CLERK_PUBLISHABLE_KEY=pk_test_...

# Server
NODE_ENV=development
PORT=3000

# Frontend
VITE_API_URL=http://localhost:3000
VITE_CLERK_PUBLISHABLE_KEY=pk_test_...

# Timezone & Currency
TZ=America/Asuncion
DEFAULT_EXCHANGE_RATE=7300
```

### Employer Configuration

Each employer can be configured with:
- Salary type (MONTHLY or HOURLY)
- Base salary amount
- Baseline hours per week
- Custom deduction formula:
  ```json
  {
    "type": "percentage",
    "value": 5
  }
  ```

## 📝 API Response Format

All API responses follow this structure:

**Success:**
```json
{
  "success": true,
  "data": {
    // Response data here
  }
}
```

**Error:**
```json
{
  "success": false,
  "error": {
    "message": "Error message",
    "code": "ERROR_CODE",
    "statusCode": 400,
    "details": {}
  }
}
```

## 🎓 Code Quality

- **TypeScript**: Full type safety across frontend and backend
- **Monorepo**: Shared types via `@inploy/shared` package
- **Clean Architecture**: Domain logic separated from frameworks
- **Repository Pattern**: Abstracted data access
- **Service Layer**: Business logic orchestration
- **Error Handling**: Global error handlers with clear messages
- **Logging**: Winston logger for debugging
- **Testing Ready**: Structure supports unit and integration tests

## 📚 Documentation

- **README.md**: Project overview and quick start
- **SETUP.md**: Detailed setup instructions
- **FEATURES.md**: This file - complete feature documentation
- **API Documentation**: OpenAPI/Swagger (can be added)
- **Inline Comments**: Code is well-documented
- **Type Definitions**: Self-documenting via TypeScript

---

**Built with ❤️ using modern web technologies**
