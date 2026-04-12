import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Outfit } from "next/font/google";
import { CreditCard, Wallet, AlertCircle, ArrowUpRight, ArrowDownLeft, ShieldCheck } from "lucide-react";
import AnimatedCard from "@/components/dashboard/AnimatedCard";

const outfit = Outfit({ subsets: ["latin"], weight: ["700", "800", "900"] });

export default async function MisCuentasCliente() {
  const session = await getServerSession(authOptions);
  const userId = parseInt(session?.user?.id ?? "0", 10);

  // ── Database Queries ──────────────────────────────────────────────────
  const cuentas = await prisma.cuenta.findMany({
    where: { id_cliente: userId },
    include: { tipo_cuenta: true },
    orderBy: { fecha_apertura: "desc" },
  });

  const formatCurrency = (val: number) =>
    new Intl.NumberFormat("es-CO", { style: "currency", currency: "COP", maximumFractionDigits: 0 }).format(val);

  return (
    <div className="space-y-8 relative z-10 w-full max-w-5xl mx-auto pb-10">
      {/* Encabezado */}
      <div>
        <h1 className={`text-4xl font-black text-slate-900 tracking-tight ${outfit.className} flex items-center gap-3`}>
          <Wallet className="w-8 h-8 text-violet-600" />
          Mis Cuentas
        </h1>
        <p className="text-slate-500 mt-2 text-lg">Consulta los detalles y el estado de tus productos activos.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {cuentas.length === 0 ? (
          <div className="md:col-span-2 py-16 flex flex-col items-center justify-center border-2 border-dashed border-slate-200 rounded-3xl bg-white/50 backdrop-blur-sm">
             <AlertCircle className="w-12 h-12 text-slate-300 mb-4" />
             <p className="text-lg font-bold text-slate-600">No tienes cuentas abiertas.</p>
             <p className="text-sm text-slate-400 mt-1">Acércate a una de nuestras sucursales para adquirir un producto.</p>
          </div>
        ) : (
          cuentas.map((cuenta, idx) => {
            const esCredito = cuenta.tipo_cuenta.tipo === "TARJETA_CREDITO";
            const saldo = Number(cuenta.saldo);
            const limite = esCredito ? Number(cuenta.limite_credito ?? 0) : null;
            const porcentajeUso = esCredito && limite && limite > 0 ? (saldo / limite) * 100 : 0;
            const activa = cuenta.estado === "ACTIVA";

            return (
              <AnimatedCard key={cuenta.id_cuenta} delay={idx * 0.1} className="flex flex-col h-full bg-white/50">
                {/* Cabecera Tarjeta */}
                <div className="flex items-start justify-between mb-8">
                  <div className="flex items-center gap-3">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 shadow-inner ${
                      esCredito ? "bg-gradient-to-br from-rose-500 to-pink-600 text-white" : "bg-gradient-to-br from-violet-600 to-indigo-600 text-white"
                    }`}>
                      <CreditCard className="w-6 h-6" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">{cuenta.tipo_cuenta.tipo.replace("_", " ")}</p>
                      <p className="text-sm font-semibold text-slate-700 tracking-widest font-mono mt-0.5">
                         **** {cuenta.numero_cuenta.slice(-4)}
                      </p>
                    </div>
                  </div>
                  <div>
                    {activa ? (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-700 border border-emerald-200 shadow-sm">
                        <ShieldCheck className="w-3.5 h-3.5" />
                        ACTIVA
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold bg-rose-100 text-rose-700 border border-rose-200 shadow-sm">
                        <AlertCircle className="w-3.5 h-3.5" />
                        {cuenta.estado}
                      </span>
                    )}
                  </div>
                </div>

                {/* Montos */}
                <div className="flex-1 mb-6">
                  <p className="text-sm font-medium text-slate-500 mb-1">{esCredito ? "Deuda Actual" : "Saldo Disponible"}</p>
                  <p className="text-4xl font-black text-slate-900 tracking-tight">
                     {formatCurrency(saldo)}
                  </p>
                  
                  {esCredito && limite !== null && (
                    <div className="mt-6">
                      <div className="flex justify-between text-xs font-semibold text-slate-500 mb-2">
                        <span>Cupo Utilizado</span>
                        <span>{porcentajeUso.toFixed(1)}%</span>
                      </div>
                      <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden shadow-inner flex">
                         <div 
                           className={`h-full rounded-full transition-all duration-1000 ${
                             porcentajeUso > 80 ? 'bg-rose-500' : 'bg-violet-500'
                           }`} 
                           style={{ width: `${Math.min(porcentajeUso, 100)}%` }} 
                         />
                      </div>
                      <p className="text-xs text-slate-400 mt-2 text-right">
                         Cupo Total: {formatCurrency(limite)}
                      </p>
                    </div>
                  )}
                </div>

                {/* Acciones */}
                <div className="pt-4 border-t border-slate-200/60 mt-auto flex gap-3">
                   <button 
                     disabled={!activa}
                     className="flex-1 flex gap-2 items-center justify-center bg-white border border-slate-200 shadow-sm hover:bg-slate-50 hover:border-slate-300 hover:shadow text-slate-800 text-sm font-bold py-2.5 rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                   >
                     {esCredito ? <ArrowDownLeft className="w-4 h-4 text-emerald-600" /> : <ArrowUpRight className="w-4 h-4 text-rose-600" />}
                     {esCredito ? "Pagar Cuota" : "Transferir"}
                   </button>
                   <button 
                     disabled={!activa}
                     className="flex-1 flex gap-2 items-center justify-center bg-white border border-slate-200 shadow-sm hover:bg-slate-50 hover:border-slate-300 hover:shadow text-slate-800 text-sm font-bold py-2.5 rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                   >
                     Detalles
                   </button>
                </div>

              </AnimatedCard>
            );
          })
        )}
      </div>
    </div>
  );
}
