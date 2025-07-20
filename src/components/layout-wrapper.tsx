
"use client";

import { usePathname } from 'next/navigation';
import Header from '@/components/header';
import BottomNav from '@/components/bottom-nav';
import { ReactNode } from 'react';
import DataRefresher from '@/components/data-refresher';
import MovieHeader from './movie-header';

export default function LayoutWrapper({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  
  const isPlayerPage = pathname.startsWith('/canal/') || pathname.startsWith('/pelicula/') || pathname.startsWith('/radio/');
  const isAdminPage = pathname.startsWith('/admin');
  const isLoginPage = pathname === '/login';

  // Determine if the main layout (with header/footer) should be shown
  const showMainLayout = !isPlayerPage && !isAdminPage && !isLoginPage;

  // Specifically determine if the movie section layout should be shown
  const isMovieSection = pathname.startsWith('/peliculas');

  return (
    <>
      {showMainLayout && !isMovieSection && <DataRefresher />}
      
      {showMainLayout && !isMovieSection && <Header />}
      
      {isMovieSection && <MovieHeader />}

      <main className={`flex-1 ${showMainLayout || isMovieSection ? 'pb-20 md:pb-0' : ''}`}>
        {children}
      </main>

      {showMainLayout && <BottomNav />}
    </>
  );
}
