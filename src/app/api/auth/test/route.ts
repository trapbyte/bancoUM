import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const conteoClientes = await prisma.cliente.count();
    
    // Obtener algunos tipos de cuenta disponibles en el banco
    const tiposCuenta = await prisma.tipo_cuenta.findMany({
      select: {
        tipo: true,
      },
    });

    const nombresTipos = tiposCuenta.map((tc) => tc.tipo);

    return NextResponse.json({
      success: true,
      data: {
        totalClientes: conteoClientes,
        tiposDeCuenta: nombresTipos,
      },
    });
  } catch (error: any) {
    console.error("Error al conectar con la base de datos:", error);
    return NextResponse.json(
      {
        success: false,
        error: "No se pudo conectar a la base de datos o ejecutar la consulta.",
        details: error.message,
      },
      { status: 500 }
    );
  }
}
