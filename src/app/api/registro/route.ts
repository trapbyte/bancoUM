import { NextResponse } from "next/server";
import { hash } from "bcryptjs";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { 
      nombre, 
      email, 
      password,
      tipoDocumento,
      numeroDocumento,
      fechaNacimiento,
      telefono,
      idBarrio,
      ingresosEstimados, 
      productoDeseado      
    } = body;

    // Verificar si el email ya está registrado
    const existeClienteEmail = await prisma.cliente.findFirst({ where: { email } });
    if (existeClienteEmail) return NextResponse.json({ error: "Ya existe una cuenta con este correo." }, { status: 409 });

    const password_hash = await hash(password, 12);

    const partesNombre = nombre.trim().split(" ");
    let nNombres = nombre;
    let nApellidos = "\u2014";
    if (partesNombre.length > 2) {
      nNombres = partesNombre.slice(0, 2).join(" ");
      nApellidos = partesNombre.slice(2).join(" ");
    } else if (partesNombre.length === 2) {
      nNombres = partesNombre[0];
      nApellidos = partesNombre[1];
    }

    console.log(">> Ingresos del cliente:", ingresosEstimados);
    console.log(">> Producto deseado por el cliente:", productoDeseado);

    const nuevoCliente = await prisma.cliente.create({
      data: {
        tipo_documento: tipoDocumento,
        numero_documento: numeroDocumento,
        nombres: nNombres,
        apellidos: nApellidos,
        fecha_nacimiento: new Date(fechaNacimiento),
        email,
        telefono,
        id_barrio: parseInt(idBarrio, 10),
        password_hash,
      },
    });

    return NextResponse.json({ ok: true, id: nuevoCliente.id_cliente }, { status: 201 });
  } catch (err) {
    console.error("[REGISTRO_ERROR]", err);
    return NextResponse.json({ error: "Error interno procesando el registro definitivo." }, { status: 500 });
  }
}
