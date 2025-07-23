
'use client';

import { usePathname } from 'next/navigation';
import Header from '@/components/header';
import BottomNav from '@/components/bottom-nav';
import MovieHeader from './movie-header';
import DataRefresher from './data-refresher';

export default function LayoutWrapper({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    
    const isPlayerPage = pathname.startsWith('/canal/') || pathname.startsWith('/pelicula/') || pathname.startsWith('/radio/');
    const isAdminPage = pathname.startsWith('/admin');
    const isLoginPage = pathname === '/login';

    const showMainLayout = !isPlayerPage && !isAdminPage && !isLoginPage;
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
