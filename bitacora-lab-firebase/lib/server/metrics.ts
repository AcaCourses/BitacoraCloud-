import { SessionRecord } from '../types';
import { PHASES } from './phases.private';

export interface FinalMetrics {
  totalIdeas: number;
  coveredV1: number;
  coveredGuide: number;
  misunderstood: number;
  totalPredicts: number;
  correctPredicts: number;
  flags: string[];
  summary: string;
  conceptsToReview: string[];
}

export function generateFinalReport(session: SessionRecord): FinalMetrics {
  let totalIdeas = 0, coveredV1 = 0, coveredGuide = 0, misunderstood = 0;
  let totalPredicts = 0, correctPredicts = 0;
  let fastV1Count = 0, copiedLabFlag = false;
  const conceptsToReview: string[] = [];

  session.entries.forEach((entry, i) => {
    const phaseDef = PHASES[i];
    if (!phaseDef) return;

    let phaseIdeas = Object.keys(phaseDef.guides).length;
    totalIdeas += phaseIdeas;

    Object.entries(entry.ideas).forEach(([ideaId, status]) => {
      if (status === 'cubierta_v1') coveredV1++;
      if (status === 'cubierta_con_guia') {
        coveredGuide++;
        conceptsToReview.push(phaseDef.ideas.find(x => x.id === ideaId)?.desc || ideaId);
      }
      if (status === 'malentendido' || status === 'sin_resolver') {
        misunderstood++;
        conceptsToReview.push("URGENTE: " + (phaseDef.ideas.find(x => x.id === ideaId)?.desc || ideaId));
      }
    });

    if (entry.notes.includes('FLAG:copiedFromLab')) copiedLabFlag = true;

    const v1Step = entry.steps.find(s => s.stepId.includes('v1Prompt'));
    if (v1Step && v1Step.meta?.msOnStep < 40000) fastV1Count++;

    const predStep = entry.steps.find(s => s.type === 'predict');
    if (predStep) {
      totalPredicts++;
      if (predStep.correct) correctPredicts++;
    }
  });

  const flags: string[] = [];
  if (copiedLabFlag) flags.push("Copia de lab detectada");
  if (fastV1Count > 3) flags.push("Ritmo apresurado (<40s en reflexión)");

  const summary = `El estudiante demostró dominio directo en ${coveredV1} de ${totalIdeas} conceptos clave. ` +
    `Requirió asistencia guiada en ${coveredGuide} conceptos, y no logró resolver ${misunderstood} escenarios. ` +
    `Su capacidad para predecir el impacto de la arquitectura fue de ${correctPredicts} aciertos sobre ${totalPredicts}.`;

  return {
    totalIdeas, coveredV1, coveredGuide, misunderstood,
    totalPredicts, correctPredicts, flags, summary, conceptsToReview
  };
}
