-- Supabase Schema for Secure Location Sharing App

-- 1. Create sessions table
CREATE TABLE IF NOT EXISTS public.sessions (
  id UUID PRIMARY KEY,
  session_code TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  template_type TEXT NOT NULL DEFAULT 'custom',
  target_url TEXT,
  site_name TEXT,
  image_url TEXT,
  description TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  expires_at TIMESTAMPTZ NOT NULL,
  status TEXT NOT NULL DEFAULT 'active'
);

-- 2. Create locations table
CREATE TABLE IF NOT EXISTS public.locations (
  id UUID PRIMARY KEY,
  session_id UUID NOT NULL,
  latitude DOUBLE PRECISION NOT NULL,
  longitude DOUBLE PRECISION NOT NULL,
  accuracy DOUBLE PRECISION NOT NULL DEFAULT 0,
  altitude DOUBLE PRECISION,
  speed DOUBLE PRECISION,
  timestamp BIGINT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3. Create session_visitors table
CREATE TABLE IF NOT EXISTS public.session_visitors (
  id UUID PRIMARY KEY,
  session_id UUID NOT NULL,
  visitor_status TEXT NOT NULL DEFAULT 'visited',
  permission_status TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 4. Enable Row Level Security (RLS) & Add Public Access Policies
ALTER TABLE public.sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.locations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.session_visitors ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read/write to sessions" ON public.sessions FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow public read/write to locations" ON public.locations FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow public read/write to session_visitors" ON public.session_visitors FOR ALL USING (true) WITH CHECK (true);
