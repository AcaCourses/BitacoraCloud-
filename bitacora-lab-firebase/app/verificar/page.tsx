"use client";

import { useState } from "react";
import { UploadCloud, ShieldCheck, XCircle, FileJson } from "lucide-react";

export default function VerificarPage() {
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string>("");
  const [dragging, setDragging] = useState(false);

  const processFile = async (file: File) => {
    setError("");
    setResult(null);
    try {
      const text = await file.text();
      const json = JSON.parse(text);

      if (!json.payload || !json.sig) {
        throw new Error("El archivo no tiene el formato de reporte firmado válido.");
      }

      const res = await fetch("/api/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(json),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Error de verificación");

      setResult({ valid: data.valid, payload: json.payload });
    } catch (e: any) {
      setError(e.message || "Error procesando el archivo");
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  return (
    <div className="max-w-2xl mx-auto py-12 space-y-8">
      <div className="text-center space-y-3">
        <h1 className="text-2xl font-medium">Auditoría de Entregas</h1>
        <p className="text-neutral-500">Sube el archivo JSON firmado del estudiante para verificar su integridad criptográfica.</p>
      </div>

      <div 
        onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={handleDrop}
        className={`border-2 border-dashed rounded-xl p-12 text-center transition-all ${dragging ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/20' : 'border-neutral-300 dark:border-neutral-700 hover:border-neutral-400 dark:hover:border-neutral-600'}`}
      >
        <div className="flex flex-col items-center gap-4">
          <UploadCloud className={`w-10 h-10 ${dragging ? 'text-emerald-500' : 'text-neutral-400'}`} />
          <div>
            <p className="font-medium text-neutral-700 dark:text-neutral-300">Arrastra y suelta el archivo .json aquí</p>
            <p className="text-sm text-neutral-500 mt-1">o selecciona el archivo manualmente</p>
          </div>
          <label className="cursor-pointer bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700 px-4 py-2 rounded-md text-sm font-medium hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors">
            Examinar
            <input 
              type="file" 
              accept=".json" 
              className="hidden" 
              onChange={(e) => e.target.files && processFile(e.target.files[0])}
            />
          </label>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900 rounded-lg flex items-start gap-3 text-red-800 dark:text-red-300">
          <XCircle className="w-5 h-5 shrink-0 mt-0.5" />
          <p className="text-sm font-medium">{error}</p>
        </div>
      )}

      {result && (
        <div className={`p-6 rounded-xl border ${result.valid ? 'border-emerald-200 bg-emerald-50 dark:border-emerald-900/50 dark:bg-emerald-950/20' : 'border-red-200 bg-red-50 dark:border-red-900/50 dark:bg-red-950/20'} animate-in slide-in-from-bottom-4`}>
          <div className="flex items-center gap-3 mb-6">
            {result.valid ? (
              <ShieldCheck className="w-8 h-8 text-emerald-600 dark:text-emerald-500" />
            ) : (
              <XCircle className="w-8 h-8 text-red-600 dark:text-red-500" />
            )}
            <div>
              <h3 className={`text-lg font-medium ${result.valid ? 'text-emerald-900 dark:text-emerald-100' : 'text-red-900 dark:text-red-100'}`}>
                {result.valid ? 'Firma Válida e Íntegra' : 'Archivo Alterado o Inválido'}
              </h3>
              <p className={`text-sm ${result.valid ? 'text-emerald-700 dark:text-emerald-400' : 'text-red-700 dark:text-red-400'}`}>
                {result.valid ? 'Los datos coinciden con la firma del servidor.' : 'La firma HMAC no coincide con el payload.'}
              </p>
            </div>
          </div>

          {result.valid && (
            <div className="space-y-4 text-sm bg-white dark:bg-neutral-900 p-4 rounded-lg border border-emerald-100 dark:border-emerald-900/30">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="block text-neutral-500 mb-1 text-xs uppercase tracking-wider">Estudiante</span>
                  <strong className="text-neutral-900 dark:text-neutral-100">{result.payload.student.nombre}</strong>
                  <br />
                  <span className="font-mono text-neutral-600 dark:text-neutral-400">{result.payload.student.matricula}</span>
                </div>
                <div>
                  <span className="block text-neutral-500 mb-1 text-xs uppercase tracking-wider">Desempeño</span>
                  <div className="flex gap-4">
                    <span><strong className="text-neutral-900 dark:text-neutral-100">{(result.payload.metrics.resolutionRate * 100).toFixed(0)}%</strong> Res.</span>
                    <span><strong className="text-neutral-900 dark:text-neutral-100">{(result.payload.metrics.autonomyRate * 100).toFixed(0)}%</strong> Aut.</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
