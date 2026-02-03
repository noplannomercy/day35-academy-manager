'use client';

import { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { ErrorMessage } from '@/components/common/ErrorMessage';
import { AcademyInfoForm } from '@/components/settings/AcademyInfoForm';
import { LevelManager } from '@/components/settings/LevelManager';
import { SubjectManager } from '@/components/settings/SubjectManager';
import { RoomManager } from '@/components/settings/RoomManager';
import { SourceManager } from '@/components/settings/SourceManager';
import { BackupSection } from '@/components/settings/BackupSection';
import type { Settings } from '@/types';

export default function SettingsPage() {
  const [settings, setSettings] = useState<Settings | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/settings');
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || '설정을 불러오는데 실패했습니다.');
      }

      setSettings(result.data);
    } catch (error) {
      console.error('Settings fetch error:', error);
      setError(
        error instanceof Error ? error.message : '설정을 불러오는데 실패했습니다.'
      );
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <LoadingSpinner />
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">설정</h1>
          <p className="text-muted-foreground mt-2">
            학원 정보 및 마스터 데이터를 관리합니다.
          </p>
        </div>
        <ErrorMessage message={error} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">설정</h1>
        <p className="text-muted-foreground mt-2">
          학원 정보 및 마스터 데이터를 관리합니다.
        </p>
      </div>

      <Tabs defaultValue="info" className="space-y-6">
        <TabsList>
          <TabsTrigger value="info">학원 정보</TabsTrigger>
          <TabsTrigger value="master">마스터 데이터</TabsTrigger>
          <TabsTrigger value="backup">백업/복원</TabsTrigger>
        </TabsList>

        <TabsContent value="info" className="space-y-6">
          <AcademyInfoForm settings={settings} onUpdate={fetchSettings} />
        </TabsContent>

        <TabsContent value="master" className="space-y-6">
          <LevelManager
            levels={settings?.levels}
            settings={settings}
            onUpdate={fetchSettings}
          />
          <SubjectManager
            subjects={settings?.subjects}
            settings={settings}
            onUpdate={fetchSettings}
          />
          <RoomManager
            rooms={settings?.rooms}
            settings={settings}
            onUpdate={fetchSettings}
          />
          <SourceManager
            sources={settings?.sources}
            settings={settings}
            onUpdate={fetchSettings}
          />
        </TabsContent>

        <TabsContent value="backup" className="space-y-6">
          <BackupSection />
        </TabsContent>
      </Tabs>
    </div>
  );
}
