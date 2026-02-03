import { AppLayout } from '@/components/layout/AppLayout';

interface RoutesLayoutProps {
  children: React.ReactNode;
}

export default function RoutesLayout({ children }: RoutesLayoutProps) {
  return <AppLayout>{children}</AppLayout>;
}
