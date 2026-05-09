# Phase 1 Context: Foundation (Firebase + Auth + Shell)

## Decisions
- **Sidebar Interaction**: Standard click toggle button with responsive behavior (no premium hover effects for now).
- **Auth Loading State**: Skeleton UI to provide the smoothest perceived performance and prevent layout shifts.
- **Session Persistence**: 30-day "Remember me" session persistence for the admin user.
- **Design System Depth**: Light mode only (Arctic Blue theme) to prioritize faster MVP delivery.

## Deferred Ideas
- Support for premium hover interactions in the sidebar.
- Dark mode support (deferred to later if needed).

## Canonical References
- `../REQUIREMENTS.md` (AUTH-01 to AUTH-05, LAYOUT-01 to LAYOUT-05, DESIGN-01 to DESIGN-05, UI-04)
- `../research/PROJECT.md`
