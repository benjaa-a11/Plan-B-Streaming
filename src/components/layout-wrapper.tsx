"use client";

import { usePathname } from 'next/navigation';
import Header from '@/components/header';
import BottomNav from '@/components/bottom-nav';
import { ReactNode } from 'react';
import DataRefresher from '@/components/data-refresher';

export default function LayoutWrapper({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const isChannelPage = pathname.startsWith('/canal/');

  return (
    <>
      <DataRefresher />
      {!isChannelPage && <Header />}
      <main className={`flex-1 ${isChannelPage ? '' : 'pb-20 md:pb-0'}`}>
        {children}
      </main>
      {!isChannelPage && <BottomNav />}
    </>
  );
}
