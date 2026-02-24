# Performance Notes: Memoization Audit (Stage 5)

Date: 2026-02-22

## Scope

- Full inventory of `useMemo` / `useCallback` / `React.useMemo` / `React.useCallback` across `src`.
- Classification for each call site: `нужно`, `не нужно`, `спорно`.
- Cleanup of unnecessary memoization in cheap computations and simple `setState` handlers.
- React Profiler run for key screens: `dashboard`, `tickets`.

## Summary

- Before audit: `81` call sites.
- After cleanup: `63` call sites.
- Removed as unnecessary: `18` call sites.

## Removed Call Sites (`не нужно`)

| Location                                                             | Hook                                   | Status     | Why removed                                      |
| -------------------------------------------------------------------- | -------------------------------------- | ---------- | ------------------------------------------------ |
| `src/features/dashboard/hooks/useGreeting.ts`                        | `useMemo(greeting)`                    | `не нужно` | Cheap sync computation; memo brought no benefit. |
| `src/features/tickets/pages/Tickets.tsx`                             | `useCallback(handleSearch)`            | `не нужно` | Simple `setState` handler.                       |
| `src/features/tickets/pages/Tickets.tsx`                             | `useMemo(description)`                 | `не нужно` | Cheap string interpolation.                      |
| `src/features/tickets/pages/TicketDetailPage.tsx`                    | `useMemo(currentUser)`                 | `не нужно` | Cheap object projection from `user`.             |
| `src/features/users/pages/UserProfile.tsx`                           | `useCallback(handleErrorClose)`        | `не нужно` | Simple `setState(null)` handler.                 |
| `src/features/tickets/components/TicketSearchBar.tsx`                | `useCallback(handleChange)`            | `не нужно` | Local input `setState`.                          |
| `src/features/tickets/components/ai-overlay/ChatInput.tsx`           | `useCallback(handleChange)`            | `не нужно` | Local input `setState`.                          |
| `src/features/tickets/components/ai-overlay/AiOverlay.tsx`           | `useCallback(handleCreateTicket)`      | `не нужно` | One-line wrapper over parent callback.           |
| `src/features/users/hooks/components/PersonalInformationSection.tsx` | `useCallback(handleEdit)`              | `не нужно` | Simple `setState(true)`.                         |
| `src/shared/components/layout/Sidebar.tsx`                           | `useMemo(menuItems)`                   | `не нужно` | Cheap role switch selection.                     |
| `src/features/dashboard/components/DashboardTabContent.tsx`          | `useMemo(resolvedTitle)`               | `не нужно` | Cheap conditional expression.                    |
| `src/features/dashboard/components/DashboardTabContent.tsx`          | `useMemo(hasAccess)`                   | `не нужно` | Cheap boolean guard.                             |
| `src/features/dashboard/components/UserTicketCard.tsx`               | `useMemo(metricsData)`                 | `не нужно` | Map over constant array of 4 items.              |
| `src/shared/hooks/usePagination.ts`                                  | `useMemo(cursor)`                      | `не нужно` | Direct array access by index.                    |
| `src/shared/hooks/usePagination.ts`                                  | `useCallback(handleSetPageSize)`       | `не нужно` | Simple setter wrapper.                           |
| `src/features/tickets/hooks/useCreateTicketForm.ts`                  | `useCallback(handleOverlayClose)`      | `не нужно` | Simple `setState(false)`.                        |
| `src/features/tickets/hooks/useCreateTicketForm.ts`                  | `useCallback(handleAllowCreateTicket)` | `не нужно` | Simple state toggles.                            |
| `src/features/tickets/components/CreateTicketForm.tsx`               | `useCallback(handleFileChange)`        | `не нужно` | Local form event handler, no heavy closure.      |

## Remaining Call Sites (Full Inventory)

| Location                                                                     | Hook                                     | Status   | Note                                                                         |
| ---------------------------------------------------------------------------- | ---------------------------------------- | -------- | ---------------------------------------------------------------------------- |
| `src/app/pages/DashboardPage.tsx:33`                                         | `useCallback(handleTicketClick)`         | `нужно`  | Stable prop passed into dashboard ticket rendering path.                     |
| `src/provider/theme-provider.tsx:48`                                         | `useCallback(handleThemeChange)`         | `нужно`  | Part of context API; avoids context value churn.                             |
| `src/provider/theme-provider.tsx:56`                                         | `useMemo(value)`                         | `нужно`  | Stabilizes provider value object.                                            |
| `src/app/hooks/useDashboardData.ts:124`                                      | `useMemo(userSummary)`                   | `нужно`  | Aggregation over ticket list.                                                |
| `src/app/hooks/useDashboardData.ts:129`                                      | `useMemo(adminSummary)`                  | `нужно`  | Aggregation over ticket list.                                                |
| `src/app/hooks/useDashboardData.ts:136`                                      | `useMemo(supportStatus)`                 | `спорно` | Cheap object; kept to avoid downstream prop identity churn.                  |
| `src/app/hooks/useDashboardData.ts:146`                                      | `useMemo(userMonthlyStats)`              | `нужно`  | List normalization for chart data.                                           |
| `src/app/hooks/useDashboardData.ts:157`                                      | `useMemo(monthlyTicketStats)`            | `нужно`  | List normalization for chart data.                                           |
| `src/app/hooks/useDashboardData.ts:171`                                      | `useMemo(aiStats)`                       | `нужно`  | Normalization with validation/filtering.                                     |
| `src/app/pages/dashboard-page-contract.tsx:41`                               | `useMemo(value)`                         | `нужно`  | Context contract value stability.                                            |
| `src/shared/context/AuthContext.tsx:71`                                      | `useCallback(login)`                     | `нужно`  | Stable context API function.                                                 |
| `src/shared/context/AuthContext.tsx:87`                                      | `useCallback(logout)`                    | `нужно`  | Stable context API function.                                                 |
| `src/shared/context/AuthContext.tsx:92`                                      | `useCallback(getToken)`                  | `нужно`  | Stable context API function.                                                 |
| `src/shared/context/AuthContext.tsx:96`                                      | `useMemo(value)`                         | `нужно`  | Stabilizes provider value object.                                            |
| `src/features/dashboard/components/DashboardTabContent.tsx:66`               | `useMemo(tabConfig)`                     | `спорно` | Config assembly is not heavy; kept to keep map identity stable.              |
| `src/features/users/hooks/useProfileEditor.ts:39`                            | `useCallback(handleSaveProfile)`         | `нужно`  | Async action API returned from hook.                                         |
| `src/features/dashboard/components/charts/AnalyticsChart.tsx:29`             | `useMemo(chartData)`                     | `нужно`  | Derived chart dataset.                                                       |
| `src/features/dashboard/components/charts/AnalyticsChart.tsx:38`             | `useMemo(chartConfig)`                   | `спорно` | Could be hoisted constant; kept for explicit stable reference.               |
| `src/features/dashboard/components/charts/TicketsOfMonth.tsx:30`             | `useMemo(chartData)`                     | `нужно`  | Derived chart dataset.                                                       |
| `src/features/dashboard/components/charts/TicketsOfMonth.tsx:39`             | `useMemo(chartConfig)`                   | `спорно` | Static config; kept for stable chart props.                                  |
| `src/features/dashboard/components/charts/TicketsOfMonth.tsx:50`             | `useCallback(tickFormatter)`             | `спорно` | Lightweight, but Recharts benefits from stable formatter references.         |
| `src/features/dashboard/components/charts/TicketsOfMonth.tsx:52`             | `useMemo(tooltipContent)`                | `спорно` | Stabilizes JSX prop object for chart tooltip.                                |
| `src/features/dashboard/components/charts/TicketStatusChart.tsx:26`          | `useMemo(chartData+chartConfig)`         | `нужно`  | Variant-based dataset/config generation.                                     |
| `src/features/dashboard/components/charts/UserTicketStats.tsx:30`            | `useMemo(chartConfig)`                   | `спорно` | Static config; kept for stable chart props.                                  |
| `src/features/dashboard/components/charts/UserTicketStats.tsx:41`            | `useCallback(tickFormatter)`             | `спорно` | Lightweight, but stable formatter for Recharts prop identity.                |
| `src/features/dashboard/components/charts/UserTicketStats.tsx:43`            | `useMemo(tooltipContent)`                | `спорно` | Stabilizes JSX prop object for chart tooltip.                                |
| `src/shared/hooks/useIsStaff.ts:17`                                          | `useMemo(return object)`                 | `спорно` | Cheap object; kept to avoid object identity churn for consumers.             |
| `src/shared/hooks/usePagination.ts:55`                                       | `useCallback(goToPreviousPage)`          | `спорно` | Simple setter; kept as part of stable hook API.                              |
| `src/shared/hooks/usePagination.ts:59`                                       | `useCallback(goToNextPage)`              | `нужно`  | Depends on cursor/page state and exported as handler API.                    |
| `src/shared/hooks/usePagination.ts:75`                                       | `useCallback(reset)`                     | `спорно` | Simple setter; kept as part of stable hook API.                              |
| `src/shared/hooks/useTicketFilter.ts:28`                                     | `useMemo(filteredList)`                  | `нужно`  | Potentially large list filtering.                                            |
| `src/shared/hooks/useUserFilter.ts:10`                                       | `useMemo(filteredUsers)`                 | `нужно`  | Potentially large list filtering.                                            |
| `src/shared/components/ui/chart.tsx:41`                                      | `React.useMemo(chartContextValue)`       | `нужно`  | Context value stability.                                                     |
| `src/shared/components/ui/chart.tsx:116`                                     | `React.useMemo(tooltipLabel)`            | `нужно`  | Non-trivial tooltip derivation from payload/config.                          |
| `src/features/tickets/hooks/useTicketFilters.ts:82`                          | `useCallback(resolveFilterValue)`        | `спорно` | Lightweight resolver; kept to keep memo/effect dependencies stable.          |
| `src/features/tickets/hooks/useTicketFilters.ts:93`                          | `useMemo(activeFilterValue)`             | `нужно`  | Filter selector feeding URL sync and query state.                            |
| `src/features/tickets/hooks/useTicketFilters.ts:98`                          | `useMemo(activeTabValue)`                | `нужно`  | Filter selector feeding tab resolution.                                      |
| `src/features/tickets/hooks/useTicketFilters.ts:112`                         | `useMemo(activeStaffTab)`                | `нужно`  | Tab selector used for query mapping.                                         |
| `src/features/tickets/hooks/useTicketFilters.ts:117`                         | `useMemo(activeUserFilter)`              | `нужно`  | Filter selector used for query mapping.                                      |
| `src/features/tickets/hooks/useTicketFilters.ts:124`                         | `useMemo(queryFilters)`                  | `нужно`  | Query construction for API and query key.                                    |
| `src/features/tickets/hooks/useTicketFilters.ts:139`                         | `useMemo(filterKey)`                     | `нужно`  | Pagination reset key from current filters.                                   |
| `src/features/tickets/hooks/useTicketFilters.ts:146`                         | `useCallback(onFilterChange)`            | `нужно`  | Stable prop for filter controls.                                             |
| `src/features/tickets/hooks/useCreateTicketForm.ts:70`                       | `useCallback(handleSubmit)`              | `нужно`  | Async submission function returned by hook.                                  |
| `src/features/tickets/hooks/useCreateTicketForm.ts:105`                      | `useCallback(handleNavigateToDashboard)` | `спорно` | Small wrapper over `navigate`; kept for memoized child prop stability.       |
| `src/shared/components/ui/sidebar.tsx:71`                                    | `React.useCallback(setOpen)`             | `нужно`  | Controlled/uncontrolled state bridge + cookie write.                         |
| `src/shared/components/ui/sidebar.tsx:87`                                    | `React.useCallback(toggleSidebar)`       | `нужно`  | Shared command used by keyboard and UI triggers.                             |
| `src/shared/components/ui/sidebar.tsx:108`                                   | `React.useMemo(contextValue)`            | `нужно`  | Context value stability.                                                     |
| `src/shared/components/ui/sidebar.tsx:590`                                   | `React.useMemo(width)`                   | `нужно`  | Keeps skeleton random width stable per mount.                                |
| `src/features/tickets/pages/Tickets.tsx:184`                                 | `useCallback(handleTicketClick)`         | `нужно`  | Stable prop for memoized row/table rendering.                                |
| `src/features/tickets/pages/Tickets.tsx:189`                                 | `useCallback(handleCreateTicket)`        | `нужно`  | Stable prop for memoized toolbar/empty-state actions.                        |
| `src/features/tickets/pages/Tickets.tsx:194`                                 | `useCallback(handleUserClick)`           | `нужно`  | Stable prop for memoized row rendering.                                      |
| `src/features/tickets/components/CreateTicketForm.tsx:115`                   | `useCallback(handleFormSubmit)`          | `нужно`  | Submission callback passed into `react-hook-form`.                           |
| `src/features/tickets/components/TicketStats.tsx:12`                         | `useMemo(counts)`                        | `нужно`  | Status aggregation over ticket array.                                        |
| `src/features/tickets/components/ai-overlay/ChatInput.tsx:21`                | `useCallback(handleSend)`                | `спорно` | Local handler; kept to avoid recreating callback used by key/click handlers. |
| `src/features/tickets/components/ai-overlay/ChatInput.tsx:27`                | `useCallback(handleKeyDown)`             | `спорно` | Local handler; kept for stable textarea event callback.                      |
| `src/features/tickets/components/ai-overlay/useAiChat.ts:48`                 | `useCallback(sendMessage)`               | `нужно`  | Exported async callback consumed by memoized children.                       |
| `src/features/users/hooks/components/PersonalInformationSection.tsx:97`      | `useCallback(handleManagerChange)`       | `нужно`  | Passed into manager select control.                                          |
| `src/features/users/hooks/components/PersonalInformationSection.tsx:122`     | `useCallback(handleCancel)`              | `спорно` | Medium-size reset logic; kept as stable button handler.                      |
| `src/features/users/hooks/components/PersonalInformationSection.tsx:137`     | `useCallback(onSubmit)`                  | `нужно`  | Async submit callback for form handler.                                      |
| `src/features/tickets/components/ticket-detail/ticket-workflow-card.tsx:86`  | `useMemo(categoryOptions)`               | `нужно`  | Derived select options with fallback injection.                              |
| `src/features/tickets/components/ticket-detail/ticket-workflow-card.tsx:100` | `useMemo(assigneeOptions)`               | `нужно`  | Derived select options from admin list.                                      |
| `src/shared/components/ui/form.tsx:40`                                       | `React.useMemo(fieldContextValue)`       | `нужно`  | Context value stability for form field subtree.                              |
| `src/shared/components/ui/form.tsx:82`                                       | `React.useMemo(itemContextValue)`        | `нужно`  | Context value stability for form item subtree.                               |

## React Profiler Run

Command:

```bash
npm run test:run
```

Captured in tests:

- `src/app/pages/DashboardPage.test.tsx`
- `src/features/tickets/pages/Tickets.test.tsx`

Results:

| Screen      | Commits | Total render time | Average per commit |
| ----------- | ------: | ----------------: | -----------------: |
| `dashboard` |       1 |            2.34ms |             2.34ms |
| `tickets`   |       8 |           99.87ms |            12.48ms |

Notes:

- Measurements are from `React.Profiler` in `vitest` + `jsdom` test runtime.
- Absolute timings are synthetic (not browser-devtools production numbers), but commit count and relative cost are useful for regression checks.

## Release Budget Check (2026-02-24)

Command:

```bash
npm run perf:budget
```

Result:

- `PERF_BUDGET_OK`
- `entry` chunk: `index-*.js` ~ `752.39KB` (limit: `800KB`)
- `dashboard` route chunk: `DashboardPage-*.js` ~ `486.20KB` (limit: `550KB`)
- `LiquidEther` chunk: `LiquidEther-*.js` ~ `472.84KB` (limit: `550KB`)
- largest CSS chunk: `index-*.css` ~ `72.65KB` (limit: `100KB`)
- total JS size: `1898.77KB` (limit: `2200KB`)
