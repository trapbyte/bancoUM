"use client";

import Link from "next/link";
import { Inter, Outfit } from "next/font/google";
import { motion } from "framer-motion";
import { ArrowLeft, KeySquare, Mail, ShieldCheck } from "lucide-react";
import { AnimatedBackground } from "@/components/ui/AnimatedBackground";

const outfit = Outfit({ subsets: ["latin"], weight: ["400", "500", "700", "800", "900"] });
const inter = Inter({ subsets: ["latin"], weight: ["400", "500", "600"] });

export default function Login() {
  return (
    <div className={`min-h-screen bg-transparent text-[#1F2937] relative flex items-center justify-center p-6 ${inter.className}`}>
      
      {/* Fondo animado persistente */}
      <AnimatedBackground />

      {/* Botón flotante para regresar */}
      <div className="absolute top-8 left-8 z-20">
          <Link href="/" className="inline-flex items-center gap-2 px-4 py-2 bg-white/40 border border-white/50 backdrop-blur-md rounded-full text-zinc-700 hover:bg-white/60 hover:text-black transition-all font-medium text-sm shadow-sm">
             <ArrowLeft className="w-4 h-4" />
             Volver al Inicio
          </Link>
      </div>

      {/* Contenedor central (Bento Glassmorphism Style) */}
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="w-full max-w-md relative z-10"
      >
          {/* Decorative pseudo-element behind */}
          <div className="absolute -inset-1 bg-gradient-to-tr from-[#7C3AED] via-[#38BDF8] to-[#EC4899] rounded-[2rem] blur-xl opacity-30"></div>
          
          <div className="relative bg-white/60 backdrop-blur-2xl border border-white/50 shadow-2xl rounded-[2rem] p-10 overflow-hidden">
              
              {/* Subtle top glare */}
              <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-white to-transparent opacity-80"></div>

              {/* Logo */}
              <div className="flex items-center justify-center gap-2 mb-8">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#7C3AED] to-[#9333EA] flex items-center justify-center shadow-lg border border-white/20">
                     <ShieldCheck className="w-6 h-6 text-white" />
                  </div>
                  <span className={`font-black text-3xl tracking-tighter text-[#1F2937] ${outfit.className}`}>
                     banco<span className="text-[#7C3AED]">UM</span>
                  </span>
              </div>

              <div className="text-center mb-8">
                  <h1 className={`text-2xl font-bold text-gray-900 mb-2 ${outfit.className}`}>Hola de nuevo</h1>
                  <p className="text-gray-500 text-sm font-light">Ingresa tus credenciales para continuar.</p>
              </div>

              {/* Formulario */}
              <form className="flex flex-col gap-5">
                  <div className="relative group">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                         <Mail className="w-5 h-5 text-gray-400 group-focus-within:text-[#7C3AED] transition-colors" />
                      </div>
                      <input 
                         type="email" 
                         placeholder="Correo electrónico"
                         className="w-full pl-11 pr-4 py-3.5 bg-white/50 border border-gray-200 focus:border-[#7C3AED] rounded-xl outline-none transition-all placeholder:text-gray-400 font-medium text-gray-700 focus:bg-white focus:shadow-[0_0_15px_rgba(124,58,237,0.1)]"
                         required
                      />
                  </div>

                  <div className="relative group">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                         <KeySquare className="w-5 h-5 text-gray-400 group-focus-within:text-[#7C3AED] transition-colors" />
                      </div>
                      <input 
                         type="password" 
                         placeholder="Contraseña"
                         className="w-full pl-11 pr-4 py-3.5 bg-white/50 border border-gray-200 focus:border-[#7C3AED] rounded-xl outline-none transition-all placeholder:text-gray-400 font-medium text-gray-700 focus:bg-white focus:shadow-[0_0_15px_rgba(124,58,237,0.1)]"
                         required
                      />
                  </div>

                  <div className="flex items-center justify-between mt-1">
                      <label className="flex items-center gap-2 cursor-pointer">
                          <input type="checkbox" className="w-4 h-4 rounded text-[#7C3AED] focus:ring-[#7C3AED] border-gray-300 accent-[#7C3AED]" />
                          <span className="text-sm font-medium text-gray-600">Recordarme</span>
                      </label>
                      <Link href="#" className="font-semibold text-sm text-[#7C3AED] hover:text-[#9333EA] transition-colors">
                          ¿Olvidaste tu contraseña?
                      </Link>
                  </div>

                  <button 
                     type="button"
                     className="mt-6 w-full py-4 bg-[#111827] text-white font-bold rounded-xl transition-all shadow-md hover:shadow-xl hover:-translate-y-0.5 hover:bg-black"
                  >
                      Iniciar Sesión
                  </button>
                  
                  {/* Decorative separator */}
                  <div className="flex items-center gap-4 my-2 opacity-60">
                      <div className="flex-1 h-px bg-gray-300"></div>
                      <span className="text-xs text-gray-500 uppercase tracking-widest font-semibold">SEGURIDAD ACTIVA</span>
                      <div className="flex-1 h-px bg-gray-300"></div>
                  </div>

                  <button 
                     type="button"
                     className="w-full py-3.5 bg-transparent border-2 border-gray-200 text-gray-600 font-bold rounded-xl transition-all hover:border-gray-300 hover:bg-gray-50"
                  >
                      Solicitar acceso web
                  </button>
              </form>
          </div>
          
          {/* Footer Text */}
          <p className="text-center mt-6 text-sm text-gray-500 font-medium">
             ¿No tienes una cuenta aún? <Link href="/registro" className="text-[#7C3AED] font-bold hover:underline">Regístrate</Link>
          </p>

      </motion.div>
    </div>
  );
}
