# Phase 03 — Plan 01: Shared UI State — SUMMARY

**Status:** Complete
**Wave:** 1
**Requirements addressed:** UI-01, UI-02, UI-03, UI-06

## What was built

- `sonner` installed (v1.x)
- `contexts/UnsavedChangesContext.tsx` — global pending changes state with `pendingChanges`, `setChange`, `removeChange`, `hasChanges`, `discardAll`, `publishAll`, `isPublishing`. `publishAll` batches all changes into a single `/api/remote-config/set` request with Firebase ID token header.
- `components/UnsavedBar.tsx` — fixed bottom bar that only renders client-side (hydration-safe). Shows "You have unsaved changes" + Discard + Publish Now buttons. Wired to `UnsavedChangesContext`.
- `components/Modal.tsx` — reusable modal with Escape key, click-outside-to-close, body scroll lock, ARIA semantics, and optional footer slot.
- `presentation/components/layout/DashboardLayout.tsx` — wrapped with `UnsavedChangesProvider` + `Toaster` (sonner, bottom-right) + `UnsavedBar`.
- `tailwind.config.ts` — extended content array to include `presentation/`, `contexts/`, `domain/`, `lib/` directories.
- `app/login/page.tsx` — fixed pre-existing lint error (`catch (err: any)` → `catch (err: unknown)`).

## Key files created/modified

- `contexts/UnsavedChangesContext.tsx` [NEW]
- `components/UnsavedBar.tsx` [NEW]
- `components/Modal.tsx` [NEW]
- `lib/useAuthFetch.ts` [NEW]
- `presentation/components/layout/DashboardLayout.tsx` [MODIFIED]
- `tailwind.config.ts` [MODIFIED]
- `app/login/page.tsx` [MODIFIED — lint fix]

## Self-Check

- [x] Context is globally available via `UnsavedChangesProvider` wrapping dashboard
- [x] `UnsavedBar` renders only on client after mount (no hydration errors)
- [x] `publishAll` correctly uses `{ updates: {...} }` shape expected by `/api/remote-config/set`
- [x] `Modal` handles Escape, click-outside, and scroll lock
- [x] `npm run build` exits 0
