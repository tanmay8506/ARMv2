import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
  try {
    const { booking_id, transaction_id, client_name, client_email, client_phone, notes } = await request.json();

    if (!booking_id || !transaction_id || !client_name || !client_email || !client_phone) {
      return NextResponse.json({ error: "Missing required contact details" }, { status: 400 });
    }

    // Use admin client securely on the server to update the booking.
    const supabase = createAdminClient();

    // 1. Fetch the booking
    const { data: booking, error: fetchError } = await supabase
      .from("bookings")
      .select("status, held_until")
      .eq("id", booking_id)
      .single();

    if (fetchError || !booking) {
      return NextResponse.json({ error: "Booking not found" }, { status: 404 });
    }

    // 2. Verify it is still held
    if (booking.status !== "held") {
      return NextResponse.json({ error: "Booking is not in a confirmable state" }, { status: 400 });
    }

    if (booking.held_until && new Date(booking.held_until) < new Date()) {
      return NextResponse.json({ error: "Booking hold has expired" }, { status: 410 });
    }

    // 3. Update the booking to 'pending' and store contact details
    const { data: updatedBooking, error: updateError } = await supabase
      .from("bookings")
      .update({
        status: "pending",
        client_name,
        client_email,
        client_phone,
        notes: notes || "",
        held_until: null,
        updated_at: new Date().toISOString(),
      })
      .eq("id", booking_id)
      .select("id, start_time, service_tiers(title)")
      .single();

    if (updateError || !updatedBooking) {
      throw updateError || new Error("Failed to update booking status");
    }

    // 4. Send Emails (completely detached and non-blocking)
    (async () => {
      try {
        const { resend } = await import("@/lib/resend/client");
        const ReceiptEmail = (await import("@/components/emails/ReceiptEmail")).default;
        const AdminNotificationEmail = (await import("@/components/emails/AdminNotificationEmail")).default;
        
        const serviceTitle = ((updatedBooking.service_tiers as unknown) as { title: string } | null)?.title || "Service";
        const bookingTimeIST = new Date(updatedBooking.start_time).toLocaleString("en-IN", { timeZone: "Asia/Kolkata" });
        const shortBookingId = updatedBooking.id.split("-")[0];

        // Send Receipt Email to Client
        await resend.emails.send({
          from: "ARM Artistry <onboarding@resend.dev>",
          to: client_email,
          subject: "Booking Request Received - ARM Artistry",
          react: ReceiptEmail({
            clientEmail: client_email,
            clientName: client_name,
            serviceTitle,
            bookingTime: bookingTimeIST,
            bookingId: shortBookingId,
          }),
        });

        // Send Notification Email to Admin
        await resend.emails.send({
          from: "ARM Artistry <onboarding@resend.dev>",
          to: process.env.ADMIN_EMAIL || "tanmay8506@gmail.com",
          subject: `New Booking Request - ${client_name}`,
          react: AdminNotificationEmail({
            clientName: client_name,
            clientEmail: client_email,
            clientPhone: client_phone,
            serviceTitle,
            bookingTime: bookingTimeIST,
            bookingId: shortBookingId,
            notes: notes || "",
          }),
        });
      } catch (emailErr) {
        console.error("Failed to send booking emails:", emailErr);
      }
    })();

    return NextResponse.json({ success: true, status: "pending" }, { status: 200 });

  } catch (error: unknown) {
    console.error("Confirm Booking Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
