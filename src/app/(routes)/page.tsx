'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Users,
  GraduationCap,
  DollarSign,
  AlertCircle,
  Clock,
  BookOpen,
} from 'lucide-react';
import { StatCard } from '@/components/dashboard/StatCard';
import { UnpaidList } from '@/components/dashboard/UnpaidList';
import { TodaySchedule } from '@/components/dashboard/TodaySchedule';
import { TodayReminders } from '@/components/dashboard/TodayReminders';
import { RecentConsultations } from '@/components/dashboard/RecentConsultations';
import { EnrollmentChart } from '@/components/dashboard/EnrollmentChart';

interface DashboardData {
  totalStudents: number;
  totalInstructors: number;
  totalClasses: number;
  activeEnrollments: number;
  monthlyRevenue: number;
  unpaidList: Array<{
    id: string;
    studentId: string;
    studentName: string;
    classId: string;
    className: string;
    amount: number;
    month: string;
    status: string;
  }>;
  todaySchedule: Array<{
    id: string;
    name: string;
    instructorName: string;
    room?: string;
    enrollmentCount: number;
    maxStudents: number;
    schedules: Array<{
      startTime: string;
      endTime: string;
    }>;
  }>;
  todayReminders: Array<{
    id: string;
    studentId: string;
    studentName: string;
    nextActionDate?: string;
    nextAction: string;
    type: string;
  }>;
  recentConsultations: Array<{
    id: string;
    studentId: string;
    studentName: string;
    date: string;
    type: string;
    content: string;
  }>;
  enrollmentTrend: Array<{
    month: string;
    count: number;
  }>;
}

export default function DashboardPage() {
  const router = useRouter();
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch('/api/dashboard');
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || '데이터를 불러오는 데 실패했습니다.');
      }

      setData(result.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : '알 수 없는 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">로딩 중...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
          <p className="text-lg font-semibold mb-2">오류가 발생했습니다</p>
          <p className="text-muted-foreground mb-4">{error}</p>
          <button
            onClick={fetchDashboardData}
            className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
          >
            다시 시도
          </button>
        </div>
      </div>
    );
  }

  if (!data) {
    return null;
  }

  // Calculate unpaid stats
  const unpaidCount = data.unpaidList.filter(p => p.status === 'unpaid').length;
  const unpaidAmount = data.unpaidList
    .filter(p => p.status === 'unpaid')
    .reduce((sum, p) => sum + p.amount, 0);
  const overdueCount = data.unpaidList.filter(p => p.status === 'overdue').length;

  // Transform unpaid list for component
  const unpaidListData = data.unpaidList.map(item => ({
    payment: {
      id: item.id,
      studentId: item.studentId,
      classId: item.classId,
      amount: item.amount,
      paidAmount: 0,
      month: item.month,
      status: item.status as any,
      isProrated: false,
      createdAt: new Date().toISOString(),
    },
    student: {
      id: item.studentId,
      name: item.studentName,
      phone: '',
      status: 'active' as const,
      enrollDate: '',
      createdAt: '',
    },
    class: {
      id: item.classId,
      name: item.className,
      subjectId: '',
      instructorId: '',
      maxStudents: 0,
      schedule: [],
      monthlyFee: 0,
      status: 'active' as const,
      createdAt: '',
    },
  }));

  // Transform today schedule for component
  const todayScheduleData = data.todaySchedule.flatMap(cls =>
    cls.schedules.map(schedule => ({
      class: {
        id: cls.id,
        name: cls.name,
        subjectId: '',
        instructorId: '',
        maxStudents: cls.maxStudents,
        schedule: [],
        monthlyFee: 0,
        status: 'active' as const,
        createdAt: '',
      },
      instructor: {
        id: '',
        name: cls.instructorName,
        phone: '',
        subjectIds: [],
        status: 'active' as const,
        createdAt: '',
      },
      subject: {
        id: '',
        name: '',
      },
      room: cls.room ? {
        id: cls.room,
        name: cls.room,
      } : undefined,
      startTime: schedule.startTime,
      endTime: schedule.endTime,
    }))
  );

  // Transform reminders for component
  const remindersData = data.todayReminders.map(reminder => ({
    consultation: {
      id: reminder.id,
      studentId: reminder.studentId,
      date: reminder.nextActionDate || new Date().toISOString().split('T')[0],
      type: reminder.type as any,
      content: '',
      nextAction: reminder.nextAction,
      nextActionDate: reminder.nextActionDate,
      createdAt: new Date().toISOString(),
    },
    student: {
      id: reminder.studentId,
      name: reminder.studentName,
      phone: '',
      status: 'active' as const,
      enrollDate: '',
      createdAt: '',
    },
  }));

  // Transform recent consultations for component
  const consultationsData = data.recentConsultations.map(consultation => ({
    consultation: {
      id: consultation.id,
      studentId: consultation.studentId,
      date: consultation.date,
      type: consultation.type as any,
      content: consultation.content,
      createdAt: new Date().toISOString(),
    },
    student: {
      id: consultation.studentId,
      name: consultation.studentName,
      phone: '',
      status: 'active' as const,
      enrollDate: '',
      createdAt: '',
    },
  }));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">대시보드</h1>
        <p className="text-muted-foreground mt-1">학원 운영 현황을 한눈에 확인하세요</p>
      </div>

      {/* 통계 카드 */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <StatCard
          title="전체 수강생"
          value={data.totalStudents.toLocaleString()}
          icon={Users}
          color="blue"
          onClick={() => router.push('/students')}
        />
        <StatCard
          title="전체 반"
          value={data.totalClasses.toLocaleString()}
          icon={BookOpen}
          color="green"
          onClick={() => router.push('/classes')}
        />
        <StatCard
          title="이번 달 수익"
          value={`${data.monthlyRevenue.toLocaleString()}원`}
          icon={DollarSign}
          color="purple"
          onClick={() => router.push('/payments')}
        />
        <StatCard
          title="미납 건수"
          value={unpaidCount.toLocaleString()}
          icon={AlertCircle}
          color={unpaidCount > 0 ? 'yellow' : 'gray'}
          onClick={() => router.push('/payments?status=unpaid')}
        />
        <StatCard
          title="미납 금액"
          value={`${unpaidAmount.toLocaleString()}원`}
          icon={DollarSign}
          color={unpaidAmount > 0 ? 'yellow' : 'gray'}
          onClick={() => router.push('/payments?status=unpaid')}
        />
        <StatCard
          title="연체 건수"
          value={overdueCount.toLocaleString()}
          icon={Clock}
          color={overdueCount > 0 ? 'red' : 'gray'}
          onClick={() => router.push('/payments?status=overdue')}
        />
      </div>

      {/* 2열 그리드 */}
      <div className="grid gap-6 md:grid-cols-2">
        <UnpaidList
          data={unpaidListData}
          limit={10}
          onViewAll={() => router.push('/payments?status=unpaid')}
        />
        <TodaySchedule data={todayScheduleData} />
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <TodayReminders data={remindersData} />
        <RecentConsultations data={consultationsData} />
      </div>

      {/* 차트 */}
      <EnrollmentChart data={data.enrollmentTrend} />
    </div>
  );
}
