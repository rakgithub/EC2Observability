import { GetCostAndUsageCommand } from "@aws-sdk/client-cost-explorer";
import { ceClient } from "../aws";
import { TimeRange } from "@/types/cost";

function parseCost(amount?: string): number {
  return parseFloat(amount || "0") || 0;
}

export async function getCosts(timeRange: TimeRange) {
  try {
    const now = new Date();
    const past = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000); // last 7 days
    const daysInMonth = new Date(
      now.getFullYear(),
      now.getMonth() + 1,
      0
    ).getDate();

    //  KPI numbers (last 7 days)
    const kpiCmd = new GetCostAndUsageCommand({
      TimePeriod: {
        Start: past.toISOString().split("T")[0],
        End: now.toISOString().split("T")[0],
      },
      Granularity: "DAILY",
      Metrics: ["UnblendedCost"],
    });

    const kpiRes = await ceClient.send(kpiCmd);
    const results = kpiRes.ResultsByTime ?? [];

    const totalSpend = results.reduce(
      (sum, r) => sum + parseCost(r.Total?.UnblendedCost?.Amount),
      0
    );

    const dailyBurn = results.length > 0 ? totalSpend / results.length : 0;
    const projectedMonthly = dailyBurn * daysInMonth;

    let dailyBurnTrend: "up" | "down" | "neutral" = "neutral";
    if (results.length >= 2) {
      const yesterday = parseCost(
        results[results.length - 1].Total?.UnblendedCost?.Amount
      );
      const dayBefore = parseCost(
        results[results.length - 2].Total?.UnblendedCost?.Amount
      );

      if (yesterday > dayBefore) dailyBurnTrend = "up";
      else if (yesterday < dayBefore) dailyBurnTrend = "down";
    }

    // Previous month to same day
    const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const sameDayLastMonth = new Date(
      now.getFullYear(),
      now.getMonth() - 1,
      now.getDate()
    );

    const lastMonthCmd = new GetCostAndUsageCommand({
      TimePeriod: {
        Start: startOfLastMonth.toISOString().split("T")[0],
        End: sameDayLastMonth.toISOString().split("T")[0],
      },
      Granularity: "DAILY",
      Metrics: ["UnblendedCost"],
    });

    const lastMonthRes = await ceClient.send(lastMonthCmd);
    const lastMonthResults = lastMonthRes.ResultsByTime ?? [];

    const lastMonthSpend = lastMonthResults.reduce(
      (sum, r) => sum + parseCost(r.Total?.UnblendedCost?.Amount),
      0
    );
    let totalSpendTrend: "up" | "down" | "neutral" = "neutral";
    if (lastMonthSpend > 0) {
      totalSpendTrend = totalSpend >= lastMonthSpend ? "up" : "down";
    }

    const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0); // last day of previous month

    const lastMonthFullCmd = new GetCostAndUsageCommand({
      TimePeriod: {
        Start: startOfLastMonth.toISOString().split("T")[0],
        End: endOfLastMonth.toISOString().split("T")[0],
      },
      Granularity: "MONTHLY",
      Metrics: ["UnblendedCost"],
    });

    const lastMonthFullRes = await ceClient.send(lastMonthFullCmd);
    const lastMonthFullResults = lastMonthFullRes.ResultsByTime ?? [];
    const lastMonthTotal = lastMonthFullResults.reduce(
      (sum, r) => sum + parseCost(r.Total?.UnblendedCost?.Amount),
      0
    );

    let projectedMonthlyTrend: "up" | "down" | "neutral" = "neutral";
    if (lastMonthTotal > 0) {
      projectedMonthlyTrend =
        projectedMonthly >= lastMonthTotal ? "up" : "down";
    }

    // Costs grouped by REGION
    const regionCmd = new GetCostAndUsageCommand({
      TimePeriod: {
        Start: past.toISOString().split("T")[0],
        End: now.toISOString().split("T")[0],
      },
      Granularity: "MONTHLY",
      Metrics: ["UnblendedCost"],
      GroupBy: [{ Type: "DIMENSION", Key: "REGION" }],
    });

    const regionRes = await ceClient.send(regionCmd);
    const byRegion =
      regionRes.ResultsByTime?.[0]?.Groups?.map((g) => ({
        name: g.Keys?.[0] ?? "Unknown",
        cost: parseCost(g.Metrics?.UnblendedCost?.Amount),
      })) ?? [];

    // Costs grouped by INSTANCE_TYPE
    const typeCmd = new GetCostAndUsageCommand({
      TimePeriod: {
        Start: past.toISOString().split("T")[0],
        End: now.toISOString().split("T")[0],
      },
      Granularity: "MONTHLY",
      Metrics: ["UnblendedCost"],
      GroupBy: [{ Type: "DIMENSION", Key: "INSTANCE_TYPE" }],
    });

    const typeRes = await ceClient.send(typeCmd);
    const byType =
      typeRes.ResultsByTime?.[0]?.Groups?.map((g) => ({
        name: g.Keys?.[0] ?? "Unknown",
        cost: parseCost(g.Metrics?.UnblendedCost?.Amount),
      })) ?? [];

    const pastPrevious = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000); // Last 14 days to compare
    const previous = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000); // Last 7 days

    // Fetch previous 7 days' costs
    const previousCmd = new GetCostAndUsageCommand({
      TimePeriod: {
        Start: pastPrevious.toISOString().split("T")[0],
        End: previous.toISOString().split("T")[0],
      },
      Granularity: "DAILY",
      Metrics: ["UnblendedCost"],
    });

    const previousRes = await ceClient.send(previousCmd);
    const previousResults = previousRes.ResultsByTime ?? [];

    const previousTotalSpend = previousResults.reduce(
      (sum, r) => sum + parseCost(r.Total?.UnblendedCost?.Amount),
      0
    );

    const previousDailyBurn =
      previousResults.length > 0
        ? previousTotalSpend / previousResults.length
        : 0;

    const previousProjectedMonthly = previousDailyBurn * daysInMonth;

    // Apply fallback if basically zero or no data
    const isZero =
      totalSpend < 0.01 &&
      dailyBurn < 0.01 &&
      projectedMonthly < 0.01 &&
      byRegion.every((r) => r.cost < 0.01) &&
      byType.every((t) => t.cost < 0.01);

    if (isZero) {
      return {
        totalSpend: 1240,
        totalSpendTrend: "down",
        dailyBurn: 52,
        dailyBurnTrend: "down",
        projectedMonthly: 1560,
        byRegion: [
          { name: "us-east-1", cost: 500 },
          { name: "eu-west-1", cost: 300 },
          { name: "ap-south-1", cost: 440 },
        ],
        byType: [
          { name: "m5.large", cost: 400 },
          { name: "t2.micro", cost: 150 },
          { name: "c5.xlarge", cost: 690 },
        ],
        previousTotalSpend: 1100,
        previousDailyBurn: 150,
        previousProjectedMonthly: 850,
        projectedMonthlyTrend: "up",
        mock: true,
      };
    }

    return {
      totalSpend: Number(totalSpend.toFixed(2)),
      totalSpendTrend,
      dailyBurn: Number(dailyBurn.toFixed(2)),
      dailyBurnTrend,
      projectedMonthly: Number(projectedMonthly.toFixed(2)),
      projectedMonthlyTrend,
      byRegion,
      byType,
      mock: false,
      previousTotalSpend,
      previousDailyBurn,
      previousProjectedMonthly,
    };
  } catch (err) {
    console.error("Error fetching costs:", err);
    throw new Error("Failed to fetch costs");
  }
}
