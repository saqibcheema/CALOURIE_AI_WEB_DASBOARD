# Feature Research

**Domain:** Firebase Admin Dashboard
**Researched:** 2026-05-10
**Confidence:** HIGH

## Feature Landscape

### Table Stakes (Users Expect These)

Features users assume exist. Missing these = product feels incomplete.

| Feature | Why Expected | Complexity | Notes |
|---------|--------------|------------|-------|
| Secure login (email/password) | Admin dashboards must be protected | LOW | Firebase Auth handles heavy lifting |
| Config read/write via Remote Config | Core purpose of the dashboard | MEDIUM | Admin SDK server-side, display client-side |
| Feature flag toggles | Binary on/off is the simplest config pattern | LOW | Toggle component with batch publish |
| Toast/notification feedback | Users need confirmation that actions worked | LOW | Auto-dismiss 2.5s, stack vertically |
| Loading states | Users need to know async operations are in progress | LOW | Skeleton or spinner on every fetch/publish |
| Unsaved changes indicator | Prevents accidental data loss | LOW | Sticky bar with Discard and Publish |
| Auth guard / session persistence | Must stay logged in across refreshes | MEDIUM | Firebase Auth state observer + redirect |

### Differentiators (Competitive Advantage)

Features that set the product apart. Not required, but valuable.

| Feature | Value Proposition | Complexity | Notes |
|---------|-------------------|------------|-------|
| Dynamic provider system (data-driven) | Add new API providers without code changes | MEDIUM | Array-driven ProviderCard, not hardcoded |
| Masked API key display | Security best practice — don't expose full keys | LOW | Show last 4 chars, reveal on click |
| Sparkline chart on overview | Quick visual trend without navigating to analytics | MEDIUM | Recharts sparkline component |
| Per-provider publish | Granular control — publish one key without affecting others | MEDIUM | Each ProviderCard has its own publish button |
| Collapsible sidebar | Space efficiency for content-focused work | LOW | 218px ↔ 52px toggle with icon-only mode |
| Live maintenance status banner | Visual confirmation that maintenance mode is active | LOW | Conditional banner on maintenance page |

### Anti-Features (Commonly Requested, Often Problematic)

Features that seem good but create problems.

| Feature | Why Requested | Why Problematic | Alternative |
|---------|---------------|-----------------|-------------|
| Real-time sync (WebSocket) | Instant updates | Overkill for single-admin dashboard, adds complexity | Manual refresh / refetch on page load |
| Multi-user roles & permissions | Team management | Single admin only — adds auth complexity for no benefit | Single admin UID in Firestore rules |
| Audit log with full history | Track all changes | Requires additional Firestore writes, storage costs | Config changes table showing recent activity |
| A/B testing / percentage rollouts | Advanced feature flags | Way beyond v1 scope, Firebase Remote Config supports it natively in console | Simple boolean toggles for v1 |
| Dark mode toggle | Visual preference | Design is finalized as Arctic Blue light theme | Stick with finalized design |

## Feature Dependencies

```
[Firebase Auth] 
    └──requires──> [Login Page]
                       └──enables──> [Auth Guard]
                                         └──enables──> [All Dashboard Pages]

[Firebase Admin SDK Init]
    └──requires──> [API Routes (get/set)]
                       └──enables──> [Overview Page]
                       └──enables──> [API Keys Page]
                       └──enables──> [AI Models Page]
                       └──enables──> [Feature Flags Page]
                       └──enables──> [Maintenance Page]

[Firestore Analytics Collection]
    └──requires──> [Analytics API Route]
                       └──enables──> [Analytics Page]
```

### Dependency Notes

- **All dashboard pages require Auth Guard:** No page should be accessible without login
- **API Keys, AI Models, Feature Flags, Maintenance all require Remote Config API routes:** These are the core CRUD operations
- **Analytics is independent from Remote Config:** Uses Firestore directly, can be built last
- **Overview page depends on both Remote Config and Analytics:** Shows stats from both sources

## MVP Definition

### Launch With (v1)

- [x] Firebase Auth login — single admin account
- [x] Remote Config read/write via API routes — core functionality
- [x] Overview page with stat cards — dashboard landing page
- [x] API Keys management — rotate Gemini & Groq keys
- [x] AI Models configuration — model name, temperature, tokens
- [x] Feature Flags toggles — enable/disable app features
- [x] Maintenance mode controls — instant maintenance screen
- [x] Analytics page — 7-day usage stats from Firestore
- [x] Deploy to Firebase Hosting — accessible from browser

### Add After Validation (v1.x)

- [ ] Audit log of config changes — when admin wants history
- [ ] Export config as JSON — for backup purposes
- [ ] Config diff view — see what changed before publishing

### Future Consideration (v2+)

- [ ] Multi-admin support with roles — if team grows
- [ ] A/B testing integration — when app needs experiments
- [ ] Push notification management — when app adds notifications
- [ ] Real-time dashboard updates — if multiple admins needed

## Feature Prioritization Matrix

| Feature | User Value | Implementation Cost | Priority |
|---------|------------|---------------------|----------|
| Login + Auth Guard | HIGH | LOW | P1 |
| Remote Config API Routes | HIGH | MEDIUM | P1 |
| API Keys Management | HIGH | MEDIUM | P1 |
| Feature Flags Toggles | HIGH | LOW | P1 |
| Maintenance Controls | HIGH | LOW | P1 |
| AI Models Config | MEDIUM | MEDIUM | P1 |
| Overview Dashboard | MEDIUM | MEDIUM | P1 |
| Analytics Page | MEDIUM | MEDIUM | P1 |
| Toast Notifications | MEDIUM | LOW | P1 |
| Unsaved Changes Bar | MEDIUM | LOW | P1 |
| Collapsible Sidebar | LOW | LOW | P2 |
| Masked Key Display | LOW | LOW | P2 |

## Sources

- Firebase Remote Config documentation
- Feature flag management best practices (ConfigCat, Flagsmith)
- Admin dashboard UI patterns research

---
*Feature research for: Firebase Admin Dashboard*
*Researched: 2026-05-10*
