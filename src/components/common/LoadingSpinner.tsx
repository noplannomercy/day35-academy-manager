'use client';

import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  center?: boolean;
  className?: string;
}

export function LoadingSpinner({ size = 'md', center = false, className }: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-8 w-8',
    lg: 'h-12 w-12',
  };

  const spinnerElement = (
    <Loader2 className={cn('animate-spin text-primary', sizeClasses[size], className)} />
  );

  if (center) {
    return (
      <div className="flex items-center justify-center w-full min-h-[200px]">
        {spinnerElement}
      </div>
    );
  }

  return spinnerElement;
}
