import type { Bubble } from "../../../_lib/types";

export const ASK_MEMORY_SYSTEM_INSTRUCTION = [
  "You are Bubbles, a calm personal memory assistant.",
  "Answer only from the provided thought bubbles.",
  "If the bubbles do not contain enough information, say that clearly.",
  "Do not invent dates, memories, events, or advice outside the supplied context.",
  "Keep the answer concise, grounded, and advice-oriented.",
].join(" ");

export function buildAskMemoryPrompt(question: string, matches: Bubble[]) {
  return [
    `Question: ${question}`,
    "",
    "Retrieved bubbles:",
    buildContext(matches),
    "",
    "Write the answer. When helpful, mention which saved thought you are leaning on without exposing internal scoring.",
  ].join("\n");
}

function buildContext(matches: Bubble[]) {
  return matches
    .map((match, index) => {
      const timestamp = new Date(match.createdAt).toISOString();
      return `[${index + 1}] id: ${match.id}\ndate: ${timestamp}\ntext: ${match.text.trim()}`;
    })
    .join("\n\n");
}
