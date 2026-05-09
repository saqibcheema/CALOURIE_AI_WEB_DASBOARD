# Requirements: Calourie AI Admin Dashboard

**Defined:** 2026-05-10
**Core Value:** Server-side control of all app configuration without Play Store updates — the dashboard must reliably read and write Firebase Remote Config values.

## v1 Requirements

Requirements for initial release. Each maps to roadmap phases.

### Authentication

- [ ] **AUTH-01**: Admin can log in with email and password via Firebase Auth
- [ ] **AUTH-02**: Admin session persists across browser refresh (no re-login on reload)
- [ ] **AUTH-03**: Wrong credentials display a visible error message on login page
- [ ] **AUTH-04**: All dashboard routes redirect to /login if user is not authenticated
- [ ] **AUTH-05**: Visiting /login when already authenticated redirects to /dashboard

### Layout & Navigation

- [ ] **LAYOUT-01**: Sidebar displays 6 navigation items (Overview, API Keys, AI Models, Feature Flags, Maintenance, Analytics)
- [ ] **LAYOUT-02**: Sidebar collapses between full mode (218px with labels) and compact mode (52px icons only)
- [ ] **LAYOUT-03**: Header shows current page title and action buttons, sticky at 52px height
- [ ] **LAYOUT-04**: All 6 sidebar links navigate to correct pages
- [ ] **LAYOUT-05**: Active sidebar item is visually highlighted with accent color

### Design System

- [ ] **DESIGN-01**: All Arctic Blue color tokens defined in tailwind.config.ts (14+ tokens from spec Section 2.1)
- [ ] **DESIGN-02**: DM Sans font loaded via next/font for all UI text with no layout shift
- [ ] **DESIGN-03**: IBM Plex Mono font used for API keys and config values
- [ ] **DESIGN-04**: Card border radius is 10px, buttons/inputs/badges use 7px
- [ ] **DESIGN-05**: Card shadows match spec: 0 1px 3px rgba(15,23,42,.06), 0 1px 2px rgba(15,23,42,.04)

### Remote Config API

- [ ] **API-01**: GET /api/remote-config/get returns all Remote Config values as JSON
- [ ] **API-02**: POST /api/remote-config/set updates one or more Remote Config keys and returns version number
- [ ] **API-03**: Both API routes verify admin authentication, return 401 if unauthorized
- [ ] **API-04**: Firebase Admin SDK initialized with singleton pattern (no re-initialization errors)
- [ ] **API-05**: Admin SDK credentials stored in environment variables, never in client bundle

### Overview Page

- [ ] **OVER-01**: Overview displays 4 stat cards (Total Meals Logged, AI Vision Uses, Barcode Scans, Unique Devices)
- [ ] **OVER-02**: Each stat card shows icon, large value, label, and trend indicator
- [ ] **OVER-03**: Overview includes a sparkline chart showing 7-day trend
- [ ] **OVER-04**: Overview includes config changes table showing recent activity

### API Keys Page

- [ ] **KEYS-01**: Page displays dynamic list of API key providers (not hardcoded Gemini/Groq)
- [ ] **KEYS-02**: Admin can add a new provider via modal form
- [ ] **KEYS-03**: Admin can delete a provider from the list
- [ ] **KEYS-04**: API key input is masked by default, revealable on interaction
- [ ] **KEYS-05**: Each provider has its own Publish button that updates Remote Config
- [ ] **KEYS-06**: Publish action shows toast confirmation

### AI Models Page

- [ ] **MODEL-01**: Page displays tabs for each AI provider (data-driven from array)
- [ ] **MODEL-02**: Each tab shows model name, temperature, and max tokens fields
- [ ] **MODEL-03**: Admin can add new provider tabs
- [ ] **MODEL-04**: Admin can delete provider tabs
- [ ] **MODEL-05**: Changes can be published to Remote Config with toast confirmation

### Feature Flags Page

- [ ] **FLAGS-01**: Page displays list of feature flag toggles (data-driven from array)
- [ ] **FLAGS-02**: Admin can toggle individual flags on/off
- [ ] **FLAGS-03**: Admin can add new feature flags via form
- [ ] **FLAGS-04**: Admin can delete feature flags
- [ ] **FLAGS-05**: Batch publish all flag changes to Remote Config with toast confirmation

### Maintenance Page

- [ ] **MAINT-01**: Maintenance toggle switches maintenance mode on/off
- [ ] **MAINT-02**: Maintenance message text area for custom message
- [ ] **MAINT-03**: Force update version number input
- [ ] **MAINT-04**: Force update message text area
- [ ] **MAINT-05**: Live status banner shows when maintenance mode is active

### Analytics Page

- [ ] **ANLYT-01**: Analytics displays 4 stat cards with today's metrics
- [ ] **ANLYT-02**: Bar chart shows last 7 days of aggregated data from Firestore
- [ ] **ANLYT-03**: GET /api/analytics returns data from Firestore app_analytics collection

### Shared UI Components

- [ ] **UI-01**: Toast component shows success/error with icon, auto-dismisses after 2.5s, stacks vertically
- [ ] **UI-02**: UnsavedBar appears when changes are pending, has Discard and Publish Now buttons
- [ ] **UI-03**: Modal component with overlay click/Escape to close, title, body, footer
- [ ] **UI-04**: All form inputs have visible focus states
- [ ] **UI-05**: All async operations show loading states (fetching, publishing)
- [ ] **UI-06**: All delete actions immediately reflect in the UI

### Deployment

- [ ] **DEPLOY-01**: Application deploys to Firebase Hosting without errors
- [ ] **DEPLOY-02**: All 6 pages work correctly on deployed URL
- [ ] **DEPLOY-03**: Publishing a Remote Config value from live dashboard updates Firebase

## v2 Requirements

Deferred to future release. Tracked but not in current roadmap.

### Audit & History

- **AUDIT-01**: Dashboard logs all config changes with timestamp, user, old/new values
- **AUDIT-02**: Admin can view change history for any config key
- **AUDIT-03**: Admin can export current config as JSON backup

### Multi-Admin

- **ADMIN-01**: Multiple admin accounts with role-based access
- **ADMIN-02**: Activity log showing which admin made which changes

## Out of Scope

| Feature | Reason |
|---------|--------|
| Android/Kotlin code (RemoteConfigRepository.kt) | Dashboard-only project, Android integration is separate |
| Cloud Functions | Dashboard uses Admin SDK directly from API routes |
| Mobile authentication flows | Single admin account via email/password only |
| Push notifications | Not needed for admin dashboard |
| User management beyond single admin | Not required for v1 |
| Mobile-responsive design | Desktop-only dashboard per spec |
| Dark mode | Design finalized as Arctic Blue light theme |
| Real-time WebSocket sync | Overkill for single-admin, manual refresh sufficient |
| A/B testing / percentage rollouts | Beyond v1 scope, use Firebase Console directly |

## Traceability

| Requirement | Phase | Status |
|-------------|-------|--------|
| AUTH-01 | Phase 1 | Pending |
| AUTH-02 | Phase 1 | Pending |
| AUTH-03 | Phase 1 | Pending |
| AUTH-04 | Phase 1 | Pending |
| AUTH-05 | Phase 1 | Pending |
| LAYOUT-01 | Phase 1 | Pending |
| LAYOUT-02 | Phase 1 | Pending |
| LAYOUT-03 | Phase 1 | Pending |
| LAYOUT-04 | Phase 1 | Pending |
| LAYOUT-05 | Phase 1 | Pending |
| DESIGN-01 | Phase 1 | Pending |
| DESIGN-02 | Phase 1 | Pending |
| DESIGN-03 | Phase 1 | Pending |
| DESIGN-04 | Phase 1 | Pending |
| DESIGN-05 | Phase 1 | Pending |
| API-01 | Phase 2 | Pending |
| API-02 | Phase 2 | Pending |
| API-03 | Phase 2 | Pending |
| API-04 | Phase 2 | Pending |
| API-05 | Phase 2 | Pending |
| OVER-01 | Phase 2 | Pending |
| OVER-02 | Phase 2 | Pending |
| OVER-03 | Phase 2 | Pending |
| OVER-04 | Phase 2 | Pending |
| KEYS-01 | Phase 3 | Pending |
| KEYS-02 | Phase 3 | Pending |
| KEYS-03 | Phase 3 | Pending |
| KEYS-04 | Phase 3 | Pending |
| KEYS-05 | Phase 3 | Pending |
| KEYS-06 | Phase 3 | Pending |
| MODEL-01 | Phase 3 | Pending |
| MODEL-02 | Phase 3 | Pending |
| MODEL-03 | Phase 3 | Pending |
| MODEL-04 | Phase 3 | Pending |
| MODEL-05 | Phase 3 | Pending |
| FLAGS-01 | Phase 4 | Pending |
| FLAGS-02 | Phase 4 | Pending |
| FLAGS-03 | Phase 4 | Pending |
| FLAGS-04 | Phase 4 | Pending |
| FLAGS-05 | Phase 4 | Pending |
| MAINT-01 | Phase 4 | Pending |
| MAINT-02 | Phase 4 | Pending |
| MAINT-03 | Phase 4 | Pending |
| MAINT-04 | Phase 4 | Pending |
| MAINT-05 | Phase 4 | Pending |
| UI-01 | Phase 3 | Pending |
| UI-02 | Phase 3 | Pending |
| UI-03 | Phase 3 | Pending |
| UI-04 | Phase 1 | Pending |
| UI-05 | Phase 2 | Pending |
| UI-06 | Phase 3 | Pending |
| ANLYT-01 | Phase 5 | Pending |
| ANLYT-02 | Phase 5 | Pending |
| ANLYT-03 | Phase 5 | Pending |
| DEPLOY-01 | Phase 5 | Pending |
| DEPLOY-02 | Phase 5 | Pending |
| DEPLOY-03 | Phase 5 | Pending |

**Coverage:**
- v1 requirements: 53 total
- Mapped to phases: 53
- Unmapped: 0 ✓

---
*Requirements defined: 2026-05-10*
*Last updated: 2026-05-10 after initial definition*
