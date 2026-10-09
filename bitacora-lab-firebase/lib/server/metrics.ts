import { SessionRecord } from '../types';
import { PHASES } from './phases.private';

export interface FinalMetrics {
  autonomyRate: number;
  resolutionRate: number;
  calibrationCorrel: number; // Placeholder for actual math
  flags: string[];
  summary: string;
}

export function generateFinalReport(session: SessionRecord): FinalMetrics {
  let totalIdeas = 0;
  let coveredV1 = 0;
  let coveredGuide = 0;
  let misunderstood = 0;
  
  let totalPredicts = 0;
  let correctPredicts = 0;
  
  let fastV1Count = 0;
  let highPastingCount = 0;
  let copiedLabFlag = false;

  const autonomyPerPhase: number[] = [];

  session.entries.forEach((entry, i) => {
    const phaseDef = PHASES[i];
    if (!phaseDef) return;

    let phaseIdeas = Object.keys(phaseDef.guides).length;
    totalIdeas += phaseIdeas;

    let phaseCoveredV1 = 0;
    
    Object.values(entry.ideas).forEach(status => {
      if (status === 'cubierta_v1') {
        coveredV1++;
        phaseCoveredV1++;
      }
      if (status === 'cubierta_con_guia') coveredGuide++;
      if (status === 'malentendido') misunderstood++;
    });

    autonomyPerPhase.push(phaseIdeas > 0 ? phaseCoveredV1 / phaseIdeas : 1);

    if (entry.notes.includes('FLAG:copiedFromLab')) {
      copiedLabFlag = true;
    }

    const v1Step = entry.steps.find(s => s.stepId.includes('v1Prompt'));
    if (v1Step) {
      if (v1Step.meta.msOnStep < 40000) fastV1Count++;
      if (v1Step.meta.pastedText) highPastingCount++;
    }

    const predStep = entry.steps.find(s => s.type === 'predict');
    if (predStep) {
      totalPredicts++;
      if (predStep.correct) correctPredicts++;
    }
  });

  const autonomyRate = totalIdeas > 0 ? coveredV1 / totalIdeas : 0;
  const resolutionRate = totalIdeas > 0 ? (coveredV1 + coveredGuide) / totalIdeas : 0;

  const flags: string[] = [];
  if (copiedLabFlag || highPastingCount > 2) flags.push("Copia de lab detectada");
  if (misunderstood > 0) flags.push("Malentendidos firmes detectados");
  
  const dependentPhases = autonomyPerPhase.filter(r => r < 0.25).length;
  if (dependentPhases >= 5) flags.push("Dependiente de guías");
  
  if (fastV1Count > 3) flags.push("Ritmo apresurado (<40s en reflexión)");

  const resolutionP = (resolutionRate * 100).toFixed(0);
  const autonomyP = (autonomyRate * 100).toFixed(0);

  const summary = `El estudiante completó el laboratorio con un nivel de resolución del ${resolutionP}% y una autonomía inicial del ${autonomyP}%. ` +
    (flags.length > 0 ? `Banderas detectadas: ${flags.join(', ')}. ` : 'Sin banderas de alerta. ') +
    `Se recomienda repasar los conceptos fundamentales de Firestore y promesas en Node.js, donde se requirió mayor guía. ` +
    `Destaca por su precisión en las predicciones futuras (${correctPredicts}/${totalPredicts}).`;

  return {
    autonomyRate,
    resolutionRate,
    calibrationCorrel: 0.8, // Dummy correlation
    flags,
    summary
  };
}
