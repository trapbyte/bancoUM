"use client";

import Link from "next/link";
import { Inter, Outfit } from "next/font/google";
import { motion } from "framer-motion";
import { ArrowLeft, KeySquare, Mail, ShieldCheck, Eye, EyeOff, Lock, CheckCircle2 } from "lucide-react";
import { AnimatedBackground } from "@/components/ui/AnimatedBackground";
import { signIn } from "next-auth/react";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

const outfit = Outfit({ subsets: ["latin"], weight: ["400", "500", "700", "800", "900"] });
const inter = Inter({ subsets: ["latin"], weight: ["400", "500", "600"] });

export default function Login() {
  const router = useRouter();
  
  // Login State
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Lockout State
  const [loginAttempts, setLoginAttempts] = useState(0);
  const [isLocked, setIsLocked] = useState(false);
  const [remainingTime, setRemainingTime] = useState(0);

  // Forgot Password State
  const [forgotPassStep, setForgotPassStep] = useState<0 | 1 | 2 | 3>(0);
  const [resetEmail, setResetEmail] = useState("");
  const [resetOtp, setResetOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");
  const [resetLoading, setResetLoading] = useState(false);
  const [resetError, setResetError] = useState<string | null>(null);

  useEffect(() => {
    const savedAttempts = localStorage.getItem("loginAttempts");
    if (savedAttempts) {
      setLoginAttempts(parseInt(savedAttempts));
    }

    const checkLockout = () => {
      const lockout = localStorage.getItem("lockoutTime");
      if (lockout) {
        const remaining = parseInt(lockout) - Date.now();
        if (remaining > 0) {
          setIsLocked(true);
          setRemainingTime(Math.ceil(remaining / 1000));
        } else {
          setIsLocked(false);
          setRemainingTime(0);
          localStorage.removeItem("lockoutTime");
          localStorage.removeItem("loginAttempts");
          setLoginAttempts(0);
        }
      }
    };
    
    checkLockout();
    const interval = setInterval(checkLockout, 1000);
    return () => clearInterval(interval);
  }, []);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    if (isLocked) return;

    setLoading(true);
    setError(null);

    const result = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });

    if (result?.error) {
      const newAttempts = loginAttempts + 1;
      setLoginAttempts(newAttempts);
      localStorage.setItem("loginAttempts", newAttempts.toString());
      
      if (newAttempts >= 3) {
        const lockout = Date.now() + 60000; // 60 seconds
        localStorage.setItem("lockoutTime", lockout.toString());
        setIsLocked(true);
        setRemainingTime(60);
        setError("Demasiados intentos fallidos. Cuenta bloqueada temporalmente.");
      } else {
        setError("Correo o contraseña incorrectos. Inténtalo de nuevo.");
      }
      setLoading(false);
      return;
    }

    // Reset attempts on success
    localStorage.removeItem("loginAttempts");
    localStorage.removeItem("lockoutTime");
    
    // Redirigir al dashboard
    router.push("/dashboard");
  }

  async function handleForgotPassEmail(e: React.FormEvent) {
    e.preventDefault();
    setResetLoading(true);
    setResetError(null);
    try {
      const res = await fetch("/api/auth/reset-password/otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: resetEmail }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Error al enviar el código.");
      }
      setForgotPassStep(2);
    } catch (err: any) {
      setResetError(err.message);
    } finally {
      setResetLoading(false);
    }
  }

  async function handleForgotPassOtp(e: React.FormEvent) {
    e.preventDefault();
    if (resetOtp.length < 6) {
      setResetError("El código debe tener al menos 6 caracteres.");
      return;
    }
    setResetError(null);
    setForgotPassStep(3);
  }

  async function handleForgotPassReset(e: React.FormEvent) {
    e.preventDefault();
    if (newPassword !== confirmNewPassword) {
      setResetError("Las contraseñas no coinciden.");
      return;
    }
    setResetLoading(true);
    setResetError(null);
    try {
      const res = await fetch("/api/auth/reset-password/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          email: resetEmail, 
          otp: resetOtp, 
          newPassword, 
          confirmNewPassword 
        }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Error al restablecer la contraseña.");
      }
      // Volver al login tras éxito
      setForgotPassStep(0);
      setResetEmail("");
      setResetOtp("");
      setNewPassword("");
      setConfirmNewPassword("");
      setError("Contraseña actualizada con éxito. Ahora puedes iniciar sesión.");
    } catch (err: any) {
      setResetError(err.message);
    } finally {
      setResetLoading(false);
    }
  }

  return (
    <div className={`min-h-screen bg-transparent text-[#1F2937] relative flex items-center justify-center p-6 ${inter.className}`}>
      
      <AnimatedBackground />

      {/* Botón flotante para regresar */}
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
        className="w-full max-w-md relative z-10"
      >
          <div className="absolute -inset-1 bg-gradient-to-tr from-[#7C3AED] via-[#38BDF8] to-[#EC4899] rounded-[2rem] blur-xl opacity-30 pointer-events-none"></div>
          
          <div className="relative bg-white/60 backdrop-blur-2xl border border-white/50 shadow-2xl rounded-[2rem] p-10 overflow-hidden">
              <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-white to-transparent opacity-80"></div>

              {forgotPassStep === 0 && (
                <div className="flex flex-col animate-in fade-in zoom-in duration-300">
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

                  {/* Error & Success messages */}
                  {error && (
                    <motion.div
                      initial={{ opacity: 0, y: -8 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={`mb-5 px-4 py-3 rounded-xl border text-sm font-medium ${error.includes('éxito') ? 'bg-green-50 border-green-200 text-green-700' : 'bg-red-50 border-red-200 text-red-700'}`}
                    >
                      {error}
                    </motion.div>
                  )}

                  <form onSubmit={handleLogin} className="flex flex-col gap-5">
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
                             disabled={isLocked}
                             className="w-full pl-11 pr-4 py-3.5 bg-white/50 border border-gray-200 focus:border-[#7C3AED] rounded-xl outline-none transition-all placeholder:text-gray-400 font-medium text-gray-700 focus:bg-white focus:shadow-[0_0_15px_rgba(124,58,237,0.1)] disabled:opacity-50"
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
                             disabled={isLocked}
                             className="w-full pl-11 pr-12 py-3.5 bg-white/50 border border-gray-200 focus:border-[#7C3AED] rounded-xl outline-none transition-all placeholder:text-gray-400 font-medium text-gray-700 focus:bg-white focus:shadow-[0_0_15px_rgba(124,58,237,0.1)] disabled:opacity-50"
                             required
                          />
                          <button
                            type="button"
                            onClick={() => setShowPass(!showPass)}
                            disabled={isLocked}
                            className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-[#7C3AED] transition-colors disabled:opacity-50"
                          >
                            {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                          </button>
                      </div>

                      <div className="flex items-center justify-between mt-1">
                          <label className="flex items-center gap-2 cursor-pointer">
                              <input id="remember" type="checkbox" disabled={isLocked} className="w-4 h-4 rounded text-[#7C3AED] focus:ring-[#7C3AED] border-gray-300 accent-[#7C3AED] disabled:opacity-50" />
                              <span className="text-sm font-medium text-gray-600">Recordarme</span>
                          </label>
                          <button 
                            type="button" 
                            onClick={() => setForgotPassStep(1)}
                            className="font-semibold text-sm text-[#7C3AED] hover:underline"
                          >
                              ¿Olvidaste tu contraseña?
                          </button>
                      </div>

                      <button 
                         id="btn-login"
                         type="submit"
                         disabled={loading || isLocked}
                         className={`mt-6 w-full py-4 text-white font-bold rounded-xl transition-all shadow-md ${isLocked ? 'bg-red-500 cursor-not-allowed' : 'bg-[#111827] hover:shadow-xl hover:-translate-y-0.5 hover:bg-black'} disabled:opacity-60 disabled:cursor-not-allowed disabled:translate-y-0`}
                      >
                         {isLocked ? `Bloqueado (${remainingTime}s)` : loading ? "Ingresando..." : "Iniciar Sesión"}
                      </button>
                  </form>
                  
                  <p className="text-center mt-6 text-sm text-gray-500 font-medium relative z-20">
                     ¿No tienes una cuenta aún? <Link href="/registro" className="text-[#7C3AED] font-bold hover:underline">Regístrate</Link>
                  </p>
                </div>
              )}

              {/* Paso 1: Ingresar Email */}
              {forgotPassStep === 1 && (
                <div className="flex flex-col animate-in fade-in zoom-in duration-300">
                  <button onClick={() => setForgotPassStep(0)} className="text-gray-500 hover:text-gray-800 mb-6 flex items-center gap-2 text-sm font-medium transition-colors w-fit">
                    <ArrowLeft className="w-4 h-4" /> Volver al Inicio de Sesión
                  </button>

                  <div className="mb-8">
                    <h2 className={`text-2xl font-bold text-gray-900 mb-2 ${outfit.className}`}>Recuperar contraseña</h2>
                    <p className="text-gray-500 text-sm font-light">Escribe tu correo electrónico para recibir un código de recuperación.</p>
                  </div>

                  {resetError && (
                    <div className="mb-5 px-4 py-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm font-medium">{resetError}</div>
                  )}

                  <form onSubmit={handleForgotPassEmail} className="flex flex-col gap-5">
                    <div className="relative group">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                         <Mail className="w-5 h-5 text-gray-400 group-focus-within:text-[#7C3AED] transition-colors" />
                      </div>
                      <input 
                         type="email" 
                         placeholder="Correo electrónico"
                         value={resetEmail}
                         onChange={(e) => setResetEmail(e.target.value)}
                         className="w-full pl-11 pr-4 py-3.5 bg-white/50 border border-gray-200 focus:border-[#7C3AED] rounded-xl outline-none transition-all placeholder:text-gray-400 font-medium text-gray-700"
                         required
                      />
                    </div>

                    <button 
                       type="submit"
                       disabled={resetLoading}
                       className="mt-2 w-full py-4 bg-[#7C3AED] text-white font-bold rounded-xl transition-all shadow-md hover:bg-[#6D28D9] disabled:opacity-60"
                    >
                       {resetLoading ? "Enviando..." : "Enviar Código"}
                    </button>
                  </form>
                </div>
              )}

              {/* Paso 2: Ingresar OTP */}
              {forgotPassStep === 2 && (
                <div className="flex flex-col animate-in fade-in zoom-in duration-300">
                  <button onClick={() => setForgotPassStep(1)} className="text-gray-500 hover:text-gray-800 mb-6 flex items-center gap-2 text-sm font-medium transition-colors w-fit">
                    <ArrowLeft className="w-4 h-4" /> Volver
                  </button>

                  <div className="mb-8">
                    <h2 className={`text-2xl font-bold text-gray-900 mb-2 ${outfit.className}`}>Verificar Código</h2>
                    <p className="text-gray-500 text-sm font-light">Ingresa el código que enviamos a tu correo para continuar.</p>
                  </div>

                  {resetError && (
                    <div className="mb-5 px-4 py-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm font-medium">{resetError}</div>
                  )}

                  <form onSubmit={handleForgotPassOtp} className="flex flex-col gap-5">
                    <div className="relative group">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                         <KeySquare className="w-5 h-5 text-gray-400 group-focus-within:text-[#7C3AED] transition-colors" />
                      </div>
                      <input 
                         type="text" 
                         placeholder="Código de 6 caracteres"
                         value={resetOtp}
                         onChange={(e) => setResetOtp(e.target.value)}
                         className="w-full pl-11 pr-4 py-3.5 bg-white/50 border border-gray-200 focus:border-[#7C3AED] rounded-xl outline-none transition-all placeholder:text-gray-400 font-medium text-gray-700"
                         required
                      />
                    </div>

                    <button 
                       type="submit"
                       className="mt-2 w-full py-4 bg-[#7C3AED] text-white font-bold rounded-xl transition-all shadow-md hover:bg-[#6D28D9]"
                    >
                       Verificar Código
                    </button>
                  </form>
                </div>
              )}

              {/* Paso 3: Restablecer Contraseña */}
              {forgotPassStep === 3 && (
                <div className="flex flex-col animate-in fade-in zoom-in duration-300">
                  <button onClick={() => setForgotPassStep(2)} className="text-gray-500 hover:text-gray-800 mb-6 flex items-center gap-2 text-sm font-medium transition-colors w-fit">
                    <ArrowLeft className="w-4 h-4" /> Volver
                  </button>

                  <div className="mb-8">
                    <h2 className={`text-2xl font-bold text-gray-900 mb-2 ${outfit.className}`}>Nueva Contraseña</h2>
                    <p className="text-gray-500 text-sm font-light">Ingresa y confirma tu nueva contraseña.</p>
                  </div>

                  {resetError && (
                    <div className="mb-5 px-4 py-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm font-medium">{resetError}</div>
                  )}

                  <form onSubmit={handleForgotPassReset} className="flex flex-col gap-5">
                    <div className="relative group">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                         <Lock className="w-5 h-5 text-gray-400 group-focus-within:text-[#7C3AED] transition-colors" />
                      </div>
                      <input 
                         type="password" 
                         placeholder="Nueva contraseña"
                         value={newPassword}
                         onChange={(e) => setNewPassword(e.target.value)}
                         className="w-full pl-11 pr-4 py-3.5 bg-white/50 border border-gray-200 focus:border-[#7C3AED] rounded-xl outline-none transition-all placeholder:text-gray-400 font-medium text-gray-700"
                         required
                      />
                    </div>

                    <div className="relative group">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                         <Lock className="w-5 h-5 text-gray-400 group-focus-within:text-[#7C3AED] transition-colors" />
                      </div>
                      <input 
                         type="password" 
                         placeholder="Confirmar nueva contraseña"
                         value={confirmNewPassword}
                         onChange={(e) => setConfirmNewPassword(e.target.value)}
                         className="w-full pl-11 pr-4 py-3.5 bg-white/50 border border-gray-200 focus:border-[#7C3AED] rounded-xl outline-none transition-all placeholder:text-gray-400 font-medium text-gray-700"
                         required
                      />
                    </div>

                    <button 
                       type="submit"
                       disabled={resetLoading}
                       className="mt-2 w-full py-4 bg-[#111827] text-white font-bold rounded-xl transition-all shadow-md hover:bg-black disabled:opacity-60"
                    >
                       {resetLoading ? "Guardando..." : "Restablecer Contraseña"}
                    </button>
                  </form>
                </div>
              )}

          </div>

      </motion.div>
    </div>
  );
}
