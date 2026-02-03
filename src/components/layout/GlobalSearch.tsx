'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Search, Loader2, User, BookOpen, UserCog } from 'lucide-react';
import { Input } from '@/components/ui/input';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import type { Student, Class, Instructor } from '@/types';

interface SearchResults {
  students: Student[];
  classes: Class[];
  instructors: Instructor[];
}

export function GlobalSearch() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResults | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const router = useRouter();
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);

  const performSearch = useCallback(async (searchQuery: string): Promise<void> => {
    if (searchQuery.length < 2) {
      setResults(null);
      setIsOpen(false);
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch(
        `/api/search?q=${encodeURIComponent(searchQuery)}`
      );

      if (!response.ok) {
        throw new Error('Search failed');
      }

      const data = await response.json();
      setResults(data.data);
      setIsOpen(true);
    } catch (error) {
      console.error('Search error:', error);
      setResults(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    // Clear existing timer
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    // Set new timer
    if (query.length >= 2) {
      debounceTimerRef.current = setTimeout(() => {
        performSearch(query);
      }, 300);
    } else {
      setResults(null);
      setIsOpen(false);
    }

    // Cleanup
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, [query, performSearch]);

  const handleResultClick = (type: 'student' | 'class' | 'instructor', id: string): void => {
    setIsOpen(false);
    setQuery('');
    setResults(null);

    if (type === 'student') {
      router.push(`/students/${id}`);
    } else if (type === 'class') {
      router.push(`/classes/${id}`);
    } else if (type === 'instructor') {
      router.push(`/instructors/${id}`);
    }
  };

  const totalCount = results
    ? results.students.length + results.classes.length + results.instructors.length
    : 0;

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <div className="relative w-full max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            type="text"
            placeholder="수강생, 반, 강사 검색..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="pl-9 pr-9"
          />
          {isLoading && (
            <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground animate-spin" />
          )}
        </div>
      </PopoverTrigger>
      <PopoverContent className="w-[400px] p-0" align="start">
        {results && totalCount > 0 ? (
          <div className="max-h-[400px] overflow-y-auto">
            {/* Students */}
            {results.students.length > 0 && (
              <div className="border-b border-border">
                <div className="px-4 py-2 bg-muted/50">
                  <h3 className="text-sm font-semibold text-muted-foreground flex items-center gap-2">
                    <User className="w-4 h-4" />
                    수강생 ({results.students.length})
                  </h3>
                </div>
                <div className="py-1">
                  {results.students.map((student) => (
                    <button
                      key={student.id}
                      onClick={() => handleResultClick('student', student.id)}
                      className="w-full px-4 py-2 text-left hover:bg-accent transition-colors"
                    >
                      <div className="font-medium">{student.name}</div>
                      <div className="text-sm text-muted-foreground">
                        {student.phone}
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Classes */}
            {results.classes.length > 0 && (
              <div className="border-b border-border">
                <div className="px-4 py-2 bg-muted/50">
                  <h3 className="text-sm font-semibold text-muted-foreground flex items-center gap-2">
                    <BookOpen className="w-4 h-4" />
                    반 ({results.classes.length})
                  </h3>
                </div>
                <div className="py-1">
                  {results.classes.map((classItem) => (
                    <button
                      key={classItem.id}
                      onClick={() => handleResultClick('class', classItem.id)}
                      className="w-full px-4 py-2 text-left hover:bg-accent transition-colors"
                    >
                      <div className="font-medium">{classItem.name}</div>
                      <div className="text-sm text-muted-foreground">
                        수강료: {classItem.monthlyFee.toLocaleString()}원
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Instructors */}
            {results.instructors.length > 0 && (
              <div>
                <div className="px-4 py-2 bg-muted/50">
                  <h3 className="text-sm font-semibold text-muted-foreground flex items-center gap-2">
                    <UserCog className="w-4 h-4" />
                    강사 ({results.instructors.length})
                  </h3>
                </div>
                <div className="py-1">
                  {results.instructors.map((instructor) => (
                    <button
                      key={instructor.id}
                      onClick={() => handleResultClick('instructor', instructor.id)}
                      className="w-full px-4 py-2 text-left hover:bg-accent transition-colors"
                    >
                      <div className="font-medium">{instructor.name}</div>
                      <div className="text-sm text-muted-foreground">
                        {instructor.phone}
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : results && totalCount === 0 ? (
          <div className="px-4 py-8 text-center text-muted-foreground">
            검색 결과가 없습니다.
          </div>
        ) : null}
      </PopoverContent>
    </Popover>
  );
}
