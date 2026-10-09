import { NextResponse } from 'next/server';
import { getSession } from '@/lib/server/store';
import { toStepView } from '@/lib/server/machine';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const sessionId = searchParams.get('sessionId');

  if (!sessionId) {
    return NextResponse.json({ error: 'sessionId requerido' }, { status: 400 });
  }

  const session = await getSession(sessionId);
  if (!session) {
    return NextResponse.json({ error: 'Sesión no encontrada' }, { status: 404 });
  }

  const currentStep = toStepView(session);

  // Return closed entries securely (remove correct answers and idea maps if not finished)
  const isDone = session.currentStepId === 'done';
  const closedEntries = session.entries.map(entry => {
    return {
      phase: entry.phase,
      title: entry.title,
      startedAt: entry.startedAt,
      closedAt: entry.closedAt,
      steps: entry.steps.map(s => ({
        stepId: s.stepId,
        type: s.type,
        at: s.at,
        prompt: s.prompt,
        answer: s.answer,
        // Only reveal correctness if done, or never? Lab design says never reveal correct until end.
        correct: isDone ? s.correct : undefined
      })),
      // Hide idea tracking from client
      ideas: isDone ? entry.ideas : {}
    };
  });

  return NextResponse.json({
    phaseIndex: session.phaseIndex,
    currentStep,
    closedEntries,
    isDone,
    resumeCode: session.resumeCode
  });
}
