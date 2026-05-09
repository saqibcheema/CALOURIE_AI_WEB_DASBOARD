---
phase: 03-api-keys-ai-models-pages
plan: 01
type: execute
wave: 1
depends_on: []
files_modified: ["package.json", "contexts/UnsavedChangesContext.tsx", "components/UnsavedBar.tsx", "components/Modal.tsx", "app/dashboard/layout.tsx"]
autonomous: true
requirements: [UI-01, UI-02, UI-03, UI-06]

must_haves:
  truths:
    - "Unsaved changes context is globally available to all dashboard pages"
    - "UnsavedBar appears only when there are pending changes"
    - "Clicking publish in UnsavedBar saves all pending changes to Remote Config"
    - "Clicking discard in UnsavedBar resets all pending changes"
    - "Toast notifications are displayed for success/error feedback"
  artifacts:
    - path: "contexts/UnsavedChangesContext.tsx"
      provides: "Global state management for unsaved edits"
    - path: "components/UnsavedBar.tsx"
      provides: "Sticky bottom bar UI for global actions"
    - path: "components/Modal.tsx"
      provides: "Reusable modal primitive for adding providers"
  key_links:
    - from: "contexts/UnsavedChangesContext.tsx"
      to: "/api/remote-config/set"
      via: "fetch POST on publishAll"
---

<objective>
Set up the global state management and shared UI primitives (Toasts, Modals, UnsavedBar) required for dynamic configuration pages.

Purpose: Both API Keys and AI Models pages need a unified way to stage changes before publishing them to Firebase to prevent partial updates and minimize network requests.
Output: `sonner` installed, `UnsavedChangesContext` created, `UnsavedBar` component, `Modal` component, and dashboard layout wrapped with providers.
</objective>

<execution_context>
@~/.gemini/antigravity/get-shit-done/workflows/execute-plan.md
@~/.gemini/antigravity/get-shit-done/templates/summary.md
</execution_context>

<context>
@.planning/PROJECT.md
@.planning/ROADMAP.md
@.planning/STATE.md
@.planning/phases/03-api-keys-ai-models-pages/01-CONTEXT.md
@.planning/phases/03-api-keys-ai-models-pages/02-RESEARCH.md
@.planning/phases/03-api-keys-ai-models-pages/03-UI-SPEC.md
</context>

<tasks>

<task type="auto">
  <name>Task 1: Setup dependencies and providers</name>
  <files>package.json, app/dashboard/layout.tsx, contexts/UnsavedChangesContext.tsx</files>
  <action>
    1. Install `sonner` via `npm install sonner`.
    2. Create `contexts/UnsavedChangesContext.tsx`. Define `UnsavedContextType` with `pendingChanges` (Record<string, string>), `setChange`, `removeChange`, `hasChanges`, `discardAll`, and `publishAll`.
    3. Implement `publishAll` to iterate through `pendingChanges` and call `/api/remote-config/set` for each key. Use `toast.promise` or `toast.success`/`toast.error` for feedback. Clear `pendingChanges` on success.
    4. Update `app/dashboard/layout.tsx` to include `<Toaster position="bottom-right" richColors />` and wrap children in `<UnsavedChangesProvider>`.
  </action>
  <verify>
    <automated>npm run build</automated>
  </verify>
  <done>Sonner is installed, Context is defined, and DashboardLayout integrates both successfully.</done>
</task>

<task type="auto">
  <name>Task 2: Build UnsavedBar and Modal components</name>
  <files>components/UnsavedBar.tsx, components/Modal.tsx, app/dashboard/layout.tsx</files>
  <action>
    1. Create `components/UnsavedBar.tsx` consuming `UnsavedChangesContext`. If `hasChanges` is true, render a fixed bottom bar (z-50, Arctic Blue styling per UI-SPEC). Include "Discard Changes" (ghost/destructive) and "Publish Now" (primary accent) buttons.
    2. Add `UnsavedBar` inside `app/dashboard/layout.tsx` (or inside the provider so it has access to context).
    3. Create `components/Modal.tsx` as a reusable component using standard Tailwind fixed overlays. Must support `isOpen`, `onClose`, `title`, and `children` props. Include a close button (X icon) and handle background clicks.
  </action>
  <verify>
    <automated>npm run lint</automated>
  </verify>
  <done>UnsavedBar and Modal components are built and UnsavedBar is integrated into the layout.</done>
</task>

</tasks>

<verification>
Ensure layout mounts without hydration errors and Context is available to all child pages.
</verification>

<success_criteria>
`sonner` works, `UnsavedChangesProvider` wraps the dashboard, and `UnsavedBar` is ready to react to state changes from upcoming pages.
</success_criteria>

<output>
After completion, create `.planning/phases/03-api-keys-ai-models-pages/03-01-SUMMARY.md`
</output>
