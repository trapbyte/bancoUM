import { NextResponse } from "next/server";
import { hash } from "bcryptjs";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { nombre, email, password } = body as {
      nombre: string;
      email: string;
      password: string;
    };

    if (!nombre || !email || !password) {
      return NextResponse.json(
        { error: "Todos los campos son obligatorios." },
        { status: 400 }
      );
    }

    // Verificar si el email ya está registrado (cliente o empleado)
    const existeCliente = await prisma.cliente.findFirst({ where: { email } });
    const existeEmpleado = await prisma.empleado.findFirst({ where: { email } });

    if (existeCliente || existeEmpleado) {
      return NextResponse.json(
        { error: "Ya existe una cuenta con este correo electrónico." },
        { status: 409 }
      );
    }

    const password_hash = await hash(password, 12);

    const [nombres, ...apellidosParts] = nombre.trim().split(" ");
    const apellidos = apellidosParts.join(" ") || "—";

    const nuevoCliente = await prisma.cliente.create({
      data: {
        tipo_documento: "CC",
        numero_documento: `WEB-${Date.now()}`, // temporal hasta que el asesor complete el perfil
        nombres,
        apellidos,
        fecha_nacimiento: new Date("2000-01-01"), // placeholder
        email,
        password_hash,
      },
    });

    return NextResponse.json(
      { ok: true, id: nuevoCliente.id_cliente },
      { status: 201 }
    );
  } catch (err) {
    console.error("[REGISTRO_ERROR]", err);
    return NextResponse.json(
      { error: "Error interno del servidor." },
      { status: 500 }
    );
  }
}
