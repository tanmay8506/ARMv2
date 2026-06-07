"use client";

import { useState, useRef } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import Link from "next/link";
import { Search, Bookmark } from "lucide-react";

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const navRef = useRef<HTMLDivElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);

  // Entrance animations on page load
  useGSAP(() => {
    gsap.from(navRef.current, {
      y: -50,
      opacity: 0,
      duration: 1.2,
      ease: "power3.out",
    });
  }, { scope: navRef });

  // Handle overlay transitions when open state changes
  useGSAP(() => {
    if (isOpen) {
      // Open overlay
      gsap.to(overlayRef.current, {
        y: 0,
        opacity: 1,
        duration: 0.8,
        ease: "power4.out",
      });
      // Staggered fade and slide up for menu items
      gsap.fromTo(
        ".menu-link-item",
        { y: 60, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.7, stagger: 0.08, ease: "power3.out", delay: 0.2 }
      );
    } else {
      // Close overlay
      gsap.to(overlayRef.current, {
        y: "-100%",
        opacity: 0,
        duration: 0.6,
        ease: "power4.in",
      });
    }
  }, { dependencies: [isOpen], scope: overlayRef });

  const toggleMenu = () => setIsOpen(!isOpen);
  const closeMenu = () => setIsOpen(false);

  return (
    <>
      {/* Floating Header */}
      <nav 
        ref={navRef} 
        className="fixed top-0 left-0 w-full z-50 mix-blend-difference px-6 md:px-10 py-6 flex items-center justify-between pointer-events-none"
      >
        <div 
          onClick={toggleMenu}
          className="flex items-center gap-4 pointer-events-auto cursor-pointer group select-none"
          aria-label={isOpen ? "Close menu" : "Open menu"}
          role="button"
        >
          {/* Custom Morphing Hamburger Icon */}
          <div className="flex flex-col justify-between w-6 h-3.5 relative">
            <span className={`h-[1px] w-full bg-white transition-all duration-300 origin-center ${
              isOpen ? "rotate-45 translate-y-[6px]" : ""
            }`} />
            <span className={`h-[1px] w-full bg-white transition-all duration-200 ${
              isOpen ? "opacity-0 scale-x-0" : ""
            }`} />
            <span className={`h-[1px] w-full bg-white transition-all duration-300 origin-center ${
              isOpen ? "-rotate-45 -translate-y-[6px]" : ""
            }`} />
          </div>
          <span className="hidden md:inline text-white text-xs uppercase tracking-[0.2em] font-medium group-hover:text-lamborghini-gold transition-colors duration-300">
            {isOpen ? "Close" : "Menu"}
          </span>
        </div>

        <div className="absolute left-1/2 -translate-x-1/2 pointer-events-auto">
          <Link 
            href="/" 
            onClick={closeMenu}
            className="text-white text-2.5xl font-heading uppercase tracking-[0.2em] font-bold"
          >
            ARM
          </Link>
        </div>

        <div className="flex items-center gap-4 md:gap-6 pointer-events-auto">
          <Search className="w-5 h-5 text-white cursor-pointer hover:text-lamborghini-gold transition-colors duration-300" strokeWidth={1} />
          <Bookmark className="w-5 h-5 text-white cursor-pointer hover:text-lamborghini-gold transition-colors duration-300" strokeWidth={1} />
        </div>
      </nav>

      {/* Screen-Filling Overlay Drawer */}
      <div 
        ref={overlayRef}
        className="fixed inset-0 z-40 bg-black/95 backdrop-blur-3xl flex flex-col justify-center px-8 md:px-24 py-20 pointer-events-auto translate-y-[-100%] opacity-0"
      >
        <div className="max-w-[1200px] w-full mx-auto grid grid-cols-1 md:grid-cols-12 gap-10">
          
          {/* Side Info */}
          <div className="menu-link-item hidden md:flex col-span-4 flex-col justify-between border-r border-white/10 pr-10 py-4">
            <div>
              <span className="text-lamborghini-gold text-[10px] uppercase tracking-[0.25em] font-sans font-semibold block mb-4">
                ARM Artistry
              </span>
              <p className="text-smoke text-sm leading-relaxed max-w-[240px]">
                An elite bridal henna atelier blending rich cultural heritage with absolute modern visual luxury.
              </p>
            </div>
            <div className="text-xs text-ash tracking-widest uppercase">
              IST • Bengaluru, IN
            </div>
          </div>

          {/* Navigation Links */}
          <div className="col-span-1 md:col-span-8 flex flex-col space-y-4 py-4 text-left">
            <span className="text-ash text-[10px] uppercase tracking-[0.2em] block mb-2 font-medium">
              Navigation
            </span>
            <div className="menu-link-item">
              <Link 
                href="/" 
                onClick={closeMenu}
                className="font-heading text-4xl md:text-6xl uppercase text-white hover:text-lamborghini-gold transition-colors duration-500 block"
              >
                <span className="font-sans text-xs tracking-wider text-ash mr-4">01 /</span> Home
              </Link>
            </div>
            <div className="menu-link-item">
              <Link 
                href="/services" 
                onClick={closeMenu}
                className="font-heading text-4xl md:text-6xl uppercase text-white hover:text-lamborghini-gold transition-colors duration-500 block"
              >
                <span className="font-sans text-xs tracking-wider text-ash mr-4">02 /</span> Services
              </Link>
            </div>
            <div className="menu-link-item">
              <Link 
                href="/portfolio" 
                onClick={closeMenu}
                className="font-heading text-4xl md:text-6xl uppercase text-white hover:text-lamborghini-gold transition-colors duration-500 block"
              >
                <span className="font-sans text-xs tracking-wider text-ash mr-4">03 /</span> Portfolio
              </Link>
            </div>
            <div className="menu-link-item">
              <Link 
                href="/book" 
                onClick={closeMenu}
                className="font-heading text-4xl md:text-6xl uppercase text-white hover:text-lamborghini-gold transition-colors duration-500 block"
              >
                <span className="font-sans text-xs tracking-wider text-ash mr-4">04 /</span> Book Session
              </Link>
            </div>
            <div className="menu-link-item">
              <Link 
                href="/portal" 
                onClick={closeMenu}
                className="font-heading text-4xl md:text-6xl uppercase text-white hover:text-lamborghini-gold transition-colors duration-500 block"
              >
                <span className="font-sans text-xs tracking-wider text-ash mr-4">05 /</span> Client Portal
              </Link>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
