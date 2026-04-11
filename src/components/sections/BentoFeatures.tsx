"use client";

import { Outfit } from "next/font/google";
import { Lock, Zap, Smartphone, ArrowRight, PieChart, CreditCard, Activity } from "lucide-react";
import { motion } from "framer-motion";

const outfit = Outfit({ subsets: ["latin"], weight: ["400", "500", "700", "800", "900"] });

export function BentoFeatures() {
  return (
    <section id="beneficios" className="w-full py-32 relative z-10 bg-transparent">
      <div className="max-w-7xl mx-auto px-6 md:px-8">
          <div className="text-center mb-20">
              <span className="text-[#7C3AED] font-bold tracking-wider uppercase text-sm mb-4 block">Ecosistema Financiero</span>
              <h2 className={`text-4xl md:text-5xl font-black mb-6 text-[#111827] max-w-3xl mx-auto ${outfit.className}`}>
                  Todo lo que tu dinero necesita, en una sola plataforma.
              </h2>
              <p className="text-[#4B5563] text-lg max-w-2xl mx-auto font-light">
                  Nos deshicimos de la burocracia tradicional para entregarte herramientas modernas, rápidas y seguras.
              </p>
          </div>
          
          {/* Bento Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 md:grid-rows-2 gap-6 auto-rows-[300px]">
              
              {/* Box 1: Transferencias (Large) */}
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5 }}
                className="md:col-span-2 md:row-span-1 bg-white border border-gray-200 rounded-[2rem] p-8 flex flex-col justify-between hover:shadow-2xl hover:shadow-[#7C3AED]/5 transition-all group overflow-hidden relative"
              >
                  <div className="absolute right-0 top-0 w-1/2 h-full bg-gradient-to-l from-[#F5F3FF] to-transparent opacity-50 group-hover:opacity-100 transition-opacity"></div>
                  <div className="relative z-10">
                      <div className="w-14 h-14 bg-[#7C3AED]/10 rounded-2xl flex items-center justify-center mb-6">
                          <Zap className="w-7 h-7 text-[#7C3AED]" />
                      </div>
                      <h3 className={`text-2xl font-bold mb-3 text-[#1f2937] ${outfit.className}`}>Transferencias Inmediatas</h3>
                      <p className="text-gray-500 font-light max-w-md">
                          Envía dinero a cualquier banco sin comisiones ocultas y haz que llegue en segundos, sin importar el día de la semana.
                      </p>
                  </div>
                  {/* Decorative Elements */}
                  <div className="absolute right-8 bottom-8 flex items-center gap-3 bg-white p-4 rounded-xl shadow-lg border border-gray-100 transform translate-y-4 group-hover:translate-y-0 opacity-0 group-hover:opacity-100 transition-all">
                      <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center"><ArrowRight className="w-5 h-5 text-green-600" /></div>
                      <div>
                          <p className="text-sm font-bold text-gray-800">+$500.00</p>
                          <p className="text-xs text-gray-500">Recibido exitosamente</p>
                      </div>
                  </div>
              </motion.div>

              {/* Box 2: Cuentas Claras */}
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.1 }}
                className="bg-[#111827] rounded-[2rem] p-8 flex flex-col justify-between hover:shadow-xl transition-all relative overflow-hidden group"
              >
                  <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(124,58,237,0.3),transparent_50%)]"></div>
                  <div className="relative z-10">
                      <div className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center mb-6 border border-white/10">
                          <PieChart className="w-6 h-6 text-[#A78BFA]" />
                      </div>
                      <h3 className={`text-xl font-bold mb-3 text-white ${outfit.className}`}>Gestión Inteligente</h3>
                      <p className="text-gray-400 text-sm font-light leading-relaxed">
                          Categorización automática de gastos e informes mensuales precisos.
                      </p>
                  </div>
              </motion.div>

              {/* Box 3: Tarjetas Virtuales */}
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="bg-white border border-gray-200 rounded-[2rem] p-8 flex flex-col justify-between hover:shadow-2xl hover:shadow-[#7C3AED]/5 transition-all group overflow-hidden relative"
              >
                  <div className="relative z-10">
                      <div className="w-12 h-12 bg-[#F5F3FF] rounded-xl flex items-center justify-center mb-4 border border-[#EDE9FE]">
                          <CreditCard className="w-6 h-6 text-[#7C3AED]" />
                      </div>
                      <h3 className={`text-xl font-bold mb-2 text-[#1f2937] ${outfit.className}`}>Tarjetas Digitales</h3>
                      <p className="text-gray-500 text-sm font-light leading-relaxed">
                          Genera tarjetas de un solo uso para compras en internet seguras.
                      </p>
                  </div>
                  {/* Decorative Card */}
                  <div className="absolute -right-10 -bottom-10 w-48 h-32 bg-gradient-to-br from-[#7C3AED] to-[#A78BFA] rounded-xl shadow-lg transform -rotate-12 group-hover:rotate-0 transition-transform duration-500 p-4 border border-white/20">
                      <div className="w-8 h-8 rounded-full bg-white/20"></div>
                  </div>
              </motion.div>

              {/* Box 4: App Móvil (Large) */}
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.3 }}
                className="md:col-span-2 md:row-span-1 bg-[#F5F3FF] border border-[#EDE9FE] rounded-[2rem] p-8 flex flex-col md:flex-row items-center justify-between hover:shadow-2xl hover:shadow-[#7C3AED]/10 transition-all overflow-hidden"
              >
                  <div className="md:w-1/2 flex flex-col justify-center mb-8 md:mb-0">
                      <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center mb-6 shadow-sm border border-gray-100">
                          <Smartphone className="w-7 h-7 text-[#7C3AED]" />
                      </div>
                      <h3 className={`text-2xl font-bold mb-3 text-[#1f2937] ${outfit.className}`}>Todo en tu celular</h3>
                      <p className="text-gray-600 font-light max-w-sm mb-6">
                          Bloquea tarjetas, solicita préstamos, aprueba transacciones y visualiza tus movimientos sin tener que ir a ninguna sucursal.
                      </p>
                      <button className="self-start text-[#7C3AED] font-bold hover:text-[#682ad8] transition-colors flex items-center gap-2">
                          Descargar la App <ArrowRight className="w-4 h-4" />
                      </button>
                  </div>
                  <div className="md:w-1/2 flex justify-center relative">
                      <div className="w-64 h-64 bg-white rounded-full absolute -top-8 -right-8 opacity-50 blur-3xl"></div>
                      <div className="w-48 h-[250px] bg-white rounded-t-[2rem] shadow-xl border-t border-x border-gray-200 translate-y-8 flex flex-col p-4 relative z-10">
                          {/* Fake App Mockup */}
                          <div className="flex justify-between items-center mb-6">
                              <div className="w-8 h-8 rounded-full bg-gray-200"></div>
                              <div className="w-12 h-4 rounded-full bg-gray-100"></div>
                          </div>
                          <div className="w-full text-center mb-6">
                              <p className="text-xs text-gray-400">Balance Total</p>
                              <p className="text-2xl font-black text-gray-800">$14,250.00</p>
                          </div>
                          <div className="bg-[#7C3AED] w-full h-24 rounded-xl mb-4 relative overflow-hidden">
                              <Activity className="absolute bottom-2 right-2 w-16 h-16 text-white/10" />
                          </div>
                          <div className="space-y-2">
                              <div className="w-full h-10 bg-gray-50 rounded-lg"></div>
                              <div className="w-full h-10 bg-gray-50 rounded-lg"></div>
                          </div>
                      </div>
                  </div>
              </motion.div>

          </div>
      </div>
    </section>
  );
}
