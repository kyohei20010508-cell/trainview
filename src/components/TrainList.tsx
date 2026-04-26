"use client";

import Link from "next/link";
import type { Train } from "@/lib/api/types";
import CongestionBadge from "./CongestionBadge";
import { getAverageCongestion } from "@/lib/utils/congestion";

type Props = {
  trains: Train[];
  loading?: boolean;
  lastUpdated?: Date | null;
};

export default function TrainList({ trains, loading, lastUpdated }: Props) {
  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full" />
        <span className="ml-3 text-gray-400">読み込み中...</span>
      </div>
    );
  }

  if (trains.length === 0) {
    return <p className="text-gray-400 text-center py-8">現在運行中の列車情報がありません</p>;
  }

  return (
    <div>
      {lastUpdated && (
        <p className="text-xs text-gray-500 mb-3">
          最終更新: {lastUpdated.toLocaleTimeString("ja-JP")}（30秒ごとに自動更新）
        </p>
      )}
      <div className="space-y-2">
        {trains.map((train) => {
          const avg = getAverageCongestion(train.cars.map((c) => c.congestionRate));
          return (
            <Link key={train.id} href={`/train/${train.id}`}>
              <div className="bg-gray-800 hover:bg-gray-700 rounded-lg p-4 border border-gray-700 hover:border-gray-500 transition-all cursor-pointer flex flex-wrap items-center gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-white">{train.trainNumber}</span>
                    {train.delay > 0 && (
                      <span className="bg-red-600 text-white text-xs px-1.5 py-0.5 rounded">
                        {train.delay}分遅延
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-gray-400 mt-0.5 truncate">
                    {train.currentStation} → {train.nextStation}
                  </p>
                </div>
                <CongestionBadge rate={avg} />
                <span className="text-gray-500 text-sm">▶</span>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
