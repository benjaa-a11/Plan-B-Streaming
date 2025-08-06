

'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import { ThemeProvider } from "@/components/theme-provider";
import { ChannelFilterProvider } from '@/hooks/use-channel-filters';
import { MovieFilterProvider } from '@/hooks/use-movie-filters';
import { Toaster } from '@/components/ui/toaster';
import Header from '@/components/header';
import BottomNav from '@/components/bottom-nav';
import MovieHeader from './movie-header';
import DataRefresher from './data-refresher';

type ProvidersProps = {
    children: React.ReactNode;
    channelCategories: string[];
    movieCategories: string[];
};

export function Providers({ children, channelCategories, movieCategories }: ProvidersProps) {
    const pathname = usePathname();
    
    const isPlayerPage = pathname.startsWith('/canal/') || pathname.startsWith('/pelicula/') || pathname.startsWith('/radio/');
    const isAdminPage = pathname.startsWith('/admin');
    const isLoginPage = pathname === '/login';

    const showMainLayout = !isPlayerPage && !isAdminPage && !isLoginPage;
    const isMovieSection = pathname.startsWith('/peliculas');
    
    return (
        <ThemeProvider
            attribute="class"
            defaultTheme="system"
            storageKey="plan-b-theme"
            enableSystem
        >
            <ChannelFilterProvider initialCategories={channelCategories}>
                <MovieFilterProvider initialCategories={movieCategories}>
                    {showMainLayout && !isMovieSection && <DataRefresher />}
                    
                    {showMainLayout && !isMovieSection && <Header />}
                    
                    {isMovieSection && <MovieHeader />}

                    <main className={`flex-1 ${showMainLayout || isMovieSection ? 'pb-20 md:pb-0' : ''}`}>
                        {children}
                    </main>

                    {showMainLayout && <BottomNav />}
                    <Toaster />
                </MovieFilterProvider>
            </ChannelFilterProvider>
        </ThemeProvider>
    );
}
