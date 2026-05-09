# Calourie AI Admin Dashboard

## What This Is

A private, password-protected web dashboard that connects to Firebase and lets you control the Calourie AI Android app from a browser — no code changes, no Play Store update required. Built with Next.js 14 (App Router), TypeScript, Tailwind CSS, and Firebase (Auth, Remote Config, Firestore, Hosting). Designed as a semester project and portfolio piece for Muhammad Saqib Ali (BS CS, 6th Semester, University of Chenab).

## Core Value

Server-side control of all app configuration (API keys, AI models, feature flags, maintenance mode) without Play Store updates — the dashboard must reliably read and write Firebase Remote Config values and reflect changes in the Android app instantly.

## Requirements

### Validated

<!-- Shipped and confirmed valuable. -->

(None yet — ship to validate)

### Active

<!-- Current scope. Building toward these. -->

- [ ] Single admin login via Firebase Auth (email/password)
- [ ] Auth guard on all dashboard routes — redirect to /login if unauthenticated
- [ ] Sidebar navigation with 6 pages (Overview, API Keys, AI Models, Feature Flags, Maintenance, Analytics)
- [ ] Collapsible sidebar (218px full / 52px compact icons-only)
- [ ] Sticky header with page title and action buttons
- [ ] Overview page with 4 stat cards, sparkline chart, feature breakdown bars, config changes table
- [ ] API Keys page — dynamic provider list, add/delete/edit providers, masked key input, publish per-provider to Remote Config
- [ ] AI Models page — tabs per provider, model string + temperature + token limit, add/delete tabs, publish to Remote Config
- [ ] Feature Flags page — toggle list, add/delete flags, batch publish to Remote Config
- [ ] Maintenance page — maintenance toggle + message, force update version + message, live status banner
- [ ] Analytics page — 4 stat cards, bar chart (last 7 days), version distribution table from Firestore
- [ ] GET /api/remote-config/get — return all Remote Config values as JSON (server-side Firebase Admin SDK)
- [ ] POST /api/remote-config/set — update Remote Config keys with auth check (server-side)
- [ ] GET /api/analytics — return last 7 days aggregated data from Firestore app_analytics
- [ ] Toast notifications for publish confirmations and errors (auto-dismiss 2.5s)
- [ ] Unsaved changes bar with Discard and Publish Now buttons
- [ ] Modal component for confirmations and forms
- [ ] Loading states on all async operations
- [ ] Arctic Blue theme with all defined color tokens
- [ ] DM Sans typography for UI, IBM Plex Mono for API keys/config values
- [ ] Deploy to Firebase Hosting

### Out of Scope

<!-- Explicit boundaries. Includes reasoning to prevent re-adding. -->

- RemoteConfigRepository.kt or any Android/Kotlin code — this is dashboard-only, Android integration is Phase 2
- Cloud Functions — dashboard uses Admin SDK directly from API routes
- Mobile-specific authentication flows — single admin account only
- Push notifications — not needed for admin dashboard
- User management beyond single admin — not required for v1
- Mobile-responsive design — desktop only is acceptable per spec

## Context

- **Android App**: Calourie AI — Kotlin/Jetpack Compose, Hilt DI, Clean Architecture, MVVM. Already deployed.
- **Firebase Project**: Shared with Android app (calourie-ai). Same google-services.json, Remote Config keys, and Firestore database.
- **Remote Config Keys**: 14 predefined keys covering API keys (gemini_api_key, groq_api_key), AI model config (gemini_model_name, groq_model_name, groq_temperature, groq_max_tokens), feature flags (4 boolean flags), and app control (maintenance_mode, maintenance_message, minimum_app_version, force_update_message).
- **Firestore Collections**: admin_config (dashboard state), app_events (app writes, admin reads), app_analytics (aggregated daily stats).
- **Security Model**: Firestore rules restrict admin_config read/write and app_analytics read to a single admin UID. app_events allow create from anyone (the app) but read only by admin.
- **Developer**: Muhammad Saqib Ali, BS CS 6th Semester, University of Chenab. GitHub: saqibcheema. LinkedIn: saqib-cheema.
- **Purpose**: Semester project + portfolio piece. Must look professional enough to present in class and show to freelance clients.

## Constraints

- **Tech Stack**: Next.js 14 (App Router) + TypeScript + Tailwind CSS v3 + Firebase JS SDK v10 + Firebase Admin SDK v12 + Recharts v2 — finalized, do not deviate
- **Design**: Arctic Blue theme, DM Sans + IBM Plex Mono fonts, 218px/52px sidebar, 10px/7px border radius — finalized, do not deviate
- **Firebase**: Must use existing calourie-ai project, region asia-south1 for Firestore
- **Budget**: Firebase free tier only (10K auth/month, 50K Firestore reads/day, 10GB hosting transfer/month)
- **Quality**: No layout shifts, no unstyled flash, visible focus states, immediate UI feedback on actions, toast confirmations, loading states everywhere
- **Incremental Build**: Each phase must produce a working, testable build before proceeding to the next

## Key Decisions

<!-- Decisions that constrain future work. Add throughout project lifecycle. -->

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| Next.js 14 App Router | Modern React framework with built-in API routes, SSR, and Firebase Hosting support | — Pending |
| Tailwind CSS v3 for styling | Utility-first CSS aligns with Arctic Blue token system, fast development | — Pending |
| Firebase Admin SDK in API routes | Keeps service account credentials server-side, never exposes to browser | — Pending |
| Single admin auth (no role system) | Only one admin needed, simplifies security model | — Pending |
| Data-driven components (not hardcoded) | ProviderCard, FeatureToggle, Model tabs all render from arrays — adding new config = add to form + Remote Config console only | — Pending |
| Desktop-only (no mobile responsive) | Admin dashboard used on desktop browser only | — Pending |
| Recharts for analytics | Lightweight charting library, good Next.js compatibility | — Pending |

## Evolution

This document evolves at phase transitions and milestone boundaries.

**After each phase transition** (via `/gsd-transition`):
1. Requirements invalidated? → Move to Out of Scope with reason
2. Requirements validated? → Move to Validated with phase reference
3. New requirements emerged? → Add to Active
4. Decisions to log? → Add to Key Decisions
5. "What This Is" still accurate? → Update if drifted

**After each milestone** (via `/gsd-complete-milestone`):
1. Full review of all sections
2. Core Value check — still the right priority?
3. Audit Out of Scope — reasons still valid?
4. Update Context with current state

---
*Last updated: 2026-05-10 after initialization*
