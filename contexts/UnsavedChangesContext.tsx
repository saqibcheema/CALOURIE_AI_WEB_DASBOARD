"use client";

import React, { createContext, useCallback, useContext, useMemo, useState } from "react";
import { toast } from "sonner";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface ChangeLogEntry {
  date: string;
  key: string;
  oldValue: string;
  newValue: string;
}

export type UnsavedContextType = {
  /** All staged changes: Remote Config key → new JSON-string value */
  pendingChanges: Record<string, string>;
  /** Stage a change for a given Remote Config key */
  setChange: (key: string, value: string) => void;
  /** Remove a specific key from staged changes */
  removeChange: (key: string) => void;
  /** True when there is at least one staged change */
  hasChanges: boolean;
  /** Clear all staged changes without publishing */
  discardAll: () => void;
  /** Publish all staged changes to Firebase Remote Config */
  publishAll: () => Promise<void>;
  /** True while publish is in flight */
  isPublishing: boolean;
  /** History of published config changes */
  changeHistory: ChangeLogEntry[];
};

// ─── Context ─────────────────────────────────────────────────────────────────

const UnsavedChangesContext = createContext<UnsavedContextType | null>(null);

// ─── Provider ─────────────────────────────────────────────────────────────────

const HISTORY_KEY = "calourie_config_history";

function loadHistory(): ChangeLogEntry[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(HISTORY_KEY);
    return raw ? (JSON.parse(raw) as ChangeLogEntry[]) : [];
  } catch {
    return [];
  }
}

export function UnsavedChangesProvider({ children }: { children: React.ReactNode }) {
  const [pendingChanges, setPendingChanges] = useState<Record<string, string>>({});
  const [isPublishing, setIsPublishing] = useState(false);
  const [changeHistory, setChangeHistory] = useState<ChangeLogEntry[]>(loadHistory);

  const setChange = useCallback((key: string, value: string) => {
    setPendingChanges((prev) => ({ ...prev, [key]: value }));
  }, []);

  const removeChange = useCallback((key: string) => {
    setPendingChanges((prev) => {
      const next = { ...prev };
      delete next[key];
      return next;
    });
  }, []);

  const discardAll = useCallback(() => {
    setPendingChanges({});
  }, []);

  const publishAll = useCallback(async () => {
    const entries = Object.entries(pendingChanges);
    if (entries.length === 0) return;

    setIsPublishing(true);

    try {
      const { getAuth } = await import("firebase/auth");
      const firebaseAuth = getAuth();
      const idToken = await firebaseAuth.currentUser?.getIdToken();

      if (!idToken) {
        throw new Error("Not authenticated. Please sign in again.");
      }

      // Fetch current config to record old values
      const getRes = await fetch("/api/remote-config/get", {
        headers: { Authorization: `Bearer ${idToken}` },
      });
      const currentConfig = getRes.ok ? await getRes.json() : { parameters: {} };

      const oldValues: Record<string, string> = {};
      for (const [key] of entries) {
        const param = currentConfig.parameters?.[key];
        oldValues[key] = param?.defaultValue?.value ?? "";
      }

      // Publish
      const updates = Object.fromEntries(entries);
      const res = await fetch("/api/remote-config/set", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${idToken}`,
        },
        body: JSON.stringify({ updates }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data?.error ?? "Failed to save configuration. Please try again.");
      }

      // Record changes in history
      const today = new Date().toISOString().split("T")[0];
      const newEntries: ChangeLogEntry[] = entries.map(([key, newValue]) => ({
        date: today,
        key,
        oldValue: oldValues[key] ?? "",
        newValue,
      }));

      setChangeHistory((prev) => {
        const updated = [...newEntries, ...prev].slice(0, 50);
        localStorage.setItem(HISTORY_KEY, JSON.stringify(updated));
        return updated;
      });

      setPendingChanges({});
      toast.success("Configuration published successfully.");
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to save configuration. Please try again.";
      toast.error(message);
    } finally {
      setIsPublishing(false);
    }
  }, [pendingChanges]);

  const hasChanges = useMemo(() => Object.keys(pendingChanges).length > 0, [pendingChanges]);

  const value = useMemo<UnsavedContextType>(
    () => ({ pendingChanges, setChange, removeChange, hasChanges, discardAll, publishAll, isPublishing, changeHistory }),
    [pendingChanges, setChange, removeChange, hasChanges, discardAll, publishAll, isPublishing, changeHistory]
  );

  return (
    <UnsavedChangesContext.Provider value={value}>
      {children}
    </UnsavedChangesContext.Provider>
  );
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useUnsavedChanges(): UnsavedContextType {
  const ctx = useContext(UnsavedChangesContext);
  if (!ctx) {
    throw new Error("useUnsavedChanges must be used within <UnsavedChangesProvider>");
  }
  return ctx;
}
