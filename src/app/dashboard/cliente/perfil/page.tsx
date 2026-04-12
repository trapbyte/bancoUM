import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Outfit } from "next/font/google";
import { User, Mail, Phone, MapPin, Calendar, ShieldCheck, Fingerprint } from "lucide-react";
import AnimatedCard from "@/components/dashboard/AnimatedCard";

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
          <User className="w-8 h-8 text-sky-600" />
          Mi Perfil
        </h1>
        <p className="text-slate-500 mt-2 text-lg">Consulta tu información personal y datos de contacto registrados.</p>
      </div>

      <AnimatedCard className="bg-white/70 overflow-hidden !p-0">
         {/* Cover Background */}
         <div className="h-32 bg-gradient-to-r from-violet-600 to-sky-600 w-full opacity-90 relative">
            <div className="absolute inset-0 bg-white/10 backdrop-blur-sm" />
         </div>

         {/* Contenido Perfil */}
         <div className="px-8 pb-10 relative">
            {/* Avatar Flotante */}
            <div className="flex justify-between items-end -mt-12 mb-8">
               <div className="w-24 h-24 rounded-2xl bg-white p-1 shadow-lg shadow-black/10">
                  <div className="w-full h-full bg-slate-100 rounded-xl flex items-center justify-center text-3xl font-black text-slate-400">
                    {perfil.nombres.charAt(0)}{perfil.apellidos.charAt(0)}
                  </div>
               </div>
               {perfil.activo && (
                  <span className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-700 border border-emerald-200">
                    <ShieldCheck className="w-4 h-4" /> Usuario Verificado
                  </span>
               )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-8">
               {/* Columna Izquierda: Datos Identity */}
               <div className="space-y-6">
                 <div>
                   <h2 className="text-2xl font-black text-slate-900">{perfil.nombres} {perfil.apellidos}</h2>
                   <p className="text-slate-500 font-medium">Cliente BancoUM desde {perfil.fecha_registro ? new Date(perfil.fecha_registro).getFullYear() : 'N/A'}</p>
                 </div>
                 
                 <div className="space-y-4">
                    <div className="flex items-center gap-4 p-3 rounded-xl hover:bg-slate-50 transition-colors">
                      <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center shrink-0">
                        <Fingerprint className="w-5 h-5 text-slate-500" />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Documento ({perfil.tipo_documento})</p>
                        <p className="font-semibold text-slate-800">{perfil.numero_documento}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-4 p-3 rounded-xl hover:bg-slate-50 transition-colors">
                      <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center shrink-0">
                        <Calendar className="w-5 h-5 text-slate-500" />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Fecha de Nacimiento</p>
                        <p className="font-semibold text-slate-800">
                          {new Date(perfil.fecha_nacimiento).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric'})}
                        </p>
                      </div>
                    </div>
                 </div>
               </div>

               {/* Columna Derecha: Contacto */}
               <div className="space-y-4 mt-2 md:mt-14">
                  <div className="flex items-center gap-4 p-3 rounded-xl hover:bg-slate-50 transition-colors">
                     <div className="w-10 h-10 rounded-full bg-sky-50 flex items-center justify-center shrink-0 text-sky-600">
                       <Mail className="w-5 h-5" />
                     </div>
                     <div className="min-w-0">
                       <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Correo Electrónico</p>
                       <p className="font-semibold text-slate-800 truncate">{perfil.email || "No registrado"}</p>
                     </div>
                  </div>

                  <div className="flex items-center gap-4 p-3 rounded-xl hover:bg-slate-50 transition-colors">
                     <div className="w-10 h-10 rounded-full bg-emerald-50 flex items-center justify-center shrink-0 text-emerald-600">
                       <Phone className="w-5 h-5" />
                     </div>
                     <div>
                       <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Teléfono de Contacto</p>
                       <p className="font-semibold text-slate-800">{perfil.telefono || "No registrado"}</p>
                     </div>
                  </div>

                  <div className="flex items-center gap-4 p-3 rounded-xl hover:bg-slate-50 transition-colors">
                     <div className="w-10 h-10 rounded-full bg-rose-50 flex items-center justify-center shrink-0 text-rose-600">
                       <MapPin className="w-5 h-5" />
                     </div>
                     <div>
                       <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Lugar de Residencia</p>
                       <p className="font-semibold text-slate-800 break-words">{ubicacionCompleta}</p>
                     </div>
                  </div>
               </div>
            </div>
         </div>
      </AnimatedCard>

      <div className="text-center">
         <p className="text-sm text-slate-500">¿Encontraste un error en tus datos? <a href="#" className="font-bold text-violet-600 hover:text-violet-700 underline underline-offset-2">Solicita una actualización de perfil</a>.</p>
      </div>

    </div>
  );
}
