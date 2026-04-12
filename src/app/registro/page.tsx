"use client";

import Link from "next/link";
import { Inter, Outfit } from "next/font/google";
import { motion } from "framer-motion";
import { ArrowLeft, KeySquare, Mail, ShieldCheck, User, Eye, EyeOff } from "lucide-react";
import { AnimatedBackground } from "@/components/ui/AnimatedBackground";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";

const outfit = Outfit({ subsets: ["latin"], weight: ["400", "500", "700", "800", "900"] });
const inter = Inter({ subsets: ["latin"], weight: ["400", "500", "600"] });

export default function Registro() {
  const router = useRouter();
  const [nombre, setNombre] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [aceptaTerminos, setAceptaTerminos] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleRegistro(e: React.FormEvent) {
    e.preventDefault();
    if (!aceptaTerminos) {
      setError("Debes aceptar los términos y condiciones.");
      return;
    }
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/registro", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nombre, email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error ?? "Error al crear la cuenta.");
        setLoading(false);
        return;
      }

      // Auto-login después del registro
      const loginResult = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (loginResult?.error) {
        // El registro fue exitoso, pero el login falló — redirigir a login
        router.push("/login");
        return;
      }

      router.push("/dashboard");
    } catch {
      setError("Error de conexión. Inténtalo de nuevo.");
      setLoading(false);
    }
  }

  return (
    <div className={`min-h-screen bg-transparent text-[#1F2937] relative flex items-center justify-center p-6 ${inter.className}`}>
      
      <AnimatedBackground />

      <div className="absolute top-8 left-8 z-20">
          <Link href="/" className="inline-flex items-center gap-2 px-4 py-2 bg-white/40 border border-white/50 backdrop-blur-md rounded-full text-zinc-700 hover:bg-white/60 hover:text-black transition-all font-medium text-sm shadow-sm">
             <ArrowLeft className="w-4 h-4" />
             Volver al Inicio
          </Link>
      </div>

      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="w-full max-w-md relative z-10 my-8"
      >
          <div className="absolute -inset-1 bg-gradient-to-tr from-[#7C3AED] via-[#38BDF8] to-[#EC4899] rounded-[2rem] blur-xl opacity-30 pointer-events-none"></div>
          
          <div className="relative bg-white/60 backdrop-blur-2xl border border-white/50 shadow-2xl rounded-[2rem] p-10 overflow-hidden">
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
                  <h1 className={`text-2xl font-bold text-gray-900 mb-2 ${outfit.className}`}>Crea tu cuenta</h1>
                  <p className="text-gray-500 text-sm font-light">Únete a la nueva era digital en minutos.</p>
              </div>

              {/* Error */}
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mb-5 px-4 py-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm font-medium"
                >
                  {error}
                </motion.div>
              )}

              <form onSubmit={handleRegistro} className="flex flex-col gap-4">
                  <div className="relative group">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                         <User className="w-5 h-5 text-gray-400 group-focus-within:text-[#7C3AED] transition-colors" />
                      </div>
                      <input 
                         id="nombre"
                         type="text" 
                         placeholder="Nombre completo"
                         value={nombre}
                         onChange={(e) => setNombre(e.target.value)}
                         className="w-full pl-11 pr-4 py-3.5 bg-white/50 border border-gray-200 focus:border-[#7C3AED] rounded-xl outline-none transition-all placeholder:text-gray-400 font-medium text-gray-700 focus:bg-white focus:shadow-[0_0_15px_rgba(124,58,237,0.1)]"
                         required
                      />
                  </div>

                  <div className="relative group">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                         <Mail className="w-5 h-5 text-gray-400 group-focus-within:text-[#7C3AED] transition-colors" />
                      </div>
                      <input 
                         id="email"
                         type="email" 
                         placeholder="Correo electrónico"
                         value={email}
                         onChange={(e) => setEmail(e.target.value)}
                         className="w-full pl-11 pr-4 py-3.5 bg-white/50 border border-gray-200 focus:border-[#7C3AED] rounded-xl outline-none transition-all placeholder:text-gray-400 font-medium text-gray-700 focus:bg-white focus:shadow-[0_0_15px_rgba(124,58,237,0.1)]"
                         required
                      />
                  </div>

                  <div className="relative group">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                         <KeySquare className="w-5 h-5 text-gray-400 group-focus-within:text-[#7C3AED] transition-colors" />
                      </div>
                      <input 
                         id="password"
                         type={showPass ? "text" : "password"}
                         placeholder="Contraseña"
                         value={password}
                         onChange={(e) => setPassword(e.target.value)}
                         className="w-full pl-11 pr-12 py-3.5 bg-white/50 border border-gray-200 focus:border-[#7C3AED] rounded-xl outline-none transition-all placeholder:text-gray-400 font-medium text-gray-700 focus:bg-white focus:shadow-[0_0_15px_rgba(124,58,237,0.1)]"
                         required
                      />
                      <button
                        type="button"
                        onClick={() => setShowPass(!showPass)}
                        className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-[#7C3AED] transition-colors"
                      >
                        {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                  </div>

                  <div className="flex items-start mt-2">
                      <label className="flex items-start gap-3 cursor-pointer">
                          <input
                            id="terminos"
                            type="checkbox"
                            checked={aceptaTerminos}
                            onChange={(e) => setAceptaTerminos(e.target.checked)}
                            className="mt-1 w-4 h-4 rounded text-[#7C3AED] focus:ring-[#7C3AED] border-gray-300 accent-[#7C3AED]"
                          />
                          <span className="text-xs font-medium text-gray-500 leading-relaxed">
                            Al registrarte, aceptas nuestros <Link href="/" className="text-[#7C3AED] hover:underline">Términos y Condiciones</Link> y la <Link href="/" className="text-[#7C3AED] hover:underline">Política de Privacidad</Link>.
                          </span>
                      </label>
                  </div>

                  <button 
                     id="btn-registro"
                     type="submit"
                     disabled={loading}
                     className="mt-6 w-full py-4 bg-[#7C3AED] text-white font-bold rounded-xl transition-all shadow-[0_4px_15px_rgba(124,58,237,0.3)] hover:shadow-[0_0_25px_rgba(124,58,237,0.5)] hover:-translate-y-0.5 disabled:opacity-60 disabled:cursor-not-allowed disabled:translate-y-0"
                  >
                      {loading ? "Creando cuenta..." : "Comenzar ahora"}
                  </button>
              </form>
          </div>
          
          <p className="text-center mt-6 text-sm text-gray-500 font-medium relative z-20">
             ¿Ya tienes una cuenta? <Link href="/login" className="text-[#7C3AED] font-bold hover:underline">Ingresa</Link>
          </p>

      </motion.div>
    </div>
  );
}
