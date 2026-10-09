import { NextResponse } from 'next/server';
import { z } from 'zod';
import { getSession, saveSession } from '@/lib/server/store';
import { validateAnswer, closeStep, advance } from '@/lib/server/machine';
import { PHASES } from '@/lib/server/phases.private';

const answerSchema = z.object({
  sessionId: z.string().uuid(),
  stepId: z.string(),
  answer: z.string(),
  meta: z.object({
    msOnStep: z.number(),
    pastedText: z.boolean().optional(),
    typingMetrics: z.any().optional(),
  }),
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const parsed = answerSchema.parse(body);

    const session = await getSession(parsed.sessionId);
    if (!session) {
      return NextResponse.json({ error: 'Sesión no encontrada' }, { status: 404 });
    }

    const validation = validateAnswer(session, parsed.stepId, parsed.answer);
    if (!validation.valid) {
      return NextResponse.json({ error: validation.error }, { status: 400 });
    }

    // Ensure phase exists in entries
    if (session.entries.length === 0 || session.entries[session.entries.length - 1].closedAt) {
      const phaseDef = PHASES[session.phaseIndex];
      if (!session.entries.find(e => e.phase === `phase_${session.phaseIndex}`)) {
        session.entries.push({
          phase: `phase_${session.phaseIndex}`,
          title: phaseDef.title,
          startedAt: new Date().toISOString(),
          steps: [],
          ideas: {},
          notes: []
        });
      }
    }

    const step = closeStep(session, parsed);
    await advance(session, step);
    await saveSession(session);

    return NextResponse.json({ success: true, nextStepId: session.currentStepId });
    
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Datos inválidos o error procesando' }, { status: 400 });
  }
}
