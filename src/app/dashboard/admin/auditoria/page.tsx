import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Outfit } from "next/font/google";
import { Terminal, Search, Filter, RefreshCcw, Database } from "lucide-react";

const outfit = Outfit({ subsets: ["latin"], weight: ["700", "800", "900"] });

export default async function AuditoriaAdmin() {
  await getServerSession(authOptions);

  // ── Database Queries ──────────────────────────────────────────────────
  const auditorias = await prisma.auditoria_movimiento.findMany({
    orderBy: { fecha: "desc" },
    take: 150, // Carga masiva autorizada por ser vista Admin detallada
  });

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
        <div className="flex gap-2">
          <button className="px-4 py-2 border border-slate-200 bg-white text-slate-700 shadow-sm rounded-lg font-bold text-sm flex items-center gap-2 hover:bg-slate-50 transition-colors">
            <Filter className="w-4 h-4" /> Filtros
          </button>
          <button className="px-4 py-2 bg-slate-900 text-white shadow-sm rounded-lg font-bold text-sm flex items-center gap-2 hover:bg-slate-800 transition-colors">
            <RefreshCcw className="w-4 h-4" /> Recargar
          </button>
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
               <Database className="w-3.5 h-3.5" /> POSTGRESQL NATIVE LOG
             </p>
           </div>
           
           <div className="relative">
             <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
             <input type="text" placeholder="Grep query or User..." className="bg-slate-950/50 border border-slate-700 text-slate-300 text-xs font-mono pl-9 pr-3 py-1.5 rounded-md focus:outline-none focus:border-emerald-500 w-64" />
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
      </div>
    </div>
  );
}
