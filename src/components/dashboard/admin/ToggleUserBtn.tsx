"use client";

import { useState } from "react";
import { Trash2, Trash, RefreshCw } from "lucide-react";
import { toggleEmpleadoStatusAction } from "@/app/dashboard/admin/usuarios/actions";

export function ToggleUserBtn({ idEmpleado, isActivo }: { idEmpleado: number, isActivo: boolean }) {
  const [loading, setLoading] = useState(false);

  const handleToggle = async () => {
    setLoading(true);
    try {
      await toggleEmpleadoStatusAction(idEmpleado, isActivo);
    } catch (e) {
      alert("Error al cambiar estado del empleado.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <button 
      onClick={handleToggle}
      disabled={loading}
      className={`p-2 rounded-lg transition-colors ${
        isActivo 
          ? "text-slate-400 hover:text-rose-500 hover:bg-rose-50" 
          : "text-slate-400 hover:text-emerald-500 hover:bg-emerald-50"
      }`} 
      title={isActivo ? "Suspender Usuario" : "Activar Usuario"}
    >
      {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : 
        (isActivo ? <Trash2 className="w-4 h-4" /> : <RefreshCw className="w-4 h-4" />)
      }
    </button>
  );
}
