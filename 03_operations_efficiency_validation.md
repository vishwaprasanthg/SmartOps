# Feature 04 — Operations Efficiency Dashboard Validation

## 1. Input Validation

Return HTTP 400 for:

- missing facility
- invalid start date
- invalid end date
- start date after end date
- missing records
- empty records
- invalid record date
- duplicate dates if the UI/API contract requires one row per date
- negative inbound
- negative outbound
- negative processed volume
- zero/negative available capacity
- negative workers
- fractional workers
- zero/negative working hours
- negative on-time processed volume
- on-time processed greater than processed
- negative exception count
- non-numeric values
- NaN

## 2. Calculation Tests

### Test 1 — Basic totals

Given:

```text
Inbound = 48,000
Outbound = 45,000
Processed = 46,000
Capacity = 50,000
Workers = 28
Hours = 8
On-Time = 43,240
Exceptions = 320
```

Expected:

```text
Capacity utilization = 92%
Worker hours = 224
Throughput = 205.357... packages/hour
Workforce productivity = 205.357... packages/worker-hour
On-Time rate = 94%
Exception rate ≈ 0.6957%
```

## 3. Multiple-Day Aggregation

Use at least three days.

Verify that:

- totals are summed
- ratio KPIs use aggregate numerators/denominators
- daily trend values remain date-specific
- dates are sorted chronologically

## 4. Capacity Status

Test:

```text
69% → LOW
70% → HEALTHY
90% → HEALTHY
90.01% → HIGH
```

## 5. On-Time Status

Test:

```text
95% → HEALTHY
94.99% → WARNING
90% → WARNING
89.99% → CRITICAL
```

## 6. Exception Status

Test:

```text
1% → HEALTHY
1.01% → WARNING
3% → WARNING
3.01% → CRITICAL
```

## 7. Trend Tests

For a higher-is-better metric:

```text
Previous = 90
Latest = 95
Expected = IMPROVING
```

```text
Previous = 95
Latest = 90
Expected = DECLINING
```

```text
Previous = 90
Latest = 90
Expected = STABLE
```

For Exception Rate, lower is better:

```text
Previous = 2%
Latest = 1%
Expected = IMPROVING
```

```text
Previous = 1%
Latest = 2%
Expected = DECLINING
```

## 8. Zero-Division Tests

If processed = 0:

- on-time rate must not throw an exception
- exception rate must not throw an exception

If worker hours = 0:

- throughput/productivity must not throw an exception

Use a defined unavailable/zero representation consistently.

## 9. Determinism

Identical input must produce identical:

- KPI values
- status
- trend values
- trend direction

## 10. UI Tests

Verify:

- date range selection
- facility selection
- dynamic row entry
- add/delete/edit
- demo data
- KPI cards
- status badges
- metric selector
- trend chart
- chronological dates
- empty-state handling
- validation messages
- loading state
- API error state

No shift controls and no AI calls.
