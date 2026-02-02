import fs from 'fs';
import path from 'path';
import type { Database } from '@/types';

// ========================================
// Configuration
// ========================================

const DB_FILE_PATH = path.join(process.cwd(), 'data', 'db.json');

// Ensure data directory exists
function ensureDataDirectory(): void {
  const dataDir = path.dirname(DB_FILE_PATH);
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }
}

// ========================================
// Database I/O
// ========================================

/**
 * Read the entire database from db.json
 * Returns the parsed database object
 */
export function readDatabase(): Database {
  try {
    ensureDataDirectory();

    // If file doesn't exist, create it with default structure
    if (!fs.existsSync(DB_FILE_PATH)) {
      const defaultDb: Database = {
        students: [],
        instructors: [],
        classes: [],
        enrollments: [],
        attendances: [],
        payments: [],
        consultations: [],
        makeupClasses: [],
        waitlists: [],
        instructorSalaries: [],
        holidays: [],
        refunds: [],
        settings: {
          academyName: '',
          phone: '',
          address: '',
          operatingHours: {
            start: '09:00',
            end: '22:00',
          },
          levels: [],
          subjects: [],
          rooms: [],
          sources: [],
        },
      };
      writeDatabase(defaultDb);
      return defaultDb;
    }

    const fileContent = fs.readFileSync(DB_FILE_PATH, 'utf-8');
    const db = JSON.parse(fileContent) as Database;
    return db;
  } catch (error) {
    console.error('Error reading database:', error);
    throw new Error('Failed to read database');
  }
}

/**
 * Write the entire database to db.json
 * Overwrites the existing file
 *
 * Note: Single-user environment, no locking mechanism needed
 */
export function writeDatabase(db: Database): void {
  try {
    ensureDataDirectory();
    const fileContent = JSON.stringify(db, null, 2);
    fs.writeFileSync(DB_FILE_PATH, fileContent, 'utf-8');
  } catch (error) {
    console.error('Error writing database:', error);
    throw new Error('Failed to write database');
  }
}

// ========================================
// Generic CRUD Helpers
// ========================================

/**
 * Find an item by ID in an array
 */
export function findById<T extends { id: string }>(items: T[], id: string): T | undefined {
  return items.find((item) => item.id === id);
}

/**
 * Find multiple items by IDs
 */
export function findByIds<T extends { id: string }>(items: T[], ids: string[]): T[] {
  return items.filter((item) => ids.includes(item.id));
}

/**
 * Update an item by ID in an array
 * Returns the updated array
 */
export function updateById<T extends { id: string }>(
  items: T[],
  id: string,
  updates: Partial<T>
): T[] {
  return items.map((item) => (item.id === id ? { ...item, ...updates } : item));
}

/**
 * Delete an item by ID from an array
 * Returns the updated array
 */
export function deleteById<T extends { id: string }>(items: T[], id: string): T[] {
  return items.filter((item) => item.id !== id);
}

/**
 * Add an item to an array
 * Returns the updated array
 */
export function addItem<T>(items: T[], item: T): T[] {
  return [...items, item];
}

// ========================================
// Database-Specific Helpers
// ========================================

/**
 * Get all items of a specific entity type
 */
export function getAll<K extends keyof Database>(
  db: Database,
  entityKey: K
): Database[K] extends Array<infer T> ? T[] : never {
  return db[entityKey] as any;
}

/**
 * Get a single item by ID from a specific entity type
 */
export function getById<K extends keyof Database>(
  db: Database,
  entityKey: K,
  id: string
): Database[K] extends Array<infer T>
  ? T extends { id: string }
    ? T | undefined
    : never
  : never {
  const items = db[entityKey];
  if (Array.isArray(items)) {
    return findById(items as any[], id) as any;
  }
  return undefined as any;
}

/**
 * Create a new item in a specific entity type
 * Automatically saves to disk
 */
export function create<K extends keyof Database>(
  entityKey: K,
  item: Database[K] extends Array<infer T> ? T : never
): Database[K] extends Array<infer T> ? T : never {
  const db = readDatabase();
  const items = db[entityKey];

  if (Array.isArray(items)) {
    (items as any[]).push(item);
    writeDatabase(db);
    return item as any;
  }

  throw new Error(`Cannot create item in non-array entity: ${String(entityKey)}`);
}

/**
 * Update an item in a specific entity type by ID
 * Automatically saves to disk
 */
export function update<K extends keyof Database>(
  entityKey: K,
  id: string,
  updates: Database[K] extends Array<infer T> ? Partial<T> : never
): Database[K] extends Array<infer T> ? T | undefined : never {
  const db = readDatabase();
  const items = db[entityKey];

  if (Array.isArray(items)) {
    const itemIndex = items.findIndex((item: any) => item.id === id);
    if (itemIndex === -1) {
      return undefined as any;
    }

    items[itemIndex] = { ...items[itemIndex], ...updates };
    writeDatabase(db);
    return items[itemIndex] as any;
  }

  throw new Error(`Cannot update item in non-array entity: ${String(entityKey)}`);
}

/**
 * Delete an item from a specific entity type by ID
 * Automatically saves to disk
 */
export function remove<K extends keyof Database>(
  entityKey: K,
  id: string
): boolean {
  const db = readDatabase();
  const items = db[entityKey];

  if (Array.isArray(items)) {
    const initialLength = items.length;
    const filtered = items.filter((item: any) => item.id !== id);

    if (filtered.length !== initialLength) {
      (db[entityKey] as any[]) = filtered;
      writeDatabase(db);
      return true;
    }
    return false;
  }

  throw new Error(`Cannot delete item from non-array entity: ${String(entityKey)}`);
}

// ========================================
// Transaction-like Operations
// ========================================

/**
 * Execute multiple operations atomically
 * If any operation fails, the entire transaction is rolled back
 */
export function transaction<T>(
  operation: (db: Database) => { db: Database; result: T }
): T {
  const originalDb = readDatabase();

  try {
    const { db: updatedDb, result } = operation(originalDb);
    writeDatabase(updatedDb);
    return result;
  } catch (error) {
    // Rollback: database was not written, so original state is preserved
    console.error('Transaction failed, rolling back:', error);
    throw error;
  }
}

// ========================================
// Backup/Restore
// ========================================

/**
 * Create a backup of the current database
 */
export function createBackup(): Database {
  return readDatabase();
}

/**
 * Restore database from a backup
 */
export function restoreBackup(backup: Database): void {
  writeDatabase(backup);
}

// ========================================
// Waitlist Helper
// ========================================

/**
 * Create a waitlist entry
 * Automatically calculates FIFO priority
 */
export function createWaitlist(
  studentId: string,
  classId: string,
  registeredAt: string
): import('@/types').Waitlist {
  const db = readDatabase();

  // Calculate priority (FIFO - lower number = higher priority)
  const existingWaitlists = db.waitlists.filter(
    (w) => w.classId === classId && w.status === 'waiting'
  );
  const priority = existingWaitlists.length + 1;

  const newWaitlist: import('@/types').Waitlist = {
    id: require('./utils').generateId(),
    studentId,
    classId,
    registeredAt,
    priority,
    status: 'waiting',
  };

  db.waitlists.push(newWaitlist);
  writeDatabase(db);

  return newWaitlist;
}

// ========================================
// Initialization
// ========================================

/**
 * Initialize the database with default data if it doesn't exist
 * This is automatically called by readDatabase() if the file doesn't exist
 */
export function initializeDatabase(): void {
  ensureDataDirectory();

  if (!fs.existsSync(DB_FILE_PATH)) {
    const defaultDb: Database = {
      students: [],
      instructors: [],
      classes: [],
      enrollments: [],
      attendances: [],
      payments: [],
      consultations: [],
      makeupClasses: [],
      waitlists: [],
      instructorSalaries: [],
      holidays: [],
      refunds: [],
      settings: {
        academyName: '',
        phone: '',
        address: '',
        operatingHours: {
          start: '09:00',
          end: '22:00',
        },
        levels: [],
        subjects: [],
        rooms: [],
        sources: [],
      },
    };
    writeDatabase(defaultDb);
  }
}
