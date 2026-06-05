import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
  try {
    const { booking_id, transaction_id } = await request.json();

    if (!booking_id || !transaction_id) {
      return NextResponse.json({ error: "Missing booking_id or transaction_id" }, { status: 400 });
    }

    // Use admin client securely on the server to update the booking status.
    // In a real flow, you'd verify the transaction_id with Razorpay/Stripe first.
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

    // 2. Verify it's still held
    if (booking.status !== "held" && booking.status !== "pending") {
      return NextResponse.json({ error: "Booking is not in a confirmable state" }, { status: 400 });
    }

    if (booking.status === "held" && new Date(booking.held_until) < new Date()) {
      return NextResponse.json({ error: "Booking hold has expired" }, { status: 410 }); // 410 Gone
    }

    // 3. Update the booking to 'pending' (requires admin approval)
    const { data: updatedBooking, error: updateError } = await supabase
      .from("bookings")
      .update({ status: "pending", updated_at: new Date().toISOString() })
      .eq("id", booking_id)
      .select("id, start_time, service_tiers(title)")
      .single();

    if (updateError || !updatedBooking) {
      throw updateError || new Error("Failed to update booking");
    }

    // 4. Send Receipt Email (wrapped in try/catch to protect DB transaction)
    try {
      const { resend } = await import("@/lib/resend/client");
      const ReceiptEmail = (await import("@/components/emails/ReceiptEmail")).default;
      
      await resend.emails.send({
        from: "ARM Artistry <onboarding@resend.dev>",
        to: "client@example.com", // In a real app, use the email from the form payload
        subject: "Booking Request Received - ARM Artistry",
        react: ReceiptEmail({
          clientEmail: "client@example.com",
          serviceTitle: (updatedBooking.service_tiers as unknown as { title: string } | null)?.title || "Service",
          bookingTime: new Date(updatedBooking.start_time).toLocaleString("en-IN", { timeZone: "Asia/Kolkata" }),
          bookingId: updatedBooking.id.split("-")[0],
        }),
      });
    } catch (emailErr) {
      console.error("Failed to send receipt email:", emailErr);
      // We don't throw here because the database update was successful.
    }

    return NextResponse.json({ success: true, status: "pending" }, { status: 200 });

  } catch (error: unknown) {
    console.error("Confirm Booking Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
