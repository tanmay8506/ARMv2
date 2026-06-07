import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const supabase = createClient();
    const { data: tiers, error } = await supabase
      .from("service_tiers")
      .select("*")
      .eq("is_active", true)
      .order("price_inr", { ascending: true });

    if (error) throw error;
    return NextResponse.json({ tiers });
  } catch (error: unknown) {
    console.error("Failed to fetch service tiers:", error);
    return NextResponse.json({ error: "Failed to fetch service tiers" }, { status: 500 });
  }
}
