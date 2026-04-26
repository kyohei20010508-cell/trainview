export type Line = {
  id: string;
  name: string;
  color: string;
  operator: string;
};

export type Car = {
  carNumber: number;
  congestionRate: number;
  capacity: number;
  dataSource: "car_level" | "train_level" | "crowdsourced" | "blended";
  reportCount?: number;   // 過去30分のユーザー投稿件数
  lastReportAt?: string;  // 最終投稿のISO timestamp
};

export type Train = {
  id: string;
  lineId: string;
  trainNumber: string;
  currentStation: string;
  nextStation: string;
  delay: number;
  cars: Car[];
};
