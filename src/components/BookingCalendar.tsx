"use client";

import { useState, useEffect, useRef } from "react";
import { ArrowUpRight, Loader2, Calendar as CalendarIcon, Clock, CheckCircle, AlertCircle } from "lucide-react";
import { useSearchParams } from "next/navigation";

type BookingState = "IDLE" | "SLOTS" | "HOLDING" | "FORM" | "SUBMITTING" | "SUCCESS" | "ERROR";

interface ServiceTier {
  id: string;
  title: string;
  description: string;
  duration_minutes: number;
  price_inr: number;
}

export default function BookingCalendar() {
  const searchParams = useSearchParams();
  const tierParam = searchParams ? searchParams.get("tier") : null;

  const [state, setState] = useState<BookingState>("IDLE");
  const [serviceTiers, setServiceTiers] = useState<ServiceTier[]>([]);
  const [selectedTier, setSelectedTier] = useState<string>("");
  const [selectedDate, setSelectedDate] = useState<string>("");
  const [slots, setSlots] = useState<string[]>([]);

  const [bookingId, setBookingId] = useState<string | null>(null);
  const [timeLeft, setTimeLeft] = useState<number>(15 * 60); // 15 mins in seconds
  const [errorMessage, setErrorMessage] = useState("");

  // Form states
  const [clientName, setClientName] = useState("");
  const [clientEmail, setClientEmail] = useState("");
  const [clientPhone, setClientPhone] = useState("");
  const [notes, setNotes] = useState("");

  const containerRef = useRef<HTMLDivElement>(null);

  // Initialize: Get tomorrow's date string & fetch service tiers
  useEffect(() => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    setSelectedDate(tomorrow.toISOString().split("T")[0]);

    const fetchTiers = async () => {
      try {
        const res = await fetch("/api/service-tiers");
        const data = await res.json();
        if (data.tiers) {
          setServiceTiers(data.tiers);
          if (data.tiers.length > 0) {
            const matched = data.tiers.find((t: ServiceTier) => t.id === tierParam);
            setSelectedTier(matched ? matched.id : data.tiers[0].id);
          }
        }
      } catch (err) {
        console.error("Failed to load tiers:", err);
      }
    };
    fetchTiers();
  }, [tierParam]);

  // Timer logic for HOLDING and FORM states
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if ((state === "HOLDING" || state === "FORM") && timeLeft > 0) {
      timer = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            setState("ERROR");
            setErrorMessage("Your 15-minute slot reservation has expired. Please select another slot.");
            setBookingId(null);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [state, timeLeft]);

  // Helper to generate a client tracking UUID
  const getClientTrackingId = () => {
    if (typeof window === "undefined") return "00000000-0000-0000-0000-000000000001";
    let id = localStorage.getItem("arm_client_tracking_id");
    if (!id) {
      id = "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
        const r = (Math.random() * 16) | 0;
        const v = c === "x" ? r : (r & 0x3) | 0x8;
        return v.toString(16);
      });
      localStorage.setItem("arm_client_tracking_id", id);
    }
    return id;
  };

  // Format time (MM:SS)
  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60).toString().padStart(2, "0");
    const s = (seconds % 60).toString().padStart(2, "0");
    return `${m}:${s}`;
  };

  const handleSearchSlots = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDate || !selectedTier) return;
    
    setState("HOLDING");
    setErrorMessage("");

    try {
      const tier = serviceTiers.find((t) => t.id === selectedTier);
      const duration = tier ? tier.duration_minutes : 60;

      const res = await fetch(`/api/availability?date=${selectedDate}&duration=${duration}`);
      if (!res.ok) throw new Error("Failed to fetch slots");
      
      const data = await res.json();
      setSlots(data.slots || []);
      setState("SLOTS");
    } catch {
      setState("ERROR");
      setErrorMessage("Could not load availability. Please verify your connection.");
    }
  };

  const holdSlot = async (slotIso: string) => {
    setState("HOLDING");
    setTimeLeft(15 * 60);

    const tier = serviceTiers.find((t) => t.id === selectedTier);
    const duration = tier ? tier.duration_minutes : 60;
    const endIso = new Date(new Date(slotIso).getTime() + duration * 60 * 1000).toISOString();

    try {
      const payload = {
        client_id: getClientTrackingId(),
        service_tier_id: selectedTier,
        start_time: slotIso,
        end_time: endIso,
      };

      const res = await fetch("/api/bookings/hold", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        if (res.status === 409) {
          throw new Error("This slot was just taken by another client. Please select another slot.");
        }
        throw new Error(data.error || "Failed to hold slot");
      }

      setBookingId(data.booking_id);
      setState("FORM");
    } catch (err: unknown) {
      setState("ERROR");
      const error = err as Error;
      setErrorMessage(error.message || "Failed to secure slot. Try again.");
    }
  };

  const confirmBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!bookingId || !clientName || !clientEmail || !clientPhone) return;

    setState("SUBMITTING");
    try {
      const payload = {
        booking_id: bookingId,
        transaction_id: "TXN-" + Math.random().toString(36).substring(2, 9).toUpperCase(),
        client_name: clientName,
        client_email: clientEmail,
        client_phone: clientPhone,
        notes,
      };

      const res = await fetch("/api/bookings/confirm", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to confirm booking");
      }

      setState("SUCCESS");
    } catch (err: unknown) {
      setState("ERROR");
      const error = err as Error;
      setErrorMessage(error.message || "Failed to finalize booking.");
    }
  };

  // Get tomorrow's date string for input minimum
  const getTomorrowString = () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split("T")[0];
  };

  return (
    <div ref={containerRef} className="w-full max-w-[800px] mx-auto bg-white/[0.02] border border-white/10 p-8 md:p-12 min-h-[450px] flex flex-col items-center justify-center relative shadow-[inset_0_1px_1px_rgba(255,255,255,0.05)] rounded-none">
      
      {state === "IDLE" && (
        <form onSubmit={handleSearchSlots} className="w-full flex flex-col items-center text-center">
          <CalendarIcon className="w-12 h-12 text-lamborghini-gold mb-6 opacity-80" />
          <h3 className="text-2xl font-heading text-white uppercase tracking-wider mb-4">Select a Session</h3>
          <p className="text-smoke font-sans mb-8 max-w-[400px]">Choose your desired package and date to check live slot availability.</p>
          
          <div className="w-full max-w-[500px] space-y-5 mb-8 text-left">
            <div>
              <label className="block text-xs uppercase tracking-widest text-smoke mb-2">Service Package</label>
              <select
                value={selectedTier}
                onChange={(e) => setSelectedTier(e.target.value)}
                className="w-full bg-[#0A0A0A] border border-white/10 px-4 py-3 text-white focus:outline-none focus:border-lamborghini-gold transition-colors text-sm rounded-none"
              >
                {serviceTiers.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.title} — ₹{parseFloat(t.price_inr.toString()).toLocaleString()} ({t.duration_minutes} min)
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs uppercase tracking-widest text-smoke mb-2">Appointment Date</label>
              <input
                type="date"
                min={getTomorrowString()}
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="w-full bg-[#0A0A0A] border border-white/10 px-4 py-3 text-white focus:outline-none focus:border-lamborghini-gold transition-colors text-sm rounded-none"
                required
              />
            </div>
          </div>

          <button 
            type="submit"
            className="bg-lamborghini-gold text-black flex items-center gap-4 px-8 py-4 text-sm uppercase transition-all duration-[700ms] ease-[cubic-bezier(0.32,0.72,0,1)] font-sans tracking-widest font-semibold border-none rounded-none active:scale-[0.98] hover:bg-white group"
          >
            <span>Search Slots</span>
            <div className="w-8 h-8 bg-black/10 flex items-center justify-center transition-transform duration-[700ms] ease-[cubic-bezier(0.32,0.72,0,1)] group-hover:translate-x-1 group-hover:-translate-y-[1px] group-hover:scale-105">
              <ArrowUpRight className="w-4 h-4 text-black" strokeWidth={1.5} />
            </div>
          </button>
        </form>
      )}

      {state === "HOLDING" && (
        <div className="flex flex-col items-center text-center">
          <Loader2 className="w-10 h-10 text-lamborghini-gold animate-spin mb-6" />
          <p className="text-smoke font-sans uppercase tracking-widest text-sm">Synchronizing Secure Ledger...</p>
        </div>
      )}

      {state === "SLOTS" && (
        <div className="w-full flex flex-col items-center animate-in fade-in duration-700">
          <h3 className="text-xl font-heading text-white uppercase tracking-wider mb-2 text-center">Available Appointments</h3>
          <p className="text-smoke text-sm mb-8 text-center">Select an open slot below to temporarily hold it for 15 minutes.</p>
          
          {slots.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 w-full mb-8">
              {slots.map((slot) => {
                const d = new Date(slot);
                const timeStr = d.toLocaleTimeString("en-IN", { timeZone: "Asia/Kolkata", hour: "2-digit", minute: "2-digit" });
                return (
                  <button
                    key={slot}
                    onClick={() => holdSlot(slot)}
                    className="border border-white/20 bg-transparent text-white py-4 px-2 hover:bg-lamborghini-gold hover:text-black hover:border-lamborghini-gold transition-colors font-sans text-sm tracking-wider flex flex-col items-center gap-2 rounded-none"
                  >
                    <span className="font-semibold">{timeStr}</span>
                  </button>
                );
              })}
            </div>
          ) : (
            <div className="flex flex-col items-center text-center py-6">
              <AlertCircle className="w-10 h-10 text-amber-500 mb-4" />
              <p className="text-smoke font-sans mb-8">No available slots found for this date. Please choose another day.</p>
            </div>
          )}

          <button 
            onClick={() => setState("IDLE")}
            className="border border-white/20 text-white px-8 py-3 text-sm uppercase transition-all hover:bg-white/5 font-sans tracking-widest rounded-none"
          >
            Go Back
          </button>
        </div>
      )}

      {state === "FORM" && (
        <div className="w-full flex flex-col items-center animate-in fade-in duration-700">
          <div className="flex items-center gap-3 text-lamborghini-gold mb-8 bg-lamborghini-gold/10 px-4 py-2 border border-lamborghini-gold/20">
            <Clock className="w-4 h-4" />
            <span className="font-sans font-semibold tracking-widest text-sm">HOLD EXPIRES IN {formatTime(timeLeft)}</span>
          </div>
          
          <h3 className="text-2xl font-heading text-white uppercase tracking-wider mb-2 text-center">Complete Booking Details</h3>
          <p className="text-smoke text-sans text-center mb-8 max-w-[400px]">Fill out the checkout form below to lock your request.</p>
          
          <form onSubmit={confirmBooking} className="w-full max-w-[500px] space-y-5 mb-8 text-left">
            <div>
              <label className="block text-xs uppercase tracking-widest text-smoke mb-2">Full Name</label>
              <input
                type="text"
                value={clientName}
                onChange={(e) => setClientName(e.target.value)}
                placeholder="Ayushi Rai"
                className="w-full bg-[#0A0A0A] border border-white/10 px-4 py-3 text-white placeholder:text-white/20 focus:outline-none focus:border-lamborghini-gold transition-colors text-sm rounded-none"
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs uppercase tracking-widest text-smoke mb-2">Email Address</label>
                <input
                  type="email"
                  value={clientEmail}
                  onChange={(e) => setClientEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="w-full bg-[#0A0A0A] border border-white/10 px-4 py-3 text-white placeholder:text-white/20 focus:outline-none focus:border-lamborghini-gold transition-colors text-sm rounded-none"
                  required
                />
              </div>
              <div>
                <label className="block text-xs uppercase tracking-widest text-smoke mb-2">Phone Number</label>
                <input
                  type="tel"
                  value={clientPhone}
                  onChange={(e) => setClientPhone(e.target.value)}
                  placeholder="+91 XXXXX XXXXX"
                  className="w-full bg-[#0A0A0A] border border-white/10 px-4 py-3 text-white placeholder:text-white/20 focus:outline-none focus:border-lamborghini-gold transition-colors text-sm rounded-none"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs uppercase tracking-widest text-smoke mb-2">Notes &amp; Design Inspiration</label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Share any details about your outfit, preferred themes, or special setup requests."
                rows={4}
                className="w-full bg-[#0A0A0A] border border-white/10 px-4 py-3 text-white placeholder:text-white/20 focus:outline-none focus:border-lamborghini-gold transition-colors text-sm rounded-none resize-none"
              />
            </div>

            <button 
              type="submit"
              className="bg-lamborghini-gold text-black flex items-center justify-center gap-4 w-full py-4 text-sm uppercase transition-all duration-[700ms] ease-[cubic-bezier(0.32,0.72,0,1)] font-sans tracking-widest font-semibold border-none rounded-none active:scale-[0.98] hover:bg-white"
            >
              <span>Confirm Appointment</span>
              <ArrowUpRight className="w-4 h-4" />
            </button>
          </form>
        </div>
      )}

      {state === "SUBMITTING" && (
        <div className="flex flex-col items-center text-center">
          <Loader2 className="w-10 h-10 text-lamborghini-gold animate-spin mb-6" />
          <p className="text-smoke font-sans uppercase tracking-widest text-sm">Locking Booking in Ledger...</p>
        </div>
      )}

      {state === "SUCCESS" && (
        <div className="flex flex-col items-center text-center animate-in zoom-in duration-700">
          <CheckCircle className="w-16 h-16 text-emerald-500 mb-6" />
          <h3 className="text-2xl font-heading text-white uppercase tracking-wider mb-4">Request Submitted</h3>
          <p className="text-smoke font-sans max-w-[400px]">Your appointment has been securely held and set to pending. We will review your details and confirm via email within 48 hours.</p>
        </div>
      )}

      {state === "ERROR" && (
        <div className="flex flex-col items-center text-center animate-in slide-in-from-bottom-4 duration-500">
          <div className="w-12 h-12 flex items-center justify-center border border-red-500/30 bg-red-500/10 mb-6">
            <span className="text-red-500 font-bold text-xl">!</span>
          </div>
          <h3 className="text-xl font-heading text-white uppercase tracking-wider mb-4">Reservation Issue</h3>
          <p className="text-smoke font-sans max-w-[400px] mb-8">{errorMessage}</p>
          
          <button 
            onClick={() => { setState("IDLE"); setSlots([]); setBookingId(null); }}
            className="border border-white/20 text-white px-8 py-3 text-sm uppercase transition-all hover:bg-white/5 font-sans tracking-widest rounded-none"
          >
            Start Over
          </button>
        </div>
      )}

    </div>
  );
}
