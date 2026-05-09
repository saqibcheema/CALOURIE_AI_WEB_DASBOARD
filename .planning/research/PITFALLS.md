# Pitfalls Research

**Domain:** Firebase Admin Dashboard (Next.js 14)
**Researched:** 2026-05-10
**Confidence:** HIGH

## Critical Pitfalls

### Pitfall 1: Firebase Admin SDK Credential Leakage

**What goes wrong:**
Service account private key gets committed to git or bundled into client-side code, granting anyone full admin access to the Firebase project.

**Why it happens:**
Developers put credentials in `.env.local` but forget to gitignore it, or import `firebase-admin.ts` in a Client Component.

**How to avoid:**
- Use `server-only` package in `firebase-admin.ts`
- Add `.env.local` to `.gitignore`
- Store `FIREBASE_ADMIN_PRIVATE_KEY` as environment variable, never in code
- Verify bundle doesn't contain credentials with `next build --debug`

**Warning signs:**
Build output includes `firebase-admin` package, `.env.local` appears in git status.

**Phase to address:** Phase 1 (Foundation)

---

### Pitfall 2: Firebase Admin SDK Re-initialization Errors

**What goes wrong:**
"The default Firebase app already exists" error during development due to Next.js Hot Module Replacement (HMR) re-executing initialization code.

**Why it happens:**
Each HMR cycle re-runs the module, calling `initializeApp()` again on an already-initialized instance.

**How to avoid:**
Always use the singleton pattern:
```typescript
const app = getApps().length === 0 ? initializeApp({...}) : getApps()[0];
```

**Warning signs:**
App crashes on save during development, error mentions "app already exists."

**Phase to address:** Phase 2 (Remote Config API)

---

### Pitfall 3: Edge Runtime Incompatibility

**What goes wrong:**
API routes using Firebase Admin SDK fail with "Module not found: Can't resolve 'fs'" or similar errors.

**Why it happens:**
Next.js defaults to Edge Runtime for some routes. Firebase Admin SDK requires Node.js modules (fs, net, tls, child_process).

**How to avoid:**
Explicitly set runtime in every API route that uses Admin SDK:
```typescript
export const runtime = 'nodejs';
```

**Warning signs:**
Build errors mentioning missing Node.js modules, routes work locally but fail on deploy.

**Phase to address:** Phase 2 (Remote Config API)

---

### Pitfall 4: Unprotected API Routes

**What goes wrong:**
Anyone who discovers the API route URL can read all Remote Config values (including API keys) or modify them.

**Why it happens:**
Developer builds the route to work, forgets to add auth verification before deploying.

**How to avoid:**
Every API route must verify the caller is the admin:
- Check for Firebase session cookie or Authorization header
- Verify token with Firebase Admin Auth
- Return 401 if verification fails

**Warning signs:**
API routes return data without any auth headers, no 401 responses in testing.

**Phase to address:** Phase 2 (Remote Config API)

---

### Pitfall 5: Tailwind Config Token Mismatch

**What goes wrong:**
UI looks wrong because token names in Tailwind config don't match what components use, or tokens are incomplete.

**Why it happens:**
Arctic Blue theme has 14+ color tokens. Easy to miss one or use a different naming convention than the design spec.

**How to avoid:**
- Define ALL Arctic Blue tokens in `tailwind.config.ts` before writing any components
- Use exact token names from the design spec (Section 2.1)
- Test each token visually before proceeding

**Warning signs:**
Components using `text-accent` but config has `primary` instead, missing hover/focus states.

**Phase to address:** Phase 1 (Foundation)

---

### Pitfall 6: PRIVATE_KEY Newline Parsing on Deployment

**What goes wrong:**
Firebase Admin SDK fails to initialize on deployment because the private key string has escaped newlines (`\\n`) instead of actual newlines.

**Why it happens:**
Environment variables in hosting platforms store `\n` as literal characters, not newline characters.

**How to avoid:**
Parse the private key before using it:
```typescript
const privateKey = process.env.FIREBASE_ADMIN_PRIVATE_KEY?.replace(/\\n/g, '\n');
```

**Warning signs:**
Works locally but crashes on deploy with "Failed to parse private key" error.

**Phase to address:** Phase 2 (Remote Config API)

## Technical Debt Patterns

| Shortcut | Immediate Benefit | Long-term Cost | When Acceptable |
|----------|-------------------|----------------|-----------------|
| Hardcoded admin UID in Firestore rules | Quick setup | Must update rules if admin changes | Always (single admin) |
| No audit log for config changes | Less code, fewer Firestore writes | Can't trace who changed what | v1 (single admin, no ambiguity) |
| Client-side auth state only | Simpler auth flow | Page flash on refresh before auth resolves | v1 (add server-side sessions in v2) |
| No input validation on config values | Faster development | Could publish invalid config to app | v1 only — add validation in v1.x |

## Integration Gotchas

| Integration | Common Mistake | Correct Approach |
|-------------|----------------|------------------|
| Firebase Auth | Not handling auth state loading (shows login page briefly) | Show loading spinner until `onAuthStateChanged` fires |
| Remote Config Admin SDK | Calling `getServerTemplate()` vs `getRemoteConfig()` | Use `getRemoteConfig()` for reading, `getServerTemplate()` for updating |
| Firestore date queries | Using string dates instead of Firestore Timestamps | Store dates as YYYY-MM-DD strings for simplicity in analytics |
| Firebase Hosting | Wrong `firebase.json` rewrites for Next.js | Use Firebase Next.js hosting adapter or manual configuration |

## Security Mistakes

| Mistake | Risk | Prevention |
|---------|------|------------|
| Exposing API keys in Remote Config GET response to unauthenticated users | Attackers steal Gemini/Groq API keys | Auth check on every API route |
| Using Firebase client config keys as "secrets" | Confusion — these are public by design | Document that NEXT_PUBLIC_ vars are safe, FIREBASE_ADMIN_ vars are secret |
| Storing service account JSON file in repo | Full project compromise | .gitignore, env vars only |

## UX Pitfalls

| Pitfall | User Impact | Better Approach |
|---------|-------------|-----------------|
| No loading state on publish | User clicks multiple times, creates duplicate requests | Disable button + show spinner during publish |
| No confirmation on delete | Accidental deletion of API key provider | Modal confirmation before delete |
| Unsaved changes lost on navigation | User loses edits by clicking sidebar link | Show unsaved warning before navigation, or auto-save |
| Flash of unstyled content on page load | Looks unprofessional | Use next/font for font loading, Tailwind for instant styling |

## "Looks Done But Isn't" Checklist

- [ ] **Login page:** Often missing error message display — verify wrong credentials show feedback
- [ ] **Auth guard:** Often missing redirect-back-after-login — verify /dashboard doesn't flash login
- [ ] **API routes:** Often missing error handling — verify 500 responses return useful error messages
- [ ] **Publish actions:** Often missing loading state — verify button is disabled during publish
- [ ] **Delete actions:** Often missing optimistic UI update — verify item disappears immediately
- [ ] **Page refresh:** Often loses auth state briefly — verify no flash of login page

## Pitfall-to-Phase Mapping

| Pitfall | Prevention Phase | Verification |
|---------|------------------|--------------|
| Credential leakage | Phase 1 | Verify `server-only` import, check .gitignore |
| Re-initialization | Phase 2 | Test with HMR, verify no errors on save |
| Edge runtime | Phase 2 | Deploy test, verify API routes work |
| Unprotected routes | Phase 2 | Test API without auth, verify 401 |
| Token mismatch | Phase 1 | Visual comparison with design spec |
| Private key newlines | Phase 5 (deploy) | Test on Firebase Hosting, verify Admin SDK init |

## Sources

- Next.js + Firebase Admin SDK community discussions (Reddit, Stack Overflow)
- Firebase Admin SDK troubleshooting documentation
- Next.js Edge Runtime compatibility documentation

---
*Pitfalls research for: Firebase Admin Dashboard*
*Researched: 2026-05-10*
