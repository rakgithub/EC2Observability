import { GetMetricDataCommand } from "@aws-sdk/client-cloudwatch";
import { cwClient } from "../aws";

export async function getMetrics(instanceId: string) {
  try {
    const command = new GetMetricDataCommand({
      MetricDataQueries: [
        {
          Id: "cpuUtilization",
          MetricStat: {
            Metric: {
              Namespace: "AWS/EC2",
              MetricName: "CPUUtilization",
              Dimensions: [{ Name: "InstanceId", Value: instanceId }],
            },
            Period: 300,
            Stat: "Average",
          },
          ReturnData: true,
        },
      ],

      StartTime: new Date(Date.now() - 5 * 60 * 1000),
      EndTime: new Date(),
    });
    const response = await cwClient.send(command);
    const metrics = response.MetricDataResults?.[0]?.Values || [];
    if (metrics.length < 2) {
      // fallback mock data
      const now = new Date();
      return Array.from({ length: 5 }).map((_, i) => ({
        Timestamp: new Date(now.getTime() - i * 5 * 60 * 1000).toISOString(),
        Average: Math.floor(Math.random() * 100), // random percentage
        Unit: "Percent",
        MetricName: [
          "CPUUtilization",
          "MemoryUtilization",
          "DiskReadOps",
          "NetworkIn",
          "NetworkOut",
        ][i % 5],
      }));
    }
    return metrics.map((value, index) => ({
      Timestamp:
        response.MetricDataResults?.[0]?.Timestamps?.[index]?.toISOString() ||
        "",
      Average: value || 0,
      Unit: "Percent",
    }));
  } catch (err) {
    console.error("Error fetching metrics:", err);
    throw new Error("Failed to fetch metrics");
  }
}
