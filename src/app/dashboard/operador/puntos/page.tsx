import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Outfit } from "next/font/google";
import { Building2 } from "lucide-react";
import { PuntoCard } from "@/components/dashboard/operador/PuntoCard";

const outfit = Outfit({ subsets: ["latin"], weight: ["700", "800", "900"] });

export default async function PuntosAtencionOperador() {
  await getServerSession(authOptions);

  // ── Database Queries ──────────────────────────────────────────────────
  const puntosAtencion = await prisma.punto_atencion.findMany({
    orderBy: { tipo: "asc" },
    include: {
      barrio: {
        include: { comuna: { include: { municipio: { include: { departamento: true } } } } }
      },
      empleado_punto: {
        include: { empleado: { select: { nombres: true, apellidos: true, cargo: true } } },
        where: { empleado: { activo: true } }
      }
    }
  });

  return (
    <div className="space-y-8 relative z-10 w-full max-w-6xl mx-auto pb-10">
      <div>
        <h1 className={`text-4xl font-black text-slate-900 tracking-tight ${outfit.className} flex items-center gap-3`}>
          <Building2 className="w-8 h-8 text-emerald-600" />
          Infraestructura Física
        </h1>
        <p className="text-slate-500 mt-2 text-lg">Módulo de control para sucursales corporativas y Cajeros Automáticos (ATM).</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {puntosAtencion.length === 0 ? (
          <div className="md:col-span-3 py-16 flex flex-col items-center justify-center border-2 border-dashed border-slate-200 rounded-3xl bg-white/50 backdrop-blur-sm">
             <Building2 className="w-12 h-12 text-slate-300 mb-4" />
             <p className="text-lg font-bold text-slate-600">No hay infraestructuras registradas.</p>
          </div>
        ) : (
          puntosAtencion.map((punto, idx) => {
            const empleadosAsignados = punto.empleado_punto.map((ep: any) => ep.empleado);
            return (
              <PuntoCard 
                key={punto.id_punto} 
                punto={punto} 
                idx={idx} 
                empleadosAsignados={empleadosAsignados} 
              />
            );
          })
        )}
      </div>
    </div>
  );
}
