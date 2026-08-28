/**
 * Resource Optimization Engine
 * Feature 03: Resource Optimization Engine
 * 
 * Deterministic, rule-based calculation and priority ranking.
 * 
 * Mathematical Formulas:
 * 1. Capacity Gap = Available Capacity - Required Capacity
 * 2. If Available < Required:
 *      Shortage = Required - Available, Surplus = 0, Status = 'SHORTAGE'
 *    If Available == Required:
 *      Shortage = 0, Surplus = 0, Status = 'BALANCED'
 *    If Available > Required:
 *      Shortage = 0, Surplus = Available - Required, Status = 'SURPLUS'
 * 3. Utilization % = (Required / Available) * 100
 *    - If Available == 0 and Required == 0: Utilization = 0%
 *    - If Available == 0 and Required > 0: Utilization = null (Unavailable)
 * 4. Relative Shortage % = (Shortage / Required) * 100
 * 5. Priority Ranking for Shortage Resources:
 *    - Sort descending by Relative Shortage %
 *    - Tie-breaker 1: Higher Absolute Shortage
 *    - Tie-breaker 2: Preserve original input order
 *    - Priority assignments: 1st => 'HIGH', 2nd => 'MEDIUM', 3rd+ => 'LOW'
 * 6. Recommendation:
 *    - Highlights the highest-priority shortage resource with actual name, unit, and shortage amount.
 *    - If no shortages: "All configured resources meet or exceed the required capacity."
 */

/**
 * Optimizes resources and computes deterministic gaps, utilization, and priorities.
 * 
 * @param {Array<{name: string, unit: string, required: number, available: number}>} resources
 * @returns {object} Processed resource list, highestPriorityResource, and recommendation
 */
function optimizeResources(resources) {
  if (!resources || !Array.isArray(resources)) {
    return {
      resources: [],
      highestPriorityResource: null,
      recommendation: 'No resources provided for optimization.'
    };
  }

  // 1. Compute individual metrics for every resource
  const evaluatedResources = resources.map((r, index) => {
    const required = Number(r.required);
    const available = Number(r.available);
    const gap = Math.round((available - required) * 100) / 100;

    let shortage = 0;
    let surplus = 0;
    let status = 'BALANCED';

    if (gap < 0) {
      shortage = Math.round((required - available) * 100) / 100;
      surplus = 0;
      status = 'SHORTAGE';
    } else if (gap > 0) {
      shortage = 0;
      surplus = Math.round((available - required) * 100) / 100;
      status = 'SURPLUS';
    } else {
      shortage = 0;
      surplus = 0;
      status = 'BALANCED';
    }

    // Utilization calculation
    let utilizationPercent = null;
    if (available > 0) {
      utilizationPercent = Math.round(((required / available) * 100) * 100) / 100;
    } else if (available === 0) {
      if (required === 0) {
        utilizationPercent = 0;
      } else {
        utilizationPercent = null; // Unavailable/Infinite
      }
    }

    // Relative shortage calculation
    let relativeShortagePercent = 0;
    if (status === 'SHORTAGE' && required > 0) {
      relativeShortagePercent = Math.round(((shortage / required) * 100) * 100) / 100;
    }

    return {
      originalIndex: index,
      name: r.name,
      unit: r.unit,
      required,
      available,
      gap,
      shortage,
      surplus,
      utilizationPercent,
      relativeShortagePercent,
      status,
      priority: null
    };
  });

  // 2. Rank shortage resources deterministically
  const shortageItems = evaluatedResources.filter(r => r.status === 'SHORTAGE');

  shortageItems.sort((a, b) => {
    // Primary: Relative shortage % descending
    if (b.relativeShortagePercent !== a.relativeShortagePercent) {
      return b.relativeShortagePercent - a.relativeShortagePercent;
    }
    // Tie-breaker 1: Absolute shortage descending
    if (b.shortage !== a.shortage) {
      return b.shortage - a.shortage;
    }
    // Tie-breaker 2: Preserve input order
    return a.originalIndex - b.originalIndex;
  });

  // 3. Assign priority labels
  shortageItems.forEach((item, rank) => {
    let priorityLabel = 'LOW';
    if (rank === 0) {
      priorityLabel = 'HIGH';
    } else if (rank === 1) {
      priorityLabel = 'MEDIUM';
    } else {
      priorityLabel = 'LOW';
    }
    item.priority = priorityLabel;
  });

  // Re-map back to preserve original list order with assigned priorities
  const shortagePriorityMap = new Map();
  shortageItems.forEach(item => {
    shortagePriorityMap.set(item.originalIndex, item.priority);
  });

  const finalResources = evaluatedResources.map(r => {
    const assignedPriority = shortagePriorityMap.get(r.originalIndex) || null;
    const { originalIndex, ...rest } = r;
    return {
      ...rest,
      priority: assignedPriority
    };
  });

  // 4. Determine highest priority resource & recommendation
  let highestPriorityResource = null;
  let recommendation = 'All configured resources meet or exceed the required capacity.';

  if (shortageItems.length > 0) {
    const topShortage = shortageItems[0];
    highestPriorityResource = topShortage.name;
    const formattedShortage = topShortage.shortage.toLocaleString();
    recommendation = `${topShortage.name} has the highest resource gap. Consider adding or reallocating ${formattedShortage} ${topShortage.unit}/equivalent capacity.`;
  }

  return {
    resources: finalResources,
    highestPriorityResource,
    recommendation
  };
}

module.exports = {
  optimizeResources
};
