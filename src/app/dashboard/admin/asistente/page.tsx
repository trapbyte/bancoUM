import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { Outfit } from "next/font/google";
import { Bot, ShieldCheck, Mic, Database, Volume2 } from "lucide-react";
import AIAssistant from "@/components/dashboard/AIAssistant";

const outfit = Outfit({ subsets: ["latin"], weight: ["700", "800", "900"] });

export const metadata = {
  title: "Asistente IA — BancoUM",
  description: "Consulta datos del banco en lenguaje natural con IA",
};

export default async function AsistentePage() {
  const session = await getServerSession(authOptions);

  // Solo acceso para admin, asesor y operador
  const rol = session?.user?.rol;
  if (!session || !rol || !["admin", "asesor", "operador"].includes(rol)) {
    redirect("/dashboard");
  }

  return (
    <div className="space-y-8 w-full max-w-5xl mx-auto pb-10">

      {/* ── Header ──────────────────────────────────────────────────────── */}
      <div>
        <h1 className={`text-4xl font-black text-slate-900 tracking-tight flex items-center gap-3 ${outfit.className}`}>
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-violet-200">
            <Bot className="w-6 h-6 text-white" />
          </div>
          Asistente IA
        </h1>
        <p className="text-slate-500 mt-2 text-lg">
          Consulta los datos del banco en lenguaje natural. El modelo genera SQL, ejecuta la consulta y te responde por voz.
        </p>
      </div>

      {/* ── Aviso de restricciones ────────────────────────────────────── */}
      <div className="flex items-start gap-3 px-5 py-4 bg-amber-50 border border-amber-200 shadow-sm rounded-2xl text-amber-800 text-sm font-medium">
        <ShieldCheck className="w-5 h-5 shrink-0 text-amber-600 mt-0.5" />
        <div>
          <p className="font-bold text-amber-900 mb-0.5">Modo Solo Lectura</p>
          <p>El asistente únicamente puede ejecutar consultas <code className="bg-amber-100 px-1.5 py-0.5 rounded font-mono text-xs">SELECT</code>. 
          Operaciones de escritura, eliminación o modificación están bloqueadas. Todas las consultas quedan registradas en auditoría.</p>
        </div>
      </div>

      {/* ── Capacidades ──────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          {
            icon: <Mic className="w-5 h-5 text-violet-600" />,
            bg: "bg-violet-50 border-violet-200",
            title: "Voz y Texto",
            desc: "Habla o escribe tu pregunta en español colombiano",
          },
          {
            icon: <Database className="w-5 h-5 text-sky-600" />,
            bg: "bg-sky-50 border-sky-200",
            title: "SQL Automático",
            desc: "llama3.2 traduce tu pregunta a SQL de PostgreSQL",
          },
          {
            icon: <Volume2 className="w-5 h-5 text-emerald-600" />,
            bg: "bg-emerald-50 border-emerald-200",
            title: "Respuesta Hablada",
            desc: "ElevenLabs sintetiza la respuesta con voz natural",
          },
        ].map((card) => (
          <div key={card.title} className={`flex items-start gap-3 p-4 rounded-xl border ${card.bg}`}>
            <div className="shrink-0 mt-0.5">{card.icon}</div>
            <div>
              <p className="font-bold text-slate-800 text-sm">{card.title}</p>
              <p className="text-xs text-slate-500 mt-0.5">{card.desc}</p>
            </div>
          </div>
        ))}
      </div>

      {/* ── Ejemplos de preguntas ─────────────────────────────────────── */}
      <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm">
        <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Ejemplos de preguntas</p>
        <div className="flex flex-wrap gap-2">
          {[
            "¿Cuántos clientes activos hay?",
            "¿Cuál es el saldo total de todas las cuentas?",
            "Muestra los últimos 10 movimientos",
            "¿Qué empleados hay en cada punto de atención?",
            "¿Cuántas cuentas de ahorro existen?",
            "Lista los clientes con mayor saldo en sus cuentas",
          ].map((ejemplo) => (
            <span
              key={ejemplo}
              className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-full text-xs text-slate-600 font-medium"
            >
              {ejemplo}
            </span>
          ))}
        </div>
      </div>

      {/* ── Componente principal del asistente ───────────────────────── */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
        <AIAssistant />
      </div>
    </div>
  );
}
