import { createAdminClient, createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import AdminDashboardClient from "./AdminDashboardClient";

// Force server-side rendering — admin data must always be fresh
export const dynamic = "force-dynamic";

export default async function AdminDashboard() {
  // ── SERVER-SIDE AUTH GATE ────────────────────────────────────────────────
  const userClient = createClient();
  const {
    data: { user },
  } = await userClient.auth.getUser();

  if (!user || user.email !== process.env.ADMIN_EMAIL) {
    redirect("/");
  }

  // ── DATA FETCHING (SERVER-SIDE) ──────────────────────────────────────────
  const supabase = createAdminClient();

  // 1. Fetch bookings
  const { data: bookings } = await supabase
    .from("bookings")
    .select("*, service_tiers(title)")
    .order("created_at", { ascending: false })
    .limit(50);

  // 2. Fetch global working hours settings
  const { data: settingsRow } = await supabase
    .from("settings")
    .select("*")
    .limit(1);
  const settings = settingsRow && settingsRow.length > 0 ? settingsRow[0] : null;

  // 3. Fetch all service tiers
  const { data: serviceTiers } = await supabase
    .from("service_tiers")
    .select("*")
    .order("price_inr", { ascending: true });

  // 4. Fetch all portfolio assets (both active and inactive)
  const { data: portfolioAssets } = await supabase
    .from("portfolio_assets")
    .select("*")
    .order("display_order", { ascending: true })
    .order("created_at", { ascending: false });

  return (
    <AdminDashboardClient
      userEmail={user.email || ""}
      initialBookings={bookings || []}
      initialSettings={settings}
      initialServiceTiers={serviceTiers || []}
      initialPortfolioAssets={portfolioAssets || []}
    />
  );
}
