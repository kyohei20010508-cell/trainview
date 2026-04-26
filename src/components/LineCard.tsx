import Link from "next/link";
import type { Line } from "@/lib/api/types";
import { getAverageCongestion, getCongestionBgClass, getCongestionLabel } from "@/lib/utils/congestion";

type Props = {
  line: Line;
  avgCongestion?: number;
};

export default function LineCard({ line, avgCongestion }: Props) {
  const avg = avgCongestion ?? 0;
  return (
    <Link href={`/line/${line.id}`}>
      <div className="bg-gray-800 hover:bg-gray-700 rounded-xl p-4 border border-gray-700 hover:border-gray-500 transition-all cursor-pointer group">
        <div className="flex items-center gap-3 mb-3">
          <div
            className="w-4 h-4 rounded-full flex-shrink-0"
            style={{ backgroundColor: line.color }}
          />
          <div>
            <h3 className="font-bold text-white group-hover:text-blue-300 transition-colors">
              {line.name}
            </h3>
            <p className="text-xs text-gray-400">{line.operator}</p>
          </div>
        </div>
        {avgCongestion !== undefined && (
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-300">平均混雑率:</span>
            <span
              className={`px-2 py-0.5 rounded-full text-xs font-semibold text-white ${getCongestionBgClass(avg)}`}
            >
              {avg}% {getCongestionLabel(avg)}
            </span>
          </div>
        )}
      </div>
    </Link>
  );
}
