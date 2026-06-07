import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const {
      client_name,
      client_email,
      client_phone,
      service_tier_id,
      event_date,
      location_type,
      event_city,
      event_venue,
      event_type,
      notes,
      hair_addon,
    } = body;

    // Validate required fields
    if (
      !client_name ||
      !client_email ||
      !client_phone ||
      !service_tier_id ||
      !event_date
    ) {
      return NextResponse.json(
        { error: "Missing required fields: name, email, phone, service, and event date are required." },
        { status: 400 }
      );
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(client_email)) {
      return NextResponse.json(
        { error: "Invalid email address format." },
        { status: 400 }
      );
    }

    // Validate event_date is in the future (IST)
    const eventDateObj = new Date(event_date + "T00:00:00+05:30");
    const nowIST = new Date(new Date().toLocaleString("en-US", { timeZone: "Asia/Kolkata" }));
    if (eventDateObj < nowIST) {
      return NextResponse.json(
        { error: "Event date must be in the future." },
        { status: 400 }
      );
    }

    const supabase = createAdminClient();

    // Verify service tier exists
    const { data: tier, error: tierError } = await supabase
      .from("service_tiers")
      .select("id, title, duration_minutes, price_inr")
      .eq("id", service_tier_id)
      .eq("is_active", true)
      .single();

    if (tierError || !tier) {
      return NextResponse.json(
        { error: "Selected service package not found." },
        { status: 400 }
      );
    }

    // Build start_time and end_time from event_date (default 09:00 IST for calendar blocking)
    const startIST = new Date(event_date + "T09:00:00+05:30");
    const endIST = new Date(startIST.getTime() + tier.duration_minutes * 60 * 1000);

    const formattedNotes = [
      hair_addon ? `Selected Hairstyling Add-on: ${hair_addon}` : null,
      notes,
    ].filter(Boolean).join("\n\n");

    // Insert the booking as 'pending' (no hold — direct inquiry)
    const { data: newBooking, error: insertError } = await supabase
      .from("bookings")
      .insert({
        service_tier_id,
        client_name,
        client_email,
        client_phone,
        status: "pending",
        start_time: startIST.toISOString(),
        end_time: endIST.toISOString(),
        notes: formattedNotes || null,
        location_type: location_type || "local",
        event_city: event_city || "Varanasi",
        event_venue: event_venue || null,
        event_type: event_type || "Bridal",
      })
      .select("id, start_time, service_tiers(title)")
      .single();

    if (insertError || !newBooking) {
      console.error("Insert error:", insertError);
      throw insertError || new Error("Failed to create inquiry");
    }

    const bookingId = newBooking.id;
    const shortId = bookingId.split("-")[0].toUpperCase();

    // Format booking time in IST for emails
    const bookingTimeIST = startIST.toLocaleString("en-IN", {
      timeZone: "Asia/Kolkata",
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });

    // Calculate estimated total (tier + optional hair add-on)
    let estimatedTotal = parseFloat(tier.price_inr.toString());
    if (hair_addon) {
      const { data: addonTier } = await supabase
        .from("service_tiers")
        .select("price_inr")
        .eq("title", hair_addon)
        .single();
      if (addonTier) {
        estimatedTotal += parseFloat(addonTier.price_inr.toString());
      }
    }

    // Fire-and-forget emails via EmailJS REST API
    (async () => {
      try {
        const serviceTitle =
          ((newBooking.service_tiers as unknown) as { title: string } | null)
            ?.title || tier.title;

        const ejsBase = {
          service_id: process.env.EMAILJS_SERVICE_ID!,
          user_id: process.env.EMAILJS_PUBLIC_KEY!,
          accessToken: process.env.EMAILJS_PRIVATE_KEY!,
        };

        const sendEmail = (template_id: string, template_params: Record<string, string>) =>
          fetch("https://api.emailjs.com/api/v1.0/email/send", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ ...ejsBase, template_id, template_params }),
          });

        // 1. Client confirmation email
        const clientRes = await sendEmail(process.env.EMAILJS_CLIENT_TEMPLATE_ID!, {
          to_name: client_name.split(" ")[0],
          to_email: client_email,
          service: serviceTitle,
          event_type: event_type || "Bridal",
          event_date: bookingTimeIST,
          city: event_city || "Varanasi",
          booking_id: shortId,
        });
        if (!clientRes.ok) {
          console.error("Client email failed:", await clientRes.text());
        }

        // 2. Admin notification email
        const adminRes = await sendEmail(process.env.EMAILJS_ADMIN_TEMPLATE_ID!, {
          full_name: client_name,
          email: client_email,
          phone: client_phone,
          service: serviceTitle,
          event_type: event_type || "Bridal",
          event_date: bookingTimeIST,
          city: event_city || "Varanasi",
          venue: event_venue || "—",
          location_type: location_type === "outstation" ? "Outstation" : "Local",
          estimated_total: `₹${estimatedTotal.toLocaleString("en-IN")}`,
          notes: notes || "",
          booking_id: shortId,
        });
        if (!adminRes.ok) {
          console.error("Admin email failed:", await adminRes.text());
        }
      } catch (emailErr) {
        console.error("Failed to send emails:", emailErr);
      }
    })();

    return NextResponse.json(
      {
        success: true,
        booking_id: bookingId,
        short_id: shortId,
        status: "pending",
      },
      { status: 201 }
    );
  } catch (error: unknown) {
    console.error("Inquiry API Error:", error);
    return NextResponse.json(
      { error: "Internal Server Error. Please try again." },
      { status: 500 }
    );
  }
}

