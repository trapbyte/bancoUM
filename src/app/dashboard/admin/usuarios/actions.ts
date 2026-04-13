"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function toggleEmpleadoStatusAction(idEmpleado: number, currentStatus: boolean) {
  try {
    await prisma.empleado.update({
      where: { id_empleado: idEmpleado },
      data: { activo: !currentStatus },
    });
    revalidatePath("/dashboard/admin/usuarios");
    return { success: true };
  } catch (err) {
    console.error("Error toggling empleado status:", err);
    throw new Error("No se pudo suspender o activar el empleado.");
  }
}
