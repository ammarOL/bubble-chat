import type {
  AiSettings,
  AskRequest,
  AskResponse,
  AskResult,
  Bubble,
} from "./types";
import { AI_PROVIDER_LABELS } from "./types";

export async function askMemory(
  question: string,
  matches: Bubble[],
  settings: AiSettings,
) {
  if (!settings.provider) {
    throw new Error("Save an API key in Settings before asking memory.");
  }

  const apiKey = settings.keys[settings.provider]?.trim();

  if (!apiKey) {
    throw new Error(
      `Save a ${AI_PROVIDER_LABELS[settings.provider]} API key in Settings before asking memory.`,
    );
  }

  const response = await fetch("/api/ask", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      question,
      provider: settings.provider,
      ...(apiKey ? { apiKey } : {}),
      matches: matches.map(({ id, text, createdAt }) => ({
        id,
        text,
        createdAt,
      })),
    } satisfies AskRequest),
  });

  const data = (await response.json()) as AskResponse;

  if (!response.ok || "error" in data) {
    throw new Error(
      "error" in data
        ? data.error
        : "Bubbles could not ask the selected provider right now.",
    );
  }

  if (!isAskResult(data)) {
    throw new Error(
      "The selected provider returned an answer Bubbles could not read.",
    );
  }

  return data;
}

function isAskResult(value: unknown): value is AskResult {
  if (!value || typeof value !== "object") {
    return false;
  }

  const result = value as Partial<AskResult>;

  return (
    typeof result.answer === "string" &&
    Array.isArray(result.usedBubbleIds) &&
    result.usedBubbleIds.every((id) => typeof id === "string")
  );
}
