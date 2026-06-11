# Dashboard Mobile Responsive Design

## Background

This spec defines the mobile adaptation plan for selected pages under `dashboard-statistic/`.

The current pages are designed primarily for Pad and desktop layouts. The goal of this change is to make the selected pages usable on cell phone screens without rewriting all data-heavy views into entirely new mobile pages.

This is a mixed responsive strategy:

- Mobile keeps the current business logic and data structures.
- Complex tables remain horizontally scrollable instead of being fully converted into mobile card flows.
- Header and left navigation are removed in phone view to give the content full width.
- Filter areas are collapsed into a filter entry icon on phone view and expanded through an overlay search panel.

## Scope

Included pages:

- `dashboard-statistic/1-dashboard-overview.html`
- `dashboard-statistic/3-dashboard-customer-statistics.html`
- `dashboard-statistic/5-sales-goal-mgmt.html`
- `dashboard-statistic/6-profit-loss-table.html`
- `dashboard-statistic/6-expense-bookkeeping.html`

Excluded page:

- `dashboard-statistic/4-dashboard-staff-statistics.html`

## Goals

- Make the included pages readable and operable on cell phone screens.
- Preserve existing desktop and Pad behavior.
- Minimize regression risk by applying responsive overrides instead of large structural rewrites where possible.
- Ensure the `记一笔` popup in `6-expense-bookkeeping.html` is fully usable on cell phone screens.

## Non-Goals

- No full mobile redesign of large business tables into separate mobile data cards across all pages.
- No business logic changes.
- No desktop interaction changes unless required for shared markup stability.
- No changes to the excluded `4-dashboard-staff-statistics.html`.

## Backup Strategy

Because this is a large cross-page UI change, implementation should start only after backup is prepared.

Recommended backup steps:

1. Create a targeted backup folder for the included files, for example:
   - `dashboard-statistic/_mobile-backup-20260610/`
2. Copy the five in-scope HTML files into that folder before modification.
3. Keep changes page-by-page instead of modifying all files at once.
4. After each page update, run diagnostics and a focused visual self-check.

This spec does not require using the older `dashboard-statistic - 副本/` directory as the primary rollback source because it may not match the latest working state.

## Responsive Breakpoints

Primary breakpoint:

- `@media (max-width: 768px)`

Secondary compact breakpoint when needed:

- `@media (max-width: 480px)`

General rule:

- Desktop and Pad layouts remain the default.
- Mobile overrides are additive and isolated in media queries.

## Shared Mobile Rules

### 1. Header and Navigation

For all included pages on phone view:

- Hide the CHL top header area.
- Hide the left navigation / sidebar.
- Do not replace the sidebar with a bottom nav in this phase.
- Do not keep a hamburger menu in this phase.
- Main content should start at the top and use the full available viewport width.

### 2. Page Container

For phone view:

- Remove layout assumptions based on `100vh` + fixed top chrome where they block scrolling.
- Allow the main content area to occupy full width.
- Keep vertical page scrolling natural and uninterrupted.
- Reduce page padding to phone-safe spacing.

### 3. Cards and Summary Blocks

For phone view:

- Top summary cards move to 1-column or 2-column layouts depending on content density.
- Card padding, icon size, and typography may be reduced slightly for readability.
- Avoid squeezing dense card content into 3 or 4 columns on phone screens.

### 4. Tables

For phone view:

- Large tables remain horizontally scrollable.
- Table wrappers must visibly support horizontal scrolling.
- Sticky columns may be downgraded or simplified if they create severe overlap issues on phone width.
- Font size, cell padding, and minimum widths may be reduced modestly.
- Do not remove columns or alter business table definitions in this phase.

### 5. Drawers, Modals, and Panels

For phone view:

- Right-side drawers should become full-width or near-full-width mobile layers.
- Settings panels and overlays should fit inside the viewport height.
- Modal content uses a fixed header, scrollable body, and fixed action area when needed.
- Internal scrolling is allowed, but the modal itself must remain fully visible in the viewport.

### 6. Filter Interaction on Mobile

This is a mobile-only interaction change for the five included pages.

Desktop / Pad behavior:

- Existing filter area remains visible and unchanged.

Phone behavior:

- The filter area is hidden by default.
- Show only a filter entry button or icon at first.
- When tapped, display a search/filter panel over the page.
- The panel should contain all relevant search conditions for that page.
- The panel should have:
  - a header/title row,
  - a scrollable body for conditions,
  - a bottom action row with `筛选`, `重置`, and `关闭`.
- Applied filter state must persist after closing the panel.
- The panel should not push page content down; it should overlay the current page.

## Per-Page Design

### `1-dashboard-overview.html`

Mobile design:

- Hide the CHL top header and any desktop-only shell chrome.
- Compress the page padding.
- Change the top overview cards to 1 or 2 columns.
- Convert multi-column section layouts into stacked blocks.
- Keep detail tables horizontally scrollable.
- Convert `cash-detail-panel` into a mobile-friendly full-width overlay or stacked expandable panel.
- Keep existing card interactions and tooltip logic, but ensure touch targets remain usable.

Filter handling:

- If the page has visible date or filter controls in desktop view, they move into the mobile filter overlay.

### `3-dashboard-customer-statistics.html`

Mobile design:

- Hide the top shell header on phone view.
- Remove left-side layout reservation so content uses full width.
- Top stat cards become 1 or 2 columns.
- The large customer table remains horizontally scrollable.
- The detail drawer should become a full-width mobile layer instead of a fixed-width right drawer.
- Existing settings panels keep fixed-height internal scrolling behavior.

Filter handling:

- The desktop filter bar becomes a mobile overlay filter panel.
- All search conditions, including range filters and birthday composite filters, must be available inside that mobile panel.
- The main page only shows a filter icon/button in phone view.

### `5-sales-goal-mgmt.html`

Mobile design:

- Hide the CHL top shell header on phone view.
- Reflow top summary cards and goal cards into a mobile grid or stacked layout.
- Tabs and top controls must wrap safely or stack.
- Large goal tables remain horizontally scrollable.
- Reuse and clean up the page's existing responsive rules instead of layering conflicting overrides.

Filter handling:

- Where the page contains filter or date control areas, move them into the mobile overlay filter panel pattern.

### `6-profit-loss-table.html`

Mobile design:

- Hide the top header shell on phone view.
- Convert the hero section into a stacked layout.
- Summary cards change to 1 or 2 columns.
- Charts move to single-column stacking.
- Profit/loss detail sections remain horizontally scrollable where needed.
- Modal widths must adapt to phone width and height constraints.

Filter handling:

- Replace visible desktop filter controls on phone view with the shared filter icon + overlay panel pattern.

### `6-expense-bookkeeping.html`

Mobile design:

- Hide the top shell header on phone view.
- Top summary cards change to 1 or 2 columns.
- The `支出明细` search and filter area becomes a mobile overlay filter panel.
- Expense tables remain horizontally scrollable.

Special requirement: `记一笔` popup

The `记一笔` popup is a critical mobile adaptation target and must be fully usable on phone view.

Required behavior:

- The popup width should be near full screen, such as `calc(100vw - 24px)`.
- The popup height must stay within the viewport, such as `calc(100vh - 24px)`.
- The popup must not overflow off-screen vertically.
- The popup layout should use:
  - fixed header,
  - scrollable body,
  - fixed footer actions.
- The current left-right split inside the popup should stack vertically on phone view:
  - category area first,
  - project or detail area second.
- Form fields should become a single-column layout.
- Category lists may scroll internally if necessary, but should not force the whole modal out of view.
- Action buttons must remain visible without requiring the user to scroll past the viewport edge.

## Implementation Sequencing

Recommended execution order:

1. Prepare backups for the five in-scope files.
2. Implement `6-expense-bookkeeping.html` first because it contains the highest-risk popup requirement.
3. Implement `3-dashboard-customer-statistics.html` second because it has the densest filter and table interactions.
4. Implement `1-dashboard-overview.html`.
5. Implement `6-profit-loss-table.html`.
6. Implement `5-sales-goal-mgmt.html`.

This order reduces the chance of discovering cross-page mobile patterns too late.

## Validation Checklist

For each page after implementation:

- Page scroll works on phone view.
- Header is hidden on phone view.
- Left navigation is hidden on phone view.
- Main content uses full width.
- Summary cards are readable and not over-compressed.
- Filter icon is visible on phone view.
- Tapping the filter icon opens the filter overlay.
- Filter overlay shows all relevant search conditions for that page.
- `筛选`, `重置`, and `关闭` are reachable inside the overlay.
- Large tables remain operable through horizontal scrolling.
- Any modal, drawer, or settings panel fits inside the viewport.
- No diagnostics errors are introduced.

Extra validation for `6-expense-bookkeeping.html`:

- `记一笔` popup opens fully inside the phone viewport.
- Header, body, and footer are all visible and usable.
- The stacked mobile version of the popup does not clip categories, projects, or action buttons.

## Risk Notes

- `3-dashboard-customer-statistics.html` has sticky columns, table settings, and complex filter combinations. Mobile overrides should not break desktop sticky behavior.
- `5-sales-goal-mgmt.html` already contains some responsive logic; new rules must be merged carefully to avoid contradictory breakpoints.
- `6-expense-bookkeeping.html` popup adaptation is the most failure-prone part of this work and should be verified first.
- Large table minimum widths should be adjusted carefully so phone usability improves without damaging desktop readability.

