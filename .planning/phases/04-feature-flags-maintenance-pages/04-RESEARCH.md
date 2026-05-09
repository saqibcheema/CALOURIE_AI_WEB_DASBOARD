# Phase 4: Feature Flags + Maintenance Pages — Research

**Phase:** 4 — Feature Flags + Maintenance Pages
**Researched:** 2026-05-10
**Status:** Complete

---

## 1. Remote Config Key Architecture

### Existing keys (already in Firebase, from PROJECT.md context)
| Key | Type | Phase 4 page |
|-----|------|-------------|
| `maintenance_mode` | `"true"` / `"false"` string | Maintenance |
| `maintenance_message` | string | Maintenance |
| `minimum_app_version` | string e.g. `"1.0.0"` | Maintenance |
| `force_update_message` | string | Maintenance |

### New key for Phase 4
| Key | Type | Page |
|-----|------|------|
| `feature_flags_config` | JSON string | Feature Flags |

### Feature Flags JSON shape (D-01 to D-04)
```json
{
  "vision_enabled": { "enabled": true },
  "barcode_scanning": { "enabled": false, "disabled_until": "2026-05-10T18:00:00.000Z" },
  "meal_logging": { "enabled": true },
  "chat_history": { "enabled": true }
}
```

**Android consumption pattern** (developer note):
```kotlin
val flagsJson = remoteConfig.getString("feature_flags_config")
val flags = Gson().fromJson(flagsJson, FlagsConfig::class.java)
val isVisionEnabled = flags.vision_enabled.enabled &&
    (flags.vision_enabled.disabled_until == null || 
     Instant.parse(flags.vision_enabled.disabled_until).isAfter(Instant.now()))
```

---

## 2. Feature Flags Page Implementation Pattern

### Hardcoded flag definitions (D-05 to D-07)
Define as a typed constant in the page file — not fetched from anywhere, just the list of known flags:

```ts
const FEATURE_FLAGS = [
  { key: "vision_enabled",   label: "AI Vision",        description: "Camera-based food recognition" },
  { key: "barcode_scanning", label: "Barcode Scanning",  description: "Barcode-based food lookup" },
  { key: "meal_logging",     label: "Meal Logging",      description: "Manual meal entry feature" },
  { key: "chat_history",     label: "Chat History",      description: "Persistent conversation history" },
] as const;
```

### State shape
```ts
type FlagValue = { enabled: boolean; disabled_until?: string };
type FlagsConfig = Record<string, FlagValue>;
```

### Fetch pattern (matches api-keys page)
```ts
const res = await authFetch("/api/remote-config/get");
const data = await res.json();
const raw = data.parameters?.feature_flags_config?.defaultValue?.value ?? "{}";
const parsed: FlagsConfig = JSON.parse(raw);
// Merge with FEATURE_FLAGS to ensure all keys present even if Remote Config is empty
const merged = Object.fromEntries(
  FEATURE_FLAGS.map(f => [f.key, parsed[f.key] ?? { enabled: true }])
);
```

### Toggle handler
```ts
const handleToggle = (key: string) => {
  const updated = { ...flags, [key]: { ...flags[key], enabled: !flags[key].enabled } };
  // Clear disabled_until when re-enabling
  if (updated[key].enabled) delete updated[key].disabled_until;
  setFlags(updated);
  setChange("feature_flags_config", JSON.stringify(updated));
};
```

### Expiry handler
```ts
const handleExpiry = (key: string, localDatetime: string) => {
  // datetime-local value is "2026-05-10T18:00" → convert to ISO UTC
  const isoUtc = localDatetime ? new Date(localDatetime).toISOString() : undefined;
  const updated = { ...flags, [key]: { ...flags[key], disabled_until: isoUtc } };
  if (!isoUtc) delete updated[key].disabled_until;
  setFlags(updated);
  setChange("feature_flags_config", JSON.stringify(updated));
};
```

### Expiry input: datetime-local → ISO UTC
```ts
// Display stored ISO UTC in datetime-local input (local time)
const toLocalDatetime = (isoUtc?: string): string => {
  if (!isoUtc) return "";
  const d = new Date(isoUtc);
  // Format: "YYYY-MM-DDTHH:mm" (datetime-local format)
  return new Date(d.getTime() - d.getTimezoneOffset() * 60000)
    .toISOString()
    .slice(0, 16);
};
```

---

## 3. Maintenance Page Implementation Pattern

### Fetch all 4 maintenance keys in one call
```ts
const res = await authFetch("/api/remote-config/get");
const data = await res.json();
const p = data.parameters ?? {};
const getValue = (key: string, fallback = "") =>
  p[key]?.defaultValue?.value ?? fallback;

setMaintenanceMode(getValue("maintenance_mode", "false") === "true");
setMaintenanceMessage(getValue("maintenance_message", ""));
setMinVersion(getValue("minimum_app_version", "1.0.0"));
setForceUpdateMessage(getValue("force_update_message", ""));
```

### Publish pattern (4 separate keys, one UnsavedChangesContext call each)
```ts
// On every field change:
setChange("maintenance_mode", String(newMode));
setChange("maintenance_message", newMessage);
setChange("minimum_app_version", newVersion);
setChange("force_update_message", newForceMsg);
```

### UnsavedChangesContext batching — existing behavior
`setChange` already batches — each call updates the pending changes map. All 4 keys go into the same publish call when user clicks "Publish Now" in UnsavedBar.

---

## 4. Global Maintenance Banner (D-15 to D-18)

### Where to inject
`presentation/components/layout/DashboardLayout.tsx` — inside the main content area wrapper, above `{children}`.

### Reading maintenance state in layout
Two sources (check both, either triggers banner):
1. **Pending change** — UnsavedChangesContext has `maintenance_mode` = `"true"` in pending changes
2. **Fetched value** — fetch `/api/remote-config/get` once on mount, read `maintenance_mode`

Pattern:
```tsx
// In DashboardLayout, add:
const { pendingChanges } = useUnsavedChanges();
const [fetchedMaintenance, setFetchedMaintenance] = useState(false);
const [isFetched, setIsFetched] = useState(false);

useEffect(() => {
  authFetch("/api/remote-config/get")
    .then(r => r.json())
    .then(data => {
      const val = data.parameters?.maintenance_mode?.defaultValue?.value;
      setFetchedMaintenance(val === "true");
      setIsFetched(true);
    })
    .catch(() => setIsFetched(true)); // fail silently — banner just won't show on error
}, []);

const pendingMaintenance = pendingChanges["maintenance_mode"] === "true";
const showBanner = isFetched && (pendingMaintenance || fetchedMaintenance);
```

### Banner component
```tsx
{showBanner && (
  <div className="flex items-center gap-3 px-4 py-2.5 bg-amber-50 border-b border-amber-200 text-sm text-amber-700">
    <IconAlertTriangle size={16} className="shrink-0 text-amber-500" />
    <span className="flex-1">
      ⚠ <strong>Maintenance Mode is ACTIVE</strong> — your app is currently showing 
      a maintenance screen to all users.
    </span>
    <Link href="/dashboard/maintenance" 
          className="text-xs font-medium underline hover:no-underline shrink-0">
      Turn Off →
    </Link>
  </div>
)}
```

---

## 5. Reusable Assets Confirmed

| Asset | Location | Phase 4 Usage |
|-------|----------|--------------|
| `useUnsavedChanges` | `contexts/UnsavedChangesContext.tsx` | `setChange()` in both pages |
| `useAuthFetch` | `lib/auth.tsx` | Fetch RC values on mount |
| `Modal` | `components/Modal.tsx` | Optional confirmation for maintenance ON |
| Arctic Blue tokens | `tailwind.config.ts` | All styling |
| `UnsavedBar` | Already in DashboardLayout | Auto-renders — no work needed |

---

## 6. Toggle Switch Component

No toggle switch exists yet — needs to be created inline or as a small component. Pattern:

```tsx
// Simple CSS toggle (no library needed)
<button
  role="switch"
  aria-checked={enabled}
  onClick={() => handleToggle(flagKey)}
  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-arctic-400 focus:ring-offset-1 ${
    enabled ? "bg-arctic-500" : "bg-arctic-200"
  }`}
>
  <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${
    enabled ? "translate-x-6" : "translate-x-1"
  }`} />
</button>
```

For the Maintenance page, the toggle is larger (h-8 w-14) and colored red when ON:
```tsx
className={`... ${maintenanceMode ? "bg-red-500" : "bg-arctic-200"}`}
```

---

## ## RESEARCH COMPLETE

Phase 4 is well-understood. Existing patterns (UnsavedChangesContext, useAuthFetch, Arctic Blue tokens) cover all implementation needs. No new dependencies required.

**Key implementation notes for planner:**
1. Feature Flags page: hardcoded `FEATURE_FLAGS` array + JSON merge pattern ensures graceful handling of missing RC keys
2. Maintenance page: 4 separate `setChange()` calls (one per key) — simpler than bundling into one JSON blob
3. Global banner: needs `useAuthFetch` imported into DashboardLayout (check if already available there)
4. `datetime-local` expiry: always store as ISO UTC, display converted to local time
