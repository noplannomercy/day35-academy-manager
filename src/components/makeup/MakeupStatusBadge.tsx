"use client";

import { Badge } from "@/components/ui/badge";
import { MakeupStatus } from "@/types";

interface MakeupStatusBadgeProps {
  status: MakeupStatus;
}

const STATUS_CONFIG: Record<MakeupStatus, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
  pending: { label: "대기", variant: "default" },
  completed: { label: "완료", variant: "secondary" },
  cancelled: { label: "취소", variant: "outline" },
};

export function MakeupStatusBadge({ status }: MakeupStatusBadgeProps) {
  const config = STATUS_CONFIG[status];

  return (
    <Badge
      variant={config.variant}
      className={
        status === "pending"
          ? "bg-yellow-100 text-yellow-800 border-yellow-300"
          : status === "completed"
          ? "bg-green-100 text-green-800 border-green-300"
          : "bg-gray-100 text-gray-600 border-gray-300"
      }
    >
      {config.label}
    </Badge>
  );
}
