"use server";

import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { revalidatePath } from "next/cache";

export async function updatePerfilCliente(formData: FormData) {
  const session = await getServerSession(authOptions);
  
  if (!session || session.user.tipo !== "cliente") {
    throw new Error("No autorizado");
  }

  const id = parseInt(session.user.id, 10);
  const email = formData.get("email")?.toString();
  const telefono = formData.get("telefono")?.toString();

  if (!email || !telefono) {
    throw new Error("Faltan datos obligatorios");
  }

  try {
    await prisma.cliente.update({
      where: { id_cliente: id },
      data: {
        email,
        telefono,
      },
    });

    revalidatePath("/dashboard/cliente/perfil");
    return { success: true };
  } catch (error) {
    console.error("Error actualizando perfil:", error);
    return { success: false, error: "Hubo un error actualizando el perfil" };
  }
}
