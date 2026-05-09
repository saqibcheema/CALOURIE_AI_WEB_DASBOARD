# Plan: Global Maintenance Banner

**Phase:** 04 — Feature Flags + Maintenance Pages
**Plan:** 03 — Global Maintenance Banner
**Created:** 2026-05-10
**Requirements:** MAINT-05

---

## Goal

Inject an amber warning banner into `DashboardLayout.tsx` that appears on **all dashboard pages** when `maintenance_mode` is active — either from the fetched Remote Config value OR from a pending change staged in `UnsavedChangesContext`. Banner includes a "Turn Off →" link to the Maintenance page.

---

## Files Modified

| File | Action |
|------|--------|
| `presentation/components/layout/DashboardLayout.tsx` | MODIFY |

---

## Tasks

### Task 1 — Read maintenance state from two sources

Inside `DashboardLayout`, add state and a fetch to check `maintenance_mode`. Also read `pendingChanges` from `UnsavedChangesContext`.

**Important:** `DashboardLayout` already wraps children with `<UnsavedChangesProvider>` — the banner must be inside this provider to access `pendingChanges`. Place the banner logic in an inner component or move the provider wrapping above the banner.

**Strategy:** Create a `<MaintenanceBanner />` component that reads from both context and a local fetch.

```tsx
function MaintenanceBanner() {
  const { pendingChanges } = useUnsavedChanges();
  const authFetch = useAuthFetch();
  const [fetchedOn, setFetchedOn] = useState(false);
  const [isFetched, setIsFetched] = useState(false);

  useEffect(() => {
    authFetch("/api/remote-config/get")
      .then(r => r.json())
      .then(data => {
        const val = data.parameters?.maintenance_mode?.defaultValue?.value;
        setFetchedOn(val === "true");
        setIsFetched(true);
      })
      .catch(() => setIsFetched(true)); // fail silently
  }, []);

  const pendingOn = pendingChanges["maintenance_mode"] === "true";
  const showBanner = isFetched && (pendingOn || fetchedOn);

  if (!showBanner) return null;

  return (
    <div className="flex items-center gap-3 px-4 py-2.5 bg-amber-50 border-b border-amber-200 text-sm text-amber-700">
      <IconAlertTriangle size={16} className="shrink-0 text-amber-500" />
      <span className="flex-1">
        <strong>Maintenance Mode is ACTIVE</strong> — your app is currently showing a
        maintenance screen to all users.
      </span>
      <Link
        href="/dashboard/maintenance"
        className="text-xs font-medium underline hover:no-underline shrink-0"
      >
        Turn Off →
      </Link>
    </div>
  );
}
```

**Verification:** Banner does NOT flash on load (only shows after fetch resolves).

---

### Task 2 — Place banner inside UnsavedChangesProvider

The banner requires `useUnsavedChanges()` which needs `<UnsavedChangesProvider>` as ancestor. The current layout renders `<UnsavedChangesProvider>` wrapping children — place `<MaintenanceBanner />` inside this same provider, above `<main>`.

Updated layout structure:
```tsx
return (
  <UnsavedChangesProvider>
    <div className="min-h-screen bg-arctic-50">
      <Sidebar isOpen={isSidebarOpen} />
      <Header toggleSidebar={toggleSidebar} isOpen={isSidebarOpen} />

      <main className={`pt-16 transition-all ${isSidebarOpen ? "md:ml-[218px]" : "md:ml-[64px]"}`}>
        <MaintenanceBanner />          {/* ← ADD HERE */}
        <div className="p-6">{children}</div>
      </main>

      <UnsavedBar />
      <Toaster position="bottom-right" richColors />
    </div>
  </UnsavedChangesProvider>
);
```

**Verification:** Banner renders inside main content area, above page content, on all routes.

---

### Task 3 — Add required imports to DashboardLayout

Add these imports at the top of `DashboardLayout.tsx`:

```ts
import Link from "next/link";
import { IconAlertTriangle } from "@tabler/icons-react";
import { useAuthFetch } from "@/lib/useAuthFetch";
import { useUnsavedChanges } from "@/contexts/UnsavedChangesContext";
```

**Verification:** No import errors; TypeScript resolves all imports.

---

### Task 4 — Re-fetch banner state after publish

When `UnsavedBar` publishes changes, the banner should re-evaluate. Since `publishAll` clears `pendingChanges`, the pending source goes to false automatically. The fetched source stays true until the next page refresh — which is acceptable (admin just published, they can see the effect in the banner until they navigate away or refresh).

No extra wiring needed — React's reactive state handles this automatically.

**Verification:** After publishing maintenance OFF, banner disappears (pending source clears; next fetch on navigation reflects updated RC value).

---

## Success Criteria Checklist

- [ ] MAINT-05: Amber banner visible on all dashboard pages when `maintenance_mode` is active
- [ ] Banner does NOT flash on page load (only shows after fetch resolves with `true`)
- [ ] Banner appears when pending change sets `maintenance_mode` to `"true"` (before publish)
- [ ] Banner disappears immediately when `maintenance_mode` pending change is discarded or set to `"false"`
- [ ] "Turn Off →" link navigates to `/dashboard/maintenance`
- [ ] Banner is rendered inside `<UnsavedChangesProvider>` (no context error)
- [ ] TypeScript: `npx tsc --noEmit` passes

---
*Plan created: 2026-05-10*
