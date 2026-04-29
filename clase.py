"""
clase.py — Laboratorio IA + Base de Datos BancoUM
==================================================
Flujo completo:
  1. Captura de entrada (texto o voz)
  2. Generación de SQL con Ollama (llama3.2)
  3. Validación de seguridad (solo SELECT)
  4. Ejecución de la consulta en Supabase (PostgreSQL)
  5. Generación de respuesta en lenguaje natural con Ollama
  6. Síntesis de voz con ElevenLabs y reproducción

Requisitos (instalar dentro del .venv):
  pip install speechrecognition pyaudio requests psycopg2-binary python-dotenv elevenlabs pygame
"""

import os
import sys
import json
import re
import io
import time
import tempfile
import requests
import psycopg2
import psycopg2.extras
import pygame
from dotenv import load_dotenv

# Cargar variables de entorno desde .env del proyecto
load_dotenv(dotenv_path=os.path.join(os.path.dirname(__file__), ".env"))

# ──────────────────────────────────────────────────────────────────────────────
# Configuración
# ──────────────────────────────────────────────────────────────────────────────
DB_URL          = os.getenv("DATABASE_URL", "")
OLLAMA_URL      = os.getenv("OLLAMA_BASE_URL", "http://localhost:11434")
OLLAMA_MODEL    = os.getenv("OLLAMA_MODEL", "llama3.2")
ELEVEN_KEY      = os.getenv("ELEVENLABS_API_KEY", "")
ELEVEN_VOICE    = os.getenv("ELEVENLABS_VOICE_ID", "ODO4sbmD3pTjhgRVVRP6")

# ──────────────────────────────────────────────────────────────────────────────
# Schema para el prompt
# ──────────────────────────────────────────────────────────────────────────────
SCHEMA_CONTEXT = """
Eres un experto en SQL para PostgreSQL.
Tienes acceso a la siguiente base de datos de un banco colombiano llamado "BancoUM".

TABLAS:
- cliente (id_cliente, tipo_documento, numero_documento, nombres, apellidos, fecha_nacimiento, email, telefono, id_barrio, fecha_registro, activo)
- cuenta (id_cuenta, numero_cuenta, id_tipo_cuenta, saldo, limite_credito, fecha_apertura, estado, id_cliente)
- tipo_cuenta (id_tipo_cuenta, tipo [AHORROS|CORRIENTE|TARJETA_CREDITO], tasa_interes, cuota_manejo, permite_sobregiro)
- cliente_cuenta (id_cliente, id_cuenta, titular_principal)
- movimiento (id_movimiento, fecha, tipo [DEPOSITO|RETIRO|TRANSFERENCIA|PAGO|COMPRA_TARJETA], id_cuenta_origen, id_cuenta_destino, monto, id_punto, id_empleado, descripcion, estado)
- auditoria_movimiento (id_auditoria, id_movimiento, usuario_bd, fecha, accion, datos_anteriores, datos_nuevos)
- empleado (id_empleado, tipo_documento, numero_documento, nombres, apellidos, cargo, fecha_contratacion, activo, email)
- empleado_punto (id_empleado, id_punto, fecha_inicio, fecha_fin)
- punto_atencion (id_punto, nombre, tipo [SUCURSAL|CAJERO_AUTOMATICO|CORRESPONSAL], id_barrio, direccion, telefono, activo)
- barrio (id_barrio, id_comuna, nombre)
- comuna (id_comuna, id_municipio, nombre)
- municipio (id_municipio, id_departamento, nombre, codigo_dane)
- departamento (id_departamento, nombre, codigo_dane)

REGLAS ESTRICTAS:
1. SOLO puedes generar consultas SELECT.
2. NO generes DROP, DELETE, UPDATE, INSERT, ALTER, TRUNCATE, CREATE, GRANT ni REVOKE.
3. Responde ÚNICAMENTE con la consulta SQL, sin explicaciones, sin bloques de código, sin comentarios.
4. Usa aliases descriptivos y PRESTA MUCHA ATENCIÓN a los JOINs. Por ejemplo, en "cuenta c JOIN cliente cli", usa "cli.nombres" (la tabla cliente tiene 'nombres'), NO "c.nombres" ni "c.cuenta.saldo". SOLO usa las columnas exactas que existen en cada tabla.
5. Limitá resultados a máximo 20 filas con LIMIT 20.
6. Si la pregunta no se puede responder con estas tablas, escribe exactamente: NO_QUERY
""".strip()

FORBIDDEN_KEYWORDS = [
    "DROP", "DELETE", "UPDATE", "INSERT", "ALTER",
    "TRUNCATE", "CREATE", "GRANT", "REVOKE", "EXEC", "EXECUTE",
]

# ──────────────────────────────────────────────────────────────────────────────
# Colores ANSI para la consola
# ──────────────────────────────────────────────────────────────────────────────
class C:
    RESET  = "\033[0m"
    BOLD   = "\033[1m"
    CYAN   = "\033[96m"
    GREEN  = "\033[92m"
    YELLOW = "\033[93m"
    RED    = "\033[91m"
    PURPLE = "\033[95m"
    GRAY   = "\033[90m"

def banner():
    print(f"\n{C.BOLD}{C.PURPLE}{'═'*60}")
    print("   🏦  ASISTENTE IA — BancoUM  (Laboratorio BD II)")
    print(f"{'═'*60}{C.RESET}")
    print(f"{C.GRAY}   Modelo: {OLLAMA_MODEL} | TTS: ElevenLabs | DB: Supabase{C.RESET}\n")


# ──────────────────────────────────────────────────────────────────────────────
# PASO 1: Captura de entrada (texto o voz)
# ──────────────────────────────────────────────────────────────────────────────
def capturar_entrada() -> str:
    print(f"{C.CYAN}[1/5] Selecciona modo de entrada:{C.RESET}")
    print("      [T] Texto  |  [V] Voz")
    modo = input("      → ").strip().upper()

    if modo == "V":
        return capturar_voz()
    else:
        return input(f"\n{C.CYAN}      Escribe tu pregunta: {C.RESET}").strip()


def capturar_voz() -> str:
    try:
        import speech_recognition as sr
    except ImportError:
        print(f"{C.RED}[ERROR] speech_recognition no instalado. Usa modo texto.{C.RESET}")
        return input(f"{C.CYAN}      Escribe tu pregunta: {C.RESET}").strip()

    recognizer = sr.Recognizer()
    mic = sr.Microphone()

    print(f"\n{C.YELLOW}      🎙  Habla ahora (máx. 10 seg.)…{C.RESET}")
    with mic as source:
        recognizer.adjust_for_ambient_noise(source, duration=0.5)
        try:
            audio = recognizer.listen(source, timeout=10, phrase_time_limit=10)
        except sr.WaitTimeoutError:
            print(f"{C.RED}      Tiempo agotado. Sin entrada de voz.{C.RESET}")
            return ""

    print(f"{C.GRAY}      Procesando audio…{C.RESET}")
    try:
        texto = recognizer.recognize_google(audio, language="es-CO")
        print(f"{C.GREEN}      ✓ Transcripción: «{texto}»{C.RESET}")
        return texto
    except sr.UnknownValueError:
        print(f"{C.RED}      No se entendió el audio.{C.RESET}")
        return ""
    except sr.RequestError as e:
        print(f"{C.RED}      Error con Google Speech: {e}{C.RESET}")
        return ""


# ──────────────────────────────────────────────────────────────────────────────
# PASO 2: Generación de SQL con Ollama
# ──────────────────────────────────────────────────────────────────────────────
def generar_sql(pregunta: str) -> str:
    print(f"\n{C.CYAN}[2/5] Generando SQL con {OLLAMA_MODEL}…{C.RESET}")
    prompt = f"{SCHEMA_CONTEXT}\n\nPregunta del usuario: \"{pregunta}\"\n\nSQL:"

    try:
        r = requests.post(
            f"{OLLAMA_URL}/api/generate",
            json={"model": OLLAMA_MODEL, "prompt": prompt, "stream": False,
                  "options": {"temperature": 0.1, "num_predict": 500}},
            timeout=60,
        )
        r.raise_for_status()
        sql = r.json()["response"].strip()
        # Limpiar posibles bloques de código
        sql = re.sub(r"```sql", "", sql, flags=re.IGNORECASE)
        sql = re.sub(r"```", "", sql).strip()
        print(f"{C.GREEN}      ✓ SQL generado{C.RESET}")
        return sql
    except requests.exceptions.ConnectionError:
        print(f"{C.RED}      [ERROR] No se pudo conectar con Ollama en {OLLAMA_URL}")
        print(f"      Asegúrate de que Ollama esté corriendo.{C.RESET}")
        sys.exit(1)
    except Exception as e:
        print(f"{C.RED}      [ERROR] Ollama: {e}{C.RESET}")
        sys.exit(1)


# ──────────────────────────────────────────────────────────────────────────────
# PASO 3: Validación de seguridad
# ──────────────────────────────────────────────────────────────────────────────
def validar_sql(sql: str) -> tuple[bool, str]:
    print(f"\n{C.CYAN}[3/5] Validando seguridad del SQL…{C.RESET}")
    upper = sql.upper().strip()

    if not upper.startswith("SELECT") and not upper.startswith("WITH"):
        return False, "Solo se permiten consultas SELECT."

    for kw in FORBIDDEN_KEYWORDS:
        if re.search(rf"\b{kw}\b", upper):
            return False, f"Operación prohibida detectada: {kw}"

    print(f"{C.GREEN}      ✓ SQL válido (solo lectura){C.RESET}")
    return True, ""


# ──────────────────────────────────────────────────────────────────────────────
# PASO 4: Ejecución en Supabase
# ──────────────────────────────────────────────────────────────────────────────
def ejecutar_consulta(sql: str) -> list[dict]:
    print(f"\n{C.CYAN}[4/5] Ejecutando consulta en Supabase…{C.RESET}")

    try:
        conn = psycopg2.connect(DB_URL, cursor_factory=psycopg2.extras.RealDictCursor)
        cur  = conn.cursor()
        cur.execute(sql)
        rows = [dict(r) for r in cur.fetchall()]
        cur.close()
        conn.close()
        print(f"{C.GREEN}      ✓ {len(rows)} fila(s) retornadas{C.RESET}")
        return rows
    except Exception as e:
        print(f"{C.RED}      [ERROR] Base de datos: {e}{C.RESET}")
        return []


# ──────────────────────────────────────────────────────────────────────────────
# PASO 5a: Respuesta en lenguaje natural
# ──────────────────────────────────────────────────────────────────────────────
def generar_respuesta(pregunta: str, sql: str, resultados: list[dict]) -> str:
    print(f"\n{C.CYAN}[5a/5] Generando respuesta en lenguaje natural…{C.RESET}")

    resumen = (
        "No se encontraron resultados."
        if not resultados
        else json.dumps(resultados[:10], ensure_ascii=False, default=str)
    )

    prompt = f"""Eres un asistente bancario amigable de BancoUM.
El usuario preguntó: "{pregunta}"
Se ejecutó: {sql}
Resultados: {resumen}

Responde en español de forma clara y concisa en máximo 3 oraciones. No menciones el SQL."""

    try:
        r = requests.post(
            f"{OLLAMA_URL}/api/generate",
            json={"model": OLLAMA_MODEL, "prompt": prompt, "stream": False,
                  "options": {"temperature": 0.7, "num_predict": 200}},
            timeout=60,
        )
        return r.json()["response"].strip()
    except Exception:
        return "Los resultados fueron obtenidos de la base de datos."


# ──────────────────────────────────────────────────────────────────────────────
# PASO 5b: Text-to-Speech con ElevenLabs
# ──────────────────────────────────────────────────────────────────────────────
def sintetizar_y_reproducir(texto: str):
    print(f"{C.CYAN}[5b/5] Sintetizando voz con ElevenLabs…{C.RESET}")

    if not ELEVEN_KEY:
        print(f"{C.YELLOW}      ELEVENLABS_API_KEY no configurada. Omitiendo TTS.{C.RESET}")
        return

    try:
        r = requests.post(
            f"https://api.elevenlabs.io/v1/text-to-speech/{ELEVEN_VOICE}",
            headers={
                "xi-api-key": ELEVEN_KEY,
                "Content-Type": "application/json",
                "Accept": "audio/mpeg",
            },
            json={
                "text": texto,
                "model_id": "eleven_multilingual_v2",
                "voice_settings": {"stability": 0.5, "similarity_boost": 0.75},
            },
            timeout=30,
        )
        r.raise_for_status()

        # Reproducir con pygame
        pygame.mixer.init()
        audio_io = io.BytesIO(r.content)
        pygame.mixer.music.load(audio_io, "mp3")
        pygame.mixer.music.play()
        print(f"{C.GREEN}      ✓ Reproduciendo respuesta de voz…{C.RESET}")

        # Esperar a que termine el audio
        while pygame.mixer.music.get_busy():
            time.sleep(0.1)

    except requests.HTTPError as e:
        print(f"{C.RED}      [ERROR] ElevenLabs ({e.response.status_code}): {e.response.text[:200]}{C.RESET}")
    except Exception as e:
        print(f"{C.RED}      [ERROR] TTS: {e}{C.RESET}")


# ──────────────────────────────────────────────────────────────────────────────
# Mostrar resultados en consola
# ──────────────────────────────────────────────────────────────────────────────
def mostrar_resultados(sql: str, resultados: list[dict], respuesta: str):
    print(f"\n{C.BOLD}{'─'*60}")
    print(f"  SQL GENERADO:{C.RESET}")
    print(f"{C.GRAY}  {sql}{C.RESET}")

    print(f"\n{C.BOLD}{'─'*60}")
    print(f"  RESULTADOS ({len(resultados)} fila(s)):{C.RESET}")
    if resultados:
        # Cabecera
        cols = list(resultados[0].keys())
        col_w = {c: max(len(c), max(len(str(r.get(c, ""))) for r in resultados)) for c in cols}
        header = "  │ " + " │ ".join(c.ljust(col_w[c]) for c in cols) + " │"
        sep    = "  ├─" + "─┼─".join("─" * col_w[c] for c in cols) + "─┤"
        print(f"{C.CYAN}  ┌─" + "─┬─".join("─" * col_w[c] for c in cols) + f"─┐{C.RESET}")
        print(f"{C.CYAN}{header}{C.RESET}")
        print(f"{C.CYAN}{sep}{C.RESET}")
        for row in resultados:
            line = "  │ " + " │ ".join(str(row.get(c, "")).ljust(col_w[c]) for c in cols) + " │"
            print(line)
        print(f"{C.CYAN}  └─" + "─┴─".join("─" * col_w[c] for c in cols) + f"─┘{C.RESET}")
    else:
        print(f"  {C.YELLOW}(Sin resultados){C.RESET}")

    print(f"\n{C.BOLD}{'─'*60}")
    print(f"  RESPUESTA IA:{C.RESET}")
    print(f"  {C.GREEN}{respuesta}{C.RESET}\n")


# ──────────────────────────────────────────────────────────────────────────────
# Bucle principal
# ──────────────────────────────────────────────────────────────────────────────
def main():
    banner()

    while True:
        # ── PASO 1: Entrada ───────────────────────────────────────────────────
        pregunta = capturar_entrada()
        if not pregunta:
            print(f"{C.YELLOW}      Sin entrada. Intenta de nuevo.{C.RESET}")
            continue

        if pregunta.lower() in ("salir", "exit", "quit"):
            print(f"\n{C.PURPLE}  👋 ¡Hasta luego!{C.RESET}\n")
            break

        # ── PASO 2: Generar SQL ───────────────────────────────────────────────
        sql = generar_sql(pregunta)

        if "NO_QUERY" in sql:
            print(f"{C.YELLOW}      El modelo no pudo generar una consulta válida.{C.RESET}")
            continuar = input("\n¿Otra consulta? [s/n]: ").strip().lower()
            if continuar != "s":
                break
            continue

        # ── PASO 3: Validar ───────────────────────────────────────────────────
        valido, razon = validar_sql(sql)
        if not valido:
            print(f"{C.RED}      ✗ {razon}{C.RESET}")
            continuar = input("\n¿Otra consulta? [s/n]: ").strip().lower()
            if continuar != "s":
                break
            continue

        # ── PASO 4: Ejecutar ──────────────────────────────────────────────────
        resultados = ejecutar_consulta(sql)

        # ── PASO 5a: Respuesta natural ────────────────────────────────────────
        respuesta = generar_respuesta(pregunta, sql, resultados)

        # ── Mostrar ───────────────────────────────────────────────────────────
        mostrar_resultados(sql, resultados, respuesta)

        # ── PASO 5b: TTS ──────────────────────────────────────────────────────
        sintetizar_y_reproducir(respuesta)

        # ── Continuar ─────────────────────────────────────────────────────────
        continuar = input(f"{C.BOLD}¿Otra consulta? [s/n]: {C.RESET}").strip().lower()
        if continuar != "s":
            print(f"\n{C.PURPLE}  👋 ¡Hasta luego!{C.RESET}\n")
            break


if __name__ == "__main__":
    main()
