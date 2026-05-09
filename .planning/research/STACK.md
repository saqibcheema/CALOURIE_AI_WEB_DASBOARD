# Stack Research

**Domain:** Firebase Admin Dashboard (Next.js)
**Researched:** 2026-05-10
**Confidence:** HIGH

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

```bash
# Core
npx create-next-app@14 ./ --typescript --tailwind --eslint --app --src-dir --import-alias "@/*"

# Firebase
npm install firebase firebase-admin

# UI
npm install recharts @tabler/icons-react

# Security
npm install server-only

# Dev dependencies
npm install -D @types/node @types/react
```

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

---
*Stack research for: Firebase Admin Dashboard*
*Researched: 2026-05-10*
