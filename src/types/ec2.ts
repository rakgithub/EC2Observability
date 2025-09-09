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
}
