
'use client';

import React from 'react';
import { ThemeProvider } from "@/components/theme-provider";
import { ChannelFilterProvider } from '@/hooks/use-channel-filters';
import { MovieFilterProvider } from '@/hooks/use-movie-filters';
import { Toaster } from '@/components/ui/toaster';

type ProvidersProps = {
    children: React.ReactNode;
    channelCategories: string[];
    movieCategories: string[];
};

export function Providers({ children, channelCategories, movieCategories }: ProvidersProps) {
    return (
        <ThemeProvider
            attribute="class"
            defaultTheme="dark"
            storageKey="plan-b-theme"
            enableSystem
        >
            <ChannelFilterProvider initialCategories={channelCategories}>
                <MovieFilterProvider initialCategories={movieCategories}>
                    {children}
                    <Toaster />
                </MovieFilterProvider>
            </ChannelFilterProvider>
        </ThemeProvider>
    );
}
