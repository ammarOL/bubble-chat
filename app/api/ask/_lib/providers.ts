import { GoogleGenAI } from "@google/genai";
import Groq from "groq-sdk";
import OpenAI from "openai";
import type { AiProvider, Bubble } from "../../../_lib/types";
import { AI_PROVIDER_LABELS } from "../../../_lib/types";
import {
  ASK_MEMORY_SYSTEM_INSTRUCTION,
  buildAskMemoryPrompt,
} from "./prompt";

const PROVIDER_MODELS: Record<AiProvider, string> = {
  openai: "gpt-5.2",
  groq: "llama-3.3-70b-versatile",
  gemini: "gemini-3.5-flash",
};

type GenerateMemoryAnswerOptions = {
  apiKey: string;
  matches: Bubble[];
  provider: AiProvider;
  question: string;
};

export async function generateMemoryAnswer({
  apiKey,
  matches,
  provider,
  question,
}: GenerateMemoryAnswerOptions) {
  const prompt = buildAskMemoryPrompt(question, matches);

  switch (provider) {
    case "openai":
      return callOpenAI(apiKey, prompt);
    case "groq":
      return callGroq(apiKey, prompt);
    case "gemini":
      return callGemini(apiKey, prompt);
  }
}

async function callOpenAI(apiKey: string, prompt: string) {
  try {
    const client = new OpenAI({ apiKey });
    const response = await client.responses.create({
      model: PROVIDER_MODELS.openai,
      instructions: ASK_MEMORY_SYSTEM_INSTRUCTION,
      input: prompt,
      max_output_tokens: 600,
    });
    const answer = response.output_text?.trim() ?? "";

    if (!answer) {
      throw new Error("OpenAI did not return an answer for those bubbles.");
    }

    return answer;
  } catch (error) {
    throwProviderError("openai", error);
  }
}

async function callGroq(apiKey: string, prompt: string) {
  try {
    const client = new Groq({ apiKey });
    const response = await client.chat.completions.create({
      model: PROVIDER_MODELS.groq,
      messages: [
        { role: "system", content: ASK_MEMORY_SYSTEM_INSTRUCTION },
        { role: "user", content: prompt },
      ],
      max_tokens: 600,
    });
    const answer = response.choices[0]?.message.content?.trim() ?? "";

    if (!answer) {
      throw new Error("Groq did not return an answer for those bubbles.");
    }

    return answer;
  } catch (error) {
    throwProviderError("groq", error);
  }
}

async function callGemini(apiKey: string, prompt: string) {
  try {
    const client = new GoogleGenAI({ apiKey });
    const response = await client.models.generateContent({
      model: PROVIDER_MODELS.gemini,
      contents: prompt,
      config: {
        systemInstruction: ASK_MEMORY_SYSTEM_INSTRUCTION,
        maxOutputTokens: 600,
      },
    });
    const answer = response.text?.trim() ?? "";

    if (!answer) {
      throw new Error("Gemini did not return an answer for those bubbles.");
    }

    return answer;
  } catch (error) {
    throwProviderError("gemini", error);
  }
}

function throwProviderError(provider: AiProvider, error: unknown): never {
  const label = AI_PROVIDER_LABELS[provider];
  const message = error instanceof Error ? error.message : "";

  throw new Error(
    message ? `${label}: ${message}` : `${label} could not answer right now.`,
  );
}
