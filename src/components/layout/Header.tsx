'use client';

import { useEffect, useState } from 'react';
import { User } from 'lucide-react';
import { GlobalSearch } from './GlobalSearch';
import type { Settings } from '@/types';

export function Header() {
  const [academyName, setAcademyName] = useState<string>('Academy Manager');

  useEffect(() => {
    // Fetch academy name from settings API
    const fetchSettings = async (): Promise<void> => {
      try {
        const response = await fetch('/api/settings');
        if (response.ok) {
          const data = await response.json();
          if (data.data?.academyName) {
            setAcademyName(data.data.academyName);
          }
        }
      } catch (error) {
        console.error('Failed to fetch settings:', error);
      }
    };

    fetchSettings();
  }, []);

  return (
    <header className="h-16 bg-card border-b border-border flex items-center justify-between px-6">
      {/* Academy Name */}
      <div className="flex items-center gap-4">
        <h1 className="text-xl font-bold">{academyName}</h1>
      </div>

      {/* Search and User Info */}
      <div className="flex items-center gap-4">
        <GlobalSearch />

        <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-muted">
          <User className="w-5 h-5 text-muted-foreground" />
          <span className="text-sm font-medium">관리자</span>
        </div>
      </div>
    </header>
  );
}
