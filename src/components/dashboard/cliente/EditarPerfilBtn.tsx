"use client";

import { useState } from "react";
import { updatePerfilCliente } from "@/app/dashboard/cliente/perfil/actions";
import { User, Phone, Mail } from "lucide-react";

export default function EditarPerfilBtn({
  currentEmail,
  currentPhone,
}: {
  currentEmail: string;
  currentPhone: string;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function actionPost(formData: FormData) {
    setLoading(true);
    setError("");

    try {
      const res = await updatePerfilCliente(formData);
      if (res.error) {
        setError(res.error);
      } else {
        setIsOpen(false);
      }
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="font-bold text-violet-600 hover:text-violet-700 underline underline-offset-2"
      >
        Edita tus datos aquí
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-xl p-8 max-w-sm w-full relative">
            <button
              onClick={() => setIsOpen(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 transition"
            >
              ✕
            </button>
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-violet-100 text-violet-600 rounded-xl flex items-center justify-center">
                <User size={20} />
              </div>
              <h2 className="text-xl font-black text-slate-900">Editar Perfil</h2>
            </div>

            <form action={actionPost} className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1">
                  Teléfono
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none text-slate-400">
                    <Phone size={16} />
                  </div>
                  <input
                    name="telefono"
                    defaultValue={currentPhone}
                    required
                    className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-xl bg-slate-50 focus:bg-white focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 transition-all outline-none"
                    placeholder="Tu teléfono..."
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1">
                  Email
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none text-slate-400">
                    <Mail size={16} />
                  </div>
                  <input
                    name="email"
                    type="email"
                    defaultValue={currentEmail}
                    required
                    className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-xl bg-slate-50 focus:bg-white focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 transition-all outline-none"
                    placeholder="Tu correo electrónico..."
                  />
                </div>
              </div>

              {error && (
                <p className="p-3 bg-red-50 text-red-600 text-sm font-bold rounded-xl text-center">
                  {error}
                </p>
              )}

              <div className="pt-2 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="px-4 py-2 text-sm font-bold text-slate-500 bg-slate-100 hover:bg-slate-200 rounded-xl transition"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-4 py-2 text-sm font-bold text-white bg-violet-600 hover:bg-violet-700 rounded-xl shadow hover:shadow-lg hover:shadow-violet-600/20 transition cursor-pointer"
                >
                  {loading ? "Guardando..." : "Guardar Cambios"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
