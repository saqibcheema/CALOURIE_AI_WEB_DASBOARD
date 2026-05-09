# Architecture Research

**Domain:** Firebase Admin Dashboard (Next.js 14)
**Researched:** 2026-05-10
**Confidence:** HIGH

## Standard Architecture

### System Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                      BROWSER (Client)                            │
├─────────────────────────────────────────────────────────────────┤
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐       │
│  │  Login   │  │ Overview │  │ API Keys │  │Analytics │       │
│  │  Page    │  │  Page    │  │  Page    │  │  Page    │       │
│  └────┬─────┘  └────┬─────┘  └────┬─────┘  └────┬─────┘       │
│       │              │             │              │              │
│  ┌────┴──────────────┴─────────────┴──────────────┴────────┐   │
│  │              Shared Layout (Sidebar + Header)             │   │
│  └────────────────────────────┬─────────────────────────────┘   │
│                               │                                  │
│  ┌────────────────────────────┴─────────────────────────────┐   │
│  │           Firebase Client SDK (Auth only)                 │   │
│  └───────────────────────────────────────────────────────────┘   │
├─────────────────────────────────────────────────────────────────┤
│                      SERVER (API Routes)                         │
├─────────────────────────────────────────────────────────────────┤
│  ┌──────────────────┐  ┌──────────────────┐                    │
│  │ /api/remote-     │  │ /api/analytics   │                    │
│  │ config/get|set   │  │                  │                    │
│  └────────┬─────────┘  └────────┬─────────┘                    │
│           │                      │                               │
│  ┌────────┴──────────────────────┴─────────────────────────┐   │
│  │              Firebase Admin SDK (Singleton)               │   │
│  └───────────────────────────────────────────────────────────┘   │
├─────────────────────────────────────────────────────────────────┤
│                      FIREBASE SERVICES                           │
│  ┌──────────┐  ┌──────────────┐  ┌──────────┐  ┌──────────┐   │
│  │   Auth   │  │Remote Config │  │Firestore │  │ Hosting  │   │
│  └──────────┘  └──────────────┘  └──────────┘  └──────────┘   │
└─────────────────────────────────────────────────────────────────┘
```

### Component Responsibilities

| Component | Responsibility | Typical Implementation |
|-----------|----------------|------------------------|
| Login Page | Email/password authentication | Client Component with Firebase Auth SDK `signInWithEmailAndPassword` |
| Auth Guard | Protect dashboard routes | Dashboard layout.tsx checks auth state, redirects to /login |
| Sidebar | Navigation between 6 pages | Client Component with active state tracking, collapsible mode |
| Header | Page title, action buttons | Server Component or Client depending on dynamic content |
| API Routes | Server-side Firebase Admin operations | Route handlers using Admin SDK for Remote Config read/write |
| Page Components | Feature-specific UI and state management | Client Components managing form state, calling API routes |
| Reusable UI | StatCard, ProviderCard, FeatureToggle, Modal, Toast | Props-driven components, no hardcoded data |

## Recommended Project Structure

```
calourie-dashboard/
├── app/
│   ├── layout.tsx              # Root layout — fonts, providers
│   ├── login/
│   │   └── page.tsx            # Login page — Firebase Auth
│   ├── dashboard/
│   │   ├── layout.tsx          # Auth guard + sidebar + header
│   │   ├── page.tsx            # Overview page
│   │   ├── api-keys/
│   │   │   └── page.tsx        # API Keys page
│   │   ├── ai-models/
│   │   │   └── page.tsx        # AI Models page
│   │   ├── feature-flags/
│   │   │   └── page.tsx        # Feature Flags page
│   │   ├── maintenance/
│   │   │   └── page.tsx        # Maintenance page
│   │   └── analytics/
│   │       └── page.tsx        # Analytics page
│   └── api/
│       ├── remote-config/
│       │   ├── get/route.ts    # GET Remote Config values
│       │   └── set/route.ts    # POST update Remote Config
│       └── analytics/
│           └── route.ts        # GET Firestore analytics
├── components/
│   ├── layout/
│   │   ├── Sidebar.tsx
│   │   └── Header.tsx
│   ├── ui/
│   │   ├── StatCard.tsx
│   │   ├── ProviderCard.tsx
│   │   ├── FeatureToggle.tsx
│   │   ├── Modal.tsx
│   │   ├── Toast.tsx
│   │   └── UnsavedBar.tsx
│   └── charts/
│       ├── SparklineChart.tsx
│       └── BarChart.tsx
├── lib/
│   ├── firebase-client.ts      # Client SDK init (auth)
│   ├── firebase-admin.ts       # Admin SDK init (server-only)
│   └── auth.ts                 # useAuth hook, auth utilities
├── types/
│   └── index.ts                # RemoteConfigKey, Provider, Flag types
├── tailwind.config.ts          # Arctic Blue tokens
├── firebase.json               # Hosting config
├── .firebaserc                 # Project alias
└── .env.local                  # Firebase config (public + server keys)
```

### Structure Rationale

- **app/**: Next.js 14 App Router file-based routing. Dashboard pages nested under dashboard/ share the auth-guarded layout.
- **components/**: Separated by concern (layout, ui, charts). All reusable, data-driven, no hardcoded values.
- **lib/**: Firebase SDK initialization isolated. `firebase-admin.ts` uses `server-only` package to prevent client bundling.
- **types/**: Centralized TypeScript interfaces for consistency across components and API routes.

## Architectural Patterns

### Pattern 1: Dual SDK Singleton Initialization

**What:** Separate Firebase Client SDK and Admin SDK initialization with singleton pattern.
**When to use:** Always — prevents "app already exists" errors during HMR.
**Trade-offs:** Slightly more setup, but prevents runtime crashes.

**Example:**
```typescript
// lib/firebase-admin.ts
import 'server-only';
import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getRemoteConfig } from 'firebase-admin/remote-config';

const app = getApps().length === 0
  ? initializeApp({ credential: cert({...}) })
  : getApps()[0];

export const remoteConfig = getRemoteConfig(app);
```

### Pattern 2: API Route Proxy for Admin Operations

**What:** Client components call Next.js API routes, which use Admin SDK server-side.
**When to use:** Any operation requiring Firebase Admin privileges.
**Trade-offs:** Extra network hop, but credentials never reach the browser.

### Pattern 3: Data-Driven Component Pattern

**What:** Components render from arrays/objects passed as props, not hardcoded content.
**When to use:** API Keys (ProviderCard), Feature Flags (FeatureToggle), AI Models (tabs).
**Trade-offs:** Slightly more complex props, but infinitely extensible.

## Data Flow

### Config Read Flow

```
[Dashboard Page Load]
    ↓
[Client Component] → fetch('/api/remote-config/get')
    ↓
[API Route] → Firebase Admin SDK → Remote Config
    ↓
[JSON Response] → [Client State] → [UI Render]
```

### Config Write Flow

```
[User Edits Form]
    ↓
[Client State Updated] → [UnsavedBar appears]
    ↓
[User clicks "Publish Now"]
    ↓
[Client] → fetch('/api/remote-config/set', { updates })
    ↓
[API Route] → Firebase Admin SDK → Remote Config → [Template Version]
    ↓
[Success Response] → [Toast shown] → [UnsavedBar hidden]
```

### Auth Flow

```
[Login Page] → Firebase Auth signInWithEmailAndPassword
    ↓
[Auth State Change] → onAuthStateChanged listener
    ↓
[Redirect to /dashboard]
    ↓
[Dashboard Layout] → checks auth → render or redirect to /login
```

## Anti-Patterns

### Anti-Pattern 1: Admin SDK on Client Side

**What people do:** Import firebase-admin in a Client Component
**Why it's wrong:** Exposes service account credentials, grants full admin access
**Do this instead:** Use API routes as proxy, import `server-only` in admin init file

### Anti-Pattern 2: Hardcoded Config Keys in Components

**What people do:** Create separate components for Gemini and Groq with hardcoded keys
**Why it's wrong:** Adding a new provider requires code changes across multiple files
**Do this instead:** Data-driven ProviderCard that renders any provider from a list

### Anti-Pattern 3: Unguarded API Routes

**What people do:** Skip auth verification in API routes
**Why it's wrong:** Anyone with the URL can read/write Remote Config
**Do this instead:** Verify Firebase ID token or session cookie in every API route

## Integration Points

### External Services

| Service | Integration Pattern | Notes |
|---------|---------------------|-------|
| Firebase Auth | Client SDK — signInWithEmailAndPassword | Single admin, email/password only |
| Firebase Remote Config | Admin SDK via API routes | Read all values, update specific keys |
| Cloud Firestore | Admin SDK via analytics API route | Read app_analytics collection (last 7 days) |
| Firebase Hosting | firebase deploy | Static + SSR deployment |

### Internal Boundaries

| Boundary | Communication | Notes |
|----------|---------------|-------|
| Client ↔ API Routes | HTTP fetch (JSON) | Auth token sent in headers or cookies |
| API Routes ↔ Firebase | Admin SDK (direct) | Service account credentials from env vars |
| Dashboard Layout ↔ Pages | React props/context | Auth state shared via layout |

## Sources

- Next.js 14 App Router documentation
- Firebase Admin SDK for Node.js documentation
- Community patterns for Next.js + Firebase architecture

---
*Architecture research for: Firebase Admin Dashboard*
*Researched: 2026-05-10*
