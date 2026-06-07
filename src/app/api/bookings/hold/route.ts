import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
  try {
    const { client_id, service_tier_id, start_time, end_time } = await request.json();

    if (!client_id || !service_tier_id || !start_time || !end_time) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // Reject non-UTC ISO dates to enforce database consistency
    if (!start_time.endsWith("Z") && !start_time.includes("+00:00")) {
      return NextResponse.json(
        { error: "start_time must be a UTC ISO string (ending in Z or +00:00)" },
        { status: 400 }
      );
    }
    if (!end_time.endsWith("Z") && !end_time.includes("+00:00")) {
      return NextResponse.json(
        { error: "end_time must be a UTC ISO string (ending in Z or +00:00)" },
        { status: 400 }
      );
    }

    const supabase = createClient();

    // Call the Postgres RPC function to atomically hold the slot
    const { data: bookingId, error } = await supabase.rpc("hold_slot", {
      p_client_id: client_id,
      p_service_tier_id: service_tier_id,
      p_start_time: start_time,
      p_end_time: end_time,
      p_hold_duration: "15 minutes",
    });

    if (error) {
      // 409 Conflict if unique_violation or custom exception raised
      if (
        error.message.includes("Slot is already taken") || 
        error.code === "23505" || 
        error.code === "P0001"
      ) {
        return NextResponse.json({ error: "Slot no longer available" }, { status: 409 });
      }
      throw error;
    }

    return NextResponse.json({ booking_id: bookingId, status: "held" }, { status: 200 });

  } catch (error: unknown) {
    console.error("Hold Booking Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
