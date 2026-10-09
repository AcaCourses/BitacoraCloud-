import { NextResponse } from 'next/server';
import { getSession, saveSession } from '@/lib/server/store';
import { generateFinalReport } from '@/lib/server/metrics';
import { signReport } from '@/lib/server/sign';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const sessionId = body.sessionId;

    if (!sessionId) {
      return NextResponse.json({ error: 'sessionId requerido' }, { status: 400 });
    }

    const session = await getSession(sessionId);
    if (!session) {
      return NextResponse.json({ error: 'Sesión no encontrada' }, { status: 404 });
    }

    if (session.currentStepId !== 'done') {
      return NextResponse.json({ error: 'El laboratorio no ha sido completado' }, { status: 400 });
    }

    if (!session.finalReport) {
      const metrics = generateFinalReport(session);
      
      const payload = {
        sessionId: session.id,
        student: { nombre: session.nombre, matricula: session.matricula },
        metrics,
        entries: session.entries,
        timestamp: new Date().toISOString()
      };

      const sig = signReport(payload);
      session.finalReport = { payload, sig };
      
      await saveSession(session);
    }

    return NextResponse.json(session.finalReport);
    
  } catch (error) {
    return NextResponse.json({ error: 'Error generando reporte final' }, { status: 500 });
  }
}
