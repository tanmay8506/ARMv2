import type { Metadata } from "next";
import { Playfair_Display, Inter } from "next/font/google";
import "./globals.css";
import dynamic from "next/dynamic";
const SmoothScroll = dynamic(() => import("@/components/SmoothScroll"), { ssr: false });
const CustomCursor = dynamic(() => import("@/components/CustomCursor"), { ssr: false });
const Navbar = dynamic(() => import("@/components/Navbar"), { ssr: false });
import Footer from "@/components/Footer";

const playfair = Playfair_Display({ subsets: ["latin"], variable: "--font-playfair" });
const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

export const metadata: Metadata = {
  title: "ARM Artistry | Luxury Bridal Mehendi Studio",
  description: "Exclusive bridal mehendi studio based in India.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${playfair.variable} ${inter.variable} antialiased selection:bg-lamborghini-gold selection:text-black`}>
        <SmoothScroll>
          <CustomCursor />
          <Navbar />
          {children}
          <Footer />
        </SmoothScroll>
      </body>
    </html>
  );
}
