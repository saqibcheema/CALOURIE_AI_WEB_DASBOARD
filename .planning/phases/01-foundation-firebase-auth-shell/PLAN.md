# Phase 1 Plan: Foundation (Firebase + Auth + Shell)

## 1. Setup & Environment
- Configure `.env.local` with `NEXT_PUBLIC_FIREBASE_*` variables.
- Update `tailwind.config.ts` with Arctic Blue tokens.
- Add Google Fonts (DM Sans, IBM Plex Mono) in `app/layout.tsx`.

## 2. Firebase Initialization
- Create `lib/firebase-client.ts` to initialize `firebase/app` and `firebase/auth`.
- Set auth persistence to `browserLocalPersistence` for 30 days.

## 3. UI Components
- **Sidebar**: Standard toggle interaction, responsive design.
- **Header**: Fixed header, page titles, logout button.
- **AuthGuard / DashboardLayout**: Protect routes, implement Skeleton UI for loading state.

## 4. Pages & Routing
- `app/login/page.tsx`: Arctic Blue styled login form.
- `app/dashboard/layout.tsx`: Uses `DashboardLayout`.
- `app/dashboard/page.tsx`: Placeholder overview.

## Verification
- Route protection works (redirect to `/login` if unauthenticated).
- Skeleton UI displays during auth resolution.
- Sidebar toggles and responds to screen size.
