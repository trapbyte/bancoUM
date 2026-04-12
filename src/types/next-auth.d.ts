import "next-auth";
import "next-auth/jwt";

/**
 * Augmentación global de tipos de NextAuth.
 * Añade los campos personalizados `rol`, `tipo` y `cargo`
 * a Session, User y JWT para que TypeScript los reconozca en todo el proyecto.
 */
declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      name?: string | null;
      email?: string | null;
      image?: string | null;
      /** Rol del aplicativo: 'cliente' | 'asesor' | 'operador' | 'admin' */
      rol: string;
      /** Fuente del usuario: 'cliente' | 'empleado' */
      tipo: string;
      /** Cargo del empleado (null para clientes) */
      cargo?: string | null;
    };
  }

  interface User {
    /** Rol del aplicativo derivado del cargo o fijo 'cliente' */
    rol: string;
    /** Fuente del usuario en la BD */
    tipo: string;
    /** Cargo del empleado, si aplica */
    cargo?: string | null;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    rol?: string;
    tipo?: string;
    cargo?: string | null;
  }
}
