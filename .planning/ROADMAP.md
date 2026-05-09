# Roadmap: Calourie AI Admin Dashboard

**Created:** 2026-05-10
**Milestone:** v1.0 — Full Dashboard with Firebase Integration
**Phases:** 5
**Requirements:** 53 mapped

## Milestone 1: v1.0 — Full Dashboard

### Phase 1: Foundation (Firebase + Auth + Shell)

**Goal:** Working login page, auth guard, dashboard shell with sidebar + header, and Arctic Blue design system — no feature pages yet, just the skeleton.

**Requirements:** AUTH-01, AUTH-02, AUTH-03, AUTH-04, AUTH-05, LAYOUT-01, LAYOUT-02, LAYOUT-03, LAYOUT-04, LAYOUT-05, DESIGN-01, DESIGN-02, DESIGN-03, DESIGN-04, DESIGN-05, UI-04

**UI hint**: yes

**Success criteria:**
1. `npm run dev` runs without errors
2. `localhost:3000` shows the login page with Arctic Blue styling
3. Wrong credentials show an error message
4. Correct credentials redirect to /dashboard
5. All 6 sidebar links navigate to correct pages with placeholder content
6. Refreshing /dashboard does not redirect to login (session persists)
7. Refreshing /login when already logged in redirects to /dashboard
8. Sidebar collapses between 218px and 52px modes
9. All Arctic Blue tokens render correctly in UI

**Depends on:** Nothing (first phase)

---

### Phase 2: Remote Config API + Overview Page

**Goal:** Firebase Admin SDK initialized server-side, API routes for reading/writing Remote Config, and Overview page with stat cards and sparkline chart.

**Requirements:** API-01, API-02, API-03, API-04, API-05, OVER-01, OVER-02, OVER-03, OVER-04, UI-05

**UI hint**: yes

**Success criteria:**
1. GET /api/remote-config/get returns all 14 Remote Config values as JSON
2. POST /api/remote-config/set updates a key and returns version number
3. Both routes return 401 when called without authentication
4. Overview page shows 4 stat cards with icons, values, and trend indicators
5. Sparkline chart renders 7-day data
6. Config changes table shows recent updates
7. Loading states visible while fetching data

**Depends on:** Phase 1

---

### Phase 3: API Keys + AI Models Pages

**Goal:** API Keys page with dynamic provider management, AI Models page with tabbed configuration, and all shared UI components (Toast, Modal, UnsavedBar).

**Requirements:** KEYS-01, KEYS-02, KEYS-03, KEYS-04, KEYS-05, KEYS-06, MODEL-01, MODEL-02, MODEL-03, MODEL-04, MODEL-05, UI-01, UI-02, UI-03, UI-06

**UI hint**: yes

**Success criteria:**
1. API Keys page displays providers in a dynamic list (not hardcoded)
2. Admin can add a new provider via modal, delete a provider, and edit key values
3. API keys are masked by default
4. Per-provider Publish button updates Remote Config and shows toast
5. AI Models page displays tabs per provider from an array
6. Each tab shows model name, temperature, and max tokens
7. Admin can add/delete tabs and publish changes
8. UnsavedBar appears on edits, disappears on publish/discard
9. Toast notifications show success/error and auto-dismiss

**Depends on:** Phase 2

---

### Phase 4: Feature Flags + Maintenance Pages

**Goal:** Feature Flags page with toggle list and batch publish, Maintenance page with all 4 controls and live status banner.

**Requirements:** FLAGS-01, FLAGS-02, FLAGS-03, FLAGS-04, FLAGS-05, MAINT-01, MAINT-02, MAINT-03, MAINT-04, MAINT-05

**UI hint**: yes

**Success criteria:**
1. Feature Flags page displays toggles from a data-driven list
2. Admin can toggle, add, delete flags and batch publish
3. Maintenance toggle switches maintenance mode on/off in Remote Config
4. Maintenance message, force update version, and force update message are editable
5. Live status banner appears when maintenance mode is active
6. All changes use existing Toast and UnsavedBar components from Phase 3

**Depends on:** Phase 3

---

### Phase 5: Analytics + Deployment

**Goal:** Analytics page with Firestore data, bar chart, and final deployment to Firebase Hosting with live verification.

**Requirements:** ANLYT-01, ANLYT-02, ANLYT-03, DEPLOY-01, DEPLOY-02, DEPLOY-03

**UI hint**: yes

**Success criteria:**
1. GET /api/analytics returns last 7 days from Firestore app_analytics collection
2. Analytics page shows 4 stat cards with today's metrics
3. Bar chart displays 7-day trend data
4. firebase.json configured correctly for Next.js hosting
5. `firebase deploy` succeeds without errors
6. All 6 pages work on the deployed URL
7. Publishing a Remote Config value from live dashboard updates Firebase

**Depends on:** Phase 4

---

## Summary

| Phase | Name | Requirements | Success Criteria |
|-------|------|--------------|------------------|
| 1 | Foundation | 16 | 9 |
| 2 | Remote Config API + Overview | 10 | 7 |
| 3 | API Keys + AI Models | 15 | 9 |
| 4 | Feature Flags + Maintenance | 10 | 6 |
| 5 | Analytics + Deployment | 6 | 7 |
| **Total** | | **53** | **38** |

---
*Roadmap created: 2026-05-10*
*Last updated: 2026-05-10 after initial creation*
