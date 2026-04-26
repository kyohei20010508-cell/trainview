import { supabase } from "@/lib/supabase";

export type ReportInput = {
  trainId: string;
  lineId: string;
  carNumber: number;
  congestionRate: number;
};

export type CarReportSummary = {
  avgRate: number;
  count: number;
  lastAt: string;
};

/** ユーザーの混雑報告を投稿 */
export async function submitReport(input: ReportInput): Promise<void> {
  const { error } = await supabase.from("congestion_reports").insert({
    train_id: input.trainId,
    line_id: input.lineId,
    car_number: input.carNumber,
    congestion_rate: input.congestionRate,
  });
  if (error) throw new Error(error.message);
}

/** 指定列車の直近30分の投稿を集計して車両ごとのサマリーを返す */
export async function getRecentReports(
  trainId: string,
  windowMinutes = 30
): Promise<Record<number, CarReportSummary>> {
  const since = new Date(Date.now() - windowMinutes * 60 * 1000).toISOString();

  const { data, error } = await supabase
    .from("congestion_reports")
    .select("car_number, congestion_rate, created_at")
    .eq("train_id", trainId)
    .gte("created_at", since)
    .order("created_at", { ascending: false });

  if (error || !data) return {};

  // 車両ごとにグループ化して平均を計算
  const grouped: Record<number, { sum: number; count: number; lastAt: string }> = {};
  for (const row of data) {
    const carNum: number = row.car_number;
    if (!grouped[carNum]) {
      grouped[carNum] = { sum: 0, count: 0, lastAt: row.created_at as string };
    }
    grouped[carNum].sum += row.congestion_rate as number;
    grouped[carNum].count += 1;
  }

  return Object.fromEntries(
    Object.entries(grouped).map(([carNum, g]) => [
      Number(carNum),
      {
        avgRate: Math.round(g.sum / g.count),
        count: g.count,
        lastAt: g.lastAt,
      },
    ])
  );
}
