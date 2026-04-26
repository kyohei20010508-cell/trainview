import type { Line, Train, Car } from "./types";

export const MOCK_LINES: Line[] = [
  { id: "ginza", name: "銀座線", color: "#FF9500", operator: "東京メトロ" },
  { id: "marunouchi", name: "丸ノ内線", color: "#E60012", operator: "東京メトロ" },
  { id: "hibiya", name: "日比谷線", color: "#9B7CB6", operator: "東京メトロ" },
  { id: "asakusa", name: "浅草線", color: "#E85298", operator: "都営地下鉄" },
  { id: "mita", name: "三田線", color: "#0078BF", operator: "都営地下鉄" },
];

function makeCars(count: number, baseCongestion: number, seed: number, dataSource: "car_level" | "train_level"): Car[] {
  return Array.from({ length: count }, (_, i) => {
    const variation = ((seed * (i + 1) * 17) % 40) - 20;
    return {
      carNumber: i + 1,
      congestionRate: Math.max(10, Math.min(200, baseCongestion + variation)),
      capacity: 150,
      dataSource,
    };
  });
}

const STATIONS: Record<string, string[]> = {
  ginza: ["渋谷", "表参道", "外苑前", "青山一丁目", "溜池山王", "虎ノ門", "新橋", "銀座", "日本橋", "三越前", "末広町", "上野広小路", "上野"],
  marunouchi: ["荻窪", "南阿佐ヶ谷", "新高円寺", "東高円寺", "新中野", "中野坂上", "西新宿", "新宿", "新宿三丁目", "新宿御苑前", "四谷三丁目", "四ツ谷", "赤坂見附", "国会議事堂前", "霞ヶ関", "銀座", "東京", "大手町", "淡路町", "御茶ノ水", "本郷三丁目", "後楽園", "茗荷谷", "新大塚", "池袋"],
  hibiya: ["北千住", "南千住", "三ノ輪", "入谷", "上野", "仲御徒町", "秋葉原", "小伝馬町", "人形町", "茅場町", "八丁堀", "築地", "東銀座", "銀座", "日比谷", "霞ヶ関", "虎ノ門ヒルズ", "神谷町", "六本木", "広尾", "恵比寿", "中目黒"],
  asakusa: ["西馬込", "馬込", "中延", "戸越", "五反田", "高輪台", "泉岳寺", "三田", "大門", "新橋", "東銀座", "宝町", "日本橋", "人形町", "東日本橋", "浅草橋", "蔵前", "浅草", "本所吾妻橋", "押上"],
  mita: ["目黒", "白金台", "白金高輪", "三田", "芝公園", "御成門", "内幸町", "日比谷", "大手町", "神保町", "水道橋", "春日", "白山", "千石", "巣鴨", "西巣鴨", "新板橋", "板橋区役所前", "板橋本町", "本蓮沼", "志村坂上", "志村三丁目", "蓮根", "西台", "高島平", "新高島平", "西高島平"],
};

function makeTrain(lineId: string, trainNum: number, seed: number): Train {
  const stations = STATIONS[lineId] ?? ["A駅", "B駅", "C駅"];
  const stationIdx = (seed * 3 + trainNum * 7) % (stations.length - 1);
  const congestion = 40 + ((seed + trainNum) * 23) % 130;
  const carCount = lineId === "ginza" ? 6 : 8;
  const delay = (seed + trainNum) % 5 === 0 ? (trainNum % 3) + 1 : 0;

  return {
    id: `${lineId}-${trainNum}`,
    lineId,
    trainNumber: `${trainNum}T`,
    currentStation: stations[stationIdx],
    nextStation: stations[stationIdx + 1],
    delay,
    cars: makeCars(carCount, congestion, seed + trainNum, "train_level"),
  };
}

export const MOCK_TRAINS: Record<string, Train[]> = Object.fromEntries(
  MOCK_LINES.map((line, idx) => [
    line.id,
    Array.from({ length: 4 }, (_, i) => makeTrain(line.id, i + 1, idx * 13 + 7)),
  ])
);
