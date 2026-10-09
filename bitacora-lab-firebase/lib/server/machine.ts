import { SessionRecord, ClosedStep, StepView, IdeaStatus } from '../types';
import { PHASES } from './phases.private';
import { classifyWithFallback } from './classify';

export function getPhaseDef(phaseIndex: number) {
  return PHASES[phaseIndex] || null;
}

export function validateAnswer(session: SessionRecord, stepId: string, answer: string): { valid: boolean; error?: string } {
  if (session.currentStepId !== stepId) {
    return { valid: false, error: 'Paso desincronizado' };
  }
  
  if (stepId === 'intro') return { valid: true };

  const phaseDef = getPhaseDef(session.phaseIndex);
  if (!phaseDef) return { valid: false, error: 'Fase inválida' };

  if (stepId.includes('actions')) {
    const arr = answer.split(',');
    if (arr.length === 0) return { valid: false, error: 'Selecciona opciones' };
  } else if (stepId.includes('v1Prompt') || stepId.includes('free')) {
    const words = answer.trim().split(/\s+/).filter(w => w.length > 0).length;
    let minWords = 10;
    if (stepId.includes('v1Prompt') && session.phaseIndex === 8) minWords = 40;
    else if (stepId.includes('v1Prompt')) minWords = 25;

    if (words < minWords) {
      return { valid: false, error: `Se requieren al menos ${minWords} palabras (actual: ${words})` };
    }
  }

  return { valid: true };
}

export function closeStep(session: SessionRecord, data: { stepId: string; answer: string; meta: any }): ClosedStep {
  if (data.stepId === 'intro') {
    return {
      stepId: data.stepId,
      type: 'free',
      at: new Date().toISOString(),
      prompt: 'Instrucciones leídas',
      answer: 'Sí'
    };
  }

  const phaseDef = getPhaseDef(session.phaseIndex)!;
  let type: ClosedStep['type'] = 'free';
  let prompt = '';
  let correct: boolean | undefined = undefined;

  if (data.stepId.includes('actions')) {
    type = 'actions';
    prompt = 'Acciones clave';
  } else if (data.stepId.includes('v1Prompt')) {
    type = 'free';
    prompt = phaseDef.v1Prompt;
  } else if (data.stepId.includes('guide')) {
    const ideaId = data.stepId.split('_')[1];
    const guide = phaseDef.guides[ideaId];
    prompt = guide?.prompt || '';
    if (guide?.type === 'choice') {
      type = 'guide-choice';
      const opt = guide.options?.find(o => o.text === data.answer);
      if (opt) correct = opt.correct;
    } else {
      type = 'guide-free';
    }
  } else if (data.stepId.includes('predict')) {
    type = 'predict';
    prompt = phaseDef.predict.prompt;
    correct = phaseDef.predict.correct === data.answer;
  } else if (data.stepId.includes('closing')) {
    type = 'close';
    prompt = phaseDef.closingPrompt;
  }

  return {
    stepId: data.stepId,
    type,
    at: new Date().toISOString(),
    prompt,
    answer: data.answer,
    correct,
    meta: data.meta
  };
}

export async function advance(session: SessionRecord, closedStep: ClosedStep): Promise<void> {
  if (closedStep.stepId === 'intro') {
    const nextDef = getPhaseDef(session.phaseIndex)!;
    if (session.entries.length === 0) {
      session.entries.push({
        phase: `phase_${session.phaseIndex}`,
        title: nextDef.title,
        startedAt: new Date().toISOString(),
        steps: [],
        ideas: {},
        notes: []
      });
    }
    if (nextDef.actions && nextDef.actions.length > 0) {
      session.currentStepId = `phase_${session.phaseIndex}_actions`;
    } else {
      session.currentStepId = `phase_${session.phaseIndex}_v1Prompt`;
    }
    return;
  }

  const phaseDef = getPhaseDef(session.phaseIndex);
  if (!phaseDef) return;

  const currentEntry = session.entries[session.entries.length - 1];
  currentEntry.steps.push(closedStep);

  const isV1 = closedStep.stepId.includes('v1Prompt');
  
  if (isV1) {
    const result = await classifyWithFallback(phaseDef.ideas, closedStep.answer);
    const pending: string[] = [];

    phaseDef.ideas.forEach(idea => {
      const st = result.ideasStatus[idea.id]?.status || 'missing';
      if (st === 'covered') {
        currentEntry.ideas[idea.id] = 'cubierta_v1';
      } else {
        pending.push(idea.id);
      }
    });

    session.pendingIdeas = pending.slice(0, 2); // Max 2 ideas to guide
    session.guideRound = 0;
    
    if (result.copiedFromLab) {
      currentEntry.notes.push("FLAG:copiedFromLab");
    }

    determineNextGuideOrPredict(session);
    return;
  }

  if (closedStep.stepId.includes('guide')) {
    const ideaId = session.pendingIdeas[session.guideRound];
    const guide = phaseDef.guides[ideaId];

    if (guide.type === 'choice') {
      if (closedStep.correct) {
        currentEntry.ideas[ideaId] = 'cubierta_con_guia';
        session.guideRound++;
      } else {
        // Retry logic: we just allow it to show again or mark misunderstanding. 
        // For simplicity in this strict model: 1 retry max (handled by stepView logic)
        // If it's a second failure, mark misunderstanding
        const previousAttempts = currentEntry.steps.filter(s => s.stepId === closedStep.stepId).length;
        if (previousAttempts >= 2) {
          currentEntry.ideas[ideaId] = 'malentendido';
          session.guideRound++;
        }
      }
    } else {
      // Re-classify free text (V1 + guide answer)
      const v1Step = currentEntry.steps.find(s => s.stepId.includes('v1Prompt'));
      const combinedText = (v1Step?.answer || '') + '\n' + closedStep.answer;
      
      const result = await classifyWithFallback([ { id: ideaId, desc: phaseDef.ideas.find(i=>i.id===ideaId)!.desc } ], combinedText);
      const st = result.ideasStatus[ideaId]?.status || 'missing';
      
      if (st === 'covered') {
        currentEntry.ideas[ideaId] = 'cubierta_con_guia';
      } else {
        currentEntry.ideas[ideaId] = 'sin_resolver';
      }
      session.guideRound++;
    }

    determineNextGuideOrPredict(session);
    return;
  }

  if (closedStep.stepId.includes('predict')) {
    session.currentStepId = `phase_${session.phaseIndex}_closing`;
    return;
  }

  if (closedStep.stepId.includes('closing')) {
    currentEntry.closedAt = new Date().toISOString();
    
    if (session.phaseIndex < PHASES.length - 1) {
      session.phaseIndex++;
      const nextDef = getPhaseDef(session.phaseIndex)!;
      session.entries.push({
        phase: `phase_${session.phaseIndex}`,
        title: nextDef.title,
        startedAt: new Date().toISOString(),
        steps: [],
        ideas: {},
        notes: []
      });
      if (nextDef.actions && nextDef.actions.length > 0) {
        session.currentStepId = `phase_${session.phaseIndex}_actions`;
      } else {
        session.currentStepId = `phase_${session.phaseIndex}_v1Prompt`;
      }
    } else {
      session.currentStepId = 'done';
    }
    return;
  }
}

function determineNextGuideOrPredict(session: SessionRecord) {
  if (session.guideRound < session.pendingIdeas.length) {
    const nextIdea = session.pendingIdeas[session.guideRound];
    session.currentStepId = `phase_${session.phaseIndex}_guide_${nextIdea}`;
  } else {
    session.currentStepId = `phase_${session.phaseIndex}_predict`;
  }
}

export function toStepView(session: SessionRecord): StepView | null {
  if (session.currentStepId === 'done' || !session.currentStepId) return null;

  if (session.currentStepId === 'intro') {
    return {
      id: 'intro',
      phase: 'Bienvenida',
      type: 'intro' as any,
      prompt: 'Instrucciones del Laboratorio',
    };
  }

  const phaseDef = getPhaseDef(session.phaseIndex);
  if (!phaseDef) return null;

  if (session.currentStepId.includes('actions')) {
    return {
      id: session.currentStepId,
      phase: phaseDef.title,
      type: 'actions',
      prompt: "Selecciona las acciones críticas que realizaste:",
      options: phaseDef.actions.map(a => a.text).sort(() => Math.random() - 0.5)
    };
  }

  if (session.currentStepId.includes('v1Prompt')) {
    let minWords = 25;
    if (session.phaseIndex === 8) minWords = 40;
    return {
      id: session.currentStepId,
      phase: phaseDef.title,
      type: 'free',
      prompt: phaseDef.v1Prompt,
      minWords
    };
  }

  if (session.currentStepId.includes('guide')) {
    const ideaId = session.currentStepId.split('_').pop()!;
    const guide = phaseDef.guides[ideaId];
    if (guide.type === 'choice') {
      // Check if retry
      const currentEntry = session.entries[session.entries.length - 1];
      const previousAttempts = currentEntry.steps.filter(s => s.stepId === session.currentStepId).length;
      let prompt = guide.prompt;
      if (previousAttempts > 0) {
        const failedOpt = guide.options?.find(o => o.text === currentEntry.steps[currentEntry.steps.length-1].answer);
        if (failedOpt && failedOpt.nudge) {
          prompt = failedOpt.nudge + ' ' + prompt;
        }
      }

      return {
        id: session.currentStepId,
        phase: phaseDef.title,
        type: 'guide-choice',
        prompt,
        options: guide.options?.map(o => o.text).sort(() => Math.random() - 0.5)
      };
    } else {
      return {
        id: session.currentStepId,
        phase: phaseDef.title,
        type: 'guide-free',
        prompt: guide.prompt,
        minWords: 10
      };
    }
  }

  if (session.currentStepId.includes('predict')) {
    return {
      id: session.currentStepId,
      phase: phaseDef.title,
      type: 'predict',
      prompt: phaseDef.predict.prompt,
      options: [...phaseDef.predict.options].sort(() => Math.random() - 0.5)
    };
  }

  if (session.currentStepId.includes('closing')) {
    return {
      id: session.currentStepId,
      phase: phaseDef.title,
      type: 'close',
      prompt: phaseDef.closingPrompt,
      minWords: 5
    };
  }

  return null;
}
