-- Enable UUID generation
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. SETTINGS TABLE
CREATE TABLE settings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  working_hours_start TIME NOT NULL DEFAULT '09:00:00',
  working_hours_end TIME NOT NULL DEFAULT '18:00:00',
  timezone VARCHAR(50) NOT NULL DEFAULT 'Asia/Kolkata',
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Ensure only one settings row exists
CREATE UNIQUE INDEX ensure_single_settings_row ON settings ((true));

-- 2. SERVICE TIERS TABLE
CREATE TABLE service_tiers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title VARCHAR(255) NOT NULL,
  description TEXT,
  duration_minutes INTEGER NOT NULL,
  price_inr NUMERIC(10, 2) NOT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. BOOKINGS TABLE
CREATE TYPE booking_status AS ENUM ('held', 'pending', 'confirmed', 'completed', 'cancelled');

CREATE TABLE bookings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  client_id UUID NOT NULL, -- Ties to auth.users if logged in, or anonymous tracking ID
  service_tier_id UUID NOT NULL REFERENCES service_tiers(id),
  start_time TIMESTAMPTZ NOT NULL,
  end_time TIMESTAMPTZ NOT NULL,
  status booking_status NOT NULL DEFAULT 'held',
  held_until TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT valid_time_range CHECK (end_time > start_time)
);

-- Index to quickly query overlapping or active bookings
CREATE INDEX idx_bookings_active_time ON bookings (start_time, end_time) WHERE status IN ('held', 'pending', 'confirmed');

-- 4. PORTFOLIO ASSETS TABLE
CREATE TABLE portfolio_assets (
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

-- 5. ATOMIC CONCURRENCY CONTROL (hold_slot RPC)
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


-- 6. ROW LEVEL SECURITY (RLS) POLICIES
ALTER TABLE settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE service_tiers ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE portfolio_assets ENABLE ROW LEVEL SECURITY;

-- Settings: Anyone can read
CREATE POLICY "Public read settings" ON settings FOR SELECT USING (true);

-- Service Tiers: Anyone can read active services
CREATE POLICY "Public read active services" ON service_tiers FOR SELECT USING (is_active = true);

-- Portfolio Assets: Anyone can read active assets
CREATE POLICY "Public read active portfolio assets" ON portfolio_assets FOR SELECT USING (is_active = true);

-- Bookings: 
-- Anyone can INSERT a hold (since unauthenticated users can start the checkout flow)
-- They can SELECT their own booking using their client_id
CREATE POLICY "Public insert booking holds" ON bookings FOR INSERT WITH CHECK (status = 'held');
CREATE POLICY "Clients can view their own bookings" ON bookings FOR SELECT USING (client_id = auth.uid() OR client_id = current_setting('request.jwt.claims', true)::jsonb->>'client_id'::UUID);

-- Admin Bypass (Assuming admin role or JWT claim 'is_admin' is set)
-- (In a real app, bind this to auth.users and a specific admin condition)
CREATE POLICY "Admin full access" ON bookings FOR ALL USING (auth.jwt()->>'role' = 'admin');
