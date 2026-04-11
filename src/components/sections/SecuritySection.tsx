"use client";

import { Outfit } from "next/font/google";
import { Lock, Headphones, Database, ShieldCheck } from "lucide-react";
import { motion } from "framer-motion";

const outfit = Outfit({ subsets: ["latin"], weight: ["400", "500", "700", "800", "900"] });

export function SecuritySection() {
  return (
    <section id="seguridad" className="w-full bg-[#030712] py-32 relative border-y border-zinc-900 overflow-hidden">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-full h-px bg-gradient-to-r from-transparent via-[#7C3AED]/50 to-transparent"></div>
      
      {/* Background glow in dark mode */}
      <div className="absolute bottom-[-20%] left-[-10%] w-[50%] h-[50%] bg-[#3C1E3F] rounded-full mix-blend-screen filter blur-[150px] opacity-40"></div>

      <div className="max-w-7xl mx-auto px-6 md:px-8 relative z-10">
           <div className="flex flex-col lg:flex-row items-center gap-16">
               <motion.div 
                 initial={{ opacity: 0, x: -50 }}
                 whileInView={{ opacity: 1, x: 0 }}
                 viewport={{ once: true }}
                 transition={{ duration: 0.6 }}
                 className="w-full lg:w-1/3"
                >
                  <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-[#A78BFA] text-sm font-semibold mb-6">
                      <ShieldCheck className="w-4 h-4" />
                      <span>Seguridad Nivel Bóveda</span>
                  </div>
                  <h2 className={`text-4xl md:text-5xl font-black mb-6 text-white ${outfit.className}`}>
                      Confianza Inquebrantable.
                  </h2>
                  <p className="text-gray-400 text-lg leading-relaxed font-light">
                      Diseñamos nuestra infraestructura para proteger lo que más te importa, implementando los estándares más exigentes del mundo bancario y encriptación militar.
                  </p>
               </motion.div>
               
               <div className="w-full lg:w-2/3 grid grid-cols-1 md:grid-cols-2 gap-8">
                  <motion.div 
                    initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5, delay: 0.1 }}
                    className="p-8 rounded-3xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors"
                  >
                      <div className="w-12 h-12 rounded-xl bg-[#7C3AED]/20 flex items-center justify-center mb-6 border border-[#7C3AED]/30">
                          <Lock className="w-6 h-6 text-[#A78BFA]" />
                      </div>
                      <h4 className="text-xl font-bold mb-3 text-white">Encriptación End-to-End</h4>
                      <p className="text-gray-400 leading-relaxed font-light">Toda tu información personal viaja sobre canales cifrados TLS 1.3 con estándares militares. Nadie excepto tú puede ver tus datos.</p>
                  </motion.div>

                  <motion.div 
                    initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5, delay: 0.2 }}
                    className="p-8 rounded-3xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors"
                  >
                      <div className="w-12 h-12 rounded-xl bg-[#7C3AED]/20 flex items-center justify-center mb-6 border border-[#7C3AED]/30">
                          <Headphones className="w-6 h-6 text-[#A78BFA]" />
                      </div>
                      <h4 className="text-xl font-bold mb-3 text-white">Soporte Humano 24/7</h4>
                      <p className="text-gray-400 leading-relaxed font-light">Atención permanente en caso de emergencias, sin importar la hora o tu ubicación geográfica. Resolvemos bloqueos al instante.</p>
                  </motion.div>

                  <motion.div 
                    initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5, delay: 0.3 }}
                    className="p-8 rounded-3xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors md:col-span-2"
                  >
                      <div className="w-12 h-12 rounded-xl bg-[#7C3AED]/20 flex items-center justify-center mb-6 border border-[#7C3AED]/30">
                          <Database className="w-6 h-6 text-[#A78BFA]" />
                      </div>
                      <h4 className="text-xl font-bold mb-3 text-white">Infraestructura Distribuida Seguro</h4>
                      <p className="text-gray-400 leading-relaxed font-light">Bases de datos reforzadas con backups asíncronos y protección activa contra inyecciones SQL y ataques DDoS. Tu dinero siempre está aislado de riesgos sistémicos.</p>
                  </motion.div>
               </div>
           </div>
      </div>
    </section>
  );
}
