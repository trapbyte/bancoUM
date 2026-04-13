import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

// GET /api/export?type=movimientos|clientes|cuentas&q=term
export async function GET(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const type = searchParams.get("type");
  const q = searchParams.get("q")?.trim() || "";

  try {
    if (type === "movimientos") {
      const whereFilter: any = q ? {
        OR: [
          { referencia_externa: { contains: q, mode: "insensitive" } },
          { descripcion: { contains: q, mode: "insensitive" } },
          { cuenta_movimiento_id_cuenta_origenTocuenta: { numero_cuenta: { contains: q } } },
          { cuenta_movimiento_id_cuenta_destinoTocuenta: { numero_cuenta: { contains: q } } },
        ]
      } : {};

      const rows = await prisma.movimiento.findMany({
        where: whereFilter,
        orderBy: { fecha: "desc" },
        include: {
          cuenta_movimiento_id_cuenta_origenTocuenta: { select: { numero_cuenta: true } },
          cuenta_movimiento_id_cuenta_destinoTocuenta: { select: { numero_cuenta: true } },
          punto_atencion: { select: { nombre: true, tipo: true } }
        },
        take: 5000,
      });

      const data = rows.map(m => ({
        id: m.referencia_externa || m.id_movimiento.toString(),
        fecha: m.fecha ? new Date(m.fecha).toLocaleString() : "N/A",
        tipo: m.tipo.replace("_", " "),
        origen: m.cuenta_movimiento_id_cuenta_origenTocuenta?.numero_cuenta || "Externo",
        destino: m.cuenta_movimiento_id_cuenta_destinoTocuenta?.numero_cuenta || "Externo",
        monto: Number(m.monto),
        estado: m.estado,
        punto: m.punto_atencion ? `${m.punto_atencion.nombre} (${m.punto_atencion.tipo})` : "Canal Digital"
      }));

      return NextResponse.json({ data });
    }

    if (type === "clientes") {
      const whereFilter: any = q ? {
        OR: [
          { nombres: { contains: q, mode: "insensitive" } },
          { apellidos: { contains: q, mode: "insensitive" } },
          { numero_documento: { contains: q } },
          { email: { contains: q, mode: "insensitive" } },
        ]
      } : {};

      const rows = await prisma.cliente.findMany({
        where: whereFilter,
        orderBy: { fecha_registro: "desc" },
        include: { barrio: { include: { comuna: { include: { municipio: true } } } } },
        take: 5000,
      });

      const data = rows.map(c => ({
        id: c.id_cliente,
        nombre: `${c.nombres} ${c.apellidos}`,
        doc: `${c.tipo_documento} ${c.numero_documento}`,
        email: c.email || "N/A",
        tel: c.telefono || "N/A",
        fecha: c.fecha_registro ? new Date(c.fecha_registro).toLocaleDateString() : "N/A",
        ubicacion: c.barrio ? `${c.barrio.nombre}, ${c.barrio.comuna.municipio.nombre}` : "N/A"
      }));

      return NextResponse.json({ data });
    }

    if (type === "cuentas") {
      const whereFilter: any = q ? {
        OR: [
          { numero_cuenta: { contains: q } },
          { cliente: { nombres: { contains: q, mode: "insensitive" } } },
          { cliente: { apellidos: { contains: q, mode: "insensitive" } } },
          { cliente: { numero_documento: { contains: q } } },
        ]
      } : {};

      const rows = await prisma.cuenta.findMany({
        where: whereFilter,
        orderBy: { fecha_apertura: "desc" },
        include: { cliente: true, tipo_cuenta: true },
        take: 5000,
      });

      const data = rows.map(c => ({
        num: c.numero_cuenta,
        cliente: c.cliente
          ? `${c.cliente.nombres} ${c.cliente.apellidos} (${c.cliente.numero_documento})`
          : "Sin titular",
        tipo: c.tipo_cuenta?.tipo.replace("_", " ") ?? "N/A",
        saldo: Number(c.saldo),
        estado: c.estado,
        fecha: c.fecha_apertura ? new Date(c.fecha_apertura).toLocaleDateString() : "N/A"
      }));

      return NextResponse.json({ data });
    }

    if (type === "empleados") {
      const whereFilter: any = q ? {
        OR: [
          { nombres: { contains: q, mode: "insensitive" } },
          { apellidos: { contains: q, mode: "insensitive" } },
          { numero_documento: { contains: q } },
          { cargo: { contains: q, mode: "insensitive" } },
        ]
      } : {};

      const rows = await prisma.empleado.findMany({
        where: whereFilter,
        orderBy: { fecha_contratacion: "desc" },
        include: {
          empleado_punto: { include: { punto_atencion: { select: { nombre: true } } } }
        },
        take: 5000,
      });

      const data = rows.map(emp => ({
        doc: emp.numero_documento,
        nombre: `${emp.nombres} ${emp.apellidos}`,
        cargo: emp.cargo.replace(/_/g, " "),
        email: emp.email || "N/A",
        estado: emp.activo ? "Activo" : "Retirado",
        asignaciones: emp.empleado_punto.length > 0 
          ? emp.empleado_punto.map(ep => ep.punto_atencion.nombre).join(" | ")
          : "Sin asignar",
        contratacion: emp.fecha_contratacion ? new Date(emp.fecha_contratacion).toLocaleDateString() : "N/A"
      }));

      return NextResponse.json({ data });
    }

    return NextResponse.json({ error: "Invalid type" }, { status: 400 });
  } catch (err) {
    console.error("[export-api]", err);
    return NextResponse.json({ error: "Error fetching data" }, { status: 500 });
  }
}
