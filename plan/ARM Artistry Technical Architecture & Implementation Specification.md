# ARM Artistry — Technical Architecture & Implementation Specification

**Version:** 3.0 — Free Stack
**Date:** June 5, 2026

---

## 1. Locked Dependencies

```json
{
  "next": "14.2.x",
  "react": "18.x",
  "typescript": "5.x",
  "@supabase/supabase-js": "^2.43.0",
  "@supabase/ssr": "^0.3.0",
  "resend": "^3.2.0",
  "gsap": "^3.12.0",
  "lenis": "^1.1.0",
  "react-hook-form": "^7.51.0",
  "zod": "^3.23.0",
  "@hookform/resolvers": "^3.3.0",
  "tailwindcss": "^3.4.0",
  "date-fns-tz": "^3.1.0"
}
```

---

## 2. Supabase Setup (One-Time, ~10 Minutes)

### Step 1: Create Project
1. Go to [supabase.com](https://supabase.com) → New Project
2. Name: `arm-artistry`
3. Region: **South Asia (Mumbai)** — lowest latency for Indian users
4. Generate a strong DB password and save it

### Step 2: Run Schema SQL

Go to **Supabase Dashboard → SQL Editor → New Query** and paste this entire block:

```sql
-- Enable UUID generation
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Profiles table (linked to Supabase auth)
CREATE TABLE profiles (
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

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Services
CREATE TABLE services (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name        TEXT NOT NULL UNIQUE,
  description TEXT NOT NULL,
  category    TEXT NOT NULL,
  is_active   BOOLEAN NOT NULL DEFAULT TRUE,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Service tiers
CREATE TABLE service_tiers (
  id               UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  service_id       UUID NOT NULL REFERENCES services(id) ON DELETE CASCADE,
  tier_name        TEXT NOT NULL,
  base_price       INTEGER NOT NULL, -- In paise (e.g., 2100000 = ₹21,000)
  duration_minutes INTEGER NOT NULL, -- CRITICAL: used to calculate end_time
  description      TEXT,
  is_active        BOOLEAN NOT NULL DEFAULT TRUE,
  UNIQUE(service_id, tier_name)
);

-- Bookings
CREATE TABLE bookings (
  id               UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  client_id        UUID NOT NULL REFERENCES profiles(id),
  service_tier_id  UUID NOT NULL REFERENCES service_tiers(id),
  start_time       TIMESTAMPTZ NOT NULL,
  end_time         TIMESTAMPTZ NOT NULL,
  estimated_total  INTEGER NOT NULL, -- Snapshot of price at time of booking
  status           TEXT NOT NULL DEFAULT 'held'
                   CHECK (status IN ('held','pending','confirmed','completed','cancelled')),
  held_until       TIMESTAMPTZ, -- 15 min from hold creation, null after confirmation
  notes            TEXT,
  admin_notes      TEXT,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Portfolio
CREATE TABLE portfolio_assets (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title         TEXT NOT NULL,
  description   TEXT,
  image_url     TEXT NOT NULL,
  thumbnail_url TEXT,
  width         INTEGER, -- For CLS prevention on frontend
  height        INTEGER, -- For CLS prevention on frontend
  category      TEXT NOT NULL,
  display_order INTEGER NOT NULL DEFAULT 0,
  is_active     BOOLEAN NOT NULL DEFAULT TRUE,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Settings (working hours, blocked dates, etc.)
CREATE TABLE settings (
  key         TEXT PRIMARY KEY,
  value       JSONB NOT NULL,
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Seed default working hours
INSERT INTO settings (key, value) VALUES (
  'working_hours',
  '{
    "workingDays": [1,2,3,4,5,6],
    "startHour": 9, "startMinute": 0,
    "endHour": 19, "endMinute": 0,
    "bufferMinutes": 30,
    "timezone": "Asia/Kolkata",
    "blockedDates": []
  }'::jsonb
);

-- ─── ROW LEVEL SECURITY ─────────────────────────────────────────────
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE portfolio_assets ENABLE ROW LEVEL SECURITY;
ALTER TABLE services ENABLE ROW LEVEL SECURITY;
ALTER TABLE service_tiers ENABLE ROW LEVEL SECURITY;
ALTER TABLE settings ENABLE ROW LEVEL SECURITY;

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

-- Bookings: clients see own, admins see all
CREATE POLICY "bookings_own" ON bookings FOR SELECT USING (auth.uid() = client_id);
CREATE POLICY "bookings_insert" ON bookings FOR INSERT WITH CHECK (auth.uid() = client_id);
CREATE POLICY "bookings_admin" ON bookings FOR ALL USING (is_admin());

-- Portfolio: public read, admin write
CREATE POLICY "portfolio_public_read" ON portfolio_assets FOR SELECT USING (is_active = TRUE);
CREATE POLICY "portfolio_admin_write" ON portfolio_assets FOR ALL USING (is_admin());

-- Services: public read, admin write
CREATE POLICY "services_public_read" ON services FOR SELECT USING (is_active = TRUE);
CREATE POLICY "services_admin_write" ON services FOR ALL USING (is_admin());
CREATE POLICY "tiers_public_read" ON service_tiers FOR SELECT USING (is_active = TRUE);
CREATE POLICY "tiers_admin_write" ON service_tiers FOR ALL USING (is_admin());

-- Settings: admin only
CREATE POLICY "settings_admin" ON settings FOR ALL USING (is_admin());

-- ─── ATOMIC HOLD STORED PROCEDURE ──────────────────────────────────
-- Wraps conflict-check + insert into a single locked transaction.
-- Eliminates the race condition where two clients can both read "slot free"
-- before either has written their hold.
CREATE OR REPLACE FUNCTION hold_slot(
  p_client_id       UUID,
  p_tier_id         UUID,
  p_start_time      TIMESTAMPTZ,
  p_end_time        TIMESTAMPTZ,
  p_estimated_total INTEGER
)
RETURNS JSON
LANGUAGE plpgsql
AS $$
DECLARE
  conflict_count INTEGER;
  new_booking_id UUID;
BEGIN
  -- Clean up expired holds
  UPDATE bookings SET status = 'cancelled'
  WHERE status = 'held' AND held_until < NOW();

  -- Release any existing hold this client holds (one hold at a time)
  UPDATE bookings SET status = 'cancelled'
  WHERE client_id = p_client_id AND status = 'held';

  -- Check for overlapping bookings — all inside one transaction
  SELECT COUNT(*) INTO conflict_count
  FROM bookings
  WHERE status NOT IN ('cancelled')
    AND start_time < p_end_time
    AND end_time   > p_start_time;

  IF conflict_count > 0 THEN
    RETURN json_build_object('success', false, 'error', 'SLOT_TAKEN');
  END IF;

  -- Insert atomically — if another transaction committed between the check
  -- and here, the unique index on the table will catch it
  INSERT INTO bookings (
    client_id, service_tier_id, start_time, end_time,
    estimated_total, status, held_until
  )
  VALUES (
    p_client_id, p_tier_id, p_start_time, p_end_time,
    p_estimated_total, 'held', NOW() + INTERVAL '15 minutes'
  )
  RETURNING id INTO new_booking_id;

  RETURN json_build_object('success', true, 'bookingId', new_booking_id);
END;
$$;
```

### Step 3: Create Admin User
1. **Supabase Dashboard → Authentication → Users → Add User**
2. Enter Ayushi's email and a strong password
3. Copy her user ID from the list
4. Run in SQL Editor:
```sql
UPDATE profiles SET role = 'admin' WHERE id = '<paste-user-id-here>';
```
Done. No scripts, no CLI.

### Step 4: Configure Auth
**Supabase Dashboard → Authentication → Settings:**
- Enable "Email" provider ✅
- Enable "Magic Link" ✅
- Site URL: `https://armartistry.vercel.app` (update after Vercel deploy)
- Additional redirect URLs: `http://localhost:3000`

---

## 3. Environment Variables

```env
# .env.local
NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...   # Server-only, never exposed to browser
RESEND_API_KEY=re_...
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=...
CLOUDINARY_API_SECRET=...
CRON_SECRET=any-random-string-you-make-up  # Protects the cron endpoint
```

---

## 4. Supabase Client Setup

```typescript
// src/lib/supabase/client.ts
// Use in Client Components ('use client')
import { createBrowserClient } from '@supabase/ssr';

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  );
}
```

```typescript
// src/lib/supabase/server.ts
// Use in Server Components and API Routes
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

export function createClient() {
  const cookieStore = cookies();
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => cookieStore.getAll(),
        setAll: (cookiesToSet) => {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options),
          );
        },
      },
    },
  );
}
```

```typescript
// src/lib/supabase/admin.ts
// Use ONLY in server-side API routes where you need to bypass RLS
import { createClient } from '@supabase/supabase-js';

export const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!, // Bypasses RLS — never expose to browser
);
```

---

## 5. API Routes (All Backend Logic)

### 5.1. Availability — `GET /api/availability`

```typescript
// src/app/api/availability/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { fromZonedTime } from 'date-fns-tz';

const IST = 'Asia/Kolkata';

export async function GET(request: NextRequest) {
  const date = request.nextUrl.searchParams.get('date'); // YYYY-MM-DD
  if (!date) return NextResponse.json({ error: 'date required' }, { status: 400 });

  const supabase = createClient();

  // Fetch working hours config
  const { data: settingsRow } = await supabase
    .from('settings')
    .select('value')
    .eq('key', 'working_hours')
    .single();

  const settings = settingsRow?.value;

  // Check if this date is a working day or blocked
  // NOTE: new Date(date) parses YYYY-MM-DD as UTC midnight — safe for day-of-week check
  const dayOfWeek = new Date(date + 'T00:00:00Z').getUTCDay();
  if (!settings.workingDays.includes(dayOfWeek) || settings.blockedDates.includes(date)) {
    return NextResponse.json({ date, availableSlots: [] });
  }

  // Use date-fns-tz fromZonedTime to convert IST working-hour boundaries to UTC.
  // This is timezone-safe: works identically on Vercel (UTC) and local Windows (IST).
  const dayStartUtc = fromZonedTime(
    `${date}T${String(settings.startHour).padStart(2,'0')}:${String(settings.startMinute).padStart(2,'0')}:00`,
    IST,
  );
  const dayEndUtc = fromZonedTime(
    `${date}T${String(settings.endHour).padStart(2,'0')}:${String(settings.endMinute).padStart(2,'0')}:00`,
    IST,
  );

  // Fetch all non-cancelled bookings that touch this day
  const { data: existingBookings } = await supabase
    .from('bookings')
    .select('start_time, end_time')
    .not('status', 'in', '("cancelled")')
    .gte('start_time', dayStartUtc.toISOString())
    .lte('start_time', dayEndUtc.toISOString());

  // Clean up expired holds (best-effort; RPC also does this atomically on hold)
  await supabase
    .from('bookings')
    .update({ status: 'cancelled' })
    .eq('status', 'held')
    .lt('held_until', new Date().toISOString());

  // Generate 30-min slots — all arithmetic in UTC milliseconds (no timezone risk)
  const slots: string[] = [];
  let cursor = new Date(dayStartUtc);

  while (cursor < dayEndUtc) {
    const slotUtc = cursor.toISOString();

    const isBooked = existingBookings?.some((b) => {
      const bStart = new Date(b.start_time).getTime();
      const bEnd   = new Date(b.end_time).getTime();
      const sStart = cursor.getTime();
      return sStart >= bStart && sStart < bEnd;
    });

    if (!isBooked) slots.push(slotUtc);
    cursor = new Date(cursor.getTime() + 30 * 60 * 1000);
  }

  return NextResponse.json({ date, availableSlots: slots });
}
```

### 5.2. Hold Slot — `POST /api/bookings/hold`

Uses the `hold_slot` stored procedure — all logic runs in a single atomic DB transaction, eliminating the race condition where two clients simultaneously read "slot free" before either writes.

```typescript
// src/app/api/bookings/hold/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { supabaseAdmin } from '@/lib/supabase/admin';

export async function POST(request: NextRequest) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { startTime, serviceTierId } = await request.json();

  // Reject any non-UTC datetime string
  if (!startTime?.endsWith('Z') && !startTime?.endsWith('+00:00')) {
    return NextResponse.json(
      { error: 'startTime must be a UTC ISO string ending in Z or +00:00' },
      { status: 400 },
    );
  }

  // Fetch tier to calculate end_time
  const { data: tier } = await supabaseAdmin
    .from('service_tiers')
    .select('duration_minutes, base_price')
    .eq('id', serviceTierId)
    .single();

  if (!tier) return NextResponse.json({ error: 'Service not found' }, { status: 404 });

  const start = new Date(startTime);
  const end   = new Date(start.getTime() + tier.duration_minutes * 60 * 1000);

  // Single RPC call — atomic check + insert inside one PostgreSQL transaction.
  // If Client A and Client B hit this simultaneously, PostgreSQL serialises them;
  // the second one will correctly see the first's hold and return SLOT_TAKEN.
  const { data, error } = await supabaseAdmin.rpc('hold_slot', {
    p_client_id:       user.id,
    p_tier_id:         serviceTierId,
    p_start_time:      start.toISOString(),
    p_end_time:        end.toISOString(),
    p_estimated_total: tier.base_price,
  });

  if (error) return NextResponse.json({ error: 'Failed to hold slot' }, { status: 500 });

  if (!data.success) {
    return NextResponse.json(
      { error: 'This slot was just taken. Please select another.' },
      { status: 409 },
    );
  }

  const heldUntil = new Date(Date.now() + 15 * 60 * 1000).toISOString();
  return NextResponse.json({ bookingId: data.bookingId, heldUntil });
}
```

### 5.3. Confirm Booking — `POST /api/bookings/confirm`

```typescript
// src/app/api/bookings/confirm/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { supabaseAdmin } from '@/lib/supabase/admin';
import { sendBookingEmails } from '@/lib/email';

export async function POST(request: NextRequest) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { bookingId, notes } = await request.json();

  // Fetch the hold — must belong to this client and not be expired
  const { data: booking } = await supabaseAdmin
    .from('bookings')
    .select('*, service_tiers(tier_name, base_price, duration_minutes, services(name))')
    .eq('id', bookingId)
    .eq('client_id', user.id)
    .eq('status', 'held')
    .single();

  if (!booking) {
    return NextResponse.json(
      { error: 'Hold not found or already expired. Please re-select a slot.' },
      { status: 410 },
    );
  }

  if (new Date(booking.held_until) < new Date()) {
    return NextResponse.json(
      { error: 'Your hold has expired. Please re-select a slot.' },
      { status: 410 },
    );
  }

  // Confirm the booking
  const { error } = await supabaseAdmin
    .from('bookings')
    .update({ status: 'pending', held_until: null, notes })
    .eq('id', bookingId);

  if (error) return NextResponse.json({ error: 'Failed to confirm' }, { status: 500 });

  // Fetch client profile for email
  const { data: profile } = await supabaseAdmin
    .from('profiles')
    .select('first_name, last_name')
    .eq('id', user.id)
    .single();

  // Fire emails (non-blocking — don't fail booking if email fails)
  sendBookingEmails({
    clientEmail: user.email!,
    clientName: `${profile?.first_name} ${profile?.last_name}`,
    serviceName: booking.service_tiers?.services?.name,
    tierName: booking.service_tiers?.tier_name,
    startTime: booking.start_time,
    estimatedTotal: booking.estimated_total,
  }).catch(console.error);

  return NextResponse.json({ success: true, bookingId });
}
```

### 5.4. Admin — Approve/Decline Booking

```typescript
// src/app/api/admin/bookings/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { supabaseAdmin } from '@/lib/supabase/admin';
import { sendConfirmationEmail, sendDeclineEmail } from '@/lib/email';

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } },
) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  // Check admin role
  const { data: profile } = await supabaseAdmin
    .from('profiles')
    .select('role')
    .eq('id', user?.id)
    .single();

  if (!user || profile?.role !== 'admin') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const { action, adminNotes } = await request.json(); // action: 'confirm' | 'decline'

  const newStatus = action === 'confirm' ? 'confirmed' : 'cancelled';

  const { data: booking } = await supabaseAdmin
    .from('bookings')
    .update({ status: newStatus, admin_notes: adminNotes })
    .eq('id', params.id)
    .select('*, profiles(first_name), auth_users:client_id(email)')
    .single();

  // Send appropriate email
  if (action === 'confirm') {
    await sendConfirmationEmail(booking).catch(console.error);
  } else {
    await sendDeclineEmail(booking).catch(console.error);
  }

  return NextResponse.json({ success: true });
}
```

### 5.5. Nightly Reminder Cron — `GET /api/cron/reminders`

```typescript
// src/app/api/cron/reminders/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/admin';
import { sendReminderEmail } from '@/lib/email';

// Vercel calls this endpoint on schedule (see vercel.json)
export async function GET(request: NextRequest) {
  // Protect the cron endpoint
  if (request.headers.get('authorization') !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Find all confirmed bookings starting tomorrow (IST)
  const tomorrowStart = new Date();
  tomorrowStart.setDate(tomorrowStart.getDate() + 1);
  tomorrowStart.setHours(0, 0, 0, 0);

  const tomorrowEnd = new Date(tomorrowStart);
  tomorrowEnd.setHours(23, 59, 59, 999);

  const { data: bookings } = await supabaseAdmin
    .from('bookings')
    .select('*, profiles(first_name, last_name), service_tiers(tier_name, services(name))')
    .eq('status', 'confirmed')
    .gte('start_time', tomorrowStart.toISOString())
    .lte('start_time', tomorrowEnd.toISOString());

  for (const booking of bookings ?? []) {
    await sendReminderEmail(booking).catch(console.error);
  }

  return NextResponse.json({ sent: bookings?.length ?? 0 });
}
```

```json
// vercel.json — schedule the cron
{
  "crons": [
    {
      "path": "/api/cron/reminders",
      "schedule": "0 18 * * *"
    }
  ]
}
```

---

## 6. Email Module (Resend)

```typescript
// src/lib/email.ts
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

const ADMIN_EMAIL = 'ayushiraimua@gmail.com';
const FROM_EMAIL = 'ARM Artistry <noreply@armartistry.com>';

// ─── FORMAT HELPERS ─────────────────────────────────────────────────
function formatDate(utcIso: string) {
  return new Intl.DateTimeFormat('en-IN', {
    timeZone: 'Asia/Kolkata',
    dateStyle: 'long',
    timeStyle: 'short',
  }).format(new Date(utcIso));
}

function formatPrice(paise: number) {
  return `₹${(paise / 100).toLocaleString('en-IN')}`;
}

// ─── EMAIL 1: Admin Notification (New Booking) ───────────────────────
// Dark luxury card — matches your existing EmailJS template exactly
export async function sendBookingEmails(data: {
  clientEmail: string;
  clientName: string;
  serviceName: string;
  tierName: string;
  startTime: string;
  estimatedTotal: number;
}) {
  const formattedDate = formatDate(data.startTime);
  const formattedPrice = formatPrice(data.estimatedTotal);

  // To Ayushi — dark luxury admin card
  await resend.emails.send({
    from: FROM_EMAIL,
    to: ADMIN_EMAIL,
    subject: `New Booking Request — ${data.serviceName} | ${data.clientName}`,
    html: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <style>
    body { margin: 0; padding: 0; background: #f0ede4; font-family: Georgia, serif; }
    .wrapper { padding: 40px 20px; }
    .card { max-width: 600px; margin: 0 auto; display: flex; border-radius: 12px; overflow: hidden; box-shadow: 0 8px 40px rgba(0,0,0,0.15); }
    .left { background: #1a1414; padding: 40px 32px; width: 200px; flex-shrink: 0; display: flex; flex-direction: column; align-items: center; justify-content: center; }
    .logo { color: #D4AF37; font-size: 28px; font-weight: bold; letter-spacing: 6px; text-align: center; }
    .logo-sub { color: #9a8a7a; font-size: 9px; letter-spacing: 4px; text-align: center; margin-top: 4px; }
    .logo-divider { width: 40px; height: 1px; background: #D4AF37; margin: 16px auto; }
    .label-small { color: #9a8a7a; font-size: 9px; letter-spacing: 3px; text-align: center; text-transform: uppercase; line-height: 1.6; }
    .right { background: #faf8f4; padding: 40px 32px; flex: 1; }
    .field-label { color: #9a8a7a; font-size: 9px; letter-spacing: 2px; text-transform: uppercase; margin-bottom: 4px; }
    .field-value { color: #1a1a1a; font-size: 18px; margin-bottom: 20px; }
    .field-value-large { color: #1a1a1a; font-size: 22px; font-weight: bold; margin-bottom: 20px; }
    .row { display: flex; gap: 24px; }
    .col { flex: 1; }
    .price { color: #1a1a1a; font-size: 18px; font-weight: bold; }
  </style>
</head>
<body>
  <div class="wrapper">
    <div class="card">
      <div class="left">
        <div class="logo">ARM</div>
        <div class="logo-sub">A R T I S T R Y</div>
        <div class="logo-divider"></div>
        <div class="label-small">NEW<br>BOOKING<br>REQUEST</div>
        <div class="logo-divider"></div>
        <div class="label-small" style="font-size:8px;">By Appointment</div>
      </div>
      <div class="right">
        <div class="field-label">CLIENT</div>
        <div class="field-value-large">${data.clientName}</div>

        <div class="row">
          <div class="col">
            <div class="field-label">SERVICE</div>
            <div class="field-value">${data.serviceName}<br><span style="font-size:14px;color:#666;">${data.tierName}</span></div>
          </div>
          <div class="col">
            <div class="field-label">DATE & TIME</div>
            <div class="field-value" style="font-size:14px;">${formattedDate}</div>
          </div>
        </div>

        <div class="row">
          <div class="col">
            <div class="field-label">EMAIL ADDRESS</div>
            <div class="field-value" style="font-size:14px;">${data.clientEmail}</div>
          </div>
          <div class="col">
            <div class="field-label">ESTIMATED TOTAL</div>
            <div class="price">${formattedPrice}</div>
          </div>
        </div>
      </div>
    </div>
  </div>
</body>
</html>`,
  });

  // To Client — clean warm confirmation
  await resend.emails.send({
    from: FROM_EMAIL,
    to: data.clientEmail,
    subject: 'We received your booking request — ARM Artistry ✨',
    html: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { margin: 0; padding: 0; background: #f0ede4; font-family: Georgia, serif; }
    .wrapper { max-width: 500px; margin: 0 auto; padding: 48px 24px; }
    .card { background: #faf8f4; border-radius: 12px; padding: 48px 40px; }
    h1 { color: #1a1a1a; font-size: 24px; margin: 0 0 16px; }
    p { color: #555; font-size: 15px; line-height: 1.7; margin: 0 0 16px; }
    .service { color: #1a1a1a; font-weight: bold; }
    .sign { color: #C97B4A; font-style: italic; }
  </style>
</head>
<body>
  <div class="wrapper">
    <div class="card">
      <h1>Thank you, ${data.clientName.split(' ')[0]}! 💅</h1>
      <p>We've received your booking request for <span class="service">${data.serviceName} (${data.tierName})</span> on <strong>${formattedDate}</strong>.</p>
      <p>Ayushi will review your request and get back to you within <strong>48 hours</strong> to confirm your session details and availability.</p>
      <p>If you have any urgent questions, feel free to reply to this email.</p>
      <br>
      <p>With love,<br><span class="sign">ARM Artistry Team</span></p>
    </div>
  </div>
</body>
</html>`,
  });
}

// ─── EMAIL 2: Booking Confirmed (by Ayushi) ──────────────────────────
export async function sendConfirmationEmail(booking: any) {
  await resend.emails.send({
    from: FROM_EMAIL,
    to: booking.client_email,
    subject: 'Your booking is confirmed — ARM Artistry 🎉',
    html: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { margin:0; padding:0; background:#f0ede4; font-family:Georgia,serif; }
    .wrapper { max-width:500px; margin:0 auto; padding:48px 24px; }
    .card { background:#1a1414; border-radius:12px; padding:48px 40px; }
    h1 { color:#D4AF37; font-size:24px; margin:0 0 16px; }
    p { color:#c8b8a8; font-size:15px; line-height:1.7; margin:0 0 16px; }
    .detail { background:#2a1f1f; border-radius:8px; padding:20px 24px; margin:24px 0; }
    .label { color:#9a8a7a; font-size:10px; letter-spacing:2px; text-transform:uppercase; }
    .value { color:#f5f5dc; font-size:16px; margin-top:4px; margin-bottom:16px; }
    .gold { color:#D4AF37; }
  </style>
</head>
<body>
  <div class="wrapper">
    <div class="card">
      <h1>You're confirmed! 🎉</h1>
      <p>Ayushi is looking forward to creating something beautiful with you.</p>
      <div class="detail">
        <div class="label">Service</div>
        <div class="value">${booking.service_name} — ${booking.tier_name}</div>
        <div class="label">Date & Time</div>
        <div class="value">${formatDate(booking.start_time)}</div>
        <div class="label">Estimated Total</div>
        <div class="value gold">${formatPrice(booking.estimated_total)}</div>
      </div>
      <p>Please arrive 10 minutes early. If you need to reschedule, reply to this email at least 48 hours in advance.</p>
      <p style="color:#D4AF37; font-style:italic;">See you soon,<br>ARM Artistry</p>
    </div>
  </div>
</body>
</html>`,
  });
}

// ─── EMAIL 3: 24h Reminder ───────────────────────────────────────────
export async function sendReminderEmail(booking: any) {
  await resend.emails.send({
    from: FROM_EMAIL,
    to: booking.client_email,
    subject: 'Your ARM Artistry appointment is tomorrow ✨',
    html: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { margin:0; padding:0; background:#f0ede4; font-family:Georgia,serif; }
    .wrapper { max-width:500px; margin:0 auto; padding:48px 24px; }
    .card { background:#faf8f4; border-radius:12px; padding:48px 40px; }
    h1 { color:#1a1a1a; font-size:24px; margin:0 0 16px; }
    p { color:#555; font-size:15px; line-height:1.7; margin:0 0 16px; }
    .detail { background:#f0ede4; border-radius:8px; padding:20px 24px; margin:24px 0; }
    .label { color:#9a8a7a; font-size:10px; letter-spacing:2px; text-transform:uppercase; }
    .value { color:#1a1a1a; font-size:16px; margin-top:4px; margin-bottom:16px; font-weight:bold; }
    .sign { color:#C97B4A; font-style:italic; }
  </style>
</head>
<body>
  <div class="wrapper">
    <div class="card">
      <h1>See you tomorrow! 💄</h1>
      <p>Just a friendly reminder about your appointment with Ayushi at ARM Artistry.</p>
      <div class="detail">
        <div class="label">Service</div>
        <div class="value">${booking.service_name}</div>
        <div class="label">Date & Time</div>
        <div class="value">${formatDate(booking.start_time)}</div>
      </div>
      <p>Please arrive 10 minutes early and come with a clean, moisturised face. Can't wait to see you!</p>
      <p>With love,<br><span class="sign">ARM Artistry Team</span></p>
    </div>
  </div>
</body>
</html>`,
  });
}

// ─── EMAIL 4: Decline ────────────────────────────────────────────────
export async function sendDeclineEmail(booking: any) {
  await resend.emails.send({
    from: FROM_EMAIL,
    to: booking.client_email,
    subject: 'Regarding your ARM Artistry booking request',
    html: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { margin:0; padding:0; background:#f0ede4; font-family:Georgia,serif; }
    .wrapper { max-width:500px; margin:0 auto; padding:48px 24px; }
    .card { background:#faf8f4; border-radius:12px; padding:48px 40px; }
    h1 { color:#1a1a1a; font-size:24px; margin:0 0 16px; }
    p { color:#555; font-size:15px; line-height:1.7; margin:0 0 16px; }
    .sign { color:#C97B4A; font-style:italic; }
    .cta { display:inline-block; margin-top:8px; padding:12px 28px; background:#D4AF37; color:#1a1a1a; text-decoration:none; border-radius:4px; font-size:14px; }
  </style>
</head>
<body>
  <div class="wrapper">
    <div class="card">
      <h1>A note from ARM Artistry</h1>
      <p>Thank you so much for your interest. Unfortunately, Ayushi is unable to accommodate your request for the selected date and service.</p>
      <p>We'd love to find another time that works for you. Please visit the booking page to explore other available slots.</p>
      <a href="https://armartistry.com/booking" class="cta">View Available Slots</a>
      <br><br>
      <p>With love,<br><span class="sign">ARM Artistry Team</span></p>
    </div>
  </div>
</body>
</html>`,
  });
}
```

---

## 7. Auth Middleware (Protect Routes)

```typescript
// src/middleware.ts
import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => request.cookies.getAll(),
        setAll: (cookiesToSet) => {
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options),
          );
        },
      },
    },
  );

  const { data: { user } } = await supabase.auth.getUser();

  // Protect /portal routes — must be logged in
  if (request.nextUrl.pathname.startsWith('/portal') && !user) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // Protect /admin routes — must be admin
  if (request.nextUrl.pathname.startsWith('/admin')) {
    if (!user) return NextResponse.redirect(new URL('/login', request.url));
    // Admin check happens in the page/API route itself
  }

  return response;
}

export const config = {
  matcher: ['/portal/:path*', '/admin/:path*'],
};
```

---

## 8. Cloudinary Image Upload

```typescript
// src/app/api/admin/portfolio/upload/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { v2 as cloudinary } from 'cloudinary';
import { supabaseAdmin } from '@/lib/supabase/admin';

cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function POST(request: NextRequest) {
  // Admin check omitted for brevity — same pattern as other admin routes

  const formData = await request.formData();
  const file = formData.get('file') as File;
  const title = formData.get('title') as string;
  const category = formData.get('category') as string;

  const buffer = Buffer.from(await file.arrayBuffer());

  // Upload to Cloudinary — it auto-generates thumbnails via transformations
  const result = await new Promise<any>((resolve, reject) => {
    cloudinary.uploader.upload_stream(
      {
        folder: 'arm-artistry/portfolio',
        // Cloudinary auto-generates WebP thumbnails on-the-fly via URL params
        // No Lambda/worker needed
      },
      (error, result) => (error ? reject(error) : resolve(result)),
    ).end(buffer);
  });

  // Save to Supabase with dimensions (for CLS prevention)
  await supabaseAdmin.from('portfolio_assets').insert({
    title,
    category,
    image_url: result.secure_url,
    thumbnail_url: result.secure_url.replace('/upload/', '/upload/w_400,h_400,c_fill,f_webp/'),
    width: result.width,
    height: result.height,
  });

  return NextResponse.json({ success: true, url: result.secure_url });
}
```
