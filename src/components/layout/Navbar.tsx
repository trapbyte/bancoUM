"use client";

import Link from "next/link";
import { Inter, Outfit } from "next/font/google";
import { useState } from "react";
import { useScroll, useMotionValueEvent } from "framer-motion";

const outfit = Outfit({ subsets: ["latin"], weight: ["400", "500", "700", "800", "900"] });
const inter = Inter({ subsets: ["latin"], weight: ["400", "500", "600"] });

export function Navbar() {
  const { scrollY } = useScroll();
  const [scrolled, setScrolled] = useState(false);

  useMotionValueEvent(scrollY, "change", (latest) => {
    setScrolled(latest > 50);
  });

  return (
    <nav className={`w-full fixed top-0 z-50 transition-all duration-300 ${scrolled ? 'bg-white/80 border-b border-gray-200 backdrop-blur-xl py-4' : 'bg-transparent backdrop-blur-sm py-6'}`}>
      <div className="max-w-7xl mx-auto px-6 md:px-8 flex justify-between items-center">
        <div className="flex items-center gap-3">
            <span className={`font-black text-2xl tracking-tighter text-[#1F2937] ${outfit.className}`}>
            banco<span className="text-[#7C3AED]">UM</span>
            </span>
        </div>
        <div className="hidden md:flex items-center gap-8 text-sm font-medium">
            <Link href="#inicio" className={`text-zinc-600 hover:text-[#7C3AED] transition-colors ${inter.className}`}>Inicio</Link>
            <Link href="#beneficios" className={`text-zinc-600 hover:text-[#7C3AED] transition-colors ${inter.className}`}>Beneficios</Link>
            <Link href="#seguridad" className={`text-zinc-600 hover:text-[#7C3AED] transition-colors ${inter.className}`}>Seguridad</Link>
        </div>
        <div className="flex items-center gap-2 md:gap-4">
            <Link href="/login" className="px-5 py-2.5 bg-white/30 backdrop-blur-md border border-white/40 shadow-sm hover:bg-white/50 text-[#1F2937] hover:text-[#7C3AED] font-bold text-sm rounded-full transition-all">
                Ingresar
            </Link>
            <Link href="/registro" className="px-6 py-2.5 bg-[#7C3AED] hover:bg-[#682ad8] text-white font-bold text-sm rounded-full transition-all shadow-[0_4px_15px_rgba(124,58,237,0.3)] hover:shadow-[0_0_25px_rgba(124,58,237,0.5)] shadow-md">
                Regístrate
            </Link>
        </div>
      </div>
    </nav>
  );
}
