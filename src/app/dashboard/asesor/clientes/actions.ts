"use server";

import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { hash } from "bcryptjs";

export async function upsertClienteAdmin(formData: FormData) {
  const session = await getServerSession(authOptions);
  
  if (!session || (session.user.tipo !== "empleado" || (session.user.rol !== "admin" && session.user.rol !== "asesor"))) {
    throw new Error("No autorizado");
  }

  const id = formData.get("id_cliente")?.toString();
  const nombres = formData.get("nombres")?.toString();
  const apellidos = formData.get("apellidos")?.toString();
  const tipo_documento = formData.get("tipo_documento")?.toString();
  const numero_documento = formData.get("numero_documento")?.toString();
  const email = formData.get("email")?.toString();
  const telefono = formData.get("telefono")?.toString();
  const id_barrio = formData.get("id_barrio")?.toString();
  const fecha_nacimiento = formData.get("fecha_nacimiento")?.toString();
  const password = formData.get("password")?.toString(); // Opcional, solo si es nuevo o quiere cambiar
  
  if (!nombres || !apellidos || !tipo_documento || !numero_documento || !email || !fecha_nacimiento || !id_barrio) {
    throw new Error("Faltan datos obligatorios");
  }

  try {
    const data: any = {
      nombres,
      apellidos,
      tipo_documento,
      numero_documento,
      email,
      telefono: telefono || null,
      id_barrio: parseInt(id_barrio, 10),
      fecha_nacimiento: new Date(fecha_nacimiento),
    };

    if (password) {
      data.password_hash = await hash(password, 10);
    }

    if (id) {
      // Modificar
      await prisma.cliente.update({
        where: { id_cliente: parseInt(id, 10) },
        data,
      });
    } else {
      // Crear
      if (!password) {
         data.password_hash = await hash(numero_documento, 10); // Default pass is their ID
      }
      await prisma.cliente.create({
        data,
      });
    }

    revalidatePath("/dashboard/asesor/clientes");
    return { success: true };
  } catch (error: any) {
    console.error("Error upserting cliente:", error);
    return { success: false, error: "Hubo un error al guardar el cliente" };
  }
}

export async function toggleActivoCliente(id: number, activo: boolean) {
  const session = await getServerSession(authOptions);
  
  if (!session || (session.user.tipo !== "empleado" || (session.user.rol !== "admin" && session.user.rol !== "asesor"))) {
    throw new Error("No autorizado");
  }

  try {
    await prisma.cliente.update({
      where: { id_cliente: id },
      data: { activo },
    });
    revalidatePath("/dashboard/asesor/clientes");
    return { success: true };
  } catch (error) {
    console.error("Error toggling:", error);
    return { success: false, error: "Error al cambiar estado" };
  }
}
