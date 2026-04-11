"use client";

import Link from "next/link";
import { Outfit } from "next/font/google";
import { motion } from "framer-motion";
import { ShieldCheck, Wifi } from "lucide-react";
import { HoverCard } from "../ui/HoverCard";

const outfit = Outfit({ subsets: ["latin"], weight: ["400", "500", "700", "800", "900"] });

export function HeroSection() {
  return (
    <section id="inicio" className="w-full relative min-h-screen flex flex-col pt-28 pb-20 overflow-hidden bg-transparent">

      <div className="max-w-7xl mx-auto px-6 md:px-8 w-full flex flex-col lg:flex-row items-center justify-between relative z-10 flex-grow gap-16 lg:gap-0 mt-8 lg:mt-0">
          
          {/* Left: Content */}
          <div className="w-full lg:w-[50%] flex flex-col items-center lg:items-start text-center lg:text-left gap-6">
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
                  <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#EDE9FE] text-[#7C3AED] font-semibold text-sm mb-2 border border-[#DDD6FE]">
                      <span className="relative flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#7C3AED] opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-[#7C3AED]"></span>
                      </span>
                      La nueva era digital
                  </span>
              </motion.div>

              <motion.h1
                  initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.1 }}
                  className={`text-5xl lg:text-7xl font-black leading-[1.1] text-[#111827] tracking-tight ${outfit.className}`}
              >
                  Tu dinero, <br className="hidden lg:block" />
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#7C3AED] via-[#9333EA] to-[#EC4899]">
                      sin fronteras.
                  </span>
              </motion.h1>
              
              <motion.p
                  initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.2 }}
                  className="text-lg md:text-xl text-[#4B5563] max-w-lg font-light leading-relaxed"
              >
                  Deja atrás la banca tradicional. Abre tu cuenta en minutos, obtén tarjetas virtuales gratuitas y toma el control total de tus finanzas desde tu celular.
              </motion.p>
              
              <motion.div 
                initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.3 }}
                className="flex flex-col sm:flex-row gap-4 mt-4"
              >
                  <Link href="/registro" className="px-10 py-4 bg-[#7C3AED] text-white hover:bg-[#682ad8] font-bold text-lg rounded-full transition-all shadow-[0_10px_30px_rgba(124,58,237,0.3)] hover:shadow-[0_10px_40px_rgba(124,58,237,0.5)] hover:-translate-y-1">
                      Abrir cuenta ahora
                  </Link>
                  <Link href="#beneficios" className="px-10 py-4 bg-white border border-gray-200 text-[#111827] hover:bg-gray-50 font-bold text-lg rounded-full transition-all shadow-sm">
                      Ver beneficios
                  </Link>
              </motion.div>

              {/* Stat marks */}
              <motion.div 
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6, duration: 1 }}
                className="flex items-center gap-6 mt-6 lg:mt-12 opacity-80"
              >
                  <div className="flex -space-x-4">
                      {[1,2,3,4].map((i) => (
                        <div key={i} className={`w-10 h-10 rounded-full border-2 border-white bg-gray-200 z-[${10-i}]`}></div>
                      ))}
                  </div>
                  <div className="flex flex-col text-left">
                      <span className="font-bold text-[#1f2937]">50K+</span>
                      <span className="text-xs text-gray-500 uppercase tracking-wider font-semibold">Usuarios Activos</span>
                  </div>
              </motion.div>
          </div>

          {/* Right: Floating Cards */}
          <div className="w-full lg:w-[50%] relative min-h-[500px] flex justify-center items-center perspective-[1200px]">
              
              {/* Card 1 (Dark Frosted Glass para mayor contraste) */}
              <motion.div 
                  initial={{ opacity: 0, y: 150, z: -100, rotateX: 20, rotateZ: -10 }}
                  animate={{ opacity: 1, y: -50, x: -90, z: -50, rotateX: 18, rotateY: 15, rotateZ: -15 }}
                  transition={{ duration: 1, type: "spring", bounce: 0.3, delay: 0.2 }}
                  className="absolute pointer-events-auto z-10"
              >
                  <HoverCard className="group w-[300px] h-[190px] rounded-[1.25rem] overflow-hidden relative" style={{ background: 'rgba(15, 23, 42, 0.75)', backdropFilter: 'blur(20px)', boxShadow: '0 30px 60px rgba(0,0,0,0.2), inset 0 0 0 1px rgba(255,255,255,0.15)' }}>
                      {/* Pattern: Diagonal Lines that intensify on hover */}
                      <div className="absolute inset-0 opacity-10 group-hover:opacity-40 transition-opacity duration-700 ease-out pointer-events-none z-0" style={{ backgroundImage: 'repeating-linear-gradient(45deg, transparent, transparent 10px, rgba(255,255,255,0.1) 10px, rgba(255,255,255,0.1) 11px)' }}></div>
                      
                      <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent z-0 pointer-events-none"></div>
                      
                      {/* Logo Mastercard style */}
                      <div className="absolute top-6 left-6 flex z-10">
                          <div className="w-9 h-9 rounded-full bg-[#EB001B] opacity-90 mix-blend-screen shadow-sm"></div>
                          <div className="w-9 h-9 rounded-full bg-[#F79E1B] opacity-90 -ml-[16px] mix-blend-screen shadow-sm"></div>
                      </div>
                      
                      <div className="absolute bottom-10 left-6 z-10 w-full">
                          <p className="text-white font-mono text-[17px] tracking-[0.16em] font-medium drop-shadow-md opacity-90">4455 5491 6118 6164</p>
                      </div>
                      <div className="absolute bottom-5 left-6 z-10">
                          <p className="text-gray-300 font-sans text-[13px] font-medium tracking-wide drop-shadow-sm opacity-90">Edward Hunt</p>
                      </div>
                  </HoverCard>
              </motion.div>

              {/* Card 2 (Mesh Gradient Light) */}
              <motion.div 
                  initial={{ opacity: 0, y: 200, z: -50, rotateX: 20, rotateZ: 5 }}
                  animate={{ opacity: 1, y: 10, x: 20, z: 0, rotateX: 12, rotateY: -10, rotateZ: 5 }}
                  transition={{ duration: 1, type: "spring", bounce: 0.3, delay: 0.3 }}
                  className="absolute pointer-events-auto z-20"
              >
                  <HoverCard className="group w-[320px] h-[200px] rounded-[1.25rem] overflow-hidden relative" style={{ 
                      background: '#f3f4f6',
                      backgroundImage: 'radial-gradient(at 0% 0%, rgba(167, 139, 250, 0.4) 0px, transparent 50%), radial-gradient(at 100% 0%, rgba(253, 186, 116, 0.4) 0px, transparent 50%), radial-gradient(at 100% 100%, rgba(244, 114, 182, 0.4) 0px, transparent 50%), radial-gradient(at 0% 100%, rgba(125, 211, 252, 0.4) 0px, transparent 50%)',
                      boxShadow: '0 40px 80px rgba(124,58,237,0.15), inset 0 0 0 1px rgba(255,255,255,0.6)' 
                  }}>
                      {/* Pattern: Abstract Circles */}
                      <div className="absolute inset-0 opacity-0 group-hover:opacity-[0.15] transition-opacity duration-700 ease-out pointer-events-none z-0" style={{ backgroundImage: 'radial-gradient(circle at 10px 10px, black 2px, transparent 0)', backgroundSize: '20px 20px' }}></div>
                      
                      <div className="absolute inset-0 bg-white/20 backdrop-blur-[2px] z-0"></div>
                      
                      {/* Logo Mastercard style (Multiply for white background) */}
                      <div className="absolute top-6 left-6 flex z-10 opacity-90">
                          <div className="w-9 h-9 rounded-full bg-[#EB001B] mix-blend-multiply shadow-sm"></div>
                          <div className="w-9 h-9 rounded-full bg-[#F79E1B] -ml-[16px] mix-blend-multiply shadow-sm"></div>
                      </div>
                      
                      <div className="absolute bottom-11 left-6 z-10 w-full">
                          <p className="text-[#1f2937] font-mono text-[18px] tracking-[0.15em] font-medium drop-shadow-md">4455 5491 6118 6164</p>
                      </div>
                      <div className="absolute bottom-6 left-6 z-10">
                          <p className="text-gray-800 font-sans text-[14px] font-semibold tracking-wide drop-shadow-sm">Edward Hunt</p>
                      </div>
                  </HoverCard>
              </motion.div>

              {/* Card 3 (Vibrant Blue/Purple Mastercard style) */}
              <motion.div 
                  initial={{ opacity: 0, y: 250, z: 0, rotateX: 20, rotateZ: 15 }}
                  animate={{ opacity: 1, y: 80, x: 80, z: 50, rotateX: 5, rotateY: -15, rotateZ: 8 }}
                  transition={{ duration: 1, type: "spring", bounce: 0.3, delay: 0.4 }}
                  className="absolute pointer-events-auto z-30 hidden lg:block"
              >
                  <HoverCard className="group w-[300px] h-[190px] rounded-[1.25rem] overflow-hidden relative" style={{ background: 'linear-gradient(135deg, #38BDF8 0%, #818CF8 50%, #C084FC 100%)', boxShadow: '0 30px 70px rgba(139,92,246,0.3), inset 0 0 0 1px rgba(255,255,255,0.3)' }}>
                      {/* Pattern: Waves or Grid */}
                      <div className="absolute inset-0 opacity-10 group-hover:opacity-40 transition-opacity duration-700 ease-out pointer-events-none z-0" style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,0.2) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.2) 1px, transparent 1px)', backgroundSize: '20px 20px' }}></div>
                      
                      <div className="absolute inset-0 bg-black/5 z-0"></div>
                      
                      {/* Logo Mastercard style */}
                      <div className="absolute top-6 left-6 flex z-10">
                          <div className="w-9 h-9 rounded-full bg-[#EB001B] opacity-90 mix-blend-screen shadow-sm"></div>
                          <div className="w-9 h-9 rounded-full bg-[#F79E1B] opacity-90 -ml-[16px] mix-blend-screen shadow-sm"></div>
                      </div>
                      
                      <div className="absolute bottom-10 left-6 z-10 w-full">
                          <p className="text-white font-mono text-[17px] tracking-[0.16em] font-medium drop-shadow-md opacity-95">4455 5491 6118 6164</p>
                      </div>
                      <div className="absolute bottom-5 left-6 z-10">
                          <p className="text-white font-sans text-[13px] font-medium tracking-wide drop-shadow-md opacity-90">Edward Hunt</p>
                      </div>
                  </HoverCard>
              </motion.div>

          </div>
      </div>
    </section>
  );
}
