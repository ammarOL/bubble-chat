import { FormEvent, KeyboardEvent, RefObject } from "react";
import { formatTime } from "../_lib/date-format";
import type { BubbleGroup } from "../_lib/types";

type ThoughtStreamProps = {
  bubbleCount: number;
  draft: string;
  groups: BubbleGroup[];
  streamEndRef: RefObject<HTMLDivElement | null>;
  onClear: () => void;
  onDraftChange: (value: string) => void;
  onExport: () => void;
  onSubmit: () => void;
};

export function ThoughtStream({
  bubbleCount,
  draft,
  groups,
  streamEndRef,
  onClear,
  onDraftChange,
  onExport,
  onSubmit,
}: ThoughtStreamProps) {
  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    onSubmit();
  }

  function handleKeyDown(event: KeyboardEvent<HTMLTextAreaElement>) {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      onSubmit();
    }
  }

  return (
    <section
      className="memory-shell thought-panel flex h-full min-h-0 flex-col"
      aria-label="Thought stream"
    >
      <div className="panel-heading flex items-start justify-between gap-4 border-b border-[var(--line)] px-4 py-3 sm:px-5">
        <div className="min-w-0">
          <h2 className="text-base font-semibold text-[var(--ink)]">
            Bubbles
          </h2>
          <p className="mt-1 text-sm leading-5 text-[var(--muted)]">
            {bubbleCount} {bubbleCount === 1 ? "bubble" : "bubbles"} saved in
            this browser.
          </p>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <button
            className="quiet-button compact-button"
            aria-label="Export saved bubbles as JSON"
            disabled={bubbleCount === 0}
            type="button"
            onClick={onExport}
          >
            Export
          </button>
          <button
            className="quiet-button danger-button compact-button"
            aria-label="Clear saved bubbles from this browser"
            disabled={bubbleCount === 0}
            type="button"
            onClick={onClear}
          >
            Clear
          </button>
        </div>
      </div>

      <div className="bubble-scroll flex-1 space-y-6 overflow-y-auto px-4 py-5 sm:px-5">
        {groups.length === 0 ? (
          <div className="empty-state">
            <h3 className="text-lg font-semibold text-[var(--ink)]">
              Start with what is already in your head.
            </h3>
            <p className="mt-2 max-w-prose text-sm leading-6 text-[var(--muted)]">
              A sentence, a decision, a small piece of advice. Bubbles keeps
              the capture surface simple so the memory can grow without
              ceremony.
            </p>
          </div>
        ) : (
          groups.map((group) => (
            <div className="space-y-3" key={group.label}>
              <div className="sticky top-0 z-10 flex justify-center">
                <span className="date-chip bg-[var(--bg)] px-3 py-1 text-xs font-medium text-[var(--muted)] ring-1 ring-[var(--line)]">
                  {group.label}
                </span>
              </div>
              {group.items.map((bubble) => (
                <article className="flex justify-end" key={bubble.id}>
                  <div className="bubble">
                    <p className="whitespace-pre-wrap text-sm leading-6 text-pretty">
                      {bubble.text}
                    </p>
                    <time
                      className="mt-2 block text-right text-xs text-[var(--bubble-time)]"
                      dateTime={bubble.createdAt}
                    >
                      {formatTime(bubble.createdAt)}
                    </time>
                  </div>
                </article>
              ))}
            </div>
          ))
        )}
        <div ref={streamEndRef} />
      </div>

      <form
        className="composer border-t border-[var(--line)] p-3 sm:p-4"
        onSubmit={handleSubmit}
      >
        <label className="sr-only" htmlFor="bubble-draft">
          Capture a thought
        </label>
        <div className="composer-box">
          <textarea
            className="composer-input"
            id="bubble-draft"
            placeholder="Save a thought..."
            rows={2}
            value={draft}
            onChange={(event) => onDraftChange(event.target.value)}
            onKeyDown={handleKeyDown}
          />
          <div className="composer-actions">
            <span className="composer-state">Local</span>
            <button
              className="primary-button composer-submit"
              aria-label="Save thought"
              disabled={draft.trim().length === 0}
              type="submit"
            >
              Save
            </button>
          </div>
        </div>
      </form>
    </section>
  );
}
