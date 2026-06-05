"use client";

import { useState, useEffect, useRef } from "react";
import { ArrowUpRight, Loader2, Calendar as CalendarIcon, Clock, CheckCircle } from "lucide-react";


type BookingState = "IDLE" | "FETCHING" | "HOLDING" | "FORM" | "SUCCESS" | "ERROR";

export default function BookingCalendar() {
  const [state, setState] = useState<BookingState>("IDLE");
  const [slots, setSlots] = useState<string[]>([]);

  const [bookingId, setBookingId] = useState<string | null>(null);
  const [timeLeft, setTimeLeft] = useState<number>(15 * 60); // 15 minutes in seconds
  const [errorMessage, setErrorMessage] = useState("");
  
  const containerRef = useRef<HTMLDivElement>(null);

  // Timer logic for HOLDING and FORM states
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if ((state === "HOLDING" || state === "FORM") && timeLeft > 0) {
      timer = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            setState("ERROR");
            setErrorMessage("Hold expired. Please try booking again.");
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [state, timeLeft]);

  // Format time (MM:SS)
  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60).toString().padStart(2, "0");
    const s = (seconds % 60).toString().padStart(2, "0");
    return `${m}:${s}`;
  };

  const fetchAvailability = async () => {
    setState("FETCHING");
    try {
      // Fetch availability for tomorrow as an example
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      const dateStr = tomorrow.toISOString().split("T")[0];

      const res = await fetch(`/api/availability?date=${dateStr}&duration=60`);
      if (!res.ok) throw new Error("Failed to fetch slots");
      
      const data = await res.json();
      setSlots(data.slots || []);
      setState("IDLE");
    } catch {
      setState("ERROR");
      setErrorMessage("Could not connect to booking server. Please check your internet connection.");
    }
  };

  const holdSlot = async (slotIso: string) => {
    setState("HOLDING");
    setTimeLeft(15 * 60);

    try {
      // Mocking client ID and service ID for the frontend demo
      const payload = {
        client_id: "00000000-0000-0000-0000-000000000001",
        service_tier_id: "00000000-0000-0000-0000-000000000001",
        start_time: slotIso,
        end_time: new Date(new Date(slotIso).getTime() + 60 * 60 * 1000).toISOString(),
      };

      const res = await fetch("/api/bookings/hold", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        if (res.status === 409) {
          throw new Error("This slot was just taken by someone else.");
        }
        throw new Error(data.error || "Failed to hold slot");
      }

      setBookingId(data.booking_id);
      setState("FORM");

    } catch (err: unknown) {
      setState("ERROR");
      const error = err as Error;
      setErrorMessage(error.message || "An unexpected error occurred.");
    }
  };

  const confirmBooking = async () => {
    setState("FETCHING"); // Reuse fetching state for loading
    try {
      const res = await fetch("/api/bookings/confirm", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ booking_id: bookingId, transaction_id: "mock_tx_123" }),
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

  return (
    <div ref={containerRef} className="w-full max-w-[800px] mx-auto bg-black/5 border border-white/10 p-8 md:p-12 min-h-[400px] flex flex-col items-center justify-center relative overflow-hidden shadow-[inset_0_1px_1px_rgba(255,255,255,0.05)]">
      
      {state === "IDLE" && slots.length === 0 && (
        <div className="flex flex-col items-center text-center">
          <CalendarIcon className="w-12 h-12 text-lamborghini-gold mb-6 opacity-80" />
          <h3 className="text-2xl font-heading text-white uppercase tracking-wider mb-4">Select a Date</h3>
          <p className="text-smoke font-sans mb-8 max-w-[400px]">Our availability is strictly limited. View open slots for bridal consultations and bookings.</p>
          
          <button 
            onClick={fetchAvailability}
            className="bg-lamborghini-gold text-black flex items-center gap-4 px-6 py-4 text-sm uppercase transition-all duration-[700ms] ease-[cubic-bezier(0.32,0.72,0,1)] font-sans tracking-widest font-semibold border-none rounded-none active:scale-[0.98] group"
          >
            <span>Check Availability</span>
            <div className="w-8 h-8 bg-black/10 flex items-center justify-center transition-transform duration-[700ms] ease-[cubic-bezier(0.32,0.72,0,1)] group-hover:translate-x-1 group-hover:-translate-y-[1px] group-hover:scale-105">
              <ArrowUpRight className="w-4 h-4 text-black" strokeWidth={1.5} />
            </div>
          </button>
        </div>
      )}

      {state === "FETCHING" && (
        <div className="flex flex-col items-center text-center">
          <Loader2 className="w-10 h-10 text-lamborghini-gold animate-spin mb-6" />
          <p className="text-smoke font-sans uppercase tracking-widest text-sm">Synchronizing Secure Ledger...</p>
        </div>
      )}

      {state === "IDLE" && slots.length > 0 && (
        <div className="w-full flex flex-col items-center animate-in fade-in duration-700">
          <h3 className="text-xl font-heading text-white uppercase tracking-wider mb-8 text-center">Available Appointments</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 w-full">
            {slots.map((slot) => {
              const d = new Date(slot);
              return (
                <button
                  key={slot}
                  onClick={() => holdSlot(slot)}
                  className="border border-white/20 bg-transparent text-white py-4 px-2 hover:bg-white/5 transition-colors font-sans text-sm tracking-wider flex flex-col items-center gap-2"
                >
                  <span className="font-semibold">{d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {state === "HOLDING" && (
        <div className="flex flex-col items-center text-center">
          <Loader2 className="w-10 h-10 text-lamborghini-gold animate-spin mb-6" />
          <h3 className="text-xl font-heading text-white uppercase tracking-wider mb-2">Securing Slot</h3>
          <p className="text-smoke font-sans text-sm max-w-[300px]">Locking this appointment atomically in the database...</p>
        </div>
      )}

      {state === "FORM" && (
        <div className="w-full flex flex-col items-center animate-in fade-in duration-700">
          <div className="flex items-center gap-3 text-lamborghini-gold mb-8 bg-lamborghini-gold/10 px-4 py-2 rounded-none border border-lamborghini-gold/20">
            <Clock className="w-4 h-4" />
            <span className="font-sans font-semibold tracking-widest text-sm">HOLD EXPIRES IN {formatTime(timeLeft)}</span>
          </div>
          
          <h3 className="text-2xl font-heading text-white uppercase tracking-wider mb-2 text-center">Complete Booking</h3>
          <p className="text-smoke font-sans text-center mb-8 max-w-[400px]">Your slot is temporarily reserved. Confirm below.</p>
          
          <button 
            onClick={confirmBooking}
            className="bg-white text-black flex items-center justify-center w-full max-w-[300px] py-4 text-sm uppercase transition-all duration-[700ms] ease-[cubic-bezier(0.32,0.72,0,1)] font-sans tracking-widest font-semibold border-none rounded-none active:scale-[0.98] hover:bg-lamborghini-gold"
          >
            Confirm Reservation
          </button>
        </div>
      )}

      {state === "SUCCESS" && (
        <div className="flex flex-col items-center text-center animate-in zoom-in duration-700">
          <CheckCircle className="w-16 h-16 text-green-500 mb-6" />
          <h3 className="text-2xl font-heading text-white uppercase tracking-wider mb-4">Booking Confirmed</h3>
          <p className="text-smoke font-sans max-w-[400px]">Your appointment has been securely locked. We look forward to crafting your story.</p>
        </div>
      )}

      {state === "ERROR" && (
        <div className="flex flex-col items-center text-center animate-in slide-in-from-bottom-4 duration-500">
          <div className="w-12 h-12 flex items-center justify-center border border-red-500/30 bg-red-500/10 mb-6">
            <span className="text-red-500 font-bold text-xl">!</span>
          </div>
          <h3 className="text-xl font-heading text-white uppercase tracking-wider mb-4">Transaction Failed</h3>
          <p className="text-smoke font-sans max-w-[400px] mb-8">{errorMessage}</p>
          
          <button 
            onClick={() => { setState("IDLE"); setSlots([]); }}
            className="border border-white/20 text-white px-8 py-3 text-sm uppercase transition-all hover:bg-white/5 font-sans tracking-widest"
          >
            Try Again
          </button>
        </div>
      )}

    </div>
  );
}
