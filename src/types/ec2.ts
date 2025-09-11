export interface EC2Instance {
  id: string;
  region: string;
  type: string;
  cpu?: number;
  ram?: number;
  uptimeHours?: number;
  costPerHour?: number;
  launchTime?: string;
  gpu?: number;
  computedUptimeHours?: number;
}

export interface MetricDatapoint {
  Timestamp: string;
  Average: number;
  Unit: string;
}

export interface ChartDataItem {
  name: string;
  cost: number;
}
