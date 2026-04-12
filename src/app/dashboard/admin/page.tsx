"use client";

import { useSession } from "next-auth/react";
import { Outfit } from "next/font/google";
import { ShieldCheck, Users, BarChart3, AlertTriangle } from "lucide-react";
import { motion } from "framer-motion";

const outfit = Outfit({ subsets: ["latin"], weight: ["700", "800", "900"] });

const stats = [
  { label: "Registros de Auditoría", value: "—", icon: <ShieldCheck className="w-5 h-5" />, color: "from-rose-600 to-rose-800" },
  { label: "Clientes totales", value: "—", icon: <Users className="w-5 h-5" />, color: "from-violet-600 to-violet-800" },
  { label: "Empleados totales", value: "—", icon: <BarChart3 className="w-5 h-5" />, color: "from-sky-600 to-sky-800" },
  { label: "Alertas del sistema", value: "0", icon: <AlertTriangle className="w-5 h-5" />, color: "from-amber-600 to-amber-800" },
];

export default function DashboardAdmin() {
  const { data: session } = useSession();
  const nombre = session?.user?.name?.split(" ")[0] ?? "Admin";

  return (
    <div className="space-y-8">
      <div>
        <h1 className={`text-3xl font-black text-white ${outfit.className}`}>
          Panel de Administración — {nombre}
        </h1>
        <p className="text-slate-400 mt-1">Vista global del sistema. Acceso total de lectura y auditoría.</p>
      </div>

      {/* Alert DBA */}
      <div className="flex items-center gap-3 px-5 py-4 bg-rose-950/60 border border-rose-800/50 rounded-2xl text-rose-300 text-sm font-medium">
        <ShieldCheck className="w-5 h-5 shrink-0" />
        Estás operando con privilegios de Administrador. Toda acción queda registrada en auditoría.
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((card, i) => (
          <motion.div
            key={card.label}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.07 }}
            className="bg-slate-900 border border-slate-800 rounded-2xl p-5 hover:border-slate-700 transition-all"
          >
            <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${card.color} flex items-center justify-center mb-4 shadow-lg`}>
              {card.icon}
            </div>
            <p className="text-slate-400 text-xs font-semibold uppercase tracking-wider">{card.label}</p>
            <p className="text-2xl font-black text-white mt-1">{card.value}</p>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
          <h2 className={`text-lg font-bold text-white mb-4 ${outfit.className}`}>Log de Auditoría</h2>
          <div className="flex flex-col items-center justify-center h-40 text-slate-600">
            <ShieldCheck className="w-8 h-8 mb-2 opacity-40" />
            <p className="text-sm">Últimas entradas de `auditoria_movimiento` — próximamente.</p>
          </div>
        </div>
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
          <h2 className={`text-lg font-bold text-white mb-4 ${outfit.className}`}>Todos los Usuarios</h2>
          <div className="flex flex-col items-center justify-center h-40 text-slate-600">
            <Users className="w-8 h-8 mb-2 opacity-40" />
            <p className="text-sm">Vista global de clientes y empleados — próximamente.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
