/**
 * Demo default inputs for Feature 04: Operations Efficiency Dashboard
 */

export const OPERATIONS_DEMO_DATA = {
  facility: 'Demo Hub',
  startDate: '2026-08-25',
  endDate: '2026-08-29',
  records: [
    {
      id: 'op-1',
      date: '2026-08-25',
      inbound: 48000,
      outbound: 45000,
      processed: 46000,
      availableCapacity: 50000,
      availableWorkers: 28,
      workingHours: 8,
      onTimeProcessed: 43240,
      exceptions: 320
    },
    {
      id: 'op-2',
      date: '2026-08-26',
      inbound: 51000,
      outbound: 48000,
      processed: 49000,
      availableCapacity: 50000,
      availableWorkers: 28,
      workingHours: 8,
      onTimeProcessed: 47040,
      exceptions: 280
    },
    {
      id: 'op-3',
      date: '2026-08-27',
      inbound: 53000,
      outbound: 50000,
      processed: 51000,
      availableCapacity: 50000,
      availableWorkers: 30,
      workingHours: 8,
      onTimeProcessed: 48450,
      exceptions: 350
    },
    {
      id: 'op-4',
      date: '2026-08-28',
      inbound: 50000,
      outbound: 49000,
      processed: 49000,
      availableCapacity: 52000,
      availableWorkers: 29,
      workingHours: 8,
      onTimeProcessed: 46550,
      exceptions: 250
    },
    {
      id: 'op-5',
      date: '2026-08-29',
      inbound: 54000,
      outbound: 51000,
      processed: 52000,
      availableCapacity: 55000,
      availableWorkers: 30,
      workingHours: 8,
      onTimeProcessed: 49920,
      exceptions: 220
    }
  ]
};
