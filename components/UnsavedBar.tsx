"use client";

import { useEffect, useState } from "react";
import { IconCloudUpload, IconX } from "@tabler/icons-react";
import { useUnsavedChanges } from "@/contexts/UnsavedChangesContext";

/**
 * UnsavedBar — fixed bottom bar shown when there are pending Remote Config changes.
 * Hydration-safe: only renders client-side after mount to avoid SSR mismatch.
 */
export function UnsavedBar() {
  const { hasChanges, discardAll, publishAll, isPublishing } = useUnsavedChanges();
  const [mounted, setMounted] = useState(false);

  // Prevent hydration mismatch — only render after client mount
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted || !hasChanges) return null;

  return (
    <div
      className={`
        fixed bottom-0 left-0 right-0 z-50
        bg-white border-t border-arctic-200
        shadow-[0_-4px_24px_rgba(14,165,233,0.10)]
        transition-transform duration-300
        ${hasChanges ? "translate-y-0" : "translate-y-full"}
      `}
    >
      <div className="max-w-screen-xl mx-auto px-6 py-3 flex items-center justify-between gap-4">
        {/* Status text */}
        <div className="flex items-center gap-2 text-sm text-arctic-700">
          <span className="w-2 h-2 rounded-full bg-amber-400 inline-block" />
          <span className="font-medium">You have unsaved changes</span>
          <span className="text-arctic-400 hidden sm:inline">— publish to apply to the app</span>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={discardAll}
            disabled={isPublishing}
            className="
              flex items-center gap-1.5 px-3 py-1.5 rounded-button text-sm
              text-arctic-600 hover:text-red-600 hover:bg-red-50
              border border-transparent hover:border-red-200
              transition-all disabled:opacity-40 disabled:cursor-not-allowed
            "
          >
            <IconX size={15} />
            Discard
          </button>

          <button
            onClick={publishAll}
            disabled={isPublishing}
            className="
              flex items-center gap-1.5 px-4 py-1.5 rounded-button text-sm font-medium
              bg-arctic-500 text-white hover:bg-arctic-600
              transition-all disabled:opacity-60 disabled:cursor-not-allowed
              shadow-sm
            "
          >
            <IconCloudUpload size={15} />
            {isPublishing ? "Publishing…" : "Publish Now"}
          </button>
        </div>
      </div>
    </div>
  );
}
