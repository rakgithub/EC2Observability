import { getCosts } from "@/app/services";
import { TimeRange } from "@/types/cost";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const timeRange: TimeRange = searchParams.get("timeRange");
    const data = await getCosts(timeRange);
    return NextResponse.json(data);
  } catch (err) {
    return NextResponse.json(
      { error: "Failed to fetch instances", details: err.message },
      { status: 500 }
    );
  }
}
