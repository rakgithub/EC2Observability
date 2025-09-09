export const detectSpike = (
  previousValue: number,
  currentValue: number
): boolean => {
  const threshold = 0.2; // 20% increase considered a spike and this can be configured later
  if (previousValue === 0) return false;
  const change = (currentValue - previousValue) / previousValue;
  return change > threshold;
};
