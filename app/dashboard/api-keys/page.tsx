"use client";

import { useCallback, useEffect, useState } from "react";
import {
  IconKey,
  IconEye,
  IconEyeOff,
  IconTrash,
  IconPlus,
  IconBrain,
  IconAlertTriangle,
} from "@tabler/icons-react";
import Link from "next/link";
import { Modal } from "@/components/Modal";
import { useUnsavedChanges } from "@/contexts/UnsavedChangesContext";
import {
  useProviderConfigs,
  ApiKeysConfig,
  AiModelsConfig,
  DEFAULT_MODEL_CONFIG,
} from "@/lib/useProviderConfigs";

// ─── Helper ────────────────────────────────────────────────────────────────────

function maskKey(key: string): string {
  if (key.length <= 4) return "••••";
  return "•".repeat(Math.min(20, key.length - 4)) + key.slice(-4);
}

// ─── API Keys Page ─────────────────────────────────────────────────────────────

export default function ApiKeysPage() {
  const { setChange, pendingChanges } = useUnsavedChanges();

  // Fetch both configs (needed for cross-sync)
  const {
    apiKeys: fetchedKeys,
    aiModels: fetchedModels,
    loading,
    error,
    refetch,
  } = useProviderConfigs();

  const [keys, setKeys] = useState<ApiKeysConfig>({});
  const [models, setModels] = useState<AiModelsConfig>({});

  // Visibility toggle per provider
  const [visibleKeys, setVisibleKeys] = useState<Set<string>>(new Set());

  // Add provider modal
  const [modalOpen, setModalOpen] = useState(false);
  const [newProvider, setNewProvider] = useState("");
  const [newKey, setNewKey] = useState("");
  const [modalError, setModalError] = useState("");

  // Seed local state once fetched.
  // Prefer pendingChanges over stale Remote Config so providers added on
  // another page (before publish) are immediately visible here.
  useEffect(() => {
    if (!loading) {
      const parseOrFallback = <T,>(raw: string | undefined, fallback: T): T => {
        if (!raw) return fallback;
        try { return JSON.parse(raw) as T; } catch { return fallback; }
      };
      setKeys(parseOrFallback(pendingChanges["api_keys_config"],  fetchedKeys));
      setModels(parseOrFallback(pendingChanges["ai_models_config"], fetchedModels));
    }
    // pendingChanges intentionally excluded from deps — we only want the
    // mount-time snapshot, not to re-seed on every keystroke.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loading, fetchedKeys, fetchedModels]);

  // ─── Sync helpers ──────────────────────────────────────────────────────────

  const pushKeys = useCallback(
    (updated: ApiKeysConfig) => {
      setKeys(updated);
      setChange("api_keys_config", JSON.stringify(updated));
    },
    [setChange]
  );

  const pushModels = useCallback(
    (updated: AiModelsConfig) => {
      setModels(updated);
      setChange("ai_models_config", JSON.stringify(updated));
    },
    [setChange]
  );

  // ─── Edit key value ────────────────────────────────────────────────────────

  const handleEdit = useCallback(
    (provider: string, value: string) => {
      pushKeys({ ...keys, [provider]: value });
    },
    [keys, pushKeys]
  );

  // ─── Toggle visibility ─────────────────────────────────────────────────────

  const toggleVisibility = useCallback((provider: string) => {
    setVisibleKeys((prev) => {
      const next = new Set(prev);
      if (next.has(provider)) {
        next.delete(provider);
      } else {
        next.add(provider);
      }
      return next;
    });
  }, []);

  // ─── Delete provider ───────────────────────────────────────────────────────

  const handleDelete = useCallback(
    (provider: string) => {
      // 1. Remove from api_keys_config
      const updatedKeys = { ...keys };
      delete updatedKeys[provider];
      pushKeys(updatedKeys);

      // 2. Auto-sync: remove from ai_models_config too
      if (models[provider] !== undefined) {
        const updatedModels = { ...models };
        delete updatedModels[provider];
        pushModels(updatedModels);
      }
    },
    [keys, models, pushKeys, pushModels]
  );

  // ─── Add provider (modal) ──────────────────────────────────────────────────

  const handleAddProvider = useCallback(() => {
    setModalError("");
    const name = newProvider.trim();
    const key = newKey.trim();

    if (!name) {
      setModalError("Provider name is required.");
      return;
    }
    if (keys[name] !== undefined) {
      setModalError(`Provider "${name}" already exists.`);
      return;
    }

    // 1. Add key entry
    pushKeys({ ...keys, [name]: key });

    // 2. Auto-sync: add default model config entry if not already there
    if (models[name] === undefined) {
      pushModels({ ...models, [name]: { ...DEFAULT_MODEL_CONFIG } });
    }

    setNewProvider("");
    setNewKey("");
    setModalOpen(false);
  }, [newProvider, newKey, keys, models, pushKeys, pushModels]);

  // ─── Render ────────────────────────────────────────────────────────────────

  const providers = Object.entries(keys);

  // Providers that exist in models but not in keys (stale/orphaned)
  const modelOnlyProviders = Object.keys(models).filter(
    (p) => keys[p] === undefined
  );

  return (
    <div className="max-w-3xl space-y-6">
      {/* Page header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-arctic-900">API Keys</h1>
          <p className="text-sm text-arctic-500 mt-0.5">
            Manage LLM provider API keys. Adding or removing a provider here
            automatically syncs with the AI Models page.
          </p>
        </div>
        <button
          id="add-provider-btn"
          onClick={() => setModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2 rounded-button text-sm font-medium bg-arctic-500 text-white hover:bg-arctic-600 transition-colors shadow-sm"
        >
          <IconPlus size={15} />
          Add Provider
        </button>
      </div>

      {/* Error */}
      {error && (
        <div className="p-3 bg-red-50 border border-red-200 text-red-600 rounded-input text-sm">
          {error}
          <button onClick={refetch} className="ml-2 underline hover:no-underline">
            Retry
          </button>
        </div>
      )}

      {/* "Models configured but no key" orphan warning */}
      {!loading && modelOnlyProviders.length > 0 && (
        <div className="flex items-start gap-3 p-3 bg-amber-50 border border-amber-200 rounded-input text-sm text-amber-700">
          <IconAlertTriangle size={16} className="shrink-0 mt-0.5 text-amber-500" />
          <span>
            <strong>{modelOnlyProviders.join(", ")}</strong>{" "}
            {modelOnlyProviders.length === 1 ? "has" : "have"} model settings
            configured in{" "}
            <Link
              href="/dashboard/ai-models"
              className="underline font-medium hover:no-underline"
            >
              AI Models
            </Link>{" "}
            but no API key here. Add a key or it may be added automatically when you
            add a provider on the AI Models page.
          </span>
        </div>
      )}

      {/* Loading skeleton */}
      {loading && (
        <div className="space-y-3 animate-pulse">
          {[1, 2, 3].map((n) => (
            <div
              key={n}
              className="h-20 bg-white rounded-card border border-arctic-100"
            />
          ))}
        </div>
      )}

      {/* Empty state */}
      {!loading && !error && providers.length === 0 && (
        <div className="bg-white rounded-card border border-arctic-100 p-12 text-center">
          <IconKey size={40} className="text-arctic-200 mx-auto mb-3" />
          <p className="text-sm font-medium text-arctic-700">No Providers Configured</p>
          <p className="text-xs text-arctic-400 mt-1">
            Add a provider or go to{" "}
            <Link
              href="/dashboard/ai-models"
              className="text-arctic-500 underline hover:no-underline"
            >
              AI Models
            </Link>{" "}
            to configure one there.
          </p>
        </div>
      )}

      {/* Provider list */}
      {!loading && providers.length > 0 && (
        <div className="space-y-3">
          {providers.map(([provider, keyValue]) => {
            const isVisible = visibleKeys.has(provider);
            const hasModelConfig = models[provider] !== undefined;

            return (
              <div
                key={provider}
                className="bg-white rounded-card border border-arctic-100 p-5 flex flex-col gap-3 shadow-[0_1px_3px_rgba(14,165,233,0.05)]"
              >
                {/* Provider header */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <IconKey size={16} className="text-arctic-400" />
                    <span className="text-sm font-medium text-arctic-900">
                      {provider}
                    </span>
                    {/* Model config badge */}
                    {hasModelConfig ? (
                      <span className="flex items-center gap-1 text-xs text-emerald-600 bg-emerald-50 border border-emerald-200 px-1.5 py-0.5 rounded-full">
                        <IconBrain size={10} />
                        Model set
                      </span>
                    ) : (
                      <Link
                        href="/dashboard/ai-models"
                        className="flex items-center gap-1 text-xs text-amber-600 bg-amber-50 border border-amber-200 px-1.5 py-0.5 rounded-full hover:bg-amber-100 transition-colors"
                        title="No model config — click to set up in AI Models"
                      >
                        <IconAlertTriangle size={10} />
                        No model config
                      </Link>
                    )}
                  </div>
                  <button
                    id={`delete-${provider}-btn`}
                    onClick={() => handleDelete(provider)}
                    aria-label={`Delete ${provider} provider`}
                    className="p-1.5 rounded-button text-arctic-400 hover:text-red-500 hover:bg-red-50 transition-colors"
                  >
                    <IconTrash size={15} />
                  </button>
                </div>

                {/* Key input with masking */}
                <div className="flex items-center gap-2">
                  <div className="relative flex-1">
                    {isVisible || !keyValue ? (
                      <input
                        id={`key-${provider}`}
                        type="text"
                        value={keyValue}
                        onChange={(e) => handleEdit(provider, e.target.value)}
                        className={`w-full px-3 py-2 border rounded-input text-sm font-mono text-arctic-800 focus:outline-none focus:ring-2 focus:ring-arctic-400 focus:border-arctic-400 transition-colors ${
                          !keyValue
                            ? "border-amber-200 bg-amber-50 placeholder:text-amber-400 placeholder:font-sans placeholder:text-xs placeholder:not-italic"
                            : "border-arctic-200"
                        }`}
                        placeholder={!keyValue ? "⚠ Key not set — paste your API key here" : "Enter API key…"}
                      />
                    ) : (
                      <div className="w-full px-3 py-2 border border-arctic-100 rounded-input text-sm font-mono text-arctic-400 bg-arctic-50 select-none">
                        {maskKey(keyValue)}
                      </div>
                    )}
                  </div>

                  {/* Visibility toggle */}
                  <button
                    id={`toggle-${provider}-visibility`}
                    onClick={() => toggleVisibility(provider)}
                    aria-label={isVisible ? "Hide API key" : "Show API key"}
                    className="p-2 rounded-button text-arctic-400 hover:text-arctic-700 hover:bg-arctic-50 border border-arctic-100 transition-colors"
                  >
                    {isVisible ? <IconEyeOff size={16} /> : <IconEye size={16} />}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add Provider Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setNewProvider("");
          setNewKey("");
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
              id="confirm-add-provider-btn"
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
              htmlFor="new-provider-name"
              className="block text-sm font-medium text-arctic-700 mb-1.5"
            >
              Provider Name
            </label>
            <input
              id="new-provider-name"
              type="text"
              value={newProvider}
              onChange={(e) => setNewProvider(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleAddProvider()}
              placeholder="e.g. OpenAI, Gemini, Anthropic"
              className="w-full px-3 py-2 border border-arctic-200 rounded-input text-sm focus:outline-none focus:ring-2 focus:ring-arctic-400 focus:border-arctic-400 transition-colors"
              autoFocus
            />
          </div>
          <div>
            <label
              htmlFor="new-api-key"
              className="block text-sm font-medium text-arctic-700 mb-1.5"
            >
              API Key <span className="text-arctic-400 font-normal">(optional)</span>
            </label>
            <input
              id="new-api-key"
              type="text"
              value={newKey}
              onChange={(e) => setNewKey(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleAddProvider()}
              placeholder="sk-… (you can set this later)"
              className="w-full px-3 py-2 border border-arctic-200 rounded-input text-sm font-mono focus:outline-none focus:ring-2 focus:ring-arctic-400 focus:border-arctic-400 transition-colors"
            />
            <p className="text-xs text-arctic-400 mt-1.5 bg-arctic-50 p-2 rounded-input border border-arctic-100">
              💡 Adding a provider here will automatically create default model settings
              for it in AI Models too.
            </p>
          </div>
        </div>
      </Modal>
    </div>
  );
}
