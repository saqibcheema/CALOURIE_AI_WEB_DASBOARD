---
phase: 03-api-keys-ai-models-pages
plan: 02
type: execute
wave: 2
depends_on: ["01"]
files_modified: ["app/dashboard/api-keys/page.tsx"]
autonomous: true
requirements: [KEYS-01, KEYS-02, KEYS-03, KEYS-04, KEYS-05, KEYS-06]

must_haves:
  truths:
    - "API Keys page displays a list of dynamic providers fetched from Remote Config"
    - "User can add a new provider and define its API key"
    - "User can delete an existing provider (staged until publish)"
    - "API keys are masked by default, and user can toggle visibility"
    - "Changes correctly sync with UnsavedChangesContext"
  artifacts:
    - path: "app/dashboard/api-keys/page.tsx"
      provides: "Client-side page for API key management"
  key_links:
    - from: "app/dashboard/api-keys/page.tsx"
      to: "/api/remote-config/get"
      via: "fetch GET on mount"
    - from: "app/dashboard/api-keys/page.tsx"
      to: "UnsavedChangesContext"
      via: "useContext to stage api_keys_config JSON string"
---

<objective>
Implement the API Keys management page using dynamic JSON configuration from Firebase Remote Config.

Purpose: To allow the admin to manage multiple LLM provider API keys without hardcoding provider names in the dashboard or Android app.
Output: Fully functional `app/dashboard/api-keys/page.tsx`.
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
@.planning/phases/03-api-keys-ai-models-pages/03-UI-SPEC.md
</context>

<tasks>

<task type="auto">
  <name>Task 1: Scaffold API Keys page and fetch logic</name>
  <files>app/dashboard/api-keys/page.tsx</files>
  <action>
    1. Create `app/dashboard/api-keys/page.tsx` as a `"use client"` component.
    2. Add `useEffect` to fetch initial config via `GET /api/remote-config/get`. Parse the `api_keys_config` string into a local state object `Record<string, string>`.
    3. Include loading state (`skeleton`) while fetching.
    4. Implement logic to merge the initial config with any pending `api_keys_config` changes stored in `UnsavedChangesContext`.
  </action>
  <verify>
    <automated>npm run lint</automated>
  </verify>
  <done>Page renders, fetches data on mount, and merges local state with context state.</done>
</task>

<task type="auto">
  <name>Task 2: Implement Provider List and Masking UI</name>
  <files>app/dashboard/api-keys/page.tsx</files>
  <action>
    1. Render a list/grid of cards for each provider key in the state.
    2. Create a secure input field for each key: masked by default (`type="password"` or custom masking showing last 4 chars), with an "eye" icon button (from `@tabler/icons-react`) to toggle visibility.
    3. Add a "Delete" button (trash icon, destructive color) for each provider. Deleting updates the local state object and immediately calls `setChange('api_keys_config', JSON.stringify(newState))` on the context.
  </action>
  <verify>
    <automated>npm run build</automated>
  </verify>
  <done>Providers are displayed securely, and deletion stages changes globally.</done>
</task>

<task type="auto">
  <name>Task 3: Implement Add Provider Modal</name>
  <files>app/dashboard/api-keys/page.tsx</files>
  <action>
    1. Import the `Modal` component created in Plan 01.
    2. Add an "Add Provider" CTA button at the top of the page that opens the modal.
    3. The modal should contain two inputs: Provider Name (string) and API Key (string).
    4. On submit, add the new provider to the local state object, call `setChange('api_keys_config', JSON.stringify(newState))` on the context, and close the modal.
  </action>
  <verify>
    <automated>npm run lint</automated>
  </verify>
  <done>Users can add new providers, updating the staged context state.</done>
</task>

</tasks>

<verification>
Ensure that any additions, edits, or deletions correctly trigger the UnsavedBar and that discarding resets the page to the originally fetched state.
</verification>

<success_criteria>
API keys can be dynamically added, edited (with masking), and deleted, with all changes accurately staging into the global context under the `api_keys_config` parameter.
</success_criteria>

<output>
After completion, create `.planning/phases/03-api-keys-ai-models-pages/03-02-SUMMARY.md`
</output>
