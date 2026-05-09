# Project Research Summary

**Project:** Calourie AI Admin Dashboard
**Domain:** Firebase Admin Dashboard (Next.js 14)
**Researched:** 2026-05-10
**Confidence:** HIGH

## Executive Summary

The Calourie AI Admin Dashboard is a well-defined Firebase admin panel built with Next.js 14 (App Router), TypeScript, and Tailwind CSS. The stack is mature and well-documented — Next.js 14's App Router provides the ideal architecture for this use case: Server Components for secure rendering, API routes for Firebase Admin SDK operations, and built-in support for Firebase Hosting deployment.

The recommended approach uses a strict dual-SDK architecture: Firebase Client SDK for authentication on the frontend, Firebase Admin SDK exclusively in API routes for Remote Config read/write and Firestore analytics queries. This ensures service account credentials never reach the browser. The design spec (Arctic Blue theme, DM Sans typography) is fully locked and maps cleanly to Tailwind CSS custom tokens.

Key risks center around credential security (never expose Admin SDK to client), proper singleton initialization (avoid HMR crashes), and Firebase Hosting deployment configuration (private key newline parsing). All are well-documented and preventable with established patterns.

## Key Findings

### Recommended Stack

The stack is predetermined and well-suited for this project. Next.js 14 with App Router provides the perfect blend of client-side interactivity (form management, real-time UI updates) and server-side security (API routes for Admin SDK). Tailwind CSS v3 maps directly to the Arctic Blue token system.

**Core technologies:**
- Next.js 14 (App Router): Framework with SSR, API routes, and Firebase Hosting support
- Firebase JS SDK v10: Client-side auth (modular, tree-shakable)
- Firebase Admin SDK v12: Server-side Remote Config and Firestore operations
- Tailwind CSS v3: Utility-first styling with custom Arctic Blue tokens
- Recharts v2: Lightweight React-native charting for analytics
- TypeScript: Type safety across all files

### Expected Features

**Must have (table stakes):**
- Secure email/password login with session persistence
- Remote Config read/write through server-side API routes
- Feature flag toggles with batch publish
- Loading states and toast feedback on all operations
- Unsaved changes detection with discard/publish bar

**Should have (competitive):**
- Data-driven components (add providers/flags without code changes)
- Masked API key display
- Collapsible sidebar (218px / 52px)
- Per-provider publish buttons
- Live maintenance status banner

**Defer (v2+):**
- Multi-admin roles and permissions
- A/B testing / percentage rollouts
- Audit log with full history
- Real-time WebSocket sync

### Architecture Approach

Strict separation between client (Firebase Auth only) and server (Admin SDK in API routes). Dashboard pages are Client Components managing form state, calling API routes via fetch. API routes use singleton-initialized Admin SDK to interact with Remote Config and Firestore. All components are data-driven — ProviderCard, FeatureToggle, and model tabs render from arrays, not hardcoded content.

**Major components:**
1. Auth system — Login page + auth guard in dashboard layout
2. API proxy layer — 3 API routes (remote-config/get, remote-config/set, analytics)
3. Dashboard pages — 6 feature pages with shared layout (sidebar + header)
4. Reusable UI — StatCard, ProviderCard, FeatureToggle, Modal, Toast, UnsavedBar

### Critical Pitfalls

1. **Credential leakage** — Use `server-only` package, never import Admin SDK in Client Components
2. **Admin SDK re-initialization** — Singleton pattern with `getApps().length` check
3. **Edge runtime incompatibility** — Explicitly set `runtime = 'nodejs'` in API routes
4. **Unprotected API routes** — Verify auth token on every request
5. **Private key newline parsing** — Replace `\\n` with `\n` in deployment environments

## Implications for Roadmap

Based on research, suggested phase structure:

### Phase 1: Foundation (Firebase + Auth + Shell)
**Rationale:** Auth and layout must work before any feature pages. Tailwind tokens must be defined before components.
**Delivers:** Login page, auth guard, sidebar, header, 6 placeholder pages, Arctic Blue theme
**Addresses:** Auth, navigation, design system
**Avoids:** Credential leakage (server-only setup), token mismatch (define all tokens upfront)

### Phase 2: Remote Config API + Overview
**Rationale:** API routes are the backbone — all feature pages depend on them. Overview is the landing page.
**Delivers:** Firebase Admin SDK init, GET/POST API routes, overview page with stat cards and chart
**Uses:** Firebase Admin SDK v12, Recharts
**Avoids:** Re-initialization errors (singleton), Edge runtime issues (explicit nodejs runtime)

### Phase 3: API Keys + AI Models
**Rationale:** Most complex pages — ProviderCard, Modal, UnsavedBar, Toast all needed here first
**Delivers:** API Keys page with dynamic providers, AI Models page with tabs, reusable UI components
**Implements:** Data-driven component pattern, Remote Config write operations

### Phase 4: Feature Flags + Maintenance
**Rationale:** Simpler pages that reuse components from Phase 3 (toggles, publish, toast)
**Delivers:** Feature Flags page with toggles, Maintenance page with controls
**Implements:** FeatureToggle component, batch publish pattern

### Phase 5: Analytics + Deployment
**Rationale:** Analytics is independent (Firestore), deployment is the final step
**Delivers:** Analytics page with charts, Firebase Hosting deployment, live verification
**Avoids:** Private key newline issues (parse in deployment config)

### Phase Ordering Rationale

- Phase 1 first because all other phases depend on auth and layout
- Phase 2 before feature pages because all pages call the same API routes
- Phase 3 before Phase 4 because Phase 3 creates reusable components (Modal, Toast, UnsavedBar) that Phase 4 reuses
- Phase 5 last because analytics is independent and deployment validates everything

### Research Flags

Phases likely needing deeper research during planning:
- **Phase 2:** Firebase Admin SDK Remote Config API — needs exact method names and patterns
- **Phase 5:** Firebase Hosting deployment with Next.js — needs specific firebase.json config

Phases with standard patterns (skip research-phase):
- **Phase 1:** Standard Next.js setup + Firebase Auth — well-documented
- **Phase 4:** Reuses components from Phase 3 — straightforward

## Confidence Assessment

| Area | Confidence | Notes |
|------|------------|-------|
| Stack | HIGH | Predetermined, well-documented, no unknowns |
| Features | HIGH | Fully specified in docx, no ambiguity |
| Architecture | HIGH | Standard Next.js + Firebase Admin pattern |
| Pitfalls | HIGH | Well-documented in community, all preventable |

**Overall confidence:** HIGH

### Gaps to Address

- Firebase Hosting exact configuration for Next.js 14 App Router (may need `firebase-frameworks` experimental support)
- Remote Config Admin SDK exact API for reading/writing individual parameters (verify method signatures during Phase 2 planning)

## Sources

### Primary (HIGH confidence)
- Next.js 14 official documentation — App Router, Server Components, API Routes
- Firebase Admin SDK for Node.js — Remote Config, Firestore, Auth
- Tailwind CSS v3 documentation — custom theme configuration

### Secondary (MEDIUM confidence)
- Community patterns for Next.js + Firebase deployment
- Feature flag management best practices (ConfigCat, Flagsmith)

---
*Research completed: 2026-05-10*
*Ready for roadmap: yes*
