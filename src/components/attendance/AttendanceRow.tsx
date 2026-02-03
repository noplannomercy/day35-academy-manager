"use client";

import { useState } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { AttendanceStatus, Student, Enrollment } from "@/types";
import { MakeupForm } from "@/components/makeup/MakeupForm";

interface AttendanceRowData {
  studentId: string;
  status: AttendanceStatus;
  notes?: string;
}

interface AttendanceRowProps {
  student: Student;
  enrollment: Enrollment;
  initialData?: AttendanceRowData;
  onChange: (data: AttendanceRowData) => void;
  disabled?: boolean;
}

const STATUS_LABELS: Record<AttendanceStatus, string> = {
  present: "출석",
  absent: "결석",
  late: "지각",
  excused: "병결",
};

export function AttendanceRow({
  student,
  enrollment,
  initialData,
  onChange,
  disabled = false
}: AttendanceRowProps) {
  const [status, setStatus] = useState<AttendanceStatus>(initialData?.status || "present");
  const [notes, setNotes] = useState(initialData?.notes || "");
  const [showMakeupForm, setShowMakeupForm] = useState(false);

  const handleStatusChange = (newStatus: AttendanceStatus) => {
    setStatus(newStatus);
    onChange({
      studentId: student.id,
      status: newStatus,
      notes,
    });
  };

  const handleNotesChange = (newNotes: string) => {
    setNotes(newNotes);
    onChange({
      studentId: student.id,
      status,
      notes: newNotes,
    });
  };

  return (
    <>
      <div className="grid grid-cols-12 gap-4 items-start p-4 border-b hover:bg-gray-50">
        <div className="col-span-2">
          <p className="font-medium">{student.name}</p>
        </div>

        <div className="col-span-2">
          <Select
            value={status}
            onValueChange={(value) => handleStatusChange(value as AttendanceStatus)}
            disabled={disabled}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="present">{STATUS_LABELS.present}</SelectItem>
              <SelectItem value="absent">{STATUS_LABELS.absent}</SelectItem>
              <SelectItem value="late">{STATUS_LABELS.late}</SelectItem>
              <SelectItem value="excused">{STATUS_LABELS.excused}</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="col-span-5">
          <Textarea
            value={notes}
            onChange={(e) => handleNotesChange(e.target.value)}
            placeholder="메모 (선택사항)"
            disabled={disabled}
            className="min-h-[60px]"
          />
        </div>

        <div className="col-span-3">
          {status === "absent" && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowMakeupForm(true)}
              disabled={disabled}
            >
              보강 예약
            </Button>
          )}
        </div>
      </div>

      {showMakeupForm && (
        <MakeupForm
          open={showMakeupForm}
          onClose={() => setShowMakeupForm(false)}
          enrollmentId={enrollment.id}
          absenceDate={new Date().toISOString().split("T")[0]}
          studentName={student.name}
        />
      )}
    </>
  );
}
