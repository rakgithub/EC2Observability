export const LABELS = {
  INSTANCE_ID: "Instance ID",
  REGION: "Region",
  TYPE: "Type",
  CPU_USAGE: "CPU Usage (%)",
  RAM_USAGE: "RAM Usage (%)",
  GPU_USAGE: "GPU Usage (%)",
  UPTIME: "Uptime (h)",
  COST_PER_HOUR: "Cost/hr",
  STATUS: "Status",
  ACTION: "Action",
  CPU_USAGE_TOOLTIP: "The percentage of CPU power being used. High usage can indicate heavy workloads or an opportunity for optimization.",
  RAM_USAGE_TOOLTIP: "The percentage of available memory being used. High usage can lead to performance bottlenecks.",
  GPU_USAGE_TOOLTIP: "The percentage of GPU power being used. Essential for performance in data science and graphics-intensive applications.",
  CPU: "CPU Usage (%)",
  RAM: "RAM Usage (%)",
  GPU: "GPU Usage (%)",
  STATUS_WASTE: "Waste",
  STATUS_HEALTHY: "Healthy",
  NA: "N/A",
  ERROR_MESSAGE:
    "Something went wrong while fetching the data. Please try again.",
};

export const CLASSIFIED_LOAD = {
  COLLECTING_DATA: "Collecting data...",
  IDLE: "Idle (flat)",
  BUSTY: "Bursty workload",
  HIGH: "Consistently high load",
  RISING: "Rising usage",
  STABLE: "Stable",
};

export const LOAD_TOOLTIP_DETAILS = {
  IDLE: "Idle (flat): Little to no usage, costs remain stable.",
  BUSTY: "Bursty workload: Occasional spikes due to batch jobs or peak processing.",
  HIGH: "Consistently high load: Sustained high usage and costs.",
  RISING: "Rising usage: Gradual increase in usage and costs.",
  STABLE: "Stable: Usage and costs remain steady.",
};
