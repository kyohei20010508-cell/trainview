export type CongestionLevel = "empty" | "light" | "moderate" | "crowded" | "packed";

export function getCongestionLevel(rate: number): CongestionLevel {
  if (rate <= 50) return "empty";
  if (rate <= 80) return "light";
  if (rate <= 100) return "moderate";
  if (rate <= 150) return "crowded";
  return "packed";
}

export function getCongestionColor(rate: number): string {
  const level = getCongestionLevel(rate);
  return {
    empty: "#22c55e",
    light: "#eab308",
    moderate: "#f97316",
    crowded: "#ef4444",
    packed: "#a855f7",
  }[level];
}

export function getCongestionBgClass(rate: number): string {
  const level = getCongestionLevel(rate);
  return {
    empty: "bg-green-500",
    light: "bg-yellow-400",
    moderate: "bg-orange-500",
    crowded: "bg-red-500",
    packed: "bg-purple-500",
  }[level];
}

export function getCongestionLabel(rate: number): string {
  const level = getCongestionLevel(rate);
  return {
    empty: "空いています",
    light: "やや混雑",
    moderate: "混雑",
    crowded: "かなり混雑",
    packed: "非常に混雑",
  }[level];
}

export function getAverageCongestion(rates: number[]): number {
  if (rates.length === 0) return 0;
  return Math.round(rates.reduce((a, b) => a + b, 0) / rates.length);
}
