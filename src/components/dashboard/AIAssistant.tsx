"use client";

import { useState, useRef, useCallback } from "react";
import {
  Mic, MicOff, Send, Bot, Loader2,
  ChevronDown, ChevronUp, Volume2, ShieldAlert, Database,
} from "lucide-react";

// ──────────────────────────────────────────────────────────────────────────────
// Tipos
// ──────────────────────────────────────────────────────────────────────────────
interface QueryResult {
  sql: string;
  results: Record<string, unknown>[];
  respuesta: string;
  audio_base64: string | null;
  error?: string;
}

type Status = "idle" | "listening" | "processing" | "done" | "error";

// ──────────────────────────────────────────────────────────────────────────────
// Web Speech API — tipos locales (evita dependencia de lib.dom incompleta)
// ──────────────────────────────────────────────────────────────────────────────
interface SpeechRecognitionAlternative {
  readonly transcript: string;
  readonly confidence: number;
}

interface SpeechRecognitionResult {
  readonly isFinal: boolean;
  readonly length: number;
  item(index: number): SpeechRecognitionAlternative;
  [index: number]: SpeechRecognitionAlternative;
}

interface SpeechRecognitionResultList {
  readonly length: number;
  item(index: number): SpeechRecognitionResult;
  [index: number]: SpeechRecognitionResult;
}

interface SpeechRecognitionEvent extends Event {
  readonly results: SpeechRecognitionResultList;
  readonly resultIndex: number;
}

interface ISpeechRecognition extends EventTarget {
  lang: string;
  interimResults: boolean;
  maxAlternatives: number;
  start(): void;
  stop(): void;
  onstart: (() => void) | null;
  onend: (() => void) | null;
  onerror: ((event: Event) => void) | null;
  onresult: ((event: SpeechRecognitionEvent) => void) | null;
}

// ──────────────────────────────────────────────────────────────────────────────
// Componente Principal
// ──────────────────────────────────────────────────────────────────────────────
export default function AIAssistant() {
  const [pregunta, setPregunta] = useState("");
  const [status, setStatus] = useState<Status>("idle");
  const [result, setResult] = useState<QueryResult | null>(null);
  const [showSQL, setShowSQL] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [voiceTranscript, setVoiceTranscript] = useState("");

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const recognitionRef = useRef<ISpeechRecognition | null>(null);

  // ── Manejo de voz (Web Speech API) ────────────────────────────────────────
  const startListening = useCallback(() => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const SpeechRecognitionAPI: (new () => ISpeechRecognition) | undefined =
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (window as any).SpeechRecognition ?? (window as any).webkitSpeechRecognition;

    if (!SpeechRecognitionAPI) {
      alert("Tu navegador no soporta reconocimiento de voz. Usa Chrome o Edge.");
      return;
    }

    const recognition = new SpeechRecognitionAPI();
    recognition.lang = "es-CO";
    recognition.interimResults = true;
    recognition.maxAlternatives = 1;
    recognitionRef.current = recognition;

    recognition.onstart = () => {
      setIsListening(true);
      setStatus("listening");
      setVoiceTranscript("");
    };

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      const parts: string[] = [];
      for (let i = 0; i < event.results.length; i++) {
        parts.push(event.results[i][0].transcript);
      }
      const transcript = parts.join("");
      setVoiceTranscript(transcript);
      if (event.results[event.results.length - 1].isFinal) {
        setPregunta(transcript);
      }
    };

    recognition.onerror = () => {
      setIsListening(false);
      setStatus("idle");
    };

    recognition.onend = () => {
      setIsListening(false);
      setStatus("idle");
    };

    recognition.start();
  }, []);

  const stopListening = useCallback(() => {
    recognitionRef.current?.stop();
    setIsListening(false);
    setStatus("idle");
  }, []);

  // ── Envío de la consulta ───────────────────────────────────────────────────
  const submitQuery = useCallback(
    async (preguntaActual: string) => {
      const q = preguntaActual.trim();
      if (!q) return;

      setStatus("processing");
      setResult(null);
      setShowSQL(false);

      try {
        const res = await fetch("/api/ai/query", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ pregunta: q }),
        });

        const data: QueryResult = await res.json();
        setResult(data);
        setStatus(data.error && !data.results.length ? "error" : "done");

        // Reproducir audio si existe
        if (data.audio_base64) {
          const audio = new Audio(`data:audio/mpeg;base64,${data.audio_base64}`);
          audioRef.current = audio;
          await audio.play().catch(() => {/* usuario bloqueó autoplay */});
        }
      } catch (_err) {
        setStatus("error");
        setResult({
          sql: "",
          results: [],
          respuesta: "Error de conexión. Verifica que el servidor esté corriendo.",
          audio_base64: null,
          error: "network_error",
        });
      }
    },
    []
  );

  const handleSubmit = useCallback(() => {
    if (status !== "processing") {
      submitQuery(pregunta);
    }
  }, [pregunta, status, submitQuery]);

  const replayAudio = () => {
    audioRef.current?.play().catch(() => {});
  };

  // ── Columnas de la tabla de resultados ────────────────────────────────────
  const columns =
    result?.results && result.results.length > 0
      ? Object.keys(result.results[0])
      : [];

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div className="space-y-6 w-full">

      {/* ── Header de estado del modelo ───────────────────────────────────── */}
      <div className="flex items-center gap-3 p-4 rounded-2xl bg-slate-800 border border-slate-700">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center shrink-0 shadow-lg">
          <Bot className="w-5 h-5 text-white" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-bold text-white">Asistente IA · BancoUM</p>
          <p className="text-xs text-slate-400 font-mono">llama3.2 · ElevenLabs TTS · Solo lectura</p>
        </div>
        <div className="flex items-center gap-2">
          <span className="relative flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500" />
          </span>
          <span className="text-xs font-bold text-emerald-400 font-mono">EN LÍNEA</span>
        </div>
      </div>

      {/* ── Input de pregunta ─────────────────────────────────────────────── */}
      <div className="relative">
        <div
          className={[
            "flex items-end gap-3 p-4 rounded-2xl border-2 transition-all duration-200 bg-white",
            isListening
              ? "border-rose-400 shadow-lg shadow-rose-100"
              : "border-slate-200 focus-within:border-violet-400 focus-within:shadow-lg focus-within:shadow-violet-100",
          ].join(" ")}
        >
          {/* Indicador de voz activa */}
          {isListening && (
            <div className="absolute inset-0 rounded-2xl overflow-hidden pointer-events-none">
              <div className="absolute inset-0 bg-rose-50/40 animate-pulse" />
            </div>
          )}

          <textarea
            id="ai-pregunta-input"
            value={isListening ? voiceTranscript || "Escuchando…" : pregunta}
            onChange={(e) => setPregunta(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSubmit();
              }
            }}
            placeholder="Pregunta sobre los datos del banco… (Ej: ¿Cuántos clientes activos hay?)"
            disabled={status === "processing" || isListening}
            rows={3}
            className="flex-1 resize-none bg-transparent text-slate-800 placeholder-slate-400 text-sm font-medium outline-none leading-relaxed relative z-10"
          />

          <div className="flex flex-col gap-2 shrink-0 relative z-10">
            {/* Botón micrófono */}
            <button
              id="ai-mic-btn"
              onClick={isListening ? stopListening : startListening}
              disabled={status === "processing"}
              title={isListening ? "Detener grabación" : "Hablar"}
              className={[
                "w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-200 font-bold",
                "disabled:opacity-50 disabled:cursor-not-allowed",
                isListening
                  ? "bg-rose-500 text-white shadow-lg shadow-rose-200 scale-110"
                  : "bg-slate-100 text-slate-600 hover:bg-violet-100 hover:text-violet-600 hover:scale-105",
              ].join(" ")}
            >
              {isListening
                ? <MicOff className="w-4 h-4" />
                : <Mic className="w-4 h-4" />
              }
            </button>

            {/* Botón enviar */}
            <button
              id="ai-submit-btn"
              onClick={handleSubmit}
              disabled={!pregunta.trim() || status === "processing"}
              title="Enviar pregunta"
              className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-indigo-600 text-white flex items-center justify-center transition-all duration-200 hover:scale-105 hover:shadow-lg hover:shadow-violet-200 disabled:opacity-40 disabled:cursor-not-allowed disabled:scale-100"
            >
              {status === "processing"
                ? <Loader2 className="w-4 h-4 animate-spin" />
                : <Send className="w-4 h-4" />
              }
            </button>
          </div>
        </div>

        <p className="text-xs text-slate-400 mt-2 ml-1">
          Presiona{" "}
          <kbd className="px-1.5 py-0.5 bg-slate-100 rounded text-slate-600 font-mono text-[10px]">Enter</kbd>
          {" "}para enviar ·{" "}
          <kbd className="px-1.5 py-0.5 bg-slate-100 rounded text-slate-600 font-mono text-[10px]">Shift+Enter</kbd>
          {" "}para nueva línea
        </p>
      </div>

      {/* ── Estado: procesando ────────────────────────────────────────────── */}
      {status === "processing" && (
        <div className="flex items-center gap-3 p-4 rounded-2xl bg-violet-50 border border-violet-200">
          <Loader2 className="w-5 h-5 text-violet-600 animate-spin shrink-0" />
          <div>
            <p className="text-sm font-semibold text-violet-800">Procesando consulta…</p>
            <p className="text-xs text-violet-600">Ollama generando SQL → Supabase → ElevenLabs TTS</p>
          </div>
        </div>
      )}

      {/* ── Resultado ─────────────────────────────────────────────────────── */}
      {result && status !== "processing" && (
        <div className="space-y-4">

          {/* Respuesta en lenguaje natural */}
          <div
            className={[
              "p-5 rounded-2xl border-2",
              result.error && !result.results.length
                ? "bg-rose-50 border-rose-200"
                : "bg-emerald-50 border-emerald-200",
            ].join(" ")}
          >
            <div className="flex items-start gap-3">
              <div
                className={[
                  "w-8 h-8 rounded-xl flex items-center justify-center shrink-0",
                  result.error && !result.results.length ? "bg-rose-100" : "bg-emerald-100",
                ].join(" ")}
              >
                {result.error && !result.results.length
                  ? <ShieldAlert className="w-4 h-4 text-rose-600" />
                  : <Bot className="w-4 h-4 text-emerald-600" />
                }
              </div>
              <div className="flex-1 min-w-0">
                <p
                  className={[
                    "text-sm font-medium leading-relaxed",
                    result.error && !result.results.length ? "text-rose-800" : "text-emerald-900",
                  ].join(" ")}
                >
                  {result.respuesta}
                </p>
              </div>
              {result.audio_base64 && (
                <button
                  onClick={replayAudio}
                  title="Reproducir respuesta"
                  className="w-8 h-8 rounded-xl bg-emerald-100 hover:bg-emerald-200 flex items-center justify-center shrink-0 transition-all"
                >
                  <Volume2 className="w-4 h-4 text-emerald-700" />
                </button>
              )}
            </div>
          </div>

          {/* SQL Generado (plegable) */}
          {result.sql && (
            <div className="rounded-2xl border border-slate-200 overflow-hidden">
              <button
                onClick={() => setShowSQL(!showSQL)}
                className="w-full flex items-center justify-between px-4 py-3 bg-slate-800 text-left hover:bg-slate-700 transition-colors"
              >
                <div className="flex items-center gap-2">
                  <Database className="w-4 h-4 text-sky-400" />
                  <span className="text-xs font-bold text-slate-300 font-mono uppercase tracking-wider">
                    SQL Generado
                  </span>
                </div>
                {showSQL
                  ? <ChevronUp className="w-4 h-4 text-slate-400" />
                  : <ChevronDown className="w-4 h-4 text-slate-400" />
                }
              </button>
              {showSQL && (
                <pre className="p-4 bg-slate-900 text-emerald-300 text-xs font-mono overflow-x-auto leading-relaxed whitespace-pre-wrap">
                  {result.sql}
                </pre>
              )}
            </div>
          )}

          {/* Tabla de resultados */}
          {result.results.length > 0 && (
            <div className="rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
              <div className="px-4 py-3 bg-slate-800 flex items-center gap-2">
                <Database className="w-4 h-4 text-violet-400" />
                <span className="text-xs font-bold text-slate-300 font-mono uppercase tracking-wider">
                  Resultados · {result.results.length} fila{result.results.length !== 1 ? "s" : ""}
                </span>
              </div>
              <div className="overflow-x-auto max-h-80 overflow-y-auto">
                <table className="w-full text-left text-xs font-mono">
                  <thead className="bg-slate-50 border-b border-slate-200 sticky top-0">
                    <tr>
                      {columns.map((col) => (
                        <th
                          key={col}
                          className="px-4 py-3 text-slate-500 font-bold uppercase tracking-wide whitespace-nowrap"
                        >
                          {col}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {result.results.map((row, i) => (
                      <tr key={i} className="hover:bg-slate-50 transition-colors">
                        {columns.map((col) => (
                          <td
                            key={col}
                            className="px-4 py-2.5 text-slate-700 whitespace-nowrap max-w-[200px] truncate"
                          >
                            {row[col] === null || row[col] === undefined
                              ? <span className="text-slate-300 italic">null</span>
                              : String(row[col])
                            }
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {result.results.length === 0 && !result.error && (
            <div className="text-center py-8 text-slate-400 text-sm">
              <Database className="w-8 h-8 mx-auto mb-2 opacity-40" />
              La consulta fue exitosa pero no retornó filas.
            </div>
          )}
        </div>
      )}
    </div>
  );
}
