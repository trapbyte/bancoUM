import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Outfit } from "next/font/google";
import { CreditCard, Wallet, AlertCircle, ArrowUpRight, ArrowDownLeft, ShieldCheck, Plus } from "lucide-react";
import AnimatedCard from "@/components/dashboard/AnimatedCard";
import { BtnCrearCuenta, BtnTransaccionesModal, BtnVirtualCardDrawer } from "@/components/dashboard/cliente/CuentasUX";

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

  const reachedLimit = cuentas.length >= 3;
  const holderName = `${session?.user?.name || "Titular"} ${(session?.user as any)?.lastName || ""}`.trim();

  // Traer los últimos movimientos de estas cuentas
  const cuentasIds = cuentas.map(c => c.id_cuenta);
  const rawMovimientos = await prisma.movimiento.findMany({
     where: { OR: [ { id_cuenta_origen: { in: cuentasIds } }, { id_cuenta_destino: { in: cuentasIds } } ] },
     orderBy: { fecha: 'desc' },
     take: 50
  });

  return (
    <div className="space-y-8 relative z-10 w-full max-w-5xl mx-auto pb-10">
      {/* Encabezado */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className={`text-4xl font-black text-slate-900 tracking-tight ${outfit.className} flex items-center gap-3`}>
            <Wallet className="w-8 h-8 text-violet-600" />
            Mis Cuentas
          </h1>
          <p className="text-slate-500 mt-2 text-lg">Consulta los detalles y el estado de tus productos activos.</p>
        </div>
        <BtnCrearCuenta reachedLimit={reachedLimit} />
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
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold bg-indigo-100 text-indigo-700 border border-indigo-200 shadow-sm">
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

                {/* Acciones Reales Separadas */}
                <div className="pt-4 border-t border-slate-200/60 mt-auto flex gap-3">
                   {activa ? (
                      (() => {
                         const safeCuenta = {
                            ...cuenta,
                            saldo: Number(cuenta.saldo),
                            limite_credito: cuenta.limite_credito ? Number(cuenta.limite_credito) : null,
                            tipo_cuenta: {
                               ...cuenta.tipo_cuenta,
                               tasa_interes: cuenta.tipo_cuenta.tasa_interes ? Number(cuenta.tipo_cuenta.tasa_interes) : null,
                               cuota_manejo: cuenta.tipo_cuenta.cuota_manejo ? Number(cuenta.tipo_cuenta.cuota_manejo) : null,
                            }
                         };
                         
                         const safeMovimientos = rawMovimientos
                            .filter(m => m.id_cuenta_origen === cuenta.id_cuenta || m.id_cuenta_destino === cuenta.id_cuenta)
                            .slice(0, 5)
                            .map(m => ({
                               ...m,
                               id_movimiento: m.id_movimiento.toString(),
                               monto: Number(m.monto),
                               fecha: m.fecha.toISOString()
                            }));

                         return (
                           <>
                               {/* Pasamos también las cuentas origen disponibles para pagar la TC */}
                               <BtnTransaccionesModal 
                                  cuenta={safeCuenta} 
                                  misCuentas={cuentas
                                    .filter(c => c.estado === 'ACTIVA' && c.tipo_cuenta.tipo !== "TARJETA_CREDITO")
                                    .map(c => ({
                                      id_cuenta: c.id_cuenta,
                                      numero_cuenta: c.numero_cuenta,
                                      saldo: Number(c.saldo),
                                      tipo_cuenta: { tipo: c.tipo_cuenta.tipo }
                                    }))
                                  } 
                               />
                             <BtnVirtualCardDrawer cuenta={safeCuenta} holderName={holderName} ultimosMovimientos={safeMovimientos} />
                           </>
                         );
                      })()
                   ) : (
                      <button disabled className="flex-1 py-2 text-slate-400 font-bold bg-slate-100 rounded-lg text-sm cursor-not-allowed text-center">Cuenta Inactiva</button>
                   )}
                </div>

              </AnimatedCard>
            );
          })
        )}
      </div>
    </div>
  );
}
