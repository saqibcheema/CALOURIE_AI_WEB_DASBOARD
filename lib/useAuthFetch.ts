"use client";

import { useCallback } from "react";
import { getAuth } from "firebase/auth";

/**
 * Returns a `fetchWithAuth` function that automatically injects the
 * current Firebase ID token as a Bearer Authorization header.
 */
export function useAuthFetch() {
  const fetchWithAuth = useCallback(
    async (url: string, options: RequestInit = {}): Promise<Response> => {
      const auth = getAuth();
      const idToken = await auth.currentUser?.getIdToken();

      if (!idToken) {
        throw new Error("Not authenticated");
      }

      return fetch(url, {
        ...options,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${idToken}`,
          ...(options.headers ?? {}),
        },
      });
    },
    []
  );

  return { fetchWithAuth };
}
