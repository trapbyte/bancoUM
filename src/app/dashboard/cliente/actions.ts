"use server";

import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

/** Helper to grab current safe user ID */
async function requireUser() {
  const session = await getServerSession(authOptions);
  const userId = parseInt(session?.user?.id ?? "0", 10);
  if (!userId) throw new Error("No autenticado");
  return userId;
}

/** 1. Create Randomized Bank Account */
export async function createAccountAction(formData: FormData) {
  const userId = await requireUser();
  const tipoCuentaStr = formData.get("tipoC") as string;

  // Verify Limit Max 3
  const currentCount = await prisma.cliente_cuenta.count({
    where: { id_cliente: userId }
  });

  if (currentCount >= 3) {
    return { error: "Límite Excedido: Solo puedes tener 3 cuentas activas." };
  }

  // Get true ID of tipo_cuenta
  const tipoRow = await prisma.tipo_cuenta.findUnique({ where: { tipo: tipoCuentaStr as any } });
  if (!tipoRow) return { error: "Tipo de cuenta no disponible." };

  const isCredit = tipoCuentaStr === "TARJETA_CREDITO";

  // Create Random Math Values (COP Math)
  const getRandomBetween = (min: number, max: number) => Math.floor(Math.random() * (max - min + 1)) + min;
  
  let saldoInicial = isCredit ? 0 : getRandomBetween(1000, 5000000);
  let cupoInicial = isCredit ? getRandomBetween(1000000, 15000000) : null;

  // Generate 12 digits realistic random account number string
  const numCuenta = Math.random().toString().slice(2, 14);

  // Execute Tx
  await prisma.$transaction(async (tx) => {
     const nuevaCuenta = await tx.cuenta.create({
       data: {
         id_cliente: userId,
         numero_cuenta: numCuenta,
         id_tipo_cuenta: tipoRow.id_tipo_cuenta,
         saldo: saldoInicial,
         limite_credito: cupoInicial,
         fecha_apertura: new Date(),
         estado: "ACTIVA"
       }
     });

     await tx.cliente_cuenta.create({
       data: {
         id_cliente: userId,
         id_cuenta: nuevaCuenta.id_cuenta,
         titular_principal: true
       }
     });
  });

  revalidatePath("/dashboard/cliente/cuentas");
  revalidatePath("/dashboard/cliente");
  return { success: true };
}

/** 2. Perform Deposit or Transfer */
export async function executeTransactionAction(formData: FormData) {
  const userId = await requireUser();
  const originAccountId = parseInt(formData.get("id_cuenta_origen") as string);
  const rawAmount = parseFloat(formData.get("monto") as string);
  const tipoTx = formData.get("tipo_tx") as string; // 'DEPOSITO' || 'TRANSFERENCIA'
  const destinonum = formData.get("destino_num") as string;

  if (!originAccountId || !rawAmount || rawAmount <= 0) return { error: "Parámetros inválidos." };

  const origen = await prisma.cuenta.findUnique({ where: { id_cuenta: originAccountId } });
  if (!origen || origen.id_cliente !== userId || origen.estado !== "ACTIVA") return { error: "Cuenta de origen inactiva o no autorizada." };

  const isCredit = origen.id_tipo_cuenta === 3; // Tipica tarjeta credito

  // === BRANCH DEPOSIT ===
  if (tipoTx === "DEPOSITO" || tipoTx === "PAGO") {
    let fondAccountId = -1;

    // Validación estricta para PAGO DE TARJETAS
    if (tipoTx === "PAGO") {
       fondAccountId = parseInt(formData.get("id_cuenta_origen_fondos") as string);
       if (!fondAccountId) return { error: "Debes seleccionar una cuenta de fondos de origen válida." };
       
       const cuentaFondos = await prisma.cuenta.findUnique({ where: { id_cuenta: fondAccountId } });
       if (!cuentaFondos || Number(cuentaFondos.saldo) < rawAmount) {
           return { error: "Fondos insuficientes en la cuenta bancaria de origen para realizar este pago." };
       }

       if (isCredit) {
           const deudaActual = Number(origen.saldo);
           if (rawAmount > deudaActual) {
               return { error: `No puedes realizar un pago superior a tu deuda actual ($${deudaActual.toLocaleString('es-CO')} COP).` };
           }
       }
    }

    const nuevoSaldo = isCredit ? Math.max(0, Number(origen.saldo) - rawAmount) : Number(origen.saldo) + rawAmount;

    await prisma.$transaction(async (tx) => {
      // 1. Extraer los fondos de la cuenta seleccionada si es un PAGO real
      if (tipoTx === "PAGO") {
         const cuentaFnd = await tx.cuenta.findUnique({ where: { id_cuenta: fondAccountId } });
         await tx.cuenta.update({
            where: { id_cuenta: fondAccountId },
            data: { saldo: Number(cuentaFnd?.saldo || 0) - rawAmount }
         });
      }

      // 2. Aplicar el pago a la Tarjeta / Cuenta de Destino
      await tx.cuenta.update({
        where: { id_cuenta: originAccountId },
        data: { saldo: nuevoSaldo }
      });

      // 3. Registrar el movimiento explicitando de dónde salieron los fondos si fue un PAGO
      await tx.movimiento.create({
        data: {
          tipo: tipoTx as any,
          monto: rawAmount,
          id_cuenta_destino: originAccountId,
          ...(tipoTx === "PAGO" ? { id_cuenta_origen: fondAccountId } : {}),
          estado: "CONFIRMADO",
          descripcion: isCredit && tipoTx === "PAGO" ? "Abono / Pago de Tarjeta de Crédito" : "Depósito Consignación Virtual"
        }
      });
    });
    
    revalidatePath("/dashboard/cliente/cuentas");
    revalidatePath("/dashboard/cliente/movimientos");
    return { success: true };
  }

  // === BRANCH COMPRA TC ===
  if (tipoTx === "COMPRA_TARJETA") {
    if (!isCredit) return { error: "Compra no aplicable." };
    const saldoActual = Number(origen.saldo);
    const limite = Number(origen.limite_credito ?? 0);
    
    if (saldoActual + rawAmount > limite) {
       await prisma.movimiento.create({
         data: {
           tipo: "COMPRA_TARJETA",
           monto: rawAmount,
           id_cuenta_origen: originAccountId,
           estado: "RECHAZADO",
           descripcion: "CUPOS INSUFICIENTES - RECHAZADA",
           fecha: new Date(),
         }
       });
       revalidatePath("/dashboard/cliente/movimientos");
       return { error: "Fondos Insuficientes. Se registró el intento de compra rechazado." };
    }

    await prisma.$transaction(async (tx) => {
      await tx.cuenta.update({
        where: { id_cuenta: originAccountId },
        data: { saldo: saldoActual + rawAmount }
      });

      await tx.movimiento.create({
         data: {
           tipo: "COMPRA_TARJETA",
           monto: rawAmount,
           id_cuenta_origen: originAccountId,
           estado: "CONFIRMADO",
           descripcion: "Compra con Tarjeta",
           fecha: new Date(),
         }
       });
    });

    revalidatePath("/dashboard/cliente/cuentas");
    revalidatePath("/dashboard/cliente/movimientos");
    return { success: true };
  }

  // === BRANCH TRANSFERENCIA ===
  if (tipoTx === "TRANSFERENCIA") {
    // Find destino
    const destinoCuenta = await prisma.cuenta.findUnique({ where: { numero_cuenta: destinonum } });
    if (!destinoCuenta || destinoCuenta.estado !== "ACTIVA") return { error: "Cuenta destino no disponible o bloqueada." };

    // Validar Saldo Disponible (Rejection Path)
    // Para ahorro: saldo >= monto. Para crédito: saldo + monto <= limite
    const saldoActual = Number(origen.saldo);
    
    let hasFunds = false;
    if (isCredit) {
       const limite = Number(origen.limite_credito ?? 0);
       hasFunds = (saldoActual + rawAmount) <= limite;
    } else {
       hasFunds = saldoActual >= rawAmount;
    }

    if (!hasFunds) {
       // Log Rejected Tx!
       await prisma.movimiento.create({
         data: {
           tipo: "TRANSFERENCIA",
           monto: rawAmount,
           id_cuenta_origen: originAccountId,
           id_cuenta_destino: destinoCuenta.id_cuenta,
           estado: "RECHAZADO",
           descripcion: "FONDOS INSUFICIENTES",
           fecha: new Date(),
         }
       });
       revalidatePath("/dashboard/cliente/movimientos");
       return { error: "Fondos Insuficientes. Se ha registrado el intento en el historial como RECHAZADO." };
    }

    // Success Transfer Path
    const targetIsCredit = destinoCuenta.id_tipo_cuenta === 3;
    
    await prisma.$transaction(async (tx) => {
      // 1. Quitar al origen
      await tx.cuenta.update({
        where: { id_cuenta: originAccountId },
        data: { saldo: isCredit ? saldoActual + rawAmount : saldoActual - rawAmount }
      });

      // 2. Sumar al destino
      const dSact = Number(destinoCuenta.saldo);
      await tx.cuenta.update({
         where: { id_cuenta: destinoCuenta.id_cuenta },
         data: { saldo: targetIsCredit ? Math.max(0, dSact - rawAmount) : dSact + rawAmount }
      });

      // 3. Log
      await tx.movimiento.create({
         data: {
           tipo: "TRANSFERENCIA",
           monto: rawAmount,
           id_cuenta_origen: originAccountId,
           id_cuenta_destino: destinoCuenta.id_cuenta,
           estado: "CONFIRMADO",
           descripcion: "Transferencia Exitosa",
           fecha: new Date(),
         }
       });
    });

    revalidatePath("/dashboard/cliente/cuentas");
    revalidatePath("/dashboard/cliente/movimientos");
    return { success: true };
  }

  return { error: "Mala petición" };
}
