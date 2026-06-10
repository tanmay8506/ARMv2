"use client";

import { useRef } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ArrowUpRight } from "lucide-react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { HeroGeometric } from "@/components/ui/shape-landing-hero";


const BookingCalendar = dynamic(() => import("@/components/BookingCalendar"), { ssr: false });

gsap.registerPlugin(ScrollTrigger);

export default function Home() {
  const containerRef = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    // Scroll Reveal Elements
    const sections = gsap.utils.toArray(".scroll-section") as HTMLElement[];
    sections.forEach((section) => {
      const elements = section.querySelectorAll(".scroll-reveal");
      if (elements.length === 0) return;
      gsap.from(elements, {
        scrollTrigger: {
          trigger: section,
          start: "top 80%",
        },
        y: 60,
        opacity: 0,
        filter: "blur(8px)",
        duration: 1.2,
        stagger: 0.1,
        ease: "power3.out",
      });
    });
  }, { scope: containerRef });

  return (
    <main ref={containerRef} className="w-full relative bg-black min-h-[300dvh] overflow-clip">
      {/* Hero Section */}
      <HeroGeometric
        badge="Exclusive Bridal Makeup & Styling"
        title1="ARM Artistry"
        title2="Bespoke Beauty"
      />

      {/* Asymmetrical Bento & Typography block */}
      <section className="scroll-section min-h-[100dvh] w-full py-24 md:py-40 px-4 md:px-10 flex items-center justify-center bg-black">
        <div className="max-w-[1440px] w-full grid grid-cols-1 md:grid-cols-12 gap-10 md:gap-6">
          
          {/* Typography Block */}
          <div className="scroll-reveal col-span-1 md:col-span-5 flex flex-col justify-center pr-0 md:pr-10">
            <h2 className="text-[40px] md:text-[80px] font-heading text-white uppercase leading-[1.13]">
              Bespoke Artistry
            </h2>
            <p className="mt-8 text-smoke text-base font-sans leading-[1.56]">
              Every application is a masterpiece, crafted with precision and passion. We specialize in luxury bridal makeovers, high-definition camera-ready styling, and intricate contemporary henna designs tailored to your unique story.
            </p>
            <div className="mt-12 group w-max">
              <Link 
                href="/portfolio"
                className="bg-transparent text-white border border-white/20 flex items-center gap-4 px-5 py-4 text-sm uppercase transition-all duration-[700ms] ease-[cubic-bezier(0.32,0.72,0,1)] hover:bg-white/5 font-sans tracking-widest rounded-none active:scale-[0.98] cursor-pointer"
              >
                <span>View Portfolio</span>
                <div className="w-6 h-6 bg-white/10 flex items-center justify-center transition-transform duration-[700ms] ease-[cubic-bezier(0.32,0.72,0,1)] group-hover:translate-x-1 group-hover:-translate-y-[1px] group-hover:scale-105">
                  <ArrowUpRight className="w-3 h-3 text-white" strokeWidth={1.5} />
                </div>
              </Link>
            </div>
          </div>

          {/* Bento Images */}
          <div className="col-span-1 md:col-span-7 grid grid-cols-1 md:grid-cols-2 gap-6 relative">
            <div className="scroll-reveal md:mt-24 h-max">
              <div className="w-full aspect-[4/5] bg-dark-iron relative overflow-clip group cursor-pointer border border-white/10">
                 {/* Image placeholder with hover scale */}
                 <div className="absolute inset-0 bg-stone transition-transform duration-[1200ms] ease-[cubic-bezier(0.32,0.72,0,1)] group-hover:scale-105" />
                 <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent opacity-60" />
                 <div className="absolute bottom-6 left-6 text-white uppercase text-xs tracking-widest font-heading z-10">Contemporary</div>
              </div>
            </div>
            <div className="scroll-reveal md:-mt-12 md:ml-12 z-10 h-max">
              <div className="w-full aspect-[3/4] bg-charcoal relative overflow-clip group cursor-pointer border border-white/10">
                 <div className="absolute inset-0 bg-stone transition-transform duration-[1200ms] ease-[cubic-bezier(0.32,0.72,0,1)] group-hover:scale-105" />
                 <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent opacity-60" />
                 <div className="absolute bottom-6 left-6 text-white uppercase text-xs tracking-widest font-heading z-10">Traditional</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA / Booking Calendar Section */}
      <section className="scroll-section min-h-[80dvh] w-full border-t border-charcoal flex flex-col items-center justify-center py-24 md:py-40 px-4 bg-black relative">
        <h2 className="scroll-reveal text-[40px] md:text-[80px] font-heading text-white uppercase leading-[1.13] text-center max-w-[1000px] mb-16">
          Secure Your Date
        </h2>
        <div className="scroll-reveal w-full relative z-10">
          <BookingCalendar />
        </div>
      </section>
    </main>
  );
}
