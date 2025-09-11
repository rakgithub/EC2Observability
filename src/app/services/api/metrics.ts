import { GetMetricDataCommand } from "@aws-sdk/client-cloudwatch";
import { cwClient } from "../aws";
import { USE_MOCK_DATA } from "@/config";
import {getMockMetricsData } from "@/mockData/mock";

export async function getMetrics(instanceId: string, metricName: string) {
  try {
    // MOCK DATA
   if (USE_MOCK_DATA) {
     return getMockMetricsData(instanceId, metricName);
    }
    const command = new GetMetricDataCommand({
      MetricDataQueries: [
        {
          Id: "cpuUtilization",
          MetricStat: {
            Metric: {
              Namespace: "AWS/EC2",
              MetricName: metricName,
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
