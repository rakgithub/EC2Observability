"use client";

import useSWR, { Fetcher } from "swr";
import { MetricDatapoint } from "@/types/ec2";

const fetcher: Fetcher<MetricDatapoint[], string> = (url) =>
  fetch(url).then((res) => res.json());

export const useInstanceMetrics = (instanceId: string) => {
  const { data: cpuMetrics } = useSWR<MetricDatapoint[]>(
    `/api/metrics?id=${instanceId}&metric=CPUUtilization`,
    fetcher,
  );
  const { data: ramMetrics } = useSWR<MetricDatapoint[]>(
    `/api/metrics?id=${instanceId}&metric=MemoryUtilization`,
    fetcher,
  );
  const { data: gpuMetrics } = useSWR<MetricDatapoint[]>(
    `/api/metrics?id=${instanceId}&metric=GPUUtilization`,
    fetcher,
  );

  const { data: diskMetrics } = useSWR<MetricDatapoint[]>(
    `/api/metrics?id=${instanceId}&metric=DiskReadOps`,
    fetcher,
  );
  
  return {
    cpuMetrics,
    ramMetrics,
    gpuMetrics,
    diskMetrics,
    isLoading: !cpuMetrics && !ramMetrics && !gpuMetrics && !diskMetrics,
  };
};