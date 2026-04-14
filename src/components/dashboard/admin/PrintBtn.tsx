"use client";

import { Download, Loader2 } from "lucide-react";
import { useState } from "react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

interface StatsData {
  totalMovido: number;
  totalGuardado: number;
  volumenTx: number;
  distribucionCuentas: { name: string; value: number }[];
  txHistory: { day: string; value: number }[];
}

export function PrintBtn({ stats }: { stats: StatsData }) {
    const [loading, setLoading] = useState(false);

    const handleDownload = async () => {
        setLoading(true);
        try {
            const pdf = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });
            const W = pdf.internal.pageSize.getWidth();
            const now = new Date().toLocaleString('es-CO');
            const fmt = (v: number) => new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(v);

            // ── Header Band ──────────────────────────────────────────────
            pdf.setFillColor(30, 27, 75); // indigo-950
            pdf.rect(0, 0, W, 28, 'F');
            
            pdf.setTextColor(255, 255, 255);
            pdf.setFont('helvetica', 'bold');
            pdf.setFontSize(18);
            pdf.text('BancoUM — Reporte BI Ejecutivo', 14, 11);
            pdf.setFontSize(8);
            pdf.setFont('helvetica', 'normal');
            pdf.setTextColor(180, 180, 220);
            pdf.text('Sistema de Inteligencia de Negocio — Área Financiera', 14, 17);
            pdf.text(`Generado: ${now}`, 14, 22);
            pdf.text('CONFIDENCIAL — Solo para uso interno autorizado', W - 14, 22, { align: 'right' });

            // ── KPI Cards Row ─────────────────────────────────────────────
            const kpiY = 36;
            const kpiW = (W - 28) / 3;
            const kpis = [
              { label: 'Flujo Transaccional Total', value: fmt(stats.totalMovido), color: [16, 185, 129] as [number,number,number] },
              { label: 'Patrimonio Captado (Saldos)', value: fmt(stats.totalGuardado), color: [124, 58, 237] as [number,number,number] },
              { label: 'Volumen de Operaciones', value: `${stats.volumenTx.toLocaleString()} TXNs`, color: [239, 68, 68] as [number,number,number] },
            ];

            kpis.forEach((kpi, i) => {
              const x = 14 + i * (kpiW + 4);
              pdf.setFillColor(248, 250, 252);
              pdf.setDrawColor(...kpi.color);
              pdf.roundedRect(x, kpiY, kpiW, 24, 3, 3, 'FD');

              pdf.setFillColor(...kpi.color);
              pdf.roundedRect(x, kpiY, 4, 24, 1, 1, 'F');

              pdf.setFont('helvetica', 'normal');
              pdf.setFontSize(7);
              pdf.setTextColor(100, 116, 139);
              pdf.text(kpi.label.toUpperCase(), x + 8, kpiY + 7);

              pdf.setFont('helvetica', 'bold');
              pdf.setFontSize(12);
              pdf.setTextColor(15, 23, 42);
              pdf.text(kpi.value, x + 8, kpiY + 18);
            });

            // ── Distribución de Cuentas ───────────────────────────────────
            const tableY = kpiY + 32;
            pdf.setFont('helvetica', 'bold');
            pdf.setFontSize(10);
            pdf.setTextColor(30, 27, 75);
            pdf.text('Distribución de Productos Bancarios', 14, tableY);

            autoTable(pdf, {
              startY: tableY + 4,
              head: [['Tipo de Cuenta', 'Cuentas Activas', '% del Portafolio']],
              body: stats.distribucionCuentas.map(d => {
                const total = stats.distribucionCuentas.reduce((a, b) => a + b.value, 0);
                const pct = total ? ((d.value / total) * 100).toFixed(1) : '0.0';
                return [d.name, d.value.toString(), `${pct}%`];
              }),
              styles: { fontSize: 9, cellPadding: 4 },
              headStyles: { fillColor: [30, 27, 75], textColor: 255, fontStyle: 'bold' },
              alternateRowStyles: { fillColor: [241, 245, 249] },
              columnStyles: { 1: { halign: 'center' }, 2: { halign: 'center' } },
              margin: { left: 14, right: 14 },
            });

            // ── Flujo Semanal ─────────────────────────────────────────────
            const afterTable = (pdf as any).lastAutoTable.finalY + 10;
            pdf.setFont('helvetica', 'bold');
            pdf.setFontSize(10);
            pdf.setTextColor(30, 27, 75);
            pdf.text('Velocidad de Flujo — Últimos 7 Días', 14, afterTable);

            autoTable(pdf, {
              startY: afterTable + 4,
              head: [['Día', 'Monto Total Procesado (COP)']],
              body: stats.txHistory.map(d => [d.day, fmt(d.value)]),
              styles: { fontSize: 9, cellPadding: 4 },
              headStyles: { fillColor: [124, 58, 237], textColor: 255, fontStyle: 'bold' },
              alternateRowStyles: { fillColor: [245, 243, 255] },
              columnStyles: { 1: { halign: 'right' } },
              margin: { left: 14, right: 14 },
            });

            // ── Footer ────────────────────────────────────────────────────
            const pageH = pdf.internal.pageSize.getHeight();
            pdf.setFillColor(30, 27, 75);
            pdf.rect(0, pageH - 10, W, 10, 'F');
            pdf.setTextColor(180, 180, 220);
            pdf.setFontSize(7);
            pdf.setFont('helvetica', 'normal');
            pdf.text('BancoUM © Sistema de Inteligencia de Negocio — Reporte Auto-generado', W / 2, pageH - 4, { align: 'center' });

            pdf.save(`BancoUM_BI_${Date.now()}.pdf`);
        } catch (error) {
            console.error('Error generating PDF:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <button 
           onClick={handleDownload} 
           disabled={loading}
           className="px-4 py-2 bg-slate-900 border border-slate-700 text-white rounded-xl shadow-lg font-bold text-sm flex items-center gap-2 hover:bg-slate-800 transition-colors disabled:opacity-50"
        >
           {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />} 
           {loading ? 'Generando...' : 'Exportar BI (PDF)'}
        </button>
    );
}
