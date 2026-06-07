import { NextResponse } from "next/server";
import { createClient, createAdminClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user || user.email !== process.env.ADMIN_EMAIL) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { working_hours_start, working_hours_end, timezone } = await request.json();

    if (!working_hours_start || !working_hours_end || !timezone) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const adminSupabase = createAdminClient();

    // Check if settings row exists
    const { data: currentSettings, error: fetchErr } = await adminSupabase
      .from("settings")
      .select("id")
      .limit(1);

    if (fetchErr) throw fetchErr;

    let result;
    if (currentSettings && currentSettings.length > 0) {
      const { data, error: updateErr } = await adminSupabase
        .from("settings")
        .update({
          working_hours_start,
          working_hours_end,
          timezone,
          updated_at: new Date().toISOString(),
        })
        .eq("id", currentSettings[0].id)
        .select()
        .single();

      if (updateErr) throw updateErr;
      result = data;
    } else {
      const { data, error: insertErr } = await adminSupabase
        .from("settings")
        .insert({
          working_hours_start,
          working_hours_end,
          timezone,
        })
        .select()
        .single();

      if (insertErr) throw insertErr;
      result = data;
    }

    return NextResponse.json({ success: true, settings: result });
  } catch (error: unknown) {
    console.error("Admin Settings Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
