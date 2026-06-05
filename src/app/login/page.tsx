"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

export const dynamic = "force-dynamic";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  const handleMagicLink = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const supabase = createClient();
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: `${window.location.origin}/portal`,
        },
      });

      if (error) throw error;
      setSent(true);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Something went wrong";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0A0A0A] flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-10">
          <h1 className="font-heading text-3xl uppercase tracking-[0.2em] text-white mb-2">
            ARM Artistry
          </h1>
          <p className="text-smoke text-sm tracking-widest uppercase">
            Client Portal
          </p>
        </div>

        {/* Card */}
        <div className="border border-white/10 bg-white/[0.02] p-8">
          {sent ? (
            <div className="text-center py-6">
              <div className="w-12 h-12 rounded-full bg-lamborghini-gold/20 flex items-center justify-center mx-auto mb-4">
                <svg
                  className="w-6 h-6 text-lamborghini-gold"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 19v-8.93a2 2 0 01.89-1.664l7-4.666a2 2 0 012.22 0l7 4.666A2 2 0 0121 10.07V19M3 19a2 2 0 002 2h14a2 2 0 002-2M3 19l6.75-4.5M21 19l-6.75-4.5M3 10l6.75 4.5M21 10l-6.75 4.5m0 0l-1.14.76a2 2 0 01-2.22 0L9.75 14.5"
                  />
                </svg>
              </div>
              <h2 className="font-heading text-xl uppercase tracking-wider text-white mb-3">
                Check Your Inbox
              </h2>
              <p className="text-smoke text-sm leading-relaxed">
                We sent a magic link to{" "}
                <span className="text-white font-medium">{email}</span>. Click
                the link in the email to access your portal.
              </p>
              <button
                onClick={() => setSent(false)}
                className="mt-6 text-smoke text-sm underline underline-offset-4 hover:text-white transition-colors"
              >
                Send to a different email
              </button>
            </div>
          ) : (
            <>
              <h2 className="font-heading text-lg uppercase tracking-wider text-white mb-2">
                Sign In
              </h2>
              <p className="text-smoke text-sm mb-8 leading-relaxed">
                Enter your email to receive a secure, passwordless sign-in link.
              </p>

              <form onSubmit={handleMagicLink} className="space-y-4">
                <div>
                  <label
                    htmlFor="email"
                    className="block text-xs uppercase tracking-widest text-smoke mb-2"
                  >
                    Email Address
                  </label>
                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    placeholder="you@example.com"
                    className="w-full bg-white/5 border border-white/10 px-4 py-3 text-white placeholder:text-white/30 focus:outline-none focus:border-lamborghini-gold/50 transition-colors text-sm"
                  />
                </div>

                {error && (
                  <p className="text-red-400 text-sm">{error}</p>
                )}

                <button
                  id="magic-link-submit"
                  type="submit"
                  disabled={loading || !email}
                  className="w-full bg-white text-black py-3 uppercase text-sm font-bold tracking-widest hover:bg-lamborghini-gold transition-colors duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? "Sending..." : "Send Magic Link"}
                </button>
              </form>
            </>
          )}
        </div>

        <p className="text-center text-white/20 text-xs mt-6">
          &copy; {new Date().getFullYear()} ARM Artistry. All rights reserved.
        </p>
      </div>
    </div>
  );
}
