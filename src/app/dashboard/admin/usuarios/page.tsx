import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Outfit } from "next/font/google";
import { ShieldAlert, Users, Key, MonitorDot, MoreVertical, Edit, Trash2 } from "lucide-react";
import AnimatedCard from "@/components/dashboard/AnimatedCard";

const outfit = Outfit({ subsets: ["latin"], weight: ["700", "800", "900"] });

export default async function UsuariosAdmin() {
  await getServerSession(authOptions);

  // ── Database Queries ──────────────────────────────────────────────────
  // Gestor global de usuarios del sistema (Clientes y Empleados de alta jerarquía)
  // Para la demo, nos enfocamos en el control del Staff (Empleados)
  const usuarios = await prisma.empleado.findMany({
    orderBy: { fecha_contratacion: "asc" },
  });

  return (
    <div className="space-y-8 relative z-10 w-full max-w-6xl mx-auto pb-10">
      <div>
        <h1 className={`text-4xl font-black text-slate-900 tracking-tight ${outfit.className} flex items-center gap-3`}>
          <Users className="w-8 h-8 text-sky-600" />
          Control de Accesos (IAM)
        </h1>
        <p className="text-slate-500 mt-2 text-lg">Administración de identidad, roles de seguridad y credenciales maestras.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        <AnimatedCard delay={0.1} className="bg-white/70">
           <div className="flex items-center gap-4 mb-2">
              <div className="w-10 h-10 rounded-lg bg-sky-100 flex items-center justify-center">
                <MonitorDot className="w-5 h-5 text-sky-600" />
              </div>
              <div>
                <p className="text-sm font-bold text-slate-500">Sesiones Activas</p>
                <p className="text-2xl font-black text-slate-800">24 / 45</p>
              </div>
           </div>
        </AnimatedCard>

        <AnimatedCard delay={0.2} className="bg-white/70">
           <div className="flex items-center gap-4 mb-2">
              <div className="w-10 h-10 rounded-lg bg-rose-100 flex items-center justify-center">
                <ShieldAlert className="w-5 h-5 text-rose-600" />
              </div>
              <div>
                <p className="text-sm font-bold text-slate-500">Alertas IAM</p>
                <p className="text-2xl font-black text-slate-800">0 Críticas</p>
              </div>
           </div>
        </AnimatedCard>

        <AnimatedCard delay={0.3} className="bg-white/70 flex flex-col justify-center">
           <button className="w-full py-3 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl shadow transition-colors flex items-center justify-center gap-2">
             <Key className="w-4 h-4" /> Forzar Rotación de Contraseñas
           </button>
        </AnimatedCard>
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
                            <button className="p-2 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition-colors" title="Forzar Suspensión">
                              <Trash2 className="w-4 h-4" />
                            </button>
                         </div>
                      </td>
                    </tr>
                 )
               })}
            </tbody>
          </table>
        </div>
      </AnimatedCard>
    </div>
  );
}
