import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export const dynamic = "force-dynamic";

export default async function ServicesPage() {
  const supabase = createClient();
  const { data: tiers } = await supabase
    .from("service_tiers")
    .select("*")
    .eq("is_active", true)
    .order("price_inr", { ascending: true });

  return (
    <div className="min-h-screen bg-black text-white font-sans flex flex-col justify-between">
      <Navbar />
      <main className="max-w-[1200px] mx-auto px-6 py-32 flex-1 w-full">
        <h1 className="text-[54px] md:text-[80px] font-heading text-white uppercase text-center mb-6 tracking-wide">
          Our Services
        </h1>
        <p className="text-ash text-center max-w-[600px] mx-auto mb-16 text-lg">
          Intricate narratives crafted in henna. Select from our signature service tiers.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {tiers && tiers.length > 0 ? (
            tiers.map((tier) => (
              <div
                key={tier.id}
                className="border border-white/10 bg-white/[0.02] p-8 flex flex-col justify-between min-h-[400px] hover:border-lamborghini-gold/30 transition-all duration-500 rounded-none"
              >
                <div>
                  <h2 className="text-2xl font-heading text-white uppercase mb-4 tracking-wider">
                    {tier.title}
                  </h2>
                  <p className="text-smoke text-sm mb-6 leading-relaxed">
                    {tier.description}
                  </p>
                  <div className="flex items-center gap-4 text-xs text-ash uppercase tracking-widest mb-8">
                    <span>Duration: {tier.duration_minutes} mins</span>
                  </div>
                </div>

                <div>
                  <div className="text-3xl font-heading text-lamborghini-gold mb-6">
                    ₹{parseFloat(tier.price_inr.toString()).toLocaleString()}
                  </div>
                  <Link
                    href={`/book?tier=${tier.id}`}
                    className="block text-center bg-white text-black py-4 uppercase text-sm font-bold tracking-widest hover:bg-lamborghini-gold transition-colors duration-300 rounded-none active:scale-[0.98]"
                  >
                    Book Session
                  </Link>
                </div>
              </div>
            ))
          ) : (
            <div className="col-span-3 text-center py-20 border border-dashed border-white/10">
              <p className="text-smoke italic">Our services are currently being updated. Please check back shortly.</p>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}
