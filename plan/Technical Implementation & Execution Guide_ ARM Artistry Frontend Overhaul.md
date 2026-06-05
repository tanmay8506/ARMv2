# Technical Implementation & Execution Guide: ARM Artistry Frontend Overhaul

**Version:** 3.0 — Free Stack
**Date:** June 5, 2026

---

## 1. Before You Write a Single Line of Code

Set up these 4 accounts first. All free, all take under 10 minutes total.

> 📱 **iPhone test — do this immediately after deploy:** Open the live URL on a physical iPhone in Safari. Scroll up and down. Confirm the address bar shrinking/expanding does not cause the hero section to jump or ScrollTrigger animations to misfire. Desktop emulators do not catch this. Takes 30 seconds.

| Service | URL | What to do |
|---|---|---|
| Supabase | supabase.com | Create project → `arm-artistry`, region: Mumbai |
| Resend | resend.com | Create account → get API key → verify your domain |
| Cloudinary | cloudinary.com | Create account → note your cloud name, API key, secret |
| Vercel | vercel.com | Connect GitHub account (deploy later) |

---

## 2. Project Initialization

```bash
# In your terminal, navigate to where you want the project
npx create-next-app@14 arm-artistry \
  --typescript --tailwind --app --src-dir \
  --import-alias "@/*" --use-npm

cd arm-artistry

# Install all dependencies in one shot
npm install \
  @supabase/supabase-js \
  @supabase/ssr \
  resend \
  gsap \
  lenis \
  react-hook-form \
  @hookform/resolvers \
  zod \
  date-fns-tz \
  cloudinary \
  next-sitemap
```

Create your `.env.local` file in the project root:
```env
NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...
RESEND_API_KEY=re_...
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=...
CLOUDINARY_API_SECRET=...
CRON_SECRET=make-up-any-long-random-string
```

---

## 3. Project Structure

```
src/
├── app/
│   ├── layout.tsx              ← Root layout with providers + fonts
│   ├── page.tsx                ← Homepage (Server Component)
│   ├── globals.css             ← Design tokens + global styles
│   ├── services/page.tsx       ← Services page (Server + ISR)
│   ├── portfolio/page.tsx      ← Portfolio page (Server + ISR)
│   ├── booking/page.tsx        ← Booking page (Client Component)
│   ├── login/page.tsx          ← Magic link login page
│   ├── portal/page.tsx         ← Client portal (protected)
│   ├── admin/
│   │   ├── layout.tsx          ← Admin layout with role check
│   │   ├── bookings/page.tsx
│   │   ├── portfolio/page.tsx
│   │   └── services/page.tsx
│   └── api/
│       ├── availability/route.ts
│       ├── bookings/
│       │   ├── hold/route.ts
│       │   └── confirm/route.ts
│       ├── admin/
│       │   ├── bookings/[id]/route.ts
│       │   └── portfolio/upload/route.ts
│       └── cron/
│           └── reminders/route.ts
├── components/
│   ├── layout/Navbar.tsx
│   ├── layout/Footer.tsx
│   ├── cursor/CustomCursor.tsx
│   ├── home/HeroSection.tsx
│   ├── home/ServicesPreview.tsx
│   ├── home/PortfolioTeaser.tsx
│   ├── portfolio/PortfolioGrid.tsx
│   ├── portfolio/Lightbox.tsx
│   ├── booking/BookingCalendar.tsx
│   ├── booking/SlotPicker.tsx
│   ├── booking/HoldCountdown.tsx
│   └── admin/BookingTable.tsx
├── providers/
│   ├── GsapProvider.tsx
│   └── LenisProvider.tsx
├── lib/
│   ├── supabase/client.ts
│   ├── supabase/server.ts
│   ├── supabase/admin.ts
│   ├── email.ts
│   └── utils.ts
├── hooks/
│   ├── useAuth.ts
│   └── useAvailability.ts
├── types/
│   └── index.ts
└── middleware.ts
```

---

## 4. Tailwind Design Tokens

```typescript
// tailwind.config.ts
import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        gold:       '#D4AF37',
        terracotta: '#C97B4A',
        stone:      '#1A1A1A',
        bone:       '#F5F5DC',
        'bone-dark':'#E8E4D0',
      },
      fontFamily: {
        playfair: ['var(--font-playfair)'],
        inter:    ['var(--font-inter)'],
      },
    },
  },
};
export default config;
```

```css
/* src/app/globals.css */
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  html {
    scroll-behavior: auto; /* Lenis handles smooth scroll */
  }

  body {
    @apply bg-stone text-bone font-inter antialiased;
    cursor: none; /* Custom cursor replaces */
  }
}

@layer utilities {
  /* iOS Safari safe full height */
  .h-screen-safe {
    height: 100dvh;
    min-height: 100dvh;
  }

  @supports not (height: 100dvh) {
    .h-screen-safe {
      height: 100vh;
      height: -webkit-fill-available;
    }
  }

  /* Gold gradient text */
  .text-gold-gradient {
    background: linear-gradient(135deg, #D4AF37, #F2D472, #D4AF37);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  }
}
```

---

## 5. Root Layout

```typescript
// src/app/layout.tsx
import type { Metadata } from 'next';
import { Playfair_Display, Inter } from 'next/font/google';
import { GsapProvider } from '@/providers/GsapProvider';
import { LenisProvider } from '@/providers/LenisProvider';
import { CustomCursor } from '@/components/cursor/CustomCursor';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import './globals.css';

const playfair = Playfair_Display({
  subsets: ['latin'],
  weight: ['700', '800'],
  variable: '--font-playfair',
  display: 'swap',
});

const inter = Inter({
  subsets: ['latin'],
  weight: ['400', '500', '600'],
  variable: '--font-inter',
  display: 'swap',
});

export const metadata: Metadata = {
  title: { default: 'ARM Artistry', template: '%s | ARM Artistry' },
  description: 'Luxury bridal, editorial & event makeup artistry by Ayushi Rai. HD & Airbrush finishes. Book your session today.',
  openGraph: { type: 'website', locale: 'en_IN', siteName: 'ARM Artistry' },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${playfair.variable} ${inter.variable}`}>
      <body className="bg-stone text-bone font-inter antialiased cursor-none overflow-x-hidden">
        <GsapProvider>
          <LenisProvider>
            <CustomCursor />
            <Navbar />
            {children}
            <Footer />
          </LenisProvider>
        </GsapProvider>
      </body>
    </html>
  );
}
```

---

## 6. GSAP Provider (Registers Plugins + iOS Safari Fix)

```typescript
// src/providers/GsapProvider.tsx
'use client';
import { useLayoutEffect } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export function GsapProvider({ children }: { children: React.ReactNode }) {
  useLayoutEffect(() => {
    ScrollTrigger.normalizeScroll(true);
    ScrollTrigger.config({ ignoreMobileResize: true });
  }, []);
  return <>{children}</>;
}
```

---

## 7. Lenis Provider (Zero Double-RAF)

```typescript
// src/providers/LenisProvider.tsx
'use client';
import { useEffect } from 'react';
import Lenis from 'lenis';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

export function LenisProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      syncTouch: true,
    });

    // Drive Lenis via GSAP ticker — eliminates double-RAF
    const tick = (time: number) => lenis.raf(time * 1000);
    gsap.ticker.add(tick);
    gsap.ticker.lagSmoothing(0);
    lenis.on('scroll', ScrollTrigger.update);

    return () => {
      gsap.ticker.remove(tick);
      lenis.destroy();
    };
  }, []);

  return <>{children}</>;
}
```

---

## 8. Custom Cursor (Zero React State)

```typescript
// src/components/cursor/CustomCursor.tsx
'use client';
import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';

export function CustomCursor() {
  const dotRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const dot = dotRef.current;
    const ring = ringRef.current;
    if (!dot || !ring) return;

    const xDot  = gsap.quickTo(dot,  'x', { duration: 0.1, ease: 'power3' });
    const yDot  = gsap.quickTo(dot,  'y', { duration: 0.1, ease: 'power3' });
    const xRing = gsap.quickTo(ring, 'x', { duration: 0.4, ease: 'power3' });
    const yRing = gsap.quickTo(ring, 'y', { duration: 0.4, ease: 'power3' });

    const move = (e: MouseEvent) => {
      xDot(e.clientX); yDot(e.clientY);
      xRing(e.clientX); yRing(e.clientY);
    };

    window.addEventListener('mousemove', move, { passive: true });
    return () => {
      window.removeEventListener('mousemove', move);
      gsap.killTweensOf([dot, ring]);
    };
  }, []);

  return (
    <>
      <div
        ref={dotRef}
        className="fixed top-0 left-0 w-2.5 h-2.5 rounded-full bg-gold pointer-events-none z-[9999] -translate-x-1/2 -translate-y-1/2"
        style={{ willChange: 'transform' }}
      />
      <div
        ref={ringRef}
        className="fixed top-0 left-0 w-8 h-8 rounded-full border border-gold pointer-events-none z-[9998] -translate-x-1/2 -translate-y-1/2"
        style={{ willChange: 'transform' }}
      />
    </>
  );
}
```

---

## 9. Homepage (Server Component with ISR)

```typescript
// src/app/page.tsx
import { createClient } from '@/lib/supabase/server';
import HeroSection from '@/components/home/HeroSection';
import ServicesPreview from '@/components/home/ServicesPreview';
import PortfolioTeaser from '@/components/home/PortfolioTeaser';
import type { Metadata } from 'next';

export const revalidate = 3600; // Rebuild every hour

export const metadata: Metadata = {
  title: 'ARM Artistry — Luxury Makeup Atelier',
};

export default async function HomePage() {
  const supabase = createClient();

  const [{ data: services }, { data: portfolio }] = await Promise.all([
    supabase.from('service_tiers').select('*, services(name)').eq('is_active', true),
    supabase.from('portfolio_assets').select('*').eq('is_active', true)
      .order('display_order').limit(4),
  ]);

  return (
    <main>
      <HeroSection />
      <ServicesPreview tiers={services ?? []} />
      <PortfolioTeaser assets={portfolio ?? []} />
    </main>
  );
}
```

---

## 10. Portfolio Page (Server Component with ISR)

```typescript
// src/app/portfolio/page.tsx
import { createClient } from '@/lib/supabase/server';
import { PortfolioGrid } from '@/components/portfolio/PortfolioGrid';
import type { Metadata } from 'next';

export const revalidate = 3600;

export const metadata: Metadata = {
  title: 'Portfolio',
  description: 'Browse ARM Artistry\'s portfolio of bridal, glam, hair, and party looks.',
};

export default async function PortfolioPage() {
  const supabase = createClient();
  const { data: assets } = await supabase
    .from('portfolio_assets')
    .select('*')
    .eq('is_active', true)
    .order('display_order');

  return (
    <main className="min-h-screen bg-stone pt-24 pb-16">
      <div className="max-w-7xl mx-auto px-6">
        <h1 className="font-playfair text-5xl text-gold mb-4">The Work</h1>
        <p className="text-bone/60 mb-12 max-w-lg">
          Each face is a canvas. Each look, a story.
        </p>
        <PortfolioGrid assets={assets ?? []} />
      </div>
    </main>
  );
}
```

---

## 11. Magic Link Login Page

```typescript
// src/app/login/page.tsx
'use client';
import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const supabase = createClient();

    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: `${window.location.origin}/portal` },
    });

    if (!error) setSent(true);
    setLoading(false);
  };

  if (sent) {
    return (
      <main className="min-h-screen bg-stone flex items-center justify-center px-6">
        <div className="text-center max-w-md">
          <h1 className="font-playfair text-4xl text-gold mb-4">Check your email ✨</h1>
          <p className="text-bone/60">
            We sent a magic link to <strong className="text-bone">{email}</strong>.
            Click it to sign in — no password needed.
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-stone flex items-center justify-center px-6">
      <div className="w-full max-w-sm">
        <h1 className="font-playfair text-4xl text-gold mb-2">Sign In</h1>
        <p className="text-bone/50 mb-8 text-sm">Enter your email — we'll send a magic link.</p>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="your@email.com"
            required
            className="w-full bg-white/5 border border-white/10 rounded px-4 py-3 text-bone placeholder:text-bone/30 focus:outline-none focus:border-gold"
          />
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gold text-stone font-semibold py-3 rounded hover:bg-gold/90 transition disabled:opacity-50"
          >
            {loading ? 'Sending...' : 'Send Magic Link →'}
          </button>
        </form>
      </div>
    </main>
  );
}
```

---

## 12. Booking State Machine (Complete)

```typescript
// src/components/booking/BookingCalendar.tsx
'use client';
import { useState, useCallback } from 'react';
import { SlotPicker } from './SlotPicker';
import { HoldCountdown } from './HoldCountdown';
import { BookingForm } from './BookingForm';

type State = 'idle' | 'fetching' | 'slots' | 'holding' | 'held' | 'submitting' | 'success'
           | 'slot_taken' | 'hold_expired' | 'error';

export function BookingCalendar({ tiers }: { tiers: any[] }) {
  const [state, setState] = useState<State>('idle');
  const [slots, setSlots] = useState<string[]>([]);
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);
  const [bookingId, setBookingId] = useState<string | null>(null);
  const [selectedTierId, setSelectedTierId] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const fetchSlots = useCallback(async (date: string) => {
    setState('fetching');
    const res = await fetch(`/api/availability?date=${date}`);
    const data = await res.json();
    setSlots(data.availableSlots ?? []);
    setState('slots');
  }, []);

  const holdSlot = useCallback(async (slotUtc: string) => {
    setState('holding');
    setSelectedSlot(slotUtc);
    const res = await fetch('/api/bookings/hold', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ startTime: slotUtc, serviceTierId: selectedTierId }),
    });
    if (res.ok) {
      const data = await res.json();
      setBookingId(data.bookingId);
      setState('held');
    } else if (res.status === 409) {
      setErrorMsg('This slot was just taken. Please select another.');
      setState('slot_taken');
    } else {
      setState('error');
    }
  }, [selectedTierId]);

  const submitBooking = useCallback(async (notes: string) => {
    setState('submitting');
    const res = await fetch('/api/bookings/confirm', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ bookingId, notes }),
    });
    if (res.ok) {
      setState('success');
    } else if (res.status === 410) {
      setErrorMsg('Your hold expired. Please re-select a slot.');
      setState('hold_expired');
    } else {
      setState('error');
    }
  }, [bookingId]);

  return (
    <div className="space-y-8">
      {/* Service picker */}
      {state === 'idle' && (
        <div className="space-y-4">
          <label className="block text-bone/60 text-sm uppercase tracking-widest">
            Select Service
          </label>
          <select
            value={selectedTierId}
            onChange={(e) => setSelectedTierId(e.target.value)}
            className="w-full bg-white/5 border border-white/10 rounded px-4 py-3 text-bone"
          >
            <option value="">Choose a service tier...</option>
            {tiers.map((t) => (
              <option key={t.id} value={t.id}>
                {t.services?.name} — {t.tier_name} (₹{(t.base_price / 100).toLocaleString('en-IN')})
              </option>
            ))}
          </select>
          {selectedTierId && (
            <div>
              <label className="block text-bone/60 text-sm uppercase tracking-widest mb-2">
                Select Date
              </label>
              <input
                type="date"
                min={new Date().toISOString().split('T')[0]}
                onChange={(e) => fetchSlots(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded px-4 py-3 text-bone"
              />
            </div>
          )}
        </div>
      )}

      {state === 'fetching' && (
        <p className="text-bone/50 animate-pulse">Loading available slots...</p>
      )}

      {(state === 'slots' || state === 'slot_taken') && (
        <SlotPicker
          slots={slots}
          onSelect={holdSlot}
          errorMessage={state === 'slot_taken' ? errorMsg : undefined}
          onChangeDate={() => setState('idle')}
        />
      )}

      {state === 'held' && selectedSlot && (
        <div className="space-y-6">
          <HoldCountdown durationSeconds={900} onExpire={() => {
            setErrorMsg('Your hold expired. Please re-select a slot.');
            setState('hold_expired');
          }} />
          <BookingForm onSubmit={submitBooking} isSubmitting={state === 'submitting'} />
        </div>
      )}

      {state === 'hold_expired' && (
        <div className="text-amber-400 space-y-3">
          <p>{errorMsg}</p>
          <button
            onClick={() => { setSelectedSlot(null); setState('idle'); }}
            className="underline text-gold"
          >
            Re-select a slot →
          </button>
        </div>
      )}

      {state === 'success' && (
        <div className="text-center py-12 space-y-4">
          <div className="text-6xl">✨</div>
          <h2 className="font-playfair text-3xl text-gold">Request Sent!</h2>
          <p className="text-bone/60 max-w-sm mx-auto">
            Ayushi will review your request and confirm within 48 hours.
            Check your email for confirmation.
          </p>
        </div>
      )}

      {state === 'error' && (
        <div className="text-red-400 space-y-3">
          <p>Something went wrong. Please try again.</p>
          <button onClick={() => setState('idle')} className="underline text-gold">
            Start over →
          </button>
        </div>
      )}
    </div>
  );
}
```

---

## 13. Types

```typescript
// src/types/index.ts
export interface Service {
  id: string;
  name: string;
  description: string;
  category: string;
  is_active: boolean;
  tiers?: ServiceTier[];
}

export interface ServiceTier {
  id: string;
  service_id: string;
  tier_name: string;
  base_price: number; // paise
  duration_minutes: number;
  description?: string;
}

export interface PortfolioAsset {
  id: string;
  title: string;
  description?: string;
  image_url: string;
  thumbnail_url?: string;
  width?: number;
  height?: number;
  category: string;
  display_order: number;
}

export interface Booking {
  id: string;
  client_id: string;
  service_tier_id: string;
  start_time: string; // UTC ISO
  end_time: string;   // UTC ISO
  estimated_total: number; // paise
  status: 'held' | 'pending' | 'confirmed' | 'completed' | 'cancelled';
  held_until?: string;
  notes?: string;
}
```

---

## 14. Utils

```typescript
// src/lib/utils.ts
import { fromZonedTime, toZonedTime, format } from 'date-fns-tz';

const IST = 'Asia/Kolkata';

/**
 * Display a UTC ISO string in IST for the user.
 * Works identically on Vercel (UTC server) and local Windows (IST machine).
 */
export function formatIST(utcIso: string, style: 'date' | 'time' | 'full' = 'full') {
  const zoned = toZonedTime(new Date(utcIso), IST);
  const pattern =
    style === 'full' ? 'dd MMM yyyy, hh:mm a' :
    style === 'date' ? 'dd MMM yyyy' :
    'hh:mm a';
  return format(zoned, pattern, { timeZone: IST });
}

/**
 * Convert IST working-hour boundaries to UTC — timezone-safe.
 * Use this instead of raw string concatenation like new Date(`${date}T09:00+05:30`).
 */
export function istToUtc(dateStr: string, hour: number, minute: number): Date {
  return fromZonedTime(
    `${dateStr}T${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}:00`,
    IST,
  );
}

/** Format paise to ₹ display */
export function formatINR(paise: number) {
  return `₹${(paise / 100).toLocaleString('en-IN')}`;
}

/** Display slot time in IST (e.g. "10:00 AM") */
export function slotToIST(utcIso: string) {
  return formatIST(utcIso, 'time');
}
```
