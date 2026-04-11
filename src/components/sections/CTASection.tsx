"use client";

import Link from "next/link";
import { Outfit } from "next/font/google";
import { motion } from "framer-motion";

const outfit = Outfit({ subsets: ["latin"], weight: ["400", "500", "700", "800", "900"] });

export function CTASection() {
  return (
    <section className="w-full py-32 relative overflow-hidden bg-transparent">
      <div className="max-w-5xl mx-auto px-6 md:px-8 relative z-10">
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="w-full bg-[#111827] rounded-[2.5rem] p-12 md:p-20 text-center shadow-2xl relative overflow-hidden border border-zinc-800"
          >
              <div className="absolute inset-0 bg-gradient-to-tr from-[#7C3AED]/20 to-transparent pointer-events-none"></div>
              
              <div className="absolute -top-[100px] -right-[100px] w-64 h-64 bg-[#7C3AED] filter blur-[100px] opacity-40 rounded-full"></div>
              <div className="absolute -bottom-[100px] -left-[100px] w-64 h-64 bg-[#A78BFA] filter blur-[100px] opacity-40 rounded-full"></div>

              <h2 className={`text-4xl md:text-5xl font-black mb-6 relative z-10 text-white ${outfit.className}`}>
                  ¿Listo para tomar el control?
              </h2>
              <p className="text-lg md:text-xl text-gray-300 mb-10 relative z-10 font-light max-w-2xl mx-auto">
                  Únete a miles de personas que ya experimentan la nueva forma de vivir sus finanzas con BancoUM. Sin comisiones ocultas, sin complicaciones.
              </p>
              <div className="relative z-10 flex flex-col sm:flex-row justify-center items-center gap-4">
                  <Link href="/registro" className="px-10 py-4 bg-[#7C3AED] hover:bg-[#A78BFA] text-white font-bold text-lg rounded-full transition-all shadow-[0_0_20px_rgba(124,58,237,0.4)] hover:shadow-[0_0_35px_rgba(167,139,250,0.6)] hover:-translate-y-1 duration-300">
                      Crear Cuenta Gratis
                  </Link>
                  <Link href="#inicio" className="px-10 py-4 bg-transparent border border-gray-600 hover:border-gray-400 text-white font-bold text-lg rounded-full transition-all hover:bg-gray-800">
                      Conocer Más
                  </Link>
              </div>
          </motion.div>
      </div>
    </section>
  );
}
