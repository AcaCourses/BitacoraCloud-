import { NextResponse } from 'next/server';
import { z } from 'zod';
import { getSessionByCode, saveSession } from '@/lib/server/store';
import { SessionRecord } from '@/lib/types';
import crypto from 'crypto';

const startSchema = z.object({
  nombre: z.string().min(2),
  matricula: z.string().min(5),
});

const resumeSchema = z.object({
  code: z.string().min(6),
});

function generateResumeCode() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let result = '';
  for (let i = 0; i < 6; i++) {
    if (i === 3) result += '-';
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

export async function POST(req: Request) {
  try {
    const body = await req.json();

    if (body.code) {
      const parsed = resumeSchema.parse(body);
      const session = await getSessionByCode(parsed.code);
      if (!session) {
        return NextResponse.json({ error: 'Sesión no encontrada' }, { status: 404 });
      }
      return NextResponse.json(session);
    } else {
      const parsed = startSchema.parse(body);
      const newSession: SessionRecord = {
        id: crypto.randomUUID(),
        resumeCode: generateResumeCode(),
        nombre: parsed.nombre,
        matricula: parsed.matricula,
        createdAt: new Date().toISOString(),
        phaseIndex: 0,
        currentStepId: 'phase_0_actions',
        guideRound: 0,
        pendingIdeas: [],
        entries: [],
      };
      await saveSession(newSession);
      return NextResponse.json(newSession);
    }
  } catch (error) {
    return NextResponse.json({ error: 'Datos inválidos' }, { status: 400 });
  }
}
