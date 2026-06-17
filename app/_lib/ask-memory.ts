import type { AskRequest, AskResponse, AskResult, Bubble } from "./types";

export async function askMemory(question: string, matches: Bubble[]) {
  const response = await fetch("/api/ask", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      question,
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
      "error" in data ? data.error : "Bubbles could not ask Gemini right now.",
    );
  }

  if (!isAskResult(data)) {
    throw new Error("Gemini returned an answer Bubbles could not read.");
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
