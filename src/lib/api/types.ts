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
  dataSource: "car_level" | "train_level";
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
