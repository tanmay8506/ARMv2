"use client";

import { useState } from "react";
import {
  LayoutDashboard,
  Calendar,
  ImagePlus,
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Sliders,
  LogOut,
} from "lucide-react";
import { formatInTimeZone } from "date-fns-tz";
import BookingActionButtons from "./BookingActionButtons";
import PortfolioUploader from "./PortfolioUploader";
import SettingsControl from "./SettingsControl";
import PortfolioManager from "./PortfolioManager";

interface Settings {
  id?: string;
  working_hours_start: string;
  working_hours_end: string;
  timezone: string;
}

interface ServiceTier {
  id: string;
  title: string;
  description: string | null;
  duration_minutes: number;
  price_inr: number;
  is_active: boolean;
}

interface PortfolioAsset {
  id: string;
  title: string;
  category: string;
  cloudinary_path: string;
  width: number;
  height: number;
  display_order: number;
  is_active: boolean;
}

interface Booking {
  id: string;
  client_id: string | null;
  client_name: string | null;
  client_email: string | null;
  client_phone: string | null;
  start_time: string;
  end_time: string;
  status: string;
  notes: string | null;
  admin_notes: string | null;
  created_at: string;
  service_tiers?: {
    title: string;
  } | null;
}

interface AdminDashboardClientProps {
  userEmail: string;
  initialBookings: Booking[];
  initialSettings: Settings | null;
  initialServiceTiers: ServiceTier[];
  initialPortfolioAssets: PortfolioAsset[];
}

type Tab = "bookings" | "portfolio" | "settings";

export default function AdminDashboardClient({
  userEmail,
  initialBookings,
  initialSettings,
  initialServiceTiers,
  initialPortfolioAssets,
}: AdminDashboardClientProps) {
  const [activeTab, setActiveTab] = useState<Tab>("bookings");
  const bookings = initialBookings;

  // Calculate stats
  const pending = bookings.filter((b) => b.status === "pending").length;
  const confirmed = bookings.filter((b) => b.status === "confirmed").length;
  const held = bookings.filter((b) => b.status === "held").length;

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
        <div className="flex items-center gap-6">
          <span className="text-xs text-white/30 font-mono hidden sm:inline">
            {userEmail}
          </span>
          <form action="/auth/signout" method="post">
            <button
              type="submit"
              className="flex items-center gap-2 text-smoke hover:text-white transition-colors text-xs uppercase tracking-widest font-semibold"
            >
              <LogOut className="w-3.5 h-3.5" />
              Sign Out
            </button>
          </form>
        </div>
      </header>

      <main className="max-w-[1400px] mx-auto px-8 py-10">
        {/* Page title & Tabs */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
          <div>
            <h1 className="text-4xl font-heading uppercase tracking-[0.15em] text-white mb-2">
              Control Centre
            </h1>
            <p className="text-smoke text-sm">
              Manage bookings, portfolio assets, and studio operations.
            </p>
          </div>

          {/* Navigation Tabs */}
          <div className="flex bg-white/[0.02] border border-white/10 p-1">
            {[
              { id: "bookings", label: "Bookings", icon: Calendar },
              { id: "portfolio", label: "Portfolio", icon: ImagePlus },
              { id: "settings", label: "Settings", icon: Sliders },
            ].map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as Tab)}
                  className={`flex items-center gap-2 px-5 py-2.5 text-xs uppercase tracking-widest font-semibold font-sans transition-all duration-300 rounded-none ${
                    isActive
                      ? "bg-lamborghini-gold text-black font-bold"
                      : "text-smoke hover:text-white hover:bg-white/5"
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Tab 1: BOOKINGS */}
        {activeTab === "bookings" && (
          <div className="space-y-10 animate-in fade-in duration-500">
            {/* Stats Row */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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

            {/* Booking Ledger */}
            <section className="border border-white/[0.08] bg-white/[0.01] p-6">
              <div className="flex items-center gap-3 mb-6">
                <Calendar className="w-5 h-5 text-lamborghini-gold" />
                <h2 className="font-heading uppercase tracking-widest text-base">
                  Booking Ledger
                </h2>
              </div>

              <div className="space-y-3">
                {bookings.length > 0 ? (
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
                        className="border border-white/[0.08] bg-white/[0.02] px-6 py-5 flex flex-col md:flex-row md:items-center justify-between gap-6 hover:bg-white/[0.04] hover:border-white/[0.14] transition-all duration-200"
                      >
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-2.5 flex-wrap">
                            <span
                              className={`px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider border ${currentStatus.cls}`}
                            >
                              {currentStatus.label}
                            </span>
                            <span className="text-white/30 text-xs font-mono">
                              #{b.id.split("-")[0].toUpperCase()}
                            </span>
                          </div>
                          <h4 className="font-heading text-lg truncate">
                            {b.service_tiers?.title ?? "Unknown Service"}
                          </h4>
                          <p className="text-smoke text-sm mt-1">{bookingTimeIST}</p>

                          <div className="mt-4 pt-3 border-t border-white/[0.04] grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                            <div>
                              <p className="text-white/30 uppercase tracking-wider mb-1">Client Details</p>
                              <p className="text-white font-medium">{b.client_name || "N/A"}</p>
                              <p className="text-white/50 font-mono mt-0.5">{b.client_email || "N/A"}</p>
                              <p className="text-white/50 font-mono mt-0.5">{b.client_phone || "N/A"}</p>
                            </div>
                            {b.notes && (
                              <div>
                                <p className="text-white/30 uppercase tracking-wider mb-1">Notes & Inspiration</p>
                                <p className="text-smoke italic leading-relaxed">&ldquo;{b.notes}&rdquo;</p>
                              </div>
                            )}
                          </div>
                        </div>

                        <div className="flex-shrink-0 self-start md:self-center">
                          {b.status === "pending" && (
                            <BookingActionButtons bookingId={b.id} />
                          )}
                          {b.status === "confirmed" && (
                            <div className="flex items-center gap-2 text-emerald-400 text-sm uppercase tracking-wider font-semibold">
                              <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                              <span>Confirmed</span>
                            </div>
                          )}
                          {b.status === "cancelled" && (
                            <div className="flex items-center gap-2 text-red-400 text-sm uppercase tracking-wider font-semibold">
                              <XCircle className="w-5 h-5 text-red-400" />
                              <span>Cancelled</span>
                            </div>
                          )}
                        </div>
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
          </div>
        )}

        {/* Tab 2: PORTFOLIO */}
        {activeTab === "portfolio" && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start animate-in fade-in duration-500">
            <div className="lg:col-span-1 space-y-6">
              <div className="border border-white/[0.08] bg-white/[0.02] p-6 space-y-6">
                <div className="flex items-center gap-3">
                  <ImagePlus className="w-5 h-5 text-lamborghini-gold" />
                  <h2 className="font-heading uppercase tracking-widest text-base">
                    Portfolio Manager
                  </h2>
                </div>
                <p className="text-smoke text-sm leading-relaxed">
                  Upload high-resolution editorial imagery. Images are optimized and
                  served as WebP thumbnails via the Cloudinary edge network.
                </p>
              </div>

              <div className="border border-white/[0.08] bg-white/[0.02] p-6">
                <PortfolioUploader />
              </div>
            </div>

            <div className="lg:col-span-2 border border-white/[0.08] bg-white/[0.02] p-6">
              <PortfolioManager initialAssets={initialPortfolioAssets} />
            </div>
          </div>
        )}

        {/* Tab 3: SETTINGS & PACKAGES */}
        {activeTab === "settings" && (
          <div className="animate-in fade-in duration-500">
            <SettingsControl
              initialSettings={initialSettings}
              initialServiceTiers={initialServiceTiers}
            />
          </div>
        )}
      </main>
    </div>
  );
}
