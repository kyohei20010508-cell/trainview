"use client";

import { useState } from "react";
import type { Car } from "@/lib/api/types";
import { getCongestionColor, getCongestionLabel } from "@/lib/utils/congestion";

type Props = {
  cars: Car[];
  direction?: "left" | "right";
};

export default function CarVisualization({ cars, direction = "right" }: Props) {
  const [hovered, setHovered] = useState<number | null>(null);
  const hasTrainLevel = cars.some((c) => c.dataSource === "train_level");

  return (
    <div className="w-full">
      {hasTrainLevel && (
        <p className="text-xs text-gray-400 mb-2">
          ※ 車両単位のデータが取得できないため、列車単位の混雑率を各車両に適用しています
        </p>
      )}
      <div className="flex items-center gap-1 overflow-x-auto pb-2">
        {direction === "right" && (
          <div className="flex-shrink-0 text-gray-400 text-lg mr-1">▶</div>
        )}
        {cars.map((car) => {
          const color = getCongestionColor(car.congestionRate);
          const isHovered = hovered === car.carNumber;
          return (
            <div
              key={car.carNumber}
              className="relative flex-shrink-0"
              onMouseEnter={() => setHovered(car.carNumber)}
              onMouseLeave={() => setHovered(null)}
            >
              <div
                className="w-16 h-24 rounded-md border-2 border-white/20 flex flex-col items-center justify-between p-1 cursor-pointer transition-transform hover:scale-105"
                style={{ backgroundColor: color }}
              >
                <span className="text-white text-xs font-bold">{car.carNumber}号車</span>
                <span className="text-white text-sm font-extrabold">{car.congestionRate}%</span>
                <div className="w-full h-1.5 bg-white/30 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-white/80 rounded-full"
                    style={{ width: `${Math.min(100, car.congestionRate)}%` }}
                  />
                </div>
              </div>
              {isHovered && (
                <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-xs rounded-lg p-2 w-32 shadow-lg z-10 border border-white/10">
                  <p className="font-bold">{car.carNumber}号車</p>
                  <p>混雑率: {car.congestionRate}%</p>
                  <p>定員: {car.capacity}人</p>
                  <p className="mt-1 font-semibold">{getCongestionLabel(car.congestionRate)}</p>
                </div>
              )}
            </div>
          );
        })}
        {direction === "left" && (
          <div className="flex-shrink-0 text-gray-400 text-lg ml-1">◀</div>
        )}
      </div>
      <div className="flex flex-wrap gap-2 mt-3">
        {[
          { label: "空いています", color: "bg-green-500", range: "〜50%" },
          { label: "やや混雑", color: "bg-yellow-400", range: "51〜80%" },
          { label: "混雑", color: "bg-orange-500", range: "81〜100%" },
          { label: "かなり混雑", color: "bg-red-500", range: "101〜150%" },
          { label: "非常に混雑", color: "bg-purple-500", range: "151%〜" },
        ].map((item) => (
          <div key={item.label} className="flex items-center gap-1 text-xs text-gray-300">
            <div className={`w-3 h-3 rounded-sm ${item.color}`} />
            <span>{item.label}</span>
            <span className="text-gray-500">({item.range})</span>
          </div>
        ))}
      </div>
    </div>
  );
}
