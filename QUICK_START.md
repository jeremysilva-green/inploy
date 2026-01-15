# 🚀 Quick Start - Run InPloy Now!

## Option 1: Using npm (No pnpm required)

Since you don't have pnpm installed, you can use npm directly:

### Step 1: Install Dependencies

```bash
cd /Users/jeremy/InPloy

# Install root dependencies
npm install

# Install shared package dependencies
cd packages/shared
npm install
cd ../..

# Install server dependencies
cd packages/server
npm install
cd ../..

# Install web dependencies
cd packages/web
npm install
cd ../..
```

### Step 2: Set Up Environment Variables

```bash
# Copy the example file
cp .env.example .env

# Edit with your Clerk keys (you can skip this for now to test without auth)
# For now, we'll run without authentication
```

### Step 3: Start PostgreSQL Database

**Option A: Using Docker (Recommended)**
```bash
cd docker
docker-compose up postgres -d
cd ..
```

**Option B: Skip database for frontend-only testing**
If you just want to see the UI without the backend:
- Skip to Step 5 below

### Step 4: Set Up Database (if using Docker)

```bash
cd packages/server

# Generate Prisma client
npx prisma generate

# Run migrations
npx prisma migrate dev

# Seed sample data
npx tsx prisma/seed.ts

cd ../..
```

### Step 5: Start the Frontend (Web App)

```bash
cd packages/web

# Start Expo web server
npx expo start --web
```

The app will open at **http://localhost:8081**

### Step 6: (Optional) Start the Backend

In a **new terminal window**:

```bash
cd /Users/jeremy/InPloy/packages/server

# Start the API server
npm run dev
```

The API will run at **http://localhost:3000**

---

## Option 2: Install pnpm first

If you want to use the recommended setup:

```bash
# Install pnpm using npm
sudo npm install -g pnpm

# Then follow the original instructions
cd /Users/jeremy/InPloy
pnpm install
pnpm migrate:dev
pnpm db:seed
pnpm dev:web
```

---

## 🎯 What You'll See

### Frontend Only (without backend)
- You'll see the UI and navigation
- Check-in buttons will show but won't work (no API)
- Good for testing the interface design

### With Backend Running
- Full functionality
- Check-in buttons work
- Real-time updates
- Sample employers: Juan, María, Carlos

---

## 🔧 Troubleshooting

### "Cannot find module '@inploy/shared'"

The shared package needs to be built first:

```bash
cd packages/shared
npm run build
cd ../..
```

### "Expo command not found"

Install Expo CLI:

```bash
cd packages/web
npm install
```

### Port 8081 already in use

Kill the process:

```bash
lsof -ti:8081 | xargs kill -9
```

---

## 📱 Testing the App

Once running at http://localhost:8081:

1. **Check-in Tab** (📋):
   - See employer list
   - Try clicking buttons (if backend is running)
   - Listen for voice greeting

2. **Dashboard Tab** (📊):
   - View metrics cards
   - Toggle currency (₲ PYG / $ USD)
   - See employer management table

3. **Days Off Tab** (🏖️):
   - Click "+ Agregar Día Libre"
   - Fill out the form
   - See the days off table

---

## 🚀 Next Steps

After you get it running:
1. Sign up for Clerk at https://clerk.com (free)
2. Get your API keys
3. Add them to `.env`
4. Restart the servers
5. Full authentication will work!

---

**Need help? The web app should start at http://localhost:8081 once you run `npx expo start --web` in the packages/web folder!**
