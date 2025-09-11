import { EC2Instance } from "@/types/ec2";
import { GetMetricDataCommandOutput } from "@aws-sdk/client-cloudwatch";

export const mockCostData1 = () => {
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

export const getMockMetrics1 = (
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
    timestamps.push(new Date(now - i * 5 * 60 * 1000));
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

export interface InstanceData {
  id: string;
  region: string;
  type: string;
  launchTime: string;
}

export const getMockInstances = (): {instances: InstanceData[]} => {
  const instances = [
  {
    id: "i-0abcd1234efgh5678",
    region: "us-east-1",
    type: "t2.micro",
    launchTime: "2023-08-15T12:00:00.000Z",
  },
  {
    id: "i-1bcde2345fghj6789",
    region: "us-east-1",
    type: "m5.large",
    launchTime: "2023-07-20T08:45:00.000Z",
  },
  {
    id: "i-2efgh3456ijkm7890",
    region: "us-west-2",
    type: "t3.medium",
    launchTime: "2023-09-01T09:30:00.000Z",
  },
  {
    id: "i-3ghij4567klmn8901",
    region: "eu-central-1",
    type: "c5.xlarge",
    launchTime: "2023-06-10T10:15:00.000Z",
  },
  {
    id: "i-4ijkl5678mnop9012",
    region: "ap-southeast-1",
    type: "r5.2xlarge",
    launchTime: "2023-05-22T13:45:00.000Z",
  },
  {
    id: "i-5mnop6789qrst0123",
    region: "us-east-1",
    type: "t3a.nano",
    launchTime: "2023-07-04T14:00:00.000Z",
  },
  {
    id: "i-6opqrs7890tuvw1234",
    region: "us-west-1",
    type: "m6g.medium",
    launchTime: "2023-04-18T11:25:00.000Z",
  },
];

return {instances: instances}
}

export const mockInstances: EC2Instance[] = [
  {
    id: "i-0abcd1234efgh5678",
    region: "us-east-1",
    type: "t2.micro",
    cpu: 1.2,
    ram: 1,
    uptimeHours: 120,
    costPerHour: 0.0116,
    launchTime: "2023-08-01T12:00:00.000Z",
    gpu: 0,
    computedUptimeHours: 120,
  },
  {
    id: "i-1bcde2345fghj6789",
    region: "us-west-2",
    type: "m5.large",
    cpu: 2.8,
    ram: 8,
    uptimeHours: 500,
    costPerHour: 0.096,
    launchTime: "2023-07-15T09:30:00.000Z",
    gpu: 0,
    computedUptimeHours: 500,
  },
  {
    id: "i-2efgh3456ijkm7890",
    region: "eu-west-1",
    type: "c5.xlarge",
    cpu: 4.5,
    ram: 8,
    uptimeHours: 150,
    costPerHour: 0.17,
    launchTime: "2023-08-10T14:00:00.000Z",
    gpu: 0,
    computedUptimeHours: 150,
  },
  {
    id: "i-3ghij4567klmn8901",
    region: "ap-south-1",
    type: "r5.2xlarge",
    cpu: 16,
    ram: 64,
    uptimeHours: 800,
    costPerHour: 0.252,
    launchTime: "2023-05-20T11:00:00.000Z",
    gpu: 0,
    computedUptimeHours: 800,
  },
  {
    id: "i-4ijkl5678mnop9012",
    region: "us-east-1",
    type: "g4dn.xlarge",
    cpu: 6.4,
    ram: 16,
    uptimeHours: 1000,
    costPerHour: 0.526,
    launchTime: "2023-04-10T10:30:00.000Z",
    gpu: 1,
    computedUptimeHours: 1000,
  },
  {
    id: "i-5mnop6789qrst0123",
    region: "us-west-1",
    type: "m5.large",
    cpu: 2.2,
    ram: 8,
    uptimeHours: 200,
    costPerHour: 0.096,
    launchTime: "2023-07-25T13:00:00.000Z",
    gpu: 0,
    computedUptimeHours: 200,
  },
  {
    id: "i-6opqrs7890tuvw1234",
    region: "ap-northeast-1",
    type: "t3.medium",
    cpu: 2.5,
    ram: 8,
    uptimeHours: 300,
    costPerHour: 0.0416,
    launchTime: "2023-06-12T16:45:00.000Z",
    gpu: 0,
    computedUptimeHours: 300,
  },
];

export function mockCostData() {
  // Example of mock data in the same format as the AWS Cost Explorer response
  return [
    {
      TimePeriod: {
        Start: "2023-08-01",
        End: "2023-08-01",
      },
      Total: {
        UnblendedCost: {
          Amount: "500.00",
          Unit: "USD",
        },
      },
      Groups: [
        {
          Keys: ["us-east-1"],
          Metrics: {
            UnblendedCost: {
              Amount: "750.00",
              Unit: "USD",
            },
          },
        },
        {
          Keys: ["us-west-1"],
          Metrics: {
            UnblendedCost: {
              Amount: "490.00",
              Unit: "USD",
            },
          },
        },
      ],
    },
    {
      TimePeriod: {
        Start: "2023-08-02",
        End: "2023-08-02",
      },
      Total: {
        UnblendedCost: {
          Amount: "400.00",
          Unit: "USD",
        },
      },
      Groups: [
        {
          Keys: ["us-east-1"],
          Metrics: {
            UnblendedCost: {
              Amount: "370.00",
              Unit: "USD",
            },
          },
        },
        {
          Keys: ["us-west-1"],
          Metrics: {
            UnblendedCost: {
              Amount: "260.00",
              Unit: "USD",
            },
          },
        },
      ],
    },
    {
      TimePeriod: {
        Start: "2023-08-02",
        End: "2023-08-02",
      },
      Total: {
        UnblendedCost: {
          Amount: "400.00",
          Unit: "USD",
        },
      },
      Groups: [
        {
          Keys: ["us-east-1"],
          Metrics: {
            UnblendedCost: {
              Amount: "300.00",
              Unit: "USD",
            },
          },
        },
        {
          Keys: ["SE-west-1"],
          Metrics: {
            UnblendedCost: {
              Amount: "250.00",
              Unit: "USD",
            },
          },
        },
      ],
    },
     {
      TimePeriod: {
        Start: "2023-08-02",
        End: "2023-08-02",
      },
      Total: {
        UnblendedCost: {
          Amount: "500.00",
          Unit: "USD",
        },
      },
      Groups: [
        {
          Keys: ["se-east-1"],
          Metrics: {
            UnblendedCost: {
              Amount: "120.00",
              Unit: "USD",
            },
          },
        },
        {
          Keys: ["se-east-1"],
          Metrics: {
            UnblendedCost: {
              Amount: "190.00",
              Unit: "USD",
            },
          },
        },
      ],
    },
  ];
}

export function mockInstancesData() {
  // Example of mock data in the same format as the AWS EC2 DescribeInstances response
  return {
    instances: [
      {
        id: "i-0abcd1234efgh5678",
        region: "us-east-1",
        type: "t2.micro",
        launchTime: "2023-08-15T10:00:00Z",
      },
      {
        id: "i-1abcd1234efgh5678",
        region: "us-east-1",
        type: "t2.small",
        launchTime: "2023-08-16T10:00:00Z",
      },
      {
        id: "i-2abcd1234efgh5678",
        region: "us-west-2",
        type: "m5.large",
        launchTime: "2023-08-17T10:00:00Z",
      },
      {
        id: "i-3abcd1234efgh5678",
        region: "us-west-2",
        type: "t3.medium",
        launchTime: "2023-08-18T10:00:00Z",
      },
    ],
  };
}


export function getMockMetrics(metricName: string, instanceId: string) {
  const baseTimestamp = Date.now() - 5 * 60 * 1000; // 5 minutes ago

  const mockData = {
    "CPUUtilization": {
      // Simulating varying CPU utilization over 5 minutes
      "i-0abcd1234efgh5678": {
        MetricDataResults: [
          {
            Id: "cpuUtilization",
            Timestamps: [
              new Date(baseTimestamp - 4 * 60 * 1000), // 4 minutes ago
              new Date(baseTimestamp - 3 * 60 * 1000), // 3 minutes ago
              new Date(baseTimestamp - 2 * 60 * 1000), // 2 minutes ago
              new Date(baseTimestamp - 1 * 60 * 1000), // 1 minute ago
              new Date(baseTimestamp), // current time
            ],
            Values: [10, 20, 15, 40, 35], // CPU utilization in percentage
          },
        ],
      },
      "i-0xyz9876mnop4321": {
        MetricDataResults: [
          {
            Id: "cpuUtilization",
            Timestamps: [
              new Date(baseTimestamp - 4 * 60 * 1000),
              new Date(baseTimestamp - 3 * 60 * 1000),
              new Date(baseTimestamp - 2 * 60 * 1000),
              new Date(baseTimestamp - 1 * 60 * 1000),
              new Date(baseTimestamp),
            ],
            Values: [50, 55, 40, 30, 60],
          },
        ],
      },
    },
    "DiskReadOps": {
      "i-0abcd1234efgh5678": {
        MetricDataResults: [
          {
            Id: "diskReadOps",
            Timestamps: [
              new Date(baseTimestamp - 4 * 60 * 1000),
              new Date(baseTimestamp - 3 * 60 * 1000),
              new Date(baseTimestamp - 2 * 60 * 1000),
              new Date(baseTimestamp - 1 * 60 * 1000),
              new Date(baseTimestamp),
            ],
            Values: [500, 450, 600, 550, 480], // Disk read operations count
          },
        ],
      },
      "i-0xyz9876mnop4321": {
        MetricDataResults: [
          {
            Id: "diskReadOps",
            Timestamps: [
              new Date(baseTimestamp - 4 * 60 * 1000),
              new Date(baseTimestamp - 3 * 60 * 1000),
              new Date(baseTimestamp - 2 * 60 * 1000),
              new Date(baseTimestamp - 1 * 60 * 1000),
              new Date(baseTimestamp),
            ],
            Values: [300, 320, 280, 350, 310], // Disk read operations count
          },
        ],
      },
    },
    "NetworkIn": {
      "i-0abcd1234efgh5678": {
        MetricDataResults: [
          {
            Id: "networkIn",
            Timestamps: [
              new Date(baseTimestamp - 4 * 60 * 1000),
              new Date(baseTimestamp - 3 * 60 * 1000),
              new Date(baseTimestamp - 2 * 60 * 1000),
              new Date(baseTimestamp - 1 * 60 * 1000),
              new Date(baseTimestamp),
            ],
            Values: [200, 180, 220, 210, 190], // Network traffic in bytes
          },
        ],
      },
      "i-0xyz9876mnop4321": {
        MetricDataResults: [
          {
            Id: "networkIn",
            Timestamps: [
              new Date(baseTimestamp - 4 * 60 * 1000),
              new Date(baseTimestamp - 3 * 60 * 1000),
              new Date(baseTimestamp - 2 * 60 * 1000),
              new Date(baseTimestamp - 1 * 60 * 1000),
              new Date(baseTimestamp),
            ],
            Values: [500, 550, 600, 520, 530], // Network traffic in bytes
          },
        ],
      },
    },
  };

  // Fetch the mock data for the specific instanceId and metricName
  return mockData[metricName]?.[instanceId] || {
    MetricDataResults: [
      {
        Id: "unknownMetric",
        Timestamps: [
          new Date(baseTimestamp - 4 * 60 * 1000),
          new Date(baseTimestamp - 3 * 60 * 1000),
          new Date(baseTimestamp - 2 * 60 * 1000),
          new Date(baseTimestamp - 1 * 60 * 1000),
          new Date(baseTimestamp),
        ],
        Values: [0, 0, 0, 0, 0],
      },
    ],
  };
}

export function getMockMetricsData(metricName: string, instanceId: string) {
    const mockResponse = getMockMetrics(metricName, instanceId); 
    const metrics = mockResponse.MetricDataResults?.[0]?.Values || [];
    return metrics.map((value: number, index: number) => ({
        Timestamp:
          mockResponse.MetricDataResults?.[0]?.Timestamps?.[index]?.toISOString() ||
          "",
        Average: value || 0,
        Unit: "Percent",
    }));
}

