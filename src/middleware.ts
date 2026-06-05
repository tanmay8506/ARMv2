export const runtime = "nodejs";

import { type NextRequest, NextResponse } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";

export async function middleware(request: NextRequest) {
  // Update session to keep user logged in
  const { supabaseResponse, user } = await updateSession(request);
  const path = request.nextUrl.pathname;

  // Protect /portal route
  if (path.startsWith("/portal") && !user) {
    // Redirect unauthenticated users strictly to /login
    return NextResponse.redirect(new URL("/login", request.url));
  }

  // Prevent logged-in users from accessing /login
  if (path.startsWith("/login") && user) {
    return NextResponse.redirect(new URL("/portal", request.url));
  }

  // Protect /admin and /api/admin routes
  if (path.startsWith("/admin") || path.startsWith("/api/admin")) {
    if (!user || user.email !== process.env.ADMIN_EMAIL) {
      // Bounce unauthorized requests to home page (security through obscurity)
      return NextResponse.redirect(new URL("/", request.url));
    }
  }

  return supabaseResponse;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * Feel free to modify this pattern to include more paths.
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
