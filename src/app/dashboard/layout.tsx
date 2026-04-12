"use client";

import { useSession, signOut } from "next-auth/react";
import { usePathname } from "next/navigation";
import { Outfit, Inter } from "next/font/google";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  LayoutDashboard, CreditCard, ArrowLeftRight, User,
  Users, Settings, Building2, BookUser,
  ShieldCheck, LogOut, ChevronRight, BarChart3,
} from "lucide-react";

const outfit = Outfit({ subsets: ["latin"], weight: ["700", "800", "900"] });
const inter = Inter({ subsets: ["latin"], weight: ["400", "500", "600"] });

// Menú según rol
const menus: Record<string, { label: string; href: string; icon: React.ReactNode }[]> = {
  cliente: [
    { label: "Dashboard", href: "/dashboard/cliente", icon: <LayoutDashboard className="w-4 h-4" /> },
    { label: "Mis Cuentas", href: "/dashboard/cliente/cuentas", icon: <CreditCard className="w-4 h-4" /> },
    { label: "Movimientos", href: "/dashboard/cliente/movimientos", icon: <ArrowLeftRight className="w-4 h-4" /> },
    { label: "Mi Perfil", href: "/dashboard/cliente/perfil", icon: <User className="w-4 h-4" /> },
  ],
  asesor: [
    { label: "Dashboard", href: "/dashboard/asesor", icon: <LayoutDashboard className="w-4 h-4" /> },
    { label: "Clientes", href: "/dashboard/asesor/clientes", icon: <Users className="w-4 h-4" /> },
    { label: "Cuentas", href: "/dashboard/asesor/cuentas", icon: <CreditCard className="w-4 h-4" /> },
    { label: "Movimientos", href: "/dashboard/asesor/movimientos", icon: <ArrowLeftRight className="w-4 h-4" /> },
  ],
  operador: [
    { label: "Dashboard", href: "/dashboard/operador", icon: <LayoutDashboard className="w-4 h-4" /> },
    { label: "Puntos de Atención", href: "/dashboard/operador/puntos", icon: <Building2 className="w-4 h-4" /> },
    { label: "Empleados", href: "/dashboard/operador/empleados", icon: <BookUser className="w-4 h-4" /> },
    { label: "Catálogos", href: "/dashboard/operador/catalogos", icon: <Settings className="w-4 h-4" /> },
  ],
  admin: [
    { label: "Dashboard", href: "/dashboard/admin", icon: <LayoutDashboard className="w-4 h-4" /> },
    { label: "Auditoría", href: "/dashboard/admin/auditoria", icon: <ShieldCheck className="w-4 h-4" /> },
    { label: "Usuarios", href: "/dashboard/admin/usuarios", icon: <Users className="w-4 h-4" /> },
    { label: "Estadísticas", href: "/dashboard/admin/estadisticas", icon: <BarChart3 className="w-4 h-4" /> },
  ],
};

const rolLabels: Record<string, string> = {
  cliente: "Cliente",
  asesor: "Asesor Comercial",
  operador: "Operador",
  admin: "Administrador",
};

const rolColors: Record<string, string> = {
  cliente: "from-[#7C3AED] to-[#9333EA]",
  asesor: "from-[#0369A1] to-[#0284C7]",
  operador: "from-[#047857] to-[#059669]",
  admin: "from-[#9D174D] to-[#BE185D]",
};

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession();
  const pathname = usePathname();

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950">
        <div className="w-8 h-8 rounded-full border-2 border-violet-500 border-t-transparent animate-spin" />
      </div>
    );
  }

  const rol = session?.user?.rol ?? "cliente";
  const userName = session?.user?.name ?? "Usuario";
  const userEmail = session?.user?.email ?? "";
  const items = menus[rol] ?? menus.cliente;
  const gradientClass = rolColors[rol] ?? rolColors.cliente;

  return (
    <div className={`min-h-screen bg-slate-950 text-white flex ${inter.className}`}>

      {/* ── Sidebar ──────────────────────────────────────────────────────── */}
      <aside className="w-64 shrink-0 bg-slate-900 border-r border-slate-800 flex flex-col">
        {/* Logo */}
        <div className="px-6 py-6 border-b border-slate-800">
          <Link href="/" className={`font-black text-2xl tracking-tighter ${outfit.className}`}>
            banco<span className="text-violet-400">UM</span>
          </Link>
        </div>

        {/* User badge */}
        <div className="px-4 py-5 border-b border-slate-800">
          <div className={`flex items-center gap-3 p-3 rounded-xl bg-gradient-to-r ${gradientClass} bg-opacity-20`}>
            <div className={`w-9 h-9 rounded-lg bg-gradient-to-br ${gradientClass} flex items-center justify-center shrink-0 shadow-md`}>
              <span className="text-sm font-bold text-white">
                {userName.charAt(0).toUpperCase()}
              </span>
            </div>
            <div className="min-w-0">
              <p className="font-semibold text-sm text-white truncate">{userName}</p>
              <p className="text-xs text-slate-400 truncate">{rolLabels[rol]}</p>
            </div>
          </div>
        </div>

        {/* Nav items */}
        <nav className="flex-1 px-3 py-4 space-y-1">
          {items.map((item) => {
            const active = pathname === item.href || pathname.startsWith(item.href + "/");
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`
                  flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all group
                  ${active
                    ? "bg-violet-600/20 text-violet-300 border border-violet-500/30"
                    : "text-slate-400 hover:text-white hover:bg-slate-800"
                  }
                `}
              >
                {item.icon}
                <span className="flex-1">{item.label}</span>
                {active && <ChevronRight className="w-3.5 h-3.5 opacity-60" />}
              </Link>
            );
          })}
        </nav>

        {/* Sign out */}
        <div className="px-3 py-4 border-t border-slate-800">
          <button
            onClick={() => signOut({ callbackUrl: "/" })}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition-all"
          >
            <LogOut className="w-4 h-4" />
            Cerrar sesión
          </button>
        </div>
      </aside>

      {/* ── Main content ─────────────────────────────────────────────────── */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top bar */}
        <header className="h-16 border-b border-slate-800 px-8 flex items-center justify-between bg-slate-900/50 backdrop-blur-sm shrink-0">
          <div />
          <div className="flex items-center gap-3 text-sm">
            <span className="text-slate-500">{userEmail}</span>
            <div className={`px-2.5 py-1 text-xs font-bold rounded-full bg-gradient-to-r ${gradientClass} text-white`}>
              {rolLabels[rol]}
            </div>
          </div>
        </header>

        {/* Page content */}
        <motion.main
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="flex-1 overflow-auto p-8"
        >
          {children}
        </motion.main>
      </div>
    </div>
  );
}
