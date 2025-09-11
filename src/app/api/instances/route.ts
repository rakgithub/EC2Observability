import { getInstances } from "@/app/services";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const data = await getInstances();
    return NextResponse.json(data);
  } catch (err) {
    return NextResponse.json(
      { error: "Failed to fetch instances", err },
      { status: 500 }
    );
  }
}
