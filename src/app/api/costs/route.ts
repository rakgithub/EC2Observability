import { getCosts } from "@/app/services/api/costs";
import { TimeRange } from "@/types/cost";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const timeRange = searchParams.get("timeRange") as TimeRange | null;

    if (!timeRange || !["7d", "30d", "24h", "lastMonth"].includes(timeRange)) {
      return NextResponse.json(
        { error: "Invalid or missing timeRange" },
        { status: 400 }
      );
    }

    const data = await getCosts(timeRange);
    return NextResponse.json(data);
  } catch (err) {
    return NextResponse.json(
      { error: "Failed to fetch costs", details: err },
      { status: 500 }
    );
  }
}
