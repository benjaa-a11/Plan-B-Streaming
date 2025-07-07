"use client";

import { usePathname } from 'next/navigation';
import Header from '@/components/header';
import BottomNav from '@/components/bottom-nav';
import { ReactNode } from 'react';
import DataRefresher from '@/components/data-refresher';

export default function LayoutWrapper({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  
  // This logic ensures the main app layout (Header, BottomNav, etc.)
  // does NOT render on specific pages like media players or the admin panel.
  const isPlayerPage = pathname.startsWith('/canal/') || pathname.startsWith('/pelicula/') || pathname.startsWith('/radio/');
  const isAdminPage = pathname.startsWith('/admin');

  // Only show the main layout if it's not a special page.
  const showMainLayout = !isPlayerPage && !isAdminPage;

  return (
    <>
      {showMainLayout && <DataRefresher />}
      {showMainLayout && <Header />}
      <main className={`flex-1 ${showMainLayout ? 'pb-20 md:pb-0' : ''}`}>
        {children}
      </main>
      {showMainLayout && <BottomNav />}
    </>
  );
}
