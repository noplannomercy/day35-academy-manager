import { NextResponse } from 'next/server';
import { readDatabase } from '@/lib/storage';

/**
 * GET /api/dashboard
 *
 * 대시보드 통계 및 요약 정보 조회
 *
 * Response:
 * - totalStudents: 활성 수강생 수
 * - totalInstructors: 활성 강사 수
 * - totalClasses: 활성 반 수
 * - activeEnrollments: 활성 수강 건수
 * - monthlyRevenue: 이번 달 수납 금액
 * - unpaidList: 미납/연체 목록
 * - todaySchedule: 오늘 수업 일정
 * - todayReminders: 오늘/지난 상담 리마인더
 * - recentConsultations: 최근 상담 기록 (5건)
 * - enrollmentTrend: 최근 6개월 수강 추이
 */
export async function GET(): Promise<NextResponse> {
  try {
    const db = readDatabase();

    // Current date and month
    const now = new Date();
    const currentMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    const today = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
    const todayDayOfWeek = now.getDay();

    // 1. Total active students
    const totalStudents = db.students.filter(s => s.status === 'active').length;

    // 2. Total active instructors
    const totalInstructors = db.instructors.filter(i => i.status === 'active').length;

    // 3. Total active classes
    const totalClasses = db.classes.filter(c => c.status === 'active').length;

    // 4. Active enrollments
    const activeEnrollments = db.enrollments.filter(e => e.status === 'active').length;

    // 5. Monthly revenue (current month paid amount)
    const monthlyRevenue = db.payments
      .filter(p => p.month === currentMonth && (p.status === 'paid' || p.status === 'partial'))
      .reduce((sum, p) => sum + p.paidAmount, 0);

    // 6. Unpaid list (unpaid or overdue)
    const unpaidPayments = db.payments
      .filter(p => p.status === 'unpaid' || p.status === 'overdue')
      .map(p => {
        const student = db.students.find(s => s.id === p.studentId);
        const classInfo = db.classes.find(c => c.id === p.classId);
        return {
          id: p.id,
          studentId: p.studentId,
          studentName: student?.name || 'Unknown',
          classId: p.classId,
          className: classInfo?.name || 'Unknown',
          amount: p.amount,
          month: p.month,
          status: p.status,
        };
      });

    // 7. Today's schedule (classes scheduled for today's day of week)
    const todaySchedule = db.classes
      .filter(c => c.status === 'active')
      .filter(c => c.schedule.some(s => s.dayOfWeek === todayDayOfWeek))
      .map(c => {
        const instructor = db.instructors.find(i => i.id === c.instructorId);
        const enrollmentCount = db.enrollments.filter(
          e => e.classId === c.id && e.status === 'active'
        ).length;

        const todayScheduleSlots = c.schedule.filter(s => s.dayOfWeek === todayDayOfWeek);

        return {
          id: c.id,
          name: c.name,
          instructorName: instructor?.name || 'Unknown',
          room: c.roomId,
          enrollmentCount,
          maxStudents: c.maxStudents,
          schedules: todayScheduleSlots.map(s => ({
            startTime: s.startTime,
            endTime: s.endTime,
          })),
        };
      });

    // 8. Today's reminders (consultations with nextActionDate today or past)
    const todayReminders = db.consultations
      .filter(c => c.nextActionDate && c.nextActionDate <= today)
      .map(c => {
        const student = db.students.find(s => s.id === c.studentId);
        return {
          id: c.id,
          studentId: c.studentId,
          studentName: student?.name || 'Unknown',
          nextActionDate: c.nextActionDate,
          nextAction: c.nextAction || '',
          type: c.type,
        };
      });

    // 9. Recent consultations (last 5)
    const recentConsultations = db.consultations
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 5)
      .map(c => {
        const student = db.students.find(s => s.id === c.studentId);
        return {
          id: c.id,
          studentId: c.studentId,
          studentName: student?.name || 'Unknown',
          date: c.date,
          type: c.type,
          content: c.content,
        };
      });

    // 10. Enrollment trend (last 6 months)
    const enrollmentTrend: Array<{ month: string; count: number }> = [];
    for (let i = 5; i >= 0; i--) {
      const targetDate = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const month = `${targetDate.getFullYear()}-${String(targetDate.getMonth() + 1).padStart(2, '0')}`;

      const count = db.enrollments.filter(e => {
        const enrollMonth = e.enrollDate.substring(0, 7);
        return enrollMonth === month;
      }).length;

      enrollmentTrend.push({ month, count });
    }

    return NextResponse.json({
      data: {
        totalStudents,
        totalInstructors,
        totalClasses,
        activeEnrollments,
        monthlyRevenue,
        unpaidList: unpaidPayments,
        todaySchedule,
        todayReminders,
        recentConsultations,
        enrollmentTrend,
      },
    });
  } catch (error) {
    console.error('Dashboard API error:', error);
    return NextResponse.json(
      {
        error: '대시보드 데이터를 불러오는 데 실패했습니다.',
        code: 'DASHBOARD_ERROR',
      },
      { status: 500 }
    );
  }
}
