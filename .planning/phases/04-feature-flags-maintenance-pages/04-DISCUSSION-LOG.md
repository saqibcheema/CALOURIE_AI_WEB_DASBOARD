# Phase 4: Feature Flags + Maintenance Pages — Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-05-10
**Phase:** 04 — Feature Flags + Maintenance Pages
**Areas discussed:** Data Shape, Toggle UX, Live Status Banner, Control Layout, Add Flag UI, Time-Limited Flags

---

## Feature Flags — Data Shape

| Option | Description | Selected |
|--------|-------------|----------|
| Simple boolean | `{"barcode_scanning": false}` — pure true/false | |
| Object with expiry | `{"barcode_scanning": {"enabled": false, "disabled_until": "..."}}` | ✓ |

**User's choice:** Option B — object with optional `disabled_until` ISO timestamp  
**Notes:** User wants to be able to disable a specific feature (e.g., barcode scanning, AI vision) for a limited time without disabling the whole app. Android app will check the timestamp and auto-re-enable. User confirmed they will implement the timestamp check in the Android app code.

---

## Feature Flags — Toggle UX

| Option | Description | Selected |
|--------|-------------|----------|
| Per-flag publish | Each flag has its own publish button | |
| Batch publish (UnsavedBar) | Toggle multiple flags, one global Publish | ✓ |

**User's choice:** Batch publish via existing UnsavedBar  
**Notes:** "If I toggle 2 to 3 flags and publish that, all 2 to 3 will be published. If I toggle only one, only that one will be published." Confirmed UnsavedBar pattern.

---

## Maintenance Page — Live Status Banner

| Option | Description | Selected |
|--------|-------------|----------|
| Maintenance page only | Banner visible only on /dashboard/maintenance | |
| Global (all pages) | Banner visible on all dashboard pages | ✓ |

**User's choice:** Global banner on all pages  
**Notes:** "If the user accidentally opened the maintenance mode and went re-off that, the app will be automatically in maintenance mode. If when they open the dashboard they will see that it will be in maintenance mode and I will off that." — safety rationale confirmed.

---

## Maintenance Page — Control Layout

| Option | Description | Selected |
|--------|-------------|----------|
| Single form | All 4 controls in one scrollable form | |
| 2 separate cards | Maintenance Mode card + Force Update card | ✓ |

**User's choice:** 2 separate cards — Maintenance Mode section and Force Update section  
**Notes:** User confirmed after explanation of what each control does.

---

## Feature Flags — Add/Delete UI

| Option | Description | Selected |
|--------|-------------|----------|
| Dynamic (modal add/delete) | Admin can add/delete flags from UI | |
| Hardcoded list (toggle only) | Flags defined in code, admin only toggles | ✓ |

**User's choice:** Hardcoded predefined flag list — no dynamic add/delete  
**Notes:** "I also manage the backend if I add a flag so you also manage it from the mobile app and Firebase so it's working properly. I can't provide that. I will add this in the code." — flags require coordinated code changes in both dashboard and Android app; dynamic UI would create orphaned flags.

---

## Time-Limited Feature Flags

| Option | Description | Selected |
|--------|-------------|----------|
| Simple ON/OFF | No expiry, permanent toggle | |
| ON/OFF + optional expiry | Toggle + optional datetime picker for auto-re-enable | ✓ |

**User's choice:** Option B — toggle with optional "disable until" time expiry  
**Notes:** "Do with option B because it's a lot more professional." User confirmed they will handle the timestamp check in Android app Kotlin code.

---

## Agent's Discretion

- Exact flag names to hardcode (matching Android app Remote Config keys)
- Whether to show confirmation modal when turning maintenance ON
- Show/hide animation for expiry time input

## Deferred Ideas

- Scheduled maintenance windows (requires Cloud Functions — out of scope)
- Per-flag description editing
- Flag analytics (Phase 5 scope)
