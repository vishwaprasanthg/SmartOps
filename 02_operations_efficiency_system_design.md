# Feature 04 — Operations Efficiency Dashboard System Design

## 1. Design Principle

Keep the dashboard simple and understandable.

It is an operational reporting and trend-analysis feature, not an AI analytics platform.

## 2. Architecture

```text
React Dashboard
       |
       | POST /api/operations/efficiency
       v
Express API
       |
       v
Controller
       |
       v
Operations Efficiency Service
       |
       +--> Validator
       |
       +--> KPI Calculator
       |
       +--> Trend Calculator
       |
       v
JSON Response
       |
       v
KPI Cards + Trend Dashboard
```

Reuse the existing backend and frontend infrastructure.

## 3. Backend Modules

```text
backend/
├── routes/operationsRoutes.js
├── controllers/operationsController.js
├── services/operationsEfficiencyService.js
├── ml/operationsKpiCalculator.js
├── ml/operationsTrendCalculator.js
└── utils/operationsValidator.js
```

The `ml/` directory is retained only to match the existing project structure. These modules are deterministic calculations and do not use machine learning.

## 4. API

### POST

`/api/operations/efficiency`

### Request

```json
{
  "facility": "Demo Hub",
  "startDate": "2026-08-25",
  "endDate": "2026-08-29",
  "records": [
    {
      "date": "2026-08-25",
      "inbound": 48000,
      "outbound": 45000,
      "processed": 46000,
      "availableCapacity": 50000,
      "availableWorkers": 28,
      "workingHours": 8,
      "onTimeProcessed": 43240,
      "exceptions": 320
    }
  ]
}
```

## 5. Response Structure

```json
{
  "success": true,
  "summary": {
    "totalInbound": 0,
    "totalOutbound": 0,
    "totalProcessed": 0,
    "capacityUtilizationPercent": 0,
    "throughput": 0,
    "workforceProductivity": 0,
    "onTimeRatePercent": 0,
    "exceptionRatePercent": 0
  },
  "status": {
    "capacityUtilization": "HEALTHY",
    "onTimeRate": "HEALTHY",
    "exceptionRate": "HEALTHY"
  },
  "trends": [
    {
      "date": "2026-08-25",
      "inbound": 48000,
      "outbound": 45000,
      "processed": 46000,
      "capacityUtilizationPercent": 92,
      "throughput": 205.36,
      "onTimeRatePercent": 94,
      "exceptionRatePercent": 0.7
    }
  ],
  "latestTrend": {
    "metric": "onTimeRatePercent",
    "direction": "IMPROVING"
  }
}
```

## 6. Calculation Rules

All calculations must be deterministic.

Aggregate totals first where specified.

Capacity:

`Σ Processed / Σ Available Capacity × 100`

Worker hours per record:

`Available Workers × Working Hours`

Total worker hours:

`Σ Worker Hours`

Throughput:

`Σ Processed / Σ Worker Hours`

Workforce productivity:

`Σ Processed / Σ Worker Hours`

On-time:

`Σ On-Time Processed / Σ Processed × 100`

Exception rate:

`Σ Exceptions / Σ Processed × 100`

## 7. Daily Trend Calculation

For each date calculate:

- inbound
- outbound
- processed
- capacity utilization
- throughput
- on-time rate
- exception rate

If multiple records exist for the same date, aggregate them before calculating daily ratios.

## 8. Frontend Layout

```text
┌─────────────────────────────────────────────┐
│ Operations Efficiency                       │
│ Facility [Demo Hub]  Date Range [....]      │
└─────────────────────────────────────────────┘

OPERATIONS KPI

┌────────┐ ┌────────┐ ┌────────┐ ┌────────┐
│Inbound │ │Outbound│ │Processed│ │Capacity│
│  ...   │ │  ...   │ │   ...  │ │  ...   │
└────────┘ └────────┘ └────────┘ └────────┘

┌──────────┐ ┌──────────┐ ┌──────────┐
│Throughput│ │On-Time % │ │Exception%│
└──────────┘ └──────────┘ └──────────┘


OPERATIONS TRENDS

Metric:
[ Capacity Utilization ▼ ]

       Line Chart
   value over date


Latest Trend:
IMPROVING / DECLINING / STABLE
```

## 9. Chart

Use Recharts.

One main trend chart is sufficient.

Allow the user to change the displayed KPI using a dropdown.

No unnecessary charts.

## 10. Feature Integration

Do not tightly integrate with previous features yet.

The dashboard accepts manual operational data.

Later:

Feature 01 forecast → expected volume

Feature 02 workforce → workforce capacity

Feature 03 resource optimization → resource capacity

For this feature, keep the data-entry workflow independent.
