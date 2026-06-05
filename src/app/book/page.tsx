import BookingCalendar from "@/components/BookingCalendar";

export default function BookPage() {
  return (
    <div className="min-h-screen bg-black pt-32 px-4 pb-20">
      <h1 className="text-[40px] md:text-[60px] font-heading text-white uppercase text-center mb-16">
        Secure Your Date
      </h1>
      <BookingCalendar />
    </div>
  );
}
