
import { GetCostAndUsageCommand } from "@aws-sdk/client-cost-explorer";
import { ceClient } from "../aws";
import { mockCostData } from "@/mockData/mock";
import { TimeRange } from "@/types/cost";
import { USE_MOCK_DATA } from "@/config";

type Trend = "up" | "down" | "neutral";

function parseCost(amount?: string): number {
  return parseFloat(amount || "0") || 0;
}

function formatDate(date: Date): string {
  return date.toISOString().split("T")[0];
}

function getTrend(current: number, previous: number): Trend {
  if (current > previous) return "up";
  if (current < previous) return "down";
  return "neutral";
}

async function fetchCosts(params: {
  start: Date;
  end: Date;
  granularity: "DAILY" | "MONTHLY" | "HOURLY";
  groupBy?: { Type: "DIMENSION" | "TAG"; Key: string }[];
}) {
  // MOCK DATA
  if (USE_MOCK_DATA) {
    return mockCostData();
  }
  const cmd = new GetCostAndUsageCommand({
    TimePeriod: {
      Start: formatDate(params.start),
      End: formatDate(params.end),
    },
    Granularity: params.granularity,
    Metrics: ["UnblendedCost"],
    ...(params.groupBy ? { GroupBy: params.groupBy } : {}),
  });

  const res = await ceClient.send(cmd);
  return res.ResultsByTime ?? [];
}

interface UnblendedCost {
  Amount?: string;
  Unit?: string;
}

interface Metric {
  UnblendedCost?: UnblendedCost;
}

interface Group {
  Keys?: string[];
  Metrics?: Metric;
}

interface TimePeriodResult {
  TimePeriod?: { Start?: string; End?: string };
  Total?: Metric;
  Groups?: Group[];
}

const aggregateGroupedData = (results: TimePeriodResult[]) => {
  const aggregatedMap = new Map<string, number>();

  results.forEach((timePeriodResult) => {
    timePeriodResult.Groups?.forEach((group) => {
      const key = group.Keys?.[0] ?? "Unknown";
      const cost = parseCost(group.Metrics?.UnblendedCost?.Amount);
      aggregatedMap.set(key, (aggregatedMap.get(key) || 0) + cost);
    });
  });

  return Array.from(aggregatedMap.entries()).map(([name, cost]) => ({
    name,
    cost,
  }));
};

function getPreviousDates(start: Date, end: Date) {
  const diffInMs = end.getTime() - start.getTime();
  const prevEnd = new Date(start.getTime());
  const prevStart = new Date(prevEnd.getTime() - diffInMs);
  return { start: prevStart, end: prevEnd };
}

export async function getCosts(timeRange: TimeRange) {
  try {
    const now = new Date();
    const daysInMonth = new Date(
      now.getFullYear(),
      now.getMonth() + 1,
      0
    ).getDate();

    let start: Date;
    let granularity: "HOURLY" | "DAILY";
    if (timeRange === "24h") {
      start = new Date(now.getTime() - 24 * 60 * 60 * 1000);
      granularity = "HOURLY";
    } else if (timeRange === "7d") {
      start = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      granularity = "DAILY";
    } else if (timeRange === "30d") {
      start = new Date(now.getFullYear(), now.getMonth(), 1);
      granularity = "DAILY";
    } else {
      start = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      now.setDate(0);
      granularity = "DAILY";
    }

    const kpiResults = await fetchCosts({
      start: start,
      end: now,
      granularity: granularity,
    });

    const totalSpend = kpiResults.reduce(
      (sum, r) => sum + parseCost(r.Total?.UnblendedCost?.Amount),
      0
    );
    const dailyBurn = kpiResults.length ? totalSpend / kpiResults.length : 0;
    const projectedMonthly = dailyBurn * daysInMonth;

    const dailyBurnTrend =
      kpiResults.length >= 2
        ? getTrend(
            parseCost(kpiResults.at(-1)?.Total?.UnblendedCost?.Amount),
            parseCost(kpiResults.at(-2)?.Total?.UnblendedCost?.Amount)
          )
        : "neutral";

    // Previous month up to same day
    const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const sameDayLastMonth = new Date(
      now.getFullYear(),
      now.getMonth() - 1,
      now.getDate()
    );

    const lastMonthResults = await fetchCosts({
      start: startOfLastMonth,
      end: sameDayLastMonth,
      granularity: "DAILY",
    });

    const lastMonthSpend = lastMonthResults.reduce(
      (sum, r) => sum + parseCost(r.Total?.UnblendedCost?.Amount),
      0
    );
    const totalSpendTrend =
      lastMonthSpend > 0 ? getTrend(totalSpend, lastMonthSpend) : "neutral";

    // Full last month
    const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0);
    const lastMonthFull = await fetchCosts({
      start: startOfLastMonth,
      end: endOfLastMonth,
      granularity: "MONTHLY",
    });

    const lastMonthTotal = lastMonthFull.reduce(
      (sum, r) => sum + parseCost(r.Total?.UnblendedCost?.Amount),
      0
    );
    const projectedMonthlyTrend =
      lastMonthTotal > 0
        ? getTrend(projectedMonthly, lastMonthTotal)
        : "neutral";

    const [regionRes, typeRes, jobRes] = await Promise.all([
      fetchCosts({
        start: start,
        end: now,
        granularity: granularity,
        groupBy: [{ Type: "DIMENSION", Key: "REGION" }],
      }),
      fetchCosts({
        start: start,
        end: now,
        granularity: granularity,
        groupBy: [{ Type: "DIMENSION", Key: "INSTANCE_TYPE" }],
      }),
      fetchCosts({
        start: start,
        end: now,
        granularity: granularity,
        groupBy: [{ Type: "TAG", Key: "job" }],
      }),
    ]);

    const byRegionData = aggregateGroupedData(regionRes);
    const byType = aggregateGroupedData(typeRes);
    const byJob = aggregateGroupedData(jobRes);


    const regionAttributedCost = byRegionData.reduce(
      (sum, item) => sum + item.cost,
      0
    );
    const regionUnattributedCost = totalSpend - regionAttributedCost;

    const byRegion =
      regionUnattributedCost > 0.01
        ? [
            ...byRegionData,
            { name: "Other Services", cost: regionUnattributedCost },
          ]
        : byRegionData;


    const previousDates = getPreviousDates(start, now);
    const prevResults = await fetchCosts({
      start: previousDates.start,
      end: previousDates.end,
      granularity: granularity,
    });
    const previousTotalSpend = prevResults.reduce(
      (sum, r) => sum + parseCost(r.Total?.UnblendedCost?.Amount),
      0
    );
    const previousDailyBurn = prevResults.length
      ? previousTotalSpend / prevResults.length
      : 0;
    const previousProjectedMonthly = previousDailyBurn * daysInMonth;

    // Build base daily history
    const dailyHistory = kpiResults.map((r) => ({
      Timestamp: r.TimePeriod?.Start ?? "",
      Average: parseCost(r.Total?.UnblendedCost?.Amount),
    }));

    // Total Spend History
    const totalSpendHistory = dailyHistory.map((h, i) => ({
      Timestamp: h.Timestamp,
      Average: dailyHistory
        .slice(0, i + 1)
        .reduce((sum, d) => sum + d.Average, 0),
    }));

    // Daily Burn History
    const dailyBurnHistory = dailyHistory;

    // Projected Monthly History
    const projectedMonthlyHistory = dailyHistory.map((h, i) => {
      const cumulative = dailyHistory
        .slice(0, i + 1)
        .reduce((sum, d) => sum + d.Average, 0);
      const avg = cumulative / (i + 1);
      return {
        Timestamp: h.Timestamp,
        Average: avg * daysInMonth,
      };
    });
   
    return {
      totalSpend: +totalSpend.toFixed(2),
      totalSpendTrend,
      dailyBurn: +dailyBurn.toFixed(2),
      dailyBurnTrend,
      projectedMonthly: +projectedMonthly.toFixed(2),
      projectedMonthlyTrend,
      byRegion,
      byType,
      byJob,
      previousTotalSpend,
      previousDailyBurn,
      previousProjectedMonthly,
      totalSpendHistory,
      dailyBurnHistory,
      projectedMonthlyHistory,
    };
  } catch (err) {
    console.error("Error fetching costs:", err);
    throw new Error("Failed to fetch costs");
  }
}
