import { NextResponse } from "next/server";
import { createClient, createAdminClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

async function isAdmin() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  return user && user.email === process.env.ADMIN_EMAIL;
}

export async function POST(request: Request) {
  try {
    if (!await isAdmin()) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { title, description, duration_minutes, price_inr } = await request.json();

    if (!title || !duration_minutes || price_inr === undefined) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const adminSupabase = createAdminClient();
    const { data, error } = await adminSupabase
      .from("service_tiers")
      .insert({
        title,
        description,
        duration_minutes: parseInt(duration_minutes, 10),
        price_inr: parseFloat(price_inr),
        is_active: true,
      })
      .select()
      .single();

    if (error) throw error;
    return NextResponse.json({ success: true, service: data });
  } catch (error: unknown) {
    console.error("Admin Services POST Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    if (!await isAdmin()) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id, title, description, duration_minutes, price_inr, is_active } = await request.json();

    if (!id) {
      return NextResponse.json({ error: "Missing service ID" }, { status: 400 });
    }

    const adminSupabase = createAdminClient();
    const updates: Record<string, unknown> = {};
    if (title !== undefined) updates.title = title;
    if (description !== undefined) updates.description = description;
    if (duration_minutes !== undefined) updates.duration_minutes = parseInt(duration_minutes, 10);
    if (price_inr !== undefined) updates.price_inr = parseFloat(price_inr);
    if (is_active !== undefined) updates.is_active = is_active;

    const { data, error } = await adminSupabase
      .from("service_tiers")
      .update(updates)
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;
    return NextResponse.json({ success: true, service: data });
  } catch (error: unknown) {
    console.error("Admin Services PATCH Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    if (!await isAdmin()) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "Missing service ID" }, { status: 400 });
    }

    const adminSupabase = createAdminClient();
    
    // Check if there are active bookings referencing this tier
    const { data: bookings, error: bookingsErr } = await adminSupabase
      .from("bookings")
      .select("id")
      .eq("service_tier_id", id)
      .limit(1);

    if (bookingsErr) throw bookingsErr;

    if (bookings && bookings.length > 0) {
      // Soft delete: toggle is_active to false
      const { data, error } = await adminSupabase
        .from("service_tiers")
        .update({ is_active: false })
        .eq("id", id)
        .select()
        .single();
      if (error) throw error;
      return NextResponse.json({ success: true, message: "Soft deleted due to existing bookings referencing it.", service: data });
    } else {
      // Hard delete
      const { error } = await adminSupabase
        .from("service_tiers")
        .delete()
        .eq("id", id);
      if (error) throw error;
      return NextResponse.json({ success: true, message: "Hard deleted successfully." });
    }
  } catch (error: unknown) {
    console.error("Admin Services DELETE Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
