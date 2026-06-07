import PortfolioGallery from "@/components/PortfolioGallery";

export const metadata = {
  title: "Portfolio | ARM Artistry",
  description: "Browse our signature lookbooks of bridal henna, hairstyling portfolios, and exclusive behind-the-scenes reels.",
};

export default function PortfolioPage() {
  return (
    <main className="max-w-[1200px] mx-auto px-6 py-32 flex-1 w-full min-h-[calc(100vh-16rem)]">
      <div className="text-center mb-16">
        <h1 className="text-[54px] md:text-[80px] font-heading text-white uppercase mb-4 tracking-wide">
          LOOKBOOK PORTFOLIO
        </h1>
        <p className="text-ash max-w-[600px] mx-auto text-base md:text-lg leading-relaxed font-sans">
          Explore our exclusive collections of royal bridal henna art, specialized hairstyling add-ons, and editorial lookbooks.
        </p>
      </div>

      <PortfolioGallery />
    </main>
  );
}
