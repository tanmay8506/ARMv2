# ARM Artistry — System Architecture PRD

**Version:** 3.0 — Free Stack
**Date:** June 5, 2026

---

## 1. The Goal

Build a beautiful, production-ready website for ARM Artistry that handles bookings, showcases portfolio, and lets Ayushi manage everything — with zero monthly cost.

---

## 2. The Stack (100% Free)

| Layer | Service | Free Tier |
|---|---|---|
| Frontend + API | Next.js 14 on **Vercel** | Unlimited for personal/hobby |
| Database + Auth + Storage | **Supabase** | 500MB DB, 1GB storage, 50,000 MAU |
| Email | **Resend** | 3,000 emails/month |
| Image CDN | **Cloudinary** | 25GB storage, 25GB bandwidth |
| Cron Jobs | **Vercel Cron** | 1 job free on hobby plan |

**No AWS. No Redis. No NestJS. No subscriptions.**

---

## 3. How It All Fits Together

```
Browser
  │
  ▼
Vercel (Next.js 14)
  ├── /app/*          → Pages (Server + Client Components)
  ├── /app/api/*      → API Routes (replaces separate backend)
  │       │
  │       ├── Supabase Client → PostgreSQL (bookings, clients, services)
  │       ├── Supabase Auth   → Magic link sessions
  │       ├── Resend          → Emails
  │       └── Cloudinary      → Image uploads
  │
  └── Vercel Cron → /api/cron/reminders (runs nightly)
```

Everything lives in **one Next.js repo**. No separate backend server to deploy or maintain.

---

## 4. Core Features & Requirements

### 4.1. Public Site
- Homepage with hero, services preview, portfolio teaser, booking CTA
- Full portfolio page with category filters
- Full services + pricing page
- Booking request page

### 4.2. Booking System
- Client picks date → sees available slots → selects one → fills form → submits
- Slot is "soft held" in the database for 15 minutes while client fills the form
- On submit: slot confirmed as PENDING, emails fire automatically
- Ayushi approves/declines from her admin dashboard
- On approval: client gets a confirmation email
- Night before appointment: client gets a reminder email (Vercel Cron)

### 4.3. Auth
- **Clients:** Passwordless magic link via Supabase Auth (built-in, zero custom code)
- **Admin (Ayushi):** Email + password via Supabase Auth dashboard
- Sessions managed entirely by Supabase — no JWT handling needed

### 4.4. Admin Dashboard
- View all booking requests (pending, confirmed, completed, cancelled)
- Approve / decline bookings
- Manage portfolio images (upload, reorder, delete)
- Manage services and pricing

### 4.5. Email Notifications
| Trigger | To | Template |
|---|---|---|
| Booking submitted | Ayushi | New booking request card (dark luxury) |
| Booking submitted | Client | "We received your request" |
| Ayushi confirms booking | Client | Booking confirmed details |
| Ayushi declines booking | Client | Polite decline + invitation to rebook |
| Night before appointment | Client | Reminder with appointment details |

---

## 5. Database Design (Supabase)

### Tables

**profiles** (extends Supabase auth.users)
```
id          uuid (FK → auth.users.id)
first_name  text
last_name   text
phone       text (nullable)
role        text ('client' | 'admin')
created_at  timestamptz
```

**services**
```
id            uuid
name          text
description   text
category      text
is_active     boolean (default true)
created_at    timestamptz
updated_at    timestamptz
```

**service_tiers**
```
id               uuid
service_id       uuid (FK → services)
tier_name        text  ('Standard' | 'HD' | 'Luxury')
base_price       integer (paise — smallest INR unit)
duration_minutes integer (REQUIRED — used to calculate end_time)
description      text
is_active        boolean
```

**bookings**
```
id               uuid
client_id        uuid (FK → profiles)
service_tier_id  uuid (FK → service_tiers)
start_time       timestamptz (UTC)
end_time         timestamptz (UTC, set by API = start + duration)
estimated_total  integer (paise, snapshot of price at booking)
status           text ('held' | 'pending' | 'confirmed' | 'completed' | 'cancelled')
held_until       timestamptz (15 min from hold creation, nullable)
notes            text (client notes, nullable)
admin_notes      text (Ayushi's notes, nullable)
created_at       timestamptz
updated_at       timestamptz
```

**portfolio_assets**
```
id             uuid
title          text
description    text
image_url      text (Cloudinary URL)
thumbnail_url  text (Cloudinary auto-generated thumbnail)
width          integer (for CLS prevention)
height         integer (for CLS prevention)
category       text ('Bridal' | 'Hair' | 'Glam' | 'Party')
display_order  integer (default 0)
is_active      boolean (default true)
created_at     timestamptz
```

### Overlap Prevention (Simple, No GIST Needed)

For a single artist taking sequential bookings, a simple DB check is sufficient:

```sql
-- Check before confirming any booking:
SELECT id FROM bookings
WHERE status NOT IN ('cancelled', 'held')
  AND start_time < $endTime
  AND end_time > $startTime;

-- If this returns any rows → slot is taken → return 409
```

This runs inside a Supabase transaction. For the booking volume of a single artist (max 5-8 bookings/day), this is completely safe and correct.

### Row Level Security (RLS)

Supabase RLS replaces all manual auth guards:

```sql
-- Clients can only see their own bookings
CREATE POLICY "clients_own_bookings" ON bookings
  FOR SELECT USING (auth.uid() = client_id);

-- Only admins can see all bookings
CREATE POLICY "admin_all_bookings" ON bookings
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Portfolio is public
CREATE POLICY "portfolio_public" ON portfolio_assets
  FOR SELECT USING (is_active = true);
```

---

## 6. Working Hours Configuration

Ayushi's availability is stored as a simple JSON config in Supabase (can be edited from the admin dashboard):

```json
{
  "workingDays": [1, 2, 3, 4, 5, 6],
  "startHour": 9,
  "startMinute": 0,
  "endHour": 19,
  "endMinute": 0,
  "bufferMinutes": 30,
  "timezone": "Asia/Kolkata",
  "blockedDates": ["2026-12-25", "2026-01-01"]
}
```

This is stored in a `settings` table and read by the availability API. Ayushi can update her hours from the dashboard without touching code.

---

## 7. What Gets Built vs Phases

### Phase 1 — Static Site (No Backend)
Get the beautiful frontend live immediately. This is just the current site, overhauled visually. No Supabase needed yet.

- Overhauled homepage
- Portfolio page
- Services page
- Contact / booking inquiry (EmailJS for now, same as current)

**Deploy:** Push to Vercel → done. Live in minutes.

### Phase 2 — Supabase + Booking Engine
Connect the real backend:

- Supabase project setup (10 minutes)
- Tables created via Supabase dashboard SQL editor
- Booking API routes in Next.js
- Auth (magic link for clients)
- Admin dashboard

### Phase 3 — Email + Polish
- Resend integration (15 minutes)
- HTML email templates (4 templates)
- Vercel Cron for reminders
- Cloudinary for admin image uploads

---

## 8. Admin Setup (No CLI, No Scripts)

Ayushi's admin account is created directly in the **Supabase dashboard**:

```
Supabase Dashboard → Authentication → Users → Invite User
Enter: ayushiraimua@gmail.com
```

Then in the SQL editor, set her role:
```sql
UPDATE profiles SET role = 'admin' WHERE id = '<her-user-id>';
```

Done. No seed scripts. No CLI commands. Takes 2 minutes.

---

## 9. Non-Goals (Explicitly Out of Scope)

- ❌ Real-time slot updates (not needed — refresh on booking)
- ❌ Payment processing (Ayushi collects payment in person)
- ❌ Multi-artist support (single artist site)
- ❌ Mobile app
- ❌ Any AWS service
- ❌ Redis / caching layer
- ❌ Separate backend server
