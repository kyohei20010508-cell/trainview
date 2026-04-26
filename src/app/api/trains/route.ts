import { NextRequest, NextResponse } from "next/server";
import { getTrains } from "@/lib/api/odpt";

export async function GET(req: NextRequest) {
  const lineId = req.nextUrl.searchParams.get("lineId");
  if (!lineId) return NextResponse.json({ error: "lineId required" }, { status: 400 });
  const trains = await getTrains(lineId);
  return NextResponse.json(trains);
}
