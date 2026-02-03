"use client";

import { useState, useEffect } from "react";
import { format } from "date-fns";
import { Calendar } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { MakeupStatusBadge } from "./MakeupStatusBadge";
import { LoadingSpinner } from "@/components/common/LoadingSpinner";
import { EmptyState } from "@/components/common/EmptyState";
import { ErrorMessage } from "@/components/common/ErrorMessage";
import { MakeupClass, MakeupStatus, Student, Enrollment, Class } from "@/types";
import { toast } from "sonner";

interface MakeupWithDetails extends MakeupClass {
  student?: Student;
  class?: Class;
}

interface MakeupListProps {
  enrollmentId?: string;
  refreshTrigger?: number;
}

export function MakeupList({ enrollmentId, refreshTrigger }: MakeupListProps) {
  const [makeups, setMakeups] = useState<MakeupWithDetails[]>([]);
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [classes, setClasses] = useState<Class[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<MakeupStatus | "all">("all");

  useEffect(() => {
    loadMakeups();
  }, [enrollmentId, refreshTrigger]);

  const loadMakeups = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      if (enrollmentId) {
        params.append("enrollmentId", enrollmentId);
      }

      const [makeupsRes, enrollmentsRes, studentsRes, classesRes] = await Promise.all([
        fetch(`/api/makeup-classes?${params.toString()}`),
        fetch("/api/enrollments"),
        fetch("/api/students"),
        fetch("/api/classes"),
      ]);

      if (!makeupsRes.ok) throw new Error("보강 목록을 불러오는데 실패했습니다");

      const makeupsData = await makeupsRes.json();
      const enrollmentsData = enrollmentsRes.ok ? await enrollmentsRes.json() : { data: [] };
      const studentsData = studentsRes.ok ? await studentsRes.json() : { data: [] };
      const classesData = classesRes.ok ? await classesRes.json() : { data: [] };

      setMakeups(makeupsData.data || []);
      setEnrollments(enrollmentsData.data || []);
      setStudents(studentsData.data || []);
      setClasses(classesData.data || []);
    } catch (err) {
      console.error("Failed to load makeups:", err);
      setError(err instanceof Error ? err.message : "데이터를 불러오는데 실패했습니다");
    } finally {
      setIsLoading(false);
    }
  };

  const handleStatusChange = async (makeupId: string, newStatus: MakeupStatus) => {
    try {
      const response = await fetch(`/api/makeup-classes/${makeupId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!response.ok) {
        const result = await response.json();
        throw new Error(result.error || "상태 변경에 실패했습니다");
      }

      toast.success("보강 상태가 변경되었습니다");
      loadMakeups();
    } catch (error) {
      console.error("Status change error:", error);
      toast.error(error instanceof Error ? error.message : "상태 변경에 실패했습니다");
    }
  };

  const getMakeupDetails = (makeup: MakeupClass): MakeupWithDetails => {
    const enrollment = enrollments.find((e) => e.id === makeup.enrollmentId);
    const student = enrollment ? students.find((s) => s.id === enrollment.studentId) : undefined;
    const classInfo = enrollment ? classes.find((c) => c.id === enrollment.classId) : undefined;

    return {
      ...makeup,
      student,
      class: classInfo,
    };
  };

  const filteredMakeups = makeups
    .map(getMakeupDetails)
    .filter((m) => statusFilter === "all" || m.status === statusFilter)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (error) {
    return <ErrorMessage message={error} onRetry={loadMakeups} />;
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">보강 관리</h3>
        <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as MakeupStatus | "all")}>
          <SelectTrigger className="w-32">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">전체</SelectItem>
            <SelectItem value="pending">대기</SelectItem>
            <SelectItem value="completed">완료</SelectItem>
            <SelectItem value="cancelled">취소</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {filteredMakeups.length === 0 ? (
        <EmptyState
          icon={Calendar}
          title="보강 예약이 없습니다"
          description={statusFilter === "all" ? "결석 시 보강을 예약할 수 있습니다" : `${statusFilter === "pending" ? "대기 중인" : statusFilter === "completed" ? "완료된" : "취소된"} 보강이 없습니다`}
        />
      ) : (
        <div className="space-y-2">
          {filteredMakeups.map((makeup) => (
            <Card key={makeup.id} className="p-4">
              <div className="flex items-start justify-between">
                <div className="space-y-2 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{makeup.student?.name || "알 수 없음"}</span>
                    <span className="text-sm text-gray-500">
                      {makeup.class?.name || "알 수 없음"}
                    </span>
                    <MakeupStatusBadge status={makeup.status} />
                  </div>
                  <div className="text-sm text-gray-600 space-y-1">
                    <div>
                      결석: {format(new Date(makeup.absenceDate), "yyyy-MM-dd")}
                    </div>
                    <div>
                      보강: {format(new Date(makeup.scheduledDate), "yyyy-MM-dd")} {makeup.scheduledTime}
                    </div>
                  </div>
                </div>

                {makeup.status === "pending" && (
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleStatusChange(makeup.id, "completed")}
                    >
                      완료
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleStatusChange(makeup.id, "cancelled")}
                    >
                      취소
                    </Button>
                  </div>
                )}
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
