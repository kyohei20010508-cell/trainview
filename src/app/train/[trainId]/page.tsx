import { notFound } from "next/navigation";
import Link from "next/link";
import { getTrainDetail } from "@/lib/api/odpt";
import { MOCK_LINES } from "@/lib/api/mockData";
import CarVisualization from "@/components/CarVisualization";
import CongestionBadge from "@/components/CongestionBadge";
import { getAverageCongestion } from "@/lib/utils/congestion";

type Props = { params: Promise<{ trainId: string }> };

export default async function TrainPage({ params }: Props) {
  const { trainId } = await params;
  const train = await getTrainDetail(trainId);

  if (!train) notFound();

  const line = MOCK_LINES.find((l) => l.id === train.lineId);
  const avg = getAverageCongestion(train.cars.map((c) => c.congestionRate));

  return (
    <div>
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
          <h1 className="text-2xl font-bold">
            {train.trainNumber}
          </h1>
          {train.delay > 0 && (
            <span className="bg-red-600 text-white text-sm px-2 py-0.5 rounded">
              {train.delay}分遅延
            </span>
          )}
        </div>
        <div className="flex flex-wrap items-center gap-4 mt-2 text-sm text-gray-400">
          <span>現在駅: <span className="text-white">{train.currentStation}</span></span>
          <span>次駅: <span className="text-white">{train.nextStation}</span></span>
          <CongestionBadge rate={avg} />
        </div>
      </div>

      <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
        <h2 className="text-lg font-bold mb-4">車両別混雑状況</h2>
        <CarVisualization cars={train.cars} direction="right" />
      </div>

      <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
        {train.cars.map((car) => (
          <div key={car.carNumber} className="bg-gray-800 rounded-lg p-3 border border-gray-700 text-center">
            <p className="text-xs text-gray-400">{car.carNumber}号車</p>
            <p className="text-2xl font-bold mt-1" style={{ color: "#fff" }}>
              {car.congestionRate}%
            </p>
            <CongestionBadge rate={car.congestionRate} showRate={false} />
          </div>
        ))}
      </div>
    </div>
  );
}
