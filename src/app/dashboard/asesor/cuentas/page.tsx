import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Outfit } from "next/font/google";
import { CreditCard, Search, ChevronRight, ShieldCheck, AlertCircle, Fingerprint, ChevronLeft } from "lucide-react";
import AnimatedCard from "@/components/dashboard/AnimatedCard";
import { ExportDataBtn } from "@/components/dashboard/ExportDataBtn";
import { SearchBox } from "@/components/dashboard/SearchInput";
import Link from "next/link";

const outfit = Outfit({ subsets: ["latin"], weight: ["700", "800", "900"] });

export default async function CuentasAsesor({ searchParams }: { searchParams: Promise<{ page?: string; q?: string }> }) {
  const session = await getServerSession(authOptions);

  const resolvedParams = await searchParams;
  const page = Math.max(1, parseInt(resolvedParams.page || "1", 10));
  const q = typeof resolvedParams.q === 'string' ? resolvedParams.q.trim() : "";
  const PAGE_SIZE = 100;
  const skip = (page - 1) * PAGE_SIZE;

  // Build search filter
  const whereFilter = q ? {
    OR: [
      { numero_cuenta: { contains: q } },
      { cliente: { nombres: { contains: q, mode: "insensitive" as const } } },
      { cliente: { apellidos: { contains: q, mode: "insensitive" as const } } },
      { cliente: { numero_documento: { contains: q } } },
    ]
  } : {};

  // 1. Total count
  const totalCount = await prisma.cuenta.count({ where: whereFilter });
  const totalPages = Math.ceil(totalCount / PAGE_SIZE);

  // Count blocked accounts (cheap query, no data transfer)
  const bloqueadasCount = await prisma.cuenta.count({ where: { estado: 'BLOQUEADA' } });

  // 2. Paginated Query for UI
  const cuentas = await prisma.cuenta.findMany({
    where: whereFilter,
    orderBy: { fecha_apertura: "desc" },
    include: {
      cliente: true,
      tipo_cuenta: true
    },
    skip,
    take: PAGE_SIZE,
  });

  // 3. Export handled lazily via API route on button click

  // 4. Asesor info for PDF header
  const userId = parseInt(session?.user?.id ?? "0", 10);
  const asesor = await prisma.empleado.findUnique({ where: { id_empleado: userId } });
  const asesorData = asesor ? {
    nombre: `${asesor.nombres} ${asesor.apellidos}`,
    documento: `${asesor.tipo_documento} ${asesor.numero_documento}`,
    email: asesor.email || "No registrado",
    cargo: asesor.cargo || "Asesor",
  } : undefined;

  const formatCurrency = (val: number) =>
    new Intl.NumberFormat("es-CO", { style: "currency", currency: "COP", maximumFractionDigits: 0 }).format(val);

  return (
    <div className="space-y-8 relative z-10 w-full max-w-6xl mx-auto pb-10">
      <div>
        <h1 className={`text-4xl font-black text-slate-900 tracking-tight ${outfit.className} flex items-center gap-3`}>
          <CreditCard className="w-8 h-8 text-sky-600" />
          Manejo de Cuentas
        </h1>
        <p className="text-slate-500 mt-2 text-lg">Supervisa el estado y los fondos vinculados de los pasivos y activos del banco.</p>
      </div>

      <AnimatedCard className="flex flex-col bg-white/70">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-6">
          <SearchBox
            defaultValue={q}
            placeholder="Número de cuenta o cédula del cliente..."
          />
          <div className="flex gap-3">
            <select className="px-4 py-2 border border-slate-200 rounded-xl bg-white text-sm font-semibold shadow-sm text-slate-600 focus:outline-none focus:ring-2 focus:ring-violet-200">
              <option>Todas las cuentas</option>
              <option>Ahorros</option>
              <option>Corriente</option>
              <option>Tarjeta Crédito</option>
            </select>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex flex-col sm:flex-row gap-2 hidden sm:flex">
              <span className="px-3 py-1 bg-rose-100 text-rose-700 font-bold rounded text-xs">Bloq: {bloqueadasCount}</span>
              <span className="px-3 py-1 bg-slate-100 text-slate-700 font-bold rounded text-xs">Pagina {page} de {totalPages || 1} • Total: {totalCount}</span>
            </div>
            <ExportDataBtn 
              title="Reporte Global de Cuentas BancoUM"
              filename="Cuentas_BancoUM_Todas"
              columns={["No. Cuenta", "Cliente", "Tipo Producto", "Saldo (COP)", "Estado", "Apertura"]}
              asesorData={asesorData}
              fetchUrl={`/api/export?type=cuentas${q ? `&q=${encodeURIComponent(q)}` : ''}`}
            />
          </div>
        </div>

        <div className="flex-1 overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-inner">
          <table className="w-full text-left text-sm text-slate-600">
            <thead className="bg-slate-50/80 text-slate-500 border-b border-slate-200">
              <tr>
                <th className="px-6 py-4 font-bold text-xs uppercase tracking-wider">Cuenta</th>
                <th className="px-6 py-4 font-bold text-xs uppercase tracking-wider">Titular</th>
                <th className="px-6 py-4 font-bold text-xs uppercase tracking-wider text-right">Saldo / Cupo</th>
                <th className="px-6 py-4 font-bold text-xs uppercase tracking-wider text-center">Estado</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {cuentas.length === 0 ? (
                <tr>
                  <td colSpan={5} className="text-center py-16 text-slate-500">
                    <p className="font-semibold">No se encontraron cuentas.</p>
                  </td>
                </tr>
              ) : (
                cuentas.map((c) => {
                  const activa = c.estado === "ACTIVA";
                  const esCredito = c.tipo_cuenta.tipo === "TARJETA_CREDITO";
                  
                  return (
                    <tr key={c.id_cuenta} className="hover:bg-slate-50/60 transition-colors group cursor-pointer">
                       <td className="px-6 py-4 whitespace-nowrap">
                         <p className="text-[10px] font-bold text-slate-400 mb-0.5 uppercase tracking-widest">{c.tipo_cuenta.tipo.replace("_", " ")}</p>
                         <p className="font-mono font-bold text-slate-800">{c.numero_cuenta}</p>
                       </td>
                       <td className="px-6 py-4 whitespace-nowrap">
                         {c.cliente ? (
                           <div>
                             <p className="font-bold text-slate-700">{c.cliente.nombres} {c.cliente.apellidos}</p>
                             <p className="text-[11px] text-slate-400 flex items-center gap-1 mt-0.5"><Fingerprint className="w-3 h-3"/> {c.cliente.numero_documento}</p>
                           </div>
                         ) : (
                           <span className="text-slate-400 italic">Sin Titular (Huérfana)</span>
                         )}
                       </td>
                       <td className="px-6 py-4 whitespace-nowrap text-right">
                         <p className={`font-black tracking-tight ${esCredito && Number(c.saldo) > 0 ? "text-rose-600" : "text-slate-900"} text-lg`}>
                           {formatCurrency(Number(c.saldo))}
                         </p>
                         {esCredito && c.limite_credito && (
                            <p className="text-[11px] font-bold text-slate-400">CUPO: {formatCurrency(Number(c.limite_credito))}</p>
                         )}
                       </td>
                       <td className="px-6 py-4 whitespace-nowrap text-center">
                          {activa ? (
                            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold bg-emerald-100/50 text-emerald-700 border border-emerald-200 shadow-sm">
                              <ShieldCheck className="w-3.5 h-3.5" /> Activa
                            </span>
                          ) : (
                            <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold border shadow-sm ${
                              c.estado === 'INACTIVA' ? 'bg-slate-100 text-slate-600 border-slate-300' : 'bg-rose-100 text-rose-700 border-rose-200'
                            }`}>
                              <AlertCircle className="w-3.5 h-3.5" /> {c.estado?.toLowerCase() ?? "desconocido"}
                            </span>
                          )}
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
             <p className="text-sm font-bold text-slate-500">Mostrando {(page - 1) * PAGE_SIZE + 1} a {Math.min(page * PAGE_SIZE, totalCount)} de {totalCount} cuentas</p>
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
