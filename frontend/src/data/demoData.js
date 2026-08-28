/**
 * Demo historical operational volume records and default parameters
 */

export const DEFAULT_REFERENCE_DATE = '2026-08-28';
export const DEFAULT_HISTORICAL_MONTH = '2026-08';
export const DEFAULT_FORECAST_MONTH = '2026-09';
export const DEFAULT_HORIZON = 7;

export const INITIAL_DEMO_DATA = [
  { id: 'row-1', date: '2026-08-01', inbound: 45000, outbound: 42000, inventory: 30000 },
  { id: 'row-2', date: '2026-08-02', inbound: 47000, outbound: 44000, inventory: 32000 },
  { id: 'row-3', date: '2026-08-03', inbound: 52000, outbound: 48000, inventory: 34000 },
  { id: 'row-4', date: '2026-08-04', inbound: 49000, outbound: 51000, inventory: 33000 },
  { id: 'row-5', date: '2026-08-05', inbound: 51000, outbound: 50000, inventory: 35000 },
  { id: 'row-6', date: '2026-08-06', inbound: 53000, outbound: 52000, inventory: 36000 },
  { id: 'row-7', date: '2026-08-07', inbound: 55000, outbound: 54000, inventory: 37000 }
];

export const DEMO_FACILITIES = [
  { id: 'demo-hub', name: 'Demo Hub' },
  { id: 'atl-hub', name: 'Atlanta Air Hub (ATL)' },
  { id: 'chi-ground', name: 'Chicago Ground Hub (ORD)' },
  { id: 'sdf-worldport', name: 'Louisville Worldport (SDF)' }
];
