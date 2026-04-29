"use client";

import { useSession, signOut } from "next-auth/react";
import { usePathname } from "next/navigation";
import { Outfit, Inter } from "next/font/google";
import Link from "next/link";

import {
  LayoutDashboard, CreditCard, ArrowLeftRight, User,
  Users, Settings, Building2, BookUser,
  ShieldCheck, LogOut, ChevronRight, BarChart3, Bot,
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
    { label: "Asistente IA", href: "/dashboard/admin/asistente", icon: <Bot className="w-4 h-4" /> },
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
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="w-8 h-8 rounded-full border-2 border-violet-600 border-t-transparent animate-spin" />
      </div>
    );
  }

  const rol = session?.user?.rol ?? "cliente";
  const userName = session?.user?.name ?? "Usuario";
  const userEmail = session?.user?.email ?? "";
  const items = menus[rol] ?? menus.cliente;
  const gradientClass = rolColors[rol] ?? rolColors.cliente;

  return (
    <div className={`h-screen overflow-hidden bg-slate-50 text-slate-900 flex ${inter.className}`}>

      {/* ── Sidebar ──────────────────────────────────────────────────────── */}
      <aside className="w-64 shrink-0 bg-white border-r border-slate-200 flex flex-col shadow-sm relative z-20 overflow-y-auto">
        {/* Logo */}
        <div className="h-16 flex items-center px-6 border-b border-slate-200">
          <Link href="/" className={`font-black text-2xl tracking-tighter ${outfit.className}`}>
            banco<span className="text-violet-600">UM</span>
          </Link>
        </div>

        {/* User badge */}
        <div className="px-4 py-5 border-b border-slate-100">
          <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 border border-slate-100 shadow-sm transition-all hover:shadow-md">
            <div className={`w-9 h-9 rounded-lg bg-gradient-to-br ${gradientClass} flex items-center justify-center shrink-0 shadow-sm`}>
              <span className="text-sm font-bold text-white shadow-sm">
                {userName.charAt(0).toUpperCase()}
              </span>
            </div>
            <div className="min-w-0">
              <p className="font-semibold text-sm text-slate-800 truncate leading-tight mb-0.5">{userName}</p>
              <p className="text-[11px] font-medium text-slate-500 tracking-wide uppercase truncate">{rolLabels[rol]}</p>
            </div>
          </div>
        </div>

        {/* Nav items */}
        <nav className="flex-1 px-3 py-4 space-y-1">
          {items.map((item) => {
            // Evaluamos si es exactamente el "dashboard home" (/dashboard/rol).
            const isDashboardHome = ["/dashboard/cliente", "/dashboard/asesor", "/dashboard/operador", "/dashboard/admin"].includes(item.href);
            const active = isDashboardHome 
              ? pathname === item.href 
              : pathname === item.href || pathname.startsWith(item.href + "/");
              
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`
                  flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all group
                  ${active
                    ? "bg-violet-50/80 text-violet-700 border border-violet-200 shadow-sm"
                    : "text-slate-500 hover:text-slate-800 hover:bg-slate-50"
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
        <div className="px-3 py-4 border-t border-slate-100">
          <button
            onClick={() => signOut({ callbackUrl: "/" })}
            className="w-full flex items-center justify-between px-4 py-3 rounded-xl text-sm font-bold text-slate-600 hover:text-rose-700 hover:bg-rose-50 border border-transparent hover:border-rose-100 transition-all group"
          >
            Cerrar sesión
            <LogOut className="w-5 h-5 opacity-70 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
          </button>
        </div>
      </aside>

      {/* ── Main content ─────────────────────────────────────────────────── */}
      <div className="flex-1 flex flex-col min-w-0 relative z-10 w-full overflow-hidden">
        {/* Decorative ambient background */}
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-violet-600/5 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-sky-600/5 rounded-full blur-[100px] pointer-events-none" />

        {/* Top bar with glassmorphism */}
        <header className="h-16 border-b border-slate-200 px-8 flex items-center justify-between bg-white/60 backdrop-blur-xl shrink-0 sticky top-0 z-30">
          <div />
          <div className="flex items-center gap-3 text-sm">
            <span className="text-slate-500 font-medium">{userEmail}</span>
            <div className={`px-3 py-1.5 text-xs font-bold rounded-full bg-gradient-to-r ${gradientClass} text-white shadow-sm`}>
              {rolLabels[rol]}
            </div>
          </div>
        </header>

        {/* Page content */}
        <main
          className="flex-1 overflow-x-hidden overflow-y-auto p-8 relative z-20"
        >
          {children}
        </main>
      </div>
    </div>
  );
}
