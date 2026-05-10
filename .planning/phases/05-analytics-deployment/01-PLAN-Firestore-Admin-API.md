---
wave: 1
depends_on: []
files_modified:
  - lib/firebase-admin.ts
  - app/api/analytics/route.ts
autonomous: true
requirements:
  - ANLYT-03
---

# Plan 01 — Firestore Admin Export + Analytics API Route

## Goal

Add `db` Firestore export to `firebase-admin.ts` and implement `GET /api/analytics` that returns 7-day trend data from Firestore `app_analytics` collection.

---

## Tasks

### Task 1.1 — Add Firestore export to `firebase-admin.ts`

<read_first>
- `lib/firebase-admin.ts` — see current exports; append after `remoteConfig` export
</read_first>

<action>
Add a single line at the end of `lib/firebase-admin.ts`, after the existing `export const remoteConfig = admin.remoteConfig();` line:

```ts
export const db = admin.firestore();
```

No additional initialization required — `firebase-admin` already initialized with `projectId`, `clientEmail`, and `privateKey`. Firestore auto-connects to the project's default database (created in asia-south1 region).
</action>

<acceptance_criteria>
- `lib/firebase-admin.ts` contains the exact string `export const db = admin.firestore()`
- `lib/firebase-admin.ts` still exports `adminAuth` and `remoteConfig` (no regressions)
- `npm run build` exits 0 (no TypeScript errors)
</acceptance_criteria>

---

### Task 1.2 — Create `app/api/analytics/route.ts`

<read_first>
- `app/api/remote-config/get/route.ts` — copy the exact auth pattern (Bearer token extract → verifyIdToken → work → return)
- `lib/firebase-admin.ts` — confirm `db` and `adminAuth` are exported
- `.planning/phases/05-analytics-deployment/05-CONTEXT.md` — D-05, D-06, D-07 for response shape and zero-fill behavior
</read_first>

<action>
Create new file `app/api/analytics/route.ts` with this exact content:

```ts
import { NextResponse } from 'next/server';
import { adminAuth, db } from '@/lib/firebase-admin';

export const dynamic = 'force-dynamic';

function getLast7Dates(): string[] {
  const dates: string[] = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    dates.push(d.toISOString().split('T')[0]);
  }
  return dates;
}

export async function GET(request: Request) {
  try {
    const authHeader = request.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized — missing Bearer token' }, { status: 401 });
    }
    const token = authHeader.split('Bearer ')[1];
    await adminAuth.verifyIdToken(token);

    const dates = getLast7Dates();
    const refs = dates.map((d) => db.collection('app_analytics').doc(d));
    const snaps = await Promise.all(refs.map((r) => r.get()));
    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

    const trend = snaps.map((snap, i) => {
      const data = snap.exists ? snap.data()! : {};
      return {
        date: dates[i],
        day: dayNames[new Date(dates[i] + 'T00:00:00').getDay()],
        meals_logged: (data.meals_logged as number) ?? 0,
        vision_uses: (data.vision_uses as number) ?? 0,
        barcode_scans: (data.barcode_scans as number) ?? 0,
        unique_devices: (data.unique_devices as number) ?? 0,
      };
    });

    return NextResponse.json({ today: trend[trend.length - 1], trend });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    if (message.includes('auth') || message.includes('token') || message.includes('ID token')) {
      return NextResponse.json({ error: 'Unauthorized — invalid token' }, { status: 401 });
    }
    return NextResponse.json({ error: 'Internal server error', detail: message }, { status: 500 });
  }
}
```
</action>

<acceptance_criteria>
- `app/api/analytics/route.ts` exists
- File contains `export const dynamic = 'force-dynamic'`
- File contains `export async function GET`
- File contains `adminAuth.verifyIdToken(token)`
- File contains `db.collection('app_analytics').doc(d)`
- File contains `trend[trend.length - 1]` (today is last element)
- File contains zero-fill: `?? 0`
- `npm run build` exits 0
</acceptance_criteria>

---

## Verification

```
must_haves:
  - GET /api/analytics route exists and follows auth pattern
  - db Firestore export added to firebase-admin.ts
  - Zero-fill for missing documents
  - Build succeeds
```
