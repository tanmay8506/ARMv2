"use client";
import { useRef } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import Link from "next/link";
import { Search, Bookmark, Menu } from "lucide-react";

export default function Navbar() {
  const navRef = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    gsap.from(navRef.current, {
      y: -50,
      opacity: 0,
      duration: 1.2,
      ease: "power3.out",
    });
  }, { scope: navRef });

  return (
    <nav ref={navRef} className="fixed top-0 left-0 w-full z-50 mix-blend-difference px-6 md:px-10 py-6 flex items-center justify-between pointer-events-none">
      <div className="flex items-center gap-4 pointer-events-auto cursor-pointer group">
        <Menu className="w-5 h-5 text-white" strokeWidth={1} />
        <span className="hidden md:inline text-white text-sm uppercase tracking-widest group-hover:text-lamborghini-gold transition-colors duration-300">Menu</span>
      </div>
      <div className="absolute left-1/2 -translate-x-1/2 pointer-events-auto">
        <Link href="/" className="text-white text-2xl font-heading uppercase tracking-widest font-bold">
          ARM
        </Link>
      </div>
      <div className="flex items-center gap-4 md:gap-6 pointer-events-auto">
        <Search className="w-5 h-5 text-white cursor-pointer hover:text-lamborghini-gold transition-colors duration-300" strokeWidth={1} />
        <Bookmark className="w-5 h-5 text-white cursor-pointer hover:text-lamborghini-gold transition-colors duration-300" strokeWidth={1} />
      </div>
    </nav>
  );
}
