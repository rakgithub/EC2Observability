import { getMetrics } from "@/app/services/api/metrics";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const instanceId = searchParams.get("id");
  const metricName = searchParams.get("metric");

  if (!instanceId || !metricName) {
    return NextResponse.json(
      { error: "Missing required parameters: id or metric" },
      { status: 400 }
    );
  }

  try {
    const data = await getMetrics(instanceId, metricName);
    return NextResponse.json(data);
  } catch (err: any) {
    return NextResponse.json(
      { error: "Failed to fetch metrics", details: err.message },
      { status: 500 }
    );
  }
}
