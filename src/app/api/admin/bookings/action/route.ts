import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";
import { resend } from "@/lib/resend/client";
import ConfirmationEmail from "@/components/emails/ConfirmationEmail";
import DeclineEmail from "@/components/emails/DeclineEmail";

export async function POST(request: Request) {
  try {
    const { booking_id, action } = await request.json();

    if (!booking_id || !["confirm", "decline"].includes(action)) {
      return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
    }

    // Admin authorization check
    // Ensure this route is protected by middleware, but we can also double check headers here

    const supabase = createAdminClient();
    const newStatus = action === "confirm" ? "confirmed" : "cancelled";

    const { data: booking, error: updateError } = await supabase
      .from("bookings")
      .update({ status: newStatus, updated_at: new Date().toISOString() })
      .eq("id", booking_id)
      .select("id, start_time, service_tiers(title)")
      .single();

    if (updateError || !booking) {
      throw updateError || new Error("Failed to update booking");
    }

    // Dispatch Email
    try {
      const emailProps = {
        clientEmail: "client@example.com", // Normally fetched from user metadata
        serviceTitle: (booking.service_tiers as unknown as { title: string } | null)?.title || "Service",
        bookingTime: new Date(booking.start_time).toLocaleString("en-IN", { timeZone: "Asia/Kolkata" }),
        bookingId: booking.id.split("-")[0],
      };

      if (action === "confirm") {
        await resend.emails.send({
          from: "ARM Artistry <onboarding@resend.dev>",
          to: "client@example.com",
          subject: "Booking Confirmed - ARM Artistry",
          react: ConfirmationEmail(emailProps),
        });
      } else {
        await resend.emails.send({
          from: "ARM Artistry <onboarding@resend.dev>",
          to: "client@example.com",
          subject: "Booking Request Update - ARM Artistry",
          react: DeclineEmail(emailProps),
        });
      }
    } catch (emailErr) {
      console.error(`Failed to send ${action} email:`, emailErr);
    }

    return NextResponse.json({ success: true, status: newStatus });
  } catch (error: unknown) {
    console.error("Admin Booking Action Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
