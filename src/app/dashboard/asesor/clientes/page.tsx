import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Outfit } from "next/font/google";
import { Users, Search, ChevronRight, Fingerprint, MapPin, Mail, ChevronLeft } from "lucide-react";
import AnimatedCard from "@/components/dashboard/AnimatedCard";
import { ExportDataBtn } from "@/components/dashboard/ExportDataBtn";
import { SearchBox } from "@/components/dashboard/SearchInput";
import Link from "next/link";

const outfit = Outfit({ subsets: ["latin"], weight: ["700", "800", "900"] });

export default async function ClientesAsesor({ searchParams }: { searchParams: Promise<{ page?: string; q?: string }> }) {
  const session = await getServerSession(authOptions);

  const resolvedParams = await searchParams;
  const page = Math.max(1, parseInt(resolvedParams.page || "1", 10));
  const q = typeof resolvedParams.q === 'string' ? resolvedParams.q.trim() : "";
  const PAGE_SIZE = 100;
  const skip = (page - 1) * PAGE_SIZE;

  // Build search filter
  const whereFilter = q ? {
    OR: [
      { nombres: { contains: q, mode: "insensitive" as const } },
      { apellidos: { contains: q, mode: "insensitive" as const } },
      { numero_documento: { contains: q } },
      { email: { contains: q, mode: "insensitive" as const } },
    ]
  } : {};

  // 1. Total count for pagination math
  const totalCount = await prisma.cliente.count({ where: whereFilter });
  const totalPages = Math.ceil(totalCount / PAGE_SIZE);

  // 2. Query clients for the current UI page
  const clientes = await prisma.cliente.findMany({
    where: whereFilter,
    orderBy: { fecha_registro: "desc" },
    include: {
      barrio: { include: { comuna: { include: { municipio: true } } } }
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

  return (
    <div className="space-y-8 relative z-10 w-full max-w-6xl mx-auto pb-10">
      <div>
        <h1 className={`text-4xl font-black text-slate-900 tracking-tight ${outfit.className} flex items-center gap-3`}>
          <Users className="w-8 h-8 text-violet-600" />
          Directorio de Clientes
        </h1>
        <p className="text-slate-500 mt-2 text-lg">CRM: Consulta perfiles de clientes, antigüedad y ubicación registrada.</p>
      </div>

      <AnimatedCard className="flex flex-col bg-white/70">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-6">
          <SearchBox
            defaultValue={q}
            placeholder="Buscar por nombre, cédula o correo..."
          />
          <div className="flex items-center gap-4">
            <p className="text-sm font-bold text-slate-400 hidden sm:block">Página {page} de {totalPages || 1} • Total: {totalCount}</p>
            <ExportDataBtn 
              title="Reporte Histórico Total Directorio de Clientes"
              filename="Clientes_BancoUM_Total"
              columns={["ID Sistema", "Nombre Completo", "Identidad", "Correo", "Teléfono", "Fecha de Registro", "Ubicación"]}
              asesorData={asesorData}
              fetchUrl={`/api/export?type=clientes${q ? `&q=${encodeURIComponent(q)}` : ''}`}
            />
          </div>
        </div>

        <div className="flex-1 overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-inner">
          <table className="w-full text-left text-sm text-slate-600">
            <thead className="bg-slate-50/80 text-slate-500 border-b border-slate-200">
              <tr>
                <th className="px-6 py-4 font-bold text-xs uppercase tracking-wider">Cliente</th>
                <th className="px-6 py-4 font-bold text-xs uppercase tracking-wider">Identidad</th>
                <th className="px-6 py-4 font-bold text-xs uppercase tracking-wider">Contacto</th>
                <th className="px-6 py-4 font-bold text-xs uppercase tracking-wider">Antigüedad</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {clientes.length === 0 ? (
                <tr>
                  <td colSpan={5} className="text-center py-16 text-slate-500">
                    <p className="font-semibold">{q ? `Ningún cliente coincide con "${q}"` : "No hay clientes registrados en el sistema."}</p>
                  </td>
                </tr>
              ) : (
                clientes.map((c) => {
                  const ant = c.fecha_registro ? new Date(c.fecha_registro) : new Date();
                  const locacion = c.barrio ? `${c.barrio.nombre}, ${c.barrio.comuna.municipio.nombre}` : "No registrada";
                  
                  return (
                    <tr key={c.id_cliente} className="hover:bg-slate-50/60 transition-colors group cursor-pointer">
                       <td className="px-6 py-4 whitespace-nowrap">
                         <div className="flex items-center gap-3">
                           <div className="w-9 h-9 rounded-full bg-slate-100 flex items-center justify-center font-bold text-slate-500 text-xs shrink-0 group-hover:bg-violet-100 group-hover:text-violet-600 transition-colors">
                             {c.nombres.charAt(0)}{c.apellidos.charAt(0)}
                           </div>
                           <div>
                             <p className="font-bold text-slate-800">{c.nombres} {c.apellidos}</p>
                             <p className="text-[11px] text-emerald-600 font-bold capitalize mt-0.5">{c.activo ? "Activo" : "Inactivo"}</p>
                           </div>
                         </div>
                       </td>
                       <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-2 text-slate-600">
                            <Fingerprint className="w-4 h-4 text-slate-400" />
                            <div>
                               <span className="text-[11px] font-bold text-slate-400 mr-1">{c.tipo_documento}</span>
                               <span className="font-mono">{c.numero_documento}</span>
                            </div>
                          </div>
                       </td>
                       <td className="px-6 py-4">
                          <div className="flex flex-col gap-1.5 justify-center h-full">
                            {c.email && (
                               <div className="flex items-center gap-2 text-xs truncate max-w-xs">
                                 <Mail className="w-3.5 h-3.5 text-sky-400 shrink-0" />
                                 <span className="truncate">{c.email}</span>
                               </div>
                            )}
                            <div className="flex items-center gap-2 text-xs truncate max-w-xs">
                              <MapPin className="w-3.5 h-3.5 text-rose-400 shrink-0" />
                              <span className="truncate">{locacion}</span>
                            </div>
                          </div>
                       </td>
                       <td className="px-6 py-4 whitespace-nowrap">
                          <p className="font-semibold text-slate-700">{ant.toLocaleDateString()}</p>
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
             <p className="text-sm font-bold text-slate-500">Mostrando {(page - 1) * PAGE_SIZE + 1} a {Math.min(page * PAGE_SIZE, totalCount)} de {totalCount} registros</p>
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
