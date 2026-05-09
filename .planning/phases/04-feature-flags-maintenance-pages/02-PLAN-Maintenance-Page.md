# Plan: Maintenance Page

**Phase:** 04 — Feature Flags + Maintenance Pages
**Plan:** 02 — Maintenance Page
**Created:** 2026-05-10
**Requirements:** MAINT-01, MAINT-02, MAINT-03, MAINT-04, MAINT-05

---

## Goal

Build `app/dashboard/maintenance/page.tsx` with two visually distinct cards: **Maintenance Mode card** (large toggle + message textarea) and **Force Update card** (version input + message textarea). All changes route through `UnsavedChangesContext` → UnsavedBar → Remote Config.

---

## Files Modified

| File | Action |
|------|--------|
| `app/dashboard/maintenance/page.tsx` | CREATE |

---

## Tasks

### Task 1 — Fetch all 4 maintenance keys on mount

Use `useAuthFetch` to fetch Remote Config on mount. Extract the 4 keys with safe fallbacks.

```ts
const authFetch = useAuthFetch();
const [maintenanceMode, setMaintenanceMode] = useState(false);
const [maintenanceMessage, setMaintenanceMessage] = useState("");
const [minVersion, setMinVersion] = useState("1.0.0");
const [forceUpdateMessage, setForceUpdateMessage] = useState("");
const [loading, setLoading] = useState(true);
const [error, setError] = useState<string | null>(null);

useEffect(() => {
  authFetch("/api/remote-config/get")
    .then(r => r.json())
    .then(data => {
      const p = data.parameters ?? {};
      const get = (key: string, fallback = "") =>
        p[key]?.defaultValue?.value ?? fallback;

      setMaintenanceMode(get("maintenance_mode", "false") === "true");
      setMaintenanceMessage(get("maintenance_message", ""));
      setMinVersion(get("minimum_app_version", "1.0.0"));
      setForceUpdateMessage(get("force_update_message", ""));
    })
    .catch(() => setError("Failed to load maintenance settings."))
    .finally(() => setLoading(false));
}, []);
```

**Verification:** All 4 fields populate from Remote Config on page load.

---

### Task 2 — Maintenance Mode toggle handler

Large prominent toggle (h-8 w-14), red when ON to signal danger.

```ts
const { setChange } = useUnsavedChanges();

const handleToggleMode = () => {
  const newMode = !maintenanceMode;
  setMaintenanceMode(newMode);
  setChange("maintenance_mode", String(newMode));
};
```

Toggle component (larger + red when ON):
```tsx
<button
  role="switch"
  aria-checked={maintenanceMode}
  onClick={handleToggleMode}
  className={`relative inline-flex h-8 w-14 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-offset-1 ${
    maintenanceMode
      ? "bg-red-500 focus:ring-red-400"
      : "bg-arctic-200 focus:ring-arctic-400"
  }`}
>
  <span className={`inline-block h-6 w-6 transform rounded-full bg-white shadow transition-transform ${
    maintenanceMode ? "translate-x-7" : "translate-x-1"
  }`} />
</button>
```

**Verification:** Toggle is visually large; turns red when ON; UnsavedBar appears.

---

### Task 3 — Maintenance Message handler

```ts
const handleMessageChange = (value: string) => {
  setMaintenanceMessage(value);
  setChange("maintenance_message", value);
};
```

**Verification:** Typing in textarea stages `maintenance_message` change; UnsavedBar appears.

---

### Task 4 — Force Update handlers

```ts
const handleVersionChange = (value: string) => {
  setMinVersion(value);
  setChange("minimum_app_version", value);
};

const handleForceMessageChange = (value: string) => {
  setForceUpdateMessage(value);
  setChange("force_update_message", value);
};
```

**Verification:** Editing version or force message stages the correct RC key.

---

### Task 5 — Card 1: Maintenance Mode card render

Visually prominent card. Toggle + status label + message textarea.

```tsx
<div className="bg-white rounded-card border border-arctic-100 p-6 shadow-card space-y-5">
  {/* Card header */}
  <div>
    <h2 className="text-base font-semibold text-arctic-900">Maintenance Mode</h2>
    <p className="text-sm text-arctic-500 mt-0.5">
      When ON, all app users see a maintenance screen. Use with caution.
    </p>
  </div>

  {/* Toggle row */}
  <div className="flex items-center gap-4">
    {/* Toggle (from Task 2) */}
    <span className={`text-sm font-semibold ${maintenanceMode ? "text-red-600" : "text-arctic-400"}`}>
      {maintenanceMode ? "ON" : "OFF"}
    </span>
  </div>

  {/* Message textarea */}
  <div>
    <label className="block text-sm font-medium text-arctic-700 mb-1.5">
      Maintenance Message
    </label>
    <textarea
      rows={3}
      value={maintenanceMessage}
      onChange={e => handleMessageChange(e.target.value)}
      placeholder="We're performing scheduled maintenance. Back soon!"
      className="w-full px-3 py-2 border border-arctic-200 rounded-input text-sm focus:outline-none focus:ring-2 focus:ring-arctic-400 focus:border-arctic-400 transition-colors resize-none"
    />
  </div>
</div>
```

**Verification:** MAINT-01 (toggle), MAINT-02 (message textarea) visible and functional.

---

### Task 6 — Card 2: Force Update card render

```tsx
<div className="bg-white rounded-card border border-arctic-100 p-6 shadow-card space-y-5">
  <div>
    <h2 className="text-base font-semibold text-arctic-900">Force Update</h2>
    <p className="text-sm text-arctic-500 mt-0.5">
      Users on app versions below the minimum will be forced to update.
    </p>
  </div>

  <div>
    <label className="block text-sm font-medium text-arctic-700 mb-1.5">
      Minimum App Version
    </label>
    <input
      type="text"
      value={minVersion}
      onChange={e => handleVersionChange(e.target.value)}
      placeholder="e.g. 1.2.0"
      className="w-full max-w-xs px-3 py-2 border border-arctic-200 rounded-input text-sm font-mono focus:outline-none focus:ring-2 focus:ring-arctic-400 focus:border-arctic-400 transition-colors"
    />
  </div>

  <div>
    <label className="block text-sm font-medium text-arctic-700 mb-1.5">
      Force Update Message
    </label>
    <textarea
      rows={3}
      value={forceUpdateMessage}
      onChange={e => handleForceMessageChange(e.target.value)}
      placeholder="A new version is required. Please update the app."
      className="w-full px-3 py-2 border border-arctic-200 rounded-input text-sm focus:outline-none focus:ring-2 focus:ring-arctic-400 focus:border-arctic-400 transition-colors resize-none"
    />
  </div>
</div>
```

**Verification:** MAINT-03 (version input), MAINT-04 (force update message) visible and functional.

---

### Task 7 — Loading and error states

- **Loading:** 2 skeleton cards with `animate-pulse`
- **Error:** red banner with Retry button (calls `refetch`)

**Verification:** Skeleton visible while fetching; error banner on network failure.

---

## Success Criteria Checklist

- [ ] MAINT-01: Large maintenance toggle switches mode on/off; stages `maintenance_mode` change
- [ ] MAINT-02: Maintenance message textarea stages `maintenance_message` change
- [ ] MAINT-03: Minimum app version input stages `minimum_app_version` change
- [ ] MAINT-04: Force update message textarea stages `force_update_message` change
- [ ] MAINT-05: (Handled in Plan 03 — global banner in DashboardLayout)
- [ ] Two separate cards visible (Maintenance Mode + Force Update)
- [ ] UnsavedBar appears on any field change; Publish Now sends all 4 RC keys
- [ ] Loading skeleton, error banner with Retry functional
- [ ] TypeScript: `npx tsc --noEmit` passes

---
*Plan created: 2026-05-10*
