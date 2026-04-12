/**
 * Script de seed para asignar contraseñas temporales a empleados y clientes existentes.
 * 
 * Ejecutar con:  npx ts-node --skip-project scripts/seed-auth.ts
 * 
 * Contraseña temporal asignada: BancoUM2025!
 */

import { PrismaClient } from "@prisma/client";
import { hash } from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const TEMP_PASSWORD = "BancoUM2025!";
  const hashed = await hash(TEMP_PASSWORD, 12);

  console.log("🔑 Hash generado para 'BancoUM2025!':", hashed);

  // ── Empleados ──────────────────────────────────────────────────────────────
  const empleadosSinEmail = await prisma.empleado.findMany({
    where: { email: null },
    select: { id_empleado: true, numero_documento: true },
  });

  console.log(`\n👔 Empleados sin email: ${empleadosSinEmail.length}`);

  for (const emp of empleadosSinEmail) {
    await prisma.empleado.update({
      where: { id_empleado: emp.id_empleado },
      data: {
        email: `usr_${emp.numero_documento}@bancoum.edu.co`,
        password_hash: hashed,
      },
    });
  }

  // Empleados que tienen email pero no password
  const empleadosSinPass = await prisma.empleado.updateMany({
    where: { password_hash: null, email: { not: null } },
    data: { password_hash: hashed },
  });

  console.log(`✅ Empleados actualizados (email generado): ${empleadosSinEmail.length}`);
  console.log(`✅ Empleados actualizados (solo password): ${empleadosSinPass.count}`);

  // ── Clientes ───────────────────────────────────────────────────────────────
  const clientesActualizados = await prisma.cliente.updateMany({
    where: {
      password_hash: null,
      email: { not: null },
    },
    data: { password_hash: hashed },
  });

  console.log(`\n👤 Clientes actualizados (con email): ${clientesActualizados.count}`);

  const clientesSinEmail = await prisma.cliente.count({
    where: { email: null },
  });

  if (clientesSinEmail > 0) {
    console.log(`⚠️  ${clientesSinEmail} clientes sin email registrado — no se les asignó password.`);
    console.log("   El Asesor deberá completar sus datos desde el dashboard.");
  }

  console.log("\n🎉 Seed completado. Contraseña temporal: BancoUM2025!");
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); });
