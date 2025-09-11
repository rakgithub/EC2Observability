import useSWR from "swr";
import { useMemo, useState } from "react";
import { EC2Instance, MetricDatapoint } from "@/types/ec2";

const fetcher = (url: string) => fetch(url).then((res) => res.json());

const fetchMetricsForInstance = async (
  instance: EC2Instance
): Promise<EC2Instance> => {
  const [cpuMetrics, ramMetrics, gpuMetrics] = await Promise.all([
    fetcher(`/api/metrics?id=${instance.id}&metric=CPUUtilization`),
    fetcher(`/api/metrics?id=${instance.id}&metric=MemoryUtilization`),
    fetcher(`/api/metrics?id=${instance.id}&metric=GPUUtilization`),
  ]);

  const getLatestMetric = (metrics: MetricDatapoint[]) => {
    if (!metrics || metrics.length === 0) return undefined;
    const latest = metrics.sort(
      (a, b) =>
        new Date(b.Timestamp).getTime() - new Date(a.Timestamp).getTime()
    )[0];
    return latest?.Average;
  };

  return {
    ...instance,
    cpu: getLatestMetric(cpuMetrics),
    ram: getLatestMetric(ramMetrics),
    gpu: getLatestMetric(gpuMetrics),
  };
};

const preprocessInstances = async (
  instances: EC2Instance[]
): Promise<EC2Instance[]> => {
  const instancesWithMetrics = await Promise.all(
    instances.map(async (instance) => {
      const now = new Date().getTime();
      const uptimeHours = instance.launchTime
        ? (now - new Date(instance.launchTime).getTime()) / (1000 * 60 * 60)
        : instance.uptimeHours || 0;

      const instanceWithUptime = {
        ...instance,
        computedUptimeHours: uptimeHours,
      };
      return fetchMetricsForInstance(instanceWithUptime);
    })
  );
  return instancesWithMetrics;
};

export function useEC2Instances() {
  const { data, error, isLoading } = useSWR<{ instances: EC2Instance[] }>(
    "/api/instances",
    fetcher,
    {
      refreshInterval: 30000,
      dedupingInterval: 2000,
    }
  );

  const [preprocessedInstances, setPreprocessedInstances] = useState<
    EC2Instance[]
  >([]);
  const [isDataProcessing, setIsDataProcessing] = useState(false);

  useMemo(() => {
    if (data?.instances && !isDataProcessing) {
      setIsDataProcessing(true);
      preprocessInstances(data.instances).then((updatedInstances) => {
        setPreprocessedInstances(updatedInstances);
        setIsDataProcessing(false);
      });
    }
  }, [data?.instances]);

  return {
    instances: preprocessedInstances,
    totalCount: data?.instances.length || 0,
    error,
    isLoading,
    isDataProcessing,
  };
}
