"use client";

import { useEffect, useRef } from "react";
import { createClient } from "@/lib/supabase/client";

export default function AuthCallbackPage() {
  const redirectedRef = useRef(false);

  useEffect(() => {
    const supabase = createClient();
    
    const handleAuth = async () => {
      if (redirectedRef.current) return;
      
      const { data: { session } } = await supabase.auth.getSession();
      
      if (session) {
        redirectedRef.current = true;
        // Check if user is admin
        const adminEmail = process.env.NEXT_PUBLIC_ADMIN_EMAIL || "tanmay8506@gmail.com";
        if (session.user?.email === adminEmail) {
          window.location.href = "/admin";
        } else {
          window.location.href = "/portal";
        }
      } else {
        // Fallback: listen for auth changes
        const { data: { subscription } } = supabase.auth.onAuthStateChange((event, currentSession) => {
          if (currentSession && !redirectedRef.current) {
            redirectedRef.current = true;
            subscription.unsubscribe();
            const adminEmail = process.env.NEXT_PUBLIC_ADMIN_EMAIL || "tanmay8506@gmail.com";
            if (currentSession.user?.email === adminEmail) {
              window.location.href = "/admin";
            } else {
              window.location.href = "/portal";
            }
          }
        });

        // Set a timeout to redirect to login if no session is detected in 5 seconds
        const timer = setTimeout(() => {
          if (!redirectedRef.current) {
            redirectedRef.current = true;
            subscription.unsubscribe();
            window.location.href = "/login?error=Timeout establishing session";
          }
        }, 5000);

        return () => {
          clearTimeout(timer);
          subscription.unsubscribe();
        };
      }
    };

    handleAuth();
  }, []);

  return (
    <div className="min-h-screen bg-[#0A0A0A] flex items-center justify-center">
      <div className="text-center">
        <p className="text-lamborghini-gold text-xs uppercase tracking-[0.2em] animate-pulse">
          Establishing Secure Session...
        </p>
      </div>
    </div>
  );
}
