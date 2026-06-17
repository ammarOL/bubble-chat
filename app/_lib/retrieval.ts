import type { Bubble } from "./types";

const MAX_MATCHES = 5;

const STOP_WORDS = new Set([
  "a",
  "an",
  "and",
  "are",
  "as",
  "at",
  "be",
  "but",
  "by",
  "do",
  "for",
  "from",
  "have",
  "how",
  "i",
  "in",
  "is",
  "it",
  "me",
  "my",
  "of",
  "on",
  "or",
  "that",
  "the",
  "this",
  "to",
  "was",
  "what",
  "when",
  "where",
  "with",
]);

export function retrieveBubbles(query: string, bubbles: Bubble[]) {
  return bubbles
    .map((bubble) => ({ ...bubble, score: scoreBubble(query, bubble) }))
    .filter((bubble) => bubble.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, MAX_MATCHES);
}

function normalizeText(value: string) {
  return value
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function tokenize(value: string) {
  return normalizeText(value)
    .split(" ")
    .filter((token) => token.length > 1 && !STOP_WORDS.has(token));
}

function scoreBubble(query: string, bubble: Bubble) {
  const normalizedQuery = normalizeText(query);
  const normalizedBubble = normalizeText(bubble.text);
  const queryTokens = Array.from(new Set(tokenize(query)));
  const bubbleTokens = new Set(tokenize(bubble.text));

  if (!normalizedQuery || queryTokens.length === 0) {
    return 0;
  }

  let score = 0;
  const overlap = queryTokens.filter((token) => bubbleTokens.has(token));

  score += overlap.length * 2.4;

  if (normalizedBubble.includes(normalizedQuery)) {
    score += 7;
  }

  for (const token of queryTokens) {
    if (normalizedBubble.includes(token) && !bubbleTokens.has(token)) {
      score += 0.5;
    }
  }

  const ageInDays =
    (Date.now() - new Date(bubble.createdAt).getTime()) / (1000 * 60 * 60 * 24);
  const recencyBoost = Math.max(0, 1.25 - ageInDays / 45);

  return score > 0 ? score + recencyBoost : 0;
}
