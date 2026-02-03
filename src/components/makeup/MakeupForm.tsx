"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { format } from "date-fns";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { DatePicker } from "@/components/common/DatePicker";
import { TimePicker } from "@/components/common/TimePicker";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

const makeupSchema = z.object({
  enrollmentId: z.string().min(1, "수강 ID는 필수입니다"),
  absenceDate: z.string().min(1, "결석 날짜는 필수입니다"),
  scheduledDate: z.string().min(1, "보강 날짜는 필수입니다"),
  scheduledTime: z.string().regex(/^\d{2}:\d{2}$/, "올바른 시간 형식이 아닙니다 (HH:MM)"),
});

type MakeupFormData = z.infer<typeof makeupSchema>;

interface MakeupFormProps {
  open: boolean;
  onClose: () => void;
  enrollmentId: string;
  absenceDate: string;
  studentName: string;
  onSuccess?: () => void;
}

export function MakeupForm({
  open,
  onClose,
  enrollmentId,
  absenceDate,
  studentName,
  onSuccess
}: MakeupFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<MakeupFormData>({
    resolver: zodResolver(makeupSchema),
    defaultValues: {
      enrollmentId,
      absenceDate,
      scheduledDate: "",
      scheduledTime: "14:00",
    },
  });

  const onSubmit = async (data: MakeupFormData) => {
    setIsSubmitting(true);
    try {
      const response = await fetch("/api/makeup-classes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "보강 예약에 실패했습니다");
      }

      toast.success("보강이 예약되었습니다");
      onSuccess?.();
      onClose();
    } catch (error) {
      console.error("Makeup reservation error:", error);
      toast.error(error instanceof Error ? error.message : "보강 예약에 실패했습니다");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>보강 예약</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">학생</label>
              <div className="text-sm text-gray-600">{studentName}</div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">결석 날짜</label>
              <div className="text-sm text-gray-600">
                {format(new Date(absenceDate), "yyyy년 MM월 dd일")}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="scheduledDate">
                보강 날짜 <span className="text-red-500">*</span>
              </Label>
              <DatePicker
                value={form.watch("scheduledDate") ? new Date(form.watch("scheduledDate")) : undefined}
                onChange={(date) => form.setValue("scheduledDate", date ? format(date, "yyyy-MM-dd") : "")}
              />
              {form.formState.errors.scheduledDate && (
                <p className="text-sm text-red-500">{form.formState.errors.scheduledDate.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="scheduledTime">
                보강 시간 <span className="text-red-500">*</span>
              </Label>
              <TimePicker
                value={form.watch("scheduledTime")}
                onChange={(time) => form.setValue("scheduledTime", time)}
              />
              {form.formState.errors.scheduledTime && (
                <p className="text-sm text-red-500">{form.formState.errors.scheduledTime.message}</p>
              )}
            </div>

            <div className="flex justify-end gap-2 pt-4">
              <Button type="button" variant="outline" onClick={onClose}>
                취소
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "예약 중..." : "예약하기"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
