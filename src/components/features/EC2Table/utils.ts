export const formatUptime = (hours: number | undefined) => {
  if (!hours || isNaN(hours)) return "N/A";
  const d = Math.floor(hours / 24);
  const h = Math.floor(hours % 24);
  return `${d > 0 ? `${d}d ` : ""}${h}h`;
};

export const getActionLabel = (cpu: number, gpu: number, uptime: number) => {
  if (cpu < 15 && uptime > 24) return { label: "Stop Instance", tooltip: "Instance underutilized, stopping it will help save costs." };
  if (gpu > 80) return { label: "Upgrade GPU", tooltip: "GPU usage is high, consider upgrading for better performance." };
  if (cpu > 80) return { label: "Upgrade Instance", tooltip: "CPU usage is high, upgrading your instance will improve performance." };
  return { label: "All Good", tooltip: "Instance running optimally. No action needed." };
};
export const isWaste = (
  cpu: number | undefined,
  uptimeHours: number | undefined
): boolean => {
  return (
    cpu !== undefined &&
    uptimeHours !== undefined &&
    cpu < 15 &&
    uptimeHours > 24
  );
};

 interface RangeOption {
  label: string;
  value: string;
}

export  interface RangeOptions {
  "cpu-usage": RangeOption[];
  "ram-usage": RangeOption[];
  "gpu-usage": RangeOption[];
  computedUptimeHours: RangeOption[];
}

  export const rangeOptions: RangeOptions = {
    "cpu-usage": [
      { label: "All", value: "" },
      { label: "Idle (<15%)", value: "0,15" },
      { label: "Healthy (15–70%)", value: "15,70" },
      { label: "Busy (>70%)", value: "70,100" },
    ],
    "ram-usage": [
      { label: "All", value: "" },
      { label: "Idle (<15%)", value: "0,15" },
      { label: "Healthy (15–70%)", value: "15,70" },
      { label: "Busy (>70%)", value: "70,100" },
    ],
    "gpu-usage": [
      { label: "All", value: "" },
      { label: "Idle (<15%)", value: "0,15" },
      { label: "Healthy (15–70%)", value: "15,70" },
      { label: "Busy (>70%)", value: "70,100" },
    ],
    computedUptimeHours: [
      { label: "All", value: "" },
      { label: "Short-term (<24h)", value: "0,24" },
      { label: "Standard Workload (1-7 days)", value: "24,168" },
      { label: "Long-term (>1 week)", value: "168,999999" },
    ],
  };
