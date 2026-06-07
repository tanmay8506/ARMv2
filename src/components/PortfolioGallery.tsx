"use client";

import { useState, useRef, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { X, Play, Eye, ArrowLeft, ArrowRight } from "lucide-react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { 
  lookbooks, 
  hairStyles, 
  standaloneReels, 
  PortfolioLookbook, 
  StandaloneReel 
} from "@/app/portfolio/portfolioData";

const CATEGORIES = ["Showcase", "Bridal Henna", "Hairstyling", "Short Reels"];

export default function PortfolioGallery() {
  const [selectedCategory, setSelectedCategory] = useState("Showcase");
  
  // Modals / Lightboxes state
  const [activeLookbook, setActiveLookbook] = useState<PortfolioLookbook | null>(null);
  const [activeReel, setActiveReel] = useState<StandaloneReel | null>(null);
  
  // Lookbook Carousel index
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  
  const galleryRef = useRef<HTMLDivElement>(null);
  const hoverVideoRefs = useRef<Record<string, HTMLVideoElement | null>>({});

  // GSAP animation for category tab switches
  useGSAP(() => {
    gsap.fromTo(
      ".portfolio-card",
      { opacity: 0, y: 30, scale: 0.98 },
      { 
        opacity: 1, 
        y: 0, 
        scale: 1, 
        duration: 0.6, 
        stagger: 0.05, 
        ease: "power3.out",
        overwrite: "auto" 
      }
    );
  }, { dependencies: [selectedCategory], scope: galleryRef });

  // Handle video hover playback
  const handleMouseEnter = (id: string) => {
    const video = hoverVideoRefs.current[id];
    if (video) {
      video.play().catch(() => {});
    }
  };

  const handleMouseLeave = (id: string) => {
    const video = hoverVideoRefs.current[id];
    if (video) {
      video.pause();
      video.currentTime = 0;
    }
  };

  // Reset slider index when active lookbook changes
  useEffect(() => {
    setCurrentSlideIndex(0);
  }, [activeLookbook]);

  return (
    <div ref={galleryRef} className="w-full">
      {/* Category Navigation */}
      <div className="flex flex-wrap justify-center gap-3 md:gap-4 mb-20">
        {CATEGORIES.map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-7 py-3 text-xs md:text-sm uppercase tracking-widest font-sans font-medium transition-all duration-300 border rounded-none ${
              selectedCategory === cat
                ? "bg-lamborghini-gold text-black border-lamborghini-gold font-semibold"
                : "bg-transparent text-white border-white/10 hover:border-white/30 hover:bg-white/5"
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Grid rendering based on category */}
      <div className="w-full">
        {/* 1. BRIDAL HENNA / LOOKBOOKS */}
        {(selectedCategory === "Showcase" || selectedCategory === "Bridal Henna") && (
          <div className="mb-20">
            {selectedCategory === "Showcase" && (
              <h2 className="text-sm uppercase tracking-widest text-lamborghini-gold mb-10 text-center font-sans font-semibold">
                — Curated Bridal Lookbooks —
              </h2>
            )}
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {lookbooks.map((look) => (
                <div
                  key={look.id}
                  className="portfolio-card group bg-stone border border-white/5 overflow-hidden flex flex-col justify-between cursor-pointer"
                  onMouseEnter={() => handleMouseEnter(look.id)}
                  onMouseLeave={() => handleMouseLeave(look.id)}
                  onClick={() => setActiveLookbook(look)}
                >
                  {/* Visual Shell */}
                  <div className="relative aspect-[3/4] w-full overflow-hidden bg-black border-b border-white/5">
                    {/* Cover Image */}
                    <Image
                      src={look.coverPath}
                      alt={look.title}
                      fill
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                      className="object-cover transition-opacity duration-500 group-hover:opacity-0"
                    />

                    {/* Autoplay Hover Video */}
                    {look.videoPath && (
                      <video
                        ref={(el) => { hoverVideoRefs.current[look.id] = el; }}
                        src={look.videoPath}
                        loop
                        muted
                        playsInline
                        className="absolute inset-0 w-full h-full object-cover opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
                      />
                    )}

                    {/* Look Tag Badge */}
                    <div className="absolute top-4 left-4 bg-black/80 border border-lamborghini-gold/40 px-3 py-1 text-[10px] uppercase tracking-widest text-lamborghini-gold font-sans font-semibold">
                      {look.lookNumber}
                    </div>

                    {/* Hover Indicators */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-6">
                      <div className="flex items-center gap-2 text-lamborghini-gold text-xs uppercase tracking-widest font-sans font-semibold">
                        <Eye className="w-4 h-4" /> Explore Lookbook
                      </div>
                    </div>
                  </div>

                  {/* Card Description */}
                  <div className="p-6 flex flex-col justify-between flex-grow">
                    <div>
                      <div className="text-[10px] text-lamborghini-gold uppercase tracking-widest mb-1.5 font-sans font-medium">
                        {look.category}
                      </div>
                      <h3 className="text-white font-heading text-xl md:text-2xl tracking-widest group-hover:text-lamborghini-gold transition-colors mb-3">
                        {look.title}
                      </h3>
                      <p className="text-ash text-sm font-sans leading-relaxed line-clamp-2">
                        {look.description}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 2. STANDALONE REELS */}
        {(selectedCategory === "Showcase" || selectedCategory === "Short Reels") && (
          <div className="mb-20">
            {(selectedCategory === "Showcase") && (
              <h2 className="text-sm uppercase tracking-widest text-lamborghini-gold mb-10 text-center font-sans font-semibold">
                — Signature Video Reels —
              </h2>
            )}
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {standaloneReels.map((reel) => (
                <div
                  key={reel.id}
                  className="portfolio-card group bg-stone border border-white/5 overflow-hidden cursor-pointer"
                  onMouseEnter={() => handleMouseEnter(reel.id)}
                  onMouseLeave={() => handleMouseLeave(reel.id)}
                  onClick={() => setActiveReel(reel)}
                >
                  <div className="relative aspect-[9/16] w-full overflow-hidden bg-black">
                    {/* Hover loop video */}
                    <video
                      ref={(el) => { hoverVideoRefs.current[reel.id] = el; }}
                      src={reel.videoPath}
                      loop
                      muted
                      playsInline
                      className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />

                    {/* Dark Vignette overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex flex-col justify-end p-4">
                      <div className="flex items-center gap-2 text-white font-sans text-xs uppercase tracking-widest">
                        <Play className="w-3.5 h-3.5 text-lamborghini-gold fill-lamborghini-gold" />
                        <span>{reel.title}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 3. HAIR STYLING */}
        {(selectedCategory === "Showcase" || selectedCategory === "Hairstyling") && (
          <div className="mb-20">
            {selectedCategory === "Showcase" && (
              <h2 className="text-sm uppercase tracking-widest text-lamborghini-gold mb-10 text-center font-sans font-semibold">
                — Hairstyling Add-ons —
              </h2>
            )}
            
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
              {hairStyles.map((hair) => (
                <div
                  key={hair.id}
                  className="portfolio-card group bg-stone border border-white/5 overflow-hidden flex flex-col"
                >
                  <div className="relative aspect-[4/5] w-full overflow-hidden bg-black">
                    <Image
                      src={hair.imagePath}
                      alt={hair.title}
                      fill
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                      className="object-cover transition-transform duration-550 group-hover:scale-103"
                    />
                    
                    {/* Soft luxury border glow */}
                    <div className="absolute inset-0 border border-white/0 group-hover:border-lamborghini-gold/20 transition-all duration-300" />
                  </div>
                  <div className="p-5">
                    <h3 className="text-white font-heading text-lg tracking-widest mb-2">
                      {hair.title}
                    </h3>
                    <p className="text-ash text-xs leading-relaxed font-sans">
                      {hair.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* FULL-SCREEN IMMERSIVE LOOKBOOK MODAL */}
      {activeLookbook && (
        <div className="fixed inset-0 z-[100] bg-black/98 backdrop-blur-lg flex items-center justify-center overflow-y-auto">
          {/* Main Container */}
          <div className="relative w-full min-h-screen flex flex-col md:flex-row">
            
            {/* Close button */}
            <button
              onClick={() => setActiveLookbook(null)}
              className="absolute top-6 right-6 z-50 p-3 bg-white/5 border border-white/10 text-white hover:bg-white/10 hover:text-lamborghini-gold transition-all duration-300 rounded-none"
              aria-label="Close Lookbook"
            >
              <X className="w-5 h-5" />
            </button>

            {/* LEFT SIDE: Image Carousel & Video Player */}
            <div className="w-full md:w-[65%] bg-black flex flex-col items-center justify-center p-6 md:p-12 border-r border-white/5 min-h-[50vh] md:min-h-screen relative">
              
              {/* Main Media Display */}
              <div className="relative w-full h-[55vh] md:h-[70vh] max-w-[550px] mx-auto select-none">
                {/* Images slide */}
                {currentSlideIndex < activeLookbook.images.length ? (
                  <Image
                    src={activeLookbook.images[currentSlideIndex]}
                    alt={`${activeLookbook.title} detail`}
                    fill
                    sizes="(max-width: 1200px) 80vw, 50vw"
                    className="object-contain"
                    priority
                  />
                ) : (
                  // Video slide (rendered if lookbook has a video and index is at the end)
                  activeLookbook.videoPath && (
                    <div className="relative w-full h-full flex items-center justify-center">
                      <video
                        src={activeLookbook.videoPath}
                        controls
                        autoPlay
                        playsInline
                        className="w-full h-full object-contain"
                      />
                    </div>
                  )
                )}
              </div>

              {/* Slider Controls */}
              <div className="flex items-center gap-6 mt-8">
                <button
                  onClick={() => setCurrentSlideIndex(prev => Math.max(0, prev - 1))}
                  disabled={currentSlideIndex === 0}
                  className="p-3 border border-white/10 hover:border-lamborghini-gold disabled:opacity-30 disabled:border-white/10 transition-colors"
                >
                  <ArrowLeft className="w-4 h-4 text-white" />
                </button>
                
                <span className="text-white text-xs tracking-widest font-sans font-medium">
                  {currentSlideIndex + 1} / {activeLookbook.images.length + (activeLookbook.videoPath ? 1 : 0)}
                </span>

                <button
                  onClick={() => setCurrentSlideIndex(prev => Math.min(activeLookbook.images.length + (activeLookbook.videoPath ? 1 : 0) - 1, prev + 1))}
                  disabled={currentSlideIndex === activeLookbook.images.length + (activeLookbook.videoPath ? 1 : 0) - 1}
                  className="p-3 border border-white/10 hover:border-lamborghini-gold disabled:opacity-30 disabled:border-white/10 transition-colors"
                >
                  <ArrowRight className="w-4 h-4 text-white" />
                </button>
              </div>

              {/* Slide thumbnails */}
              <div className="flex justify-center gap-2 mt-6">
                {activeLookbook.images.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setCurrentSlideIndex(idx)}
                    className={`w-2 h-2 rounded-full transition-all duration-300 ${
                      currentSlideIndex === idx ? "bg-lamborghini-gold scale-125" : "bg-white/20"
                    }`}
                  />
                ))}
                {activeLookbook.videoPath && (
                  <button
                    onClick={() => setCurrentSlideIndex(activeLookbook.images.length)}
                    className={`w-2 h-2 rounded-full transition-all duration-300 flex items-center justify-center ${
                      currentSlideIndex === activeLookbook.images.length ? "bg-lamborghini-gold scale-125" : "bg-white/20"
                    }`}
                  >
                    <Play className="w-1 h-1 text-black fill-black" />
                  </button>
                )}
              </div>
            </div>

            {/* RIGHT SIDE: Editorial Details Panel */}
            <div className="w-full md:w-[35%] bg-stone p-8 md:p-16 flex flex-col justify-center min-h-[50vh] md:min-h-screen">
              <div className="text-[11px] text-lamborghini-gold uppercase tracking-widest font-sans font-semibold mb-3">
                Lookbook Collection
              </div>
              
              <div className="text-xs text-white/40 font-mono tracking-widest uppercase mb-4">
                {activeLookbook.lookNumber}
              </div>

              <h1 className="text-white font-heading text-4xl md:text-5xl uppercase tracking-widest leading-none mb-6">
                {activeLookbook.title}
              </h1>

              <div className="w-12 h-[1px] bg-lamborghini-gold/60 mb-8" />

              <p className="text-smoke font-sans leading-relaxed text-sm mb-8">
                {activeLookbook.description}
              </p>

              <div className="border border-white/5 bg-white/[0.01] p-5 mb-8">
                <div className="text-xs text-lamborghini-gold uppercase tracking-wider mb-2 font-semibold">
                  Stylist Recommendation:
                </div>
                <p className="text-ash text-xs leading-relaxed">
                  Best executed under the **{activeLookbook.category === "Bridal" ? "Luxury Bridal" : "High Definition / Standard"}** tier. Highly recommended to book alongside the **Hairstyling add-on** for a cohesive look.
                </p>
              </div>

              <Link
                href="/book?service=Bridal"
                className="w-full text-center py-4 bg-lamborghini-gold text-black uppercase text-xs font-sans tracking-widest font-semibold hover:bg-white transition-colors duration-300"
              >
                Inquire For This Look
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* THEATER MODE MODAL FOR STANDALONE REELS */}
      {activeReel && (
        <div className="fixed inset-0 z-[100] bg-black/99 backdrop-blur-xl flex items-center justify-center p-4">
          <button
            onClick={() => setActiveReel(null)}
            className="absolute top-6 right-6 z-50 p-3 bg-white/5 border border-white/10 text-white hover:bg-white/10 hover:text-lamborghini-gold transition-colors"
            aria-label="Close video player"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="relative w-full max-w-[400px] h-[80vh] bg-black flex items-center justify-center overflow-hidden border border-white/10 shadow-2xl">
            <video
              src={activeReel.videoPath}
              controls
              autoPlay
              playsInline
              className="w-full h-full object-cover"
            />
            
            {/* Overlay description */}
            <div className="absolute top-4 left-4 bg-black/50 border border-white/10 px-3 py-1 text-[10px] uppercase tracking-widest text-white">
              {activeReel.title}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
