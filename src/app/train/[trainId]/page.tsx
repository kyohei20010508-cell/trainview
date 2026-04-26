import { notFound } from "next/navigation";
import Link from "next/link";
import { getTrainDetail } from "@/lib/api/odpt";
import { MOCK_LINES } from "@/lib/api/mockData";
import CarVisualization from "@/components/CarVisualization";
import CongestionBadge from "@/components/CongestionBadge";
import CongestionReporter from "@/components/CongestionReporter";
import { getAverageCongestion } from "@/lib/utils/congestion";

type Props = { params: Promise<{ trainId: string }> };

export default async function TrainPage({ params }: Props) {
  const { trainId } = await params;
  const train = await getTrainDetail(trainId);

  if (!train) notFound();

  const line = MOCK_LINES.find((l) => l.id === train.lineId);
  const avg = getAverageCongestion(train.cars.map((c) => c.congestionRate));
  const crowdsourcedCount = train.cars.filter(
    (c) => c.dataSource === "crowdsourced" || c.dataSource === "blended"
  ).length;

  return (
    <div>
      {/* ヘッダー */}
      <div className="mb-6">
        <Link
          href={`/line/${train.lineId}`}
          className="text-gray-400 hover:text-white text-sm transition-colors"
        >
          ← {line?.name ?? "路線"}の列車一覧
        </Link>
        <div className="flex flex-wrap items-center gap-3 mt-2">
          {line && (
            <div className="w-4 h-4 rounded-full flex-shrink-0" style={{ backgroundColor: line.color }} />
          )}
          <h1 className="text-2xl font-bold">{train.trainNumber}</h1>
          {train.delay > 0 && (
            <span className="bg-red-600 text-white text-sm px-2 py-0.5 rounded">
              {train.delay}分遅延
            </span>
          )}
          {crowdsourcedCount > 0 && (
            <span className="bg-blue-700 text-blue-200 text-xs px-2 py-0.5 rounded-full">
              👥 ユーザー報告 {crowdsourcedCount}両
            </span>
          )}
        </div>
        <div className="flex flex-wrap items-center gap-4 mt-2 text-sm text-gray-400">
          <span>現在駅: <span className="text-white">{train.currentStation}</span></span>
          <span>次駅: <span className="text-white">{train.nextStation}</span></span>
          <CongestionBadge rate={avg} />
        </div>
      </div>

      {/* 車両ビジュアル */}
      <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
        <h2 className="text-lg font-bold mb-4">車両別混雑状況</h2>
        <CarVisualization cars={train.cars} direction="right" />
      </div>

      {/* 車両グリッド */}
      <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
        {train.cars.map((car) => {
          const isCrowdsourced = car.dataSource === "crowdsourced" || car.dataSource === "blended";
          return (
            <div
              key={car.carNumber}
              className={`bg-gray-800 rounded-lg p-3 border text-center ${
                isCrowdsourced ? "border-blue-500" : "border-gray-700"
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <p className="text-xs text-gray-400">{car.carNumber}号車</p>
                {car.reportCount != null && (
                  <span className="text-xs text-blue-400">👥{car.reportCount}</span>
                )}
              </div>
              <p className="text-2xl font-bold text-white">{car.congestionRate}%</p>
              <CongestionBadge rate={car.congestionRate} showRate={false} />
            </div>
          );
        })}
      </div>

      {/* 混雑報告UI */}
      <CongestionReporter
        trainId={train.id}
        lineId={train.lineId}
        carCount={train.cars.length}
      />

      {/* データソース説明 */}
      <div className="mt-4 p-3 bg-gray-800/50 rounded-lg border border-gray-700 text-xs text-gray-500 space-y-1">
        <p className="font-semibold text-gray-400">データソースについて</p>
        <p>📡 列車単位 … ODPT APIの列車全体混雑率を全車両に適用</p>
        <p>👥 ユーザー報告 … 乗客からの投稿（3件以上で完全採用）</p>
        <p>👥+📡 ブレンド … 投稿1〜2件とODPTを重み付き平均（投稿60%）</p>
        <p className="text-gray-600">* データは30分で自動失効します</p>
      </div>
    </div>
  );
}
