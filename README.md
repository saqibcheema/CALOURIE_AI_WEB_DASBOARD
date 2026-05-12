# Calourie AI Admin Dashboard

[![Live Demo](https://img.shields.io/badge/Live-Demo-brightgreen?logo=vercel)](https://calourie-ai-web-dasboard.vercel.app/)
[![Next.js](https://img.shields.io/badge/Next.js-14-black?logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.4-cyan?logo=tailwindcss)](https://tailwindcss.com/)
[![Firebase](https://img.shields.io/badge/Firebase-Admin_SDK-orange?logo=firebase)](https://firebase.google.com/)

> A production-ready admin dashboard for managing the **Calourie AI** mobile application — built with **Next.js 14**, **TypeScript**, **Tailwind CSS**, and **Firebase**.

---

## Live Demo

**URL:** https://calourie-ai-web-dasboard.vercel.app/

A fully functional demo deployed on Vercel with real-time Firebase integration.

---

## Overview

The **Calourie AI Admin Dashboard** is a centralized web interface for managing all backend configurations and monitoring analytics for the Calourie AI mobile app. It provides real-time control over API keys, AI model parameters, feature flags, maintenance mode, and app usage analytics — all powered by **Firebase Remote Config**, **Firestore**, and **Firebase Authentication**.

### Key Highlights

- **Zero-backend operations** — no dedicated server needed; Firebase handles all data
- **Real-time config publishing** — batch changes and publish to Firebase Remote Config in one click
- **Usage analytics** — track meals logged, AI vision uses, barcode scans, and active devices over time
- **Cross-page auto-sync** — adding/removing a provider in API Keys automatically reflects in AI Models (and vice versa)
- **Fully responsive** — works seamlessly on desktop, tablet, and mobile devices
- **Secure authentication** — Firebase Auth with email/password login and password change capability

---

## Features

### 1. Overview Dashboard

![Overview Dashboard](docs/screenshots/02-overview.png)

- 4 stat cards with real data: **Meals Logged**, **AI Vision Uses**, **Barcode Scans**, **Unique Devices**
- 7-day sparkline chart showing meal log trends
- Week-over-week percentage change indicators (up/down arrows)
- Recent config changes history table with old vs new values

### 2. API Keys Management

![API Keys Management](docs/screenshots/04-api-keys.png)

- Add, edit, and delete LLM provider API keys
- Key masking with show/hide toggle for security
- Automatic cross-sync with AI Models page
- Visual badges for "Model set" and "No model config" warnings

### 3. AI Models Configuration

![AI Models Configuration](docs/screenshots/05-ai-models.png)

- Tabbed interface per provider (e.g., OpenAI, Gemini, Anthropic)
- Adjustable model parameters:
  - **Model Name** — e.g. `gpt-4o`, `gemini-1.5-pro`
  - **Temperature** — 0.0 (deterministic) to 2.0 (creative) with slider
  - **Max Tokens** — 1 to 128,000
- Auto-creates API key slot when adding a new provider
- Warning banners when API key is missing

### 4. Feature Flags

![Feature Flags](docs/screenshots/06-feature-flags.png)

- Toggle 4 core features on/off with animated switches:
  - AI Vision (camera-based food recognition)
  - Barcode Scanning
  - Meal Logging
  - Chat History
- Optional "disable until" datetime for scheduled rollouts
- Status badges (ON/OFF) with color coding
- Changes are batched and published via the bottom bar

### 5. Maintenance Mode

![Maintenance Mode](docs/screenshots/07-maintenance.png)

- Toggle maintenance mode ON/OFF with a large switch
- Custom maintenance message textarea for user-facing text
- Force update controls:
  - Minimum app version enforcement
  - Custom force-update message
- Real-time banner across all pages when maintenance is active

### 6. Analytics

![Analytics](docs/screenshots/03-analytics.png)

- 4 stat cards with real Firestore data
- Interactive 7-day bar chart with metric tabs:
  - Meals Logged
  - AI Vision Uses
  - Barcode Scans
  - Unique Devices
- Responsive chart powered by Recharts

### 7. User Profile

![User Profile](docs/screenshots/08-profile-modal.png)

- Circular avatar in sidebar with email display
- **Password change** with current password re-authentication
- Secure Firebase Auth `updatePassword()` integration
- Show/hide password fields for convenience

### 8. Responsive Layout
- Collapsible sidebar (218px expanded / 64px collapsed) on desktop
- Mobile overlay sidebar with dark backdrop
- All pages adapt fluidly from 320px to ultra-wide screens

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | [Next.js 14](https://nextjs.org/) (App Router) |
| Language | [TypeScript 5](https://www.typescriptlang.org/) |
| Styling | [Tailwind CSS 3.4](https://tailwindcss.com/) |
| UI Icons | [Tabler Icons](https://tabler-icons.io/) |
| Charts | [Recharts](https://recharts.org/) |
| Auth | [Firebase Auth](https://firebase.google.com/docs/auth) |
| Backend | [Firebase Admin SDK](https://firebase.google.com/docs/admin/setup) |
| Remote Config | [Firebase Remote Config](https://firebase.google.com/docs/remote-config) |
| Database | [Cloud Firestore](https://firebase.google.com/docs/firestore) |
| Notifications | [Sonner](https://sonner.emilkowal.ski/) (toast) |
| Hosting | [Vercel](https://vercel.com/) |

---

## Architecture

```mermaid
graph TB
    subgraph "Frontend (Next.js 14)"
        UI[Dashboard Pages]
        COMP[React Components]
        CTX[UnsavedChanges Context]
        AUTH[Auth Context]
    end

    subgraph "API Routes (Next.js)"
        API_RC_GET[/api/remote-config/get\nGET current config]
        API_RC_SET[/api/remote-config/set\nPOST publish config]
        API_ANA[/api/analytics\nGET 7-day trends]
    end

    subgraph "Firebase Services"
        FB_AUTH[Firebase Auth]
        FB_RC[Remote Config Admin]
        FB_FS[Firestore Admin]
    end

    UI --> COMP
    COMP --> CTX
    COMP --> AUTH
    COMP --> API_RC_GET
    COMP --> API_RC_SET
    COMP --> API_ANA
    API_RC_GET --> FB_RC
    API_RC_SET --> FB_RC
    API_ANA --> FB_FS
    AUTH --> FB_AUTH
```

### Data Flow
1. Dashboard fetches current config from `/api/remote-config/get`
2. User makes changes → staged in `UnsavedChangesContext`
3. Click **"Publish Now"** → `/api/remote-config/set` pushes to Firebase
4. Config change history saved to `localStorage` with old/new values
5. Analytics data fetched from Firestore via `/api/analytics`

---

## Screenshots

All dashboard interfaces are documented inline in the [Features](#features) section above. The screenshots are stored in the `docs/screenshots/` directory for reference.

---

## Environment Variables

Create a `.env.local` file in the project root:

```env
# Firebase Client Config (public)
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789
NEXT_PUBLIC_FIREBASE_APP_ID=1:xxx:web:xxx

# Firebase Admin Config (server-side only)
FIREBASE_ADMIN_PROJECT_ID=your_project_id
FIREBASE_ADMIN_CLIENT_EMAIL=firebase-adminsdk-xxxxx@your_project.iam.gserviceaccount.com
FIREBASE_ADMIN_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYOUR_KEY_HERE\n-----END PRIVATE KEY-----\n"
```

> **Security Note:** Never commit `.env.local` to Git. It is already in `.gitignore`.

---

## Local Setup

### Prerequisites
- [Node.js 18+](https://nodejs.org/)
- A Firebase project with **Authentication**, **Remote Config**, and **Firestore** enabled

### 1. Clone the repository

```bash
git clone https://github.com/saqibcheema/CALOURIE_AI_WEB_DASBOARD.git
cd CALOURIE_AI_WEB_DASBOARD
```

### 2. Install dependencies

```bash
npm install
```

### 3. Configure environment variables

Copy the `.env.local` template above and fill in your Firebase credentials.

### 4. Run the development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### 5. Build for production

```bash
npm run build
```

---

## API Routes

| Route | Method | Auth | Description |
|-------|--------|------|-------------|
| `/api/remote-config/get` | `GET` | Bearer token | Returns current Firebase Remote Config template |
| `/api/remote-config/set` | `POST` | Bearer token | Publishes updated parameters to Remote Config |
| `/api/analytics` | `GET` | Bearer token | Returns 7-day analytics trend from Firestore |

### Analytics Response Shape

```json
{
  "today": {
    "date": "2024-01-15",
    "day": "Mon",
    "meals_logged": 1247,
    "vision_uses": 892,
    "barcode_scans": 445,
    "unique_devices": 620
  },
  "trend": [
    { "date": "2024-01-08", "day": "Mon", "meals_logged": 1100, ... },
    ...
  ]
}
```

---

## Firebase Remote Config Keys

| Key | Type | Purpose |
|-----|------|---------|
| `api_keys_config` | JSON | Provider → API key mapping |
| `ai_models_config` | JSON | Provider → {model, temperature, max_tokens} |
| `feature_flags_config` | JSON | Feature → {enabled, disabled_until?} |
| `maintenance_mode` | string (`"true"` / `"false"`) | Global app maintenance toggle |
| `maintenance_message` | string | Message shown during maintenance |
| `minimum_app_version` | string | Semver minimum required for app usage |
| `force_update_message` | string | Message shown on force-update screen |

---

## Deployment

This project is configured for **Vercel** deployment.

### One-Click Deploy

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/saqibcheema/CALOURIE_AI_WEB_DASBOARD)

### Manual Deploy

1. Push your code to a GitHub repository
2. Import the repo on [Vercel Dashboard](https://vercel.com/dashboard)
3. Add **all** environment variables from `.env.local` to Vercel project settings
4. Deploy — Vercel will automatically build and host your app

> **Important:** On first deploy, the build will fail if Firebase environment variables are missing. Make sure all `NEXT_PUBLIC_*` and `FIREBASE_ADMIN_*` variables are set in Vercel.

---

## Project Structure

```
CALOURIE_AI_WEB_DASBOARD/
├── app/
│   ├── api/
│   │   ├── analytics/route.ts          # GET 7-day trends
│   │   └── remote-config/
│   │       ├── get/route.ts            # GET current config
│   │       └── set/route.ts            # POST publish config
│   ├── dashboard/
│   │   ├── page.tsx                    # Overview (stats + sparkline)
│   │   ├── analytics/page.tsx          # Analytics (bar chart)
│   │   ├── api-keys/page.tsx           # API Keys management
│   │   ├── ai-models/page.tsx          # AI Models configuration
│   │   ├── feature-flags/page.tsx      # Feature toggle switches
│   │   ├── maintenance/page.tsx        # Maintenance mode controls
│   │   └── layout.tsx                  # Dashboard layout wrapper
│   ├── login/page.tsx                  # Authentication page
│   └── layout.tsx                      # Root layout
├── components/
│   ├── ConfigChangesTable.tsx          # Recent changes history
│   ├── ProfileModal.tsx                # Profile + password change
│   ├── SparklineChart.tsx              # Mini area chart
│   ├── StatCard.tsx                    # Metric stat card
│   └── UnsavedBar.tsx                # Bottom publish bar
├── contexts/
│   └── UnsavedChangesContext.tsx       # Pending changes + history
├── lib/
│   ├── auth.tsx                        # Auth context (Firebase)
│   ├── firebase-admin.ts               # Admin SDK init
│   ├── firebase-client.ts              # Client SDK init
│   ├── useAuthFetch.ts                 # Authenticated fetch hook
│   └── useProviderConfigs.ts          # API keys + models data hook
├── presentation/components/layout/
│   ├── DashboardLayout.tsx             # Sidebar + Header + Banner
│   ├── Header.tsx                      # Top navigation bar
│   └── Sidebar.tsx                     # Side navigation + profile
├── docs/screenshots/                   # Add screenshots here
└── README.md                           # This file
```

---

## License

This project was built for educational and demonstration purposes.

---

## Acknowledgments

- [Next.js](https://nextjs.org/) — React framework
- [Firebase](https://firebase.google.com/) — Backend-as-a-Service
- [Tailwind CSS](https://tailwindcss.com/) — Utility-first CSS
- [Recharts](https://recharts.org/) — Charting library
- [Tabler Icons](https://tabler-icons.io/) — Open source icon set
