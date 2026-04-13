"use client";

import { Printer } from "lucide-react";

export function PrintBtn() {
    return (
        <button 
           onClick={() => window.print()} 
           className="print:hidden px-4 py-2 bg-slate-900 border border-slate-700 text-white rounded-xl shadow-lg font-bold text-sm flex items-center gap-2 hover:bg-slate-800 transition-colors"
        >
           <Printer className="w-4 h-4" /> Exportar BI (PDF)
        </button>
    );
}
