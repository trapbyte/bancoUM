"use client";

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { Plus, CreditCard, Landmark, X, Eye, CreditCard as CardIcon, ArrowRightLeft, Send, CheckCircle2, AlertCircle } from "lucide-react";
import { createAccountAction, executeTransactionAction } from "@/app/dashboard/cliente/actions";

// --- Formateador ---
const formatCOP = (val: number) => new Intl.NumberFormat("es-CO", { style: "currency", currency: "COP", maximumFractionDigits: 0 }).format(val);

export function BtnCrearCuenta({ reachedLimit }: { reachedLimit: boolean }) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    const formData = new FormData(e.currentTarget);
    
    try {
      const res = await createAccountAction(formData);
      if (res?.error) setError(res.error);
      else setOpen(false);
    } catch {
      setError("Error interno del servidor");
    } finally {
      setLoading(false);
    }
  };

  if (reachedLimit) {
    return (
      <button disabled className="px-5 py-2.5 bg-slate-200 text-slate-400 font-bold rounded-xl flex items-center justify-center gap-2 cursor-not-allowed">
        <Plus className="w-5 h-5" /> Límite de 3 cuentas alzanzado
      </button>
    );
  }

  return (
    <>
      <button onClick={() => setOpen(true)} className="px-5 py-2.5 bg-violet-600 hover:bg-violet-700 text-white font-bold tracking-wide rounded-xl shadow-[0_4px_14px_rgba(124,58,237,0.3)] flex items-center justify-center gap-2 transition-transform hover:scale-105 active:scale-95">
        <Plus className="w-5 h-5" /> Abrir Nueva Cuenta
      </button>

      {open && mounted && createPortal(
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-slate-900/60 backdrop-blur-[2px] p-4">
          <div className="bg-white p-8 rounded-3xl w-full max-w-md shadow-2xl animate-in zoom-in duration-200">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-black text-slate-800">Seleccionar Producto</h2>
              <button title="Cerrar" onClick={() => setOpen(false)} className="p-2 border border-slate-300 bg-slate-100 text-slate-700 hover:text-slate-900 hover:bg-slate-200 rounded-full shadow-sm"><X className="w-6 h-6"/></button>
            </div>
            
            {error && <div className="mb-4 p-3 bg-rose-50 text-rose-600 text-sm font-bold rounded-lg">{error}</div>}
             <form onSubmit={handleSubmit} className="space-y-4">
               <label className="block border-2 border-slate-100 hover:border-violet-300 rounded-xl p-4 cursor-pointer transition-colors has-[:checked]:border-violet-500 has-[:checked]:bg-violet-50">
                  <div className="flex items-center gap-3">
                     <input type="radio" required name="tipoC" value="AHORROS" className="w-4 h-4 accent-violet-600" />
                     <Landmark className="w-6 h-6 text-violet-600" />
                     <div>
                       <p className="font-bold text-slate-800">Cuenta de Ahorros</p>
                       <p className="text-xs text-slate-500 font-medium">Rentabilidad anual estándar.</p>
                     </div>
                  </div>
               </label>
               
               <label className="block border-2 border-slate-100 hover:border-indigo-300 rounded-xl p-4 cursor-pointer transition-colors has-[:checked]:border-indigo-500 has-[:checked]:bg-indigo-50">
                  <div className="flex items-center gap-3">
                     <input type="radio" required name="tipoC" value="CORRIENTE" className="w-4 h-4 accent-indigo-600" />
                     <Landmark className="w-6 h-6 text-indigo-600" />
                     <div>
                       <p className="font-bold text-slate-800">Cuenta Corriente</p>
                       <p className="text-xs text-slate-500 font-medium">Bolsillo corporativo flexible.</p>
                     </div>
                  </div>
               </label>

               <label className="block border-2 border-slate-100 hover:border-fuchsia-300 rounded-xl p-4 cursor-pointer transition-colors has-[:checked]:border-fuchsia-500 has-[:checked]:bg-fuchsia-50">
                  <div className="flex items-center gap-3">
                     <input type="radio" required name="tipoC" value="TARJETA_CREDITO" className="w-4 h-4 accent-fuchsia-600" />
                     <CreditCard className="w-6 h-6 text-fuchsia-600" />
                     <div>
                       <p className="font-bold text-slate-800">Tarjeta de Crédito</p>
                       <p className="text-xs text-slate-500 font-medium">Cupo asignado dinámicamente.</p>
                     </div>
                  </div>
               </label>

               <button disabled={loading} type="submit" className="w-full py-3 mt-4 bg-[#030712] text-white font-black rounded-xl hover:bg-slate-800 shadow-lg disabled:opacity-50 transition-colors">
                 {loading ? "Gestionando Apertura..." : "Solicitar Producto"}
               </button>
            </form>
          </div>
        </div>,
        document.body
      )}
    </>
  );
}

export function BtnTransaccionesModal({ cuenta, misCuentas }: { cuenta: any, misCuentas?: any[] }) {
  const esCR = cuenta.tipo_cuenta.tipo === "TARJETA_CREDITO";
  const [open, setOpen] = useState(false);
  const [txModalMode, setTxModalMode] = useState<"DEPOSITO" | "TRANSFERENCIA" | "COMPRA_TARJETA" | "PAGO">(esCR ? "COMPRA_TARJETA" : "TRANSFERENCIA");
  
  const [txLoading, setTxLoading] = useState(false);
  const [txError, setTxError] = useState("");
  const [txSuccess, setTxSuccess] = useState("");
  const [payAmount, setPayAmount] = useState<number>(cuenta.saldo > 0 ? cuenta.saldo : 0);
  
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const handleTransact = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setTxLoading(true); setTxError(""); setTxSuccess("");
    const data = new FormData(e.currentTarget);
    data.append("id_cuenta_origen", cuenta.id_cuenta.toString());
    data.append("tipo_tx", txModalMode);

    const res = await executeTransactionAction(data);
    if (res.error) setTxError(res.error);
    else {
      setTxSuccess("Transacción exitosa aprobada por la red.");
      setTimeout(() => setOpen(false), 2500);
    }
    setTxLoading(false);
  };

  return (
    <>
      <button 
        onClick={() => { setOpen(true); setTxSuccess(""); setTxError(""); }}
        className="flex-1 flex gap-2 items-center justify-center bg-white border border-slate-200 shadow-sm hover:bg-slate-50 hover:border-indigo-300 hover:shadow text-slate-800 text-sm font-bold py-2.5 rounded-xl transition-all"
      >
        <ArrowRightLeft className="w-4 h-4 text-indigo-600" /> Transacciones
      </button>

      {open && mounted && createPortal(
         <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-slate-900/60 backdrop-blur-[2px] p-4 text-left">
           <div className="bg-white p-8 rounded-3xl w-full max-w-lg shadow-2xl animate-in zoom-in duration-200">
             
             <div className="flex justify-between items-center mb-6">
                <h4 className="font-black text-slate-800 text-2xl">Operar Cuenta</h4>
                <button onClick={() => setOpen(false)} className="p-2 border border-slate-300 bg-slate-100 text-slate-700 hover:text-slate-900 hover:bg-slate-200 rounded-full shadow-sm"><X className="w-6 h-6"/></button>
             </div>

             <div className="flex bg-slate-100 p-1 rounded-xl mb-6">
               <button onClick={() => setTxModalMode(esCR ? "COMPRA_TARJETA" : "TRANSFERENCIA")} className={`flex-1 py-2 text-sm font-bold rounded-lg transition-colors ${['TRANSFERENCIA', 'COMPRA_TARJETA'].includes(txModalMode) ? "bg-white text-slate-800 shadow-sm" : "text-slate-500 hover:text-slate-700"}`}>
                 {esCR ? "Realizar Compra" : "Transferir"}
               </button>
               <button onClick={() => setTxModalMode(esCR ? "PAGO" : "DEPOSITO")} className={`flex-1 py-2 text-sm font-bold rounded-lg transition-colors ${['DEPOSITO', 'PAGO'].includes(txModalMode) ? "bg-white text-slate-800 shadow-sm" : "text-slate-500 hover:text-slate-700"}`}>
                 {esCR ? "Pagar Tarjeta" : "Depositar"}
               </button>
             </div>

             {txError && <div className="p-4 bg-rose-50 border border-rose-200 text-rose-700 text-sm font-bold rounded-xl mb-6 flex items-start gap-2"><AlertCircle className="w-5 h-5 shrink-0"/> {txError}</div>}
             {txSuccess && <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-700 text-sm font-bold rounded-xl mb-6 flex items-start gap-2"><CheckCircle2 className="w-5 h-5 shrink-0"/> {txSuccess}</div>}

             {!txSuccess && (
               <form onSubmit={handleTransact} className="space-y-4">
                  {txModalMode === "TRANSFERENCIA" && (
                    <div>
                      <label className="text-xs font-bold text-slate-500 block mb-2 uppercase tracking-wide text-left">ID o Nro. Cuenta Destino</label>
                      <input name="destino_num" type="text" required placeholder="Ej: 4 (ID) o AHO-12..." className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-lg font-mono focus:border-indigo-500 focus:outline-none focus:ring-4 focus:ring-indigo-50" />
                    </div>
                  )}

                  {txModalMode === "PAGO" && (
                    <>
                      <div>
                        <label className="text-xs font-bold text-slate-500 block mb-2 uppercase tracking-wide text-left">Cuenta de Origen (Fondos)</label>
                        <select name="id_cuenta_origen_fondos" required className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-800 focus:border-violet-500 focus:outline-none focus:ring-4 focus:ring-violet-50">
                           <option value="">Selecciona una cuenta...</option>
                           {misCuentas?.map(c => (
                              <option key={c.id_cuenta} value={c.id_cuenta}>
                                 {c.tipo_cuenta.tipo.replace("_", " ")} ****{c.numero_cuenta.slice(-4)} (Saldo: ${c.saldo.toLocaleString('es-CO')})
                              </option>
                           ))}
                        </select>
                      </div>
                      <div className="pt-2">
                        <label className="text-xs font-bold text-slate-500 block mb-2 uppercase tracking-wide text-left flex justify-between">
                          <span>Monto a Abonar (COP)</span>
                          <span className="text-rose-500 font-black tracking-tight">Deuda Total: ${cuenta.saldo.toLocaleString("es-CO")}</span>
                        </label>
                        <div className="relative mb-4">
                           <input 
                             name="monto" 
                             type="number" 
                             min="1" 
                             max={cuenta.saldo > 0 ? cuenta.saldo : 1}
                             required 
                             value={payAmount}
                             onChange={(e) => setPayAmount(Number(e.target.value))}
                             className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-2xl font-black text-slate-800 focus:border-fuchsia-500 focus:outline-none text-right shadow-sm focus:ring-4 focus:ring-fuchsia-50" 
                           />
                        </div>
                        <input 
                          type="range"
                          min="0"
                          max={cuenta.saldo > 0 ? cuenta.saldo : 1}
                          value={payAmount}
                          onChange={(e) => setPayAmount(Number(e.target.value))}
                          disabled={cuenta.saldo <= 0}
                          className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-fuchsia-600"
                        />
                      </div>
                    </>
                  )}

                  {txModalMode !== "PAGO" && (
                    <div>
                      <label className="text-xs font-bold text-slate-500 block mb-2 uppercase tracking-wide text-left">Monto (COP)</label>
                      <input name="monto" type="number" min="1" max="50000000" required placeholder="0.00" className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-2xl font-black text-slate-800 focus:border-violet-500 focus:outline-none text-right focus:ring-4 focus:ring-violet-50" />
                    </div>
                  )}
                  
                  <button disabled={txLoading} type="submit" className={`w-full py-4 mt-6 font-black text-white rounded-xl transition-all hover:scale-[1.02] active:scale-95 flex justify-center gap-2 ${['DEPOSITO', 'PAGO'].includes(txModalMode) ? "bg-violet-600 hover:bg-violet-700 shadow-[0_4px_14px_rgba(124,58,237,0.3)]" : "bg-indigo-600 hover:bg-indigo-700 shadow-[0_4px_14px_rgba(79,70,229,0.3)]"}`}>
                    {txLoading ? "Procesando en Red..." : txModalMode === "DEPOSITO" ? "Confirmar Depósito" : txModalMode === "PAGO" ? "Pagar Cuota a Tarjeta" : txModalMode === "COMPRA_TARJETA" ? "Autorizar Compra" : "Enviar Transferencia"}
                  </button>
               </form>
             )}
           </div>
         </div>,
         document.body
      )}
    </>
  );
}

export function BtnVirtualCardDrawer({ cuenta, holderName, ultimosMovimientos }: { cuenta: any, holderName: string, ultimosMovimientos: any[] }) {
  const [open, setOpen] = useState(false);
  const esCR = cuenta.tipo_cuenta.tipo === "TARJETA_CREDITO";
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  
  return (
    <>
      <button 
        onClick={() => setOpen(true)}
        className="flex-1 flex gap-2 items-center justify-center bg-white border border-slate-200 shadow-sm hover:bg-slate-50 hover:border-violet-300 hover:shadow text-slate-800 text-sm font-bold py-2.5 rounded-xl transition-all"
      >
        <Eye className="w-4 h-4 text-violet-600" /> Detalles
      </button>

      {open && mounted && createPortal(
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-slate-900/60 backdrop-blur-[2px] p-4 text-left">
          <div className="w-full max-w-xl bg-slate-50 rounded-3xl shadow-2xl p-8 overflow-y-auto max-h-[90vh] animate-in zoom-in duration-200">
             
             <div className="flex justify-between items-center mb-8">
               <h3 className="text-2xl font-black text-slate-800">Tarjeta Virtual y Movimientos</h3>
               <button onClick={() => setOpen(false)} className="p-2 border border-slate-300 bg-slate-100 text-slate-700 hover:text-slate-900 hover:bg-slate-200 rounded-full shadow-sm"><X className="w-6 h-6"/></button>
             </div>

             {/* TARJETA VIRTUAL UI REDISEÑADA ESTÁTICA Y REALISTA */}
             <div className="flex justify-center mb-8">
               <div className={`relative w-full max-w-[400px] aspect-[1.586/1] rounded-2xl p-6 overflow-hidden shadow-xl ${
                  cuenta.tipo_cuenta.tipo === "TARJETA_CREDITO" ? 'bg-gradient-to-br from-slate-100 to-slate-200 text-slate-800' :
                  cuenta.tipo_cuenta.tipo === "CORRIENTE" ? 'bg-gradient-to-tr from-indigo-700 via-indigo-600 to-purple-500 text-white' :
                  'bg-gradient-to-br from-slate-700 to-slate-800 text-slate-100'
               }`}>
                  
                  {/* Subtle noise pattern */}
                  <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-[0.03] mix-blend-overlay"></div>
                  
                  <div className="relative z-10 flex flex-col h-full justify-between font-medium">
                    {/* Top Row: Logo */}
                    <div className="flex justify-between items-start">
                      <div className="flex flex-col">
                        <span className={`text-2xl font-black tracking-tight ${cuenta.tipo_cuenta.tipo === "TARJETA_CREDITO" ? "text-slate-800" : "text-white"}`}>BancoUM</span>
                        <span className={`text-[10px] leading-tight font-bold opacity-80 uppercase tracking-widest`}>{cuenta.tipo_cuenta.tipo.replace("_", " ")}</span>
                      </div>
                    </div>
                    
                    {/* Middle Row: Card Number */}
                    <div className="mt-auto mb-6">
                       <div className="flex items-center gap-4 text-xl tracking-[0.2em] font-mono drop-shadow-sm">
                         <span>••••</span>
                         <span>••••</span>
                         <span>••••</span>
                         <span>{cuenta.numero_cuenta.slice(-4)}</span>
                       </div>
                    </div>
                    
                    {/* Bottom Row: Details & Logo */}
                    <div className="flex justify-between items-end">
                       <div className="flex gap-6">
                         <div className="flex flex-col">
                           <span className="text-[10px] opacity-80 mb-0.5">Válida hasta</span>
                           <span className="text-sm tracking-wider font-mono drop-shadow-sm">12/29</span>
                         </div>
                         <div className="flex flex-col">
                           <span className="text-[10px] opacity-80 mb-0.5">Código CVV</span>
                           <span className="text-sm tracking-wider font-mono drop-shadow-sm">•••</span>
                         </div>
                       </div>
                       
                       {/* MasterCard Style Logo */}
                       <div className="flex items-center">
                         <div className="w-8 h-8 rounded-full bg-rose-500 mix-blend-multiply opacity-90 shadow-sm"></div>
                         <div className="w-8 h-8 rounded-full bg-amber-400 mix-blend-multiply -ml-3 opacity-90 shadow-sm"></div>
                       </div>
                    </div>
                  </div>
               </div>
             </div>
             
             {/* INFO LOG */}
             <div className="mb-8">
                <div className="p-5 bg-white border border-slate-200 rounded-2xl shadow-sm">
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-wide">Balance en Cuenta</p>
                  <p className="text-3xl font-black text-slate-800 tracking-tight mt-1">{formatCOP(Number(cuenta.saldo))}</p>
                  {esCR && cuenta.limite_credito && (
                    <p className="text-xs font-bold text-slate-500 mt-2 bg-slate-100 p-2 rounded-lg inline-block">Cupo Total: {formatCOP(Number(cuenta.limite_credito))}</p>
                  )}
                </div>
             </div>

             {/* ULTIMOS MOVIMIENTOS EXCLUSIVOS */}
             <div>
                <h4 className="text-lg font-black text-slate-800 mb-4">Últimos Movimientos</h4>
                {ultimosMovimientos.length === 0 ? (
                  <p className="text-sm text-slate-500 italic bg-white p-4 rounded-xl border border-slate-200">No hay transacciones asociadas a esta cuenta.</p>
                ) : (
                  <div className="space-y-3">
                    {ultimosMovimientos.map((m) => {
                       const esRechazado = m.estado === "RECHAZADO";
                       const esIngreso = m.id_cuenta_destino === cuenta.id_cuenta && !esRechazado;
                       const signo = esRechazado ? "✗" : esIngreso ? "+" : "-";
                       
                       return (
                         <div key={Number(m.id_movimiento)} className={`flex justify-between items-center bg-white p-3 rounded-xl border transition-colors ${esRechazado ? 'border-rose-200 bg-rose-50/50' : 'border-slate-200'}`}>
                           <div>
                             <p className={`text-sm font-bold capitalize ${esRechazado ? 'text-rose-700' : 'text-slate-800'}`}>
                                {m.tipo.toLowerCase().replace("_", " ")}
                             </p>
                             <p className="text-[10px] text-slate-400 font-mono mt-0.5">{new Date(m.fecha).toLocaleDateString()}</p>
                           </div>
                           <div className="text-right">
                             <p className={`text-sm font-black ${esRechazado ? 'text-rose-500 opacity-70 line-through' : esIngreso ? 'text-emerald-600' : 'text-rose-600'}`}>
                               {signo}{formatCOP(Number(m.monto))}
                             </p>
                             {esRechazado && <p className="text-[10px] text-rose-500 font-bold">RECHAZADO</p>}
                           </div>
                         </div>
                       )
                    })}
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
