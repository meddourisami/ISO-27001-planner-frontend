'use client';

import { useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useAppSelector } from '@/lib/hooks';

export default function RoleGuard({ children }: { children: React.ReactNode }) {
  const { user, status } = useAppSelector((state) => state.auth);
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    if (status === 'idle' && user) {
      if (pathname.startsWith('/admin') && user.role !== 'SUPER_ADMIN') {
        router.push('/');
      }

      if (!pathname.startsWith('/admin') && user.role === 'SUPER_ADMIN') {
        router.push('/admin');
      }
    }
  }, [pathname, user, status, router]);

  return <>{children}</>;
}