'use client';

import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface StatusBadgeProps {
  status: string;
  variant?: 'default' | 'secondary' | 'outline' | 'destructive';
  className?: string;
  label?: string;
}

export function StatusBadge({ status, variant, className, label }: StatusBadgeProps) {
  const getVariantAndColor = () => {
    if (!status) {
      return {
        variant: variant || 'default',
        className: 'bg-gray-500 hover:bg-gray-600 text-white',
      };
    }
    const lowerStatus = status.toLowerCase();

    // Active states (green)
    if (lowerStatus === 'active' || lowerStatus === 'paid' || lowerStatus === 'completed' || lowerStatus === 'present') {
      return {
        variant: variant || 'default',
        className: 'bg-green-500 hover:bg-green-600 text-white',
      };
    }

    // Inactive/Pending/Waiting states (yellow)
    if (lowerStatus === 'pending' || lowerStatus === 'waiting' || lowerStatus === 'partial') {
      return {
        variant: variant || 'default',
        className: 'bg-yellow-500 hover:bg-yellow-600 text-white',
      };
    }

    // Unpaid/Overdue states (red)
    if (lowerStatus === 'unpaid' || lowerStatus === 'overdue') {
      return {
        variant: variant || 'destructive',
        className: 'bg-red-500 hover:bg-red-600 text-white',
      };
    }

    // Dropped/Withdrawn/Cancelled states (red)
    if (lowerStatus === 'dropped' || lowerStatus === 'withdrawn' || lowerStatus === 'cancelled') {
      return {
        variant: variant || 'destructive',
        className: 'bg-red-500 hover:bg-red-600 text-white',
      };
    }

    // Inactive/Closed states (gray)
    if (lowerStatus === 'inactive' || lowerStatus === 'closed') {
      return {
        variant: variant || 'secondary',
        className: 'bg-gray-500 hover:bg-gray-600 text-white',
      };
    }

    // Attendance - Late (orange)
    if (lowerStatus === 'late') {
      return {
        variant: variant || 'default',
        className: 'bg-orange-500 hover:bg-orange-600 text-white',
      };
    }

    // Attendance - Absent (red)
    if (lowerStatus === 'absent') {
      return {
        variant: variant || 'destructive',
        className: 'bg-red-500 hover:bg-red-600 text-white',
      };
    }

    // Attendance - Excused (blue)
    if (lowerStatus === 'excused') {
      return {
        variant: variant || 'default',
        className: 'bg-blue-500 hover:bg-blue-600 text-white',
      };
    }

    // Enrollment - Enrolled (green)
    if (lowerStatus === 'enrolled') {
      return {
        variant: variant || 'default',
        className: 'bg-green-500 hover:bg-green-600 text-white',
      };
    }

    // Default (gray)
    return {
      variant: variant || 'secondary',
      className: 'bg-gray-400 hover:bg-gray-500 text-white',
    };
  };

  const { variant: badgeVariant, className: badgeClassName } = getVariantAndColor();

  return (
    <Badge
      variant={badgeVariant as any}
      className={cn(badgeClassName, className)}
    >
      {label || status}
    </Badge>
  );
}
