# 🎉 InPloy - Getting Started

Welcome! Your professional employer check-in/check-out system is ready to run.

## 📋 What You Have

A complete full-stack application with:

### ✅ Core Features Implemented
- **Employee Check-in System**: Color-coded buttons (🟢 Entrada, 🔴 Salida, 🟡 Almuerzo)
- **Automatic Calculations**: Hours worked, gained, lost, lunch time, salary deductions
- **Admin Dashboard**: Real-time metrics across all employees
- **Days Off Management**: Track vacations, sick leave, unpaid days with automatic deductions
- **Currency Toggle**: Switch between PYG (Guaraníes) and USD
- **Voice Greetings**: Spanish TTS welcome messages (browser-native)
- **Export Functionality**: Download data as CSV files
- **Authentication Ready**: Clerk integration (optional for testing)

### 🏗️ Architecture
```
InPloy/
├── packages/
│   ├── shared/       # TypeScript types (shared between frontend/backend)
│   ├── web/          # React + Expo frontend
│   └── server/       # Node.js + Express backend
└── docker/           # PostgreSQL database setup
```

## 🚀 Quick Start (3 Options)

### Option 1: Just See The UI (No Backend)
Perfect for checking out the interface without setting up database:

```bash
cd /Users/jeremy/InPloy/packages/web
npm install
npx expo start --web
```

Opens at **http://localhost:8081** - You'll see all UI components but check-in buttons won't function (no API).

### Option 2: Full App Without Auth (Recommended for First Run)
Get the complete experience without Clerk setup:

```bash
# 1. Install all dependencies
cd /Users/jeremy/InPloy
npm install
cd packages/shared && npm install && cd ../..
cd packages/server && npm install && cd ../..
cd packages/web && npm install && cd ../..

# 2. Start PostgreSQL
cd /Users/jeremy/InPloy/docker
docker-compose up postgres -d
cd ..

# 3. Set up database
cd packages/server
npx prisma generate
npx prisma migrate dev
npx tsx prisma/seed.ts
cd ../..

# 4. Start backend (in one terminal)
cd packages/server
npm run dev

# 5. Start frontend (in another terminal)
cd packages/web
npx expo start --web
```

**Frontend**: http://localhost:8081
**Backend API**: http://localhost:3000

### Option 3: Production-Ready With Authentication
Once you're ready for the full experience:

1. Sign up at [Clerk](https://clerk.com) (free)
2. Create a new application
3. Copy your API keys to `/Users/jeremy/InPloy/.env`:
   ```env
   CLERK_SECRET_KEY=sk_test_your_key_here
   CLERK_PUBLISHABLE_KEY=pk_test_your_key_here
   ```
4. Follow Option 2 steps above
5. Authentication will now be active!

## 🎯 Testing The App

Once running at http://localhost:8081, you'll see 3 tabs:

### 📋 Check-in Tab
- **3 sample employees**: Juan García, María López, Carlos Rodríguez
- **Click buttons**:
  - 🟢 **Entrada** (Check In) - Green when active, plays voice greeting
  - 🔴 **Salida** (Check Out) - Red when active
  - 🟡 **Almuerzo** (Lunch) - Yellow when active
- **State validation**: Can't check out without checking in first!
- **Listen**: Voice greeting in Spanish when pressing Entrada

### 📊 Dashboard Tab
- **6 Metric Cards**:
  - Total hours worked across all employees
  - Hours gained (overtime)
  - Hours lost (undertime)
  - Lunch hours
  - Days off taken
  - Salary deductions
- **Currency Toggle**: Switch between ₲ PYG and $ USD
- **Employee Table**: See detailed metrics per employee

### 🏖️ Días Libres Tab
- **Click "+ Agregar Día Libre"**: Add a day off
- **Fill form**:
  - Select employee
  - Choose date
  - Pick type (vacation, sick leave, personal, unpaid, holiday)
  - Mark as paid/unpaid
  - Add optional reason
- **See table**: All recorded days off with deductions

## 🔧 Common Issues

### "Cannot find module '@inploy/shared'"
Build the shared package first:
```bash
cd packages/shared
npm run build
cd ../..
```

### Port 8081 already in use
Kill existing process:
```bash
lsof -ti:8081 | xargs kill -9
```

### Docker won't start
Check if Docker Desktop is running, or use [Supabase](https://supabase.com) (free PostgreSQL hosting):
1. Create a Supabase project
2. Get connection string
3. Update `DATABASE_URL` in `.env`

### pnpm not working
Use npm instead - all instructions in [QUICK_START.md](./QUICK_START.md) use npm/npx.

## 📚 Documentation

- **[QUICK_START.md](./QUICK_START.md)** - Detailed step-by-step installation
- **[FEATURES.md](./FEATURES.md)** - Complete feature documentation (API, database schema, architecture)
- **[README.md](./README.md)** - Project overview

## 🎨 Technology Stack

**Frontend**:
- React 18 + TypeScript 5
- Expo 50+ (web-only)
- React Query 5 (server state)
- Zustand 4 (client state)

**Backend**:
- Node.js 20 + Express 4
- Prisma 5 ORM
- PostgreSQL 15+
- Clerk SDK

**Key Features**:
- Color-coded state machine UI
- Web Speech API for TTS
- Real-time metrics
- Configurable salary deductions

## 💡 Pro Tips

1. **Start with Option 1** to see the UI immediately
2. **Sample data included**: 3 employees with realistic data after seeding
3. **No Clerk required**: App works fine without authentication for testing
4. **Check console**: Backend logs show all check-in events in real-time
5. **Try invalid states**: Click Salida without Entrada - you'll get an error (as designed!)

## 🚢 Next Steps After Testing

1. **Customize**: Edit employee data in admin dashboard
2. **Add features**: See FEATURES.md for enhancement ideas
3. **Deploy**: Use Railway, Render, or Vercel (instructions in README.md)
4. **Mobile**: Run `npx expo start` and scan QR code with Expo Go app

## 🆘 Need Help?

1. Check [QUICK_START.md](./QUICK_START.md) troubleshooting section
2. Review [FEATURES.md](./FEATURES.md) for technical details
3. Inspect browser console for frontend errors
4. Check backend terminal for API errors

---

**Ready to start?** Pick an option above and run the commands! 🚀

The app is designed to be run immediately - no complex configuration needed for basic testing.
