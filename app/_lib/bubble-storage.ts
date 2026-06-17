import type { Bubble } from "./types";

export const BUBBLES_STORAGE_KEY = "bubbles:v1";

export function makeBubbleId() {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }

  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

export function createBubble(text: string): Bubble {
  return {
    id: makeBubbleId(),
    text,
    createdAt: new Date().toISOString(),
  };
}

export function parseStoredBubbles(value: string | null) {
  if (!value) {
    return [];
  }

  const parsed = JSON.parse(value) as unknown;

  if (!Array.isArray(parsed)) {
    return [];
  }

  return parsed
    .filter(isBubble)
    .sort(
      (a, b) =>
        new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
    );
}

export function createBubblesExport(bubbles: Bubble[]) {
  return JSON.stringify(
    {
      exportedAt: new Date().toISOString(),
      bubbles,
    },
    null,
    2,
  );
}

function isBubble(value: unknown): value is Bubble {
  if (!value || typeof value !== "object") {
    return false;
  }

  const bubble = value as Partial<Bubble>;

  return (
    typeof bubble.id === "string" &&
    typeof bubble.text === "string" &&
    typeof bubble.createdAt === "string"
  );
}
