"use client";

import { useState, useRef, useEffect } from "react";
import { Settings2, Users, X, ToggleLeft, ToggleRight, Loader2, Building2 } from "lucide-react";
import { togglePuntoActivoAction } from "@/app/dashboard/operador/puntos/actions";

interface EmpleadoAsignado {
  nombres: string;
  apellidos: string;
  cargo: string;
}

interface PuntoActionsMenuProps {
  puntoId: number;
  nombrePunto: string;
  activoActual: boolean;
  empleados: EmpleadoAsignado[];
}

export function PuntoActionsMenu({ puntoId, nombrePunto, activoActual, empleados }: PuntoActionsMenuProps) {
  const [open, setOpen] = useState(false);
  const [showEmpleados, setShowEmpleados] = useState(false);
  const [activo, setActivo] = useState(activoActual);
  const [toggling, setToggling] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpen(false);
        setShowEmpleados(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleToggleActivo = async () => {
    setToggling(true);
    try {
      await togglePuntoActivoAction(puntoId, !activo);
      setActivo(!activo);
    } finally {
      setToggling(false);
      setOpen(false);
    }
  };

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => { setOpen(!open); setShowEmpleados(false); }}
        className="px-3 bg-white border border-slate-200 shadow-sm hover:bg-slate-50 hover:border-slate-300 text-slate-600 text-sm flex items-center justify-center rounded-lg transition-colors h-full min-h-[38px]"
        title="Acciones"
      >
        <Settings2 className={`w-4 h-4 transition-transform duration-200 ${open ? "rotate-45" : ""}`} />
      </button>

      {open && (
        <div className="absolute bottom-full right-0 mb-2 w-64 bg-white border border-slate-200 rounded-2xl shadow-xl z-50 overflow-hidden animate-in fade-in slide-in-from-bottom-2 duration-150">
          <div className="px-4 py-3 border-b border-slate-100 bg-slate-50">
            <p className="text-sm font-semibold text-slate-700 ml-1 tracking-widest">Gestión</p>
            <p className="text-sm font-bold text-slate-800 truncate mt-0.5">{nombrePunto}</p>
          </div>

          <div className="py-2">
            {/* Ver empleados asignados */}
            <button
              onClick={() => setShowEmpleados(!showEmpleados)}
              className="w-full flex items-center gap-3 px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
            >
              <div className="p-1.5 rounded-lg bg-sky-100 text-sky-600">
                <Users className="w-3.5 h-3.5" />
              </div>
              Empleados asignados
              <span className="ml-auto text-xs font-bold bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full">
                {empleados.length}
              </span>
            </button>

            {/* Lista de empleados */}
            {showEmpleados && (
              <div className="mx-3 mb-2 rounded-xl border border-slate-100 bg-slate-50 overflow-hidden">
                <div className="max-h-60 overflow-y-auto custom-scrollbar">
                  {empleados.length === 0 ? (
                    <p className="text-xs text-slate-500 text-center py-3 italic">Sin personal asignado</p>
                  ) : (
                    empleados.map((emp, i) => (
                      <div key={i} className="flex items-center gap-2.5 px-3 py-2 border-b border-slate-100 last:border-0 hover:bg-white transition-colors">
                        <div className="w-6 h-6 rounded bg-sky-100 flex items-center justify-center text-sky-700 font-bold text-[10px] shrink-0">
                          {emp.nombres.charAt(0)}{emp.apellidos.charAt(0)}
                        </div>
                        <div className="min-w-0">
                          <p className="text-xs font-bold text-slate-700 truncate">{emp.nombres} {emp.apellidos}</p>
                          <p className="text-[10px] text-slate-400 capitalize truncate">{emp.cargo.toLowerCase()}</p>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}

            {/* Cambiar estado */}
            <button
              onClick={handleToggleActivo}
              disabled={toggling}
              className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm font-semibold transition-colors ${activo ? "text-rose-700 hover:bg-rose-50" : "text-emerald-700 hover:bg-emerald-50"}`}
            >
              {toggling ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : activo ? (
                <div className="p-1.5 rounded-lg bg-rose-100 text-rose-600">
                  <ToggleLeft className="w-3.5 h-3.5" />
                </div>
              ) : (
                <div className="p-1.5 rounded-lg bg-emerald-100 text-emerald-600">
                  <ToggleRight className="w-3.5 h-3.5" />
                </div>
              )}
              {activo ? "Poner fuera de servicio" : "Poner en servicio"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
