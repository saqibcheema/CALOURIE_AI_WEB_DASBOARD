# Plan: Feature Flags Page

**Phase:** 04 — Feature Flags + Maintenance Pages
**Plan:** 01 — Feature Flags Page
**Created:** 2026-05-10
**Requirements:** FLAGS-01, FLAGS-02, FLAGS-05

---

## Goal

Build `app/dashboard/feature-flags/page.tsx` — a data-driven toggle list with optional per-flag time-based expiry. Flags are hardcoded in source; admin toggles them and batch-publishes via the existing UnsavedBar.

---

## Files Modified

| File | Action |
|------|--------|
| `app/dashboard/feature-flags/page.tsx` | CREATE |

---

## Tasks

### Task 1 — Define FEATURE_FLAGS constant and types

Create the hardcoded flags array and TypeScript types at the top of the page file.

```ts
const FEATURE_FLAGS = [
  { key: "vision_enabled",   label: "AI Vision",       description: "Camera-based food recognition" },
  { key: "barcode_scanning", label: "Barcode Scanning", description: "Barcode-based food lookup" },
  { key: "meal_logging",     label: "Meal Logging",     description: "Manual meal entry feature" },
  { key: "chat_history",     label: "Chat History",     description: "Persistent conversation history" },
] as const;

type FlagKey = (typeof FEATURE_FLAGS)[number]["key"];
type FlagValue = { enabled: boolean; disabled_until?: string };
type FlagsConfig = Record<string, FlagValue>;
```

**Verification:** TypeScript compiles without error, `FlagKey` is a union of the 4 string literals.

---

### Task 2 — Fetch feature_flags_config on mount

Use `useAuthFetch` hook to fetch Remote Config on mount. Parse `feature_flags_config` and merge with `FEATURE_FLAGS` to guarantee all 4 keys are present even if Remote Config is empty.

```ts
const authFetch = useAuthFetch();
const [flags, setFlags] = useState<FlagsConfig>({});
const [loading, setLoading] = useState(true);
const [error, setError] = useState<string | null>(null);

useEffect(() => {
  authFetch("/api/remote-config/get")
    .then(r => r.json())
    .then(data => {
      const raw = data.parameters?.feature_flags_config?.defaultValue?.value ?? "{}";
      const parsed: FlagsConfig = JSON.parse(raw);
      const merged = Object.fromEntries(
        FEATURE_FLAGS.map(f => [f.key, parsed[f.key] ?? { enabled: true }])
      );
      setFlags(merged);
    })
    .catch(() => setError("Failed to load feature flags."))
    .finally(() => setLoading(false));
}, []);
```

**Verification:** Network tab shows GET /api/remote-config/get on page load; `flags` state has all 4 keys.

---

### Task 3 — Toggle handler with disabled_until clear

When admin re-enables a flag, clear `disabled_until` from the stored object.

```ts
const { setChange } = useUnsavedChanges();

const handleToggle = (key: string) => {
  const updated = {
    ...flags,
    [key]: { ...flags[key], enabled: !flags[key].enabled },
  };
  if (updated[key].enabled) delete updated[key].disabled_until;
  setFlags(updated);
  setChange("feature_flags_config", JSON.stringify(updated));
};
```

**Verification:** Toggling a flag shows UnsavedBar; toggling it back hides UnsavedBar; re-enabling clears expiry.

---

### Task 4 — Expiry handler (datetime-local → ISO UTC)

Show a `datetime-local` input only when a flag is OFF. Convert to ISO UTC before storing.

```ts
const toLocalDatetime = (isoUtc?: string): string => {
  if (!isoUtc) return "";
  const d = new Date(isoUtc);
  return new Date(d.getTime() - d.getTimezoneOffset() * 60000)
    .toISOString()
    .slice(0, 16);
};

const handleExpiry = (key: string, localDatetime: string) => {
  const isoUtc = localDatetime ? new Date(localDatetime).toISOString() : undefined;
  const updated = { ...flags, [key]: { ...flags[key], disabled_until: isoUtc } };
  if (!isoUtc) delete updated[key].disabled_until;
  setFlags(updated);
  setChange("feature_flags_config", JSON.stringify(updated));
};
```

**Verification:** Setting a datetime in the input stores ISO UTC in `flags` state; displayed value matches local time.

---

### Task 5 — Toggle switch component (inline)

CSS-only toggle switch using Arctic Blue tokens. No external library.

```tsx
<button
  role="switch"
  aria-checked={flags[f.key]?.enabled}
  onClick={() => handleToggle(f.key)}
  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-arctic-400 focus:ring-offset-1 ${
    flags[f.key]?.enabled ? "bg-arctic-500" : "bg-arctic-200"
  }`}
>
  <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${
    flags[f.key]?.enabled ? "translate-x-6" : "translate-x-1"
  }`} />
</button>
```

**Verification:** Toggle visually moves; aria-checked reflects state; keyboard accessible via focus ring.

---

### Task 6 — Full page render with loading/error/empty states

Assemble the page with:
- Page header (title + description)
- `animate-pulse` skeleton cards while loading
- Red error banner with Retry button on error
- Flag rows: toggle + name + description + optional expiry input (only when flag is OFF)

Each flag row layout:
```
[ Toggle ] | Flag Label        | "Disable until:" <datetime-local> (only if OFF)
            | Flag description  |
```

**Verification:**
- FLAGS-01: 4 flags visible, data-driven from `FEATURE_FLAGS` array
- FLAGS-02: toggling a flag changes its `enabled` state
- FLAGS-05: UnsavedBar appears on any change; "Publish Now" sends batch to Remote Config

---

## Success Criteria Checklist

- [ ] FLAGS-01: Page displays 4 flag toggles from `FEATURE_FLAGS` array (not hardcoded JSX)
- [ ] FLAGS-02: Toggle works; state updates immediately in UI
- [ ] FLAGS-05: UnsavedBar appears on toggle; Publish Now sends `feature_flags_config` JSON to Remote Config
- [ ] Loading: skeleton cards visible while fetching
- [ ] Error: red banner with Retry button on fetch failure
- [ ] Expiry: datetime-local input visible only when flag is OFF; stored as ISO UTC
- [ ] Re-enable: toggling flag back ON clears `disabled_until`
- [ ] TypeScript: `npx tsc --noEmit` passes

---
*Plan created: 2026-05-10*
