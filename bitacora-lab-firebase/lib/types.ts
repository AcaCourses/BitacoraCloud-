export type StepType = 
  | 'actions' 
  | 'free' 
  | 'guide-choice' 
  | 'guide-free' 
  | 'predict' 
  | 'close' 
  | 'final-free' 
  | 'reflection';

export type IdeaStatus = 
  | 'cubierta_v1' 
  | 'cubierta_con_guia' 
  | 'malentendido' 
  | 'sin_resolver';

export interface StepView {
  id: string;
  phase: string;
  type: StepType;
  prompt: string;
  options?: string[];
  minWords?: number;
}

export interface ClosedStep {
  stepId: string;
  type: StepType;
  at: string;
  prompt: string;
  answer: string;
  correct?: boolean;
  meta: {
    msOnStep: number;
    typingMetrics?: any;
    pastedText?: boolean;
    confidence?: number;
  };
}

export interface PhaseEntry {
  phase: string;
  title: string;
  startedAt: string;
  closedAt?: string;
  steps: ClosedStep[];
  ideas: Record<string, IdeaStatus>;
  closing?: string;
  notes: string[];
}

export interface SessionRecord {
  id: string;
  resumeCode: string;
  nombre: string;
  matricula: string;
  createdAt: string;
  phaseIndex: number;
  currentStepId: string | null;
  guideRound: number;
  pendingIdeas: string[];
  entries: PhaseEntry[];
  finalReport?: any;
}

export interface GuideStepChoice {
  text: string;
  correct: boolean;
  nudge?: string;
}

export interface GuideStep {
  type: 'choice' | 'free';
  prompt: string;
  options?: GuideStepChoice[];
}

export interface PhaseDefinition {
  phase: number;
  title: string;
  actions: { text: string; correct: boolean }[];
  v1Prompt: string;
  ideas: { id: string; desc: string }[];
  guides: Record<string, GuideStep>;
  predict: { prompt: string; options: string[]; correct: string };
  closingPrompt: string;
}
