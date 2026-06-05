# Master Integration & Deployment Blueprint: ARM Artistry

**Version:** 3.0 — Free Stack
**Date:** June 5, 2026

---

## 1. The Complete Picture

```
Everything lives in one Next.js repo.
One Vercel project. One GitHub push = auto-deploy.

┌─────────────────────────────────────────────┐
│  Vercel (Free Hobby Plan)                   │
│                                             │
│  Next.js 14 App                             │
│  ├── /app pages    (SSR / ISR)              │
│  ├── /api routes   (replaces backend)       │
│  └── Vercel Cron   (nightly reminders)      │
└──────────┬────────────────────┬─────────────┘
           │                    │
    ┌──────▼──────┐    ┌────────▼────────┐
    │  Supabase   │    │   Cloudinary    │
    │  (Free)     │    │   (Free 25GB)   │
    │             │    │                 │
    │  PostgreSQL │    │  Portfolio imgs │
    │  Auth       │    │  Auto WebP CDN  │
    │  Storage    │    └─────────────────┘
    └──────┬──────┘
           │
    ┌──────▼──────┐
    │   Resend    │
    │  (Free)     │
    │             │
    │  4 email    │
    │  templates  │
    └─────────────┘
```

---

## 2. Account Setup Checklist (Do This First)

### Supabase (10 min)
- [ ] Create account at supabase.com
- [ ] New project: `arm-artistry`, region: **South Asia (ap-south-1)**
- [ ] Run the schema SQL from the Technical Spec (copy-paste into SQL Editor)
- [ ] Enable magic link auth (Authentication → Settings → Email → Magic Link ✅)
- [ ] Create Ayushi's admin account (Authentication → Users → Add User)
- [ ] Run `UPDATE profiles SET role = 'admin' WHERE id = '<her-id>';`
- [ ] Copy: Project URL, Anon Key, Service Role Key → into `.env.local`

### Resend (5 min)
- [ ] Create account at resend.com
- [ ] Add and verify your domain `armartistry.com` (add DNS TXT record)
- [ ] Copy API Key → into `.env.local`
- [ ] If domain not ready yet: use Resend's test mode — emails go to your own inbox

### Cloudinary (5 min)
- [ ] Create account at cloudinary.com
- [ ] Copy Cloud Name, API Key, API Secret → into `.env.local`
- [ ] Create folder called `arm-artistry/portfolio` in Media Library

### Vercel (5 min, after code is on GitHub)
- [ ] Push the Next.js project to a GitHub repo
- [ ] Connect repo to Vercel (import project)
- [ ] Add all `.env.local` variables in Vercel Project Settings → Environment Variables
- [ ] Deploy

---

## 3. API Reference (All Endpoints)

### Public (No Auth)
| Method | Path | What it does |
|---|---|---|
| `GET` | `/api/availability?date=YYYY-MM-DD` | Returns available slot times (UTC ISO strings) |
| `GET` | `/services` | Page — services data from Supabase (ISR) |
| `GET` | `/portfolio` | Page — portfolio data from Supabase (ISR) |

### Client (Must Be Logged In via Supabase Session)
| Method | Path | Body | What it does |
|---|---|---|---|
| `POST` | `/api/bookings/hold` | `{ startTime, serviceTierId }` | Holds slot for 15 min |
| `POST` | `/api/bookings/confirm` | `{ bookingId, notes }` | Confirms held booking + fires emails |
| `GET` | `/portal` | — | Client's booking history (page) |

### Admin (Must Be Logged In as Admin)
| Method | Path | Body | What it does |
|---|---|---|---|
| `PATCH` | `/api/admin/bookings/[id]` | `{ action: 'confirm'|'decline', adminNotes }` | Approve or decline booking |
| `POST` | `/api/admin/portfolio/upload` | FormData with file, title, category | Upload image to Cloudinary |
| `GET` | `/admin/bookings` | — | Admin bookings table (page) |

### Cron (Vercel internal)
| Method | Path | Auth Header |
|---|---|---|
| `GET` | `/api/cron/reminders` | `Authorization: Bearer <CRON_SECRET>` |

---

## 4. Email Flow Summary

```
Client submits booking
    │
    ├──→ Email to AYUSHI: dark luxury admin card
    │    (client name, service, date, price, email)
    │
    └──→ Email to CLIENT: "We received your request"
         (thank you + 48hr response promise)

Ayushi clicks "Approve" in admin dashboard
    │
    └──→ Email to CLIENT: "Your booking is confirmed"
         (dark luxury card with full details)

Ayushi clicks "Decline" in admin dashboard
    │
    └──→ Email to CLIENT: polite decline + rebook link

Vercel Cron fires at 6pm UTC (11:30pm IST = night before appointments)
    │
    └──→ Email to CLIENT: reminder with appointment details
```

No external queue. No workers. All emails fire directly from API routes via Resend. If an email fails, the booking is NOT rolled back — the booking is the source of truth.

---

## 5. Vercel Configuration

```json
// vercel.json (in project root)
{
  "crons": [
    {
      "path": "/api/cron/reminders",
      "schedule": "0 18 * * *"
    }
  ]
}
```

The cron runs at 18:00 UTC = 23:30 IST, which sends the "tomorrow" reminder at a good time each night.

---

## 6. Environment Variables (Complete List)

```env
# Supabase (get from Supabase Dashboard → Project Settings → API)
NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...         ← safe to expose (used in browser)
SUPABASE_SERVICE_ROLE_KEY=eyJ...              ← NEVER expose (server-only)

# Resend (get from resend.com → API Keys)
RESEND_API_KEY=re_...                         ← server-only

# Cloudinary (get from Cloudinary Dashboard)
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=yourname    ← safe to expose
CLOUDINARY_API_KEY=...                        ← server-only
CLOUDINARY_API_SECRET=...                     ← server-only

# Cron security (make up any long random string)
CRON_SECRET=some-long-random-string-here      ← server-only
```

**Rule:** Any variable with `NEXT_PUBLIC_` is exposed to the browser. Never put secrets there.

---

## 7. ISR Cache Invalidation

When Ayushi updates portfolio or services from the admin dashboard, pages cached by ISR need to refresh. Use Next.js on-demand revalidation:

```typescript
// src/app/api/admin/revalidate/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';

export async function POST(request: NextRequest) {
  const { paths } = await request.json();
  paths.forEach((p: string) => revalidatePath(p));
  return NextResponse.json({ ok: true });
}
```

Call this from admin actions:
```typescript
// After updating portfolio or services:
await fetch('/api/admin/revalidate', {
  method: 'POST',
  body: JSON.stringify({ paths: ['/portfolio', '/services', '/'] }),
  headers: { 'Content-Type': 'application/json' },
});
```

Pages update within seconds — no waiting for the 1-hour ISR window.

---

## 8. Build Order (Phase by Phase)

### Phase 1 — Static Overhaul (~1-2 days)
Get the new beautiful frontend live immediately.

```
[ ] Init Next.js project
[ ] Install dependencies
[ ] Set up Tailwind design tokens
[ ] Build root layout (fonts, providers, cursor)
[ ] Build Navbar + Footer
[ ] Build Homepage (Hero, Services preview, Portfolio teaser, Booking CTA)
[ ] Build Portfolio page (static data for now, replace with Supabase in Phase 2)
[ ] Build Services page (static data for now)
[ ] Deploy to Vercel → live immediately
```

**Gate:** Site is live, looks beautiful, Lighthouse ≥ 95.

---

### Phase 2 — Supabase + Booking Engine (~2-3 days)
Connect the real backend.

```
[ ] Set up Supabase project (schema SQL, admin user)
[ ] Replace static data with Supabase queries on Services + Portfolio pages
[ ] Build /api/availability
[ ] Build /api/bookings/hold
[ ] Build /api/bookings/confirm
[ ] Build BookingCalendar component (full state machine)
[ ] Build /booking page
[ ] Build magic link login (/login page)
[ ] Build /portal page (client's booking history)
[ ] Test full booking flow end-to-end
```

**Gate:** Can book a slot, hold expires correctly, booking appears in Supabase dashboard.

---

### Phase 3 — Admin + Email + Cron (~1-2 days)
Complete the system.

```
[ ] Set up Resend account + verify domain
[ ] Add email module (all 4 templates)
[ ] Wire emails into confirm + admin approve/decline routes
[ ] Build /admin/bookings page with approve/decline
[ ] Build /admin/portfolio page with Cloudinary upload
[ ] Add Vercel Cron for reminders (vercel.json)
[ ] Test email delivery (check spam!)
[ ] Test cron manually: GET /api/cron/reminders with Authorization header
```

**Gate:** Full end-to-end works. Book → emails arrive → Ayushi approves → confirmation email → reminder arrives night before.

---

## 9. Testing Checklist (Before Launch)

**Booking flow:**
- [ ] Select a date → slots appear (all in IST display)
- [ ] Select a slot → hold created (check Supabase bookings table, status = 'held')
- [ ] Wait 15 minutes without submitting → hold expires → frontend shows "expired" state
- [ ] Complete booking → status = 'pending' in Supabase
- [ ] Ayushi approves → status = 'confirmed', client gets email
- [ ] Ayushi declines → client gets polite email

**Auth:**
- [ ] Client logs in via magic link → redirected to /portal ✅
- [ ] Client tries to access /admin → redirected to /login ✅
- [ ] Admin logs in → can access /admin/bookings ✅
- [ ] Non-admin user tries /admin API routes → 403 ✅

**Email:**
- [ ] All 4 email templates render correctly in Gmail (check on mobile too)
- [ ] No "Email sent via EmailJS.com" or similar footers
- [ ] From address shows `ARM Artistry <noreply@armartistry.com>` ✅

**Performance:**
- [ ] Lighthouse ≥ 95 on Homepage, Services, Portfolio
- [ ] No images without explicit `width` and `height` (CLS = 0)
- [ ] Smooth scroll on iPhone Safari (no address bar jumps)
- [ ] Custom cursor works on desktop, hidden on mobile (add `md:block hidden`)

---

## 10. What You Get at Zero Cost

| Service | Free Tier | Enough For ARM Artistry? |
|---|---|---|
| Vercel | Unlimited hobby deployments | ✅ Yes |
| Supabase | 500MB DB, 50k MAU, 2GB bandwidth | ✅ Yes (easily) |
| Resend | 3,000 emails/month | ✅ Yes (100 bookings/month = ~400 emails) |
| Cloudinary | 25GB storage, 25GB bandwidth | ✅ Yes |
| Vercel Cron | 1 cron job on hobby | ✅ Yes (just need the nightly reminder) |
| **Total** | **₹0/month** | **✅ Indefinitely** |

When ARM Artistry grows to the point where these limits matter, it means the business is making enough to comfortably pay for upgrades. But that's not a problem you need to solve today.
