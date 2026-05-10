"use client";

import { useCallback, useEffect, useState } from "react";
import { IconAlertTriangle } from "@tabler/icons-react";
import { useUnsavedChanges } from "@/contexts/UnsavedChangesContext";
import { useAuthFetch } from "@/lib/useAuthFetch";

// ─── Flag Definitions ─────────────────────────────────────────────────────────

const FEATURE_FLAGS = [
  { key: "vision_enabled",   label: "AI Vision",        description: "Camera-based food recognition" },
  { key: "barcode_scanning", label: "Barcode Scanning",  description: "Barcode-based food lookup" },
  { key: "meal_logging",     label: "Meal Logging",      description: "Manual meal entry feature" },
  { key: "chat_history",     label: "Chat History",      description: "Persistent conversation history" },
] as const;

type FlagValue = { enabled: boolean; disabled_until?: string };
type FlagsConfig = Record<string, FlagValue>;

// ─── Helpers ─────────────────────────────────────────────────────────────────

function toLocalDatetime(isoUtc?: string): string {
  if (!isoUtc) return "";
  const d = new Date(isoUtc);
  return new Date(d.getTime() - d.getTimezoneOffset() * 60000)
    .toISOString()
    .slice(0, 16);
}

// ─── Toggle Switch ────────────────────────────────────────────────────────────

function ToggleSwitch({
  enabled,
  onToggle,
  id,
}: {
  enabled: boolean;
  onToggle: () => void;
  id: string;
}) {
  return (
    <button
      id={id}
      role="switch"
      aria-checked={enabled}
      onClick={onToggle}
      className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-arctic-400 focus:ring-offset-1 ${
        enabled ? "bg-arctic-500" : "bg-arctic-200"
      }`}
    >
      <span
        className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${
          enabled ? "translate-x-6" : "translate-x-1"
        }`}
      />
    </button>
  );
}

// ─── Feature Flags Page ───────────────────────────────────────────────────────

export default function FeatureFlagsPage() {
  const { setChange } = useUnsavedChanges();
  const { fetchWithAuth } = useAuthFetch();

  const [flags, setFlags] = useState<FlagsConfig>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // ─── Fetch on mount ──────────────────────────────────────────────────────

  const fetchFlags = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetchWithAuth("/api/remote-config/get");
      const data = await res.json();
      const raw = data.parameters?.feature_flags_config?.defaultValue?.value ?? "{}";
      const parsed: FlagsConfig = JSON.parse(raw);
      const merged = Object.fromEntries(
        FEATURE_FLAGS.map((f) => [f.key, parsed[f.key] ?? { enabled: true }])
      );
      setFlags(merged);
    } catch {
      setError("Failed to load feature flags.");
    } finally {
      setLoading(false);
    }
  }, [fetchWithAuth]);

  useEffect(() => {
    fetchFlags();
  }, [fetchFlags]);

  // ─── Toggle handler ──────────────────────────────────────────────────────

  const handleToggle = useCallback(
    (key: string) => {
      const updated: FlagsConfig = {
        ...flags,
        [key]: { ...flags[key], enabled: !flags[key]?.enabled },
      };
      if (updated[key].enabled) delete updated[key].disabled_until;
      setFlags(updated);
      setChange("feature_flags_config", JSON.stringify(updated));
    },
    [flags, setChange]
  );

  // ─── Expiry handler ──────────────────────────────────────────────────────

  const handleExpiry = useCallback(
    (key: string, localDatetime: string) => {
      const isoUtc = localDatetime ? new Date(localDatetime).toISOString() : undefined;
      const updated: FlagsConfig = {
        ...flags,
        [key]: { ...flags[key], disabled_until: isoUtc },
      };
      if (!isoUtc) delete updated[key].disabled_until;
      setFlags(updated);
      setChange("feature_flags_config", JSON.stringify(updated));
    },
    [flags, setChange]
  );

  // ─── Render ──────────────────────────────────────────────────────────────

  return (
    <div className="max-w-3xl space-y-6">
      {/* Page header */}
      <div>
        <h1 className="text-2xl font-semibold text-arctic-900">Feature Flags</h1>
        <p className="text-sm text-arctic-500 mt-0.5">
          Toggle features on or off. Changes are batched — click &ldquo;Publish Now&rdquo; in the
          bar below to push to Firebase Remote Config.
        </p>
      </div>

      {/* Error */}
      {error && (
        <div className="flex items-center gap-3 p-3 bg-red-50 border border-red-200 text-red-600 rounded-input text-sm">
          <IconAlertTriangle size={16} className="shrink-0 text-red-400" />
          <span className="flex-1">{error}</span>
          <button onClick={fetchFlags} className="underline hover:no-underline text-sm">
            Retry
          </button>
        </div>
      )}

      {/* Loading skeleton */}
      {loading && (
        <div className="space-y-3 animate-pulse">
          {[1, 2, 3, 4].map((n) => (
            <div
              key={n}
              className="h-20 bg-white rounded-card border border-arctic-100"
            />
          ))}
        </div>
      )}

      {/* Flag list */}
      {!loading && !error && (
        <div className="space-y-3">
          {FEATURE_FLAGS.map((f) => {
            const flag = flags[f.key] ?? { enabled: true };
            const isOff = !flag.enabled;

            return (
              <div
                key={f.key}
                className="bg-white rounded-card border border-arctic-100 p-5 shadow-[0_1px_3px_rgba(14,165,233,0.05)]"
              >
                <div className="flex items-start gap-4">
                  {/* Toggle */}
                  <div className="pt-0.5">
                    <ToggleSwitch
                      id={`toggle-${f.key}`}
                      enabled={flag.enabled}
                      onToggle={() => handleToggle(f.key)}
                    />
                  </div>

                  {/* Label + description + expiry */}
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-arctic-900">
                        {f.label}
                      </span>
                      <span
                        className={`text-xs font-medium px-1.5 py-0.5 rounded-full ${
                          flag.enabled
                            ? "bg-emerald-50 text-emerald-600 border border-emerald-200"
                            : "bg-arctic-100 text-arctic-400 border border-arctic-200"
                        }`}
                      >
                        {flag.enabled ? "ON" : "OFF"}
                      </span>
                    </div>
                    <p className="text-xs text-arctic-400">{f.description}</p>

                    {/* Disable until input — only when flag is OFF */}
                    {isOff && (
                      <div className="flex items-center gap-2 pt-1">
                        <label
                          htmlFor={`expiry-${f.key}`}
                          className="text-xs text-arctic-500 whitespace-nowrap"
                        >
                          Disable until:
                        </label>
                        <input
                          id={`expiry-${f.key}`}
                          type="datetime-local"
                          value={toLocalDatetime(flag.disabled_until)}
                          onChange={(e) => handleExpiry(f.key, e.target.value)}
                          className="text-xs px-2 py-1 border border-arctic-200 rounded-input focus:outline-none focus:ring-2 focus:ring-arctic-400 focus:border-arctic-400 transition-colors font-mono text-arctic-700"
                        />
                        {flag.disabled_until && (
                          <button
                            onClick={() => handleExpiry(f.key, "")}
                            className="text-xs text-arctic-400 hover:text-red-500 underline hover:no-underline"
                          >
                            Clear
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Info note */}
      {!loading && !error && (
        <p className="text-xs text-arctic-400 bg-arctic-50 border border-arctic-100 rounded-input px-3 py-2">
          💡 Flag definitions are managed in source code. To add or remove flags, update the{" "}
          <code className="font-mono">FEATURE_FLAGS</code> array and deploy a new version.
        </p>
      )}
    </div>
  );
}
