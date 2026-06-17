export type Bubble = {
  id: string;
  text: string;
  createdAt: string;
};

export type RetrievedBubble = Bubble & {
  score: number;
};

export const AI_PROVIDERS = ["openai", "groq", "gemini"] as const;

export type AiProvider = (typeof AI_PROVIDERS)[number];

export const AI_PROVIDER_LABELS: Record<AiProvider, string> = {
  openai: "OpenAI",
  groq: "Groq",
  gemini: "Gemini",
};

export type AiSettings = {
  provider: AiProvider | "";
  keys: Partial<Record<AiProvider, string>>;
};

export type AskResult = {
  answer: string;
  usedBubbleIds: string[];
};

export type AskStatus = "idle" | "loading" | "answered" | "empty" | "error";

export type AskRequest = {
  question: string;
  matches: Bubble[];
  provider: AiProvider;
  apiKey?: string;
};

export type AskResponse = AskResult | { error: string };

export type BubbleGroup = {
  label: string;
  items: Bubble[];
};
