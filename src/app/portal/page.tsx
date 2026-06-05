import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { LogOut } from "lucide-react";
import { formatInTimeZone } from "date-fns-tz";

export const dynamic = "force-dynamic";

export default async function ClientPortal() {
  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // Fetch client's bookings
  const { data: bookings } = await supabase
    .from("bookings")
    .select("*, service_tiers(title)")
    .eq("client_id", user.id)
    .order("start_time", { ascending: true });

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-white p-8 pt-32">
      <div className="max-w-[1000px] mx-auto">
        <div className="flex justify-between items-end mb-16">
          <div>
            <h1 className="text-4xl font-heading uppercase tracking-widest text-lamborghini-gold mb-2">
              Client Portal
            </h1>
            <p className="text-smoke text-sm">Welcome back, {user.email}</p>
          </div>
          
          <form action="/auth/signout" method="post">
            <button
              type="submit"
              className="flex items-center gap-2 text-smoke hover:text-white transition-colors text-sm uppercase tracking-widest"
            >
              <LogOut className="w-4 h-4" />
              Sign Out
            </button>
          </form>
        </div>

        <section>
          <h2 className="text-xl font-heading uppercase tracking-wider mb-8 border-b border-white/10 pb-4">
            Your Appointments
          </h2>

          <div className="space-y-4">
            {bookings && bookings.length > 0 ? (
              bookings.map((booking) => {
                const statusConfig: Record<string, { label: string; cls: string }> = {
                  pending: { label: "Pending", cls: "text-lamborghini-gold border-lamborghini-gold/30" },
                  held: { label: "Held", cls: "text-sky-400 border-sky-400/30" },
                  confirmed: { label: "Confirmed", cls: "text-emerald-400 border-emerald-500/30" },
                  cancelled: { label: "Cancelled", cls: "text-red-400 border-red-500/30" },
                };
                const currentStatus = statusConfig[booking.status] || { label: booking.status, cls: "text-smoke border-white/20" };

                const dateStr = formatInTimeZone(
                  new Date(booking.start_time),
                  "Asia/Kolkata",
                  "EEEE, MMMM d, yyyy"
                );
                
                const timeStr = formatInTimeZone(
                  new Date(booking.start_time),
                  "Asia/Kolkata",
                  "h:mm a"
                );

                return (
                  <div
                    key={booking.id}
                    className="border border-white/10 bg-white/[0.02] p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-6"
                  >
                    <div>
                      <h3 className="font-heading text-xl uppercase mb-2">
                        {booking.service_tiers?.title || "Bridal Session"}
                      </h3>
                      <div className="text-smoke text-sm flex gap-4">
                        <span>{dateStr}</span>
                        <span>•</span>
                        <span>{timeStr} IST</span>
                      </div>
                    </div>

                    <div className={`px-4 py-1.5 border text-xs font-bold uppercase tracking-widest ${currentStatus.cls}`}>
                      {currentStatus.label}
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="border border-white/10 border-dashed p-12 text-center text-smoke">
                <p>You have no upcoming appointments.</p>
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
