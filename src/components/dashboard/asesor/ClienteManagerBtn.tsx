"use client";

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { upsertClienteAdmin, toggleActivoCliente } from "@/app/dashboard/asesor/clientes/actions";
import { ChevronRight, UserPlus, Eye, Power, Save, X, Edit, Lock, Mail, Phone, Calendar, Search } from "lucide-react";

export default function ClienteManagerRow({
  cliente,
  children,
  barrios
}: {
  cliente?: any;
  children?: React.ReactNode;
  barrios?: any[];
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const isNew = !cliente;

  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }
    return () => {
      document.body.style.overflow = "auto";
    };
  }, [isOpen]);

  async function handleAction(formData: FormData) {
    setLoading(true);
    setError("");
    const res = await upsertClienteAdmin(formData);
    if (res.error) {
      setError(res.error);
    } else {
      setIsOpen(false);
    }
    setLoading(false);
  }

  async function handleToggle() {
    if (!cliente) return;
    setLoading(true);
    await toggleActivoCliente(cliente.id_cliente, !cliente.activo);
    setLoading(false);
  }

  return (
    <>
      <div onClick={() => setIsOpen(true)} className="inline-block cursor-pointer">
        {children || (
          <button className="flex items-center gap-2 px-4 py-2 bg-violet-600 text-white rounded-xl hover:bg-violet-700 transition shadow-sm font-bold text-sm">
            <UserPlus size={16} />
            Nuevo Cliente
          </button>
        )}
      </div>

      {isOpen && mounted && createPortal(
        <div className="fixed inset-0 z-9999 flex items-start justify-center bg-slate-900/60 backdrop-blur-sm p-4 overflow-y-auto pt-16 sm:pt-24">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl relative mb-auto">
            <div className="flex items-center justify-between p-6 border-b border-slate-100">
              <h2 className="text-xl font-black text-slate-800 flex items-center gap-2">
                {!cliente ? "Nuevo Cliente" : (isEditing ? "Editar Cliente" : "Detalles del Cliente")}
              </h2>
              <div className="flex items-center gap-2">
                {cliente && !isEditing && (
                  <>
                    <button
                      onClick={handleToggle}
                      title={cliente.activo ? "Desactivar" : "Activar"}
                      disabled={loading}
                      className={`p-2 rounded-xl transition ${cliente.activo ? 'bg-red-50 text-red-600 hover:bg-red-100' : 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100'}`}
                    >
                      <Power size={18} />
                    </button>
                    <button
                      onClick={() => setIsEditing(true)}
                      className="p-2 bg-slate-100 text-slate-600 rounded-xl hover:bg-slate-200 transition"
                    >
                      <Edit size={18} />
                    </button>
                  </>
                )}
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-2 text-slate-400 hover:bg-slate-100 rounded-xl transition"
                >
                  <X size={18} />
                </button>
              </div>
            </div>

            <div className="p-6">
              {(!cliente || isEditing) ? (
                <form action={handleAction} className="space-y-4">
                  {cliente && <input type="hidden" name="id_cliente" value={cliente.id_cliente} />}
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Nombres</label>
                      <input name="nombres" required defaultValue={cliente?.nombres} className="w-full p-3 border border-slate-200 rounded-xl bg-slate-50" />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Apellidos</label>
                      <input name="apellidos" required defaultValue={cliente?.apellidos} className="w-full p-3 border border-slate-200 rounded-xl bg-slate-50" />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Tipo Doc</label>
                      <select name="tipo_documento" required defaultValue={cliente?.tipo_documento || "CC"} className="w-full p-3 border border-slate-200 rounded-xl bg-slate-50">
                        <option value="CC">Cédula de Ciudadanía</option>
                        <option value="CE">Cédula de Extranjería</option>
                        <option value="TI">Tarjeta de Identidad</option>
                        <option value="PAS">Pasaporte</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Número</label>
                      <input name="numero_documento" required defaultValue={cliente?.numero_documento} className="w-full p-3 border border-slate-200 rounded-xl bg-slate-50" />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Email</label>
                      <input name="email" type="email" required defaultValue={cliente?.email} className="w-full p-3 border border-slate-200 rounded-xl bg-slate-50" />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Teléfono</label>
                      <input name="telefono" defaultValue={cliente?.telefono} className="w-full p-3 border border-slate-200 rounded-xl bg-slate-50" />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Fecha Nacimiento</label>
                      <input name="fecha_nacimiento" type="date" required defaultValue={cliente?.fecha_nacimiento ? new Date(cliente.fecha_nacimiento).toISOString().split('T')[0] : ""} className="w-full p-3 border border-slate-200 rounded-xl bg-slate-50" />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Barrio</label>
                      <select name="id_barrio" required defaultValue={cliente?.id_barrio} className="w-full p-3 border border-slate-200 rounded-xl bg-slate-50">
                        <option value="">Seleccione...</option>
                        {barrios?.map(b => (
                          <option key={b.id_barrio} value={b.id_barrio}>{b.nombre} ({b.comuna.municipio.nombre})</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {error && <p className="text-red-500 text-sm font-bold bg-red-50 p-3 rounded-lg text-center">{error}</p>}

                  <div className="flex justify-end gap-3 pt-4 border-t border-slate-100 mt-6">
                    {cliente && (
                      <button type="button" onClick={() => setIsEditing(false)} className="px-5 py-2.5 rounded-xl font-bold text-slate-500 hover:bg-slate-100 transition">
                        Cancelar
                      </button>
                    )}
                    <button type="submit" disabled={loading} className="px-5 py-2.5 bg-violet-600 hover:bg-violet-700 text-white font-bold rounded-xl shadow-md transition flex items-center gap-2">
                       <Save size={18} /> {loading ? "Guardando..." : "Guardar"}
                    </button>
                  </div>
                </form>
              ) : (
                <div className="space-y-6">
                  <div className="flex items-center gap-4 bg-slate-50 p-4 rounded-2xl border border-slate-100">
                    <div className="w-16 h-16 rounded-2xl bg-violet-100 text-violet-600 flex items-center justify-center font-black text-2xl">
                       {cliente.nombres.charAt(0)}{cliente.apellidos.charAt(0)}
                    </div>
                    <div>
                      <h3 className="text-xl font-black text-slate-800">{cliente.nombres} {cliente.apellidos}</h3>
                      <p className="text-slate-500 capitalize flex items-center gap-2">
                        {cliente.tipo_documento} {cliente.numero_documento}
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${cliente.activo ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}>
                          {cliente.activo ? 'Activo' : 'Inactivo'}
                        </span>
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm flex items-start gap-3">
                      <Mail className="w-5 h-5 text-indigo-500 mt-0.5" />
                      <div>
                        <p className="text-xs font-bold text-slate-400 uppercase">Email</p>
                        <p className="font-semibold text-slate-700 break-all">{cliente.email}</p>
                      </div>
                    </div>
                    <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm flex items-start gap-3">
                      <Phone className="w-5 h-5 text-emerald-500 mt-0.5" />
                      <div>
                        <p className="text-xs font-bold text-slate-400 uppercase">Teléfono</p>
                        <p className="font-semibold text-slate-700">{cliente.telefono || "N/A"}</p>
                      </div>
                    </div>
                    <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm flex items-start gap-3">
                      <Calendar className="w-5 h-5 text-amber-500 mt-0.5" />
                      <div>
                        <p className="text-xs font-bold text-slate-400 uppercase">Antigüedad / Registro</p>
                        <p className="font-semibold text-slate-700">{new Date(cliente.fecha_registro).toLocaleDateString()}</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>,
        document.body
      )}
    </>
  );
}
