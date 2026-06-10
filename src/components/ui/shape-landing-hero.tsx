"use client";

import { motion } from "framer-motion";
import { Circle, ArrowUpRight } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

type ShapeType = "brush" | "lipstick" | "compact" | "mascara" | "default";

function ElegantShape({
  className,
  delay = 0,
  width = 400,
  height = 100,
  rotate = 0,
  gradient = "from-lamborghini-gold/[0.12]",
  shapeType = "default",
}: {
  className?: string;
  delay?: number;
  width?: number;
  height?: number;
  rotate?: number;
  gradient?: string;
  shapeType?: ShapeType;
}) {
  return (
    <motion.div
      initial={{
        opacity: 0,
        y: -150,
        rotate: rotate - 15,
      }}
      animate={{
        opacity: 1,
        y: 0,
        rotate: rotate,
      }}
      transition={{
        duration: 2.4,
        delay,
        ease: [0.23, 0.86, 0.39, 0.96] as const,
        opacity: { duration: 1.2 },
      }}
      className={cn("absolute pointer-events-none select-none", className)}
    >
      <motion.div
        animate={{
          y: [0, 15, 0],
        }}
        transition={{
          duration: 12,
          repeat: Number.POSITIVE_INFINITY,
          ease: "easeInOut",
        }}
        style={{
          width,
          height,
        }}
        className="relative"
      >
        {/* Core shape drawing */}
        {shapeType === "brush" && (
          <svg
            viewBox="0 0 100 400"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="w-full h-full drop-shadow-[0_8px_32px_rgba(255,192,0,0.15)]"
          >
            <defs>
              <linearGradient id="goldBrushGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#FFC000" stopOpacity="0.4" />
                <stop offset="100%" stopColor="#917300" stopOpacity="0.05" />
              </linearGradient>
              <linearGradient id="ferruleGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#FFC000" stopOpacity="0.8" />
                <stop offset="50%" stopColor="#FFFFFF" stopOpacity="0.9" />
                <stop offset="100%" stopColor="#917300" stopOpacity="0.7" />
              </linearGradient>
              <linearGradient id="bristleGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.8" />
                <stop offset="30%" stopColor="#FFC000" stopOpacity="0.5" />
                <stop offset="100%" stopColor="#1A1A1A" stopOpacity="0.2" />
              </linearGradient>
            </defs>
            {/* Tapered handle */}
            <path
              d="M48 100 L49 390 Q50 395 51 390 L52 100 Z"
              fill="url(#goldBrushGrad)"
              stroke="#FFC000"
              strokeWidth="0.5"
              strokeOpacity="0.3"
            />
            {/* Ferruler */}
            <path
              d="M45 75 L55 75 L54 100 L46 100 Z"
              fill="url(#ferruleGrad)"
            />
            {/* Soft Bristles */}
            <path
              d="M50 10 C32 30, 42 75, 50 75 C58 75, 68 30, 50 10 Z"
              fill="url(#bristleGrad)"
              stroke="#FFC000"
              strokeWidth="1"
              strokeOpacity="0.6"
            />
          </svg>
        )}

        {shapeType === "lipstick" && (
          <svg
            viewBox="0 0 100 300"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="w-full h-full drop-shadow-[0_8px_32px_rgba(255,192,0,0.15)]"
          >
            <defs>
              <linearGradient id="lipstickBase" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#1C1917" stopOpacity="0.8" />
                <stop offset="100%" stopColor="#000000" stopOpacity="0.9" />
              </linearGradient>
              <linearGradient id="lipstickGold" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#FFC000" stopOpacity="0.9" />
                <stop offset="100%" stopColor="#917300" stopOpacity="0.4" />
              </linearGradient>
              <linearGradient id="lipstickRed" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#FFC000" stopOpacity="0.9" />
                <stop offset="50%" stopColor="#917300" stopOpacity="0.7" />
                <stop offset="100%" stopColor="#000000" stopOpacity="0.3" />
              </linearGradient>
            </defs>
            {/* Main Outer Casing */}
            <rect
              x="30"
              y="110"
              width="40"
              height="160"
              rx="1"
              fill="url(#lipstickBase)"
              stroke="#FFC000"
              strokeWidth="1.5"
              strokeOpacity="0.3"
            />
            {/* Inner Gold Collar */}
            <rect
              x="36"
              y="60"
              width="28"
              height="50"
              fill="url(#lipstickGold)"
              stroke="#FFC000"
              strokeWidth="0.5"
            />
            {/* Slanted Lipstick Bullet */}
            <path
              d="M39 60 L39 25 L55 12 L61 18 L61 60 Z"
              fill="url(#lipstickRed)"
              stroke="#FFC000"
              strokeWidth="1"
            />
          </svg>
        )}

        {shapeType === "mascara" && (
          <svg
            viewBox="0 0 100 350"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="w-full h-full drop-shadow-[0_8px_32px_rgba(255,192,0,0.15)]"
          >
            <defs>
              <linearGradient id="mascaraGold" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#FFC000" stopOpacity="0.7" />
                <stop offset="100%" stopColor="#917300" stopOpacity="0.1" />
              </linearGradient>
            </defs>
            {/* Wand shaft */}
            <rect
              x="48"
              y="80"
              width="4"
              height="200"
              fill="#FFC000"
              opacity="0.8"
            />
            {/* Stacked Mascara Applicator Rings */}
            <ellipse cx="50" cy="25" rx="7" ry="2.5" fill="url(#mascaraGold)" stroke="#FFC000" strokeWidth="0.5" />
            <ellipse cx="50" cy="32" rx="9" ry="3" fill="url(#mascaraGold)" stroke="#FFC000" strokeWidth="0.5" />
            <ellipse cx="50" cy="40" rx="10" ry="3.2" fill="url(#mascaraGold)" stroke="#FFC000" strokeWidth="0.5" />
            <ellipse cx="50" cy="48" rx="10" ry="3.2" fill="url(#mascaraGold)" stroke="#FFC000" strokeWidth="0.5" />
            <ellipse cx="50" cy="56" rx="9" ry="3" fill="url(#mascaraGold)" stroke="#FFC000" strokeWidth="0.5" />
            <ellipse cx="50" cy="64" rx="8" ry="2.8" fill="url(#mascaraGold)" stroke="#FFC000" strokeWidth="0.5" />
            <ellipse cx="50" cy="72" rx="6" ry="2.2" fill="url(#mascaraGold)" stroke="#FFC000" strokeWidth="0.5" />
            {/* Base Grip */}
            <rect
              x="38"
              y="250"
              width="24"
              height="80"
              rx="1"
              fill="#181818"
              stroke="#FFC000"
              strokeWidth="1"
              strokeOpacity="0.4"
            />
          </svg>
        )}

        {shapeType === "compact" && (
          <svg
            viewBox="0 0 200 200"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="w-full h-full drop-shadow-[0_8px_32px_rgba(255,192,0,0.15)]"
          >
            <defs>
              <linearGradient id="compactGold" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#FFC000" stopOpacity="0.4" />
                <stop offset="100%" stopColor="#917300" stopOpacity="0.05" />
              </linearGradient>
            </defs>
            {/* Outer Ring */}
            <circle
              cx="100"
              cy="100"
              r="80"
              stroke="url(#compactGold)"
              strokeWidth="2.5"
              fill="url(#compactGold)"
              fillOpacity="0.05"
            />
            {/* Inner Ring (Mirror boundary) */}
            <circle
              cx="100"
              cy="100"
              r="62"
              stroke="#FFC000"
              strokeWidth="1"
              strokeDasharray="4 3"
              strokeOpacity="0.5"
              fill="url(#compactGold)"
              fillOpacity="0.03"
            />
            {/* Glass Mirror Shine */}
            <path
              d="M45 55 A62 62 0 0 1 155 55"
              stroke="#FFFFFF"
              strokeWidth="2.5"
              strokeLinecap="round"
              opacity="0.15"
            />
          </svg>
        )}

        {shapeType === "default" && (
          <div
            className={cn(
              "absolute inset-0 rounded-full",
              "bg-gradient-to-r to-transparent",
              gradient,
              "backdrop-blur-[2px] border-2 border-white/[0.15]",
              "shadow-[0_8px_32px_0_rgba(255,255,255,0.1)]",
              "after:absolute after:inset-0 after:rounded-full",
              "after:bg-[radial-gradient(circle_at_50%_50%,rgba(255,255,255,0.2),transparent_70%)]"
            )}
          />
        )}
      </motion.div>
    </motion.div>
  );
}

export function HeroGeometric({
  badge = "Exclusive Studio",
  title1 = "Bespoke Artistry",
  title2 = "Modern Visual Luxury",
}: {
  badge?: string;
  title1?: string;
  title2?: string;
}) {
  const fadeUpVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: (i: number) => ({
      opacity: 1,
      y: 0,
      transition: {
        duration: 1,
        delay: 0.5 + i * 0.2,
        ease: [0.25, 0.4, 0.25, 1] as const,
      },
    }),
  };

  return (
    <div className="relative min-h-[100vh] w-full flex flex-col items-center justify-center overflow-hidden bg-black select-none">
      {/* Deep gold ambient light */}
      <div className="absolute inset-0 bg-gradient-to-br from-lamborghini-gold/[0.04] via-transparent to-transparent blur-3xl pointer-events-none" />

      {/* Floating Makeup items */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Makeup Brush - Left Top */}
        <ElegantShape
          delay={0.3}
          width={180}
          height={400}
          rotate={18}
          shapeType="brush"
          className="left-[-5%] md:left-[0%] top-[10%] md:top-[12%]"
        />

        {/* Lipstick - Right Middle */}
        <ElegantShape
          delay={0.5}
          width={140}
          height={280}
          rotate={-22}
          shapeType="lipstick"
          className="right-[2%] md:right-[5%] top-[55%] md:top-[60%]"
        />

        {/* Mascara Wand - Left Bottom */}
        <ElegantShape
          delay={0.4}
          width={150}
          height={320}
          rotate={-12}
          shapeType="mascara"
          className="left-[5%] md:left-[8%] bottom-[5%] md:bottom-[8%]"
        />

        {/* Powder Compact - Right Top */}
        <ElegantShape
          delay={0.6}
          width={240}
          height={240}
          rotate={25}
          shapeType="compact"
          className="right-[8%] md:right-[12%] top-[8%] md:top-[10%]"
        />

        {/* Small Tonal Ellipse - Top Left Center */}
        <ElegantShape
          delay={0.7}
          width={100}
          height={100}
          rotate={-35}
          shapeType="compact"
          className="left-[25%] md:left-[30%] top-[5%] md:top-[8%] opacity-40 scale-75"
        />
      </div>

      {/* Hero Content Panel */}
      <div className="relative z-10 container mx-auto px-4 md:px-6 flex flex-col items-center">
        <div className="max-w-4xl mx-auto text-center flex flex-col items-center">
          
          {/* Badge */}
          <motion.div
            custom={0}
            variants={fadeUpVariants}
            initial="hidden"
            animate="visible"
            className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-none bg-white/[0.03] border border-white/[0.08] mb-8 md:mb-12"
          >
            <Circle className="h-1.5 w-1.5 fill-lamborghini-gold stroke-lamborghini-gold animate-pulse" />
            <span className="text-[10px] md:text-xs text-white uppercase tracking-[0.25em] font-sans font-medium">
              {badge}
            </span>
          </motion.div>

          {/* Heading */}
          <motion.div
            custom={1}
            variants={fadeUpVariants}
            initial="hidden"
            animate="visible"
          >
            <h1 className="text-[44px] sm:text-[68px] md:text-[96px] lg:text-[120px] font-heading font-normal text-white uppercase leading-[0.92] tracking-tight mb-8">
              <span className="bg-clip-text text-transparent bg-gradient-to-b from-white to-white/70">
                {title1}
              </span>
              <br />
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-lamborghini-gold via-white to-lamborghini-gold">
                {title2}
              </span>
            </h1>
          </motion.div>

          {/* Description Paragraph */}
          <motion.div
            custom={2}
            variants={fadeUpVariants}
            initial="hidden"
            animate="visible"
            className="flex flex-col items-center"
          >
            <p className="text-sm sm:text-base md:text-lg text-ash mb-12 leading-relaxed max-w-xl mx-auto px-4 tracking-wide font-sans">
              The intersection of premium cosmetic design and unapologetic modern luxury. We craft bespoke beauty, makeup, and henna narratives for the vanguard bride.
            </p>

            {/* Discover Services Button */}
            <div className="group">
              <Link 
                href="/services"
                className="bg-lamborghini-gold text-black flex items-center gap-4 px-6 py-4 text-sm uppercase transition-all duration-[700ms] ease-[cubic-bezier(0.32,0.72,0,1)] font-sans tracking-wider font-semibold border-none rounded-none active:scale-[0.98] hover:bg-white cursor-pointer"
              >
                <span>Discover Services</span>
                <div className="w-8 h-8 bg-black/10 flex items-center justify-center transition-transform duration-[700ms] ease-[cubic-bezier(0.32,0.72,0,1)] group-hover:translate-x-1 group-hover:-translate-y-[1px] group-hover:scale-105">
                  <ArrowUpRight className="w-4 h-4 text-black" strokeWidth={1.5} />
                </div>
              </Link>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Floor Fade Out Overlay */}
      <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-black to-transparent pointer-events-none" />
    </div>
  );
}
