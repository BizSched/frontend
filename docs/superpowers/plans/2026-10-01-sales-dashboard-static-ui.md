# Sales Dashboard Static UI Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the populated `/sales` dashboard for desktop and mobile from the supplied Figma frames, using display-only data in this session.

**Architecture:** Keep `page.tsx` server rendered and compose domain components for summary, chart, category mix, and recent records. Reuse the existing Sidebar, Card, Table, and chart infrastructure. Keep sample data local to the sales domain so API replacement does not change the display components.

**Tech Stack:** Next.js 16 App Router, React 19, Tailwind CSS 4, shadcn based primitives, Recharts, Vitest.

**Spec:** `docs/feature/sales/dashboard.md`

## Global Constraints

- Route is `/sales`; no API call or working filter, entry, edit, or delete behavior in this session.
- Use `feat/common-table`'s `Table` for the desktop records table.
- Match Figma frames `337:105748` and `337:105893`; keep existing desktop first breakpoints and tokens.
- Preserve the Server Component page boundary. Put client code only where the chart library requires it.

## Review Focus

- At desktop width, all summary cards, two chart panels, and the full table remain visible without horizontal page overflow.
- At mobile width, the order and compact records match the Figma frame, and chart content remains readable.
- Table column labels and amounts retain semantic table markup; decorative chart shapes do not become misleading controls.
- Current `dev`'s Sidebar and Chart integration remain intact after the older Table branch is merged.

---

### Task 1: Page shell and sample data

**Files:** Create `app/(main)/sales/page.tsx`, `src/components/sales/SalesDashboard.tsx`, and `src/components/sales/salesDashboardData.ts`.

**Interfaces:** `SalesDashboard` renders the fixed sample data. Data exports contain summary values, weekly series, category totals, and recent rows.

- [ ] Add a focused page structure test for the heading and the four dashboard regions, then observe it fail.
- [ ] Build the server rendered page shell and cards using existing layout and Card components.
- [ ] Run the focused test, type check, and lint for the changed files.

### Task 2: Charts and responsive panels

**Files:** Create `src/components/sales/SalesChartCard.tsx` and `src/components/sales/SalesCategoryCard.tsx`.

**Interfaces:** Each component receives its display data through props. Charts use Recharts with the existing Chart container, with no active filter behavior.

- [ ] Add chart region assertions to the page test and observe the expected failure.
- [ ] Implement stacked weekly bars, category donut, legends, and static filter labels.
- [ ] Compare 1920px and 375px renders to the Figma frames and fix in-scope mismatches.

### Task 3: Recent records and finish

**Files:** Create `src/components/sales/SalesRecordsCard.tsx`; update `src/components/Sidebar/AppSidebar.tsx` only to enable the `/sales` navigation item.

**Interfaces:** Desktop records use `Table`; mobile uses a compact list of the same sample rows.

- [ ] Add assertions for table headings and recent row values; observe failure.
- [ ] Implement the responsive records panel and `/sales` navigation.
- [ ] Run test, type check, lint, formatting, production build, and visual checks for the requested screen.
