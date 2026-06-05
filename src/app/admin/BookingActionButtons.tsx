"use client";

import { useState } from "react";
import { Check, X, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";

export default function BookingActionButtons({ bookingId }: { bookingId: string }) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleAction = async (action: "confirm" | "decline") => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/bookings/action", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ booking_id: bookingId, action }),
      });
      if (!res.ok) throw new Error("Action failed");
      router.refresh();
    } catch (err) {
      console.error(err);
      alert("Failed to process booking action.");
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <Loader2 className="w-5 h-5 animate-spin text-smoke" />;

  return (
    <div className="flex gap-2">
      <button 
        onClick={() => handleAction("confirm")}
        className="p-2 border border-green-500/50 text-green-500 hover:bg-green-500 hover:text-black transition-colors" 
        title="Confirm Booking"
      >
        <Check className="w-5 h-5" />
      </button>
      <button 
        onClick={() => handleAction("decline")}
        className="p-2 border border-red-500/50 text-red-500 hover:bg-red-500 hover:text-black transition-colors" 
        title="Decline/Cancel"
      >
        <X className="w-5 h-5" />
      </button>
    </div>
  );
}
