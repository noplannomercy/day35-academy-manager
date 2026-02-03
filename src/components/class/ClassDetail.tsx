'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { StatusBadge } from '@/components/common/StatusBadge';
import ClassEnrollments from './ClassEnrollments';
import ClassWaitlist from './ClassWaitlist';
import type { Class } from '@/types';

interface ClassDetailProps {
  classData: {
    class: Class;
    instructor: { id: string; name: string };
    subject: { id: string; name: string };
    room?: { id: string; name: string };
    enrollments: Array<{
      id: string;
      studentId: string;
      student: { id: string; name: string };
      status: string;
      enrollmentDate: string;
    }>;
    waitlist: Array<{
      id: string;
      studentId: string;
      student: { id: string; name: string };
      status: string;
      priority: number;
      requestDate: string;
    }>;
  };
  onRefresh: () => void;
}

const DAYS_OF_WEEK = ['일', '월', '화', '수', '목', '금', '토'];

export default function ClassDetail({ classData, onRefresh }: ClassDetailProps) {
  const { class: classInfo, instructor, subject, room, enrollments, waitlist } = classData;

  const activeEnrollments = enrollments.filter(e => e.status === 'active');

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>기본 정보</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-muted-foreground">반 이름</p>
              <p className="font-medium">{classInfo.name}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">상태</p>
              <StatusBadge status={classInfo.status} />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">과목</p>
              <p className="font-medium">{subject.name}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">강사</p>
              <p className="font-medium">{instructor.name}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">강의실</p>
              <p className="font-medium">{room?.name || '-'}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">정원</p>
              <p className="font-medium">
                {activeEnrollments.length} / {classInfo.maxStudents}명
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">월 수강료</p>
              <p className="font-medium">{classInfo.monthlyFee.toLocaleString()}원</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">등록일</p>
              <p className="font-medium">{classInfo.createdAt}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>수업 일정</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {classInfo.schedule.map((item, index) => (
              <div key={index} className="flex items-center gap-4 p-2 border rounded">
                <span className="font-medium min-w-[60px]">
                  {DAYS_OF_WEEK[item.dayOfWeek]}요일
                </span>
                <span className="text-muted-foreground">
                  {item.startTime} - {item.endTime}
                </span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="enrollments">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="enrollments">
            수강생 ({activeEnrollments.length})
          </TabsTrigger>
          <TabsTrigger value="waitlist">
            대기자 ({waitlist.filter(w => w.status === 'waiting').length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="enrollments">
          <ClassEnrollments
            classId={classInfo.id}
            enrollments={enrollments}
            onRefresh={onRefresh}
          />
        </TabsContent>

        <TabsContent value="waitlist">
          <ClassWaitlist
            classId={classInfo.id}
            waitlist={waitlist}
            onRefresh={onRefresh}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
