"use client";

import { use } from "react";
import Link from "next/link";
import { MOCK_LINES } from "@/lib/api/mockData";
import { useTrains } from "@/hooks/useTrainData";
import TrainList from "@/components/TrainList";

type Props = { params: Promise<{ lineId: string }> };

export default function LinePage({ params }: Props) {
  const { lineId } = use(params);
  const line = MOCK_LINES.find((l) => l.id === lineId);
  const { trains, loading, lastUpdated } = useTrains(lineId);

  if (!line) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-400">路線が見つかりません</p>
        <Link href="/" className="text-blue-400 hover:underline mt-2 inline-block">← トップへ戻る</Link>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6">
        <Link href="/" className="text-gray-400 hover:text-white text-sm transition-colors">← 路線一覧</Link>
        <div className="flex items-center gap-3 mt-2">
          <div className="w-5 h-5 rounded-full flex-shrink-0" style={{ backgroundColor: line.color }} />
          <div>
            <h1 className="text-2xl font-bold">{line.name}</h1>
            <p className="text-gray-400 text-sm">{line.operator}</p>
          </div>
        </div>
      </div>
      <TrainList trains={trains} loading={loading} lastUpdated={lastUpdated} />
    </div>
  );
}
