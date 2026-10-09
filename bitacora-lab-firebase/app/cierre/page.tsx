"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { CheckCircle2, Loader2, Send } from "lucide-react";

import { Suspense } from "react";

function CierreContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const sessionId = searchParams?.get("sessionId") || "";

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [stepData, setStepData] = useState<any>(null);
  const [answer, setAnswer] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (!sessionId) {
      router.push("/");
      return;
    }
    fetchState();
  }, [sessionId, router]);

  const fetchState = async () => {
    try {
      const res = await fetch(`/api/state?sessionId=${sessionId}`);
      const data = await res.json();
      if (data.isDone) {
        router.push(`/reporte?sessionId=${sessionId}`);
        return;
      }
      setStepData(data.currentStep);
    } catch (err) {
      setError("Error cargando el estado");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!answer.trim()) return;

    setSubmitting(true);
    setError("");
    const startTime = Date.now();

    try {
      const res = await fetch("/api/answer", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sessionId,
          stepId: stepData.id,
          answer,
          meta: { msOnStep: Date.now() - startTime }
        }),
      });

      const result = await res.json();
      if (!res.ok) throw new Error(result.error || "Error al enviar");

      if (result.nextStepId === "done") {
        await fetch("/api/finish", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ sessionId })
        });
        router.push(`/reporte?sessionId=${sessionId}`);
      } else {
        setAnswer("");
        fetchState();
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64 text-neutral-500">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  if (!stepData) return null;

  return (
    <div className="max-w-3xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <header className="border-b border-neutral-200 dark:border-neutral-800 pb-6">
        <div className="flex items-center gap-3 mb-2 text-emerald-600 dark:text-emerald-500">
          <CheckCircle2 className="w-6 h-6" />
          <span className="font-medium tracking-wide text-sm uppercase">Cierre del Laboratorio</span>
        </div>
        <h1 className="text-2xl md:text-3xl font-medium tracking-tight">Reflexión Ejecutiva</h1>
      </header>

      <section className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 p-6 md:p-8 rounded-xl shadow-sm">
        <h2 className="text-lg font-medium text-neutral-900 dark:text-neutral-100 mb-4">
          {stepData.prompt}
        </h2>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          {stepData.type === 'free' || stepData.type === 'guide-free' || stepData.type === 'close' ? (
            <div className="space-y-2">
              <textarea
                value={answer}
                onChange={(e) => setAnswer(e.target.value)}
                placeholder="Escribe tu explicación aquí..."
                className="w-full min-h-[160px] p-4 bg-neutral-50 dark:bg-neutral-950 border border-neutral-300 dark:border-neutral-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all font-mono text-sm leading-relaxed resize-y"
                required
              />
              {stepData.minWords && (
                <p className="text-xs text-neutral-500 text-right">
                  Mínimo {stepData.minWords} palabras (actual: {answer.trim() ? answer.trim().split(/\s+/).length : 0})
                </p>
              )}
            </div>
          ) : stepData.options ? (
            <div className="space-y-3">
              {stepData.options.map((opt: string, i: number) => (
                <label key={i} className="flex items-start gap-3 p-4 border border-neutral-200 dark:border-neutral-800 rounded-lg cursor-pointer hover:bg-neutral-50 dark:hover:bg-neutral-800/50 transition-colors">
                  <input
                    type="radio"
                    name="answer"
                    value={opt}
                    onChange={(e) => setAnswer(e.target.value)}
                    checked={answer === opt}
                    className="mt-1 text-emerald-600 focus:ring-emerald-500"
                  />
                  <span className="text-sm">{opt}</span>
                </label>
              ))}
            </div>
          ) : null}

          {error && <p className="text-red-500 text-sm font-medium">{error}</p>}

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={submitting || !answer}
              className="inline-flex items-center gap-2 px-6 py-2.5 bg-neutral-900 hover:bg-neutral-800 text-white dark:bg-neutral-100 dark:hover:bg-neutral-200 dark:text-neutral-900 font-medium rounded-lg transition-colors disabled:opacity-50"
            >
              {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
              Continuar
            </button>
          </div>
        </form>
      </section>
    </div>
  );
}

export default function CierrePage() {
  return (
    <Suspense fallback={<div className="flex justify-center items-center h-64 text-neutral-500"><Loader2 className="w-8 h-8 animate-spin" /></div>}>
      <CierreContent />
    </Suspense>
  );
}
