import { NextRequest, NextResponse } from "next/server";
import { submitReport } from "@/lib/api/reports";

export async function POST(req: NextRequest) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const { trainId, lineId, carNumber, congestionRate } = body as Record<string, unknown>;

  // バリデーション
  if (!trainId || !lineId || carNumber == null || congestionRate == null) {
    return NextResponse.json({ error: "trainId, lineId, carNumber, congestionRate は必須です" }, { status: 400 });
  }
  if (typeof carNumber !== "number" || carNumber < 1 || carNumber > 16) {
    return NextResponse.json({ error: "carNumber は 1〜16 の整数です" }, { status: 400 });
  }
  if (typeof congestionRate !== "number" || congestionRate < 0 || congestionRate > 200) {
    return NextResponse.json({ error: "congestionRate は 0〜200 の整数です" }, { status: 400 });
  }

  try {
    await submitReport({
      trainId: String(trainId),
      lineId: String(lineId),
      carNumber,
      congestionRate,
    });
    return NextResponse.json({ success: true, message: "ありがとうございます！表示に反映されました" });
  } catch (e) {
    console.error("report submission error:", e);
    return NextResponse.json({ error: "投稿に失敗しました" }, { status: 500 });
  }
}
