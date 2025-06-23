"use client";

import { usePathname } from 'next/navigation';
import Header from '@/components/header';
import BottomNav from '@/components/bottom-nav';
import { ReactNode } from 'react';

export default function LayoutWrapper({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const isChannelPage = pathname.startsWith('/canal/');

  return (
    <>
      {!isChannelPage && <Header />}
      <main className={`flex-1 ${isChannelPage ? '' : 'pb-[calc(5rem+env(safe-area-inset-bottom))] md:pb-0'}`}>
        {children}
      </main>
      {!isChannelPage && <BottomNav />}
    </>
  );
}
