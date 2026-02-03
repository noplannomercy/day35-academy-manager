"use client";

import { useState, useEffect } from "react";
import { format } from "date-fns";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import ClassSelect from "@/components/class/ClassSelect";
import { DateSelector } from "@/components/attendance/DateSelector";
import { HolidayBanner } from "@/components/attendance/HolidayBanner";
import { AttendanceBoard } from "@/components/attendance/AttendanceBoard";
import { AttendanceStats } from "@/components/attendance/AttendanceStats";
import { MakeupList } from "@/components/makeup/MakeupList";
import { LoadingSpinner } from "@/components/common/LoadingSpinner";
import { ExportButton } from "@/components/export/ExportButton";
import { Holiday } from "@/types";

export default function AttendancePage() {
  const [selectedClassId, setSelectedClassId] = useState<string>("");
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [holidays, setHolidays] = useState<Holiday[]>([]);
  const [isLoadingHolidays, setIsLoadingHolidays] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  useEffect(() => {
    loadHolidays();
  }, []);

  const loadHolidays = async () => {
    setIsLoadingHolidays(true);
    try {
      const response = await fetch("/api/holidays");
      if (response.ok) {
        const result = await response.json();
        setHolidays(result.data || []);
      }
    } catch (error) {
      console.error("Failed to load holidays:", error);
    } finally {
      setIsLoadingHolidays(false);
    }
  };

  const selectedDateString = format(selectedDate, "yyyy-MM-dd");
  const holidayOnDate = holidays.find((h) => h.date === selectedDateString);
  const isHoliday = !!holidayOnDate;

  const handleSaveSuccess = () => {
    setRefreshTrigger((prev) => prev + 1);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold">출석 관리</h1>
          <p className="text-gray-600 mt-2">수업별 출석을 체크하고 보강을 관리합니다</p>
        </div>
        {selectedClassId && (
          <ExportButton
            type="attendance"
            params={{
              classId: selectedClassId,
              startDate: format(new Date(new Date().setMonth(new Date().getMonth() - 1)), 'yyyy-MM-dd'),
              endDate: selectedDateString,
            }}
          />
        )}
      </div>

      <Card className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>
              수업 선택 <span className="text-red-500">*</span>
            </Label>
            <ClassSelect
              value={selectedClassId}
              onChange={setSelectedClassId}
              placeholder="출석 체크할 수업을 선택하세요"
            />
          </div>

          <DateSelector
            value={selectedDate}
            onChange={(date) => date && setSelectedDate(date)}
            label="날짜 선택"
          />
        </div>
      </Card>

      {isHoliday && <HolidayBanner holidayName={holidayOnDate.name} />}

      {selectedClassId && (
        <Tabs defaultValue="attendance" className="space-y-6">
          <TabsList>
            <TabsTrigger value="attendance">출석 체크</TabsTrigger>
            <TabsTrigger value="stats">출석 통계</TabsTrigger>
            <TabsTrigger value="makeup">보강 관리</TabsTrigger>
          </TabsList>

          <TabsContent value="attendance" className="space-y-6">
            <AttendanceBoard
              classId={selectedClassId}
              date={selectedDateString}
              isHoliday={isHoliday}
              onSaveSuccess={handleSaveSuccess}
            />
          </TabsContent>

          <TabsContent value="stats" className="space-y-6">
            <AttendanceStats classId={selectedClassId} />
          </TabsContent>

          <TabsContent value="makeup" className="space-y-6">
            <MakeupList refreshTrigger={refreshTrigger} />
          </TabsContent>
        </Tabs>
      )}

      {!selectedClassId && (
        <Card className="p-12">
          <div className="text-center space-y-2">
            <p className="text-lg font-medium text-gray-900">수업을 선택해주세요</p>
            <p className="text-sm text-gray-500">
              출석을 체크할 수업과 날짜를 선택하면 출석 명단이 표시됩니다
            </p>
          </div>
        </Card>
      )}

      {isLoadingHolidays && (
        <div className="fixed inset-0 bg-black/20 flex items-center justify-center z-50">
          <LoadingSpinner />
        </div>
      )}
    </div>
  );
}
