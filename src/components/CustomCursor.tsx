"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";

export default function CustomCursor() {
  const cursorDot = useRef<HTMLDivElement>(null);
  const cursorRing = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!cursorDot.current || !cursorRing.current) return;

    // Use gsap.quickTo for performance (no React state updates)
    const xDot = gsap.quickTo(cursorDot.current, "x", {
      duration: 0.1,
      ease: "power3",
    });
    const yDot = gsap.quickTo(cursorDot.current, "y", {
      duration: 0.1,
      ease: "power3",
    });

    const xRing = gsap.quickTo(cursorRing.current, "x", {
      duration: 0.3,
      ease: "power3",
    });
    const yRing = gsap.quickTo(cursorRing.current, "y", {
      duration: 0.3,
      ease: "power3",
    });

    const moveCursor = (e: MouseEvent) => {
      // Offset by half of width/height to center the cursor
      xDot(e.clientX - 4);
      yDot(e.clientY - 4);

      xRing(e.clientX - 20);
      yRing(e.clientY - 20);
    };

    window.addEventListener("mousemove", moveCursor);

    // Interactive hover state
    const handleMouseOver = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (
        window.getComputedStyle(target).cursor === "pointer" ||
        target.tagName.toLowerCase() === "a" ||
        target.tagName.toLowerCase() === "button"
      ) {
        gsap.to(cursorRing.current, { scale: 1.5, opacity: 0.8, duration: 0.3 });
        gsap.to(cursorDot.current, { scale: 0.5, duration: 0.3 });
      }
    };

    const handleMouseOut = () => {
      gsap.to(cursorRing.current, { scale: 1, opacity: 1, duration: 0.3 });
      gsap.to(cursorDot.current, { scale: 1, duration: 0.3 });
    };

    window.addEventListener("mouseover", handleMouseOver);
    window.addEventListener("mouseout", handleMouseOut);

    return () => {
      window.removeEventListener("mousemove", moveCursor);
      window.removeEventListener("mouseover", handleMouseOver);
      window.removeEventListener("mouseout", handleMouseOut);
    };
  }, []);

  return (
    <>
      <div ref={cursorDot} className="cursor-dot" />
      <div ref={cursorRing} className="cursor-ring" />
    </>
  );
}
