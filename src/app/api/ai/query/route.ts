/**
 * /api/ai/query — API Route del Asistente IA de BancoUM
 *
 * POST { pregunta: string }
 * → genera SQL con Ollama → valida → ejecuta en Supabase → respuesta natural → TTS ElevenLabs
 * → audita la consulta → retorna { sql, results, respuesta, audio_base64 }
 */

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import {
  generateSQL,
  validateSQL,
  generateNaturalResponse,
  textToSpeech,
} from "@/lib/ai-utils";

export async function POST(req: NextRequest) {
  try {
    // ── Autenticación ────────────────────────────────────────────────────────
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "No autenticado." }, { status: 401 });
    }

    // ── Input ────────────────────────────────────────────────────────────────
    const body = await req.json();
    const pregunta: string = (body.pregunta ?? "").trim();

    if (!pregunta || pregunta.length < 3) {
      return NextResponse.json(
        { error: "La pregunta es demasiado corta." },
        { status: 400 }
      );
    }

    // ── 1. Generación de SQL con Ollama ──────────────────────────────────────
    let sql: string;
    try {
      sql = await generateSQL(pregunta);
    } catch (err) {
      console.error("Ollama generateSQL error:", err);
      return NextResponse.json(
        { error: "No se pudo conectar con el modelo IA. Verifica que Ollama esté corriendo." },
        { status: 503 }
      );
    }

    // Manejar caso en que Ollama dice NO_QUERY
    if (sql.includes("NO_QUERY")) {
      return NextResponse.json({
        sql: "",
        results: [],
        respuesta:
          "No pude traducir tu pregunta a una consulta válida sobre los datos del banco. Intenta reformular tu pregunta.",
        audio_base64: await textToSpeech(
          "No pude encontrar información relevante para tu consulta. Intenta reformular tu pregunta."
        ),
      });
    }

    // Limpiar posibles bloques de código que el modelo incluya
    sql = sql
      .replace(/```sql/gi, "")
      .replace(/```/g, "")
      .trim();

    // ── 2. Validación SQL ────────────────────────────────────────────────────
    const validation = validateSQL(sql);
    if (!validation.valid) {
      const mensajeError =
        `Operación no permitida: ${validation.reason} El asistente solo puede realizar consultas de lectura.`;

      // Auditar el intento bloqueado
      await auditarConsulta(
        session.user.email ?? "unknown",
        pregunta,
        sql,
        "BLOCKED"
      );

      return NextResponse.json({
        sql,
        results: [],
        respuesta: mensajeError,
        audio_base64: await textToSpeech(mensajeError),
        error: validation.reason,
      });
    }

    // ── 3. Ejecución de la consulta ──────────────────────────────────────────
    let results: Record<string, unknown>[] = [];
    try {
      results = await prisma.$queryRawUnsafe(sql) as Record<string, unknown>[];
      // Convertir BigInt a string para serialización JSON
      results = JSON.parse(
        JSON.stringify(results, (_key, value) =>
          typeof value === "bigint" ? value.toString() : value
        )
      );
    } catch (err) {
      console.error("SQL execution error:", err);

      const errMsg = "Hubo un error al ejecutar la consulta en la base de datos. El SQL generado puede no ser válido.";
      return NextResponse.json({
        sql,
        results: [],
        respuesta: errMsg,
        audio_base64: await textToSpeech(errMsg),
        error: String(err),
      });
    }

    // ── 4. Respuesta en lenguaje natural ─────────────────────────────────────
    const respuesta = await generateNaturalResponse(pregunta, sql, results);

    // ── 5. Text-to-Speech con ElevenLabs ─────────────────────────────────────
    const audio_base64 = await textToSpeech(respuesta);

    // ── 6. Auditoría ─────────────────────────────────────────────────────────
    await auditarConsulta(
      session.user.email ?? "unknown",
      pregunta,
      sql,
      "OK",
      results.length
    );

    // ── 7. Respuesta ─────────────────────────────────────────────────────────
    return NextResponse.json({ sql, results, respuesta, audio_base64 });
  } catch (err) {
    console.error("AI query route error:", err);
    return NextResponse.json(
      { error: "Error interno del servidor." },
      { status: 500 }
    );
  }
}

// ──────────────────────────────────────────────────────────────────────────────
// Helper: auditar la consulta en auditoria_movimiento
// ──────────────────────────────────────────────────────────────────────────────
async function auditarConsulta(
  usuario: string,
  pregunta: string,
  sql: string,
  estado: "OK" | "BLOCKED",
  numResultados?: number
) {
  try {
    await prisma.auditoria_movimiento.create({
      data: {
        usuario_bd: `ia:${usuario}`,
        accion: "IA_QUERY",
        datos_nuevos: {
          pregunta,
          sql_generado: sql,
          estado,
          num_resultados: numResultados ?? 0,
          timestamp: new Date().toISOString(),
        },
      },
    });
  } catch (err) {
    // La auditoría no debe romper el flujo principal
    console.error("Audit error:", err);
  }
}
