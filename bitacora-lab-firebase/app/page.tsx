"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { BookOpen, Loader2 } from "lucide-react";

export default function Home() {
  const router = useRouter();
  
  const [nombre, setNombre] = useState("");
  const [matricula, setMatricula] = useState("");
  const [codigo, setCodigo] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [savedCode, setSavedCode] = useState("");

  useEffect(() => {
    const saved = localStorage.getItem('bitacora_resume_code');
    if (saved) {
      setSavedCode(saved);
      setCodigo(saved);
    }
  }, []);

  const handleStart = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nombre, matricula })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Error al crear sesión");
      
      // La máquina de estados define el primer paso. Vamos a Cierre como proxy o tu vista principal
      router.push(`/cierre?sessionId=${data.id}`); 
    } catch (err: any) {
      setError(err.message);
      setLoading(false);
    }
  };

  const handleResume = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: codigo })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Sesión no encontrada");
      
      router.push(`/cierre?sessionId=${data.id}`);
    } catch (err: any) {
      setError(err.message);
      setLoading(false);
    }
  };

  return (
    <main className="space-y-12 animate-in fade-in duration-500">
      <header className="space-y-4 border-b border-neutral-200 dark:border-neutral-800 pb-8">
        <div className="inline-flex items-center justify-center p-3 bg-neutral-100 dark:bg-neutral-900 rounded-lg">
          <BookOpen className="w-6 h-6 text-neutral-700 dark:text-neutral-300" />
        </div>
        <h1 className="text-3xl font-medium tracking-tight">
          Bitácora Guiada: Pet Theory
        </h1>
        <p className="text-neutral-600 dark:text-neutral-400 max-w-xl text-lg">
          Registro técnico de aprendizaje para el laboratorio GSP643.
        </p>
      </header>

      {error && (
        <div className="p-4 bg-red-50 text-red-700 border border-red-200 rounded-lg font-medium text-sm">
          {error}
        </div>
      )}

      <div className="grid md:grid-cols-2 gap-8">
        <section className="p-6 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 shadow-sm">
          <h2 className="text-xl font-medium mb-6">Nueva Sesión</h2>
          <form onSubmit={handleStart} className="space-y-4">
            <div className="space-y-2">
              <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300">
                Nombre Completo
              </label>
              <input 
                type="text" 
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                placeholder="Ej. Ana García"
                className="w-full px-3 py-2 bg-transparent border border-neutral-300 dark:border-neutral-700 rounded-md focus:outline-none focus:ring-2 focus:ring-neutral-900 transition-colors"
                required
              />
            </div>
            <div className="space-y-2">
              <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300">
                Matrícula / ID
              </label>
              <input 
                type="text" 
                value={matricula}
                onChange={(e) => setMatricula(e.target.value)}
                placeholder="Ej. A01234567"
                className="w-full px-3 py-2 bg-transparent border border-neutral-300 dark:border-neutral-700 rounded-md focus:outline-none focus:ring-2 focus:ring-neutral-900 transition-colors"
                required
              />
            </div>
            <button 
              type="submit"
              disabled={loading}
              className="w-full inline-flex justify-center items-center gap-2 py-2.5 px-4 bg-neutral-900 hover:bg-neutral-800 text-white font-medium rounded-md transition-colors disabled:opacity-50"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Comenzar Laboratorio"}
            </button>
          </form>
        </section>

        <section className="p-6 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900/50">
          <h2 className="text-xl font-medium mb-6">Reanudar Sesión</h2>
          <form onSubmit={handleResume} className="space-y-4">
            <div className="space-y-2">
              <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300">
                Código de Reanudación
              </label>
              <input 
                type="text"
                value={codigo}
                onChange={(e) => setCodigo(e.target.value)}
                placeholder="Ej. K7P-2QX"
                className="w-full px-3 py-2 bg-white dark:bg-neutral-950 border border-neutral-300 dark:border-neutral-700 rounded-md focus:outline-none focus:ring-2 focus:ring-neutral-900 font-mono uppercase"
                required
                maxLength={7}
              />
              {savedCode && (
                <div className="text-xs text-emerald-600 mt-1">
                  Código recuperado de tu navegador automáticamente.
                </div>
              )}
            </div>
            <button 
              type="submit"
              disabled={loading}
              className="w-full inline-flex justify-center items-center gap-2 py-2.5 px-4 bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white border border-neutral-200 dark:border-neutral-700 font-medium rounded-md hover:bg-neutral-50 transition-colors disabled:opacity-50"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Recuperar Avance"}
            </button>
          </form>
        </section>
      </div>
    </main>
  );
}
