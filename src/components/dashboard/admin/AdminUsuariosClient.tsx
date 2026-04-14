"use client";

import { useState } from "react";
import { UserPlus, Edit } from "lucide-react";
import { EmpleadoModal } from "./EmpleadoModal";

export function AddEmpleadoBtn({ puntosDisponibles }: { puntosDisponibles: any[] }) {
    const [open, setOpen] = useState(false);
    return (
        <>
            <button 
                onClick={() => setOpen(true)}
                className="px-5 py-2 bg-violet-600 hover:bg-violet-700 text-white rounded-xl shadow-lg font-bold text-sm transition-all flex items-center gap-2"
            >
                <UserPlus className="w-5 h-5"/> Entrar Personal
            </button>
            {open && <EmpleadoModal onClose={() => setOpen(false)} puntosDisponibles={puntosDisponibles} />}
        </>
    );
}

export function EditEmpleadoBtn({ userToEdit, puntosDisponibles }: { userToEdit: any, puntosDisponibles: any[] }) {
    const [open, setOpen] = useState(false);
    return (
        <>
            <button 
                onClick={() => setOpen(true)}
                className="p-2 text-slate-400 hover:text-amber-500 hover:bg-amber-50 rounded-lg transition-colors" 
                title="Modificar Rol e Info"
            >
                <Edit className="w-4 h-4" />
            </button>
            {open && <EmpleadoModal onClose={() => setOpen(false)} userToEdit={userToEdit} puntosDisponibles={puntosDisponibles} />}
        </>
    );
}
