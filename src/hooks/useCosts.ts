"use client";

import { CostsResponse, TimeRange } from "@/types/cost";
import useSWR from "swr";

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export function useCosts(timeRange: TimeRange) {
  const { data, error, isLoading } = useSWR<CostsResponse>(
    `/api/costs?timeRange=${timeRange}`,
    fetcher,
    {
      refreshInterval: 60000,
    }
  );

  return {
    data,
    error,
    isLoading,
  };
}
