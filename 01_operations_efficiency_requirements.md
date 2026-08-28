# Feature 04 — Operations Efficiency Dashboard Requirements

## 1. Purpose

Provide a simple operational dashboard that shows current operational performance through KPIs and explains how those KPIs change over time through trend analysis.

The feature has two sections:

1. Operations KPI Dashboard
2. Operations Trend Dashboard

## 2. Problem

Operational teams need a quick way to understand whether daily operations are performing efficiently.

The dashboard should answer:

- How much volume was received?
- How much volume was processed?
- How efficiently is available capacity being used?
- How productive is the workforce?
- How much work is processed on time?
- How many exceptions are occurring?
- Are these metrics improving or worsening over time?

## 3. Scope

### Included

- Planning/analysis date
- Custom date range
- Facility selection
- Manual operational data entry
- Dynamic rows
- Operations KPI calculations
- KPI status indicators
- KPI comparison with previous period where data is available
- Operations trend charts
- Daily KPI trend analysis
- Demo data
- Input validation
- Automated tests
- Responsive UPS-inspired UI

### Excluded

- Shift planning
- Employee-level performance evaluation
- Route optimization
- Resource optimization logic from Feature 03
- AI-generated KPI calculations
- Gemini/NVIDIA/OpenRouter calls
- Supabase persistence
- Real-time streaming
- Predictive analytics
- Complex statistical analysis
- Feature 05 and later features

## 4. User Input

The user should be able to enter operational records.

| Field | Rules |
|---|---|
| Date | Required valid date |
| Facility | Required |
| Inbound Volume | Number >= 0 |
| Outbound Volume | Number >= 0 |
| Processed Volume | Number >= 0 |
| Available Capacity | Number > 0 |
| Available Workers | Integer >= 0 |
| Working Hours | Number > 0 |
| On-Time Processed Volume | Number >= 0 and <= Processed Volume |
| Exception Count | Integer >= 0 |

The user must be able to:

- Add row
- Delete row
- Edit row
- Load demo data
- Clear data
- Select a date range
- Select a facility
- Generate/update dashboard

## 5. KPI Definitions

### 5.1 Total Inbound Volume

Sum of inbound volume during the selected period.

`Total Inbound = Σ Inbound`

### 5.2 Total Outbound Volume

Sum of outbound volume during the selected period.

`Total Outbound = Σ Outbound`

### 5.3 Total Processed Volume

Sum of processed volume.

`Total Processed = Σ Processed`

### 5.4 Capacity Utilization

`Capacity Utilization = Total Processed / Total Available Capacity × 100`

The aggregation should use total processed divided by total capacity rather than averaging daily percentages.

### 5.5 Throughput Rate

Throughput represents processed volume per working hour.

`Throughput = Total Processed / Total Working Hours`

If working hours are derived from workers:

`Total Working Hours = Σ (Available Workers × Working Hours)`

If the dataset provides the required fields, use this deterministic calculation.

### 5.6 Workforce Productivity

`Workforce Productivity = Total Processed / Total Worker Hours`

Worker hours:

`Worker Hours = Available Workers × Working Hours`

### 5.7 On-Time Processing Rate

`On-Time Rate = Total On-Time Processed / Total Processed × 100`

If processed volume is zero, return 0% or unavailable according to the implementation convention. Do not divide by zero.

### 5.8 Exception Rate

`Exception Rate = Total Exceptions / Total Processed × 100`

If processed volume is zero, return 0% or unavailable according to the implementation convention.

## 6. KPI Status

Use simple thresholds.

### Capacity Utilization

- < 70% → LOW
- 70%–90% → HEALTHY
- > 90% → HIGH

### On-Time Processing

- >= 95% → HEALTHY
- 90%–94.99% → WARNING
- < 90% → CRITICAL

### Exception Rate

- <= 1% → HEALTHY
- > 1% and <= 3% → WARNING
- > 3% → CRITICAL

For volume and throughput KPIs, display the value and trend rather than forcing an arbitrary health status.

## 7. Trend Analysis

The Trend Dashboard should show daily values for:

- Inbound Volume
- Outbound Volume
- Processed Volume
- Capacity Utilization
- Throughput
- On-Time Rate
- Exception Rate

The user should be able to select the KPI to display.

The chart must use chronological dates.

## 8. Trend Direction

Compare the latest available value with the previous available value.

For metrics where higher is better:

- increase → IMPROVING
- decrease → DECLINING
- equal → STABLE

For metrics where lower is better, such as Exception Rate:

- decrease → IMPROVING
- increase → DECLINING
- equal → STABLE

## 9. Period Summary

Display:

- Selected date range
- Number of operational days
- KPI values
- Latest trend direction
- Highest/lowest relevant daily values where useful

## 10. Definition of Done

- User can enter operational data manually.
- User can add/delete/edit rows.
- Date range filtering works.
- KPI calculations are correct.
- KPI status is correct.
- Trend charts are chronological.
- Trend direction is correct.
- Zero-division cases are handled.
- Validation works in frontend and backend.
- Demo data works.
- Tests pass.
- No AI API is required.
- Existing Features 01–03 remain functional.
