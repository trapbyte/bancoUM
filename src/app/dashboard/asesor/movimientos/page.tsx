import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Outfit } from "next/font/google";
import { ArrowLeftRight, Search, FileText, ArrowRight, CornerDownRight, ChevronLeft, ChevronRight } from "lucide-react";
import AnimatedCard from "@/components/dashboard/AnimatedCard";
import { ExportDataBtn } from "@/components/dashboard/ExportDataBtn";
import { SearchBox } from "@/components/dashboard/SearchInput";
import Link from "next/link";

const outfit = Outfit({ subsets: ["latin"], weight: ["700", "800", "900"] });

export default async function MovimientosAsesor({ searchParams }: { searchParams: Promise<{ page?: string; q?: string }> }) {
  const session = await getServerSession(authOptions);

  const resolvedParams = await searchParams;
  const page = Math.max(1, parseInt(resolvedParams.page || "1", 10));
  const q = typeof resolvedParams.q === 'string' ? resolvedParams.q.trim() : "";
  const PAGE_SIZE = 100;
  const skip = (page - 1) * PAGE_SIZE;

  // Build Prisma search filter
  const whereFilter = q ? {
    OR: [
      { referencia_externa: { contains: q, mode: "insensitive" as const } },
      { descripcion: { contains: q, mode: "insensitive" as const } },
      { cuenta_movimiento_id_cuenta_origenTocuenta: { numero_cuenta: { contains: q } } },
      { cuenta_movimiento_id_cuenta_destinoTocuenta: { numero_cuenta: { contains: q } } },
    ]
  } : {};

  // 1. Total count (with filter)
  const totalCount = await prisma.movimiento.count({ where: whereFilter });
  const totalPages = Math.ceil(totalCount / PAGE_SIZE);

  // 2. Paginated Query for UI
  const movimientos = await prisma.movimiento.findMany({
    where: whereFilter,
    orderBy: { fecha: "desc" },
    include: {
      cuenta_movimiento_id_cuenta_origenTocuenta: { select: { numero_cuenta: true, cliente: { select: { nombres: true, apellidos: true, numero_documento: true } } } },
      cuenta_movimiento_id_cuenta_destinoTocuenta: { select: { numero_cuenta: true, cliente: { select: { nombres: true, apellidos: true, numero_documento: true } } } },
      punto_atencion: { select: { nombre: true, tipo: true } }
    },
    skip,
    take: PAGE_SIZE,
  });

  // 3. Export Query is handled lazily via API route on button click - no heavy query on page load

  // 4. Asesor info for PDF header
  const userId = parseInt(session?.user?.id ?? "0", 10);
  const asesor = await prisma.empleado.findUnique({ where: { id_empleado: userId } });

  const formatCurrency = (val: number) =>
    new Intl.NumberFormat("es-CO", { style: "currency", currency: "COP", maximumFractionDigits: 0 }).format(val);

  const asesorData = asesor ? {
    nombre: `${asesor.nombres} ${asesor.apellidos}`,
    documento: `${asesor.tipo_documento} ${asesor.numero_documento}`,
    email: asesor.email || "No registrado",
    cargo: asesor.cargo || "Asesor",
  } : undefined;

  return (
    <div className="space-y-8 relative z-10 w-full max-w-7xl mx-auto pb-10">
      <div>
        <h1 className={`text-4xl font-black text-slate-900 tracking-tight ${outfit.className} flex items-center gap-3`}>
          <ArrowLeftRight className="w-8 h-8 text-emerald-600" />
          Auditoría Transaccional
        </h1>
        <p className="text-slate-500 mt-2 text-lg">Inspecciona y rastrea transferencias, depósitos y retiros en toda la red de cuentas.</p>
      </div>

      <AnimatedCard className="flex flex-col bg-white/70">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-6">
          <SearchBox
            defaultValue={q}
            placeholder="Buscar referencia, cuenta, descripción..."
            width="w-full sm:w-[450px]"
          />
          <div className="flex items-center gap-4">
            <p className="text-sm font-bold text-slate-400 hidden sm:block">Página {page} de {totalPages || 1} • Total: {totalCount}</p>
            <ExportDataBtn 
              title="Auditoría Transaccional Global"
              filename="Movimientos_Asesor_BancoUM_Total"
              columns={["ID/Ref", "Fecha", "Tipo Operación", "Origen", "Destino", "Monto (COP)", "Estado", "Punto/Canal"]}
              asesorData={asesorData}
              fetchUrl={`/api/export?type=movimientos${q ? `&q=${encodeURIComponent(q)}` : ''}`}
            />
          </div>
        </div>

        <div className="flex-1 overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-inner">
          <table className="w-full text-left text-sm text-slate-600">
            <thead className="bg-slate-800 text-slate-300">
              <tr>
                <th className="px-6 py-4 font-bold text-xs uppercase tracking-wider">Detalles / Ref</th>
                <th className="px-6 py-4 font-bold text-xs uppercase tracking-wider">Flujo de Fondos (Origen → Destino)</th>
                <th className="px-6 py-4 font-bold text-xs uppercase tracking-wider text-right">Monto</th>
                <th className="px-6 py-4 font-bold text-xs uppercase tracking-wider text-center">Estado</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {movimientos.length === 0 ? (
                <tr>
                  <td colSpan={4} className="text-center py-16 text-slate-500">
                    <p className="font-semibold text-lg">{q ? `Ningún resultado para "${q}"` : "Sin movimientos registrados."}</p>
                  </td>
                </tr>
              ) : (
                movimientos.map((m) => {
                  const origen = m.cuenta_movimiento_id_cuenta_origenTocuenta;
                  const destino = m.cuenta_movimiento_id_cuenta_destinoTocuenta;
                  
                  return (
                    <tr key={Number(m.id_movimiento)} className="hover:bg-slate-50/60 transition-colors">
                       {/* Detalles Base */}
                       <td className="px-6 py-4 whitespace-nowrap">
                         <div className="flex items-center gap-3">
                           <div className={`px-2 py-1 rounded border text-[10px] uppercase font-black tracking-widest ${
                               m.tipo === "DEPOSITO" ? "bg-emerald-50 text-emerald-700 border-emerald-200" :
                               m.tipo === "RETIRO" ? "bg-rose-50 text-rose-700 border-rose-200" :
                               m.tipo === "PAGO" ? "bg-amber-50 text-amber-700 border-amber-200" :
                               "bg-sky-50 text-sky-700 border-sky-200"
                           }`}>
                             {m.tipo}
                           </div>
                         </div>
                         <p className="text-xs font-mono text-slate-500 mt-2 font-bold">REF:{m.referencia_externa ?? String(m.id_movimiento)}</p>
                         <p className="text-[10px] text-slate-400 mt-0.5">{new Date(m.fecha).toLocaleString()}</p>
                       </td>

                       {/* Trazabilidad Nodos */}
                       <td className="px-6 py-4">
                         <div className="flex items-center gap-4 text-xs font-medium">
                           {/* Nodo Origen */}
                           <div className="flex-1 bg-slate-50 border border-slate-200 rounded-lg p-2 max-w-[180px]">
                             <p className="text-[10px] font-bold text-slate-400 uppercase mb-0.5">Sale de:</p>
                             {origen ? (
                               <>
                                 <p className="font-bold text-slate-700 truncate">{origen.cliente?.nombres} {origen.cliente?.apellidos}</p>
                                 <p className="text-slate-500 font-mono">****{origen.numero_cuenta.slice(-4)}</p>
                               </>
                             ) : (
                               <>
                                 <p className="font-bold text-slate-700 uppercase">{m.punto_atencion?.tipo ?? "Efectivo"}</p>
                                 <p className="text-slate-500 truncate">{m.punto_atencion?.nombre ?? "Fuente Externa"}</p>
                               </>
                             )}
                           </div>
                           
                           <ArrowRight className="w-5 h-5 text-slate-300 shrink-0" />
                           
                           {/* Nodo Destino */}
                           <div className="flex-1 bg-slate-50 border border-slate-200 rounded-lg p-2 max-w-[180px]">
                             <p className="flex items-center gap-1 text-[10px] font-bold text-slate-400 uppercase mb-0.5">
                                <CornerDownRight className="w-3 h-3 text-emerald-500" /> Ingresa a:
                             </p>
                             {destino ? (
                               <>
                                 <p className="font-bold text-slate-700 truncate">{destino.cliente?.nombres} {destino.cliente?.apellidos}</p>
                                 <p className="text-slate-500 font-mono">****{destino.numero_cuenta.slice(-4)}</p>
                               </>
                             ) : (
                               <>
                                 <p className="font-bold text-slate-700 uppercase">{m.punto_atencion?.tipo ?? "Retiro / Pago"}</p>
                                 <p className="text-slate-500 truncate">{m.punto_atencion?.nombre ?? "Destino Externo"}</p>
                               </>
                             )}
                           </div>
                         </div>
                       </td>

                       <td className="px-6 py-4 whitespace-nowrap text-right">
                         <p className="font-black text-slate-900 text-lg tracking-tight">
                           {formatCurrency(Number(m.monto))}
                         </p>
                         {m.descripcion && (
                           <p className="text-[10px] text-slate-400 truncate max-w-[120px] ml-auto block" title={m.descripcion}>
                             MSG: {m.descripcion}
                           </p>
                         )}
                       </td>

                       <td className="px-6 py-4 whitespace-nowrap text-center">
                         <span className={`inline-flex items-center px-2.5 py-0.5 rounded text-xs font-bold capitalize shadow-sm ${
                           m.estado === "CONFIRMADO" ? "bg-emerald-600 text-white" :
                           m.estado === "PENDIENTE" ? "bg-amber-100 text-amber-700" :
                           "bg-rose-100 text-rose-700"
                         }`}>
                           {m.estado?.toLowerCase() ?? "desconocido"}
                         </span>
                       </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Paginación */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between pt-6 border-t border-slate-200 mt-6 px-2">
             <p className="text-sm font-bold text-slate-500">Mostrando {(page - 1) * PAGE_SIZE + 1} a {Math.min(page * PAGE_SIZE, totalCount)} de {totalCount} movimientos</p>
             <div className="flex gap-2">
                <Link href={`?page=${page - 1}`} className={`px-4 py-2 flex items-center justify-center rounded-xl font-bold transition-all shadow-sm ${page <= 1 ? "bg-slate-100 text-slate-400 pointer-events-none" : "bg-white border border-slate-200 text-slate-700 hover:bg-slate-50"}`}>
                   <ChevronLeft className="w-5 h-5 mr-1" /> Anterior
                </Link>
                <Link href={`?page=${page + 1}`} className={`px-4 py-2 flex items-center justify-center rounded-xl font-bold transition-all shadow-sm ${page >= totalPages ? "bg-slate-100 text-slate-400 pointer-events-none" : "bg-white border border-slate-200 text-slate-700 hover:bg-slate-50"}`}>
                   Siguiente <ChevronRight className="w-5 h-5 ml-1" />
                </Link>
             </div>
          </div>
        )}
      </AnimatedCard>
    </div>
  );
}
