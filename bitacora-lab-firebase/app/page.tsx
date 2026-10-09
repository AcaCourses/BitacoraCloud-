import { BookOpen } from "lucide-react";

export default function Home() {
  return (
    <main className="space-y-12">
      <header className="space-y-4 border-b border-neutral-200 dark:border-neutral-800 pb-8">
        <div className="inline-flex items-center justify-center p-3 bg-neutral-100 dark:bg-neutral-900 rounded-lg">
          <BookOpen className="w-6 h-6 text-neutral-700 dark:text-neutral-300" />
        </div>
        <h1 className="text-3xl font-medium tracking-tight">
          Bitácora Guiada: Pet Theory
        </h1>
        <p className="text-neutral-600 dark:text-neutral-400 max-w-xl text-lg">
          Registro técnico de aprendizaje para el laboratorio GSP643. Completa los pasos según avances en Google Cloud Skills Boost.
        </p>
      </header>

      <div className="grid md:grid-cols-2 gap-8">
        <section className="p-6 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 shadow-sm">
          <h2 className="text-xl font-medium mb-6">Nueva Sesión</h2>
          <form className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="nombre" className="block text-sm font-medium text-neutral-700 dark:text-neutral-300">
                Nombre Completo
              </label>
              <input 
                id="nombre"
                type="text" 
                placeholder="Ej. Ana García"
                className="w-full px-3 py-2 bg-transparent border border-neutral-300 dark:border-neutral-700 rounded-md focus:outline-none focus:ring-2 focus:ring-neutral-900 dark:focus:ring-neutral-100 transition-colors"
                required
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="matricula" className="block text-sm font-medium text-neutral-700 dark:text-neutral-300">
                Matrícula / ID
              </label>
              <input 
                id="matricula"
                type="text" 
                placeholder="Ej. A01234567"
                className="w-full px-3 py-2 bg-transparent border border-neutral-300 dark:border-neutral-700 rounded-md focus:outline-none focus:ring-2 focus:ring-neutral-900 dark:focus:ring-neutral-100 transition-colors"
                required
              />
            </div>
            <button 
              type="submit"
              className="w-full py-2.5 px-4 bg-neutral-900 hover:bg-neutral-800 text-white dark:bg-neutral-100 dark:hover:bg-neutral-200 dark:text-neutral-900 font-medium rounded-md transition-colors"
            >
              Comenzar Laboratorio
            </button>
          </form>
        </section>

        <section className="p-6 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900/50">
          <h2 className="text-xl font-medium mb-6">Reanudar Sesión</h2>
          <form className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="codigo" className="block text-sm font-medium text-neutral-700 dark:text-neutral-300">
                Código de Reanudación
              </label>
              <input 
                id="codigo"
                type="text" 
                placeholder="Ej. K7P-2QX"
                className="w-full px-3 py-2 bg-white dark:bg-neutral-950 border border-neutral-300 dark:border-neutral-700 rounded-md focus:outline-none focus:ring-2 focus:ring-neutral-900 dark:focus:ring-neutral-100 transition-colors font-mono uppercase"
                required
                maxLength={7}
              />
            </div>
            <button 
              type="submit"
              className="w-full py-2.5 px-4 bg-white dark:bg-neutral-900 hover:bg-neutral-50 dark:hover:bg-neutral-800 text-neutral-900 dark:text-neutral-100 border border-neutral-200 dark:border-neutral-700 font-medium rounded-md transition-colors"
            >
              Recuperar Avance
            </button>
          </form>
          <p className="mt-4 text-sm text-neutral-500 dark:text-neutral-400">
            El código se genera automáticamente al iniciar una nueva sesión y se guarda por 30 días.
          </p>
        </section>
      </div>
    </main>
  );
}
