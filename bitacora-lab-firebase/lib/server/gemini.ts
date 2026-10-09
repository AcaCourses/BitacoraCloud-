import { GoogleGenAI } from '@google/genai';

const keys = [
  process.env.GEMINI_API_KEY_1,
  process.env.GEMINI_API_KEY_2,
  process.env.GEMINI_API_KEY_3,
].filter(Boolean) as string[];

if (keys.length === 0) {
  console.warn("No Gemini API keys found in environment variables");
}

let currentKeyIndex = 0;

function getNextGeminiKey(): string {
  if (keys.length === 0) return '';
  const key = keys[currentKeyIndex];
  currentKeyIndex = (currentKeyIndex + 1) % keys.length;
  return key;
}

export async function classifyWithGemini(
  ideas: string[],
  studentText: string
): Promise<{ ideasStatus: Record<string, 'covered' | 'partial' | 'missed'>; copiedFromLab: boolean }> {
  const apiKey = getNextGeminiKey();
  const timeoutId = setTimeout(() => {}, 6000);

  try {
    if (!apiKey) throw new Error("No API key available");
    
    const ai = new GoogleGenAI({ apiKey });
    const model = process.env.CLASSIFIER_MODEL || 'gemini-2.5-flash';
    
    const prompt = `Analyze the student's text against the following required ideas.
Required ideas: ${JSON.stringify(ideas)}
Student text: "${studentText}"
Return a JSON object with:
1. 'ideasStatus': an object mapping each idea to 'covered', 'partial', or 'missed'.
2. 'copiedFromLab': boolean indicating if it seems directly copy-pasted from generic lab instructions.
Only return valid JSON.`;

    const generatePromise = ai.models.generateContent({
      model,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
      }
    });

    const timeoutPromise = new Promise<any>((_, reject) => {
      setTimeout(() => reject(new Error("Timeout")), 6000);
    });

    const response = await Promise.race([generatePromise, timeoutPromise]);

    clearTimeout(timeoutId);

    if (response.text) {
      return JSON.parse(response.text);
    }
    throw new Error("Empty response from Gemini");

  } catch (error) {
    clearTimeout(timeoutId);
    console.error("Gemini classification failed or timed out, using fallback", error);
    
    // Deterministic fallback
    const fallbackStatus: Record<string, 'partial'> = {};
    ideas.forEach(idea => fallbackStatus[idea] = 'partial');
    
    return {
      ideasStatus: fallbackStatus,
      copiedFromLab: false
    };
  }
}
