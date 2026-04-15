"use client";

import { Inter } from "next/font/google";
import { Navbar } from "@/components/layout/Navbar";
import { HeroSection } from "@/components/sections/HeroSection";
import { BentoFeatures } from "@/components/sections/BentoFeatures";
import { SecuritySection } from "@/components/sections/SecuritySection";
import { CTASection } from "@/components/sections/CTASection";
import { Footer } from "@/components/layout/Footer";
import { AnimatedBackground } from "@/components/ui/AnimatedBackground";

const inter = Inter({ subsets: ["latin"], weight: ["400", "500", "600"] });

export default function Home() {
  return (
    <div className={`min-h-screen bg-transparent text-[#1F2937] overflow-x-hidden relative flex flex-col ${inter.className}`}>
      <AnimatedBackground />
      
      {/* 1. Navbar */}
      <Navbar />

      {/* 2. Hero Section */}
      <HeroSection />

      {/* 3. Social Proof Bar (Optional mid-section stats if desired, here integrated minimally) */}
      <section className="w-full bg-[#111827] border-y border-zinc-800 py-6 relative z-20">
        <div className="max-w-7xl mx-auto px-6 md:px-8 flex flex-wrap justify-center md:justify-around items-center gap-6">
            <div className="flex items-center gap-3 text-white text-sm md:text-base font-medium">
                Más de <span className="font-bold text-[#A78BFA]">50,000</span> transacciones diarias
            </div>
            <div className="hidden md:block w-px h-6 bg-zinc-700"></div>
            <div className="flex items-center gap-3 text-white text-sm md:text-base font-medium">
              Soporte técnico <span className="font-bold text-[#A78BFA]">24/7/365</span>
            </div>
            <div className="hidden md:block w-px h-6 bg-zinc-700"></div>
            <div className="flex items-center gap-3 text-white text-sm md:text-base font-medium">
              Disponibilidad del <span className="font-bold text-[#A78BFA]">99.9%</span>
            </div>
        </div>
      </section>

      {/* 4. Feature Cards (Bento Box approach) */}
      <BentoFeatures />

      {/* 5. Trust & Security */}
      <SecuritySection />

      {/* 6. Call to Action Final */}
      <CTASection />

      {/* 7. Footer */}
      <Footer />

    </div>
  );
}
