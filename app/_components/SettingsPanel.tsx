import { FormEvent } from "react";
import {
  AI_PROVIDER_LABELS,
  AI_PROVIDERS,
  type AiProvider,
  type AiSettings,
} from "../_lib/types";

type SettingsPanelProps = {
  bubbleCount: number;
  selectedProvider: AiProvider;
  settings: AiSettings;
  onClear: () => void;
  onExport: () => void;
  onProviderChange: (provider: AiProvider) => void;
  onRemoveApiKey: (provider: AiProvider) => void;
  onSaveApiKey: (provider: AiProvider, apiKey: string) => void;
};

export function SettingsPanel({
  bubbleCount,
  selectedProvider,
  settings,
  onClear,
  onExport,
  onProviderChange,
  onRemoveApiKey,
  onSaveApiKey,
}: SettingsPanelProps) {
  const savedKey = settings.keys[selectedProvider]?.trim() ?? "";
  const providerLabel = AI_PROVIDER_LABELS[selectedProvider];
  const isActiveProvider = settings.provider === selectedProvider;

  function handleSaveApiKey(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const apiKey = formData.get("apiKey");

    if (typeof apiKey === "string") {
      onSaveApiKey(selectedProvider, apiKey);
    }
  }

  return (
    <section className="memory-shell settings-panel h-full" aria-label="Settings">
      <div className="panel-heading border-b border-[var(--line)] px-4 py-3 sm:px-5">
        <h2 className="text-base font-semibold text-[var(--ink)]">Settings</h2>
        <p className="mt-1 text-sm leading-5 text-[var(--muted)]">
          Choose the provider Ask Memory uses and manage local data.
        </p>
      </div>

      <div className="settings-body">
        <section className="settings-section" aria-labelledby="provider-heading">
          <div>
            <h3
              className="text-sm font-semibold text-[var(--ink)]"
              id="provider-heading"
            >
              AI provider
            </h3>
            <p className="mt-1 text-sm leading-6 text-[var(--muted)]">
              Browser keys are stored locally and take priority over server
              fallback keys.
            </p>
          </div>

          <label className="field-label" htmlFor="ai-provider">
            Provider
          </label>
          <select
            className="settings-select"
            id="ai-provider"
            value={selectedProvider}
            onChange={(event) =>
              onProviderChange(event.target.value as AiProvider)
            }
          >
            {AI_PROVIDERS.map((provider) => (
              <option key={provider} value={provider}>
                {AI_PROVIDER_LABELS[provider]}
              </option>
            ))}
          </select>

          <form className="settings-key-form" onSubmit={handleSaveApiKey}>
            <label className="field-label" htmlFor="provider-api-key">
              {providerLabel} API key
            </label>
            <input
              autoComplete="off"
              spellCheck={false}
              className="settings-input"
              defaultValue={savedKey}
              id="provider-api-key"
              key={selectedProvider}
              name="apiKey"
              placeholder={`Paste a ${providerLabel} key`}
              type="password"
            />
            <p className="settings-status">
              {savedKey
                ? isActiveProvider
                  ? `Using the browser key saved for ${providerLabel}.`
                  : `A browser key is saved for ${providerLabel}. Select it to use this provider.`
                : `Save a browser key before switching to ${providerLabel}.`}
            </p>
            <div className="settings-actions">
              <button
                className="primary-button compact-button"
                type="submit"
              >
                Save key
              </button>
              <button
                className="quiet-button compact-button"
                disabled={!savedKey}
                type="button"
                onClick={() => onRemoveApiKey(selectedProvider)}
              >
                Remove key
              </button>
            </div>
          </form>
        </section>

        <section className="settings-section" aria-labelledby="data-heading">
          <div>
            <h3
              className="text-sm font-semibold text-[var(--ink)]"
              id="data-heading"
            >
              Local data
            </h3>
            <p className="mt-1 text-sm leading-6 text-[var(--muted)]">
              {bubbleCount} {bubbleCount === 1 ? "bubble" : "bubbles"} stored
              in this browser. API keys are never included in exports.
            </p>
          </div>

          <div className="settings-actions">
            <button
              className="quiet-button compact-button"
              disabled={bubbleCount === 0}
              type="button"
              onClick={onExport}
            >
              Export JSON
            </button>
            <button
              className="quiet-button danger-button compact-button"
              disabled={bubbleCount === 0}
              type="button"
              onClick={onClear}
            >
              Clear bubbles
            </button>
          </div>
        </section>
      </div>
    </section>
  );
}
