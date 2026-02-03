'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Home,
  Users,
  UserCog,
  BookOpen,
  ClipboardCheck,
  CreditCard,
  Wallet,
  Calendar,
  CalendarDays,
  Settings,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface MenuItem {
  id: string;
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
}

const menuItems: MenuItem[] = [
  { id: 'dashboard', label: '대시보드', href: '/', icon: Home },
  { id: 'students', label: '수강생 관리', href: '/students', icon: Users },
  { id: 'instructors', label: '강사 관리', href: '/instructors', icon: UserCog },
  { id: 'classes', label: '반 관리', href: '/classes', icon: BookOpen },
  { id: 'attendance', label: '출석 관리', href: '/attendance', icon: ClipboardCheck },
  { id: 'payments', label: '수납 관리', href: '/payments', icon: CreditCard },
  { id: 'salaries', label: '급여 관리', href: '/salaries', icon: Wallet },
  { id: 'schedule', label: '시간표', href: '/schedule', icon: Calendar },
  { id: 'holidays', label: '휴일 관리', href: '/holidays', icon: CalendarDays },
  { id: 'settings', label: '설정', href: '/settings', icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();

  const isActive = (href: string): boolean => {
    if (href === '/') {
      return pathname === '/';
    }
    return pathname.startsWith(href);
  };

  return (
    <aside className="w-60 h-screen bg-card border-r border-border flex flex-col">
      {/* Logo/Academy Name */}
      <div className="h-16 flex items-center justify-center border-b border-border">
        <Link href="/" className="flex items-center gap-2">
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
            <span className="text-primary-foreground font-bold text-lg">A</span>
          </div>
          <span className="font-bold text-lg">Academy Manager</span>
        </Link>
      </div>

      {/* Navigation Menu */}
      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.href);

          return (
            <Link
              key={item.id}
              href={item.href}
              className={cn(
                'flex items-center gap-3 px-3 py-2 rounded-lg transition-colors',
                'hover:bg-accent hover:text-accent-foreground',
                active && 'bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground'
              )}
            >
              <Icon className="w-5 h-5" />
              <span className="text-sm font-medium">{item.label}</span>
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
