import { GoogleGenAI } from "@google/genai";
import type { Bubble } from "../../../_lib/types";
import {
  ASK_MEMORY_SYSTEM_INSTRUCTION,
  buildAskMemoryPrompt,
} from "./prompt";

const GEMINI_MODEL = "gemini-3.5-flash";

export async function generateMemoryAnswer({
  matches,
  question,
}: {
  matches: Bubble[];
  question: string;
}) {
  const ai = new GoogleGenAI({});
  const response = await ai.models.generateContent({
    model: GEMINI_MODEL,
    contents: buildAskMemoryPrompt(question, matches),
    config: {
      systemInstruction: ASK_MEMORY_SYSTEM_INSTRUCTION,
      maxOutputTokens: 600,
    },
  });

  const answer = response.text?.trim();

  if (!answer) {
    throw new Error("Gemini did not return an answer for those bubbles.");
  }

  return answer;
}
