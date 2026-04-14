"use client";

import Link from "next/link";
import { Inter, Outfit } from "next/font/google";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, KeySquare, Mail, ShieldCheck, User, Eye, EyeOff, CheckCircle2, ChevronRight, Phone, Calendar, Fingerprint, MapPin, Briefcase, Wallet } from "lucide-react";
import dynamic from "next/dynamic";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { fetchBarrios } from "./actions";

const AnimatedBackground = dynamic(() => import("@/components/ui/AnimatedBackground").then(mod => mod.AnimatedBackground), { ssr: false });

const outfit = Outfit({ subsets: ["latin"], weight: ["400", "500", "700", "800", "900"] });
const inter = Inter({ subsets: ["latin"], weight: ["400", "500", "600"] });

const InputWrapper = ({ icon: Icon, children }: any) => (
  <div className="relative group">
    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
       <Icon className="w-5 h-5 text-slate-400 group-focus-within:text-violet-600 transition-colors" />
    </div>
    {children}
  </div>
);

export default function Registro() {
  const router = useRouter();
  
  // -- Steps (1: Básico, 2: OTP, 3: Complementario)
  const [step, setStep] = useState(1);
  
  // -- State
  const [nombre, setNombre] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [aceptaTerminos, setAceptaTerminos] = useState(false);

  const [otp, setOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [countdown, setCountdown] = useState(120);

  const [tipoDocumento, setTipoDocumento] = useState("CC");
  const [numeroDocumento, setNumeroDocumento] = useState("");
  const [fechaNacimiento, setFechaNacimiento] = useState("");
  const [telefono, setTelefono] = useState("");
  const [idBarrio, setIdBarrio] = useState("");
  const [ingresosEstimados, setIngresosEstimados] = useState("1M-3M");
  const [productoDeseado, setProductoDeseado] = useState("AHORROS");

  const [barrios, setBarrios] = useState<any[]>([]);

  // -- UI
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchBarrios().then(data => setBarrios(data)).catch(console.error);
  }, []);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (step === 2 && countdown > 0) {
      timer = setTimeout(() => setCountdown(countdown - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [step, countdown]);

  async function handleRequestOTP(e?: React.FormEvent) {
    if (e) e.preventDefault();
    if (!aceptaTerminos && step === 1) {
      setError("Debes aceptar los términos y condiciones.");
      return;
    }
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/registro/otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nombre, email }),
      });
      const data = await res.json();
      
      if (!res.ok) {
        setError(data.error);
        setLoading(false);
        return;
      }
      
      setOtpSent(true);
      setCountdown(120);
      setStep(2);
    } catch {
      setError("Error de conexión. Inténtalo de nuevo.");
    } finally {
      setLoading(false);
    }
  }

  async function handleVerifyOTP(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/registro/verificar-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, otp }),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Código incorrecto o vencido.");
        setLoading(false);
        return;
      }

      setStep(3);
    } catch {
      setError("Error de conexión verificando OTP.");
    } finally {
      setLoading(false);
    }
  }

  async function handleFinalSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/registro", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nombre, email, password,
          tipoDocumento, numeroDocumento, fechaNacimiento,
          telefono, idBarrio,
          ingresosEstimados, productoDeseado
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error ?? "Error al crear la cuenta. Verifica que tus datos sean únicos.");
        setLoading(false);
        return;
      }

      // Auto-login
      const loginResult = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (loginResult?.error) {
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
    <div className={`min-h-screen bg-transparent text-slate-800 relative flex items-center justify-center p-6 ${inter.className}`}>
      <AnimatedBackground />

      <div className="absolute top-8 left-8 z-20 hidden md:block">
          <Link href="/" className="inline-flex items-center gap-2 px-4 py-2 bg-white/60 border border-white/50 backdrop-blur-md rounded-full text-slate-700 hover:bg-white hover:text-black transition-all font-medium text-sm shadow-sm">
             <ArrowLeft className="w-4 h-4" />
             Volver al Inicio
          </Link>
      </div>

      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="w-full max-w-xl relative z-10 my-8"
      >
          <div className="absolute -inset-1 bg-linear-to-tr from-violet-600 via-sky-400 to-pink-500 rounded-4xl blur-xl opacity-30 pointer-events-none"></div>
          
          <motion.div layout transition={{ duration: 0.3, ease: 'easeOut' }} className="relative bg-white/80 backdrop-blur-2xl border border-white/50 shadow-2xl rounded-4xl p-8 md:p-10 overflow-hidden">
              {/* Stepper Dots */}
              <div className="flex justify-center gap-3 mb-8">
                 {[1,2,3].map(st => (
                    <motion.div layout key={st} className={`h-3 rounded-full transition-all duration-300 ${st === step ? "bg-violet-600 w-8" : st < step ? "bg-violet-300 w-3" : "bg-slate-200 w-3"}`} />
                 ))}
              </div>

              {/* Header */}
              <div className="text-center mb-8">
                  <div className="inline-flex items-center justify-center gap-2 mb-4">
                      <div className="w-10 h-10 rounded-xl bg-linear-to-br from-violet-600 to-fuchsia-600 flex items-center justify-center shadow-lg border border-white/20">
                          <ShieldCheck className="w-6 h-6 text-white" />
                      </div>
                      <span className={`font-black text-3xl tracking-tighter text-slate-800 ${outfit.className}`}>
                          banco<span className="text-violet-600">UM</span>
                      </span>
                  </div>
                  
                  <AnimatePresence mode="wait">
                     {step === 1 && (
                        <motion.div layout="position" key="h1" initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }}>
                           <h1 className={`text-2xl font-bold text-slate-900 mb-1 ${outfit.className}`}>Crea tu cuenta</h1>
                           <p className="text-slate-500 text-sm">Empieza tu nueva experiencia financiera.</p>
                        </motion.div>
                     )}
                     {step === 2 && (
                        <motion.div layout="position" key="h2" initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }}>
                           <h1 className={`text-2xl font-bold text-slate-900 mb-1 ${outfit.className}`}>Verifica tu correo</h1>
                           <p className="text-slate-500 text-sm">Te enviamos un código OTP a <strong className="text-slate-800">{email}</strong></p>
                        </motion.div>
                     )}
                     {step === 3 && (
                        <motion.div layout="position" key="h3" initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }}>
                           <h1 className={`text-2xl font-bold text-slate-900 mb-1 ${outfit.className}`}>Completa tu perfil</h1>
                           <p className="text-slate-500 text-sm">Casi listo, solo necesitamos unos detalles más.</p>
                        </motion.div>
                     )}
                  </AnimatePresence>
              </div>

              {error && (
                <div className="mb-5 px-4 py-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm font-medium flex items-center gap-2">
                  <span>{error}</span>
                </div>
              )}

              <AnimatePresence mode="wait">
                {step === 1 && (
                  <motion.form layout transition={{ type: "spring", stiffness: 300, damping: 30 }} key="s1" onSubmit={handleRequestOTP} initial={{ x: 20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: -20, opacity: 0 }} className="flex flex-col gap-4">
                      <InputWrapper icon={User}>
                        <input id="nombre" type="text" placeholder="Nombre completo" required value={nombre} onChange={(e) => setNombre(e.target.value)}
                           className="w-full pl-11 pr-4 py-3 bg-white border border-slate-200 focus:border-violet-600 rounded-xl outline-none transition-all text-slate-900 focus:shadow-[0_0_15px_rgba(124,58,237,0.1)]" />
                      </InputWrapper>

                      <InputWrapper icon={Mail}>
                        <input id="email" type="email" placeholder="Correo electrónico" required value={email} onChange={(e) => setEmail(e.target.value)}
                           className="w-full pl-11 pr-4 py-3 bg-white border border-slate-200 focus:border-violet-600 rounded-xl outline-none transition-all text-slate-900 focus:shadow-[0_0_15px_rgba(124,58,237,0.1)]" />
                      </InputWrapper>

                      <InputWrapper icon={KeySquare}>
                          <input id="password" type={showPass ? "text" : "password"} placeholder="Crea una contraseña segura" required value={password} onChange={(e) => setPassword(e.target.value)}
                             className="w-full pl-11 pr-12 py-3 bg-white border border-slate-200 focus:border-violet-600 rounded-xl outline-none transition-all text-slate-900 focus:shadow-[0_0_15px_rgba(124,58,237,0.1)]" />
                          <button type="button" onClick={() => setShowPass(!showPass)} className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-400 hover:text-violet-600 transition-colors">
                             {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                          </button>
                      </InputWrapper>

                      <div className="flex items-start mt-2">
                          <label className="flex items-start gap-3 cursor-pointer">
                              <input type="checkbox" required checked={aceptaTerminos} onChange={(e) => setAceptaTerminos(e.target.checked)} className="mt-1 w-4 h-4 rounded text-violet-600 focus:ring-violet-600 border-slate-300 accent-violet-600" />
                              <span className="text-xs font-medium text-slate-500 leading-relaxed">
                                  Al registrarte, aceptas nuestros <Link href="/" className="text-violet-600 hover:underline">Términos y Condiciones</Link> y la <Link href="/" className="text-violet-600 hover:underline">Política de Privacidad</Link>.
                              </span>
                          </label>
                      </div>

                      <button type="submit" disabled={loading} className="mt-4 w-full py-4 bg-violet-600 text-white font-bold rounded-xl transition-all shadow-[0_4px_15px_rgba(124,58,237,0.3)] hover:shadow-[0_0_25px_rgba(124,58,237,0.5)] hover:-translate-y-0.5 disabled:opacity-60 disabled:cursor-not-allowed">
                          {loading ? "Enviando código..." : "Continuar"}
                      </button>
                  </motion.form>
                )}

                {step === 2 && (
                  <motion.form layout transition={{ type: "spring", stiffness: 300, damping: 30 }} key="s2" onSubmit={handleVerifyOTP} initial={{ x: 20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: -20, opacity: 0 }} className="flex flex-col gap-6 text-center">
                      
                      <div className="bg-violet-50 p-6 rounded-2xl border border-violet-100">
                         <Mail className="w-12 h-12 text-violet-500 mx-auto mb-4" />
                         <p className="text-sm font-medium text-slate-700">Por favor, ingresa el código de 6 dígitos que acabamos de enviar a tu correo. Revisa tu bandeja de entrada o spam.</p>
                      </div>

                      <div>
                         <input type="text" maxLength={6} required value={otp} onChange={(e) => setOtp(e.target.value)} placeholder="• • • • • •"
                          className="w-full tracking-[0.5em] text-center font-mono font-bold text-3xl py-4 bg-white border border-slate-200 focus:border-violet-600 rounded-xl outline-none transition-all text-violet-700 focus:shadow-[0_0_15px_rgba(124,58,237,0.1)]" />
                      </div>

                      <div className="flex gap-3">
                         <button type="button" onClick={() => { setStep(1); setError(null); }} disabled={loading} className="w-1/3 py-4 bg-slate-100 text-slate-600 font-bold rounded-xl transition-all hover:bg-slate-200 disabled:opacity-60">
                            Atrás
                         </button>
                         <button type="submit" disabled={loading} className="w-2/3 py-4 bg-violet-600 text-white font-bold rounded-xl transition-all shadow-[0_4px_15px_rgba(124,58,237,0.3)] hover:shadow-[0_0_25px_rgba(124,58,237,0.5)] hover:-translate-y-0.5 disabled:opacity-60">
                            {loading ? "Verificando..." : "Verificar correo"}
                         </button>
                      </div>

                      <div className="mt-4 text-center">
                         <button type="button" disabled={countdown > 0 || loading} onClick={() => handleRequestOTP()} className="text-sm font-medium text-violet-600 hover:text-violet-700 disabled:text-slate-400 disabled:cursor-not-allowed transition-colors">
                            {countdown > 0 ? `Reenviar código en ${countdown}s` : "Reenviar código"}
                         </button>
                      </div>
                  </motion.form>
                )}

                {step === 3 && (
                  <motion.form layout transition={{ type: "spring", stiffness: 300, damping: 30 }} key="s3" onSubmit={handleFinalSubmit} initial={{ x: 20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} className="flex flex-col gap-5 mt-2">
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                         <div className="flex flex-col gap-1.5">
                            <label className="text-sm font-semibold text-slate-700 ml-1">Tipo de Documento</label>
                            <select value={tipoDocumento} onChange={e=>setTipoDocumento(e.target.value)} className="w-full px-4 py-3 bg-slate-50/50 border border-slate-200 focus:border-violet-600 focus:bg-white rounded-xl outline-none text-slate-900 transition-all font-medium focus:shadow-[0_0_15px_rgba(124,58,237,0.1)]">
                               <option value="CC">Cédula de Ciudadanía (CC)</option>
                               <option value="CE">Cédula Extranjería (CE)</option>
                               <option value="TI">Tarjeta Identidad (TI)</option>
                               <option value="PAS">Pasaporte (PAS)</option>
                            </select>
                         </div>
                         
                         <div className="flex flex-col gap-1.5">
                            <label className="text-sm font-semibold text-slate-700 ml-1">Número de Documento</label>
                            <input type="text" placeholder="Ej. 1000123456" required value={numeroDocumento} onChange={e=>setNumeroDocumento(e.target.value)}
                              className="w-full px-4 py-3 bg-slate-50/50 border border-slate-200 focus:border-violet-600 focus:bg-white rounded-xl text-slate-900 placeholder:text-slate-400 outline-none transition-all focus:shadow-[0_0_15px_rgba(124,58,237,0.1)]" />
                         </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                         <div className="flex flex-col gap-1.5">
                            <label className="text-sm font-semibold text-slate-700 ml-1">Fecha de Nacimiento</label>
                            <input type="date" required value={fechaNacimiento} onChange={e=>setFechaNacimiento(e.target.value)}
                              className="w-full px-4 py-3 bg-slate-50/50 border border-slate-200 focus:border-violet-600 focus:bg-white rounded-xl text-slate-900 outline-none transition-all font-medium focus:shadow-[0_0_15px_rgba(124,58,237,0.1)]" />
                         </div>
                         
                         <div className="flex flex-col gap-1.5">
                            <label className="text-sm font-semibold text-slate-700 ml-1">Teléfono móvil</label>
                            <input type="tel" placeholder="Ej. 300 123 4567" required value={telefono} onChange={e=>setTelefono(e.target.value)}
                              className="w-full px-4 py-3 bg-slate-50/50 border border-slate-200 focus:border-violet-600 focus:bg-white rounded-xl text-slate-900 placeholder:text-slate-400 outline-none transition-all focus:shadow-[0_0_15px_rgba(124,58,237,0.1)]" />
                         </div>
                      </div>

                      <div className="flex flex-col gap-1.5">
                        <label className="text-sm font-semibold text-slate-700 ml-1">Zona de residencia</label>
                        <select required value={idBarrio} onChange={e=>setIdBarrio(e.target.value)} className="w-full px-4 py-3 bg-slate-50/50 border border-slate-200 focus:border-violet-600 focus:bg-white rounded-xl outline-none text-slate-900 transition-all font-medium focus:shadow-[0_0_15px_rgba(124,58,237,0.1)]">
                           <option value="" disabled>Selecciona tu zona de residencia</option>
                           {barrios.length === 0 && <option value="" disabled>Cargando barrios...</option>}
                           {barrios.map(b => (
                              <option key={b.id_barrio} value={b.id_barrio}>{b.nombre}, {b.comuna.municipio.nombre}</option>
                           ))}
                        </select>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                         <div className="flex flex-col gap-1.5">
                            <label className="text-sm font-semibold text-slate-700 ml-1">Ingresos Mensuales</label>
                            <select value={ingresosEstimados} onChange={e=>setIngresosEstimados(e.target.value)} className="w-full px-4 py-3 bg-slate-50/50 border border-slate-200 focus:border-violet-600 focus:bg-white rounded-xl outline-none text-slate-900 transition-all font-medium text-sm focus:shadow-[0_0_15px_rgba(124,58,237,0.1)]">
                               <option value="Menos de 1M">Menos de $1'000.000</option>
                               <option value="1M-3M">$1'000.000 a $3'000.000</option>
                               <option value="3M-5M">$3'000.000 a $5'000.000</option>
                               <option value="Mas de 5M">Más de $5'000.000</option>
                            </select>
                         </div>
                         
                         <div className="flex flex-col gap-1.5">
                            <label className="text-sm font-semibold text-slate-700 ml-1">Producto de interés principal</label>
                            <select value={productoDeseado} onChange={e=>setProductoDeseado(e.target.value)} className="w-full px-4 py-3 bg-slate-50/50 border border-slate-200 focus:border-violet-600 focus:bg-white rounded-xl outline-none text-slate-900 transition-all font-medium text-sm focus:shadow-[0_0_15px_rgba(124,58,237,0.1)]">
                               <option value="AHORROS">Cuenta de Ahorros</option>
                               <option value="CORRIENTE">Cuenta Corriente</option>
                               <option value="TARJETA">Tarjeta de Crédito</option>
                            </select>
                         </div>
                      </div>

                      <div className="flex gap-3 mt-4 pb-2">
                         <button type="submit" disabled={loading} className="w-full py-4 bg-violet-600 text-white font-bold rounded-xl transition-all shadow-[0_4px_15px_rgba(124,58,237,0.3)] hover:shadow-[0_0_25px_rgba(124,58,237,0.5)] hover:-translate-y-0.5 disabled:opacity-60 flex items-center justify-center gap-2">
                            {loading ? "Creando perfil..." : "Crear mi cuenta"} <CheckCircle2 className="w-5 h-5" />
                         </button>
                      </div>
                  </motion.form>
                )}
              </AnimatePresence>
          </motion.div>
          
          {step === 1 && (
            <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center mt-6 text-sm text-slate-500 font-medium relative z-20">
              ¿Ya tienes una cuenta? <Link href="/login" className="text-violet-600 font-bold hover:underline">Ingresa aquí</Link>
            </motion.p>

          )}
      </motion.div>
    </div>
  );
}
