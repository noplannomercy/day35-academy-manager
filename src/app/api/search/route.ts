import { NextRequest, NextResponse } from 'next/server';
import { readDatabase } from '@/lib/storage';

/**
 * GET /api/search?q=keyword
 *
 * 통합 검색 (수강생, 반, 강사)
 *
 * Query Params:
 * - q: 검색 키워드 (필수)
 *
 * Response:
 * - students: 매칭된 수강생 목록
 * - classes: 매칭된 반 목록
 * - instructors: 매칭된 강사 목록
 * - totalCount: 총 검색 결과 수
 */
export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q');

    if (!query) {
      return NextResponse.json(
        {
          error: '검색 키워드를 입력해주세요.',
          code: 'QUERY_REQUIRED',
        },
        { status: 400 }
      );
    }

    const db = readDatabase();
    const keyword = query.toLowerCase().trim();

    // Search students (name, phone)
    const students = db.students
      .filter(s => {
        const nameMatch = s.name.toLowerCase().includes(keyword);
        const phoneMatch = s.phone.includes(keyword);
        const parentPhoneMatch = s.parentPhone?.includes(keyword);
        return nameMatch || phoneMatch || parentPhoneMatch;
      })
      .map(s => ({
        id: s.id,
        name: s.name,
        phone: s.phone,
        status: s.status,
        enrollDate: s.enrollDate,
      }));

    // Search classes (name)
    const classes = db.classes
      .filter(c => c.name.toLowerCase().includes(keyword))
      .map(c => {
        const instructor = db.instructors.find(i => i.id === c.instructorId);
        const enrollmentCount = db.enrollments.filter(
          e => e.classId === c.id && e.status === 'active'
        ).length;

        return {
          id: c.id,
          name: c.name,
          instructorName: instructor?.name || 'Unknown',
          status: c.status,
          enrollmentCount,
          maxStudents: c.maxStudents,
        };
      });

    // Search instructors (name, phone)
    const instructors = db.instructors
      .filter(i => {
        const nameMatch = i.name.toLowerCase().includes(keyword);
        const phoneMatch = i.phone.includes(keyword);
        return nameMatch || phoneMatch;
      })
      .map(i => {
        const subjects = i.subjectIds
          .map(sid => db.settings.subjects.find(s => s.id === sid)?.name)
          .filter(Boolean);

        return {
          id: i.id,
          name: i.name,
          phone: i.phone,
          status: i.status,
          subjects,
        };
      });

    const totalCount = students.length + classes.length + instructors.length;

    return NextResponse.json({
      data: {
        students,
        classes,
        instructors,
      },
      totalCount,
    });
  } catch (error) {
    console.error('Search API error:', error);
    return NextResponse.json(
      {
        error: '검색에 실패했습니다.',
        code: 'SEARCH_ERROR',
      },
      { status: 500 }
    );
  }
}
