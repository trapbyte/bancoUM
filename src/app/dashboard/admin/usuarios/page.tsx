import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Outfit } from "next/font/google";
import Link from "next/link";
import { SearchBox } from "@/components/dashboard/SearchInput";
import { ExportDataBtn } from "@/components/dashboard/ExportDataBtn";
import { ToggleUserBtn } from "@/components/dashboard/admin/ToggleUserBtn";
import { ShieldAlert, Users, Key, MonitorDot, MoreVertical, Edit, Trash2, ChevronLeft, ChevronRight, UserCheck, ShieldCheck } from "lucide-react";
import AnimatedCard from "@/components/dashboard/AnimatedCard";

const outfit = Outfit({ subsets: ["latin"], weight: ["700", "800", "900"] });

export default async function UsuariosAdmin({ searchParams }: { searchParams: Promise<{ page?: string; q?: string }> }) {
  await getServerSession(authOptions);

  const resolvedParams = await searchParams;
  const page = Math.max(1, parseInt(resolvedParams.page || "1", 10));
  const q = typeof resolvedParams.q === 'string' ? resolvedParams.q.trim() : "";
  const PAGE_SIZE = 50;
  const skip = (page - 1) * PAGE_SIZE;

  // ── Database Queries ──────────────────────────────────────────────────
  const whereClause: any = q ? {
    OR: [
      { nombres: { contains: q, mode: "insensitive" } },
      { apellidos: { contains: q, mode: "insensitive" } },
      { cargo: { contains: q, mode: "insensitive" } },
      { email: { contains: q, mode: "insensitive" } },
      { numero_documento: { contains: q, mode: "insensitive" } },
    ]
  } : {};

  const [totalEmpleados, usuarios, totalClientes, gerentes] = await Promise.all([
    prisma.empleado.count({ where: whereClause }),
    prisma.empleado.findMany({
      where: whereClause,
      orderBy: { fecha_contratacion: "asc" },
      skip,
      take: PAGE_SIZE,
    }),
    prisma.cliente.count(),
    prisma.empleado.count({ where: { cargo: { contains: "Gerente", mode: "insensitive" }, activo: true } })
  ]);
  
  const totalPages = Math.ceil(totalEmpleados / PAGE_SIZE);

  return (
    <div className="space-y-8 relative z-10 w-full max-w-6xl mx-auto pb-10">
      <div>
        <h1 className={`text-4xl font-black text-slate-900 tracking-tight ${outfit.className} flex items-center gap-3`}>
          <Users className="w-8 h-8 text-sky-600" />
          Control de Accesos (IAM)
        </h1>
        <p className="text-slate-500 mt-2 text-lg">Administración de identidad, roles de seguridad y credenciales maestras.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <AnimatedCard delay={0.1} className="bg-white/70">
           <div className="flex items-center gap-4 mb-2">
              <div className="w-10 h-10 rounded-lg bg-sky-100 flex items-center justify-center">
                <Users className="w-5 h-5 text-sky-600" />
              </div>
              <div>
                <p className="text-sm font-bold text-slate-500">Personal (Staff)</p>
                <p className="text-2xl font-black text-slate-800">{totalEmpleados}</p>
              </div>
           </div>
        </AnimatedCard>

        <AnimatedCard delay={0.2} className="bg-white/70">
           <div className="flex items-center gap-4 mb-2">
              <div className="w-10 h-10 rounded-lg bg-indigo-100 flex items-center justify-center">
                <UserCheck className="w-5 h-5 text-indigo-600" />
              </div>
              <div>
                <p className="text-sm font-bold text-slate-500">Clientes Globales</p>
                <p className="text-2xl font-black text-slate-800">{totalClientes}</p>
              </div>
           </div>
        </AnimatedCard>

        <AnimatedCard delay={0.3} className="bg-white/70">
           <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-lg bg-rose-100 flex items-center justify-center">
                <ShieldCheck className="w-5 h-5 text-rose-600" />
              </div>
              <div>
                <p className="text-sm font-bold text-slate-500">Admins Niv. 1</p>
                <p className="text-2xl font-black text-slate-800">{gerentes}</p>
              </div>
           </div>
        </AnimatedCard>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 mb-6 justify-between items-center w-full">
         <div className="w-full sm:w-96">
            <SearchBox placeholder="Buscar por DNI, Nombre, Correo, o Cargo..." defaultValue={q} />
         </div>
         <ExportDataBtn 
            title="Exportar Reporte Global de Accesos IAM"
            filename="Accesos_BancoUM"
            columns={["DNI", "Nombre Completo", "Rol & Cargo", "Correo de Acceso", "Estado", "Antigüedad"]}
            data={usuarios.map(u => ({
               DNI: u.numero_documento, 
               "Nombre Completo": `${u.nombres} ${u.apellidos}`, 
               "Rol & Cargo": u.cargo.toUpperCase(), 
               "Correo de Acceso": u.email || "N/A", 
               Estado: u.activo ? "AUTORIZADO" : "BLOQUEADO", 
               "Antigüedad": new Date(u.fecha_contratacion).toLocaleDateString()
            }))}
            asesorData={{
               nombre: "SYSTEM",
               documento: "ADMIN",
               email: "sysadmin@bancoum.com",
               cargo: "Administrador Global"
            }}
         />
      </div>

      <AnimatedCard className="flex flex-col bg-white/70">
        <div className="px-6 py-5 border-b border-slate-200 bg-slate-50/50 rounded-t-2xl flex justify-between items-center">
          <h2 className="text-lg font-bold text-slate-800">Personal Global Autorizado</h2>
          <span className="px-3 py-1 bg-slate-200 text-slate-700 text-xs font-bold rounded-full">Lectura / Escritura</span>
        </div>
        
        <div className="flex-1 overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-600">
            <thead className="bg-white text-slate-400 border-b border-slate-200">
              <tr>
                <th className="px-6 py-4 font-bold text-xs uppercase tracking-wider">Identidad</th>
                <th className="px-6 py-4 font-bold text-xs uppercase tracking-wider">Cargo & Privilegios</th>
                <th className="px-6 py-4 font-bold text-xs uppercase tracking-wider text-center">Estado de Cuenta</th>
                <th className="px-6 py-4 text-center">Gestión</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
               {usuarios.map((user) => {
                 const esAdmin = user.cargo.toLowerCase().includes("gerente");
                 
                 return (
                    <tr key={user.id_empleado} className="hover:bg-slate-50/60 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                         <div className="flex items-center gap-3">
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-xs shrink-0 ${
                               esAdmin ? "bg-rose-100 text-rose-600 border border-rose-200" : "bg-slate-100 text-slate-600"
                            }`}>
                              {user.nombres.charAt(0)}{user.apellidos.charAt(0)}
                            </div>
                            <div>
                               <p className="font-bold text-slate-800">{user.nombres} {user.apellidos}</p>
                               <p className="text-[11px] text-slate-400 mt-0.5">{user.email}</p>
                            </div>
                         </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                         <span className={`inline-flex items-center px-2 py-1 rounded text-[10px] font-black uppercase tracking-widest ${
                            esAdmin ? "bg-rose-50 text-rose-700 border border-rose-200" : "bg-sky-50 text-sky-700 border border-sky-200"
                         }`}>
                           {user.cargo}
                         </span>
                         {esAdmin && <p className="text-[10px] text-rose-500 font-bold mt-1">NIVEL 1 - FULL ACCESS</p>}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                         {user.activo ? (
                           <span className="inline-flex max-w-max items-center px-3 py-1 bg-emerald-100/50 text-emerald-700 font-bold border border-emerald-200 rounded-full text-xs shadow-sm shadow-emerald-100">
                             Habilitado
                           </span>
                         ) : (
                           <span className="inline-flex max-w-max items-center px-3 py-1 bg-slate-100 text-slate-500 font-bold border border-slate-200 rounded-full text-xs">
                             Suspendido
                           </span>
                         )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right">
                         <div className="flex items-center justify-end gap-2">
                            <button className="p-2 text-slate-400 hover:text-amber-500 hover:bg-amber-50 rounded-lg transition-colors" title="Modificar Rol">
                              <Edit className="w-4 h-4" />
                            </button>
                            <ToggleUserBtn idEmpleado={user.id_empleado} isActivo={user.activo === true} />
                         </div>
                      </td>
                    </tr>
                 )
               })}
            </tbody>
          </table>
        </div>

        {/* IAM Pagination */}
        {totalPages > 1 && (
          <div className="px-6 py-4 border-t border-slate-200 bg-slate-50 flex justify-between items-center rounded-b-xl">
             <span className="text-sm text-slate-500 font-bold">
               Mostrando {skip + 1} - {Math.min(skip + PAGE_SIZE, totalEmpleados)} de {totalEmpleados} perfiles
             </span>
             <div className="flex gap-2">
               <Link 
                 href={page > 1 ? `/dashboard/admin/usuarios?page=${page - 1}${q ? `&q=${encodeURIComponent(q)}` : ""}` : "#"}
                 className={`px-3 py-1.5 rounded-lg border text-sm font-bold transition-colors ${page > 1 ? "border-slate-300 text-slate-700 hover:bg-slate-200" : "border-slate-200 text-slate-400 bg-slate-100 cursor-not-allowed"}`}
               >
                  <ChevronLeft className="w-4 h-4" />
               </Link>
               <Link 
                 href={page < totalPages ? `/dashboard/admin/usuarios?page=${page + 1}${q ? `&q=${encodeURIComponent(q)}` : ""}` : "#"}
                 className={`px-3 py-1.5 rounded-lg border text-sm font-bold transition-colors ${page < totalPages ? "border-slate-300 text-slate-700 hover:bg-slate-200" : "border-slate-200 text-slate-400 bg-slate-100 cursor-not-allowed"}`}
               >
                  <ChevronRight className="w-4 h-4" />
               </Link>
             </div>
          </div>
        )}
      </AnimatedCard>
    </div>
  );
}
