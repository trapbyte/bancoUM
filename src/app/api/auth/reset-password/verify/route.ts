import { NextResponse } from "next/server";
import { hash } from "bcryptjs";
import { prisma } from "@/lib/prisma";

const globalAny: any = global;

export async function POST(req: Request) {
  try {
    const { email, otp, newPassword } = await req.json();

    if (!email || !otp || !newPassword) {
      return NextResponse.json({ error: "Faltan datos obligatorios." }, { status: 400 });
    }

    if (!globalAny.otpStore) {
      return NextResponse.json({ error: "El código es inválido o ha expirado." }, { status: 400 });
    }

    const key = `reset_${email}`;
    const stored = globalAny.otpStore.get(key);

    if (!stored) {
      return NextResponse.json({ error: "El código es inválido o ha expirado." }, { status: 400 });
    }

    if (Date.now() > stored.expires) {
      globalAny.otpStore.delete(key);
      return NextResponse.json({ error: "El código de verificación ha expirado." }, { status: 400 });
    }

    if (stored.otp !== otp) {
      return NextResponse.json({ error: "El código no coincide." }, { status: 400 });
    }

    // Hash the new password
    const password_hash = await hash(newPassword, 12);

    let cliente = await prisma.cliente.findFirst({ where: { email } });
    if (cliente) {
      await prisma.cliente.update({
        where: { id_cliente: cliente.id_cliente },
        data: { password_hash },
      });
    } else {
      let empleado = await prisma.empleado.findFirst({ where: { email } });
      if (empleado) {
        await prisma.empleado.update({
          where: { id_empleado: empleado.id_empleado },
          data: { password_hash },
        });
      } else {
         return NextResponse.json({ error: "Cuenta no encontrada." }, { status: 404 });
      }
    }

    // Invalidar OTP
    globalAny.otpStore.delete(key);

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[RESET_ERROR]", err);
    return NextResponse.json({ error: "Error interno al reestablecer la contraseña." }, { status: 500 });
  }
}