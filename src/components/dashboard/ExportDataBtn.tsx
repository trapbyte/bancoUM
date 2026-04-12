"use client";

import { Download, FileText, Sheet, Loader2, ChevronDown } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

interface ExportDataBtnProps {
  // Option A: data is pre-loaded (for small datasets like client movimientos)
  data?: Record<string, any>[];
  // Option B: fetch data lazily on click (for large datasets in asesor pages)
  fetchUrl?: string;
  columns: string[];
  filename: string;
  title: string;
  asesorData?: {
    nombre: string;
    documento: string;
    email: string;
    cargo: string;
  };
}

export function ExportDataBtn({ data: propData, fetchUrl, columns, filename, title, asesorData }: ExportDataBtnProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Resolve data - either from props or fetch lazily
  const resolveData = async (): Promise<Record<string, any>[]> => {
    if (propData) return propData;
    if (fetchUrl) {
      const res = await fetch(fetchUrl);
      if (!res.ok) throw new Error("Error al obtener los datos para exportar");
      const json = await res.json();
      return json.data as Record<string, any>[];
    }
    return [];
  };

  const generatePDF = (data: Record<string, any>[]) => {
    const doc = new jsPDF();

    doc.setFontSize(22);
    doc.setTextColor(15, 23, 42);
    doc.text(title, 14, 20);

    doc.setFontSize(10);
    doc.setTextColor(100, 116, 139);
    doc.text(`Generado el: ${new Date().toLocaleString()}`, 14, 28);
    doc.text("Documento oficial administrativo BancoUM", 14, 33);

    let startY = 40;

    if (asesorData) {
      autoTable(doc, {
        startY: 40,
        head: [['Generado por', '']],
        body: [
          ['Nombre', asesorData.nombre],
          ['Documento', asesorData.documento],
          ['Correo', asesorData.email],
          ['Cargo / Rol', asesorData.cargo],
        ],
        theme: 'plain',
        styles: { fontSize: 9, cellPadding: 2 },
        headStyles: { fillColor: [241, 245, 249], textColor: [15, 23, 42], fontStyle: 'bold' },
        columnStyles: { 0: { fontStyle: 'bold', cellWidth: 50 } }
      });
      startY = (doc as any).lastAutoTable.finalY + 8;
    }

    const bodyArgs = data.map(row => Object.values(row).map(v => v === null || v === undefined ? '' : String(v)));

    autoTable(doc, {
      startY,
      head: [columns],
      body: bodyArgs,
      styles: { fontSize: 8, cellPadding: 3 },
      headStyles: { fillColor: [15, 23, 42], textColor: 255 },
      alternateRowStyles: { fillColor: [248, 250, 252] },
    });

    doc.save(`${filename}.pdf`);
  };

  const generateCSV = (data: Record<string, any>[]) => {
    let csvContent = "\uFEFF" + columns.map(c => `"${c.replace(/"/g, '""')}"`).join(",") + "\n";
    data.forEach((row) => {
      const rowData = Object.values(row).map(value => {
        const innerValue = value === null || value === undefined ? '' : value.toString();
        return `"${innerValue.replace(/"/g, '""')}"`;
      }).join(",");
      csvContent += rowData + "\n";
    });

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    link.setAttribute("href", URL.createObjectURL(blob));
    link.setAttribute("download", `${filename}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleExport = async (format: "csv" | "pdf") => {
    setLoading(true);
    setOpen(false);
    try {
      const data = await resolveData();
      if (format === "csv") generateCSV(data);
      else generatePDF(data);
    } catch (err) {
      console.error(err);
      alert("Ocurrió un error al generar el reporte. Intenta de nuevo.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative inline-block text-left" ref={menuRef}>
      <button
        onClick={() => setOpen(!open)}
        disabled={loading}
        className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white text-sm font-bold rounded-xl shadow-[0_4px_14px_rgba(0,0,0,0.2)] flex items-center justify-center gap-2 transition-all hover:scale-[1.02] active:scale-95 disabled:scale-100 disabled:opacity-75 relative z-10"
      >
        {loading ? <Loader2 className="w-4 h-4 animate-spin shrink-0" /> : <Download className="w-4 h-4 shrink-0" />}
        {loading ? "Generando..." : "Exportar"}
        {!loading && <ChevronDown className={`w-4 h-4 shrink-0 transition-transform ${open ? "rotate-180" : ""}`} />}
      </button>

      {open && !loading && (
        <div className="absolute right-0 mt-2 w-56 origin-top-right rounded-xl bg-white border border-slate-100 shadow-xl ring-1 ring-black ring-opacity-5 z-50 animate-in fade-in slide-in-from-top-2 duration-150 overflow-hidden">
          <div className="py-1">
            <button
              onClick={() => handleExport("csv")}
              className="w-full flex items-center gap-3 px-4 py-3 text-sm font-semibold text-slate-700 hover:bg-emerald-50 hover:text-emerald-700 transition-colors"
            >
              <div className="p-1.5 rounded-md bg-emerald-100 text-emerald-600">
                <Sheet className="w-4 h-4" />
              </div>
              Excel (.csv)
            </button>
            <button
              onClick={() => handleExport("pdf")}
              className="w-full flex items-center gap-3 px-4 py-3 text-sm font-semibold text-slate-700 hover:bg-rose-50 hover:text-rose-700 transition-colors border-t border-slate-50"
            >
              <div className="p-1.5 rounded-md bg-rose-100 text-rose-600">
                <FileText className="w-4 h-4" />
              </div>
              Documento PDF
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
