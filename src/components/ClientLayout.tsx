'use client';

import { usePathname } from 'next/navigation';
import { isConfigured } from '@/lib/firebase/config';
import FirebaseSetupGuide from './FirebaseSetupGuide';
import { useEffect, useState } from 'react';

export default function ClientLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const isPrintRoute = pathname.startsWith('/print');

  const [configured, setConfigured] = useState(false);
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    setConfigured(isConfigured());
    setChecked(true);
  }, []);

  if (!checked) {
    return null; // Avoid hydration mismatch
  }

  if (!configured) {
    return <FirebaseSetupGuide />;
  }

  return (
    <div className={isPrintRoute ? '' : 'lg:pl-64'}>
      {children}
    </div>
  );
}
