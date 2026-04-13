"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function updateTipoCuentaAction(
  id: number,
  tasaInteres: number | null,
  cuotaManejo: number | null,
  permiteSobregiro: boolean
) {
  try {
    await prisma.tipo_cuenta.update({
      where: { id_tipo_cuenta: id },
      data: {
        tasa_interes: tasaInteres,
        cuota_manejo: cuotaManejo,
        permite_sobregiro: permiteSobregiro,
      },
    });
    
    revalidatePath("/dashboard/operador/catalogos");
    return { success: true };
  } catch (err) {
    console.error("Error updating tipo_cuenta rules:", err);
    throw new Error("No se pudo actualizar las reglas del catálogo.");
  }
}
