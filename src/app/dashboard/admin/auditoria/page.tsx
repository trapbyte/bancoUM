import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Outfit } from "next/font/google";
import Link from "next/link";
import { SearchBox } from "@/components/dashboard/SearchInput";
import { Terminal, Database, ChevronLeft, ChevronRight, RefreshCw } from "lucide-react";

const outfit = Outfit({ subsets: ["latin"], weight: ["700", "800", "900"] });

export default async function AuditoriaAdmin({ searchParams }: { searchParams: Promise<{ page?: string; q?: string }> }) {
  await getServerSession(authOptions);

  const resolvedParams = await searchParams;
  const page = Math.max(1, parseInt(resolvedParams.page || "1", 10));
  const q = typeof resolvedParams.q === 'string' ? resolvedParams.q.trim() : "";
  const PAGE_SIZE = 50;
  const skip = (page - 1) * PAGE_SIZE;

  // ── Database Queries ──────────────────────────────────────────────────
  const whereClause: any = q ? {
    OR: [
      { usuario_bd: { contains: q, mode: "insensitive" } },
      { accion: { contains: q, mode: "insensitive" } },
    ]
  } : {};

  // Verify if it's a number to allow exact id_auditoria search
  if(q && !isNaN(Number(q))) {
    whereClause.OR.push({ id_auditoria: BigInt(q) });
    whereClause.OR.push({ id_movimiento: BigInt(q) });
  }

  const [totalAuditorias, auditorias] = await Promise.all([
    prisma.auditoria_movimiento.count({ where: whereClause }),
    prisma.auditoria_movimiento.findMany({
      where: whereClause,
      orderBy: { fecha: "desc" },
      skip,
      take: PAGE_SIZE,
    })
  ]);

  const totalPages = Math.ceil(totalAuditorias / PAGE_SIZE);

  return (
    <div className="space-y-6 relative w-full h-full pb-10 flex flex-col p-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
        <div>
          <h1 className={`text-4xl font-black text-slate-900 tracking-tight ${outfit.className} flex items-center gap-3`}>
            <Terminal className="w-8 h-8 text-emerald-600" />
            Consola Maestra de Auditoría
          </h1>
          <p className="text-slate-500 mt-2 text-lg">Registro inmutable de acciones DML ejecutadas sobre el motor de Base de Datos.</p>
        </div>
        <div className="flex flex-col gap-2 w-full sm:w-auto">
          <div className="flex gap-2">
             <Link href="/dashboard/admin/auditoria" className="px-4 py-2 bg-slate-900 border border-slate-700 text-white shadow-sm rounded-lg font-bold text-sm flex items-center gap-2 hover:bg-slate-800 transition-colors">
               <RefreshCw className="w-4 h-4" /> Reset
             </Link>
             <div className="flex-1 w-full sm:w-64">
               <SearchBox placeholder="Grep ID, usuario, acción..." defaultValue={q} />
             </div>
          </div>
        </div>
      </div>

      <div className="flex-1 flex flex-col bg-slate-900 rounded-2xl border border-slate-800 shadow-xl overflow-hidden min-h-[600px] relative">
        {/* Cabecera Consola */}
        <div className="bg-slate-800/80 px-4 py-3 border-b border-slate-700 flex justify-between items-center z-10 sticky top-0 backdrop-blur-md">
           <div className="flex items-center gap-3">
             <div className="flex gap-1.5">
               <div className="w-3 h-3 rounded-full bg-rose-500"></div>
               <div className="w-3 h-3 rounded-full bg-amber-500"></div>
               <div className="w-3 h-3 rounded-full bg-emerald-500"></div>
             </div>
             <p className="text-xs font-mono text-slate-400 font-bold ml-2 flex items-center gap-2">
               <Database className="w-3.5 h-3.5" /> NATIVE NUCLEUS LOG
             </p>
             <span className="text-[10px] text-slate-500 ml-4 hidden sm:block">
                Mostrando {skip + 1} - {Math.min(skip + PAGE_SIZE, totalAuditorias)} de {totalAuditorias} logs
             </span>
           </div>
        </div>

        {/* Consola Body */}
        <div className="flex-1 overflow-auto p-1 bg-black/60">
           <table className="w-full text-left text-xs font-mono text-slate-300">
              <thead className="bg-slate-900/50 text-slate-500 sticky top-0 z-10 backdrop-blur border-b border-slate-800">
                <tr>
                  <th className="px-4 py-3 whitespace-nowrap">ID_AUDIT</th>
                  <th className="px-4 py-3 whitespace-nowrap">FECHA DE EJECUCIÓN (UTC)</th>
                  <th className="px-4 py-3 whitespace-nowrap">TRIGGER / TABLA</th>
                  <th className="px-4 py-3 whitespace-nowrap">SYS_USER</th>
                  <th className="px-4 py-3 whitespace-nowrap">ACCIÓN CIBERNÉTICA</th>
                  <th className="px-4 py-3 whitespace-nowrap">MOV. REFERENCIA</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {auditorias.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="text-center py-12 text-slate-600">-- NO LOGS FOUND --</td>
                  </tr>
                ) : (
                  auditorias.map((log) => (
                    <tr key={String(log.id_auditoria)} className="hover:bg-slate-800/40 transition-colors">
                      <td className="px-4 py-2.5 text-slate-500 font-bold">#{String(log.id_auditoria)}</td>
                      <td className="px-4 py-2.5 text-emerald-400/80">
                         {log.fecha ? new Date(log.fecha).toISOString().replace("T", " ").slice(0, 19) : "unknown_ts"}
                      </td>
                      <td className="px-4 py-2.5 text-slate-400 font-bold">public.movimiento</td>
                      <td className="px-4 py-2.5 text-sky-400 font-black">{log.usuario_bd || "root"}</td>
                      <td className="px-4 py-2.5">
                         <span className={`px-2 py-0.5 rounded uppercase font-black tracking-widest ${
                           log.accion === 'INSERT' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' :
                           log.accion === 'DELETE' ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20 shadow-[0_0_8px_rgba(244,63,94,0.4)] animate-pulse' :
                           log.accion === 'UPDATE' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' : 'bg-slate-700 text-slate-300'
                         }`}>
                           {log.accion}
                         </span>
                      </td>
                      <td className="px-4 py-2.5 text-slate-500">
                         <span className="bg-slate-800 px-2 py-1 rounded text-slate-400">ID_{String(log.id_movimiento)}</span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
           </table>
        </div>

        {/* Console Pagination */}
        {totalPages > 1 && (
          <div className="bg-slate-800/80 border-t border-slate-700 p-2 flex justify-between items-center z-10 w-full backdrop-blur-md">
            <span className="text-xs font-mono text-slate-400 pl-4">Pg {page} of {totalPages}</span>
            <div className="flex gap-1 pr-2">
              <Link
                href={page > 1 ? `/dashboard/admin/auditoria?page=${page - 1}${q ? `&q=${encodeURIComponent(q)}` : ""}` : "#"}
                className={`p-1 flex items-center justify-center rounded transition-colors ${
                  page > 1 ? "bg-slate-700 text-emerald-400 hover:bg-slate-600 hover:text-emerald-300" : "bg-slate-800 text-slate-600 cursor-not-allowed"
                }`}
              >
                <ChevronLeft className="w-5 h-5" />
              </Link>
              <Link
                href={page < totalPages ? `/dashboard/admin/auditoria?page=${page + 1}${q ? `&q=${encodeURIComponent(q)}` : ""}` : "#"}
                className={`p-1 flex items-center justify-center rounded transition-colors ${
                  page < totalPages ? "bg-slate-700 text-emerald-400 hover:bg-slate-600 hover:text-emerald-300" : "bg-slate-800 text-slate-600 cursor-not-allowed"
                }`}
              >
                <ChevronRight className="w-5 h-5" />
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
