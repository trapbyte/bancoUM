"use client";

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { CheckSquare, X, Save, ShieldCheck, Loader2 } from "lucide-react";
import { updateTipoCuentaAction } from "@/app/dashboard/operador/catalogos/actions";

export function TipoCuentaCard({ tcp }: { tcp: any }) {
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  
  const [tasa, setTasa] = useState(tcp.tasa_interes ? String(tcp.tasa_interes) : "");
  const [cuota, setCuota] = useState(tcp.cuota_manejo ? String(tcp.cuota_manejo) : "");
  const [sobregiro, setSobregiro] = useState(tcp.permite_sobregiro || false);

  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      const parsedTasa = tasa.trim() ? parseFloat(tasa) : null;
      const parsedCuota = cuota.trim() ? parseFloat(cuota) : null;
      await updateTipoCuentaAction(tcp.id_tipo_cuenta, parsedTasa, parsedCuota, sobregiro);
      setIsEditing(false);
    } catch (err) {
      alert("Error al guardar las reglas");
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <div className="flex flex-col bg-slate-50 border border-slate-200 p-3 rounded-xl shadow-sm hover:border-violet-300 transition-colors group">
        <div className="flex justify-between items-center mb-1">
           <p className="font-black text-slate-800 text-sm flex items-center gap-1.5">
             <CheckSquare className="w-4 h-4 text-emerald-500" /> {tcp.tipo.replace(/_/g, " ")}
           </p>
           <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 bg-slate-200 text-slate-500 rounded tracking-widest">ID {tcp.id_tipo_cuenta}</span>
        </div>
        <div className="text-[11px] text-slate-500 leading-snug mb-2 font-mono font-semibold flex flex-col gap-0.5">
           <p>Tasa: {tcp.tasa_interes ? `${tcp.tasa_interes}%` : 'N/A'} | Manejo: {tcp.cuota_manejo ? `$${Number(tcp.cuota_manejo).toLocaleString('es-CO')}` : 'Exento'}</p>
           <p>Sobregiro: {tcp.permite_sobregiro ? 'Permitido' : 'No Permitido'}</p>
        </div>
        <button 
          onClick={() => setIsEditing(true)}
          className="self-end px-2.5 py-1 text-[10px] font-bold tracking-widest uppercase bg-white border border-slate-200 rounded-md shadow-sm text-slate-600 hover:text-violet-600 hover:border-violet-300 transition-colors cursor-pointer"
        >
           Editar
        </button>
      </div>

      {isEditing && mounted && createPortal(
        <div className="fixed inset-0 z-[99999] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
             <div className="p-6 bg-gradient-to-r from-slate-900 to-slate-800 text-white flex justify-between items-center">
                <div>
                  <h3 className="text-xl font-black capitalize">{tcp.tipo.toLowerCase().replace(/_/g, " ")}</h3>
                  <p className="text-xs text-slate-400 font-mono mt-1 tracking-widest uppercase">Motor de Políticas KYC</p>
                </div>
                <button onClick={() => !saving && setIsEditing(false)} className="p-2 hover:bg-white/20 rounded-xl transition-colors">
                  <X className="w-5 h-5 text-slate-300" />
                </button>
             </div>
             
             <div className="p-6 space-y-5">
               <div>
                  <label className="block text-sm font-semibold text-slate-700 ml-1 tracking-wider mb-1.5">
                    Tasa de Interés (%)
                  </label>
                  <input 
                    type="number"
                    step="0.01"
                    value={tasa}
                    onChange={(e) => setTasa(e.target.value)}
                    placeholder="Ej. 1.25"
                    className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:ring-2 focus:ring-violet-500"
                  />
                  <p className="text-[10px] text-slate-400 mt-1">Dejar en blanco si no aplica.</p>
               </div>

               <div>
                  <label className="block text-sm font-semibold text-slate-700 ml-1 tracking-wider mb-1.5">
                    Cuota de Manejo (COP)
                  </label>
                  <input 
                    type="number"
                    value={cuota}
                    onChange={(e) => setCuota(e.target.value)}
                    placeholder="Ej. 15000"
                    className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:ring-2 focus:ring-violet-500"
                  />
                  <p className="text-[10px] text-slate-400 mt-1">Dejar en 0 o vacío para exención mensual.</p>
               </div>

               <div className="flex items-center justify-between p-4 border border-slate-200 rounded-xl bg-slate-50">
                 <div>
                    <label className="block text-sm font-bold text-slate-700">Permitir Sobregiro</label>
                    <p className="text-xs text-slate-500">¿Puede sobregirarse al 0 o debe bloquearse?</p>
                 </div>
                 <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" className="sr-only peer" checked={sobregiro} onChange={(e) => setSobregiro(e.target.checked)} />
                    <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-violet-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500"></div>
                 </label>
               </div>
             </div>

             <div className="p-4 border-t border-slate-100 bg-slate-50 flex justify-end gap-2">
                 <button onClick={() => !saving && setIsEditing(false)} className="px-4 py-2 text-sm font-bold text-slate-600 hover:text-slate-800 transition-colors rounded-xl cursor-pointer bg-slate-200 hover:bg-slate-300">Cancelar</button>
                 <button onClick={handleSave} disabled={saving} className="px-6 py-2 bg-violet-600 hover:bg-violet-700 text-white text-sm font-bold rounded-xl shadow-[0_4px_14px_rgba(124,58,237,0.4)] transition-all flex items-center gap-2">
                    {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                    Guardar Reglas
                 </button>
             </div>
          </div>
        </div>,
        document.body
      )}
    </>
  );
}
