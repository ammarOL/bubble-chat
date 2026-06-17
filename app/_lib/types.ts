export type Bubble = {
  id: string;
  text: string;
  createdAt: string;
};

export type RetrievedBubble = Bubble & {
  score: number;
};

export type AskResult = {
  answer: string;
  usedBubbleIds: string[];
};

export type AskStatus = "idle" | "loading" | "answered" | "empty" | "error";

export type AskRequest = {
  question: string;
  matches: Bubble[];
};

export type AskResponse = AskResult | { error: string };

export type BubbleGroup = {
  label: string;
  items: Bubble[];
};
