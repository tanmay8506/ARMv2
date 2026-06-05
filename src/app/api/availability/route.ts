export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { fromZonedTime, toZonedTime } from "date-fns-tz";
import { startOfDay, endOfDay, addMinutes, isBefore, isAfter } from "date-fns";

const TIMEZONE = "Asia/Kolkata";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const dateParam = searchParams.get("date");
    const durationParam = searchParams.get("duration");

    if (!dateParam || !durationParam) {
      return NextResponse.json({ error: "Missing 'date' or 'duration' parameter" }, { status: 400 });
    }

    const durationMinutes = parseInt(durationParam, 10);
    const supabase = createClient();

    // 1. Fetch system working hours (in UTC from DB, but conceptually IST)
    const { data: settings, error: settingsError } = await supabase
      .from("settings")
      .select("working_hours_start, working_hours_end")
      .single();

    if (settingsError || !settings) {
      throw new Error("Could not fetch global settings");
    }

    // Explicit Date-fns-tz Timezone Mathematics
    // Parse the requested date assuming it's in IST
    const requestedDateStr = `${dateParam}T00:00:00+05:30`;
    const requestedDateIST = new Date(requestedDateStr);
    
    // Bounds for the day
    const dayStartIST = toZonedTime(startOfDay(requestedDateIST), TIMEZONE);
    const dayEndIST = toZonedTime(endOfDay(requestedDateIST), TIMEZONE);

    // Convert IST day bounds back to UTC for the database query
    const dayStartUTC = fromZonedTime(dayStartIST, TIMEZONE);
    const dayEndUTC = fromZonedTime(dayEndIST, TIMEZONE);

    // 2. Fetch existing bookings for this day to exclude them
    const { data: bookings, error: bookingsError } = await supabase
      .from("bookings")
      .select("start_time, end_time")
      .in("status", ["held", "pending", "confirmed"])
      .gte("start_time", dayStartUTC.toISOString())
      .lte("end_time", dayEndUTC.toISOString());

    if (bookingsError) {
      throw bookingsError;
    }

    // 3. Calculate Available Slots
    const availableSlots: string[] = [];
    
    // Parse start and end hours from settings (e.g., '09:00:00')
    const [startH, startM] = settings.working_hours_start.split(":").map(Number);
    const [endH, endM] = settings.working_hours_end.split(":").map(Number);

    // Construct the actual start/end Date objects in IST
    let currentSlotIST = new Date(requestedDateIST);
    currentSlotIST.setHours(startH, startM, 0, 0);

    const endBoundaryIST = new Date(requestedDateIST);
    endBoundaryIST.setHours(endH, endM, 0, 0);

    const nowIST = toZonedTime(new Date(), TIMEZONE);

    // Step by 30 mins
    while (isBefore(currentSlotIST, endBoundaryIST)) {
      const slotEndIST = addMinutes(currentSlotIST, durationMinutes);

      // Only evaluate slots that don't exceed the working day and are in the future
      if (!isAfter(slotEndIST, endBoundaryIST) && isAfter(currentSlotIST, nowIST)) {
        
        // Filter strict overlaps
        const isStrictlyOverlapping = bookings.some((b) => {
          const bStartIST = toZonedTime(new Date(b.start_time), TIMEZONE);
          const bEndIST = toZonedTime(new Date(b.end_time), TIMEZONE);
          return (currentSlotIST < bEndIST && slotEndIST > bStartIST);
        });

        if (!isStrictlyOverlapping) {
          availableSlots.push(currentSlotIST.toISOString()); // Push the ISO representation (UTC underlying, correct instant)
        }
      }

      currentSlotIST = addMinutes(currentSlotIST, 30);
    }

    return NextResponse.json({ slots: availableSlots });
  } catch (error: unknown) {
    console.error("Availability Error:", error);
    return NextResponse.json({ error: "Failed to compute availability" }, { status: 500 });
  }
}
