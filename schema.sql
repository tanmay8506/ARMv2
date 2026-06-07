-- Enable UUID generation
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. PROFILES TABLE (linked to Supabase auth.users)
CREATE TABLE IF NOT EXISTS profiles (
  id          UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  first_name  TEXT NOT NULL DEFAULT '',
  last_name   TEXT NOT NULL DEFAULT '',
  phone       TEXT,
  role        TEXT NOT NULL DEFAULT 'client' CHECK (role IN ('client', 'admin')),
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Auto-create profile on new user signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (id, first_name, last_name)
  VALUES (NEW.id, '', '');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- 2. SETTINGS TABLE
CREATE TABLE IF NOT EXISTS settings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  working_hours_start TIME NOT NULL DEFAULT '09:00:00',
  working_hours_end TIME NOT NULL DEFAULT '18:00:00',
  timezone VARCHAR(50) NOT NULL DEFAULT 'Asia/Kolkata',
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Ensure only one settings row exists
CREATE UNIQUE INDEX IF NOT EXISTS ensure_single_settings_row ON settings ((true));

-- 3. SERVICE TIERS TABLE
CREATE TABLE IF NOT EXISTS service_tiers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title VARCHAR(255) NOT NULL,
  description TEXT,
  duration_minutes INTEGER NOT NULL,
  price_inr NUMERIC(10, 2) NOT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. BOOKINGS TABLE
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'booking_status') THEN
        CREATE TYPE booking_status AS ENUM ('held', 'pending', 'confirmed', 'completed', 'cancelled');
    END IF;
END$$;

CREATE TABLE IF NOT EXISTS bookings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  client_id UUID NOT NULL, -- Ties to auth.users if logged in, or anonymous tracking ID
  service_tier_id UUID NOT NULL REFERENCES service_tiers(id),
  start_time TIMESTAMPTZ NOT NULL,
  end_time TIMESTAMPTZ NOT NULL,
  status booking_status NOT NULL DEFAULT 'held',
  held_until TIMESTAMPTZ,
  client_name VARCHAR(255),
  client_email VARCHAR(255),
  client_phone VARCHAR(50),
  notes TEXT,
  admin_notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT valid_time_range CHECK (end_time > start_time)
);

-- Index to quickly query overlapping or active bookings
CREATE INDEX IF NOT EXISTS idx_bookings_active_time ON bookings (start_time, end_time) WHERE status IN ('held', 'pending', 'confirmed');

-- 5. PORTFOLIO ASSETS TABLE
CREATE TABLE IF NOT EXISTS portfolio_assets (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title VARCHAR(255) NOT NULL,
  category VARCHAR(100) NOT NULL,
  cloudinary_path VARCHAR(500) NOT NULL,
  width INTEGER NOT NULL,
  height INTEGER NOT NULL,
  display_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. ATOMIC CONCURRENCY CONTROL (hold_slot RPC)
-- This function prevents double-bookings by executing checks and inserts atomically
CREATE OR REPLACE FUNCTION hold_slot(
  p_client_id UUID,
  p_service_tier_id UUID,
  p_start_time TIMESTAMPTZ,
  p_end_time TIMESTAMPTZ,
  p_hold_duration INTERVAL DEFAULT INTERVAL '15 minutes'
) RETURNS UUID AS $$
DECLARE
  v_booking_id UUID;
  v_overlapping_count INTEGER;
BEGIN
  -- Step 1: Clean up any expired holds globally to free up slots
  DELETE FROM bookings 
  WHERE status = 'held' AND held_until < NOW();

  -- Step 2: Check for overlapping active or held bookings
  SELECT COUNT(*) INTO v_overlapping_count
  FROM bookings
  WHERE status IN ('held', 'pending', 'confirmed')
    AND start_time < p_end_time
    AND end_time > p_start_time;

  -- Step 3: If overlap exists, abort transaction
  IF v_overlapping_count > 0 THEN
    RAISE EXCEPTION 'Slot is already taken or held by another user.' USING ERRCODE = 'unique_violation';
  END IF;

  -- Step 4: Insert the hold securely
  INSERT INTO bookings (client_id, service_tier_id, start_time, end_time, status, held_until)
  VALUES (p_client_id, p_service_tier_id, p_start_time, p_end_time, 'held', NOW() + p_hold_duration)
  RETURNING id INTO v_booking_id;

  RETURN v_booking_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


-- 7. ROW LEVEL SECURITY (RLS) POLICIES
ALTER TABLE settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE service_tiers ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE portfolio_assets ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Helper function to check admin role
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid() AND role = 'admin'
  );
$$ LANGUAGE sql SECURITY DEFINER;

-- Profiles: users see own, admins see all
CREATE POLICY "profiles_own" ON profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "profiles_own_update" ON profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "profiles_admin" ON profiles FOR ALL USING (is_admin());

-- Settings: Anyone can read, admin writes
CREATE POLICY "Public read settings" ON settings FOR SELECT USING (true);
CREATE POLICY "Admin full access settings" ON settings FOR ALL USING (is_admin());

-- Service Tiers: Anyone can read active services, admin writes
CREATE POLICY "Public read active services" ON service_tiers FOR SELECT USING (is_active = true);
CREATE POLICY "Admin full access tiers" ON service_tiers FOR ALL USING (is_admin());

-- Portfolio Assets: Anyone can read active assets, admin writes
CREATE POLICY "Public read active portfolio assets" ON portfolio_assets FOR SELECT USING (is_active = true);
CREATE POLICY "Admin full access portfolio" ON portfolio_assets FOR ALL USING (is_admin());

-- Bookings: 
-- Anyone can INSERT a hold (since unauthenticated users can start the checkout flow)
-- They can SELECT their own booking using their client_id OR their email address (linked to their auth.jwt())
CREATE POLICY "Public insert booking holds" ON bookings FOR INSERT WITH CHECK (status = 'held');
CREATE POLICY "Clients can view their own bookings" ON bookings FOR SELECT USING (
  client_id = auth.uid() OR 
  client_email = auth.jwt()->>'email'
);
CREATE POLICY "Admin full access bookings" ON bookings FOR ALL USING (is_admin());
