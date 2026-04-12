import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

const NEXTAUTH_SECRET = process.env.NEXTAUTH_SECRET;

const rolRoutes: Record<string, string> = {
  cliente: "/dashboard/cliente",
  asesor: "/dashboard/asesor",
  operador: "/dashboard/operador",
  admin: "/dashboard/admin",
};

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Solo actúa sobre rutas del dashboard
  if (!pathname.startsWith("/dashboard")) {
    return NextResponse.next();
  }

  // Verificar sesión JWT de NextAuth
  const token = await getToken({ req: request, secret: NEXTAUTH_SECRET });

  // Sin sesión → redirigir al login
  if (!token) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(loginUrl);
  }

  const rol = (token.rol as string) ?? "cliente";
  const allowedBase = rolRoutes[rol] ?? "/dashboard/cliente";

  // Página raíz /dashboard → redirigir a la subruta del rol
  if (pathname === "/dashboard") {
    return NextResponse.redirect(new URL(allowedBase, request.url));
  }

  // Intentar acceder al dashboard de otro rol → redirigir al propio
  if (!pathname.startsWith(allowedBase)) {
    return NextResponse.redirect(new URL(allowedBase, request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*"],
};
