import Link from "next/link";

export default function Footer() {
  return (
    <footer className="w-full bg-black border-t border-charcoal py-24 px-6 md:px-10 flex flex-col items-center">
      <h2 className="text-[40px] md:text-[54px] font-heading text-white uppercase text-center leading-[1.15]">ARM Artistry</h2>
      <div className="w-full max-w-[1200px] mt-24 grid grid-cols-1 md:grid-cols-3 gap-16 md:gap-10">
        <div>
          <h3 className="text-white uppercase tracking-widest text-xs md:text-sm mb-6">Explore</h3>
          <ul className="flex flex-col gap-4 text-ash font-sans text-sm md:text-base">
            <li><Link href="#" className="hover:text-link-blue transition-colors">Portfolio</Link></li>
            <li><Link href="#" className="hover:text-link-blue transition-colors">Services</Link></li>
            <li><Link href="#" className="hover:text-link-blue transition-colors">About</Link></li>
          </ul>
        </div>
        <div>
          <h3 className="text-white uppercase tracking-widest text-xs md:text-sm mb-6">Legal</h3>
          <ul className="flex flex-col gap-4 text-ash font-sans text-sm md:text-base">
            <li><Link href="#" className="hover:text-link-blue transition-colors">Privacy Policy</Link></li>
            <li><Link href="#" className="hover:text-link-blue transition-colors">Terms of Service</Link></li>
          </ul>
        </div>
        <div>
          <h3 className="text-white uppercase tracking-widest text-xs md:text-sm mb-6">Connect</h3>
          <ul className="flex flex-col gap-4 text-ash font-sans text-sm md:text-base">
            <li><Link href="#" className="hover:text-link-blue transition-colors">Instagram</Link></li>
            <li><Link href="#" className="hover:text-link-blue transition-colors">Contact</Link></li>
          </ul>
        </div>
      </div>
      <div className="mt-24 text-steel text-[10px] md:text-xs uppercase tracking-widest text-center">
        © {new Date().getFullYear()} ARM Artistry. All Rights Reserved.
      </div>
    </footer>
  );
}
