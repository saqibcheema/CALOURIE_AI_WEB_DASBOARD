---
wave: 1
depends_on: []
files_modified:
  - "package.json"
  - ".env.local"
  - "lib/firebase-admin.ts"
  - "app/api/remote-config/get/route.ts"
  - "app/api/remote-config/set/route.ts"
  - "components/SparklineChart.tsx"
  - "components/StatCard.tsx"
  - "components/ConfigChangesTable.tsx"
  - "app/dashboard/page.tsx"
autonomous: true
---

# Phase 2 Plan: Remote Config API + Overview Page

## 1. Requirements Mapped
- API-01, API-02, API-03, API-04, API-05
- OVER-01, OVER-02, OVER-03, OVER-04
- UI-05

## 2. Tasks

### Wave 1: Server Foundation & API

<task>
<id>1</id>
<title>Install Dependencies</title>
<read_first>
- package.json
</read_first>
<action>
Run the following command to install the required libraries:
`npm install firebase-admin server-only recharts @tabler/icons-react`
</action>
<acceptance_criteria>
- `package.json` contains `firebase-admin`, `server-only`, `recharts`, and `@tabler/icons-react` in dependencies.
</acceptance_criteria>
</task>

<task>
<id>2</id>
<title>Configure Environment Variables</title>
<read_first>
- .env.local
</read_first>
<action>
Append the following placeholders to `.env.local`:
```env
FIREBASE_CLIENT_EMAIL="firebase-adminsdk-xxxxx@calourie-ai-main.iam.gserviceaccount.com"
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
```
</action>
<acceptance_criteria>
- `.env.local` contains `FIREBASE_CLIENT_EMAIL=`
- `.env.local` contains `FIREBASE_PRIVATE_KEY=`
</acceptance_criteria>
</task>

<task>
<id>3</id>
<title>Create Firebase Admin Singleton</title>
<read_first>
- .env.local
- .planning/phases/02-remote-config-api-overview-page/02-RESEARCH.md
</read_first>
<action>
Create `lib/firebase-admin.ts` using the singleton pattern defined in the RESEARCH.md file.
- Must import `server-only` at the very top.
- Must conditionally initialize the app by checking `admin.apps.length`.
- Must parse `process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n')`.
- Must export `adminAuth = admin.auth()` and `remoteConfig = admin.remoteConfig()`.
</action>
<acceptance_criteria>
- `lib/firebase-admin.ts` contains `import 'server-only'`
- `lib/firebase-admin.ts` contains `if (!admin.apps.length)`
- `lib/firebase-admin.ts` contains `export const adminAuth =`
</acceptance_criteria>
</task>

<task>
<id>4</id>
<title>Create Remote Config GET Endpoint</title>
<read_first>
- lib/firebase-admin.ts
</read_first>
<action>
Create `app/api/remote-config/get/route.ts`.
- Add `export const dynamic = 'force-dynamic';`
- Implement a `GET` function that reads the `Authorization` header.
- Return 401 if missing or invalid `Bearer ` token.
- Call `await adminAuth.verifyIdToken(token)`.
- Fetch the template: `await remoteConfig.getTemplate()`.
- Return `NextResponse.json(template.parameters)`.
</action>
<acceptance_criteria>
- `app/api/remote-config/get/route.ts` contains `adminAuth.verifyIdToken`
- `app/api/remote-config/get/route.ts` contains `remoteConfig.getTemplate()`
- `app/api/remote-config/get/route.ts` returns status `401` on auth failure.
</acceptance_criteria>
</task>

<task>
<id>5</id>
<title>Create Remote Config SET Endpoint</title>
<read_first>
- lib/firebase-admin.ts
- app/api/remote-config/get/route.ts
</read_first>
<action>
Create `app/api/remote-config/set/route.ts`.
- Add `export const dynamic = 'force-dynamic';`
- Implement a `POST` function that validates the bearer token via `adminAuth.verifyIdToken(token)`.
- Extract the JSON body representing keys to update (e.g., `{ updates: { key: value } }`).
- Fetch the template: `const template = await remoteConfig.getTemplate()`.
- Merge the updates into `template.parameters`. Ensure values are formatted correctly for Remote Config (i.e. `defaultValue: { value: 'str' }`).
- Publish: `await remoteConfig.publishTemplate(template)`.
- Return the new ETag or success status via `NextResponse.json()`.
</action>
<acceptance_criteria>
- `app/api/remote-config/set/route.ts` contains `adminAuth.verifyIdToken`
- `app/api/remote-config/set/route.ts` contains `remoteConfig.publishTemplate(template)`
</acceptance_criteria>
</task>

### Wave 2: UI Components & Assembly

<task>
<id>6</id>
<title>Create SparklineChart Component</title>
<read_first>
- .planning/phases/02-remote-config-api-overview-page/02-RESEARCH.md
</read_first>
<action>
Create `components/SparklineChart.tsx`.
- Use `<LineChart>` from `recharts`.
- Map the data to a `<Line type="monotone" dataKey="value" stroke="#0ea5e9" strokeWidth={2} dot={false} />`.
- Hide axes (`<XAxis hide />`, `<YAxis hide />`).
- Ensure it sits in a responsive container (`<ResponsiveContainer width="100%" height="100%">`).
</action>
<acceptance_criteria>
- `components/SparklineChart.tsx` imports `LineChart` from `recharts`
- `components/SparklineChart.tsx` contains `stroke="#0ea5e9"`
</acceptance_criteria>
</task>

<task>
<id>7</id>
<title>Create StatCard Component</title>
<read_first>
- .planning/phases/02-remote-config-api-overview-page/02-UI-SPEC.md
</read_first>
<action>
Create `components/StatCard.tsx`.
- Accept props: `title` (string), `value` (string/number), `icon` (ReactNode), and `trend` (ReactNode/string).
- Style the card using UI-SPEC tokens: `bg-white` (surface), `rounded-[10px]` (card radius), `shadow-sm`, and inner padding `p-4` or `p-6`.
- Typography: Use `text-sm font-medium` for title, and `text-3xl font-bold` for value.
</action>
<acceptance_criteria>
- `components/StatCard.tsx` contains `rounded-[10px]` (or uses tailwind config `rounded-card`)
- `components/StatCard.tsx` accepts `title`, `value`, `icon`, `trend` props.
</acceptance_criteria>
</task>

<task>
<id>8</id>
<title>Create ConfigChangesTable Component</title>
<read_first>
- .planning/phases/02-remote-config-api-overview-page/02-UI-SPEC.md
</read_first>
<action>
Create `components/ConfigChangesTable.tsx`.
- Build a standard Tailwind HTML table.
- Use mock data (e.g. Array of objects: `{ date: '2026-05-10', key: 'gemini_model_name', oldValue: 'gemini-1.5-flash', newValue: 'gemini-1.5-pro' }`).
- Columns: Date, Key Changed, Old Value, New Value.
- Style with `bg-white`, `rounded-[10px]`, and `shadow-sm`.
</action>
<acceptance_criteria>
- `components/ConfigChangesTable.tsx` contains an HTML `table` element.
- `components/ConfigChangesTable.tsx` contains mock data.
</acceptance_criteria>
</task>

<task>
<id>9</id>
<title>Assemble Overview Page</title>
<read_first>
- app/dashboard/page.tsx
- components/StatCard.tsx
- components/SparklineChart.tsx
- components/ConfigChangesTable.tsx
</read_first>
<action>
Update `app/dashboard/page.tsx`.
- Import and render four `StatCard` components with mock data (Total Meals Logged, AI Vision Uses, Barcode Scans, Unique Devices) and icons from `@tabler/icons-react`.
- Import and render `SparklineChart` with mock 7-day trend data (e.g., `[{value: 10}, {value: 20}, ...]`) in a dedicated chart section.
- Import and render `ConfigChangesTable` below the stat cards and chart.
- Ensure the page layout is responsive (e.g., `grid-cols-1 md:grid-cols-2 lg:grid-cols-4` for stat cards) and has `p-6` or `p-8` spacing.
</action>
<acceptance_criteria>
- `app/dashboard/page.tsx` imports `StatCard`
- `app/dashboard/page.tsx` imports `SparklineChart`
- `app/dashboard/page.tsx` imports `ConfigChangesTable`
</acceptance_criteria>
</task>

## 3. Verification
- `npm run build` succeeds without type errors.
- `app/api/remote-config/get/route.ts` is correctly structured to return a 401 when no token is passed.
- `app/dashboard/page.tsx` visually renders 4 stat cards, a sparkline chart, and a mock table.

## 4. Must Haves (for Nyquist)
- Firebase Admin SDK is a singleton.
- API endpoints strictly verify tokens using `adminAuth.verifyIdToken`.
- Overview page successfully integrates Recharts and uses the defined Arctic Blue UI tokens.
