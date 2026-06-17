"use client";

import { type KeyboardEvent, useEffect, useMemo, useRef, useState } from "react";
import { askMemory } from "../_lib/ask-memory";
import {
  BUBBLES_STORAGE_KEY,
  createBubble,
  createBubblesExport,
  parseStoredBubbles,
} from "../_lib/bubble-storage";
import { groupBubblesByDate } from "../_lib/date-format";
import { retrieveBubbles } from "../_lib/retrieval";
import type { AskResult, AskStatus, Bubble, RetrievedBubble } from "../_lib/types";
import { AskMemoryPanel } from "./AskMemoryPanel";
import { ThoughtStream } from "./ThoughtStream";

type AppTab = "chat" | "insights";

export function BubblesApp() {
  const [activeTab, setActiveTab] = useState<AppTab>("chat");
  const [bubbles, setBubbles] = useState<Bubble[]>([]);
  const [draft, setDraft] = useState("");
  const [question, setQuestion] = useState("");
  const [matches, setMatches] = useState<RetrievedBubble[]>([]);
  const [askResult, setAskResult] = useState<AskResult | null>(null);
  const [askStatus, setAskStatus] = useState<AskStatus>("idle");
  const [notice, setNotice] = useState("");
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
  ];

  useEffect(() => {
    const loadStoredBubbles = window.setTimeout(() => {
      try {
        setBubbles(
          parseStoredBubbles(window.localStorage.getItem(BUBBLES_STORAGE_KEY)),
        );
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
      setAskResult(await askMemory(trimmedQuestion, nextMatches));
      setAskStatus("answered");
    } catch (error) {
      setAskStatus("error");
      setNotice(
        error instanceof Error
          ? error.message
          : "Bubbles could not ask Gemini right now.",
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

    const confirmed = window.confirm(
      "Clear every saved bubble from this browser?",
    );

    if (!confirmed) {
      return;
    }

    setBubbles([]);
    setMatches([]);
    setAskResult(null);
    setAskStatus("idle");
    setNotice("Cleared the bubbles stored in this browser.");
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
              onClear={clearBubbles}
              onDraftChange={setDraft}
              onExport={exportBubbles}
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
        </div>
      </div>
    </main>
  );
}
