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
