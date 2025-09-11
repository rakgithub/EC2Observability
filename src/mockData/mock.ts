import { GetMetricDataCommandOutput } from "@aws-sdk/client-cloudwatch";

export const mockCostData = () => {
  // Realistic EC2 instance pricing (USD/hour, us-east-1 On-Demand)
  const instancePricing = {
    "t2.micro": 0.0116,
    "t3.medium": 0.0416,
    "m5.large": 0.096,
    "c5.xlarge": 0.17,
    "r5.large": 0.126,
  };

  // Simulated instance counts per type
  const instanceCounts = {
    "t2.micro": 10, // Low-cost, general-purpose
    "t3.medium": 5,
    "m5.large": 3,
    "c5.xlarge": 2, // Compute-intensive
    "r5.large": 2, // Memory-intensive
  };

  // Simulated utilization states (busy/idle percentages)
  const instanceUtilization = {
    "t2.micro": { busy: 0.7, idle: 0.3 }, // 70% busy, 30% idle
    "t3.medium": { busy: 0.6, idle: 0.4 },
    "m5.large": { busy: 0.8, idle: 0.2 },
    "c5.xlarge": { busy: 0.9, idle: 0.1 }, // Compute-intensive, high utilization
    "r5.large": { busy: 0.75, idle: 0.25 }, // Memory-intensive
  };

  // Simulate 7 days of usage history with anomalies
  const mockHistory = Array.from({ length: 7 }).map((_, i) => {
    const day = new Date();
    day.setDate(day.getDate() - (6 - i));
    // Base daily cost: sum of (instance count * hourly rate * hours/day * fluctuation * utilization)
    let dailyCost = Object.entries(instanceCounts).reduce(
      (sum, [type, count]) => {
        const hourlyRate =
          instancePricing[type as keyof typeof instancePricing];
        const utilization =
          instanceUtilization[type as keyof typeof instanceUtilization];
        const hoursPerDay = 24; // Assume full billing period
        const fluctuation = 0.9 + Math.random() * 0.2; // ±10% variability
        // Only bill for busy time (idle instances still incur cost but we weight by utilization)
        const effectiveCost =
          count * hourlyRate * hoursPerDay * utilization.busy * fluctuation;
        return sum + effectiveCost;
      },
      0
    );

    // Inject anomalies on specific days
    let anomalyMultiplier = 1;
    let anomalyReason = "";
    let anomalyType = "";
    let relatedEntity:
      | { region?: string; type?: string; job?: string }
      | undefined;

    if (i === 3) {
      // Spike on day 4 (e.g., ML job in us-east-1)
      anomalyMultiplier = 2.5; // 2.5x cost
      anomalyReason =
        "Unusual ML Training job in us-east-1 with high c5.xlarge utilization";
      anomalyType = "spike";
      relatedEntity = {
        region: "us-east-1",
        job: "ML Training",
        type: "c5.xlarge",
      };
      dailyCost *= anomalyMultiplier;
    } else if (i === 5) {
      // Drop on day 6 (e.g., stopped instances)
      anomalyMultiplier = 0.4; // 40% of normal cost
      anomalyReason =
        "Stopped c5.xlarge instances in ap-south-1, low utilization";
      anomalyType = "drop";
      relatedEntity = { region: "ap-south-1", type: "c5.xlarge" };
      dailyCost *= anomalyMultiplier;
    }

    return {
      Timestamp: day.toISOString().split("T")[0],
      Average: Math.round(dailyCost * 100) / 100,
      anomaly:
        anomalyMultiplier !== 1
          ? { type: anomalyType, reason: anomalyReason, relatedEntity }
          : undefined,
      utilization: Object.fromEntries(
        Object.entries(instanceUtilization).map(([type, { busy, idle }]) => [
          type,
          {
            busy: Math.round(busy * 100) / 100,
            idle: Math.round(idle * 100) / 100,
          },
        ])
      ),
    };
  });

  // Extract anomalies
  const anomalies = mockHistory
    .filter((h) => h.anomaly)
    .map((h) => ({
      Timestamp: h.Timestamp,
      value: h.Average,
      type: h.anomaly!.type,
      reason: h.anomaly!.reason,
      relatedEntity: h.anomaly!.relatedEntity,
    }));

  // Total spend history: cumulative sum
  const totalSpendHistory = mockHistory.map((h, i) => ({
    Timestamp: h.Timestamp,
    Average:
      Math.round(
        mockHistory.slice(0, i + 1).reduce((sum, d) => sum + d.Average, 0) * 100
      ) / 100,
  }));

  const dailyBurnHistory = mockHistory.map(
    ({ Timestamp, Average, utilization }) => ({
      Timestamp,
      Average,
      utilization,
    })
  );

  // Projected monthly: average daily cost * 30 days
  const projectedMonthlyHistory = mockHistory.map((h, i) => {
    const cumulative = mockHistory
      .slice(0, i + 1)
      .reduce((sum, d) => sum + d.Average, 0);
    const avgDaily = cumulative / (i + 1);
    return {
      Timestamp: h.Timestamp,
      Average: Math.round(avgDaily * 30 * 100) / 100, // 30-day projection
    };
  });

  // Calculate total spend (sum of daily costs)
  const totalSpend =
    Math.round(mockHistory.reduce((sum, d) => sum + d.Average, 0) * 100) / 100;

  // Calculate trends based on history
  const calculateTrend = (
    history: { Timestamp: string; Average: number }[]
  ) => {
    if (history.length < 2) return "neutral";
    const first = history[0].Average;
    const last = history[history.length - 1].Average;
    const change = ((last - first) / first) * 100;
    return change > 5 ? "up" : change < -5 ? "down" : "neutral";
  };

  const unattributedPercentage = 0.2; // 20% of total spend is "unattributed"
  const unattributedCost = totalSpend * unattributedPercentage;
  const attributedSpend = totalSpend - unattributedCost;
  // Distribute total spend across regions with anomaly adjustments
  const regions = [
    { name: "us-east-1", weight: 0.4 }, // Higher usage
    { name: "us-west-2", weight: 0.25 },
    { name: "eu-west-1", weight: 0.2 },
    { name: "ap-south-1", weight: 0.1 },
    { name: "ap-northeast-1", weight: 0.05 },
  ];
  const byRegion = regions.map((region, i) => {
    let cost = attributedSpend * region.weight;
    // Apply anomaly impact (e.g., us-east-1 spike on day 4)
    if (region.name === "us-east-1" && mockHistory[3].anomaly) {
      cost += mockHistory[3].Average * 0.5;
    } else if (region.name === "ap-south-1" && mockHistory[5].anomaly) {
      cost -= mockHistory[5].Average * 0.2;
    }
    return { name: region.name, cost: Math.round(cost * 100) / 100 };
  });

  // Distribute total spend across instance types with utilization
  const byType = Object.entries(instanceCounts).map(([type, count]) => {
    const utilization =
      instanceUtilization[type as keyof typeof instanceUtilization];
    let cost =
      count *
      instancePricing[type as keyof typeof instancePricing] *
      24 *
      7 *
      utilization.busy *
      (attributedSpend / (totalSpend > 0 ? totalSpend : 1)); // Scale cost to attributedSpend
    // Apply anomaly impact (e.g., c5.xlarge drop on day 6)
    if (type === "c5.xlarge" && mockHistory[5].anomaly) {
      cost -= mockHistory[5].Average * 0.3;
    }
    return {
      name: type,
      cost: Math.round(cost * 100) / 100,
      utilization: { busy: utilization.busy, idle: utilization.idle },
    };
  });

  // Distribute total spend across jobs
  const jobs = [
    { name: "Web Servers", weight: 0.35 },
    { name: "ML Training", weight: 0.3 },
    { name: "Database", weight: 0.2 },
    { name: "Analytics", weight: 0.1 },
    { name: "Dev Environment", weight: 0.05 },
  ];
  const byJob = jobs.map((job) => {
    let cost = attributedSpend * job.weight; // Scale cost to attributedSpend
    // Apply anomaly impact (e.g., ML Training spike on day 4)
    if (job.name === "ML Training" && mockHistory[3].anomaly) {
      cost += mockHistory[3].Average * 0.4;
    }
    return { name: job.name, cost: Math.round(cost * 100) / 100 };
  });

  // Previous period values (10% lower, excluding anomalies)
  const previousTotalSpend = Math.round(totalSpend * 0.9 * 100) / 100;
  const previousDailyBurn = Math.round((totalSpend / 7) * 0.9 * 100) / 100;
  const previousProjectedMonthly =
    Math.round((totalSpend / 7) * 30 * 0.9 * 100) / 100;

  // Utilization summary across all instances
  const utilizationSummary = Object.fromEntries(
    Object.entries(instanceUtilization).map(([type, { busy, idle }]) => [
      type,
      {
        busy: Math.round(busy * 100) / 100,
        idle: Math.round(idle * 100) / 100,
      },
    ])
  );

  return {
    totalSpend,
    totalSpendTrend: calculateTrend(totalSpendHistory),
    dailyBurn:
      Math.round(mockHistory[mockHistory.length - 1].Average * 100) / 100,
    dailyBurnTrend: calculateTrend(dailyBurnHistory),
    projectedMonthly:
      Math.round(
        projectedMonthlyHistory[projectedMonthlyHistory.length - 1].Average *
          100
      ) / 100,
    projectedMonthlyTrend: calculateTrend(projectedMonthlyHistory),
    byRegion,
    byType,
    byJob,
    previousTotalSpend,
    previousDailyBurn,
    previousProjectedMonthly,
    anomalies,
    mock: true,
    totalSpendHistory,
    dailyBurnHistory,
    projectedMonthlyHistory,
    utilizationSummary,
  };
};

const getRandomFloat = (min: number, max: number): number => {
  return Math.random() * (max - min) + min;
};

export const getMockMetrics = (
  metricName: string
): GetMetricDataCommandOutput => {
  const dataPointsCount = 5;
  const values: number[] = [];
  const timestamps: Date[] = [];
  const now = Date.now();

  let min, max;
  if (metricName === "CPUUtilization") {
    min = 5;
    max = 95;
  } else if (metricName === "MemoryUtilization") {
    min = 10;
    max = 90;
  } else if (metricName === "GPUUtilization") {
    min = 1;
    max = 99;
  } else {
    min = 0;
    max = 100;
  }

  for (let i = 0; i < dataPointsCount; i++) {
    // Generate timestamps at 5-minute intervals
    timestamps.push(new Date(now - i * 5 * 60 * 1000));
    // Generate a random average value within the specified range
    values.push(getRandomFloat(min, max));
  }
  return {
    MetricDataResults: [
      {
        Id: metricName.toLowerCase(),
        Values: values,
        Timestamps: timestamps,
      },
    ],
    $metadata: {},
  };
};
