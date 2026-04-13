"use client";

import { useState } from "react";
import { Building2, CreditCard, Power, MapPin, Clock, Settings2 } from "lucide-react";
import AnimatedCard from "@/components/dashboard/AnimatedCard";
import { PuntoModal } from "@/components/dashboard/operador/PuntoModal";
import { PuntoActionsMenu } from "@/components/dashboard/operador/PuntoActionsMenu";

interface PuntoCardProps {
  punto: any;
  idx: number;
  empleadosAsignados: any[];
}

export function PuntoCard({ punto, idx, empleadosAsignados }: PuntoCardProps) {
  const [modalOpen, setModalOpen] = useState(false);
  const isATM = punto.tipo === "CAJERO_AUTOMATICO";
  const activa = punto.activo !== false;
  const ubicacion = `${punto.barrio.nombre}, ${punto.barrio.comuna.municipio.nombre} (${punto.barrio.comuna.municipio.departamento.nombre})`;

  return (
    <>
      <AnimatedCard delay={idx * 0.05} className="flex flex-col h-full bg-white/70 overflow-hidden group border border-slate-100 hover:border-violet-200">
        <div className="flex items-start justify-between mb-4">
          <div className={`p-3 rounded-xl flex items-center justify-center shadow-inner ${
            isATM ? "bg-gradient-to-br from-sky-500 to-indigo-600 text-white" : "bg-gradient-to-br from-emerald-500 to-teal-600 text-white"
          }`}>
            {isATM ? <CreditCard className="w-6 h-6" /> : <Building2 className="w-6 h-6" />}
          </div>
          <div>
            {activa ? (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] uppercase tracking-widest font-bold bg-emerald-100/50 text-emerald-700 border border-emerald-200 shadow-sm transition-colors">
                <Power className="w-3 h-3" /> Conectado
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] uppercase tracking-widest font-bold bg-rose-100 text-rose-700 border border-rose-200 shadow-sm animate-pulse">
                <Power className="w-3 h-3" /> Fuera de red
              </span>
            )}
          </div>
        </div>

        <div className="flex-1 mb-6">
          <p className="text-xs font-bold text-slate-400 mb-0.5 tracking-widest uppercase">
            {punto.tipo.replace(/_/g, " ").replace(/\b\w/g, (c: string) => c.toUpperCase())}
          </p>
          <p className="text-xl font-black text-slate-800 tracking-tight leading-tight">{punto.nombre}</p>
          
          <div className="flex items-start gap-2 mt-4 text-slate-600 text-sm">
            <MapPin className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
            <p className="font-medium leading-snug">{ubicacion}</p>
          </div>
          <div className="flex items-center gap-2 mt-3 text-slate-500 text-xs font-medium">
            <Clock className="w-4 h-4 shrink-0" />
            Ingresado: {new Date(punto.fecha_apertura).toLocaleDateString()}
          </div>
        </div>

        <div className="pt-4 border-t border-slate-200/50 flex gap-2">
          <button 
            onClick={() => setModalOpen(true)}
            className="flex-1 flex gap-2 items-center justify-center bg-white border border-slate-200 shadow-sm hover:bg-slate-50 hover:text-emerald-600 text-slate-700 text-sm font-bold py-2 rounded-lg transition-colors"
          >
            Ubicación
          </button>
          
          <PuntoActionsMenu 
            puntoId={punto.id_punto} 
            nombrePunto={punto.nombre}
            activoActual={activa}
            empleados={empleadosAsignados}
          />
        </div>
      </AnimatedCard>

      {modalOpen && <PuntoModal punto={punto} onClose={() => setModalOpen(false)} />}
    </>
  );
}
