"use client";

import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { AttendanceRow } from "./AttendanceRow";
import { LoadingSpinner } from "@/components/common/LoadingSpinner";
import { EmptyState } from "@/components/common/EmptyState";
import { Users } from "lucide-react";
import { Student, Enrollment, Attendance, AttendanceStatus } from "@/types";
import { toast } from "sonner";

interface AttendanceData {
  studentId: string;
  status: AttendanceStatus;
  notes?: string;
}

interface AttendanceBoardProps {
  classId: string;
  date: string; // YYYY-MM-DD
  isHoliday?: boolean;
  onSaveSuccess?: () => void;
}

export function AttendanceBoard({
  classId,
  date,
  isHoliday = false,
  onSaveSuccess
}: AttendanceBoardProps) {
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [existingAttendances, setExistingAttendances] = useState<Attendance[]>([]);
  const [attendanceData, setAttendanceData] = useState<Map<string, AttendanceData>>(new Map());
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [selectAll, setSelectAll] = useState(false);

  useEffect(() => {
    loadData();
  }, [classId, date]);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [enrollmentsRes, studentsRes, attendanceRes] = await Promise.all([
        fetch(`/api/enrollments?classId=${classId}&status=active`),
        fetch("/api/students?status=active"),
        fetch(`/api/attendance?classId=${classId}&date=${date}`),
      ]);

      if (!enrollmentsRes.ok) throw new Error("수강생 목록을 불러오는데 실패했습니다");

      const enrollmentsData = await enrollmentsRes.json();
      const studentsData = studentsRes.ok ? await studentsRes.json() : { data: [] };
      const attendanceData = attendanceRes.ok ? await attendanceRes.json() : { data: [] };

      setEnrollments(enrollmentsData.data || []);
      setStudents(studentsData.data || []);
      setExistingAttendances(attendanceData.data || []);

      // Initialize attendance data from existing records
      const dataMap = new Map<string, AttendanceData>();
      (attendanceData.data || []).forEach((att: Attendance) => {
        dataMap.set(att.studentId, {
          studentId: att.studentId,
          status: att.status,
          notes: att.notes,
        });
      });

      // Fill in missing students with default "present" status
      (enrollmentsData.data || []).forEach((enr: Enrollment) => {
        if (!dataMap.has(enr.studentId)) {
          dataMap.set(enr.studentId, {
            studentId: enr.studentId,
            status: "present",
            notes: "",
          });
        }
      });

      setAttendanceData(dataMap);
    } catch (err) {
      console.error("Failed to load attendance data:", err);
      toast.error(err instanceof Error ? err.message : "데이터를 불러오는데 실패했습니다");
    } finally {
      setIsLoading(false);
    }
  };

  const handleAttendanceChange = (studentId: string, data: AttendanceData) => {
    setAttendanceData((prev) => {
      const newMap = new Map(prev);
      newMap.set(studentId, data);
      return newMap;
    });
  };

  const handleSelectAll = (checked: boolean) => {
    setSelectAll(checked);
    const newStatus: AttendanceStatus = checked ? "present" : "absent";

    setAttendanceData((prev) => {
      const newMap = new Map(prev);
      enrollments.forEach((enrollment) => {
        const current = newMap.get(enrollment.studentId);
        newMap.set(enrollment.studentId, {
          ...current,
          studentId: enrollment.studentId,
          status: newStatus,
          notes: current?.notes || "",
        });
      });
      return newMap;
    });
  };

  const handleSave = async () => {
    if (isHoliday) {
      toast.error("휴일에는 출석 체크를 저장할 수 없습니다");
      return;
    }

    setIsSaving(true);
    try {
      const records = Array.from(attendanceData.values()).map((data) => ({
        classId,
        studentId: data.studentId,
        date,
        status: data.status,
        notes: data.notes || "",
      }));

      const response = await fetch("/api/attendance/bulk", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ records }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "출석 저장에 실패했습니다");
      }

      toast.success("출석이 저장되었습니다");
      onSaveSuccess?.();
      loadData();
    } catch (error) {
      console.error("Save attendance error:", error);
      toast.error(error instanceof Error ? error.message : "출석 저장에 실패했습니다");
    } finally {
      setIsSaving(false);
    }
  };

  const activeEnrollments = enrollments.filter((e) => e.status === "active");
  const enrolledStudents = activeEnrollments
    .map((enrollment) => ({
      enrollment,
      student: students.find((s) => s.id === enrollment.studentId),
    }))
    .filter((item) => item.student)
    .sort((a, b) => (a.student?.name || "").localeCompare(b.student?.name || ""));

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (enrolledStudents.length === 0) {
    return (
      <EmptyState
        icon={Users}
        title="등록된 수강생이 없습니다"
        description="이 반에 수강생을 등록해주세요"
      />
    );
  }

  return (
    <Card className="p-6">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Checkbox
              id="selectAll"
              checked={selectAll}
              onCheckedChange={handleSelectAll}
              disabled={isHoliday}
            />
            <label htmlFor="selectAll" className="text-sm font-medium cursor-pointer">
              전체 출석 처리
            </label>
          </div>

          <Button onClick={handleSave} disabled={isSaving || isHoliday}>
            {isSaving ? "저장 중..." : "출석 저장"}
          </Button>
        </div>

        <div className="border rounded-lg overflow-hidden">
          <div className="grid grid-cols-12 gap-4 p-4 bg-gray-50 border-b font-semibold text-sm">
            <div className="col-span-2">학생명</div>
            <div className="col-span-2">출석 상태</div>
            <div className="col-span-5">메모</div>
            <div className="col-span-3">작업</div>
          </div>

          {enrolledStudents.map(({ enrollment, student }) => {
            if (!student) return null;

            const existingData = attendanceData.get(student.id);

            return (
              <AttendanceRow
                key={enrollment.id}
                student={student}
                enrollment={enrollment}
                initialData={existingData}
                onChange={(data) => handleAttendanceChange(student.id, data)}
                disabled={isHoliday}
              />
            );
          })}
        </div>
      </div>
    </Card>
  );
}
