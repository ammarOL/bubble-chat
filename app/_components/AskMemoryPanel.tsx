import { FormEvent } from "react";
import { formatDate, formatTime } from "../_lib/date-format";
import type { AskResult, AskStatus, RetrievedBubble } from "../_lib/types";

type AskMemoryPanelProps = {
  askResult: AskResult | null;
  askStatus: AskStatus;
  matches: RetrievedBubble[];
  notice: string;
  question: string;
  onQuestionChange: (value: string) => void;
  onSubmit: () => void;
};

export function AskMemoryPanel({
  askResult,
  askStatus,
  matches,
  notice,
  question,
  onQuestionChange,
  onSubmit,
}: AskMemoryPanelProps) {
  const isLoading = askStatus === "loading";
  const hasQuestion = question.trim().length > 0;

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    onSubmit();
  }

  return (
    <aside className="memory-shell ask-panel h-full" aria-label="Ask memory">
      <div className="ask-panel-header panel-heading border-b border-[var(--line)] px-4 py-3 sm:px-5">
        <h2 className="text-base font-semibold text-[var(--ink)]">
          Ask memory
        </h2>
        <p className="mt-1 text-sm leading-6 text-[var(--muted)]">
          Bubbles retrieves local notes, then sends only the selected context to
          your selected provider.
        </p>
      </div>

      <div className="ask-panel-body space-y-4 p-4 sm:p-5">
        <form className="space-y-3" onSubmit={handleSubmit}>
          <label
            className="text-sm font-medium text-[var(--ink)]"
            htmlFor="memory-question"
          >
            Question
          </label>
          <textarea
            className="ask-input"
            id="memory-question"
            placeholder="What advice have I saved about this?"
            rows={4}
            value={question}
            onChange={(event) => onQuestionChange(event.target.value)}
          />
          <p className="text-xs leading-5 text-[var(--muted)]">
            Ask uses the closest local matches, then sends only those bubbles.
          </p>
          <button
            className="primary-button w-full"
            aria-busy={isLoading}
            disabled={isLoading || !hasQuestion}
            type="submit"
          >
            {isLoading ? "Asking memory..." : "Ask memory"}
          </button>
        </form>

        {isLoading ? (
          <div className="answer-box" aria-live="polite">
            <p className="text-sm font-semibold text-[var(--ink)]">
              Looking through your bubbles
            </p>
            <div className="mt-3 space-y-2">
              <span className="loading-line block h-2.5 w-11/12 rounded-full" />
              <span className="loading-line block h-2.5 w-8/12 rounded-full" />
            </div>
          </div>
        ) : null}

        {askStatus === "empty" ? (
          <div className="answer-box" aria-live="polite">
            <p className="text-sm font-semibold text-[var(--ink)]">
              No close match yet
            </p>
            <p className="mt-1 text-sm leading-6 text-[var(--muted-strong)]">
              Save a few more related bubbles, then ask again.
            </p>
          </div>
        ) : null}

        {askResult ? (
          <div className="answer-box" aria-live="polite">
            <p className="text-sm font-semibold text-[var(--ink)]">Answer</p>
            <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-[var(--muted-strong)]">
              {askResult.answer}
            </p>
          </div>
        ) : null}

        {matches.length > 0 ? (
          <RetrievedBubbles answer={askResult} matches={matches} />
        ) : null}

        <div className="privacy-note">
          <p className="text-sm leading-6 text-[var(--muted-strong)]">
            Capture stays local. Ask Memory contacts your selected provider
            only after it chooses relevant bubbles from this browser.
          </p>
        </div>

        {notice ? (
          <p
            className="notice-message rounded-md bg-[var(--surface)] px-3 py-2 text-sm text-[var(--muted-strong)] ring-1 ring-[var(--line)]"
            role={askStatus === "error" ? "alert" : "status"}
            aria-live={askStatus === "error" ? "assertive" : "polite"}
          >
            {notice}
          </p>
        ) : null}
      </div>
    </aside>
  );
}

function RetrievedBubbles({
  answer,
  matches,
}: {
  answer: AskResult | null;
  matches: RetrievedBubble[];
}) {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm font-semibold text-[var(--ink)]">Sources</p>
        <span className="text-xs font-medium text-[var(--muted)]">
          {matches.length} closest
        </span>
      </div>
      <div className="space-y-2">
        {matches.map((match) => {
          const wasUsed = answer?.usedBubbleIds.includes(match.id) ?? false;

          return (
            <div
              className="retrieved-bubble"
              data-used={wasUsed}
              key={match.id}
            >
              <p className="line-clamp-3 text-sm leading-6 text-[var(--muted-strong)]">
                {match.text}
              </p>
              <time
                className="mt-2 block text-xs text-[var(--muted)]"
                dateTime={match.createdAt}
              >
                {formatDate(match.createdAt)} at {formatTime(match.createdAt)}
              </time>
            </div>
          );
        })}
      </div>
    </div>
  );
}
