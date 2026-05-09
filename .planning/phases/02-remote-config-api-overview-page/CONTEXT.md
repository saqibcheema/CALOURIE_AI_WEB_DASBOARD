# Phase 2 Context: Remote Config API + Overview Page

## Decisions
- **Remote Config Fetch Strategy**: Use Next.js caching for Remote Config values, but implement automatic revalidation/cache invalidation when data changes (e.g., when saving updates) to prevent corrupted or outdated data.
- **Overview Data Source**: Use mock data for all Overview stat cards and the sparkline chart for now, to keep the focus on Remote Config infrastructure.
- **Config Changes Table**: Use mock data for the recent activity table for now.

## Deferred Ideas
- Pulling real analytics data from Firestore (deferred to Phase 5).
- Writing config change history to Firestore `admin_config` (deferred to a future Audit phase or Phase 5).

## Canonical References
- `../REQUIREMENTS.md` (API-01 to API-05, OVER-01 to OVER-04, UI-05)
- `../PROJECT.md`
