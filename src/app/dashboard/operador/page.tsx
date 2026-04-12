"use client";

import { useSession } from "next-auth/react";
import { Outfit } from "next/font/google";
import { Building2, BookUser, MapPin, Settings } from "lucide-react";
import { motion } from "framer-motion";

const outfit = Outfit({ subsets: ["latin"], weight: ["700", "800", "900"] });

const stats = [
  { label: "Puntos de Atención", value: "—", icon: <Building2 className="w-5 h-5" />, color: "from-emerald-600 to-emerald-800" },
  { label: "Empleados activos", value: "—", icon: <BookUser className="w-5 h-5" />, color: "from-sky-600 to-sky-800" },
  { label: "Sucursales", value: "—", icon: <MapPin className="w-5 h-5" />, color: "from-violet-600 to-violet-800" },
  { label: "Tipos de Cuenta", value: "—", icon: <Settings className="w-5 h-5" />, color: "from-amber-600 to-amber-800" },
];

export default function DashboardOperador() {
  const { data: session } = useSession();
  const nombre = session?.user?.name?.split(" ")[0] ?? "Operador";

  return (
    <div className="space-y-8">
      <div>
        <h1 className={`text-3xl font-black text-white ${outfit.className}`}>
          Panel del Operador — {nombre}
        </h1>
        <p className="text-slate-400 mt-1">Administra la infraestructura y el personal del banco.</p>
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
          <h2 className={`text-lg font-bold text-white mb-4 ${outfit.className}`}>Puntos de Atención</h2>
          <div className="flex flex-col items-center justify-center h-40 text-slate-600">
            <Building2 className="w-8 h-8 mb-2 opacity-40" />
            <p className="text-sm">Lista de sucursales y cajeros — próximamente.</p>
          </div>
        </div>
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
          <h2 className={`text-lg font-bold text-white mb-4 ${outfit.className}`}>Empleados Asignados</h2>
          <div className="flex flex-col items-center justify-center h-40 text-slate-600">
            <BookUser className="w-8 h-8 mb-2 opacity-40" />
            <p className="text-sm">Personal y asignaciones — próximamente.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
