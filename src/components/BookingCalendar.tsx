"use client";

import { useState, useEffect, useRef } from "react";
import {
  ArrowUpRight,
  ArrowLeft,
  Loader2,
  CheckCircle,
  Sparkles,
  MapPin,
  Calendar,
  User,
} from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────
interface ServiceTier {
  id: string;
  title: string;
  description: string;
  duration_minutes: number;
  price_inr: number;
}

type WizardStep = 1 | 2 | 3 | 4;

type WizardState = "WIZARD" | "SUBMITTING" | "SUCCESS" | "ERROR";

interface FormData {
  // Step 1
  service_tier_id: string;
  event_type: string;
  event_date: string;
  ready_by_time: string;
  // Step 2
  location_type: "local" | "outstation";
  event_city: string;
  event_venue: string;

  // Step 3
  client_name: string;
  client_email: string;
  client_phone: string;
  notes: string;
}

// ─── Constants ────────────────────────────────────────────────────────────────




const getTomorrowStr = () => {
  const d = new Date();
  d.setDate(d.getDate() + 1);
  return d.toISOString().split("T")[0];
};

const getMaxDateStr = () => {
  const d = new Date();
  d.setFullYear(d.getFullYear() + 2);
  return d.toISOString().split("T")[0];
};

// ─── Step Indicator ───────────────────────────────────────────────────────────
const STEPS = [
  { num: 1, label: "Event" },
  { num: 2, label: "Venue" },
  { num: 3, label: "Contact" },
  { num: 4, label: "Review" },
];

function StepIndicator({ current }: { current: WizardStep }) {
  return (
    <div className="flex items-center justify-center gap-0 mb-12">
      {STEPS.map((step, idx) => {
        const isDone = step.num < current;
        const isActive = step.num === current;
        return (
          <div key={step.num} className="flex items-center">
            <div className="flex flex-col items-center gap-2">
              <div
                className={`w-8 h-8 flex items-center justify-center text-xs font-bold font-sans transition-all duration-500 ${
                  isDone
                    ? "bg-lamborghini-gold text-black"
                    : isActive
                    ? "bg-transparent border border-lamborghini-gold text-lamborghini-gold"
                    : "bg-transparent border border-white/20 text-white/30"
                }`}
              >
                {isDone ? "✓" : step.num}
              </div>
              <span
                className={`text-[9px] uppercase tracking-widest font-sans transition-colors duration-500 ${
                  isActive
                    ? "text-lamborghini-gold"
                    : isDone
                    ? "text-white/60"
                    : "text-white/20"
                }`}
              >
                {step.label}
              </span>
            </div>
            {idx < STEPS.length - 1 && (
              <div
                className={`w-16 h-[1px] mx-2 mb-5 transition-all duration-700 ${
                  isDone ? "bg-lamborghini-gold" : "bg-white/10"
                }`}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}

// ─── Field wrapper ────────────────────────────────────────────────────────────
function Field({
  label,
  required,
  children,
}: {
  label: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-2">
      <label className="text-[10px] uppercase tracking-[0.2em] text-ash font-sans font-semibold">
        {label}
        {required && <span className="text-lamborghini-gold ml-1">*</span>}
      </label>
      {children}
    </div>
  );
}

// ─── Input styles ─────────────────────────────────────────────────────────────
const inputCls =
  "w-full bg-black/40 border border-white/10 px-4 py-3.5 text-white placeholder:text-white/20 focus:outline-none focus:border-lamborghini-gold/60 focus:bg-black/60 transition-all duration-300 text-sm font-sans rounded-none appearance-none";



// ─── Gold CTA Button ──────────────────────────────────────────────────────────
function GoldButton({
  children,
  onClick,
  type = "button",
  disabled = false,
  icon,
}: {
  children: React.ReactNode;
  onClick?: () => void;
  type?: "button" | "submit";
  disabled?: boolean;
  icon?: React.ReactNode;
}) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className="bg-lamborghini-gold text-black flex items-center justify-center gap-4 px-8 py-4 text-xs uppercase tracking-[0.2em] font-sans font-bold transition-all duration-[700ms] ease-[cubic-bezier(0.32,0.72,0,1)] hover:bg-white active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed group w-full"
    >
      <span>{children}</span>
      <div className="w-7 h-7 bg-black/10 flex items-center justify-center transition-transform duration-[700ms] ease-[cubic-bezier(0.32,0.72,0,1)] group-hover:translate-x-1">
        {icon || <ArrowUpRight className="w-3.5 h-3.5 text-black" strokeWidth={2} />}
      </div>
    </button>
  );
}

function GhostButton({
  children,
  onClick,
}: {
  children: React.ReactNode;
  onClick?: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex items-center gap-3 text-ash hover:text-white transition-colors duration-300 text-xs uppercase tracking-widest font-sans"
    >
      <ArrowLeft className="w-4 h-4" strokeWidth={1.5} />
      {children}
    </button>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function BookingWizard() {
  const [step, setStep] = useState<WizardStep>(1);
  const [state, setState] = useState<WizardState>("WIZARD");
  const [serviceTiers, setServiceTiers] = useState<ServiceTier[]>([]);
  const [errorMessage, setErrorMessage] = useState("");
  const [successId, setSuccessId] = useState("");
  const topRef = useRef<HTMLDivElement>(null);

  const [form, setForm] = useState<FormData>({
    service_tier_id: "",
    event_type: "Bridal",
    event_date: getTomorrowStr(),
    ready_by_time: "",
    location_type: "local",
    event_city: "Varanasi",
    event_venue: "",
    client_name: "",
    client_email: "",
    client_phone: "",
    notes: "",
  });

  const [activeCategory, setActiveCategory] = useState<"makeup" | "hair">("makeup");
  const [activeMakeupOccasion, setActiveMakeupOccasion] = useState<"bridal" | "engagement" | "haldi_mehndi" | "party">("bridal");
  const [selectedAddon, setSelectedAddon] = useState<string>("");

  const toggleAddon = (title: string) => {
    setSelectedAddon((prev) => (prev === title ? "" : title));
  };

  useEffect(() => {
    if (activeCategory === "hair") {
      setSelectedAddon("");
    }
  }, [activeCategory]);

  // Scroll wizard top into view on step change
  useEffect(() => {
    topRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, [step]);

  // Fetch service tiers
  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch("/api/service-tiers");
        const data = await res.json();
        if (data.tiers?.length > 0) {
          setServiceTiers(data.tiers);
          const firstMakeup = data.tiers.find((t: ServiceTier) => t.title.toLowerCase().includes("makeup"));
          if (firstMakeup) {
            setForm((f) => ({ ...f, service_tier_id: firstMakeup.id }));
          } else {
            setForm((f) => ({ ...f, service_tier_id: data.tiers[0].id }));
          }
        }
      } catch {
        /* graceful degradation */
      }
    };
    load();
  }, []);

  const set = (key: keyof FormData, value: string) =>
    setForm((f) => ({ ...f, [key]: value }));

  const selectedTier = serviceTiers.find((t) => t.id === form.service_tier_id);

  // Get filtered tiers based on active tabs
  const getFilteredTiers = () => {
    if (activeCategory === "hair") {
      return serviceTiers.filter((t) => !t.title.toLowerCase().includes("makeup"));
    }
    return serviceTiers.filter((t) => {
      const title = t.title.toLowerCase();
      if (!title.includes("makeup")) return false;
      if (activeMakeupOccasion === "bridal") return title.includes("bridal");
      if (activeMakeupOccasion === "engagement") return title.includes("engagement");
      if (activeMakeupOccasion === "haldi_mehndi")
        return title.includes("haldi") || title.includes("mehandi") || title.includes("mehndi");
      if (activeMakeupOccasion === "party") return title.includes("party");
      return false;
    });
  };

  const filteredTiers = getFilteredTiers();

  // Synchronize event_type based on the selected tier's title
  useEffect(() => {
    if (!selectedTier) return;
    const title = selectedTier.title.toLowerCase();
    let deducedType = "Other";
    if (title.includes("bridal")) {
      deducedType = "Bridal";
    } else if (title.includes("engagement")) {
      deducedType = "Engagement";
    } else if (title.includes("haldi") || title.includes("mehndi") || title.includes("mehandi")) {
      deducedType = "Mehndi Ceremony";
    } else if (title.includes("party")) {
      deducedType = "Other";
    }
    setForm((f) => ({ ...f, event_type: deducedType }));
  }, [selectedTier]);

  // Auto-select first tier in filtered list when tab changes
  useEffect(() => {
    if (serviceTiers.length === 0) return;
    const filtered = getFilteredTiers();
    if (filtered.length > 0) {
      const hasCurrent = filtered.some((t) => t.id === form.service_tier_id);
      if (!hasCurrent) {
        setForm((f) => ({ ...f, service_tier_id: filtered[0].id }));
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeCategory, activeMakeupOccasion, serviceTiers]);

  // ── Validation ─────────────────────────────────────────────────────────────
  const canProceed = (s: WizardStep): boolean => {
    if (s === 1)
      return !!(form.service_tier_id && form.event_type && form.event_date);
    if (s === 2)
      return !!(form.event_city);
    if (s === 3)
      return !!(form.client_name && form.client_email && form.client_phone);
    return true;
  };

  // ── Submit ─────────────────────────────────────────────────────────────────
  const handleSubmit = async () => {
    setState("SUBMITTING");
    try {
      const res = await fetch("/api/bookings/inquire", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          hair_addon: selectedAddon,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to submit inquiry");
      setSuccessId(data.short_id || "");
      setState("SUCCESS");
    } catch (err: unknown) {
      const e = err as Error;
      setErrorMessage(e.message || "Something went wrong. Please try again.");
      setState("ERROR");
    }
  };

  // ─── Render: Submitting ───────────────────────────────────────────────────
  if (state === "SUBMITTING") {
    return (
      <div className="min-h-[520px] flex flex-col items-center justify-center text-center">
        <div className="relative mb-8">
          <div className="w-16 h-16 border border-lamborghini-gold/20 absolute inset-0 animate-ping rounded-none" />
          <Loader2 className="w-16 h-16 text-lamborghini-gold animate-spin relative" strokeWidth={0.8} />
        </div>
        <p className="text-white/50 font-sans text-xs uppercase tracking-[0.3em]">
          Registering your inquiry…
        </p>
      </div>
    );
  }

  // ─── Render: Success ──────────────────────────────────────────────────────
  if (state === "SUCCESS") {
    return (
      <div className="min-h-[520px] flex flex-col items-center justify-center text-center px-4 animate-in fade-in duration-700">
        {/* Radiant ring */}
        <div className="relative mb-10">
          <div className="absolute inset-0 w-24 h-24 rounded-none bg-lamborghini-gold/10 blur-2xl scale-150" />
          <div className="w-24 h-24 border border-lamborghini-gold/30 flex items-center justify-center relative">
            <CheckCircle className="w-10 h-10 text-lamborghini-gold" strokeWidth={1} />
          </div>
        </div>

        <p className="text-lamborghini-gold text-[10px] tracking-[0.35em] uppercase font-sans mb-4">
          Inquiry Received
        </p>
        <h2 className="text-3xl md:text-4xl font-heading text-white uppercase tracking-wider mb-2">
          Thank You
        </h2>
        {successId && (
          <p className="text-white/20 font-mono text-xs mb-6">Ref #{successId}</p>
        )}

        <div className="w-[1px] h-10 bg-lamborghini-gold/30 mx-auto my-4" />

        <p className="text-smoke font-sans text-sm leading-relaxed max-w-[420px] mb-8">
          Your inquiry has been registered. Our team will carefully review your
          event details and personally respond within{" "}
          <span className="text-lamborghini-gold font-semibold">48 hours</span>.
          Check your inbox — we have sent a confirmation to your email.
        </p>

        <div className="bg-white/[0.02] border border-white/10 px-6 py-4 text-center mb-8">
          <p className="text-[9px] uppercase tracking-[0.25em] text-ash mb-2">
            For urgent queries
          </p>
          <p className="text-smoke text-sm font-sans">
            tanmay8506@gmail.com
          </p>
          <p className="text-smoke text-sm font-sans mt-1">
            +91 9810753003
          </p>
        </div>

        <a
          href="/"
          className="border border-white/20 text-white/60 px-8 py-3 text-xs uppercase tracking-widest font-sans hover:text-white hover:border-white/40 transition-all duration-300"
        >
          Return Home
        </a>
      </div>
    );
  }

  // ─── Render: Error ────────────────────────────────────────────────────────
  if (state === "ERROR") {
    return (
      <div className="min-h-[520px] flex flex-col items-center justify-center text-center px-4 animate-in slide-in-from-bottom-4 duration-500">
        <div className="w-16 h-16 border border-red-500/30 bg-red-500/5 flex items-center justify-center mb-8">
          <span className="text-red-400 text-2xl font-bold">!</span>
        </div>
        <h3 className="text-xl font-heading text-white uppercase tracking-wider mb-4">
          Something Went Wrong
        </h3>
        <p className="text-smoke font-sans text-sm max-w-[360px] mb-8 leading-relaxed">
          {errorMessage}
        </p>
        <button
          onClick={() => {
            setState("WIZARD");
            setStep(1);
            setErrorMessage("");
          }}
          className="border border-white/20 text-white/60 px-8 py-3 text-xs uppercase tracking-widest font-sans hover:text-white hover:border-white/40 transition-all"
        >
          Try Again
        </button>
      </div>
    );
  }

  // ─── Render: Wizard ───────────────────────────────────────────────────────
  return (
    <div ref={topRef} className="w-full max-w-[760px] mx-auto">
      {/* Double-bezel outer frame */}
      <div className="border border-white/[0.06] p-[1px]">
        <div className="border border-white/[0.04] bg-white/[0.01] backdrop-blur-sm">
          
          {/* Step indicator header */}
          <div className="border-b border-white/[0.06] px-8 pt-10 pb-4">
            <StepIndicator current={step} />
          </div>

          {/* Content area */}
          <div className="px-8 py-10 min-h-[400px]">
            
            {/* ── STEP 1: Event Details ─────────────────────────────────────── */}
            {step === 1 && (
              <div className="animate-in fade-in slide-in-from-right-4 duration-500">
                <div className="flex items-center gap-3 mb-8">
                  <div className="w-8 h-8 bg-lamborghini-gold/10 border border-lamborghini-gold/20 flex items-center justify-center">
                    <Calendar className="w-4 h-4 text-lamborghini-gold" strokeWidth={1.5} />
                  </div>
                  <div>
                    <p className="text-[9px] text-ash uppercase tracking-[0.25em] font-sans">Step 1 of 4</p>
                    <h3 className="text-lg font-heading text-white uppercase tracking-wider">Event Details</h3>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div className="md:col-span-2">
                    <Field label="Service Package" required>
                      <div className="space-y-4">
                        {/* Main category tabs */}
                        <div className="flex border-b border-white/[0.08] mb-4">
                          <button
                            type="button"
                            onClick={() => setActiveCategory("makeup")}
                            className={`flex-1 py-3 text-xs uppercase tracking-[0.25em] font-sans font-bold border-b-2 transition-all duration-300 ${
                              activeCategory === "makeup"
                                ? "border-lamborghini-gold text-lamborghini-gold"
                                : "border-transparent text-white/40 hover:text-white/70"
                            }`}
                          >
                            Makeup Artistry
                          </button>
                          <button
                            type="button"
                            onClick={() => setActiveCategory("hair")}
                            className={`flex-1 py-3 text-xs uppercase tracking-[0.25em] font-sans font-bold border-b-2 transition-all duration-300 ${
                              activeCategory === "hair"
                                ? "border-lamborghini-gold text-lamborghini-gold"
                                : "border-transparent text-white/40 hover:text-white/70"
                            }`}
                          >
                            Hairstyling
                          </button>
                        </div>

                        {/* Sub-tabs for Makeup occasions */}
                        {activeCategory === "makeup" && (
                          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-4">
                            {(["bridal", "engagement", "haldi_mehndi", "party"] as const).map((occ) => {
                              const label =
                                occ === "haldi_mehndi"
                                  ? "Haldi & Mehndi"
                                  : occ.charAt(0).toUpperCase() + occ.slice(1);
                              const isActive = activeMakeupOccasion === occ;
                              return (
                                <button
                                  key={occ}
                                  type="button"
                                  onClick={() => setActiveMakeupOccasion(occ)}
                                  className={`py-2 px-3 text-[9px] uppercase tracking-widest font-sans border transition-all duration-300 text-center ${
                                    isActive
                                      ? "bg-lamborghini-gold/10 border-lamborghini-gold text-lamborghini-gold font-semibold"
                                      : "bg-transparent border-white/5 text-white/40 hover:border-white/20 hover:text-white"
                                  }`}
                                >
                                  {label}
                                </button>
                              );
                            })}
                          </div>
                        )}

                        {/* Package cards grid */}
                        {filteredTiers.length === 0 ? (
                          <div className="py-8 text-center text-white/20 text-xs font-sans">
                            Loading packages…
                          </div>
                        ) : (
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            {filteredTiers.map((t) => {
                              const isSelected = form.service_tier_id === t.id;
                              
                              // Clear up occasion details from the card title if it's a makeup card
                              // e.g. "Bridal Makeup (Standard)" -> "Standard"
                              const displayName = activeCategory === "makeup" && t.title.includes("(")
                                ? t.title.substring(t.title.indexOf("(") + 1, t.title.indexOf(")"))
                                : t.title;

                              return (
                                <button
                                  key={t.id}
                                  type="button"
                                  onClick={() => set("service_tier_id", t.id)}
                                  className={`flex flex-col text-left p-5 border transition-all duration-300 relative min-h-[150px] ${
                                    isSelected
                                      ? "bg-lamborghini-gold/[0.04] border-lamborghini-gold text-white"
                                      : "bg-white/[0.01] border-white/5 text-white/50 hover:border-white/20 hover:bg-white/[0.02]"
                                  }`}
                                >
                                  <div className="flex justify-between items-start w-full gap-2 mb-2">
                                    <span className={`text-[10px] uppercase tracking-wider font-semibold transition-colors duration-300 ${
                                      isSelected ? "text-lamborghini-gold" : "text-ash"
                                    }`}>
                                      {displayName}
                                    </span>
                                    <span className="text-xs font-mono font-bold text-white whitespace-nowrap">
                                      ₹{parseFloat(t.price_inr.toString()).toLocaleString()}
                                    </span>
                                  </div>

                                  <p className="text-[11px] font-sans text-white/30 leading-relaxed mb-4 flex-grow line-clamp-3">
                                    {t.description}
                                  </p>

                                  <div className="flex justify-between items-center w-full mt-auto pt-3 border-t border-white/[0.04] text-[9px] text-white/20 uppercase tracking-wider font-sans">
                                    <span>Duration</span>
                                    <span className="font-mono text-white/40 normal-case">{t.duration_minutes} min</span>
                                  </div>

                                  {isSelected && (
                                    <div className="absolute top-0 right-0 w-2 h-2 bg-lamborghini-gold" />
                                  )}
                                </button>
                              );
                            })}
                          </div>
                        )}

                        {/* Hair Add-on section — shown only when a makeup package is selected */}
                        {activeCategory === "makeup" && serviceTiers.filter((t) => !t.title.toLowerCase().includes("makeup")).length > 0 && (
                          <div className="mt-8 border-t border-white/[0.08] pt-6">
                            <p className="text-[10px] uppercase tracking-[0.25em] text-ash font-sans font-semibold mb-3">
                              Add a Hairstyling Service — Optional
                            </p>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                              {serviceTiers
                                .filter((t) => !t.title.toLowerCase().includes("makeup"))
                                .map((hair) => {
                                  const isSelected = selectedAddon === hair.title;
                                  return (
                                    <button
                                      key={hair.id}
                                      type="button"
                                      onClick={() => toggleAddon(hair.title)}
                                      className={`flex items-center justify-between p-4 border text-left transition-all duration-300 ${
                                        isSelected
                                          ? "bg-lamborghini-gold/[0.04] border-lamborghini-gold text-white"
                                          : "bg-white/[0.01] border-white/5 text-white/40 hover:border-white/20 hover:bg-white/[0.02]"
                                      }`}
                                    >
                                      <div className="flex items-center gap-3">
                                        <div className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center transition-all ${
                                          isSelected ? "border-lamborghini-gold bg-lamborghini-gold" : "border-white/30 bg-transparent"
                                        }`}>
                                          {isSelected && <div className="w-1.5 h-1.5 rounded-full bg-black" />}
                                        </div>
                                        <div>
                                          <p className="text-xs font-sans font-semibold text-white">{hair.title}</p>
                                          <p className="text-[10px] text-ash mt-0.5">{hair.duration_minutes} min</p>
                                        </div>
                                      </div>
                                      <span className="text-xs font-mono font-bold text-lamborghini-gold">
                                        +₹{parseFloat(hair.price_inr.toString()).toLocaleString()}
                                      </span>
                                    </button>
                                  );
                                })}
                            </div>
                          </div>
                        )}
                      </div>
                    </Field>
                  </div>

                  <div className="md:col-span-2">
                    <Field label="Event Date" required>
                      <input
                        type="date"
                        value={form.event_date}
                        min={getTomorrowStr()}
                        max={getMaxDateStr()}
                        onChange={(e) => set("event_date", e.target.value)}
                        className={inputCls}
                        required
                      />
                    </Field>
                  </div>


                </div>

                <div className="mt-8">
                  <GoldButton onClick={() => setStep(2)} disabled={!canProceed(1)}>
                    Venue & Logistics
                  </GoldButton>
                </div>
              </div>
            )}

            {/* ── STEP 2: Venue & Logistics ─────────────────────────────────── */}
            {step === 2 && (
              <div className="animate-in fade-in slide-in-from-right-4 duration-500">
                <div className="flex items-center gap-3 mb-8">
                  <div className="w-8 h-8 bg-lamborghini-gold/10 border border-lamborghini-gold/20 flex items-center justify-center">
                    <MapPin className="w-4 h-4 text-lamborghini-gold" strokeWidth={1.5} />
                  </div>
                  <div>
                    <p className="text-[9px] text-ash uppercase tracking-[0.25em] font-sans">Step 2 of 4</p>
                    <h3 className="text-lg font-heading text-white uppercase tracking-wider">Venue & Logistics</h3>
                  </div>
                </div>

                <div className="space-y-5">


                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <Field label="City / District" required>
                      <input
                        type="text"
                        value={form.event_city}
                        onChange={(e) => set("event_city", e.target.value)}
                        placeholder="e.g. Varanasi, Delhi, Mumbai"
                        className={inputCls}
                        required
                      />
                    </Field>

                    <Field label="Venue / Hotel Name">
                      <input
                        type="text"
                        value={form.event_venue}
                        onChange={(e) => set("event_venue", e.target.value)}
                        placeholder="e.g. The Leela Palace, Home"
                        className={inputCls}
                      />
                    </Field>
                  </div>


                </div>

                <div className="mt-8 flex flex-col gap-3">
                  <GoldButton onClick={() => setStep(3)} disabled={!canProceed(2)}>
                    Contact Information
                  </GoldButton>
                  <div className="flex justify-center pt-1">
                    <GhostButton onClick={() => setStep(1)}>Back to Event</GhostButton>
                  </div>
                </div>
              </div>
            )}

            {/* ── STEP 3: Contact Details ───────────────────────────────────── */}
            {step === 3 && (
              <div className="animate-in fade-in slide-in-from-right-4 duration-500">
                <div className="flex items-center gap-3 mb-8">
                  <div className="w-8 h-8 bg-lamborghini-gold/10 border border-lamborghini-gold/20 flex items-center justify-center">
                    <User className="w-4 h-4 text-lamborghini-gold" strokeWidth={1.5} />
                  </div>
                  <div>
                    <p className="text-[9px] text-ash uppercase tracking-[0.25em] font-sans">Step 3 of 4</p>
                    <h3 className="text-lg font-heading text-white uppercase tracking-wider">Contact Details</h3>
                  </div>
                </div>

                <div className="space-y-5">
                  <Field label="Full Name" required>
                    <input
                      type="text"
                      value={form.client_name}
                      onChange={(e) => set("client_name", e.target.value)}
                      placeholder="e.g. Priya Sharma"
                      className={inputCls}
                      autoComplete="name"
                      required
                    />
                  </Field>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <Field label="Email Address" required>
                      <input
                        type="email"
                        value={form.client_email}
                        onChange={(e) => set("client_email", e.target.value)}
                        placeholder="name@example.com"
                        className={inputCls}
                        autoComplete="email"
                        required
                      />
                    </Field>

                    <Field label="WhatsApp / Phone" required>
                      <input
                        type="tel"
                        value={form.client_phone}
                        onChange={(e) => set("client_phone", e.target.value)}
                        placeholder="+91 XXXXX XXXXX"
                        className={inputCls}
                        autoComplete="tel"
                        required
                      />
                    </Field>
                  </div>

                  <Field label="Design Inspiration & Notes">
                    <textarea
                      value={form.notes}
                      onChange={(e) => set("notes", e.target.value)}
                      placeholder="Share your outfit color palette, design style, Pinterest references, or any special requirements…"
                      rows={4}
                      className={`${inputCls} resize-none leading-relaxed`}
                    />
                  </Field>
                </div>

                <div className="mt-8 flex flex-col gap-3">
                  <GoldButton onClick={() => setStep(4)} disabled={!canProceed(3)}>
                    Review & Submit
                  </GoldButton>
                  <div className="flex justify-center pt-1">
                    <GhostButton onClick={() => setStep(2)}>Back to Venue</GhostButton>
                  </div>
                </div>
              </div>
            )}

            {/* ── STEP 4: Review & Confirm ──────────────────────────────────── */}
            {step === 4 && (
              <div className="animate-in fade-in slide-in-from-right-4 duration-500">
                <div className="flex items-center gap-3 mb-8">
                  <div className="w-8 h-8 bg-lamborghini-gold/10 border border-lamborghini-gold/20 flex items-center justify-center">
                    <Sparkles className="w-4 h-4 text-lamborghini-gold" strokeWidth={1.5} />
                  </div>
                  <div>
                    <p className="text-[9px] text-ash uppercase tracking-[0.25em] font-sans">Step 4 of 4</p>
                    <h3 className="text-lg font-heading text-white uppercase tracking-wider">Review & Confirm</h3>
                  </div>
                </div>

                {/* Review cards */}
                <div className="space-y-3 mb-8">
                  {/* Event */}
                  <div className="bg-white/[0.02] border border-white/[0.06] p-5">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-3.5 h-3.5 text-lamborghini-gold" strokeWidth={1.5} />
                        <p className="text-[9px] uppercase tracking-[0.25em] text-ash font-sans font-semibold">Event</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => setStep(1)}
                        className="text-[9px] uppercase tracking-widest text-lamborghini-gold/60 hover:text-lamborghini-gold font-sans transition-colors"
                      >
                        Edit
                      </button>
                    </div>
                    <div className="grid grid-cols-2 gap-x-6 gap-y-3 text-xs font-sans">
                      <ReviewRow label="Package" value={selectedTier?.title || "—"} />
                      <ReviewRow label="Event Type" value={form.event_type} />
                      <ReviewRow label="Date" value={new Date(form.event_date + "T12:00:00").toLocaleDateString("en-IN", { weekday: "short", day: "numeric", month: "long", year: "numeric" })} />
                      {selectedAddon && (
                        <div className="col-span-2 mt-2 pt-2 border-t border-white/[0.04]">
                          <p className="text-white/25 text-[9px] uppercase tracking-widest mb-1">Hairstyling Add-on</p>
                          <p className="text-lamborghini-gold text-xs font-medium">{selectedAddon}</p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Venue */}
                  <div className="bg-white/[0.02] border border-white/[0.06] p-5">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-2">
                        <MapPin className="w-3.5 h-3.5 text-lamborghini-gold" strokeWidth={1.5} />
                        <p className="text-[9px] uppercase tracking-[0.25em] text-ash font-sans font-semibold">Venue</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => setStep(2)}
                        className="text-[9px] uppercase tracking-widest text-lamborghini-gold/60 hover:text-lamborghini-gold font-sans transition-colors"
                      >
                        Edit
                      </button>
                    </div>
                    <div className="grid grid-cols-2 gap-x-6 gap-y-3 text-xs font-sans">
                      <ReviewRow label="City" value={form.event_city} />
                      {form.event_venue && <ReviewRow label="Venue" value={form.event_venue} />}
                    </div>
                  </div>

                  {/* Contact */}
                  <div className="bg-white/[0.02] border border-white/[0.06] p-5">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-2">
                        <User className="w-3.5 h-3.5 text-lamborghini-gold" strokeWidth={1.5} />
                        <p className="text-[9px] uppercase tracking-[0.25em] text-ash font-sans font-semibold">Contact</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => setStep(3)}
                        className="text-[9px] uppercase tracking-widest text-lamborghini-gold/60 hover:text-lamborghini-gold font-sans transition-colors"
                      >
                        Edit
                      </button>
                    </div>
                    <div className="grid grid-cols-2 gap-x-6 gap-y-3 text-xs font-sans">
                      <ReviewRow label="Name" value={form.client_name} />
                      <ReviewRow label="Email" value={form.client_email} />
                      <ReviewRow label="Phone" value={form.client_phone} />
                    </div>
                    {form.notes && (
                      <div className="mt-3 pt-3 border-t border-white/[0.04]">
                        <p className="text-[9px] uppercase tracking-widest text-ash font-sans mb-1.5">Notes</p>
                        <p className="text-white/50 text-xs font-sans italic leading-relaxed">&ldquo;{form.notes}&rdquo;</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Total Cost Breakdown */}
                {selectedTier && (() => {
                  const addonTier = selectedAddon
                    ? serviceTiers.find((t) => t.title === selectedAddon)
                    : null;
                  const base = parseFloat(selectedTier.price_inr.toString());
                  const addon = addonTier ? parseFloat(addonTier.price_inr.toString()) : 0;
                  const total = base + addon;
                  return (
                    <div className="mb-6 border border-lamborghini-gold/20 bg-lamborghini-gold/[0.02]">
                      <div className="px-5 py-3 border-b border-lamborghini-gold/10">
                        <p className="text-[9px] uppercase tracking-[0.25em] text-lamborghini-gold/70 font-sans font-semibold">
                          Estimated Total
                        </p>
                      </div>
                      <div className="px-5 py-4 space-y-3">
                        {/* Base package */}
                        <div className="flex items-center justify-between">
                          <p className="text-white/50 text-xs font-sans">{selectedTier.title}</p>
                          <p className="text-white/70 text-xs font-mono font-semibold">
                            ₹{base.toLocaleString()}
                          </p>
                        </div>
                        {/* Add-on */}
                        {addonTier && (
                          <div className="flex items-center justify-between">
                            <p className="text-white/50 text-xs font-sans">{addonTier.title}</p>
                            <p className="text-white/70 text-xs font-mono font-semibold">
                              +₹{addon.toLocaleString()}
                            </p>
                          </div>
                        )}
                        {/* Divider */}
                        <div className="border-t border-lamborghini-gold/10 pt-3 flex items-center justify-between">
                          <p className="text-white text-sm font-sans font-bold uppercase tracking-wider">Total</p>
                          <p className="text-lamborghini-gold text-lg font-mono font-bold">
                            ₹{total.toLocaleString()}
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                })()}

                {/* Disclaimer */}
                <p className="text-white/20 text-[11px] font-sans leading-relaxed text-center mb-6">
                  By submitting, you agree to our inquiry process. No payment is required at this stage.
                  Our team will review and respond within <span className="text-lamborghini-gold/60">48 hours</span>.
                </p>

                <div className="flex flex-col gap-3">
                  <GoldButton onClick={handleSubmit} icon={<Sparkles className="w-3.5 h-3.5 text-black" />}>
                    Send Inquiry
                  </GoldButton>
                  <div className="flex justify-center pt-1">
                    <GhostButton onClick={() => setStep(3)}>Back to Contact</GhostButton>
                  </div>
                </div>
              </div>
            )}

          </div>

          {/* Bottom progress bar */}
          <div className="border-t border-white/[0.04] px-8 py-4 flex items-center justify-between">
            <div className="flex gap-1">
              {[1, 2, 3, 4].map((s) => (
                <div
                  key={s}
                  className={`h-[2px] w-10 transition-all duration-700 ${
                    s <= step ? "bg-lamborghini-gold" : "bg-white/10"
                  }`}
                />
              ))}
            </div>
            <span className="text-[10px] text-ash uppercase tracking-widest font-sans">
              {step} / 4
            </span>
          </div>

        </div>
      </div>
    </div>
  );
}

// ─── Review Row helper ────────────────────────────────────────────────────────
function ReviewRow({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-white/25 text-[9px] uppercase tracking-widest mb-1">{label}</p>
      <p className="text-white/80 text-xs font-medium truncate">{value}</p>
    </div>
  );
}
