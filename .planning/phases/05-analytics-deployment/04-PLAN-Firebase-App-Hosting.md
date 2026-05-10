---
wave: 3
depends_on:
  - 01-PLAN-Firestore-Admin-API
  - 02-PLAN-Analytics-Page
  - 03-PLAN-Overview-Page-Update
files_modified:
  - apphosting.yaml
autonomous: true
requirements:
  - DEPLOY-01
  - DEPLOY-02
  - DEPLOY-03
---

# Plan 04 — Firebase App Hosting Deployment Config

## Goal

Create `apphosting.yaml` at the project root declaring all required environment variables for Firebase App Hosting (Cloud Run-backed Next.js deployment). This enables `firebase deploy` to succeed and all 6 pages to work on the live URL.

---

## Tasks

### Task 4.1 — Create `apphosting.yaml`

<read_first>
- `lib/firebase-admin.ts` — lists all server-side env vars used: `NEXT_PUBLIC_FIREBASE_PROJECT_ID`, `FIREBASE_CLIENT_EMAIL`, `FIREBASE_PRIVATE_KEY`
- `lib/firebase-client.ts` — lists all client-side env vars: `NEXT_PUBLIC_FIREBASE_PROJECT_ID`, `NEXT_PUBLIC_FIREBASE_APP_ID`, `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET`, `NEXT_PUBLIC_FIREBASE_API_KEY`, `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN`, `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID`
- `.planning/phases/05-analytics-deployment/05-CONTEXT.md` — D-17 through D-22 for deployment decisions
- `.planning/phases/05-analytics-deployment/05-RESEARCH.md` — Section 6 for apphosting.yaml schema and env var availability rules
</read_first>

<action>
Create `apphosting.yaml` at the project root with this exact content:

```yaml
runConfig:
  concurrency: 80
  cpu: 1
  memoryMiB: 512
  minInstances: 0

env:
  # ── Client-side public vars ─────────────────────────────────────────────────
  # Must have BUILD availability so Next.js bakes NEXT_PUBLIC_* into the bundle.
  - variable: NEXT_PUBLIC_FIREBASE_PROJECT_ID
    availability:
      - BUILD
      - RUNTIME

  - variable: NEXT_PUBLIC_FIREBASE_API_KEY
    availability:
      - BUILD
      - RUNTIME

  - variable: NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN
    availability:
      - BUILD
      - RUNTIME

  - variable: NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET
    availability:
      - BUILD
      - RUNTIME

  - variable: NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID
    availability:
      - BUILD
      - RUNTIME

  - variable: NEXT_PUBLIC_FIREBASE_APP_ID
    availability:
      - BUILD
      - RUNTIME

  # ── Server-only secrets ─────────────────────────────────────────────────────
  # Stored in Firebase Secret Manager. Values set via Firebase Console or CLI:
  #   firebase apphosting:secrets:set firebase-client-email
  #   firebase apphosting:secrets:set firebase-private-key
  - variable: FIREBASE_CLIENT_EMAIL
    secret: firebase-client-email
    availability:
      - RUNTIME

  - variable: FIREBASE_PRIVATE_KEY
    secret: firebase-private-key
    availability:
      - RUNTIME
```
</action>

<acceptance_criteria>
- `apphosting.yaml` exists at the project root (not inside any subdirectory)
- File contains `runConfig:` section
- File contains all 6 `NEXT_PUBLIC_*` variable declarations
- Each `NEXT_PUBLIC_*` variable has `BUILD` in its availability list
- File contains `FIREBASE_CLIENT_EMAIL` with `secret: firebase-client-email`
- File contains `FIREBASE_PRIVATE_KEY` with `secret: firebase-private-key`
- Both secret vars have `RUNTIME` availability only (not BUILD)
- `npm run build` exits 0 (yaml file doesn't affect build)
</acceptance_criteria>

---

### Task 4.2 — Pre-deployment checklist (manual steps documentation)

<read_first>
- `apphosting.yaml` — just created above
- `.planning/phases/05-analytics-deployment/05-RESEARCH.md` — Section 6.3 for Secret Manager setup commands
</read_first>

<action>
Create a `DEPLOY-CHECKLIST.md` file in the phase directory (`.planning/phases/05-analytics-deployment/DEPLOY-CHECKLIST.md`) documenting the manual steps required before the first deploy succeeds:

```markdown
# Firebase App Hosting — Pre-Deploy Checklist

Complete these steps IN ORDER before pushing to GitHub.

## Step 1: Upgrade Firebase Project to Blaze Plan
- Go to: Firebase Console → your project → Spark plan → Upgrade
- Required for App Hosting (Cloud Run)

## Step 2: Create Firebase App Hosting Backend
In Firebase Console → App Hosting → Get Started:
1. Connect your GitHub repository
2. Set root directory to `/` (project root)
3. Set branch to `main`
4. Backend ID: `calourie-dashboard` (or any name)

## Step 3: Set NEXT_PUBLIC_* Environment Variables
In Firebase Console → App Hosting → your backend → Environment Variables:
Set values for all 6 NEXT_PUBLIC_* vars from your `.env.local` file.

## Step 4: Create Firebase Secrets
Run these commands from the project root (requires Firebase CLI + login):
```bash
firebase apphosting:secrets:set firebase-client-email
# Paste your FIREBASE_CLIENT_EMAIL value when prompted

firebase apphosting:secrets:set firebase-private-key
# Paste your FIREBASE_PRIVATE_KEY value when prompted (include the full PEM block)
```

## Step 5: Grant Secret Manager Access
Firebase Console → App Hosting → your backend → Service Account → copy the email
Then:
```bash
gcloud secrets add-iam-policy-binding firebase-client-email \
  --member="serviceAccount:YOUR_SERVICE_ACCOUNT_EMAIL" \
  --role="roles/secretmanager.secretAccessor"

gcloud secrets add-iam-policy-binding firebase-private-key \
  --member="serviceAccount:YOUR_SERVICE_ACCOUNT_EMAIL" \
  --role="roles/secretmanager.secretAccessor"
```
(Or grant via Firebase Console → Secret Manager → each secret → Permissions)

## Step 6: Push to GitHub
```bash
git push origin main
```
Firebase App Hosting auto-triggers a build. Monitor in Firebase Console → App Hosting → Builds.

## Step 7: Verify Deployment
After build succeeds (green checkmark):
1. Open the live URL (shown in Firebase Console)
2. Log in with admin credentials
3. Visit all 6 pages:
   - /dashboard
   - /dashboard/analytics
   - /dashboard/api-keys
   - /dashboard/ai-models
   - /dashboard/feature-flags
   - /dashboard/maintenance
4. On any config page, change a value and click "Publish Now"
5. Verify in Firebase Console → Remote Config that the value updated (DEPLOY-03)
```
</action>

<acceptance_criteria>
- `.planning/phases/05-analytics-deployment/DEPLOY-CHECKLIST.md` exists
- File contains "Step 1" through "Step 7"
- File contains `firebase apphosting:secrets:set firebase-client-email`
- File contains `firebase apphosting:secrets:set firebase-private-key`
- File lists all 6 dashboard page paths for verification
</acceptance_criteria>

---

## Verification

```
must_haves:
  - apphosting.yaml exists at project root
  - All 8 env vars declared (6 NEXT_PUBLIC_* + 2 secrets)
  - NEXT_PUBLIC_* vars have BUILD availability
  - Secret vars reference Firebase Secret Manager keys
  - DEPLOY-CHECKLIST.md documents all manual pre-deploy steps
  - Build succeeds
```
