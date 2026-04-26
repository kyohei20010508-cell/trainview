import type { Line, Train } from "./types";
import { MOCK_LINES, MOCK_TRAINS } from "./mockData";

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

export async function getLines(): Promise<Line[]> {
  if (isMock()) return MOCK_LINES;

  // Real API: fetch Tokyo Metro lines
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
  if (isMock()) return MOCK_TRAINS[lineId] ?? [];

  type OdptTrain = {
    "owl:sameAs": string;
    "odpt:trainNumber": string;
    "odpt:fromStation": string;
    "odpt:toStation": string;
    "odpt:delay"?: number;
    "odpt:trainInformationText"?: Record<string, string>;
  };
  const data = await odptFetch<OdptTrain[]>(
    `/odpt:Train?odpt:railway=odpt.Railway:${lineId}`
  );
  return data.map((d) => ({
    id: d["owl:sameAs"].replace("odpt.Train:", ""),
    lineId,
    trainNumber: d["odpt:trainNumber"],
    currentStation: d["odpt:fromStation"].replace(/.*:/, ""),
    nextStation: d["odpt:toStation"].replace(/.*:/, ""),
    delay: Math.floor((d["odpt:delay"] ?? 0) / 60),
    cars: [],
  }));
}

export async function getTrainDetail(trainId: string): Promise<Train | null> {
  const lineId = trainId.split("-")[0];
  if (isMock()) {
    return MOCK_TRAINS[lineId]?.find((t) => t.id === trainId) ?? null;
  }

  const trains = await getTrains(lineId);
  return trains.find((t) => t.id === trainId) ?? null;
}
