import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
  try {
    const { booking_id, action } = await request.json();

    if (!booking_id || !["confirm", "decline"].includes(action)) {
      return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
    }

    const supabase = createAdminClient();
    const newStatus = action === "confirm" ? "confirmed" : "cancelled";

    // Update status in database
    const { data: booking, error: updateError } = await supabase
      .from("bookings")
      .update({ status: newStatus, updated_at: new Date().toISOString() })
      .eq("id", booking_id)
      .select("id, start_time, client_email, client_name, service_tiers(title)")
      .single();

    if (updateError || !booking) {
      throw updateError || new Error("Failed to update booking status");
    }

    // Detached, non-blocking email dispatch to prevent third-party timeouts from affecting database state
    (async () => {
      try {
        const { resend } = await import("@/lib/resend/client");
        const ConfirmationEmail = (await import("@/components/emails/ConfirmationEmail")).default;
        const DeclineEmail = (await import("@/components/emails/DeclineEmail")).default;

        const emailProps = {
          clientEmail: booking.client_email || "client@example.com",
          clientName: booking.client_name || "",
          serviceTitle: ((booking.service_tiers as unknown) as { title: string } | null)?.title || "Service",
          bookingTime: new Date(booking.start_time).toLocaleString("en-IN", { timeZone: "Asia/Kolkata" }),
          bookingId: booking.id.split("-")[0],
        };

        if (action === "confirm") {
          await resend.emails.send({
            from: "ARM Artistry <onboarding@resend.dev>",
            to: emailProps.clientEmail,
            subject: "Booking Confirmed - ARM Artistry",
            react: ConfirmationEmail(emailProps),
          });
        } else {
          await resend.emails.send({
            from: "ARM Artistry <onboarding@resend.dev>",
            to: emailProps.clientEmail,
            subject: "Booking Request Update - ARM Artistry",
            react: DeclineEmail(emailProps),
          });
        }
      } catch (emailErr) {
        console.error(`Failed to dispatch ${action} email:`, emailErr);
      }
    })();

    return NextResponse.json({ success: true, status: newStatus });
  } catch (error: unknown) {
    console.error("Admin Booking Action Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
