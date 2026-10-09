import { GoogleGenAI } from '@google/genai';
import { z } from 'zod';
import { buildClassifierPrompt } from './prompts';

const keys = [
  process.env.GEMINI_API_KEY_1,
  process.env.GEMINI_API_KEY_2,
  process.env.GEMINI_API_KEY_3,
].filter(Boolean) as string[];

let currentKeyIndex = 0;

function getNextGeminiKey(): string {
  if (keys.length === 0) return '';
  const key = keys[currentKeyIndex];
  currentKeyIndex = (currentKeyIndex + 1) % keys.length;
  return key;
}

const classifierSchema = z.object({
  ideasStatus: z.record(z.string(), z.object({
    status: z.enum(['covered', 'partial', 'missing']),
    evidence: z.string()
  })),
  copiedFromLab: z.boolean()
});

export type ClassifierResult = z.infer<typeof classifierSchema>;

export async function classifyWithFallback(
  ideas: { id: string; desc: string }[],
  studentText: string
): Promise<ClassifierResult> {
  const apiKey = getNextGeminiKey();
  const timeoutId = setTimeout(() => {}, 6000);

  const fallback: ClassifierResult = {
    ideasStatus: {},
    copiedFromLab: false
  };
  ideas.forEach(idea => {
    fallback.ideasStatus[idea.id] = { status: 'partial', evidence: 'fallback silencioso' };
  });

  if (!apiKey) {
    console.warn("No API key available, using fallback");
    clearTimeout(timeoutId);
    return fallback;
  }

  try {
    const ai = new GoogleGenAI({ apiKey });
    const model = process.env.CLASSIFIER_MODEL || 'gemini-2.5-flash';
    const prompt = buildClassifierPrompt(ideas, studentText);

    const generatePromise = ai.models.generateContent({
      model,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        temperature: 0,
      }
    });

    const timeoutPromise = new Promise<any>((_, reject) => {
      setTimeout(() => reject(new Error("Timeout")), 6000);
    });

    const response = await Promise.race([generatePromise, timeoutPromise]);

    clearTimeout(timeoutId);

    if (!response.text) throw new Error("Empty response");

    const parsed = JSON.parse(response.text);
    return classifierSchema.parse(parsed);

  } catch (error) {
    clearTimeout(timeoutId);
    console.error("Gemini classification failed or timed out", error);
    return fallback;
  }
}
