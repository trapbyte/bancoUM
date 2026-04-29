/**
 * ai-utils.ts  (Server-side only — NO "use client")
 * Funciones de utilidad para el asistente IA de BancoUM.
 * - Generación de SQL con Ollama (llama3.2)
 * - Validación de SQL (solo SELECT)
 * - Generación de respuesta en lenguaje natural
 * - Text-to-speech con ElevenLabs
 */

// ──────────────────────────────────────────────────────────────────────────────
// Schema context: descripción de tablas para el prompt de Ollama
// ──────────────────────────────────────────────────────────────────────────────
export const SCHEMA_CONTEXT = `
Eres un experto en SQL para PostgreSQL.
Tienes acceso a la siguiente base de datos de un banco colombiano llamado "BancoUM".

TABLAS:
- cliente (id_cliente, tipo_documento, numero_documento, nombres, apellidos, fecha_nacimiento, email, telefono, id_barrio, fecha_registro, activo, password_hash)
- cuenta (id_cuenta, numero_cuenta, id_tipo_cuenta, saldo, limite_credito, fecha_apertura, estado, id_cliente)
- tipo_cuenta (id_tipo_cuenta, tipo [AHORROS|CORRIENTE|TARJETA_CREDITO], tasa_interes, cuota_manejo, permite_sobregiro)
- cliente_cuenta (id_cliente, id_cuenta, titular_principal)
- movimiento (id_movimiento, fecha, tipo [DEPOSITO|RETIRO|TRANSFERENCIA|PAGO|COMPRA_TARJETA], id_cuenta_origen, id_cuenta_destino, monto, id_punto, id_empleado, descripcion, referencia_externa, estado)
- auditoria_movimiento (id_auditoria, id_movimiento, usuario_bd, fecha, accion, datos_anteriores, datos_nuevos)
- empleado (id_empleado, tipo_documento, numero_documento, nombres, apellidos, cargo, fecha_contratacion, activo, email, password_hash)
- empleado_punto (id_empleado, id_punto, fecha_inicio, fecha_fin)
- punto_atencion (id_punto, nombre, tipo [SUCURSAL|CAJERO_AUTOMATICO|CORRESPONSAL], id_barrio, direccion, telefono, activo, fecha_apertura, fecha_cierre)
- barrio (id_barrio, id_comuna, nombre)
- comuna (id_comuna, id_municipio, nombre)
- municipio (id_municipio, id_departamento, nombre, codigo_dane)
- departamento (id_departamento, nombre, codigo_dane)

REGLAS ESTRICTAS:
1. SOLO puedes generar consultas SELECT.
2. NO generes DROP, DELETE, UPDATE, INSERT, ALTER, TRUNCATE, CREATE, GRANT ni REVOKE.
3. Responde UNICAMENTE con la consulta SQL, sin explicaciones, sin bloques de codigo, sin comentarios.
4. Usa aliases descriptivos y PRESTA MUCHA ATENCIÓN a los JOINs. Por ejemplo, en "cuenta c JOIN cliente cli", usa "cli.nombres" (la tabla cliente tiene 'nombres'), NO "c.nombres" ni "c.cuenta.saldo". SOLO usa las columnas exactas que existen en cada tabla.
5. Limita resultados con LIMIT 50 si la consulta puede retornar muchos registros.
6. Si la pregunta es imposible de responder con estas tablas, responde exactamente: NO_QUERY
`.trim();

// ──────────────────────────────────────────────────────────────────────────────
// Tipos exportados
// ──────────────────────────────────────────────────────────────────────────────
export interface AIQueryResult {
  sql: string;
  results: Record<string, unknown>[];
  respuesta: string;
  audio_base64: string | null;
  error?: string;
}

// ──────────────────────────────────────────────────────────────────────────────
// Respuesta interna de Ollama /api/generate
// ──────────────────────────────────────────────────────────────────────────────
interface OllamaGenerateResponse {
  response: string;
  done: boolean;
}

// ──────────────────────────────────────────────────────────────────────────────
// Generación de SQL con Ollama
// ──────────────────────────────────────────────────────────────────────────────
export async function generateSQL(pregunta: string): Promise<string> {
  const ollamaUrl = process.env.OLLAMA_BASE_URL ?? "http://localhost:11434";
  const model = process.env.OLLAMA_MODEL ?? "llama3.2";

  const prompt = `${SCHEMA_CONTEXT}\n\nPregunta del usuario: "${pregunta}"\n\nSQL:`;

  const res = await fetch(`${ollamaUrl}/api/generate`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      model,
      prompt,
      stream: false,
      options: { temperature: 0.1, num_predict: 500 },
    }),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Ollama error ${res.status}: ${text}`);
  }

  const data = (await res.json()) as OllamaGenerateResponse;
  return data.response.trim();
}

// ──────────────────────────────────────────────────────────────────────────────
// Validación SQL — solo permite SELECT / WITH ... SELECT
// ──────────────────────────────────────────────────────────────────────────────
const FORBIDDEN_KEYWORDS = [
  "DROP", "DELETE", "UPDATE", "INSERT", "ALTER",
  "TRUNCATE", "CREATE", "GRANT", "REVOKE", "EXEC",
  "EXECUTE", "MERGE", "REPLACE", "CALL",
] as const;

export function validateSQL(sql: string): { valid: boolean; reason?: string } {
  const upper = sql.toUpperCase().trim();

  if (!upper.startsWith("SELECT") && !upper.startsWith("WITH")) {
    return { valid: false, reason: "Solo se permiten consultas SELECT." };
  }

  for (const kw of FORBIDDEN_KEYWORDS) {
    if (new RegExp(`\\b${kw}\\b`).test(upper)) {
      return {
        valid: false,
        reason: `Operación prohibida: ${kw}. El asistente solo puede hacer consultas de lectura.`,
      };
    }
  }

  return { valid: true };
}

// ──────────────────────────────────────────────────────────────────────────────
// Generación de respuesta en lenguaje natural con Ollama
// ──────────────────────────────────────────────────────────────────────────────
export async function generateNaturalResponse(
  pregunta: string,
  sql: string,
  resultados: Record<string, unknown>[]
): Promise<string> {
  const ollamaUrl = process.env.OLLAMA_BASE_URL ?? "http://localhost:11434";
  const model = process.env.OLLAMA_MODEL ?? "llama3.2";

  const resumenResultados =
    resultados.length === 0
      ? "No se encontraron resultados."
      : JSON.stringify(resultados.slice(0, 10), null, 2);

  const prompt = [
    "Eres un asistente bancario amigable y profesional de BancoUM.",
    `El usuario hizo la siguiente pregunta: "${pregunta}"`,
    `Se ejecutó esta consulta SQL: ${sql}`,
    `Los resultados fueron: ${resumenResultados}`,
    "",
    "Responde en español de forma clara, concisa y amigable en maximo 3 oraciones.",
    "No menciones el SQL, solo interpreta los resultados de forma natural.",
    "Si no hay resultados, dilo amablemente.",
  ].join("\n");

  try {
    const res = await fetch(`${ollamaUrl}/api/generate`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model,
        prompt,
        stream: false,
        options: { temperature: 0.7, num_predict: 200 },
      }),
    });

    if (!res.ok) {
      return "Los resultados fueron obtenidos exitosamente de la base de datos.";
    }

    const data = (await res.json()) as OllamaGenerateResponse;
    return data.response.trim();
  } catch {
    return "Los resultados fueron obtenidos exitosamente de la base de datos.";
  }
}

// ──────────────────────────────────────────────────────────────────────────────
// Text-to-Speech con ElevenLabs → retorna base64 del audio MP3
// ──────────────────────────────────────────────────────────────────────────────
export async function textToSpeech(texto: string): Promise<string | null> {
  const apiKey = process.env.ELEVENLABS_API_KEY;
  const voiceId = process.env.ELEVENLABS_VOICE_ID ?? "ODO4sbmD3pTjhgRVVRP6";

  if (!apiKey) {
    console.warn("[ai-utils] ELEVENLABS_API_KEY no configurada.");
    return null;
  }

  try {
    const res = await fetch(
      `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`,
      {
        method: "POST",
        headers: {
          "xi-api-key": apiKey,
          "Content-Type": "application/json",
          Accept: "audio/mpeg",
        },
        body: JSON.stringify({
          text: texto,
          model_id: "eleven_multilingual_v2",
          voice_settings: { stability: 0.5, similarity_boost: 0.75 },
        }),
      }
    );

    if (!res.ok) {
      const errText = await res.text();
      console.error(`[ai-utils] ElevenLabs error ${res.status}:`, errText);
      return null;
    }

    const arrayBuffer = await res.arrayBuffer();
    // Buffer está disponible globalmente en el runtime de Node.js de Next.js
    const base64 = Buffer.from(arrayBuffer).toString("base64");
    return base64;
  } catch (err) {
    console.error("[ai-utils] textToSpeech error:", err);
    return null;
  }
}
