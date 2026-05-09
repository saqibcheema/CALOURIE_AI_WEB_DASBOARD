"use client";

import { useCallback, useEffect, useState } from "react";
import { IconAlertTriangle, IconShieldOff, IconRefreshAlert } from "@tabler/icons-react";
import { useUnsavedChanges } from "@/contexts/UnsavedChangesContext";
import { useAuthFetch } from "@/lib/useAuthFetch";

// ─── Large Toggle Switch ──────────────────────────────────────────────────────

function MaintenanceToggle({
  enabled,
  onToggle,
}: {
  enabled: boolean;
  onToggle: () => void;
}) {
  return (
    <button
      id="maintenance-mode-toggle"
      role="switch"
      aria-checked={enabled}
      onClick={onToggle}
      className={`relative inline-flex h-8 w-14 shrink-0 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-offset-1 ${
        enabled
          ? "bg-red-500 focus:ring-red-400"
          : "bg-arctic-200 focus:ring-arctic-400"
      }`}
    >
      <span
        className={`inline-block h-6 w-6 transform rounded-full bg-white shadow transition-transform ${
          enabled ? "translate-x-7" : "translate-x-1"
        }`}
      />
    </button>
  );
}

// ─── Maintenance Page ─────────────────────────────────────────────────────────

export default function MaintenancePage() {
  const { setChange } = useUnsavedChanges();
  const { fetchWithAuth } = useAuthFetch();

  const [maintenanceMode, setMaintenanceMode] = useState(false);
  const [maintenanceMessage, setMaintenanceMessage] = useState("");
  const [minVersion, setMinVersion] = useState("1.0.0");
  const [forceUpdateMessage, setForceUpdateMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // ─── Fetch on mount ──────────────────────────────────────────────────────

  const fetchSettings = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetchWithAuth("/api/remote-config/get");
      const data = await res.json();
      const p = data.parameters ?? {};
      const get = (key: string, fallback = "") =>
        p[key]?.defaultValue?.value ?? fallback;

      setMaintenanceMode(get("maintenance_mode", "false") === "true");
      setMaintenanceMessage(get("maintenance_message", ""));
      setMinVersion(get("minimum_app_version", "1.0.0"));
      setForceUpdateMessage(get("force_update_message", ""));
    } catch {
      setError("Failed to load maintenance settings.");
    } finally {
      setLoading(false);
    }
  }, [fetchWithAuth]);

  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  // ─── Handlers ────────────────────────────────────────────────────────────

  const handleToggleMode = useCallback(() => {
    const newMode = !maintenanceMode;
    setMaintenanceMode(newMode);
    setChange("maintenance_mode", String(newMode));
  }, [maintenanceMode, setChange]);

  const handleMessageChange = useCallback(
    (value: string) => {
      setMaintenanceMessage(value);
      setChange("maintenance_message", value);
    },
    [setChange]
  );

  const handleVersionChange = useCallback(
    (value: string) => {
      setMinVersion(value);
      setChange("minimum_app_version", value);
    },
    [setChange]
  );

  const handleForceMessageChange = useCallback(
    (value: string) => {
      setForceUpdateMessage(value);
      setChange("force_update_message", value);
    },
    [setChange]
  );

  // ─── Loading skeleton ────────────────────────────────────────────────────

  if (loading) {
    return (
      <div className="max-w-3xl space-y-6 animate-pulse">
        <div className="h-8 w-48 bg-arctic-100 rounded-md" />
        <div className="h-48 bg-white rounded-card border border-arctic-100" />
        <div className="h-48 bg-white rounded-card border border-arctic-100" />
      </div>
    );
  }

  // ─── Error state ─────────────────────────────────────────────────────────

  if (error) {
    return (
      <div className="max-w-3xl space-y-6">
        <div>
          <h1 className="text-2xl font-semibold text-arctic-900">Maintenance</h1>
        </div>
        <div className="flex items-center gap-3 p-4 bg-red-50 border border-red-200 text-red-600 rounded-card text-sm">
          <IconAlertTriangle size={18} className="shrink-0 text-red-400" />
          <span className="flex-1">{error}</span>
          <button onClick={fetchSettings} className="underline hover:no-underline">
            Retry
          </button>
        </div>
      </div>
    );
  }

  // ─── Main render ─────────────────────────────────────────────────────────

  return (
    <div className="max-w-3xl space-y-6">
      {/* Page header */}
      <div>
        <h1 className="text-2xl font-semibold text-arctic-900">Maintenance</h1>
        <p className="text-sm text-arctic-500 mt-0.5">
          Control app availability and force update behavior. Changes publish via the bar below.
        </p>
      </div>

      {/* Card 1 — Maintenance Mode */}
      <div className="bg-white rounded-card border border-arctic-100 p-6 shadow-[0_1px_3px_rgba(14,165,233,0.05)] space-y-5">
        {/* Card header */}
        <div className="flex items-center gap-2">
          <IconShieldOff size={18} className={maintenanceMode ? "text-red-500" : "text-arctic-300"} />
          <h2 className="text-base font-semibold text-arctic-900">Maintenance Mode</h2>
        </div>

        {/* Toggle row */}
        <div className="flex items-center gap-4">
          <MaintenanceToggle enabled={maintenanceMode} onToggle={handleToggleMode} />
          <div>
            <span
              className={`text-sm font-semibold ${
                maintenanceMode ? "text-red-600" : "text-arctic-400"
              }`}
            >
              {maintenanceMode ? "ON — App is in maintenance" : "OFF — App is live"}
            </span>
            {maintenanceMode && (
              <p className="text-xs text-red-400 mt-0.5">
                All users are currently seeing the maintenance screen.
              </p>
            )}
          </div>
        </div>

        {/* Warning when turning ON */}
        {maintenanceMode && (
          <div className="flex items-start gap-3 p-3 bg-red-50 border border-red-200 rounded-input text-sm text-red-700">
            <IconAlertTriangle size={16} className="shrink-0 mt-0.5 text-red-500" />
            <span>
              Maintenance mode is <strong>active</strong>. Your app is showing a maintenance screen
              to all users. Remember to turn it OFF when maintenance is complete.
            </span>
          </div>
        )}

        {/* Message textarea */}
        <div>
          <label
            htmlFor="maintenance-message"
            className="block text-sm font-medium text-arctic-700 mb-1.5"
          >
            Maintenance Message
          </label>
          <textarea
            id="maintenance-message"
            rows={3}
            value={maintenanceMessage}
            onChange={(e) => handleMessageChange(e.target.value)}
            placeholder="We're performing scheduled maintenance. We'll be back shortly!"
            className="w-full px-3 py-2 border border-arctic-200 rounded-input text-sm focus:outline-none focus:ring-2 focus:ring-arctic-400 focus:border-arctic-400 transition-colors resize-none"
          />
          <p className="text-xs text-arctic-400 mt-1">
            This message is displayed to users while maintenance mode is active.
          </p>
        </div>
      </div>

      {/* Card 2 — Force Update */}
      <div className="bg-white rounded-card border border-arctic-100 p-6 shadow-[0_1px_3px_rgba(14,165,233,0.05)] space-y-5">
        {/* Card header */}
        <div className="flex items-center gap-2">
          <IconRefreshAlert size={18} className="text-arctic-300" />
          <h2 className="text-base font-semibold text-arctic-900">Force Update</h2>
        </div>
        <p className="text-sm text-arctic-500 -mt-2">
          Users on app versions below the minimum will be required to update before using the app.
        </p>

        {/* Minimum version */}
        <div>
          <label
            htmlFor="min-version"
            className="block text-sm font-medium text-arctic-700 mb-1.5"
          >
            Minimum App Version
          </label>
          <input
            id="min-version"
            type="text"
            value={minVersion}
            onChange={(e) => handleVersionChange(e.target.value)}
            placeholder="e.g. 1.2.0"
            className="w-full max-w-xs px-3 py-2 border border-arctic-200 rounded-input text-sm font-mono focus:outline-none focus:ring-2 focus:ring-arctic-400 focus:border-arctic-400 transition-colors"
          />
          <p className="text-xs text-arctic-400 mt-1">
            Users below this version will see the force update screen.
          </p>
        </div>

        {/* Force update message */}
        <div>
          <label
            htmlFor="force-update-message"
            className="block text-sm font-medium text-arctic-700 mb-1.5"
          >
            Force Update Message
          </label>
          <textarea
            id="force-update-message"
            rows={3}
            value={forceUpdateMessage}
            onChange={(e) => handleForceMessageChange(e.target.value)}
            placeholder="A new version of the app is required. Please update to continue."
            className="w-full px-3 py-2 border border-arctic-200 rounded-input text-sm focus:outline-none focus:ring-2 focus:ring-arctic-400 focus:border-arctic-400 transition-colors resize-none"
          />
        </div>
      </div>
    </div>
  );
}
