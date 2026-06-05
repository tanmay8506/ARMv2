# Product Requirement Document (PRD): ARM Artistry Frontend Overhaul

**Version:** 3.0 — Free Stack
**Date:** June 5, 2026

---

## 1. What We're Building

A complete visual overhaul of the ARM Artistry website — keeping the bones of what works (the luxury dark aesthetic, the typography, the vibe) but rebuilding it in Next.js 14 so it can connect to a real backend, load faster, rank better on Google, and give clients a proper booking experience rather than a static form.

---

## 2. Stack Decision — Final

| Tool | Purpose | Why |
|---|---|---|
| **Next.js 14** (App Router) | Framework | SSR for SEO, API routes built-in, Vercel free hosting |
| **Tailwind CSS** | Styling | Fastest to build, easy to maintain |
| **GSAP 3** (free) | Animations | Industry standard, no paid tier needed |
| **Lenis 1** | Smooth scroll | Works perfectly with GSAP |
| **Supabase JS** | Auth + Data | Magic links, sessions, no custom auth code |
| **Vercel** | Hosting | Free, instant deploys from GitHub |

---

## 3. Brand Identity (Locked — Do Not Change)

### Colors
```css
--gold:       #D4AF37;   /* Primary — headings, CTAs, accents */
--terracotta: #C97B4A;   /* Secondary — links, hover states */
--stone:      #1A1A1A;   /* Dark background */
--bone:       #F5F5DC;   /* Light background sections */
--bone-dark:  #E8E4D0;   /* Cards on bone */
```

### Fonts
```
Playfair Display — Headlines (Bold 700, ExtraBold 800)
Inter           — Body, UI, labels (Regular 400, Medium 500, Semibold 600)
```

Both loaded via `next/font/google` — self-hosted, zero FOUT, zero GDPR issues.

---

## 4. Site Structure

```
/ (Homepage)
  ├── Hero — full-screen, Ayushi's work front and centre
  ├── Philosophy — 2-3 lines about her artistic approach
  ├── Services — horizontal scroll preview of 3 tiers
  ├── Portfolio — 4-image teaser with "See All Work" CTA
  ├── Testimonials — 2-3 client quotes
  └── Booking CTA — "Book Your Session" full-width section

/services
  └── Full services + pricing breakdown

/portfolio
  └── Full gallery with category filters (Bridal | Hair | Glam | Party)

/booking
  └── Date picker → slot selection → service selection → form → submit

/portal
  └── Client's personal page (their booking history, status)

/admin (Ayushi only)
  ├── /admin/bookings — all requests with approve/decline
  ├── /admin/portfolio — upload, reorder, delete images
  └── /admin/services — edit pricing and descriptions
```

---

## 5. Page-by-Page Requirements

### 5.1. Homepage

**Hero Section**
- Full viewport height (`100dvh` — iOS Safari safe)
- Background: full-bleed image of Ayushi's work OR video reel
- Headline: `"Where Art Meets Identity"` or similar — Playfair Display, large, gold
- Subline: short descriptor — Inter, muted
- Two CTAs: `View My Work` (secondary) and `Book a Session` (primary, gold)
- GSAP entrance animation: text fades up on load, staggered 0.2s between elements
- On scroll: subtle parallax on the background image

**Philosophy Strip**
- Dark background (`--stone`)
- 3 stat/value cards with count-up animation on scroll into view:
  - e.g., "500+ Brides" / "8 Years Experience" / "3 Finish Tiers"

**Services Preview**
- Horizontal scroll cards (same as current site — keep what works)
- 3 cards: Standard, HD, Luxury — each with tier name, price, CTA
- Smooth drag-to-scroll on mobile, no scrollbar visible

**Portfolio Teaser**
- 4-image CSS grid (2×2 or 1+3 layout)
- Each image: hover scales to 1.05 with overlay showing category
- "View Full Portfolio →" link

**Testimonials**
- 2-3 client quotes, rotating/fade on interval
- Client name + service underneath

**Booking CTA**
- Full-width dark section
- Headline + "Book My Session" button that routes to `/booking`

---

### 5.2. Portfolio Page

- Category filter tabs: All | Bridal | Hair | Glam | Party
- Masonry or equal-height grid
- Images load from Supabase (`portfolio_assets` table) via server-side fetch (ISR 1 hour)
- Each image has `width` and `height` from DB → reserved before load → CLS = 0
- Click image → lightbox with title, description, category
- Smooth filter transition via GSAP: items fade/scale out then new ones fade in

---

### 5.3. Services Page

- Data fetched server-side from Supabase (ISR 1 hour)
- 3 tier columns: Standard | HD | Luxury
- Each with: price, duration, what's included, "Book This Tier" CTA
- Sticky header on scroll showing tier names for comparison

---

### 5.4. Booking Page (Most Complex — Client Component)

**State flow:**
```
IDLE → DATE_SELECTED → FETCHING_SLOTS → SLOTS_SHOWN
  → SLOT_SELECTED → HOLDING → SLOT_HELD (15-min countdown starts)
  → FORM_FILLING → SUBMITTING → SUCCESS
```

**Error states handled:**
- `SLOT_TAKEN` (409) → "This slot was just taken, please pick another"
- `HOLD_EXPIRED` (410) → "Your hold expired, please re-select"
- `SUBMISSION_FAILED` (500) → "Something went wrong, please try again"

**The form fields:**
- First name, Last name
- Email, Phone
- Service selection (dropdown populated from API)
- Notes / inspiration description (textarea)
- Submit button

**After submit:** Success state with animation + "We'll be in touch within 48 hours"

---

### 5.5. Client Portal (`/portal`)

- Protected by middleware (redirect to `/login` if not authenticated)
- Shows client's bookings: status badges, dates, service names
- "Cancel" button on PENDING bookings (before Ayushi confirms)
- Simple, clean — this is a utility page not a marketing page

---

### 5.6. Admin Dashboard (`/admin`)

- Only accessible when logged in as admin (role check in page)
- **Bookings list:** Table with client name, service, date, status
  - Each row: "Approve" and "Decline" buttons
  - Status filter: All | Pending | Confirmed | Completed | Cancelled
- **Portfolio manager:** Image grid with drag-to-reorder (or manual order number), delete button, upload button
- **Services editor:** Simple form to edit price and description per tier

---

## 6. Animations (GSAP — All Cleanup-Safe)

Every animation follows this rule: **created inside `gsap.context()`, cleaned up via `context.revert()`.**

| Element | Animation | Trigger |
|---|---|---|
| Hero text | Fade + translate Y (0→0, -30→0) | Page load |
| Section headings | Fade up | ScrollTrigger (enter viewport) |
| Portfolio images | Stagger scale in | ScrollTrigger |
| Stats | Count up from 0 | ScrollTrigger |
| Portfolio filter | Items fade/scale out, new ones in | Click |
| Parallax background | Y offset on scroll | ScrollTrigger scrub |
| Cursor dot | QuickTo (no React state) | mousemove |
| Cursor follower | QuickTo with lag | mousemove |

**No framer-motion.** GSAP handles everything.

---

## 7. Smooth Scroll (Lenis)

```typescript
// Integrated via GSAP ticker (zero double-RAF)
// Lenis destroyed cleanly on provider unmount
// syncTouch: true — correct iOS behavior
// ScrollTrigger.normalizeScroll(true) — iOS address bar fix
// ScrollTrigger.config({ ignoreMobileResize: true }) — iOS resize fix
```

---

## 8. Auth (Supabase — Magic Link)

**Client login flow:**
1. User enters email on `/login` page
2. Supabase sends magic link email automatically
3. User clicks link → redirected back to `/portal` → logged in
4. Session stored in Supabase cookie (httpOnly — never in localStorage)

**One function call — zero custom code:**
```typescript
await supabase.auth.signInWithOtp({ email, options: { emailRedirectTo: '/portal' } });
```

**Admin login:**
- Email + password at `/admin/login`
- Same Supabase auth, just uses password flow

---

## 9. Performance Targets

| Metric | Target |
|---|---|
| Lighthouse Performance | ≥ 95 |
| LCP | < 2.5s |
| CLS | = 0 (enforced by image dimensions in DB) |
| First paint | < 1s (ISR + Vercel CDN edge) |
| Mobile FPS | 60fps constant |

---

## 10. SEO

- All marketing pages are Server Components with proper metadata exports
- `<title>` and `<meta description>` unique per page
- `<h1>` one per page
- `next/image` for all images (WebP auto-conversion, lazy loading)
- Structured data (LocalBusiness schema) on homepage
- Sitemap auto-generated via `next-sitemap`
