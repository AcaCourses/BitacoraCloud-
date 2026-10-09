"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Book, Clock, Edit3, CheckSquare, Square } from "lucide-react";

import { Suspense } from "react";

function BitacoraContent() {
  const searchParams = useSearchParams();
  const sessionId = searchParams?.get("sessionId");

  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (sessionId) {
      fetch(`/api/state?sessionId=${sessionId}`)
        .then(r => r.json())
        .then(d => {
          setData(d);
          setLoading(false);
        });
    }
  }, [sessionId]);

  if (loading) return <div className="p-8 text-center text-neutral-500">Cargando bitácora...</div>;
  if (!data) return <div className="p-8 text-center text-red-500">No se encontró la sesión</div>;

  return (
    <div className="max-w-4xl mx-auto space-y-12 pb-24">
      <header className="border-b border-neutral-200 dark:border-neutral-800 pb-8 flex flex-col gap-4">
        <div className="inline-flex items-center gap-3 px-4 py-2 bg-neutral-100 dark:bg-neutral-900 rounded-full w-fit">
          <Book className="w-4 h-4" />
          <span className="text-sm font-medium tracking-wide">Registro Continuo</span>
        </div>
        <div>
          <h1 className="text-3xl font-medium mb-2">Bitácora de Laboratorio</h1>
          <p className="text-neutral-500 dark:text-neutral-400">ID de Sesión: {sessionId}</p>
        </div>
      </header>

      <div className="space-y-16">
        {data.closedEntries.map((entry: any, i: number) => (
          <article key={i} className="relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-neutral-200 dark:before:via-neutral-800 before:to-transparent">
            <div className="relative flex items-center justify-between md:justify-around group">
              <div className="hidden md:flex items-center justify-end w-5/12 text-sm text-neutral-400">
                {new Date(entry.startedAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
              </div>
              <div className="w-10 h-10 flex items-center justify-center bg-white dark:bg-neutral-950 border-4 border-neutral-100 dark:border-neutral-900 rounded-full z-10 text-neutral-500 shadow-sm">
                <span className="text-sm font-mono">{i}</span>
              </div>
              <div className="w-11/12 md:w-5/12 pl-4 md:pl-0">
                <h3 className="text-xl font-medium">{entry.title}</h3>
              </div>
            </div>

            <div className="mt-8 ml-10 md:ml-[50%] md:pl-8 space-y-6">
              {entry.steps.map((step: any, j: number) => (
                <div key={j} className="bg-white dark:bg-neutral-900 p-5 rounded-xl border border-neutral-200 dark:border-neutral-800 shadow-sm text-sm">
                  <div className="text-neutral-500 dark:text-neutral-400 mb-2 flex justify-between">
                    <span className="font-medium uppercase text-xs tracking-wider">
                      {step.type === 'actions' ? 'Acciones Realizadas' :
                       step.type === 'free' ? 'Reflexión Inicial' :
                       step.type.includes('guide') ? 'Guía del Sistema' :
                       step.type === 'predict' ? 'Predicción' : 'Cierre'}
                    </span>
                    <span className="text-xs opacity-50 flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {new Date(step.at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                    </span>
                  </div>
                  
                  {step.type === 'actions' ? (
                     <div className="space-y-1 mt-3">
                       {step.answer.split(',').map((a: string, k: number) => (
                         <div key={k} className="flex items-center gap-2 text-neutral-700 dark:text-neutral-300">
                           <CheckSquare className="w-4 h-4 text-emerald-500" />
                           <span>{a}</span>
                         </div>
                       ))}
                     </div>
                  ) : step.type === 'free' ? (
                    <div className="mt-3">
                      <p className="text-neutral-800 dark:text-neutral-200 mb-3">{step.prompt}</p>
                      <div className="bg-neutral-50 dark:bg-neutral-950 p-4 rounded-lg font-mono text-sm border-l-2 border-emerald-500 text-neutral-600 dark:text-neutral-400">
                        {step.answer}
                      </div>
                    </div>
                  ) : (
                    <div className="mt-3">
                      <p className="text-neutral-800 dark:text-neutral-200 mb-3 italic">"{step.prompt}"</p>
                      <div className="bg-neutral-50 dark:bg-neutral-950 p-3 rounded-md text-neutral-700 dark:text-neutral-300 border border-neutral-100 dark:border-neutral-800">
                        {step.answer}
                      </div>
                      {step.correct !== undefined && (
                        <div className={`mt-2 text-xs font-medium ${step.correct ? 'text-emerald-500' : 'text-amber-500'}`}>
                          {step.correct ? '✓ Preciso' : '⚠ Desviado'}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
              
              <div className="flex gap-2 items-center text-xs text-neutral-400 cursor-text hover:text-neutral-600 transition-colors group">
                <Edit3 className="w-3 h-3" />
                <input type="text" placeholder="Agregar nota posterior a esta fase..." className="bg-transparent border-none focus:outline-none focus:ring-0 w-full placeholder:text-neutral-300" />
              </div>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}

export default function BitacoraLecturaPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-neutral-500">Cargando bitácora...</div>}>
      <BitacoraContent />
    </Suspense>
  );
}
