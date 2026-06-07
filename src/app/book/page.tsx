import { Suspense } from "react";
import BookingCalendar from "@/components/BookingCalendar";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export default function BookPage() {
  return (
    <div className="min-h-screen bg-black text-white font-sans flex flex-col justify-between">
      <Navbar />
      <main className="flex-1 pt-32 px-4 pb-20 w-full max-w-[1200px] mx-auto">
        <h1 className="text-[40px] md:text-[60px] font-heading text-white uppercase text-center mb-16">
          Secure Your Date
        </h1>
        <Suspense fallback={
          <div className="w-full max-w-[800px] mx-auto bg-white/[0.02] border border-white/10 p-12 flex flex-col items-center justify-center min-h-[450px]">
            <div className="w-10 h-10 border-2 border-lamborghini-gold border-t-transparent rounded-full animate-spin mb-4" />
            <p className="text-ash uppercase tracking-widest text-xs">Loading booking engine...</p>
          </div>
        }>
          <BookingCalendar />
        </Suspense>
      </main>
      <Footer />
    </div>
  );
}
