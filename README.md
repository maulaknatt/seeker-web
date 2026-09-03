# Secure Location Sharing (Refactored Seeker Web App)

A modern, full-stack, consent-first location-sharing web application built with **Next.js 14**, **TypeScript**, **Tailwind CSS**, **Framer Motion**, and **Leaflet Maps**.

This repository is a **Total Architecture Refactor** of the original CLI-based `seeker` tool. It completely eliminates all Linux-specific scripts, terminal interfaces, PHP servers, Flask handlers, and third-party tunneling tools (like ngrok). It transforms the project into a production-grade, Vercel-ready Web Application designed for **explicit consent location sharing**.

---

## 🚀 Key Features

* **Consent-First Security Model**: Zero background tracking or stealth data capture. Locations are only retrieved after a recipient explicitly clicks `"Allow & Share Location"`.
* **Zero Dependency on Linux**: Runs natively on **Windows**, macOS, and Linux using standard Node.js without WSL, Docker, `install.sh`, `chmod`, `apt`, or Python.
* **Vercel Serverless Ready**: Native deployment to Vercel HTTPS without ngrok or persistent socket daemons.
* **Interactive Live Map**: Real-time Leaflet + OpenStreetMap rendering with precision accuracy rings and custom pulse markers.
* **Automatic Session Expiration**: Sessions automatically purge and deactivate after a configurable duration (15 minutes, 1 hour, 24 hours, or custom).
* **Dual Database Architecture**: Seamlessly runs out-of-the-box using local memory storage during development, with full **Supabase PostgreSQL** support for production.

---

## 🛠️ Tech Stack

* **Frontend**: Next.js 14 (App Router), React 18, TypeScript, Tailwind CSS, Lucide Icons, Framer Motion.
* **Mapping**: Leaflet JS & OpenStreetMap with CartoDB dark tile theme.
* **Backend**: Next.js API Routes (Edge/Serverless compatible).
* **Database**: Supabase PostgreSQL (Production) / In-Memory Store Abstraction (Development).
* **Deployment Target**: Vercel (HTTPS domain).

---

## 💻 Windows Quickstart & Installation

Developing on Windows requires no WSL, Ubuntu, or bash scripts.

### Prerequisites
* **Node.js**: v18.x or v20.x+ (LTS) installed on Windows.
* **npm**: v9.x or v10.x+.

### Steps

```powershell
# 1. Clone the repository
git clone https://github.com/thewhiteh4t/seeker.git
cd seeker

# 2. Install dependencies
npm install

# 3. Copy environment variables (optional for local dev)
copy .env.example .env.local

# 4. Start local development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## ⚙️ Environment Variables

Copy `.env.example` to `.env.local`:

```env
# Application URL
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Supabase Configuration (Optional for local dev, recommended for production Vercel deployment)
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# Map Provider
NEXT_PUBLIC_MAP_PROVIDER=openstreetmap
```

---

## 🗄️ Database Setup (Supabase PostgreSQL)

For production deployment on Vercel, execute the following SQL in your Supabase SQL Editor:

```sql
-- Create sessions table
CREATE TABLE IF NOT EXISTS public.sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_code TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ NOT NULL,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'expired', 'ended'))
);

-- Create locations table
CREATE TABLE IF NOT EXISTS public.locations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID REFERENCES public.sessions(id) ON DELETE CASCADE,
  latitude DOUBLE PRECISION NOT NULL,
  longitude DOUBLE PRECISION NOT NULL,
  accuracy DOUBLE PRECISION NOT NULL,
  altitude DOUBLE PRECISION,
  speed DOUBLE PRECISION,
  timestamp BIGINT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create session_visitors table
CREATE TABLE IF NOT EXISTS public.session_visitors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID REFERENCES public.sessions(id) ON DELETE CASCADE,
  visitor_status TEXT NOT NULL,
  permission_status TEXT NOT NULL CHECK (permission_status IN ('prompt', 'granted', 'denied', 'error')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

---

## 🌐 Deploying to Vercel

1. Push your refactored repository to GitHub.
2. Import the project into your [Vercel Dashboard](https://vercel.com).
3. Add your `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` in Vercel's Environment Variables settings.
4. Click **Deploy**. Vercel will automatically issue a secure HTTPS domain (`https://your-app.vercel.app`), which enables native HTML5 Geolocation API functionality seamlessly without ngrok tunnels!

---

## 🛡️ Privacy & Security Architecture

1. **Explicit Permission Required**: `navigator.geolocation.getCurrentPosition()` is never executed on page load. It is only called when the user clicks `"Allow & Share Location"`.
2. **Zero Fingerprinting**: All legacy canvas fingerprinting, WebGL hardware scanning, and IP tracking scripts have been purged.
3. **HTTPS Secure Context**: HTML5 Geolocation APIs require a Secure Context (HTTPS or localhost). Vercel provides HTTPS out of the box.
4. **Data Minimization**: Coordinates are strictly linked to a temporary session ID and automatically purged upon session expiration.

---

## 📜 Scripts

* `npm run dev`: Starts Next.js development server at `http://localhost:3000`
* `npm run build`: Validates TypeScript strict mode and compiles Next.js production build
* `npm run start`: Starts production server
* `npm run lint`: Runs ESLint check
