"use client";

import { AlertCircle } from "lucide-react";
import { Card } from "@/components/ui/card";

interface HolidayBannerProps {
  holidayName: string;
}

export function HolidayBanner({ holidayName }: HolidayBannerProps) {
  return (
    <Card className="bg-red-50 border-red-200 p-4">
      <div className="flex items-start gap-3">
        <AlertCircle className="h-5 w-5 text-red-600 mt-0.5" />
        <div>
          <h3 className="font-semibold text-red-900 mb-1">휴일</h3>
          <p className="text-sm text-red-700">
            오늘은 <strong>{holidayName}</strong>입니다. 출석 체크가 불가능합니다.
          </p>
        </div>
      </div>
    </Card>
  );
}
