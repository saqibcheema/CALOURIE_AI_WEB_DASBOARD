---
phase: 03-api-keys-ai-models-pages
plan: 03
type: execute
wave: 2
depends_on: ["01"]
files_modified: ["app/dashboard/ai-models/page.tsx"]
autonomous: true
requirements: [MODEL-01, MODEL-02, MODEL-03, MODEL-04, MODEL-05]

must_haves:
  truths:
    - "AI Models page displays a tabbed interface for each provider fetched from Remote Config"
    - "Each provider tab contains settings for model name, temperature, and max tokens"
    - "User can add a new provider tab and delete existing ones"
    - "Changes correctly sync with UnsavedChangesContext"
  artifacts:
    - path: "app/dashboard/ai-models/page.tsx"
      provides: "Client-side page for AI Model settings"
  key_links:
    - from: "app/dashboard/ai-models/page.tsx"
      to: "/api/remote-config/get"
      via: "fetch GET on mount"
    - from: "app/dashboard/ai-models/page.tsx"
      to: "UnsavedChangesContext"
      via: "useContext to stage ai_models_config JSON string"
---

<objective>
Implement the AI Models configuration page using dynamic JSON configuration from Firebase Remote Config.

Purpose: To allow the admin to define specific LLM configuration parameters (model name, temp, max tokens) for each dynamic provider.
Output: Fully functional `app/dashboard/ai-models/page.tsx`.
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
  <name>Task 1: Scaffold AI Models page and fetch logic</name>
  <files>app/dashboard/ai-models/page.tsx</files>
  <action>
    1. Create `app/dashboard/ai-models/page.tsx` as a `"use client"` component.
    2. Add `useEffect` to fetch initial config via `GET /api/remote-config/get`. Parse the `ai_models_config` string into a local state object `Record<string, { model: string, temperature: number, max_tokens: number }>`.
    3. Include loading state (`skeleton`) while fetching.
    4. Implement logic to merge the initial config with any pending `ai_models_config` changes stored in `UnsavedChangesContext`.
  </action>
  <verify>
    <automated>npm run lint</automated>
  </verify>
  <done>Page renders, fetches data on mount, and merges local state with context state.</done>
</task>

<task type="auto">
  <name>Task 2: Implement Tabbed Interface and Settings UI</name>
  <files>app/dashboard/ai-models/page.tsx</files>
  <action>
    1. Build a horizontal tab list representing each provider in the state. Track the `activeTab` (provider name).
    2. Render the configuration form for the `activeTab`. The form should contain inputs for:
       - Model Name (text input)
       - Temperature (number/range slider 0.0 - 2.0)
       - Max Tokens (number input)
    3. Any edits to these inputs should update the local state object and immediately call `setChange('ai_models_config', JSON.stringify(newState))` on the context.
  </action>
  <verify>
    <automated>npm run build</automated>
  </verify>
  <done>Users can navigate tabs and edit specific AI model configurations safely.</done>
</task>

<task type="auto">
  <name>Task 3: Implement Add and Delete Tab logic</name>
  <files>app/dashboard/ai-models/page.tsx</files>
  <action>
    1. Import the `Modal` component from Plan 01.
    2. Add a "+" button in the tab list to open the "Add Provider Config" modal. The modal requests a "Provider Name".
    3. On submit, add the new provider with default values (e.g., empty model, 0.7 temp, 1024 tokens) to the state, update the context, and switch `activeTab` to the new provider.
    4. Add a "Delete Provider Config" button inside the active tab's view (destructive color). On click, remove the provider from state, update the context, and switch `activeTab` to another available provider (or none if empty).
  </action>
  <verify>
    <automated>npm run lint</automated>
  </verify>
  <done>Tab management works, and changes are accurately staged globally.</done>
</task>

</tasks>

<verification>
Ensure that adding/removing tabs or editing values correctly triggers the UnsavedBar and that discarding resets the page to the originally fetched state.
</verification>

<success_criteria>
AI Models can be dynamically managed via a tabbed interface, with all changes accurately staging into the global context under the `ai_models_config` parameter.
</success_criteria>

<output>
After completion, create `.planning/phases/03-api-keys-ai-models-pages/03-03-SUMMARY.md`
</output>
