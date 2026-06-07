import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { Sparkles, Camera, Crown, ArrowRight, CheckCircle2 } from "lucide-react";

export const dynamic = "force-dynamic";

interface ServiceTier {
  id: string;
  title: string;
  description: string | null;
  duration_minutes: number;
  price_inr: number;
}

export default async function ServicesPage() {
  const supabase = createClient();
  const { data: tiers } = await supabase
    .from("service_tiers")
    .select("*")
    .eq("is_active", true);

  const getTierInfo = (title: string): ServiceTier | undefined => {
    return tiers?.find((t) => t.title.toLowerCase() === title.toLowerCase());
  };

  // 1. Makeup Services Config
  const makeupServices = [
    {
      id: "01",
      name: "Bridal Makeup",
      description: "The complete elite styling experience for the most important day of your life. Calibrated to your venue lighting, photography style, and skin type.",
      tiers: [
        { level: "Standard", key: "Bridal Makeup (Standard)" },
        { level: "High Definition", key: "Bridal Makeup (High Definition)" },
        { level: "Luxury", key: "Bridal Makeup (Luxury)" },
      ],
    },
    {
      id: "02",
      name: "Engagement Makeup",
      description: "Tailored, high-end look optimization designed specifically for camera clarity and venue lighting balance.",
      tiers: [
        { level: "Standard", key: "Engagement Makeup (Standard)" },
        { level: "High Definition", key: "Engagement Makeup (High Definition)" },
        { level: "Luxury", key: "Engagement Makeup (Luxury)" },
      ],
    },
    {
      id: "03",
      name: "Haldi/Mehandi Makeup",
      description: "Fresh, radiant, and lightweight looks perfect for vibrant day events like Haldi or Mehandi ceremonies.",
      tiers: [
        { level: "Standard", key: "Haldi/Mehandi Makeup (Standard)" },
        { level: "High Definition", key: "Haldi/Mehandi Makeup (High Definition)" },
        { level: "Luxury", key: "Haldi/Mehandi Makeup (Luxury)" },
      ],
    },
    {
      id: "04",
      name: "Party Makeup",
      description: "Refined individual beauty optimization for high-profile gatherings and signature events.",
      tiers: [
        { level: "Standard", key: "Party Makeup (Standard)" },
        { level: "High Definition", key: "Party Makeup (High Definition)" },
        { level: "Luxury", key: "Party Makeup (Luxury)" },
      ],
    },
  ];

  // 2. Hairstyle Services Config
  const hairstyleServices = [
    { title: "Party Hairstyle", key: "Party Hairstyle" },
    { title: "Haldi/Mehndi Hairstyle", key: "Haldi/Mehndi Hairstyle" },
    { title: "Engagement Hairstyle", key: "Engagement Hairstyle" },
    { title: "Bridal Hairstyle", key: "Bridal Hairstyle" },
    { title: "Hair Extensions", key: "Hair Extensions" },
  ];

  return (
    <main className="max-w-[1200px] mx-auto px-6 py-32 flex-1 w-full min-h-[calc(100vh-16rem)]">
        {/* Header */}
        <div className="text-center max-w-[800px] mx-auto mb-20 animate-in fade-in duration-1000">
          <span className="text-lamborghini-gold text-xs uppercase tracking-[0.25em] font-semibold block mb-4">
            Services &amp; Pricing
          </span>
          <h1 className="text-[54px] md:text-[80px] font-heading text-white uppercase mb-6 tracking-wide leading-tight">
            Elevate Your Essence
          </h1>
          <p className="text-ash text-lg leading-relaxed">
            Discover our curated, high-performance beauty packages, tailored skin finishes, and signature looks designed for modern elegance.
          </p>
        </div>

        {/* Section 1: The Three Tiers */}
        <section className="mb-32">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-heading text-white uppercase tracking-wider mb-2">
              Choose Your Finish Level
            </h2>
            <p className="text-ash text-sm uppercase tracking-widest">
              Three distinct finish tiers crafted for every context
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Tier 01 */}
            <div className="border border-white/10 bg-white/[0.01] p-8 hover:border-lamborghini-gold/30 hover:bg-white/[0.02] transition-all duration-500 relative flex flex-col justify-between min-h-[350px]">
              <div>
                <div className="flex justify-between items-center mb-6">
                  <span className="text-xs text-ash tracking-widest uppercase font-semibold">Tier 01</span>
                  <Sparkles className="w-5 h-5 text-lamborghini-gold" />
                </div>
                <h3 className="text-2xl font-heading text-white uppercase mb-4 tracking-wider">
                  Standard
                </h3>
                <p className="text-smoke text-sm leading-relaxed mb-6">
                  Traditional, highly precise brush application utilizing premium weightless foundations. Ideal for soft daylight, intimate gatherings, and clients preferring a breathable, radiant, and timelessly clean look.
                </p>
              </div>
              <div className="flex items-center gap-2 text-xs text-lamborghini-gold uppercase tracking-widest mt-auto">
                <CheckCircle2 className="w-4 h-4" />
                <span>Breathable &amp; Radiant</span>
              </div>
            </div>

            {/* Tier 02 */}
            <div className="border border-lamborghini-gold/20 bg-white/[0.02] p-8 hover:border-lamborghini-gold/40 hover:bg-white/[0.03] transition-all duration-500 relative flex flex-col justify-between min-h-[350px] shadow-[0_0_30px_rgba(255,192,0,0.03)]">
              <div>
                <div className="flex justify-between items-center mb-6">
                  <span className="text-xs text-lamborghini-gold tracking-widest uppercase font-semibold">Tier 02</span>
                  <Camera className="w-5 h-5 text-lamborghini-gold animate-pulse" />
                </div>
                <h3 className="text-2xl font-heading text-lamborghini-gold uppercase mb-4 tracking-wider">
                  High Definition
                </h3>
                <p className="text-smoke text-sm leading-relaxed mb-6">
                  Engineered with light-diffusing microscopically milled pigments that adapt flawlessly to harsh studio lighting and modern DSLR lenses. Completely eliminates camera flashback and blurs skin texture for a smooth, poreless finish.
                </p>
              </div>
              <div className="flex items-center gap-2 text-xs text-lamborghini-gold uppercase tracking-widest mt-auto">
                <CheckCircle2 className="w-4 h-4" />
                <span>Zero Flashback • HD Ready</span>
              </div>
            </div>

            {/* Tier 03 */}
            <div className="border border-white/10 bg-white/[0.01] p-8 hover:border-lamborghini-gold/30 hover:bg-white/[0.02] transition-all duration-500 relative flex flex-col justify-between min-h-[350px]">
              <div>
                <div className="flex justify-between items-center mb-6">
                  <span className="text-xs text-ash tracking-widest uppercase font-semibold">Tier 03 — Pinnacle</span>
                  <Crown className="w-5 h-5 text-lamborghini-gold" />
                </div>
                <h3 className="text-2xl font-heading text-white uppercase mb-4 tracking-wider">
                  Luxury
                </h3>
                <p className="text-smoke text-sm leading-relaxed mb-6">
                  The pinnacle of bespoke beauty styling. Combines advanced clinical skin prep, exclusive use of ultra-premium artistry houses, and continuous touch-up security for an impossibly flawless and long-lasting look.
                </p>
              </div>
              <div className="flex items-center gap-2 text-xs text-lamborghini-gold uppercase tracking-widest mt-auto">
                <CheckCircle2 className="w-4 h-4" />
                <span>Premium Skin Prep • Artist Exclusive</span>
              </div>
            </div>
          </div>
        </section>

        {/* Section 2: Complete Service & Pricing Matrix */}
        <section className="mb-32">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-heading text-white uppercase tracking-wider mb-2">
              Service &amp; Pricing Matrix
            </h2>
            <p className="text-ash text-sm uppercase tracking-widest">
              Direct and transparent pricing calibrated per session
            </p>
          </div>

          <div className="space-y-12">
            {makeupServices.map((service) => {
              const standardTier = getTierInfo(service.tiers[0].key);
              const hdTier = getTierInfo(service.tiers[1].key);
              const luxuryTier = getTierInfo(service.tiers[2].key);

              // Default to standard or the first available tier for general booking link
              const defaultTierId = standardTier?.id || hdTier?.id || luxuryTier?.id || "";

              return (
                <div
                  key={service.id}
                  className="border border-white/10 bg-[#0A0A0A] p-8 md:p-12 hover:border-white/20 transition-all duration-500"
                >
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                    {/* ID & Info */}
                    <div className="lg:col-span-6">
                      <div className="flex items-center gap-4 mb-4">
                        <span className="text-xs font-mono text-lamborghini-gold tracking-widest">
                          {service.id}
                        </span>
                        <h3 className="text-2xl md:text-3xl font-heading text-white uppercase tracking-wider">
                          {service.name}
                        </h3>
                      </div>
                      <p className="text-smoke text-sm leading-relaxed mb-6 max-w-[500px]">
                        {service.description}
                      </p>
                      {defaultTierId && (
                        <Link
                          id={`book-service-${service.id}`}
                          href={`/book?tier=${defaultTierId}`}
                          className="inline-flex items-center gap-2 text-xs uppercase tracking-widest font-semibold text-white hover:text-lamborghini-gold transition-colors duration-300 group"
                        >
                          <span>Book This Service</span>
                          <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                        </Link>
                      )}
                    </div>

                    {/* Pricing Tiers Grid */}
                    <div className="lg:col-span-6 grid grid-cols-3 gap-4 border-t lg:border-t-0 lg:border-l border-white/10 pt-6 lg:pt-0 lg:pl-8">
                      {/* Standard Price */}
                      <div className="text-center md:text-left">
                        <div className="text-[10px] text-ash uppercase tracking-widest mb-1">Standard</div>
                        {standardTier ? (
                          <Link
                            id={`book-${standardTier.id}`}
                            href={`/book?tier=${standardTier.id}`}
                            className="block group"
                          >
                            <div className="text-lg md:text-xl font-heading text-white group-hover:text-lamborghini-gold transition-colors">
                              ₹{parseFloat(standardTier.price_inr.toString()).toLocaleString()}
                            </div>
                            <span className="text-[9px] uppercase tracking-widest text-ash group-hover:text-white transition-colors block mt-1">
                              Book Slot
                            </span>
                          </Link>
                        ) : (
                          <div className="text-sm text-ash italic">TBD</div>
                        )}
                      </div>

                      {/* HD Price */}
                      <div className="text-center md:text-left">
                        <div className="text-[10px] text-lamborghini-gold uppercase tracking-widest mb-1">High Def</div>
                        {hdTier ? (
                          <Link
                            id={`book-${hdTier.id}`}
                            href={`/book?tier=${hdTier.id}`}
                            className="block group"
                          >
                            <div className="text-lg md:text-xl font-heading text-white group-hover:text-lamborghini-gold transition-colors">
                              ₹{parseFloat(hdTier.price_inr.toString()).toLocaleString()}
                            </div>
                            <span className="text-[9px] uppercase tracking-widest text-lamborghini-gold group-hover:text-white transition-colors block mt-1">
                              Book Slot
                            </span>
                          </Link>
                        ) : (
                          <div className="text-sm text-ash italic">TBD</div>
                        )}
                      </div>

                      {/* Luxury Price */}
                      <div className="text-center md:text-left">
                        <div className="text-[10px] text-ash uppercase tracking-widest mb-1">Luxury</div>
                        {luxuryTier ? (
                          <Link
                            id={`book-${luxuryTier.id}`}
                            href={`/book?tier=${luxuryTier.id}`}
                            className="block group"
                          >
                            <div className="text-lg md:text-xl font-heading text-white group-hover:text-lamborghini-gold transition-colors">
                              ₹{parseFloat(luxuryTier.price_inr.toString()).toLocaleString()}
                            </div>
                            <span className="text-[9px] uppercase tracking-widest text-ash group-hover:text-white transition-colors block mt-1">
                              Book Slot
                            </span>
                          </Link>
                        ) : (
                          <div className="text-sm text-ash italic">TBD</div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* Section 3: Complete Your Look */}
        <section className="max-w-[800px] mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-heading text-white uppercase tracking-wider mb-2">
              Complete Your Look
            </h2>
            <p className="text-ash text-sm uppercase tracking-widest">
              Premium hair and accent extensions
            </p>
          </div>

          <div className="border border-white/10 bg-[#0A0A0A] p-8 md:p-12 relative overflow-hidden">
            {/* Subtle background glow */}
            <div className="absolute top-0 right-0 w-[200px] h-[200px] bg-lamborghini-gold/5 rounded-full blur-3xl pointer-events-none" />

            <h3 className="text-xl font-heading text-white uppercase tracking-wider mb-8 pb-4 border-b border-white/10">
              Hairstyle Services
            </h3>

            <div className="space-y-6">
              {hairstyleServices.map((hair) => {
                const tier = getTierInfo(hair.key);
                return (
                  <div key={hair.key} className="flex justify-between items-center group">
                    <div>
                      <h4 className="text-base font-sans text-white group-hover:text-lamborghini-gold transition-colors">
                        {hair.title}
                      </h4>
                      <p className="text-xs text-ash mt-1">
                        {tier?.description || "Curated custom hair designs matching your look"}
                      </p>
                    </div>
                    <div className="text-right">
                      {tier ? (
                        <Link
                          id={`book-${tier.id}`}
                          href={`/book?tier=${tier.id}`}
                          className="block text-right"
                        >
                          <span className="text-base font-heading text-lamborghini-gold block">
                            ₹{parseFloat(tier.price_inr.toString()).toLocaleString()}
                          </span>
                          <span className="text-[9px] uppercase tracking-widest text-ash group-hover:text-white transition-colors">
                            Book Now
                          </span>
                        </Link>
                      ) : (
                        <span className="text-sm text-ash italic">TBD</span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>
    </main>
  );
}

