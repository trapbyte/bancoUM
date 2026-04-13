"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function togglePuntoActivoAction(puntoId: number, newState: boolean) {
  try {
    await prisma.punto_atencion.update({
      where: { id_punto: puntoId },
      data: { activo: newState },
    });
    revalidatePath("/dashboard/operador/puntos");
    return { success: true };
  } catch (err) {
    console.error("Error toggling punto state:", err);
    throw new Error("No se pudo actualizar el estado del punto de atención");
  }
}
