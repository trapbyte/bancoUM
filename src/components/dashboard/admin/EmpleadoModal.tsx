"use client";

import { useTransition, useState, useEffect } from "react";
import { upsertEmpleadoAction } from "@/app/dashboard/admin/usuarios/actions";
import { UserPlus, UserCircle, X, MapPin, Building, Key } from "lucide-react";
import { createPortal } from "react-dom";

interface PuntoAtencion {
  id_punto: number;
  tipo: string;
  direccion: string;
}

export function EmpleadoModal({ 
  userToEdit, 
  puntosDisponibles = [],
  onClose 
}: { 
  userToEdit?: any; 
  puntosDisponibles?: PuntoAtencion[];
  onClose: () => void;
}) {
  const [isPending, startTransition] = useTransition();
  const [errorStr, setErrorStr] = useState("");
  
  const [nombres, setNombres] = useState(userToEdit?.nombres || "");
  const [apellidos, setApellidos] = useState(userToEdit?.apellidos || "");
  const [tipo_documento, setTipoDoc] = useState(userToEdit?.tipo_documento || "CC");
  const [numero_documento, setNumDoc] = useState(userToEdit?.numero_documento || "");
  const [email, setEmail] = useState(userToEdit?.email || "");
  
  // Normalize missing cargo depending on context
  const initialCargo = userToEdit?.cargo || "Gerente";
  const [cargo, setCargo] = useState(initialCargo);
  const initialPunto = userToEdit?.empleado_punto?.[0]?.id_punto || "";
  const [idPunto, setIdPunto] = useState<number | "">(initialPunto);

  // Hydration state for createPortal
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const requiresPunto = ["CAJERO", "ASESOR", "DIRECTOR_SUCURSAL"].includes(cargo.toUpperCase());

  const handleSave = () => {
    if(!nombres || !apellidos || !numero_documento || !email || !cargo) {
        setErrorStr("Por favor completa los campos obligatorios.");
        return;
    }
    
    if(requiresPunto && !idPunto) {
        setErrorStr("El cargo seleccionado requiere estar adscrito a una Sucursal o Punto físico.");
        return;
    }

    startTransition(async () => {
      try {
        await upsertEmpleadoAction({
          id_empleado: userToEdit?.id_empleado,
          nombres,
          apellidos,
          tipo_documento,
          numero_documento,
          email,
          cargo,
          id_punto: requiresPunto && idPunto ? Number(idPunto) : undefined,
        });
        onClose();
      } catch (err: any) {
        setErrorStr(err.message || "Error al procesar. Verifica que el DNI o Email no esté duplicado.");
      }
    });
  };

  const ModalContent = (
    <div className="fixed inset-0 z-[9999] bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl w-full max-w-2xl max-h-[90vh] overflow-auto shadow-2xl flex flex-col relative animate-in fade-in zoom-in duration-200">
        
        {/* Header Modal */}
        <div className="px-6 py-5 border-b border-slate-100 flex justify-between items-center bg-slate-50 rounded-t-3xl sticky top-0 z-10">
           <div className="flex items-center gap-3">
             <div className="w-10 h-10 rounded-xl bg-violet-100 flex items-center justify-center">
               {userToEdit ? <UserCircle className="w-5 h-5 text-violet-600" /> : <UserPlus className="w-5 h-5 text-violet-600" />}
             </div>
             <div>
                <h3 className="font-bold text-slate-800 text-lg">
                  {userToEdit ? "Edición de Credencial IAM" : "Registro de Nuevo Ingreso"}
                </h3>
                <p className="text-xs font-bold text-slate-500">Global Corporate Directory</p>
             </div>
           </div>
           
           <button onClick={onClose} className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center text-slate-500 hover:bg-rose-100 hover:text-rose-500 transition-colors">
              <X className="w-4 h-4" />
           </button>
        </div>

        {/* Body Modal */}
        <div className="p-6 space-y-6">
           {errorStr && (
             <div className="p-3 bg-rose-50 text-rose-600 border border-rose-200 rounded-xl text-sm font-bold flex items-center gap-2">
                 <X className="w-4 h-4 shrink-0" /> {errorStr}
             </div>
           )}

           {!userToEdit && (
             <div className="p-4 bg-sky-50 text-sky-700 border border-sky-100 rounded-xl text-xs font-bold flex items-start gap-3">
                 <Key className="w-5 h-5 shrink-0 mt-0.5" /> 
                 <p>La contraseña inicial del sistema será automáticamente el exacto <b>Número de Documento (DNI)</b> ingresado. El usuario podrá cambiarla posteriormente.</p>
             </div>
           )}

           <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                 <label className="text-xs font-bold text-slate-500 uppercase">Nombres</label>
                 <input type="text" value={nombres} onChange={e => setNombres(e.target.value)} className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-800 font-bold focus:outline-none focus:border-violet-500" placeholder="Ej. Juan Carlos" />
              </div>
              <div className="space-y-1">
                 <label className="text-xs font-bold text-slate-500 uppercase">Apellidos</label>
                 <input type="text" value={apellidos} onChange={e => setApellidos(e.target.value)} className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-800 font-bold focus:outline-none focus:border-violet-500" placeholder="Ej. Pérez Gómez" />
              </div>
           </div>

           <div className="grid grid-cols-3 gap-4">
              <div className="space-y-1">
                 <label className="text-xs font-bold text-slate-500 uppercase">Tipo ID</label>
                 <select value={tipo_documento} onChange={e => setTipoDoc(e.target.value)} className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-800 font-bold focus:outline-none focus:border-violet-500">
                    <option value="CC">Cédula</option>
                    <option value="CE">Cédula Ex.</option>
                    <option value="PASAPORTE">Pasaporte</option>
                 </select>
              </div>
              <div className="col-span-2 space-y-1">
                 <label className="text-xs font-bold text-slate-500 uppercase">Número DNI</label>
                 <input type="text" value={numero_documento} onChange={e => setNumDoc(e.target.value)} className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-800 font-bold focus:outline-none focus:border-violet-500" placeholder="Omitir puntos y comas" />
              </div>
           </div>

           <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                 <label className="text-xs font-bold text-slate-500 uppercase">Correo Corporativo</label>
                 <input type="email" value={email} onChange={e => setEmail(e.target.value)} className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-800 font-bold focus:outline-none focus:border-violet-500" placeholder="email@bancoum.com" />
              </div>
              <div className="space-y-1">
                 <label className="text-xs font-bold text-slate-500 uppercase flex items-center gap-1">
                    <Building className="w-3.5 h-3.5" /> Rol Organizacional
                 </label>
                 <select value={cargo} onChange={e => setCargo(e.target.value)} className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-800 font-black focus:outline-none focus:border-violet-500">
                    <option value="Gerente_General">Gerente General</option>
                    <option value="SysAdmin">Administrador (SysAdmin)</option>
                    <option value="Operador_Backoffice">Operador BackOffice</option>
                    <option value="Director_Sucursal">Director de Sucursal</option>
                    <option value="Asesor">Asesor Bancario</option>
                    <option value="Cajero">Cajero Físico</option>
                    <option value="Soporte_IT">Ingeniero de Soporte</option>
                 </select>
              </div>
           </div>

           {requiresPunto && (
             <div className="space-y-1 pt-4 border-t border-slate-100">
                <label className="text-xs font-bold text-slate-500 uppercase flex items-center gap-1">
                   <MapPin className="w-3.5 h-3.5 text-rose-500" /> Adscripción Dinámica (Sucursal Obligatoria)
                </label>
                <select value={idPunto} onChange={e => setIdPunto(e.target.value ? Number(e.target.value) : "")} className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-800 font-bold focus:outline-none focus:border-violet-500">
                   <option value="">-- SELECCIONA EL PUNTO DE TRABAJO --</option>
                   {puntosDisponibles.map(p => (
                       <option key={p.id_punto} value={p.id_punto}>
                          [{p.tipo.replace("_", " ")}] {p.direccion}
                       </option>
                   ))}
                </select>
             </div>
           )}

        </div>

        {/* Footer actions */}
        <div className="px-6 py-4 border-t border-slate-100 bg-slate-50 rounded-b-3xl flex justify-end gap-3">
           <button onClick={onClose} disabled={isPending} className="px-4 py-2 bg-white border border-slate-200 rounded-lg text-slate-600 font-bold text-sm hover:bg-slate-100 transition-colors">
              Cancelar
           </button>
           <button onClick={handleSave} disabled={isPending} className="px-6 py-2 bg-violet-600 hover:bg-violet-700 text-white rounded-lg font-bold text-sm shadow-md transition-all flex items-center gap-2">
              {isPending ? "Procesando DB..." : "Guardar Registro"}
           </button>
        </div>

      </div>
    </div>
  );

  if (!mounted) return null;
  return createPortal(ModalContent, document.body);
}
