'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { StatusBadge } from '@/components/common';
import StudentEnrollments from './StudentEnrollments';
import StudentPayments from './StudentPayments';
import StudentConsultations from './StudentConsultations';
import StudentWaitlists from './StudentWaitlists';
import type { Student } from '@/types';
import { Phone, Mail, Calendar } from 'lucide-react';

interface StudentDetailProps {
  student: Student;
}

export default function StudentDetail({ student }: StudentDetailProps) {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>기본 정보</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm text-gray-600">이름</label>
              <div className="flex items-center gap-2 mt-1">
                <span className="font-semibold">{student.name}</span>
                <StatusBadge status={student.status} />
              </div>
            </div>
            <div>
              <label className="text-sm text-gray-600">전화번호</label>
              <div className="flex items-center gap-2 mt-1">
                <Phone className="h-4 w-4" />
                <span>{student.phone}</span>
              </div>
            </div>
            {student.parentPhone && (
              <div>
                <label className="text-sm text-gray-600">학부모 전화번호</label>
                <div className="flex items-center gap-2 mt-1">
                  <Phone className="h-4 w-4" />
                  <span>{student.parentPhone}</span>
                </div>
              </div>
            )}
            {student.email && (
              <div>
                <label className="text-sm text-gray-600">이메일</label>
                <div className="flex items-center gap-2 mt-1">
                  <Mail className="h-4 w-4" />
                  <span>{student.email}</span>
                </div>
              </div>
            )}
            <div>
              <label className="text-sm text-gray-600">등록일</label>
              <div className="flex items-center gap-2 mt-1">
                <Calendar className="h-4 w-4" />
                <span>{student.enrollDate}</span>
              </div>
            </div>
            {student.birthDate && (
              <div>
                <label className="text-sm text-gray-600">생년월일</label>
                <div className="flex items-center gap-2 mt-1">
                  <Calendar className="h-4 w-4" />
                  <span>{student.birthDate}</span>
                </div>
              </div>
            )}
            {student.notes && (
              <div className="col-span-2">
                <label className="text-sm text-gray-600">메모</label>
                <div className="mt-1 text-gray-700">{student.notes}</div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="enrollments">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="enrollments">수강 내역</TabsTrigger>
          <TabsTrigger value="payments">수납 내역</TabsTrigger>
          <TabsTrigger value="consultations">상담 내역</TabsTrigger>
          <TabsTrigger value="waitlists">대기 내역</TabsTrigger>
        </TabsList>

        <TabsContent value="enrollments">
          <StudentEnrollments studentId={student.id} />
        </TabsContent>

        <TabsContent value="payments">
          <StudentPayments studentId={student.id} />
        </TabsContent>

        <TabsContent value="consultations">
          <StudentConsultations studentId={student.id} />
        </TabsContent>

        <TabsContent value="waitlists">
          <StudentWaitlists studentId={student.id} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
