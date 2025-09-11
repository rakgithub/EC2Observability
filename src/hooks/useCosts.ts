"use client";

import { CostsResponse, TimeRange } from "@/types/cost";
import useSWR from "swr";

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export function useCosts(timeRange: TimeRange) {
  let startDate, endDate, granularity;

  const now = new Date();

  switch (timeRange) {
    case "24h":
      // 24 hours range: granularity is HOURLY
      endDate = now.toISOString();
      startDate = new Date(now.getTime() - 24 * 60 * 60 * 1000).toISOString();
      granularity = "HOURLY";
      break;
    case "7d":
      // 7 days range: granularity is DAILY
      endDate = now.toISOString().split("T")[0];
      startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
        .toISOString()
        .split("T")[0];
      granularity = "DAILY";
      break;
    case "30d":
      // 30 days range: granularity is DAILY
      endDate = now.toISOString().split("T")[0];
      startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
        .toISOString()
        .split("T")[0];
      granularity = "DAILY";
      break;
    case "lastMonth":
      // Last month range: granularity is MONTHLY
      endDate = new Date(now.getFullYear(), now.getMonth(), 0)
        .toISOString()
        .split("T")[0];
      startDate = new Date(now.getFullYear(), now.getMonth() - 1, 1)
        .toISOString()
        .split("T")[0];
      granularity = "MONTHLY";
      break;
    default:
      throw new Error(
        "Invalid time range. Please choose '24hours', '7days', '30days', or 'lastmonth'."
      );
  }
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
