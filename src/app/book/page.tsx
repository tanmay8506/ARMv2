import { Suspense } from "react";
import BookingCalendar from "@/components/BookingCalendar";

export default function BookPage() {
  return (
    <main className="flex-1 pt-32 px-4 pb-20 w-full max-w-[1200px] mx-auto min-h-[calc(100vh-16rem)]">
      <div className="text-center mb-16">
        <p className="text-lamborghini-gold text-[10px] uppercase tracking-[0.35em] font-sans mb-4">
          ARM Artistry · Booking Inquiry
        </p>
        <h1 className="text-[38px] md:text-[58px] font-heading text-white uppercase leading-tight">
          Begin Your Journey
        </h1>
        <p className="text-smoke font-sans text-sm mt-4 max-w-[480px] mx-auto leading-relaxed">
          Submit your event details and our team will personally craft the perfect plan for your celebration.
        </p>
      </div>
      <Suspense fallback={
        <div className="w-full max-w-[800px] mx-auto bg-white/[0.02] border border-white/10 p-12 flex flex-col items-center justify-center min-h-[450px]">
          <div className="w-10 h-10 border-2 border-lamborghini-gold border-t-transparent rounded-full animate-spin mb-4" />
          <p className="text-ash uppercase tracking-widest text-xs">Loading booking engine...</p>
        </div>
      }>
        <BookingCalendar />
      </Suspense>
    </main>
  );
}
