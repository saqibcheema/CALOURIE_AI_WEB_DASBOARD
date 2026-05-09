"use client";

import { useCallback, useEffect, useState } from "react";
import {
  IconBrain,
  IconPlus,
  IconTrash,
  IconAlertTriangle,
  IconKey,
} from "@tabler/icons-react";
import Link from "next/link";
import { Modal } from "@/components/Modal";
import { useUnsavedChanges } from "@/contexts/UnsavedChangesContext";
import {
  useProviderConfigs,
  AiModelsConfig,
  ApiKeysConfig,
  DEFAULT_MODEL_CONFIG,
} from "@/lib/useProviderConfigs";

// ─── AI Models Page ────────────────────────────────────────────────────────────

export default function AiModelsPage() {
  const { setChange, pendingChanges } = useUnsavedChanges();

  // Fetch both configs via shared hook (needed for cross-sync)
  const {
    aiModels: fetchedModels,
    apiKeys: fetchedKeys,
    loading,
    error,
    refetch,
  } = useProviderConfigs();

  const [models, setModels] = useState<AiModelsConfig>({});
  const [keys, setKeys] = useState<ApiKeysConfig>({});
  const [activeTab, setActiveTab] = useState<string | null>(null);

  // Seed local state once fetched.
  // Prefer pendingChanges over stale Remote Config so providers added on
  // another page (before publish) are immediately visible here.
  useEffect(() => {
    if (!loading) {
      const parseOrFallback = <T,>(raw: string | undefined, fallback: T): T => {
        if (!raw) return fallback;
        try { return JSON.parse(raw) as T; } catch { return fallback; }
      };
      const effectiveModels = parseOrFallback(pendingChanges["ai_models_config"], fetchedModels);
      const effectiveKeys   = parseOrFallback(pendingChanges["api_keys_config"],  fetchedKeys);
      setModels(effectiveModels);
      setKeys(effectiveKeys);
      const providers = Object.keys(effectiveModels);
      if (providers.length > 0) setActiveTab((prev) => prev ?? providers[0]);
    }
    // pendingChanges intentionally excluded from deps — we only want the
    // mount-time snapshot, not to re-seed on every keystroke.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loading, fetchedModels, fetchedKeys]);

  // Add provider modal
  const [modalOpen, setModalOpen] = useState(false);
  const [newProvider, setNewProvider] = useState("");
  const [modalError, setModalError] = useState("");

  // ─── Sync helpers ──────────────────────────────────────────────────────────

  /** Push models update to context */
  const pushModels = useCallback(
    (updated: AiModelsConfig) => {
      setModels(updated);
      setChange("ai_models_config", JSON.stringify(updated));
    },
    [setChange]
  );

  /** Push keys update to context (cross-sync) */
  const pushKeys = useCallback(
    (updated: ApiKeysConfig) => {
      setKeys(updated);
      setChange("api_keys_config", JSON.stringify(updated));
    },
    [setChange]
  );

  // ─── Edit field in active tab ──────────────────────────────────────────────

  const handleEdit = useCallback(
    (field: keyof typeof DEFAULT_MODEL_CONFIG, value: string | number) => {
      if (!activeTab) return;
      const current = models[activeTab] ?? { ...DEFAULT_MODEL_CONFIG };
      pushModels({ ...models, [activeTab]: { ...current, [field]: value } });
    },
    [activeTab, models, pushModels]
  );

  // ─── Add provider ──────────────────────────────────────────────────────────

  const handleAddProvider = useCallback(() => {
    setModalError("");
    const name = newProvider.trim();
    if (!name) {
      setModalError("Provider name is required.");
      return;
    }
    if (models[name] !== undefined) {
      setModalError(`Provider "${name}" already exists.`);
      return;
    }

    // 1. Add to ai_models_config
    pushModels({ ...models, [name]: { ...DEFAULT_MODEL_CONFIG } });

    // 2. Auto-sync: add empty entry to api_keys_config if not already there
    if (keys[name] === undefined) {
      pushKeys({ ...keys, [name]: "" });
    }

    setActiveTab(name);
    setNewProvider("");
    setModalOpen(false);
  }, [newProvider, models, keys, pushModels, pushKeys]);

  // ─── Delete active tab ─────────────────────────────────────────────────────

  const handleDeleteTab = useCallback(() => {
    if (!activeTab) return;

    // 1. Remove from ai_models_config
    const updatedModels = { ...models };
    delete updatedModels[activeTab];
    pushModels(updatedModels);

    // 2. Auto-sync: remove from api_keys_config too (orphan prevention)
    if (keys[activeTab] !== undefined) {
      const updatedKeys = { ...keys };
      delete updatedKeys[activeTab];
      pushKeys(updatedKeys);
    }

    const remaining = Object.keys(updatedModels);
    setActiveTab(remaining[0] ?? null);
  }, [activeTab, models, keys, pushModels, pushKeys]);

  // ─── Render ────────────────────────────────────────────────────────────────

  const providers = Object.keys(models);
  const activeConfig = activeTab ? models[activeTab] : null;

  return (
    <div className="max-w-3xl space-y-6">
      {/* Page header */}
      <div>
        <h1 className="text-2xl font-semibold text-arctic-900">AI Models</h1>
        <p className="text-sm text-arctic-500 mt-0.5">
          Configure model parameters per provider. Adding or removing a provider
          here automatically syncs with the API Keys page.
        </p>
      </div>

      {/* Error */}
      {error && (
        <div className="p-3 bg-red-50 border border-red-200 text-red-600 rounded-input text-sm flex items-center gap-2">
          {error}
          <button onClick={refetch} className="underline hover:no-underline ml-1">
            Retry
          </button>
        </div>
      )}

      {/* Loading skeleton */}
      {loading && (
        <div className="animate-pulse space-y-4">
          <div className="flex gap-2">
            {[1, 2, 3].map((n) => (
              <div key={n} className="h-9 w-24 bg-arctic-100 rounded-button" />
            ))}
          </div>
          <div className="h-64 bg-white rounded-card border border-arctic-100" />
        </div>
      )}

      {/* Empty state */}
      {!loading && !error && providers.length === 0 && (
        <div className="bg-white rounded-card border border-arctic-100 p-12 text-center">
          <IconBrain size={40} className="text-arctic-200 mx-auto mb-3" />
          <p className="text-sm font-medium text-arctic-700">No Providers Configured</p>
          <p className="text-xs text-arctic-400 mt-1">
            Add a provider to configure its model settings.
          </p>
          <button
            onClick={() => setModalOpen(true)}
            className="mt-4 flex items-center gap-2 px-4 py-2 rounded-button text-sm font-medium bg-arctic-500 text-white hover:bg-arctic-600 transition-colors mx-auto"
          >
            <IconPlus size={15} />
            Add Provider
          </button>
        </div>
      )}

      {/* Tabbed interface */}
      {!loading && providers.length > 0 && (
        <div className="bg-white rounded-card border border-arctic-100 shadow-[0_1px_3px_rgba(14,165,233,0.05)]">
          {/* Tab list */}
          <div className="flex items-center border-b border-arctic-100 px-2 overflow-x-auto">
            {providers.map((provider) => {
              const keyMissing = !keys[provider]; // empty string or undefined
              return (
                <button
                  key={provider}
                  id={`tab-${provider}`}
                  onClick={() => setActiveTab(provider)}
                  className={`
                    flex items-center gap-1.5 px-4 py-3 text-sm font-medium
                    whitespace-nowrap border-b-2 -mb-px transition-colors
                    ${
                      activeTab === provider
                        ? "border-arctic-500 text-arctic-600"
                        : "border-transparent text-arctic-400 hover:text-arctic-700"
                    }
                  `}
                >
                  {provider}
                  {/* Warning icon when API key is missing */}
                  {keyMissing && (
                    <span
                      title="API key not set — go to API Keys to add it"
                      className="text-amber-400 hover:text-amber-500"
                    >
                      <IconAlertTriangle size={13} />
                    </span>
                  )}
                </button>
              );
            })}

            {/* Add tab button */}
            <button
              id="add-ai-provider-btn"
              onClick={() => setModalOpen(true)}
              aria-label="Add provider"
              className="ml-1 p-2 rounded-button text-arctic-400 hover:text-arctic-600 hover:bg-arctic-50 transition-colors shrink-0"
            >
              <IconPlus size={16} />
            </button>
          </div>

          {/* Tab content */}
          {activeTab && activeConfig && (
            <div className="p-6 space-y-6">
              {/* API Key missing banner */}
              {!keys[activeTab] && (
                <div className="flex items-center gap-3 p-3 bg-amber-50 border border-amber-200 rounded-input text-sm text-amber-700">
                  <IconAlertTriangle size={16} className="shrink-0 text-amber-500" />
                  <span>
                    API key for <strong>{activeTab}</strong> is not set.{" "}
                    <Link
                      href="/dashboard/api-keys"
                      className="underline font-medium hover:no-underline"
                    >
                      Add it in API Keys →
                    </Link>
                  </span>
                </div>
              )}

              {/* API key set — small badge */}
              {keys[activeTab] && (
                <div className="flex items-center gap-2 p-2.5 bg-emerald-50 border border-emerald-200 rounded-input text-xs text-emerald-700">
                  <IconKey size={13} className="text-emerald-500" />
                  API key is configured for {activeTab}.
                </div>
              )}

              {/* Model name */}
              <div>
                <label
                  htmlFor="model-name"
                  className="block text-sm font-medium text-arctic-700 mb-1.5"
                >
                  Model Name
                </label>
                <input
                  id="model-name"
                  type="text"
                  value={activeConfig.model}
                  onChange={(e) => handleEdit("model", e.target.value)}
                  placeholder="e.g. gemini-1.5-pro, gpt-4o, claude-3-5-sonnet"
                  className="w-full px-3 py-2 border border-arctic-200 rounded-input text-sm font-mono focus:outline-none focus:ring-2 focus:ring-arctic-400 focus:border-arctic-400 transition-colors"
                />
              </div>

              {/* Temperature */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label
                    htmlFor="temperature"
                    className="block text-sm font-medium text-arctic-700"
                  >
                    Temperature
                  </label>
                  <span className="text-sm font-mono text-arctic-500 tabular-nums">
                    {activeConfig.temperature.toFixed(2)}
                  </span>
                </div>
                <input
                  id="temperature"
                  type="range"
                  min="0"
                  max="2"
                  step="0.01"
                  value={activeConfig.temperature}
                  onChange={(e) => handleEdit("temperature", parseFloat(e.target.value))}
                  className="w-full accent-arctic-500"
                />
                <div className="flex justify-between text-xs text-arctic-300 mt-1">
                  <span>0.0 — Deterministic</span>
                  <span>2.0 — Creative</span>
                </div>
              </div>

              {/* Max Tokens */}
              <div>
                <label
                  htmlFor="max-tokens"
                  className="block text-sm font-medium text-arctic-700 mb-1.5"
                >
                  Max Tokens
                </label>
                <input
                  id="max-tokens"
                  type="number"
                  min={1}
                  max={128000}
                  value={activeConfig.max_tokens}
                  onChange={(e) =>
                    handleEdit("max_tokens", Math.max(1, parseInt(e.target.value) || 1))
                  }
                  className="w-full px-3 py-2 border border-arctic-200 rounded-input text-sm font-mono focus:outline-none focus:ring-2 focus:ring-arctic-400 focus:border-arctic-400 transition-colors"
                />
                <p className="text-xs text-arctic-400 mt-1">
                  Maximum tokens per response (1–128,000)
                </p>
              </div>

              {/* Delete provider */}
              <div className="pt-2 border-t border-arctic-100">
                <button
                  id={`delete-ai-provider-${activeTab}`}
                  onClick={handleDeleteTab}
                  className="flex items-center gap-2 px-3 py-2 rounded-button text-sm text-red-500 hover:text-red-700 hover:bg-red-50 border border-transparent hover:border-red-200 transition-colors"
                >
                  <IconTrash size={14} />
                  Delete {activeTab} configuration
                  <span className="text-xs text-red-400 ml-1">
                    (also removes from API Keys)
                  </span>
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Add Provider Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setNewProvider("");
          setModalError("");
        }}
        title="Add Provider"
        footer={
          <>
            <button
              onClick={() => setModalOpen(false)}
              className="px-4 py-2 rounded-button text-sm text-arctic-600 hover:bg-arctic-50 border border-arctic-200 transition-colors"
            >
              Cancel
            </button>
            <button
              id="confirm-add-ai-provider-btn"
              onClick={handleAddProvider}
              className="px-4 py-2 rounded-button text-sm font-medium bg-arctic-500 text-white hover:bg-arctic-600 transition-colors"
            >
              Add Provider
            </button>
          </>
        }
      >
        <div className="space-y-4">
          {modalError && (
            <p className="text-xs text-red-500 bg-red-50 p-2 rounded-input border border-red-200">
              {modalError}
            </p>
          )}
          <div>
            <label
              htmlFor="new-ai-provider-name"
              className="block text-sm font-medium text-arctic-700 mb-1.5"
            >
              Provider Name
            </label>
            <input
              id="new-ai-provider-name"
              type="text"
              value={newProvider}
              onChange={(e) => setNewProvider(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleAddProvider()}
              placeholder="e.g. Gemini, OpenAI, Anthropic"
              className="w-full px-3 py-2 border border-arctic-200 rounded-input text-sm focus:outline-none focus:ring-2 focus:ring-arctic-400 focus:border-arctic-400 transition-colors"
              autoFocus
            />
            <p className="text-xs text-arctic-400 mt-1.5 bg-arctic-50 p-2 rounded-input border border-arctic-100">
              💡 Adding a provider here will automatically create an empty API key
              slot for it too.
            </p>
          </div>
        </div>
      </Modal>
    </div>
  );
}
