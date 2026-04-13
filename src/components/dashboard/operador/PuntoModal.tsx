"use client";

import { useEffect, useRef, useState } from "react";
import { MapPin, Building2, CreditCard, Power, Clock, Phone, X, ExternalLink } from "lucide-react";

interface PuntoData {
  id_punto: number;
  nombre: string;
  tipo: string;
  direccion: string;
  telefono: string | null;
  activo: boolean | null;
  fecha_apertura: string;
  fecha_cierre: string | null;
  barrio: {
    nombre: string;
    comuna: {
      nombre: string;
      municipio: {
        nombre: string;
        departamento: { nombre: string };
      };
    };
  };
}

function formatTipo(tipo: string) {
  return tipo.replace(/_/g, " ").replace(/\b\w/g, c => c.toUpperCase());
}

function LeafletMap({ municipio, direccion }: { municipio: string; direccion: string }) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<any>(null);

  useEffect(() => {
    // Inject Leaflet CSS if not present
    if (!document.getElementById("leaflet-css")) {
      const link = document.createElement("link");
      link.id = "leaflet-css";
      link.rel = "stylesheet";
      link.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
      document.head.appendChild(link);
    }

    if (!mapRef.current || mapInstance.current) return;

    // Dynamically import leaflet to avoid SSR issues
    import("leaflet").then((L) => {
      // Fix default marker icons
      (L as any).Icon.Default.mergeOptions({
        iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
        iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
        shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
      });

      // Geocode using Nominatim
      const query = encodeURIComponent(`${direccion}, ${municipio}, Colombia`);
      fetch(`https://nominatim.openstreetmap.org/search?q=${query}&format=json&limit=1`)
        .then(r => r.json())
        .then(results => {
          const lat = results[0]?.lat ? parseFloat(results[0].lat) : 4.7110;
          const lon = results[0]?.lon ? parseFloat(results[0].lon) : -74.0721;

          if (!mapRef.current || mapInstance.current) return;
          
          const map = L.default.map(mapRef.current).setView([lat, lon], results[0] ? 16 : 12);
          mapInstance.current = map;

          L.default.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
            attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
            maxZoom: 19,
          }).addTo(map);

          L.default.marker([lat, lon])
            .addTo(map)
            .bindPopup(`<b>${direccion}</b><br>${municipio}, Colombia`)
            .openPopup();
        })
        .catch(() => {
          // Fallback: center on Colombia
          if (!mapRef.current || mapInstance.current) return;
          const map = L.default.map(mapRef.current).setView([4.5709, -74.2973], 6);
          mapInstance.current = map;
          L.default.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
            attribution: '© OpenStreetMap'
          }).addTo(map);
        });
    });

    return () => {
      if (mapInstance.current) {
        mapInstance.current.remove();
        mapInstance.current = null;
      }
    };
  }, [municipio, direccion]);

  return <div ref={mapRef} className="w-full h-full rounded-xl z-0" />;
}

export function PuntoModal({ punto, onClose }: { punto: PuntoData; onClose: () => void }) {
  const isATM = punto.tipo === "CAJERO_AUTOMATICO";
  const activo = punto.activo !== false;
  const fullAddress = `${punto.direccion}, ${punto.barrio.nombre}, ${punto.barrio.comuna.municipio.nombre}`;

  // Close on backdrop click
  const handleBackdrop = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) onClose();
  };

  return (
    <div
      className="fixed inset-0 z-[999] bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200"
      onClick={handleBackdrop}
    >
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl overflow-hidden animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className={`p-6 ${isATM ? "bg-gradient-to-r from-sky-600 to-indigo-700" : "bg-gradient-to-r from-emerald-600 to-teal-700"} text-white`}>
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-white/20 flex items-center justify-center">
                {isATM ? <CreditCard className="w-6 h-6" /> : <Building2 className="w-6 h-6" />}
              </div>
              <div>
                <p className="text-xs font-bold uppercase tracking-widest text-white/70 mb-0.5">
                  {formatTipo(punto.tipo)}
                </p>
                <h2 className="text-2xl font-black tracking-tight">{punto.nombre}</h2>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-xl hover:bg-white/20 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="flex flex-wrap gap-3 mt-4">
            <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${activo ? "bg-emerald-400/30 text-white border border-white/30" : "bg-rose-400/30 text-white border border-white/30"}`}>
              <Power className="w-3 h-3" />
              {activo ? "Operativo" : "Fuera de servicio"}
            </span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-white/20 text-white border border-white/30">
              <Clock className="w-3 h-3" />
              Desde {new Date(punto.fecha_apertura).toLocaleDateString("es-CO", { year: "numeric", month: "long", day: "numeric" })}
            </span>
          </div>
        </div>

        {/* Body Vertical Stack */}
        <div className="flex flex-col bg-slate-50">
          {/* Top Info Strip */}
          <div className="p-4 sm:p-6 flex flex-wrap gap-4 sm:gap-6 bg-white border-b border-slate-100">
            <div className="flex items-start gap-3 flex-1 min-w-[200px]">
              <div className="p-2 rounded-lg bg-emerald-50 mt-1 shrink-0">
                <MapPin className="w-5 h-5 text-emerald-600" />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-400 mb-0.5 tracking-wider uppercase">Localización Fija</p>
                <p className="font-semibold text-slate-800 text-sm leading-snug">{punto.direccion}</p>
                <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                  {punto.barrio.nombre} • {punto.barrio.comuna.nombre}<br />
                  {punto.barrio.comuna.municipio.nombre}, {punto.barrio.comuna.municipio.departamento.nombre}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3 flex-1 min-w-[200px]">
              <div className="p-2 rounded-lg bg-sky-50 mt-1 shrink-0">
                <Phone className="w-5 h-5 text-sky-600" />
              </div>
              <div className="flex flex-col justify-between h-full">
                <div>
                  <p className="text-xs font-bold text-slate-400 mb-0.5 tracking-wider uppercase">Contacto / Estado</p>
                  <p className="font-semibold text-slate-800 text-sm">{punto.telefono || "Sin teléfono registrado"}</p>
                </div>
                {punto.fecha_cierre ? (
                  <p className="text-xs font-bold text-rose-600 mt-3">
                    ⚠ Cerrado el {new Date(punto.fecha_cierre).toLocaleDateString("es-CO")}
                  </p>
                ) : (
                  <a
                    href={`https://www.openstreetmap.org/search?query=${encodeURIComponent(fullAddress)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-600 hover:text-emerald-700 transition-colors mt-3"
                  >
                    <ExternalLink className="w-3.5 h-3.5" /> Abrir en Maps web
                  </a>
                )}
              </div>
            </div>
          </div>

          {/* Bottom Map Block */}
          <div className="w-full h-64 sm:h-80 relative z-0">
            <LeafletMap
              municipio={punto.barrio.comuna.municipio.nombre}
              direccion={punto.direccion}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
