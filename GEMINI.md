<!-- GSD:project-start source:PROJECT.md -->
## Project

**Calourie AI Admin Dashboard**

A private, password-protected web dashboard that connects to Firebase and lets you control the Calourie AI Android app from a browser — no code changes, no Play Store update required. Built with Next.js 14 (App Router), TypeScript, Tailwind CSS, and Firebase (Auth, Remote Config, Firestore, Hosting). Designed as a semester project and portfolio piece for Muhammad Saqib Ali (BS CS, 6th Semester, University of Chenab).

**Core Value:** Server-side control of all app configuration (API keys, AI models, feature flags, maintenance mode) without Play Store updates — the dashboard must reliably read and write Firebase Remote Config values and reflect changes in the Android app instantly.

### Constraints

- **Tech Stack**: Next.js 14 (App Router) + TypeScript + Tailwind CSS v3 + Firebase JS SDK v10 + Firebase Admin SDK v12 + Recharts v2 — finalized, do not deviate
- **Design**: Arctic Blue theme, DM Sans + IBM Plex Mono fonts, 218px/52px sidebar, 10px/7px border radius — finalized, do not deviate
- **Firebase**: Must use existing calourie-ai project, region asia-south1 for Firestore
- **Budget**: Firebase free tier only (10K auth/month, 50K Firestore reads/day, 10GB hosting transfer/month)
- **Quality**: No layout shifts, no unstyled flash, visible focus states, immediate UI feedback on actions, toast confirmations, loading states everywhere
- **Incremental Build**: Each phase must produce a working, testable build before proceeding to the next
<!-- GSD:project-end -->

<!-- GSD:stack-start source:research/STACK.md -->
## Technology Stack

## Recommended Stack
### Core Technologies
| Technology | Version | Purpose | Why Recommended |
|------------|---------|---------|-----------------|
| Next.js | 14 (App Router) | Framework — routing, server components, API routes | Modern React framework with built-in SSR, API routes for Firebase Admin SDK, and excellent Firebase Hosting support. App Router provides Server Components for secure server-side data fetching |
| TypeScript | 5.x (Latest) | Type safety across all files | Catches type errors at build time, essential for config key management and API contracts |
| Tailwind CSS | v3.4 | Utility-first styling | Perfect for implementing the Arctic Blue token system in tailwind.config.ts, fast iteration on UI |
| Firebase JS SDK | v10.x | Client-side Auth, Remote Config read | Modular tree-shakable imports, used for authentication flow on client side |
| Firebase Admin SDK | v12.x | Server-side Remote Config write (API routes only) | Full privileged access to Firebase services, runs exclusively in Node.js API routes |
| Recharts | v2.x | Analytics charts (sparkline, bar chart) | Lightweight, React-native charting library with good Next.js compatibility |
### Supporting Libraries
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| @tabler/icons-react | Latest | Icon library | For sidebar nav icons, stat card icons, action buttons |
| next/font | Built-in | Font optimization | Loading DM Sans and IBM Plex Mono with zero layout shift |
| server-only | Latest | Build-time guard | Import in firebase-admin.ts to prevent accidental client-side bundling |
| js-cookie | Latest | Cookie management | Session cookie handling for auth state persistence |
### Development Tools
| Tool | Purpose | Notes |
|------|---------|-------|
| ESLint | Code linting | Use next/core-web-vitals config for Next.js best practices |
| Firebase CLI | Deployment | firebase deploy for hosting, firebase emulators for local development |
## Installation
# Core
# Firebase
# UI
# Security
# Dev dependencies
## Alternatives Considered
| Recommended | Alternative | When to Use Alternative |
|-------------|-------------|-------------------------|
| Tailwind CSS v3 | CSS Modules | If team prefers scoped CSS without utility classes |
| Recharts | Chart.js | If needing more chart types or canvas-based rendering |
| @tabler/icons-react | lucide-react | If bundle size is critical — lucide is slightly smaller |
| Next.js 14 | Vite + React | If SSR is not needed — but we need API routes for Admin SDK |
## What NOT to Use
| Avoid | Why | Use Instead |
|-------|-----|-------------|
| Firebase Admin SDK on client | Exposes service account credentials, grants full admin access | Firebase JS SDK for client, Admin SDK only in API routes |
| Pages Router | Legacy pattern, App Router is the future | App Router with Server Components |
| next export (static) | Cannot use API routes needed for Admin SDK operations | Standard Next.js build with Node.js runtime |
| Edge Runtime for API routes | Firebase Admin SDK requires Node.js modules (fs, net, tls) | Explicitly set `runtime = 'nodejs'` in route handlers |
## Version Compatibility
| Package A | Compatible With | Notes |
|-----------|-----------------|-------|
| Next.js 14 | React 18.x | App Router requires React 18+ |
| firebase@10.x | firebase-admin@12.x | Different SDKs, no direct dependency |
| Tailwind CSS v3.4 | Next.js 14 | Fully supported via create-next-app |
| Recharts v2.x | React 18.x | Fully compatible |
## Sources
- Next.js 14 official docs — App Router, API routes, Server Components
- Firebase Admin SDK Node.js docs — Remote Config management
- Community best practices for dual SDK architecture
<!-- GSD:stack-end -->

<!-- GSD:conventions-start source:CONVENTIONS.md -->
## Conventions

Conventions not yet established. Will populate as patterns emerge during development.
<!-- GSD:conventions-end -->

<!-- GSD:architecture-start source:ARCHITECTURE.md -->
## Architecture

Architecture not yet mapped. Follow existing patterns found in the codebase.
<!-- GSD:architecture-end -->

<!-- GSD:skills-start source:skills/ -->
## Project Skills

No project skills found. Add skills to any of: `.agent/skills/`, `.agents/skills/`, `.cursor/skills/`, or `.github/skills/` with a `SKILL.md` index file.
<!-- GSD:skills-end -->

<!-- GSD:workflow-start source:GSD defaults -->
## GSD Workflow Enforcement

Before using Edit, Write, or other file-changing tools, start work through a GSD command so planning artifacts and execution context stay in sync.

Use these entry points:
- `/gsd-quick` for small fixes, doc updates, and ad-hoc tasks
- `/gsd-debug` for investigation and bug fixing
- `/gsd-execute-phase` for planned phase work

Do not make direct repo edits outside a GSD workflow unless the user explicitly asks to bypass it.
<!-- GSD:workflow-end -->



<!-- GSD:profile-start -->
## Developer Profile

> Profile not yet configured. Run `/gsd-profile-user` to generate your developer profile.
> This section is managed by `generate-claude-profile` -- do not edit manually.
<!-- GSD:profile-end -->
