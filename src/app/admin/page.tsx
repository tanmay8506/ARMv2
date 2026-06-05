import { createAdminClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import BookingActionButtons from "./BookingActionButtons";
import PortfolioUploader from "./PortfolioUploader";
import { formatInTimeZone } from "date-fns-tz";
import {
  LayoutDashboard,
  Calendar,
  ImagePlus,
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle,
} from "lucide-react";

// Force server-side rendering — admin data must always be fresh
export const dynamic = "force-dynamic";

export default async function AdminDashboard() {
  // ── SERVER-SIDE AUTH GATE ────────────────────────────────────────────────
  // Middleware handles the primary redirect, but we add a server-component
  // double-check so the page never renders for non-admins even if middleware is bypassed.
  const userClient = createClient();
  const {
    data: { user },
  } = await userClient.auth.getUser();

  if (!user || user.email !== process.env.ADMIN_EMAIL) {
    redirect("/");
  }

  // ── DATA FETCHING ────────────────────────────────────────────────────────
  const supabase = createAdminClient();

  const { data: bookings } = await supabase
    .from("bookings")
    .select("*, service_tiers(title)")
    .order("created_at", { ascending: false })
    .limit(50);

  // Stats
  const pending = bookings?.filter((b) => b.status === "pending").length ?? 0;
  const confirmed = bookings?.filter((b) => b.status === "confirmed").length ?? 0;
  const held = bookings?.filter((b) => b.status === "held").length ?? 0;

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-white font-sans">
      {/* Header */}
      <header className="border-b border-white/10 px-8 py-5 flex items-center justify-between sticky top-0 z-50 bg-[#0A0A0A]/95 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <LayoutDashboard className="w-5 h-5 text-lamborghini-gold" />
          <span className="font-heading uppercase tracking-[0.2em] text-sm text-lamborghini-gold">
            ARM Artistry · Admin
          </span>
        </div>
        <span className="text-xs text-white/30 font-mono">
          {user.email}
        </span>
      </header>

      <main className="max-w-[1400px] mx-auto px-8 py-10">
        {/* Page title */}
        <div className="mb-10">
          <h1 className="text-4xl font-heading uppercase tracking-[0.15em] text-white mb-2">
            Control Centre
          </h1>
          <p className="text-smoke text-sm">
            Manage bookings, portfolio assets, and studio operations.
          </p>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-3 gap-4 mb-10">
          {[
            {
              label: "Pending Review",
              value: pending,
              icon: AlertCircle,
              color: "text-lamborghini-gold",
              bg: "bg-lamborghini-gold/10 border-lamborghini-gold/20",
            },
            {
              label: "Confirmed",
              value: confirmed,
              icon: CheckCircle2,
              color: "text-emerald-400",
              bg: "bg-emerald-400/10 border-emerald-400/20",
            },
            {
              label: "Held (Active)",
              value: held,
              icon: Clock,
              color: "text-sky-400",
              bg: "bg-sky-400/10 border-sky-400/20",
            },
          ].map(({ label, value, icon: Icon, color, bg }) => (
            <div
              key={label}
              className={`border ${bg} px-6 py-5 flex items-center justify-between`}
            >
              <div>
                <p className="text-xs uppercase tracking-widest text-smoke mb-1">
                  {label}
                </p>
                <p className={`text-3xl font-heading font-bold ${color}`}>
                  {value}
                </p>
              </div>
              <Icon className={`w-8 h-8 ${color} opacity-60`} />
            </div>
          ))}
        </div>

        {/* Main Grid */}
        <div className="grid grid-cols-1 xl:grid-cols-[1fr_420px] gap-8">
          {/* ── Booking Ledger ─────────────────────────────────────────── */}
          <section>
            <div className="flex items-center gap-3 mb-6">
              <Calendar className="w-5 h-5 text-lamborghini-gold" />
              <h2 className="font-heading uppercase tracking-widest text-base">
                Booking Ledger
              </h2>
            </div>

            <div className="space-y-3">
              {bookings && bookings.length > 0 ? (
                bookings.map((b) => {
                  const statusConfig: Record<string, { label: string; cls: string }> = {
                    pending: {
                      label: "Pending",
                      cls: "bg-lamborghini-gold/20 text-lamborghini-gold border-lamborghini-gold/30",
                    },
                    held: {
                      label: "Held",
                      cls: "bg-sky-400/20 text-sky-400 border-sky-400/30",
                    },
                    confirmed: {
                      label: "Confirmed",
                      cls: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
                    },
                    cancelled: {
                      label: "Cancelled",
                      cls: "bg-red-500/20 text-red-400 border-red-500/30",
                    },
                  };

                  const currentStatus = statusConfig[b.status] ?? {
                    label: b.status,
                    cls: "bg-white/10 text-smoke border-white/20",
                  };

                  const bookingTimeIST = formatInTimeZone(
                    new Date(b.start_time),
                    "Asia/Kolkata",
                    "d MMM yyyy · h:mm a 'IST'"
                  );

                  return (
                    <div
                      key={b.id}
                      className="border border-white/[0.08] bg-white/[0.02] px-5 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-white/[0.04] hover:border-white/[0.14] transition-all duration-200"
                    >
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-2 flex-wrap">
                          <span
                            className={`px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider border ${currentStatus.cls}`}
                          >
                            {currentStatus.label}
                          </span>
                          <span className="text-white/30 text-xs font-mono">
                            #{b.id.split("-")[0].toUpperCase()}
                          </span>
                        </div>
                        <p className="font-heading text-base truncate">
                          {b.service_tiers?.title ?? "Unknown Service"}
                        </p>
                        <p className="text-smoke text-sm mt-0.5">{bookingTimeIST}</p>
                        {b.client_email && (
                          <p className="text-white/40 text-xs mt-1 font-mono truncate">
                            {b.client_email}
                          </p>
                        )}
                      </div>

                      {b.status === "pending" && (
                        <BookingActionButtons bookingId={b.id} />
                      )}

                      {b.status === "confirmed" && (
                        <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0" />
                      )}
                      {b.status === "cancelled" && (
                        <XCircle className="w-5 h-5 text-red-400 flex-shrink-0" />
                      )}
                    </div>
                  );
                })
              ) : (
                <div className="border border-white/[0.08] border-dashed p-12 flex flex-col items-center text-center">
                  <Calendar className="w-10 h-10 text-white/20 mb-4" />
                  <p className="text-smoke italic text-sm">
                    No bookings in the ledger yet.
                  </p>
                </div>
              )}
            </div>
          </section>

          {/* ── Portfolio Manager ───────────────────────────────────────── */}
          <section>
            <div className="flex items-center gap-3 mb-6">
              <ImagePlus className="w-5 h-5 text-lamborghini-gold" />
              <h2 className="font-heading uppercase tracking-widest text-base">
                Portfolio Assets
              </h2>
            </div>

            <div className="border border-white/[0.08] bg-white/[0.02] p-6">
              <p className="text-smoke text-sm mb-6 leading-relaxed">
                Upload high-resolution editorial imagery. Images are optimized and
                served as WebP thumbnails via the Cloudinary edge network.
              </p>
              <PortfolioUploader />
            </div>

            {/* Cron Info Box */}
            <div className="mt-6 border border-white/[0.06] bg-white/[0.01] p-5">
              <p className="text-xs text-white/30 uppercase tracking-widest mb-2 font-heading">
                Automation
              </p>
              <p className="text-smoke text-sm">
                Nightly reminder emails are dispatched automatically via{" "}
                <code className="text-lamborghini-gold text-xs font-mono">
                  /api/cron/reminders
                </code>{" "}
                at 10:00 PM IST. Secured with{" "}
                <code className="text-lamborghini-gold text-xs font-mono">
                  CRON_SECRET
                </code>
                .
              </p>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}
