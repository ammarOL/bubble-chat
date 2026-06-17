import { AI_PROVIDERS, type AiProvider, type AskRequest, type Bubble } from "../../../_lib/types";

export function parseAskRequest(payload: unknown): AskRequest {
  if (!payload || typeof payload !== "object") {
    throw new Error("Bubbles could not read that Ask Memory request.");
  }

  const body = payload as {
    apiKey?: unknown;
    question?: unknown;
    matches?: unknown;
    provider?: unknown;
  };
  const apiKey = typeof body.apiKey === "string" ? body.apiKey.trim() : "";
  const question =
    typeof body.question === "string" ? body.question.trim() : "";
  const matches = Array.isArray(body.matches)
    ? body.matches.filter(isBubble).slice(0, 5)
    : [];
  const provider = isAiProvider(body.provider) ? body.provider : null;

  if (!question) {
    throw new Error("Ask Memory needs a question.");
  }

  if (!provider) {
    throw new Error("Choose an AI provider before asking memory.");
  }

  if (matches.length === 0) {
    throw new Error("Ask Memory needs at least one retrieved bubble.");
  }

  return {
    question,
    matches,
    provider,
    ...(apiKey ? { apiKey } : {}),
  };
}

function isBubble(value: unknown): value is Bubble {
  if (!value || typeof value !== "object") {
    return false;
  }

  const match = value as Partial<Bubble>;

  return (
    typeof match.id === "string" &&
    typeof match.text === "string" &&
    typeof match.createdAt === "string" &&
    match.text.trim().length > 0
  );
}

function isAiProvider(value: unknown): value is AiProvider {
  return typeof value === "string" && AI_PROVIDERS.includes(value as AiProvider);
}
