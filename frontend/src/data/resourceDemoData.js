/**
 * Demo default inputs for Feature 03: Resource Optimization Engine
 */

export const RESOURCE_DEMO_DATA = {
  planningDate: '2026-08-29',
  facility: 'Demo Hub',
  forecastedVolume: 50000,
  resources: [
    {
      id: 'res-1',
      name: 'Processing Capacity',
      unit: 'packages/day',
      required: 50000,
      available: 40000
    },
    {
      id: 'res-2',
      name: 'Vehicles',
      unit: 'vehicles',
      required: 100,
      available: 80
    },
    {
      id: 'res-3',
      name: 'Equipment',
      unit: 'units',
      required: 35,
      available: 30
    }
  ]
};
