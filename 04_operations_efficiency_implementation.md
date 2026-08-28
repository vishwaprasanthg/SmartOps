# Feature 04 — Operations Efficiency Dashboard Implementation Phases

## Phase 1 — Inspect Existing Project

- Read Features 01–03.
- Reuse existing React/Vite and Express setup.
- Reuse existing CSS/design system.
- Reuse Recharts.
- Do not break existing features.
- Avoid unnecessary dependencies.

## Phase 2 — Backend

Implement:

- operations validator
- KPI calculator
- trend calculator
- service
- controller
- route

Endpoint:

`POST /api/operations/efficiency`

Keep calculations in dedicated deterministic modules.

## Phase 3 — Frontend

Create:

```text
src/pages/OperationsEfficiency.jsx
src/components/OperationsDataTable.jsx
src/components/OperationsKpiCards.jsx
src/components/OperationsTrendChart.jsx
src/components/OperationsFilters.jsx
```

Keep component structure simple.

## Phase 4 — Input UI

Create:

```text
Facility
[ Demo Hub ▼ ]

Start Date
[ date ]

End Date
[ date ]

Operational Data

Date | Inbound | Outbound | Processed | Capacity | Workers | Hours | On-Time | Exceptions | Action

[ + ADD ROW ]

[ LOAD DEMO DATA ]
[ CLEAR ALL ]
[ UPDATE DASHBOARD ]
```

The table must support manual testing.

## Phase 5 — KPI Dashboard

Display:

- Total Inbound
- Total Outbound
- Total Processed
- Capacity Utilization
- Throughput
- Workforce Productivity
- On-Time Processing Rate
- Exception Rate

Show clear status for:

- Capacity Utilization
- On-Time Processing
- Exception Rate

## Phase 6 — Trend Dashboard

Provide:

```text
Metric
[ Capacity Utilization ▼ ]
```

Options:

- Inbound Volume
- Outbound Volume
- Processed Volume
- Capacity Utilization
- Throughput
- On-Time Rate
- Exception Rate

Render one clean chronological Recharts line chart.

Show:

```text
Latest Trend: IMPROVING
```

or:

```text
Latest Trend: DECLINING
```

or:

```text
Latest Trend: STABLE
```

## Phase 7 — Demo Data

Use five days:

```text
Date       Inbound  Outbound Processed Capacity Workers Hours On-Time Exceptions

2026-08-25 48000    45000    46000     50000    28      8     43240   320
2026-08-26 51000    48000    49000     50000    28      8     47040   280
2026-08-27 53000    50000    51000     50000    30      8     48450   350
2026-08-28 50000    49000    49000     52000    29      8     46550   250
2026-08-29 54000    51000    52000     55000    30      8     49920   220
```

Use these only as demo/test data.

## Phase 8 — Validation

Implement all validation and calculation tests from:

`03_operations_efficiency_validation.md`

## Phase 9 — Browser Verification

Verify:

1. Page loads.
2. Demo data loads.
3. Rows can be edited.
4. Rows can be added.
5. Rows can be deleted.
6. Date filtering works.
7. KPI values are correct.
8. Status indicators are correct.
9. Trend selector works.
10. Chart is chronological.
11. Trend direction works.
12. Invalid values show errors.
13. Empty data has a useful state.
14. API failures are handled.
15. Existing Features 01–03 still work.

## Phase 10 — Stop

Do not implement Feature 05.

Do not add Supabase.

Do not add Gemini/NVIDIA/OpenRouter.

Stop after Feature 04 passes tests and browser verification.
