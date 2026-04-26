"use client";

import { useState } from "react";
import { MOCK_LINES, MOCK_TRAINS } from "@/lib/api/mockData";
import { getAverageCongestion } from "@/lib/utils/congestion";
import LineCard from "@/components/LineCard";

export default function Home() {
  const [query, setQuery] = useState("");

  const filtered = MOCK_LINES.filter(
    (line) =>
      line.name.includes(query) ||
      line.operator.includes(query)
  );

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-1">路線を選択</h1>
        <p className="text-gray-400 text-sm">路線をタップして列車・混雑状況を確認</p>
      </div>
      <div className="mb-4">
        <input
          type="search"
          placeholder="路線名・事業者で検索..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="w-full bg-gray-800 border border-gray-600 rounded-lg px-4 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 transition-colors"
        />
      </div>
      {filtered.length === 0 ? (
        <p className="text-gray-500 text-center py-8">路線が見つかりません</p>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2">
          {filtered.map((line) => {
            const trains = MOCK_TRAINS[line.id] ?? [];
            const allRates = trains.flatMap((t) => t.cars.map((c) => c.congestionRate));
            const avg = getAverageCongestion(allRates);
            return <LineCard key={line.id} line={line} avgCongestion={avg} />;
          })}
        </div>
      )}
      <div className="mt-8 p-4 bg-gray-800 rounded-lg border border-gray-700 text-xs text-gray-400">
        <p className="font-semibold text-gray-300 mb-1">📌 デモモードで動作中</p>
        <p>現在はモックデータを表示しています。ODPTのAPIトークンを <code className="bg-gray-700 px-1 rounded">.env.local</code> に設定すると実データに切り替わります。</p>
      </div>
    </div>
  );
}
