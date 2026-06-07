import { createClient } from "@/lib/supabase/server";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import PortfolioGallery from "@/components/PortfolioGallery";

export const dynamic = "force-dynamic";

export default async function PortfolioPage() {
  const supabase = createClient();
  const { data: assets } = await supabase
    .from("portfolio_assets")
    .select("*")
    .order("display_order", { ascending: true });

  const typedAssets = (assets || []).map((asset) => ({
    id: asset.id,
    title: asset.title || "Untitled Artwork",
    category: asset.category || "General",
    cloudinary_path: asset.cloudinary_path,
    width: asset.width || 800,
    height: asset.height || 1000,
  }));

  return (
    <div className="min-h-screen bg-black text-white font-sans flex flex-col justify-between">
      <Navbar />
      <main className="max-w-[1200px] mx-auto px-6 py-32 flex-1 w-full">
        <h1 className="text-[54px] md:text-[80px] font-heading text-white uppercase text-center mb-6 tracking-wide">
          Our Portfolio
        </h1>
        <p className="text-ash text-center max-w-[600px] mx-auto mb-16 text-lg">
          Explore our signature works. Custom henna designs matching standard traditional patterns and modern aesthetics.
        </p>

        <PortfolioGallery initialAssets={typedAssets} />
      </main>
      <Footer />
    </div>
  );
}
