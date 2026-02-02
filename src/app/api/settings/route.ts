import { NextRequest } from 'next/server';
import { readDatabase, writeDatabase } from '@/lib/storage';
import { successResponse, validationErrorResponse } from '@/lib/api-utils';
import { settingsUpdateSchema } from '@/lib/validations';
import { generateId } from '@/lib/utils';
import type { Level, Subject, Room, Source } from '@/types';

// ========================================
// GET /api/settings
// ========================================

export async function GET(): Promise<Response> {
  try {
    const db = readDatabase();
    return successResponse(db.settings);
  } catch (error) {
    console.error('GET /api/settings error:', error);
    return validationErrorResponse('설정을 불러오는 중 오류가 발생했습니다.');
  }
}

// ========================================
// PUT /api/settings
// ========================================

export async function PUT(request: NextRequest): Promise<Response> {
  try {
    // Parse request body
    const body = await request.json();

    // Validate with Zod
    const validation = settingsUpdateSchema.safeParse(body);
    if (!validation.success) {
      return validationErrorResponse(
        '입력 데이터가 유효하지 않습니다.',
        validation.error.flatten()
      );
    }

    const updateData = validation.data;

    // Auto-generate IDs for master data if missing
    if (updateData.levels) {
      updateData.levels = updateData.levels.map((level: Level) => ({
        ...level,
        id: level.id || generateId(),
      }));
    }

    if (updateData.subjects) {
      updateData.subjects = updateData.subjects.map((subject: Subject) => ({
        ...subject,
        id: subject.id || generateId(),
      }));
    }

    if (updateData.rooms) {
      updateData.rooms = updateData.rooms.map((room: Room) => ({
        ...room,
        id: room.id || generateId(),
      }));
    }

    if (updateData.sources) {
      updateData.sources = updateData.sources.map((source: Source) => ({
        ...source,
        id: source.id || generateId(),
      }));
    }

    // Read database and perform partial update
    const db = readDatabase();
    db.settings = {
      ...db.settings,
      ...updateData,
    };

    // Write back to database
    writeDatabase(db);

    return successResponse(db.settings, '설정이 저장되었습니다.');
  } catch (error) {
    console.error('PUT /api/settings error:', error);
    return validationErrorResponse('설정을 저장하는 중 오류가 발생했습니다.');
  }
}
