import {
  AI_PROVIDERS,
  type AiProvider,
  type AiSettings,
  type Bubble,
} from "./types";

export const BUBBLES_STORAGE_KEY = "bubbles:v1";
export const AI_SETTINGS_STORAGE_KEY = "bubbles:ai-settings:v1";

export const DEFAULT_AI_SETTINGS: AiSettings = {
  provider: "",
  keys: {},
};

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

export function parseStoredAiSettings(value: string | null): AiSettings {
  if (!value) {
    return DEFAULT_AI_SETTINGS;
  }

  const parsed = JSON.parse(value) as unknown;

  if (!parsed || typeof parsed !== "object") {
    return DEFAULT_AI_SETTINGS;
  }

  const settings = parsed as {
    provider?: unknown;
    keys?: unknown;
  };
  const keys: Partial<Record<AiProvider, string>> = {};

  if (settings.keys && typeof settings.keys === "object") {
    const storedKeys = settings.keys as Partial<Record<AiProvider, unknown>>;

    for (const keyProvider of AI_PROVIDERS) {
      const key = storedKeys[keyProvider];

      if (typeof key === "string" && key.trim()) {
        keys[keyProvider] = key.trim();
      }
    }
  }

  const provider =
    isAiProvider(settings.provider) && keys[settings.provider]?.trim()
      ? settings.provider
      : "";

  return { provider, keys };
}

export function serializeAiSettings(settings: AiSettings) {
  return JSON.stringify({
    provider: settings.provider,
    keys: settings.keys,
  });
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

function isAiProvider(value: unknown): value is AiProvider {
  return typeof value === "string" && AI_PROVIDERS.includes(value as AiProvider);
}
