"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Download, FileJson, Printer, ShieldCheck, AlertTriangle } from "lucide-react";

import { Suspense } from "react";

function ReporteContent() {
  const searchParams = useSearchParams();
  const sessionId = searchParams?.get("sessionId");

  const [report, setReport] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (sessionId) {
      // Intenta cerrar y generar reporte, si ya está, devuelve el existente
      fetch("/api/finish", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId })
      })
      .then(r => r.json())
      .then(d => {
        setReport(d);
        setLoading(false);
      })
      .catch(() => setLoading(false));
    }
  }, [sessionId]);

  const handlePrint = () => window.print();

  if (loading) return <div className="p-12 text-center text-neutral-500">Generando reporte criptográfico...</div>;
  if (!report || report.error) return <div className="p-12 text-center text-red-500">Reporte no disponible o incompleto.</div>;

  const { payload, sig } = report;
  const metrics = payload.metrics;
  const resolutionP = (metrics.resolutionRate * 100).toFixed(0);
  const autonomyP = (metrics.autonomyRate * 100).toFixed(0);

  return (
    <div className="max-w-5xl mx-auto space-y-8 animate-in fade-in duration-700 pb-24">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 border-b border-neutral-200 dark:border-neutral-800 pb-8 print:border-b-2 print:border-black">
        <div>
          <h1 className="text-3xl font-medium mb-2">Reporte de Desempeño</h1>
          <p className="text-neutral-500 dark:text-neutral-400">
            {payload.student.nombre} • {payload.student.matricula}
          </p>
        </div>
        
        <div className="flex gap-3 print:hidden">
          <button onClick={handlePrint} className="p-2 border border-neutral-200 dark:border-neutral-700 rounded-md hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors" title="Imprimir">
            <Printer className="w-5 h-5 text-neutral-600 dark:text-neutral-300" />
          </button>
          <a href={`/api/export/md?sessionId=${sessionId}`} download className="flex items-center gap-2 px-4 py-2 border border-neutral-200 dark:border-neutral-700 rounded-md hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors text-sm font-medium">
            <Download className="w-4 h-4" /> Markdown
          </a>
          <a href={`/api/export/json?sessionId=${sessionId}`} download className="flex items-center gap-2 px-4 py-2 bg-neutral-900 dark:bg-neutral-100 text-white dark:text-neutral-900 rounded-md hover:opacity-90 transition-opacity text-sm font-medium">
            <FileJson className="w-4 h-4" /> JSON Firmado
          </a>
        </div>
      </header>

      <section className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-5 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl">
          <p className="text-xs font-medium text-neutral-500 uppercase tracking-wider mb-1">Resolución</p>
          <p className="text-3xl font-light">{resolutionP}%</p>
        </div>
        <div className="p-5 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl">
          <p className="text-xs font-medium text-neutral-500 uppercase tracking-wider mb-1">Autonomía</p>
          <p className="text-3xl font-light">{autonomyP}%</p>
        </div>
        <div className="p-5 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl col-span-2 md:col-span-2 flex flex-col justify-center">
          <p className="text-xs font-medium text-neutral-500 uppercase tracking-wider mb-2">Banderas de Diagnóstico</p>
          {metrics.flags.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {metrics.flags.map((flag: string, i: number) => (
                <span key={i} className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300">
                  <AlertTriangle className="w-3 h-3" /> {flag}
                </span>
              ))}
            </div>
          ) : (
            <span className="text-sm text-emerald-600 dark:text-emerald-400 font-medium flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4" /> Ejecución Limpia
            </span>
          )}
        </div>
      </section>

      <section className="p-6 md:p-8 bg-neutral-50 dark:bg-neutral-900/50 border border-neutral-200 dark:border-neutral-800 rounded-xl">
        <h2 className="text-lg font-medium mb-4">Síntesis Formativa</h2>
        <p className="text-neutral-700 dark:text-neutral-300 leading-relaxed max-w-4xl">
          {metrics.summary}
        </p>
      </section>

      <footer className="pt-12 mt-12 border-t border-neutral-200 dark:border-neutral-800 text-center space-y-3 print:mt-auto print:border-none">
        <ShieldCheck className="w-8 h-8 mx-auto text-emerald-600 opacity-20" />
        <div className="text-xs font-mono text-neutral-400 dark:text-neutral-600 break-all max-w-2xl mx-auto">
          Firma Criptográfica HMAC-SHA256<br/>
          {sig}
        </div>
        <p className="text-xs text-neutral-400">Validable en `/verificar`</p>
      </footer>
    </div>
  );
}

export default function ReportePage() {
  return (
    <Suspense fallback={<div className="p-12 text-center text-neutral-500">Cargando reporte...</div>}>
      <ReporteContent />
    </Suspense>
  );
}
