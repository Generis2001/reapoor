import { NextResponse } from "next/server";
import { getProtocolMetrics } from "@/lib/metrics";

// Revalidate cached response every 60 seconds
export const revalidate = 60;

export async function GET() {
  try {
    const metrics = await getProtocolMetrics();
    return NextResponse.json(metrics, {
      headers: {
        "Cache-Control": "public, s-maxage=60, stale-while-revalidate=30",
      },
    });
  } catch {
    return NextResponse.json(
      { error: "Unable to fetch live protocol metrics" },
      {
        status: 503,
        headers: { "Cache-Control": "public, s-maxage=10" },
      }
    );
  }
}
