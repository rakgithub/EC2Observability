export function mockCostData(granularity?: "DAILY" | "HOURLY") {
  const now = new Date('2025-09-12T10:00:00Z');
  const dailyData = [];
  const hourlyData = [];
  
  // Base cost for demonstrating a gradual rise before a sudden spike.
  const baseDailyCost = [100, 110, 120, 130, 140, 150, 160]; 
  
  // Generate mock data for the last 7 days.
  for (let i = 6; i >= 0; i--) {
    const day = new Date(now);
    day.setDate(now.getDate() - i);
    const dateString = day.toISOString().split("T")[0];
    let dailySpend;

    if (i < baseDailyCost.length) {
      dailySpend = baseDailyCost[i];
    } else {
      dailySpend = 100 + Math.random() * 20;
    }

    // Spike on the second to last day (i=1). This creates a spike
    // in daily burn and a spike in the rate of change for total spend.
    if (i === 1) {
      dailySpend = 300 + Math.random() * 10;
    }

    dailyData.push({
      TimePeriod: {
        Start: dateString,
        End: dateString,
      },
      Total: {
        UnblendedCost: {
          Amount: dailySpend.toFixed(2),
          Unit: "USD",
        },
      },
      Groups: [
        { Keys: ["us-east-1"], Metrics: { UnblendedCost: { Amount: (dailySpend * 0.6).toFixed(2) } } },
        { Keys: ["us-west-1"], Metrics: { UnblendedCost: { Amount: (dailySpend * 0.4).toFixed(2) } } },
      ],
    });
  }

  // Generate mock data for the last 24 hours with a clear spike.
  for (let i = 23; i >= 0; i--) {
    const hour = new Date(now);
    hour.setHours(now.getHours() - i);
    const dateString = hour.toISOString();
    let hourlySpend = 5 + Math.random() * 5;
    
    // Create a spike at a specific hour
    if (i === 5) {
      hourlySpend = 30 + Math.random() * 5; 
    }
    hourlyData.push({
      TimePeriod: {
        Start: dateString,
        End: dateString,
      },
      Total: {
        UnblendedCost: {
          Amount: hourlySpend.toFixed(2),
          Unit: "USD",
        },
      },
      Groups: [
        { Keys: ["t2.micro"], Metrics: { UnblendedCost: { Amount: (hourlySpend * 0.6).toFixed(2) } } },
        { Keys: ["c5.large"], Metrics: { UnblendedCost: { Amount: (hourlySpend * 0.4).toFixed(2) } } },
      ],
    });
  }
  if (granularity === "HOURLY") {
    return hourlyData;
  }
  return dailyData;
}

export function mockInstancesData() {
  return {
    instances: [
      {
        id: "i-0abcd1234efgh5678",
        region: "us-east-1",
        type: "t2.micro",
        launchTime: "2024-09-01T10:00:00Z",
        tags: [{ Key: "Name", Value: "web-server-01" }],
      },
      {
        id: "i-2abcd1234efgh5678",
        region: "us-west-2",
        type: "g5.xlarge",
        launchTime: "2024-09-05T15:00:00Z",
        tags: [{ Key: "Name", Value: "ml-worker-01" }],
      },
      {
        id: "i-3abcd1234efgh5678",
        region: "eu-central-1",
        type: "m5.large",
        launchTime: "2024-09-10T08:00:00Z",
        tags: [{ Key: "Name", Value: "database-server" }],
      },
      {
        id: "i-4abcd1234efgh5678",
        region: "us-east-1",
        type: "c6i.2xlarge",
        launchTime: "2024-09-08T12:00:00Z",
        tags: [{ Key: "Name", Value: "compute-cluster-node" }],
      },
      {
        id: "i-5abcd1234efgh5678",
        region: "us-west-2",
        type: "t3.medium",
        launchTime: "2024-09-09T18:00:00Z",
        tags: [{ Key: "Name", Value: "batch-processor-01" }],
      },
      {
        id: "i-6abcd1234efgh5678", // NEW: Instance to be flagged as waste.
        region: "us-east-1",
        type: "c5.large",
        launchTime: "2024-09-11T08:00:00Z", // Uptime > 24 hours
        tags: [{ Key: "Name", Value: "underutilized-app-server" }],
      },
    ],
  };
}


export function getMockMetrics(metricName: string, instanceId: string) {
  const baseTimestamp = Date.now();
  const timestamps = [];
  const values = [];
  const numDataPoints = 60; // Simulate one data point every minute for the last hour.

  for (let i = 0; i < numDataPoints; i++) {
    timestamps.push(new Date(baseTimestamp - (numDataPoints - 1 - i) * 60 * 1000));
    let value;

    // Simulate different usage patterns for each instance and metric.
    switch (metricName) {
      case "CPUUtilization":
         if (instanceId === "i-0abcd1234efgh5678") {
          value = 30 + Math.random() * 10;
        } else if (instanceId === "i-4abcd1234efgh5678") {
          value = 10 + Math.random() * 0.01; 
        } else if (instanceId === "i-5abcd1234efgh5678") {
          value = Math.random() > 0.5 ? 20 + Math.random() * 10 : 70 + Math.random() * 20;
        } else {
          value = Math.random() * 0.02; 
        }
        break;

      case "MemoryUtilization":
        if (instanceId === "i-0abcd1234efgh5678") {
          value = 800 + Math.random() * 0.01; 
        } else if (instanceId === "i-2abcd1234efgh5678") {
          value = 85 + Math.random() * 0.01; 
        } else {
          value = Math.random() * 0.03; 
        }
        break;

      case "GPUUtilization":
        if (instanceId === "i-2abcd1234efgh5678") {
          value = 1 + Math.random() * 0.2;
          if (i >= 40 && i <= 45) {
            value = 80 + Math.random() * 10;
          }
        } else {
          value = 0;
        }
        break;

      default:
        value = 10 + Math.random() * 4; 
        break;
    }
    values.push(value);
  }

  return {
    MetricDataResults: [
      {
        Id: metricName.toLowerCase(),
        Timestamps: timestamps,
        Values: values,
      },
    ],
  };
}

export function getMockMetricsData(metricName: string, instanceId: string) {
    const mockResponse = getMockMetrics(metricName, instanceId);
    const metrics = mockResponse.MetricDataResults?.[0]?.Values || [];
    const timestamps = mockResponse.MetricDataResults?.[0]?.Timestamps || [];

    return metrics.map((value: number, index: number) => ({
        Timestamp: timestamps[index]?.toISOString() || "",
        Average: value || 0,
        Unit: "Percent",
    }));
}