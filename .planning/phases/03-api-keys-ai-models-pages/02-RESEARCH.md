# Phase 3 Research: API Keys + AI Models Pages

## Goal
Research implementation approach for Phase 03: API Keys + AI Models Pages, specifically regarding Next.js Context for global unsaved changes, `sonner` for Toast notifications, and Firebase Remote Config dynamic data structures.

## Standard Stack
- **Context Management**: React `createContext` and `useContext` for `UnsavedChangesContext`.
- **Toast Notifications**: `sonner` (standard lightweight Next.js App Router toast library). Highly recommended over hand-rolling for animations and accessibility.
- **Icons**: `@tabler/icons-react` (already in the project stack).
- **Forms & State**: Standard React `useState` for local form binding before persisting to global `UnsavedChangesContext`.

## Architecture Patterns
- **Global Pending Changes State**: A single context (`UnsavedChangesProvider`) wrapping `DashboardLayout`. It tracks a `pendingChanges` object/dictionary mapping config keys to their unsaved JSON string values.
- **Dynamic Provider Storage (Remote Config)**:
  - `api_keys_config`: A JSON string representing an object: `{ "Gemini": "xyz", "OpenAI": "abc" }`.
  - `ai_models_config`: A JSON string representing an object mapping provider names to objects: `{ "Gemini": { temperature: 0.7, max_tokens: 1024 } }`.
- **Hybrid Rendering**: `app/dashboard/api-keys/page.tsx` and `app/dashboard/ai-models/page.tsx` must be `"use client"` if they consume `UnsavedChangesContext` and handle interactions. Data fetching from Remote Config can happen server-side initially or via `useEffect` depending on layout. Since `firebase-admin` is only available server-side, the initial load should call `GET /api/remote-config/get` inside a `useEffect` to populate the initial state, or be passed down as props if using a Server Component wrapper.

## Don't Hand-Roll
- **Toast Notifications**: Do not build a custom Toast manager with timeouts and animations. Use `sonner`.
- **Modals (Primitives)**: Since we don't have Radix or Headless UI, we will build a basic fixed-position overlay with Tailwind, but handle `Escape` key and click-outside carefully.

## Common Pitfalls
- **Server Components vs Context**: React Context cannot be consumed in Server Components. Pages consuming `UnsavedChangesContext` must be `"use client"`.
- **Hydration Mismatch**: Ensure the `UnsavedBar` only renders on the client after mounting to prevent Next.js hydration errors when reading from context.
- **Stale Context**: When discarding changes, the local component state must reset to the original Remote Config fetched value. This requires either a `key` remount or an explicit sync.

## Code Examples

**Sonner Setup:**
```tsx
import { Toaster } from 'sonner';

export default function Layout({ children }) {
  return (
    <>
      {children}
      <Toaster position="bottom-right" richColors />
    </>
  );
}
```

**Unsaved Changes Context:**
```tsx
type UnsavedContextType = {
  pendingChanges: Record<string, string>;
  setChange: (key: string, value: string) => void;
  removeChange: (key: string) => void;
  hasChanges: boolean;
  discardAll: () => void;
  publishAll: () => Promise<void>;
};
```
