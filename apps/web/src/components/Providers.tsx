'use client';

import { SessionProvider } from 'next-auth/react';
import { StaleBuildGuard } from './StaleBuildGuard';

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <StaleBuildGuard />
      {children}
    </SessionProvider>
  );
}
