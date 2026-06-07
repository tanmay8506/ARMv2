import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";
import { resend } from "@/lib/resend/client";
import ReminderEmail from "@/components/emails/ReminderEmail";
import { formatInTimeZone, toDate } from "date-fns-tz";
import { addDays, startOfDay, endOfDay } from "date-fns";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const authHeader = request.headers.get("Authorization");
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const supabase = createAdminClient();
    
    // Find bookings that are 1 day away (tomorrow) in Asia/Kolkata time
    const nowIst = toDate(new Date(), { timeZone: "Asia/Kolkata" });
    const targetDate = addDays(nowIst, 1);
    
    // Calculate start and end of target day tomorrow
    const startOfTarget = startOfDay(targetDate);
    const endOfTarget = endOfDay(targetDate);

    // Query confirmed tomorrow bookings with client contact details
    const { data: bookings, error } = await supabase
      .from("bookings")
      .select("id, start_time, client_name, client_email, service_tiers(title)")
      .eq("status", "confirmed")
      .gte("start_time", startOfTarget.toISOString())
      .lte("start_time", endOfTarget.toISOString());

    if (error) {
      console.error("Failed to fetch upcoming bookings for reminders:", error);
      return NextResponse.json({ error: "Database query failed" }, { status: 500 });
    }

    if (!bookings || bookings.length === 0) {
      return NextResponse.json({ success: true, message: "No bookings scheduled for tomorrow", count: 0 });
    }

    let successCount = 0;
    const errors: unknown[] = [];

    // Send emails asynchronously (non-blocking) to keep the endpoint fast and resilient
    await Promise.all(
      bookings.map(async (booking) => {
        try {
          if (!booking.client_email) {
            console.warn(`Booking ${booking.id} is missing client email, skipping reminder.`);
            return;
          }

          const serviceTitle = ((booking.service_tiers as unknown) as { title: string } | null)?.title || "Bridal Session";
          const bookingTime = formatInTimeZone(new Date(booking.start_time), "Asia/Kolkata", "h:mm a, EEEE, MMMM d, yyyy");
          const bookingId = booking.id.split("-")[0];

          await resend.emails.send({
            from: "ARM Artistry <onboarding@resend.dev>",
            to: booking.client_email,
            subject: `Reminder: Your ARM Artistry Appointment Tomorrow (${formatInTimeZone(new Date(booking.start_time), "Asia/Kolkata", "MMMM d")})`,
            react: ReminderEmail({
              clientEmail: booking.client_email,
              clientName: booking.client_name || "",
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
      })
    );

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
