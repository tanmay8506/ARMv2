import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";
import { resend } from "@/lib/resend/client";
import ReminderEmail from "@/components/emails/ReminderEmail";
import { formatInTimeZone, toDate } from "date-fns-tz";
import { addDays, startOfDay, endOfDay } from "date-fns";

export const runtime = "nodejs";

export async function GET(request: Request) {
  try {
    const authHeader = request.headers.get("Authorization");
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const supabase = createAdminClient();
    
    // Find bookings that are 3 days away (IST time)
    const nowIst = toDate(new Date(), { timeZone: "Asia/Kolkata" });
    const targetDate = addDays(nowIst, 3);
    const startOfTarget = startOfDay(targetDate);
    const endOfTarget = endOfDay(targetDate);

    const { data: bookings, error } = await supabase
      .from("bookings")
      .select("id, start_time, client_id, service_tiers(title)")
      .eq("status", "confirmed")
      .gte("start_time", startOfTarget.toISOString())
      .lte("start_time", endOfTarget.toISOString());

    if (error) {
      console.error("Failed to fetch upcoming bookings:", error);
      return NextResponse.json({ error: "Database query failed" }, { status: 500 });
    }

    if (!bookings || bookings.length === 0) {
      return NextResponse.json({ success: true, message: "No upcoming bookings found", count: 0 });
    }

    let successCount = 0;
    const errors: unknown[] = [];

    for (const booking of bookings) {
      try {
        const serviceTitle = (booking.service_tiers as unknown as { title: string } | null)?.title || "Bridal Session";
        const bookingTime = formatInTimeZone(new Date(booking.start_time), "Asia/Kolkata", "h:mm a, EEEE, MMMM d, yyyy");
        const bookingId = booking.id.split("-")[0];

        // Send reminder email
        await resend.emails.send({
          from: "ARM Artistry <onboarding@resend.dev>",
          to: "client@example.com", // Normally fetch user email by client_id
          subject: `Reminder: Upcoming Appointment on ${formatInTimeZone(new Date(booking.start_time), "Asia/Kolkata", "MMMM d")}`,
          react: ReminderEmail({
            clientEmail: "client@example.com",
            serviceTitle,
            bookingTime,
            bookingId,
          }),
        });

        successCount++;
      } catch (err) {
        console.error(`Failed to send reminder for booking ${booking.id}:`, err);
        errors.push({ id: booking.id, error: err });
      }
    }

    return NextResponse.json({
      success: true,
      message: `Reminders processed. Sent: ${successCount}. Errors: ${errors.length}`,
      count: successCount,
      errors: errors.length > 0 ? errors : undefined,
    });
  } catch (error) {
    console.error("Cron Reminder Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
