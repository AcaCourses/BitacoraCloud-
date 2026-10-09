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
  const [phaseIndex, setPhaseIndex] = useState(0);
  const [resumeCode, setResumeCode] = useState<string>("");
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
      setPhaseIndex(data.phaseIndex);
      setResumeCode(data.resumeCode);
    } catch (err) {
      setError("Error cargando el estado");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (resumeCode) {
      localStorage.setItem('bitacora_resume_code', resumeCode);
    }
  }, [resumeCode]);

  const handleSubmit = async (e?: React.FormEvent, overrideAnswer?: string) => {
    if (e) e.preventDefault();
    
    const finalAnswer = overrideAnswer ?? answer;
    if (!finalAnswer.trim()) return;

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
          answer: finalAnswer,
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
    <div className="max-w-3xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-16">
      <header className="border-b border-neutral-200 dark:border-neutral-800 pb-6 flex justify-between items-start">
        <div className="flex-1 max-w-xl">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3 text-emerald-600 dark:text-emerald-500">
              <CheckCircle2 className="w-6 h-6" />
              <span className="font-medium tracking-wide text-sm uppercase">
                {stepData.type === 'close' ? 'Módulo Completado' : `Fase Activa`}
              </span>
            </div>
            <div className="text-sm font-medium text-neutral-500">
              Módulo {phaseIndex + 1} de 6
            </div>
          </div>
          
          <div className="w-full bg-neutral-200 dark:bg-neutral-800 rounded-full h-2 mb-6">
            <div className="bg-emerald-500 h-2 rounded-full transition-all duration-500" style={{ width: `${((phaseIndex + 1) / 6) * 100}%` }}></div>
          </div>

          <h1 className="text-2xl md:text-3xl font-medium tracking-tight">{stepData.phase || 'Laboratorio'}</h1>
        </div>
        {resumeCode && (
          <div className="bg-neutral-100 dark:bg-neutral-800 px-4 py-2 rounded-lg border border-neutral-200 dark:border-neutral-700 text-right">
            <span className="text-[10px] text-neutral-500 uppercase tracking-wider block mb-0.5">Código de recuperación</span>
            <span className="font-mono font-medium text-lg tracking-widest">{resumeCode}</span>
          </div>
        )}
      </header>

      <section className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 p-6 md:p-8 rounded-xl shadow-sm">
        {stepData.type === 'intro' ? (
          <div className="space-y-6 text-neutral-800 dark:text-neutral-200">
            <h2 className="text-xl font-medium text-blue-600 dark:text-blue-400">Instrucciones Previas</h2>
            <p className="text-lg mb-4">
              Antes de comenzar a responder las preguntas, debes realizar el laboratorio <strong>GSP643</strong> paso a paso en tu cuenta de Google Cloud Skills Boost.
            </p>
            <div className="bg-neutral-50 dark:bg-neutral-800/50 p-6 rounded-lg border border-neutral-200 dark:border-neutral-700 space-y-4">
              <h3 className="font-medium text-lg border-b border-neutral-200 dark:border-neutral-700 pb-2">Reglas para tu Bitácora</h3>
              <ul className="list-disc pl-5 space-y-3 text-neutral-700 dark:text-neutral-300">
                <li><strong>Escribe lo que entiendas con tus propias palabras:</strong> Lo más importante es tu proceso de reflexión, no que uses lenguaje ultra técnico.</li>
                <li><strong>No copies y pegues resúmenes de IA:</strong> Puedes investigar en internet o usar ChatGPT/Gemini para entender un concepto si te trabas, pero <em>no queremos ver respuestas 100% generadas por IA</em>. Redacta la respuesta basándote en tu propia comprensión de lo que hiciste.</li>
                <li><strong>Si te quedas en blanco, vuelve al laboratorio:</strong> Si una pregunta te parece muy confusa o sientes que no tienes idea, tómate un momento, abre el laboratorio y vuelve a leer esa sección específica.</li>
              </ul>
            </div>
            <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
              <a href="https://www.skills.google/focuses/8391?catalog_rank=%7B%22rank%22%3A3%2C%22num_filters%22%3A0%2C%22has_search%22%3Atrue%7D&parent=catalog&search_id=102386936" target="_blank" rel="noreferrer" className="text-blue-700 dark:text-blue-400 font-medium hover:underline flex items-center gap-2">
                Abrir Laboratorio GSP643 en Google Skills Boost &rarr;
              </a>
            </div>
            
            <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg mt-6">
              <h3 className="font-medium text-yellow-800 dark:text-yellow-600 mb-2">¡Guarda tu código de recuperación!</h3>
              <p className="text-sm text-yellow-700 dark:text-yellow-700 mb-3">
                Si cierras esta pestaña, necesitarás el siguiente código para continuar. Lo hemos guardado en tu navegador, pero por si acaso anótalo.
              </p>
              <div className="inline-block bg-white dark:bg-black px-4 py-2 border border-yellow-300 dark:border-yellow-700 rounded-md font-mono text-lg font-bold tracking-widest text-neutral-900 dark:text-white">
                {resumeCode}
              </div>
            </div>
            
            <div className="pt-4 border-t border-neutral-200 dark:border-neutral-800 mt-6">
              <button
                type="button"
                onClick={() => handleSubmit(undefined, 'Sí')}
                disabled={submitting}
                className="w-full inline-flex justify-center items-center gap-2 py-3 px-6 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors disabled:opacity-50"
              >
                {submitting ? <Loader2 className="w-5 h-5 animate-spin" /> : "Ya completé el laboratorio, Comenzar Bitácora"}
              </button>
            </div>
          </div>
        ) : stepData.type === 'close' ? (
          <div className="space-y-6 text-neutral-800 dark:text-neutral-200">
            <h2 className="text-xl font-medium text-emerald-600 dark:text-emerald-500">Descanso: Fin del Módulo</h2>
            
            <div className="bg-emerald-50 dark:bg-emerald-900/20 p-6 rounded-lg border border-emerald-200 dark:border-emerald-800/50">
              <p className="text-neutral-700 dark:text-neutral-300 leading-relaxed text-lg">
                {stepData.prompt}
              </p>
            </div>

            <div className="pt-4 border-t border-neutral-200 dark:border-neutral-800 mt-6 space-y-4">
              <p className="text-sm text-neutral-500">¿Listo para continuar? Tu progreso está guardado automáticamente. Si necesitas un descanso más largo, puedes cerrar esta pestaña y retomar tu avance con tu código de recuperación más tarde.</p>
              
              <button
                type="button"
                onClick={() => handleSubmit(undefined, 'Continuar')}
                disabled={submitting}
                className="w-full inline-flex justify-center items-center gap-2 py-3 px-6 bg-emerald-600 hover:bg-emerald-700 text-white font-medium rounded-lg transition-colors disabled:opacity-50"
              >
                {submitting ? <Loader2 className="w-5 h-5 animate-spin" /> : "Continuar al siguiente módulo"}
              </button>
            </div>
          </div>
        ) : (
          <>
            <h2 className="text-lg font-medium text-neutral-900 dark:text-neutral-100 mb-4">
              {stepData.prompt}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-6">
          {stepData.type === 'free' || stepData.type === 'guide-free' ? (
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
                    type={stepData.type === 'actions' ? 'checkbox' : 'radio'}
                    name="answer"
                    value={opt}
                    onChange={(e) => {
                      if (stepData.type === 'actions') {
                        const current = answer ? answer.split(',') : [];
                        if (e.target.checked) {
                          setAnswer([...current, opt].join(','));
                        } else {
                          setAnswer(current.filter(x => x !== opt).join(','));
                        }
                      } else {
                        setAnswer(e.target.value);
                      }
                    }}
                    checked={stepData.type === 'actions' ? (answer ? answer.split(',').includes(opt) : false) : answer === opt}
                    className="mt-1 text-emerald-600 focus:ring-emerald-500 shrink-0"
                  />
                  <span className="text-sm pt-0.5 leading-snug">{opt}</span>
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
          </>
        )}
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
