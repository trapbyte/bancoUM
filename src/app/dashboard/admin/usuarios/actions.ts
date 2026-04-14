"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import bcrypt from "bcryptjs";

export async function upsertEmpleadoAction(data: {
  id_empleado?: number;
  nombres: string;
  apellidos: string;
  tipo_documento: string;
  numero_documento: string;
  email: string;
  cargo: string;
  id_punto?: number;
}) {
  try {
    const isNew = !data.id_empleado;

    // Default payload that applies to both CREATE and UPDATE
    const payload = {
      nombres: data.nombres,
      apellidos: data.apellidos,
      tipo_documento: data.tipo_documento,
      numero_documento: data.numero_documento,
      email: data.email,
      cargo: data.cargo,
    };

    if (isNew) {
      // Set initial password using Document Number
      const hashedPassword = await bcrypt.hash(data.numero_documento, 10);
      
      await prisma.empleado.create({
        data: {
          ...payload,
          fecha_contratacion: new Date(),
          password_hash: hashedPassword,
          ...(data.id_punto ? {
              empleado_punto: {
                  create: {
                      id_punto: data.id_punto,
                      fecha_inicio: new Date(),
                  }
              }
          } : {})
        }
      });
    } else {
      await prisma.empleado.update({
        where: { id_empleado: data.id_empleado },
        data: payload
      });
    }

    revalidatePath("/dashboard/admin/usuarios");

    // Non-fatal audit log
    try {
      await prisma.auditoria_movimiento.create({
        data: {
          usuario_bd: "sysadmin",
          accion: isNew ? "INSERT" : "UPDATE",
          datos_nuevos: { tabla: "empleado", cargo: data.cargo, numero_documento: data.numero_documento },
        }
      });
    } catch {}

    return { success: true };
  } catch (err: any) {
    console.error("Error upserting empleado:", err);
    throw new Error(err.message || "Error al procesar el empleado en la base de datos.");
  }
}

export async function toggleEmpleadoStatusAction(idEmpleado: number, currentStatus: boolean) {
  try {
    await prisma.empleado.update({
      where: { id_empleado: idEmpleado },
      data: { activo: !currentStatus },
    });
    revalidatePath("/dashboard/admin/usuarios");
    
    try {
      await prisma.auditoria_movimiento.create({
        data: {
          usuario_bd: "sysadmin",
          accion: "UPDATE",
          datos_nuevos: { tabla: "empleado", id_empleado: idEmpleado, activo: !currentStatus },
        }
      });
    } catch {}

    return { success: true };
  } catch (err) {
    console.error("Error toggling empleado status:", err);
    throw new Error("No se pudo suspender o activar el empleado.");
  }
}
