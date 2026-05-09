# Phase 2 Research: Remote Config API + Overview Page

## Standard Stack
- `firebase-admin` (v12.x) for server-side Remote Config and Auth verification.
- Next.js 14 App Router (`app/api/.../route.ts`) for secure API endpoints.
- `server-only` to guarantee Admin SDK code is never bundled to the client.
- `recharts` (v2.x) for the 7-day sparkline charts on the Overview page.
- `@tabler/icons-react` for stat card icons.

## Architecture Patterns
- **Singleton Firebase Admin**: Initialize the Admin SDK once per Node process using a global variable check to prevent hot-reload errors in development.
- **Service Layer Abstraction**: Keep API route handlers lean. Extract Firebase Admin interactions (e.g., `getRemoteConfigValues()`, `updateRemoteConfig()`) into a dedicated `lib/firebase-admin.ts` file.
- **Auth Verification**: Since Phase 1 uses standard client-side auth (`browserLocalPersistence`), API routes must verify the user by accepting an `Authorization: Bearer <ID_TOKEN>` header and calling `admin.auth().verifyIdToken()`.
- **Next.js Caching**: Remote Config values should be fetched dynamically but can be cached at the Next.js level. Given the context decision to use Next.js caching with automatic revalidation, `revalidateTag` should be used when the POST endpoint updates the configuration.

## Don't Hand-Roll
- **Admin SDK Initialization Checks**: Never wrap initialization in a simple try/catch without checking `getApps().length` first.
- **Sparkline Charts**: Do not build custom SVG sparklines. Use Recharts `<LineChart>` with hidden axes (`<XAxis hide />`, `<YAxis hide />`) and no grid for a clean sparkline look.
- **Authorization Middleware**: Do not implement custom token parsing. Use `admin.auth().verifyIdToken()`.

## Common Pitfalls
- **"Default app already exists"**: Occurs frequently in Next.js `dev` mode when files change and the server restarts. Singleton pattern is mandatory.
- **Leaking Admin Credentials**: Importing `lib/firebase-admin.ts` into a client component will expose service account keys or crash the build. Use `import 'server-only'` at the top of the file.
- **Stale Configuration**: Next.js App Router aggressively caches fetch requests. Using the Firebase Admin Node.js SDK doesn't use `fetch` natively in a way Next.js intercepts, but if wrapped in `unstable_cache`, it must be manually revalidated. The safest approach for the GET route is `export const dynamic = 'force-dynamic'` unless explicit revalidation tags are set.
- **Remote Config Template ETag Mismatch**: When updating Remote Config via the Admin SDK, you must fetch the latest template and use its ETag to publish changes, otherwise the update will be rejected due to a version conflict.

## Code Examples

### 1. Singleton Admin SDK Initialization (`lib/firebase-admin.ts`)
```typescript
import 'server-only';
import * as admin from 'firebase-admin';

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert({
      projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    }),
  });
}

export const adminAuth = admin.auth();
export const remoteConfig = admin.remoteConfig();
```

### 2. Secure API Route (`app/api/remote-config/get/route.ts`)
```typescript
import { NextResponse } from 'next/server';
import { adminAuth, remoteConfig } from '@/lib/firebase-admin';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const authHeader = request.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const token = authHeader.split('Bearer ')[1];
    await adminAuth.verifyIdToken(token);

    const template = await remoteConfig.getTemplate();
    return NextResponse.json(template.parameters);
  } catch (error) {
    return NextResponse.json({ error: 'Unauthorized or Server Error' }, { status: 500 });
  }
}
```

### 3. Sparkline Chart with Recharts
```tsx
import { LineChart, Line, ResponsiveContainer } from 'recharts';

export function Sparkline({ data }: { data: any[] }) {
  return (
    <div className="h-12 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data}>
          <Line 
            type="monotone" 
            dataKey="value" 
            stroke="#3b82f6" // Arctic Blue accent
            strokeWidth={2} 
            dot={false} 
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
```
