export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { fromZonedTime } from "date-fns-tz";
import { addMinutes, isBefore, isAfter } from "date-fns";

const TIMEZONE = "Asia/Kolkata";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const dateParam = searchParams.get("date"); // Expected: YYYY-MM-DD
    const durationParam = searchParams.get("duration"); // Expected: number of minutes

    if (!dateParam || !durationParam) {
      return NextResponse.json({ error: "Missing 'date' or 'duration' parameter" }, { status: 400 });
    }

    const durationMinutes = parseInt(durationParam, 10);
    const supabase = createClient();

    // 1. Fetch system working hours (in UTC from DB, but conceptually IST)
    const { data: settingsData, error: settingsError } = await supabase
      .from("settings")
      .select("working_hours_start, working_hours_end")
      .single();

    let settings = settingsData;

    if (settingsError || !settings) {
      console.warn("Could not fetch global settings, falling back to 09:00-18:00", settingsError);
      settings = { working_hours_start: "09:00:00", working_hours_end: "18:00:00" };
    }

    // 2. Parse the requested date boundaries in IST and convert to UTC
    const dayStartUTC = fromZonedTime(`${dateParam}T00:00:00`, TIMEZONE);
    const dayEndUTC = fromZonedTime(`${dateParam}T23:59:59.999`, TIMEZONE);

    // 3. Fetch all bookings overlapping this day to exclude them
    const { data: bookings, error: bookingsError } = await supabase
      .from("bookings")
      .select("start_time, end_time")
      .in("status", ["held", "pending", "confirmed"])
      .lt("start_time", dayEndUTC.toISOString())
      .gt("end_time", dayStartUTC.toISOString());

    if (bookingsError) {
      throw bookingsError;
    }

    // 4. Calculate Available Slots in a timezone-independent manner
    const availableSlots: string[] = [];
    const [startH, startM] = settings.working_hours_start.split(":").map(Number);
    const [endH, endM] = settings.working_hours_end.split(":").map(Number);

    // Construct boundaries directly in UTC via fromZonedTime
    const currentSlotUTC = fromZonedTime(
      `${dateParam}T${String(startH).padStart(2, "0")}:${String(startM).padStart(2, "0")}:00`,
      TIMEZONE
    );
    const endBoundaryUTC = fromZonedTime(
      `${dateParam}T${String(endH).padStart(2, "0")}:${String(endM).padStart(2, "0")}:00`,
      TIMEZONE
    );

    const nowUTC = new Date();
    let cursor = new Date(currentSlotUTC);

    // Step by 30 mins
    while (isBefore(cursor, endBoundaryUTC)) {
      const slotEnd = addMinutes(cursor, durationMinutes);

      // Only evaluate slots that don't exceed the working day and are in the future
      if (!isAfter(slotEnd, endBoundaryUTC) && isAfter(cursor, nowUTC)) {
        
        // Filter strict overlaps (start_time < slotEnd AND end_time > cursor)
        const isStrictlyOverlapping = (bookings || []).some((b) => {
          const bStart = new Date(b.start_time);
          const bEnd = new Date(b.end_time);
          return (cursor < bEnd && slotEnd > bStart);
        });

        if (!isStrictlyOverlapping) {
          availableSlots.push(cursor.toISOString()); // Push the ISO representation in UTC
        }
      }

      cursor = addMinutes(cursor, 30);
    }

    return NextResponse.json({ slots: availableSlots });
  } catch (error: unknown) {
    console.error("Availability Error:", error);
    return NextResponse.json({ error: "Failed to compute availability" }, { status: 500 });
  }
}
