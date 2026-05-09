# Phase 4: Feature Flags + Maintenance Pages — Context

**Gathered:** 2026-05-10
**Status:** Ready for planning

<domain>
## Phase Boundary

Build two new dashboard pages:
1. **Feature Flags page** — data-driven toggle list with optional per-flag time-based expiry, batch publish via existing UnsavedBar
2. **Maintenance page** — 2-card layout with a Maintenance Mode card (toggle + message) and a Force Update card (version + message), plus a global status banner on all pages when maintenance is active

All changes route through the existing `UnsavedChangesContext` → `UnsavedBar` → `/api/remote-config/set` pipeline from Phase 3. No new shared infrastructure needed.
</domain>

<decisions>
## Implementation Decisions

### Feature Flags — Data Shape
- **D-01:** Flags stored as a JSON object in Remote Config key `feature_flags_config`
- **D-02:** Each flag is an **object** (not plain boolean) with two fields:
  - `enabled: boolean` — current on/off state
  - `disabled_until?: string` — optional ISO 8601 UTC timestamp; if present and current time < this timestamp, the Android app treats the flag as disabled regardless of `enabled` value
- **D-03:** Example shape:
  ```json
  {
    "vision_enabled": { "enabled": true },
    "barcode_scanning": { "enabled": false, "disabled_until": "2026-05-10T18:00:00Z" },
    "meal_logging": { "enabled": true }
  }
  ```
- **D-04:** Android app responsibility: when reading flags, check `disabled_until` timestamp and auto-re-enable after expiry (dashboard sets it, Android enforces it)

### Feature Flags — Predefined List (No Dynamic Add/Delete)
- **D-05:** Flags are **hardcoded** in the dashboard source code — no "Add Flag" modal or delete button
- **D-06:** Rationale: Adding a new feature flag requires changes in both the Android app and the dashboard codebase; a dynamic UI would create orphaned flags that the app doesn't know about
- **D-07:** To add a new flag in future: developer adds it to the flags array in dashboard code AND handles it in Android app code

### Feature Flags — Toggle UX
- **D-08:** Batch publish pattern — admin toggles one or multiple flags (and optionally sets expiry times), then clicks "Publish Now" in the global UnsavedBar
- **D-09:** All pending flag changes go into a single `setChange("feature_flags_config", ...)` call to UnsavedChangesContext — same pattern as Phase 3 API Keys and AI Models pages

### Feature Flags — Time Expiry UI
- **D-10:** Each flag row shows: toggle switch (left) + flag name + optional "Disable until" datetime-local input (right, only visible/editable when flag is OFF or being disabled)
- **D-11:** "Disable until" is optional — if not set, flag is permanent (no expiry field in stored object)
- **D-12:** When admin sets expiry and toggles flag back ON manually before expiry, the `disabled_until` field is cleared/removed from the stored object

### Maintenance Page — Layout
- **D-13:** Two visually distinct cards (not one scrollable form):
  - **Card 1 — Maintenance Mode:** Large prominent ON/OFF toggle + editable "Maintenance Message" textarea
  - **Card 2 — Force Update:** "Minimum App Version" text input + "Force Update Message" textarea
- **D-14:** The toggle in Card 1 should be visually prominent (large, colored) to signal its danger/importance

### Maintenance Page — Live Status Banner
- **D-15:** When maintenance mode is ON (i.e., `maintenance_mode` = `true` in Remote Config OR a pending change sets it to `true`), a **global amber warning banner** appears at the top of EVERY dashboard page
- **D-16:** Banner text: "⚠ Maintenance Mode is ACTIVE — your app is currently showing a maintenance screen to all users."
- **D-17:** Banner includes a quick "Turn Off" link/button that navigates to the Maintenance page (or directly stages the turn-off change)
- **D-18:** Banner is rendered inside `DashboardLayout` so it appears on all routes without duplicating

### Shared Infrastructure Reuse
- **D-19:** Use existing `UnsavedChangesContext` — no new publish logic
- **D-20:** Use existing `Modal` primitive — for any confirmation dialogs (e.g., confirming maintenance mode ON)
- **D-21:** Use existing `useAuthFetch` hook for all Remote Config fetches
- **D-22:** Follow same page-level fetch pattern as Phase 3 (`useEffect` on mount, loading/error/empty states)

### Agent's Discretion
- Exact flag names to hardcode (vision_enabled, barcode_scanning, meal_logging, etc.) — agent picks sensible names matching the Android app's existing Remote Config keys
- Exact confirmation modal for "turning maintenance mode ON" — agent decides whether to show a confirmation dialog before staging the change
- Styling of the time-expiry input (show/hide animation, placeholder format)
</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Existing Phase 3 Infrastructure (must reuse)
- `contexts/UnsavedChangesContext.tsx` — global pending changes state; use `setChange(key, value)`
- `components/UnsavedBar.tsx` — fixed bottom bar; automatically appears when `hasChanges` is true
- `components/Modal.tsx` — reusable modal primitive with Escape/click-outside/scroll-lock
- `lib/useAuthFetch.ts` — Firebase auth token injection for fetch calls
- `lib/useProviderConfigs.ts` — reference for shared-hook fetch pattern

### Existing Layout (must modify for global banner)
- `presentation/components/layout/DashboardLayout.tsx` — add global maintenance banner here

### Remote Config API Routes (no changes needed)
- `app/api/remote-config/get/route.ts` — GET all Remote Config values
- `app/api/remote-config/set/route.ts` — POST `{ updates: Record<string,string> }` with Bearer token

### Design Tokens
- `tailwind.config.ts` — Arctic Blue tokens (arctic-50 through arctic-900), rounded-card (10px), rounded-button/input (7px)

### No external specs — requirements fully captured in decisions above
</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `UnsavedChangesContext` → `setChange(rcKey, jsonString)`: call with `"feature_flags_config"`, `"maintenance_config"` keys
- `Modal` component: use for maintenance-ON confirmation dialog
- `useAuthFetch` hook: drop-in for all fetch calls in new pages
- `UnsavedBar`: zero setup — it auto-renders from layout, just call `setChange`

### Established Patterns
- Pages fetch on mount via `useAuthFetch` → parse JSON from `parameters[key].defaultValue.value`
- Local state mirrors Remote Config value; `syncToContext(updated)` pushes to both local state and UnsavedChangesContext
- Loading: `animate-pulse` skeleton cards
- Error: red `bg-red-50 border-red-200` banner with Retry button
- Empty state: centered icon + text + CTA button

### Integration Points
- `DashboardLayout.tsx`: add `<MaintenanceBanner />` component just above `{children}` — reads from UnsavedChangesContext OR fetches maintenance_mode value
- `app/dashboard/feature-flags/page.tsx`: new file
- `app/dashboard/maintenance/page.tsx`: new file
- Both pages follow the same route pattern as `app/dashboard/api-keys/page.tsx`
</code_context>

<specifics>
## Specific Ideas

- Feature flag expiry: datetime-local input appears only when flag is toggled OFF (or already disabled) — hidden when flag is ON and no expiry is set, to avoid cluttering the UI
- Maintenance banner: amber color (amber-50 bg, amber-200 border, amber-700 text) — same amber palette already used in Phase 3 for warning states
- Maintenance toggle: consider a visually bold toggle or a colored ON/OFF button pair (not a tiny checkbox) — the action has app-wide consequences
- Global maintenance banner should NOT show while fetching (to avoid flash) — only render after confirming maintenance is active
</specifics>

<deferred>
## Deferred Ideas

- **Scheduled maintenance window**: "Turn maintenance ON at 11 PM, OFF at 6 AM automatically" — this requires a Cloud Function or cron job; OUT OF SCOPE (Cloud Functions excluded per PROJECT.md)
- **Per-flag description/label editing**: letting admin rename flags from the dashboard — OUT OF SCOPE (flags are code-defined)
- **Flag analytics**: seeing how many users hit a disabled flag — OUT OF SCOPE (Phase 5 analytics are Firestore-based, not flag-based)

### Reviewed Todos (not folded)
None reviewed — no matching todos found for Phase 4 scope.
</deferred>

---
*Phase: 04-feature-flags-maintenance-pages*
*Context gathered: 2026-05-10*
