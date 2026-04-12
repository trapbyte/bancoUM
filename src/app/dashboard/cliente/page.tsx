"use client";

import { useSession } from "next-auth/react";
import { Outfit } from "next/font/google";
import { CreditCard, ArrowLeftRight, TrendingUp, Wallet } from "lucide-react";
import { motion } from "framer-motion";

const outfit = Outfit({ subsets: ["latin"], weight: ["700", "800", "900"] });

const statCards = [
  { label: "Saldo Total", value: "$—", icon: <Wallet className="w-5 h-5" />, color: "from-violet-600 to-violet-800" },
  { label: "Cuentas Activas", value: "—", icon: <CreditCard className="w-5 h-5" />, color: "from-sky-600 to-sky-800" },
  { label: "Movimientos (mes)", value: "—", icon: <ArrowLeftRight className="w-5 h-5" />, color: "from-emerald-600 to-emerald-800" },
  { label: "Rendimiento", value: "—%", icon: <TrendingUp className="w-5 h-5" />, color: "from-pink-600 to-pink-800" },
];

export default function DashboardCliente() {
  const { data: session } = useSession();
  const nombre = session?.user?.name?.split(" ")[0] ?? "Usuario";

  return (
    <div className="space-y-8">
      {/* Saludo */}
      <div>
        <h1 className={`text-3xl font-black text-white ${outfit.className}`}>
          Bienvenido, {nombre} 👋
        </h1>
        <p className="text-slate-400 mt-1">Aquí tienes un resumen de tus finanzas.</p>
      </div>

      {/* Stats Bento */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((card, i) => (
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

      {/* Placeholder futuro */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-2xl p-6">
          <h2 className={`text-lg font-bold text-white mb-4 ${outfit.className}`}>Últimos Movimientos</h2>
          <div className="flex flex-col items-center justify-center h-40 text-slate-600">
            <ArrowLeftRight className="w-8 h-8 mb-2 opacity-40" />
            <p className="text-sm">La conexión a tus movimientos estará disponible próximamente.</p>
          </div>
        </div>
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
          <h2 className={`text-lg font-bold text-white mb-4 ${outfit.className}`}>Mis Cuentas</h2>
          <div className="flex flex-col items-center justify-center h-40 text-slate-600">
            <CreditCard className="w-8 h-8 mb-2 opacity-40" />
            <p className="text-sm text-center">Tus cuentas se cargarán aquí.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
