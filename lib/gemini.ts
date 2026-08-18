import { GoogleGenAI } from "@google/genai";

export type GeminiFile = {
  data: string;
  mimeType: string;
};

type GenerateGeminiJsonInput = {
  instructions: string;
  prompt: string;
  schema: unknown;
  file?: GeminiFile;
};

export class GeminiConfigurationError extends Error {}

export function geminiModel() {
  return process.env.GEMINI_MODEL || "gemini-3.6-flash";
}

export async function generateGeminiJson({
  instructions,
  prompt,
  schema,
  file,
}: GenerateGeminiJsonInput) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new GeminiConfigurationError(
      "CareerOS AI is not configured yet. Add GEMINI_API_KEY in Vercel.",
    );
  }

  const model = geminiModel();
  const ai = new GoogleGenAI({ apiKey });
  const parts = [
    { text: prompt },
    ...(file
      ? [{ inlineData: { data: file.data, mimeType: file.mimeType } }]
      : []),
  ];

  const response = await ai.models.generateContent({
    model,
    contents: [{ role: "user", parts }],
    config: {
      systemInstruction: instructions,
      responseMimeType: "application/json",
      responseJsonSchema: schema,
    },
  });

  const text = response.text?.trim();
  if (!text) throw new Error("Gemini returned no content.");

  try {
    return { result: JSON.parse(text) as unknown, model };
  } catch {
    throw new Error("Gemini returned invalid structured output.");
  }
}

export function geminiErrorResponse(error: unknown, fallback: string) {
  if (error instanceof GeminiConfigurationError)
    return { message: error.message, status: 503 };
  const message = error instanceof Error ? error.message : fallback;
  return { message: message || fallback, status: 502 };
}
