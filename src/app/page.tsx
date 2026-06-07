"use client";

import { useRef } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ArrowUpRight } from "lucide-react";
import dynamic from "next/dynamic";
import Link from "next/link";


const BookingCalendar = dynamic(() => import("@/components/BookingCalendar"), { ssr: false });

gsap.registerPlugin(ScrollTrigger);

export default function Home() {
  const containerRef = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    // Hero Entrance
    gsap.from(".hero-reveal", {
      y: 100,
      opacity: 0,
      filter: "blur(10px)",
      duration: 1.5,
      stagger: 0.15,
      ease: "power4.out",
    });

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
      <section className="min-h-[100dvh] w-full flex flex-col items-center justify-center px-4 pt-20">
        <div className="hero-reveal text-lamborghini-gold text-sm uppercase tracking-[0.2em] font-medium mb-6">
          Exclusive Bridal Makeup &amp; Styling
        </div>
        <h1 className="hero-reveal text-[54px] md:text-[80px] lg:text-[120px] font-heading text-white tracking-tight uppercase text-center max-w-[1440px] leading-[0.92]">
          ARM Artistry
        </h1>
        <p className="hero-reveal mt-10 text-ash text-lg md:text-xl font-sans tracking-wide max-w-[600px] text-center px-4">
          The intersection of premium cosmetic design and unapologetic modern luxury. We craft bespoke beauty, makeup, and henna narratives for the vanguard bride.
        </p>
        
        <div className="hero-reveal mt-16 group cursor-pointer">
          <Link href="/services">
            <button className="bg-lamborghini-gold text-black flex items-center gap-4 px-6 py-4 text-base uppercase transition-all duration-[700ms] ease-[cubic-bezier(0.32,0.72,0,1)] font-sans tracking-wider font-semibold border-none rounded-none active:scale-[0.98]">
              <span>Discover Services</span>
              <div className="w-8 h-8 bg-black/10 flex items-center justify-center transition-transform duration-[700ms] ease-[cubic-bezier(0.32,0.72,0,1)] group-hover:translate-x-1 group-hover:-translate-y-[1px] group-hover:scale-105">
                <ArrowUpRight className="w-4 h-4 text-black" strokeWidth={1.5} />
              </div>
            </button>
          </Link>
        </div>
      </section>

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
            <div className="mt-12 group w-max cursor-pointer">
              <button className="bg-transparent text-white border border-white/20 flex items-center gap-4 px-5 py-4 text-sm uppercase transition-all duration-[700ms] ease-[cubic-bezier(0.32,0.72,0,1)] hover:bg-white/5 font-sans tracking-widest rounded-none active:scale-[0.98]">
                <span>View Portfolio</span>
                <div className="w-6 h-6 bg-white/10 flex items-center justify-center transition-transform duration-[700ms] ease-[cubic-bezier(0.32,0.72,0,1)] group-hover:translate-x-1 group-hover:-translate-y-[1px] group-hover:scale-105">
                  <ArrowUpRight className="w-3 h-3 text-white" strokeWidth={1.5} />
                </div>
              </button>
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
