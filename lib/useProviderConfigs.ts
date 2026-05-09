"use client";

import { useCallback, useEffect, useState } from "react";
import { useAuthFetch } from "@/lib/useAuthFetch";

// ─── Types ─────────────────────────────────────────────────────────────────────

export type ApiKeysConfig = Record<string, string>;

export interface ModelConfig {
  model: string;
  temperature: number;
  max_tokens: number;
}

export type AiModelsConfig = Record<string, ModelConfig>;

export const DEFAULT_MODEL_CONFIG: ModelConfig = {
  model: "",
  temperature: 0.7,
  max_tokens: 1024,
};

interface RawParam {
  defaultValue?: { value?: string };
}

// ─── Hook ──────────────────────────────────────────────────────────────────────

export interface ProviderConfigs {
  apiKeys: ApiKeysConfig;
  aiModels: AiModelsConfig;
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

export function useProviderConfigs(): ProviderConfigs {
  const { fetchWithAuth } = useAuthFetch();

  const [apiKeys, setApiKeys] = useState<ApiKeysConfig>({});
  const [aiModels, setAiModels] = useState<AiModelsConfig>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchConfigs = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const res = await fetchWithAuth("/api/remote-config/get");
      if (!res.ok) throw new Error("Failed to fetch configuration.");

      const data = await res.json();
      const params: Record<string, RawParam> = data.parameters ?? {};

      // Parse api_keys_config
      let keys: ApiKeysConfig = {};
      try {
        keys = JSON.parse(params["api_keys_config"]?.defaultValue?.value ?? "{}");
      } catch {
        keys = {};
      }

      // Parse ai_models_config
      let models: AiModelsConfig = {};
      try {
        models = JSON.parse(params["ai_models_config"]?.defaultValue?.value ?? "{}");
      } catch {
        models = {};
      }

      setApiKeys(keys);
      setAiModels(models);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  }, [fetchWithAuth]);

  useEffect(() => {
    fetchConfigs();
  }, [fetchConfigs]);

  return { apiKeys, aiModels, loading, error, refetch: fetchConfigs };
}
