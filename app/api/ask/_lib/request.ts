import type { AskRequest, Bubble } from "../../../_lib/types";

export function parseAskRequest(payload: unknown): AskRequest {
  if (!payload || typeof payload !== "object") {
    throw new Error("Bubbles could not read that Ask Memory request.");
  }

  const body = payload as {
    question?: unknown;
    matches?: unknown;
  };
  const question =
    typeof body.question === "string" ? body.question.trim() : "";
  const matches = Array.isArray(body.matches)
    ? body.matches.filter(isBubble).slice(0, 5)
    : [];

  if (!question) {
    throw new Error("Ask Memory needs a question.");
  }

  if (matches.length === 0) {
    throw new Error("Ask Memory needs at least one retrieved bubble.");
  }

  return { question, matches };
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
