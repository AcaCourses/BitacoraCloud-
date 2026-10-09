import { NextResponse } from 'next/server';
import { getSession } from '@/lib/server/store';

export async function GET(req: Request, { params }: { params: { format: string } }) {
  const { searchParams } = new URL(req.url);
  const sessionId = searchParams.get('sessionId');
  // @ts-ignore
  const format = await params.format; // App Router dynamics

  if (!sessionId) {
    return NextResponse.json({ error: 'sessionId requerido' }, { status: 400 });
  }

  const session = await getSession(sessionId);
  if (!session || !session.finalReport) {
    return NextResponse.json({ error: 'Reporte no disponible' }, { status: 404 });
  }

  if (format === 'json') {
    return new NextResponse(JSON.stringify(session.finalReport, null, 2), {
      headers: {
        'Content-Type': 'application/json',
        'Content-Disposition': `attachment; filename="report_${session.matricula}.json"`
      }
    });
  }

  if (format === 'md') {
    const payload = session.finalReport.payload;
    const md = `# Reporte de Bitácora: Pet Theory (GSP643)
**Estudiante:** ${payload.student.nombre} (${payload.student.matricula})
**Fecha:** ${payload.timestamp}

## Diagnóstico del Sistema
${payload.metrics.summary}

### Métricas Clave
- **Resolución General:** ${(payload.metrics.resolutionRate * 100).toFixed(0)}%
- **Autonomía Inicial:** ${(payload.metrics.autonomyRate * 100).toFixed(0)}%

---
*Firma de Integridad: ${session.finalReport.sig}*
`;

    return new NextResponse(md, {
      headers: {
        'Content-Type': 'text/markdown',
        'Content-Disposition': `attachment; filename="report_${session.matricula}.md"`
      }
    });
  }

  return NextResponse.json({ error: 'Formato no soportado' }, { status: 400 });
}
