import type { Line, Train, Car } from "./types";
import { MOCK_LINES, MOCK_TRAINS } from "./mockData";
import { getRecentReports, type CarReportSummary } from "./reports";

const isMock = () =>
  !process.env.ODPT_API_TOKEN || process.env.ODPT_API_TOKEN === "mock";

const ODPT_BASE = "https://api.odpt.org/api/4";

async function odptFetch<T>(path: string): Promise<T> {
  const token = process.env.ODPT_API_TOKEN;
  const url = `${ODPT_BASE}${path}&acl:consumerKey=${token}`;
  const res = await fetch(url, { next: { revalidate: 30 } });
  if (!res.ok) throw new Error(`ODPT API error: ${res.status}`);
  return res.json() as Promise<T>;
}

/**
 * ODPTの車両データとユーザー投稿レポートをブレンドする
 * 優先度: クラウドソーシング(3件+) > ブレンド(1-2件) > ODPT > モック
 */
function blendCars(
  baseCars: Car[],
  reports: Record<number, CarReportSummary>
): Car[] {
  return baseCars.map((car) => {
    const report = reports[car.carNumber];
    if (!report) return car;

    if (report.count >= 3) {
      // 十分な投稿数 → クラウドソーシングを全面採用
      return {
        ...car,
        congestionRate: report.avgRate,
        dataSource: "crowdsourced",
        reportCount: report.count,
        lastReportAt: report.lastAt,
      };
    } else {
      // 少数投稿 → ODPTとクラウドソーシングを重み付き平均（投稿を重視）
      const blended = Math.round(car.congestionRate * 0.4 + report.avgRate * 0.6);
      return {
        ...car,
        congestionRate: blended,
        dataSource: "blended",
        reportCount: report.count,
        lastReportAt: report.lastAt,
      };
    }
  });
}

export async function getLines(): Promise<Line[]> {
  if (isMock()) return MOCK_LINES;

  type OdptLine = {
    "owl:sameAs": string;
    "dc:title": string;
    "odpt:color"?: string;
    "odpt:operator": string;
  };
  const data = await odptFetch<OdptLine[]>(
    "/odpt:Railway?odpt:operator=odpt.Operator:TokyoMetro"
  );
  return data.map((d) => ({
    id: d["owl:sameAs"].replace("odpt.Railway:", ""),
    name: d["dc:title"],
    color: d["odpt:color"] ?? "#888",
    operator: d["odpt:operator"].replace("odpt.Operator:", ""),
  }));
}

export async function getTrains(lineId: string): Promise<Train[]> {
  let trains: Train[];

  if (isMock()) {
    trains = MOCK_TRAINS[lineId] ?? [];
  } else {
    type OdptTrain = {
      "owl:sameAs": string;
      "odpt:trainNumber": string;
      "odpt:fromStation": string;
      "odpt:toStation": string;
      "odpt:delay"?: number;
      "odpt:carComposition"?: number;
    };
    const data = await odptFetch<OdptTrain[]>(
      `/odpt:Train?odpt:railway=odpt.Railway:${lineId}`
    );
    const carCount = 8;
    trains = data.map((d) => ({
      id: d["owl:sameAs"].replace("odpt.Train:", ""),
      lineId,
      trainNumber: d["odpt:trainNumber"],
      currentStation: d["odpt:fromStation"].replace(/.*:/, ""),
      nextStation: d["odpt:toStation"].replace(/.*:/, ""),
      delay: Math.floor((d["odpt:delay"] ?? 0) / 60),
      cars: Array.from({ length: d["odpt:carComposition"] ?? carCount }, (_, i) => ({
        carNumber: i + 1,
        congestionRate: 50, // ODPT非提供のためデフォルト
        capacity: 150,
        dataSource: "train_level" as const,
      })),
    }));
  }

  // 全列車のクラウドソーシングデータをブレンド
  const blendedTrains = await Promise.all(
    trains.map(async (train) => {
      const reports = await getRecentReports(train.id);
      if (Object.keys(reports).length === 0) return train;
      return { ...train, cars: blendCars(train.cars, reports) };
    })
  );

  return blendedTrains;
}

export async function getTrainDetail(trainId: string): Promise<Train | null> {
  const lineId = trainId.split("-")[0];
  let train: Train | null;

  if (isMock()) {
    train = MOCK_TRAINS[lineId]?.find((t) => t.id === trainId) ?? null;
  } else {
    const trains = await getTrains(lineId);
    train = trains.find((t) => t.id === trainId) ?? null;
  }

  if (!train) return null;

  // クラウドソーシングデータをブレンド
  const reports = await getRecentReports(trainId);
  if (Object.keys(reports).length === 0) return train;
  return { ...train, cars: blendCars(train.cars, reports) };
}
