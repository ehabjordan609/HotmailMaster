import { STATUS_COLORS, STATUS_LABELS } from "@/lib/constants";
import { AccountStatus } from "@/types";

interface StatusBadgeProps {
  status: AccountStatus;
  className?: string;
  showLabel?: boolean;
}

export function StatusBadge({ status, className = "", showLabel = true }: StatusBadgeProps) {
  return (
    <div className={`flex items-center ${className}`}>
      <span className={`inline-block w-2 h-2 rounded-full ${STATUS_COLORS[status]} mr-1`}></span>
      {showLabel && <span className="text-xs text-[#605e5c]">{STATUS_LABELS[status]}</span>}
    </div>
  );
}
