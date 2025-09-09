export const formatUptime = (hours: number | undefined) => {
  if (!hours || isNaN(hours)) return "N/A";
  const d = Math.floor(hours / 24);
  const h = Math.floor(hours % 24);
  return `${d > 0 ? `${d}d ` : ""}${h}h`;
};

export const getRecommendedAction = (
  cpu: number,
  gpu: number,
  uptime: number
) => {
  if (cpu < 15 && uptime > 24) return "Consider stopping";
  if (gpu > 80) return "Upgrade GPU";
  if (cpu > 80) return "Upgrade instance";
  return "OK";
};
