import CredentialsProvider from "next-auth/providers/credentials";
import { compare } from "bcryptjs";
import { prisma } from "@/lib/prisma";
import type { NextAuthOptions } from "next-auth";

// Mapa de cargo → rol de aplicativo
function cargoToRol(cargo: string): string {
  const c = cargo.trim().toLowerCase();
  if (c === "gerente de sucursal") return "admin";
  if (c === "subgerente") return "operador";
  // Asesor Comercial, Cajero, Analista de Crédito → asesor
  return "asesor";
}

export const authOptions: NextAuthOptions = {
  session: { strategy: "jwt" },
  pages: {
    signIn: "/login",
  },
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Contraseña", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;

        const email = credentials.email.toLowerCase().trim();
        const password = credentials.password;

        // 1. Buscar en tabla cliente
        const cliente = await prisma.cliente.findFirst({
          where: { email },
        });

        if (cliente) {
          if (!cliente.password_hash) return null;
          const valid = await compare(password, cliente.password_hash);
          if (!valid) return null;
          return {
            id: String(cliente.id_cliente),
            name: `${cliente.nombres} ${cliente.apellidos}`,
            email: cliente.email ?? email,
            rol: "cliente",
            tipo: "cliente",
          };
        }

        // 2. Buscar en tabla empleado
        const empleado = await prisma.empleado.findFirst({
          where: { email },
        });

        if (empleado) {
          if (!empleado.password_hash) return null;
          const valid = await compare(password, empleado.password_hash);
          if (!valid) return null;
          return {
            id: String(empleado.id_empleado),
            name: `${empleado.nombres} ${empleado.apellidos}`,
            email: empleado.email ?? email,
            rol: cargoToRol(empleado.cargo),
            tipo: "empleado",
            cargo: empleado.cargo,
          };
        }

        return null;
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.rol = user.rol;
        token.tipo = user.tipo;
        token.cargo = user.cargo ?? null;
      }
      return token;
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.sub ?? "";
        session.user.rol = token.rol ?? "cliente";
        session.user.tipo = token.tipo ?? "cliente";
        session.user.cargo = token.cargo ?? null;
      }
      return session;
    },
  },
};
