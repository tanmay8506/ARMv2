"use client";

import { useState, useRef } from "react";
import Image from "next/image";
import { X, ZoomIn } from "lucide-react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";

interface PortfolioAsset {
  id: string;
  title: string;
  category: string;
  cloudinary_path: string;
  width: number;
  height: number;
}

interface PortfolioGalleryProps {
  initialAssets: PortfolioAsset[];
}

const CATEGORIES = ["All", "Bridal", "Arabic", "Traditional", "Indo-Arabic"];

export default function PortfolioGallery({ initialAssets }: PortfolioGalleryProps) {
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [activeImage, setActiveImage] = useState<PortfolioAsset | null>(null);
  
  const galleryRef = useRef<HTMLDivElement>(null);

  // Filter assets based on selection
  const filteredAssets = selectedCategory === "All"
    ? initialAssets
    : initialAssets.filter(asset => asset.category.toLowerCase() === selectedCategory.toLowerCase());

  useGSAP(() => {
    // Fade in gallery items whenever category changes
    gsap.fromTo(
      ".gallery-item",
      { opacity: 0, scale: 0.95, y: 20 },
      { opacity: 1, scale: 1, y: 0, duration: 0.6, stagger: 0.05, ease: "power2.out" }
    );
  }, { dependencies: [selectedCategory], scope: galleryRef });

  return (
    <div ref={galleryRef} className="w-full">
      {/* Category Filter Tabs */}
      <div className="flex flex-wrap justify-center gap-3 md:gap-4 mb-16">
        {CATEGORIES.map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-6 py-2.5 text-xs md:text-sm uppercase tracking-widest font-sans font-medium transition-all duration-300 border rounded-none ${
              selectedCategory === cat
                ? "bg-lamborghini-gold text-black border-lamborghini-gold"
                : "bg-transparent text-white border-white/20 hover:border-white/40 hover:bg-white/5"
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Gallery Grid */}
      {filteredAssets.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {filteredAssets.map((asset) => (
            <div
              key={asset.id}
              className="gallery-item group relative cursor-pointer border border-white/10 bg-white/[0.02] overflow-hidden rounded-none"
              onClick={() => setActiveImage(asset)}
            >
              {/* Outer Shell for preventing CLS */}
              <div 
                className="relative w-full overflow-hidden"
                style={{ aspectRatio: `${asset.width} / ${asset.height}` }}
              >
                {/* Visual guidelines: never animate the actual <img> on hover (Gemini defect ban) */}
                {/* Instead, we animate the overlay and icon, keeping the image stable */}
                <Image
                  src={asset.cloudinary_path}
                  alt={asset.title}
                  fill
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  className="object-cover transition-opacity duration-300"
                />
                
                {/* Hover Overlay */}
                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col items-center justify-center gap-3 p-4">
                  <div className="w-10 h-10 rounded-none border border-lamborghini-gold/50 bg-black/50 flex items-center justify-center transform translate-y-2 group-hover:translate-y-0 transition-transform duration-300">
                    <ZoomIn className="w-5 h-5 text-lamborghini-gold" strokeWidth={1.5} />
                  </div>
                  <span className="text-white text-xs uppercase tracking-widest text-center mt-2 font-heading">
                    {asset.title}
                  </span>
                  <span className="text-lamborghini-gold text-[10px] uppercase tracking-wider">
                    {asset.category}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="border border-white/10 border-dashed p-20 text-center text-smoke w-full">
          <p className="italic font-sans text-sm">No artwork available in this category yet.</p>
        </div>
      )}

      {/* Full-Screen Lightbox */}
      {activeImage && (
        <div className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-md flex items-center justify-center p-4">
          <button
            onClick={() => setActiveImage(null)}
            className="absolute top-6 right-6 p-3 bg-white/5 border border-white/10 text-white hover:bg-white/10 transition-colors rounded-none"
            aria-label="Close lightbox"
          >
            <X className="w-5 h-5" />
          </button>
          
          <div className="max-w-[90vw] max-h-[85vh] flex flex-col items-center">
            <div className="relative w-[85vw] h-[70vh]">
              <Image
                src={activeImage.cloudinary_path}
                alt={activeImage.title}
                fill
                sizes="85vw"
                className="object-contain border border-white/10"
                priority
              />
            </div>
            <div className="text-center mt-6">
              <h4 className="text-white uppercase font-heading text-lg tracking-widest mb-1">
                {activeImage.title}
              </h4>
              <p className="text-lamborghini-gold text-xs uppercase tracking-wider">
                {activeImage.category}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
