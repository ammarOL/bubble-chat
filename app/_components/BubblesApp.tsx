"use client";

import { type KeyboardEvent, useEffect, useMemo, useRef, useState } from "react";
import { askMemory } from "../_lib/ask-memory";
import {
  AI_SETTINGS_STORAGE_KEY,
  BUBBLES_STORAGE_KEY,
  DEFAULT_AI_SETTINGS,
  createBubble,
  createBubblesExport,
  parseStoredAiSettings,
  parseStoredBubbles,
  serializeAiSettings,
} from "../_lib/bubble-storage";
import { groupBubblesByDate } from "../_lib/date-format";
import { retrieveBubbles } from "../_lib/retrieval";
import {
  AI_PROVIDERS,
  AI_PROVIDER_LABELS,
  type AiProvider,
  type AiSettings,
  type AskResult,
  type AskStatus,
  type Bubble,
  type RetrievedBubble,
} from "../_lib/types";
import { AskMemoryPanel } from "./AskMemoryPanel";
import { ConfirmationDialog } from "./ConfirmationDialog";
import { SettingsPanel } from "./SettingsPanel";
import { ThoughtStream } from "./ThoughtStream";

type AppTab = "chat" | "insights" | "settings";
type PendingConfirmation =
  | { type: "clear-bubbles" }
  | { provider: AiProvider; type: "remove-api-key" };

export function BubblesApp() {
  const [activeTab, setActiveTab] = useState<AppTab>("chat");
  const [aiSettings, setAiSettings] =
    useState<AiSettings>(DEFAULT_AI_SETTINGS);
  const [selectedSettingsProvider, setSelectedSettingsProvider] =
    useState<AiProvider>("gemini");
  const [bubbles, setBubbles] = useState<Bubble[]>([]);
  const [draft, setDraft] = useState("");
  const [question, setQuestion] = useState("");
  const [matches, setMatches] = useState<RetrievedBubble[]>([]);
  const [askResult, setAskResult] = useState<AskResult | null>(null);
  const [askStatus, setAskStatus] = useState<AskStatus>("idle");
  const [notice, setNotice] = useState("");
  const [pendingConfirmation, setPendingConfirmation] =
    useState<PendingConfirmation | null>(null);
  const [isReady, setIsReady] = useState(false);
  const streamEndRef = useRef<HTMLDivElement | null>(null);

  const groupedBubbles = useMemo(() => groupBubblesByDate(bubbles), [bubbles]);
  const tabItems: {
    id: AppTab;
    label: string;
    meta: string;
    panelId: string;
  }[] = [
    {
      id: "chat",
      label: "Chat",
      meta: `${bubbles.length}`,
      panelId: "chat-panel",
    },
    {
      id: "insights",
      label: "Insights",
      meta: matches.length > 0 ? `${matches.length}` : "Ask",
      panelId: "insights-panel",
    },
    {
      id: "settings",
      label: "Settings",
      meta: aiSettings.provider ? "Key" : "Setup",
      panelId: "settings-panel",
    },
  ];

  useEffect(() => {
    const loadStoredBubbles = window.setTimeout(() => {
      try {
        setBubbles(
          parseStoredBubbles(window.localStorage.getItem(BUBBLES_STORAGE_KEY)),
        );
        const storedAiSettings = parseStoredAiSettings(
          window.localStorage.getItem(AI_SETTINGS_STORAGE_KEY),
        );
        setAiSettings(storedAiSettings);
        setSelectedSettingsProvider(storedAiSettings.provider || "gemini");
      } catch {
        setNotice("I could not read the saved bubbles in this browser.");
      } finally {
        setIsReady(true);
      }
    }, 0);

    return () => window.clearTimeout(loadStoredBubbles);
  }, []);

  useEffect(() => {
    if (!isReady) {
      return;
    }

    window.localStorage.setItem(BUBBLES_STORAGE_KEY, JSON.stringify(bubbles));
  }, [bubbles, isReady]);

  useEffect(() => {
    if (!isReady) {
      return;
    }

    window.localStorage.setItem(
      AI_SETTINGS_STORAGE_KEY,
      serializeAiSettings(aiSettings),
    );
  }, [aiSettings, isReady]);

  useEffect(() => {
    streamEndRef.current?.scrollIntoView({ block: "end" });
  }, [bubbles.length]);

  function addBubble() {
    const text = draft.trim();

    if (!text) {
      return;
    }

    setBubbles((current) => [...current, createBubble(text)]);
    setDraft("");
    setNotice("Saved in this browser.");
    setActiveTab("chat");
  }

  async function handleAskMemory() {
    const trimmedQuestion = question.trim();
    setAskResult(null);
    setNotice("");

    if (!trimmedQuestion) {
      setAskStatus("error");
      setNotice("Ask a question first.");
      setActiveTab("insights");
      return;
    }

    const nextMatches = retrieveBubbles(trimmedQuestion, bubbles);
    setMatches(nextMatches);

    if (nextMatches.length === 0) {
      setAskStatus("empty");
      setActiveTab("insights");
      return;
    }

    setAskStatus("loading");
    setActiveTab("insights");

    try {
      setAskResult(await askMemory(trimmedQuestion, nextMatches, aiSettings));
      setAskStatus("answered");
    } catch (error) {
      setAskStatus("error");
      setNotice(
        error instanceof Error
          ? error.message
          : "Bubbles could not ask the selected provider right now.",
      );
    }
  }

  function exportBubbles() {
    const blob = new Blob([createBubblesExport(bubbles)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.download = `bubbles-${new Date().toISOString().slice(0, 10)}.json`;
    link.click();
    URL.revokeObjectURL(url);
    setNotice("Exported your bubbles as JSON.");
  }

  function clearBubbles() {
    if (bubbles.length === 0) {
      return;
    }

    setPendingConfirmation({ type: "clear-bubbles" });
  }

  function confirmClearBubbles() {
    setBubbles([]);
    setMatches([]);
    setAskResult(null);
    setAskStatus("idle");
    setPendingConfirmation(null);
    setNotice("Cleared the bubbles stored in this browser.");
  }

  function changeProvider(provider: AiProvider) {
    setSelectedSettingsProvider(provider);

    if (!aiSettings.keys[provider]?.trim()) {
      setNotice(
        `Save a ${AI_PROVIDER_LABELS[provider]} API key before switching to ${AI_PROVIDER_LABELS[provider]}.`,
      );
      return;
    }

    setAiSettings((current) => ({
      ...current,
      provider,
    }));
    setNotice(`Ask Memory will use ${AI_PROVIDER_LABELS[provider]}.`);
  }

  function saveApiKey(provider: AiProvider, apiKey: string) {
    const trimmedApiKey = apiKey.trim();

    if (!trimmedApiKey) {
      setNotice(`Paste a ${AI_PROVIDER_LABELS[provider]} API key before saving.`);
      return;
    }

    setAiSettings((current) => ({
      ...current,
      keys: {
        ...current.keys,
        [provider]: trimmedApiKey,
      },
      provider,
    }));
    setSelectedSettingsProvider(provider);
    setNotice(`Saved ${AI_PROVIDER_LABELS[provider]} key in this browser.`);
  }

  function removeApiKey(provider: AiProvider) {
    if (!aiSettings.keys[provider]?.trim()) {
      return;
    }

    setPendingConfirmation({ provider, type: "remove-api-key" });
  }

  function confirmRemoveApiKey(provider: AiProvider) {
    const nextKeysForSelection = { ...aiSettings.keys };
    delete nextKeysForSelection[provider];
    const fallbackProvider = findFirstSavedProvider(nextKeysForSelection);

    setAiSettings((current) => {
      const nextKeys = { ...current.keys };
      delete nextKeys[provider];
      const nextProvider =
        current.provider === provider
          ? findFirstSavedProvider(nextKeys)
          : current.provider;

      return {
        ...current,
        keys: nextKeys,
        provider: nextProvider,
      };
    });
    setSelectedSettingsProvider((current) =>
      current === provider ? fallbackProvider || provider : current,
    );
    setPendingConfirmation(null);
    setNotice(`Removed ${AI_PROVIDER_LABELS[provider]} key from this browser.`);
  }

  function cancelPendingConfirmation() {
    setPendingConfirmation(null);
  }

  function selectTab(tab: AppTab) {
    setActiveTab(tab);
  }

  function handleTabKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    if (event.key !== "ArrowLeft" && event.key !== "ArrowRight") {
      return;
    }

    event.preventDefault();
    const currentIndex = tabItems.findIndex((tab) => tab.id === activeTab);
    const direction = event.key === "ArrowRight" ? 1 : -1;
    const nextIndex =
      (currentIndex + direction + tabItems.length) % tabItems.length;
    const nextTab = tabItems[nextIndex];

    setActiveTab(nextTab.id);
    window.requestAnimationFrame(() => {
      document.getElementById(`${nextTab.id}-tab`)?.focus();
    });
  }

  return (
    <main className="app-frame h-svh overflow-hidden bg-[var(--bg)] text-[var(--ink)]">
      <div className="app-viewport mx-auto flex h-full w-full max-w-5xl flex-col px-3 py-3 sm:px-5 sm:py-4">
        <div className="tabbar-shell">
          <div
            className="app-tabs"
            role="tablist"
            aria-label="Bubbles pages"
            onKeyDown={handleTabKeyDown}
          >
            {tabItems.map((tab) => (
              <button
                className="app-tab"
                id={`${tab.id}-tab`}
                key={tab.id}
                type="button"
                role="tab"
                aria-controls={tab.panelId}
                aria-selected={activeTab === tab.id}
                tabIndex={activeTab === tab.id ? 0 : -1}
                onClick={() => selectTab(tab.id)}
              >
                <span>{tab.label}</span>
                <span className="app-tab-meta">{tab.meta}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="tab-page min-h-0 flex-1">
          <div
            className="tab-panel h-full"
            id="chat-panel"
            role="tabpanel"
            aria-labelledby="chat-tab"
            hidden={activeTab !== "chat"}
          >
            <ThoughtStream
              draft={draft}
              groups={groupedBubbles}
              streamEndRef={streamEndRef}
              bubbleCount={bubbles.length}
              onDraftChange={setDraft}
              onSubmit={addBubble}
            />
          </div>

          <div
            className="tab-panel h-full"
            id="insights-panel"
            role="tabpanel"
            aria-labelledby="insights-tab"
            hidden={activeTab !== "insights"}
          >
            <AskMemoryPanel
              askResult={askResult}
              askStatus={askStatus}
              matches={matches}
              notice={notice}
              question={question}
              onQuestionChange={setQuestion}
              onSubmit={handleAskMemory}
            />
          </div>

          <div
            className="tab-panel h-full"
            id="settings-panel"
            role="tabpanel"
            aria-labelledby="settings-tab"
            hidden={activeTab !== "settings"}
          >
            <SettingsPanel
              bubbleCount={bubbles.length}
              selectedProvider={selectedSettingsProvider}
              settings={aiSettings}
              onClear={clearBubbles}
              onExport={exportBubbles}
              onProviderChange={changeProvider}
              onRemoveApiKey={removeApiKey}
              onSaveApiKey={saveApiKey}
            />
          </div>
        </div>
      </div>
      {pendingConfirmation ? (
        <ConfirmationDialog
          confirmLabel={
            pendingConfirmation.type === "clear-bubbles"
              ? "Clear bubbles"
              : "Remove key"
          }
          description={
            pendingConfirmation.type === "clear-bubbles"
              ? "This removes every saved bubble, the current Ask Memory matches, and the current answer from this browser. Provider settings stay untouched."
              : `This removes the saved ${AI_PROVIDER_LABELS[pendingConfirmation.provider]} key from this browser. Server fallback can still be used if it is configured.`
          }
          title={
            pendingConfirmation.type === "clear-bubbles"
              ? "Clear all saved bubbles?"
              : "Remove this API key?"
          }
          onCancel={cancelPendingConfirmation}
          onConfirm={() => {
            if (pendingConfirmation.type === "clear-bubbles") {
              confirmClearBubbles();
              return;
            }

            confirmRemoveApiKey(pendingConfirmation.provider);
          }}
        />
      ) : null}
    </main>
  );
}

function findFirstSavedProvider(keys: Partial<Record<AiProvider, string>>) {
  return AI_PROVIDERS.find((provider) => keys[provider]?.trim()) ?? "";
}
