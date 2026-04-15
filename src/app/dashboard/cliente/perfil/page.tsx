import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Outfit } from "next/font/google";
import { User, Mail, Phone, MapPin, Calendar, ShieldCheck, Fingerprint } from "lucide-react";
import AnimatedCard from "@/components/dashboard/AnimatedCard";
import EditarPerfilBtn from "@/components/dashboard/cliente/EditarPerfilBtn";

const outfit = Outfit({ subsets: ["latin"], weight: ["700", "800", "900"] });

export default async function PerfilCliente() {
  const session = await getServerSession(authOptions);
  const userId = parseInt(session?.user?.id ?? "0", 10);

  // ── Database Queries ──────────────────────────────────────────────────
  const perfil = await prisma.cliente.findUnique({
    where: { id_cliente: userId },
    include: {
      barrio: {
        include: {
          comuna: {
            include: {
              municipio: {
                include: { departamento: true }
              }
            }
          }
        }
      }
    }
  });

  if (!perfil) {
    return <div className="p-10 text-center text-slate-500 font-bold">Perfil no encontrado.</div>;
  }

  const ubicacionCompleta = perfil.barrio 
    ? `${perfil.barrio.nombre}, ${perfil.barrio.comuna.municipio.nombre} (${perfil.barrio.comuna.municipio.departamento.nombre})`
    : "Dirección no registrada";

  return (
    <div className="space-y-8 relative z-10 w-full max-w-4xl mx-auto pb-10">
      {/* Encabezado */}
      <div>
        <h1 className={`text-4xl font-black text-slate-900 tracking-tight ${outfit.className} flex items-center gap-3`}>
          <User className="w-8 h-8 text-violet-600" />
          Mi Perfil
        </h1>
        <p className="text-slate-500 mt-2 text-lg">Consulta tu información personal y datos de contacto registrados.</p>
      </div>

      <AnimatedCard className="bg-white/80 overflow-hidden p-0! border border-slate-100/50 shadow-xl shadow-slate-200/40">
         {/* Cover Background */}
         <div className="h-40 bg-linear-to-br from-violet-700 via-violet-600 to-indigo-600 w-full relative overflow-hidden">
            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10 mix-blend-overlay" />
            <div className="absolute inset-0 bg-linear-to-b from-black/0 via-black/5 to-black/20" />
            <div className="absolute top-0 right-0 w-125 h-125 bg-white/10 rounded-full blur-[80px] -translate-y-1/2 translate-x-1/3" />
         </div>

         {/* Contenido Perfil */}
         <div className="px-6 md:px-10 pb-12 relative flex flex-col items-center">
            {/* Avatar Flotante Centrado */}
            <div className="-mt-20 mb-5 relative group">
               <div className="w-36 h-36 rounded-3xl bg-white p-2 shadow-xl shadow-indigo-900/10 relative z-10 transition-transform group-hover:scale-105 duration-300 mx-auto">
                 <div className="w-full h-full bg-linear-to-br from-slate-50 to-slate-100 rounded-2xl flex items-center justify-center text-5xl font-black text-slate-300 border border-slate-200/50 shadow-inner overflow-hidden relative">
                   <span className="bg-clip-text text-transparent bg-linear-to-br from-violet-500 to-indigo-500">
                     {perfil.nombres.charAt(0)}{perfil.apellidos.charAt(0)}
                   </span>
                 </div>
               </div>
               {/* Glow Trasero */}
               <div className="absolute inset-0 bg-violet-500 rounded-3xl blur-2xl opacity-0 group-hover:opacity-40 transition-opacity duration-500 z-0" />
            </div>

            {/* Info Central */}
            <div className="text-center mb-10 w-full space-y-3">
               <h2 className={`text-4xl font-black text-slate-900 tracking-tight ${outfit.className}`}>{perfil.nombres} {perfil.apellidos}</h2>
               <div className="flex items-center justify-center gap-3 flex-wrap">
                  {perfil.activo && (
                     <span className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-sm font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 shadow-sm">
                       <ShieldCheck className="w-4 h-4" /> Cliente Verificado
                     </span>
                  )}
                  <span className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-sm font-bold bg-slate-50 text-slate-600 border border-slate-200 shadow-sm">
                    Miembro desde {perfil.fecha_registro ? new Date(perfil.fecha_registro).getFullYear() : 'N/A'}
                  </span>
               </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full max-w-4xl mx-auto">
               {/* Columna Izquierda: Datos Identity */}
               <div className="space-y-4">
                 <h3 className={`text-lg font-bold text-slate-800 border-b border-slate-100 pb-2 mb-4 ${outfit.className}`}>
                   Identidad
                 </h3>
                 
                 <div className="flex items-center gap-4 p-4 rounded-2xl bg-white border border-slate-100 shadow-sm hover:border-violet-200 hover:shadow-md hover:shadow-violet-100/50 transition-all group">
                   <div className="w-12 h-12 rounded-xl bg-violet-50 border border-violet-100 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                     <Fingerprint className="w-6 h-6 text-violet-600" />
                   </div>
                   <div>
                     <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Documento de Identidad ({perfil.tipo_documento})</p>
                     <p className="font-black text-slate-800 text-lg">{perfil.numero_documento}</p>
                   </div>
                 </div>

                 <div className="flex items-center gap-4 p-4 rounded-2xl bg-white border border-slate-100 shadow-sm hover:border-indigo-200 hover:shadow-md hover:shadow-indigo-100/50 transition-all group">
                   <div className="w-12 h-12 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                     <Calendar className="w-6 h-6 text-indigo-600" />
                   </div>
                   <div>
                     <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Fecha de Nacimiento</p>
                     <p className="font-black text-slate-800 text-lg">
                       {new Date(perfil.fecha_nacimiento).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric'})}
                     </p>
                   </div>
                 </div>
               </div>

               {/* Columna Derecha: Contacto */}
               <div className="space-y-4">
                 <h3 className={`text-lg font-bold text-slate-800 border-b border-slate-100 pb-2 mb-4 ${outfit.className}`}>
                   Contacto y Residencia
                 </h3>

                  <div className="flex items-center gap-4 p-4 rounded-2xl bg-white border border-slate-100 shadow-sm hover:border-violet-200 hover:shadow-md hover:shadow-violet-100/50 transition-all group">
                     <div className="w-12 h-12 rounded-xl bg-violet-50 border border-violet-100 flex items-center justify-center shrink-0 text-violet-600 group-hover:scale-110 transition-transform">
                       <Mail className="w-6 h-6" />
                     </div>
                     <div className="min-w-0">
                       <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Correo Electrónico</p>
                       <p className="font-semibold text-slate-800 truncate">{perfil.email || "No registrado"}</p>
                     </div>
                  </div>

                  <div className="flex items-center gap-4 p-4 rounded-2xl bg-white border border-slate-100 shadow-sm hover:border-indigo-200 hover:shadow-md hover:shadow-indigo-100/50 transition-all group">
                     <div className="w-12 h-12 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center shrink-0 text-indigo-600 group-hover:scale-110 transition-transform">
                       <Phone className="w-6 h-6" />
                     </div>
                     <div>
                       <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Teléfono de Contacto</p>
                       <p className="font-semibold text-slate-800">{perfil.telefono || "No registrado"}</p>
                     </div>
                  </div>

                  <div className="flex items-center gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-200 shadow-inner group">
                     <div className="w-12 h-12 rounded-xl bg-white border border-slate-200 flex items-center justify-center shrink-0 text-slate-500">
                       <MapPin className="w-6 h-6" />
                     </div>
                     <div>
                       <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Lugar de Residencia</p>
                       <p className="font-medium text-slate-700 wrap-break-word">{ubicacionCompleta}</p>
                     </div>
                  </div>
               </div>
            </div>
         </div>
      </AnimatedCard>

      <div className="text-center">
         <div className="text-sm text-slate-500">
           ¿Tus datos de contacto están desactualizados? <EditarPerfilBtn currentEmail={perfil.email || ""} currentPhone={perfil.telefono || ""} />
         </div>
      </div>

    </div>
  );
}
