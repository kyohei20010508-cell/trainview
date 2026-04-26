import { getCongestionBgClass, getCongestionLabel } from "@/lib/utils/congestion";

type Props = {
  rate: number;
  showRate?: boolean;
};

export default function CongestionBadge({ rate, showRate = true }: Props) {
  return (
    <span
      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold text-white ${getCongestionBgClass(rate)}`}
    >
      {showRate && <span>{rate}%</span>}
      <span>{getCongestionLabel(rate)}</span>
    </span>
  );
}
